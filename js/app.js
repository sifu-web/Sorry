// app.js
import {
  MAX_TEXT_LENGTH,
  generateRepeatedText,
  validateText,
  validateCount,
  computeStats,
  formatNumber,
} from "./generator.js";
import { copyText } from "./clipboard.js";
import { initBackground } from "./background.js";

// ---- DOM references ----------------------------------------------------
const textInput = document.getElementById("text-input");
const textError = document.getElementById("text-error");
const textCharCount = document.getElementById("text-char-count");

const countInput = document.getElementById("count-input");
const countError = document.getElementById("count-error");
const quickCounts = document.getElementById("count-input")
  ? document.querySelectorAll(".chip")
  : [];

const generateBtn = document.getElementById("generate-btn");
const clearBtn = document.getElementById("clear-btn");

const emptyState = document.getElementById("empty-state");
const loadingState = document.getElementById("loading-state");
const resultOutput = document.getElementById("result-output");
const resultStats = document.getElementById("result-stats");
const statusMessage = document.getElementById("status-message");

const copyBtn = document.getElementById("copy-btn");
const copyBtnLabel = document.getElementById("copy-btn-label");

const toast = document.getElementById("toast");

// ---- State ---------------------------------------------------------------
/** @type {{ generatedText: string, isGenerating: boolean }} */
const state = {
  generatedText: "",
  isGenerating: false,
};

let toastTimer = null;
let statusTimer = null;
let copyResetTimer = null;

// ---- Init ------------------------------------------------------------
initBackground();
updateCharCount();
countInput.value = "200";
setActiveChip(200);

// ---- Text input ----------------------------------------------------------
textInput.addEventListener("input", () => {
  updateCharCount();
  hideError(textError);
});

function updateCharCount() {
  const len = textInput.value.length;
  textCharCount.textContent = `${formatNumber(len)} / ${MAX_TEXT_LENGTH}`;
}

// ---- Count input -----------------------------------------------------
countInput.addEventListener("input", () => {
  hideError(countError);
  setActiveChip(Number(countInput.value));
});

quickCounts.forEach((chip) => {
  chip.addEventListener("click", () => {
    const value = chip.getAttribute("data-count");
    countInput.value = value;
    setActiveChip(Number(value));
    hideError(countError);
    countInput.focus();
  });
});

function setActiveChip(value) {
  quickCounts.forEach((chip) => {
    const chipValue = Number(chip.getAttribute("data-count"));
    chip.classList.toggle("is-active", chipValue === value);
  });
}

// ---- Generate --------------------------------------------------------
generateBtn.addEventListener("click", () => runGenerate());

async function runGenerate() {
  if (state.isGenerating) return;

  const textResult = validateText(textInput.value);
  const countResult = validateCount(countInput.value);

  let hasError = false;

  if (!textResult.valid) {
    showError(textError, textResult.message);
    hasError = true;
  } else {
    hideError(textError);
  }

  if (!countResult.valid) {
    showError(countError, countResult.message);
    hasError = true;
  } else {
    hideError(countError);
  }

  if (hasError) {
    setStatus("");
    return;
  }

  await generate(textResult.value, countResult.value);
}

async function generate(text, count) {
  state.isGenerating = true;
  generateBtn.classList.add("is-generating");
  generateBtn.disabled = true;
  copyBtn.disabled = true;

  const showLoading = count > 1500;
  if (showLoading) {
    toggleResultView("loading");
    // Yield a frame so the loading state actually paints before the
    // (synchronous, but very fast) generation work runs.
    await nextFrame();
  }

  let text_result = "";
  try {
    text_result = generateRepeatedText(text, count);
  } catch (err) {
    setStatus("Something went wrong. Please try again.", true);
    toggleResultView("empty");
    state.isGenerating = false;
    generateBtn.classList.remove("is-generating");
    generateBtn.disabled = false;
    return;
  }

  state.generatedText = text_result;

  resultOutput.textContent = text_result;
  toggleResultView("output");

  const stats = computeStats(text_result, count);
  resultStats.textContent = `${formatNumber(stats.lines)} lines • ${formatNumber(
    stats.characters
  )} characters`;

  setStatus("Generated successfully ✓");

  copyBtn.disabled = false;
  generateBtn.classList.remove("is-generating");
  generateBtn.disabled = false;
  state.isGenerating = false;
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

function toggleResultView(view) {
  emptyState.hidden = view !== "empty";
  loadingState.hidden = view !== "loading";
  resultOutput.hidden = view !== "output";
}

// ---- Copy --------------------------------------------------------------
copyBtn.addEventListener("click", () => runCopy());

async function runCopy() {
  if (!state.generatedText) return;

  const { ok } = await copyText(state.generatedText);

  clearTimeout(copyResetTimer);

  if (ok) {
    copyBtnLabel.textContent = "Copied ✓";
    copyBtn.classList.add("is-success");
    showToast("All text copied ✓");
  } else {
    showToast("Couldn't copy. Please try again.", true);
  }

  copyResetTimer = setTimeout(() => {
    copyBtnLabel.textContent = "Copy All 📋";
    copyBtn.classList.remove("is-success");
  }, 1800);
}

// ---- Clear -------------------------------------------------------------
clearBtn.addEventListener("click", () => {
  textInput.value = "";
  updateCharCount();
  hideError(textError);
  hideError(countError);

  state.generatedText = "";
  resultOutput.textContent = "";
  toggleResultView("empty");
  resultStats.textContent = "";
  setStatus("");

  copyBtn.disabled = true;
  copyBtnLabel.textContent = "Copy All 📋";
  copyBtn.classList.remove("is-success");

  textInput.focus();
});

// ---- Errors / status / toast -------------------------------------------
function showError(el, message) {
  el.textContent = message;
  el.hidden = false;
}
function hideError(el) {
  el.hidden = true;
  el.textContent = "";
}

function setStatus(message, isError = false) {
  clearTimeout(statusTimer);
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "var(--error)" : "var(--accent-3)";
  if (message) {
    statusTimer = setTimeout(() => {
      statusMessage.textContent = "";
    }, 3200);
  }
}

function showToast(message, isError = false) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toast.style.background = isError
    ? "linear-gradient(135deg, #ff8a80, #ff7086)"
    : "";
  // Force reflow so the transition reliably triggers.
  void toast.offsetWidth;
  toast.classList.add("is-visible");

  toastTimer = setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => {
      toast.hidden = true;
    }, 250);
  }, 2200);
}

// ---- Keyboard shortcuts --------------------------------------------------
document.addEventListener("keydown", (e) => {
  const mod = e.ctrlKey || e.metaKey;
  if (!mod) return;

  if (e.key === "Enter") {
    e.preventDefault();
    runGenerate();
  } else if (e.shiftKey && (e.key === "C" || e.key === "c")) {
    if (!copyBtn.disabled) {
      e.preventDefault();
      runCopy();
    }
  }
});
