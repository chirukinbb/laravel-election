import path from "node:path";
import {z} from "zod";

const optional = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().optional(),
);

const authEnvironment = z.object({
  AUTH_PROVIDER: z.enum(["local", "supabase"]).default("local"),
  BETTER_AUTH_URL: z.url(),
  BETTER_AUTH_SECRET: optional,
  AUTH_LOCAL_MODE: z.enum(["true", "false"]).default("false"),
  AUTH_DATABASE_PATH: z.string().min(1).default(".data/auth.sqlite"),
  AUTH_TRUSTED_IP_HEADER: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.enum(["x-real-ip", "cf-connecting-ip"]).optional(),
  ),
  AUTH_SMTP_HOST: optional,
  AUTH_SMTP_PORT: optional,
  AUTH_SMTP_USER: optional,
  AUTH_SMTP_PASSWORD: optional,
  AUTH_EMAIL_FROM: optional,
  AUTH_GOOGLE_CLIENT_ID: optional,
  AUTH_GOOGLE_CLIENT_SECRET: optional,
  AUTH_APPLE_CLIENT_ID: optional,
  AUTH_APPLE_CLIENT_SECRET: optional,
  AUTH_SUPABASE_URL: optional,
  AUTH_SUPABASE_PUBLISHABLE_KEY: optional,
  AUTH_SOCIAL_PROVIDERS: z.string().default(""),
});

export function readAuthConfig(
  environment: Record<string, string | undefined>,
  root = process.cwd(),
) {
  const result = authEnvironment.safeParse(environment);
  if (!result.success) throw new Error("AUTH_CONFIGURATION_INVALID");
  const env = result.data;
  if (
    !env.BETTER_AUTH_SECRET ||
    env.BETTER_AUTH_SECRET.length < 32 ||
    env.BETTER_AUTH_SECRET.length > 512
  )
    throw new Error("AUTH_SECRET_INVALID");
  const url = new URL(env.BETTER_AUTH_URL);
  const localMode = env.AUTH_LOCAL_MODE === "true";
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/" ||
    (localMode ? !loopback : url.protocol !== "https:") ||
    !["http:", "https:"].includes(url.protocol)
  )
    throw new Error("AUTH_ORIGIN_INVALID");

  const databasePath = path.resolve(root, env.AUTH_DATABASE_PATH);
  const publicPath = path.resolve(root, "public");
  const relativePublic = path.relative(publicPath, databasePath);
  if (
    !relativePublic.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relativePublic)
  ) {
    throw new Error("AUTH_DATABASE_MUST_BE_PRIVATE");
  }
  const mailFields = [
    env.AUTH_SMTP_HOST,
    env.AUTH_SMTP_USER,
    env.AUTH_SMTP_PASSWORD,
    env.AUTH_EMAIL_FROM,
  ];
  const hasMail = mailFields.every(Boolean);
  if (mailFields.some(Boolean) && !hasMail)
    throw new Error("AUTH_MAIL_CONFIGURATION_INCOMPLETE");
  if (env.AUTH_PROVIDER === "local" && !localMode && !hasMail)
    throw new Error("AUTH_PRODUCTION_REQUIRES_EMAIL_VERIFICATION");
  if (
    env.AUTH_PROVIDER === "local" &&
    !localMode &&
    !env.AUTH_TRUSTED_IP_HEADER
  )
    throw new Error("AUTH_PRODUCTION_REQUIRES_TRUSTED_INGRESS");
  const smtpPort = Number(env.AUTH_SMTP_PORT ?? 587);
  if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535)
    throw new Error("AUTH_MAIL_PORT_INVALID");
  if (
    env.AUTH_EMAIL_FROM &&
    (!z.email().safeParse(env.AUTH_EMAIL_FROM).success ||
      /[\r\n]/.test(env.AUTH_EMAIL_FROM))
  )
    throw new Error("AUTH_MAIL_FROM_INVALID");
  for (const pair of [
    [env.AUTH_GOOGLE_CLIENT_ID, env.AUTH_GOOGLE_CLIENT_SECRET],
    [env.AUTH_APPLE_CLIENT_ID, env.AUTH_APPLE_CLIENT_SECRET],
  ]) {
    if (pair.some(Boolean) && !pair.every(Boolean))
      throw new Error("AUTH_OAUTH_CONFIGURATION_INCOMPLETE");
  }
  const socialProviders = env.AUTH_SOCIAL_PROVIDERS.split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (socialProviders.some((entry) => !["google", "apple"].includes(entry)))
    throw new Error("AUTH_SOCIAL_PROVIDER_INVALID");
  let supabase: { url: string; publishableKey: string } | null = null;
  if (env.AUTH_PROVIDER === "supabase") {
    if (!env.AUTH_SUPABASE_URL || !env.AUTH_SUPABASE_PUBLISHABLE_KEY)
      throw new Error("AUTH_SUPABASE_CONFIGURATION_INCOMPLETE");
    const serviceURL = new URL(env.AUTH_SUPABASE_URL);
    if (
      serviceURL.protocol !== "https:" ||
      serviceURL.username ||
      serviceURL.password ||
      serviceURL.search ||
      serviceURL.hash ||
      serviceURL.pathname !== "/"
    )
      throw new Error("AUTH_SUPABASE_URL_INVALID");
    const key = env.AUTH_SUPABASE_PUBLISHABLE_KEY;
    let anonymousKey = false;
    try {
      anonymousKey =
        JSON.parse(Buffer.from(key.split(".")[1] ?? "", "base64url").toString())
          .role === "anon";
    } catch {
      /* New publishable keys are opaque. */
    }
    if (!key.startsWith("sb_publishable_") && !anonymousKey)
      throw new Error("AUTH_SUPABASE_PUBLIC_KEY_REQUIRED");
    supabase = { url: serviceURL.origin, publishableKey: key };
  }

  return {
    provider: env.AUTH_PROVIDER,
    baseURL: url.origin,
    secret: env.BETTER_AUTH_SECRET ?? "",
    databasePath,
    localMode,
    trustedIPHeader: !localMode ? env.AUTH_TRUSTED_IP_HEADER : undefined,
    supabase,
    socialProviders: socialProviders as ("google" | "apple")[],
    mail: hasMail
      ? {
          host: env.AUTH_SMTP_HOST!,
          port: smtpPort,
          user: env.AUTH_SMTP_USER!,
          password: env.AUTH_SMTP_PASSWORD!,
          from: env.AUTH_EMAIL_FROM!,
        }
      : null,
    google: env.AUTH_GOOGLE_CLIENT_ID
      ? {
          clientId: env.AUTH_GOOGLE_CLIENT_ID,
          clientSecret: env.AUTH_GOOGLE_CLIENT_SECRET!,
        }
      : null,
    apple: env.AUTH_APPLE_CLIENT_ID
      ? {
          clientId: env.AUTH_APPLE_CLIENT_ID,
          clientSecret: env.AUTH_APPLE_CLIENT_SECRET!,
        }
      : null,
  };
}

export type AuthConfig = ReturnType<typeof readAuthConfig>;

export function publicAuthCapabilities(config: AuthConfig) {
  return {
    socialProviders:
      config.provider === "supabase"
        ? config.socialProviders
        : [
            config.google ? ("google" as const) : null,
            config.apple ? ("apple" as const) : null,
          ].filter((provider) => provider !== null),
    passwordResetEnabled:
      config.provider === "supabase" || Boolean(config.mail),
    emailVerificationRequired:
      config.provider === "supabase" || Boolean(config.mail),
    localMode: config.localMode,
  };
}
