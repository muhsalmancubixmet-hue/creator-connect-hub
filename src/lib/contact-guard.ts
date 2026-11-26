/**
 * Contact Guard & Anti-Disintermediation Service Adapter (Business Suite)
 * ------------------------------------------------------------------------
 * Plug-and-Play Contract:
 *   - Client-side live PII/phone detection blocks off-platform leakage before send.
 *   - Swap `ADAPTER_MODE` to "api" later to persist flagged attempts to Django backend.
 */

export type ContactViolationType =
  | "PHONE_NUMBER"
  | "EMAIL_ADDRESS"
  | "EXTERNAL_MESSENGER"
  | "UPI_PAYMENT"
  | "OBFUSCATED_CONTACT";

export interface ContactGuardResult {
  isBlocked: boolean;
  violations: ContactViolationType[];
  reason: string;
  matchedSnippet?: string;
}

const DIGIT_WORDS_MAP: Record<string, string> = {
  zero: "0",
  oh: "0",
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
};

const EMOJI_DIGITS_MAP: Record<string, string> = {
  "0️⃣": "0",
  "1️⃣": "1",
  "2️⃣": "2",
  "3️⃣": "3",
  "4️⃣": "4",
  "5️⃣": "5",
  "6️⃣": "6",
  "7️⃣": "7",
  "8️⃣": "8",
  "9️⃣": "9",
};

function normalizeObfuscatedDigits(text: string): string {
  let normalized = text.toLowerCase();
  for (const [emoji, digit] of Object.entries(EMOJI_DIGITS_MAP)) {
    normalized = normalized.split(emoji).join(digit);
  }
  normalized = normalized.replace(
    /\b(zero|oh|one|two|three|four|five|six|seven|eight|nine)\b/gi,
    (w) => DIGIT_WORDS_MAP[w.toLowerCase()] ?? w,
  );
  return normalized;
}

export function detectContactLeakage(rawText: string): ContactGuardResult {
  const text = (rawText || "").trim();
  if (!text) {
    return { isBlocked: false, violations: [], reason: "" };
  }

  const violations: ContactViolationType[] = [];
  let matchedSnippet: string | undefined;

  const phoneRegex = /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,5}\)?[\s.-]?){2,4}\d{3,5}/g;
  const phoneMatches = text.match(phoneRegex) || [];
  for (const m of phoneMatches) {
    const digitsOnly = m.replace(/\D/g, "");
    const looksLikeCurrencyOrYear = /^[₹$€£]/.test(m.trim()) || (digitsOnly.length <= 7 && !m.includes("+"));
    if (!looksLikeCurrencyOrYear && digitsOnly.length >= 8 && digitsOnly.length <= 15) {
      violations.push("PHONE_NUMBER");
      matchedSnippet = m.trim();
      break;
    }
  }

  if (!violations.includes("PHONE_NUMBER")) {
    const normalized = normalizeObfuscatedDigits(text);
    const compressedDigits = normalized.replace(/[^0-9a-z]/gi, "");
    if (/\d{8,}/.test(compressedDigits)) {
      violations.push("OBFUSCATED_CONTACT");
      matchedSnippet = "Spelled-out / obfuscated phone digits";
    }
  }

  const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
  const obfuscatedEmailRegex = /\b[a-z0-9._%+-]+\s*(?:\(|\[)?at(?:\)|\])?\s*(gmail|yahoo|outlook|hotmail|icloud|proton)\s*(?:\(|\[)?dot(?:\)|\])?\s*[a-z]{2,}\b/i;
  const emailMatch = text.match(emailRegex) || text.match(obfuscatedEmailRegex);
  if (emailMatch) {
    violations.push("EMAIL_ADDRESS");
    matchedSnippet = matchedSnippet || emailMatch[0];
  }

  const upiRegex = /[a-z0-9._-]+@(?:okaxis|okicici|okhdfcbank|oksbi|ybl|ibl|axl|paytm|upi|apl)\b|\b(?:gpay|google\s*pay|phonepe|paytm\s*(?:me|number)|upi\s*id)\b/i;
  const upiMatch = text.match(upiRegex);
  if (upiMatch) {
    violations.push("UPI_PAYMENT");
    matchedSnippet = matchedSnippet || upiMatch[0];
  }

  const messengerRegex = /(?:wa\.me\/|t\.me\/|chat\.whatsapp\.com|whatsapp\s*(?:me|no|num|number|\+|:)|telegram\s*(?:me|id|@)|call\s*(?:me|on|at)\s*(?:this|my)?\s*(?:no|num|number)?|dm\s*(?:me\s*)?(?:on|at)\s*(?:ig|insta|instagram))/i;
  const messengerMatch = text.match(messengerRegex);
  if (messengerMatch) {
    violations.push("EXTERNAL_MESSENGER");
    matchedSnippet = matchedSnippet || messengerMatch[0];
  }

  if (violations.length === 0) {
    return { isBlocked: false, violations: [], reason: "" };
  }

  const labelMap: Record<ContactViolationType, string> = {
    PHONE_NUMBER: "phone/mobile number",
    OBFUSCATED_CONTACT: "obfuscated phone number",
    EMAIL_ADDRESS: "email address",
    UPI_PAYMENT: "direct UPI/payment detail",
    EXTERNAL_MESSENGER: "external chat/WhatsApp link",
  };

  return {
    isBlocked: true,
    violations,
    matchedSnippet,
    reason: `Sharing ${labelMap[violations[0]]} in chat is blocked for Escrow protection. Keep negotiations inside Influencers.com until milestone lock.`,
  };
}
