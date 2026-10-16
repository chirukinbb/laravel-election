import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";
import {locales} from "@/i18n/locales";
import {homeCopy} from "./copy";
import {LanguageSelector} from "./language-selector";

afterEach(cleanup);

describe("LanguageSelector", () => {
  it("exposes all eleven native labels with their own language and direction", () => {
    render(<LanguageSelector language="ar" onChange={vi.fn()} />);
    const trigger = screen.getByRole("button", {
      name: homeCopy.ar.languageLabel,
    });
    fireEvent.click(trigger);
    for (const locale of locales) {
      const option = screen.getByRole("button", {
        name: locale.nativeName,
      });
      expect(option).toHaveAttribute("lang", locale.code);
      expect(option).toHaveAttribute("dir", locale.dir);
      expect(option).toHaveAttribute(
        "aria-pressed",
        String(locale.code === "ar"),
      );
    }
    expect(trigger).toHaveTextContent("ع");
  });

  it("chooses a full locale code, closes the popup, and restores trigger focus", () => {
    const change = vi.fn();
    render(<LanguageSelector language="en" onChange={change} />);
    const trigger = screen.getByRole("button", {
      name: homeCopy.en.languageLabel,
    });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: "繁體中文" }));
    expect(change).toHaveBeenCalledWith("zh-Hant");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole("group")).not.toBeInTheDocument();
  });

  it("closes with Escape without selecting a different language", () => {
    const change = vi.fn();
    render(<LanguageSelector language="en" onChange={change} />);
    const trigger = screen.getByRole("button", {
      name: homeCopy.en.languageLabel,
    });
    fireEvent.click(trigger);
    fireEvent.keyDown(screen.getByRole("button", { name: "日本語" }), {
      key: "Escape",
    });
    expect(change).not.toHaveBeenCalled();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
