"use client";

import {useState} from "react";
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
      window.location.assign("/account/login");
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
          <a href="/">
            {text.explore}{" "}
            <span className="directional-icon" aria-hidden="true">
              →
            </span>
          </a>
          <button type="button" disabled={busy} onClick={logout}>
            {text.logout}
          </button>
          {error ? <p role="alert">{text.error}</p> : null}
        </div>
      </section>
    </>
  );
}
