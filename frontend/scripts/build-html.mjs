import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const files = execSync("find src/views -name '*.html'")
  .toString()
  .trim()
  .split("\n");

for (const f of files) {
  const rel = path.relative("src/views", f);
  const out = path.join("dist", rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  execSync(`npx posthtml --config posthtml.config.cjs "${f}" -o "${out}"`);
  console.log(`Built: ${out}`);
}