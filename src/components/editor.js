// Editor logic and syntax highlighting

const editorInput = document.getElementById("editorInput");
const editorHighlight = document.getElementById("editorHighlight");

export function highlightMarkdown(text) {
    let highlighted = text;

    highlighted = highlighted
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    highlighted = highlighted.replace(
        /^(#{1,6})\s+(.+?)$/gm,
        '<span class="md-header">$1 $2</span>'
    );

    highlighted = highlighted.replace(
        /`([^`]+)`/g,
        '<span class="md-code">`$1`</span>'
    );

    highlighted = highlighted.replace(
        /(\*\*|__)([^*_]+)\1/g,
        '<span class="md-bold">$1$2$1</span>'
    );

    highlighted = highlighted.replace(
        /(\*|_)([^*_]+)\1/g,
        '<span class="md-italic">$1$2$1</span>'
    );

    highlighted = highlighted.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<span class="md-link">[$1]</span><span class="md-url">($2)</span>'
    );

    highlighted = highlighted.replace(
        /^&gt;\s+(.+?)$/gm,
        '<span class="md-blockquote">&gt; $1</span>'
    );

    highlighted = highlighted.replace(
        /^(\s*)([*+-]|\d+\.)\s+/gm,
        '$1<span class="md-list">$2</span> '
    );

    return highlighted;
}

export function updateHighlight() {
    const text = editorInput.value;
    const highlighted = highlightMarkdown(text);
    editorHighlight.innerHTML = highlighted;
}

export function syncEditorScroll() {
    editorHighlight.scrollTop = editorInput.scrollTop;
    editorHighlight.scrollLeft = editorInput.scrollLeft;
}
