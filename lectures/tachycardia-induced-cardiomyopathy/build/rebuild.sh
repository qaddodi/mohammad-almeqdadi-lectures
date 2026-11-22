#!/bin/sh
# Builds both versions: "Tachycardia-Induced Cardiomyopathy.pptx" (60 min) and the 30-minute cut, plus PDFs.
# usage: sh rebuild.sh   (needs pptxgenjs in node_modules, the pptx skill, soffice)
set -e
export NODE_PATH=$PWD/node_modules SKILL=${SKILL:-/mnt/skills/public/pptx}
node build.js "../Tachycardia-Induced Cardiomyopathy.pptx" - logo.png
python3 fixppr.py "../Tachycardia-Induced Cardiomyopathy.pptx"
SHORT=1 node build.js "../Tachycardia-Induced Cardiomyopathy (30 min).pptx" - logo.png
python3 fixppr.py "../Tachycardia-Induced Cardiomyopathy (30 min).pptx"
cd .. && soffice --headless --convert-to pdf "Tachycardia-Induced Cardiomyopathy.pptx" >/dev/null && mv "Tachycardia-Induced Cardiomyopathy.pdf" TIC-slides.pdf
