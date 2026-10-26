import React, { useEffect, useRef, useCallback } from "react";
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

/**
 * Generates sky gradient canvas for light or dark mode
 */
const drawSkyGradient = (canvas: HTMLCanvasElement, isDark: boolean) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const gradient = ctx.createLinearGradient(0, 0, 0, 512);
  if (isDark) {
    gradient.addColorStop(0, "#030712");
    gradient.addColorStop(0.35, "#0b1329");
    gradient.addColorStop(0.7, "#0f172a");
    gradient.addColorStop(1, "#1e293b");
  } else {
    gradient.addColorStop(0, "#4a6fa5");
    gradient.addColorStop(0.4, "#8fa8d6");
    gradient.addColorStop(0.7, "#cbd7eb");
    gradient.addColorStop(1, "#ffffff");
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 2, 512);
};

/**
 * Calculates adaptive camera vertical FOV based on screen aspect ratio
 * On desktop (aspect >= 1): standard 45 degrees
 * On mobile portrait (aspect < 1): widens FOV to comfortably encompass campus without horizontal clipping
 */
const getResponsiveFOV = (aspect: number): number => {
  if (aspect < 1) {
    return Math.min(65, 45 + (1 - aspect) * 32);
  }
  return 45;
};

/**
 * Adaptive Pixel Ratio:
 * Mobile (< 768px): clamped to min(DPR, 1.5) to eliminate up to 44% unnecessary fragment fillrate on 3x screens,
 * preventing mobile GPU thermal throttling and ensuring a rock-solid 60fps.
 * Desktop (>= 768px): clamped to min(DPR, 2.0) for crystal-clear fidelity on Retina and high-res screens.
 */
const getTargetPixelRatio = (containerWidth?: number): number => {
  if (typeof window === "undefined") return 1;
  const w = containerWidth ?? window.innerWidth;
  const isMobile = w < 768;
  const maxDpr = isMobile ? 1.5 : 2.0;
  return Math.min(window.devicePixelRatio || 1, maxDpr);
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
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const skyCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const skyTextureRef = useRef<THREE.CanvasTexture | null>(null);

  // Building geometry and bounding references
  const buildingPositionsRef = useRef<Map<BuildingKey, THREE.Vector3>>(new Map());
  const buildingBoundsRef = useRef<Map<BuildingKey, THREE.Box3>>(new Map());
  const buildingMeshesRef = useRef<Map<BuildingKey, THREE.Mesh[]>>(new Map());
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

  // Selection and focus tracking to decouple camera flight from theme toggles
  const prevSelectedKeyTrackingRef = useRef<BuildingKey | null>(null);
  const prevFocusSignalRef = useRef<number>(focusSignal);

  // Synchronized callback refs
  const selectedBuildingKeyRef = useRef(selectedBuildingKey);
  selectedBuildingKeyRef.current = selectedBuildingKey;

  const onBuildingSelectRef = useRef(onBuildingSelect);
  onBuildingSelectRef.current = onBuildingSelect;

  const onLoadingProgressRef = useRef(onLoadingProgress);
  onLoadingProgressRef.current = onLoadingProgress;

  const themeRef = useRef(theme);
  themeRef.current = theme;

  const flyCameraToBuilding = useCallback((key: BuildingKey) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const buildingPos = buildingPositionsRef.current.get(key);
    const buildingInfo = BUILDINGS_DATA[key];
    if (!buildingPos || !buildingInfo) return;

    const isMobile = (containerRef.current?.clientWidth || window.innerWidth) < 640;
    targetLookAtRef.current.set(
      buildingPos.x,
      buildingPos.y - (isMobile ? 1.2 : 0),
      buildingPos.z
    );

    const offset = buildingInfo.cameraOffset || { x: 15, y: 13, z: 15 };
    const distMult = isMobile ? 1.25 : 1.0;
    targetCameraPosRef.current.set(
      buildingPos.x + offset.x * distMult,
      buildingPos.y + offset.y * distMult,
      buildingPos.z + offset.z * distMult
    );
    isAnimatingRef.current = true;
  }, []);

  const flyCameraToBuildingRef = useRef(flyCameraToBuilding);
  flyCameraToBuildingRef.current = flyCameraToBuilding;

  // Handle building selection camera flight (clean architecture without mesh tinting)
  useEffect(() => {
    const keyChanged = selectedBuildingKey !== prevSelectedKeyTrackingRef.current;
    const focusChanged = focusSignal !== prevFocusSignalRef.current;
    prevSelectedKeyTrackingRef.current = selectedBuildingKey;
    prevFocusSignalRef.current = focusSignal;

    // Camera Flight (only trigger when selection key changes or explicit focus is triggered)
    if ((keyChanged || focusChanged) && selectedBuildingKey) {
      flyCameraToBuilding(selectedBuildingKey);
    }
  }, [selectedBuildingKey, focusSignal, flyCameraToBuilding]);

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

    if (skyCanvasRef.current && skyTextureRef.current) {
      drawSkyGradient(skyCanvasRef.current, isDark);
      skyTextureRef.current.needsUpdate = true;
    }

    // Refresh static shadow map on theme lighting change
    rendererRef.current.shadowMap.needsUpdate = true;
  }, [theme]);

  // Main WebGL Scene Initialization - Runs strictly once on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const buildingMeshes = buildingMeshesRef.current;
    const buildingPositions = buildingPositionsRef.current;
    const buildingBounds = buildingBoundsRef.current;

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const initialIsDark = themeRef.current === "dark";
    const initialFogColor = initialIsDark ? 0x0f172a : 0xd5e0f2;
    scene.fog = new THREE.FogExp2(initialFogColor, initialIsDark ? 0.007 : 0.005);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 2. Camera Setup
    const aspect = width / height;
    const camera = new THREE.PerspectiveCamera(getResponsiveFOV(aspect), aspect, 0.1, 1000);
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
    renderer.setPixelRatio(getTargetPixelRatio(width));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.4;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
    renderer.setClearColor(initialIsDark ? 0x0b1120 : 0xd5e0f2);
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 4. Procedural Sky Dome
    const skyCanvas = document.createElement("canvas");
    skyCanvas.width = 2;
    skyCanvas.height = 512;
    skyCanvasRef.current = skyCanvas;
    drawSkyGradient(skyCanvas, initialIsDark);
    const skyTexture = new THREE.CanvasTexture(skyCanvas);
    skyTexture.colorSpace = THREE.SRGBColorSpace;
    skyTextureRef.current = skyTexture;
    const skyGeo = new THREE.SphereGeometry(250, 32, 15);
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTexture,
      side: THREE.BackSide,
      fog: true,
    });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyDome);

    // 5. Orbit Controls with Physics Damping & Ground-aligned Touch Gestures
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.08;
    controls.minPolarAngle = 0.1;
    controls.minDistance = CAMERA_PRESETS.boundaries.minDistance;
    controls.maxDistance = CAMERA_PRESETS.boundaries.maxDistance;
    controls.screenSpacePanning = false; // Panning follows the campus ground plane naturally
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };
    controlsRef.current = controls;

    // Autopilot flight cancellation on user manual interaction
    const stopAutopilot = () => {
      if (isAnimatingRef.current) {
        isAnimatingRef.current = false;
      }
    };
    renderer.domElement.addEventListener("pointerdown", stopAutopilot);
    renderer.domElement.addEventListener("wheel", stopAutopilot, { passive: true });

    // 6. Lighting Setup with Mobile-Adaptive Shadow Resolution
    const isMobileDevice = (container.clientWidth || window.innerWidth) < 768;
    const shadowMapSize = isMobileDevice ? 1024 : 2048;

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
    sunLight.shadow.mapSize.width = shadowMapSize;
    sunLight.shadow.mapSize.height = shadowMapSize;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.camera.left = -60;
    sunLight.shadow.camera.right = 60;
    sunLight.shadow.camera.top = 60;
    sunLight.shadow.camera.bottom = -60;
    sunLight.shadow.radius = isMobileDevice ? 1.5 : 2.5;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.04;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // 7. Interactive 3D Beacon Indicator (Floating above selected building roof)
    // Modern sleek university map pin marker in Kokand Burgundy palette (#9c1447)
    const beaconGroup = new THREE.Group();
    beaconGroup.visible = false;
    scene.add(beaconGroup);
    beaconGroupRef.current = beaconGroup;

    // Subgroup containing the floating/rotating pin marker
    const pinSubgroup = new THREE.Group();
    beaconGroup.add(pinSubgroup);

    // Teardrop pin profile constructed via smooth spline lathe geometry
    const pinCurve = new THREE.SplineCurve([
      new THREE.Vector2(0.01, 0.0),   // Sharp needle tip pointing down
      new THREE.Vector2(0.07, 0.18),  // Slender tapering stem
      new THREE.Vector2(0.18, 0.45),  // Elegant waist transition
      new THREE.Vector2(0.28, 0.70),  // Lower bulb expansion
      new THREE.Vector2(0.33, 0.85),  // Teardrop bulb equator
      new THREE.Vector2(0.29, 1.00),  // Upper dome curvature
      new THREE.Vector2(0.16, 1.10),  // Nearing crown
      new THREE.Vector2(0.001, 1.14), // Rounded crown apex
    ]);
    const pinPoints = pinCurve.getPoints(32);
    const pinGeo = new THREE.LatheGeometry(pinPoints, 32);
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0x9c1447, // Kokand University Burgundy
      emissive: 0x9c1447,
      emissiveIntensity: 0.22,
      roughness: 0.25,
      metalness: 0.2,
    });
    const pinMesh = new THREE.Mesh(pinGeo, pinMat);
    pinMesh.raycast = () => {};
    pinMesh.castShadow = false;
    pinMesh.receiveShadow = false;
    pinSubgroup.add(pinMesh);

    // Subtle white platinum accent ring encircling the teardrop head
    const accentRingGeo = new THREE.TorusGeometry(0.33, 0.016, 16, 32);
    accentRingGeo.rotateX(Math.PI / 2);
    const accentRingMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.15,
      roughness: 0.2,
      metalness: 0.4,
    });
    const accentRing = new THREE.Mesh(accentRingGeo, accentRingMat);
    accentRing.position.y = 0.85; // Aligned with bulb equator
    accentRing.raycast = () => {};
    accentRing.castShadow = false;
    accentRing.receiveShadow = false;
    pinSubgroup.add(accentRing);

    // Dynamic ground pulse ring expanding on building roof surface
    const pulseRingGeo = new THREE.RingGeometry(0.35, 0.60, 40);
    pulseRingGeo.rotateX(-Math.PI / 2);
    const pulseRingMat = new THREE.MeshBasicMaterial({
      color: 0x9c1447, // Kokand University Burgundy
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    const pulseRing = new THREE.Mesh(pulseRingGeo, pulseRingMat);
    pulseRing.position.y = 0.03; // Skimming just above roof surface
    pulseRing.raycast = () => {};
    pulseRing.castShadow = false;
    pulseRing.receiveShadow = false;
    beaconGroup.add(pulseRing);

    // Precise focal dot on the roof at the pin target point
    const focalDotGeo = new THREE.CircleGeometry(0.12, 24);
    focalDotGeo.rotateX(-Math.PI / 2);
    const focalDotMat = new THREE.MeshBasicMaterial({
      color: 0x9c1447,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });
    const focalDot = new THREE.Mesh(focalDotGeo, focalDotMat);
    focalDot.position.y = 0.02;
    focalDot.raycast = () => {};
    focalDot.castShadow = false;
    focalDot.receiveShadow = false;
    beaconGroup.add(focalDot);

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
        renderer.shadowMap.needsUpdate = true;
        onLoadingProgressRef.current(100);

        // If a building was already selected upon load completion, immediately target it
        const currentActiveKey = selectedBuildingKeyRef.current;
        if (currentActiveKey && buildingPositionsRef.current.has(currentActiveKey)) {
          flyCameraToBuildingRef.current(currentActiveKey);
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
    let isPointerDown = false;
    let activePointerId: number | null = null;

    const onPointerDown = (e: PointerEvent) => {
      // Multi-touch guard: if a second finger touches down (pinch/pan gesture), cancel tap selection
      if (activePointerId !== null && activePointerId !== e.pointerId) {
        isPointerDown = false;
        activePointerId = null;
        return;
      }
      activePointerId = e.pointerId;
      pointerDownPos = { x: e.clientX, y: e.clientY };
      pointerDownTime = performance.now();
      isPointerDown = true;
    };

    const onPointerCancel = (e: PointerEvent) => {
      if (e.pointerId === activePointerId) {
        isPointerDown = false;
        activePointerId = null;
      }
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
      if (!isPointerDown || e.pointerId !== activePointerId) return;
      isPointerDown = false;
      activePointerId = null;

      const deltaX = Math.abs(e.clientX - pointerDownPos.x);
      const deltaY = Math.abs(e.clientY - pointerDownPos.y);
      const duration = performance.now() - pointerDownTime;

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
    renderer.domElement.addEventListener("pointercancel", onPointerCancel);

    // 10. Viewport Resize Handler (Supporting Window & Mobile VisualViewport)
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      const asp = w / h;
      camera.aspect = asp;
      camera.fov = getResponsiveFOV(asp);
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(getTargetPixelRatio(w));
      renderer.setSize(w, h);

      // Adaptive shadow map resolution on viewport change
      if (sunLightRef.current) {
        const isMob = w < 768;
        const targetShadowSize = isMob ? 1024 : 2048;
        if (sunLightRef.current.shadow.mapSize.width !== targetShadowSize) {
          sunLightRef.current.shadow.mapSize.width = targetShadowSize;
          sunLightRef.current.shadow.mapSize.height = targetShadowSize;
          sunLightRef.current.shadow.radius = isMob ? 1.5 : 2.5;
          if (sunLightRef.current.shadow.map) {
            sunLightRef.current.shadow.map.dispose();
            sunLightRef.current.shadow.map = null;
          }
          sunLightRef.current.shadow.needsUpdate = true;
          renderer.shadowMap.needsUpdate = true;
        }
      }
    };
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);

    // 11. Delta-timed Render Loop & Tab Visibility Management
    let lastTime = performance.now();
    const startTime = performance.now();
    let animId: number;
    let isTabVisible = typeof document !== "undefined" ? !document.hidden : true;

    const animate = () => {
      if (!isTabVisible) return;
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

        // Position beacon anchor on top of the building roof
        const roofY = bBounds.max.y;
        beaconGroup.position.set(bCenter.x, roofY, bCenter.z);
        beaconGroup.visible = true;

        // Elegant floating animation of the pin marker
        const floatY = 0.55 + Math.sin(elapsed * 2.4) * 0.12;
        pinSubgroup.position.y = floatY;
        pinSubgroup.rotation.y = elapsed * 1.2;

        // Smooth continuous pulse ripple expanding on the roof
        const pulseProgress = (elapsed * 0.9) % 1;
        const pulseScale = 0.7 + pulseProgress * 1.5;
        pulseRing.scale.set(pulseScale, pulseScale, pulseScale);
        pulseRingMat.opacity = Math.max(0, 0.6 * (1 - pulseProgress));
      } else {
        beaconGroup.visible = false;
      }

      renderer.render(scene, camera);
    };

    // Pause RAF rendering when tab is inactive to preserve CPU & mobile GPU battery
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isTabVisible = false;
        cancelAnimationFrame(animId);
      } else {
        if (!isTabVisible) {
          isTabVisible = true;
          lastTime = performance.now();
          animId = requestAnimationFrame(animate);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    animate();

    // 12. Teardown & Deep GPU Resource Disposal
    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointercancel", onPointerCancel);
      renderer.domElement.removeEventListener("pointerdown", stopAutopilot);
      renderer.domElement.removeEventListener("wheel", stopAutopilot);

      controls.dispose();

      const disposeMaterial = (mat: THREE.Material) => {
        const std = mat as THREE.MeshStandardMaterial;
        std.map?.dispose();
        std.normalMap?.dispose();
        std.roughnessMap?.dispose();
        std.metalnessMap?.dispose();
        std.emissiveMap?.dispose();
        std.aoMap?.dispose();
        std.alphaMap?.dispose();
        mat.dispose();
      };

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(disposeMaterial);
          } else if (mesh.material) {
            disposeMaterial(mesh.material);
          }
        }
      });

      if (sunLightRef.current?.shadow.map) {
        sunLightRef.current.shadow.map.dispose();
        sunLightRef.current.shadow.map = null;
      }

      skyTexture.dispose();
      skyGeo.dispose();
      skyMat.dispose();
      pinGeo.dispose();
      pinMat.dispose();
      accentRingGeo.dispose();
      accentRingMat.dispose();
      pulseRingGeo.dispose();
      pulseRingMat.dispose();
      focalDotGeo.dispose();
      focalDotMat.dispose();

      renderer.dispose();

      // Clear Map collections to avoid retaining meshes/vectors in memory
      buildingMeshes.clear();
      buildingPositions.clear();
      buildingBounds.clear();

      // Reset core object references
      sceneRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
      rendererRef.current = null;
      sunLightRef.current = null;
      hemiLightRef.current = null;
      skyCanvasRef.current = null;
      skyTextureRef.current = null;
      beaconGroupRef.current = null;

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none touch-none"
    />
  );
};
