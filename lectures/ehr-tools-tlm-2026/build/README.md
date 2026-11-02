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

The presented deck sits on the AASLD TLM 2026 speaker template (title slide, Text Slide layout with the AASLD logo and footer, Thank You slide). The template file is AASLD's and is not in this repo; get it from the meeting's speaker materials, then:

```
python3 totemplate.py out.pptx AASLD_TLM2026_SpeakerSlidesTemplate_FINAL.pptx "Epically Efficient EHR Tools.pptx"
```

`totemplate.py` copies every slide onto the template layouts, scales the content into the space above the logo row, moves source lines and slide numbers to the bottom rows, and switches the fonts to the template's Arial.
