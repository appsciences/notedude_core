import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createLocalFileNoteRepository } from "../src/adapters/local-file.ts";

test("local repository persists notes and field-level updates", async () => {
  const file = join(await mkdtemp(join(tmpdir(), "notedude-")), "data", "notes.json");
  const repository = createLocalFileNoteRepository(file);
  await repository.create({ id: "n", content: "hello", pinned: false, tagPinned: false, createdAt: 1, updatedAt: 1 });
  await repository.update("n", { pinned: true, updatedAt: 2 });
  assert.deepEqual(await repository.get("n"), { id: "n", content: "hello", pinned: true, tagPinned: false, createdAt: 1, updatedAt: 2 });
});

test("local repository rejects duplicate IDs", async () => {
  const repository = createLocalFileNoteRepository(join(await mkdtemp(join(tmpdir(), "notedude-")), "notes.json"));
  const value = { id: "n", content: "", pinned: false, tagPinned: false, createdAt: 1, updatedAt: 1 };
  await repository.create(value);
  await assert.rejects(repository.create(value), /already exists/);
});
