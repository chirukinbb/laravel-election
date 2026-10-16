import {redirect} from "next/navigation";
import {AccountExperience} from "./account-experience";
import {getAccountSession, getAuthConfig} from "./server";
import {publicAuthCapabilities} from "./config";

export async function AccountPageView({
  mode,
  token,
  error,
}: {
  mode: "login" | "signup" | "forgot" | "reset";
  token?: string;
  error?: boolean;
}) {
  if ((mode === "login" || mode === "signup") && (await getAccountSession()))
    redirect("/account");
  return (
    <AccountExperience
      mode={mode}
      capabilities={publicAuthCapabilities(getAuthConfig())}
      {...(token ? { resetToken: token } : {})}
      {...(error ? { resetError: true } : {})}
    />
  );
}
