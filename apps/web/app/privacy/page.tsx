import { IntlProvider } from "@/components/IntlProvider";
import PrivacyPage from "@/components/PrivacyPage";
import arMessages from "@/messages/ar.json";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | أذكار",
  description: "سياسة الخصوصية لتطبيق أذكار.",
};

export default function Page() {
  return (
    <IntlProvider locale="ar" messages={arMessages}>
      <PrivacyPage />
    </IntlProvider>
  );
}
