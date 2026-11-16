import { defineConfig } from "vite";

// The gallery imports the library from source, so the e2e job needs no build of the package
// first. JSX is compiled by Vite's own esbuild; no plugin is needed.
//
// The library's files live outside this directory and import `react`; without `dedupe` they
// would resolve a second copy from the repository root and hooks would break.
export default defineConfig({
  esbuild: { jsx: "automatic" },
  resolve: { dedupe: ["react", "react-dom"] },
  server: { port: 4173, strictPort: true, fs: { allow: [".."] } },
});
