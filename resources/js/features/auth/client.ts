"use client";

type AuthError = {
  code?: string;
  status?: number;
  message?: string;
};

type AuthResult<T = unknown> = {
  data?: T;
  error?: AuthError;
};

async function backendAuth<T = unknown>(
    endpoint: string,
    body?: Record<string, unknown>,
): Promise<AuthResult<T>> {
  const response = await fetch(`/api/auth${endpoint}`, {
    method: body ? "POST" : "POST",
    credentials: "same-origin",
    headers: body ? {"Content-Type": "application/json"} : {},
    ...(body ? {body: JSON.stringify(body)} : {}),
  });

  const payload = await response
      .json()
      .catch(() => ({} as Record<string, unknown>));

  if (!response.ok) {
    return {
      error: {
        code: typeof payload?.code === "string" ? payload.code : "REQUEST_ERROR",
        status: response.status,
        message:
            typeof payload?.message === "string"
                ? payload.message
                : "The request could not be completed.",
      },
    };
  }

  return {data: payload as T};
}

export const authClient = {
  signUp: {
    email: (input: Record<string, unknown>) => backendAuth("/sign-up/email", input),
  },
  signIn: {
    email: (input: Record<string, unknown>) => backendAuth("/sign-in/email", input),
    social: (input: Record<string, unknown>) => backendAuth("/sign-in/social", input),
  },
  requestPasswordReset: (input: Record<string, unknown>) =>
      backendAuth("/request-password-reset", input),
  resetPassword: (input: Record<string, unknown>) =>
      backendAuth("/reset-password", input),
  sendVerificationEmail: (input: Record<string, unknown>) =>
      backendAuth("/send-verification-email", input),
  signOut: () => backendAuth("/sign-out", {}),
};
