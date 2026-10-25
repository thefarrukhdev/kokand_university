import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { BUILDINGS_DATA } from "@/data/buildings";
import { BuildingKey } from "@/types/campus-map";
import { CAMERA_PRESETS } from "./constants";

export interface Campus3DSceneProps {
  onBuildingSelect: (key: BuildingKey | null) => void;
  selectedBuildingKey: BuildingKey | null;
  onLoadingProgress: (percent: number) => void;
  resetSignal: number;
  focusSignal?: number;
  theme?: "light" | "dark";
}

/**
 * Traverses object hierarchy upwards to match any registered Kokand University building key
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
  focusSignal = 0,
  theme = "light",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Core Three.js references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);

  // Building geometry and bounding references
  const buildingPositionsRef = useRef<Map<BuildingKey, THREE.Vector3>>(new Map());
  const buildingBoundsRef = useRef<Map<BuildingKey, THREE.Box3>>(new Map());
  const buildingMeshesRef = useRef<Map<BuildingKey, THREE.Mesh[]>>(new Map());
  const highlightedMeshesRef = useRef<THREE.Mesh[]>([]);
  const beaconGroupRef = useRef<THREE.Group | null>(null);

  // Camera animation interpolation
  const isAnimatingRef = useRef(false);
  const targetCameraPosRef = useRef(
    new THREE.Vector3(
      CAMERA_PRESETS.initialPosition.x,
      CAMERA_PRESETS.initialPosition.y,
      CAMERA_PRESETS.initialPosition.z
    )
  );
  const targetLookAtRef = useRef(
    new THREE.Vector3(
      CAMERA_PRESETS.initialTarget.x,
      CAMERA_PRESETS.initialTarget.y,
      CAMERA_PRESETS.initialTarget.z
    )
  );

  // Synchronized callback refs
  const selectedBuildingKeyRef = useRef(selectedBuildingKey);
  selectedBuildingKeyRef.current = selectedBuildingKey;

  const onBuildingSelectRef = useRef(onBuildingSelect);
  onBuildingSelectRef.current = onBuildingSelect;

  const onLoadingProgressRef = useRef(onLoadingProgress);
  onLoadingProgressRef.current = onLoadingProgress;

  const themeRef = useRef(theme);
  themeRef.current = theme;

  // Handle building selection camera flight & mesh highlight
  useEffect(() => {
    // 1. Update Mesh Highlights
    // Revert previously highlighted building meshes
    highlightedMeshesRef.current.forEach((mesh) => {
      const mat = mesh.material;
      if (Array.isArray(mat)) {
        mat.forEach((m) => {
          if ("emissive" in m && m.emissive instanceof THREE.Color) {
            m.emissive.setHex(0x000000);
          }
        });
      } else if (mat && "emissive" in mat && mat.emissive instanceof THREE.Color) {
        mat.emissive.setHex(0x000000);
      }
    });
    highlightedMeshesRef.current = [];

    // Highlight newly selected building meshes in Kokand University Burgundy
    if (selectedBuildingKey) {
      const activeMeshes = buildingMeshesRef.current.get(selectedBuildingKey) || [];
      activeMeshes.forEach((mesh) => {
        const mat = mesh.material;
        if (Array.isArray(mat)) {
          mat.forEach((m) => {
            if ("emissive" in m && m.emissive instanceof THREE.Color) {
              m.emissive.setHex(0x9c1447);
            }
          });
        } else if (mat && "emissive" in mat && mat.emissive instanceof THREE.Color) {
          mat.emissive.setHex(0x9c1447);
        }
      });
      highlightedMeshesRef.current = activeMeshes;
    }

    // 2. Camera Flight
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
  }, [selectedBuildingKey, focusSignal]);

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

  // Handle Theme Dynamic Lighting (Dark / Light synchronicity without WebGL re-instantiation)
  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current) return;
    const isDark = theme === "dark";

    const targetFogColor = isDark ? 0x0f172a : 0xd5e0f2;
    const targetBgColor = isDark ? 0x0b1120 : 0xd5e0f2;

    if (sceneRef.current.fog instanceof THREE.FogExp2) {
      sceneRef.current.fog.color.setHex(targetFogColor);
      sceneRef.current.fog.density = isDark ? 0.007 : 0.005;
    }
    rendererRef.current.setClearColor(targetBgColor);

    if (hemiLightRef.current) {
      hemiLightRef.current.color.setHex(isDark ? 0x475569 : 0x8fa8d6);
      hemiLightRef.current.groundColor.setHex(isDark ? 0x1e293b : 0x4a3f35);
      hemiLightRef.current.intensity = isDark ? 0.55 : 0.75;
    }
  }, [theme]);

  // Main WebGL Scene Initialization - Runs strictly once on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const initialIsDark = themeRef.current === "dark";
    const initialFogColor = initialIsDark ? 0x0f172a : 0xd5e0f2;
    scene.fog = new THREE.FogExp2(initialFogColor, initialIsDark ? 0.007 : 0.005);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(
      CAMERA_PRESETS.initialPosition.x,
      CAMERA_PRESETS.initialPosition.y,
      CAMERA_PRESETS.initialPosition.z
    );
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.4;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setClearColor(initialIsDark ? 0x0b1120 : 0xd5e0f2);
    rendererRef.current = renderer;
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

    // Autopilot flight cancellation on user manual interaction
    const stopAutopilot = () => {
      if (isAnimatingRef.current) {
        isAnimatingRef.current = false;
      }
    };
    renderer.domElement.addEventListener("pointerdown", stopAutopilot);
    renderer.domElement.addEventListener("wheel", stopAutopilot, { passive: true });

    // 6. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x4a5a80, 0.5);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(
      initialIsDark ? 0x475569 : 0x8fa8d6,
      initialIsDark ? 0x1e293b : 0x4a3f35,
      initialIsDark ? 0.55 : 0.75
    );
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.4);
    sunLight.position.set(-60, 50, -110);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.camera.left = -60;
    sunLight.shadow.camera.right = 60;
    sunLight.shadow.camera.top = 60;
    sunLight.shadow.camera.bottom = -60;
    sunLight.shadow.radius = 2.5;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.04;
    scene.add(sunLight);

    // 7. Interactive 3D Beacon Indicator (Floating above selected building roof)
    const beaconGroup = new THREE.Group();
    beaconGroup.visible = false;
    scene.add(beaconGroup);
    beaconGroupRef.current = beaconGroup;

    // Sleek inverted cone marker pointing down at roof
    const coneGeo = new THREE.ConeGeometry(0.7, 1.3, 16);
    coneGeo.rotateX(Math.PI); // Inverted: points down
    const coneMat = new THREE.MeshStandardMaterial({
      color: 0x9c1447, // Kokand University Burgundy
      emissive: 0x9c1447,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.2,
    });
    const beaconCone = new THREE.Mesh(coneGeo, coneMat);
    beaconGroup.add(beaconCone);

    // Subtle orbiting halo ring
    const ringGeo = new THREE.RingGeometry(0.85, 1.15, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x003399, // Kokand University Navy
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const beaconHalo = new THREE.Mesh(ringGeo, ringMat);
    beaconHalo.position.y = 0.4;
    beaconGroup.add(beaconHalo);

    // 8. GLTF Campus Model Loading & High-Fidelity Bounding Box Center Calculation
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

            const matchedKey = findBuildingKeyFromObject(mesh);
            if (matchedKey) {
              if (!buildingMeshesRef.current.has(matchedKey)) {
                buildingMeshesRef.current.set(matchedKey, []);
              }
              buildingMeshesRef.current.get(matchedKey)!.push(mesh);
            }
          }
        });

        // Compute true geometric compound bounding box and center for every building
        (Object.keys(BUILDINGS_DATA) as BuildingKey[]).forEach((key) => {
          const meshes = buildingMeshesRef.current.get(key);
          if (meshes && meshes.length > 0) {
            const compoundBox = new THREE.Box3();
            meshes.forEach((m) => {
              compoundBox.expandByObject(m);
            });
            buildingBoundsRef.current.set(key, compoundBox);

            const center = new THREE.Vector3();
            compoundBox.getCenter(center);
            buildingPositionsRef.current.set(key, center);
          }
        });

        scene.add(model);
        onLoadingProgressRef.current(100);

        // If a building was already selected upon load completion, immediately target it
        const currentActiveKey = selectedBuildingKeyRef.current;
        if (currentActiveKey && buildingPositionsRef.current.has(currentActiveKey)) {
          const pos = buildingPositionsRef.current.get(currentActiveKey)!;
          const info = BUILDINGS_DATA[currentActiveKey];
          if (info) {
            targetLookAtRef.current.copy(pos);
            const offset = info.cameraOffset || { x: 15, y: 13, z: 15 };
            targetCameraPosRef.current.set(pos.x + offset.x, pos.y + offset.y, pos.z + offset.z);
            isAnimatingRef.current = true;
          }
        }
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

    // 9. Standard W3C Pointer Events (Seamless Touch and Mouse Interaction)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };
    let pointerDownTime = 0;

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
      pointerDownTime = Date.now();
    };

    const onPointerMove = (e: PointerEvent) => {
      // Touch drag handles camera navigation; skip expensive hover raycasting on mobile touch move
      if (e.pointerType === "touch") return;

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

    const onPointerUp = (e: PointerEvent) => {
      const deltaX = Math.abs(e.clientX - pointerDownPos.x);
      const deltaY = Math.abs(e.clientY - pointerDownPos.y);
      const duration = Date.now() - pointerDownTime;

      // Allow natural finger contact patch jitter on touchscreens
      const maxDelta = e.pointerType === "touch" ? 18 : 6;
      const maxDuration = e.pointerType === "touch" ? 450 : 350;

      if (deltaX > maxDelta || deltaY > maxDelta || duration > maxDuration) return;

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
        onBuildingSelectRef.current(null);
      }
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);

    // 10. Viewport Resize Handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // 11. Delta-timed Render Loop (High precision timer replacing deprecated THREE.Clock)
    let lastTime = performance.now();
    const startTime = performance.now();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const currentTime = performance.now();
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      const elapsed = (currentTime - startTime) / 1000;

      // Camera flight interpolation with framerate independence
      if (isAnimatingRef.current) {
        const lerpFactor = 1 - Math.exp(-6 * delta);
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

      // Enforce campus exploration boundaries
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

      // Update 3D Beacon Indicator position and hover animation
      const activeKey = selectedBuildingKeyRef.current;
      if (
        activeKey &&
        buildingPositionsRef.current.has(activeKey) &&
        buildingBoundsRef.current.has(activeKey)
      ) {
        const bCenter = buildingPositionsRef.current.get(activeKey)!;
        const bBounds = buildingBoundsRef.current.get(activeKey)!;

        // Elegant floating hover above roof
        const floatY = bBounds.max.y + 1.2 + Math.sin(elapsed * 3) * 0.2;
        beaconGroup.position.set(bCenter.x, floatY, bCenter.z);
        beaconGroup.rotation.y = elapsed * 1.5;
        beaconGroup.visible = true;

        const pulse = 1 + Math.sin(elapsed * 4) * 0.05;
        beaconCone.scale.set(pulse, pulse, pulse);
      } else {
        beaconGroup.visible = false;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 12. Teardown & Resource Disposal
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointerdown", stopAutopilot);
      renderer.domElement.removeEventListener("wheel", stopAutopilot);

      controls.dispose();
      renderer.dispose();

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
      coneGeo.dispose();
      coneMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none"
    />
  );
};
