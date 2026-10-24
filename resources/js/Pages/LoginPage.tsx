import {accountMetadata} from "@/i18n/account-metadata";
import {AccountPageView} from "@/features/auth/account-page";

export const generateMetadata = () => accountMetadata("login");

export default function LoginPage() {
  return <AccountPageView mode="login"/>;
}
