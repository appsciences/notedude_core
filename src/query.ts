import type { Note } from "./note.ts";
import { extractTagNames, hasExactTag, isArchived } from "./tags.ts";

export interface NoteQueryResult {
  readonly active: Note[];
  readonly archived: Note[];
}

export function matchesQuery(note: Pick<Note, "content">, query: string): boolean {
  const parts = query.trim().split(/\s+/).filter(Boolean);
  const lower = note.content.toLowerCase();
  return parts.every((part) => part.startsWith("#")
    ? hasExactTag(note.content, part)
    : lower.includes(part.toLowerCase()));
}

function idleSort(a: Note, b: Note): number {
  return Number(b.pinned) - Number(a.pinned) || b.createdAt - a.createdAt;
}

export function queryNotes(notes: readonly Note[], query = ""): NoteQueryResult {
  const trimmed = query.trim();
  const matching = notes.filter((note) => matchesQuery(note, trimmed));
  if (!trimmed) {
    return {
      active: matching.filter((note) => !isArchived(note)).sort(idleSort),
      archived: matching.filter(isArchived).sort(idleSort),
    };
  }

  const queryTags = new Set(extractTagNames(trimmed));
  const searchSort = (a: Note, b: Note): number => {
    const isTagPinned = (note: Note) => {
      const firstTag = extractTagNames(note.content)[0];
      return note.tagPinned && firstTag !== undefined && queryTags.has(firstTag);
    };
    return Number(isTagPinned(b)) - Number(isTagPinned(a)) || b.updatedAt - a.updatedAt;
  };
  return {
    active: matching.filter((note) => !isArchived(note)).sort(searchSort),
    archived: matching.filter(isArchived).sort((a, b) => b.updatedAt - a.updatedAt),
  };
}
