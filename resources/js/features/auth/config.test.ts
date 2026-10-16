// @vitest-environment node
import {expect, it} from "vitest";
import {publicAuthCapabilities, readAuthConfig} from "./config";

const base = {
  AUTH_LOCAL_MODE: "true",
  BETTER_AUTH_URL: "http://127.0.0.1:3000",
  BETTER_AUTH_SECRET: "test-only-long-configuration-secret-not-for-production",
};
it("fails closed for public local mode, missing secrets and public database storage", () => {
  expect(() =>
    readAuthConfig({ ...base, BETTER_AUTH_URL: "https://example.com" }),
  ).toThrow("AUTH_ORIGIN_INVALID");
  expect(() =>
    readAuthConfig({
      ...base,
      AUTH_LOCAL_MODE: "false",
      BETTER_AUTH_URL: "https://example.com",
    }),
  ).toThrow("AUTH_PRODUCTION_REQUIRES_EMAIL_VERIFICATION");
  expect(() =>
    readAuthConfig({ ...base, BETTER_AUTH_SECRET: "short" }),
  ).toThrow("AUTH_SECRET_INVALID");
  expect(() =>
    readAuthConfig({ ...base, AUTH_DATABASE_PATH: "public/accounts.sqlite" }),
  ).toThrow("AUTH_DATABASE_MUST_BE_PRIVATE");
});
it("switches provider using configuration and exports only public capabilities", () => {
  const hosted = readAuthConfig({
    ...base,
    AUTH_PROVIDER: "supabase",
    AUTH_SUPABASE_URL: "https://project.supabase.co",
    AUTH_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
    AUTH_SOCIAL_PROVIDERS: "google",
  });
  expect(hosted.provider).toBe("supabase");
  expect(publicAuthCapabilities(hosted)).toEqual({
    localMode: true,
    emailVerificationRequired: true,
    passwordResetEnabled: true,
    socialProviders: ["google"],
  });
  expect(JSON.stringify(publicAuthCapabilities(hosted))).not.toContain(
    base.BETTER_AUTH_SECRET,
  );
  expect(() =>
    readAuthConfig({
      ...base,
      AUTH_PROVIDER: "supabase",
      AUTH_SUPABASE_URL: "https://project.supabase.co",
      AUTH_SUPABASE_PUBLISHABLE_KEY: "sb_secret_do_not_use",
    }),
  ).toThrow("AUTH_SUPABASE_PUBLIC_KEY_REQUIRED");
});

it("requires a deliberately configured trusted ingress in public local-provider mode", () => {
  const publicConfig = {
    ...base,
    AUTH_LOCAL_MODE: "false",
    BETTER_AUTH_URL: "https://example.com",
    AUTH_SMTP_HOST: "mail.example.com",
    AUTH_SMTP_USER: "test",
    AUTH_SMTP_PASSWORD: "test",
    AUTH_EMAIL_FROM: "no-reply@example.com",
  };
  expect(() => readAuthConfig(publicConfig)).toThrow(
    "AUTH_PRODUCTION_REQUIRES_TRUSTED_INGRESS",
  );
  expect(
    readAuthConfig({ ...publicConfig, AUTH_TRUSTED_IP_HEADER: "x-real-ip" })
      .trustedIPHeader,
  ).toBe("x-real-ip");
  expect(() =>
    readAuthConfig({
      ...publicConfig,
      AUTH_TRUSTED_IP_HEADER: "x-forwarded-for",
    }),
  ).toThrow("AUTH_CONFIGURATION_INVALID");
});
