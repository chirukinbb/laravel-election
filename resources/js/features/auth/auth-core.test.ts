// @vitest-environment node
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {mkdtempSync, rmSync} from "node:fs";
import {tmpdir} from "node:os";
import path from "node:path";
import {randomBytes} from "node:crypto";
import {type AccountAuth, createAccountAuth} from "./auth-core";
import {type AuthConfig, readAuthConfig} from "./config";
import {handleAuthRequest} from "./request-handler";
import type {AccountProvider} from "./provider-types";

const mail = vi.hoisted(
  () => [] as { to: string; subject: string; text: string }[],
);
vi.mock("nodemailer", () => ({
  default: {
    createTransport: () => ({
      sendMail: async (message: {
        to: string;
        subject: string;
        text: string;
      }) => {
        mail.push(message);
      },
      close: () => {},
    }),
  },
}));

const origin = "http://127.0.0.1:3000";
const password = "An original long passphrase! 834";
let directory: string;
let config: AuthConfig;
let service: AccountAuth;
let provider: AccountProvider;

function adapt(local: AccountAuth): AccountProvider {
  return {
    handle: (request) => local.auth.handler(request),
    getSession: (headers) => local.auth.api.getSession({ headers }),
  };
}
async function request(
  endpoint: string,
  body?: unknown,
  cookie?: string,
  extraHeaders: Record<string, string> = {},
) {
  return handleAuthRequest(
    new Request(`${origin}/api/auth${endpoint}`, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        origin,
        "content-type": "application/json",
        ...(cookie ? { cookie } : {}),
        ...extraHeaders,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }),
    config,
    async () => provider,
  );
}
function sessionCookie(response: Response) {
  return response.headers
    .getSetCookie()
    .filter((entry) => entry.startsWith("tou.session_token="))
    .map((entry) => entry.split(";")[0])
    .join("; ");
}
async function register(email = "one@example.test") {
  return request("/sign-up/email", { email, password, name: "Test member" });
}

beforeEach(async () => {
  directory = mkdtempSync(path.join(tmpdir(), "tou-account-test-"));
  config = readAuthConfig({
    AUTH_PROVIDER: "local",
    AUTH_LOCAL_MODE: "true",
    BETTER_AUTH_URL: origin,
    BETTER_AUTH_SECRET: randomBytes(48).toString("base64url"),
    AUTH_DATABASE_PATH: path.join(directory, "auth.sqlite"),
  });
  service = await createAccountAuth(config);
  provider = adapt(service);
  mail.length = 0;
});
afterEach(() => {
  service.close();
  rmSync(directory, { recursive: true, force: true });
});

describe("local account security boundaries", () => {
  it("supports Next's normalized loopback URL while enforcing Host and browser Origin", async () => {
    const makeRequest = (host: string, browserOrigin: string) =>
      new Request("http://localhost:3000/api/auth/sign-up/email", {
        method: "POST",
        headers: {
          host,
          origin: browserOrigin,
          "content-type": "application/json",
        },
        body: JSON.stringify({ email: "next-request@example.test", password }),
      });
    expect(
      (
        await handleAuthRequest(
          makeRequest("attacker.invalid", origin),
          config,
          async () => provider,
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await handleAuthRequest(
          makeRequest("127.0.0.1:3000", "http://localhost:3000"),
          config,
          async () => provider,
        )
      ).status,
    ).toBe(403);
    const result = await handleAuthRequest(
      makeRequest("127.0.0.1:3000", origin),
      config,
      async () => provider,
    );
    expect(result.status).toBe(200);
    expect(sessionCookie(result)).not.toBe("");
  });
  it("persists hashed credentials, rotates login sessions and invalidates logout across restart", async () => {
    const result = await register();
    expect(result.status).toBe(200);
    const cookie = sessionCookie(result);
    expect(cookie).toMatch(/^tou\.session_token=/);
    expect(result.headers.get("set-cookie")).toContain("HttpOnly");
    expect(result.headers.get("set-cookie")).toContain("SameSite=Lax");
    expect(await result.json()).not.toHaveProperty("token");
    const stored = service.database
      .prepare("SELECT password FROM account WHERE providerId = ?")
      .get("credential") as { password: string };
    expect(stored.password).not.toContain(password);
    expect(stored.password.length).toBeGreaterThan(64);
    service.close();
    service = await createAccountAuth(config);
    provider = adapt(service);
    const identity = await request("/get-session", undefined, cookie);
    expect((await identity.json()).user.email).toBe("one@example.test");
    expect(identity.headers.get("cache-control")).toContain("no-store");
    expect((await request("/sign-out", {}, cookie)).status).toBe(200);
    expect(
      await (await request("/get-session", undefined, cookie)).json(),
    ).toBeNull();
    const loggedIn = await request("/sign-in/email", {
      email: "one@example.test",
      password,
    });
    expect(loggedIn.status).toBe(200);
    expect(sessionCookie(loggedIn)).not.toBe(cookie);
  });

  it("rejects missing/cross-site origins, forbidden routes, unsafe callbacks and oversized streamed bodies before auth", async () => {
    const denyProvider = vi.fn(async () => provider);
    for (const hostileOrigin of ["null", "https://attacker.invalid", ""]) {
      const response = await handleAuthRequest(
        new Request(`${origin}/api/auth/sign-up/email`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(hostileOrigin ? { origin: hostileOrigin } : {}),
          },
          body: JSON.stringify({
            email: "x@example.test",
            password,
            name: "X",
          }),
        }),
        config,
        denyProvider,
      );
      expect(response.status).toBe(403);
    }
    expect(denyProvider).not.toHaveBeenCalled();
    expect(
      (
        await request("/sign-in/email", {
          email: "one@example.test",
          password,
          callbackURL: "https://attacker.invalid",
        })
      ).status,
    ).toBe(400);
    expect(
      (await request("/update-user", { name: "Unauthorised" })).status,
    ).toBe(404);
    expect(
      (await request("/sign-in/email", { password: "x".repeat(9000) })).status,
    ).toBe(413);
    expect(
      (
        await request("/sign-up/email", {}, undefined, {
          "content-type": "text/plain",
        })
      ).status,
    ).toBe(415);
  });

  it("enforces password limits and rejects forged sessions and unexpected signup privileges", async () => {
    expect(
      (
        await request("/sign-up/email", {
          email: "short@example.test",
          password: "short",
          name: "X",
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await request("/sign-up/email", {
          email: "long@example.test",
          password: "x".repeat(129),
          name: "X",
        })
      ).status,
    ).toBe(400);
    const result = await request("/sign-up/email", {
      email: "  MEMBER@Example.test  ",
      password,
      name: "<script>bad</script>",
      emailVerified: true,
      role: "admin",
      image: "https://attacker.invalid/pixel",
    });
    expect(result.status).toBe(200);
    const user = (await result.json()).user;
    expect(user.email).toBe("member@example.test");
    expect(user.emailVerified).toBe(false);
    expect(user.name).toBe("Tree of Unity member");
    expect(user).not.toHaveProperty("role");
    expect(
      await (
        await request("/get-session", undefined, "tou.session_token=forged")
      ).json(),
    ).toBeNull();
  });

  it("does not confuse accounts and expires a server-side session", async () => {
    const first = sessionCookie(await register("first@example.test"));
    const second = sessionCookie(await register("second@example.test"));
    expect(
      (await (await request("/get-session", undefined, first)).json()).user
        .email,
    ).toBe("first@example.test");
    expect(
      (await (await request("/get-session", undefined, second)).json()).user
        .email,
    ).toBe("second@example.test");
    service.database
      .prepare("UPDATE session SET expiresAt = ?")
      .run(Date.now() - 60_000);
    expect(
      await (await request("/get-session", undefined, first)).json(),
    ).toBeNull();
    expect(
      await (await request("/get-session", undefined, second)).json(),
    ).toBeNull();
  });

  it("bounds concurrent credential attempts even with spoofed forwarded headers", async () => {
    const replies = await Promise.all(
      Array.from({ length: 14 }, (_, index) =>
        request(
          "/sign-in/email",
          { email: "unknown@example.test", password },
          undefined,
          {
            "x-forwarded-for": `198.51.100.${index}`,
            "x-tou-auth-ip": `203.0.113.${index}`,
          },
        ),
      ),
    );
    expect(
      replies.filter((response) => response.status === 429).length,
    ).toBeGreaterThanOrEqual(4);
    expect(
      replies.filter((response) => response.status === 401).length,
    ).toBeLessThanOrEqual(10);
  });

  it("isolates trusted ingress client quotas and rejects absent or malformed identities", async () => {
    config = { ...config, trustedIPHeader: "x-real-ip" };
    expect((await request("/sign-in/email", {}, undefined)).status).toBe(403);
    expect(
      (
        await request("/sign-in/email", {}, undefined, {
          "x-real-ip": "198.51.100.1, 198.51.100.2",
        })
      ).status,
    ).toBe(403);
    const attempts = await Promise.all(
      Array.from({ length: 11 }, () =>
        request(
          "/sign-in/email",
          { email: "unknown@example.test", password },
          undefined,
          { "x-real-ip": "198.51.100.1" },
        ),
      ),
    );
    expect(attempts.some((response) => response.status === 429)).toBe(true);
    const unrelated = await request(
      "/sign-in/email",
      { email: "unknown@example.test", password },
      undefined,
      {
        "x-real-ip": "198.51.100.2",
        "x-tou-auth-ip": "198.51.100.1",
        "x-forwarded-for": "198.51.100.1",
      },
    );
    expect(unrelated.status).toBe(401);
  });

  it("requires verification when mail exists and makes password reset tokens one-use with session revocation", async () => {
    service.close();
    config = {
      ...config,
      mail: {
        host: "mail.example.test",
        port: 587,
        user: "test",
        password: "test",
        from: "no-reply@example.test",
      },
    };
    service = await createAccountAuth(config);
    provider = adapt(service);
    const registered = await register();
    expect(registered.status).toBe(200);
    expect(sessionCookie(registered)).toBe("");
    expect(
      (await request("/sign-in/email", { email: "one@example.test", password }))
        .status,
    ).toBe(403);
    const verificationURL = mail
      .find((entry) => entry.subject.includes("Verify"))!
      .text.match(/http[^\s]+/)![0];
    const verified = await handleAuthRequest(
      new Request(verificationURL),
      config,
      async () => provider,
    );
    expect([200, 302]).toContain(verified.status);
    const loggedIn = await request("/sign-in/email", {
      email: "one@example.test",
      password,
    });
    const cookie = sessionCookie(loggedIn);
    expect(cookie).not.toBe("");
    expect(
      (
        await request("/request-password-reset", {
          email: "one@example.test",
          redirectTo: "/account/reset-password",
        })
      ).status,
    ).toBe(200);
    const resetURL = mail
      .find((entry) => entry.subject.includes("Reset"))!
      .text.match(/http[^\s]+/)![0];
    const token = new URL(resetURL).pathname.split("/").at(-1)!;
    const newPassword = "A replacement long passphrase! 963";
    expect(
      (await request("/reset-password", { token, newPassword })).status,
    ).toBe(200);
    expect(
      (await request("/reset-password", { token, newPassword })).status,
    ).toBe(400);
    expect(
      await (await request("/get-session", undefined, cookie)).json(),
    ).toBeNull();
    expect(
      (await request("/sign-in/email", { email: "one@example.test", password }))
        .status,
    ).toBe(401);
    expect(
      (
        await request("/sign-in/email", {
          email: "one@example.test",
          password: newPassword,
        })
      ).status,
    ).toBe(200);
  });
});
