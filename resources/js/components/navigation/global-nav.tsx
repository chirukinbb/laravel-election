"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {useId, useRef, useState} from "react";

const navigationItems = [
  {href: "/about", label: "About"},
  {href: "/golden-leaves", label: "Golden Leaves"},
  {href: "/humanity-chooses", label: "Humanity Chooses"},
  {href: "/engravings", label: "Engravings"},
  {href: "/news", label: "News"},
  {href: "/contact", label: "Contact"},
] as const;

export function GlobalNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
      <nav
          aria-label="Primary navigation"
          className="global-nav"
          onKeyDown={(event) => {
            if (event.key === "Escape" && open) {
              setOpen(false);
              triggerRef.current?.focus();
            }
          }}
      >
        <button
            aria-controls={panelId}
            aria-expanded={open}
            className="button"
            onClick={() => setOpen((current) => !current)}
            ref={triggerRef}
            type="button"
        >
          Menu
        </button>
        <div className="global-nav__panel" hidden={!open} id={panelId}>
          <ul className="global-nav__list">
            {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link
                      aria-current={
                        pathname === item.href
                            ? "page"
                            : pathname.startsWith(`${item.href}/`)
                                ? "location"
                                : undefined
                      }
                      className="global-nav__link"
                      href={item.href}
                      onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
            ))}
          </ul>
        </div>
      </nav>
  );
}
