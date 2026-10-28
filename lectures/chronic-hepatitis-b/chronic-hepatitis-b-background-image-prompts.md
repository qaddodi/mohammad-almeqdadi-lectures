# Chronic Hepatitis B: background image prompts

## Visual concept

A liver and the history of hepatitis B. The cover puts a normal liver next to a 1960s wooden rack of glass serum tubes, the kind of sera Blumberg screened when he found the Australia antigen. The closing page repeats the liver in warm light. Two spot illustrations sit on white slides beside tables: an elastography probe and a pregnant patient in clinic.

## Palette

Same as the ALF deck: warm ivory paper #F4EEE2, muted slate #5E6B78, ochre #B98A4A and dusty rose #B97D7D for the liver, sage #8FA08A for vessels, cream #EFE6D2 highlights. Dark indigo #2E3550 only as a small local wash behind the cover subject.

## Master style block

Clinical editorial watercolor over fine gray ink linework, on warm ivory textured cold-press paper. Loose, controlled washes with visible paper grain and soft blooms at the edges. Thin, confident, anatomically correct ink lines, like a plate in an older surgical atlas. Muted slate, ochre, dusty rose, sage and cream. One focal subject, large calm negative space. Full-bleed, no border, frame, vignette or seam. 16:9, at least 1920 x 1080.

## Master negative prompt

No text, letters, numbers, labels, captions, watermarks or signatures. No faces in detail, no blood, no gore. No neon, glow, lens flare, 3D render look, glossy shading, photorealism, stock-photo look or infographic icons. No virus particles drawn as spiky balls. No borders, frames, torn edges or visible paper edge. No square crop, no white background on full-bleed images, no centered composition, no margins.

## Asset table

| Filename | Slides | Mode | Text side | Reuse |
|---|---|---|---|---|
| cover-chb.png | 1 (cover) | Full-bleed | Title over the right 55% | closing-chb.png repeats the liver |
| closing-chb.png | Questions? (last numbered slide) | Full-bleed | Title and QR over the right 55% | none |
| fibroscan-probe.png | "Fibrosis staging by elastography" (60-min) | Spot, fades to white | Beside the table | none |
| pregnant-patient.png | "29-year-old woman, 20 weeks pregnant" (question step only) | Spot, fades to white | Below the lab table, right side | none |

## Clinical accuracy checks

- **Cover and closing liver:** normal smooth liver, right lobe larger than left, falciform ligament between them, gallbladder fundus just below the right lobe. Not cirrhotic. Most patients in the talk do not have cirrhosis.
- **Serum tubes:** glass tubes with straw-yellow serum (not red blood), cork or rubber stoppers, plain wooden rack, no labels. They should look like 1960s lab glass, not modern vacutainers with colored caps.
- **Elastography probe:** a handheld cylindrical probe on a coiled cable, tip pointing down, like a FibroScan probe. Not an ultrasound linear probe, no screen digits, no brand.
- **Pregnant patient:** about 20 weeks, so a modest, rounded bump, not term. Seated in a clinic chair in profile, dressed, hands resting in her lap, face turned away or only a simple outline. Respectful and calm.
- **Spoilers:** the pregnancy picture goes on the question step only, before the answer bullets fill that space. The probe sits beside the cutoff table and gives nothing away.

## Copy-paste block for Gemini

```
Generate the following images. Make each one separately, in order, as its own image. None of them should contain any text, letters, numbers, labels, logos or watermarks.

Image 1. cover-chb.png
Wide 16:9 landscape image, 1920 x 1080, full-bleed: the paper texture and washes extend to all four edges, no white margin, no border or frame. Clinical editorial watercolor over fine gray ink linework on warm ivory textured cold-press paper, with soft watercolor blooms and visible paper grain, in muted slate, ochre, dusty rose, sage and cream. In the left 40% of the frame: a single anatomically correct human liver, anterior view, smooth and normal, right lobe clearly larger than the left, the falciform ligament running between them, the gallbladder fundus just showing below the lower edge of the right lobe, painted in ochre and dusty rose with cream highlights and thin sage vessel lines, outlined in thin confident gray ink like an old surgical atlas plate. In front of the liver and slightly lower, a small plain wooden test-tube rack from a 1960s laboratory holding six glass tubes of clear straw-yellow serum with cork stoppers, no labels. A soft localized wash of dark indigo and slate sits behind the liver and rack only and fades out completely before the middle of the image. The right 55% of the image is calm, even ivory paper with at most a very pale cream wash, no shapes, no lines, no detail, so a dark title can be placed there. No text, letters, numbers or labels. No people, hands, blood or virus particles. No neon, glow, 3D render look, glossy shading or photorealism. No square crop, no white background, no centered composition, no margins.

Image 2. closing-chb.png
Wide 16:9 landscape image, 1920 x 1080, full-bleed: the paper texture and washes extend to all four edges, no white margin, no border or frame. Clinical editorial watercolor over fine gray ink linework on warm ivory textured cold-press paper, with soft watercolor blooms and visible paper grain, in muted slate, ochre, dusty rose, sage and cream. A companion to a cover that showed a liver in a dark indigo wash: the same single anatomically correct human liver, anterior view, smooth and normal, right lobe larger than the left, falciform ligament between them, gallbladder fundus just below the right lobe, placed in the left 40% of the frame. This time there is no test-tube rack, and the wash behind the liver is warm and light, soft ochre and cream instead of indigo. The right 55% of the image is calm, even ivory paper with at most a very pale cream wash, no shapes or detail, so a title and a QR code can sit there. No text, no other organs, no people. No neon, glow, 3D render look or photorealism. No square crop, no white background, no centered composition, no margins.

Image 3. fibroscan-probe.png
Square 1:1 image. Clinical editorial watercolor over fine gray ink linework, in muted slate, ochre, dusty rose, sage and cream, with soft blooms. A handheld transient elastography probe of the kind used for liver stiffness measurement: a smooth cylindrical handle with a small round tip pointing down, attached to a loosely coiled cable, resting at a slight angle. Simple and clear, readable from the back of a room. The subject is centered with a generous margin, and the washes fade softly into a plain pure white background with no visible paper edge, so it sits cleanly on a white slide. Not an ultrasound linear probe. No screen, no people, no hands, no text, numbers, buttons with markings or brand names. No 3D render look or photorealism.

Image 4. pregnant-patient.png
Square 1:1 image. Clinical editorial watercolor over fine gray ink linework, in muted slate, ochre, dusty rose, sage and cream, with soft blooms. A woman about 20 weeks pregnant, seated upright in a simple clinic chair, seen in profile, wearing a plain loose dress, both hands resting in her lap below a modest rounded bump. Her face is turned slightly away and drawn only as a simple soft outline without detail. Calm, dignified and respectful. The subject is centered with a generous margin, and the washes fade softly into a plain pure white background with no visible paper edge, so it sits cleanly on a white slide. No medical equipment, no other people, no text, numbers or logos. No 3D render look or photorealism.
```

Save each result under the exact filename. Use the first image Gemini returns unless it is square or centered when it should be 16:9, or has stray text.
