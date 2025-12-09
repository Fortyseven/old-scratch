#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { minify: minifyHTML } = require("html-minifier-terser");
const { minify: minifyJS } = require("terser");
const CleanCSS = require("clean-css");

// Paths
const SRC_DIR = path.join(__dirname, "src");
const DIST_DIR = path.join(__dirname, "dist");
const TEMPLATE_PATH = path.join(SRC_DIR, "template.html");
const CSS_PATH = path.join(SRC_DIR, "styles.css");
const JS_PATH = path.join(SRC_DIR, "app.js");
const OUTPUT_PATH = path.join(DIST_DIR, "index.html");

// Parse command line arguments
const args = process.argv.slice(2);
const isWatch = args.includes("--watch");
const isDev = args.includes("--dev");
const shouldMinify = !isDev; // Minify by default, but not in dev mode

async function build() {
    console.log(
        `🔨 Building index.html${shouldMinify ? " (minified)" : ""}...`
    );

    try {
        // Read source files
        const template = fs.readFileSync(TEMPLATE_PATH, "utf8");
        let css = fs.readFileSync(CSS_PATH, "utf8");
        let js = fs.readFileSync(JS_PATH, "utf8");

        // Minify CSS
        if (shouldMinify) {
            const cssResult = new CleanCSS({
                level: 2,
                format: false,
            }).minify(css);
            css = cssResult.styles;
        }

        // Minify JavaScript
        if (shouldMinify) {
            const jsResult = await minifyJS(js, {
                compress: {
                    dead_code: true,
                    drop_console: false,
                    drop_debugger: true,
                    keep_classnames: false,
                    keep_fargs: true,
                    keep_fnames: false,
                    keep_infinity: false,
                },
                mangle: {
                    toplevel: true,
                },
                format: {
                    comments: false,
                },
            });
            js = jsResult.code;
        }

        // Inject CSS and JS into template
        // Handle both single-line (<!--CSS-->) and multi-line (<!--CSS\n-->) placeholders
        let output = template.replace(/<!--CSS[\s\S]*?-->/g, css);
        output = output.replace(/<!--JS[\s\S]*?-->/g, js);

        // Minify HTML
        if (shouldMinify) {
            output = await minifyHTML(output, {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true,
                minifyCSS: true,
                minifyJS: true,
            });
        }

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
    build().catch(console.error);

    const chokidar = require("chokidar");

    const watcher = chokidar.watch(SRC_DIR, {
        persistent: true,
        ignoreInitial: true,
    });

    watcher.on("change", (filePath) => {
        console.log(`\n📝 File changed: ${path.relative(__dirname, filePath)}`);
        build().catch(console.error);
    });

    watcher.on("error", (error) => {
        console.error("❌ Watcher error:", error);
    });

    console.log("\nPress Ctrl+C to stop watching\n");
}

function startDevServer() {
    console.log("🚀 Starting development server...\n");

    // Initial build
    build().catch(console.error);

    const chokidar = require("chokidar");
    const browserSync = require("browser-sync").create();

    // Start browser-sync
    browserSync.init({
        server: {
            baseDir: DIST_DIR,
            index: "index.html",
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
        build()
            .then(() => browserSync.reload())
            .catch(console.error);
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
    build().catch((error) => {
        console.error("Build error:", error);
        process.exit(1);
    });
}
