#!/bin/bash
# Draw the PNG and ICO icons from the one mark, src/app/icon.svg. Scaling only: no redraw, no new colour.
# The white ground of icon.svg is extended to the square corners for the Apple and maskable icons,
# because those platforms cut their own shape. Needs rsvg-convert and ImageMagick 7.
#
#   bash pipeline/icons.sh
set -euo pipefail
cd "$(dirname "$0")/.."
SVG=src/app/icon.svg
mkdir -p public/icons
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

for n in 16 32 48 192 512; do rsvg-convert -w $n -h $n "$SVG" -o "$tmp/$n.png"; done

# favicon.ico (16, 32, 48) at the site root; Next links it from every page.
magick "$tmp/16.png" "$tmp/32.png" "$tmp/48.png" src/app/favicon.ico

# Apple touch icon, 180 px, square on the icon's own white ground. Next links it as apple-touch-icon.
rsvg-convert -w 180 -h 180 -b "#ffffff" "$SVG" -o src/app/apple-icon.png

# Manifest icons: the mark as drawn (purpose any), and a maskable one with the mark inside the 80 % safe zone.
cp "$tmp/192.png" public/icons/icon-192.png
cp "$tmp/512.png" public/icons/icon-512.png
rsvg-convert -w 410 -h 410 -b "#ffffff" "$SVG" -o "$tmp/410.png"
magick -size 512x512 xc:"#ffffff" "$tmp/410.png" -gravity center -composite -strip public/icons/icon-maskable-512.png

# Fixed metadata so a rerun gives the same bytes.
for f in src/app/apple-icon.png public/icons/*.png; do magick "$f" -strip -define png:exclude-chunks=date,time "$f"; done
echo "icons written"
