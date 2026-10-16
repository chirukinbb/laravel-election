"use client";
import type {Locale as Language} from "@/i18n/locales";
import {localeDirection} from "@/i18n/locales";

import type {KeyboardEvent, PointerEvent} from "react";
import {useEffect, useMemo, useRef, useState} from "react";

import type {Continent} from "./countries";
import {continentNames, countries, getCountryName} from "./countries";

import "./voting-map.css";
import {mapCopy as copy} from "./map-copy";
import {votingCount} from "./format";

type MapFeature = {
  id: string;
  code: string | null;
  continent: Continent | null;
  path: string;
  center: [number, number];
  marker: boolean;
};
type MapData = {
  width: number;
  height: number;
  views: Record<Continent, [number, number, number, number]>;
  features: MapFeature[];
};

export type VotingMapProps = {
  language: Language;
  continent: Continent | null;
  selectedCountry: string | null;
  counts: Readonly<Record<string, number>>;
  onContinentChange: (continent: Continent | null) => void;
  onCountrySelect: (code: string) => void;
};

let cachedMap: Promise<MapData> | null = null;
function loadMap(): Promise<MapData> {
  cachedMap ??= fetch("/media/voting/world-map.json")
    .then(async (response) => {
      if (!response.ok) throw new Error(`Map request: ${response.status}`);
      return (await response.json()) as MapData;
    })
    .catch((error: unknown) => {
      cachedMap = null;
      throw error;
    });
  return cachedMap;
}

export function VotingMap({
  language,
  continent,
  selectedCountry,
  counts,
  onContinentChange,
  onCountrySelect,
}: VotingMapProps) {
  const t = copy[language];
  const [data, setData] = useState<MapData | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [focusedCountry, setFocusedCountry] = useState<string | null>(null);
  const [viewport, setViewport] = useState({ continent, zoom: 1, x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    startX: number;
    startY: number;
  } | null>(null);
  const didDrag = useRef(false);

  useEffect(() => {
    let alive = true;
    loadMap().then(
      (map) => {
        if (alive) setData(map);
      },
      () => {
        if (alive) setFailed(true);
      },
    );
    return () => {
      alive = false;
    };
  }, [attempt]);

  const position =
    viewport.continent === continent ? viewport : { zoom: 1, x: 0, y: 0 };
  const bounds = continent && data ? data.views[continent] : [0, 0, 1000, 560];
  const baseScale = Math.min(1000 / bounds[2]!, 560 / bounds[3]!);
  const scale = baseScale * position.zoom;
  const x = 500 - (bounds[0]! + bounds[2]! / 2) * scale + position.x;
  const y = 280 - (bounds[1]! + bounds[3]! / 2) * scale + position.y;
  const activeCountries = useMemo(
    () =>
      countries
        .filter((country) => !continent || country.continent === continent)
        .sort((a, b) =>
          getCountryName(a.code, language).localeCompare(
            getCountryName(b.code, language),
            language,
          ),
        ),
    [continent, language],
  );
  const keyboardCountry =
    activeCountries.find((country) => country.code === focusedCountry)?.code ??
    activeCountries.find((country) => country.code === selectedCountry)?.code ??
    activeCountries[0]?.code;
  const captionCountry = hoveredCountry ?? selectedCountry;

  function reset() {
    setViewport({ continent, zoom: 1, x: 0, y: 0 });
  }

  function changeZoom(amount: number) {
    setViewport({
      continent,
      zoom: Math.max(1, Math.min(3.5, position.zoom + amount)),
      x: position.x,
      y: position.y,
    });
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    didDrag.current = false;
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startX: position.x,
      startY: position.y,
    };
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const origin = dragRef.current;
    if (!origin || origin.pointerId !== event.pointerId || !svgRef.current)
      return;
    if (event.pointerType === "mouse" && event.buttons === 0) {
      stopDrag(event);
      return;
    }
    const dx = event.clientX - origin.x;
    const dy = event.clientY - origin.y;
    if (Math.hypot(dx, dy) < 5 && !didDrag.current) return;
    didDrag.current = true;
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    setDragging(true);
    const bounds = svgRef.current.getBoundingClientRect();
    const ratio = 1 / Math.min(bounds.width / 1000, bounds.height / 560);
    setViewport({
      continent,
      zoom: position.zoom,
      x: Math.max(
        -750 * scale,
        Math.min(750 * scale, origin.startX + dx * ratio),
      ),
      y: Math.max(
        -400 * scale,
        Math.min(400 * scale, origin.startY + dy * ratio),
      ),
    });
  }

  function stopDrag(event: PointerEvent<HTMLDivElement>) {
    dragRef.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function keyCountry(event: KeyboardEvent<SVGGElement>, code: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onCountrySelect(code);
      return;
    }
    const direction = ["ArrowRight", "ArrowDown"].includes(event.key)
      ? 1
      : ["ArrowLeft", "ArrowUp"].includes(event.key)
        ? -1
        : 0;
    if (!direction) return;
    event.preventDefault();
    const index = activeCountries.findIndex((country) => country.code === code);
    const next =
      activeCountries[
        (index + direction + activeCountries.length) % activeCountries.length
      ];
    if (next) {
      setFocusedCountry(next.code);
      svgRef.current
        ?.querySelector<SVGGElement>(`[data-country="${next.code}"]`)
        ?.focus({ preventScroll: true });
    }
  }

  return (
    <section
      className="voting-map"
      aria-label={t.explore}
      dir={localeDirection(language)}
    >
      <div className="voting-map__continents" aria-label={t.explore}>
        <button
          type="button"
          aria-pressed={continent === null}
          onClick={() => {
            onContinentChange(null);
            setHoveredCountry(null);
          }}
        >
          {t.world}
        </button>
        {(Object.keys(continentNames[language]) as Continent[]).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={continent === item}
            onClick={() => {
              onContinentChange(item);
              setHoveredCountry(null);
            }}
          >
            {continentNames[language][item]}
          </button>
        ))}
      </div>

      <div
        className="voting-map__viewport"
        dir="ltr"
        data-dragging={dragging}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        onPointerLeave={() => {
          if (!didDrag.current) dragRef.current = null;
        }}
      >
        {data ? (
          <svg
            ref={svgRef}
            viewBox="0 0 1000 560"
            role="group"
            aria-label={t.label}
          >
            <g
              className="voting-map__land"
              style={{ transform: `translate(${x}px, ${y}px) scale(${scale})` }}
            >
              {data.features.map((feature) => {
                if (!feature.code) {
                  return (
                    <path
                      className="voting-map__territory"
                      key={feature.id}
                      d={feature.path}
                    />
                  );
                }
                const code = feature.code;
                const name = getCountryName(code, language);
                const dimmed =
                  continent !== null && feature.continent !== continent;
                return (
                  <g
                    key={feature.id}
                    className="voting-map__country"
                    role="button"
                    tabIndex={code === keyboardCountry ? 0 : -1}
                    data-country={code}
                    data-selected={selectedCountry === code}
                    data-dimmed={dimmed}
                    aria-pressed={selectedCountry === code}
                    aria-disabled={dimmed}
                    aria-label={`${name}, ${votingCount(counts[code] ?? 0, "nominees", language)}`}
                    onPointerEnter={() => setHoveredCountry(code)}
                    onPointerLeave={() => setHoveredCountry(null)}
                    onFocus={() => {
                      setFocusedCountry(code);
                      setHoveredCountry(code);
                    }}
                    onBlur={() => setHoveredCountry(null)}
                    onClick={() => {
                      if (!didDrag.current && !dimmed) onCountrySelect(code);
                    }}
                    onKeyDown={(event) => keyCountry(event, code)}
                  >
                    <path d={feature.path} />
                    {feature.marker ? (
                      <>
                        <circle
                          className="voting-map__marker-hit"
                          cx={feature.center[0]}
                          cy={feature.center[1]}
                          r={9 / scale}
                        />
                        <circle
                          className="voting-map__marker"
                          cx={feature.center[0]}
                          cy={feature.center[1]}
                          r={2.8 / scale}
                        />
                      </>
                    ) : null}
                  </g>
                );
              })}
            </g>
          </svg>
        ) : (
          <div
            className="voting-map__message"
            role="status"
            dir={localeDirection(language)}
          >
            <p>{failed ? t.error : t.loading}</p>
            {failed ? (
              <button
                type="button"
                onClick={() => {
                  setFailed(false);
                  setAttempt((value) => value + 1);
                }}
              >
                {t.retry}
              </button>
            ) : null}
          </div>
        )}
      </div>

      <div className="voting-map__footer">
        <div className="voting-map__controls">
          <button
            type="button"
            aria-label={t.zoomOut}
            disabled={position.zoom <= 1}
            onClick={() => changeZoom(-0.5)}
          >
            −
          </button>
          <button
            type="button"
            aria-label={t.zoomIn}
            disabled={position.zoom >= 3.5}
            onClick={() => changeZoom(0.5)}
          >
            +
          </button>
          <button className="voting-map__reset" type="button" onClick={reset}>
            {t.reset}
          </button>
        </div>
        <p className="voting-map__caption">
          {captionCountry
            ? `${getCountryName(captionCountry, language)} · ${votingCount(counts[captionCountry] ?? 0, "nominees", language)}`
            : t.hint}
        </p>
      </div>
    </section>
  );
}
