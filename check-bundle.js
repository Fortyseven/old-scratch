const fs = require("fs");
const path = require("path");

const distPath = path.join(__dirname, "dist", "index.html");
const html = fs.readFileSync(distPath, "utf8");

const match = html.match(/<script>([\s\S]*)<\/script>/);
if (!match) {
    console.error("No <script> block found in dist/index.html");
    process.exit(1);
}

const script = match[1];

try {
    // This will throw a SyntaxError if the script is invalid.
    new Function(script);
    console.log("Bundle parses OK");
} catch (err) {
    console.error("Bundle has syntax error:", err.message);
    console.error(err.stack || err);
    process.exit(1);
}
