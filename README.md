# NoteDude Core

Shared, framework-agnostic TypeScript for NoteDude clients. The package owns note and tag
semantics, querying/order, reversible actions, and use cases expressed against explicit
ports. It has no React, browser, Firebase, or terminal dependencies.

The existing PWA can initially adopt the pure functions (`queryNotes`, tag helpers, note
display helpers) without changing persistence. A browser Firebase adapter and a TUI storage
adapter can independently implement `NoteRepository`; UI-specific focus, viewport, keyboard,
and rendering behavior stays in each client.

The open-source Node TUI can import `@notedude/core/local` for atomic, file-backed,
zero-dependency persistence. Firebase integration lives in the separately publishable
`packages/firebase-adapter` package and is absent from the core export graph. An extended
client may supply that package with a web, Node client, or Admin SDK driver.

```ts
import { createNoteService, queryNotes } from "@notedude/core";

const service = createNoteService({ repository, clock, ids });
const note = await service.create({ inheritedFromQuery: "#project planning" });
const view = queryNotes(await repository.list(), "#project");
```

Run focused validation with `npm test`.
