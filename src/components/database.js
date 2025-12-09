// Database logic for IndexedDB

export const DB_NAME = "MarkdownNotesDB";
export const STORE_NAME = "notes";
export const CONFIG_STORE = "config";

let db;

export function initDatabase() {
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

export function getAllNotes() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const notes = request.result.sort((a, b) => {
                if (a.pinned && !b.pinned) return -1;
                if (!a.pinned && b.pinned) return 1;
                return b.modifiedAt - a.modifiedAt;
            });
            resolve(notes);
        };
    });
}

export function getNote(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

export function saveNote(note) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = note.id ? store.put(note) : store.add(note);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

export function deleteNote(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

export function getSelectedNoteId() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([CONFIG_STORE], "readonly");
        const store = transaction.objectStore(CONFIG_STORE);
        const request = store.get("selectedNoteId");

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

export function setSelectedNoteId(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([CONFIG_STORE], "readwrite");
        const store = transaction.objectStore(CONFIG_STORE);
        const request = store.put(id, "selectedNoteId");

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}
