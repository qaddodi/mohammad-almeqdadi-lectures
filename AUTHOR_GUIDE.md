# Author guide

Step by step: how to build a new lecture, or change an existing one, so it comes out in Mohammad's style.

Read these first:

- [MY_STYLE.md](MY_STYLE.md): what the lectures look and sound like, and the rules he has set. This guide doesn't repeat them.
- [IMAGE_GENERATION_SPEC.md](IMAGE_GENERATION_SPEC.md): Gemini cover, section-page and spot images.
- The worked example: [lectures/acute-liver-failure-aclf-in-icu](lectures/acute-liver-failure-aclf-in-icu/), especially [build/build.js](lectures/acute-liver-failure-aclf-in-icu/build/build.js).

## Where things live

| What | Where |
|---|---|
| Old decks, by topic | `lectures/<topic>/` |
| One new lecture | `lectures/<lecture-slug>/` |
| Plan and evidence | `lectures/<lecture-slug>/LECTURE_PLAN.md` |
| Build script and figures | `lectures/<lecture-slug>/build/` (`build.js`, `fixppr.py`, `img/`) |
| Gemini prompts | `lectures/<lecture-slug>/<lecture-slug>-background-image-prompts.md` |
| Finished files | `lectures/<lecture-slug>/<Title>.pptx` and a PDF of it |
| His local folder (PDFs, images, older decks) | `/Users/qaddodi/Downloads/Lectures` on his Mac |

Work on a branch, and push to `main` when he says the lecture is ready.

## Part 1: a new lecture

### 1. Get the brief

Topic, audience, length, date, and the decisions the talk should change. If length or date is missing, ask once, then go ahead on a stated assumption (the ALF talk assumed 60 minutes). Never put the audience on a slide.

### 2. Read his closest decks

Pick the one or two old decks nearest the topic and the format (table in MY_STYLE.md). Note how they open, how cases move, and how they end. While you're in there, list every figure you could reuse: his decks are the first place to get pictures. To pull images out of a deck:

```
unzip -o -j "lectures/<topic>/<deck>.pptx" 'ppt/media/*' -d /tmp/media
```

### 3. Write the plan

Write `LECTURE_PLAN.md` in the lecture folder before any slide. It holds:

- the brief, with anything still unknown marked as unknown
- the case or cases, with a timeline in hours and days
- the teaching beats, one row each:

| Field | What goes in it |
|---|---|
| Purpose | What the learner should decide or understand |
| Title | Plain subject or natural question, with no answer in it |
| Before the reveal | Exactly what is on screen first |
| Prompt | The question, or none |
| Reveal | What the next slide adds |
| Clinical consequence | What changes in testing, treatment or the call to transplant hepatology |
| Figure | The specific table, image, chart or paper figure |
| Evidence | Verified source with PMID, or a marked to-check item |

- the evidence list: every number checked against the paper or guideline, PMID confirmed before it's cited. If you couldn't confirm something, say so in the plan and in the speaker notes. Never invent a citation, threshold or recommendation.

Show him the plan if the scope is unclear. Otherwise go on to the deck and tell him what you assumed.

### 4. Set up the build

Copy the ALF build folder and strip the content, keeping the helpers at the top of `build.js` (everything up to the cover):

```
mkdir -p lectures/<lecture-slug>/build/img
cp lectures/acute-liver-failure-aclf-in-icu/build/{build.js,fixppr.py} lectures/<lecture-slug>/build/
```

Then change `pres.title`, the cover text and the image names. The Tufts logo is `ppt/media/image2.png` inside `lectures/cirrhosis/Cirrhosis presentation July 2025.pptx`.

### 5. Write the slides with the helpers

| Helper | Use |
|---|---|
| `sec(title)` | Start a PowerPoint section |
| `slide(title)` | White content slide with a centered Georgia title |
| `body(s, items, box)` | Bullets. Items take `b`, `i`, `hl` (yellow), `red`, `lvl` (sub-bullet), `nb` (no bullet), `runs` for mixed formatting |
| `table(s, rows, o)` | Lab or comparison table, Calibri, grey borders. Cells take `red`, `b`, `hl`, `grey` |
| `q(s, text, y, {hl})` | Big centered question or answer line. `hl: true` for the yellow reveal |
| `src(s, text)` | Grey italic source line with PMID |
| `pic(s, file, x, y, maxW, maxH, alt)` | Image from `img/`, fitted at its own aspect ratio, no border |
| `paper(title, top, bottom, source, alt)` | Two-step paper slide: title block with "What do you think they found?", then the figure or conclusion |
| `bars(s, data, o)` | Native bar chart in black and grey, values on the bars |
| `box`, `arrow` | Simple drawn diagrams |
| `divider(title, sub, img)` | Plain white section page |
| `bgDivider(title, sub, file, alt, side)` | Section page on a full-bleed watercolor, title on the plain side |

**Reveals.** Write the slide once as a function of `step`, and hide the answer on step 1:

```js
twoStep((step) => {
  const s = slide("Same patient, but wide awake");
  table(s, [["Grade", "Score"], ["Brain", ans(step, "2")]], { ... });   // ans() blanks the cell on step 1
  if (step === 2) q(s, "This is acute liver failure", 4.9, { hl: true });
  s.addNotes("What to ask, what answer to wait for, and the source.");
  return s;
});
```

- `twoStep(fn)` builds step 1 and step 2 and gives them one slide number.
- `ans(step, v)` returns an empty string on step 1.
- For three or more steps, call the function yourself and put `cont()` before each continuing step: `caseA(1); cont(); caseA(2); cont(); caseA(3);`. `cont()` is what keeps the X/Y number the same.
- Don't move anything between steps. Only the answer appears.

**Every slide** gets speaker notes (what to ask, the trap, the source) and a figure. If a slide has only bullets, find the picture before moving on.

### 6. Get the figures

In this order (details in MY_STYLE.md):

1. His own decks.
2. Paper PDFs: crop the title block and the key figure or conclusion to PNG with `pdftoppm -r 200 -png` and a crop, no border. If a journal site is blocked, ask him to drop the PDFs in `~/Downloads/Lectures` or upload them, and give him a numbered list: paper, DOI, PMID, which slide.
3. His clinical images. Crop timestamps and anything identifying.
4. Native charts with `bars()` from checked numbers.
5. Gemini images. Write the prompts file per the spec, then give him one copy-paste block that starts "Generate the following images:". He generates them on his phone and uploads them. Check each one (16:9 and quiet zone for backgrounds, white background for spot images) and ask for a redo if it fails.

Put every file in `build/img/` with a kebab-case name.

### 7. Make the cover

Follow the cover rules in MY_STYLE.md. For the QR code:

- Point it at the raw PDF so scanning downloads the file: `https://raw.githubusercontent.com/qaddodi/mohammad-almeqdadi-lectures/main/lectures/<lecture-slug>/<file>.pdf`. The repo is public, so this works without sign-in.
- Use error correction H. Draw it as round dots in navy #1A1F31 with rounded finder squares, on a transparent PNG, about 2000 px. No icon in the middle.
- Decode the rendered cover slide (not just the PNG) to confirm it opens the PDF.
- Save it as `img/qr-slides.png`, and add "Slides (PDF)" under it.

### 8. Build and render

```
cd lectures/<lecture-slug>/build
npm install pptxgenjs@3.12.0
NODE_PATH=$PWD/node_modules SKILL=<path to the pptx skill> node build.js out.pptx - logo.png
python3 fixppr.py out.pptx
soffice --headless --convert-to pdf out.pptx
pdftoppm -r 60 -png out.pdf page
```

`build.js` takes the output file, an unused second argument (the cover now comes from `img/`), and the logo. `SKILL` points at the folder holding `scripts/apply_theme.js` (for example `/mnt/skills/public/pptx`). `fixppr.py` removes extra paragraph properties pptxgenjs writes, which otherwise break bullets in multi-run lines. Look at every page image: overflow, text over a picture, a cover that isn't readable, mismatched steps in a reveal.

LibreOffice doesn't have Georgia, so its PDF looks slightly different from PowerPoint. If he sends a PDF exported from PowerPoint, use that one.

### 9. Check before you hand it over

Go through the deck four times, one question each time:

1. **Spoilers.** For every question slide, does anything earlier (titles, section pages, objectives, images, labels, chart lines, paper titles, notes read aloud) give away the answer? The ALF review found 13 of these, so expect some. A template is in the project files at `alf-aclf-lecture/review/spoiler-check.md`.
2. **Voice.** Read each line out loud. Rewrite anything that sounds like a slogan, a press release or a guideline committee. Check for "transfer to a transplant center", time-of-day words and audience lines.
3. **Figures.** No slide is only text.
4. **Facts and timeline.** Every number matches its source, every PMID was confirmed, the case timeline still holds after any reordering, and grades and scores match the data on the slides.

### 10. Finish

Copy the built files into the lecture folder (`<Title>.pptx` and the PDF the QR code points to), update the status line in `LECTURE_PLAN.md`, commit, and push to `main` when he asks. Regenerate the PDF every time the deck changes, or the QR code serves an old version.

## Part 2: changing an existing lecture

### Decks that have a `build/` folder

Change `build.js`, never the .pptx by hand, or the next rebuild will undo it. Then rebuild, render, check and push as in steps 8 to 10. Regenerate the PDF.

### His older hand-made decks

- Work on a copy, and keep his master slides, fonts and layouts. Use python-pptx or PowerPoint, not a rebuild.
- His files carry the date or version in the name ("Cirrhosis presentation July 2025"). Save the update as a new dated file and keep the old one.
- Bring it up to the current rules as you go: reveals as separate slides with no animations, no spoilers, X/Y numbers, figures on text-only slides. Ask him first if that would mean restructuring most of the deck.
- Recheck any old threshold, drug or allocation rule against current sources before keeping it.

### Handling his comments

- He pins comments on a slide or PDF page. Fix that slide, then look for the same problem in the rest of the deck. After "I'd never write like this" on one line, every other slogan-like line went too.
- If he gives a direction, do it and say what you changed. If he has to choose (two of his decks teach different things, a case detail changes a grade), give him a short choice with a recommendation.
- If a new rule comes out of a comment, add it to MY_STYLE.md so the next lecture gets it.

## Prompt to start a new lecture

> Build a lecture on [topic] for [audience], [length], in Mohammad's style. Follow MY_STYLE.md and AUTHOR_GUIDE.md in qaddodi/mohammad-almeqdadi-lectures. Look through his closest decks for structure and reusable figures first. Write LECTURE_PLAN.md with the brief, the case timeline, the teaching beats and verified evidence, then build the deck with a copy of the ALF build.js. Ask first and reveal on the next slide, put a figure on every slide, write in his plain clinical voice, and check for spoilers before handing it over. Mark anything you couldn't verify.
