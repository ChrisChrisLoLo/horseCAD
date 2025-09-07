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
use std::fs;
use tauri::{AppHandle, Emitter};
use tauri::menu::{MenuBuilder, MenuItemBuilder, PredefinedMenuItem, SubmenuBuilder};
use tauri_plugin_dialog::{DialogExt};

mod utils;
use utils::log_utils::prettify_byte_count;

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
    let center = center.unwrap_or([0.0, 0.0, 0.0]);
    
    emit_log(&app_handle, "info", "Starting script compilation", Some("Compiler"));
    
    // Compile the Rhai script
    let (ctx, root, scale) = match compile_rhai_script(&code) {
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
            emit_log(&app_handle, "info", &format!("STL export complete ({})", prettify_byte_count(data.len() as u64)), Some("Export"));
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
fn compile_rhai_script(code: &str) -> Result<(Context, fidget::context::Node, f32)> {
    let mut engine = fidget::rhai::engine();
    let out = Arc::new(Mutex::new(None));
    let out_clone = out.clone();

    let scale = Arc::new(Mutex::new(1.0_f32)); // Default scale, can be adjusted or passed as parameter if needed
    let scale_clone = scale.clone();

    engine.register_fn(
        "set_scale",
        move |_ctx: NativeCallContext, scale_input: Dynamic| -> Result<(), Box<EvalAltResult>> {
            let scale_input_float = scale_input.as_float();
            if let Ok(scale_input_float) = scale_input_float {
                let scale_input_f32 = scale_input_float as f32;
                let mut scale = scale_clone.lock().unwrap();
                *scale = scale_input_f32;
            } else {
                return Err("scale must be a float".into());
            }
            Ok(())
        },
    );

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
    
    let output_scale = {
        let guard = scale.lock().unwrap();
        *guard
    };
    
    if let Some(tree) = tree {
        let mut ctx = Context::new();
        let node = ctx.import(&tree);
        Ok((ctx, node, output_scale))
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

/// Save .horsi file
#[tauri::command]
async fn save_horsi_file(app_handle: AppHandle, path: String, content: String) -> Result<bool, String> {
    match fs::write(&path, content) {
        Ok(_) => {
            emit_log(&app_handle, "info", &format!("Saved file: {}", path), Some("File"));
            Ok(true)
        }
        Err(e) => {
            let error_msg = format!("Failed to save file {}: {}", path, e);
            emit_log(&app_handle, "error", &error_msg, Some("File"));
            Err(error_msg)
        }
    }
}

/// Load .horsi file
#[tauri::command]
async fn load_horsi_file(app_handle: AppHandle, path: String) -> Result<String, String> {
    match fs::read_to_string(&path) {
        Ok(content) => {
            emit_log(&app_handle, "info", &format!("Loaded file: {}", path), Some("File"));
            Ok(content)
        }
        Err(e) => {
            let error_msg = format!("Failed to load file {}: {}", path, e);
            emit_log(&app_handle, "error", &error_msg, Some("File"));
            Err(error_msg)
        }
    }
}

/// Export STL file
#[tauri::command]
async fn export_stl_file(app_handle: AppHandle, path: String, stl_data: Vec<u8>) -> Result<bool, String> {
    match fs::write(&path, stl_data) {
        Ok(_) => {
            emit_log(&app_handle, "info", &format!("Exported STL: {}", path), Some("Export"));
            Ok(true)
        }
        Err(e) => {
            let error_msg = format!("Failed to export STL {}: {}", path, e);
            emit_log(&app_handle, "error", &error_msg, Some("Export"));
            Err(error_msg)
        }
    }
}

/// Show save dialog for .horsi files
#[tauri::command]
async fn show_save_dialog(app_handle: AppHandle) -> Result<Option<String>, String> {
    use std::sync::mpsc;
    let (tx, rx) = mpsc::channel();
    
    app_handle.dialog()
        .file()
        .add_filter("HorseCAD Script", &["horsi"])
        .set_title("Save HorseCAD Script")
        .save_file(move |path| {
            let _ = tx.send(path);
        });
    
    match rx.recv() {
        Ok(Some(path)) => Ok(Some(path.to_string())),
        Ok(None) => Ok(None),
        Err(_) => Err("Dialog error".to_string()),
    }
}

/// Show open dialog for .horsi files
#[tauri::command]
async fn show_open_dialog(app_handle: AppHandle) -> Result<Option<String>, String> {
    use std::sync::mpsc;
    let (tx, rx) = mpsc::channel();
    
    app_handle.dialog()
        .file()
        .add_filter("HorseCAD Script", &["horsi"])
        .set_title("Open HorseCAD Script")
        .pick_file(move |path| {
            let _ = tx.send(path);
        });
    
    match rx.recv() {
        Ok(Some(path)) => Ok(Some(path.to_string())),
        Ok(None) => Ok(None),
        Err(_) => Err("Dialog error".to_string()),
    }
}

/// Show save dialog for STL files
#[tauri::command]
async fn show_stl_save_dialog(app_handle: AppHandle) -> Result<Option<String>, String> {
    use std::sync::mpsc;
    let (tx, rx) = mpsc::channel();
    
    app_handle.dialog()
        .file()
        .add_filter("STL Files", &["stl"])
        .set_title("Export STL File")
        .save_file(move |path| {
            let _ = tx.send(path);
        });
    
    match rx.recv() {
        Ok(Some(path)) => Ok(Some(path.to_string())),
        Ok(None) => Ok(None),
        Err(_) => Err("Dialog error".to_string()),
    }
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
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            compile_script,
            save_horsi_file,
            load_horsi_file,
            export_stl_file,
            show_save_dialog,
            show_open_dialog,
            show_stl_save_dialog
        ])
        .setup(|app| {
            // Create the menu
            let file_menu = SubmenuBuilder::new(app, "File")
                .item(&MenuItemBuilder::with_id("new", "New").accelerator("CmdOrCtrl+N").build(app)?)
                .item(&MenuItemBuilder::with_id("open", "Open...").accelerator("CmdOrCtrl+O").build(app)?)
                .separator()
                .item(&MenuItemBuilder::with_id("save", "Save").accelerator("CmdOrCtrl+S").build(app)?)
                .item(&MenuItemBuilder::with_id("save_as", "Save As...").accelerator("CmdOrCtrl+Shift+S").build(app)?)
                .separator()
                .item(&MenuItemBuilder::with_id("export_stl", "Export STL...").accelerator("CmdOrCtrl+E").build(app)?)
                .separator()
                .item(&PredefinedMenuItem::quit(app, Some("Quit"))?)
                .build()?;

            let edit_menu = SubmenuBuilder::new(app, "Edit")
                .item(&PredefinedMenuItem::undo(app, Some("Undo"))?)
                .item(&PredefinedMenuItem::redo(app, Some("Redo"))?)
                .separator()
                .item(&PredefinedMenuItem::cut(app, Some("Cut"))?)
                .item(&PredefinedMenuItem::copy(app, Some("Copy"))?)
                .item(&PredefinedMenuItem::paste(app, Some("Paste"))?)
                .item(&PredefinedMenuItem::select_all(app, Some("Select All"))?)
                .build()?;

            let view_menu = SubmenuBuilder::new(app, "View")
                .item(&MenuItemBuilder::with_id("compile", "Compile").accelerator("CmdOrCtrl+R").build(app)?)
                .separator()
                .item(&MenuItemBuilder::with_id("toggle_logs", "Toggle Logs").accelerator("CmdOrCtrl+L").build(app)?)
                .build()?;

            let menu = MenuBuilder::new(app)
                .item(&file_menu)
                .item(&edit_menu)
                .item(&view_menu)
                .build()?;

            app.set_menu(menu)?;

            // Handle menu events
            app.on_menu_event(move |app, event| {
                match event.id().as_ref() {
                    "new" => {
                        if let Err(e) = app.emit("menu_new", ()) {
                            eprintln!("Failed to emit menu_new event: {}", e);
                        }
                    }
                    "open" => {
                        if let Err(e) = app.emit("menu_open", ()) {
                            eprintln!("Failed to emit menu_open event: {}", e);
                        }
                    }
                    "save" => {
                        if let Err(e) = app.emit("menu_save", ()) {
                            eprintln!("Failed to emit menu_save event: {}", e);
                        }
                    }
                    "save_as" => {
                        if let Err(e) = app.emit("menu_save_as", ()) {
                            eprintln!("Failed to emit menu_save_as event: {}", e);
                        }
                    }
                    "export_stl" => {
                        if let Err(e) = app.emit("menu_export_stl", ()) {
                            eprintln!("Failed to emit menu_export_stl event: {}", e);
                        }
                    }
                    "compile" => {
                        if let Err(e) = app.emit("menu_compile", ()) {
                            eprintln!("Failed to emit menu_compile event: {}", e);
                        }
                    }
                    "toggle_logs" => {
                        if let Err(e) = app.emit("menu_toggle_logs", ()) {
                            eprintln!("Failed to emit menu_toggle_logs event: {}", e);
                        }
                    }
                    _ => {}
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
