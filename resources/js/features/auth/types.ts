export type AccountMode = "login" | "signup" | "forgot" | "reset";

export interface AccountCapabilities {
  readonly socialProviders: readonly ("google" | "apple")[];
  readonly passwordResetEnabled: boolean;
  readonly emailVerificationRequired: boolean;
  readonly localMode: boolean;
}

export interface AccountExperienceProps {
    readonly mode: AccountMode;
    readonly capabilities: AccountCapabilities;
    readonly resetToken?: string;
    readonly resetError?: boolean;
    readonly loginUrl?: string;
    readonly registerUrl?: string;
    readonly signUpUrl?: string;
    readonly signinUrl?: string;
    readonly signInUrl?: string;
    readonly forgotPasswordUrl?: string;
    readonly navigation?: {
        readonly loginUrl?: string;
        readonly registerUrl?: string;
        readonly signUpUrl?: string;
        readonly signinUrl?: string;
        readonly signInUrl?: string;
        readonly forgotPasswordUrl?: string;
    };
}
