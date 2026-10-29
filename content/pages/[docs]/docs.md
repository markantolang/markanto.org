---
title: Docs
description: The Markanto 0.2.0 specification, the semantic AST, the design decisions, and the reference implementation.
urlPath: /docs/
template: page
type: page
---
Markanto reads familiar Markdown tolerantly, models it in a strict,
unambiguous AST, and serialises it canonically: there is exactly one canonical
form per meaning. That single property is what makes reformatting idempotent,
keeps diffs minimal, and lets two authors who mean the same thing produce
identical bytes.

## The canonical form

CommonMark standardises the reading of Markdown; Markanto also standardises the
writing. Most Markdown tools are lenient both ways: the same document can be
written many ways and re-serialised many ways. Markanto keeps the lenient input
and removes the lenient output. The parser accepts the loose Markdown people
actually write; the formatter then has exactly one way to write each construct
back out. Three laws hold:

1. `parse(format(doc))` is semantically equal to `doc`.
2. `format` is idempotent — running it twice changes nothing the first run
  didn't.
3. Non-canonical and canonical spellings of the same meaning parse to the
  same AST.

## Specification

- **[Specification — 0.2.0](/spec/)** — the normative document: syntax,
  semantics, the canonicity laws, the AST, and the block and inline
  grammars. English is the normative edition. The 0.2.0 language line is
  frozen: the contract does not change within it. Every version is a tag of
  [markantolang/spec](https://github.com/markantolang/spec); the
  [0.1.0 specification](/spec/0.1.0/) stays as it was.
- **[`src/ast.ts`](https://github.com/markantolang/markanto-js/blob/main/src/ast.ts)**
  — the normative shape of the semantic AST: the TypeScript type of every
  node. Source positions are not part of it.
- **[`docs/PARSER_CONTRACT.md`](https://github.com/markantolang/markanto-js/blob/main/docs/PARSER_CONTRACT.md)**
  — the operational contract: result shapes, resource budgets, and the
  source-annotation sidecar. Not language semantics.

## Design

- **[`docs/DESIGN_DECISIONS.md`](https://github.com/markantolang/markanto-js/blob/main/docs/DESIGN_DECISIONS.md)**
  — the load-bearing language and API decisions, each with its rationale.
- **[`docs/DESIGN_PROCESS.md`](https://github.com/markantolang/markanto-js/blob/main/docs/DESIGN_PROCESS.md)**
  — a short account of how 0.1.0 was designed, built, and independently
  reviewed.
- **[`docs/EVOLUTION_V053_TO_010.md`](https://github.com/markantolang/markanto-js/blob/main/docs/EVOLUTION_V053_TO_010.md)**
  — every construct kept, changed, or removed between the 0.5.3-era drafts
  and the 0.1.0 baseline, and why. The version number was lowered on purpose
  to mark the new stable line.
- **[`docs/COMMONMARK_DIVERGENCE.md`](https://github.com/markantolang/markanto-js/blob/main/docs/COMMONMARK_DIVERGENCE.md)**
  — every intentional deviation from CommonMark 0.31.2 and GFM 0.29-gfm,
  with the conformance-harness expectation for each construct.

## Implementation

- **Reference implementation:** [`@markantolang/parser`](/packages/) — the
  tolerant parser, the canonical formatter, the pure-function AST validator,
  ID adoption, and the `markanto` CLI. Zero runtime dependencies.
- **[`docs/IMPLEMENTATION.md`](https://github.com/markantolang/markanto-js/blob/main/docs/IMPLEMENTATION.md)**
  — the compact implementation contract;
  **[`docs/PORTABILITY.md`](https://github.com/markantolang/markanto-js/blob/main/docs/PORTABILITY.md)**
  — the rules that keep the architecture portable to Rust.
- **Conformance corpus:**
  [`test/fixtures/`](https://github.com/markantolang/markanto-js/tree/main/test/fixtures)
  — implementation-independent JSON test cases, each run in normal and
  strict mode with its AST snapshot and canonical output pinned. See
  [`docs/CONFORMANCE.md`](https://github.com/markantolang/markanto-js/blob/main/docs/CONFORMANCE.md).
