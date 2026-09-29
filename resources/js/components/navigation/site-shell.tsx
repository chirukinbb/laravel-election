"use client";

import {usePathname} from "next/navigation";
import type {ReactNode} from "react";
import {GlobalHeader} from "./global-header";
import {Container} from "@/components/ui/container";

export function SiteShell({children}: { readonly children: ReactNode }) {
    const pathname = usePathname();
    const home =
        pathname === "/" || pathname === "/golden-leaves" || pathname === "/voting";
    return (
        <>
            <a className="skip-link" href="#main-content">
                Skip to main content
            </a>
            {home ? null : <GlobalHeader/>}
            <main
                className={home ? "cinematic-main" : "site-main"}
                id="main-content"
                tabIndex={-1}
            >
                {children}
            </main>
            {home ? null : (
                <footer className="site-footer">
                    <Container>
                        <p>Tree of Unity · Project visualisation</p>
                    </Container>
                </footer>
            )}
        </>
    );
}
