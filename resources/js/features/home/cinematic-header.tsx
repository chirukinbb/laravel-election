import {Link, router, usePage} from "@inertiajs/react";
import {Fragment, type RefObject, useEffect, useId, useRef, useState, useSyncExternalStore,} from "react";
import {homeCopy, type HomeLanguage} from "./copy";
import {montserrat} from "./fonts";
import {LanguageSelector} from "./language-selector";
import "./cinematic-header.css";

const compactHeaderQuery =
    "(max-width: 1200px), (hover: none), (pointer: coarse)";

function subscribeCompactHeader(onChange: () => void) {
  const query = window.matchMedia(compactHeaderQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const getCompactHeader = () => window.matchMedia(compactHeaderQuery).matches;
const getServerCompactHeader = () => false;

const treeSectionsLabel: Record<string, string> = {
  en: "Tree sections",
  ru: "Разделы дерева",
  es: "Secciones del árbol",
};

export interface SubMenuItem {
  readonly label: string;
  readonly url: string;
}

export interface MenuItem {
  readonly key: string;
  readonly label: string;
  readonly url: string;
  readonly children?: readonly SubMenuItem[];
}

export interface InertiaSharedProps {
  readonly locale?: HomeLanguage;
  readonly navigation?: {
    readonly menu?: readonly MenuItem[];
  };

  readonly [key: string]: unknown;
}

/**
 * Вспомогательная функция для добавления языкового префикса к URL
 */
function withLocale(url: string, locale: string): string {
  if (!url) return `/${locale}`;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("#")) {
    return url;
  }
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `/${locale}${cleanUrl}`.replace(/\/+/g, "/");
}

export function CinematicHeader({
                                  inspect,
                                  language: propLanguage,
                                  onLanguageChange,
                                  sound,
                                  onToggleSound,
                                  onTree,
                                  onHome,
                                  onClose,
                                  backRef,
                                  logo,
                                  logoBlack,
                                  showClose = inspect,
                                  tone = inspect ? "dark" : "light",
                                }: {
  readonly inspect: boolean;
  readonly language?: HomeLanguage;
  readonly onLanguageChange?: (language: HomeLanguage) => void;
  readonly sound: boolean;
  readonly onToggleSound: () => void;
  readonly onTree: () => void;
  readonly onHome: () => void;
  readonly onClose: () => void;
  readonly backRef: RefObject<HTMLButtonElement | null>;
  readonly logo: string;
  readonly logoBlack: string;
  readonly showClose?: boolean;
  readonly tone?: "light" | "dark";
}) {
  const [expanded, setExpanded] = useState(false);
  const [treeExpanded, setTreeExpanded] = useState(false);

  // Получаем текущие данные из Inertia Page Props и URL
  const {url: currentPath, props} = usePage<InertiaSharedProps>();

  // Определяем язык из URL (props.locale) или используем проп по умолчанию
  const currentLanguage: HomeLanguage =
      (props.locale as HomeLanguage) ?? propLanguage ?? "en";

  const compact = useSyncExternalStore(
      subscribeCompactHeader,
      getCompactHeader,
      getServerCompactHeader,
  );

  const headerRef = useRef<HTMLElement>(null);
  const logoLink = useRef<HTMLAnchorElement>(null);
  const menuToggle = useRef<HTMLButtonElement>(null);
  const treeLink = useRef<HTMLAnchorElement>(null);
  const suppressLogoFocus = useRef(false);
  const suppressTreeFocus = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const treeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigationId = useId();
  const treeId = useId();
  const copy = homeCopy[currentLanguage] ?? homeCopy.en;

  // Динамическое меню из Shared Props
  const menuItems = props.navigation?.menu ?? [];
  const treeItem = menuItems.find((item) => item.key === "tree");
  const regularItems = menuItems.filter((item) => item.key !== "tree");

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
    setTreeExpanded(false);
  };

  const openNavigation = () => {
    cancelClose();
    if (document.activeElement === backRef.current)
      logoLink.current?.focus({preventScroll: true});
    setExpanded(true);
  };

  const openTree = () => {
    cancelTreeClose();
    setTreeExpanded(true);
  };

  // Обработчик переключения языка с подстановкой нового префикса в URL
  const handleLanguageSelect = (newLang: HomeLanguage) => {
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }

    if (newLang === currentLanguage) return;

    // Подменяем языковой префикс в текущем URL (например, /ru/about -> /es/about)
    const segments = currentPath.split("/").filter(Boolean);
    if (segments.length > 0 && ["en", "ru", "es"].includes(segments[0])) {
      segments[0] = newLang;
    } else {
      segments.unshift(newLang);
    }

    const newUrl = "/" + segments.join("/");
    collapse();
    router.get(newUrl);
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
      setTreeExpanded(false);
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
        setTreeExpanded(false);
      }
    };
    document.addEventListener("pointerdown", closeOutside, { passive: true });
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [expanded]);

  return (
      <header
          ref={headerRef}
          className={`cinematic-header inspect-header ${montserrat.variable}`}
          data-mode={inspect ? "inspect" : "cinematic"}
          data-tone={tone}
          data-expanded={expanded}
          data-tree-expanded={treeExpanded}
          data-compact={compact}
          data-navigation-surface="true"
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
              setTreeExpanded(false);
            }, 180);
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) collapse();
          }}
          onKeyDown={(event) => {
            if (!expanded || event.key !== "Escape") return;
            event.preventDefault();
            event.stopPropagation();
            if (compact) {
              collapse();
              menuToggle.current?.focus({ preventScroll: true });
            } else if (treeExpanded) {
              cancelTreeClose();
              setTreeExpanded(false);
              suppressTreeFocus.current = true;
              treeLink.current?.focus({ preventScroll: true });
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
            href={`/${currentLanguage}`}
            className="cinematic-logo inspect-logo"
            aria-label="Tree of Unity"
            onPointerEnter={(event) => {
              if (!compact && event.pointerType === "mouse") openNavigation();
            }}
            onFocus={() => {
              if (!compact && !suppressLogoFocus.current) openNavigation();
            }}
            onClick={(event) => {
              event.preventDefault();
              collapse();
              onHome();
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
          <button
              type="button"
              className="sound-toggle"
              data-state={sound ? "on" : "off"}
              aria-label={sound ? copy.soundOff : copy.soundOn}
              aria-pressed={sound}
              onClick={onToggleSound}
          >
            <span className="sound-toggle__label">SOUND</span>
          </button>

          <nav className="cinematic-nav" aria-label={copy.navigation.primary}>
            {/* Пункт Tree с подменю и языковыми роутами */}
            {treeItem ? (
                <div
                    className="cinematic-tree"
                    onPointerEnter={(event) => {
                      if (!compact && event.pointerType === "mouse") openTree();
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
                        setTreeExpanded(false);
                      }, 170);
                    }}
                    onBlur={(event) => {
                      if (
                          !compact &&
                          !event.currentTarget.contains(event.relatedTarget)
                      )
                        setTreeExpanded(false);
                    }}
                >
                  <Link
                      ref={treeLink}
                      className="cinematic-tree__trigger"
                      href={withLocale(treeItem.url, currentLanguage)}
                      aria-expanded={compact ? undefined : treeExpanded}
                      aria-controls={compact ? undefined : treeId}
                      onFocus={(event) => {
                        if (
                            !compact &&
                            !suppressTreeFocus.current &&
                            event.currentTarget.matches(":focus-visible")
                        )
                          openTree();
                      }}
                      onClick={(event) => {
                        event.preventDefault();
                        collapse();
                        onTree();
                      }}
                  >
                    {copy.navigation.tree || treeItem.label}
                  </Link>

                  {treeItem.children && treeItem.children.length > 0 ? (
                      <>
                        <button
                            className="cinematic-tree__toggle"
                            type="button"
                            aria-label={
                                treeSectionsLabel[currentLanguage] ?? treeSectionsLabel.en
                            }
                            aria-expanded={treeExpanded}
                            aria-controls={treeId}
                            onClick={() => {
                              cancelTreeClose();
                              setTreeExpanded((value) => !value);
                            }}
                        >
                          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                            <path
                                d="m5 7.5 5 5 5-5"
                                stroke="currentColor"
                                strokeWidth="1"
                            />
                          </svg>
                        </button>

                        <div
                            id={treeId}
                            className="tree-submenu"
                            data-open={treeExpanded}
                            aria-hidden={!treeExpanded}
                            inert={!treeExpanded}
                        >
                          <div className="tree-submenu__inner">
                            {treeItem.children.map((sub) => (
                                <Link
                                    key={sub.url}
                                    href={withLocale(sub.url, currentLanguage)}
                                    onClick={collapse}
                                >
                                  {sub.label}
                                </Link>
                            ))}
                          </div>
                        </div>
                      </>
                  ) : null}
                </div>
            ) : null}

            {/* Пункты меню с языковыми префиксами */}
            {regularItems.map((item, index) => {
              const halfIndex = Math.ceil(regularItems.length / 2) - 1;
              const isHalfway = index === halfIndex;

              return (
                  <Fragment key={item.key}>
                    {isHalfway ? (
                        <span className="inspect-menu__logo-space" aria-hidden="true"/>
                    ) : null}
                    <Link
                        href={withLocale(item.url, currentLanguage)}
                        onClick={collapse}
                    >
                      {(copy.navigation as Record<string, string>)[item.key] || item.label}
                    </Link>
                  </Fragment>
              );
            })}
          </nav>

          <div className="inspect-menu__language">
            <LanguageSelector
                language={currentLanguage}
                onChange={handleLanguageSelect}
            />
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
                  onClose();
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