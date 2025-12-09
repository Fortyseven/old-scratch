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

### Project Structure

```
src/
├── template.html          # HTML skeleton
├── styles.css             # Global styles and themes
├── app.js                 # Main entry point and event bindings
└── components/            # Modular feature components
    ├── database.js        # IndexedDB operations
    ├── editor.js          # Editor UI and syntax highlighting
    ├── preview.js         # Markdown preview rendering
    ├── theme.js           # Theme management
    ├── importExport.js    # Import/export functionality
    ├── ui.js              # UI rendering and note list
    └── noteOps.js         # Note operations (create, save, select)

dist/
└── index.html             # Built single-file application
```

### Making Changes

1. Edit source files in `src/`
   - Component modules in `src/components/` - Feature-specific logic
   - `template.html` - HTML structure
   - `styles.css` - Styles and theming
   - `app.js` - Main app initialization and event wiring

2. Run development server:
   ```bash
   npm run dev
   ```
   This will:
   - Bundle all modules using esbuild
   - Build the application into a single HTML file
   - Start a local server at http://localhost:3000
   - Watch for changes and auto-reload

### Build System

The project uses **esbuild** to bundle ES modules into a single IIFE-wrapped JavaScript bundle, which is then embedded into the HTML template. This maintains the single-file portability while allowing modular development.

**Build Commands:**
- `npm run build` - Production build (minified)
- `npm run build:dev` - Development build (unminified, inline sourcemaps)
- `npm run watch` - Watch mode (rebuild on file changes)
- `npm run dev` - Development server with live reload

### Building for Production

```bash
npm run build
```

Output: `dist/index.html` - A single, portable HTML file that can be:
- Opened directly in any browser
- Shared as a single file
- Run offline without a server