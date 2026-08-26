# Optional Firebase adapter

This package is deliberately separate from the open-source local-first distribution. An
extended client supplies a web, Node client, or Admin SDK bridge implementing
`FirestoreDriver`; neither the pure core nor local adapter depends on Firebase.
