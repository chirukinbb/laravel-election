import {readAuthConfig} from "./config";
import type {AccountProvider} from "./provider-types";

const authGlobal = globalThis as typeof globalThis & {
  touAccountAuth?: Promise<AccountProvider>;
};
export const getAuthConfig = () => readAuthConfig(process.env);
async function createProvider(): Promise<AccountProvider> {
  const config = getAuthConfig();
  if (config.provider === "supabase") {
    const { createSupabaseProvider } = await import("./providers/supabase");
    return createSupabaseProvider(config);
  }
  const { createAccountAuth } = await import("./auth-core");
  const local = await createAccountAuth(config);
  return {
    handle: (request) => local.auth.handler(request),
    getSession: (requestHeaders) =>
      local.auth.api.getSession({ headers: requestHeaders }),
    close: local.close,
  };
}
export function getAccountAuth(): Promise<AccountProvider> {
  return (authGlobal.touAccountAuth ??= createProvider().catch(
    (error: unknown) => {
      delete authGlobal.touAccountAuth;
      throw error;
    },
  ));
}
export async function getAccountSession() {
  const service = await getAccountAuth();
  return service.getSession(new Headers());
}
