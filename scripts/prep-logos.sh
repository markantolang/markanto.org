#!/usr/bin/env bash
# Cleans hand-drawn wordmark exports and derives logo.svg (for the OG card).
#
# markanto.org currently uses a *text* wordmark: the nav renders "Mark|anto"
# as styled text, and theme/assets/images/logo.svg carries a <text> element
# for hadley's OG-card generator. That is fine as-is — this script only does
# something once a real drawn wordmark exists.
#
# When the wordmark is drawn in Inkscape, export it as
#   theme/assets/images/logo-light.svg   (dark ink,  for a light ground)
#   theme/assets/images/logo-dark.svg    (light ink, for a dark ground)
# with Path > Object to Path applied (no live <text>), then run this from the
# repo root:
#   bash scripts/prep-logos.sh
#
# It svgo-cleans both files and copies logo-dark.svg to logo.svg, because the
# OG card ground is dark and hadley's generator looks for that exact name.
set -euo pipefail
cd "$(dirname "$0")/.."

img=theme/assets/images
cfg=scripts/svgo.logo.mjs

if [[ ! -f "$img/logo-light.svg" || ! -f "$img/logo-dark.svg" ]]; then
  echo "No drawn wordmark yet ($img/logo-{light,dark}.svg not found)."
  echo "The text wordmark in the nav and the <text> logo.svg for the OG card"
  echo "are the current design — nothing to do."
  exit 0
fi

for f in logo-light logo-dark; do
  if grep -qE '<text|<tspan' "$img/$f.svg"; then
    echo "ERROR: $img/$f.svg still contains live <text> — it needs a real font" >&2
    echo "       to render and won't work in the OG generator. In Inkscape:" >&2
    echo "       select the wordmark, Path > Object to Path (Shift+Ctrl+C)," >&2
    echo "       then re-export." >&2
    exit 1
  fi
  bunx --yes svgo --quiet --config "$cfg" -i "$img/$f.svg" -o "$img/$f.svg"
  perl -0pi -e 's/ xml:space="preserve"//g; s/ style="[^"]*-inkscape-font-specification[^"]*"//g' "$img/$f.svg"
  echo "cleaned $img/$f.svg ($(wc -c < "$img/$f.svg") bytes)"
done

cp "$img/logo-dark.svg" "$img/logo.svg"
echo "logo.svg <- logo-dark.svg (OG card)"
