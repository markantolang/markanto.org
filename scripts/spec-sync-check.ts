#!/usr/bin/env bun
/**
 * spec-sync-check.ts — guards against drift between the normative Markanto
 * specification in the markanto-js reference repository and the hand-maintained
 * copy served at markanto.org/spec/.
 *
 * The site page carries Lima frontmatter, an <h1> supplied by the template, and
 * a blockquote version block in place of the repo's plain "Version: / Status: /
 * Language:" header. None of that is normative. This script normalises both
 * sides down to the normative body — headings, prose, lists, tables, grammar —
 * and reports whatever still differs.
 *
 * Normalisation (applied to BOTH sides, deliberately lossy):
 *   - YAML frontmatter removed
 *   - a leading <h1> ("# …") removed
 *   - the "Version: / Status: / Language:" header block removed (repo side)
 *   - blockquote lines ("> …") removed                        (site framing)
 *   - horizontal rules ("---", "***", "___") removed
 *   - table rows normalised: delimiter cells -> "---", content cells trimmed
 *   - inline markers stripped: **bold**, *italic*, `code`
 *   - backslash escapes of markdown punctuation removed ("0\.1" -> "0.1")
 *   - trailing whitespace trimmed; blank lines dropped for the comparison
 *
 * Leading indentation is NOT normalised: a nested list item indented 2 spaces
 * in one copy and 3 in the other is a real formatting divergence and the site
 * copy should match the normative source exactly.
 *
 * Exit 0 = in sync · 1 = drift (unified diff printed) · 2 = setup error.
 *
 *   bun scripts/spec-sync-check.ts
 *
 * markanto-js location: $MARKANTO_JS, else ../../../dev/markanto/markanto-js
 * relative to this repo root.
 */

import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const SITE_ROOT = resolve(import.meta.dir, "..");
const MARKANTO_JS =
  process.env.MARKANTO_JS ??
  resolve(SITE_ROOT, "../../../dev/markanto/markanto-js");

/** site copy  <->  normative source */
const PAIRS: Array<{ label: string; site: string; repo: string }> = [
  {
    label: "Markanto 0.1.0",
    site: "content/pages/[spec]/spec.md",
    repo: "spec/markanto-spec-v0.1.0.md",
  },
];

function normalise(src: string): string {
  let text = src.replace(/\r\n/g, "\n");

  // 1. YAML frontmatter
  if (text.startsWith("---\n")) {
    const end = text.indexOf("\n---\n", 4);
    if (end !== -1) text = text.slice(end + 5);
  }

  const lines = text.split("\n");
  const out: string[] = [];
  let skippingHeaderBlock = false;

  for (let raw of lines) {
    let line = raw.replace(/\s+$/, "");

    // The repo's "Version: / Status: / Language:" block runs to the next blank
    // line. The site copy replaces it with a blockquote (stripped below).
    if (!skippingHeaderBlock && out.length === 0 && /^Version:\s/.test(line)) {
      skippingHeaderBlock = true;
      continue;
    }
    if (skippingHeaderBlock) {
      if (line.trim() === "") skippingHeaderBlock = false;
      continue;
    }

    if (/^#\s+\S/.test(line) && out.length === 0) continue; // leading H1
    if (/^>\s?/.test(line)) continue; // blockquote (site framing)
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) continue; // horizontal rule

    // table rows: collapse the delimiter row, trim every cell
    if (/^\|.*\|$/.test(line)) {
      const cells = line.slice(1, -1).split("|");
      const isDelim = cells.every((c) => /^\s*:?-+:?\s*$/.test(c));
      line = "|" + cells.map((c) => (isDelim ? "---" : c.trim())).join("|") + "|";
    }

    // inline emphasis / code markers — presentation, not normative content
    line = line
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\\([.\-|*_+#()\[\]`~<>])/g, "$1"); // md punctuation escapes

    if (line.trim() === "") continue; // drop blank lines for the comparison
    out.push(line.trimEnd());
  }
  return out.join("\n") + "\n";
}

let drift = false;
let missing = false;
const tmp = mkdtempSync(join(tmpdir(), "spec-sync-"));

for (const { label, site, repo } of PAIRS) {
  const sitePath = join(SITE_ROOT, site);
  const repoPath = join(MARKANTO_JS, repo);

  if (!existsSync(sitePath) || !existsSync(repoPath)) {
    missing = true;
    console.log(`?  ${label}`);
    if (!existsSync(sitePath)) console.log(`   site copy not found: ${sitePath}`);
    if (!existsSync(repoPath)) console.log(`   normative spec not found: ${repoPath}`);
    continue;
  }

  const a = normalise(readFileSync(repoPath, "utf8"));
  const b = normalise(readFileSync(sitePath, "utf8"));

  if (a === b) {
    console.log(`OK ${label}`);
    continue;
  }

  drift = true;
  const fa = join(tmp, `${label.replace(/\W+/g, "_")}.normative`);
  const fb = join(tmp, `${label.replace(/\W+/g, "_")}.site`);
  writeFileSync(fa, a);
  writeFileSync(fb, b);
  const d = Bun.spawnSync([
    "diff", "-u",
    "--label", `normative/${repo}`,
    "--label", `site/${site}`,
    fa, fb,
  ]);
  console.log(`DRIFT ${label}`);
  console.log((d.stdout?.toString() ?? "").replace(/^/gm, "  ").trimEnd());
  console.log("");
}

if (missing) {
  console.error(
    `\nOne or more files were not found. Set MARKANTO_JS if the reference\n` +
      `repository is not at ${MARKANTO_JS}.`,
  );
  process.exit(2);
}
if (drift) {
  console.error(`\nSpec drift detected. The normative spec in markanto-js wins:`);
  console.error(`fix the site copy, or land an authorised spec change and re-sync.`);
  process.exit(1);
}
console.log(`\nAll ${PAIRS.length} spec ${PAIRS.length === 1 ? "copy matches its" : "copies match their"} normative source.`);
