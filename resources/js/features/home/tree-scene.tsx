"use client";

import {useEffect, useRef} from "react";
import type {Group, InstancedMesh, Mesh, MeshStandardMaterial, WebGLRenderer, WebGLRenderTarget,} from "three";

import {disposeTreeObject, getTreeCameraFit,} from "@/features/home/tree-scene-utils";

export interface TreeSceneProps {
  modelUrl: string;
  active: boolean;
  onReady: () => void;
  onError: (message: string) => void;
}

const BACKGROUND = "#F5F5F5";

/** Technical scene only. The Home controller owns its reveal and navigation. */
export function TreeScene({
  modelUrl,
  active,
  onReady,
  onError,
}: TreeSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const callbacksRef = useRef({ onReady, onError });
  const activeRef = useRef(active);
  const runtimeRef = useRef<{ syncActivity: () => void } | null>(null);

  useEffect(() => {
    callbacksRef.current = { onReady, onError };
  }, [onReady, onError]);

  useEffect(() => {
    activeRef.current = active;
    runtimeRef.current?.syncActivity();
  }, [active]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const abortController = new AbortController();
    let disposed = false;
    let failed = false;
    let readyDelivered = false;
    let frame: number | null = null;
    let renderer: WebGLRenderer | undefined;
    let model: Group | undefined;
    let releaseRuntime: (() => void) | undefined;

    const cancelFrame = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
    };

    const release = () => {
      cancelFrame();
      abortController.abort();
      runtimeRef.current = null;
      releaseRuntime?.();
      releaseRuntime = undefined;
      if (model) disposeTreeObject(model);
      model = undefined;
      if (renderer) {
        renderer.domElement.remove();
        renderer.dispose();
        renderer.forceContextLoss();
      }
      renderer = undefined;
    };

    const fail = (message: string) => {
      if (disposed || failed) return;
      failed = true;
      release();
      callbacksRef.current.onError(message);
    };

    const initialize = async () => {
      try {
        // These chunks and the GLB are requested only when TreeScene is mounted.
        const [
          THREE,
          { GLTFLoader },
          { OrbitControls },
          { RoomEnvironment },
          data,
        ] = await Promise.all([
          import("three"),
          import("three/addons/loaders/GLTFLoader.js"),
          import("three/addons/controls/OrbitControls.js"),
          import("three/addons/environments/RoomEnvironment.js"),
          fetch(modelUrl, { signal: abortController.signal }).then(
            async (response) => {
              if (!response.ok) {
                throw new Error(
                  `3D model request failed (${response.status}).`,
                );
              }
              return response.arrayBuffer();
            },
          ),
        ]);
        if (disposed || failed) return;

        const assetBase = new URL(".", new URL(modelUrl, window.location.href))
          .href;
        const gltf = await new GLTFLoader().parseAsync(data, assetBase);
        if (disposed || failed) {
          disposeTreeObject(gltf.scene);
          return;
        }
        model = gltf.scene;

        const mobile = window.matchMedia("(max-width: 768px)").matches;
        const motionPreference = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        );
        renderer = new THREE.WebGLRenderer({
          alpha: false,
          antialias: !mobile,
          powerPreference: mobile ? "low-power" : "high-performance",
        });
        const canvas = renderer.domElement;
        canvas.setAttribute("aria-hidden", "true");
        canvas.style.cssText =
          "display:block;width:100%;height:100%;visibility:hidden;";
        renderer.setClearColor(BACKGROUND, 1);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1;
        renderer.setPixelRatio(
          mobile ? 1 : Math.min(window.devicePixelRatio, 1.5),
        );
        host.appendChild(canvas);

        const scene = new THREE.Scene();
        // A solid Color uses the clear buffer and bypasses ACES tone mapping.
        scene.background = new THREE.Color(BACKGROUND);
        const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 1000);
        const controls = new OrbitControls(camera, canvas);
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.autoRotate = false;
        controls.enableDamping = !motionPreference.matches;
        controls.dampingFactor = 0.085;
        controls.rotateSpeed = 0.45;
        controls.minPolarAngle = Math.PI * 0.08;
        // The centered tree's base is below target.y; never orbit below target.
        controls.maxPolarAngle = Math.PI / 2;
        controls.minAzimuthAngle = -Infinity;
        controls.maxAzimuthAngle = Infinity;
        controls.target.set(0, 0, 0);

        // Register cleanup before environment compilation or GPU uploads can fail.
        let environment: WebGLRenderTarget | undefined;
        let pmrem: InstanceType<typeof THREE.PMREMGenerator> | undefined;
        let room: InstanceType<typeof RoomEnvironment> | undefined;
        let resizeObserver: ResizeObserver | undefined;
        let removeListeners: (() => void) | undefined;
        releaseRuntime = () => {
          resizeObserver?.disconnect();
          resizeObserver = undefined;
          removeListeners?.();
          removeListeners = undefined;
          controls.dispose();
          environment?.dispose();
          environment = undefined;
          pmrem?.dispose();
          room?.dispose();
          scene.environment = null;
          scene.clear();
        };

        room = new RoomEnvironment();
        pmrem = new THREE.PMREMGenerator(renderer);
        environment = pmrem.fromScene(room, 0.04);
        scene.environment = environment.texture;
        scene.environmentIntensity = 0.75;
        room.dispose();
        room = undefined;
        pmrem.dispose();
        pmrem = undefined;

        scene.add(new THREE.HemisphereLight(0xfff6e3, 0x796e60, 1.3));
        const key = new THREE.DirectionalLight(0xffebc9, 3);
        key.position.set(4, 6, 5);
        const fill = new THREE.DirectionalLight(0xe5edff, 1.4);
        fill.position.set(-4, 2, -3);
        scene.add(key, fill);

        const treatedMaterials = new Set<MeshStandardMaterial>();
        model.traverse((object) => {
          const mesh = object as Mesh;
          if (!mesh.isMesh) return;
          const instance = object as InstancedMesh;
          if (instance.isInstancedMesh) instance.computeBoundingBox();
          const materials = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          for (const material of materials) {
            const standard = material as MeshStandardMaterial;
            if (
              !standard.isMeshStandardMaterial ||
              treatedMaterials.has(standard)
            ) {
              continue;
            }
            treatedMaterials.add(standard);
            standard.color.set(
              mesh.name.toLowerCase().includes("trunk") ? 0xb2864b : 0xd4af66,
            );
            standard.metalness = 0.9;
            standard.roughness = Math.max(
              0.26,
              Math.min(standard.roughness, 0.42),
            );
            standard.envMapIntensity = 0.9;
            standard.needsUpdate = true;
          }
        });
        model.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(model);
        const dimensions = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        model.position.sub(center);
        scene.add(model);

        let hasSize = false;
        let cameraFitted = false;
        const canRender = () =>
          !disposed &&
          !failed &&
          !document.hidden &&
          hasSize &&
          (activeRef.current || !readyDelivered);

        const requestFrame = () => {
          if (frame === null && canRender()) {
            frame = requestAnimationFrame(renderFrame);
          }
        };

        function renderFrame() {
          frame = null;
          if (!canRender() || !renderer) return;
          try {
            controls.update();
            renderer.render(scene, camera);
            if (renderer.getContext().isContextLost()) {
              fail("The 3D graphics context was lost.");
              return;
            }
            canvas.style.visibility = "visible";
            if (!readyDelivered) {
              // The covering transition may open only after a real render.
              readyDelivered = true;
              callbacksRef.current.onReady();
            }
          } catch {
            fail("The 3D scene could not be rendered.");
          }
        }

        const resize = () => {
          if (!renderer || disposed || failed) return;
          const { width, height } = host.getBoundingClientRect();
          hasSize = width > 0 && height > 0;
          if (!hasSize) return;
          try {
            const fit = getTreeCameraFit(
              {
                width: dimensions.x,
                height: dimensions.y,
                depth: dimensions.z,
              },
              width / height,
              camera.fov,
            );
            camera.aspect = width / height;
            camera.near = fit.near;
            camera.far = fit.far;
            if (cameraFitted) {
              camera.position
                .sub(controls.target)
                .normalize()
                .multiplyScalar(fit.distance)
                .add(controls.target);
            } else {
              camera.position.set(0, dimensions.y * 0.015, fit.distance);
              cameraFitted = true;
            }
            camera.updateProjectionMatrix();
            renderer.setPixelRatio(
              window.matchMedia("(max-width: 768px)").matches
                ? 1
                : Math.min(window.devicePixelRatio, 1.5),
            );
            renderer.setSize(width, height, false);
            requestFrame();
          } catch {
            fail("The 3D model could not be fitted to this screen.");
          }
        };

        const syncActivity = () => {
          controls.enabled = activeRef.current && !document.hidden;
          if (!canRender()) cancelFrame();
          else requestFrame();
        };
        const onMotionChange = () => {
          controls.enableDamping = !motionPreference.matches;
          requestFrame();
        };
        const onContextLost = (event: Event) => {
          event.preventDefault();
          fail("The 3D graphics context was lost.");
        };
        controls.addEventListener("change", requestFrame);
        canvas.addEventListener("webglcontextlost", onContextLost);
        document.addEventListener("visibilitychange", syncActivity);
        motionPreference.addEventListener("change", onMotionChange);
        window.addEventListener("resize", resize);
        removeListeners = () => {
          controls.removeEventListener("change", requestFrame);
          canvas.removeEventListener("webglcontextlost", onContextLost);
          document.removeEventListener("visibilitychange", syncActivity);
          motionPreference.removeEventListener("change", onMotionChange);
          window.removeEventListener("resize", resize);
        };
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);
        runtimeRef.current = { syncActivity };
        resize();
        syncActivity();
      } catch (error) {
        if (disposed || abortController.signal.aborted) return;
        fail(
          error instanceof Error && error.message.startsWith("3D model request")
            ? error.message
            : "The 3D scene could not be loaded on this device.",
        );
      }
    };

    void initialize();
    return () => {
      disposed = true;
      release();
    };
  }, [modelUrl]);

  return (
    <div
      ref={hostRef}
      data-tree-scene=""
      data-active={active}
      role="img"
      aria-label="Tree of Unity sculpture in three dimensions"
      aria-hidden={!active}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: BACKGROUND,
      }}
    />
  );
}

export default TreeScene;
