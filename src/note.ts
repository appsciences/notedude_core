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

function firstNonBlankIndex(lines: string[]): number {
  return lines.findIndex((line) => line.trim() !== "");
}

export function getNoteTitle(note: Pick<Note, "content" | "isNew">): string {
  if (note.isNew && contentWithoutTags(note.content) === "") return "New Note";
  const lines = note.content.split("\n");
  const index = firstNonBlankIndex(lines);
  return index === -1 ? "No Text Entered" : lines[index];
}

export function getNoteMetaSnippet(note: Pick<Note, "content">): string {
  if (contentWithoutTags(note.content) === "") return "No Content";
  const lines = note.content.split("\n");
  const index = firstNonBlankIndex(lines);
  if (index === -1) return "No Content";
  const snippet = lines.slice(index + 1).find((line) => line.trim() !== "") ?? "";
  return snippet.length > 30 ? `${snippet.slice(0, 30)}…` : snippet;
}
