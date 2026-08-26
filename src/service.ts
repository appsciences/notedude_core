import type { Note, NotePatch } from "./note.ts";
import { inheritedTags } from "./tags.ts";

export interface NoteRepository {
  list(): Promise<readonly Note[]>;
  get(id: string): Promise<Note | undefined>;
  create(note: Note): Promise<void>;
  update(id: string, patch: NotePatch): Promise<void>;
  subscribe?(listener: (notes: readonly Note[]) => void, onError?: (error: Error) => void): () => void;
}

export interface Clock { now(): number }
export interface IdGenerator { next(): string }

export interface NoteServiceDependencies {
  readonly repository: NoteRepository;
  readonly clock: Clock;
  readonly ids: IdGenerator;
}

export function createNoteService({ repository, clock, ids }: NoteServiceDependencies) {
  return {
    async create(options: { inheritedFromQuery?: string; content?: string } = {}): Promise<Note> {
      const now = clock.now();
      const tags = inheritedTags(options.inheritedFromQuery ?? "");
      const supplied = options.content ?? "";
      const content = tags.reduce((value, tag) => value === "" ? tag : `${value} ${tag}`, supplied);
      const note: Note = {
        id: ids.next(), content, pinned: false, tagPinned: false,
        createdAt: now, updatedAt: now, isNew: options.content === undefined,
      };
      await repository.create(note);
      return note;
    },

    async changeContent(id: string, content: string): Promise<void> {
      await repository.update(id, { content, updatedAt: clock.now(), isNew: false });
    },

    async setPinned(id: string, pinned: boolean): Promise<void> {
      await repository.update(id, { pinned, updatedAt: clock.now() });
    },

    async setTagPinned(id: string, tagPinned: boolean): Promise<void> {
      await repository.update(id, { tagPinned, updatedAt: clock.now() });
    },
  };
}
