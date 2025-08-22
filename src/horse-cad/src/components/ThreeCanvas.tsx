import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { useMesh } from '../contexts/MeshContext';
import { STLParser } from '../utils/stlParser';

const ThreeCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const currentMeshRef = useRef<THREE.Mesh | null>(null);
  const [fps, setFps] = useState<number>(60);
  const [showPerformance, setShowPerformance] = useState<boolean>(false);
  const fpsCounterRef = useRef<{ frames: number; lastTime: number }>({ frames: 0, lastTime: 0 });
  const { meshData, } = useMesh();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // OrbitControls setup
    const controls = new OrbitControls(camera, canvasRef.current);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 0.1;
    controls.maxDistance = 1000;
    controls.maxPolarAngle = Math.PI;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Grid helper
    // const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
    // scene.add(gridHelper);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(2);
    scene.add(axesHelper);

    // No default geometry - will be replaced by generated mesh

    // Ground plane
    // const planeGeometry = new THREE.PlaneGeometry(10, 10);
    // const planeMaterial = new THREE.MeshLambertMaterial({ 
    //   color: 0x333333,
    //   transparent: true,
    //   opacity: 0.5
    // });
    // const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    // plane.rotation.x = -Math.PI / 2;
    // plane.receiveShadow = true;
    // scene.add(plane);

    // Performance monitoring
    const updateFPS = () => {
      const now = performance.now();
      fpsCounterRef.current.frames++;
      
      if (now >= fpsCounterRef.current.lastTime + 1000) {
        const currentFps = Math.round((fpsCounterRef.current.frames * 1000) / (now - fpsCounterRef.current.lastTime));
        setFps(currentFps);
        fpsCounterRef.current.frames = 0;
        fpsCounterRef.current.lastTime = now;
        
        // Auto-adjust quality based on performance
        if (currentFps < 30 && controls.enableDamping) {
          controls.dampingFactor = 0.1; // Reduce damping for better performance
        } else if (currentFps > 50 && controls.dampingFactor > 0.05) {
          controls.dampingFactor = 0.05; // Restore smooth damping
        }
      }
    };

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Update controls
      controls.update();

      // Performance monitoring
      updateFPS();

      // Render the scene
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;

      // Get the container dimensions (excluding the header)
      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight - 32; // Subtract header height (2rem = 32px)

      // Update camera aspect ratio
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      // Update renderer size
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
    };

    // Set up resize observer on the container
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Also listen to window resize as a fallback
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      
      // Dispose of Three.js objects
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
    };
  }, []);

  // Effect to handle mesh updates
  useEffect(() => {
    if (!meshData || !sceneRef.current) return;

    try {
      // Remove existing mesh
      if (currentMeshRef.current) {
        sceneRef.current.remove(currentMeshRef.current);
        currentMeshRef.current.geometry.dispose();
        if (Array.isArray(currentMeshRef.current.material)) {
          currentMeshRef.current.material.forEach(material => material.dispose());
        } else {
          currentMeshRef.current.material.dispose();
        }
        currentMeshRef.current = null;
      }

      // Create new mesh from STL data
      const newMesh = STLParser.createMeshFromSTL(meshData.stlData);
      newMesh.castShadow = true;
      newMesh.receiveShadow = true;

      // Add to scene
      sceneRef.current.add(newMesh);
      currentMeshRef.current = newMesh;

      // Auto-fit camera to mesh
      const box = new THREE.Box3().setFromObject(newMesh);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      
      if (cameraRef.current && controlsRef.current && maxDim > 0) {
        const distance = maxDim * 2;
        cameraRef.current.position.set(distance, distance, distance);
        controlsRef.current.target.copy(box.getCenter(new THREE.Vector3()));
        controlsRef.current.update();
      }

      console.log(`Mesh loaded: ${meshData.triangleCount} triangles`);
    } catch (error) {
      console.error('Failed to load mesh:', error);
    }
  }, [meshData]);

  // Camera control functions
  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(5, 5, 5);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  const setViewPreset = (preset: 'top' | 'front' | 'right' | 'isometric') => {
    if (!cameraRef.current || !controlsRef.current) return;

    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const distance = 8;

    switch (preset) {
      case 'top':
        camera.position.set(0, distance, 0);
        break;
      case 'front':
        camera.position.set(0, 0, distance);
        break;
      case 'right':
        camera.position.set(distance, 0, 0);
        break;
      case 'isometric':
        camera.position.set(distance * 0.7, distance * 0.7, distance * 0.7);
        break;
    }

    controls.target.set(0, 0, 0);
    controls.update();
  };

  return (
    <div ref={containerRef} className="h-full w-full relative bg-gray-900">
      <div className="absolute top-0 left-0 right-0 h-8 bg-gray-800 border-b border-gray-700 flex items-center px-3 z-10">
        <span className="text-sm text-gray-300 font-medium">3D Viewport</span>
        
        {/* View Controls */}
        <div className="ml-4 flex items-center space-x-1">
          <button
            onClick={resetCamera}
            className="px-2 py-0.5 text-xs bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
            title="Reset Camera"
          >
            Reset
          </button>
          
          <div className="flex items-center space-x-0.5">
            <button
              onClick={() => setViewPreset('top')}
              className="px-1.5 py-0.5 text-xs bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
              title="Top View"
            >
              T
            </button>
            <button
              onClick={() => setViewPreset('front')}
              className="px-1.5 py-0.5 text-xs bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
              title="Front View"
            >
              F
            </button>
            <button
              onClick={() => setViewPreset('right')}
              className="px-1.5 py-0.5 text-xs bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
              title="Right View"
            >
              R
            </button>
            <button
              onClick={() => setViewPreset('isometric')}
              className="px-1.5 py-0.5 text-xs bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
              title="Isometric View"
            >
              ISO
            </button>
          </div>
        </div>

        <div className="ml-auto flex items-center space-x-2">
          {/* Mesh Info */}
          {meshData && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <span className="text-xs text-blue-400">
                {meshData.triangleCount.toLocaleString()} triangles
              </span>
            </div>
          )}
          
          {/* Performance Toggle */}
          <button
            onClick={() => setShowPerformance(!showPerformance)}
            className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
            title="Toggle Performance Info"
          >
            {showPerformance ? `${fps} FPS` : 'WebGL'}
          </button>
          
          {/* Performance Indicator */}
          {showPerformance && (
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                fps > 50 ? 'bg-green-400' : 
                fps > 30 ? 'bg-yellow-400' : 
                'bg-red-400'
              }`} />
              <span className="text-xs text-gray-400">
                {fps < 30 ? 'Performance Mode' : 'Smooth'}
              </span>
            </div>
          )}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="absolute top-8 left-0 w-full h-[calc(100%-2rem)] block"
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default ThreeCanvas;
