import esbuild from "esbuild";
import { copyFileSync } from "fs";

await esbuild.build({
  entryPoints: ["src/index.js"],
  bundle: false,
  outfile: "dist/index.js",
  minify: false,
});

copyFileSync("manifest.json", "dist/manifest.json");
console.log("Done → dist/");
