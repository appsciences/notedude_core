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

### Entry points

| Import | What it is |
| --- | --- |
| `@notedude/core` | Domain core (notes, tags, query, actions, service) and the markdown engine (`parseNote`, shortcuts, rich-paste converter, attachment references). No DOM, no React. |
| `@notedude/core/ui` | React widgets and design tokens (`NoteList`, `NoteContent`, `SearchBar`, `HelpOverlay`, `CommandKeypad`, theme…). React and React DOM are peer dependencies. Re-exports the markdown helpers and `getNoteTitle` so an app needs one import. |
| `@notedude/core/local` | File-backed repository for Node. |

### Installing in an app

Installed straight from GitHub by tag — no registry, no token (the repository is public and MIT-licensed):

```sh
npm install github:appsciences/notedude_core#v0.2.0
```

`prepare` builds `dist/` during install, so a consumer needs nothing but `npm install`. Pin a tag, not a branch. React apps that transpile their own dependencies do not need to; the output is plain ESM.

Run focused validation with `npm test` (it builds first).
