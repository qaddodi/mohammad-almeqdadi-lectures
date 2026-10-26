# Mohammad Almeqdadi's lecture style

A source-based guide for outlining future lectures.

Reviewed 2026-10-26 against `qaddodi/mohammad-almeqdadi-lectures`, `main` commit `f1fd8790289975b1be329d20dd656dc993ce2475`.

## How to use this guide

Read the style summary, choose the lecture format that fits the audience, then use the outline specification below. The goal is to reproduce the teaching decisions visible in these lectures: what the learner sees first, what they must decide, how the explanation develops, and what they should do with it.

**Working synthesis:** These decks teach clinical reasoning through questions and staged disclosure. They repeatedly connect a concrete finding to its mechanism, use that mechanism to distinguish competing explanations, and turn the distinction into a diagnostic or management decision. The tone is conversational, sometimes playful or provocative, and grounded in clinical practice. Specialist lectures add substantial evidence review, limitations, and transplant-specific implications.

This is an interpretation of the uploaded material, not a recording-based assessment of live delivery or an independently validated account of teaching effectiveness.

## Evidence and limits

All 18 PowerPoint files were inspected for ordered slide text, tables, speaker notes, and package structure. They contain 1,231 slides in total, including alternate versions and successive reveal slides. Those are not 1,231 distinct teaching concepts. Counts were calculated programmatically with Python.

Cover thumbnails and selected embedded visual assets were also inspected, including the board-review images, portal anatomy diagrams, HPS figures and policy excerpt, and transplant history and clinical graphics. Full slide rendering, every embedded image, and audio/video playback were not reviewed. Image-only slides are therefore not assumed to be empty. Visual conclusions are narrower than the conclusions about sequencing and wording.

The repository README explicitly excludes `NAFLD_NASH_20191105_final.pptx`. It was not reviewed. Dates in filenames identify versions, not independently verified presentation dates. Some material is reproduced from textbooks, papers, or protocols. Its selection and placement provide evidence of teaching choices, but its original prose and graphic design should not automatically be attributed to the lecturer. Available notes include figure legends and do not constitute a complete speaking script.

This is a style analysis, not a clinical accuracy review. Historic treatment statements, diagnostic shortcuts, numerical thresholds, and allocation policies must be checked against current primary sources before reuse. Preserve the instructional pattern without treating an old slide as current medical authority.

## The recurring teaching patterns

### 1. Ask before explaining

The question frequently precedes the answer, sometimes on its own slide. Questions ask learners to diagnose, choose a test, identify a sign, predict a consequence, or decide what to do next.

Examples:

- **ALI-V2, slides 6–10:** the diagnostic task is introduced, laboratory results appear, and the diagnosis and interpretive clues follow while the same results remain visible.
- **CIR-25, slides 31–38:** a case develops through laboratory interpretation and questions about etiology before the reveal that cirrhosis has not yet been established.
- **GI-19, slides 13–15:** the audience is asked which laboratory test to order before the new result and differential question appear.
- **NEURO, slides 24–25:** terminology, mechanism, and testing questions about asterixis precede the answers.

**For a new outline:** specify what the audience sees before the answer, the precise question, and what is revealed next. Do not describe a section merely as “interactive.”

### 2. Use successive slides as teaching beats

Near-identical slides often add one question, clue, answer, or consequence. These sequences are part of the teaching structure, not simply accidental duplication.

- **ALI-20, slides 47–50:** a clinical question is followed by an answer, then “Why?”, then the explanation.
- **CIR-25, slides 83–89:** a new problem leads to criteria introduced in successive steps.
- **DIARRHEA, slides 27–34:** history features are introduced, their significance is queried, then their interpretation is supplied.
- **NEURO, slides 73–74:** an incomplete comparison table becomes a completed answer table.

**For a new outline:** count conceptual teaching beats separately from physical slides. A question and its reveal may need two slides without representing two separate topics. Preserve the underlying case or diagram between reveals so learners can compare what changed.

### 3. Explain why the finding occurs

Mechanism is repeatedly connected to interpretation. Anatomy, physiology, and biochemical pathways support the subsequent clinical decision.

- **ALI-20, slides 28–36 and 61–69:** tissue sources and enzyme relationships lead into interpretation of laboratory patterns.
- **CIR-25, slides 5–16:** hepatocyte function and portal circulation lead into clinical manifestations and questions about their mechanisms.
- **DIARRHEA, slides 8–24 and 27–34:** fluid handling and categories of diarrhea lead into the meaning of fasting and nocturnal symptoms.
- **HPS-25, slides 13–18:** a classification is followed by “Do we care?” and a practical question about response to oxygen.
- **HYPO-NA, slides 4–12:** water-balance physiology precedes the clinical framework.

**For a new outline:** attach each mechanism to a finding, test interpretation, or treatment decision. When a classification is introduced, immediately identify what changes clinically because of it.

### 4. Make reasoning errors visible

The decks often elicit an intuitive answer and then expose a missing distinction. This is more specific than adding miscellaneous “pearls.”

- **ALI-20, slides 16–23:** familiar terminology is challenged before the relevant distinction is taught.
- **ALI-20, slides 72–75:** comparing patients leads to a distinction between the magnitude of an abnormality and illness severity.
- **CIR-25, slides 35–45:** a striking laboratory result and discordant tests force reconsideration of the diagnostic argument.
- **NEURO, slides 56–57:** a histology question receives an unexpected staining answer.
- **LT-BASICS, slides 20–25:** a familiar referral threshold is followed by its historical rationale and evidence questioning how broadly it should be applied.

**For a new outline:** name the plausible mistaken inference, the decisive evidence, and the corrected reasoning. Make the trap clinically useful rather than obscure trivia. Qualify simplifications and verify the medical content separately.

### 5. Return to the patient and advance time

Several talks use a patient as the organizing thread, revisiting that person after explanations or introducing complications over time.

- **CIR-25, slides 30–108:** the same patient moves through workup and multiple complications. Slide 70 explicitly recaps the accumulated problems and medications.
- **HPS-25, slides 3, 43–44, 47–48, and 69–70:** two patient scenarios connect symptoms, investigation, and transplant access.
- **PANCREATITIS, slides 3–6 and 100:** the opening case and management question return near the end.

**For a new outline:** use a continuing case when the subject naturally evolves. Include only details that influence interpretation. After a major teaching section, return to the patient with a decision or a new piece of information. Check chronology when revising or moving sections.

### 6. Teach with material the learner must interpret

The slides use laboratory tables, clinical images, anatomy diagrams, histology, algorithms, and study figures as teaching content.

- **ALI-V2:** repeated laboratory tables support comparison across cases.
- **ANATOMY-2, slides 2, 4, 6, 8, 10–12:** anatomy and circulation images lead to a pressure-measurement comparison table.
- **BOARD, slides 2–13:** embedded vignettes and clinical images alternate with explanations. Slides 20–23 and 35–39 use association prompts, summaries, and tables.
- **NEURO, slides 53–57 and 71–76:** image interpretation and anatomical identification are explicit tasks.
- **BIOPSY, slide 1:** techniques are compared across the same practical dimensions, including sedation, sample, pressures, indications, advantages, and caveats.

**For a new outline:** describe the actual visual needed and what the learner should identify in it. “Add an image” is insufficient. A useful specification is “show the same laboratory table before and after highlighting the discriminating result.”

### 7. Use evidence to answer the clinical question

The collection is not uniformly sparse or limited to board pearls. Specialist talks devote substantial space to studies, guidelines, and their limitations.

- **PANCREATITIS, slides 40–41:** a treatment comparison is followed by explicit trial limitations, including sample size and endpoints.
- **HYPO-NA, slides 45–50:** the evidence sequence labels cohort design and sample sizes.
- **NEURO, slides 42–48:** proposed treatments are followed by a statement about the limited evidence and a transplant question.
- **HPS-25, slides 66–69:** post-transplant results are followed by guideline qualifications and a return to the case.
- **INFECTIONS, slides 34–40:** risk stratification and prophylaxis evidence lead into local protocol material.

**For a new outline:** frame an evidence block around a decision. State what was studied, the outcome relevant to that decision, and the limitation that changes interpretation. Distinguish society guidance, institutional practice, limited evidence, and lecturer interpretation.

### 8. Keep the voice direct and conversational

Repeated prompts include “What's your next step?”, “Why?”, “What else?”, “How about…?”, and “Back to our patient.” Section labels can be plain, while questions supply the narrative momentum.

Examples include **HPS-25, slides 19, 27, and 43**, **CIR-25, slides 52–55**, and **AKI, slide 2**, which frames the talk as a set of clinical questions. **LT-BASICS, slide 78** explicitly distinguishes examination/guideline framing from a practical clinical nuance.

Humor is also visible: the cover of **ALI-V2**, “BAM!!” in **DIARRHEA, slide 53**, the “magic” shorthand in **HPS-25, slide 9** and **NEURO, slides 10–11**, the board deck's Daily Double image at **slide 14**, and **NEURO, slide 109**. **GI-19, slides 72–74** anticipates the audience's colonoscopy question with a joke.

**For a new outline:** use natural clinical questions and occasional humor that supports the teaching moment. Avoid turning every heading into a slogan or inserting a joke into every section. Do not attribute the wording of reproduced textbook pages to the lecturer.

### 9. Finish with practical consequences

Many closing slides emphasize decisions, mistakes to avoid, escalation, or referral.

- **PANCREATITIS, slides 100–102:** return to the opening management problem, take-home points, and recommendations.
- **DIARRHEA, slide 96:** diagnostic approach and examination reminders.
- **CIR-25, slide 109:** “Some tricks of the trade.”
- **HPS-25, slide 75**, **HYPO-NA, slide 62**, and **LT-BASICS, slide 84:** clinically oriented synthesis.

This is common, not universal. **AKI** ends with the SLK pathway and questions, **NEURO** ends with a humorous closing, and **BIOPSY** is a single comparison slide.

**For a new outline:** close by answering the opening problem and stating what the learner should recognize, investigate, do, or avoid. Use a synthesis that fits the format rather than adding an obligatory generic summary.

## Choose the appropriate lecture format

| Format | Strongest examples | Structure to preserve |
| --- | --- | --- |
| Pattern-recognition workshop | ALI-V2 | Brief conceptual foundation, repeated data-only challenges, diagnosis reveal, discriminating clues and practical consequence |
| Longitudinal clinical case | CIR-25 | Foundation, patient workup, evolving complications, successive decisions, periodic recap |
| Case plus explanatory review | PANCREATITIS, HPS-25 | Opening problem, mechanism and evidence, management choices, return to the patient |
| Specialist evidence review | HYPO-NA, AKI, INFECTIONS | Clinical questions or roadmap, physiology/risk framework, study evidence, limitations, practical pathway |
| Image and board review | BOARD, NEURO | Vignette or visual challenge, answer, explanation, distinguishing feature, related diagnostic or management question |
| Visual primer or reference | ANATOMY, ANATOMY-2, BIOPSY | Anatomical relationships or structured comparison, with a clinically useful synthesis |

A case-first opening is a strong option, not a universal requirement. Several lectures begin with definitions, physiology, a question roadmap, or historical context. Do not force every topic into a single template.

## Visual direction supported by the inspected material

The sampled covers generally use light backgrounds, prominent topic titles, and organ imagery or an occasional cartoon or meme. Some include institutional branding. Board review and anatomy have much plainer covers. There is no single universal cover treatment.

The inspected content includes both text-light diagrams and dense reference material. Source figures, comparison tables, and reproduced pages are part of the collection. The evidence does not support describing the style as uniformly minimalist or uniformly text-heavy.

For future slides, preserve the instructional function: clear questions, visible evidence, comparison, and staged explanation. Treat font, color, slide dimensions, and exact layout as choices to confirm or derive from the specific reference deck. Do not invent a universal typography system from these samples. A cleaner reconstruction of a dense source figure can be useful, but that is an improvement proposal rather than an observed historical preference.

## Specification for a new lecture outline

The following workflow is a recommended application of the observed patterns, not a claim that every existing deck follows it.

### Establish the brief

Record the topic, audience and prior knowledge, allotted time, setting, and the clinical decisions the lecture should improve. Use supplied information. Mark missing information explicitly rather than inventing it. Select the closest format from the table above.

### Build the conceptual sequence

1. **Opening problem or question roadmap.** Show the patient, finding, image, or practical uncertainty that makes the topic matter. A brief historical opening is appropriate when it helps explain the current problem.
2. **Essential foundations.** Teach the definitions, anatomy, or physiology needed to interpret that problem. Include a prediction question where it clarifies the mechanism.
3. **First decision.** Ask the learner to classify, diagnose, investigate, or choose management before showing the answer.
4. **Reasoning and contrast.** Explain the decisive clues and the most tempting alternative. Show what changes when one important finding changes.
5. **Evidence when needed.** Resolve a disputed or consequential choice with the relevant evidence and its limitations.
6. **Application or progression.** Return to the patient, advance the case, or present a contrasting case that tests transfer of the principle.
7. **Practical synthesis.** Resolve the opening question and finish with the decisions or pitfalls that should persist after the talk.

Repeat the decision/explanation/application cycle only where it adds a distinct learning task. Do not expand a brief talk simply to reproduce the slide count of a long reference deck.

### Specify each teaching beat

Use this table for the outline deliverable:

| Field | Required content |
| --- | --- |
| Section and purpose | What the learner should understand or decide here |
| Proposed slide title | A direct subject label or a natural clinical question |
| Initial display | Exactly what the learner sees before the answer |
| Audience prompt | The actual question, or “none” when a prompt adds no value |
| Reveal | Answer, new finding, annotation, or next stage of the case |
| Explanation | Mechanism, discriminating clue, or reasoning step |
| Clinical consequence | How this changes testing, treatment, prognosis, or referral |
| Visual | Specific table, image, diagram, algorithm, or study figure needed |
| Evidence | Verified source, or a clearly marked verification task |
| Transition | Why the next teaching beat follows |

If timing is requested, label proposed time allocations as estimates and check their sum. Distinguish conceptual beats from reveal slides. Do not infer speaking speed from the number of slides in these files.

### Ready-to-use authoring prompt

> Use `LECTURE_STYLE.md` to outline a lecture on [topic] for [audience] lasting [duration]. Use the verified brief and mark missing information. Select the closest lecture format from this guide. Build around clinical questions, mechanism-based explanations, and diagnostic or management decisions. Specify what appears before each answer and what is revealed afterward. Include plausible reasoning traps, purposeful visuals, and a return to the case when appropriate. Use evidence to resolve consequential choices and state its limitations. Keep the wording conversational and direct. End with practical consequences. Separate observed style from new design proposals. Produce an outline before writing a full deck. Verify clinical claims against current primary sources and cite articles as [PMID: XXXXXXX] only after verifying the PMID. Never invent a citation, case provenance, threshold, or guideline recommendation.

## Checks before accepting an outline

- The format fits the topic and audience rather than mechanically copying one deck.
- Questions require a meaningful interpretation or decision.
- The outline identifies what remains hidden until the reveal.
- Mechanisms explain clinical findings or choices.
- At least the central reasoning trap is explicit where the topic supports one.
- Visuals have a defined teaching task.
- Evidence strength, institutional practice, and uncertainty remain distinguishable.
- Case chronology remains coherent after section changes.
- The conclusion resolves the opening problem or question roadmap.
- No historic statement is treated as verified current guidance merely because it appears in a source lecture.
- Borrowed prose and visual design are not mistaken for the lecturer's own wording or a mandatory template.

## Source index

Slide references above use the one-based position in the PowerPoint slide order, including any hidden slides, rather than relying on printed footer numbers. Links below point to the exact inspected commit.

| ID | Source deck | Slides |
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

### Version handling

The two cirrhosis files have the same slide count and substantial shared material, with changes in the ordering/content of the later case sequence. The 2025 HPS/POPH file adds post-transplant outcome and guideline material to the shared core of the other version. The anatomy versions differ by an additional visual slide before the pressure table. These pairs strengthen evidence that structures are reused, but should not be counted as independent confirmations of every style trait.

The two acute liver injury files show different implementations: a broad, extended review in the dated 2020 file and a compact laboratory-pattern workshop in V2. V2 has no verified presentation date here, so this guide does not infer a chronological evolution of the lecturer's style from its filename.
