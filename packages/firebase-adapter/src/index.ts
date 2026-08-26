import type { Note, NotePatch, NoteRepository } from "../../../src/index.ts";

export type TimestampLike = number | { toMillis(): number };
export interface Snapshot { readonly id: string; data(): Record<string, unknown> }
export interface FirestoreDriver {
  list(path: string): Promise<readonly Snapshot[]>;
  get(path: string, id: string): Promise<Snapshot | undefined>;
  create(path: string, id: string, data: Record<string, unknown>): Promise<void>;
  update(path: string, id: string, data: Record<string, unknown>): Promise<void>;
  serverTimestamp(): unknown;
}
function millis(value: unknown): number {
  return typeof value === "number" ? value : typeof (value as TimestampLike)?.toMillis === "function" ? (value as { toMillis(): number }).toMillis() : 0;
}
function decode(snapshot: Snapshot): Note {
  const d = snapshot.data();
  return { id: snapshot.id, content: typeof d.content === "string" ? d.content : "", pinned: d.pinned === true,
    tagPinned: d.tagPinned === true, createdAt: millis(d.createdAt), updatedAt: millis(d.updatedAt),
    ...(typeof d.isNew === "boolean" ? { isNew: d.isNew } : {}) };
}
export function createFirestoreNoteRepository(driver: FirestoreDriver, userId: string): NoteRepository {
  if (!userId.trim()) throw new Error("A user ID is required");
  const path = `users/${userId}/notes`;
  return {
    async list() { return (await driver.list(path)).map(decode); },
    async get(id) { const value = await driver.get(path, id); return value ? decode(value) : undefined; },
    async create(note) { await driver.create(path, note.id, { ...note, updatedAt: driver.serverTimestamp() }); },
    async update(id, patch: NotePatch) { await driver.update(path, id, { ...patch, updatedAt: driver.serverTimestamp() }); },
  };
}
