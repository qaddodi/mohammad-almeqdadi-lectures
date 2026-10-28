#!/bin/bash
# usage: ./rebuild.sh out.pptx [render-dir]   (TUFTS_DATA=<json> for the talk copy with Tufts numbers)
set -e
cd "$(dirname "$0")"
NODE_PATH=$PWD/node_modules SKILL=${SKILL:-/mnt/skills/public/pptx} node build.js "$1" - logo.png
python3 fixppr.py "$1"
if [ -n "$2" ]; then
  mkdir -p "$2"; rm -f "$2"/p-*.png
  soffice --headless --convert-to pdf --outdir "$2" "$1" >/dev/null 2>&1
  pdftoppm -r 50 -png "$2/$(basename "${1%.pptx}").pdf" "$2/p" 2>/dev/null
fi
