import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const locales = ["ar", "en", "fr", "tr"];

function readMessages(locale) {
  return JSON.parse(
    readFileSync(resolve(root, "messages", `${locale}.json`), "utf8"),
  );
}

function flattenKeys(value, prefix = "") {
  if (Array.isArray(value)) return [prefix];
  if (!value || typeof value !== "object") return [prefix];

  return Object.entries(value).flatMap(([key, child]) =>
    flattenKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

const entries = Object.fromEntries(
  locales.map((locale) => [locale, new Set(flattenKeys(readMessages(locale)))]),
);
const referenceLocale = locales[0];
const referenceKeys = entries[referenceLocale];
let hasError = false;

for (const locale of locales.slice(1)) {
  const keys = entries[locale];
  const missing = [...referenceKeys].filter((key) => !keys.has(key));
  const extra = [...keys].filter((key) => !referenceKeys.has(key));

  if (missing.length || extra.length) {
    hasError = true;
    console.error(`Message keys mismatch for ${locale}:`);
    if (missing.length) console.error(`  Missing: ${missing.join(", ")}`);
    if (extra.length) console.error(`  Extra: ${extra.join(", ")}`);
  }
}

if (hasError) process.exit(1);
console.log("Message keys are aligned.");
