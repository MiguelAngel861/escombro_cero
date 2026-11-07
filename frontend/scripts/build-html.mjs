import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const VIEWS_DIR = "src/views";
const DIST_DIR = "dist";

// Recolecciona todos los .html bajo src/views de forma recursiva.
// Usa fs en lugar del comando `find` para ser multiplataforma (en Windows
// `find` es find.exe, no GNU find, y falla con -name).
function collectHtml(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(collectHtml(full));
    } else if (entry.name.endsWith(".html")) {
      results.push(full);
    }
  }
  return results;
}

const files = collectHtml(VIEWS_DIR);

for (const f of files) {
  const rel = path.relative(VIEWS_DIR, f);
  const out = path.join(DIST_DIR, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  execSync(`npx posthtml --config posthtml.config.cjs "${f}" -o "${out}"`);
  console.log(`Built: ${out}`);
}
