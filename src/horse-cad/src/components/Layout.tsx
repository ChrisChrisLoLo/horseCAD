import React from 'react';
import CodeEditor from './CodeEditor';
import ThreeCanvas from './ThreeCanvas';
import LogPanel from './LogPanel';
import { FileState, MeshData, CompilationState } from '../App';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

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
    <div className="h-screen w-screen bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left side - Code Editor */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <CodeEditor
            fileState={fileState}
            onContentUpdate={onContentUpdate}
            registerEditorMethods={registerEditorMethods}
            compilationState={compilationState}
            onCompileRequest={onCompileRequest}
          />
        </ResizablePanel>
        
        <ResizableHandle />
        
        {/* Right side - Canvas and Logs */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <ResizablePanelGroup direction="vertical">
            {/* Three.js Canvas */}
            <ResizablePanel defaultSize={70} minSize={40}>
              <ThreeCanvas meshData={meshData} />
            </ResizablePanel>
            
            <ResizableHandle />
            
            {/* Log Panel */}
            <ResizablePanel defaultSize={30} minSize={20}>
              <LogPanel compilationState={compilationState} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Layout;
