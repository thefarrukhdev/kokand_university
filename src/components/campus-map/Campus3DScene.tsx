import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Lensflare, LensflareElement } from "three/examples/jsm/objects/Lensflare.js";
import { BUILDINGS_DATA } from "@/data/buildings";
import { BuildingKey } from "@/types/campus-map";
import { CAMERA_PRESETS } from "./constants";

interface Campus3DSceneProps {
  onBuildingSelect: (key: BuildingKey | null) => void;
  selectedBuildingKey: BuildingKey | null;
  onLoadingProgress: (percent: number) => void;
  resetSignal: number;
}

/**
 * Searches the scene hierarchy upwards to match any known building key
 */
const findBuildingKeyFromObject = (object: THREE.Object3D): BuildingKey | null => {
  let curr: THREE.Object3D | null = object;
  const buildingKeys = Object.keys(BUILDINGS_DATA) as BuildingKey[];

  while (curr) {
    const name = curr.name.toLowerCase();
    for (const key of buildingKeys) {
      if (name.includes(key)) {
        return key;
      }
    }
    curr = curr.parent;
  }
  return null;
};

export const Campus3DScene: React.FC<Campus3DSceneProps> = ({
  onBuildingSelect,
  selectedBuildingKey,
  onLoadingProgress,
  resetSignal,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Core Three.js references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const buildingPositionsRef = useRef<Map<BuildingKey, THREE.Vector3>>(new Map());
  const beaconGroupRef = useRef<THREE.Group | null>(null);

  // Camera animation interpolation refs
  const isAnimatingRef = useRef(false);
  const targetCameraPosRef = useRef(new THREE.Vector3(
    CAMERA_PRESETS.initialPosition.x,
    CAMERA_PRESETS.initialPosition.y,
    CAMERA_PRESETS.initialPosition.z
  ));
  const targetLookAtRef = useRef(new THREE.Vector3(
    CAMERA_PRESETS.initialTarget.x,
    CAMERA_PRESETS.initialTarget.y,
    CAMERA_PRESETS.initialTarget.z
  ));

  // Reactive state refs to prevent re-instantiating WebGL
  const selectedBuildingKeyRef = useRef(selectedBuildingKey);
  selectedBuildingKeyRef.current = selectedBuildingKey;

  const onBuildingSelectRef = useRef(onBuildingSelect);
  onBuildingSelectRef.current = onBuildingSelect;

  const onLoadingProgressRef = useRef(onLoadingProgress);
  onLoadingProgressRef.current = onLoadingProgress;

  // Handle building selection camera flight
  useEffect(() => {
    if (!selectedBuildingKey || !cameraRef.current || !controlsRef.current) return;

    const buildingPos = buildingPositionsRef.current.get(selectedBuildingKey);
    const buildingInfo = BUILDINGS_DATA[selectedBuildingKey];

    if (buildingPos && buildingInfo) {
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

  // Handle Camera Reset signal
  useEffect(() => {
    if (resetSignal === 0 || !cameraRef.current || !controlsRef.current) return;

    targetCameraPosRef.current.set(
      CAMERA_PRESETS.initialPosition.x,
      CAMERA_PRESETS.initialPosition.y,
      CAMERA_PRESETS.initialPosition.z
    );
    targetLookAtRef.current.set(
      CAMERA_PRESETS.initialTarget.x,
      CAMERA_PRESETS.initialTarget.y,
      CAMERA_PRESETS.initialTarget.z
    );
    isAnimatingRef.current = true;
    onBuildingSelectRef.current(null);
  }, [resetSignal]);

  // Main WebGL Initialization - Runs strictly ONCE on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const fogColor = 0xd5e0f2;
    scene.fog = new THREE.FogExp2(fogColor, 0.005);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(
      CAMERA_PRESETS.initialPosition.x,
      CAMERA_PRESETS.initialPosition.y,
      CAMERA_PRESETS.initialPosition.z
    );
    cameraRef.current = camera;

    // 3. High-Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.8;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Procedural Sky Dome
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

    // 5. Orbit Controls with Physics Damping
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.08;
    controls.minPolarAngle = 0.1;
    controls.minDistance = CAMERA_PRESETS.boundaries.minDistance;
    controls.maxDistance = CAMERA_PRESETS.boundaries.maxDistance;
    controlsRef.current = controls;

    // Interrupt autopilot flight on user interaction
    const stopAutopilot = () => {
      if (isAnimatingRef.current) {
        isAnimatingRef.current = false;
      }
    };
    renderer.domElement.addEventListener("pointerdown", stopAutopilot);
    renderer.domElement.addEventListener("wheel", stopAutopilot, { passive: true });

    // 6. Lighting & Sun Lensflare
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

    // Procedural flare texture generator
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

    // 7. Interactive 3D Beacon (Selected building marker)
    const beaconGroup = new THREE.Group();
    beaconGroup.visible = false;
    scene.add(beaconGroup);
    beaconGroupRef.current = beaconGroup;

    // Base glowing ring
    const ringGeo = new THREE.RingGeometry(1.2, 1.8, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x9c1447, // Kokand University Burgundy
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const beaconRing = new THREE.Mesh(ringGeo, ringMat);
    beaconGroup.add(beaconRing);

    // Outer faint pulse ring
    const outerRingGeo = new THREE.RingGeometry(1.9, 2.3, 32);
    outerRingGeo.rotateX(-Math.PI / 2);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0x003399, // Kokand University Navy
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const outerBeaconRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    beaconGroup.add(outerBeaconRing);

    // 8. GLTF Model Loader with PBR Material Calibration
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

            // Register world positions for each building key
            const matchedKey = findBuildingKeyFromObject(mesh);
            if (matchedKey && !buildingPositionsRef.current.has(matchedKey)) {
              const worldPos = new THREE.Vector3();
              if (mesh.parent && mesh.parent.name.toLowerCase().includes(matchedKey)) {
                mesh.parent.getWorldPosition(worldPos);
              } else {
                mesh.getWorldPosition(worldPos);
              }
              buildingPositionsRef.current.set(matchedKey, worldPos);
            }
          }
        });

        scene.add(model);
        onLoadingProgressRef.current(100);
      },
      (xhr) => {
        if (xhr.lengthComputable && xhr.total > 0) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          onLoadingProgressRef.current(Math.min(percent, 98));
        } else {
          onLoadingProgressRef.current(75);
        }
      },
      (err) => {
        console.error("3D Campus model load error:", err);
        onLoadingProgressRef.current(100);
      }
    );

    // 9. Pointer Raycasting for Clicks & Hover Pointer State
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };
    let pointerDownTime = 0;

    const onPointerDown = (e: MouseEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
      pointerDownTime = Date.now();
    };

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      let isHoveringBuilding = false;
      for (const hit of intersects) {
        if (findBuildingKeyFromObject(hit.object)) {
          isHoveringBuilding = true;
          break;
        }
      }

      container.style.cursor = isHoveringBuilding ? "pointer" : "grab";
    };

    const onPointerUp = (e: MouseEvent) => {
      const deltaX = Math.abs(e.clientX - pointerDownPos.x);
      const deltaY = Math.abs(e.clientY - pointerDownPos.y);
      const duration = Date.now() - pointerDownTime;

      // Filter out drags, pans, and long presses
      if (deltaX > 6 || deltaY > 6 || duration > 300) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      let foundKey: BuildingKey | null = null;
      for (const hit of intersects) {
        const key = findBuildingKeyFromObject(hit.object);
        if (key) {
          foundKey = key;
          break;
        }
      }

      if (foundKey) {
        onBuildingSelectRef.current(foundKey);
      } else if (!isAnimatingRef.current) {
        // Deselect if user clicked empty ground
        onBuildingSelectRef.current(null);
      }
    };

    renderer.domElement.addEventListener("mousedown", onPointerDown);
    renderer.domElement.addEventListener("mousemove", onPointerMove);
    renderer.domElement.addEventListener("mouseup", onPointerUp);

    // 10. Window Resize Observer
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // 11. Delta-timed Render Loop
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Camera flight interpolation with frame-rate independence
      if (isAnimatingRef.current) {
        const lerpFactor = 1 - Math.exp(-6 * delta); // Framerate-independent lerp
        camera.position.lerp(targetCameraPosRef.current, lerpFactor);
        controls.target.lerp(targetLookAtRef.current, lerpFactor);

        if (
          camera.position.distanceTo(targetCameraPosRef.current) < 0.1 &&
          controls.target.distanceTo(targetLookAtRef.current) < 0.1
        ) {
          isAnimatingRef.current = false;
        }
      }

      controls.update();

      // Enforce campus boundaries
      if (!isAnimatingRef.current) {
        const { minX, maxX, minZ, maxZ, minHeight } = CAMERA_PRESETS.boundaries;
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

        if (camera.position.y < minHeight) {
          const diff = minHeight - camera.position.y;
          camera.position.y = minHeight;
          controls.target.y += diff;
        }
      }

      // Update 3D Selection Beacon
      const activeKey = selectedBuildingKeyRef.current;
      if (activeKey && buildingPositionsRef.current.has(activeKey)) {
        const bPos = buildingPositionsRef.current.get(activeKey)!;
        const bData = BUILDINGS_DATA[activeKey];
        beaconGroup.position.set(bPos.x, bPos.y + (bData.offsetY > 0 ? 0.2 : -0.2), bPos.z);
        beaconGroup.visible = true;

        // Subtle harmonic pulse
        const pulse = 1 + Math.sin(elapsed * 4) * 0.1;
        beaconRing.scale.set(pulse, pulse, pulse);
        outerBeaconRing.scale.set(1.1 - Math.sin(elapsed * 4) * 0.08, 1.1 - Math.sin(elapsed * 4) * 0.08, 1);
      } else {
        beaconGroup.visible = false;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 12. Graceful Teardown & Resource Disposal
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("mousedown", onPointerDown);
      renderer.domElement.removeEventListener("mousemove", onPointerMove);
      renderer.domElement.removeEventListener("mouseup", onPointerUp);
      renderer.domElement.removeEventListener("pointerdown", stopAutopilot);
      renderer.domElement.removeEventListener("wheel", stopAutopilot);

      controls.dispose();
      renderer.dispose();

      // Dispose all geometry and materials in the scene
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
      ringGeo.dispose();
      ringMat.dispose();
      outerRingGeo.dispose();
      outerRingMat.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []); // Strictly empty deps: initialized ONCE, reactive changes handled via refs & specialized effects!

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none"
    />
  );
};
