import fs from "fs";
import { execSync } from "child_process";

function build() {
  try {
    execSync("pnpm run html", { stdio: "inherit" });
  } catch (e) {
    console.error("Error building HTML:", e.message);
  }
}

fs.watch("src/views", { recursive: true }, (eventType, filename) => {
  if (filename && filename.endsWith(".html")) {
    console.log(`[HTML] Change detected: ${filename}`);
    build();
  }
});

console.log("[HTML] Watching src/views for changes...");
build();
process.stdin.resume();