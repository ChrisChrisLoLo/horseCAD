import { useState, useCallback, useEffect, useRef } from "react";
import Layout from "./components/Layout";
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import "./App.css";

// Types moved from contexts
export interface MeshData {
  stlData: Uint8Array;
  triangleCount: number;
  timestamp: number;
}

export interface CompilationState {
  isCompiling: boolean;
  error: string | null;
  lastCompiled: number;
}

export interface FileState {
  currentFilePath: string | null;
  content: string;
  isModified: boolean;
  isLoading: boolean;
}

const DEFAULT_CONTENT = `// Welcome to HorseCAD Rhai Editor
// Create 3D shapes using fidget functions

// Create a simple sphere
let sphere = sphere(1.0);

// Draw the shape to generate a 3D mesh
draw(sphere);`;

function App() {
  // File state
  const [fileState, setFileState] = useState<FileState>({
    currentFilePath: null,
    content: DEFAULT_CONTENT,
    isModified: false,
    isLoading: false,
  });

  // Mesh state
  const [meshData, setMeshData] = useState<MeshData | null>(null);
  const [compilationState, setCompilationState] = useState<CompilationState>({
    isCompiling: false,
    error: null,
    lastCompiled: 0,
  });

  // Editor content management
  const getEditorContentRef = useRef<() => string>(() => fileState.content);
  const setEditorContentRef = useRef<(content: string) => void>(() => {});

  // Register editor methods (called by CodeEditor)
  const registerEditorMethods = useCallback((getter: () => string, setter: (content: string) => void) => {
    getEditorContentRef.current = getter;
    setEditorContentRef.current = setter;
  }, []);

  // File operations
  const newFile = useCallback(() => {
    if (fileState.isModified) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to create a new file?');
      if (!confirmed) return;
    }

    setFileState({
      currentFilePath: null,
      content: DEFAULT_CONTENT,
      isModified: false,
      isLoading: false,
    });

    setEditorContentRef.current(DEFAULT_CONTENT);
  }, [fileState.isModified]);

  const openFile = useCallback(async () => {
    if (fileState.isModified) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to open a new file?');
      if (!confirmed) return;
    }

    try {
      setFileState(prev => ({ ...prev, isLoading: true }));

      const filePath = await invoke<string | null>('show_open_dialog');
      if (!filePath) {
        setFileState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const content = await invoke<string>('load_horsi_file', { path: filePath });
      
      setFileState({
        currentFilePath: filePath,
        content,
        isModified: false,
        isLoading: false,
      });

      setEditorContentRef.current(content);
    } catch (error) {
      console.error('Failed to open file:', error);
      setFileState(prev => ({ ...prev, isLoading: false }));
      alert(`Failed to open file: ${error}`);
    }
  }, [fileState.isModified]);

  const saveFile = useCallback(async () => {
    if (!fileState.currentFilePath) {
      // Save as logic
      try {
        setFileState(prev => ({ ...prev, isLoading: true }));

        const filePath = await invoke<string | null>('show_save_dialog');
        if (!filePath) {
          setFileState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        const currentContent = getEditorContentRef.current();
        await invoke<boolean>('save_horsi_file', {
          path: filePath,
          content: currentContent,
        });

        setFileState({
          currentFilePath: filePath,
          content: currentContent,
          isModified: false,
          isLoading: false,
        });
      } catch (error) {
        console.error('Failed to save file:', error);
        setFileState(prev => ({ ...prev, isLoading: false }));
        alert(`Failed to save file: ${error}`);
      }
      return;
    }

    try {
      setFileState(prev => ({ ...prev, isLoading: true }));

      const currentContent = getEditorContentRef.current();
      await invoke<boolean>('save_horsi_file', {
        path: fileState.currentFilePath,
        content: currentContent,
      });

      setFileState(prev => ({
        ...prev,
        content: currentContent,
        isModified: false,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to save file:', error);
      setFileState(prev => ({ ...prev, isLoading: false }));
      alert(`Failed to save file: ${error}`);
    }
  }, [fileState.currentFilePath]);

  const saveFileAs = useCallback(async () => {
    try {
      setFileState(prev => ({ ...prev, isLoading: true }));

      const filePath = await invoke<string | null>('show_save_dialog');
      if (!filePath) {
        setFileState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const currentContent = getEditorContentRef.current();
      await invoke<boolean>('save_horsi_file', {
        path: filePath,
        content: currentContent,
      });

      setFileState({
        currentFilePath: filePath,
        content: currentContent,
        isModified: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to save file:', error);
      setFileState(prev => ({ ...prev, isLoading: false }));
      alert(`Failed to save file: ${error}`);
    }
  }, []);

  // Content update callback for CodeEditor
  const updateContent = useCallback((content: string) => {
    setFileState(prev => ({
      ...prev,
      content,
      isModified: prev.content !== content,
    }));
  }, []);

  // Mesh operations
  const compileScript = useCallback(async (
    code: string,
    depth: number = 6,
    scale: number = 1.0,
    center: [number, number, number] = [0, 0, 0]
  ) => {
    // Use functional state update to check if compilation is already in progress
    let shouldProceed = false;
    setCompilationState(prev => {
      if (prev.isCompiling) {
        return prev; // Return unchanged state - compilation already in progress
      }
      shouldProceed = true;
      return {
        ...prev,
        isCompiling: true,
        error: null,
      };
    });

    if (!shouldProceed) {
      return; // Exit early if compilation is already in progress
    }

    try {
      const result = await invoke<{
        success: boolean;
        stl_data?: number[];
        triangle_count?: number;
        error?: string;
      }>('compile_script', {
        code,
        depth,
        scale,
        center,
      });

      if (result.success) {
        if (!result.stl_data || !result.triangle_count) {
          throw new Error('Invalid STL data received from compilation');
        }
        if (result.triangle_count === 0) {
          throw new Error('No geometry generated - check your script for valid shapes');
        }

        const stlData = new Uint8Array(result.stl_data);
        const newMeshData: MeshData = {
          stlData,
          triangleCount: result.triangle_count,
          timestamp: Date.now(),
        };

        setMeshData(newMeshData);
        setCompilationState(prev => ({
          ...prev,
          isCompiling: false,
          error: null,
          lastCompiled: Date.now(),
        }));
      } else {
        throw new Error(result.error || 'Compilation failed without a specific error message');
      }
    } catch (error) {
      setCompilationState(prev => ({
        ...prev,
        isCompiling: false,
        error: (error as Error).message || 'An unknown error occurred during compilation',
      }));
      console.error('Error during compilation: ', error);
    }
  }, []);

  const exportSTL = useCallback(async () => {
    try {
      if (!meshData) {
        alert('No mesh data available. Please compile your script first.');
        return;
      }

      const filePath = await invoke<string | null>('show_stl_save_dialog');
      if (!filePath) return;

      await invoke<boolean>('export_stl_file', {
        path: filePath,
        stlData: Array.from(meshData.stlData),
      });

      alert('STL file exported successfully!');
    } catch (error) {
      console.error('Failed to export STL:', error);
      alert(`Failed to export STL: ${error}`);
    }
  }, [meshData]);

  // Menu event listeners
  useEffect(() => {
    const unlistenNew = listen('menu_new', () => newFile());
    const unlistenOpen = listen('menu_open', () => openFile());
    const unlistenSave = listen('menu_save', () => saveFile());
    const unlistenSaveAs = listen('menu_save_as', () => saveFileAs());
    const unlistenExportSTL = listen('menu_export_stl', () => exportSTL());
    const unlistenCompile = listen('menu_compile', () => {
      const code = getEditorContentRef.current();
      compileScript(code);
    });

    const unlisteners = [unlistenNew, unlistenOpen, unlistenSave, unlistenSaveAs, unlistenExportSTL, unlistenCompile];

    return () => {
      unlisteners.forEach(unlisten => unlisten.then(f => f()));
    };
  }, [newFile, openFile, saveFile, saveFileAs, exportSTL, compileScript]);

  return (
    <Layout
      // File props
      fileState={fileState}
      onContentUpdate={updateContent}
      registerEditorMethods={registerEditorMethods}
      
      // Mesh props
      meshData={meshData}
      compilationState={compilationState}
      onCompileRequest={compileScript}
    />
  );
}

export default App;
