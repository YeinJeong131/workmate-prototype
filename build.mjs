// Builds src/main.ts + src/template.html into a single index.html for GitHub Pages.
import { build } from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";

const result = await build({
  entryPoints: ["src/main.ts"],
  bundle: true,
  format: "iife",
  target: "es2019",
  write: false,
});
const js = result.outputFiles[0].text;
const html = readFileSync("src/template.html", "utf8").replace("/*APP*/", () => js);
writeFileSync("index.html", html);
console.log("Built index.html");
