// clipboard.js
// Copies text to the clipboard using the modern Clipboard API where
// available (requires a secure context / HTTPS), with a legacy
// execCommand fallback so the app never fails silently.

/**
 * @param {string} text
 * @returns {Promise<{ ok: boolean, method: "clipboard-api" | "fallback" | "none" }>}
 */
export async function copyText(text) {
  if (!text) return { ok: false, method: "none" };

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return { ok: true, method: "clipboard-api" };
    } catch (err) {
      // fall through to legacy fallback
    }
  }

  try {
    const ok = legacyCopy(text);
    return { ok, method: "fallback" };
  } catch (err) {
    return { ok: false, method: "none" };
  }
}

function legacyCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);

  const selection = document.getSelection();
  const previousRange =
    selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  let succeeded = false;
  try {
    succeeded = document.execCommand("copy");
  } catch (err) {
    succeeded = false;
  }

  document.body.removeChild(textarea);

  if (previousRange && selection) {
    selection.removeAllRanges();
    selection.addRange(previousRange);
  }

  return succeeded;
}
