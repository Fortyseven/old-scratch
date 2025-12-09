// Modular imports
import { initTheme, toggleTheme } from "./components/theme.js";
import { updateHighlight, syncEditorScroll } from "./components/editor.js";
import { updatePreview } from "./components/preview.js";
import {
    autoSaveNote,
    createNewNote,
    initializeApp,
} from "./components/noteOps.js";
import {
    exportAllNotes,
    importNotes,
    exportCurrentNoteAsMarkdown,
} from "./components/importExport.js";

// DOM elements
const notesList = document.getElementById("notesList");
const newNoteBtn = document.getElementById("newNoteBtn");
const editorInput = document.getElementById("editorInput");
const editorHighlight = document.getElementById("editorHighlight");
const previewPane = document.getElementById("previewPane");
const editorContent = document.getElementById("editorContent");
const emptyState = document.getElementById("emptyState");
const editorToolbar = document.getElementById("editorToolbar");
const themeToggle = document.getElementById("themeToggle");
const exportAllBtn = document.getElementById("exportAllBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");

// Event listeners
newNoteBtn.addEventListener("click", createNewNote);
editorInput.addEventListener("input", () => {
    updateHighlight();
    updatePreview();
    autoSaveNote();
});
editorInput.addEventListener("scroll", syncEditorScroll);
exportAllBtn.addEventListener("click", exportAllNotes);
importBtn.addEventListener("click", () => importFile.click());
importFile.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
        importNotes(e.target.files[0]).catch((error) =>
            alert("Import failed: " + error.message)
        );
        e.target.value = "";
    }
});
themeToggle.addEventListener("click", toggleTheme);

// Right-click context menu for exporting current note
editorInput.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const menu = document.createElement("div");
    menu.style.cssText = `
        position: fixed;
        top: ${e.clientY}px;
        left: ${e.clientX}px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    `;
    const menuItem = document.createElement("div");
    menuItem.textContent = "Export as Markdown";
    menuItem.style.cssText = `
        padding: 8px 16px;
        cursor: pointer;
        color: var(--text-primary);
        font-size: 14px;
        transition: background-color 0.2s;
    `;
    menuItem.addEventListener("mouseenter", () => {
        menuItem.style.backgroundColor = "var(--bg-primary)";
    });
    menuItem.addEventListener("mouseleave", () => {
        menuItem.style.backgroundColor = "transparent";
    });
    menuItem.addEventListener("click", () => {
        exportCurrentNoteAsMarkdown();
        document.body.removeChild(menu);
    });
    menu.appendChild(menuItem);
    document.body.appendChild(menu);
    setTimeout(() => {
        if (document.body.contains(menu)) {
            document.body.removeChild(menu);
        }
    }, 5000);
    document.addEventListener(
        "click",
        () => {
            if (document.body.contains(menu)) {
                document.body.removeChild(menu);
            }
        },
        { once: true }
    );
});

// App initialization
initTheme();
initializeApp();
