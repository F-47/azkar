import HomePage from "@/components/HomePage";
import { IntlProvider } from "@/components/IntlProvider";
import arMessages from "@/messages/ar.json";

export default function Page() {
  return (
    <IntlProvider locale="ar" messages={arMessages}>
      <HomePage />
    </IntlProvider>
  );
}
