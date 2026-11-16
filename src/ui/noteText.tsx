import React from "react";
import { colors } from "./tokens";

/**
 * The shape the list and content components need in order to render a note. The app's own
 * `Note` satisfies this structurally; the library deliberately knows nothing about pinning
 * persistence, sync state, or archiving rules beyond what it draws.
 */
export interface NoteSummary {
  id: string;
  content: string;
  pinned: boolean;
  tagPinned: boolean;
  createdAt: number;
  /** True until the user first edits content — an untouched new note titles as "New Note". */
  isNew?: boolean;
}

// One implementation, in core: the same title and snippet rules in every client.
export { contentWithoutTags, getNoteTitle, getNoteMetaSnippet } from "../note";

/** Time today, weekday this week, month+day beyond that. */
export function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());

  if (d >= startOfToday) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (d >= startOfWeek) {
    return d.toLocaleDateString([], { weekday: "short" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

const URL_RE = /https?:\/\/[^\s<>"]+/g;

/** Splits text into nodes, turning bare URLs into new-tab links that inherit their colour. */
export function renderWithLinks(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(URL_RE)) {
    if (m.index! > last) parts.push(text.slice(last, m.index));
    parts.push(
      <a
        key={m.index}
        href={m[0]}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "inherit", textDecorationColor: colors.fg.subtle.dark }}
      >
        {m[0]}
      </a>
    );
    last = m.index! + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
