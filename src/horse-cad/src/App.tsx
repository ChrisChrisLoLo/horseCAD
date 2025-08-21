import React, { useEffect, useState } from "react";
import Layout from "./components/Layout";
import { MeshProvider, useMesh } from "./contexts/MeshContext";
import { FileProvider, useFile } from "./contexts/FileContext";
import { listen } from '@tauri-apps/api/event';
import "./App.css";

// Component to connect contexts and handle menu events
const MenuEventConnector: React.FC = () => {
  const { meshData, compileScript } = useMesh();
  const { exportSTL, getEditorContent } = useFile();
  const [showLogs, setShowLogs] = useState(true);

  // FIXED: Empty dependency array prevents infinite loop
  useEffect(() => {
    let unlisteners: (() => void)[] = [];

    const setupMenuListeners = async () => {
      // STL Export
      const unlistenExportSTL = await listen('menu_export_stl', () => {
        exportSTL(meshData?.stlData);
      });

      // Compile
      const unlistenCompile = await listen('menu_compile', () => {
        const code = getEditorContent();
        compileScript(code);
      });

      // Toggle Logs
      const unlistenToggleLogs = await listen('menu_toggle_logs', () => {
        setShowLogs(prev => !prev);
        // TODO: Implement actual log panel toggle functionality
        console.log('Toggle logs menu item clicked');
      });

      unlisteners = [unlistenExportSTL, unlistenCompile, unlistenToggleLogs];
    };

    setupMenuListeners();

    return () => {
      unlisteners.forEach(unlisten => unlisten());
    };
  }, []); // FIXED: Empty dependency array prevents infinite loop

  return null; // This component doesn't render anything
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
