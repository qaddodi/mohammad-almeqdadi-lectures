# Rebuilding the deck

`build.js` generates the deck with pptxgenjs 3.12, using the same helpers as the ALF/ACLF deck. Figures are in `img/` (paper figures and title blocks cropped from the PDFs, figures from the Nov 2025 Liver Transplant Basics deck, and the Gemini watercolors). The logo is the Tufts University School of Medicine logo from the July 2025 cirrhosis deck.

```
npm install pptxgenjs@3.12.0
./rebuild.sh out.pptx            # public copy, no Tufts program numbers
TUFTS_DATA=<path>/tufts-slides.json ./rebuild.sh out.pptx   # copy for the talk
./rebuild.sh out.pptx render/    # also renders PNG pages with LibreOffice
```

Tufts program numbers never go in the repo (MY_STYLE.md). They are in `tufts-slides.json` in the project folder, not here. The full New York Times page on the Starzl slide (`starzl-nyt.png`) sits in the same private folder as the JSON; the public build shows only the headline crop in `img/`. Without `TUFTS_DATA` the build drops the three Tufts slides (volume, where recipients live, diagnoses) and the Tufts line on the DCD slide. The PDF in the lecture folder, which the cover QR code opens, is always the public build.

`rebuild.sh` runs `build.js` and `fixppr.py`, which removes the extra paragraph properties pptxgenjs writes in multi-run bullets. `SKILL` points at the pptx skill folder holding `scripts/apply_theme.js` (default `/mnt/skills/public/pptx`). The full workflow is in [AUTHOR_GUIDE.md](../../../AUTHOR_GUIDE.md).
