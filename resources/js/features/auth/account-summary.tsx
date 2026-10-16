"use client";

import Link from "next/link";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {didot, montserrat} from "@/features/home/fonts";
import {useHomeLanguage} from "@/features/home/use-home-language";
import {GlobalHeader} from "@/components/navigation/global-header";
import {localeDirection} from "@/i18n/locales";
import {authClient} from "./client";
import {accountSummaryCopy} from "./copy";
import "./account-summary.css";
import "@/features/home/cinematic-header.css";

export function AccountSummary({ email }: { email: string }) {
  const [language] = useHomeLanguage();
  const text = accountSummaryCopy[language];
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  async function logout() {
    if (busy) return;
    setBusy(true);
    setError(false);
    try {
      const result = await authClient.signOut();
      if (result.error) {
        setError(true);
        return;
      }
      router.replace("/account/login");
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <GlobalHeader />
      <section
        className={`account-summary ${didot.variable} ${montserrat.variable}`}
        lang={language}
        dir={localeDirection(language)}
      >
        <div>
          <p className="account-summary__eyebrow">{text.signedIn}</p>
          <h1>{text.title}</h1>
          <p className="account-summary__email">
            <bdi dir="ltr">{email}</bdi>
          </p>
          <Link href="/">
            {text.explore}{" "}
            <span className="directional-icon" aria-hidden="true">
              →
            </span>
          </Link>
          <button type="button" disabled={busy} onClick={logout}>
            {text.logout}
          </button>
          {error ? <p role="alert">{text.error}</p> : null}
        </div>
      </section>
    </>
  );
}
