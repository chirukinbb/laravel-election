import {Link, usePage} from "@inertiajs/react";
import {type ReactNode, type RefObject, useEffect, useId, useRef, useState, useSyncExternalStore,} from "react";
import {homeCopy, type HomeLanguage} from "./copy";
import {LanguageSelector} from "./language-selector";
import "./cinematic-header.css";

/* ---------- Типы данных меню (приходят из Laravel: props.navigation.menu) ---------- */

export type MenuChild = { label: string; url: string };
export type MenuItem = {
  key: string;
  label: string;
  url: string;
  children?: MenuChild[];
};

type SharedProps = {
  locale?: string;
  navigation?: { menu?: MenuItem[]; accountUrl?: string };
};

/* ---------- Хелперы ---------- */

const RTL = new Set(["ar", "he", "fa", "ur"]);
const localeDirection = (lang: string) => (RTL.has(lang) ? "rtl" : "ltr");

/**
 * Приводит url из бэкенда к виду, пригодному для SPA-перехода.
 * "http://localhost:8080/en/voting" -> "/en/voting" (тот же origin)
 * Внешние ссылки возвращаются как есть и помечаются external.
 */
function resolveUrl(url: string): { href: string; external: boolean } {
  if (!/^https?:\/\//i.test(url)) return { href: url, external: false };
  if (typeof window === "undefined") return { href: url, external: false };
  try {
    const parsed = new URL(url);
    if (parsed.origin === window.location.origin)
      return {
        href: parsed.pathname + parsed.search + parsed.hash,
        external: false,
      };
  } catch {
    /* fallthrough */
  }
  return { href: url, external: true };
}

function NavLink({
                   url,
                   onClick,
                   children,
                 }: {
  url: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  children: ReactNode;
}) {
  const { href, external } = resolveUrl(url);
  if (external)
    return (
        <a href={href} onClick={onClick}>
          {children}
        </a>
    );
  return (
      <Link href={href} onClick={onClick}>
        {children}
      </Link>
  );
}

const compactHeaderQuery =
    "(max-width: 1200px), (hover: none), (pointer: coarse)";

function subscribeCompactHeader(onChange: () => void) {
  const query = window.matchMedia(compactHeaderQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const getCompactHeader = () => window.matchMedia(compactHeaderQuery).matches;
const getServerCompactHeader = () => false;

/* ---------- Компонент ---------- */

export function CinematicHeader({
                                  inspect = false,
                                  language: languageProp,
                                  onLanguageChange,
                                  sound = false,
                                  onToggleSound,
                                  onTree,
                                  onHome,
                                  onClose,
                                  backRef: backRefProp,
                                  logo,
                                  logoBlack,
                                  showClose = inspect,
                                  tone = inspect ? "dark" : "light",
                                  onNavigate,
                                  menu: menuProp,
                                  homeUrl = "/",
                                  accountUrl: accountUrlProp,
                                }: {
  readonly inspect?: boolean;
  /** По умолчанию берётся из shared prop `locale` */
  readonly language?: HomeLanguage;
  readonly onLanguageChange: (language: HomeLanguage) => void;
  readonly sound?: boolean;
  readonly onToggleSound?: () => void;
  /** Если передан — клик по "Explore" в пункте tree не делает SPA-переход, а вызывает этот колбэк */
  readonly onTree?: () => void;
  /** Если передан — клик по логотипу вызывает колбэк вместо перехода */
  readonly onHome?: () => void;
  readonly onClose?: () => void;
  readonly backRef?: RefObject<HTMLButtonElement | null>;
  readonly logo: string;
  readonly logoBlack: string;
  readonly showClose?: boolean;
  readonly tone?: "light" | "dark";
  readonly onNavigate?: () => void;
  /** По умолчанию берётся из shared props: navigation.menu */
  readonly menu?: MenuItem[];
  readonly homeUrl?: string;
  readonly accountUrl?: string;
}) {
  const { props } = usePage<SharedProps>();
  const language = (languageProp ?? props.locale ?? "en") as HomeLanguage;
  const menu = menuProp ?? props.navigation?.menu ?? [];
  const accountLink = accountUrlProp ?? props.navigation?.accountUrl ?? "/account";
  // Пустое место под логотип — посередине меню
  const logoSlot = Math.floor(menu.length / 2);

  const [expanded, setExpanded] = useState(false);
  // key раскрытого подменю (или null)
  const [treeOpen, setTreeOpen] = useState<string | null>(null);
  const compact = useSyncExternalStore(
      subscribeCompactHeader,
      getCompactHeader,
      getServerCompactHeader,
  );
  const headerRef = useRef<HTMLElement>(null);
  const logoLink = useRef<HTMLAnchorElement>(null);
  const menuToggle = useRef<HTMLButtonElement>(null);
  const ownBackRef = useRef<HTMLButtonElement>(null);
  const backRef = backRefProp ?? ownBackRef;
  const treeTriggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const suppressLogoFocus = useRef(false);
  const suppressTreeFocus = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const treeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigationId = useId();
  const treeIdBase = useId();
  const copy = homeCopy[language];

  const cancelClose = () => {
    if (closeTimer.current !== null) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const cancelTreeClose = () => {
    if (treeTimer.current !== null) clearTimeout(treeTimer.current);
    treeTimer.current = null;
  };
  const collapse = () => {
    cancelClose();
    cancelTreeClose();
    setExpanded(false);
    setTreeOpen(null);
  };
  const openNavigation = () => {
    cancelClose();
    if (document.activeElement === backRef.current)
      logoLink.current?.focus({ preventScroll: true });
    setExpanded(true);
  };
  const openTree = (key: string) => {
    cancelTreeClose();
    setTreeOpen(key);
  };

  useEffect(
      () => () => {
        if (closeTimer.current !== null) clearTimeout(closeTimer.current);
        if (treeTimer.current !== null) clearTimeout(treeTimer.current);
      },
      [],
  );

  useEffect(() => {
    const query = window.matchMedia(compactHeaderQuery);
    const changeLayout = () => {
      if (closeTimer.current !== null) clearTimeout(closeTimer.current);
      if (treeTimer.current !== null) clearTimeout(treeTimer.current);
      closeTimer.current = null;
      treeTimer.current = null;
      setExpanded(false);
      setTreeOpen(null);
      if (headerRef.current?.contains(document.activeElement)) {
        suppressLogoFocus.current = true;
        (query.matches ? menuToggle.current : logoLink.current)?.focus({
          preventScroll: true,
        });
        suppressLogoFocus.current = false;
      }
    };
    query.addEventListener("change", changeLayout);
    return () => query.removeEventListener("change", changeLayout);
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const closeOutside = (event: PointerEvent) => {
      if (
          event.target instanceof Node &&
          !headerRef.current?.contains(event.target)
      ) {
        setExpanded(false);
        setTreeOpen(null);
      }
    };
    document.addEventListener("pointerdown", closeOutside, { passive: true });
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [expanded]);

  // SPA: закрываем меню после любой Inertia-навигации
  useEffect(() => {
    const onFinish = () => {
      cancelClose();
      cancelTreeClose();
      setExpanded(false);
      setTreeOpen(null);
    };
    document.addEventListener("inertia:navigate", onFinish);
    return () => document.removeEventListener("inertia:navigate", onFinish);
  }, []);

  useEffect(() => {
    if (!compact || !expanded || !headerRef.current) return;
    const header = headerRef.current;
    const root = document.documentElement;
    const body = document.body;
    const rootOverflow = root.style.overflow;
    const bodyOverflow = body.style.overflow;
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";

    // Изолируем только соседей по цепочке предков хедера
    const background: Array<[HTMLElement, boolean]> = [];
    let current: HTMLElement = header;
    while (current.parentElement) {
      for (const sibling of current.parentElement.children) {
        if (sibling !== current && sibling instanceof HTMLElement) {
          background.push([sibling, sibling.inert]);
          sibling.setAttribute("inert", "");
        }
      }
      if (current.parentElement === body) break;
      current = current.parentElement;
    }
    const keepFocusInside = (event: FocusEvent) => {
      if (event.target instanceof Node && !header.contains(event.target))
        menuToggle.current?.focus({ preventScroll: true });
    };
    document.addEventListener("focusin", keepFocusInside);
    return () => {
      root.style.overflow = rootOverflow;
      body.style.overflow = bodyOverflow;
      for (const [element, inert] of background)
        element.toggleAttribute("inert", inert);
      document.removeEventListener("focusin", keepFocusInside);
    };
  }, [compact, expanded]);

  const renderItem = (item: MenuItem) => {
    const children = item.children ?? [];
    if (children.length === 0)
      return (
          <NavLink key={item.key} url={item.url} onClick={collapse}>
            {item.label}
          </NavLink>
      );

    const isOpen = treeOpen === item.key;
    const submenuId = `${treeIdBase}-${item.key}`;
    const isTree = item.key === "tree";

    return (
        <div
            key={item.key}
            className="cinematic-tree"
            onPointerEnter={(event) => {
              if (!compact && event.pointerType === "mouse") openTree(item.key);
            }}
            onPointerLeave={(event) => {
              if (compact || event.pointerType !== "mouse") return;
              cancelTreeClose();
              const region = event.currentTarget;
              treeTimer.current = setTimeout(() => {
                const active = document.activeElement;
                if (
                    active instanceof Element &&
                    region.contains(active) &&
                    active.matches(":focus-visible")
                )
                  return;
                setTreeOpen(null);
              }, 170);
            }}
            onBlur={(event) => {
              if (!compact && !event.currentTarget.contains(event.relatedTarget))
                setTreeOpen(null);
            }}
        >
          <button
              ref={(node) => {
                treeTriggers.current[item.key] = node;
              }}
              className="cinematic-tree__trigger"
              type="button"
              aria-expanded={isOpen}
              aria-controls={submenuId}
              onFocus={(event) => {
                if (
                    !compact &&
                    !suppressTreeFocus.current &&
                    event.currentTarget.matches(":focus-visible")
                )
                  openTree(item.key);
              }}
              onClick={() => {
                cancelTreeClose();
                // Hover уже открывает подменю на десктопе — клик не должен его закрывать
                if (compact) setTreeOpen((value) => (value === item.key ? null : item.key));
                else openTree(item.key);
              }}
          >
            <span>{item.label}</span>
            <svg
                className="cinematic-tree__chevron"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
            >
              <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1" />
            </svg>
          </button>
          <div
              id={submenuId}
              className="tree-submenu"
              data-open={isOpen}
              aria-hidden={!isOpen}
              inert={!isOpen}
          >
            <div className="tree-submenu__inner">
              <NavLink
                  url={item.url}
                  onClick={(event) => {
                    if (isTree && onTree) {
                      event.preventDefault();
                      collapse();
                      onTree();
                    } else collapse();
                  }}
              >
                {isTree ? copy.exploreLabel : item.label}
              </NavLink>
              {children.map((child) => (
                  <NavLink key={child.url} url={child.url} onClick={collapse}>
                    {child.label}
                  </NavLink>
              ))}
            </div>
          </div>
        </div>
    );
  };

  return (
      <header
          ref={headerRef}
          className="cinematic-header inspect-header"
          lang={language}
          dir={localeDirection(language)}
          data-mode={inspect ? "inspect" : "cinematic"}
          data-tone={tone}
          data-expanded={expanded}
          data-tree-expanded={treeOpen !== null}
          data-compact={compact}
          data-navigation-surface="true"
          role={compact && expanded ? "dialog" : undefined}
          aria-modal={compact && expanded ? true : undefined}
          aria-label={compact && expanded ? copy.navigation.primary : undefined}
          onClickCapture={(event) => {
            if (event.target instanceof Element && event.target.closest("a[href]"))
              onNavigate?.();
          }}
          onPointerEnter={cancelClose}
          onPointerLeave={(event) => {
            if (compact || event.pointerType !== "mouse") return;
            cancelClose();
            const region = event.currentTarget;
            closeTimer.current = setTimeout(() => {
              const active = document.activeElement;
              if (
                  active instanceof Element &&
                  region.contains(active) &&
                  active.matches(":focus-visible")
              )
                return;
              setExpanded(false);
              setTreeOpen(null);
            }, 180);
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) collapse();
          }}
          onKeyDown={(event) => {
            if (compact && expanded && event.key === "Tab") {
              const controls = Array.from(
                  event.currentTarget.querySelectorAll<HTMLElement>(
                      'a[href], button:not([disabled]), [tabindex="0"]',
                  ),
              ).filter(
                  (control) =>
                      !control.closest("[inert]") &&
                      control.getClientRects().length > 0 &&
                      getComputedStyle(control).visibility !== "hidden",
              );
              const first = controls[0];
              const last = controls.at(-1);
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
              }
            }
            if (!expanded || event.key !== "Escape") return;
            event.preventDefault();
            event.stopPropagation();
            if (compact) {
              collapse();
              menuToggle.current?.focus({ preventScroll: true });
            } else if (treeOpen !== null) {
              const key = treeOpen;
              cancelTreeClose();
              setTreeOpen(null);
              suppressTreeFocus.current = true;
              treeTriggers.current[key]?.focus({ preventScroll: true });
              suppressTreeFocus.current = false;
            } else {
              collapse();
              suppressLogoFocus.current = true;
              logoLink.current?.focus({ preventScroll: true });
              suppressLogoFocus.current = false;
            }
          }}
      >
        <Link
            ref={logoLink}
            href={homeUrl}
            className="cinematic-logo inspect-logo"
            aria-label="Tree of Unity"
            onPointerEnter={(event) => {
              if (!compact && event.pointerType === "mouse") openNavigation();
            }}
            onFocus={() => {
              if (!compact && !suppressLogoFocus.current) openNavigation();
            }}
            onClick={(event) => {
              collapse();
              if (onHome) {
                event.preventDefault();
                onHome();
              }
            }}
        >
          <img src={expanded || tone === "dark" ? logoBlack : logo} alt="" />
        </Link>

        <button
            ref={menuToggle}
            type="button"
            className="inspect-menu-toggle"
            aria-label={expanded ? copy.navigation.close : copy.navigation.open}
            aria-expanded={expanded}
            aria-controls={navigationId}
            onClick={() => {
              if (expanded) collapse();
              else openNavigation();
            }}
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
                d={expanded ? "M5 5l10 10M5 15 15 5" : "M3 7h14M3 13h14"}
                stroke="currentColor"
                strokeWidth="1"
            />
          </svg>
        </button>

        <div
            id={navigationId}
            className="inspect-menu"
            aria-hidden={!expanded}
            inert={!expanded}
        >
          <div className="inspect-menu__main">
            <nav className="cinematic-nav" aria-label={copy.navigation.primary}>
              {menu.flatMap((item, index) => {
                const nodes: ReactNode[] = [];
                if (index === logoSlot)
                  nodes.push(
                      <span
                          key="logo-space"
                          className="inspect-menu__logo-space"
                          aria-hidden="true"
                      />,
                  );
                nodes.push(renderItem(item));
                return nodes;
              })}
            </nav>
          </div>

          <div className="inspect-menu__utilities">
            {onToggleSound ? (
                <button
                    type="button"
                    className="sound-toggle"
                    data-state={sound ? "on" : "off"}
                    aria-label={sound ? copy.soundOff : copy.soundOn}
                    aria-pressed={sound}
                    onClick={onToggleSound}
                >
                  <span className="sound-toggle__label">{copy.soundWord}</span>
                </button>
            ) : null}
            <div className="inspect-menu__language">
              <Link
                  href={accountLink}
                  className="inspect-account-link"
                  aria-label={copy.navigation.account}
                  onClick={collapse}
              >
                <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    aria-hidden="true"
                >
                  <circle
                      cx="12"
                      cy="8"
                      r="3.3"
                      stroke="currentColor"
                      strokeWidth="1"
                  />
                  <path
                      d="M5.5 20v-1.5a6.5 6.5 0 0 1 13 0V20"
                      stroke="currentColor"
                      strokeWidth="1"
                  />
                </svg>
                <span>{copy.navigation.account}</span>
              </Link>
              <LanguageSelector language={language} onChange={onLanguageChange} />
            </div>
          </div>
        </div>

        {showClose ? (
            <button
                ref={backRef}
                type="button"
                className="inspect-close"
                aria-label={copy.backToTree}
                aria-hidden={expanded}
                inert={expanded}
                onClick={() => {
                  collapse();
                  onClose?.();
                }}
            >
              <svg viewBox="0 0 20 20" aria-hidden="true" fill="none">
                <path d="m6 6 8 8m0-8-8 8" stroke="currentColor" strokeWidth="1" />
              </svg>
            </button>
        ) : null}
      </header>
  );
}