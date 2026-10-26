# Rebuilding the deck

`build.js` generates `ALF and ACLF in the ICU.pptx` with pptxgenjs 3.12. The cover reuses the liver illustration and logo from the July 2025 cirrhosis deck (`ppt/media/image1.png` and `image2.png`).

```
npm install pptxgenjs@3.12.0
node build.js out.pptx liver.png logo.png
python3 fixppr.py out.pptx   # removes the extra paragraph properties pptxgenjs writes in multi-run bullets
```

`build.js` also calls the pptx skill's `apply_theme.js` through the `SKILL` environment variable. Editing the .pptx directly in PowerPoint is fine too; the script is only here so a later change can be made in one place.
