import type { Note } from "./note.ts";

const TAG_RE = /#[\w-]+/g;
const ARCHIVED_RE = /#archived(?=[\s,.]|$)/i;
const TASK_TAG_RE = /#tasks-[\w-]+/i;
const NON_INHERITABLE_TAGS = new Set(["#archived"]);

export function extractTagNames(content: string): string[] {
  return Array.from(new Set((content.match(TAG_RE) ?? []).map((tag) => tag.toLowerCase())));
}

export function inheritedTags(query: string): string[] {
  return extractTagNames(query).filter((tag) => !NON_INHERITABLE_TAGS.has(tag));
}

export function isArchived(note: Pick<Note, "content">): boolean {
  return ARCHIVED_RE.test(note.content);
}

export function appendTag(content: string, tag: string): string {
  if (hasExactTag(content, tag)) return content;
  const separator = content === "" || content.endsWith("\n") ? "" : " ";
  return `${content}${separator}${tag}`;
}

export function stripTag(content: string, tag: string): string {
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return content.replace(new RegExp(`[ \\t]?${escaped}(?=[\\s,.]|$)`, "i"), "");
}

export function hasExactTag(content: string, tag: string): boolean {
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`${escaped}(?=[\\s,.]|$)`, "i").test(content);
}

export function withTaskTag(content: string, tag: string): string {
  return TASK_TAG_RE.test(content) ? content.replace(TASK_TAG_RE, tag) : appendTag(content, tag);
}

export function withoutTaskTag(content: string): string {
  const current = content.match(TASK_TAG_RE)?.[0];
  return current ? stripTag(content, current) : content;
}

export interface TagUsage { readonly tag: string; readonly lastUsed: number }

export function extractTags(notes: readonly Note[]): TagUsage[] {
  const usage = new Map<string, number>();
  for (const note of notes) {
    for (const tag of extractTagNames(note.content)) {
      usage.set(tag, Math.max(usage.get(tag) ?? 0, note.updatedAt));
    }
  }
  return [...usage].map(([tag, lastUsed]) => ({ tag, lastUsed }))
    .sort((a, b) => b.lastUsed - a.lastUsed || a.tag.localeCompare(b.tag));
}
