import { stripMarkdownPrefix } from "./markdown/markdown.ts";

export interface Note {
  readonly id: string;
  readonly content: string;
  readonly pinned: boolean;
  readonly tagPinned: boolean;
  readonly createdAt: number;
  readonly updatedAt: number;
  /** True until content is first changed by the user. */
  readonly isNew?: boolean;
}

export type NotePatch = Partial<Pick<Note, "content" | "pinned" | "tagPinned" | "updatedAt" | "isNew">>;

export function contentWithoutTags(content: string): string {
  return content.replace(/#[\w-]+/g, "").trim();
}

/**
 * Index of the first line with something on it, or -1 if every line is blank. The title is
 * this line, not literally line 1: a note that opens with empty lines still has a title, it
 * just sits further down.
 */
function firstNonBlankIndex(lines: string[]): number {
  return lines.findIndex((line) => line.trim() !== "");
}

/**
 * A list row shows what the note *says*, not how it is marked up — a note titled `# Groceries`
 * reads as "Groceries". A line that is nothing but a marker keeps its raw text, so an empty
 * heading still shows something rather than blanking the row.
 */
function displayLine(line: string): string {
  const stripped = stripMarkdownPrefix(line);
  return stripped.trim() === "" ? line : stripped;
}

export function getNoteTitle(note: Pick<Note, "content" | "isNew">): string {
  if (note.isNew && contentWithoutTags(note.content) === "") return "New Note";
  const lines = note.content.split("\n");
  const titleIdx = firstNonBlankIndex(lines);
  // Reserved for notes that genuinely hold no text — whitespace-only included.
  return titleIdx === -1 ? "No Text Entered" : displayLine(lines[titleIdx]);
}

export function getNoteMetaSnippet(note: Pick<Note, "content">): string {
  if (contentWithoutTags(note.content) === "") return "No Content";
  const lines = note.content.split("\n");
  const titleIdx = firstNonBlankIndex(lines);
  if (titleIdx === -1) return "No Content";
  // Search below the title line, wherever that turned out to be.
  const raw = lines.slice(titleIdx + 1).find((line) => line.trim() !== "") ?? "";
  const snippet = raw === "" ? "" : displayLine(raw);
  return snippet.length > 30 ? `${snippet.slice(0, 30)}…` : snippet;
}
