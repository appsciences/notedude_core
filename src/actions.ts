import type { Note } from "./note.ts";
import { appendTag, stripTag, withTaskTag, withoutTaskTag } from "./tags.ts";

export type NoteAction =
  | { readonly kind: "archive"; readonly noteId: string }
  | { readonly kind: "pin"; readonly noteId: string; readonly before: boolean }
  | { readonly kind: "tagPin"; readonly noteId: string; readonly before: boolean }
  | { readonly kind: "taskMove"; readonly noteId: string; readonly before: string | null; readonly after: string };

export function applyAction(note: Note, action: NoteAction, direction: "do" | "undo" = "do"): Note {
  if (note.id !== action.noteId) return note;
  switch (action.kind) {
    case "archive":
      return { ...note, content: direction === "do" ? appendTag(note.content, "#archived") : stripTag(note.content, "#archived") };
    case "pin":
      return { ...note, pinned: direction === "do" ? !action.before : action.before };
    case "tagPin":
      return { ...note, tagPinned: direction === "do" ? !action.before : action.before };
    case "taskMove": {
      const target = direction === "do" ? action.after : action.before;
      return { ...note, content: target ? withTaskTag(note.content, target) : withoutTaskTag(note.content) };
    }
  }
}
