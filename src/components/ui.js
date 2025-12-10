// UI rendering and DOM manipulation

import { getNote, saveNote, deleteNote, getAllNotes } from "./database.js";
import { updateHighlight } from "./editor.js";
import { updatePreview } from "./preview.js";

const notesList = document.getElementById("notesList");
const editorContent = document.getElementById("editorContent");
const emptyState = document.getElementById("emptyState");
const editorToolbar = document.getElementById("editorToolbar");
const editorInput = document.getElementById("editorInput");

let currentNoteId = null;
window.__currentNoteId = null;

export function setCurrentNoteId(id) {
    currentNoteId = id;
    window.__currentNoteId = id;
}

export function getCurrentNoteId() {
    return currentNoteId;
}

export function showEmptyState() {
    editorContent.style.display = "none";
    emptyState.style.display = "flex";
    document.getElementById("toolbarInfo").textContent = "No notes yet";
    document.getElementById("exportNoteBtn").style.display = "none";
}

export function hideEmptyState() {
    editorContent.style.display = "flex";
    emptyState.style.display = "none";
}

export function updateEditorContent(note) {
    editorInput.value = note.content;
    updateHighlight();
    updateToolbar(note);
    updatePreview();
    hideEmptyState();
}

export function updateActiveNoteInList(noteId) {
    document.querySelectorAll(".note-item").forEach((item) => {
        item.classList.remove("active");
    });
    document
        .querySelector(`[data-note-id="${noteId}"]`)
        ?.classList.add("active");
}

export function updateToolbar(note) {
    const created = new Date(note.createdAt).toLocaleString();
    const modified = new Date(note.modifiedAt).toLocaleString();
    document.getElementById(
        "toolbarInfo"
    ).textContent = `Created: ${created} | Modified: ${modified}`;
    document.getElementById("exportNoteBtn").style.display = "inline-block";
    document.getElementById("togglePreviewBtn").style.display = "inline-block";
}

export function togglePreviewPane() {
    const editorContent = document.getElementById("editorContent");
    editorContent.classList.toggle("preview-hidden");

    // Save preference to localStorage
    const isHidden = editorContent.classList.contains("preview-hidden");
    localStorage.setItem("previewHidden", isHidden ? "true" : "false");
}

export async function loadNotesList() {
    const notes = await getAllNotes();
    notesList.innerHTML = "";

    if (notes.length === 0) {
        showEmptyState();
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
        pinBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const updatedNote = await getNote(note.id);
            if (updatedNote) {
                updatedNote.pinned = !updatedNote.pinned;
                await saveNote(updatedNote);
                await loadNotesList();
            }
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-note-btn";
        deleteBtn.textContent = "🗑️";
        deleteBtn.title = "Delete note";
        deleteBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            if (confirm(`Delete "${note.title}"? This cannot be undone.`)) {
                await deleteNote(note.id);
                if (currentNoteId === note.id) {
                    currentNoteId = null;
                    window.__currentNoteId = null;
                }
                await loadNotesList();
                const remainingNotes = await getAllNotes();
                if (remainingNotes.length > 0) {
                    const { selectNote } = await import("./noteOps.js");
                    selectNote(remainingNotes[0].id);
                } else {
                    showEmptyState();
                }
            }
        });

        actions.appendChild(pinBtn);
        actions.appendChild(deleteBtn);

        li.appendChild(title);
        li.appendChild(date);
        li.appendChild(actions);

        li.addEventListener("click", async () => {
            const { selectNote } = await import("./noteOps.js");
            selectNote(note.id);
        });

        notesList.appendChild(li);
    });
}
