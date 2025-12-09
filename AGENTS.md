# Old Scratch - Single-Page Application

## Project Overview

A fully self-contained, single-page HTML application for composing and managing Markdown notes with syntax highlighting, preview, and persistent storage. The entire application exists in one portable HTML file.

## Core Features

### Note Management
- **Create Notes**: Create unlimited notes with auto-generated titles from content
- **Auto-Save**: Notes automatically save 1 second after typing stops
- **Persistent Storage**: All notes stored in browser IndexedDB
- **Session Memory**: Remembers which note was being viewed between page refreshes
- **Pin/Favorite**: Pin important notes to keep them at the top of the list (⭐ star icon)
- **Delete Notes**: Remove notes with confirmation dialog (🗑️ trash icon)
- **Metadata Tracking**: Tracks creation date and last modified date for each note

### User Interface
- **Two-Pane Layout**:
  - Left sidebar: List of notes (300px width)
  - Right pane: Split into editor (left half) and preview (right half)
- **Note List Display**: Shows note title (first 15 characters) and last modified date
- **Sorting**: Pinned notes appear first, then sorted by most recently modified
- **Active Indication**: Currently selected note highlighted in accent color
- **Hover Actions**: Pin and delete buttons appear when hovering over notes
- **Empty State**: Friendly message when no notes exist

### Editor Features
- **Markdown Editing**: Monospace editor with live syntax highlighting
- **Real-time Preview**: Instant rendered preview of Markdown as you type
- **Syntax Highlighting**:
  - Editor: Custom layered approach with colored syntax for headers, bold, italic, code, links, blockquotes, lists
  - Preview: Code blocks highlighted using highlight.js
- **Scroll Sync**: Editor and highlight layer stay synchronized when scrolling
- **Toolbar**: Shows creation and modification timestamps

### Theme Support
- **Dark/Light Modes**: Toggle between themes with button in header
- **System Preference**: Can detect and respect user's preferred theme
- **Persistent Choice**: Theme preference saved to localStorage
- **Adaptive Styling**: All UI elements and syntax highlighting adapt to theme
- **CSS Variables**: Uses CSS custom properties for easy theme switching

### Import/Export
- **Export All Notes**: Download entire collection as timestamped JSON file
  - Format: `notes-export-YYYY-MM-DD.json`
  - Includes metadata, version, and export timestamp
- **Import Notes**: Import previously exported JSON files
  - Merges with existing notes (doesn't overwrite)
  - Shows confirmation with count of imported notes
- **Export Individual Note**: Right-click in editor to export current note as `.md` file
  - Format: `{note-title}-YYYY-MM-DD.md`
  - Plain Markdown text file

## Technical Architecture

### File Structure

**Production Output:**
- `dist/index.html` (~1119 lines, 28.58 KB) - Single portable file for distribution

**Source Files:**
- `src/template.html` - HTML structure with `<!--CSS-->` and `<!--JS-->` placeholders
- `src/styles.css` - All CSS styles (variables, layout, syntax highlighting)
- `src/app.js` - All JavaScript code (database, UI, editor functionality)

**Build System:**
- `build.js` - Node.js build script that assembles source files into single HTML
- `package.json` - npm configuration with build/watch/dev scripts
- `.gitignore` - Excludes node_modules and optionally dist/

### External Dependencies (CDN)
1. **highlight.js** (v11.9.0): Syntax highlighting for code blocks in preview
   - Light theme: `atom-one-light.min.css`
   - Dark theme: `atom-one-dark.min.css`
2. **marked.js** (v11.1.1): Markdown parsing for preview pane

### Build Dependencies (npm)
1. **chokidar** (^3.5.3): File watching for watch mode
2. **browser-sync** (^2.29.3): Development server with live reload

### Database Schema (IndexedDB)

**Database Name**: `MarkdownNotesDB`

**Object Store: `notes`**
- `id` (auto-increment): Unique note identifier
- `title` (string): Note title (first 15 printable characters)
- `content` (string): Full Markdown content
- `createdAt` (timestamp): Note creation time
- `modifiedAt` (timestamp): Last modification time
- `pinned` (boolean): Whether note is pinned to top

**Object Store: `config`**
- `selectedNoteId`: ID of currently/last selected note

### Key JavaScript Functions

#### Database Operations
- `initDatabase()`: Opens/creates IndexedDB database
- `getAllNotes()`: Retrieves all notes, sorted by pin status then modified date
- `getNote(id)`: Retrieves single note by ID
- `saveNote(note)`: Saves/updates a note
- `deleteNote(id)`: Removes a note
- `getSelectedNoteId()`: Gets last selected note ID
- `setSelectedNoteId(id)`: Saves current selection

#### UI Operations
- `createNewNote()`: Creates blank note and selects it
- `selectNote(id)`: Loads note into editor
- `loadNotesList()`: Renders sidebar note list
- `updateToolbar(note)`: Updates creation/modified timestamps
- `updatePreview()`: Renders Markdown to HTML in preview pane
- `saveCurrentNote()`: Persists current note with debouncing
- `autoSaveNote()`: Triggers delayed save (1 second)

#### Editor Highlighting
- `highlightMarkdown(text)`: Applies syntax highlighting to raw Markdown
- `updateHighlight()`: Updates the highlight layer behind textarea

#### Import/Export
- `exportAllNotes()`: Downloads all notes as JSON
- `importNotes(file)`: Imports notes from JSON file
- `exportCurrentNoteAsMarkdown()`: Downloads current note as .md file
- `downloadFile(content, filename, type)`: Helper for file downloads

#### Pin/Unpin
- `togglePinNote(noteId)`: Toggles pin status and refreshes list

#### Theme Management
- `initTheme()`: Sets initial theme from localStorage
- `loadLightModeStyles()`: Switches to light syntax highlighting
- Theme toggle button click handler: Switches themes and persists choice

### CSS Architecture

#### CSS Variables (`:root` and `body.dark-mode`)
- `--bg-primary`: Main background color
- `--bg-secondary`: Secondary surfaces (sidebar, toolbar)
- `--text-primary`: Primary text color
- `--text-secondary`: Muted text color
- `--border-color`: Border color
- `--accent-color`: Accent/highlight color (blue in light, lighter blue in dark)
- `--accent-hover`: Hover state for accent
- `--input-bg`: Editor background
- `--hljs-bg`: Code block background

#### Editor Layering System
- `.editor-wrapper`: Relative positioned container
- `.editor-highlight`: Absolute positioned, colored syntax layer (z-index: 1)
- `.editor-input`: Absolute positioned, transparent textarea (z-index: 2)
- Caret remains visible via `caret-color` property
- Scroll syncing via JavaScript event listener

#### Markdown Syntax Classes
- `.md-header`: Headers (blue, bold)
- `.md-bold`: Bold text
- `.md-italic`: Italic text
- `.md-code`: Inline code (background highlight)
- `.md-link`: Link text (blue, underlined)
- `.md-url`: URL in link (green)
- `.md-list`: List markers (gray)
- `.md-blockquote`: Blockquote text (gray, italic)

## Initialization Flow

1. `initTheme()`: Load theme preference
2. `initDatabase()`: Open/create IndexedDB
3. `getAllNotes()`: Retrieve all notes
4. If no notes exist: `createNewNote()` automatically
5. If notes exist:
   - Try to select `selectedNoteId` from config
   - Fall back to most recent note if not found
6. `loadNotesList()`: Render sidebar
7. `selectNote(id)`: Load selected note into editor

## User Interactions

### Creating Notes
- Click "+ New Note" button in sidebar
- New blank note created with "Untitled Note" title
- Automatically selected and ready for editing

### Editing Notes
- Click any note in sidebar to select
- Type in left editor pane (syntax highlighted)
- See live preview in right pane
- Auto-saves after 1 second of inactivity

### Pinning Notes
- Hover over note in sidebar
- Click ☆ to pin (turns to ⭐)
- Click ⭐ to unpin (turns to ☆)
- Pinned notes stay at top of list

### Deleting Notes
- Hover over note in sidebar
- Click 🗑️ icon
- Confirm deletion in dialog
- Note removed, next note auto-selected

### Exporting Notes
- Click "⬇️ Export All" in header: Downloads all notes as JSON
- Right-click in editor: Context menu appears with "Export as Markdown" option

### Importing Notes
- Click "⬆️ Import" in header
- Select JSON file from file picker
- Notes imported and merged with existing collection
- Success message shows count

### Switching Themes
- Click theme toggle button in header
- "🌙 Dark Mode" or "☀️ Light Mode"
- Theme immediately switches, preference saved

## Future Enhancement Ideas

Potential features that could be added (not yet implemented):

- Search/filter notes by content or title
- Note tags/categories for organization
- Word/character count in toolbar
- Keyboard shortcuts (Ctrl+N, Ctrl+S, etc.)
- Fullscreen mode for distraction-free writing
- Markdown toolbar with formatting buttons
- Note templates
- Note locking/read-only mode
- Auto-backup to external storage
- Collaborative editing/sync
- Note linking/backlinking
- Attachment support
- Version history/undo
- Note encryption

## Development Notes

### Development Workflow

**Getting Started:**
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Watch mode (auto-rebuild on changes)
npm run watch

# Development server (auto-rebuild + live reload at http://localhost:3000)
npm run dev
```

**Source File Organization:**
- `src/template.html` - HTML skeleton with injection placeholders (`<!--CSS-->` and `<!--JS-->`)
- `src/styles.css` - All CSS extracted from the `<style>` tag
- `src/app.js` - All JavaScript extracted from the `<script>` tag

**Build Process:**
1. Read source files (`template.html`, `styles.css`, `app.js`)
2. Inject CSS content into `<!--CSS-->` placeholder in template
3. Inject JavaScript content into `<!--JS-->` placeholder in template
4. Write assembled output to `dist/index.html`
5. Result: Single portable HTML file identical to original architecture

**Development Modes:**
- `npm run build`: One-time build for production distribution
- `npm run watch`: Watches `src/` for changes and auto-rebuilds
- `npm run dev`: Runs watch mode + browser-sync server on port 3000 with live reload

**Why This Architecture?**

**Modular Development**: Source files separated for maintainability
- Easier to navigate and edit specific concerns (HTML/CSS/JS)
- Better syntax highlighting and IDE support for each file type
- Git diffs more readable when changes isolated to specific files

**Preserved Portability**: Build output remains single-file
- Final `dist/index.html` is still fully portable
- No build process required for end users
- Can be distributed/shared as single file just like original

### Why This Architecture?

**Single File Design**: Entire app in one HTML file for maximum portability
- No build process required
- No server needed
- Works offline
- Easy to share/distribute
- Can be run from any filesystem

**No Framework**: Vanilla JavaScript chosen for:
- Zero runtime dependencies (except marked.js and highlight.js via CDN)
- Smaller file size
- No compile step for end users
- Direct DOM manipulation sufficient for this scope
- Easier to understand and modify

**Build System**: Simple Node.js script chosen for:
- Transparent and customizable build process
- No complex tooling or configuration
- Easy to understand and modify
- Minimal dependencies (just file watching and dev server)

**IndexedDB**: Chosen over localStorage for:
- Larger storage capacity
- Structured data with indexes
- Better performance for multiple records
- Native async API
- Better suited for CRUD operations

**Layered Editor Highlighting**: DIY approach because:
- CodeMirror/Ace too heavy for single-file design
- Simple textarea with overlay keeps it lightweight
- Full control over styling
- No external dependencies for editor

### Known Limitations

1. **CDN Dependencies**: Requires internet for highlight.js and marked.js
   - Could be inlined to make fully offline-capable
   - Trade-off: File size vs. portability

2. **Browser Compatibility**: Requires modern browser with:
   - IndexedDB support
   - ES6+ JavaScript features
   - CSS custom properties
   - File API for import/export

3. **No Collaboration**: Single-user, local-only
   - No sync between devices
   - No multi-user support

4. **Limited Markdown Syntax**: Highlighting regex-based, not full parser
   - May miss edge cases
   - No multiline pattern support
   - Bold/italic don't combine perfectly

5. **Performance**: Large note collections (1000+) may see slowdown
   - No virtualization in note list
   - Full re-render on each update

## File Size
Current: ~1119 lines, ~28.58KB (unminified production build)

## Browser Support
- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅ (requires IndexedDB support)
- Mobile browsers: ✅ (with responsive considerations)

## License
Not specified - consider adding if distributing

## Version
Current: 1.0 (as of December 9, 2025)
