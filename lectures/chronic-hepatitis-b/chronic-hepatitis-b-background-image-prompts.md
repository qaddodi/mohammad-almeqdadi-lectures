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

Make sure to generate all of the images above, one image per prompt.
```

Save each result under the exact filename. Use the first image Gemini returns unless it is square or centered when it should be 16:9, or has stray text.

The four images above were remade by Mohammad in Gemini on 2026-10-28 and replaced the API versions.

## Added later: whole-deck audit (2026-10-28)

Slides that were tables only with free space got a spot illustration. All are square spot illustrations that fade to pure white.

### Patient continuity sheet

Patient 1, the man followed from 34 to 57: Vietnamese-born man, slim build, short straight black hair, clean-shaven, plain navy polo shirt, sitting in a simple clinic chair. At 52 the same man has gray at the temples, thin reading glasses and slightly fuller face, same navy polo.

| Filename | Slides | Where it goes |
|---|---|---|
| blood-tubes.png | Objectives | Right of the objectives list |
| vaccine-1980s.png | From antigen to vaccine | Below the timeline |
| man-34.png | 34-year-old man (34 and 41 slides) | Right of the lab table |
| man-52.png | Same man, now 52 (and the stopping slides if space) | Right of the lab table |
| iv-infusion.png | Rituximab, six cycles (question step) | Below the chart |
| ultrasound-probe.png | Monitoring (60 min), Who gets surveillance | Beside the table |
| cirrhotic-liver.png | Cirrhosis and decompensation (60 min) | Below the table |
| newborn-vaccine.png | Children and adolescents (60 min), pregnancy timeline if space | Below or beside the table |

### Clinical accuracy checks

- **blood-tubes:** modern evacuated tubes with plain colored caps (gold or red for serum), blank labels, in a white plastic rack. Different from the cork-stoppered 1960s tubes on the cover.
- **vaccine-1980s:** a small glass vial with an aluminum crimp cap and a glass syringe of the early 1980s, blank label. No brand.
- **man-34 / man-52:** same person, aged correctly. Respectful, calm, not sick-looking (he has no symptoms). No jaundice.
- **iv-infusion:** an IV bag of clear fluid on a pole with a drip chamber and an infusion pump with a blank screen. No drug name.
- **ultrasound-probe:** a curvilinear abdominal probe (convex face), not a linear vascular probe and not the elastography probe.
- **cirrhotic-liver:** small, nodular, blunt edges, atrophic right lobe, relatively enlarged left and caudate lobes. A little ascites is not drawn (organ only).
- **newborn-vaccine:** a swaddled newborn sleeping, with a small vaccine syringe and a cotton ball on a tray beside, not in the baby. Nothing invasive.
- **Spoilers:** man-34 and man-52 sit on the question steps too; they show nothing about the answer. iv-infusion goes on the question step, not with the answer bar.

### Copy-paste block for Gemini

```
Generate the following images. Make each one separately, in order, as its own image. None of them should contain any text, letters, numbers, labels, logos or watermarks. Every image is square 1:1, a clinical editorial watercolor over fine gray ink linework in muted slate, ochre, dusty rose, sage and cream, with soft blooms, the subject centered with a generous margin, and the washes fading softly into a plain pure white background with no visible paper edge, so it sits cleanly on a white slide. No 3D render look and no photorealism.

Image 1. blood-tubes.png
Five modern evacuated blood collection tubes standing in a small white plastic rack, seen at a slight three-quarter angle. Two have gold caps and three have red caps, each filled with clear straw-yellow serum above a layer of separated red cells. The tube labels are blank white. No needles, no hands, no text, numbers or barcodes.

Image 2. vaccine-1980s.png
A small glass vaccine vial from the early 1980s with an aluminum crimp cap and a blank paper label, lying beside a reusable glass syringe with a metal plunger and finger rings, on a folded white cloth. Quiet still life, like a museum object. No text, numbers, brand names or scale markings.

Image 3. man-34.png
A Vietnamese man aged about 34, slim build, short straight black hair, clean-shaven, wearing a plain navy polo shirt, sitting upright in a simple clinic chair, seen in three-quarter view from the waist up, hands resting on his knees. Calm, healthy-looking, dignified, face drawn simply with soft features. No medical equipment, no other people, no text.

Image 4. man-52.png
The same Vietnamese man now aged about 52: slim build, short straight black hair with gray at the temples, thin wire reading glasses, a slightly fuller face, clean-shaven, wearing the same plain navy polo shirt, sitting upright in the same simple clinic chair, seen in three-quarter view from the waist up, hands resting on his knees. Calm, healthy-looking, dignified, face drawn simply with soft features. No medical equipment, no other people, no text.

Image 5. iv-infusion.png
An IV pole with one bag of clear fluid hanging from it, a drip chamber and tubing running down into a small infusion pump clamped to the pole, its screen blank. Seen from a slight three-quarter angle. No people, no hands, no text, numbers or drug names on the bag or the pump.

Image 6. ultrasound-probe.png
An abdominal ultrasound probe with a curved convex face, resting at an angle beside a small dab of clear gel, its cable loosely coiled. Simple and clear, readable from the back of a room. Not a linear probe, not a pen-shaped probe. No screen, no people, no hands, no text, numbers or brand names.

Image 7. cirrhotic-liver.png
A single anatomically correct cirrhotic human liver, anterior view, drawn like a plate in an old pathology atlas. It is small and shrunken, with a coarse nodular surface of many small regenerative nodules and blunt edges. The right lobe is atrophied and the left lobe relatively enlarged. Dull ochre, olive and dusty rose washes with thin gray ink contours. No other organs, no blood, no text or labels.

Image 8. newborn-vaccine.png
A sleeping newborn baby swaddled in a plain cream blanket, lying on a soft surface, seen from slightly above. Beside the baby, on a small white tray, a tiny prefilled vaccine syringe with its cap on and a cotton ball. The syringe is not touching the baby. Peaceful and gentle. No adults, no hands, no text, numbers or markings.

Make sure to generate all of the images above, one image per prompt.
```
