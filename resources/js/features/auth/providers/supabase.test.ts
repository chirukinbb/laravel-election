// @vitest-environment node
import {beforeEach, describe, expect, it, vi} from "vitest";
import {type CookieMethodsServer, parseCookieHeader} from "@supabase/ssr";
import {readAuthConfig} from "../config";
import {createSupabaseProvider, refreshSupabaseSession} from "./supabase";

const mocked = vi.hoisted(() => ({
  factory: vi.fn(),
  auth: {
    getSession: vi.fn(),
    getUser: vi.fn(),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    resend: vi.fn(),
    updateUser: vi.fn(),
    signInWithOAuth: vi.fn(),
    exchangeCodeForSession: vi.fn(),
    verifyOtp: vi.fn(),
  },
}));
vi.mock("@supabase/ssr", async (original) => ({
  ...(await original<typeof import("@supabase/ssr")>()),
  createServerClient: mocked.factory,
}));

const config = readAuthConfig({
  AUTH_PROVIDER: "supabase",
  BETTER_AUTH_URL: "https://tou.example",
  BETTER_AUTH_SECRET:
    "test-app-secret-that-is-longer-than-thirty-two-characters",
  AUTH_SUPABASE_URL: "https://project.supabase.co",
  AUTH_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
  AUTH_SOCIAL_PROVIDERS: "google,apple",
});
const provider = createSupabaseProvider(config);
const goodPassword = "A sufficiently long password";
const user = {
  id: "member-123",
  email: "member@example.test",
  email_confirmed_at: "2026-09-24T00:00:00Z",
  user_metadata: { role: "admin" },
};
let methods: CookieMethodsServer;
function token(recovery = false, sessionId = "session-123") {
  return `header.${Buffer.from(JSON.stringify({ sub: user.id, session_id: sessionId, amr: [{ method: recovery ? "recovery" : "password", timestamp: Date.now() / 1000 }] })).toString("base64url")}.signature`;
}
function session(recovery = false, sessionId?: string) {
  return {
    access_token: token(recovery, sessionId),
    refresh_token: "secret-refresh-token",
    user: { ...user, id: "forged-cookie-user" },
  };
}
function request(endpoint: string, input?: unknown, cookie = "") {
  return new Request(`${config.baseURL}/api/auth${endpoint}`, {
    method: input === undefined ? "GET" : "POST",
    headers: {
      cookie,
      origin: config.baseURL,
      "content-type": "application/json",
    },
    ...(input !== undefined ? { body: JSON.stringify(input) } : {}),
  });
}
function cookiesFrom(response: Response) {
  return response.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
}
async function writeToken() {
  await methods.setAll!(
    [
      {
        name: "__Host-tou-sb",
        value: "secret-cookie-value",
        options: {
          httpOnly: false,
          domain: ".example",
          secure: false,
          sameSite: "none",
          path: "/wrong",
        },
      },
    ],
    {
      "Cache-Control":
        "private, no-cache, no-store, must-revalidate, max-age=0",
    },
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  mocked.factory.mockImplementation(
    (_url, _key, options: { cookies: CookieMethodsServer }) => {
      methods = options.cookies;
      return { auth: mocked.auth };
    },
  );
  mocked.auth.getSession.mockResolvedValue({
    data: { session: session() },
    error: null,
  });
  mocked.auth.getUser.mockResolvedValue({ data: { user }, error: null });
  mocked.auth.signUp.mockResolvedValue({
    data: { user, session: null },
    error: null,
  });
  mocked.auth.signInWithPassword.mockImplementation(async () => {
    await writeToken();
    return { data: { user, session: session() }, error: null };
  });
  mocked.auth.signOut.mockResolvedValue({ error: null });
  mocked.auth.resetPasswordForEmail.mockResolvedValue({
    data: {},
    error: null,
  });
  mocked.auth.resend.mockResolvedValue({ data: {}, error: null });
  mocked.auth.updateUser.mockResolvedValue({ data: { user }, error: null });
  mocked.auth.signInWithOAuth.mockResolvedValue({
    data: {
      url: "https://project.supabase.co/auth/v1/authorize?provider=google",
    },
    error: null,
  });
  mocked.auth.exchangeCodeForSession.mockResolvedValue({
    data: { user, session: session() },
    error: null,
  });
  mocked.auth.verifyOtp.mockResolvedValue({
    data: { user, session: session(true) },
    error: null,
  });
});

describe("Supabase server-only account adapter", () => {
  it.each(["short", "x".repeat(129)])(
    "validates password boundaries before sending credentials upstream",
    async (password) => {
      const response = await provider.handle(
        request("/sign-up/email", { email: user.email, password }),
      );
      expect(response.status).toBe(400);
      expect(mocked.auth.signUp).not.toHaveBeenCalled();
    },
  );

  it("ignores injected metadata, fixes signup callback and reveals no account existence or tokens", async () => {
    const response = await provider.handle(
      request("/sign-up/email", {
        email: user.email,
        password: goodPassword,
        name: "Admin",
        role: "admin",
        callbackURL: "https://evil.test",
      }),
    );
    expect(mocked.auth.signUp).toHaveBeenCalledWith({
      email: user.email,
      password: goodPassword,
      options: {
        data: { name: "Tree of Unity member" },
        emailRedirectTo: "https://tou.example/api/auth/callback/supabase",
      },
    });
    expect(await response.json()).toEqual({ user: null, token: null });
    mocked.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { status: 400, message: "Already exists" },
    });
    const duplicate = await provider.handle(
      request("/sign-up/email", { email: user.email, password: goodPassword }),
    );
    expect(duplicate.status).toBe(response.status);
    expect(await duplicate.json()).toEqual({ user: null, token: null });
  });

  it("does not create a usable signup session if the upstream auto-confirms", async () => {
    mocked.auth.signUp.mockImplementation(async () => {
      await writeToken();
      return { data: { user, session: session() }, error: null };
    });
    const response = await provider.handle(
      request("/sign-up/email", { email: user.email, password: goodPassword }),
    );
    expect(mocked.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(
      response.headers
        .getSetCookie()
        .find((value) => value.startsWith("__Host-tou-sb=")),
    ).toContain("Max-Age=0");
  });

  it("verifies the exact token remotely, keeps tokens out of JSON and hardens every cookie", async () => {
    const response = await provider.handle(
      request("/sign-in/email", { email: user.email, password: goodPassword }),
    );
    expect(mocked.auth.getUser).toHaveBeenCalledWith(
      expect.stringContaining("header."),
    );
    const body = await response.json();
    expect(body).toEqual({
      user: {
        id: user.id,
        email: user.email,
        name: "Tree of Unity member",
        emailVerified: true,
      },
      token: null,
    });
    expect(JSON.stringify(body)).not.toContain("secret");
    const cookie = response.headers
      .getSetCookie()
      .find((value) => value.startsWith("__Host-tou-sb="))!;
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/");
    expect(cookie).not.toContain("Domain=");
    expect(cookie).not.toContain("/wrong");
    expect(response.headers.get("cache-control")).toContain("no-store");
  });

  it("denies an unconfirmed address even after a successful password exchange", async () => {
    mocked.auth.getUser.mockResolvedValue({
      data: { user: { ...user, email_confirmed_at: undefined } },
      error: null,
    });
    const response = await provider.handle(
      request("/sign-in/email", { email: user.email, password: goodPassword }),
    );
    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({
      code: "INVALID_CREDENTIALS",
    });
    expect(mocked.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("does not trust the cached cookie user or expose upstream error details", async () => {
    mocked.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "invalid refresh token private internals" },
    });
    expect(await provider.getSession(new Headers())).toBeNull();
    mocked.auth.signInWithPassword.mockResolvedValue({
      data: {},
      error: { message: "member exists, password mismatch" },
    });
    const response = await provider.handle(
      request("/sign-in/email", { email: user.email, password: goodPassword }),
    );
    expect(await response.text()).not.toMatch(/member exists|mismatch/);
  });

  it("refreshes cookies for both downstream server rendering and the final response", async () => {
    mocked.auth.getSession.mockImplementation(async () => {
      await writeToken();
      return { data: { session: session() }, error: null };
    });
    const refreshed = await refreshSupabaseSession(
      config,
      request("/get-session"),
    );
    expect(refreshed.session?.user.id).toBe(user.id);
    expect(refreshed.requestHeaders.get("cookie")).toContain(
      "__Host-tou-sb=secret-cookie-value",
    );
    expect(refreshed.responseHeaders.getSetCookie().join(" ")).toContain(
      "HttpOnly",
    );
    expect(refreshed.responseHeaders.get("cache-control")).toContain(
      "no-store",
    );
  });

  it("preserves pending PKCE/confirmation state during unauthenticated session refresh", async () => {
    mocked.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    const refreshed = await refreshSupabaseSession(
      config,
      request(
        "/get-session",
        undefined,
        "__Host-tou-sb-code-verifier=verifier; __Host-tou-sb-flow=signed-flow; __Host-tou-sb=expired",
      ),
    );
    expect(refreshed.requestHeaders.get("cookie")).toContain(
      "code-verifier=verifier",
    );
    expect(refreshed.requestHeaders.get("cookie")).toContain(
      "flow=signed-flow",
    );
    expect(refreshed.requestHeaders.get("cookie")).not.toContain("=expired");
  });

  it("uses a provider allowlist, fixed OAuth callback and signed local flow receipt", async () => {
    const denied = await provider.handle(
      request("/sign-in/social", { provider: "github" }),
    );
    expect(denied.status).toBe(400);
    expect(mocked.auth.signInWithOAuth).not.toHaveBeenCalled();
    const response = await provider.handle(
      request("/sign-in/social", {
        provider: "google",
        callbackURL: "https://evil.test",
        scopes: "admin",
      }),
    );
    expect(mocked.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: "https://tou.example/api/auth/callback/supabase",
        skipBrowserRedirect: true,
      },
    });
    const noState = await provider.handle(
      request("/callback/supabase?code=valid-code"),
    );
    expect(noState.headers.get("location")).toBe(
      "https://tou.example/account/login?error=verification",
    );
    expect(mocked.auth.exchangeCodeForSession).not.toHaveBeenCalled();
    const callback = await provider.handle(
      request(
        "/callback/supabase?code=valid-code&sb_flow_id=flow123&next=https://evil.test",
        undefined,
        cookiesFrom(response),
      ),
    );
    expect(mocked.auth.exchangeCodeForSession).toHaveBeenCalledWith(
      "valid-code",
      { flowId: "flow123" },
    );
    expect(callback.headers.get("location")).toBe(
      "https://tou.example/account",
    );
  });

  it("rejects unexpected upstream OAuth redirect hosts", async () => {
    mocked.auth.signInWithOAuth.mockResolvedValue({
      data: { url: "https://evil.test/steal" },
      error: null,
    });
    expect(
      (
        await provider.handle(
          request("/sign-in/social", { provider: "google" }),
        )
      ).status,
    ).toBe(503);
  });

  it("normalizes unknown-address reset responses and never forwards arbitrary redirectTo", async () => {
    mocked.auth.resetPasswordForEmail.mockResolvedValue({
      data: null,
      error: { message: "user not found" },
    });
    const response = await provider.handle(
      request("/request-password-reset", {
        email: user.email,
        redirectTo: "https://evil.test",
      }),
    );
    expect(await response.json()).toEqual({ status: true });
    expect(mocked.auth.resetPasswordForEmail).toHaveBeenCalledWith(user.email, {
      redirectTo: "https://tou.example/api/auth/callback/supabase",
    });
  });

  it("rejects reset from an ordinary sign-in session without calling updateUser", async () => {
    const response = await provider.handle(
      request("/reset-password", {
        newPassword: goodPassword,
        token: "recovery",
      }),
    );
    expect(response.status).toBe(401);
    expect(mocked.auth.updateUser).not.toHaveBeenCalled();
  });

  it("does not grant recovery to a password JWT even when client cookies label its flow recovery", async () => {
    const pending = await provider.handle(
      request("/request-password-reset", { email: user.email }),
    );
    const response = await provider.handle(
      request(
        "/callback/supabase?code=password-auth-code",
        undefined,
        cookiesFrom(pending),
      ),
    );
    expect(mocked.auth.exchangeCodeForSession).not.toHaveBeenCalled();
    const reset = await provider.handle(
      request(
        "/reset-password",
        { newPassword: goodPassword },
        cookiesFrom(response),
      ),
    );
    expect(reset.status).toBe(401);
    expect(mocked.auth.updateUser).not.toHaveBeenCalled();
  });

  it("exchanges the one-use recovery credential at final submission, never on GET, and revokes sessions", async () => {
    const confirm = await provider.handle(
      request(
        `/confirm?token_hash=${"a".repeat(40)}&type=recovery&next=https://evil.test`,
      ),
    );
    expect(mocked.auth.verifyOtp).not.toHaveBeenCalled();
    expect(confirm.headers.get("location")).toBe(
      "https://tou.example/account/reset-password?token=recovery",
    );
    const grant = cookiesFrom(confirm);
    const reset = await provider.handle(
      request("/reset-password", { newPassword: goodPassword }, grant),
    );
    expect(reset.status).toBe(200);
    expect(mocked.auth.verifyOtp).toHaveBeenCalledWith({
      token_hash: "a".repeat(40),
      type: "recovery",
    });
    expect(mocked.auth.updateUser).toHaveBeenCalledWith({
      password: goodPassword,
    });
    expect(mocked.auth.signOut).toHaveBeenCalledWith({ scope: "global" });
    expect(reset.headers.getSetCookie().join(" ")).toContain("Max-Age=0");
  });

  it.each(["otp", "pkce"])(
    "cannot bypass a rejected one-time %s exchange by replaying an old valid access session",
    async (exchange) => {
      const pending = await provider.handle(
        request("/request-password-reset", { email: user.email }),
      );
      const staged =
        exchange === "otp"
          ? await provider.handle(
              request(`/confirm?token_hash=${"a".repeat(40)}&type=recovery`),
            )
          : await provider.handle(
              request(
                "/callback/supabase?code=one-time-code&sb_flow_id=flow123",
                undefined,
                cookiesFrom(pending),
              ),
            );
      const exchanger =
        exchange === "otp"
          ? mocked.auth.verifyOtp
          : mocked.auth.exchangeCodeForSession;
      // Model the documented service contract: the first exchange succeeds, all
      // subsequent exchanges of the same credential fail. This verifies adapter
      // dispatch, not a live hosted project's one-use or revocation configuration.
      let consumed = false;
      exchanger.mockImplementation(async () => {
        if (consumed)
          return {
            data: { session: null, user: null },
            error: { message: "credential already consumed" },
          };
        consumed = true;
        return { data: { session: session(true), user }, error: null };
      });
      mocked.auth.getSession.mockResolvedValue({
        data: { session: session(true) },
        error: null,
      });
      const replayableCookies = `${cookiesFrom(staged)}; __Host-tou-sb=old-valid-access-cookie; __Host-tou-sb-code-verifier=original-verifier`;
      const [first, second] = await Promise.all([
        provider.handle(
          request(
            "/reset-password",
            { newPassword: goodPassword },
            replayableCookies,
          ),
        ),
        provider.handle(
          request(
            "/reset-password",
            { newPassword: goodPassword },
            replayableCookies,
          ),
        ),
      ]);
      expect([first.status, second.status].sort()).toEqual([200, 401]);
      expect(exchanger).toHaveBeenCalledTimes(2);
      expect(mocked.auth.updateUser).toHaveBeenCalledTimes(1);
      const replay = await provider.handle(
        request(
          "/reset-password",
          { newPassword: goodPassword },
          replayableCookies,
        ),
      );
      expect(replay.status).toBe(401);
      expect(mocked.auth.updateUser).toHaveBeenCalledTimes(1);
    },
  );

  it("allows a shorter existing hosted password at sign-in without weakening new-password validation", async () => {
    const response = await provider.handle(
      request("/sign-in/email", { email: user.email, password: "legacy-pass" }),
    );
    expect(response.status).toBe(200);
    expect(mocked.auth.signInWithPassword).toHaveBeenCalledWith({
      email: user.email,
      password: "legacy-pass",
    });
    expect(
      (
        await provider.handle(
          request("/sign-up/email", {
            email: user.email,
            password: "legacy-pass",
          }),
        )
      ).status,
    ).toBe(400);
  });

  it("rejects tampered or expired staged recovery receipts before consuming the credential", async () => {
    mocked.auth.getSession.mockResolvedValue({
      data: { session: session(true) },
      error: null,
    });
    const confirm = await provider.handle(
      request(`/confirm?token_hash=${"a".repeat(40)}&type=recovery`),
    );
    const cookie = parseCookieHeader(cookiesFrom(confirm)).find((value) =>
      value.name.endsWith("-recovery"),
    )!;
    const forged = `${cookie.name}=tampered.${cookie.value.split(".")[1]}`;
    expect(
      (
        await provider.handle(
          request("/reset-password", { newPassword: goodPassword }, forged),
        )
      ).status,
    ).toBe(401);
    expect(mocked.auth.updateUser).not.toHaveBeenCalled();
    vi.spyOn(Date, "now").mockReturnValue(Date.now() + 11 * 60 * 1000);
    const expired = await provider.handle(
      request(
        "/reset-password",
        { newPassword: goodPassword },
        cookiesFrom(confirm),
      ),
    );
    expect(expired.status).toBe(401);
    expect(mocked.auth.verifyOtp).not.toHaveBeenCalled();
  });

  it("clears the short-lived session when final password update fails after consuming a recovery token", async () => {
    mocked.auth.verifyOtp.mockImplementation(async () => {
      await writeToken();
      return { data: { session: session(), user }, error: null };
    });
    mocked.auth.updateUser.mockResolvedValue({
      data: { user: null },
      error: { message: "provider rejected password" },
    });
    const confirm = await provider.handle(
      request(`/confirm?token_hash=${"a".repeat(40)}&type=recovery`),
    );
    const reset = await provider.handle(
      request(
        "/reset-password",
        { newPassword: goodPassword },
        cookiesFrom(confirm),
      ),
    );
    expect(reset.status).toBe(400);
    expect(mocked.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
    const authCookie = reset.headers
      .getSetCookie()
      .find((value) => value.startsWith("__Host-tou-sb="))!;
    expect(authCookie).toContain("Max-Age=0");
  });

  it("does not allow arbitrary OTP types or turn cross-device signup confirmation into login", async () => {
    const badType = await provider.handle(
      request(`/confirm?token_hash=${"a".repeat(40)}&type=email_change`),
    );
    expect(badType.status).toBe(303);
    expect(mocked.auth.verifyOtp).not.toHaveBeenCalled();
    const response = await provider.handle(
      request(`/confirm?token_hash=${"a".repeat(40)}&type=signup`),
    );
    expect(response.headers.get("location")).toBe(
      "https://tou.example/account/login?verified=true",
    );
    expect(mocked.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("does not turn an injected signup email token into login even when another signup flow is pending", async () => {
    const pending = await provider.handle(
      request("/sign-up/email", {
        email: "victim@example.test",
        password: goodPassword,
      }),
    );
    mocked.auth.verifyOtp.mockImplementation(async () => {
      await writeToken();
      return { data: { session: session(), user }, error: null };
    });
    const response = await provider.handle(
      request(
        `/confirm?token_hash=${"a".repeat(40)}&type=signup`,
        undefined,
        cookiesFrom(pending),
      ),
    );
    expect(response.headers.get("location")).toBe(
      "https://tou.example/account/login?verified=true",
    );
    expect(mocked.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(
      response.headers
        .getSetCookie()
        .find((value) => value.startsWith("__Host-tou-sb=")),
    ).toContain("Max-Age=0");
    expect(mocked.auth.getUser).not.toHaveBeenCalled();
  });
});
