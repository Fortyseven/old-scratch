// Theme management

const themeToggle = document.getElementById("themeToggle");

export function initTheme() {
    const isDark = localStorage.getItem("darkMode") === "true";

    if (isDark) {
        document.body.classList.add("dark-mode");
        themeToggle.textContent = "☀️";
    } else {
        themeToggle.textContent = "🌙";
    }

    switchHighlightTheme(isDark);
}

function getHighlightStyleElement() {
    let styleEl = document.getElementById("hljs-theme");
    if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "hljs-theme";
        // Insert before other styles so our app CSS can still
        // override generic .hljs background variables if needed.
        const firstStyle = document.querySelector("head style");
        if (firstStyle && firstStyle.parentNode) {
            firstStyle.parentNode.insertBefore(styleEl, firstStyle);
        } else {
            document.head.appendChild(styleEl);
        }
    }
    return styleEl;
}

function switchHighlightTheme(isDark) {
    const styleEl = getHighlightStyleElement();
    const css = isDark ? window.HLJS_DARK_CSS : window.HLJS_LIGHT_CSS;

    if (typeof css === "string") {
        styleEl.textContent = css;
    }
}

export function toggleTheme() {
    const isDark = document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", isDark);
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    switchHighlightTheme(isDark);
}

export function loadLightModeStyles() {
    switchHighlightTheme(false);
}
