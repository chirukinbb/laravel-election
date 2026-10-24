import type {Metadata} from "next";
import {accountCopy, accountSummaryCopy} from "@/features/auth/copy";
import {getRequestLocale} from "./server";

export async function accountMetadata(
  key: "login" | "createAccount" | "forgotPassword" | "newPassword" | "summary",
): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title:
      key === "summary"
        ? accountSummaryCopy[locale].title
        : accountCopy[locale][key],
  };
}
