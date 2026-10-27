// ---------------------------------------------------------------- Helpers for this deck
// Small grey label naming the part of the talk, top left (no section pages in a 20-minute talk)
function lab(s, t) {
  s.addText(t, { x: 0.35, y: 0.08, w: 4, h: 0.3, fontFace: "Georgia", fontSize: 11, color: "8C8C8C", isTextBox: true, margin: 0, objectName: "Part" });
}
// Sub-line under the title: the question, or the answer in yellow on the reveal step
function sub(s, text, o = {}) {
  s.addText(text, { x: 0.9, y: o.y || 1.12, w: W - 1.8, h: 0.5, fontFace: "Georgia", fontSize: o.size || 22, bold: !!o.b,
    align: "center", valign: "middle", color: "000000", isTextBox: true, margin: 0, highlight: o.hl ? HL : undefined, objectName: "Sub" });
}
const MOCK = "Mock-up with invented data, not a real patient or a real screen";
// Single-series-looking bar chart where one bar can be black and the rest grey: two stacked series, zeros hidden
function bars2(s, cats, vals, hiIdx, o) {
  const a = vals.map((v, i) => (i === hiIdx ? 0 : v)), b = vals.map((v, i) => (i === hiIdx ? v : 0));
  const show = !o.empty;
  s.addChart(pres.charts.BAR, [{ name: "a", labels: cats, values: show ? a : a.map(() => 0) }, { name: "b", labels: cats, values: show ? b : b.map(() => 0) }], {
    x: o.x, y: o.y, w: o.w, h: o.h, barDir: o.dir || "col", barGrouping: "clustered", barGapWidthPct: 55, barOverlapPct: 100, chartColors: ["9DB4CA", "1F4E79"],
    valAxisMinVal: o.min || 0, valAxisMaxVal: o.max, valAxisMajorUnit: o.unit, valAxisLabelFormatCode: o.axFmt || "0",
    valGridLine: { color: "E3E3E3", size: 0.5 }, catGridLine: { style: "none" }, valAxisHidden: !!o.hideVal,
    catAxisLabelFontFace: TBL_FONT, valAxisLabelFontFace: TBL_FONT, catAxisLabelFontSize: o.catSize || 16, valAxisLabelFontSize: 12,
    catAxisLabelColor: "000000", valAxisLabelColor: GREY,
    showValue: show, dataLabelFormatCode: o.fmt || '0.0;-0.0;;', dataLabelFontSize: o.labSize || 16, dataLabelFontFace: TBL_FONT,
    dataLabelColor: "000000", dataLabelFontBold: true, dataLabelPosition: o.pos || "outEnd",
    showValAxisTitle: !!o.valTitle, valAxisTitle: o.valTitle, valAxisTitleFontSize: 13, valAxisTitleColor: GREY, valAxisTitleFontFace: TBL_FONT,
    showLegend: false,
  });
}

// ---------------------------------------------------------------- Cover
sec("Opening");
{
  const s = pres.addSlide({ masterName: "BLANK", sectionTitle: section });
  s.addImage({ path: path.join(IMG, "cover-ehr-workstation.jpg"), x: -0.05, y: 0, w: 13.43, h: 7.5, altText: "Watercolor of a clinic workstation with two monitors and a coffee cup" });
  const tx = 0.5, tw = 6.6;
  s.addText([
    { text: "Epically Efficient", options: { fontSize: 40, breakLine: true } },
    { text: "Electronic Health Record Tools", options: { fontSize: 27, breakLine: true } },
    { text: "to Improve Your Practice", options: { fontSize: 27 } },
  ], { x: tx, y: 1.0, w: tw, h: 2.2, fontFace: "Georgia", bold: true, align: "center", valign: "middle", color: "000000", isTextBox: true, margin: 0 });
  s.addShape(pres.shapes.LINE, { x: tx + 1.4, y: 3.55, w: tw - 2.8, h: 0, line: { color: "A6A6A6", width: 1 } });
  s.addText([
    { text: "Mohammad Almeqdadi, MD", options: { bold: true, fontSize: 20, breakLine: true } },
    { text: "Transplant Hepatologist and Gastroenterologist", options: { fontSize: 16, breakLine: true } },
    { text: "Assistant Professor of Medicine and Surgery", options: { fontSize: 16, breakLine: true } },
    { text: "X: @mfalmeqdadi", options: { fontSize: 16, color: "595959" } },
  ], { x: tx, y: 3.85, w: tw, h: 1.6, fontFace: "Georgia", align: "center", valign: "top", color: "000000", isTextBox: true, margin: 0, paraSpaceAfter: 4 });
  s.addImage({ path: path.join(IMG, "tufts-logo.png"), x: tx + (tw - 3.79) / 2, y: 5.75, w: 3.79, h: 0.77, altText: "Tufts University School of Medicine" });
  s.addText("Illustrations generated with Google Gemini", { x: 0.4, y: 7.0, w: 5, h: 0.3, fontFace: "Georgia", fontSize: 11,
    italic: true, color: "7F7F7F", isTextBox: true, margin: 0 });
  s.addNotes("20 minutes, 10:10 to 10:30. Emily has already said why this session exists, so no burnout slides up front. Nizar covers ambient documentation in depth, so I only touch it once. Show and tell, no live demo. Every screen in this talk is a mock-up with made-up data.");
}

LOGICAL = 0; // the cover is not counted

// 1 Disclosures
{
  const s = slide("Disclosures");
  s.background = { path: path.join(IMG, "disclosures-background.jpg") };
  body(s, [
    "No relevant financial relationships",
    "No relationship with Epic Systems",
    "Every screen in this talk is a mock-up with invented data. None of it is a real patient or a real Epic screen",
  ], { x: 0.9, w: 7.0, y: 1.9, h: 4.2, size: 24, gap: 18 });
  s.addNotes("Quick. The point to make: the screens look like Epic so you recognize them, but I drew them. No patient data anywhere.");
}

// 2 Objectives, on a full-slide watercolor with the text on the plain left side
{
  const s = slide("Objectives");
  s.background = { path: path.join(IMG, "objectives-background.jpg") };
  body(s, [
    "Find what you need in the chart faster",
    "Spend less time on notes, orders and the In Basket",
    "Know which AI tools are live and what the evidence shows",
    "Measure your own EHR time",
  ], { x: 0.9, w: 6.6, y: 1.7, h: 4.8, size: 24, gap: 18 });
  s.addNotes("Four things. We'll follow one new referral through the chart, then the In Basket, then the AI tools, then how to see your own numbers.");
}

// 3 Why Epic?
twoStep((step) => {
  const s = slide("Why Epic?");
  sub(s, "What share of US transplants were done at a center using Epic's transplant module?", { size: 20 });
  bars2(s, ["2024", "2025"], [82, 86], 1, { x: 2.4, y: 1.8, w: 8.5, h: 4.75, max: 100, unit: 25, axFmt: '0"%"', fmt: '0"%";;;', empty: step === 1, labSize: 24, catSize: 20 });
  if (step === 2) {
    s.addText([{ text: "86%", options: { highlight: HL, bold: true } }, { text: " in 2025, and another 6% at centers implementing it" }],
      { x: 0.9, y: 6.45, w: W - 1.8, h: 0.45, fontFace: "Georgia", fontSize: 20, align: "center", color: "000000", isTextBox: true, margin: 0 });
  }
  src(s, "Epic UGM 2025, source OPTN. 48,137 US transplants in 2024; 49,064 in 2025. Epic's transplant module is called Phoenix");
  s.addNotes("Ask the room to guess. Most guess around half. 82% of US transplants in 2024 and 86% in 2025 were done at a center on Phoenix, and another 6% are at centers implementing it. So most hepatologists in this room work in Epic, and that's why the tool names in this talk are Epic's. Source: Epic UGM 2025 transplant breakout, data from OPTN.");
  return s;
});

// 4 And everyone else?
{
  const s = slide("And everyone else?");
  bars2(s, ["Epic", "Oracle Health", "Meditech", "All others"], [36, 25, 16, 23], 0, { x: 0.6, y: 1.35, w: 7.0, h: 5.2, max: 50, unit: 10, axFmt: '0"%"', fmt: '0"%";;;', catSize: 15, labSize: 18, valTitle: "US hospitals" });
  body(s, [
    "Most of these tools have a version in the other systems",
    "VA: CPRS. VA GPT is a general chat tool approved for PHI, used by over 15,000 staff. It is not built into CPRS",
  ], { x: 7.9, w: 4.9, y: 1.7, h: 4.6, size: 20, gap: 16 });
  src(s, "KLAS via Becker's Hospital Review, 2022 (share of US hospitals). VA OIG report 26-00182-140, June 2026");
  s.addNotes("One fair sentence on the others; no jokes about anyone's system. The ideas carry over even when the names don't. VA GPT came up in our planning call as a CPRS tool. It isn't: the VA OIG reviewed it in June 2026 as a general chat tool approved for PHI, separate from CPRS. The VA ambient scribe is a separate pilot.");
}

// 5 A good historian (pause slide on the watercolor)
sec("Finding information");
twoStep((step) => {
  const s = pres.addSlide({ masterName: "BLANK", sectionTitle: section });
  s.addImage({ path: path.join(IMG, "historian-bedside-desk.jpg"), x: -0.05, y: 0, w: 13.43, h: 7.5, altText: "Watercolor of a doctor at a patient's bedside and the same doctor at a computer" });
  s.addText("We used to call the resident who got the whole story from the patient a good historian.", { x: 0.8, y: 5.55, w: W - 1.6, h: 0.5,
    fontFace: "Georgia", fontSize: 22, align: "center", color: "000000", isTextBox: true, margin: 0 });
  if (step === 2) s.addText("Today that resident also knows where everything is in the chart.", { x: 0.8, y: 6.15, w: W - 1.6, h: 0.5,
    fontFace: "Georgia", fontSize: 22, bold: true, align: "center", color: "000000", isTextBox: true, margin: 0 });
  s.addNotes("I say this to my trainees all the time. Taking a history from the patient is still the job. But half of the history now lives in the chart, and the person who knows where to find it saves everyone time.");
  return s;
});

// 6 New referral
twoStep((step) => {
  const s = slide("New referral");
  lab(s, "Finding information");
  sub(s, "58M with cirrhosis. 14 years of records, 312 outside documents. 10 minutes before you walk in.", { size: 19 });
  pic(s, "records-stack.png", 0.7, 1.8, 5.2, 5.0, "Watercolor of a tall stack of outside medical records");
  q(s, "What do you want to know?", 1.95, { x: 6.4, w: 6.3, size: 24 });
  if (step === 2) body(s, ["Where his MELD is going", "Was the etiology workup done?", "Last imaging (HCC surveillance)", "Last EGD (varices)",
    "Current liver meds", "Is he still drinking?"], { x: 6.9, w: 5.8, y: 2.7, h: 4.1, size: 22, gap: 10 });
  s.addNotes("Ask the room and wait for two or three answers before going to the list. This made-up patient, ZZTEST, LIVER, carries the talk. The next five slides find each item on the list.");
  return s;
});


// Whole Synopsis view, scrolled: one slide per screenful, all under one slide number
function fullView(title, files, notes) {
  files.forEach((f, i) => {
    if (i > 0) cont();
    const s = slide(title);
    if (files.length === 1) {}
    lab(s, "Finding information");
    s.addText(`Scrolling, ${i + 1} of ${files.length}`, { x: W - 3.4, y: 0.08, w: 3.05, h: 0.3, fontFace: "Georgia", fontSize: 11, color: "8C8C8C", align: "right", isTextBox: true, margin: 0 });
    pic(s, f, 0.4, 1.2, W - 0.8, 5.65, "Mock Synopsis view, screenful " + (i + 1));
    src(s, MOCK + ". Built from our transplant center's views");
    s.addNotes(notes);
  });
}
// Our three views, and how to get them
{
  const s = slide("We built three Synopsis views. You can too");
  lab(s, "Finding information");
  const v = [["thumb-pre.png", "Liver disease"], ["thumb-workup.png", "CLD workup"], ["thumb-post.png", "After transplant"]];
  const cw = 3.95, gap = 0.25, x0 = (W - 3 * cw - 2 * gap) / 2;
  v.forEach(([f, t], i) => {
    const x = x0 + i * (cw + gap);
    const r = pic(s, f, x, 1.35, cw, 4.1, "Mock Synopsis view: " + t);
    s.addText(t, { x, y: r.y + r.h + 0.1, w: cw, h: 0.4, fontFace: "Georgia", fontSize: 18, bold: true, align: "center", color: "000000", isTextBox: true, margin: 0 });
  });
  s.addText("Start from one of Epic's Synopsis views, then sit with your Epic analyst and add the sections you look for every day", { x: 0.9, y: 6.1, w: W - 1.8, h: 0.6,
    fontFace: "Georgia", fontSize: 19, align: "center", color: "000000", isTextBox: true, margin: 0 });
  src(s, MOCK + ". Epic Synopsis Setup and Support Guide, 2026");
  s.addNotes("We built three views at our center: a liver disease view for cirrhosis over time, one for the chronic liver disease workup that shows the most recent value of every etiology test in the last 20 years, and one for after transplant. Epic ships a cirrhosis view, built with its Hepatology Specialty Steering Board, that your analyst can import; we started there and kept adding sections. You can do the same: it's a build request, not a product purchase.");
}

fullView("Our liver disease view", ["full-pre-1.png", "full-pre-2.png", "full-pre-3.png"],
  "One screen, scrolled; the date row stays at the top. Click through quickly. Sections, top to bottom: transplant status, vitals, scores (MELD 3.0, Child-Pugh, Fib-4, APRI, NAFLD fibrosis, AST:ALT), hematology, chemistry, other labs, ascitic fluid, blood products, micro, anti-infectives, liver meds, other meds, imaging, cardiac testing, procedures, urine and stool output, dialysis, toxicology (PEth, drug screen). Meds are bars over time so you see when a dose changed.");

// 7 Liver disease view, zoomed
twoStep((step) => {
  const s = slide("Our liver disease view");
  lab(s, "Finding information");
  if (step === 1) sub(s, "Where is his MELD going?");
  else sub(s, "MELD 3.0 went from 9 to 24 in a year, with the creatinine rising", { hl: true, size: 20 });
  pic(s, step === 1 ? "synopsis-cirrhosis.png" : "synopsis-cirrhosis-hl.png", 0.9, 1.7, W - 1.8, 5.2, "Mock Synopsis liver disease view with scores, labs and liver medications over a year");
  src(s, MOCK);
  s.addNotes("Same view, the rows that matter for this visit. Ask the room where the MELD is going, then show the row. Also point at the diuretics going up and carvedilol stopped when the pressure dropped. With Phoenix the view can also show the MELD last reported to UNOS.");
  return s;
});

// 8 CLD workup view
twoStep((step) => {
  const s = slide("Our chronic liver disease workup view");
  lab(s, "Finding information");
  if (step === 1) sub(s, "Was the workup done?");
  else sub(s, "No HBV core antibody or HFE, HBsAb negative, and metabolic risk", { hl: true, size: 20 });
  const f = step === 1 ? "full-workup" : "full-workup-hl";
  pic(s, f + "-1.png", 0.6, 1.7, 5.95, 5.15, "Mock chronic liver disease workup view, part 1", { left: true });
  pic(s, f + "-2.png", 6.75, 1.7, 5.95, 5.15, "Mock chronic liver disease workup view, part 2", { left: true });
  src(s, MOCK);
  s.addNotes("The most recent value of each test in the last 20 years, with its date; a dash means never done. Sections: transplant (ABO), scores, hepatitis, hemochromatosis, autoimmune, alpha-1, Wilson, MASLD (weight, BMI, A1c, fasting glucose, lipids), biopsies, cardiac and imaging. Ask: was the workup done? Gaps: HBV core antibody and HFE never sent, HBsAb negative so he needs the vaccine, and the MASLD section shows A1c 6.1, high triglycerides and low HDL. This took a minute instead of digging through 14 years of results.");
  return s;
});

fullView("Our post-transplant view", ["full-post-1.png", "full-post-2.png", "full-post-3.png"],
  "A different made-up patient, 9 months after transplant. Same order as our real view: vitals, then immunosuppression with the tacrolimus levels right under the doses, transplant immunology, anti-infectives, infection monitoring (CMV), then chemistry with PEth, hematology, toxicology and the rest of the meds. Our post-transplant clinic opens this first: dose changes line up with the levels and the creatinine.");

// 10 Chart search
{
  const s = slide("Chart search");
  lab(s, "Finding information");
  pic(s, "chart-search.png", 0.6, 1.25, W - 1.2, 5.0, "Mock chart search for EGD with a preview of the procedure note");
  s.addText("Searches notes, results, media and outside records. Hover to read. Save the searches you repeat.", { x: 0.9, y: 6.3, w: W - 1.8, h: 0.5,
    fontFace: "Georgia", fontSize: 19, align: "center", color: "000000", isTextBox: true, margin: 0 });
  src(s, MOCK + ". Epic chart search tip sheet, 2026");
  s.addNotes("Last EGD: type EGD. The 2023 outside EGD shows up and the hover preview gives small varices without opening anything. Favorite searches I keep: EGD, MRI, biopsy, PEth. You can also type Synopsis or an order set name in the same bar to jump straight there.");
}

// 10b Chart search does more (from the Epic Specialist Spotlight video)
[["cs-related.png", "Type hepatitis b: it also offers entecavir and tenofovir",
  "Mock chart search for hep B showing related medications, results and problems",
  "Related terms. I type hepatitis b and it suggests the core and surface antibodies and also his entecavir and tenofovir. The spotlight card shows the latest result without opening anything. Results show up before you press Enter; press Enter for the full list. Quotation marks give the exact word only, and AND / OR work too."],
 ["cs-trend.png", "Type trend alt 10 years: the graph opens in the search box",
  "Mock chart search for ALT with a 10-year trend graph",
  "Trends. Steatotic liver disease follow-up: type trend alt 10 years and the graph is right there. You can switch to 5 years or 1 year, and trend two labs together, like ALT and AST. Was it ever elevated? Yes, up to 71 in 2018, and normal now after weight loss. Works for labs and vitals, weight included."],
 ["cs-ocr.png", "Scanned faxes are searchable too: it reads the text (OCR)",
  "Mock chart search for elastography finding the words inside a scanned outside fax, highlighted in a preview",
  "Scanned documents. Chart search reads the text of scanned documents with OCR, so the outside referral fax is searchable. Hover and you see the page with the words highlighted: his 2024 FibroScan, 12.4 kPa, was only in a fax. Your organization has to turn this on, and it reads documents scanned in the last two years when it starts, so ask your Epic team if yours is on."],
 ["cs-math.png", "Ursodiol for PBC: 80 kg x 13 mg/kg, typed straight in",
  "Mock chart search doing the calculation 80 x 13 = 1,040",
  "Math. Ursodiol for PBC at 13 to 15 mg/kg. I type 80x13 and get 1,040 mg, with a button to copy the answer. No calculator. It does unit conversions too, like pounds to kilograms."]].forEach(([f, line, alt, note]) => {
  cont();
  const s = slide("Chart search does more");
  lab(s, "Finding information");
  pic(s, f, 0.9, 1.25, W - 1.8, 4.95, alt);
  s.addText(line, { x: 0.9, y: 6.3, w: W - 1.8, h: 0.5,
    fontFace: "Georgia", fontSize: 20, align: "center", color: "000000", isTextBox: true, margin: 0 });
  src(s, MOCK + ". Epic Specialist Spotlight: Search Tips for Hepatologists, November 2025; Epic Assistant Bar and Chart Search Setup and Support Guide, 2026");
  s.addNotes(note);
});

// 11 Chart Review quick filters, outside notes in the same list
[[0, "Notes tab, no filter: 214 notes",
  "Mock Chart Review Notes tab showing all 214 notes, quick filter buttons above the list",
  "Chart Review, Notes tab, no filter: 214 notes, phone calls, nursing, other clinics. Scrolling this before every visit is where the time goes. The buttons above the list are quick filters."],
 [1, "One click on our Hepatology quick filter: 7 notes, outside ones included",
  "Mock Chart Review Notes tab with a Hepatology quick filter applied, 7 notes, four from outside organizations",
  "Same list with our Hepatology quick filter on: hepatology notes, GI procedures, imaging and pathology. The green CE icon marks notes from other organizations through Care Everywhere, so his outside MRI with the LI-RADS 3 observation and the 2019 biopsy sit in the same list. You can build your own quick filter from Chart Review in a minute, or ask your analyst to make one for the whole division."]].forEach(([k, line, alt, note], i) => {
  if (i) cont();
  const s = slide("Chart Review quick filters");
  lab(s, "Finding information");
  pic(s, `chart-review-${k}.png`, 0.9, 1.25, W - 1.8, 4.95, alt);
  s.addText(line, { x: 0.9, y: 6.3, w: W - 1.8, h: 0.5,
    fontFace: "Georgia", fontSize: 20, align: "center", color: "000000", isTextBox: true, margin: 0 });
  src(s, MOCK + ". Epic Chart Review Setup and Support Guide, 2026");
  s.addNotes(note);
});

// 12 SmartPhrases
sec("Notes and orders");
twoStep((step) => {
  const s = slide("SmartPhrases");
  lab(s, "Notes and orders");
  pic(s, `note-smartphrase-${step}.png`, 0.4, 1.3, 8.4, 5.55, step === 1 ? "Mock note with a SmartPhrase being typed" : "Mock note after the SmartPhrase expanded, with linked data");
  if (step === 2) body(s, [
    "Blue fields are pulled from the chart",
    "{ } lists are one click",
    "*** has to be filled before you sign",
    "Share yours with colleagues, or use theirs",
  ], { x: 9.0, w: 3.9, y: 1.6, h: 5.0, size: 19, gap: 14 });
  src(s, MOCK + ". Epic SmartTools Setup and Support Guide, 2026; Epic, How to Personalize Epic");
  s.addNotes("Type the dot phrase, pick it, and the plan writes itself with today's MELD, last imaging and last EGD pulled in. I won't spend long on notes: Nizar covered the AI side. Trap: copy-forward carries old numbers, SmartLinks don't. Ask a colleague to share theirs from the SmartPhrase Manager; you don't have to build from scratch. Since February 2026 you can preview a SmartPhrase against a real chart before using it.");
  return s;
});

// 13 Orders
{
  const s = slide("Orders");
  lab(s, "Notes and orders");
  const a = pic(s, "order-search.png", 0.4, 1.3, 6.6, 4.85, "Mock order search showing personal preference list sections and a Follow Users button");
  const b = pic(s, "order-set.png", 7.3, 1.3, 5.6, 4.85, "Mock order set for a new cirrhosis visit, saved as a personal version");
  s.addText("Star an order to put it on your preference list. Follow up to 3 colleagues' lists.", { x: 0.4, y: a.y + a.h + 0.15, w: 6.6, h: 0.75, fontFace: "Georgia", fontSize: 18, align: "center", color: "000000", isTextBox: true, margin: 0 });
  s.addText("Save your own version of an order set", { x: 7.3, y: b.y + b.h + 0.15, w: 5.6, h: 0.45, fontFace: "Georgia", fontSize: 18, align: "center", color: "000000", isTextBox: true, margin: 0 });
  src(s, MOCK + ". Epic Preference Lists Setup and Support Guide, 2026; Epic, How to Personalize Epic");
  s.addNotes("Preference list: click the star on any order, or right-click it, and it goes into your own list in the section you pick. Follow Users on the Browse tab lets you use a colleague's lists, up to three people, so one person in the division builds it and everyone follows. Every new cirrhosis visit gets the same labs and ultrasound: save it once as your version of the order set. Safety point: check the encounter before signing; inpatient orders placed under a clinic visit don't reach the floor.");
}

// 14 How many messages?
sec("In Basket");
twoStep((step) => {
  const s = slide("After March 2020");
  lab(s, "In Basket");
  sub(s, "Which group's EHR time grew most after March 2020?", { size: 20 });
  bars2(s, ["Primary care", "Medical subspecialists", "Surgeons"], [6.5, 9.9, 5.2], 1, { x: 1.9, y: 1.8, w: 9.5, h: 4.3, max: 12, unit: 3, axFmt: '0"%"', fmt: '+0.0"%";;;', empty: step === 1, labSize: 22, catSize: 18, valTitle: "Change in EHR hours per week" });
  if (step === 2) s.addText("Patient messages jumped in March 2020 and stayed high. Phone calls went back to baseline.",
    { x: 0.9, y: 6.2, w: W - 1.8, h: 0.5, fontFace: "Georgia", fontSize: 19, align: "center", color: "000000", isTextBox: true, margin: 0 });
  src(s, "Holmgren AJ et al. JAMA Intern Med 2025;185:461-3. Epic Signal data, 280,712 physicians, 2019 to 2022 [PMID: 39992635]");
  s.addNotes("Hepatology sits with the medical subspecialists: EHR time up about 10%. Primary care went from 10.6 to 11.3 hours a week. The messages did not replace phone calls; the calls came back and the messages stayed. Limits: one vendor, no burnout measure.");
  return s;
});

// 15 In Basket tools
{
  const s = slide("In Basket tools");
  lab(s, "In Basket");
  pic(s, "inbasket.png", 0.6, 1.25, W - 1.2, 4.95, "Mock In Basket with a normal AFP result and QuickAction buttons");
  s.addText("QuickActions for normal results, result notes from a SmartPhrase, out of contact when you're away", { x: 0.9, y: 6.25, w: W - 1.8, h: 0.5,
    fontFace: "Georgia", fontSize: 19, align: "center", color: "000000", isTextBox: true, margin: 0 });
  src(s, MOCK + ". Epic In Basket Guide for Providers");
  s.addNotes("A normal AFP: one click sends the MyChart letter, done. Build three or four QuickActions for the results you see every day. Result notes come from a SmartPhrase so the wording is the same each time. Set out of contact and a delegate before vacation, not after.");
}

// 16 What's live
sec("AI in the chart");
{
  const s = slide("AI tools in Epic");
  lab(s, "AI in the chart");
  table(s, [
    ["Tool", "What it does", "Epic version"],
    ["In Basket drafts", "Drafts a reply to a patient message", "Nov 2023"],
    ["Insights", "Summarizes recent notes before a visit", "Feb 2025"],
    ["Synopsis Insights", "Shows why a medication was changed", "Aug 2025"],
    ["Chart with Art", "Drafts the note from the visit conversation", "May 2026"],
    ["Ask Art", "Answers questions about the chart", "May 2026"],
    ["Chart with Art for orders", "Queues orders from the conversation", "Aug 2026"],
  ], { x: 1.0, y: 1.5, w: W - 2.0, size: 20 });
  s.addText("What you have depends on your organization's version and what it turned on", { x: 0.9, y: 5.75, w: W - 1.8, h: 0.5,
    fontFace: "Georgia", fontSize: 19, italic: true, align: "center", color: "000000", isTextBox: true, margin: 0 });
  src(s, "Epic Generative AI Feature Library, 2026. Art is Epic's AI for clinicians");
  s.addNotes("These are the ones a hepatologist will touch. Version is the Epic release where it became generally available; your system may be a release or two behind, and some need to be requested from Epic. Ask your informatics team which ones are on. Every suggestion still needs your review and signature.");
}

// 17 Do AI drafts save time?
function draftsStep(step) {
  const s = slide("Do AI drafts save time?");
  lab(s, "AI in the chart");
  const a = pic(s, "taiseale-title.png", 1.6, 1.25, W - 3.2, 2.0, "Tai-Seale et al., JAMA Network Open 2024: title");
  bars2(s, ["Time reading", "Time replying (NS)", "Reply length"], [21.8, -5.9, 17.9], 1, { x: 2.4, y: a.y + a.h + 0.15, w: 8.5, h: 3.45, min: -10, max: 30, unit: 10, axFmt: '0"%"', fmt: '+0.0"%";-0.0"%";;', labSize: 18, catSize: 16, pos: "outEnd" });
  src(s, "Tai-Seale M et al. JAMA Netw Open 2024;7:e246565. 52 primary care physicians, UC San Diego. Reply time change not significant (P=.33)");
  s.addNotes("Randomized waiting-list study, 2023, drafts built into Epic. Reading time went up 22%, reply time did not change significantly, and replies got 18% longer. Physicians still liked them as a kinder starting point. The 30 seconds saved per message you'll hear from Mayo comes from Epic's own material, not a trial. So: worth trying, but don't expect your In Basket to empty itself.");
  return s;
}
draftsStep(2);

// 18 Ambient notes
{
  const s = slide("Ambient notes");
  lab(s, "AI in the chart");
  table(s, [
    ["", "Time in notes vs usual care", "Burnout scores"],
    ["Nabla", { t: "9.5% less (P=.02)", b: true }, "Small improvement"],
    ["DAX", "No significant change", "Small improvement"],
  ], { x: 1.6, y: 1.9, w: W - 3.2, size: 22 });
  s.addText("Nizar covered this in detail", { x: 0.9, y: 4.4, w: W - 1.8, h: 0.5, fontFace: "Georgia", fontSize: 22, italic: true, align: "center", color: "000000", isTextBox: true, margin: 0 });
  src(s, "Lukac PJ et al. UCLA randomized trial of two ambient scribes, medRxiv 2025 (preprint; check the NEJM AI version before quoting)");
  s.addNotes("One slide only, because Nizar went through it. The UCLA trial randomized clinicians to two ambient tools or usual care. One cut note time by about 10%, the other didn't change it, and both helped burnout scores a little. Cut this slide if running long.");
}

// 19 For transplant teams
{
  const s = slide("For transplant teams");
  lab(s, "AI in the chart");
  const a = pic(s, "committee-insights.png", 0.4, 1.3, 6.3, 4.45, "Mock AI summary of concerns for transplant committee review, with references");
  const b = pic(s, "meld-submit.png", 6.9, 1.3, 6.0, 4.45, "Mock list of waitlisted patients with new labs ready to submit to UNOS");
  s.addText("Committee prep: 15 to 5 minutes per case", { x: 0.4, y: a.y + a.h + 0.2, w: 6.3, h: 0.45, fontFace: "Georgia", fontSize: 18, align: "center", color: "000000", isTextBox: true, margin: 0 });
  s.addText("MELD labs to UNOS in bulk: 100 hours a year", { x: 6.9, y: b.y + b.h + 0.2, w: 6.0, h: 0.45, fontFace: "Georgia", fontSize: 18, align: "center", color: "000000", isTextBox: true, margin: 0 });
  src(s, MOCK + ". Time savings are Epic's own estimates per transplant center (Epic UGM 2025), not studies");
  s.addNotes("Two Phoenix tools. Insights for committee review drafts the concerns for selection committee with a link to every source note; Epic estimates prep drops from 15 to 5 minutes. MELD lab submission checks which waitlisted patients have new labs and sends them to UNOS together; Epic estimates 100 coordinator hours a year for a center with about 60 liver patients listed. These are vendor numbers.");
}

// 20 Where does the time go?
sec("Measure yourself");
twoStep((step) => {
  const s = slide("Where does the time go?");
  lab(s, "Measure yourself");
  sub(s, "For every 8 hours of scheduled patient care, how many hours in the EHR?", { size: 20 });
  const cats = ["Patient care", "In the EHR"];
  const z = (v) => (step === 1 ? 0 : v);
  const series = [
    { name: "Scheduled patient care", labels: cats, values: [8, 0] },
    { name: "Notes", labels: cats, values: [0, z(2.3)] },
    { name: "Chart review", labels: cats, values: [0, z(1.1)] },
    { name: "Orders", labels: cats, values: [0, z(0.8)] },
    { name: "In Basket", labels: cats, values: [0, z(0.8)] },
    { name: "Other", labels: cats, values: [0, z(0.8)] },
  ];
  s.addChart(pres.charts.BAR, series, {
    x: 0.9, y: 1.8, w: W - 1.8, h: 3.7, barDir: "bar", barGrouping: "stacked", barGapWidthPct: 45,
    chartColors: ["8FA6BC", "1F4E79", "2E7D8C", "6F9A72", "C08A3E", "8E7C99"],
    valAxisMinVal: 0, valAxisMaxVal: 8, valAxisMajorUnit: 1, valAxisLabelFormatCode: '0" h"',
    valGridLine: { color: "E3E3E3", size: 0.5 }, catGridLine: { style: "none" }, catAxisOrientation: "maxMin",
    catAxisLabelFontFace: TBL_FONT, valAxisLabelFontFace: TBL_FONT, catAxisLabelFontSize: 18, valAxisLabelFontSize: 12,
    showValue: step === 2, dataLabelFormatCode: '0.0;;;', dataLabelFontSize: 16, dataLabelFontFace: TBL_FONT, dataLabelFontBold: true, dataLabelColor: "FFFFFF",
    showLegend: true, legendPos: "b", legendFontFace: TBL_FONT, legendFontSize: 15,
  });
  if (step === 2) s.addText([{ text: "5.8 hours", options: { highlight: HL, bold: true } }, { text: ", and 42% of it outside clinic hours" }],
    { x: 0.9, y: 5.75, w: W - 1.8, h: 0.5, fontFace: "Georgia", fontSize: 22, align: "center", color: "000000", isTextBox: true, margin: 0 });
  src(s, "Holmgren AJ et al. J Gen Intern Med 2024;39:2868-70. Epic Signal data, 200,081 ambulatory physicians. doi:10.1007/s11606-024-08930-4");
  s.addNotes("Let them guess. 5.8 hours in the EHR for every 8 hours of scheduled patient care; notes are the biggest piece. 42% of that time happens outside clinic hours, half of it on days with no clinic at all. Not new: Sinsky 2016 found nearly 2 hours of EHR and desk work per hour with patients [PMID: 27595430], and Arndt 2017 found 5.9 hours of an 11.4-hour day in family medicine.");
  return s;
});

// 21 Hepatologists
function hepStep(step) {
  const s = slide("Hepatologists");
  lab(s, "Measure yourself");
  const a = pic(s, "bali-title.png", 1.6, 1.2, W - 3.2, 2.0, "Bali et al., Digestive Diseases and Sciences 2026: title");
  {
    bars2(s, ["Advanced endoscopy", "Esophagus", "IBD", "Motility", "Hepatology"], [14.7, 17.2, 26.2, 29.7, 30.5], 4,
      { x: 1.6, y: a.y + a.h + 0.1, w: 10.1, h: 3.05, max: 40, unit: 10, fmt: '0.0;;;', labSize: 16, catSize: 14, pos: "outEnd", valTitle: "Minutes per appointment" });
    s.addText("In Basket and documentation were the top stressors; 30.5% reported burnout", { x: 0.9, y: 6.4, w: W - 1.8, h: 0.4,
      fontFace: "Georgia", fontSize: 18, align: "center", color: "000000", isTextBox: true, margin: 0 });
  }
  src(s, "Bali AS et al. Dig Dis Sci 2026;71:3466-75. Signal data, 347 GI providers (38 hepatology), 3 centers [PMID: 41801633]");
  s.addNotes("Our own specialty. Three tertiary centers, Signal data. Hepatologists had the most EHR time per appointment of any GI group: 30.5 minutes, versus 14.7 for advanced endoscopy. That includes 8.9 minutes of chart review and 7.7 minutes outside scheduled hours per appointment. Survey: in-basket and documentation ranked as the top stressors.");
  return s;
}
hepStep(2);

// 22 Your own numbers
{
  const s = slide("Your own numbers: Signal");
  lab(s, "Measure yourself");
  pic(s, "signal-report.png", 0.6, 1.25, 8.3, 5.6, "Mock Signal provider efficiency report compared with peers");
  body(s, [
    "Your time in notes, In Basket and chart review, against your peers",
    "Time outside scheduled hours",
    "Which tools you use",
    "Ask your Epic team for access",
  ], { x: 9.1, w: 3.9, y: 1.6, h: 5.0, size: 19, gap: 14 });
  src(s, MOCK + ". Epic Signal Quick Start Guide and Metric Reference");
  s.addNotes("This is where the national numbers come from, and you can see your own. Dr. Example is slower than peers in notes and closes fewer notes the same day; the personalization line shows why: 3 SmartPhrases, no preference list, no QuickActions. Most of us have to request access. I did.");
}

// 23 Back to ZZTEST, LIVER
{
  const s = slide("Back to our patient");
  lab(s, "Measure yourself");
  const g = [["synopsis-cirrhosis.png", "Synopsis"], ["chart-search.png", "Chart search"], ["note-smartphrase-2.png", "SmartPhrase"], ["inbasket.png", "QuickActions"]];
  g.forEach(([f, t], i) => {
    const x = 0.4 + (i % 2) * 3.75, y = 1.3 + Math.floor(i / 2) * 2.75;
    pic(s, f, x, y, 3.6, 2.25, "Mock-up: " + t);
    s.addText(t, { x, y: y + 2.27, w: 3.6, h: 0.35, fontFace: "Georgia", fontSize: 15, align: "center", color: "000000", isTextBox: true, margin: 0 });
  });
  q(s, "To set up when you get home", 1.35, { x: 8.0, w: 5.0, size: 20 });
  body(s, [
    "A Synopsis view for each kind of visit",
    "Three saved chart searches",
    "One SmartPhrase, yours or borrowed",
    "Your own version of the new-patient order set",
    "QuickActions for normal results",
    "Look at your Signal report",
  ], { x: 8.1, w: 4.9, y: 1.95, h: 4.9, size: 19, gap: 10 });
  src(s, MOCK);
  s.addNotes("Back to the referral: MELD trend, workup gaps, last EGD and outside MRI, all found before walking in. None of this is AI. Pick two from the list this week. And ask which AI tools your organization has turned on.");
}

// 24 Questions?
{
  const s = pres.addSlide({ masterName: "BLANK", sectionTitle: section });
  s.addImage({ path: path.join(IMG, "questions-background.jpg"), x: -0.05, y: 0, w: 13.43, h: 7.5, altText: "Watercolor of the same workstation at the end of the day, monitors off, white coat on the chair" });
  s.addText("Questions?", { x: 0.5, y: 2.4, w: 6.6, h: 1.4, fontFace: "Georgia", fontSize: 54, align: "center", valign: "middle", color: "000000", isTextBox: true, margin: 0 });
  s.addText("X: @mfalmeqdadi", { x: 0.5, y: 3.9, w: 6.6, h: 0.5, fontFace: "Georgia", fontSize: 20, align: "center", color: "595959", isTextBox: true, margin: 0 });
  s.addNotes("Hand back to Emily for the discussion.");
}
endMain();

(async () => {
  addSlideNumbers();
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
