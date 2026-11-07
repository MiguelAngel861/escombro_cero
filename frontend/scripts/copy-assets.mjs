import fs from "fs";

fs.rmSync("dist/assets", { recursive: true, force: true });
fs.mkdirSync("dist/assets", { recursive: true });
fs.mkdirSync("dist/styles", { recursive: true });
fs.cpSync("src/assets", "dist/assets", { recursive: true });
console.log("Assets copied to dist/assets");
