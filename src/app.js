// Database setup
const DB_NAME = "MarkdownNotesDB";
const STORE_NAME = "notes";
const CONFIG_STORE = "config";
let db;

// Initialize database
function initDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, {
                    keyPath: "id",
                    autoIncrement: true,
                });
                store.createIndex("createdAt", "createdAt", { unique: false });
                store.createIndex("modifiedAt", "modifiedAt", {
                    unique: false,
                });
            }
            if (!db.objectStoreNames.contains(CONFIG_STORE)) {
                db.createObjectStore(CONFIG_STORE);
            }
        };
    });
}

// Database operations
function getAllNotes() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const notes = request.result.sort((a, b) => {
                // Pinned notes first
                if (a.pinned && !b.pinned) return -1;
                if (!a.pinned && b.pinned) return 1;
                // Then by modified date
                return b.modifiedAt - a.modifiedAt;
            });
            resolve(notes);
        };
    });
}

function getNote(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

function saveNote(note) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = note.id ? store.put(note) : store.add(note);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

function deleteNote(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

function getSelectedNoteId() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([CONFIG_STORE], "readonly");
        const store = transaction.objectStore(CONFIG_STORE);
        const request = store.get("selectedNoteId");

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

function setSelectedNoteId(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([CONFIG_STORE], "readwrite");
        const store = transaction.objectStore(CONFIG_STORE);
        const request = store.put(id, "selectedNoteId");

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

// UI state
let currentNoteId = null;
let saveTimeout = null;

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

// Markdown syntax highlighting function
function highlightMarkdown(text) {
    let highlighted = text;

    // Escape HTML
    highlighted = highlighted
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Headers (# ## ### etc)
    highlighted = highlighted.replace(
        /^(#{1,6})\s+(.+?)$/gm,
        '<span class="md-header">$1 $2</span>'
    );

    // Inline code `code`
    highlighted = highlighted.replace(
        /`([^`]+)`/g,
        '<span class="md-code">`$1`</span>'
    );

    // Bold **text** or __text__
    highlighted = highlighted.replace(
        /(\*\*|__)([^*_]+)\1/g,
        '<span class="md-bold">$1$2$1</span>'
    );

    // Italic *text* or _text_
    highlighted = highlighted.replace(
        /(\*|_)([^*_]+)\1/g,
        '<span class="md-italic">$1$2$1</span>'
    );

    // Links [text](url)
    highlighted = highlighted.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<span class="md-link">[$1]</span><span class="md-url">($2)</span>'
    );

    // Blockquotes > text
    highlighted = highlighted.replace(
        /^&gt;\s+(.+?)$/gm,
        '<span class="md-blockquote">&gt; $1</span>'
    );

    // Lists - and * and +
    highlighted = highlighted.replace(
        /^(\s*)([*+-]|\d+\.)\s+/gm,
        '$1<span class="md-list">$2</span> '
    );

    return highlighted;
}

function updateHighlight() {
    const text = editorInput.value;
    const highlighted = highlightMarkdown(text);
    editorHighlight.innerHTML = highlighted;
}

// Sync scrolling between textarea and highlight
editorInput.addEventListener("scroll", () => {
    editorHighlight.scrollTop = editorInput.scrollTop;
    editorHighlight.scrollLeft = editorInput.scrollLeft;
});

// Export/Import functionality
function downloadFile(content, filename, type = "text/plain") {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function exportAllNotes() {
    const notes = await getAllNotes();
    const exportData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        notes: notes,
    };
    const jsonString = JSON.stringify(exportData, null, 2);
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadFile(
        jsonString,
        `notes-export-${timestamp}.json`,
        "application/json"
    );
}

async function importNotes(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                if (!importData.notes || !Array.isArray(importData.notes)) {
                    reject(new Error("Invalid import format"));
                    return;
                }

                let importedCount = 0;
                for (const note of importData.notes) {
                    const newNote = {
                        title: note.title || "Imported Note",
                        content: note.content || "",
                        createdAt: note.createdAt || Date.now(),
                        modifiedAt: Date.now(),
                    };
                    await saveNote(newNote);
                    importedCount++;
                }

                await loadNotesList();
                alert(`Successfully imported ${importedCount} note(s)`);
                resolve();
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(file);
    });
}

function exportCurrentNoteAsMarkdown() {
    if (currentNoteId === null) {
        alert("No note selected");
        return;
    }

    getNote(currentNoteId).then((note) => {
        if (note) {
            const timestamp = new Date().toISOString().slice(0, 10);
            const filename = `${note.title || "note"}-${timestamp}.md`;
            downloadFile(note.content, filename, "text/markdown");
        }
    });
}

// Theme management
function initTheme() {
    const isDark = localStorage.getItem("darkMode") === "true";
    if (isDark) {
        document.body.classList.add("dark-mode");
        themeToggle.textContent = "☀️ Light Mode";
        loadLightModeStyles();
    }
}

function loadLightModeStyles() {
    const link = document.querySelector('link[rel="stylesheet"]');
    if (link && link.href.includes("atom-one-dark")) {
        // In light mode, the default CSS is sufficient
        link.href =
            "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-light.min.css";
    }
}

themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", isDark);
    themeToggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";

    if (isDark) {
        document.querySelector('link[rel="stylesheet"]').href =
            "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css";
    } else {
        document.querySelector('link[rel="stylesheet"]').href =
            "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-light.min.css";
    }

    updatePreview();
});

// Note operations
function createNewNote() {
    const note = {
        title: "Untitled Note",
        content: "",
        createdAt: Date.now(),
        modifiedAt: Date.now(),
    };

    saveNote(note).then((id) => {
        currentNoteId = id;
        setSelectedNoteId(id);
        loadNotesList();
        selectNote(id);
    });
}

function selectNote(id) {
    currentNoteId = id;
    setSelectedNoteId(id);

    getNote(id).then((note) => {
        if (note) {
            editorInput.value = note.content;
            updateHighlight();
            updateToolbar(note);
            updatePreview();
            editorContent.style.display = "flex";
            emptyState.style.display = "none";

            // Update active state in list
            document.querySelectorAll(".note-item").forEach((item) => {
                item.classList.remove("active");
            });
            document
                .querySelector(`[data-note-id="${id}"]`)
                ?.classList.add("active");
        }
    });
}

function updateToolbar(note) {
    const created = new Date(note.createdAt).toLocaleString();
    const modified = new Date(note.modifiedAt).toLocaleString();
    editorToolbar.textContent = `Created: ${created} | Modified: ${modified}`;
}

function updatePreview() {
    const content = editorInput.value;
    const html = marked.parse(content);
    previewPane.innerHTML = html;

    // Highlight code blocks
    previewPane.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightElement(block);
    });
}

function saveCurrentNote() {
    if (currentNoteId === null) return;

    getNote(currentNoteId).then((note) => {
        if (note) {
            note.content = editorInput.value;
            note.modifiedAt = Date.now();

            // Extract title from first line or use "Untitled"
            const lines = note.content.split("\n");
            let title = lines[0].replace(/^#+\s*/, "").trim();
            if (!title) {
                title =
                    lines
                        .find((line) => line.trim() !== "")
                        ?.substring(0, 15) || "Untitled Note";
            } else {
                title = title.substring(0, 15);
            }
            note.title = title || "Untitled Note";

            saveNote(note).then(() => {
                loadNotesList();
                updateToolbar(note);
            });
        }
    });
}

function autoSaveNote() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveCurrentNote, 1000);
}

// Pin/Unpin functionality
async function togglePinNote(noteId) {
    const note = await getNote(noteId);
    if (note) {
        note.pinned = !note.pinned;
        await saveNote(note);
        await loadNotesList();
    }
}

// Load and display notes
async function loadNotesList() {
    const notes = await getAllNotes();
    notesList.innerHTML = "";

    if (notes.length === 0) {
        editorContent.style.display = "none";
        emptyState.style.display = "flex";
        editorToolbar.textContent = "No notes yet";
        return;
    }

    notes.forEach((note) => {
        const li = document.createElement("li");
        li.className = "note-item";
        li.setAttribute("data-note-id", note.id);
        if (note.id === currentNoteId) {
            li.classList.add("active");
        }
        li.style.position = "relative";

        const title = document.createElement("div");
        title.className = "note-item-title";
        title.textContent = note.title;

        const date = document.createElement("div");
        date.className = "note-item-date";
        date.textContent = new Date(note.modifiedAt).toLocaleDateString();

        const actions = document.createElement("div");
        actions.className = "note-item-actions";

        const pinBtn = document.createElement("button");
        pinBtn.className = "pin-note-btn";
        pinBtn.textContent = note.pinned ? "⭐" : "☆";
        pinBtn.title = note.pinned ? "Unpin note" : "Pin note";
        if (note.pinned) {
            pinBtn.classList.add("pinned");
        }
        pinBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            togglePinNote(note.id);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-note-btn";
        deleteBtn.textContent = "🗑️";
        deleteBtn.title = "Delete note";
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (confirm(`Delete "${note.title}"? This cannot be undone.`)) {
                deleteNote(note.id).then(() => {
                    if (currentNoteId === note.id) {
                        currentNoteId = null;
                    }
                    loadNotesList();
                    // Select another note or show empty state
                    getAllNotes().then((remainingNotes) => {
                        if (remainingNotes.length > 0) {
                            selectNote(remainingNotes[0].id);
                        } else {
                            editorContent.style.display = "none";
                            emptyState.style.display = "flex";
                            editorToolbar.textContent = "No notes yet";
                        }
                    });
                });
            }
        });

        actions.appendChild(pinBtn);
        actions.appendChild(deleteBtn);

        li.appendChild(title);
        li.appendChild(date);
        li.appendChild(actions);

        li.addEventListener("click", () => selectNote(note.id));

        notesList.appendChild(li);
    });
}

async function initializeApp() {
    await initDatabase();

    let notes = await getAllNotes();

    if (notes.length === 0) {
        createNewNote();
    } else {
        const selectedId = await getSelectedNoteId();
        if (selectedId && notes.some((n) => n.id === selectedId)) {
            currentNoteId = selectedId;
        } else {
            currentNoteId = notes[0].id;
        }
        await loadNotesList();
        selectNote(currentNoteId);
    }
}

// Get header elements
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

exportAllBtn.addEventListener("click", exportAllNotes);

importBtn.addEventListener("click", () => {
    importFile.click();
});

importFile.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
        importNotes(e.target.files[0]).catch((error) =>
            alert("Import failed: " + error.message)
        );
        e.target.value = "";
    }
});

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

// Initialize app
initTheme();
initializeApp();
