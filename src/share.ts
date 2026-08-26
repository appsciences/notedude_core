export interface SharedNoteParts {
  readonly title?: string | null;
  readonly text?: string | null;
  readonly url?: string | null;
}

/** Collapse a share payload in stable title/text/url order, dropping blanks and duplicates. */
export function composeSharedNote(parts: SharedNoteParts): string {
  const values = [parts.title, parts.text, parts.url]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));
  return [...new Set(values)].join("\n");
}
