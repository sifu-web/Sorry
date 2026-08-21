// generator.js
// Pure, dependency-free utilities for building the repeated/numbered text.

export const MIN_COUNT = 1;
export const MAX_COUNT = 10000;
export const MAX_TEXT_LENGTH = 500;

/**
 * Generate `count` numbered lines of `text`, formatted exactly as:
 *   1 . <text>
 *   2 . <text>
 * i.e. number, space, dot, space, text.
 *
 * Uses a single Array#join pass instead of repeated string concatenation
 * or per-line DOM writes, so it stays fast even at MAX_COUNT (10,000).
 *
 * @param {string} text
 * @param {number} count
 * @returns {string}
 */
export function generateRepeatedText(text, count) {
  const safeText = typeof text === "string" ? text : "";
  const safeCount = Number.isInteger(count) ? count : 0;

  if (safeText.length === 0 || safeCount <= 0) return "";

  const lines = new Array(safeCount);
  for (let i = 0; i < safeCount; i++) {
    lines[i] = (i + 1) + " . " + safeText;
  }
  return lines.join("\n");
}

/**
 * Validate the raw text input.
 * @param {string} rawText
 * @returns {{ valid: boolean, message?: string, value: string }}
 */
export function validateText(rawText) {
  const value = (rawText ?? "").toString();

  if (value.trim().length === 0) {
    return { valid: false, message: "দয়া করে কিছু লিখুন।", value };
  }
  if (value.length > MAX_TEXT_LENGTH) {
    return {
      valid: false,
      message: `সর্বোচ্চ ${MAX_TEXT_LENGTH} অক্ষর লেখা যাবে।`,
      value,
    };
  }
  return { valid: true, value };
}

/**
 * Validate the repeat-count input (kept as a raw string since number
 * inputs can hold invalid intermediate values like "" or "-").
 * @param {string} rawCount
 * @returns {{ valid: boolean, message?: string, value: number|null }}
 */
export function validateCount(rawCount) {
  const raw = (rawCount ?? "").toString().trim();

  if (raw.length === 0) {
    return { valid: false, message: "কতবার লিখতে চান তা লিখুন।", value: null };
  }

  // Reject anything that isn't a plain (optionally signed) integer —
  // catches decimals, letters, and other invalid text input.
  if (!/^-?\d+$/.test(raw)) {
    return { valid: false, message: "সঠিক সংখ্যা দিন।", value: null };
  }

  const n = Number(raw);

  if (n <= 0) {
    return { valid: false, message: "কমপক্ষে ১ বার দিতে হবে।", value: null };
  }
  if (n > MAX_COUNT) {
    return {
      valid: false,
      message: "সর্বোচ্চ ১০,০০০ বার লেখা যাবে।",
      value: null,
    };
  }

  return { valid: true, value: n };
}

/**
 * Compute quick stats about a generated block of text.
 * @param {string} generatedText
 * @param {number} lineCount
 */
export function computeStats(generatedText, lineCount) {
  return {
    lines: lineCount,
    characters: generatedText.length,
  };
}

/** Format a number with Bangla-friendly thousands separators (comma). */
export function formatNumber(n) {
  return n.toLocaleString("en-US");
}
