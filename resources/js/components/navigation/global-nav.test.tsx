import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {beforeEach, describe, expect, it, vi} from "vitest";

import {GlobalNav} from "@/components/navigation/global-nav";

const pathname = vi.hoisted(() => ({value: "/about"}));

vi.mock("next/navigation", () => ({
  usePathname: () => pathname.value,
}));

describe("GlobalNav", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    pathname.value = "/about";
  });

  it("identifies the owning section on a detail route", async () => {
    pathname.value = "/golden-leaves/1";
    const user = userEvent.setup();
    render(<GlobalNav/>);

    await user.click(screen.getByRole("button", {name: "Menu"}));

    expect(screen.getByRole("link", {name: "Golden Leaves"})).toHaveAttribute(
        "aria-current",
        "location",
    );
  });

  it("discloses links to keyboard and touch input", async () => {
    const user = userEvent.setup();
    render(<GlobalNav/>);

    const trigger = screen.getByRole("button", {name: "Menu"});
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(
        screen.getByRole("link", {hidden: true, name: "About"}),
    ).not.toBeVisible();

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", {name: "About"})).toHaveAttribute(
        "aria-current",
        "page",
    );
  });

  it("closes on Escape and restores focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<GlobalNav/>);

    const trigger = screen.getByRole("button", {name: "Menu"});
    await user.click(trigger);
    await user.tab();
    expect(screen.getByRole("link", {name: "About"})).toHaveFocus();

    await user.keyboard("{Escape}");

    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
