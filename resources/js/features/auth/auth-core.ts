import {chmodSync, mkdirSync} from "node:fs";
import path from "node:path";
import {DatabaseSync} from "node:sqlite";
import {betterAuth} from "better-auth";
import {getMigrations} from "better-auth/db/migration";
import nodemailer from "nodemailer";
import type {AuthConfig} from "./config";

export async function createAccountAuth(config: AuthConfig) {
  mkdirSync(path.dirname(config.databasePath), {
    recursive: true,
    mode: 0o700,
  });
  const database = new DatabaseSync(config.databasePath);
  chmodSync(config.databasePath, 0o600);
  database.exec(
    "PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;",
  );
  const transport = config.mail
    ? nodemailer.createTransport({
        host: config.mail.host,
        port: config.mail.port,
        secure: config.mail.port === 465,
        requireTLS: config.mail.port !== 465,
        auth: { user: config.mail.user, pass: config.mail.password },
        connectionTimeout: 10_000,
        socketTimeout: 15_000,
        disableFileAccess: true,
        disableUrlAccess: true,
      })
    : null;
  const sendMail = async (to: string, subject: string, text: string) => {
    if (!transport || !config.mail) throw new Error("AUTH_EMAIL_UNAVAILABLE");
    await transport.sendMail({ from: config.mail.from, to, subject, text });
  };
  const auth = betterAuth({
    appName: "Tree of Unity",
    baseURL: config.baseURL,
    secret: config.secret,
    database,
    trustedOrigins: [config.baseURL],
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 15,
      maxPasswordLength: 128,
      requireEmailVerification: Boolean(config.mail),
      revokeSessionsOnPasswordReset: true,
      resetPasswordTokenExpiresIn: 900,
      ...(config.mail
        ? {
            sendResetPassword: async ({
              user,
              url,
            }: {
              user: { email: string };
              url: string;
            }) => {
              await sendMail(
                user.email,
                "Reset your Tree of Unity password",
                `Use this link within 15 minutes to set a new password:\n\n${url}\n\nIf you did not request this, ignore this message.`,
              );
            },
          }
        : {}),
    },
    ...(config.mail
      ? {
          emailVerification: {
            sendOnSignUp: true,
            autoSignInAfterVerification: false,
            expiresIn: 3600,
            sendVerificationEmail: async ({
              user,
              url,
            }: {
              user: { email: string };
              url: string;
            }) => {
              await sendMail(
                user.email,
                "Verify your Tree of Unity email",
                `Verify your email address using this link within one hour:\n\n${url}\n\nIf you did not create this account, ignore this message.`,
              );
            },
          },
        }
      : {}),
    socialProviders: {
      ...(config.google ? { google: config.google } : {}),
      ...(config.apple ? { apple: config.apple } : {}),
    },
    account: { accountLinking: { enabled: false }, encryptOAuthTokens: true },
    verification: { storeIdentifier: "hashed" },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      freshAge: 60 * 15,
      cookieCache: { enabled: false },
    },
    advanced: {
      useSecureCookies: config.baseURL.startsWith("https:"),
      cookiePrefix: "tou",
      defaultCookieAttributes: { httpOnly: true, sameSite: "lax", path: "/" },
      // The route wrapper overwrites this header; external forwarded IPs are never trusted.
      ipAddress: { ipAddressHeaders: ["x-tou-auth-ip"] },
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 100,
      customRules: {
        "/sign-up/email": { window: 60, max: 10 },
        "/sign-in/email": { window: 60, max: 10 },
        "/request-password-reset": { window: 60, max: 5 },
        "/send-verification-email": { window: 60, max: 5 },
        "/reset-password": { window: 60, max: 5 },
      },
    },
    logger: { disabled: true },
    onAPIError: { throw: false },
  });
  try {
    const migration = await getMigrations(auth.options);
    await migration.runMigrations();
  } catch (error) {
    transport?.close();
    database.close();
    throw error;
  }
  return {
    auth,
    database,
    close: () => {
      transport?.close();
      database.close();
    },
  };
}

export type AccountAuth = Awaited<ReturnType<typeof createAccountAuth>>;
