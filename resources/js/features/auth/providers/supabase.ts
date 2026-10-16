import {createHmac, timingSafeEqual} from "node:crypto";
import {type CookieOptions, createServerClient, parseCookieHeader, serializeCookieHeader,} from "@supabase/ssr";
import type {Session, User} from "@supabase/supabase-js";
import {z} from "zod";
import type {AuthConfig} from "../config";
import type {AccountProvider, AccountSession} from "../provider-types";

const callbackPath = "/api/auth/callback/supabase";
const recoveryPath = "/account/reset-password?token=recovery";
const flowLifetime = 60 * 60;
const recoveryLifetime = 10 * 60;
const password = z.string().min(15).max(128);
const credentials = z.object({ email: z.email().max(254), password });
const signInCredentials = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(128),
});
const emailInput = z.object({ email: z.email().max(254) });
const receiptSchema = z.object({
  purpose: z.enum(["signup", "oauth", "recovery", "reset"]),
  expires: z.number(),
  exchange: z.enum(["pkce", "otp"]).optional(),
  credential: z.string().min(1).max(512).optional(),
  flowId: z.string().max(128).optional(),
});
type Receipt = z.infer<typeof receiptSchema>;
const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

function seal(config: AuthConfig, value: Receipt) {
  const body = Buffer.from(JSON.stringify(value)).toString("base64url");
  const signature = createHmac("sha256", config.secret)
    .update(`tou-supabase:${body}`)
    .digest("base64url");
  return `${body}.${signature}`;
}

function unseal(config: AuthConfig, value: string | undefined): Receipt | null {
  if (!value || value.length > 2048) return null;
  const [body, signature, extra] = value.split(".");
  if (!body || !signature || extra) return null;
  const expected = createHmac("sha256", config.secret)
    .update(`tou-supabase:${body}`)
    .digest();
  const supplied = Buffer.from(signature, "base64url");
  if (
    expected.length !== supplied.length ||
    !timingSafeEqual(expected, supplied)
  )
    return null;
  try {
    const result = receiptSchema.safeParse(
      JSON.parse(Buffer.from(body, "base64url").toString()),
    );
    return result.success && result.data.expires > Date.now() / 1000
      ? result.data
      : null;
  } catch {
    return null;
  }
}

function publicUser(user: User): AccountSession["user"] {
  return {
    id: user.id,
    email: user.email!,
    name: "Tree of Unity member",
    emailVerified: Boolean(user.email_confirmed_at),
  };
}

function createContext(config: AuthConfig, requestHeaders: Headers) {
  if (!config.supabase || config.secret.length < 32)
    throw new Error("AUTH_SUPABASE_CONFIGURATION_INVALID");
  const secure = new URL(config.baseURL).protocol === "https:";
  const prefix = secure ? "__Host-tou-sb" : "tou-sb";
  const cookies = new Map(
    parseCookieHeader(requestHeaders.get("cookie") ?? "").map(
      ({ name, value }) => [name, value],
    ),
  );
  const outgoing = new Map<string, string>();
  const responseHeaders = new Headers(privateHeaders);
  const cookieOptions = {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
  };
  const writeCookie = (
    name: string,
    value: string,
    options: CookieOptions = {},
  ) => {
    // Domain is intentionally excluded: host-only cookies cannot be planted by a sibling subdomain.
    const { domain: _domain, ...safeOptions } = options;
    void _domain;
    const hardened = { ...safeOptions, ...cookieOptions };
    outgoing.set(name, serializeCookieHeader(name, value, hardened));
    if (hardened.maxAge === 0 || value === "") cookies.delete(name);
    else cookies.set(name, value);
  };
  const client = createServerClient(
    config.supabase.url,
    config.supabase.publishableKey,
    {
      cookieOptions: {
        name: prefix,
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 7,
      },
      cookies: {
        encode: "tokens-only",
        getAll: () => [...cookies].map(([name, value]) => ({ name, value })),
        setAll: (updates, cacheHeaders) => {
          for (const item of updates)
            writeCookie(item.name, item.value, item.options);
          for (const [name, value] of Object.entries(cacheHeaders))
            responseHeaders.set(name, value);
        },
      },
    },
  );
  const finish = (data: unknown, status = 200) => {
    const headers = new Headers(responseHeaders);
    for (const cookie of outgoing.values())
      headers.append("Set-Cookie", cookie);
    return Response.json(data, { status, headers });
  };
  const redirect = (path: string) => {
    const response = finish(null, 303);
    response.headers.set("Location", new URL(path, config.baseURL).href);
    return response;
  };
  const fail = (status = 400, code = "AUTH_REQUEST_FAILED") =>
    finish(
      {
        code,
        message: "The request could not be completed. Please try again.",
      },
      status,
    );
  const clearAuth = () => {
    for (const name of cookies.keys())
      if (
        name === prefix ||
        name.startsWith(`${prefix}.`) ||
        name.startsWith(`${prefix}-`)
      )
        writeCookie(name, "", { maxAge: 0 });
  };
  const clearSession = () => {
    for (const name of cookies.keys())
      if (name === prefix || name.startsWith(`${prefix}.`))
        writeCookie(name, "", { maxAge: 0 });
  };
  const readReceipt = (kind: "flow" | "recovery") =>
    unseal(config, cookies.get(`${prefix}-${kind}`));
  const writeReceipt = (
    kind: "flow" | "recovery",
    value: Receipt,
    maxAge: number,
  ) => writeCookie(`${prefix}-${kind}`, seal(config, value), { maxAge });
  const clearReceipt = (kind: "flow" | "recovery") =>
    writeCookie(`${prefix}-${kind}`, "", { maxAge: 0 });
  return {
    client,
    cookies,
    outgoing,
    responseHeaders,
    finish,
    redirect,
    fail,
    clearAuth,
    clearSession,
    readReceipt,
    writeReceipt,
    clearReceipt,
  };
}

type Context = ReturnType<typeof createContext>;

async function verifiedIdentity(context: Context) {
  // getSession is used only to obtain the token; neither its cached user nor decoded
  // claims are trusted until this exact token has been checked by the Auth server.
  const { data, error } = await context.client.auth.getSession();
  if (error || !data.session?.access_token) return null;
  const result = await context.client.auth.getUser(data.session.access_token);
  const user = result.data.user;
  if (
    result.error ||
    !user?.email ||
    !user.email_confirmed_at ||
    user.is_anonymous
  )
    return null;
  return { user, session: data.session };
}

function sessionClaims(session: Session, user: User) {
  try {
    const claims = JSON.parse(
      Buffer.from(
        session.access_token.split(".")[1] ?? "",
        "base64url",
      ).toString(),
    ) as Record<string, unknown>;
    if (claims.sub !== user.id || typeof claims.session_id !== "string")
      return null;
    return claims;
  } catch {
    return null;
  }
}

function hasRecentRecovery(session: Session, user: User) {
  const claims = sessionClaims(session, user);
  return Boolean(
    claims &&
    Array.isArray(claims.amr) &&
    claims.amr.some((method: unknown) => {
      if (!method || typeof method !== "object") return false;
      const entry = method as Record<string, unknown>;
      return (
        entry.method === "recovery" &&
        typeof entry.timestamp === "number" &&
        entry.timestamp <= Date.now() / 1000 + 30 &&
        entry.timestamp > Date.now() / 1000 - recoveryLifetime
      );
    }),
  );
}

async function finishCallback(context: Context) {
  const identity = await verifiedIdentity(context);
  context.clearReceipt("flow");
  if (!identity) {
    context.clearAuth();
    return context.redirect("/account/login?error=verification");
  }
  context.clearReceipt("recovery");
  return context.redirect("/account");
}

function stageRecovery(
  context: Context,
  exchange: "pkce" | "otp",
  credential: string,
  flowId?: string,
) {
  // Delay the single-use credential exchange until the final password POST.
  // Clearing a browser cookie is not replay prevention: copied session JWTs can
  // remain valid after signOut. Supabase must consume the original code/token
  // on every reset attempt, so replay cannot bypass it with an old access token.
  const lifetime = exchange === "pkce" ? 5 * 60 : recoveryLifetime;
  context.writeReceipt(
    "recovery",
    {
      purpose: "reset",
      expires: Math.floor(Date.now() / 1000) + lifetime,
      exchange,
      credential,
      ...(flowId ? { flowId } : {}),
    },
    lifetime,
  );
  context.clearReceipt("flow");
  return context.redirect(recoveryPath);
}

export function createSupabaseProvider(config: AuthConfig): AccountProvider {
  return {
    async getSession(headers) {
      const context = createContext(config, headers);
      try {
        const identity = await verifiedIdentity(context);
        return identity ? { user: publicUser(identity.user) } : null;
      } catch {
        return null;
      }
    },
    async handle(request) {
      const context = createContext(config, request.headers);
      const { client, finish, fail } = context;
      const url = new URL(request.url);
      const endpoint = url.pathname.slice("/api/auth".length);
      try {
        if (request.method === "GET") {
          if (endpoint === "/get-session") {
            const identity = await verifiedIdentity(context);
            if (!identity) context.clearSession();
            return finish(
              identity ? { user: publicUser(identity.user) } : null,
            );
          }
          if (endpoint === "/callback/supabase") {
            const code = url.searchParams.get("code");
            const flowId = url.searchParams.get("sb_flow_id");
            const flow = context.readReceipt("flow");
            if (
              !code ||
              !/^[a-zA-Z0-9_-]{1,512}$/.test(code) ||
              !flow ||
              !["signup", "oauth", "recovery"].includes(flow.purpose) ||
              (flowId && !/^[a-zA-Z0-9_-]{1,128}$/.test(flowId))
            )
              return context.redirect("/account/login?error=verification");
            if (flow.purpose === "recovery")
              return stageRecovery(context, "pkce", code, flowId ?? undefined);
            const { error } = await client.auth.exchangeCodeForSession(
              code,
              flowId ? { flowId } : undefined,
            );
            if (error) {
              context.clearReceipt("flow");
              return context.redirect("/account/login?error=verification");
            }
            return finishCallback(context);
          }
          if (endpoint === "/confirm" || endpoint === "/verify-email") {
            const tokenHash = url.searchParams.get("token_hash");
            const type = url.searchParams.get("type");
            if (
              !tokenHash ||
              !/^[a-zA-Z0-9_-]{20,512}$/.test(tokenHash) ||
              (type !== "signup" && type !== "recovery")
            )
              return context.redirect("/account/login?error=verification");
            if (type === "recovery")
              return stageRecovery(context, "otp", tokenHash);
            const { error } = await client.auth.verifyOtp({
              token_hash: tokenHash,
              type,
            });
            if (error)
              return context.redirect("/account/login?error=verification");
            // A token-hash email link is not bound to this browser's PKCE verifier.
            // Confirm the address, then require an explicit login rather than
            // allowing an injected link to switch the browser's account.
            await client.auth.signOut({ scope: "local" });
            context.clearAuth();
            return context.redirect("/account/login?verified=true");
          }
          return fail(404, "NOT_FOUND");
        }
        if (request.method !== "POST") return fail(405, "METHOD_NOT_ALLOWED");
        const input: unknown = await request.json();
        if (endpoint === "/sign-up/email") {
          const parsed = credentials.safeParse(input);
          if (!parsed.success) return fail(400, "INVALID_INPUT");
          const result = await client.auth.signUp({
            ...parsed.data,
            options: {
              emailRedirectTo: `${config.baseURL}${callbackPath}`,
              data: { name: "Tree of Unity member" },
            },
          });
          // Even if a project accidentally disables confirmation, signup does not
          // establish an authenticated application session.
          if (result.data.session) {
            await client.auth.signOut({ scope: "local" });
            context.clearAuth();
          }
          if (result.error && result.error.status && result.error.status >= 500)
            return fail(503);
          context.writeReceipt(
            "flow",
            { purpose: "signup", expires: Date.now() / 1000 + flowLifetime },
            flowLifetime,
          );
          return finish({ user: null, token: null });
        }
        if (endpoint === "/sign-in/email") {
          const parsed = signInCredentials.safeParse(input);
          if (!parsed.success) return fail(400, "INVALID_INPUT");
          const { error } = await client.auth.signInWithPassword(parsed.data);
          if (error) {
            context.clearAuth();
            return fail(401, "INVALID_CREDENTIALS");
          }
          const identity = await verifiedIdentity(context);
          if (!identity) {
            await client.auth.signOut({ scope: "local" });
            context.clearAuth();
            return fail(401, "INVALID_CREDENTIALS");
          }
          context.clearReceipt("recovery");
          return finish({ user: publicUser(identity.user), token: null });
        }
        if (endpoint === "/sign-out") {
          const { error } = await client.auth.signOut({ scope: "local" });
          context.clearAuth();
          return error ? fail(503) : finish({ success: true });
        }
        if (
          endpoint === "/request-password-reset" ||
          endpoint === "/send-verification-email"
        ) {
          const parsed = emailInput.safeParse(input);
          if (!parsed.success) return fail(400, "INVALID_INPUT");
          if (endpoint === "/request-password-reset") {
            await client.auth.resetPasswordForEmail(parsed.data.email, {
              redirectTo: `${config.baseURL}${callbackPath}`,
            });
            context.writeReceipt(
              "flow",
              {
                purpose: "recovery",
                expires: Date.now() / 1000 + flowLifetime,
              },
              flowLifetime,
            );
          } else {
            await client.auth.resend({
              type: "signup",
              email: parsed.data.email,
              options: { emailRedirectTo: `${config.baseURL}${callbackPath}` },
            });
            context.writeReceipt(
              "flow",
              { purpose: "signup", expires: Date.now() / 1000 + flowLifetime },
              flowLifetime,
            );
          }
          return finish({ status: true });
        }
        if (endpoint === "/reset-password") {
          const parsed = z.object({ newPassword: password }).safeParse(input);
          if (!parsed.success) return fail(400, "INVALID_INPUT");
          const receipt = context.readReceipt("recovery");
          if (
            receipt?.purpose !== "reset" ||
            !receipt.exchange ||
            !receipt.credential
          )
            return fail(401, "INVALID_RECOVERY");
          context.clearReceipt("recovery");
          const exchanged =
            receipt.exchange === "otp"
              ? await client.auth.verifyOtp({
                  token_hash: receipt.credential,
                  type: "recovery",
                })
              : await client.auth.exchangeCodeForSession(
                  receipt.credential,
                  receipt.flowId ? { flowId: receipt.flowId } : undefined,
                );
          if (exchanged.error || !exchanged.data.session) {
            context.clearAuth();
            return fail(401, "INVALID_RECOVERY");
          }
          const verified = await client.auth.getUser(
            exchanged.data.session.access_token,
          );
          const recoveryUser = verified.data.user;
          // verifyOtp(type=recovery) itself validates the recovery credential;
          // GoTrue labels its returned token AMR as "otp". PKCE can exchange
          // login codes too, so that path additionally requires recovery AMR.
          if (
            verified.error ||
            !recoveryUser?.email_confirmed_at ||
            !sessionClaims(exchanged.data.session, recoveryUser) ||
            (receipt.exchange === "pkce" &&
              !hasRecentRecovery(exchanged.data.session, recoveryUser))
          ) {
            await client.auth.signOut({ scope: "local" });
            context.clearAuth();
            return fail(401, "INVALID_RECOVERY");
          }
          const { error } = await client.auth.updateUser({
            password: parsed.data.newPassword,
          });
          if (error) {
            await client.auth.signOut({ scope: "local" });
            context.clearAuth();
            return fail(400, "INVALID_RECOVERY");
          }
          // Revoke all refresh sessions, including this recovery session, before
          // asking the member to authenticate again with the new password.
          const revoked = await client.auth.signOut({ scope: "global" });
          context.clearAuth();
          return revoked.error
            ? fail(503, "SESSION_REVOCATION_FAILED")
            : finish({ status: true });
        }
        if (endpoint === "/sign-in/social") {
          const parsed = z
            .object({ provider: z.enum(["google", "apple"]) })
            .safeParse(input);
          if (
            !parsed.success ||
            !config.socialProviders.includes(parsed.data.provider)
          )
            return fail(400, "PROVIDER_UNAVAILABLE");
          // This endpoint only signs in. No linkIdentity or arbitrary provider,
          // scopes, authorization parameters, or callback URLs are forwarded.
          const { data, error } = await client.auth.signInWithOAuth({
            provider: parsed.data.provider,
            options: {
              redirectTo: `${config.baseURL}${callbackPath}`,
              skipBrowserRedirect: true,
            },
          });
          if (error || !data.url) return fail(503);
          const target = new URL(data.url);
          if (
            target.origin !== config.supabase!.url ||
            target.pathname !== "/auth/v1/authorize"
          )
            return fail(503);
          context.writeReceipt(
            "flow",
            { purpose: "oauth", expires: Date.now() / 1000 + flowLifetime },
            flowLifetime,
          );
          return finish({ url: target.href, redirect: true });
        }
        return fail(404, "NOT_FOUND");
      } catch {
        if (endpoint === "/reset-password") {
          try {
            await client.auth.signOut({ scope: "local" });
          } catch {
            /* Clear browser credentials even if the service is unavailable. */
          }
          context.clearAuth();
        }
        return fail(503);
      }
    },
  };
}

/** Call from Next's proxy before account server components render. Forward the
 * returned requestHeaders downstream and append every response Set-Cookie plus
 * the cache headers to the final response, including redirects. */
export async function refreshSupabaseSession(
  config: AuthConfig,
  request: Request,
) {
  const context = createContext(config, request.headers);
  let session: AccountSession | null = null;
  try {
    const identity = await verifiedIdentity(context);
    if (identity) session = { user: publicUser(identity.user) };
    else context.clearSession();
  } catch {
    /* A transient service failure must not authorize the request. */
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(
    "cookie",
    [...context.cookies]
      .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
      .join("; "),
  );
  for (const cookie of context.outgoing.values())
    context.responseHeaders.append("Set-Cookie", cookie);
  return { session, requestHeaders, responseHeaders: context.responseHeaders };
}
