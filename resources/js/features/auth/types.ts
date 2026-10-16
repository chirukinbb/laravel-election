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
}
