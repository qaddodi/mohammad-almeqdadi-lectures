# Rebuilding the deck

- `mock/gen.py` writes the Epic-like mock-up screens as HTML (all names and values invented). `mock/render.js` turns them into PNGs in `img/` with Playwright.
- The long Synopsis views (`full-pre.png`, `full-post.png`, `full-workup*.png`) are cut at row borders into `-1`, `-2`, `-3` slices, with the patient bar, Synopsis bar and dates row pasted on top of each later slice. `thumb-*.png` are the top of each view.
- `build.js` is `head.js` (helpers copied from the ALF deck) plus `slides.js` (this talk).

```
python3 mock/gen.py && node mock/render.js $PWD/mock img
npm install pptxgenjs@3.12.0
cat head.js slides.js > build.js
NODE_PATH=$PWD/node_modules SKILL=/mnt/skills/public/pptx node build.js out.pptx
python3 fixppr.py out.pptx
```
