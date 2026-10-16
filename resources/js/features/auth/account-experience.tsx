"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import {type FormEvent, useEffect, useRef, useState} from "react";
import {didot, montserrat} from "@/features/home/fonts";
import {useHomeLanguage} from "@/features/home/use-home-language";
import {GlobalHeader} from "@/components/navigation/global-header";
import {localeDirection} from "@/i18n/locales";
import {authClient} from "./client";
import {accountCopy} from "./copy";
import type {AccountExperienceProps} from "./types";
import "./account.css";
import "@/features/home/cinematic-header.css";

function Arrow() {
  return (
    <svg
      className="directional-icon"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M3 12h17m-6-5 6 5-6 5" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

function Eye({ visible }: { readonly visible: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="23"
      height="23"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.25" />
      {visible ? (
        <path d="m3 3 18 18" stroke="currentColor" strokeWidth="1.25" />
      ) : null}
    </svg>
  );
}

function ProviderSymbol({
  provider,
}: {
  readonly provider: "google" | "apple";
}) {
  return provider === "google" ? (
    <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.87h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.35Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.12H3.05v2.59A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 13.91A6 6 0 0 1 6.09 12c0-.66.11-1.3.31-1.91V7.5H3.05A10 10 0 0 0 2 12c0 1.61.38 3.14 1.05 4.5l3.35-2.59Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.97c1.47 0 2.79.5 3.82 1.49l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.95 5.5l3.35 2.59C7.19 7.73 9.4 5.97 12 5.97Z"
      />
    </svg>
  ) : (
    <svg
      width="19"
      height="22"
      viewBox="0 0 20 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M14.2 3.8A5 5 0 0 0 15.3 0a5.4 5.4 0 0 0-3.5 1.8 4.8 4.8 0 0 0-1.2 3.7 4.4 4.4 0 0 0 3.6-1.7ZM18.9 17.4a12.5 12.5 0 0 1-1.6 2.9c-.9 1.3-1.9 2.7-3.3 2.7-1.3 0-1.7-.9-3.6-.9s-2.4.9-3.6.9c-1.4 0-2.4-1.3-3.3-2.6C1 16.6.7 11.8 2.3 9.2a5 5 0 0 1 4.2-2.5c1.4 0 2.7.9 3.6.9s2.5-1.1 4.2-.9a4.8 4.8 0 0 1 3.8 2.1 4.7 4.7 0 0 0-2.4 4.1 4.6 4.6 0 0 0 3.2 4.5Z" />
    </svg>
  );
}

type Completion = "verification" | "reset-sent" | "reset-success" | null;
type AccountErrorKey =
  | "rateLimit"
  | "invalidEmail"
  | "requiredPassword"
  | "invalidPassword"
  | "signupError"
  | "loginError"
  | "requestError"
  | "invalidReset";

function AccountForm({
  mode,
  capabilities,
  resetToken,
  resetError,
}: AccountExperienceProps) {
  const [language] = useHomeLanguage();
  const copy = accountCopy[language];
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const [error, setError] = useState<AccountErrorKey | "">("");
  const [fieldError, setFieldError] = useState<"email" | "password" | null>(
    null,
  );
  const [completion, setCompletion] = useState<Completion>(null);
  const [resendSent, setResendSent] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const completionRef = useRef<HTMLDivElement>(null);
  const isEntry = mode === "login" || mode === "signup";
  const invalidReset = mode === "reset" && (resetError || !resetToken);
  const unavailableReset =
    (mode === "forgot" || mode === "reset") &&
    !capabilities.passwordResetEnabled;

  useEffect(() => {
    if (error && !fieldError) messageRef.current?.focus();
  }, [error, fieldError]);

  useEffect(() => {
    if (completion) completionRef.current?.focus();
  }, [completion]);

  function clearSensitiveInput() {
    setPassword("");
    setShowPassword(false);
  }

  function beginRequest() {
    if (pendingRef.current) return false;
    pendingRef.current = true;
    setPending(true);
    setError("");
    setFieldError(null);
    return true;
  }

  function finishRequest() {
    pendingRef.current = false;
    setPending(false);
    clearSensitiveInput();
  }

  function reportError(
    result: {
      readonly code?: string | undefined;
      readonly status?: number | undefined;
    },
    fallback: AccountErrorKey,
  ) {
    setError(
      result.status === 429 || result.code === "TOO_MANY_REQUESTS"
        ? "rateLimit"
        : fallback,
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRef.current || invalidReset || unavailableReset) return;
    const address = email.trim();
    if (
      mode !== "reset" &&
      (address.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address))
    ) {
      setFieldError("email");
      setError("invalidEmail");
      emailRef.current?.focus();
      return;
    }
    if (
      mode !== "forgot" &&
      (!password ||
        password.length > 128 ||
        (mode !== "login" && password.length < 15))
    ) {
      setFieldError("password");
      setError(
        mode === "login" && !password ? "requiredPassword" : "invalidPassword",
      );
      passwordRef.current?.focus();
      return;
    }
    if (!beginRequest()) return;
    try {
      if (mode === "signup") {
        const result = await authClient.signUp.email({
          name: "Tree of Unity member",
          email: address,
          password,
          callbackURL: "/account",
        });
        if (result.error) {
          reportError(result.error, "signupError");
        } else if (capabilities.emailVerificationRequired) {
          setEmail(address);
          setCompletion("verification");
        } else {
          router.replace("/account");
          router.refresh();
        }
      } else if (mode === "login") {
        const result = await authClient.signIn.email({
          email: address,
          password,
          callbackURL: "/account",
        });
        if (result.error) reportError(result.error, "loginError");
        else {
          router.replace("/account");
          router.refresh();
        }
      } else if (mode === "forgot") {
        const result = await authClient.requestPasswordReset({
          email: address,
          redirectTo: "/account/reset-password",
        });
        if (result.error) reportError(result.error, "requestError");
        else setCompletion("reset-sent");
      } else if (resetToken) {
        const result = await authClient.resetPassword({
          token: resetToken,
          newPassword: password,
        });
        if (result.error) reportError(result.error, "invalidReset");
        else setCompletion("reset-success");
      }
    } catch {
      setError("requestError");
    } finally {
      finishRequest();
    }
  }

  async function signInSocial(provider: "google" | "apple") {
    if (!capabilities.socialProviders.includes(provider) || !beginRequest())
      return;
    clearSensitiveInput();
    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: "/account",
      });
      if (result.error) reportError(result.error, "requestError");
    } catch {
      setError("requestError");
    } finally {
      finishRequest();
    }
  }

  async function resendVerification() {
    if (resendSent || !beginRequest()) return;
    try {
      const result = await authClient.sendVerificationEmail({
        email: email.trim(),
        callbackURL: "/account",
      });
      if (result.error) reportError(result.error, "requestError");
      else {
        setResendSent(true);
      }
    } catch {
      setError("requestError");
    } finally {
      finishRequest();
    }
  }

  const submitLabel =
    mode === "signup"
      ? copy.createAccount
      : mode === "forgot"
        ? copy.sendResetLink
        : mode === "reset"
          ? copy.savePassword
          : copy.continue;
  const title = copy.title[mode];

  return (
    <div
      className={`account-experience ${didot.variable} ${montserrat.variable}`}
      lang={language}
      dir={localeDirection(language)}
    >
      <GlobalHeader onNavigate={clearSensitiveInput} />
      <div className="account-layout">
        <div className="account-intro">
          <h1 className="account-title">
            {title.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>
        </div>
        <section
          className="account-panel"
          aria-label={
            mode === "signup"
              ? copy.signup
              : mode === "forgot"
                ? copy.forgotPassword
                : mode === "reset"
                  ? copy.newPassword
                  : copy.login
          }
        >
          {isEntry ? (
            <nav className="account-tabs" aria-label={copy.navigation}>
              <Link
                href="/account/login"
                aria-current={mode === "login" ? "page" : undefined}
                onClick={clearSensitiveInput}
              >
                {copy.login}
              </Link>
              <Link
                href="/account/register"
                aria-current={mode === "signup" ? "page" : undefined}
                onClick={clearSensitiveInput}
              >
                {copy.signup}
              </Link>
            </nav>
          ) : null}

          {completion ? (
            <div
              className="account-completion"
              ref={completionRef}
              tabIndex={-1}
            >
              <h2>
                {completion === "verification"
                  ? copy.verificationTitle
                  : completion === "reset-sent"
                    ? copy.resetSentTitle
                    : copy.resetSuccessTitle}
              </h2>
              <p>
                {completion === "verification"
                  ? copy.verificationMessage
                  : completion === "reset-sent"
                    ? copy.resetSent
                    : copy.resetSuccess}
              </p>
              {completion === "verification" ? (
                <button
                  className="account-text-button"
                  type="button"
                  disabled={pending || resendSent}
                  onClick={resendVerification}
                >
                  {pending ? copy.working : copy.resend}
                </button>
              ) : null}
              <p className="account-inline-status" role="status">
                {resendSent ? copy.resent : ""}
              </p>
              <Link className="account-back" href="/account/login">
                {copy.backToLogin}
                <Arrow />
              </Link>
            </div>
          ) : unavailableReset || invalidReset ? (
            <div className="account-completion">
              <p>
                {unavailableReset ? copy.resetUnavailable : copy.invalidReset}
              </p>
              <Link
                className="account-back"
                href={
                  unavailableReset ? "/contact" : "/account/forgot-password"
                }
              >
                {unavailableReset ? copy.contact : copy.requestNewLink}
                <Arrow />
              </Link>
            </div>
          ) : (
            <>
              {mode === "forgot" ? (
                <p className="account-reset-intro">{copy.resetIntro}</p>
              ) : null}
              <form
                className="account-form"
                onSubmit={submit}
                noValidate
                aria-busy={pending}
              >
                {mode !== "reset" ? (
                  <div className="account-field">
                    <label htmlFor="account-email">{copy.email}</label>
                    <input
                      ref={emailRef}
                      id="account-email"
                      name="email"
                      type="email"
                      dir="ltr"
                      autoComplete="email"
                      inputMode="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      maxLength={254}
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      readOnly={pending}
                      aria-invalid={fieldError === "email"}
                      aria-describedby={
                        fieldError === "email" ? "account-feedback" : undefined
                      }
                    />
                  </div>
                ) : null}
                {mode !== "forgot" ? (
                  <div className="account-field account-field--password">
                    <label htmlFor="account-password">
                      {mode === "signup"
                        ? copy.createPassword
                        : mode === "reset"
                          ? copy.newPassword
                          : copy.password}
                    </label>
                    <div className="account-password-control">
                      <input
                        ref={passwordRef}
                        id="account-password"
                        name="password"
                        dir="ltr"
                        type={showPassword ? "text" : "password"}
                        autoComplete={
                          mode === "login" ? "current-password" : "new-password"
                        }
                        minLength={mode === "login" ? undefined : 15}
                        maxLength={128}
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        readOnly={pending}
                        aria-invalid={fieldError === "password"}
                        aria-describedby={
                          [
                            mode !== "login" ? "account-password-hint" : "",
                            fieldError === "password" ? "account-feedback" : "",
                          ]
                            .filter(Boolean)
                            .join(" ") || undefined
                        }
                      />
                      <button
                        type="button"
                        className="account-password-toggle"
                        aria-label={
                          showPassword ? copy.hidePassword : copy.showPassword
                        }
                        aria-pressed={showPassword}
                        disabled={pending}
                        onClick={() => setShowPassword((visible) => !visible)}
                      >
                        <Eye visible={showPassword} />
                      </button>
                    </div>
                    {mode !== "login" ? (
                      <p
                        id="account-password-hint"
                        className="account-field-hint"
                      >
                        {copy.passwordHint}
                      </p>
                    ) : null}
                  </div>
                ) : null}
                {mode === "login" ? (
                  <Link
                    className="account-forgot"
                    href="/account/forgot-password"
                    onClick={clearSensitiveInput}
                  >
                    {copy.forgotPassword}
                  </Link>
                ) : null}
                <button
                  className="account-submit"
                  type="submit"
                  disabled={pending}
                >
                  <span>{pending ? copy.working : submitLabel}</span>
                  {pending ? (
                    <span className="account-pending" aria-hidden="true" />
                  ) : (
                    <Arrow />
                  )}
                </button>
              </form>
              {isEntry && capabilities.socialProviders.length > 0 ? (
                <div className="account-social">
                  <div className="account-divider">
                    <span>{copy.or}</span>
                  </div>
                  <div className="account-social-options">
                    {capabilities.socialProviders.map((provider) => (
                      <button
                        key={provider}
                        type="button"
                        disabled={pending}
                        onClick={() => signInSocial(provider)}
                      >
                        <ProviderSymbol provider={provider} />
                        <span>{copy[provider]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {mode === "signup" ? (
                <p className="account-switch">
                  {copy.alreadyMember}{" "}
                  <Link href="/account/login" onClick={clearSensitiveInput}>
                    {copy.login}
                  </Link>
                </p>
              ) : !isEntry ? (
                <Link
                  className="account-back"
                  href="/account/login"
                  onClick={clearSensitiveInput}
                >
                  {copy.backToLogin}
                </Link>
              ) : null}
            </>
          )}
          <div
            id="account-feedback"
            className="account-feedback"
            role="alert"
            aria-live="polite"
            ref={messageRef}
            tabIndex={-1}
          >
            {error ? copy[error] : ""}
          </div>
          <footer className="account-footer" aria-label={copy.legal}>
            <Link href="/legal/terms">{copy.terms}</Link>
            <Link href="/legal/privacy">{copy.privacy}</Link>
            <Link href="/legal/cookies">{copy.cookies}</Link>
          </footer>
        </section>
      </div>
    </div>
  );
}

export function AccountExperience(props: AccountExperienceProps) {
  return <AccountForm key={props.mode} {...props} />;
}
