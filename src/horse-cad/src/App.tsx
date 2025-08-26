import React, { useEffect, useState, useRef } from "react";
import Layout from "./components/Layout";
import { MeshProvider, useMesh } from "./contexts/MeshContext";
import { FileProvider, useFile } from "./contexts/FileContext";
import { listen } from '@tauri-apps/api/event';
import "./App.css";

// Component to connect contexts and handle menu events
const MenuEventConnector: React.FC = () => {
  const { meshData, compileScript, exportSTL } = useMesh();
  const { getEditorContent } = useFile();
  const [ _, setShowLogs ] = useState(true);

  useEffect(() => {

    // STL Export
    const unlistenExportSTL = listen('menu_export_stl', () => {
      exportSTL();
    });

    // Compile
    const unlistenCompile = listen('menu_compile', () => {
      const code = getEditorContent();
      compileScript(code);
    });

    // Toggle Logs
    const unlistenToggleLogs = listen('menu_toggle_logs', () => {
      setShowLogs(prev => !prev);
      // TODO: Implement actual log panel toggle functionality
      console.log('Toggle logs menu item clicked');
    });

    const unlisteners = [unlistenExportSTL, unlistenCompile, unlistenToggleLogs];

    return () => {
      unlisteners.forEach(unlisten => unlisten.then(f => f()));
    };
  }, []);

  return null;
};

function App() {
  return (
    <FileProvider>
      <MeshProvider>
        <MenuEventConnector />
        <Layout />
      </MeshProvider>
    </FileProvider>
  );
}

export default App;
