import {accountMetadata} from "@/i18n/account-metadata";
import {AccountPageView} from "@/features/auth/account-page";

export const generateMetadata = () => accountMetadata("forgotPassword");
export default function ForgotPasswordPage() {
  return <AccountPageView mode="forgot"/>;
}
