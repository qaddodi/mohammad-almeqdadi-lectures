# Image generation spec for lectures

How to specify, prompt, and check the pictures used behind lecture slides. Follow this for every new lecture. Slide wording and layout rules are in [LECTURE_STYLE.md](LECTURE_STYLE.md).

Worked example: [lectures/acute-liver-failure-aclf-in-icu/acute-liver-failure-aclf-in-icu-background-image-prompts.md](lectures/acute-liver-failure-aclf-in-icu/acute-liver-failure-aclf-in-icu-background-image-prompts.md).

## Rules that apply to every image

- Write the prompts only after the slide layout is final and you know which side the text sits on.
- Default to text-free images. Words, doses, thresholds, labels, nodes, and arrows are built in PowerPoint (or HTML/SVG), never generated.
- One clear focal subject.
- Leave a quiet zone of 40 to 60 percent of the frame on the side opposite the focal subject, where the slide text goes.
- Full-bleed, edge to edge. No border, frame, inset panel, vignette edge, torn paper, or visible paper edge. No hard vertical seam.
- 16:9, 1920 x 1080 px or larger.
- Plausible anatomy, equipment, procedures, and human posture. Patients, when shown, are depicted respectfully and without stigma.
- Calm, intelligent tone. Not cartoonish, not dramatic.
- Credit on the cover slide: "Illustrations generated with Google Gemini".

## Visual style

Clinical editorial watercolor over fine gray ink on warm ivory textured cold-press paper. The ink lines are thin and confident, like a plate in an older surgical atlas. Washes are loose and controlled, with visible paper grain and soft blooms at the edges.

Default palette:

| Use | Color |
|---|---|
| Paper | Warm ivory #F4EEE2 |
| Shadow and ink wash | Muted slate #5E6B78 |
| Main subject | Ochre #B98A4A, dusty rose #B97D7D |
| Vessels and secondary structures | Sage #8FA08A, used lightly |
| Highlights | Cream #EFE6D2 |
| Dark variant | Localized dark indigo #2E3550 |

The dark indigo variant is only for procedures, hemodynamics, or a high-acuity chapter where the change in mood carries meaning. Keep it as a local wash behind the subject, not across the whole page. A lecture may adjust the palette, but say so in its prompts file.

## When to reuse and when to change a background

Reuse one background across adjacent slides in the same scene. Make a new one for a new location, a complication, a procedure, a jump in time, a change in emotional state, or a new major teaching object.

Two kinds of picture are used:

- **Full-bleed background:** cover, section dividers, pause and closing slides. Title text sits over the quiet zone.
- **Spot illustration:** a single object next to bullets on a white slide. The paper wash fades out to white at the edges so it does not show up as a cream rectangle on a white slide. Say "background fades to pure white" in the prompt for these.

## The image prompts file

Create one file per lecture, in the lecture's folder:

`[topic-slug]-background-image-prompts.md`

Open the file with these sections, in this order:

1. Visual concept for the lecture
2. Recurring patient continuity sheet, if the lecture follows a patient (age, build, hair, clothing, bed, room, and so on, so the patient looks the same in every image)
3. Palette
4. Master style block
5. Master negative prompt
6. Asset table with columns: filename, slides, scene type, text side, reuse

Then add one entry for every unique image asset. Each entry has:

1. Filename: exact, lowercase kebab-case, for example `crrt-machine.png`
2. Slides that use it
3. Image mode: `text-free background` or `content-bearing infographic`
4. Scene summary
5. Educational purpose
6. Composition and quiet-zone direction, naming the side exactly (for example "title goes over the right 55 percent")
7. Continuity details
8. Clinical accuracy checks specific to this scene
9. Suggested alt text
10. One complete copy-paste prompt

Every final prompt is self-contained. It contains the full scene description, the composition and quiet-zone instruction, the master style text, and the negative prompt, written out in that entry. Do not write "append the master style above" as the only instruction, because each prompt is pasted on its own.

### Content-bearing infographics

Avoid them. If one is needed:

1. Generate a text-free illustrated backdrop.
2. Build the labels, arrows, and connections in PowerPoint or SVG.
3. Only if text has to come from the image model, give the exact text in the prompt and check every character, unit, arrow, and number afterward.
4. Mark the asset for manual clinical and visual review.

## Gemini lessons

Gemini often returns a square image with the subject centered on a white background, even when the prompt asks for 16:9. Prevent it:

- Put the aspect ratio first: "Wide 16:9 landscape image, 1920 x 1080."
- State "full-bleed, the paper texture and wash extend to all four edges, no white margin, no border."
- Name the quiet-zone side in plain words: "Place the subject in the left 40 percent of the frame. The right 60 percent is empty paper with only faint wash."
- Repeat the 16:9 and full-bleed lines in the negative prompt ("no square crop, no white background, no centered composition, no margins").
- If the first result is square or centered, do not accept it. Regenerate with the composition lines moved to the top of the prompt. Cropping a square image to 16:9 usually cuts the subject or the quiet zone.
- Gemini adds stray text, signatures, and fake monitor digits unless told not to. Keep the "no text" line and check the result.

## Copy-paste batch format

To generate several images in one go, paste a block that starts with the line below, one numbered prompt per image. Each prompt is the full self-contained prompt from its entry, preceded by the filename.

```
Generate the following images:

1. cover-alf-aclf-icu.png
[full prompt]

2. divider-bed4.png
[full prompt]
```

Save each result under the exact filename from the asset table.

## Checking each generated image

Open each image at full size and check:

- Anatomy, equipment, hands, tubing, and left/right orientation
- Patient continuity with the continuity sheet
- Any unintended text, numbers, or signatures
- Aspect ratio and full-bleed edges (no white margins, no border)
- Quiet zone: it is on the correct side, and the longest text state of the slide (including the last reveal) still fits over it
- Crop safety if the slide software crops or scales the picture

Regenerate or edit any image that fails. Then save the final file at full resolution; compress for size only if the linework and paper texture still look the same.
