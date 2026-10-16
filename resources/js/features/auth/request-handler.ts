import type {AccountProvider} from "./provider-types";
import {isIP} from "node:net";
import type {AuthConfig} from "./config";

const MAX_BODY_BYTES = 8192;
const writePaths = new Set([
  "/sign-up/email",
  "/sign-in/email",
  "/sign-out",
  "/request-password-reset",
  "/reset-password",
  "/send-verification-email",
  "/sign-in/social",
]);
const readPaths = new Set(["/get-session", "/verify-email"]);
const headers = {
  "Cache-Control": "no-store, private",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
};
function reject(status: number, code: string) {
  return Response.json(
    { code, message: "The request could not be completed." },
    { status, headers },
  );
}

async function readBoundedBody(request: Request) {
  if (!request.body) return "{}";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks).toString("utf8");
}

export async function handleAuthRequest(
  request: Request,
  config: AuthConfig,
  getAuth: () => Promise<AccountProvider>,
) {
  const url = new URL(request.url);
  // Next normalizes loopback URLs to localhost and can use its internal listener
  // address behind a proxy. Validate the actual Host, then use our fixed origin.
  const expectedOrigin = new URL(config.baseURL);
  if ((request.headers.get("host") ?? url.host) !== expectedOrigin.host)
    return reject(403, "INVALID_REQUEST_HOST");
  const endpoint = url.pathname.slice("/api/auth".length);
  const provider = endpoint.match(/^\/callback\/(google|apple)$/)?.[1];
  const serviceCallback =
    config.provider === "supabase" &&
    ["/callback/supabase", "/confirm"].includes(endpoint);
  const oauthCallback =
    config.provider === "local" &&
    Boolean(provider && config[provider as "google" | "apple"]);
  const resetRedirect = /^\/reset-password\/[a-zA-Z0-9_-]+$/.test(endpoint);
  if (
    request.method === "GET"
      ? !readPaths.has(endpoint) &&
        !oauthCallback &&
        !resetRedirect &&
        !serviceCallback
      : request.method !== "POST" ||
        (!writePaths.has(endpoint) && !oauthCallback)
  )
    return reject(404, "NOT_FOUND");
  if (
    config.provider === "local" &&
    !config.mail &&
    (endpoint === "/verify-email" ||
      endpoint === "/send-verification-email" ||
      endpoint === "/request-password-reset" ||
      endpoint.startsWith("/reset-password"))
  )
    return reject(503, "EMAIL_UNAVAILABLE");
  const forwardedHeaders = new Headers(request.headers);
  // Public deployments must block direct access and overwrite this configured header at ingress.
  const clientIP = config.trustedIPHeader
    ? request.headers.get(config.trustedIPHeader)?.trim()
    : "127.0.0.1";
  if (!clientIP || !isIP(clientIP))
    return reject(403, "INVALID_CLIENT_IDENTITY");
  forwardedHeaders.set("x-tou-auth-ip", clientIP);
  for (const name of [
    "x-forwarded-for",
    "x-real-ip",
    "cf-connecting-ip",
    "forwarded",
    "x-forwarded-host",
    "x-forwarded-proto",
  ])
    forwardedHeaders.delete(name);
  let body: string | undefined;
  if (request.method === "POST") {
    const origin = request.headers.get("origin");
    const appleCallback = oauthCallback && provider === "apple";
    if (
      !appleCallback &&
      (origin !== config.baseURL ||
        request.headers.get("sec-fetch-site") === "cross-site")
    )
      return reject(403, "INVALID_ORIGIN");
    if (appleCallback && origin !== "https://appleid.apple.com")
      return reject(403, "INVALID_ORIGIN");
    const contentType = request.headers
      .get("content-type")
      ?.split(";")[0]
      ?.trim();
    if (
      contentType !==
      (appleCallback ? "application/x-www-form-urlencoded" : "application/json")
    )
      return reject(415, "INVALID_CONTENT_TYPE");
    if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES)
      return reject(413, "BODY_TOO_LARGE");
    const boundedBody = await readBoundedBody(request);
    if (boundedBody === null) return reject(413, "BODY_TOO_LARGE");
    body = boundedBody;
    if (!appleCallback) {
      let input: Record<string, unknown>;
      try {
        input = JSON.parse(body) as Record<string, unknown>;
      } catch {
        return reject(400, "INVALID_INPUT");
      }
      if (!input || typeof input !== "object" || Array.isArray(input))
        return reject(400, "INVALID_INPUT");
      for (const key of [
        "callbackURL",
        "newUserCallbackURL",
        "errorCallbackURL",
        "redirectTo",
      ]) {
        if (input[key] !== undefined) {
          if (typeof input[key] !== "string")
            return reject(400, "INVALID_CALLBACK");
          try {
            if (new URL(input[key], config.baseURL).origin !== config.baseURL)
              return reject(400, "INVALID_CALLBACK");
          } catch {
            return reject(400, "INVALID_CALLBACK");
          }
        }
      }
      if (typeof input.email === "string")
        input.email = input.email.trim().toLowerCase();
      if (endpoint === "/sign-up/email") {
        // No editable profile fields or authorization attributes are accepted at registration.
        input = {
          email: input.email,
          password: input.password,
          name: "Tree of Unity member",
          callbackURL: "/account",
        };
      }
      if (endpoint === "/sign-in/social") {
        // The UI starts a redirect flow; account linking, ID-token sign-in and arbitrary scopes are not exposed.
        input = {
          provider: input.provider,
          callbackURL: "/account",
          errorCallbackURL: "/account/login",
        };
      }
      body = JSON.stringify(input);
    }
    forwardedHeaders.delete("content-length");
  }
  const service = await getAuth();
  let response = await service.handle(
    new Request(`${config.baseURL}${url.pathname}${url.search}`, {
      method: request.method,
      headers: forwardedHeaders,
      ...(body !== undefined ? { body } : {}),
    }),
  );
  if (
    [
      "/sign-up/email",
      "/sign-in/email",
      "/sign-in/social",
      "/get-session",
    ].includes(endpoint) &&
    response.ok &&
    response.headers.get("content-type")?.includes("application/json")
  ) {
    const payload = await response.json();
    if (payload && typeof payload === "object") {
      delete payload.token;
      if (payload.session && typeof payload.session === "object")
        delete payload.session.token;
    }
    response = Response.json(payload, {
      status: response.status,
      headers: response.headers,
    });
  }
  for (const [name, value] of Object.entries(headers))
    response.headers.set(name, value);
  return response;
}
