import * as THREE from 'three';

export interface STLTriangle {
  normal: THREE.Vector3;
  vertices: [THREE.Vector3, THREE.Vector3, THREE.Vector3];
}

export class STLParser {
  static parseSTL(data: Uint8Array): THREE.BufferGeometry {
    // Check if it's binary or ASCII STL
    const header = new TextDecoder().decode(data.slice(0, 80));
    const isBinary = !header.toLowerCase().includes('solid');

    if (isBinary) {
      return this.parseBinarySTL(data);
    } else {
      return this.parseASCIISTL(data);
    }
  }

  private static parseBinarySTL(data: Uint8Array): THREE.BufferGeometry {
    const dataView = new DataView(data.buffer);
    
    // Skip 80-byte header
    let offset = 80;
    
    // Read number of triangles (4 bytes, little-endian)
    const triangleCount = dataView.getUint32(offset, true);
    offset += 4;

    const positions: number[] = [];
    const normals: number[] = [];

    for (let i = 0; i < triangleCount; i++) {
      // Read normal vector (3 floats, 12 bytes)
      const nx = dataView.getFloat32(offset, true);
      const ny = dataView.getFloat32(offset + 4, true);
      const nz = dataView.getFloat32(offset + 8, true);
      offset += 12;

      // Read 3 vertices (9 floats, 36 bytes)
      for (let j = 0; j < 3; j++) {
        const x = dataView.getFloat32(offset, true);
        const y = dataView.getFloat32(offset + 4, true);
        const z = dataView.getFloat32(offset + 8, true);
        offset += 12;

        positions.push(x, y, z);
        normals.push(nx, ny, nz);
      }

      // Skip attribute byte count (2 bytes)
      offset += 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));

    // Compute bounding box and center the geometry
    geometry.computeBoundingBox();
    if (geometry.boundingBox) {
      const center = geometry.boundingBox.getCenter(new THREE.Vector3());
      geometry.translate(-center.x, -center.y, -center.z);
    }

    return geometry;
  }

  private static parseASCIISTL(data: Uint8Array): THREE.BufferGeometry {
    const text = new TextDecoder().decode(data);
    const lines = text.split('\n').map(line => line.trim());

    const positions: number[] = [];
    const normals: number[] = [];

    let currentNormal: THREE.Vector3 | null = null;
    let vertexCount = 0;

    for (const line of lines) {
      if (line.startsWith('facet normal')) {
        const parts = line.split(/\s+/);
        if (parts.length >= 5) {
          currentNormal = new THREE.Vector3(
            parseFloat(parts[2]),
            parseFloat(parts[3]),
            parseFloat(parts[4])
          );
        }
        vertexCount = 0;
      } else if (line.startsWith('vertex') && currentNormal && vertexCount < 3) {
        const parts = line.split(/\s+/);
        if (parts.length >= 4) {
          positions.push(
            parseFloat(parts[1]),
            parseFloat(parts[2]),
            parseFloat(parts[3])
          );
          normals.push(currentNormal.x, currentNormal.y, currentNormal.z);
          vertexCount++;
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));

    // Compute bounding box and center the geometry
    geometry.computeBoundingBox();
    if (geometry.boundingBox) {
      const center = geometry.boundingBox.getCenter(new THREE.Vector3());
      geometry.translate(-center.x, -center.y, -center.z);
    }

    return geometry;
  }

  static createMeshFromSTL(data: Uint8Array, material?: THREE.Material): THREE.Mesh {
    const geometry = this.parseSTL(data);
    
    const defaultMaterial = new THREE.MeshLambertMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material || defaultMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }
}
