"use client";

import {useRef} from "react";

// Outer crown and trunk of TreeofUnityPreview.png, in source-image percentages.
// The stage, reflections and surrounding architecture stay outside the target.
const TREE_OUTLINE =
  "M50 8.5 L51.3 10.8 L55.2 11.5 L56.5 13.5 L60.5 16.5 L61.5 19.5 L63.5 21.5 L63.5 25.5 " +
  "L65.5 28.5 L65.4 32.5 L66 35 L65.8 38 L67 41 L66.8 45 L66.8 49.5 " +
  "L65.2 52.7 L64 56 L62 59 L61 61 L57.5 62 L55 64 L53 62.5 " +
  "L51.6 61 L50.8 66 L51.6 71.5 L53.6 75.9 " +
  "Q50 76.5 46.4 75.9 L48.4 71.5 L49.2 66 L48.4 61 " +
  "L46 62 L43.7 63.3 L41.5 61 L39.5 60 L38 58 L36 55 L35 53 L34.4 50 " +
  "L34.4 48 L33.2 45 L33.8 42 L33.4 39 L34.4 36 L34.4 33 L35.4 31 " +
  "L34.5 28 L36.4 24.5 L37.5 20.5 L39.5 18.5 L41.5 14.5 L44 14.5 L45.7 11.5 L49 11.5 Z";

export function TreeHitArea({
  active,
  label,
  onActivate,
}: {
  readonly active: boolean;
  readonly label: string;
  readonly onActivate: () => void;
}) {
  const gesture = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  return (
    <div
      className="tree-hit-plane scene-parallax-plane"
      data-active={active}
      aria-hidden={!active}
    >
      <svg
        className="tree-hit-area"
        data-testid="tree-hit-area"
        viewBox="0 0 2560 1429"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          className="tree-hit-shape"
          data-testid="tree-hit-shape"
          data-scene-surface="true"
          d={TREE_OUTLINE}
          transform="scale(25.6 14.29)"
          role="button"
          aria-label={label}
          tabIndex={active ? 0 : -1}
          onPointerDown={(event) => {
            gesture.current = {
              x: event.clientX,
              y: event.clientY,
              moved: event.button !== 0,
            };
          }}
          onPointerMove={(event) => {
            const start = gesture.current;
            if (
              start &&
              Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8
            )
              start.moved = true;
          }}
          onPointerCancel={() => {
            if (gesture.current) gesture.current.moved = true;
          }}
          onClick={(event) => {
            if (active && (event.detail === 0 || !gesture.current?.moved))
              onActivate();
            gesture.current = null;
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              if (active && !event.repeat) onActivate();
            }
          }}
        />
      </svg>
    </div>
  );
}
