#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Paths
const SRC_DIR = path.join(__dirname, "src");
const DIST_DIR = path.join(__dirname, "dist");
const TEMPLATE_PATH = path.join(SRC_DIR, "template.html");
const CSS_PATH = path.join(SRC_DIR, "styles.css");
const JS_PATH = path.join(SRC_DIR, "app.js");
const OUTPUT_PATH = path.join(DIST_DIR, "notes.html");

// Parse command line arguments
const args = process.argv.slice(2);
const isWatch = args.includes("--watch");
const isDev = args.includes("--dev");

function build() {
    console.log("🔨 Building notes.html...");

    try {
        // Read source files
        const template = fs.readFileSync(TEMPLATE_PATH, "utf8");
        const css = fs.readFileSync(CSS_PATH, "utf8");
        const js = fs.readFileSync(JS_PATH, "utf8");

        // Inject CSS and JS into template
        let output = template.replace("<!--CSS-->", css);
        output = output.replace("<!--JS-->", js);

        // Ensure dist directory exists
        if (!fs.existsSync(DIST_DIR)) {
            fs.mkdirSync(DIST_DIR, { recursive: true });
        }

        // Write output file
        fs.writeFileSync(OUTPUT_PATH, output, "utf8");

        const stats = fs.statSync(OUTPUT_PATH);
        const fileSizeKB = (stats.size / 1024).toFixed(2);

        console.log(
            `✅ Build complete! Output: ${OUTPUT_PATH} (${fileSizeKB} KB)`
        );
    } catch (error) {
        console.error("❌ Build failed:", error.message);
        process.exit(1);
    }
}

function startWatch() {
    console.log("👀 Watching for changes in src/...\n");

    // Initial build
    build();

    const chokidar = require("chokidar");

    const watcher = chokidar.watch(SRC_DIR, {
        persistent: true,
        ignoreInitial: true,
    });

    watcher.on("change", (filePath) => {
        console.log(`\n📝 File changed: ${path.relative(__dirname, filePath)}`);
        build();
    });

    watcher.on("error", (error) => {
        console.error("❌ Watcher error:", error);
    });

    console.log("\nPress Ctrl+C to stop watching\n");
}

function startDevServer() {
    console.log("🚀 Starting development server...\n");

    // Initial build
    build();

    const chokidar = require("chokidar");
    const browserSync = require("browser-sync").create();

    // Start browser-sync
    browserSync.init({
        server: {
            baseDir: DIST_DIR,
            index: "notes.html",
        },
        port: 3000,
        open: true,
        notify: false,
        ui: false,
    });

    // Watch for changes
    const watcher = chokidar.watch(SRC_DIR, {
        persistent: true,
        ignoreInitial: true,
    });

    watcher.on("change", (filePath) => {
        console.log(`\n📝 File changed: ${path.relative(__dirname, filePath)}`);
        build();
        browserSync.reload();
    });

    watcher.on("error", (error) => {
        console.error("❌ Watcher error:", error);
    });

    console.log("\n✨ Dev server running at http://localhost:3000");
    console.log("Press Ctrl+C to stop\n");
}

// Main execution
if (isDev) {
    startDevServer();
} else if (isWatch) {
    startWatch();
} else {
    build();
}
