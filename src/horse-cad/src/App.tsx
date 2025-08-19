import React from "react";
import Layout from "./components/Layout";
import { MeshProvider } from "./contexts/MeshContext";
import "./App.css";

function App() {
  return (
    <MeshProvider>
      <Layout />
    </MeshProvider>
  );
}

export default App;
