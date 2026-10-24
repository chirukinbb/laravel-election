import {AccountExperience} from "./account-experience";
import type {AccountCapabilities} from "./types";

const defaultCapabilities: AccountCapabilities = {
  socialProviders: [],
  passwordResetEnabled: false,
  emailVerificationRequired: false,
  localMode: false,
};

export function AccountPageView({
                                  mode,
                                  token,
                                  error,
                                  capabilities,
                                  user: _user,
                                  loginUrl,
                                  registerUrl,
                                  signUpUrl,
                                  signinUrl,
                                  signInUrl,
                                  forgotPasswordUrl,
                                }: {
  mode: "login" | "signup" | "forgot" | "reset";
  token?: string;
  error?: boolean;
  user?: unknown;
  capabilities?: Partial<AccountCapabilities>;
  loginUrl?: string;
  registerUrl?: string;
  signUpUrl?: string;
  signinUrl?: string;
  signInUrl?: string;
  forgotPasswordUrl?: string;
}) {
  return (
      <AccountExperience
          mode={mode}
          capabilities={{...defaultCapabilities, ...capabilities}}
          loginUrl={loginUrl}
          registerUrl={registerUrl}
          signUpUrl={signUpUrl}
          signinUrl={signinUrl}
          signInUrl={signInUrl}
          forgotPasswordUrl={forgotPasswordUrl}
          {...(token ? {resetToken: token} : {})}
          {...(error ? {resetError: true} : {})}
      />
  );
}
