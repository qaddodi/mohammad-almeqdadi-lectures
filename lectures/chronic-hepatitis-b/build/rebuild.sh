#!/bin/sh
# Builds both versions: "Chronic Hepatitis B.pptx" (60 min) and "Chronic Hepatitis B (30 min).pptx", plus PDFs.
# usage: sh rebuild.sh   (needs pptxgenjs in node_modules, the pptx skill, soffice)
set -e
export NODE_PATH=$PWD/node_modules SKILL=${SKILL:-/mnt/skills/public/pptx}
python3 figs.py
node build.js "../Chronic Hepatitis B.pptx" - logo.png
python3 fixppr.py "../Chronic Hepatitis B.pptx"
SHORT=1 node build.js "../Chronic Hepatitis B (30 min).pptx" - logo.png
python3 fixppr.py "../Chronic Hepatitis B (30 min).pptx"
