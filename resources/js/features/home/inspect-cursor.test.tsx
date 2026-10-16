import {act, cleanup, fireEvent, render, screen,} from "@testing-library/react";
import {createRef} from "react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {InspectCursor} from "./inspect-cursor";

let frames: Map<number, FrameRequestCallback>;
let frameId: number;
let now: number;
let hidden: boolean;
let physicalHit: Element | null;
let preference: EventTarget & { matches: boolean };
let originalHitTest: PropertyDescriptor | undefined;

beforeEach(() => {
  frames = new Map();
  frameId = 0;
  now = 0;
  hidden = false;
  physicalHit = null;
  preference = Object.assign(new EventTarget(), { matches: true });
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => preference),
  );
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((callback: FrameRequestCallback) => {
      frames.set(++frameId, callback);
      return frameId;
    }),
  );
  vi.stubGlobal(
    "cancelAnimationFrame",
    vi.fn((id: number) => frames.delete(id)),
  );
  vi.spyOn(performance, "now").mockImplementation(() => now);
  vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
  originalHitTest = Object.getOwnPropertyDescriptor(
    document,
    "elementFromPoint",
  );
  Object.defineProperty(document, "elementFromPoint", {
    configurable: true,
    value: vi.fn(() => physicalHit),
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  if (originalHitTest)
    Object.defineProperty(document, "elementFromPoint", originalHitTest);
  else Reflect.deleteProperty(document, "elementFromPoint");
});

function advanceFrame(milliseconds: number) {
  now += milliseconds;
  const scheduled = [...frames.values()];
  frames.clear();
  act(() => {
    for (const callback of scheduled) callback(now);
  });
}

function pointer(
  type: string,
  target: Element,
  overrides: PointerEventInit = {},
  hit: Element | null = target,
) {
  physicalHit = hit;
  const event = new Event(type, { bubbles: true, cancelable: true });
  const properties = {
    pointerType: "mouse",
    pointerId: 1,
    clientX: 100,
    clientY: 200,
    button: 0,
    buttons: 0,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    relatedTarget: null,
    ...overrides,
  };
  for (const [name, value] of Object.entries(properties)) {
    Object.defineProperty(event, name, { value });
  }
  fireEvent(target, event);
  return event;
}

function setup(reducedMotion = false) {
  const regionRef = createRef<HTMLElement>();
  const rendered = render(
    <section ref={regionRef} data-phase="interactive">
      <header data-testid="inspect-test-header">
        <button>Menu</button>
      </header>
      <div data-tree-scene>
        <canvas data-testid="inspect-test-canvas" />
      </div>
      <button>Sound</button>
      <div className="language-options" data-testid="inspect-test-language">
        Language
      </div>
      <InspectCursor regionRef={regionRef} reducedMotion={reducedMotion} />
    </section>,
  );
  const cursor = screen.getByTestId("inspect-cursor");
  const ring = cursor.querySelector<HTMLElement>(".inspect-cursor__ring")!;
  return {
    ...rendered,
    region: regionRef.current!,
    cursor,
    ring,
    canvas: screen.getByTestId("inspect-test-canvas"),
  };
}

describe("inspect cursor", () => {
  it("shows an empty decorative ring at the first mouse point and then follows with eased lag", () => {
    const { cursor, canvas, region } = setup();
    expect(cursor).toHaveAttribute("aria-hidden", "true");
    expect(cursor).toHaveAttribute("data-visible", "false");
    expect(cursor.textContent).toBe("");
    expect(cursor.querySelector("svg")).toBeNull();
    expect(cursor).not.toHaveAttribute("data-progress");

    pointer("pointermove", canvas);
    expect(cursor.style.transform).toBe("translate3d(68px, 168px, 0)");
    expect(region.dataset.inspectCursorVisible).toBe("true");
    pointer("pointermove", canvas, { clientX: 200 });
    expect(cursor.style.transform).toBe("translate3d(68px, 168px, 0)");
    advanceFrame(100);
    const x = parseFloat(cursor.style.transform.slice("translate3d(".length));
    expect(x).toBeCloseTo(68 + 100 * (1 - Math.exp(-1)), 5);
    advanceFrame(2_000);
    expect(cursor.style.transform).toBe("translate3d(168px, 168px, 0)");
    expect(frames.size).toBe(0);
  });

  it("snaps position and exposes immediate scale styling for reduced motion", () => {
    const { cursor, canvas, ring } = setup(true);
    pointer("pointermove", canvas);
    pointer("pointermove", canvas, { clientX: 240 });
    expect(cursor.style.transform).toBe("translate3d(208px, 168px, 0)");
    expect(cursor).toHaveAttribute("data-reduced-motion", "true");
    pointer("pointerdown", canvas, { buttons: 1 });
    pointer("pointermove", canvas, { clientX: 120, buttons: 1 });
    expect(ring.style.transform).toBe("scale(0.78)");
    pointer("pointerup", canvas);
    expect(ring.style.transform).toBe("scale(1)");
    expect(frames.size).toBe(0);
  });

  it("shrinks only after a left canvas drag and leaves native canvas input untouched", () => {
    const { cursor, canvas, ring } = setup();
    const received = vi.fn();
    canvas.addEventListener("pointerdown", received);
    canvas.addEventListener("pointermove", received);
    const down = pointer("pointerdown", canvas, { buttons: 1 });
    expect(cursor).toHaveAttribute("data-dragging", "false");
    pointer("pointermove", canvas, { clientX: 102, buttons: 1 });
    expect(cursor).toHaveAttribute("data-dragging", "false");
    const moved = pointer("pointermove", canvas, { clientX: 120, buttons: 1 });
    expect(cursor).toHaveAttribute("data-dragging", "true");
    expect(ring.style.transform).toBe("scale(0.78)");
    expect(received).toHaveBeenCalledTimes(3);
    expect(down.defaultPrevented).toBe(false);
    expect(moved.defaultPrevented).toBe(false);
    pointer("pointerup", canvas);
    expect(cursor).toHaveAttribute("data-dragging", "false");
    expect(ring.style.transform).toBe("scale(1)");
  });

  it.each([
    { button: 1, buttons: 4 },
    { button: 2, buttons: 2 },
    { button: 0, buttons: 1, ctrlKey: true },
    { button: 0, buttons: 1, metaKey: true },
    { button: 0, buttons: 1, shiftKey: true },
  ])("does not shrink for a non-rotation gesture %j", (gesture) => {
    const { cursor, canvas } = setup();
    pointer("pointerdown", canvas, gesture);
    pointer("pointermove", canvas, { ...gesture, clientX: 150 });
    expect(cursor).toHaveAttribute("data-dragging", "false");
  });

  it("uses physical hit-testing for captured moves over controls and outside the region", () => {
    const { cursor, canvas, region } = setup();
    pointer("pointerdown", canvas, { buttons: 1 });
    pointer("pointermove", canvas, { clientX: 120, buttons: 1 });
    const button = screen.getByRole("button", { name: "Sound" });
    pointer("pointermove", canvas, { clientX: 160, buttons: 1 }, button);
    expect(cursor).toHaveAttribute("data-visible", "false");
    expect(cursor).toHaveAttribute("data-dragging", "true");
    expect(region.dataset.inspectCursorVisible).toBeUndefined();
    pointer("pointermove", canvas, { clientX: 200, buttons: 1 });
    expect(cursor).toHaveAttribute("data-visible", "true");
    pointer("pointermove", canvas, { clientX: 240, buttons: 1 }, document.body);
    expect(cursor).toHaveAttribute("data-visible", "false");
    pointer("pointerup", document.body);
    expect(cursor).toHaveAttribute("data-dragging", "false");
  });

  it("hides over language options and the header's non-intercepting empty space", () => {
    const { cursor, canvas } = setup();
    pointer("pointermove", canvas);
    const language = screen.getByTestId("inspect-test-language");
    pointer("pointermove", language);
    expect(cursor).toHaveAttribute("data-visible", "false");
    const header = screen.getByTestId("inspect-test-header");
    vi.spyOn(header, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      right: 800,
      top: 0,
      bottom: 100,
      width: 800,
      height: 100,
      toJSON: () => ({}),
    });
    pointer("pointermove", canvas, { clientY: 50 });
    expect(cursor).toHaveAttribute("data-visible", "false");
  });

  it.each(["pointercancel", "lostpointercapture"])(
    "restores scale on %s",
    (event) => {
      const { cursor, canvas, ring } = setup();
      pointer("pointerdown", canvas, { buttons: 1 });
      pointer("pointermove", canvas, { clientX: 120, buttons: 1 });
      pointer(event, canvas);
      expect(cursor).toHaveAttribute("data-dragging", "false");
      expect(ring.style.transform).toBe("scale(1)");
    },
  );

  it("does not release the active drag for another pointer but recovers from a missed left release", () => {
    const { cursor, canvas } = setup();
    pointer("pointerdown", canvas, { buttons: 1 });
    pointer("pointermove", canvas, { clientX: 120, buttons: 1 });
    pointer("pointerup", canvas, { pointerId: 2 });
    expect(cursor).toHaveAttribute("data-dragging", "true");
    pointer("pointermove", canvas, { clientX: 130, buttons: 0 });
    expect(cursor).toHaveAttribute("data-dragging", "false");
  });

  it("resets on blur and document hide without reappearing on visibility restore", () => {
    const { cursor, canvas, region } = setup();
    pointer("pointerdown", canvas, { buttons: 1 });
    pointer("pointermove", canvas, { clientX: 120, buttons: 1 });
    fireEvent(window, new Event("blur"));
    expect(cursor).toHaveAttribute("data-dragging", "false");
    expect(cursor).toHaveAttribute("data-visible", "false");
    pointer("pointermove", canvas);
    hidden = true;
    fireEvent(document, new Event("visibilitychange"));
    expect(region.dataset.inspectCursorVisible).toBeUndefined();
    expect(frames.size).toBe(0);
    hidden = false;
    fireEvent(document, new Event("visibilitychange"));
    expect(cursor).toHaveAttribute("data-visible", "false");
  });

  it("keeps touch and coarse-pointer interaction free of a custom cursor", () => {
    const { cursor, canvas, region } = setup();
    pointer("pointermove", canvas, { pointerType: "touch" });
    expect(cursor).toHaveAttribute("data-visible", "false");
    preference.matches = false;
    pointer("pointermove", canvas);
    expect(cursor).toHaveAttribute("data-visible", "false");
    expect(region.dataset.inspectCursorVisible).toBeUndefined();
  });

  it("cleans up frames and document observers on unmount", () => {
    const { cursor, canvas, region, unmount } = setup();
    pointer("pointerdown", canvas, { buttons: 1 });
    pointer("pointermove", canvas, { clientX: 150, buttons: 1 });
    const staleFrame = [...frames.values()][0]!;
    unmount();
    expect(frames.size).toBe(0);
    expect(region.dataset.inspectCursorVisible).toBeUndefined();
    act(() => staleFrame(now + 100));
    pointer("pointermove", document.body);
    expect(cursor).toHaveAttribute("data-dragging", "false");
    expect(cursor).toHaveAttribute("data-visible", "false");
    expect(frames.size).toBe(0);
  });
});
