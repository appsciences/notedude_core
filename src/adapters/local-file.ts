import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { Note, NotePatch } from "../note.ts";
import type { NoteRepository } from "../service.ts";

function isNote(value: unknown): value is Note {
  const n = value as Partial<Note> | null;
  return !!n && typeof n.id === "string" && typeof n.content === "string"
    && typeof n.pinned === "boolean" && typeof n.tagPinned === "boolean"
    && typeof n.createdAt === "number" && typeof n.updatedAt === "number";
}

/** Zero-dependency embedded persistence for the open-source Node TUI. */
export function createLocalFileNoteRepository(fileName: string): NoteRepository {
  const file = resolve(fileName);
  let queue: Promise<void> = Promise.resolve();
  async function read(): Promise<Note[]> {
    try {
      const data = JSON.parse(await readFile(file, "utf8")) as { version?: unknown; notes?: unknown };
      if (data.version !== 1 || !Array.isArray(data.notes) || !data.notes.every(isNote))
        throw new Error(`Invalid NoteDude database: ${file}`);
      return [...data.notes];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
  }
  function mutate(change: (notes: Note[]) => Note[]): Promise<void> {
    queue = queue.then(async () => {
      const notes = change(await read());
      await mkdir(dirname(file), { recursive: true });
      const temporary = `${file}.${process.pid}.tmp`;
      await writeFile(temporary, `${JSON.stringify({ version: 1, notes }, null, 2)}\n`, { mode: 0o600 });
      await rename(temporary, file);
    });
    return queue;
  }
  return {
    async list() { await queue; return read(); },
    async get(id) { await queue; return (await read()).find((note) => note.id === id); },
    async create(note) { await mutate((notes) => {
      if (notes.some((item) => item.id === note.id)) throw new Error(`Note already exists: ${note.id}`);
      return [...notes, note];
    }); },
    async update(id, patch: NotePatch) { await mutate((notes) => {
      const index = notes.findIndex((note) => note.id === id);
      if (index < 0) throw new Error(`Note not found: ${id}`);
      const next = [...notes]; next[index] = { ...next[index], ...patch }; return next;
    }); },
  };
}
