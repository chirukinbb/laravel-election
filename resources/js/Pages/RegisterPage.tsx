import {accountMetadata} from "@/i18n/account-metadata";
import {AccountPageView} from "@/features/auth/account-page";

export const generateMetadata = () => accountMetadata("createAccount");
export default function RegisterPage() {
  return <AccountPageView mode="signup"/>;
}
