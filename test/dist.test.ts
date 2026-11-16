import { test } from "node:test";
import assert from "node:assert/strict";

// The package is consumed from `dist/`, never from `src/`: a consumer's Node cannot strip types
// inside node_modules. These pin that every entry point builds, loads through the package exports map, and exports what the
// apps import — `npm test` builds first (pretest).

test("the root entry exposes the domain core and the markdown engine", async () => {
  const core = await import("@notedude/core");
  for (const name of ["createNoteService", "queryNotes", "getNoteTitle", "parseNote", "toggleHeading", "htmlToNoteText", "attachmentRef"]) {
    assert.equal(typeof (core as Record<string, unknown>)[name], "function", name);
  }
});

test("the ui entry exposes the widgets, the theme and the helpers the apps use", async () => {
  const ui = await import("@notedude/core/ui");
  for (const name of ["NoteList", "NoteContent", "NoteText", "SearchBar", "HelpOverlay", "CommandKeypad", "ThemeProvider", "useTheme", "AppShell", "parseNote", "getNoteTitle", "formatTimestamp"]) {
    assert.ok((ui as Record<string, unknown>)[name], name);
  }
});

test("the local entry builds for node", async () => {
  const local = await import("@notedude/core/local");
  assert.ok(Object.keys(local).length > 0);
});

test("one title rule everywhere: the ui entry re-exports core's", async () => {
  const core = await import("@notedude/core");
  const ui = await import("@notedude/core/ui");
  assert.equal(ui.getNoteTitle, core.getNoteTitle);
  assert.equal(core.getNoteTitle({ content: "# Groceries\nmilk" }), "Groceries");
});
