// Builds the three entry points to dist/ as ESM.
//   index  — the domain core and the markdown engine: no DOM, no React, runs anywhere.
//   ui     — the React widgets. React stays external so the app and this package share one copy.
//   local  — the file-backed adapter. Node only, so it is built for node and kept apart.
// `splitting` lets index and ui share one copy of the markdown engine rather than bundling it twice.
// Declarations come from `tsc -p tsconfig.build.json` (see the "build" script).
import { build } from "esbuild";
import { rmSync } from "node:fs";

rmSync("dist", { recursive: true, force: true });

await build({
  entryPoints: { index: "src/index.ts", ui: "src/ui/index.ts" },
  outdir: "dist",
  bundle: true,
  splitting: true,
  format: "esm",
  platform: "neutral",
  mainFields: ["module", "main"],
  target: "es2022",
  jsx: "automatic",
  sourcemap: true,
  external: ["react", "react-dom", "react/jsx-runtime"],
});

await build({
  entryPoints: { local: "src/adapters/local-file.ts" },
  outdir: "dist",
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node22",
  sourcemap: true,
});
