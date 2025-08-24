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

  // Strict Mode safe: prevent duplicate listener setup
  const listenersSetupRef = useRef(false);

  // STRICT MODE SAFE: Prevent duplicate listener setup
  useEffect(() => {
    // Prevent multiple listener setups in Strict Mode
    if (listenersSetupRef.current) {
      return;
    }
    listenersSetupRef.current = true;

    let unlisteners: (() => void)[] = [];

    const setupMenuListeners = async () => {
      // STL Export
      const unlistenExportSTL = await listen('menu_export_stl', () => {
        exportSTL();
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
      // DON'T reset the ref here - let it stay true to prevent re-setup in Strict Mode
      unlisteners.forEach(unlisten => unlisten());
    };
  }, []); // Empty dependency array prevents infinite loop

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
