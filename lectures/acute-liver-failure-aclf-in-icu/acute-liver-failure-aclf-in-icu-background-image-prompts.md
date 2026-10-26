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
