# Deploying markanto.org

The site is built with hadley and states facts about the Markanto 0.1.0
language and the `@markantolang/parser` package that must already be true in
the specification, the reference repository, and on npm. Follow this order.

## Build & serve locally

The site is built with [hadley](https://hadley.sh); its repository is not public yet. From `site/`:

```sh
hadley dev              # build + file watcher at http://localhost:8000
hadley deploy           # the publish build, served locally for a last look
hadley deploy --build   # the publish build only, into .hadley/publish/
hadley clean            # clear all build directories, e.g. after deleting a page
```

Production serves `.hadley/publish/` as hadley's `main` builds it; the maintainer's deploy script uploads it.

## Wordmark

The nav wordmark is a drawn SVG: `theme/assets/images/logo-light.svg` (dark
ink, for the light theme) and `logo-dark.svg` (cream, the default). `logo.svg`
is a copy of `logo-dark.svg` for hadley's OG-card generator. After re-exporting
the wordmark from Inkscape (Object to Path — no live `<text>`), run
`bash scripts/prep-logos.sh`: it svgo-cleans both files and re-derives
`logo.svg`. Favicons: `theme/static/favicon.svg` + `favicon.png` (128×128).

## Pre-deploy checklist

Run from `site/`:

- [ ] **Spec copy in sync.** `bun scripts/spec-sync-check.ts` → exit 0. The
      `/spec/` page is a hand-maintained copy of the normative
      `spec/markanto-spec-v0.1.0.md` in markanto-js; the normative source wins.
      Set `MARKANTO_JS` if it is not at `../../../dev/markanto/markanto-js`.
- [ ] **Numbers match reality.** Every figure on the site matches markanto-js
      `main` / its `CHANGELOG.md`:
      - `home.chase` §04 ledger — conformance corpus (583), test suite (1,898),
        vendored CommonMark 0.31.2 / GFM cases (672, 0 fail), property soak
        (100k/stream), reserved wrapper tags (3), runtime dependencies (0).
      - `home.chase` §05 — `DEFAULT_MAX_MATRIX_SLOTS` (100 000),
        `HARD_MAX_MATRIX_SLOTS` (1 000 000).
      - Footer + status strip + nav version pill — `0.1.0`, frozen.
      - `packages.md` — the API surface (`parse` / `format` / `validate` /
        `checkCanonical` / `adoptDocument`) and the CLI (`markanto
        check | format | adopt <file> [--check|--stdout|--strict]`).
- [ ] **npm.** `npm view @markantolang/parser version` is `0.1.0` and it is the
      `latest` dist-tag. The install command on the site
      (`npm install @markantolang/parser`) works from a clean directory.
- [ ] **Links.** No internal link points at a removed page. External links
      resolve: the GitHub repo, `/blob/main/...` doc links, npm, releases.
- [ ] **Both themes.** Dark is the default; the toggle still reaches light;
      `theme-color` matches (`#1a1a19` / `#f3f0e6`).
- [ ] **Build clean.** 5 pages, 4 sitemap URLs, no OG / logo warnings.

## Release order (publish before deploy)

0.1.0 is published and the language line is frozen, so ordinarily nothing in
markanto-js needs to ship before the site. If a `0.1.x` (or a new language
line) is in flight:

1. Land every release-affecting change in markanto-js from a clean tree.
2. Run the full gate: `bun run verify && bun run verify:node && bun run
   compat:report && bun run soak`.
3. Propagate any changed number into this site's `home.chase`, `packages.md`,
   and this file.
4. Commit markanto-js, push `main`, tag, `npm publish`.
5. Verify externally: `npm view @markantolang/parser version`, an install
   contains the expected API + CLI, the GitHub release exists.
6. Only now: run `bun scripts/spec-sync-check.ts`, commit this repo, and deploy.
7. Live smoke test: nav version dropdown, the package card + link, the spec
   page TOC + scroll-spy, canonical URLs, sitemap, and both themes.

Never advertise a version, count, or size the sources do not already have.
