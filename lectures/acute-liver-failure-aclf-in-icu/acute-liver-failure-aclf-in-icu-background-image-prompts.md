# ALF and ACLF in the ICU: background image prompts

## Visual concept

The liver as the patient in the ICU. Anatomical plates and a few quiet ICU objects, drawn the way a medical illustrator would. Nothing dramatic. Section pages and the cover are full-bleed ivory paper with the subject on one side; pictures that sit beside slide text are spot illustrations that fade into white, so they don't show as a paper-colored box on a white slide.

## Palette

- Warm ivory paper (#F4EEE2) as the base
- Muted slate (#5E6B78) for shadow and ink wash
- Ochre (#B98A4A) and dusty rose (#B97D7D) for the liver itself
- Sage (#8FA08A) for the hepatic vessels and portal structures, lightly
- Cream (#EFE6D2) for highlights
- Localized dark indigo (#2E3550) only behind the focal subject on the cover and section pages

## Master style block

Clinical editorial watercolor over fine gray ink linework, on warm ivory textured cold-press paper. Loose, controlled washes with visible paper grain and soft blooms at the edges. Ink lines are thin, confident and anatomically correct, like a hand-drawn plate in an older surgical atlas. Muted slate, ochre, dusty rose, sage and cream, with a small localized area of dark indigo wash. One focal subject. Large calm negative space. Full-bleed composition with no border, frame, vignette edge or seam. 16:9, at least 1920×1080.

## Master negative prompt

No text, letters, numbers, labels, captions, watermarks or signatures. No monitor readouts or digits. No faces, no patients, no hands, no blood, no gore, no surgical scene. No neon, no glow effects, no lens flare, no 3D render look, no glossy plastic shading, no photorealism, no stock-photo look, no infographic icons. No borders, frames, torn-paper edges or visible paper edge. Nothing placed in the right half of the image beyond paper texture and the faintest wash.

## Asset table

| Filename | Slides | Mode | Scene summary |
|---|---|---|---|
| cover-alf-aclf-icu.png | 1 | Full-bleed background, title over right half | Anatomical liver on the left, indigo wash behind it, right half quiet for the title (done, made in Gemini 2026-10-26) |
| divider-bed4.png | 4 | Full-bleed, title on left half | Empty made-up ICU bed, IV pole, dark monitor |
| divider-bed7.png | 65 | Full-bleed, title on left half | Shrunken nodular cirrhotic liver |
| head-of-bed-30.png | 38 | Spot illustration on white, beside bullets | Empty ICU bed with head raised 30° |
| crrt-machine.png | 41 | Spot illustration on white, beside bullets | CRRT machine with filter and circuit |
| phone.png | 57, 58 | Spot illustration on white | Hospital desk phone, handset off the hook |
| paracentesis.png | 70 | Spot illustration on white, beside bullets | Paracentesis needle, tubes of ascitic fluid, culture bottle |
| kidney.png | 87 | Spot illustration on white, between the two columns | Single kidney with hilar vessels and ureter |
| pause-stethoscope.png | 64 | Full-bleed, title centered | Coiled stethoscope in lower right |
| divider-transplant.png | 107 | Full-bleed, title on left half | Donor liver in organ bag on ice in a cooler |
| closing-liver.png | 116 | Full-bleed, title on right half | Cover liver again, warm light instead of indigo |

## cover-alf-aclf-icu.png

- **Slides:** 1 (cover)
- **Mode:** full-bleed background, text-free. Title, subtitle, author block and Tufts logo are set in PowerPoint over the right half.
- **Scene summary:** a single anatomical liver, anterior view, in watercolor over ink, sitting in the left third of the frame. Behind it a soft dark indigo wash, like the dim light of an ICU room, fading out into ivory paper well before the middle of the image.
- **Purpose:** sets the subject (the liver) and the setting (the ICU) without any words, and leaves a clean area for a readable title.
- **Composition and quiet zone:** liver centered at about 25% from the left edge, roughly 40% of image width. The indigo wash stays within the left 45%. The right 55% is quiet: ivory paper grain, at most a very pale cream or slate wash, nothing with edges or detail. Even tonal value across the quiet zone so dark title text reads cleanly.
- **Continuity:** master look for the other section pages (same paper, palette and ink weight). closing-liver.png repeats this liver in warm light.
- **Clinical accuracy checks:**
  - Right lobe clearly larger than left lobe, falciform ligament dividing them on the anterior surface
  - Gallbladder fundus just visible below the inferior edge of the right lobe
  - Inferior vena cava and hepatic veins faint at the posterior-superior surface if shown at all
  - Smooth capsule, normal liver shape (this is not a cirrhotic, nodular liver, since ALF is usually a previously normal liver)
  - No organs other than the liver
- **Alt text:** "Watercolor illustration of a liver in dim ICU light, on ivory paper."

### Full prompt

Clinical editorial watercolor illustration over fine gray ink linework, on warm ivory textured cold-press paper, 16:9 landscape, full-bleed with no border or frame. A single anatomically correct human liver, anterior view, placed in the left third of the image, about 40% of the image width. The right lobe is clearly larger than the left lobe, the falciform ligament runs down the anterior surface between them, and the fundus of the gallbladder just shows beneath the lower edge of the right lobe. The capsule is smooth and the shape is normal, not cirrhotic. The liver is painted in muted ochre and dusty rose washes with cream highlights, thin sage lines hinting at hepatic vessels, and confident thin gray ink contours in the style of an old surgical atlas plate. Behind the liver, a soft localized wash of dark indigo and muted slate suggests the dim light of an intensive care room; this wash blooms out from behind the organ and fades completely into ivory paper before the middle of the image. The right 55% of the image is calm negative space: plain ivory paper grain with at most a very pale cream wash, even in tone, no shapes, no lines, no detail, so a dark title can be set over it later. Visible paper texture throughout, soft watercolor blooms at wash edges, restrained and quiet mood. No text, letters, numbers, labels, watermarks or signatures. No monitors, readouts, faces, hands, patients, blood or surgical scene. No neon, glow, lens flare, 3D render look, glossy shading, photorealism or infographic icons. No borders, torn edges or visible paper edge.

All ten were made by Mohammad in Gemini on 2026-10-26 and placed in the deck. Spot images were pushed to pure white (build/img/*.png) so they sit cleanly on white slides.

## Notes for the other images

- **Clinical accuracy checks:** the cirrhotic liver must be nodular and shrunken, with an atrophic right lobe (not a smooth liver). The CRRT machine should look like a real CRRT machine, with a vertical filter and roller pumps, not an IV pump. The paracentesis set uses a long needle-catheter, not a spinal needle. The kidney's hilum order is vein, artery, ureter from front to back. The head of the bed should be at about 30°, not sitting upright.
- **Spot vs full-bleed:** images 3 to 7 fade into pure white and sit beside bullets on white slides. Images 1, 2, 8, 9 and 10 are full-bleed ivory pages like the cover, with the title over the quiet half.
- **Answers stay hidden:** nothing here goes on a question slide where it would give the answer away. The paracentesis set is on the answer slide (70), not on "Do you tap him?" (69). The CRRT machine is on the answer slide (41), not the question (40).
- **Alt text:** each image's alt text is its scene summary in the table above.

## Copy-paste block for Gemini

Paste the whole block into Gemini. If it makes only one image per message, send it again with "next" until all ten are done.

```
Generate the following images. Make each one separately, in order, as its own image. None of them should contain any text, letters, numbers, labels, logos or watermarks.

Image 1. divider-bed4.png (slide 4, section page "Bed 4")
Clinical editorial watercolor over fine gray ink linework on warm ivory textured cold-press paper, in muted slate, ochre, dusty rose, sage and cream, with soft watercolor blooms and visible paper grain. 16:9 landscape, full-bleed, no border or frame. An empty, freshly made ICU bed seen from a three-quarter angle, placed in the right third of the image. The rails are up, with white sheets and one pillow. Beside it stands an IV pole with one clear fluid bag and tubing, and a bedside monitor with a dark, blank screen. A soft localized wash of slate and dark indigo sits behind the bed only. The left 55% of the image is plain ivory paper with at most a very pale cream wash, with no shapes, lines or detail, so a title can sit there. No people, faces or hands. No neon, glow, 3D render look or photorealism.

Image 2. divider-bed7.png (slide 65, section page "Bed 7")
Clinical editorial watercolor over fine gray ink linework on warm ivory textured cold-press paper, in muted slate, ochre, dusty rose, sage and cream, with soft watercolor blooms and visible paper grain. 16:9 landscape, full-bleed, no border or frame. A single anatomically correct cirrhotic human liver, anterior view, placed in the right third of the image. It is small and shrunken, with a coarse nodular surface made of many small regenerative nodules and blunted edges. The right lobe is atrophied and the left lobe relatively enlarged. It is painted in dull ochre, olive and dusty rose washes with thin gray ink contours, like a plate in an old pathology atlas. A soft localized wash of dark indigo sits behind the organ only. The left 55% is plain ivory paper with at most a very pale cream wash, with no shapes or detail. No other organs, no blood, no people. No neon, glow, 3D render look or photorealism.

Image 3. head-of-bed-30.png (slide 38, "Protecting the brain")
Clinical editorial watercolor over fine gray ink linework, in muted slate, ochre, dusty rose, sage and cream, with soft blooms. Square 1:1. A side view of an empty ICU bed with the head of the bed raised to about 30 degrees. One pillow lies flat so the neck would stay straight, and the side rails are up. Keep it simple and clear so the angle reads at a glance from the back of a room. The subject is centered with a generous margin, and the washes fade softly into a plain pure white background with no visible paper edge, so it sits cleanly on a white slide. No people, no faces, no text or numbers, no angle markings. No 3D render look or photorealism.

Image 4. crrt-machine.png (slide 41, "Start CRRT for the ammonia")
Clinical editorial watercolor over fine gray ink linework, in muted slate, ochre, dusty rose, sage and cream, with soft blooms. Square 1:1. A continuous renal replacement therapy machine standing alone, front three-quarter view. It is an upright cabinet on wheels, with a hemofilter cartridge mounted vertically on the front, roller pumps, and loops of tubing, the circuit lines tinted dark red. Clear fluid bags hang at the bottom, and the screen is blank. The subject is centered with a generous margin, and the washes fade softly into a plain pure white background with no visible paper edge. No people, no text or numbers on the screen or the machine, no brand names, no spilled blood. No 3D render look or photorealism.

Image 5. phone.png (slides 57 and 58, "When do you call transplant hepatology?")
Clinical editorial watercolor over fine gray ink linework, in muted slate, ochre, dusty rose, sage and cream, with soft blooms. Square 1:1. A plain hospital desk telephone seen from a three-quarter angle, with the handset lifted off and lying beside it and the coiled cord loose. The keypad buttons are blank. The subject is centered with a generous margin, and the washes fade softly into a plain pure white background with no visible paper edge. No people, no hands, no text, numbers or logos. No 3D render look or photorealism.

Image 6. paracentesis.png (slide 70, "Yes, now. Ascitic fluid")
Clinical editorial watercolor over fine gray ink linework, in muted slate, ochre, dusty rose, sage and cream, with soft blooms. Square 1:1. A paracentesis set laid out neatly on a small sterile blue drape: a long paracentesis needle with catheter, a 60 mL syringe, two capped specimen tubes, and one blood culture bottle with a blank label. One tube holds clear straw-colored fluid, and the other holds slightly cloudy yellow fluid. The subject is centered with a generous margin, and the washes fade softly into a plain pure white background with no visible paper edge. No people, no hands, no blood, no text, numbers or markings. No 3D render look or photorealism.

Image 7. kidney.png (slide 87, "Kidney failure in cirrhosis is usually a mixture")
Clinical editorial watercolor over fine gray ink linework, in muted slate, ochre, dusty rose, sage and cream, with soft blooms. Square 1:1. A single anatomically correct human kidney, anterior view, drawn like a plate in an old anatomy atlas. It has a smooth capsule and a bean shape, with the renal artery, renal vein and ureter leaving the hilum. The kidney is in dusty rose and ochre washes, the vessels are touched with sage and slate, and thin confident gray ink contours outline it. The subject is centered with a generous margin, and the washes fade softly into a plain pure white background with no visible paper edge. No other organs, no labels or text, no blood. No 3D render look or photorealism.

Image 8. pause-stethoscope.png (slide 64, "Any questions so far?")
Clinical editorial watercolor over fine gray ink linework on warm ivory textured cold-press paper, in muted slate, ochre, dusty rose, sage and cream, with soft watercolor blooms and visible paper grain. 16:9 landscape, full-bleed, no border or frame. A single stethoscope lying loosely coiled on the paper in the lower right part of the image, its tubing in muted slate with a soft shadow. The rest of the image, especially the center and upper half, is plain ivory paper with at most a very pale cream wash, so a short title can sit in the middle. No people, no text. No neon, glow, 3D render look or photorealism.

Image 9. divider-transplant.png (slide 107, section page "Who gets a liver?")
Clinical editorial watercolor over fine gray ink linework on warm ivory textured cold-press paper, in muted slate, ochre, dusty rose, sage and cream, with soft watercolor blooms and visible paper grain. 16:9 landscape, full-bleed, no border or frame. A donor liver for transplant, sealed in a clear sterile organ bag with preservation fluid, resting on crushed ice in an open white transport cooler. It is seen from above at an angle and placed in the right third of the image. The ice is in cool slate and pale blue-gray washes, and the liver is a normal smooth liver in dusty rose and ochre. A soft localized slate wash sits behind the cooler only. The left 55% is plain ivory paper with at most a very pale cream wash, with no shapes or detail. No people, no hands, no surgical scene, no blood, no text or labels on the cooler or bag. No neon, glow, 3D render look or photorealism.

Image 10. closing-liver.png (slide 116, "Questions?")
Clinical editorial watercolor over fine gray ink linework on warm ivory textured cold-press paper, in muted slate, ochre, dusty rose, sage and cream, with soft watercolor blooms and visible paper grain. 16:9 landscape, full-bleed, no border or frame. A companion to a cover image of a liver in a dark indigo wash: the same single anatomically correct human liver, anterior view, in the left third of the image. The right lobe is larger than the left, the falciform ligament runs between them, the gallbladder fundus just shows below the right lobe, and the capsule is smooth and normal. This time the wash behind it is warm and light, soft ochre and cream instead of indigo, as if the patient recovered. The right 55% is plain ivory paper with at most a very pale cream wash, with no shapes or detail, so a title can sit there. No text, no other organs, no people. No neon, glow, 3D render look or photorealism.
```

## Added later: section page for "Her brain"

| Filename | Slides | Mode | Scene summary |
|---|---|---|---|
| divider-brain.png | 25 ("Her brain", Hour 12) | Full-bleed, title on left half | Swollen brain in coronal section, effaced sulci, small ventricles, dark indigo wash |

- **Clinical accuracy checks:** this should look like diffuse cerebral edema: gyri flattened and pressed together, sulci effaced, lateral ventricles reduced to slits. No hemorrhage, no tumor, no midline shift.
- **Alt text:** "Watercolor of a swollen brain in coronal section."

```
Generate this image. It must not contain any text, letters, numbers, labels, logos or watermarks.

divider-brain.png (section page "Her brain")
Clinical editorial watercolor over fine gray ink linework on warm ivory textured cold-press paper, in muted slate, ochre, dusty rose, sage and cream, with soft watercolor blooms and visible paper grain. 16:9 landscape, full-bleed, no border or frame. A single human brain in coronal section, drawn like a plate in an old neuropathology atlas, placed in the right third of the image. It shows diffuse cerebral edema: the gyri are flattened and pressed together, the sulci are effaced, and the lateral ventricles are squeezed to narrow slits. The gray matter is in dusty rose and the white matter in cream, with thin confident gray ink contours. A soft localized wash of dark indigo sits behind the brain only. The left 55% is plain ivory paper with at most a very pale cream wash, with no shapes or detail. No skull, no blood, no hemorrhage, no tumor, no people, no text. No neon, glow, 3D render look or photorealism.
```

## Added later: organs-alf.png for "Which other organs fail in ALF?"

- **Slides:** 13 (answer step of "Which other organs fail in ALF?"). Replaces the NEJM figure.
- **Mode:** full-bleed background. The organ labels and leader lines are set in PowerPoint on the left and right thirds, so the picture itself has no text.
- **Scene summary:** an anatomical plate of a featureless human figure from head to upper thighs, drawn as a pale ink outline, with the organs that fail in ALF painted inside it: brain, lungs, heart, liver, pancreas, both adrenal glands, both kidneys, spleen, and the bone marrow in the pelvis and femurs. The liver is the warmest and most detailed; the other organs are a little paler, each with a faint slate shadow.
- **Composition and quiet zone:** figure centered, top of the head about 6% from the top edge, upper thighs cut off at the bottom edge, figure about 30% of image width. Left 33% and right 33% are plain ivory paper for labels. Organs sized and placed correctly so leader lines can point at them.
- **Clinical accuracy checks:** brain inside the skull outline; lungs either side of the heart with the heart tilted to the left of the figure's midline (viewer's right); liver mostly on the figure's right (viewer's left) under the diaphragm; adrenal glands as small caps on top of each kidney; pancreas behind and below the stomach area, head toward the figure's right; spleen on the figure's left (viewer's right); marrow shown as a soft red tint inside the pelvis and femur shafts.
- **Alt text:** "Watercolor anatomical figure showing the brain, lungs, heart, liver, pancreas, adrenals, kidneys, spleen and bone marrow."

### Full prompt

Clinical editorial watercolor illustration over fine gray ink linework, on warm ivory textured cold-press paper, 16:9 landscape, full-bleed with no border or frame. An anatomical plate of a featureless human figure, front view, from the top of the head to the upper thighs, centered in the image and about 30% of the image width, drawn as a pale, thin gray ink outline with no facial features, no hair and no hands visible. Inside the outline, painted as in an old anatomy atlas: the brain within the skull; both lungs; the heart between them, tilted toward the figure's left side; the liver under the right diaphragm, the largest and warmest organ, in ochre and dusty rose with cream highlights and thin sage vessel lines; the spleen under the left diaphragm; the pancreas lying across the upper abdomen; both kidneys with a small adrenal gland capping each one; and a soft muted red tint inside the pelvic bones and the shafts of both femurs to show the bone marrow. The other organs are slightly paler than the liver, each with a faint slate shadow, and a soft localized wash of muted slate and dark indigo sits behind the torso only. The left third and the right third of the image are plain ivory paper with no shapes, lines or detail, even in tone, so labels can be placed there later. Visible paper texture, soft watercolor blooms, calm and restrained. No text, letters, numbers, labels, arrows, watermarks or signatures. No face, no realistic skin, no nudity detail, no blood, no surgical scene. No neon, glow, lens flare, 3D render look, glossy shading, photorealism or infographic icons. No borders, torn edges or visible paper edge.

## Added later: whole-deck audit (2026-10-27)

Every slide that was text only, or had a weak picture, got a prompt. Slide numbers are the logical "X/85" numbers shown on the slides. All are spot illustrations on pure white except organs-alf-empty.png, which is an edit of organs-alf.png.

| Filename | Slide | Where it goes | Checks |
|---|---|---|---|
| cold-flu-meds.png | 13/85 | Replaces the DayQuil photo beside the roommate's story | No brand, no readable label |
| organs-alf-empty.png | 9/85 | Question step of "Which other organs fail in ALF?", so the organs appear on the answer step | Outline must line up with organs-alf.png |
| two-beds.png | 3/85, 76/85 | Under the bed 4 / bed 7 table; beside "Back to our patients" | Both bays look the same |
| awake-bed.png | 8/85 | "Same patient, but wide awake" | Empty bed, head up |
| lactulose.png | 22/85 | Question step only | Amber syrup, blank label |
| nasal-cannula.png | 23/85 | Question step | Flowmeter without numbers |
| ventilator.png | 24/85 | Question step | Blank screen, two-limb circuit |
| urine-bag.png | 28/85 | Question step | Small amount of dark urine |
| ffp-bag.png | 29/85 | Question step only (the answer is "no plasma") | Straw-yellow, not red |
| plasma-exchange.png | 40/85 | Beside the study table | Apheresis machine, not CRRT |
| ascites-bed.png | 46/85 | "Do you tap him?" | Face turned away, no needle |
| terlipressin-vial.png | 55/85 | "HRS? Start terlipressin?" | Lyophilized powder vial |
| ammonia-on-ice.png | 60/85 | "Repeat the ammonia in 6 hours?" | Tube on ice |
| kidney-options.png | 63/85 | "Terlipressin, more albumin, or dialysis?" | All three equal, so no hint |
| midodrine-octreotide.png | 69/85 | Question step | Tablets plus syringe |
| icu-bay.png | 72/85 | "Is he too sick?" | Vent, pumps, CRRT, dark monitor |
| pocket-notebook.png | 77/85 | "Some tricks of the trade" | No writing visible |

No picture goes on a slide where it would give away the answer: the FFP bag, lactulose and the three kidney options sit on the question steps as the things being asked about, and the organs only appear on the answer step.

```
Generate the following images:

Make each one separately, in order, as its own image, and save it under the filename given. None of them should contain any text, letters, numbers, labels, logos or watermarks.

1. cold-flu-meds.png (slide 13/85, "28F, 4 days of nausea", replaces the DayQuil photo)
Clinical editorial watercolor over fine gray ink linework, in muted slate, ochre, dusty rose, sage and cream, with soft watercolor blooms and visible paper grain, drawn like a plate in an older medical atlas. Square 1:1, at least 1500 x 1500. A quiet still life of ordinary household medicines on a bare surface: a cold-and-flu medicine carton with a plain blank front, with a blister strip of liquid-filled gel capsules half pulled out of it; a white over-the-counter pain-reliever bottle with a blank label and the cap off; and an amber prescription pill bottle with a plain white blank label. Three or four plain white round tablets lie loose beside the bottles. Nothing dramatic, nothing spilled everywhere. No people, no faces, no hands. The subject is centered with a generous margin, and the washes fade softly into a plain pure white background with no visible paper edge, so it sits cleanly on a white slide. No text, letters, numbers, labels, logos, brand names or watermarks anywhere, including on labels, screens and packaging. No 3D render look, glossy shading, photorealism, neon or glow.

2. organs-alf-empty.png (slide 9/85, question step of "Which other organs fail in ALF?". ATTACH organs-alf.png TO THIS ONE)
Edit the attached image (organs-alf.png). Keep everything exactly the same: the same 16:9 size, the same paper, the same pale gray ink outline of the figure in the same position and size, and the same soft slate and indigo wash behind the torso. Only remove every organ inside the figure (brain, lungs, heart, liver, spleen, pancreas, kidneys, adrenals and the red marrow tint), so the inside of the outline is plain ivory paper with the faint wash. Do not move, redraw or crop the figure. No text, letters, numbers or labels.

3. two-beds.png (slide 3/85 "Two patients, same ICU" and slide 76/85 "Back to our patients")
Clinical editorial watercolor over fine gray ink linework, in muted slate, ochre, dusty rose, sage and cream, with soft watercolor blooms and visible paper grain, drawn like a plate in an older medical atlas. Landscape 3:2, at least 1800 x 1200. Two empty, freshly made ICU beds side by side, seen from the foot of the beds, separated by a privacy curtain that is pulled back. Each bed has its rails up, white sheets and one pillow, an IV pole with one clear fluid bag, and a bedside monitor with a dark, blank screen. The two bays look the same. No people, no faces, no hands. The subject is centered with a generous margin, and the washes fade softly into a plain pure white background with no visible paper edge, so it sits cleanly on a white slide. No text, letters, numbers, labels, logos, brand names or watermarks anywhere, including on labels, screens and packaging. No 3D render look, glossy shading, photorealism, neon or glow.

4. awake-bed.png (slide 8/85 "Same patient, but wide awake")
Clinical editorial watercolor over fine gray ink linework, in muted slate, ochre, dusty rose, sage and cream, with soft watercolor blooms and visible paper grain, drawn like a plate in an older medical atlas. Square 1:1, at least 1500 x 1500. An empty hospital bed with the head raised almost upright and the blanket pushed back, as if the patient just got up. On the over-bed tray table beside it: a plastic cup of water with a bendy straw, an open paperback book lying face down, and a phone with its charging cable. Soft daylight. No people, no faces, no hands. The subject is centered with a generous margin, and the washes fade softly into a plain pure white background with no visible paper edge, so it sits cleanly on a white slide. No text, letters, numbers, labels, logos, brand names or watermarks anywhere, including on labels, screens and packaging. No 3D render look, glossy shading, photorealism, neon or glow.

5. lactulose.png (slide 22/85 "Lactulose for her?" (question step only))
Clinical editorial watercolor over fine gray ink linework, in muted slate, ochre, dusty rose, sage and cream, with soft watercolor blooms and visible paper grain, drawn like a plate in an older medical atlas. Square 1:1, at least 1500 x 1500. A small clear plastic medicine cup holding a dose of thick, clear amber syrup, standing next to a plain plastic bottle of the same amber syrup with a blank white label. No people, no faces, no hands. The subject is centered with a generous margin, and the washes fade softly into a plain pure white background with no visible paper edge, so it sits cleanly on a white slide. No text, letters, numbers, labels, logos, brand names or watermarks anywhere, including on labels, screens and packaging. No 3D render look, glossy shading, photorealism, neon or glow.

6. nasal-cannula.png (slide 23/85 "When do you intubate?" (question step: SpO2 96% on 2 L, handling secretions))
Clinical editorial watercolor over fine gray ink linework, in muted slate, ochre, dusty rose, sage and cream, with soft watercolor blooms and visible paper grain, drawn like a plate in an older medical atlas. Square 1:1, at least 1500 x 1500. A loosely coiled clear nasal cannula connected to a wall oxygen flowmeter with a clear bubble humidifier bottle, and beside it a Yankauer suction tip on a length of clear suction tubing. The flowmeter scale is drawn as plain tick marks with no numbers. No people, no faces, no hands. The subject is centered with a generous margin, and the washes fade softly into a plain pure white background with no visible paper edge, so it sits cleanly on a white slide. No text, letters, numbers, labels, logos, brand names or watermarks anywhere, including on labels, screens and packaging. No 3D render look, glossy shading, photorealism, neon or glow.

7. ventilator.png (slide 24/85 "Can we use permissive hypercapnia?" (question step))
Clinical editorial watercolor over fine gray ink linework, in muted slate, ochre, dusty rose, sage and cream, with soft watercolor blooms and visible paper grain, drawn like a plate in an older medical atlas. Square 1:1, at least 1500 x 1500. A modern ICU ventilator standing alone on a wheeled stand, front three-quarter view, with a blank dark screen. A breathing circuit with two corrugated limbs joins at a Y-piece with a small filter, and the circuit hangs in a gentle loop from a support arm. No people, no faces, no hands. The subject is centered with a generous margin, and the washes fade softly into a plain pure white background with no visible paper edge, so it sits cleanly on a white slide. No text, letters, numbers, labels, logos, brand names or watermarks anywhere, including on labels, screens and packaging. No 3D render look, glossy shading, photorealism, neon or glow.

8. urine-bag.png (slide 28/85 "The creatinine is only 1.3" (question step: urine output 15 mL/h))
Clinical editorial watercolor over fine gray ink linework, in muted slate, ochre, dusty rose, sage and cream, with soft watercolor blooms and visible paper grain, drawn like a plate in an older medical atlas. Square 1:1, at least 1500 x 1500. A urinary catheter drainage bag hanging from the lower frame of a hospital bed, with only a small amount of dark amber urine at the bottom of the bag and a little in the tubing. The graduation marks on the bag are plain lines with no numbers. No people, no faces, no hands. The subject is centered with a generous margin, and the washes fade softly into a plain pure white background with no visible paper edge, so it sits cleanly on a white slide. No text, letters, numbers, labels, logos, brand names or watermarks anywhere, including on labels, screens and packaging. No 3D render look, glossy shading, photorealism, neon or glow.

9. ffp-bag.png (slide 29/85 "Should we correct this INR?" (question step: 2 units of FFP first?))
Clinical editorial watercolor over fine gray ink linework, in muted slate, ochre, dusty rose, sage and cream, with soft watercolor blooms and visible paper grain, drawn like a plate in an older medical atlas. Square 1:1, at least 1500 x 1500. Two units of thawed fresh frozen plasma lying on a flat surface: flat, soft plastic blood-bank bags filled with clear straw-yellow fluid, each with a short length of segment tubing and two ports at the top, and a plain white blank label. No people, no faces, no hands. The subject is centered with a generous margin, and the washes fade softly into a plain pure white background with no visible paper edge, so it sits cleanly on a white slide. No text, letters, numbers, labels, logos, brand names or watermarks anywhere, including on labels, screens and packaging. No 3D render look, glossy shading, photorealism, neon or glow.

10. plasma-exchange.png (slide 40/85 "Can plasma exchange buy time?" (beside the study table))
Clinical editorial watercolor over fine gray ink linework, in muted slate, ochre, dusty rose, sage and cream, with soft watercolor blooms and visible paper grain, drawn like a plate in an older medical atlas. Square 1:1, at least 1500 x 1500. An apheresis machine for therapeutic plasma exchange standing alone, front three-quarter view: an upright cabinet on wheels with a blank screen, roller pumps, and a tubing set. One collection bag holds straw-yellow plasma, and bags of replacement plasma hang from a pole on the side. No people, no faces, no hands. The subject is centered with a generous margin, and the washes fade softly into a plain pure white background with no visible paper edge, so it sits cleanly on a white slide. No text, letters, numbers, labels, logos, brand names or watermarks anywhere, including on labels, screens and packaging. No 3D render look, glossy shading, photorealism, neon or glow.

11. ascites-bed.png (slide 46/85 "What tipped him over?" (question: INR 2.1, platelets 62,000. Do you tap him?))
Clinical editorial watercolor over fine gray ink linework, in muted slate, ochre, dusty rose, sage and cream, with soft watercolor blooms and visible paper grain, drawn like a plate in an older medical atlas. Square 1:1, at least 1500 x 1500. A thin middle-aged man lying in a hospital bed with the head raised, seen from the side at a respectful distance, with his face turned away from the viewer and not detailed. Under a hospital gown his abdomen is tensely distended with ascites, while his arms and shoulders are thin. A faint yellow tinge to the skin. Calm, dignified, not dramatic. No blood, no needles, no procedure. No other people, no hands in the foreground. The subject is centered with a generous margin, and the washes fade softly into a plain pure white background with no visible paper edge, so it sits cleanly on a white slide. No text, letters, numbers, labels, logos, brand names or watermarks anywhere, including on labels, screens and packaging. No 3D render look, glossy shading, photorealism, neon or glow.

12. terlipressin-vial.png (slide 55/85 "Does he have HRS?" (HRS? Start terlipressin?))
Clinical editorial watercolor over fine gray ink linework, in muted slate, ochre, dusty rose, sage and cream, with soft watercolor blooms and visible paper grain, drawn like a plate in an older medical atlas. Square 1:1, at least 1500 x 1500. A small clear glass vial with a gray rubber stopper and a flip-off cap, holding a white freeze-dried powder, with a plain blank white label, lying beside a capped syringe. No people, no faces, no hands. The subject is centered with a generous margin, and the washes fade softly into a plain pure white background with no visible paper edge, so it sits cleanly on a white slide. No text, letters, numbers, labels, logos, brand names or watermarks anywhere, including on labels, screens and packaging. No 3D render look, glossy shading, photorealism, neon or glow.

13. ammonia-on-ice.png (slide 60/85 "Day 1: more confused" (question: repeat the ammonia in 6 hours?))
Clinical editorial watercolor over fine gray ink linework, in muted slate, ochre, dusty rose, sage and cream, with soft watercolor blooms and visible paper grain, drawn like a plate in an older medical atlas. Square 1:1, at least 1500 x 1500. A single capped blood collection tube with a green stopper, filled with dark red blood, standing upright in a small paper cup of crushed ice. No people, no faces, no hands. The subject is centered with a generous margin, and the washes fade softly into a plain pure white background with no visible paper edge, so it sits cleanly on a white slide. No text, letters, numbers, labels, logos, brand names or watermarks anywhere, including on labels, screens and packaging. No 3D render look, glossy shading, photorealism, neon or glow.

14. kidney-options.png (slide 63/85 "What would you do for his kidney today?" (question step))
Clinical editorial watercolor over fine gray ink linework, in muted slate, ochre, dusty rose, sage and cream, with soft watercolor blooms and visible paper grain, drawn like a plate in an older medical atlas. Square 1:1, at least 1500 x 1500. Three things laid side by side on a plain steel tray: a small clear glass vial of white powder with a blank label; a glass bottle of clear amber albumin solution with a blank label and a hanging loop; and a coiled double-lumen dialysis catheter with one red and one blue clamp. Equal weight given to all three, none more prominent. No people, no faces, no hands. The subject is centered with a generous margin, and the washes fade softly into a plain pure white background with no visible paper edge, so it sits cleanly on a white slide. No text, letters, numbers, labels, logos, brand names or watermarks anywhere, including on labels, screens and packaging. No 3D render look, glossy shading, photorealism, neon or glow.

15. midodrine-octreotide.png (slide 69/85 "Midodrine and octreotide for HRS-AKI?" (question step))
Clinical editorial watercolor over fine gray ink linework, in muted slate, ochre, dusty rose, sage and cream, with soft watercolor blooms and visible paper grain, drawn like a plate in an older medical atlas. Square 1:1, at least 1500 x 1500. A small white paper pill cup holding three small white tablets, beside a small clear glass ampule and a prefilled syringe with a short capped needle. No people, no faces, no hands. The subject is centered with a generous margin, and the washes fade softly into a plain pure white background with no visible paper edge, so it sits cleanly on a white slide. No text, letters, numbers, labels, logos, brand names or watermarks anywhere, including on labels, screens and packaging. No 3D render look, glossy shading, photorealism, neon or glow.

16. icu-bay.png (slide 72/85 "Too sick for a transplant, or sick enough to need one?" (question step))
Clinical editorial watercolor over fine gray ink linework, in muted slate, ochre, dusty rose, sage and cream, with soft watercolor blooms and visible paper grain, drawn like a plate in an older medical atlas. Square 1:1, at least 1500 x 1500. An ICU bay around an empty bed with the head raised: a ventilator with a breathing circuit on one side, a tall stack of syringe and infusion pumps on an IV pole, a CRRT machine with a vertical filter and dark-red circuit lines at the foot, and a bedside monitor with a dark, blank screen. Busy with equipment but orderly. No people, no faces, no hands. The subject is centered with a generous margin, and the washes fade softly into a plain pure white background with no visible paper edge, so it sits cleanly on a white slide. No text, letters, numbers, labels, logos, brand names or watermarks anywhere, including on labels, screens and packaging. No 3D render look, glossy shading, photorealism, neon or glow.

17. pocket-notebook.png (slide 77/85 "Some tricks of the trade")
Clinical editorial watercolor over fine gray ink linework, in muted slate, ochre, dusty rose, sage and cream, with soft watercolor blooms and visible paper grain, drawn like a plate in an older medical atlas. Square 1:1, at least 1500 x 1500. A small, well-worn closed pocket notebook with a soft cover and rounded corners, a pen clipped to it, and a penlight lying beside it, as if just taken out of a white coat pocket. No people, no faces, no hands. The subject is centered with a generous margin, and the washes fade softly into a plain pure white background with no visible paper edge, so it sits cleanly on a white slide. No text, letters, numbers, labels, logos, brand names or watermarks anywhere, including on labels, screens and packaging. No 3D render look, glossy shading, photorealism, neon or glow.
```
