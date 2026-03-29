/**
 * One-shot: strip TypeScript syntax and emit .js / .jsx next to sources, then remove .ts / .tsx.
 * Run from repo root: node scripts/convert-ts-to-js.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function* walkFiles(dir) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) {
      if (name.name === "node_modules" || name.name === "dist") continue;
      yield* walkFiles(full);
    } else {
      yield full;
    }
  }
}

function outPathFor(file) {
  if (file.endsWith(".tsx")) return file.slice(0, -4) + ".jsx";
  if (file.endsWith(".ts")) return file.slice(0, -3) + ".js";
  return null;
}

const extraRoots = [
  path.join(root, "vite.config.ts"),
  path.join(root, "drizzle.config.ts"),
  path.join(root, "vitest.config.ts"),
];

const dirs = [
  path.join(root, "client", "src"),
  path.join(root, "server"),
  path.join(root, "shared"),
  path.join(root, "drizzle"),
];

const toConvert = [];

for (const d of dirs) {
  for (const f of walkFiles(d)) {
    if (!/\.tsx?$/.test(f) || f.endsWith(".d.ts")) continue;
    toConvert.push(f);
  }
}
for (const f of extraRoots) {
  if (fs.existsSync(f)) toConvert.push(f);
}

for (const file of toConvert) {
  const out = outPathFor(file);
  if (!out) continue;
  const code = fs.readFileSync(file, "utf8");
  const loader = file.endsWith(".tsx") ? "tsx" : "ts";
  const result = await esbuild.transform(code, {
    loader,
    format: "esm",
    target: "esnext",
    jsx: "automatic",
  });
  fs.writeFileSync(out, result.code, "utf8");
  fs.unlinkSync(file);
  console.log(`${path.relative(root, file)} -> ${path.relative(root, out)}`);
}

console.log(`Done: ${toConvert.length} files.`);
