import test from "node:test";
import assert from "node:assert/strict";
import {
  appendTag, applyAction, composeSharedNote, createNoteService, getNoteMetaSnippet,
  getNoteTitle, inheritedTags, queryNotes, stripTag, withTaskTag,
  type Note, type NotePatch, type NoteRepository,
} from "../src/index.ts";

const note = (overrides: Partial<Note> = {}): Note => ({
  id: "n", content: "hello", pinned: false, tagPinned: false,
  createdAt: 1, updatedAt: 1, ...overrides,
});

test("derives display text without React", () => {
  assert.equal(getNoteTitle(note({ content: "\nTitle\nDetail" })), "Title");
  assert.equal(getNoteTitle(note({ content: "#tag", isNew: true })), "New Note");
  assert.equal(getNoteMetaSnippet(note({ content: "Title\nDetail" })), "Detail");
});

test("tag changes are exact and archive is not inherited", () => {
  assert.deepEqual(inheritedTags("#Work #work #archived words #next-one"), ["#work", "#next-one"]);
  assert.equal(stripTag(appendTag("hello", "#archived"), "#archived"), "hello");
  assert.equal(withTaskTag("hello #tasks-inbox", "#tasks-done"), "hello #tasks-done");
});

test("query separates archived notes and honors exact tags and pin rules", () => {
  const notes = [
    note({ id: "old", content: "alpha #work", pinned: true, createdAt: 1, updatedAt: 1 }),
    note({ id: "new", content: "beta #work", createdAt: 2, updatedAt: 3 }),
    note({ id: "tp", content: "gamma #work", tagPinned: true, createdAt: 0, updatedAt: 2 }),
    note({ id: "arch", content: "alpha #work #archived", createdAt: 4, updatedAt: 4 }),
    note({ id: "prefix", content: "#worker", updatedAt: 9 }),
  ];
  assert.deepEqual(queryNotes(notes).active.map((n) => n.id), ["old", "new", "prefix", "tp"]);
  const result = queryNotes(notes, "#work");
  assert.deepEqual(result.active.map((n) => n.id), ["tp", "new", "old"]);
  assert.deepEqual(result.archived.map((n) => n.id), ["arch"]);
});

test("undo transforms current content instead of restoring a stale snapshot", () => {
  const action = { kind: "archive", noteId: "n" } as const;
  const archived = applyAction(note(), action);
  const edited = { ...archived, content: `edited ${archived.content}` };
  assert.equal(applyAction(edited, action, "undo").content, "edited hello");
});

test("share composition is platform-neutral", () => {
  assert.equal(composeSharedNote({ title: " Title ", text: "https://x", url: "https://x" }), "Title\nhttps://x");
});

test("service uses injected repository, clock, and ID generator", async () => {
  const saved: Note[] = [];
  const patches: Array<[string, NotePatch]> = [];
  const repository: NoteRepository = {
    async list() { return saved; }, async get(id) { return saved.find((n) => n.id === id); },
    async create(value) { saved.push(value); }, async update(id, patch) { patches.push([id, patch]); },
  };
  const service = createNoteService({ repository, clock: { now: () => 42 }, ids: { next: () => "id-1" } });
  const created = await service.create({ inheritedFromQuery: "#project #archived" });
  assert.deepEqual(created, note({ id: "id-1", content: "#project", createdAt: 42, updatedAt: 42, isNew: true }));
  await service.changeContent("id-1", "written");
  assert.deepEqual(patches[0], ["id-1", { content: "written", updatedAt: 42, isNew: false }]);
});
