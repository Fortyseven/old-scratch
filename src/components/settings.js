// Settings management

const settingsBtn = document.getElementById("settingsBtn");
const settingsOverlay = document.getElementById("settingsOverlay");
const settingsClose = document.getElementById("settingsClose");
const fontSizeInput = document.getElementById("fontSizeInput");
const fontSizeValue = document.getElementById("fontSizeValue");
const fontSizeDecrease = document.getElementById("fontSizeDecrease");
const fontSizeIncrease = document.getElementById("fontSizeIncrease");

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 32;
const FONT_SIZE_STORAGE_KEY = "baseFontSize";

export function initSettings() {
    // Load saved font size
    const savedFontSize = localStorage.getItem(FONT_SIZE_STORAGE_KEY);
    if (savedFontSize) {
        setFontSize(parseInt(savedFontSize));
    }

    // Event listeners
    settingsBtn.addEventListener("click", openSettings);
    settingsClose.addEventListener("click", closeSettings);
    settingsOverlay.addEventListener("click", (e) => {
        if (e.target === settingsOverlay) {
            closeSettings();
        }
    });

    fontSizeInput.addEventListener("input", handleFontSizeChange);
    fontSizeDecrease.addEventListener("click", decreaseFontSize);
    fontSizeIncrease.addEventListener("click", increaseFontSize);

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && settingsOverlay.style.display !== "none") {
            closeSettings();
        }
    });
}

function openSettings() {
    settingsOverlay.style.display = "flex";
    fontSizeInput.focus();
}

function closeSettings() {
    settingsOverlay.style.display = "none";
}

function handleFontSizeChange() {
    const fontSize = parseInt(fontSizeInput.value);
    setFontSize(fontSize);
}

function increaseFontSize() {
    const currentSize = parseInt(fontSizeInput.value);
    if (currentSize < MAX_FONT_SIZE) {
        setFontSize(currentSize + 1);
    }
}

function decreaseFontSize() {
    const currentSize = parseInt(fontSizeInput.value);
    if (currentSize > MIN_FONT_SIZE) {
        setFontSize(currentSize - 1);
    }
}

function setFontSize(size) {
    const fontSize = Math.min(Math.max(size, MIN_FONT_SIZE), MAX_FONT_SIZE);
    fontSizeInput.value = fontSize;
    fontSizeValue.textContent = fontSize;
    document.documentElement.style.setProperty(
        "--base-font-size",
        `${fontSize}px`
    );
    localStorage.setItem(FONT_SIZE_STORAGE_KEY, fontSize);
}

export function toggleSettings() {
    if (settingsOverlay.style.display === "none") {
        openSettings();
    } else {
        closeSettings();
    }
}
