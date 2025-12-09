// Markdown preview and code highlighting

const previewPane = document.getElementById("previewPane");
const editorInput = document.getElementById("editorInput");

export function updatePreview() {
    const content = editorInput.value;
    const html = marked.parse(content);
    previewPane.innerHTML = html;

    previewPane.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightElement(block);
    });
}
