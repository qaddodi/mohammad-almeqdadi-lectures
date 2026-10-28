# Humanizer

Every word and every slide in a lecture should look like Mohammad made it. Run this pass on every build and every edit, after the content is right and before the deck goes to him.

Style rules are in [MY_STYLE.md](MY_STYLE.md). How to build a deck is in [AUTHOR_GUIDE.md](AUTHOR_GUIDE.md). This file is the checklist for the last read-through. When Mohammad sets a new correction, add it here and to MY_STYLE.md.

## The test

Read each line out loud as if you were presenting it on rounds. If it sounds like a press release, a study guide or a chatbot, rewrite it the way he would say it to a fellow. If he would never say it, it doesn't go on the slide.

## Writing

### Write it like this

- Plain clinical wording. Say the point the way he would at the bedside: "A rising INR, rising lactate and worse encephalopathy mean she is getting worse."
- Short questions carry the talk: "What's your next step?", "Why?", "What else?"
- Real numbers, drug names, doses and thresholds instead of abstractions.
- Vary sentence length. Use a fragment where a speaker would.
- Say the opinion plainly ("I'd start CRRT here") when he would.
- Slides are sparse. The talking goes in the speaker notes: what to ask, what answer to wait for, the trap, the source for every number.

### Never write this

- **Slogans, aphorisms and clever closers.** No punchlines, no lines that sound good and say nothing ("running out of liver", "look again tomorrow"). Ask: would Mohammad say this on rounds? If the answer is "I'd never write like this", cut it or say the plain version.
- **Cliché section titles.** "Two patients, same ICU" and anything built like a magazine headline is out. Name the section for what happens in it: "Bed 4, 28F, 4 days of nausea".
- **AI words:** delve, crucial, pivotal, robust, leverage, landscape, tapestry, navigate, realm, multifaceted, seamless, underscore, showcase.
- **Stock openers and closers:** "Let's dive in", "In today's fast-paced world", "In conclusion", "Key takeaways", a closing slide that repeats the deck.
- **Em-dash chains.** Use a period or a comma. At most an occasional single dash.
- **Emoji**, anywhere.
- **"Not X, it's Y" and "not only X but also Y"** constructions.
- **Rule-of-three lists** written by reflex.
- **A bolded lead-in on every bullet**, and bullet lists where every line has the same length and the same grammar.
- **Hedge stacks** ("may potentially help") and committee wording copied from a guideline. Say what the study found, then the limit.
- **Question headings that answer themselves** in every section.
- **Spoilers in the wording** (titles, objectives, section pages). See the no-spoilers list in MY_STYLE.md.
- **Time of day** ("tonight", "night shift", "this afternoon"). Use Hour 0, Hour 12, Day 2.
- **An audience line** on the cover or anywhere else.
- **"Transfer to a transplant center".** Tufts is a liver transplant center: "call transplant hepatology".

### Rewrite examples

| Sounds generated | Sounds like him |
|---|---|
| No score writes the withdrawal order | If he is not a transplant candidate, discuss goals of care with the family and involve palliative care |
| She is running out of liver | A rising INR, rising lactate and worse encephalopathy mean she is getting worse |
| You dialyze the ammonia, not the creatinine | In ALF, start CRRT for the ammonia |
| Kidney response is not the same endpoint as living | 90-day mortality was not different |
| Not one after the other | All three start in the first hour |
| Two patients, same ICU | Bed 4 and Bed 7 |

### Humor

Light and occasional, only where it helps a teaching moment ("BAM!!", "I know what you're thinking..."). Don't add jokes to fill space, and don't add one to every section.

## Design

The slides should look like they came out of his old decks, not out of a slide generator. Copy the old decks first: template, fonts, colors, title placement, density.

### Do

- White background. Georgia for text, Calibri in tables and charts. Black text, one accent used only to mark what matters: yellow highlight on the revealed answer, red for abnormal values or the harmful bar.
- Let the layout follow the content: a lab table, one question on an almost empty slide, a CT, a two-column comparison, a paper figure. Some slides should be mostly white space.
- Real clinical visuals: tables with real values and units, charts redrawn from the paper's numbers, paper screenshots, his own images, his earlier decks' figures.
- Each reveal is a new slide, not an animation on a crowded one.
- Pictures large, trimmed of blank margins, never a thumbnail in a corner.

### Never

- Purple or blue gradients, glow, glassmorphism, neon on dark.
- Icon-per-bullet grids, rounded cards in rows of three or four, numbered-circle agendas, accent stripes, drop shadows.
- The same title-plus-cards layout on every slide.
- Stock tech illustrations, abstract blobs, decorative filler pictures, decorative emoji.
- Many fonts, or color used for decoration instead of meaning.
- Text-only slides.
- PowerPoint transitions or animations.

## The pass, step by step

1. Go through the deck slide by slide, then the speaker notes. Check each line against the lists above.
2. Rewrite what fails in his voice. Don't patch with synonyms; say it again plainly.
3. Flip through the finished slides quickly. If any slide looks like a generator template, simplify it until it looks like his own work.
4. Grep the build file and notes for the usual offenders: em-dashes, emoji, the AI words above, "tonight", "transfer to a transplant".
5. Tell Mohammad in the handoff that the humanizer pass was done, and list anything you weren't sure about.
