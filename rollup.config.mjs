import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import esbuild from "rollup-plugin-esbuild";
import terser from "@rollup/plugin-terser";
import { copyFileSync, mkdirSync } from "fs";

const globals = {
    "@vendetta/metro": "vendetta.metro",
    "@vendetta/metro/common": "vendetta.metro.common",
    "@vendetta/patcher": "vendetta.patcher",
    "@vendetta/plugin": "vendetta.plugin",
    "@vendetta/storage": "vendetta.storage",
    "@vendetta/ui": "vendetta.ui",
    "@vendetta/ui/assets": "vendetta.ui.assets",
    "@vendetta/ui/components": "vendetta.ui.components",
    "@vendetta/ui/toasts": "vendetta.ui.toasts",
};

export default {
    input: "src/index.tsx",
    external: Object.keys(globals),
    output: {
        file: "dist/index.js",
        format: "iife",
        name: "$",
        globals,
        footer: "return $;",
    },
    plugins: [
        nodeResolve(),
        commonjs(),
        esbuild({ target: "esnext", jsx: "transform" }),
        terser({ compress: { passes: 3 } }),
        {
            name: "copy-manifest",
            writeBundle() {
                mkdirSync("dist", { recursive: true });
                copyFileSync("manifest.json", "dist/manifest.json");
            },
        },
    ],
};
