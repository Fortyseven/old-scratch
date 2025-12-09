// Theme management

const themeToggle = document.getElementById("themeToggle");

export function initTheme() {
    const isDark = localStorage.getItem("darkMode") === "true";
    if (isDark) {
        document.body.classList.add("dark-mode");
        themeToggle.textContent = "☀️";
        switchHighlightTheme(true);
    }
}

function switchHighlightTheme(isDark) {
    const link = document.querySelector('link[rel="stylesheet"]');
    if (link) {
        link.href = isDark
            ? "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css"
            : "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-light.min.css";
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
