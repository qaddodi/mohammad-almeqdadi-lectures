# My lecture style

What Mohammad Almeqdadi's lectures look like and sound like. Use it for every new deck and every edit to an old one.

How to actually build or change a deck is in [AUTHOR_GUIDE.md](AUTHOR_GUIDE.md). Pictures made with Gemini follow [IMAGE_GENERATION_SPEC.md](IMAGE_GENERATION_SPEC.md).

This file comes from two places: a read-through of the 18 decks in `lectures/` (source index at the end), and the rules Mohammad set while we built the ALF/ACLF ICU lecture in October 2026. Where the two disagree, his rules win.

## The short version

- Ask first. Show the data, let the room answer, then reveal on the next slide.
- No text-only slides. Every slide carries a table, chart, image, paper figure or diagram.
- Plain clinical wording in his voice. No slogans, no clever closers, nothing that sounds generated.
- No spoilers anywhere before the reveal: titles, section pages, objectives, images, notes.
- White slides, Georgia, black text, yellow highlight on the answer, red for abnormal values.
- Each reveal is a new slide. No transitions or animations. One reveal sequence is one slide number.

## How it sounds

**Voice.** A clinician teaching colleagues at the bedside. Short questions carry the talk:

- "What's your next step?"
- "Why?"
- "What else?"
- "What's missing?"
- "Back to our patient"
- "Same patient, but wide awake"
- "Which other organs fail in ALF?"

**Say the point plainly.** If the slide needs a conclusion, write it the way he'd say it on rounds.

| Don't write | Write |
|---|---|
| No score writes the withdrawal order | If he is not a transplant candidate, discuss goals of care with the family and involve palliative care |
| She is running out of liver | A rising INR, rising lactate and worse encephalopathy mean she is getting worse |
| You dialyze the ammonia, not the creatinine | In ALF, start CRRT for the ammonia |
| Kidney response is not the same endpoint as living | 90-day mortality was not different |
| Not one after the other | All three start in the first hour |

**Never:**

- Aphorisms, slogans or punchlines ("running out of liver", "look again tomorrow").
- AI words: delve, crucial, pivotal, robust, leverage, landscape, navigate, seamless, underscore.
- Em-dash chains, emoji, a bolded lead-in on every bullet, rows of perfectly parallel bullets.
- Hedge stacks ("may potentially help") or committee wording copied from guidelines.
- Time of day. These are noon conferences, so no "tonight", "night shift", "midnight" or "this afternoon". Case timelines use Hour 0, Hour 12, Day 2.
- An audience line on the cover or anywhere else ("For pulmonary and critical care fellows").
- "Transfer to a transplant center". Tufts is a liver transplant center. Write "call transplant hepatology".

**Humor** is light and occasional, where it helps a teaching moment: "BAM!!" in the diarrhea deck, "I know what you're thinking..." before the CVVH slide. Not in every section.

**Slides are sparse; the talking goes in the speaker notes.** Notes say what to ask the room, what answer to wait for, the trap most people fall into, and the source for every number.

## How it looks

Copy the old decks, not a template.

| Element | Setting |
|---|---|
| Slide size | Widescreen 13.333 x 7.5 in |
| Background | White. Full-bleed watercolor only on the cover, section pages and pause slides |
| Fonts | Georgia for titles and text, Calibri in tables and charts |
| Titles | Centered, black, about 30 pt. Section titles about 48 pt |
| Bullets | Plain en-dash bullets, about 20 to 22 pt, sub-bullets smaller |
| Color | Black text. Red (#C00000) for abnormal labs and the harmful value. Yellow highlight on the revealed answer. Grey for sources and slide numbers |
| Tables | Thin grey borders, light grey header row, real lab values with units, one line per cell (see Tables below) |
| Charts | Native PowerPoint charts in black and grey, values on the bars, red only for the harmful bar |
| Sources | Small grey italic line at the bottom left, with PMID |
| Slide numbers | "X/Y", bottom right, small and grey. None on the cover |

**Never:** gradients, glowing accents, icon grids, rounded cards in rows, accent stripes, numbered-circle agendas, drop shadows, decorative stock pictures. Layouts change with the content: a lab table, a single question on an empty slide, a CT, a two-column comparison.

## Figures on every slide

He hates text-only slides. Before writing bullets, decide what the room will look at.

Where to get figures, in this order:

1. **His own decks first.** The NEJM ALF organ diagram, Kayser-Fleischer ring, ammonia bottle, Haj-Rockey ammonia curves, Mathurin KM curve, splanchnic vasodilation figures and the acuity-circles map all came from his older decks. Search `lectures/` and `/Users/qaddodi/Downloads/Lectures` before anything else.
2. **The paper itself.** Screenshot the title block and the key figure or conclusion from the PDF. No border or frame around paper screenshots.
3. **His own clinical images** (CT, CXR, ultrasound, a DayQuil box) when he can supply them.
4. **Redrawn data.** Native charts built from the numbers in the paper, checked against the source.
5. **Gemini watercolors** for the cover, section pages, pause slides and spot objects (an ICU bed, a CRRT machine, a phone). See [IMAGE_GENERATION_SPEC.md](IMAGE_GENERATION_SPEC.md).

A figure has a job: say what the learner should find in it. "Add an image" isn't a plan; "show the same lab table again with the discriminating value in red" is.

## Tables

Mohammad's rule (2026-10-27): a table cell should read on one line.

- **One line per cell.** Shorten the wording before you shrink the font or let a cell wrap. Use the abbreviations the room already knows (INR, HE, CRRT, MAP, Na, Cr, ALP, DILI, AIH, PBW). Lists inside a cell, one item per line, are fine.
- **Columns sized to the text.** Give short columns what they need and let the longest column take the rest. Don't split the width evenly by habit.
- **Alignment.** The first column holds the row labels and is left-aligned. The header row and the value columns are centered. A column whose cells still wrap, or that holds a list, is left-aligned as a whole, never mixed within one column. Comparison tables with no label column (Bed 4 vs Bed 7) are centered throughout.
- **Bold sparingly.** Row labels in a comparison grid, and the one value or verdict per table that matters. Abnormal values stay red. Never bold an answer on the question step of a reveal.
- **Use the space.** If the table leaves half the slide empty, raise the font (Calibri 18 to 22) instead of leaving small text floating at the top.
- In build.js the `table()` helper does the sizing, row heights and alignment. Pass `noLabel: true` for tables without a label column, and check the build log for `wrap:` lines.

## Reveals: ask first, answer next

- A slide that asks a question hides the answer. Table answer cells are empty, the chart has no takeaway line or threshold marker, the paper shows only its title block, or the prompt area is blank. The filled version is the next slide.
- Keep everything else on the slide in the same place between steps, so the room sees only what changed.
- No PowerPoint transitions or animations. Every step is its own slide.
- Pure teaching slides ("Why does the brain swell?") can stay single.
- Paper slides go in two steps: title block with "What do you think they found?", then their figure or conclusion.

## No spoilers

Nothing before a reveal may give the answer away. This was the most common mistake in the ALF deck. Check:

- **Section pages.** Don't name the diagnosis. "Bed 4, 28F, 4 days of nausea", not "Acetaminophen ALF". A section image can spoil too: the edematous brain went after the reveal, not before it.
- **Question wording.** Don't ask "Is this acute liver failure?" when that is the answer. Leave the prompt empty, then reveal "This is acute liver failure".
- **Titles.** "Will fixing the kidney hurt the lungs?" is the answer in a title. Use "What would you do for his kidney today?"
- **Objectives.** Keep them neutral. "Manage the brain in ALF", not "Start CRRT for ammonia without waiting for a renal indication".
- **Earlier slides.** A take-home line, a table column or a "next step" list that answers a question asked later.
- **Image labels** ("IVC collapse" on the question slide) and paper titles that state the result.
- **Threshold lines on charts** before the question about the threshold.

## Slide numbers

- "X/Y", bottom right. The cover has no number.
- Count ideas, not clicks. Every step of one reveal sequence shares a number. Y is the number of distinct slides.
- A slide placed between two steps gets its own number, and the step after it starts a new number.

## The cover

- Mohammad's Gemini watercolor, full-bleed, with a quiet zone on one side where the title sits. Nothing printed over the picture itself.
- Title, then his name and titles: "Mohammad Almeqdadi, MD", "Transplant Hepatologist and Gastroenterologist", "Assistant Professor of Medicine and Surgery", then "X: @mfalmeqdadi".
- Tufts University School of Medicine logo.
- Small italic credit in a corner: "Illustrations generated with Google Gemini".
- A QR code labeled "Slides (PDF)" that downloads the PDF directly (raw file URL, not a GitHub page). Plain navy dots (#1A1F31) with rounded finder squares, transparent background, no icon or logo in the middle.
- No audience subtitle and no time-of-day wording.

The next slide is Objectives.

## How the teaching is built

Patterns that repeat across his decks. Slide references are to the decks in the source index.

1. **Ask before explaining.** The question comes first, often on its own slide (ALI-V2 6–10, CIR-25 31–38, GI-19 13–15).
2. **Successive slides as teaching beats.** Near-identical slides each add one clue, answer or "Why?" (ALI-20 47–50, NEURO 73–74 where an empty comparison table becomes a full one).
3. **Explain why the finding happens.** Every mechanism is tied to a finding or decision. When a classification appears, say what changes clinically (HPS-25 13–18: "Do we care?").
4. **Make the reasoning error visible.** Let the room commit to the intuitive answer, then show the missing distinction (ALI-20 72–75: size of the enzyme rise is not severity).
5. **Return to the patient and move time forward.** One or two patients carry the talk (CIR-25 30–108, with a recap of problems and meds at slide 70). Check the timeline whenever slides move.
6. **Teach with material the learner must read.** Lab tables, images, anatomy, histology, algorithms, study figures.
7. **Evidence answers a clinical question.** State what was studied, the outcome that matters for the decision, and the limitation (PANCREATITIS 40–41, HYPO-NA 45–50). Keep guideline, local practice and his own opinion distinguishable.
8. **Finish with what to do.** Return to the opening problem, then the decisions and pitfalls (PANCREATITIS 100–102, CIR-25 109 "Some tricks of the trade").

### Lecture formats

| Format | Example | Structure |
|---|---|---|
| Pattern-recognition workshop | ALI-V2 | Short foundation, repeated data-only challenges, reveal, discriminating clue |
| Longitudinal case | CIR-25, ALF/ACLF ICU | Foundation, workup, complications over time, recap |
| Case plus review | PANCREATITIS, HPS-25 | Opening problem, mechanism and evidence, management, back to the patient |
| Specialist evidence review | HYPO-NA, AKI, INFECTIONS | Question roadmap, physiology, studies with limits, practical pathway |
| Image and board review | BOARD, NEURO | Vignette or image, answer, explanation, related question |
| Visual primer | ANATOMY, BIOPSY | Anatomy or structured comparison with a clinical synthesis |

A case-first opening is common but not required. Pick the format that fits the topic.

## Source index

The 18 decks were read for slide text, tables, notes and selected images (1,231 physical slides, many of them reveal steps). `NAFLD_NASH_20191105_final.pptx` is not in the repo. Old slides show how he teaches; they are not current medical authority, so recheck every number before reuse. Links point to the commit that was reviewed.

| ID | Deck | Slides |
| --- | --- | ---: |
| ALI-V2 | [Acute Liver Injury V2.pptx](https://github.com/qaddodi/mohammad-almeqdadi-lectures/blob/f1fd8790289975b1be329d20dd656dc993ce2475/lectures/acute-liver-injury/Acute%20Liver%20Injury%20V2.pptx) | 38 |
| ALI-20 | [acute_liver_injury_20200130 compressed.pptx](https://github.com/qaddodi/mohammad-almeqdadi-lectures/blob/f1fd8790289975b1be329d20dd656dc993ce2475/lectures/acute-liver-injury/acute_liver_injury_20200130%20compressed.pptx) | 128 |
| CIR-24 | [Cirrhosis presentation January 2024.pptx](https://github.com/qaddodi/mohammad-almeqdadi-lectures/blob/f1fd8790289975b1be329d20dd656dc993ce2475/lectures/cirrhosis/Cirrhosis%20presentation%20January%202024.pptx) | 109 |
| CIR-25 | [Cirrhosis presentation July 2025.pptx](https://github.com/qaddodi/mohammad-almeqdadi-lectures/blob/f1fd8790289975b1be329d20dd656dc993ce2475/lectures/cirrhosis/Cirrhosis%20presentation%20July%202025.pptx) | 109 |
| BOARD | [2025-05-13 GI Board Review.pptx](https://github.com/qaddodi/mohammad-almeqdadi-lectures/blob/f1fd8790289975b1be329d20dd656dc993ce2475/lectures/gi/2025-05-13%20GI%20Board%20Review.pptx) | 44 |
| PANCREATITIS | [Acute_Pancreatitis_brookdale_20191003.pptx](https://github.com/qaddodi/mohammad-almeqdadi-lectures/blob/f1fd8790289975b1be329d20dd656dc993ce2475/lectures/gi/Acute_Pancreatitis_brookdale_20191003.pptx) | 102 |
| DIARRHEA | [Chronic SB Diarrhea Dec 2020.pptx](https://github.com/qaddodi/mohammad-almeqdadi-lectures/blob/f1fd8790289975b1be329d20dd656dc993ce2475/lectures/gi/Chronic%20SB%20Diarrhea%20Dec%202020.pptx) | 97 |
| GI-19 | [mesenteric_ischemia_brookdale_20190930.pptx](https://github.com/qaddodi/mohammad-almeqdadi-lectures/blob/f1fd8790289975b1be329d20dd656dc993ce2475/lectures/gi/mesenteric_ischemia_brookdale_20190930.pptx) | 94 |
| BIOPSY | [Liver Biopsy Techniques.pptx](https://github.com/qaddodi/mohammad-almeqdadi-lectures/blob/f1fd8790289975b1be329d20dd656dc993ce2475/lectures/hepatology-other/Liver%20Biopsy%20Techniques.pptx) | 1 |
| NEURO | [Neurologic complications of liver and GI diseases.pptx](https://github.com/qaddodi/mohammad-almeqdadi-lectures/blob/f1fd8790289975b1be329d20dd656dc993ce2475/lectures/hepatology-other/Neurologic%20complications%20of%20liver%20and%20GI%20diseases.pptx) | 109 |
| HPS-25 | [2025 Hepatopulmonary and Portopulmonary Syndromes.pptx](https://github.com/qaddodi/mohammad-almeqdadi-lectures/blob/f1fd8790289975b1be329d20dd656dc993ce2475/lectures/hepatopulmonary-and-portopulmonary/2025%20Hepatopulmonary%20and%20Portopulmonary%20Syndromes.pptx) | 75 |
| HPS-OTHER | [Hepatopulmonary and Portopulmonary Syndromes.pptx](https://github.com/qaddodi/mohammad-almeqdadi-lectures/blob/f1fd8790289975b1be329d20dd656dc993ce2475/lectures/hepatopulmonary-and-portopulmonary/Hepatopulmonary%20and%20Portopulmonary%20Syndromes.pptx) | 67 |
| ANATOMY-2 | [Liver Anatomy and Portal Hypertension 2.pptx](https://github.com/qaddodi/mohammad-almeqdadi-lectures/blob/f1fd8790289975b1be329d20dd656dc993ce2475/lectures/liver-anatomy-and-portal-hypertension/Liver%20Anatomy%20and%20Portal%20Hypertension%202.pptx) | 12 |
| ANATOMY | [Liver Anatomy and Portal Hypertension.pptx](https://github.com/qaddodi/mohammad-almeqdadi-lectures/blob/f1fd8790289975b1be329d20dd656dc993ce2475/lectures/liver-anatomy-and-portal-hypertension/Liver%20Anatomy%20and%20Portal%20Hypertension.pptx) | 11 |
| LT-BASICS | [2025-11-10 Liver Transplant Basics Compressed.pptx](https://github.com/qaddodi/mohammad-almeqdadi-lectures/blob/f1fd8790289975b1be329d20dd656dc993ce2475/lectures/liver-transplant/2025-11-10%20Liver%20Transplant%20Basics%20Compressed.pptx) | 86 |
| AKI | [AKI and Liver Transplant.pptx](https://github.com/qaddodi/mohammad-almeqdadi-lectures/blob/f1fd8790289975b1be329d20dd656dc993ce2475/lectures/liver-transplant/AKI%20and%20Liver%20Transplant.pptx) | 27 |
| HYPO-NA | [Hyponatremia in Liver Transplant.pptx](https://github.com/qaddodi/mohammad-almeqdadi-lectures/blob/f1fd8790289975b1be329d20dd656dc993ce2475/lectures/liver-transplant/Hyponatremia%20in%20Liver%20Transplant.pptx) | 62 |
| INFECTIONS | [Post LIver Transplant Infectious Complications - Lahey.pptx](https://github.com/qaddodi/mohammad-almeqdadi-lectures/blob/f1fd8790289975b1be329d20dd656dc993ce2475/lectures/liver-transplant/Post%20LIver%20Transplant%20Infectious%20Complications%20-%20Lahey.pptx) | 60 |

Newest example built to this guide: [ALF and ACLF in the ICU](lectures/acute-liver-failure-aclf-in-icu/).
