#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");
const { minify: minifyHTML } = require("html-minifier-terser");
const CleanCSS = require("clean-css");
const sass = require("sass");

// Paths
const SRC_DIR = path.join(__dirname, "src");
const DIST_DIR = path.join(__dirname, "dist");
const TEMPLATE_PATH = path.join(SRC_DIR, "template.html");
const SCSS_ENTRY_PATH = path.join(SRC_DIR, "styles", "index.scss");
const CSS_PATH = path.join(SRC_DIR, "styles.css");
const JS_ENTRY_PATH = path.join(SRC_DIR, "app.js");
const OUTPUT_PATH = path.join(DIST_DIR, "index.html");

// Parse command line arguments
const args = process.argv.slice(2);
const isWatch = args.includes("--watch");
const isDev = args.includes("--dev");
const shouldMinify = !isDev;

function compileSCSS() {
    console.log("🎨 Compiling SCSS...");

    const scssContent = fs.readFileSync(SCSS_ENTRY_PATH, "utf8");
    const result = sass.compileString(scssContent, {
        loadPaths: [path.join(SRC_DIR, "styles")],
        style: shouldMinify ? "compressed" : "expanded",
    });

    return result.css;
}

async function bundleJS() {
    console.log("📦 Bundling JavaScript modules with esbuild...");

    const result = await esbuild.build({
        entryPoints: [JS_ENTRY_PATH],
        bundle: true,
        write: false,
        minify: shouldMinify,
        format: "iife", // Use IIFE to avoid needing type="module" in HTML
        sourcemap: isDev ? "inline" : false,
        logLevel: "info",
    });

    return result.outputFiles[0].text;
}

async function build() {
    console.log(
        `🔨 Building index.html${shouldMinify ? " (minified)" : ""}...`
    );

    try {
        // Ensure dist directory exists
        if (!fs.existsSync(DIST_DIR)) {
            fs.mkdirSync(DIST_DIR, { recursive: true });
        }

        // Compile SCSS first
        let css = compileSCSS();

        // Read source files
        const template = fs.readFileSync(TEMPLATE_PATH, "utf8");
        let js = await bundleJS();

        // Minify CSS (additional minification on top of SCSS output)
        if (shouldMinify) {
            const cssResult = new CleanCSS({
                level: 2,
                format: false,
            }).minify(css);
            css = cssResult.styles;
        }

        // Replace placeholders in template
        let html = template.replace("<!--CSS-->", css).replace("<!--JS-->", js);

        // Minify HTML
        if (shouldMinify) {
            html = await minifyHTML(html, {
                removeComments: true,
                collapseWhitespace: true,
                minifyCSS: false, // Already minified
                minifyJS: false, // Already minified by esbuild
            });
        }

        // Write output
        fs.writeFileSync(OUTPUT_PATH, html);
        const fileSize = (fs.statSync(OUTPUT_PATH).size / 1024).toFixed(2);
        console.log(`✅ Built successfully: ${OUTPUT_PATH} (${fileSize} KB)`);
    } catch (error) {
        console.error("❌ Build failed:", error.message);
        process.exit(1);
    }
}

async function watchBuild() {
    console.log("👀 Watching for changes...");
    const chokidar = require("chokidar");

    const watcher = chokidar.watch(
        path.join(SRC_DIR, "**/*.{js,scss,css,html}"),
        {
            ignored: /node_modules/,
            persistent: true,
        }
    );

    watcher.on("change", async () => {
        console.log("\n📝 Files changed, rebuilding...");
        await build();
    });
}

async function devServer() {
    console.log("🚀 Starting development server with live reload...");
    const browserSync = require("browser-sync").create();

    await build();

    browserSync.init({
        server: {
            baseDir: DIST_DIR,
        },
        port: 3000,
        ui: false,
        notify: false,
    });

    const chokidar = require("chokidar");
    chokidar
        .watch(path.join(SRC_DIR, "**/*.{js,scss,css,html}"), {
            ignored: /node_modules/,
            persistent: true,
        })
        .on("change", async () => {
            console.log("\n📝 Files changed, rebuilding...");
            await build();
            browserSync.reload();
        });
}

// Run based on arguments
if (isWatch) {
    watchBuild();
} else if (isDev) {
    devServer();
} else {
    build();
}
