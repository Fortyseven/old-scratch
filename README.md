# Old Scratch

A fully self-contained, single-page HTML application for composing and managing Markdown notes.

## Features

- Create unlimited markdown notes
- Auto-save after 1 second of inactivity
- Live preview with syntax highlighting
- Dark/light theme toggle
- Pin/favorite notes
- Import/export notes as JSON
- Export individual notes as Markdown files
- Persistent storage using IndexedDB

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