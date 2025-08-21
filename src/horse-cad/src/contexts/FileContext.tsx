import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

export interface FileState {
  currentFilePath: string | null;
  content: string;
  isModified: boolean;
  isLoading: boolean;
}

export interface FileContextType {
  fileState: FileState;
  newFile: () => void;
  openFile: () => Promise<void>;
  saveFile: () => Promise<void>;
  saveFileAs: () => Promise<void>;
  exportSTL: (meshData?: Uint8Array) => Promise<void>;
  updateContent: (content: string) => void;
  getEditorContent: () => string;
  setEditorContent: (content: string) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const useFile = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFile must be used within a FileProvider');
  }
  return context;
};

interface FileProviderProps {
  children: React.ReactNode;
}

const DEFAULT_CONTENT = `// Welcome to HorseCAD Rhai Editor
// Create 3D shapes using fidget functions

// Create a simple sphere
let sphere = sphere(1.0);

// Draw the shape to generate a 3D mesh
draw(sphere);`;

export const FileProvider: React.FC<FileProviderProps> = ({ children }) => {
  const [fileState, setFileState] = useState<FileState>({
    currentFilePath: null,
    content: DEFAULT_CONTENT,
    isModified: false,
    isLoading: false,
  });

  // Store reference to editor content getter/setter - but use refs to avoid recreation
  const [getEditorContent, setGetEditorContent] = useState<() => string>(() => () => fileState.content);
  const [setEditorContent, setSetEditorContent] = useState<(content: string) => void>(() => () => {});

  // New file - stable function
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

    setEditorContent(DEFAULT_CONTENT);
  }, [fileState.isModified, setEditorContent]);

  // Open file - stable function
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

      setEditorContent(content);
    } catch (error) {
      console.error('Failed to open file:', error);
      setFileState(prev => ({ ...prev, isLoading: false }));
      alert(`Failed to open file: ${error}`);
    }
  }, [fileState.isModified, setEditorContent]);

  // Save file - stable function
  const saveFile = useCallback(async () => {
    if (!fileState.currentFilePath) {
      // Inline save as logic to avoid circular dependency
      try {
        setFileState(prev => ({ ...prev, isLoading: true }));

        const filePath = await invoke<string | null>('show_save_dialog');
        if (!filePath) {
          setFileState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        const currentContent = getEditorContent();
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

      const currentContent = getEditorContent();
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
  }, [fileState.currentFilePath, getEditorContent]);

  // Save file as - stable function
  const saveFileAs = useCallback(async () => {
    try {
      setFileState(prev => ({ ...prev, isLoading: true }));

      const filePath = await invoke<string | null>('show_save_dialog');
      if (!filePath) {
        setFileState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const currentContent = getEditorContent();
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
  }, [getEditorContent]);

  // Export STL - stable function
  const exportSTL = useCallback(async (meshData?: Uint8Array) => {
    try {
      if (!meshData) {
        alert('No mesh data available. Please compile your script first.');
        return;
      }

      const filePath = await invoke<string | null>('show_stl_save_dialog');
      if (!filePath) return;

      await invoke<boolean>('export_stl_file', {
        path: filePath,
        stlData: Array.from(meshData),
      });

      alert('STL file exported successfully!');
    } catch (error) {
      console.error('Failed to export STL:', error);
      alert(`Failed to export STL: ${error}`);
    }
  }, []);

  // Update content - stable function
  const updateContent = useCallback((content: string) => {
    setFileState(prev => ({
      ...prev,
      content,
      isModified: prev.content !== content,
    }));
  }, []);

  // THE KEY FIX: Remove functions from dependency array to prevent infinite loop
  useEffect(() => {
    let unlisteners: (() => void)[] = [];

    const setupMenuListeners = async () => {
      const unlistenNew = await listen('menu_new', () => newFile());
      const unlistenOpen = await listen('menu_open', () => openFile());
      const unlistenSave = await listen('menu_save', () => saveFile());
      const unlistenSaveAs = await listen('menu_save_as', () => saveFileAs());

      unlisteners = [unlistenNew, unlistenOpen, unlistenSave, unlistenSaveAs];
    };

    setupMenuListeners();

    return () => {
      unlisteners.forEach(unlisten => unlisten());
    };
  }, []); // FIXED: Empty dependency array prevents infinite loop

  const value: FileContextType = {
    fileState,
    newFile,
    openFile,
    saveFile,
    saveFileAs,
    exportSTL,
    updateContent,
    getEditorContent,
    setEditorContent: (content: string) => setEditorContent(content),
  };

  // Provide methods to register editor content getter/setter
  const contextValue = {
    ...value,
    registerEditorMethods: (getter: () => string, setter: (content: string) => void) => {
      setGetEditorContent(() => getter);
      setSetEditorContent(() => setter);
    },
  };

  return (
    <FileContext.Provider value={contextValue as FileContextType}>
      {children}
    </FileContext.Provider>
  );
};
