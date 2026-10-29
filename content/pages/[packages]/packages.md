---
title: Packages
description: The Markanto reference implementation — a tolerant parser, a canonical formatter, an AST validator, and the markanto CLI, published for TypeScript and JavaScript.
urlPath: /packages/
template: page
type: page
---
Markanto's specification is written to be implementation-language-agnostic.
TypeScript is the reference implementation: it defines the AST, the canonical
serialisation, and the conformance corpus any other implementation would be
checked against. A Rust port is a deliberately kept-open option, not a current
commitment.

## Install

```bash
npm install @markantolang/parser
```

Zero runtime dependencies. ES modules with type declarations, Node &ge; 18.20
and Bun. The `markanto` command-line tool is bundled.

## Quickstart

```ts
import { parse, format } from '@markantolang/parser'

const parsed = parse('#  Notes\n\nWith _loose_ and __mixed__ markers.\n')

if (parsed.status === 'ok') {
  const formatted = format(parsed.document)
  if (formatted.status === 'ok') {
    formatted.source
    // '# Notes\n\nWith *loose* and **mixed** markers.\n'
  }
}
```

Every operation returns a tagged result — branch on `status` before reading a
payload, on `format` and `validate` as well as `parse`. There is no thrown
error, and no inline error node, for ordinary invalid input.

## API

- **`parse(source, options?)`** — the tolerant parser. `status` is `ok`,
  `invalid`, or `resource`; on `ok` you get `document` (the strict AST) and an
  `annotations` sidecar for source positions. `strict: true` accepts only the
  canonical surface; `errorRecovery: true` adds a `RecoveryDocument` on invalid
  input without changing the AST of valid input.
- **`format(document, budget?)`** — the canonical serialiser. `status` `ok`
  yields `source`, the one canonical string for that AST.
- **`validate(document, options?)`** — a pure function over an already-built
  AST: undefined footnote references, ID uniqueness, resource-attribute
  allowlists, quote nesting, table shape, and the inline structural
  invariants. Independent of the parser.
- **`checkCanonical(source)`** — is this surface already canonical? `status`
  `canonical` or `noncanonical` (carrying the corrected `canonical` string),
  `invalid`, or `resource` — without changing the document's meaning.
- **`adoptDocument(document, createId?)`** — returns a copy with missing block
  IDs filled in.

`parse(format(document))` is semantically equal to `document`, and `format` is
stable on its own output. Source positions are never fields of AST nodes; read
them from the `annotations` sidecar when you need them.

## CLI

```bash
markanto check  <file>            # is the file a valid Markanto document?
markanto check  <file> --strict   # …and is its surface exactly canonical?
markanto format <file> --stdout   # print the canonical form
markanto format <file>            # rewrite the file in place
markanto adopt  <file> --stdout   # attach durable block identity
```

`check` exits non-zero when the file fails the requested check.

## CommonMark / GFM import

Converting existing CommonMark or GFM into Markanto is an explicit, lossy
operation behind a separate entry point, `@markantolang/parser/commonmark`, so
the core parser never depends on a Markdown library.

```ts
import { importCommonMark } from '@markantolang/parser/commonmark'

const { markanto, diagnostics } = importCommonMark('# Hi\n\nsome _text_\n')
```

The `micromark` / `mdast` packages this subpath needs are optional peer
dependencies. `diagnostics` is an ordered loss-policy ladder — `normalised`,
`resolved`, `source-structure-loss`, `semantic-degradation`, `content-dropped`,
`unrepresentable` — where the last two are hard-loss conditions suitable for
failing an unattended import.

## Status

- **Specification — 0.2.0, frozen.** The contract does not change within that
  language line; [0.1.0](/spec/0.1.0/) stays as it was.
- **TypeScript reference implementation** — parser, canonical formatter,
  validator, `adopt`, and CLI, verified against a 622-case conformance corpus
  (each case run in normal and strict mode), a compatibility report over the
  vendored CommonMark 0.31.2 / GFM 0.29-gfm suites, hand-curated fixtures, a
  100 000-document-per-stream property soak, and independent reviews — of the
  whole repository for 0.1.0, which returned a SHIP / FREEZE verdict, and of
  the 0.2.0 changes.

The implementation, the corpus, and the design record are in
[github.com/markantolang/markanto-js](https://github.com/markantolang/markanto-js).
