// Note operations (create, select, auto-save, etc)

import {
    getNote,
    saveNote,
    getAllNotes,
    setSelectedNoteId,
    getSelectedNoteId,
    initDatabase,
} from "./database.js";
import {
    updateEditorContent,
    updateActiveNoteInList,
    setCurrentNoteId,
    loadNotesList,
    hideEmptyState,
    showEmptyState,
} from "./ui.js";
import { updatePreview } from "./preview.js";

const editorInput = document.getElementById("editorInput");

let saveTimeout = null;

export async function createNewNote() {
    const note = {
        title: "Untitled Note",
        content: "",
        createdAt: Date.now(),
        modifiedAt: Date.now(),
    };

    const id = await saveNote(note);
    setCurrentNoteId(id);
    await setSelectedNoteId(id);
    await loadNotesList();
    await selectNote(id);
}

export async function selectNote(id) {
    setCurrentNoteId(id);
    await setSelectedNoteId(id);

    const note = await getNote(id);
    if (note) {
        updateEditorContent(note);
        updateActiveNoteInList(id);
    }
}

export async function saveCurrentNote() {
    const { getCurrentNoteId } = await import("./ui.js");
    const currentNoteId = getCurrentNoteId();

    if (currentNoteId === null) return;

    const note = await getNote(currentNoteId);
    if (note) {
        note.content = editorInput.value;
        note.modifiedAt = Date.now();

        const lines = note.content.split("\n");
        let title = lines[0].replace(/^#+\s*/, "").trim();
        if (!title) {
            title =
                lines.find((line) => line.trim() !== "")?.substring(0, 15) ||
                "Untitled Note";
        } else {
            title = title.substring(0, 15);
        }
        note.title = title || "Untitled Note";

        await saveNote(note);
        await loadNotesList();
    }
}

export function autoSaveNote() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveCurrentNote, 1000);
}

export async function initializeApp() {
    await initDatabase();

    const notes = await getAllNotes();

    if (notes.length === 0) {
        await createNewNote();
    } else {
        const selectedId = await getSelectedNoteId();
        if (selectedId && notes.some((n) => n.id === selectedId)) {
            setCurrentNoteId(selectedId);
        } else {
            setCurrentNoteId(notes[0].id);
        }
        await loadNotesList();
        await selectNote(notes[0].id);
    }
}
