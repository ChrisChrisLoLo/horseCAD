use std::sync::{Arc, Mutex};

use anyhow::{Context as AnyhowContext, Result};
use fidget::{
    context::{Context, Tree},
    mesh::{Mesh, Octree, Settings as MeshSettings},
    render::ThreadPool,
    rhai::FromDynamic,
    vm::VmShape,
};
use nalgebra::{Scale3, Translation3};
use rhai::{Dynamic, EvalAltResult, NativeCallContext};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};

#[derive(Debug, Serialize, Deserialize)]
pub struct LogEntry {
    pub timestamp: String,
    pub level: String,
    pub message: String,
    pub source: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MeshResult {
    pub success: bool,
    pub stl_data: Option<Vec<u8>>,
    pub triangle_count: Option<usize>,
    pub error: Option<String>,
}

/// Emit a log entry to the frontend
fn emit_log(app_handle: &AppHandle, level: &str, message: &str, source: Option<&str>) {
    let log_entry = LogEntry {
        timestamp: chrono::Utc::now().to_rfc3339(),
        level: level.to_string(),
        message: message.to_string(),
        source: source.map(|s| s.to_string()),
    };
    
    if let Err(e) = app_handle.emit("log_entry", &log_entry) {
        eprintln!("Failed to emit log entry: {}", e);
    }
}

/// Compile Rhai script and generate STL mesh
#[tauri::command]
async fn compile_script(
    app_handle: AppHandle,
    code: String,
    depth: u8,
    scale: Option<f32>,
    center: Option<[f32; 3]>,
) -> Result<MeshResult, String> {
    let scale = scale.unwrap_or(1.0);
    let center = center.unwrap_or([0.0, 0.0, 0.0]);
    
    emit_log(&app_handle, "info", "Starting script compilation", Some("Compiler"));
    
    // Compile the Rhai script
    let (ctx, root) = match compile_rhai_script(&code) {
        Ok(result) => {
            emit_log(&app_handle, "info", "Script compiled successfully", Some("Compiler"));
            result
        }
        Err(e) => {
            let error_msg = format!("Script compilation failed: {}", e);
            emit_log(&app_handle, "error", &error_msg, Some("Compiler"));
            return Ok(MeshResult {
                success: false,
                stl_data: None,
                triangle_count: None,
                error: Some(error_msg),
            });
        }
    };
    
    // Create VmShape
    let shape = match VmShape::new(&ctx, root) {
        Ok(shape) => {
            emit_log(&app_handle, "info", "Shape created successfully", Some("Compiler"));
            shape
        }
        Err(e) => {
            let error_msg = format!("Shape creation failed: {}", e);
            emit_log(&app_handle, "error", &error_msg, Some("Compiler"));
            return Ok(MeshResult {
                success: false,
                stl_data: None,
                triangle_count: None,
                error: Some(error_msg),
            });
        }
    };
    
    // Apply transformations
    emit_log(&app_handle, "info", &format!("Applying transformations (scale: {}, center: {:?})", scale, center), Some("Transform"));
    let s = 1.0 / scale;
    let scale_transform = Scale3::new(s, s, s);
    let center_transform = Translation3::new(-center[0], -center[1], -center[2]);
    let t = center_transform.to_homogeneous() * scale_transform.to_homogeneous();
    let shape = shape.apply_transform(t);
    
    // Generate mesh
    emit_log(&app_handle, "info", &format!("Building octree at depth {}", depth), Some("Mesh"));
    
    let mesh_settings = MeshSettings {
        depth,
        threads: Some(&ThreadPool::Global),
        ..Default::default()
    };
    
    let octree = Octree::build(&shape, mesh_settings);
    emit_log(&app_handle, "info", "Octree construction complete", Some("Mesh"));
    
    emit_log(&app_handle, "info", "Generating mesh triangles", Some("Mesh"));
    let mesh = octree.walk_dual(mesh_settings);
    let triangle_count = mesh.triangles.len();
    
    emit_log(&app_handle, "info", &format!("Mesh generation complete ({} triangles)", triangle_count), Some("Mesh"));
    
    // Export to STL
    emit_log(&app_handle, "info", "Exporting STL data", Some("Export"));
    let stl_data = match export_mesh_to_stl(&mesh) {
        Ok(data) => {
            emit_log(&app_handle, "info", &format!("STL export complete ({} bytes)", data.len()), Some("Export"));
            data
        }
        Err(e) => {
            let error_msg = format!("STL export failed: {}", e);
            emit_log(&app_handle, "error", &error_msg, Some("Export"));
            return Ok(MeshResult {
                success: false,
                stl_data: None,
                triangle_count: Some(triangle_count),
                error: Some(error_msg),
            });
        }
    };
    
    emit_log(&app_handle, "info", "Mesh compilation completed successfully", Some("System"));
    
    Ok(MeshResult {
        success: true,
        stl_data: Some(stl_data),
        triangle_count: Some(triangle_count),
        error: None,
    })
}

/// Compile Rhai script using fidget engine
fn compile_rhai_script(code: &str) -> Result<(Context, fidget::context::Node)> {
    let mut engine = fidget::rhai::engine();
    let out = Arc::new(Mutex::new(None));
    let out_clone = out.clone();
    
    // Register the draw function
    engine.register_fn(
        "draw",
        move |ctx: NativeCallContext, d: Dynamic| -> Result<(), Box<EvalAltResult>> {
            let tree = Tree::from_dynamic(&ctx, d, None)?;
            let mut out = out_clone.lock().unwrap();
            if out.is_some() {
                return Err("can only draw one shape".into());
            }
            *out = Some(tree);
            Ok(())
        },
    );
    
    // Run the script
    engine.run(code)?;
    
    // Extract the result
    let tree = {
        let mut guard = out.lock().unwrap();
        guard.take()
    };
    
    if let Some(tree) = tree {
        let mut ctx = Context::new();
        let node = ctx.import(&tree);
        Ok((ctx, node))
    } else {
        Err(anyhow::anyhow!("script must include a draw(tree) call"))
    }
}

/// Export mesh to STL format
fn export_mesh_to_stl(mesh: &Mesh) -> Result<Vec<u8>> {
    let mut buffer = Vec::new();
    mesh.write_stl(&mut buffer)
        .context("Failed to write STL data")?;
    Ok(buffer)
}

/// Basic greet function (keeping for compatibility)
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, compile_script])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
