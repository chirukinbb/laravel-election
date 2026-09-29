import {createElement} from "react";

import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";

import map from "../../../public/media/voting/world-map.json";
import {continentNames, countries, getCountryName} from "./countries";
import {VotingMap} from "./voting-map";

describe("voting geography", () => {
  it("contains exactly 193 UN members and two observer states, without territories", () => {
    const codes = new Set(countries.map((country) => country.code));
    expect(countries).toHaveLength(195);
    expect(codes.size).toBe(195);
    expect(codes.has("VA")).toBe(true);
    expect(codes.has("PS")).toBe(true);
    for (const territory of [
      "AQ",
      "PR",
      "HK",
      "MO",
      "TW",
      "XK",
      "EH",
      "GL",
      "CK",
      "NU",
    ]) {
      expect(codes.has(territory)).toBe(false);
    }
    expect(countries.every((country) => /^[A-Z]{2}$/.test(country.code))).toBe(
      true,
    );
  });

  it("assigns every country once using the six agreed statistical regions", () => {
    const counts = Object.fromEntries(
      Object.keys(continentNames.en).map((continent) => [
        continent,
        countries.filter((country) => country.continent === continent).length,
      ]),
    );
    expect(counts).toEqual({
      africa: 54,
      asia: 48,
      europe: 44,
      "north-america": 23,
      "south-america": 12,
      oceania: 14,
    });
    expect(countries.find((country) => country.code === "RU")?.continent).toBe(
      "europe",
    );
    expect(countries.find((country) => country.code === "TR")?.continent).toBe(
      "asia",
    );
  });

  it("has a selectable shape or small-state marker for all 195 countries", () => {
    const selectable = map.features.filter((feature) => feature.code !== null);
    expect(selectable).toHaveLength(195);
    expect(new Set(selectable.map((feature) => feature.code))).toEqual(
      new Set(countries.map((country) => country.code)),
    );
    for (const feature of selectable) {
      expect(feature.path.length > 0 || feature.marker).toBe(true);
      expect(feature.center.every(Number.isFinite)).toBe(true);
      expect(feature.bounds.every(Number.isFinite)).toBe(true);
    }
    for (const code of ["VA", "MC", "SG", "NR", "TV"]) {
      expect(selectable.find((feature) => feature.code === code)?.marker).toBe(
        true,
      );
    }
    const kiribati = selectable.find((feature) => feature.code === "KI")!;
    const [left, top, width, height] = map.views.oceania as [
      number,
      number,
      number,
      number,
    ];
    expect(kiribati.center[0]).toBeGreaterThan(left);
    expect(kiribati.center[0]).toBeLessThan(left + width);
    expect(kiribati.center[1]).toBeGreaterThan(top);
    expect(kiribati.center[1]).toBeLessThan(top + height);
  });

  it("provides valid localized names and bounded continent windows", () => {
    for (const language of ["en", "ru", "es"] as const) {
      for (const country of countries) {
        expect(getCountryName(country.code, language).length).toBeGreaterThan(
          2,
        );
      }
    }
    expect(getCountryName("PS", "en")).toBe("State of Palestine");
    expect(getCountryName("DE", "ru")).toBe("Германия");
    expect(getCountryName("DE", "es")).toBe("Alemania");
    for (const bounds of Object.values(map.views)) {
      expect(bounds.every(Number.isFinite)).toBe(true);
      expect(bounds[2]).toBeGreaterThan(40);
      expect(bounds[3]).toBeGreaterThan(40);
      expect(bounds[2]).toBeLessThan(1000);
    }
  });
});

describe("VotingMap navigation", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("loads local geometry, selects a country without opening or zooming it, and opens continents separately", async () => {
    const fetchMap = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => map });
    vi.stubGlobal("fetch", fetchMap);
    const onCountrySelect = vi.fn();
    const onContinentChange = vi.fn();
    const { container } = render(
      createElement(VotingMap, {
        language: "en",
        continent: null,
        selectedCountry: null,
        counts: { PY: 3 },
        onCountrySelect,
        onContinentChange,
      }),
    );
    const paraguay = await screen.findByRole("button", {
      name: "Paraguay, 3 nominees",
    });
    expect(fetchMap).toHaveBeenCalledWith("/media/voting/world-map.json");
    const beforeTransform = container
      .querySelector(".voting-map__land")
      ?.getAttribute("style");
    fireEvent.click(paraguay);
    expect(onCountrySelect).toHaveBeenCalledWith("PY");
    expect(onContinentChange).not.toHaveBeenCalled();
    expect(
      container.querySelector(".voting-map__land")?.getAttribute("style"),
    ).toBe(beforeTransform);
    fireEvent.click(screen.getByRole("button", { name: "South America" }));
    expect(onContinentChange).toHaveBeenCalledWith("south-america");

    fireEvent.keyDown(paraguay, { key: "Enter" });
    expect(onCountrySelect).toHaveBeenCalledTimes(2);
    fireEvent.keyDown(paraguay, { key: "ArrowRight" });
    await waitFor(() =>
      expect(document.activeElement).toHaveAttribute("data-country", "PE"),
    );
    expect(
      container.querySelectorAll('[role="button"][tabindex="0"]'),
    ).toHaveLength(1);
  });
});
