# Old Scratch

A fully self-contained, single-page HTML application for composing and managing Markdown notes.

## Quick Start

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Watch mode (auto-rebuild on changes)
npm run watch

# Development server with live reload
npm run dev
```

## Project Structure

```
.
├── src/                    # Source files
│   ├── template.html      # HTML skeleton with placeholders
│   ├── styles.css         # All CSS styles
│   └── app.js             # All JavaScript code
├── dist/                   # Build output
│   └── index.html         # Single-file application (portable)
├── build.js               # Build script
└── package.json           # npm configuration
```

## Development Workflow

### Making Changes

1. Edit source files in `src/`
   - `template.html` - HTML structure
   - `styles.css` - Styles and theming
   - `app.js` - Application logic

2. Run development server:
   ```bash
   npm run dev
   ```
   This will:
   - Build the application
   - Start a local server at http://localhost:3000
   - Watch for changes and auto-reload

### Building for Production

```bash
npm run build
```

Output: `dist/index.html` - A single, portable HTML file that can be:
- Opened directly in any browser
- Shared as a single file
- Run offline without a server

## Build Process

The build script (`build.js`):
1. Reads source files from `src/`
2. Injects CSS into `<style>` tag
3. Injects JavaScript into `<script>` tag
4. Outputs a single `dist/index.html` file

This approach provides:
- **Modular development** with separate files for easier editing
- **Portable output** as a single HTML file
- **No runtime dependencies** (except CDN resources for marked.js and highlight.js)

## Features

- Create unlimited markdown notes
- Auto-save after 1 second of inactivity
- Live preview with syntax highlighting
- Dark/light theme toggle
- Pin/favorite notes
- Import/export notes as JSON
- Export individual notes as Markdown files
- Persistent storage using IndexedDB

For full documentation, see [AGENTS.md](./AGENTS.md)
