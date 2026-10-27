# Rebuilding the deck

`build.js` generates `ALF and ACLF in the ICU.pptx` with pptxgenjs 3.12. The cover reuses the liver illustration and logo from the July 2025 cirrhosis deck (`ppt/media/image1.png` and `image2.png`). Figures taken from your other decks (ALF body diagram, Mathurin curve, ammonia bottle) are in `img/`, which must sit next to `build.js`.

```
npm install pptxgenjs@3.12.0
NODE_PATH=$PWD/node_modules SKILL=/mnt/skills/public/pptx node build.js out.pptx - logo.png
python3 fixppr.py out.pptx   # removes the extra paragraph properties pptxgenjs writes in multi-run bullets
```

`build.js` also calls the pptx skill's `apply_theme.js` through the `SKILL` environment variable, and that script needs `NODE_PATH` to find pptxgenjs. The second argument is no longer used: the cover image is `img/cover-alf-aclf-icu.jpg`. The full workflow is in [AUTHOR_GUIDE.md](../../../AUTHOR_GUIDE.md). Editing the .pptx directly in PowerPoint is fine too; the script is only here so a later change can be made in one place.
