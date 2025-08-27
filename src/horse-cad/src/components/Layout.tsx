import React from 'react';
import CodeEditor from './CodeEditor';
import ThreeCanvas from './ThreeCanvas';
import LogPanel from './LogPanel';
import { FileState, MeshData, CompilationState } from '../App';

interface LayoutProps {
  // File props
  fileState: FileState;
  onContentUpdate: (content: string) => void;
  registerEditorMethods: (getter: () => string, setter: (content: string) => void) => void;
  
  // Mesh props
  meshData: MeshData | null;
  compilationState: CompilationState;
  onCompileRequest: (code: string, depth?: number, scale?: number, center?: [number, number, number]) => Promise<void>;
}

const Layout: React.FC<LayoutProps> = ({
  fileState,
  onContentUpdate,
  registerEditorMethods,
  meshData,
  compilationState,
  onCompileRequest,
}) => {
  return (
    <div className="h-screen w-screen flex bg-gray-900">
      {/* Left side - Code Editor */}
      <div className="w-1/2 h-full border-r border-gray-700">
        <CodeEditor
          fileState={fileState}
          onContentUpdate={onContentUpdate}
          registerEditorMethods={registerEditorMethods}
          compilationState={compilationState}
          onCompileRequest={onCompileRequest}
        />
      </div>
      
      {/* Right side - Canvas and Logs */}
      <div className="w-1/2 h-full flex flex-col">
        {/* Three.js Canvas */}
        <div className="flex-1 border-b border-gray-700">
          <ThreeCanvas meshData={meshData} />
        </div>
        
        {/* Log Panel */}
        <div className="h-64 min-h-[200px] max-h-96 resize-y overflow-hidden">
          <LogPanel compilationState={compilationState} />
        </div>
      </div>
    </div>
  );
};

export default Layout;
