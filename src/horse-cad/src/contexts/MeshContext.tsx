import React, { createContext, useContext, useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

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

export interface MeshContextType {
  meshData: MeshData | null;
  compilationState: CompilationState;
  compileScript: (code: string, depth?: number, scale?: number, center?: [number, number, number]) => Promise<void>;
  clearMesh: () => void;
}

const MeshContext = createContext<MeshContextType | undefined>(undefined);

export const useMesh = () => {
  const context = useContext(MeshContext);
  if (!context) {
    throw new Error('useMesh must be used within a MeshProvider');
  }
  return context;
};

interface MeshProviderProps {
  children: React.ReactNode;
}

export const MeshProvider: React.FC<MeshProviderProps> = ({ children }) => {
  const [meshData, setMeshData] = useState<MeshData | null>(null);
  const [compilationState, setCompilationState] = useState<CompilationState>({
    isCompiling: false,
    error: null,
    lastCompiled: 0,
  });

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
        console.log('Compilation already in progress, skipping');
        return prev; // Return unchanged state
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

    console.log('Starting compilation with parameters:', { depth, scale, center });
    console.log('Code to compile:', code);

    try {
      console.log('Invoking Tauri compile_script function...');
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

      console.log('Received result from Tauri:', result);

      if (result.success && result.stl_data && result.triangle_count !== undefined) {
        console.log(`Compilation successful! Generated ${result.triangle_count} triangles, STL data size: ${result.stl_data.length} bytes`);
        
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

        console.log('Mesh data updated successfully');
      } else {
        throw new Error(result.error || 'Compilation failed');
      }
    } catch (error) {
      console.error('Compilation error:', error);
      setCompilationState(prev => ({
        ...prev,
        isCompiling: false,
        error: error instanceof Error ? error.message : 'Unknown compilation error',
      }));
    }
  }, []); // Empty dependency array to keep function reference stable

  const clearMesh = useCallback(() => {
    setMeshData(null);
    setCompilationState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  const value: MeshContextType = {
    meshData,
    compilationState,
    compileScript,
    clearMesh,
  };

  return (
    <MeshContext.Provider value={value}>
      {children}
    </MeshContext.Provider>
  );
};
