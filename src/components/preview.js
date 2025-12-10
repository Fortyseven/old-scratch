// Markdown preview and code highlighting

import { marked } from "marked";

import hljs from "highlight.js/lib/core";
import markdown from "highlight.js/lib/languages/markdown";
import javascript from "highlight.js/lib/languages/javascript";
import xml from "highlight.js/lib/languages/xml";
import python from "highlight.js/lib/languages/python";

// Then register the languages you need
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("python", python);

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
