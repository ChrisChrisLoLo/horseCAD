import React from 'react';
import CodeEditor from './CodeEditor';
import ThreeCanvas from './ThreeCanvas';
import LogPanel from './LogPanel';

const Layout: React.FC = () => {
  return (
    <div className="h-screen w-screen flex bg-gray-900">
      {/* Left side - Code Editor */}
      <div className="w-1/2 h-full border-r border-gray-700">
        <CodeEditor />
      </div>
      
      {/* Right side - Canvas and Logs */}
      <div className="w-1/2 h-full flex flex-col">
        {/* Three.js Canvas */}
        <div className="flex-1 border-b border-gray-700">
          <ThreeCanvas />
        </div>
        
        {/* Log Panel */}
        <div className="h-64 min-h-[200px] max-h-96 resize-y overflow-hidden">
          <LogPanel />
        </div>
      </div>
    </div>
  );
};

export default Layout;
