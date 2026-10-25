import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Lensflare, LensflareElement } from "three/examples/jsm/objects/Lensflare.js";
import { BUILDINGS_DATA } from "@/data/buildings";
import { BuildingKey } from "@/types/campus-map";

interface Campus3DSceneProps {
  onBuildingSelect: (key: BuildingKey | null) => void;
  selectedBuildingKey: BuildingKey | null;
  onScreenPositionChange: (pos: { x: number; y: number } | null) => void;
  onLoadingProgress: (percent: number) => void;
  resetSignal: number;
}

export const Campus3DScene: React.FC<Campus3DSceneProps> = ({
  onBuildingSelect,
  selectedBuildingKey,
  onScreenPositionChange,
  onLoadingProgress,
  resetSignal,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // References to keep across re-renders without re-initializing WebGL
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const buildingMeshesRef = useRef<Map<BuildingKey, THREE.Vector3>>(new Map());

  // Animation state
  const isAnimatingRef = useRef(false);
  const targetCameraPosRef = useRef(new THREE.Vector3());
  const targetLookAtRef = useRef(new THREE.Vector3());
  const currentFocusPosRef = useRef(new THREE.Vector3());

  // Handle building selection via bottom bar / external click
  useEffect(() => {
    if (!selectedBuildingKey || !cameraRef.current || !controlsRef.current) return;

    const buildingPos = buildingMeshesRef.current.get(selectedBuildingKey);
    const buildingInfo = BUILDINGS_DATA[selectedBuildingKey];

    if (buildingPos && buildingInfo) {
      currentFocusPosRef.current.copy(buildingPos);
      targetLookAtRef.current.copy(buildingPos);

      const offset = buildingInfo.cameraOffset || { x: 15, y: 13, z: 15 };
      targetCameraPosRef.current.set(
        buildingPos.x + offset.x,
        buildingPos.y + offset.y,
        buildingPos.z + offset.z
      );
      isAnimatingRef.current = true;
    }
  }, [selectedBuildingKey]);

  // Handle Reset Camera signal
  useEffect(() => {
    if (resetSignal === 0 || !cameraRef.current || !controlsRef.current) return;

    targetCameraPosRef.current.set(22, 22, 22);
    targetLookAtRef.current.set(0, 0, 0);
    isAnimatingRef.current = true;
    onBuildingSelect(null);
    onScreenPositionChange(null);
  }, [resetSignal, onBuildingSelect, onScreenPositionChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const fogColor = 0xd5e0f2;
    scene.fog = new THREE.FogExp2(fogColor, 0.005);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 20, 20);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.8;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Sky Dome
    const skyCanvas = document.createElement("canvas");
    skyCanvas.width = 2;
    skyCanvas.height = 512;
    const ctx = skyCanvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 512);
      gradient.addColorStop(0, "#4a6fa5");
      gradient.addColorStop(0.4, "#8fa8d6");
      gradient.addColorStop(0.7, "#cbd7eb");
      gradient.addColorStop(1, "#ffffff");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 2, 512);
    }
    const skyTexture = new THREE.CanvasTexture(skyCanvas);
    skyTexture.colorSpace = THREE.SRGBColorSpace;
    const skyGeo = new THREE.SphereGeometry(250, 32, 15);
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTexture,
      side: THREE.BackSide,
      fog: true,
    });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyDome);

    // 3. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.08;
    controls.minPolarAngle = 0.1;
    controls.minDistance = 2;
    controls.maxDistance = 80;
    controlsRef.current = controls;

    const stopAutoPilot = () => {
      if (isAnimatingRef.current) {
        isAnimatingRef.current = false;
      }
    };
    renderer.domElement.addEventListener("pointerdown", stopAutoPilot);
    renderer.domElement.addEventListener("wheel", stopAutoPilot, { passive: true });

    // 4. Lighting & Lensflare
    const ambientLight = new THREE.AmbientLight(0x4a5a80, 0.45);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x8fa8d6, 0x4a3f35, 0.75);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const sunX = -60;
    const sunY = 50;
    const sunZ = -110;
    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.5);
    sunLight.position.set(sunX, sunY, sunZ);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.camera.left = -60;
    sunLight.shadow.camera.right = 60;
    sunLight.shadow.camera.top = 60;
    sunLight.shadow.camera.bottom = -60;
    sunLight.shadow.radius = 3;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.05;
    scene.add(sunLight);

    const sunSphereGeo = new THREE.SphereGeometry(4, 16, 16);
    const sunSphereMat = new THREE.MeshBasicMaterial({ color: 0xe69d24, fog: false });
    const sunSphere = new THREE.Mesh(sunSphereGeo, sunSphereMat);
    sunSphere.position.set(sunX, sunY, sunZ);
    scene.add(sunSphere);

    // Create procedural Lensflare
    const createFlareTexture = (size: number, isMain: boolean) => {
      const fCanvas = document.createElement("canvas");
      fCanvas.width = size;
      fCanvas.height = size;
      const fCtx = fCanvas.getContext("2d");
      if (fCtx) {
        const rad = fCtx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        if (isMain) {
          rad.addColorStop(0, "rgba(255, 255, 255, 1)");
          rad.addColorStop(0.05, "rgba(255, 240, 200, 0.9)");
          rad.addColorStop(0.2, "rgba(255, 200, 100, 0.4)");
          rad.addColorStop(0.5, "rgba(255, 150, 50, 0.1)");
          rad.addColorStop(1, "rgba(255, 255, 255, 0)");
        } else {
          rad.addColorStop(0, "rgba(255, 255, 255, 0)");
          rad.addColorStop(0.8, "rgba(230, 160, 80, 0.12)");
          rad.addColorStop(0.9, "rgba(100, 180, 255, 0.08)");
          rad.addColorStop(1, "rgba(255, 255, 255, 0)");
        }
        fCtx.fillStyle = rad;
        fCtx.fillRect(0, 0, size, size);
      }
      return new THREE.CanvasTexture(fCanvas);
    };

    const textureMainGlow = createFlareTexture(512, true);
    const textureRingGlow = createFlareTexture(256, false);
    const lensflare = new Lensflare();
    lensflare.addElement(new LensflareElement(textureMainGlow, 550, 0, new THREE.Color(0xffffff)));
    lensflare.addElement(new LensflareElement(textureRingGlow, 80, 0.4, new THREE.Color(0xffe0b3)));
    lensflare.addElement(new LensflareElement(textureRingGlow, 140, 0.5, new THREE.Color(0xffffff)));
    lensflare.addElement(new LensflareElement(textureRingGlow, 60, 0.7, new THREE.Color(0xb3e5fc)));
    sunSphere.add(lensflare);

    // 5. Load GLTF Model
    const fixMaterial = (mat: THREE.Material) => {
      const m = mat as THREE.MeshStandardMaterial;
      if (m.isMeshStandardMaterial) {
        m.metalness = 0.02;
        m.roughness = 0.75;
        if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
        if (m.color && m.color.getHex() === 0x000000) {
          m.color.setHex(0xaaaaaa);
        }
      }
    };

    const loader = new GLTFLoader();
    loader.load(
      "/models/map.glb",
      (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.material) {
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach(fixMaterial);
              } else {
                fixMaterial(mesh.material);
              }
            }
            if (mesh.geometry.attributes.color && mesh.material) {
              (mesh.material as THREE.Material).vertexColors = true;
            }

            // Register building world position if object matches building keys
            const objName = mesh.name.toLowerCase();
            const parentName = mesh.parent?.name.toLowerCase() || "";
            const matchedKey = (Object.keys(BUILDINGS_DATA) as BuildingKey[]).find(
              (key) => objName.includes(key) || parentName.includes(key)
            );

            if (matchedKey && !buildingMeshesRef.current.has(matchedKey)) {
              const worldPos = new THREE.Vector3();
              if (mesh.parent && parentName.includes(matchedKey)) {
                mesh.parent.getWorldPosition(worldPos);
              } else {
                mesh.getWorldPosition(worldPos);
              }
              buildingMeshesRef.current.set(matchedKey, worldPos);
            }
          }
        });

        scene.add(model);
        onLoadingProgress(100);
      },
      (xhr) => {
        if (xhr.lengthComputable && xhr.total > 0) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          onLoadingProgress(Math.min(percent, 98));
        } else {
          onLoadingProgress(70);
        }
      },
      (err) => {
        console.error("3D Campus model load error:", err);
        onLoadingProgress(100);
      }
    );

    // 6. Raycast Click Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };
    let pointerDownTime = 0;

    const onPointerDown = (e: MouseEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
      pointerDownTime = Date.now();
    };

    const onPointerUp = (e: MouseEvent) => {
      const deltaX = Math.abs(e.clientX - pointerDownPos.x);
      const deltaY = Math.abs(e.clientY - pointerDownPos.y);
      const duration = Date.now() - pointerDownTime;

      // Ignore drags and long presses
      if (deltaX > 6 || deltaY > 6 || duration > 300) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const hit = intersects.find((item) => {
          const oName = item.object.name.toLowerCase();
          const pName = item.object.parent?.name.toLowerCase() || "";
          return (Object.keys(BUILDINGS_DATA) as BuildingKey[]).some(
            (k) => oName.includes(k) || pName.includes(k)
          );
        });

        if (hit) {
          const oName = hit.object.name.toLowerCase();
          const pName = hit.object.parent?.name.toLowerCase() || "";
          const foundKey = (Object.keys(BUILDINGS_DATA) as BuildingKey[]).find(
            (k) => oName.includes(k) || pName.includes(k)
          );

          if (foundKey) {
            onBuildingSelect(foundKey);
            return;
          }
        }
      }

      // If clicked on ground or empty space, deselect
      if (!isAnimatingRef.current) {
        onBuildingSelect(null);
        onScreenPositionChange(null);
      }
    };

    renderer.domElement.addEventListener("mousedown", onPointerDown);
    renderer.domElement.addEventListener("mouseup", onPointerUp);

    // 7. Resize handling
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // 8. Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Camera flight interpolation
      if (isAnimatingRef.current) {
        camera.position.lerp(targetCameraPosRef.current, 0.05);
        controls.target.lerp(targetLookAtRef.current, 0.05);

        if (
          camera.position.distanceTo(targetCameraPosRef.current) < 0.1 &&
          controls.target.distanceTo(targetLookAtRef.current) < 0.1
        ) {
          isAnimatingRef.current = false;
        }
      }

      controls.update();

      // Campus boundary constraints
      if (!isAnimatingRef.current) {
        const minX = -40;
        const maxX = 26;
        const minZ = -70;
        const maxZ = 35;
        const target = controls.target;
        let deltaX = 0;
        let deltaZ = 0;

        if (target.x < minX) deltaX = minX - target.x;
        if (target.x > maxX) deltaX = maxX - target.x;
        if (target.z < minZ) deltaZ = minZ - target.z;
        if (target.z > maxZ) deltaZ = maxZ - target.z;

        if (deltaX !== 0 || deltaZ !== 0) {
          target.x += deltaX;
          target.z += deltaZ;
          camera.position.x += deltaX;
          camera.position.z += deltaZ;
        }
      }

      // Minimum camera height from ground
      const minHeight = 1.5;
      if (camera.position.y < minHeight) {
        const diff = minHeight - camera.position.y;
        camera.position.y = minHeight;
        controls.target.y += diff;
      }

      // Update projected 2D Billboard Screen Position
      if (selectedBuildingKey && buildingMeshesRef.current.has(selectedBuildingKey)) {
        const bPos = buildingMeshesRef.current.get(selectedBuildingKey)!;
        const bData = BUILDINGS_DATA[selectedBuildingKey];
        const proj = bPos.clone();
        proj.y += bData.offsetY;
        proj.project(camera);

        const isBehindCamera = proj.z > 1;
        if (!isBehindCamera) {
          const rect = renderer.domElement.getBoundingClientRect();
          const screenX = (proj.x * 0.5 + 0.5) * rect.width + rect.left;
          const screenY = (proj.y * -0.5 + 0.5) * rect.height + rect.top;
          onScreenPositionChange({ x: screenX, y: screenY });
        } else {
          onScreenPositionChange(null);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. WebGL Cleanup & Teardown
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("mousedown", onPointerDown);
      renderer.domElement.removeEventListener("mouseup", onPointerUp);
      renderer.domElement.removeEventListener("pointerdown", stopAutoPilot);
      renderer.domElement.removeEventListener("wheel", stopAutoPilot);

      controls.dispose();
      renderer.dispose();

      // Dispose textures & geometries in scene
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else if (mesh.material) {
            mesh.material.dispose();
          }
        }
      });

      skyTexture.dispose();
      skyGeo.dispose();
      skyMat.dispose();
      textureMainGlow.dispose();
      textureRingGlow.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [selectedBuildingKey, onBuildingSelect, onScreenPositionChange, onLoadingProgress]);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />;
};
