/**
 * Centralized currency configuration. Components never hardcode symbols —
 * they call formatMoney(amount, sourceCurrency) which converts into the
 * account's display currency. Add currencies here (later: from the backend).
 */
import { useSyncExternalStore } from "react";

export const CURRENCIES = {
  USD: { name: "US Dollar", locale: "en-US", perUSD: 1 },
  EUR: { name: "Euro", locale: "de-DE", perUSD: 0.92 },
  GBP: { name: "British Pound", locale: "en-GB", perUSD: 0.79 },
  AED: { name: "UAE Dirham", locale: "en-AE", perUSD: 3.67 },
  INR: { name: "Indian Rupee", locale: "en-IN", perUSD: 83.5 },
  CAD: { name: "Canadian Dollar", locale: "en-CA", perUSD: 1.37 },
  AUD: { name: "Australian Dollar", locale: "en-AU", perUSD: 1.52 },
  SAR: { name: "Saudi Riyal", locale: "ar-SA", perUSD: 3.75 },
  SGD: { name: "Singapore Dollar", locale: "en-SG", perUSD: 1.35 },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;
export const CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[];

/** Default display currency comes from the business account (demo: INR). */
export const DEFAULT_CURRENCY: CurrencyCode = "INR";
const STORAGE_KEY = "display-currency";

let display: CurrencyCode = DEFAULT_CURRENCY;
if (typeof window !== "undefined") {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved && saved in CURRENCIES) display = saved as CurrencyCode;
}
const listeners = new Set<() => void>();

export function getDisplayCurrency() {
  return display;
}
export function setDisplayCurrency(code: CurrencyCode) {
  display = code;
  window.localStorage.setItem(STORAGE_KEY, code);
  listeners.forEach((l) => l());
}
export function useDisplayCurrency() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => display,
    () => DEFAULT_CURRENCY,
  );
}

export function convert(amount: number, from: CurrencyCode, to: CurrencyCode) {
  return (amount / CURRENCIES[from].perUSD) * CURRENCIES[to].perUSD;
}
export const toUSD = (amount: number, from: CurrencyCode) => convert(amount, from, "USD");

export function formatMoney(
  amount: number,
  from: CurrencyCode = DEFAULT_CURRENCY,
  to?: CurrencyCode,
) {
  const target = to ?? display;
  return new Intl.NumberFormat(CURRENCIES[target].locale, {
    style: "currency",
    currency: target,
    maximumFractionDigits: 0,
  }).format(convert(amount, from, target));
}
