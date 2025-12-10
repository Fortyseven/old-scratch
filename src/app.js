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
import { togglePreviewPane } from "./components/ui.js";
import { initSettings } from "./components/settings.js";

// DOM elements
const notesList = document.getElementById("notesList");
const newNoteBtn = document.getElementById("newNoteBtn");
const editorInput = document.getElementById("editorInput");
const editorHighlight = document.getElementById("editorHighlight");
const previewPane = document.getElementById("previewPane");
const editorContent = document.getElementById("editorContent");
const emptyState = document.getElementById("emptyState");
const themeToggle = document.getElementById("themeToggle");
const exportAllBtn = document.getElementById("exportAllBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");
const exportNoteBtn = document.getElementById("exportNoteBtn");
const togglePreviewBtn = document.getElementById("togglePreviewBtn");

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
exportNoteBtn.addEventListener("click", exportCurrentNoteAsMarkdown);
togglePreviewBtn.addEventListener("click", togglePreviewPane);

// App initialization
initTheme();
initSettings();

// Restore preview pane state
const previewHidden = localStorage.getItem("previewHidden") === "true";
if (previewHidden) {
    editorContent.classList.add("preview-hidden");
}

initializeApp();
