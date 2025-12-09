// Import/export and file download helpers

import { getAllNotes, getNote, saveNote } from "./database.js";
import { loadNotesList } from "./ui.js";

export function downloadFile(content, filename, type = "text/plain") {
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

export async function exportAllNotes() {
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

export async function importNotes(file) {
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

export function exportCurrentNoteAsMarkdown() {
    const currentNoteId = window.__currentNoteId;

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
