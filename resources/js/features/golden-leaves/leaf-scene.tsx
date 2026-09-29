"use client";

import {useEffect, useRef} from "react";
import type {Group, Mesh, MeshStandardMaterial, WebGLRenderer} from "three";

import {disposeTreeObject} from "@/features/home/tree-scene-utils";

export interface LeafSceneProps {
  modelUrl?: string;
  variant?: "hero" | "detail";
  reducedMotion: boolean;
  onReady?: () => void;
  onError?: () => void;
}

const INTRO_DURATION = 2400;

/** The original leaf geometry and texture maps, lit as a small studio object. */
export function LeafScene({
  modelUrl = "/media/tou/leaf-web.glb",
  variant = "hero",
  reducedMotion,
  onReady,
  onError,
}: LeafSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const callbacks = useRef({ onReady, onError });
  const reduced = useRef(reducedMotion);
  const runtime = useRef<{ sync: () => void } | null>(null);

  useEffect(() => {
    callbacks.current = { onReady, onError };
  }, [onReady, onError]);

  useEffect(() => {
    reduced.current = reducedMotion;
    runtime.current?.sync();
  }, [reducedMotion]);

  useEffect(() => {
    const host = hostRef.current;
    const status = statusRef.current;
    if (!host || !status) return;

    const controller = new AbortController();
    let disposed = false;
    let failed = false;
    let initialized = false;
    let visible = false;
    let frame: number | null = null;
    let renderer: WebGLRenderer | undefined;
    let model: Group | undefined;
    let cleanupScene: (() => void) | undefined;
    let syncActivity: (() => void) | undefined;

    host.dataset.state = "loading";
    host.dataset.intro = "waiting";
    status.textContent = "";
    status.style.display = "block";

    const cancelFrame = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
    };
    const release = () => {
      cancelFrame();
      controller.abort();
      cleanupScene?.();
      cleanupScene = undefined;
      if (model) disposeTreeObject(model);
      model = undefined;
      if (renderer) {
        renderer.domElement.remove();
        renderer.dispose();
        renderer.forceContextLoss();
      }
      renderer = undefined;
      runtime.current = null;
    };
    const fail = () => {
      if (disposed || failed) return;
      failed = true;
      release();
      host.dataset.state = "error";
      host.dataset.intro = "complete";
      status.style.display = "block";
      status.textContent = "3D leaf is unavailable.";
      callbacks.current.onError?.();
    };

    const initialize = async () => {
      if (initialized || disposed) return;
      initialized = true;
      try {
        const [THREE, { GLTFLoader }, { RoomEnvironment }, data] =
          await Promise.all([
            import("three"),
            import("three/addons/loaders/GLTFLoader.js"),
            import("three/addons/environments/RoomEnvironment.js"),
            fetch(modelUrl, { signal: controller.signal }).then((response) => {
              if (!response.ok) throw new Error("Leaf model unavailable");
              return response.arrayBuffer();
            }),
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
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: mobile ? "low-power" : "high-performance",
        });
        renderer.setClearColor(0xf5f5f5, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        const canvas = renderer.domElement;
        canvas.setAttribute("aria-hidden", "true");
        canvas.style.cssText =
          "display:block;position:absolute;inset:0;width:100%;height:100%;visibility:hidden;touch-action:pan-y;";
        host.appendChild(canvas);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(32, 1, 0.001, 100);
        const pivot = new THREE.Group();
        scene.add(pivot);
        const bounds = new THREE.Box3().setFromObject(model);
        const dimensions = bounds.getSize(new THREE.Vector3());
        model.position.sub(bounds.getCenter(new THREE.Vector3()));
        pivot.add(model);

        const materials = new Set<MeshStandardMaterial>();
        model.traverse((object) => {
          const mesh = object as Mesh;
          if (!mesh.isMesh) return;
          for (const material of Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material]) {
            const standard = material as MeshStandardMaterial;
            if (!standard.isMeshStandardMaterial || materials.has(standard))
              continue;
            materials.add(standard);
            // Retain the supplied colour, normal and metal/roughness maps.
            standard.envMapIntensity = 1.2;
          }
        });

        const room = new RoomEnvironment();
        const pmrem = new THREE.PMREMGenerator(renderer);
        const environment = pmrem.fromScene(room, 0.035);
        room.dispose();
        pmrem.dispose();
        scene.environment = environment.texture;
        scene.environmentIntensity = 1.1;
        const key = new THREE.DirectionalLight(0xffefd5, 3.2);
        key.position.set(3, 5, 5);
        const rim = new THREE.DirectionalLight(0xf0f4ff, 2.4);
        rim.position.set(-3, 2, -3);
        scene.add(key, rim, new THREE.HemisphereLight(0xffffff, 0x8a7966, 1.3));

        const baseYaw = variant === "hero" ? -0.18 : 0.45;
        const baseTilt = variant === "hero" ? -0.04 : -0.08;
        let yaw = baseYaw;
        let tilt = baseTilt;
        let targetYaw = yaw;
        let composedTargetYaw = yaw;
        let targetTilt = tilt;
        let elapsed =
          reduced.current || variant === "detail" ? INTRO_DURATION : 0;
        let lastTime: number | null = null;
        let readyDelivered = false;
        let hasSize = false;
        let dragging: { id: number; x: number; y: number } | null = null;

        const canRender = () =>
          !disposed && !failed && visible && !document.hidden && hasSize;
        const requestFrame = () => {
          if (frame === null && canRender())
            frame = requestAnimationFrame(renderFrame);
        };

        const renderFrame = (time: number) => {
          frame = null;
          if (!canRender() || !renderer) return;
          try {
            if (reduced.current) elapsed = INTRO_DURATION;
            const delta = lastTime === null ? 0 : Math.min(time - lastTime, 64);
            lastTime = time;
            elapsed = Math.min(INTRO_DURATION, elapsed + delta);
            const progress = elapsed / INTRO_DURATION;
            const eased = 1 - (1 - progress) ** 3;
            if (progress < 1) {
              // One complete revolution, never an idle/looping spin.
              pivot.rotation.set(
                baseTilt,
                baseYaw - Math.PI * 2 * (1 - eased),
                -0.035,
              );
              pivot.scale.setScalar(0.5 + eased * 0.5);
              host.dataset.intro = "playing";
            } else {
              const easing = reduced.current ? 1 : 0.16;
              let scrollYaw = 0;
              if (variant === "detail" && !reduced.current) {
                const bounds = host.getBoundingClientRect();
                const progress = Math.max(
                  0,
                  Math.min(
                    1,
                    (window.innerHeight - bounds.top) /
                      (window.innerHeight + bounds.height),
                  ),
                );
                scrollYaw = (progress - 0.5) * 1.1;
              }
              // Scroll adds a small studio turn to the user's drag angle;
              // a later scroll never resets their chosen view.
              composedTargetYaw = targetYaw + scrollYaw;
              yaw += (composedTargetYaw - yaw) * easing;
              tilt += (targetTilt - tilt) * easing;
              pivot.rotation.set(tilt, yaw, -0.035);
              pivot.scale.setScalar(1);
              host.dataset.intro = "complete";
            }
            host.dataset.rotationY = pivot.rotation.y.toFixed(4);
            renderer.render(scene, camera);
            if (renderer.getContext().isContextLost()) {
              fail();
              return;
            }
            canvas.style.visibility = "visible";
            if (!readyDelivered) {
              readyDelivered = true;
              host.dataset.state = "ready";
              status.style.display = "none";
              callbacks.current.onReady?.();
            }
            if (
              progress < 1 ||
              Math.abs(composedTargetYaw - yaw) > 0.0001 ||
              Math.abs(targetTilt - tilt) > 0.0001
            ) {
              requestFrame();
            }
          } catch {
            fail();
          }
        };

        const resize = () => {
          if (!renderer || disposed || failed) return;
          const { width, height } = host.getBoundingClientRect();
          hasSize = width > 0 && height > 0;
          if (!hasSize) return;
          camera.aspect = width / height;
          const halfFov = (camera.fov * Math.PI) / 360;
          const distance =
            Math.max(
              dimensions.y / (2 * Math.tan(halfFov) * 0.73),
              dimensions.x / (2 * Math.tan(halfFov) * camera.aspect * 0.73),
            ) + dimensions.z;
          camera.near = Math.max(dimensions.y / 1000, 0.0001);
          camera.far = distance * 20;
          camera.position.set(0, 0, distance);
          camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix();
          renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, mobile ? 1.5 : 2),
          );
          renderer.setSize(width, height, false);
          requestFrame();
        };
        syncActivity = () => {
          lastTime = null;
          if (!canRender()) cancelFrame();
          else requestFrame();
        };
        runtime.current = { sync: syncActivity };

        const pointerDown = (event: PointerEvent) => {
          if (elapsed < INTRO_DURATION || event.button !== 0) return;
          dragging = {
            id: event.pointerId,
            x: event.clientX,
            y: event.clientY,
          };
          canvas.setPointerCapture(event.pointerId);
          host.dataset.dragging = "true";
        };
        const pointerMove = (event: PointerEvent) => {
          if (!dragging || dragging.id !== event.pointerId) return;
          targetYaw += (event.clientX - dragging.x) * 0.009;
          targetTilt = Math.max(
            -0.32,
            Math.min(0.32, targetTilt + (event.clientY - dragging.y) * 0.003),
          );
          dragging.x = event.clientX;
          dragging.y = event.clientY;
          requestFrame();
        };
        const pointerUp = (event: PointerEvent) => {
          if (!dragging || dragging.id !== event.pointerId) return;
          dragging = null;
          host.dataset.dragging = "false";
          if (canvas.hasPointerCapture(event.pointerId))
            canvas.releasePointerCapture(event.pointerId);
        };
        const contextLost = (event: Event) => {
          event.preventDefault();
          fail();
        };
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);
        canvas.addEventListener("pointerdown", pointerDown);
        canvas.addEventListener("pointermove", pointerMove);
        canvas.addEventListener("pointerup", pointerUp);
        canvas.addEventListener("pointercancel", pointerUp);
        canvas.addEventListener("webglcontextlost", contextLost);
        document.addEventListener("visibilitychange", syncActivity);
        if (variant === "detail") {
          window.addEventListener("scroll", requestFrame, { passive: true });
        }
        cleanupScene = () => {
          resizeObserver.disconnect();
          canvas.removeEventListener("pointerdown", pointerDown);
          canvas.removeEventListener("pointermove", pointerMove);
          canvas.removeEventListener("pointerup", pointerUp);
          canvas.removeEventListener("pointercancel", pointerUp);
          canvas.removeEventListener("webglcontextlost", contextLost);
          if (syncActivity)
            document.removeEventListener("visibilitychange", syncActivity);
          window.removeEventListener("scroll", requestFrame);
          environment.dispose();
          scene.environment = null;
          scene.clear();
        };
        resize();
        syncActivity();
      } catch {
        if (!disposed && !controller.signal.aborted) fail();
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      if (visible) void initialize();
      syncActivity?.();
    });
    observer.observe(host);
    return () => {
      disposed = true;
      observer.disconnect();
      release();
    };
  }, [modelUrl, variant]);

  return (
    <div
      ref={hostRef}
      className="leaf-scene"
      data-leaf-scene={variant}
      data-state="loading"
      data-intro="waiting"
      role="img"
      aria-label="Golden Leaf in three dimensions"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <span
        ref={statusRef}
        aria-live="polite"
        style={{
          position: "absolute",
          top: "50%",
          width: "100%",
          textAlign: "center",
          fontSize: "12px",
          color: "#706c63",
        }}
      />
    </div>
  );
}

export default LeafScene;
