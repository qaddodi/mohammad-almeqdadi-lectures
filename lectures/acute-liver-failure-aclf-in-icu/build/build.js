// Builds "ALF and ACLF in the ICU" in the style of Mohammad Almeqdadi's existing decks.
const pptxgen = require("pptxgenjs");
const path = require("path");
const { applyTheme } = require(process.env.SKILL + "/scripts/apply_theme.js");

const OUT = process.argv[2];
const COVER_IMG = process.argv[3];
const LOGO_IMG = process.argv[4];

const THEME = {
  name: "Office",
  headFontFace: "Georgia",
  bodyFontFace: "Georgia",
  colors: {
    dk1: "000000", lt1: "FFFFFF", dk2: "44546A", lt2: "E7E6E6",
    accent1: "4472C4", accent2: "ED7D31", accent3: "A5A5A5", accent4: "FFC000",
    accent5: "5B9BD5", accent6: "70AD47", hlink: "0563C1", folHlink: "954F72",
  },
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5, same as the existing decks
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.author = "Mohammad Almeqdadi, MD";
pres.title = "Acute Liver Failure and ACLF in the ICU";

const W = 13.333;
const RED = "C00000";
const GREY = "595959";
const HL = "FFFF00";
const TBL_FONT = "Calibri";

pres.defineSlideMaster({
  title: "CONTENT",
  background: { color: "FFFFFF" },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.25, w: W - 1.2, h: 1.0,
      fontFace: "Georgia", fontSize: 30, color: "000000", align: "center", valign: "middle" }, text: "" } },
  ],
  slideNumber: { x: W - 0.9, y: 7.0, w: 0.5, h: 0.3, fontSize: 9, color: "A6A6A6", fontFace: "Georgia", align: "right" },
});
pres.defineSlideMaster({
  title: "SECTION",
  background: { color: "FFFFFF" },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 2.6, w: W - 1.6, h: 1.4,
      fontFace: "Georgia", fontSize: 44, color: "000000", align: "center", valign: "middle" }, text: "" } },
  ],
  slideNumber: { x: W - 0.9, y: 7.0, w: 0.5, h: 0.3, fontSize: 9, color: "A6A6A6", fontFace: "Georgia", align: "right" },
});
pres.defineSlideMaster({ title: "BLANK", background: { color: "FFFFFF" } });

let section = null;
function sec(title) { section = title; pres.addSection({ title }); }
function slide(title, opts = {}) {
  const s = pres.addSlide({ masterName: opts.master || "CONTENT", sectionTitle: section });
  if (title != null) {
    const t = typeof title === "string" ? title : title;
    s.addText(t, { placeholder: "title", bold: !!opts.bold });
  }
  return s;
}

// Paragraph builder. Items are strings or objects:
// { t, lvl, b, i, hl, red, nb (no bullet), size, color, runs:[...] }
function paras(items, base = {}) {
  const out = [];
  items.forEach((it, idx) => {
    if (typeof it === "string") it = { t: it };
    const last = idx === items.length - 1;
    const size = it.size || (it.lvl ? (base.subSize || base.size - 2) : base.size);
    const pOpts = {
      bullet: it.nb ? false : { code: "2013", indent: 18 },
      indentLevel: it.lvl || 0,
      paraSpaceBefore: it.gap != null ? it.gap : (it.lvl ? 2 : (base.gap != null ? base.gap : 8)),
      fontSize: size,
      align: it.align,
    };
    const runs = it.runs || [{ t: it.t, b: it.b, i: it.i, hl: it.hl, red: it.red, color: it.color }];
    runs.forEach((r, ri) => {
      if (typeof r === "string") r = { t: r };
      const o = ri === 0 ? { ...pOpts } : { fontSize: size };
      if (r.b || it.b) o.bold = true;
      if (r.i || it.i) o.italic = true;
      if (r.hl) o.highlight = HL;
      if (r.red) o.color = RED;
      else if (r.color) o.color = r.color;
      if (ri === runs.length - 1 && !last) o.breakLine = true;
      out.push({ text: r.t, options: o });
    });
  });
  return out;
}
function body(s, items, box = {}) {
  const b = { x: 0.9, y: 1.45, w: W - 1.8, h: 5.4, size: 22, ...box };
  s.addText(paras(items, b), { x: b.x, y: b.y, w: b.w, h: b.h, valign: b.valign || "top",
    fontFace: "Georgia", color: "000000", isTextBox: true, margin: 4, objectName: b.name || "Body" });
}

// Table helper. rows: array of arrays of cell strings or {t, b, red, hl, fill, align, i}
function table(s, rows, o) {
  const fs = o.size || 14;
  const data = rows.map((r, ri) => r.map((c) => {
    if (c == null) c = "";
    if (typeof c === "string") c = { t: c };
    const header = o.header !== false && ri === 0;
    const runs = Array.isArray(c.t) ? c.t : [c];
    const text = runs.map((rr, k) => {
      if (typeof rr === "string") rr = { t: rr };
      const ro = { fontFace: TBL_FONT, fontSize: rr.size || c.size || fs };
      if (rr.b || header || c.b) ro.bold = true;
      if (rr.red || c.red) ro.color = RED;
      if (rr.hl || c.hl) ro.highlight = HL;
      if (rr.i || c.i) ro.italic = true;
      if (rr.br) ro.breakLine = true;
      return { text: rr.t, options: ro };
    });
    return { text, options: {
      fill: { color: c.fill || (header ? (o.headFill || "F2F2F2") : "FFFFFF") },
      align: c.align || (o.align && o.align[r.indexOf(c)]) || "left",
      valign: o.valign || "middle", color: "000000",
    } };
  }));
  s.addTable(data, { x: o.x, y: o.y, w: o.w, colW: o.colW, rowH: o.rowH,
    border: { type: "solid", pt: 0.75, color: "A6A6A6" }, margin: o.margin || [3, 6, 3, 6],
    fontFace: TBL_FONT, fontSize: fs, color: "000000", autoPage: false, objectName: o.name || "Table" });
}

function q(s, text, y, opts = {}) {
  s.addText(text, { x: 0.9, y, w: W - 1.8, h: opts.h || 0.6, fontFace: "Georgia", fontSize: opts.size || 24,
    bold: true, align: "center", valign: "middle", color: "000000", isTextBox: true, margin: 0,
    highlight: opts.hl ? HL : undefined, objectName: opts.name || "Question" });
}
function src(s, text) {
  s.addText(text, { x: 0.6, y: 6.95, w: W - 1.8, h: 0.35, fontFace: "Georgia", fontSize: 10, italic: true,
    color: GREY, isTextBox: true, margin: 0, valign: "bottom", objectName: "Source" });
}
function box(s, x, y, w, h, text, o = {}) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: o.fill || "FFFFFF" },
    line: { color: o.line || "000000", width: o.lw || 1 }, objectName: o.name || "Box" });
  s.addText(text, { x, y, w, h, fontFace: "Georgia", fontSize: o.size || 16, align: "center",
    valign: "middle", color: o.color || "000000", bold: !!o.b, isTextBox: true, margin: 4 });
}
function arrow(s, x1, y1, x2, y2) {
  s.addShape(pres.shapes.LINE, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1) || 0.001,
    h: Math.abs(y2 - y1) || 0.001, flipH: x2 < x1, flipV: y2 < y1,
    line: { color: "000000", width: 1.5, endArrowType: "triangle" }, objectName: "Arrow" });
}

// ---------------------------------------------------------------- Cover
sec("Opening");
{
  const s = pres.addSlide({ masterName: "BLANK", sectionTitle: section });
  // liver image reused from the 2025 cirrhosis cover, faded as in the original
  s.addImage({ path: COVER_IMG, x: 1.36, y: 0.04, w: 10.6, h: 7.33, transparency: 35, altText: "Liver illustration" });
  s.addText("Acute Liver Failure and ACLF", { x: 0.8, y: 2.0, w: W - 1.6, h: 1.0, fontFace: "Georgia", fontSize: 50,
    bold: true, align: "center", color: "000000", isTextBox: true, margin: 0 });
  s.addText("in the ICU", { x: 0.8, y: 2.95, w: W - 1.6, h: 0.7, fontFace: "Georgia", fontSize: 36,
    bold: true, align: "center", color: "000000", isTextBox: true, margin: 0 });
  s.addText("A guide for the night shift", { x: 0.8, y: 3.65, w: W - 1.6, h: 0.5, fontFace: "Georgia", fontSize: 20,
    italic: true, align: "center", color: "000000", isTextBox: true, margin: 0 });
  s.addText([
    { text: "Mohammad Almeqdadi, MD", options: { bold: true, fontSize: 18, breakLine: true } },
    { text: "Transplant Hepatologist and Gastroenterologist", options: { italic: true, fontSize: 15, breakLine: true } },
    { text: "Assistant Professor of Medicine and Surgery", options: { italic: true, fontSize: 15 } },
  ], { x: 2.5, y: 4.55, w: W - 5, h: 1.1, fontFace: "Georgia", align: "center", color: "000000", isTextBox: true, margin: 0 });
  s.addImage({ path: LOGO_IMG, x: 4.77, y: 6.2, w: 3.79, h: 0.77, altText: "Tufts University School of Medicine" });
  s.addNotes("Pulmonary and critical care fellows. About 60 minutes with questions as we go. Two patients, one night. Everything in the cases is made up for teaching; none of it is a real patient.");
}

// ---------------------------------------------------------------- Roadmap
{
  const s = slide("Tonight's questions");
  body(s, [
    "Is this liver failure?",
    "What do I do in the first hour?",
    "When do I intubate, and how do I protect the brain?",
    "Do I wait for the creatinine before dialysis?",
    "Is this ACLF, and does the label change anything?",
    "Does he have HRS? Will fixing the kidney hurt the lungs?",
    "When do I call transplant hepatology?",
  ], { size: 24, gap: 14, x: 1.6, w: W - 3.2 });
  s.addNotes("Frame the talk as the questions they actually get paged about. We'll answer them through two patients who are in the unit on the same night.");
}

// ---------------------------------------------------------------- Patient A
sec("Patient A: acute liver failure");
{
  const s = slide("Two patients, same night", { master: "CONTENT" });
  table(s, [
    ["Bed 4", "Bed 7"],
    ["28-year-old woman", "56-year-old man"],
    ["No known liver disease", "Alcohol-related cirrhosis with ascites"],
    ["Nausea and vomiting for 4 days", "Fever, confusion, low blood pressure"],
  ], { x: 2.2, y: 2.0, w: 8.9, colW: [4.45, 4.45], size: 20, rowH: 0.65, align: ["center", "center"] });
  body(s, [{ t: "Both have a sick liver. Do they have the same disease?", nb: true, i: true, align: "center" }],
    { y: 5.1, h: 0.8, size: 22 });
  s.addNotes("Introduce both up front so the contrast is there from the start. We'll start with bed 4 and come back to bed 7.");
}

const A_TITLE = "28-year-old woman with 4 days of nausea";
const A_LABS = [
  ["Test", "Result"],
  ["AST", { t: "6,820 U/L", red: true }],
  ["ALT", { t: "5,940 U/L", red: true }],
  ["Alkaline phosphatase", "128 U/L"],
  ["Total bilirubin", { t: "2.9 mg/dL", red: true }],
  ["Creatinine", "1.0 mg/dL"],
];
function caseA(step) {
  const s = slide(A_TITLE, { bold: true });
  body(s, [
    "Nausea, vomiting and poor intake for 4 days",
    "No known liver disease, no alcohol use",
    "\"Took something for a toothache\"",
  ], { x: 0.8, y: 1.5, w: 6.6, h: 2.2, size: 20 });
  table(s, A_LABS, { x: 8.0, y: 1.5, w: 4.6, colW: [2.6, 2.0], size: 15, rowH: 0.42 });
  if (step === 1) q(s, "Is this acute liver failure?", 4.6);
  if (step === 2) {
    q(s, "Is this acute liver failure?", 4.3);
    q(s, "We don't know yet. What's missing?", 5.0, { hl: true });
  }
  if (step === 3) {
    q(s, "What's missing?", 4.1, { size: 22 });
    body(s, [
      { runs: [{ t: "INR", b: true }, " (synthetic function, not enzymes)"] },
      { runs: [{ t: "Mental status", b: true }, " (any encephalopathy?)"] },
      { runs: [{ t: "Time course", b: true }, " (how long since the first symptom?)"] },
      { runs: [{ t: "Is there chronic liver disease underneath?", b: true }] },
    ], { x: 2.4, y: 4.7, w: 8.6, h: 2.1, size: 19, gap: 4 });
  }
  return s;
}
caseA(1).addNotes("Let them commit. Most people will say yes because the numbers are huge. The aminotransferases tell you hepatocytes are dying. They don't tell you whether the liver is failing.");
caseA(2).addNotes("This is the same distinction as in the acute liver injury lecture: the size of the enzyme rise is not the severity of the illness.");
caseA(3).addNotes("Liver failure is a clinical diagnosis: coagulopathy plus encephalopathy in someone without cirrhosis. Ask for the INR and examine the patient.");
{
  const s = slide(A_TITLE, { bold: true });
  table(s, [
    ["Test", "Result"],
    ["AST", { t: "6,820 U/L", red: true }],
    ["ALT", { t: "5,940 U/L", red: true }],
    ["Total bilirubin", { t: "2.9 mg/dL", red: true }],
    [{ t: "INR", b: true }, { t: "3.2", red: true, b: true }],
    [{ t: "Glucose", b: true }, { t: "54 mg/dL", red: true, b: true }],
  ], { x: 8.0, y: 1.5, w: 4.6, colW: [2.6, 2.0], size: 15, rowH: 0.42 });
  body(s, [
    "Disoriented to time, asterixis",
    "Symptoms started 4 days ago",
    "Ultrasound: smooth liver, no ascites, patent vessels, normal spleen",
    "No history or imaging suggesting cirrhosis",
  ], { x: 0.8, y: 1.5, w: 6.8, h: 3.0, size: 20 });
  q(s, "This is acute liver failure", 4.9, { hl: true, size: 28 });
  s.addNotes("Coagulopathy, encephalopathy, short course, no cirrhosis. Note the glucose: hypoglycemia is part of the picture, and it is also a reason the mental status can look worse than it is. Fix the glucose and re-examine.");
}
{
  const s = slide("Acute liver failure");
  body(s, [
    { runs: [{ t: "INR ≥ 1.5", b: true }, " and ", { t: "any degree of encephalopathy", b: true }] },
    "Illness of less than 26 weeks",
    "No pre-existing cirrhosis",
    { t: "Wilson disease, autoimmune hepatitis and vertically acquired HBV can still count if recognized within 26 weeks", lvl: 1 },
  ], { x: 0.8, y: 1.4, w: W - 1.6, h: 2.3, size: 21 });
  table(s, [
    ["Jaundice to encephalopathy", "Hyperacute (< 1 week)", "Acute (1 to 4 weeks)", "Subacute (4 to 12 weeks)"],
    ["Typical causes", "Acetaminophen, HAV, HEV, ischemia", "HBV", "Idiosyncratic drug injury, AIH, indeterminate"],
    ["Cerebral edema", { t: "Common", b: true }, "Less common", "Uncommon"],
    ["Recovery without transplant", "More likely", "Intermediate", { t: "Less likely", b: true }],
  ], { x: 0.8, y: 4.0, w: W - 1.6, colW: [3.0, 2.9, 2.9, 2.93], size: 15, rowH: 0.55 });
  src(s, "EASL ALF guideline 2017 [PMID: 28417882]; Management of ALF: update 2022 [PMID: 36001996]");
  s.addNotes("The time course is not trivia. The faster it comes on, the more you worry about the brain, and paradoxically the better the chance of spontaneous recovery. The slow ones have less cerebral edema but do worse without a transplant. Patient A is hyperacute.");
}
{
  const s = slide("INR 2.4, wide awake. Acute liver failure?");
  body(s, [
    { runs: [{ t: "No. ", b: true }, "This is severe acute liver injury"] },
    "No encephalopathy means not yet ALF",
    "But it can become ALF within hours",
    { t: "Check glucose often and examine the patient every few hours", lvl: 1 },
    { t: "Call transplant hepatology early anyway", lvl: 1 },
    "And the opposite trap:",
    { t: "Hypoglycemia, sedatives, sepsis, alcohol withdrawal and seizures can all look like encephalopathy", lvl: 1 },
  ], { size: 22 });
  s.addNotes("Two errors in opposite directions. Calling everything with a high INR liver failure, and blaming every change in mental status on the liver.");
}
{
  const s = slide(A_TITLE, { bold: true });
  q(s, "What's your next step?", 3.2, { size: 36, h: 1.0 });
  s.addNotes("Wait for answers. Usually people list tests in order. That's the trap.");
}
{
  const s = slide("Three things, at the same time");
  table(s, [
    ["Keep her alive", "Find and treat the cause", "Call transplant hepatology"],
    [
      { t: [{ t: "ICU bed", br: true }, { t: "Glucose every 1 to 2 hours", br: true }, { t: "Airway assessment", br: true }, { t: "Volume, perfusion, lactate", br: true }, { t: "Neuro checks" }] },
      { t: [{ t: "Acetaminophen level", br: true }, { t: "Viral, autoimmune, Wilson, toxicology", br: true }, { t: "Doppler ultrasound", br: true }, { t: "Pregnancy test", br: true }, { t: "Start NAC if acetaminophen is possible" }] },
      { t: [{ t: "Now, not after the workup", br: true }, { t: "Transplant evaluation starts tonight", br: true }, { t: "Social work and psychiatry while she can still talk" }] },
    ],
  ], { x: 0.8, y: 1.6, w: W - 1.6, colW: [3.9, 3.9, 3.93], size: 18, rowH: [0.55, 2.4], valign: "top", align: ["left", "left", "left"] });
  q(s, "All three start in the first hour", 5.6, { hl: true });
  s.addNotes("The classic mistake is a serial workup: wait for the hepatitis panel, then the autoimmune markers, then call hepatology. By then she is intubated and the evaluation has lost a day. Here the transplant evaluation runs in parallel from the first night, and the psychosocial part is much easier while she can still talk.");
}
{
  const s = slide("Which cause changes treatment tonight?");
  table(s, [
    ["If you suspect", "Send", "Don't wait for the result to"],
    ["Acetaminophen", "Level, ingestion history, combination products", "Start NAC"],
    ["Herpes simplex", "HSV PCR (blood)", "Start IV acyclovir"],
    ["Hepatitis B", "HBsAg, anti-HBc IgM, HBV DNA", "Start entecavir or tenofovir"],
    ["Autoimmune hepatitis", "ANA, ASMA, IgG (can be negative)", "Discuss steroids with hepatology, list in parallel"],
    ["Wilson disease", "Ceruloplasmin, urine copper, hemolysis, low ALP", "Prepare for urgent transplant"],
    ["Pregnancy (AFLP, HELLP)", "hCG", "Call obstetrics, plan delivery"],
    ["Budd-Chiari", "Doppler ultrasound or CT", "Anticoagulation, discuss TIPS or transplant"],
    ["Ischemic hepatitis", "Echo, history of shock", "Fix the circulation"],
  ], { x: 0.7, y: 1.35, w: W - 1.4, colW: [2.9, 4.6, 4.43], size: 15, rowH: 0.56 });
  src(s, "Update 2022 [PMID: 36001996]; practical update 2024 [PMID: 39170946]; EASL AIH 2025 [PMID: 40348684]");
  s.addNotes("The point of the workup in the ICU is the column on the right. Some of these you start empirically before the test comes back: NAC, acyclovir. Negative autoimmune serologies do not exclude acute AIH. Wilson disease presenting as ALF basically means transplant.");
}
function caseA_apap(step) {
  const s = slide(A_TITLE, { bold: true });
  body(s, [
    "Roommate: \"She was taking a lot of the Tylenol with codeine, plus cold medicine, for 3 days\"",
    { runs: ["Acetaminophen level: ", { t: "12 μg/mL", b: true }, ", time of last dose unknown"] },
  ], { y: 1.5, h: 1.6, size: 21 });
  q(s, "Can you use the nomogram?", 3.4);
  if (step === 2) {
    body(s, [
      { runs: [{ t: "No.", b: true }, " Rumack-Matthew is for a single acute ingestion with a known time"] },
      "Repeated supratherapeutic use and late presentation: the level can be low or undetectable",
      { runs: [{ t: "Start NAC now", hl: true, b: true }] },
    ], { y: 4.1, h: 2.6, size: 21 });
  }
  return s;
}
caseA_apap(1).addNotes("Combination products are where the hidden acetaminophen is. Ask about every over-the-counter product by name.");
{
  const s = slide("The Rumack-Matthew nomogram");
  const hrs = ["4 h", "8 h", "12 h", "16 h", "20 h", "24 h"];
  s.addChart(pres.charts.LINE, [
    { name: "Original line (200 at 4 h)", labels: hrs, values: [200, 100, 50, 25, 12.5, 6.25] },
    { name: "US treatment line (150 at 4 h)", labels: hrs, values: [150, 75, 37.5, 18.75, 9.38, 4.69] },
    { name: "Her level, 12 μg/mL", labels: hrs, values: [12, 12, 12, 12, 12, 12] },
  ], {
    x: 0.6, y: 1.3, w: 7.4, h: 5.4, chartColors: ["7F7F7F", "000000", RED], lineDash: ["dash", "solid", "sysDot"],
    lineSize: 2.5, lineDataSymbol: "none", valAxisLogScaleBase: 10, valAxisMinVal: 1, valAxisMaxVal: 1000,
    showValAxisTitle: true, valAxisTitle: "Acetaminophen (μg/mL), log scale", valAxisTitleFontSize: 13, valAxisTitleFontFace: "Calibri",
    showCatAxisTitle: true, catAxisTitle: "Hours after a single ingestion", catAxisTitleFontSize: 13, catAxisTitleFontFace: "Calibri",
    catAxisLabelFontFace: "Calibri", valAxisLabelFontFace: "Calibri", catAxisLabelFontSize: 13, valAxisLabelFontSize: 12,
    catAxisLabelColor: "404040", valAxisLabelColor: "404040", valGridLine: { color: "D9D9D9", size: 0.5 }, catGridLine: { style: "none" },
    showLegend: true, legendPos: "b", legendFontFace: "Calibri", legendFontSize: 13,
  });
  body(s, [
    "One acute ingestion, known time, plotted from 4 to 24 hours",
    "Above the treatment line: NAC",
    { t: "Now plot her", b: true, nb: true, gap: 18 },
    "At 8 hours, 12 is well below the line",
    "At 20 hours, it is above",
    { runs: ["Three days of repeated doses: ", { t: "there is no time zero", b: true }] },
  ], { x: 8.3, y: 1.5, w: 4.5, h: 5.2, size: 19 });
  src(s, "Rumack BH, Matthew H. Pediatrics 1975; US treatment line 150 μg/mL at 4 hours");
  s.addNotes("Show them what it is first: a semi-log plot, the line halves every 4 hours (a half-life of about 4 hours), and the US treatment line sits 25% below the original 200 line for a safety margin. Then try to put her on it. Her 12 crosses the treatment line at roughly 18 to 19 hours. Before that she looks fine, after that she needs NAC. With repeated supratherapeutic dosing over 3 days there is no single ingestion time, so the nomogram can't answer the question.");
}
caseA_apap(2).addNotes("An undetectable or low level late in the course does not exclude acetaminophen toxicity [PMID: 36001996]. NAC is safe enough that the threshold to start it is low. Dosing per your pharmacy protocol.");
{
  const s = slide("NAC for every kind of acute liver failure?");
  table(s, [
    ["Study", "Adult non-acetaminophen ALF, randomized, NAC vs placebo, 173 patients"],
    ["Main finding", "Transplant-free survival 40% vs 27%; the benefit was in early encephalopathy (grade I-II): 52% vs 30%"],
    ["What it doesn't show", { t: "Overall survival was not different (70% vs 66%). No benefit in grade III-IV coma", b: true }],
    ["So", "Reasonable in early non-acetaminophen ALF. Don't extrapolate to advanced coma, children or ACLF"],
  ], { x: 0.9, y: 1.6, w: W - 1.8, colW: [2.8, 8.73], size: 18, rowH: [0.9, 1.1, 1.0, 1.0], header: false });
  src(s, "Lee WM et al. Gastroenterology 2009 [PMID: 19524577]");
  s.addNotes("Transplant-free survival is a softer endpoint than overall survival, and part of the effect is that fewer patients needed transplant. Still, it is cheap and safe, so most centers give it in early non-acetaminophen ALF.");
}
const A10_ROWS = [
  ["", "Admission", "Hour 12"],
  ["Mental status", "Disoriented, asterixis", { t: "Responds only to voice (grade III)", red: true, b: true }],
  ["Ammonia (arterial)", "Not sent", { t: "182 μmol/L", red: true, b: true }],
  ["Urine output", "OK", { t: "15 mL/h for 4 hours", red: true }],
  ["Lactate (after 3 L)", "2.1 mmol/L", { t: "4.6 mmol/L", red: true }],
  ["Creatinine", "1.0 mg/dL", "1.3 mg/dL"],
  ["Sodium", "136 mmol/L", "133 mmol/L"],
  ["Glucose", "54 mg/dL", "Needs D10"],
];
{
  const s = slide(A_TITLE, { bold: true });
  table(s, A10_ROWS, { x: 1.5, y: 1.4, w: W - 3.0, colW: [3.0, 3.0, 4.33], size: 17, rowH: 0.5 });
  q(s, "What worries you most?", 5.8);
  s.addNotes("Hour 12. Hepatology has seen her and the transplant evaluation is under way. Let them pick. Kidney? Lactate? The answer for a hyperacute patient with this ammonia is the brain.");
}
{
  const s = slide(A_TITLE, { bold: true });
  table(s, A10_ROWS, { x: 1.5, y: 1.4, w: W - 3.0, colW: [3.0, 3.0, 4.33], size: 17, rowH: 0.5 });
  q(s, "Her brain", 5.55, { hl: true, size: 26 });
  body(s, [{ t: "When do you intubate?  Do you wait for the creatinine before dialysis?", nb: true, align: "center", i: true }],
    { y: 6.1, h: 0.6, size: 20 });
  s.addNotes("Two decisions we own as intensivists. Before answering, why is the brain the problem?");
}
{
  const s = slide("Why does the brain swell?");
  const x = 0.8, bw = 3.0, bh = 0.85;
  box(s, x, 1.5, bw, bh, "Liver can't clear ammonia");
  box(s, x + 3.6, 1.5, bw, bh, "Astrocytes take up ammonia");
  box(s, x + 7.2, 1.5, bw + 1.0, bh, "Ammonia + glutamate → glutamine");
  arrow(s, x + bw, 1.5 + bh / 2, x + 3.6, 1.5 + bh / 2);
  arrow(s, x + 3.6 + bw, 1.5 + bh / 2, x + 7.2, 1.5 + bh / 2);
  box(s, x + 7.2, 3.0, bw + 1.0, bh, "Glutamine pulls in water, mitochondria fail");
  arrow(s, x + 7.2 + (bw + 1.0) / 2, 1.5 + bh, x + 7.2 + (bw + 1.0) / 2, 3.0);
  box(s, x + 3.6, 3.0, bw, bh, "Astrocyte swelling, cerebral edema", { b: true });
  arrow(s, x + 7.2, 3.0 + bh / 2, x + 3.6 + bw, 3.0 + bh / 2);
  box(s, x, 3.0, bw, bh, "Intracranial hypertension, herniation", { b: true, color: RED, line: RED });
  arrow(s, x + 3.6, 3.0 + bh / 2, x + bw, 3.0 + bh / 2);
  body(s, [
    { runs: [{ t: "Makes it worse: ", b: true }, "inflammation and infection, loss of autoregulation, fever, low sodium, high CO2"] },
    { runs: [{ t: "Highest risk: ", b: true }, "hyperacute course, young, grade III-IV encephalopathy, ammonia persistently above 150 to 200 μmol/L, AKI, vasopressors"] },
  ], { y: 4.4, h: 2.4, size: 19 });
  src(s, "Update 2022 [PMID: 36001996]; practical update 2024 [PMID: 39170946]");
  s.addNotes("This is why ammonia is actionable in ALF. The brain has no time to adapt, unlike in cirrhosis where astrocytes compensate over months. Every element of the bundle that follows maps to a box on this slide.");
}
{
  const s = slide("Ammonia: how high is too high?");
  table(s, [
    ["Study (arterial ammonia)", "Patients", "What they found", "The catch"],
    ["Clemmesen 1999, Copenhagen", "44 ALF", { t: [{ t: "14 herniated. Mean ammonia 230 vs 118 μmol/L; every herniation was above 146", b: true }] }, "Small, one center"],
    ["Bhatia 2006, Delhi", "80 ALF", "Admission ammonia ≥ 124 predicted death (sensitivity 79%, specificity 76%)", "One center; the endpoint was death, not ICH"],
    ["Bernal 2007, King's", "165 ALF, grade III-IV", { t: [{ t: "> 100 predicted severe HE (70% accuracy). ", br: false }, { t: "> 200: ICH in 55%", b: true }] }, "200 missed most of the ICH cases"],
    ["Kumar 2012, Delhi", "295 ALF", { t: [{ t: "≥ 122 for 3 days: survival 23% vs 72%", b: true }, { t: ", cerebral edema 71% vs 37%" }] }, "One center, but the trend beat a single value"],
  ], { x: 0.6, y: 1.35, w: W - 1.2, colW: [2.9, 2.0, 4.9, 2.33], size: 16, rowH: [0.5, 0.95, 0.85, 0.85, 0.85] });
  q(s, "Above 150 to 200 and not falling: worry about the brain", 5.55, { hl: true, size: 22 });
  body(s, [{ t: "ICH can occur below 200. Interpret the level with the HE grade and the trend", nb: true, i: true, align: "center" }],
    { y: 6.1, h: 0.6, size: 18 });
  src(s, "Clemmesen Hepatology 1999;29:648-53; Bhatia Gut 2006; Bernal Hepatology 2007 [PMID: 17685471]; Kumar Clin Gastroenterol Hepatol 2012");
  s.addNotes("All four used arterial ammonia, measured in micromoles per liter. The pattern is consistent: higher and more persistent ammonia, more cerebral edema and death. But no single cutoff works on its own. In Bernal's King's cohort, more than 200 meant intracranial hypertension in 55%, yet most patients who developed ICH were below 200. So use it as a risk marker together with the grade of encephalopathy, the time course and the trend. Patient A went 182 then 214. That's the trajectory you act on with CRRT. Practical point: whatever you send, arterial or venous, put it on ice and get it run quickly. A delayed sample reads falsely high. In cirrhosis, by contrast, a single ammonia doesn't diagnose HE and shouldn't be trended to dose lactulose.");
}
function intubate(step) {
  const s = slide("When do you intubate?");
  if (step === 1) {
    body(s, [
      "Responds to voice, drifts off, intermittently agitated",
      "Handling secretions for now",
      "SpO2 96% on 2 L",
    ], { y: 1.7, h: 2.0, size: 22, x: 2.0, w: W - 4 });
    q(s, "Intubate now, or wait until she can't protect her airway?", 4.3);
    return s;
  }
  q(s, "Grade III-IV encephalopathy in ALF: intubate", 1.4, { hl: true, size: 24 });
  table(s, [
    ["Before", "During", "After"],
    [
      { t: [{ t: "Preoxygenate", br: true }, { t: "Norepinephrine ready", br: true }, { t: "Check glucose", br: true }, { t: "Head of bed 30°, neck neutral" }] },
      { t: [{ t: "Avoid hypotension (perfusion pressure)", br: true }, { t: "Avoid coughing and bucking (ICP spikes)", br: true }, { t: "Most experienced operator" }] },
      { t: [{ t: "Propofol: short-acting, may lower ICP", br: true }, { t: "Avoid long-acting benzodiazepines", br: true }, { t: "Aim for normal CO2, check a gas", br: true }, { t: "Sedation hides the neuro exam: check pupils" }] },
    ],
  ], { x: 0.8, y: 2.3, w: W - 1.6, colW: [3.6, 4.1, 4.03], size: 18, rowH: [0.5, 1.9], valign: "top" });
  src(s, "Practical update 2024 [PMID: 39170946]; ACG ALF 2023 [PMID: 37377263]; SCCM 2020 [PMID: 32058387]");
  return s;
}
intubate(1).addNotes("I'd intubate her now. Most fellows want to wait. In ALF the progression from grade II to grade IV can be fast, and an emergency intubation in a coagulopathic, hypotensive patient with a swollen brain is the worst version of this procedure.");
intubate(2).addNotes("The goals are airway protection, controlled ventilation, and no swings in blood pressure or CO2. Peri-intubation hypotension drops cerebral perfusion pressure; coughing raises ICP. Plan it like a neuro intubation.");
function hypercap(step) {
  const s = slide("Can we use permissive hypercapnia?");
  body(s, [{ t: "Day 1: bilateral infiltrates, P/F 150 on PEEP 10", nb: true, align: "center", i: true }], { y: 1.3, h: 0.5, size: 20 });
  if (step === 1) { q(s, "Lung protection or brain protection?", 3.3, { size: 28 }); return s; }
  table(s, [
    ["", "The lung wants", "The brain wants", "What we do"],
    [{ t: "Tidal volume", b: true }, "6 mL/kg predicted body weight", "No conflict", "Do it"],
    [{ t: "CO2", b: true }, "Tolerate a high CO2", "High CO2 dilates vessels and raises ICP", { t: "Aim for normal CO2. No permissive hypercapnia when ICP is a concern", b: true }],
    [{ t: "Hyperventilation", b: true }, "No", "Lowers ICP briefly, then ischemia", "Only as a short rescue for herniation"],
    [{ t: "PEEP", b: true }, "Recruit", "Very high pressures can impair venous return", "Individualize. PEEP is not forbidden"],
  ], { x: 0.7, y: 2.0, w: W - 1.4, colW: [2.1, 2.9, 3.4, 3.53], size: 16, rowH: [0.5, 0.75, 1.1, 0.85, 0.85] });
  src(s, "SCCM 2020 [PMID: 32058387]; practical update 2024 [PMID: 39170946]");
  return s;
}
hypercap(1).addNotes("This is the PCCM-specific tradeoff. ARDS teaching says accept hypercapnia. Neuro teaching says don't.");
hypercap(2).addNotes("Low tidal volume still applies. What changes is the CO2 target. Prophylactic hyperventilation is out; brief hyperventilation as a bridge in impending herniation is a different thing.");
{
  const s = slide("Protecting the brain: what we actually do");
  body(s, [
    { t: "Every patient with grade III-IV encephalopathy", b: true, nb: true },
    "Head of bed 30°, neck neutral",
    "Treat fever, avoid hypoglycemia",
    { runs: ["Sodium ", { t: "145 to 155 mmol/L", b: true }, " with hypertonic saline (use your center's protocol)"] },
    "Avoid fluid overload",
    "Treat seizures, EEG if in doubt. No routine prophylaxis",
  ], { x: 0.7, y: 1.4, w: 6.2, h: 5.4, size: 19 });
  body(s, [
    { t: "Surge: new hypertension, bradycardia, pupils", b: true, nb: true },
    "Hyperosmolar bolus (hypertonic saline or mannitol)",
    "Brief hyperventilation as a bridge",
    "Call the transplant team now",
    { t: "Things to know", b: true, nb: true, gap: 18 },
    "A normal head CT does not exclude raised ICP",
    "ICP monitors are not routine; SCCM suggests against (very low certainty)",
  ], { x: 7.0, y: 1.4, w: 5.7, h: 5.4, size: 19 });
  src(s, "SCCM 2023 [PMID: 37052436]; update 2022 [PMID: 36001996]; practical update 2024 [PMID: 39170946]");
  s.addNotes("Sodium targets differ between sources: the 2022 update uses 145 to 155 for prevention, the 2024 practical review a lower range. Agree on one with transplant hepatology and write it in the orders. Hypertonic saline is a conditional SCCM recommendation for patients at risk of intracranial hypertension.");
}
function crrt(step) {
  const s = slide("The creatinine is only 1.3");
  body(s, [{ t: "Ammonia 182 → 214 μmol/L, grade III, urine output 15 mL/h", nb: true, align: "center", i: true }], { y: 1.3, h: 0.5, size: 20 });
  if (step === 1) { q(s, "Do you wait for a conventional dialysis indication?", 3.3, { size: 28 }); return s; }
  q(s, "No. In ALF, start CRRT for the ammonia", 2.0, { hl: true, size: 24 });
  body(s, [
    "ACG 2023: suggests early CRRT for hyperammonemia with grade II or higher encephalopathy, even without a renal indication (conditional, very low certainty)",
    "Continuous, not intermittent: fewer swings in blood pressure and brain water",
    "High clearance lowers ammonia",
    "Set replacement fluid sodium to match your sodium target",
    "Call nephrology tonight, not in the morning",
  ], { y: 2.8, h: 4.0, size: 20 });
  src(s, "ACG ALF guideline 2023 [PMID: 37377263]; update 2022 [PMID: 36001996]");
  return s;
}
crrt(1).addNotes("Ask them. Nephrology will often say the creatinine doesn't meet criteria. That's the wrong frame for ALF.");
crrt(2).addNotes("Ammonia around 150 to 200 is a high-risk context in the literature, not a universal threshold. Look at the trajectory and the neuro exam. Coordinate the CRRT fluid with the sodium plan or the dialysis will pull her sodium back down.");
{
  const s = slide("Does early CRRT actually help?");
  table(s, [
    ["", "US ALF Study Group cohort (2018)", "Pilot RCT (2026)"],
    ["Design", "Large registry, observational", "Open label, ALF with cerebral edema; both arms got plasma exchange"],
    ["Comparison", "CRRT vs no CRRT", "CRRT within 12 hours vs CRRT only if plasma exchange failed"],
    ["Finding", "CRRT linked to lower ammonia and better 21-day transplant-free survival", "Fewer deaths in the first 7 days (2.2% vs 17.8%); 28-day survival similar by intention to treat"],
    ["Catch", { t: "Association. Sicker or healthier patients may have been picked for CRRT", b: true }, { t: "Small, single setting, many protocol violations (55.6% vs 13.3%)", b: true }],
  ], { x: 0.7, y: 1.5, w: W - 1.4, colW: [1.9, 5.0, 5.03], size: 16, rowH: [0.5, 0.8, 0.8, 1.2, 1.1] });
  src(s, "Cardoso FS et al. Hepatology 2018 [PMID: 28859230]; Aliment Pharmacol Ther 2026 [PMID: 42332991]");
  s.addNotes("The 2026 trial is interesting but don't oversell it. The early mortality signal is real in the abstract; 28-day survival by intention to treat was comparable, and the per-protocol analysis is biased by crossovers. Read the full methods before quoting more numbers.");
}

// Falling enzymes
function enzymes(step) {
  const s = slide("Day 3: the enzymes are falling");
  const labels = ["Admission", "Hour 12", "Day 2", "Day 3"];
  const chartBase = (title) => ({
    x: 0, y: 0, w: 0, h: 0, showTitle: true, title, titleFontFace: "Georgia", titleFontSize: 16, titleColor: "000000",
    catAxisLabelFontFace: "Calibri", valAxisLabelFontFace: "Calibri", catAxisLabelFontSize: 13, valAxisLabelFontSize: 12,
    catAxisLabelColor: "404040", valAxisLabelColor: "404040", valGridLine: { color: "D9D9D9", size: 0.5 }, catGridLine: { style: "none" },
    showLegend: true, legendPos: "b", legendFontFace: "Calibri", legendFontSize: 13, lineSize: 2.5, lineDataSymbolSize: 8,
    showValue: true, valAxisLabelFormatCode: "#,##0", dataLabelFormatCode: "#,##0", dataLabelFontSize: 11, dataLabelFontFace: "Calibri", dataLabelPosition: "t",
  });
  const c1 = { ...chartBase("AST and ALT (U/L)"), x: 0.6, y: 1.35, w: 6.0, h: 4.3, chartColors: ["000000", "7F7F7F"] };
  s.addChart(pres.charts.LINE, [
    { name: "AST", labels, values: [6820, 4310, 2140, 1190] },
    { name: "ALT", labels, values: [5940, 5020, 3260, 2210] },
  ], c1);
  if (step === 1) {
    s.addText("Is she getting better?", { x: 7.2, y: 3.0, w: 5.4, h: 1.0, fontFace: "Georgia", fontSize: 30, bold: true,
      align: "center", valign: "middle", color: "000000", isTextBox: true, margin: 0, objectName: "Question" });
    s.addNotes("Show only the enzymes. Most of the room will say yes.");
    return s;
  }
  const c2 = { ...chartBase("INR and lactate"), x: 6.8, y: 1.35, w: 6.0, h: 4.3, chartColors: [RED, "7F7F7F"],
    valAxisLabelFormatCode: "0", dataLabelFormatCode: "0.0", showValue: false };
  s.addChart(pres.charts.LINE, [
    { name: "INR", labels, values: [3.2, 4.1, 4.9, 5.6] },
    { name: "Lactate (mmol/L)", labels, values: [2.1, 4.6, 5.2, 5.8] },
  ], c2);
  body(s, [{ t: "Day 2 arterial pH 7.26 after fluids", nb: true, align: "center", i: true }], { x: 6.8, y: 5.62, w: 6.0, h: 0.45, size: 17 });
  q(s, "No. Rising INR and lactate mean loss of liver mass", 6.15, { hl: true, size: 24 });
  src(s, "Made-up numbers for teaching");
  s.addNotes("Falling AST and ALT with a rising INR, rising lactate and worsening encephalopathy means there are fewer hepatocytes left to release enzymes. Read the whole trajectory, not one line [PMID: 36001996]. Point out the day 2 arterial pH of 7.26 after fluids. It comes back on the King's College slide.");
  return s;
}
inr(1).addNotes("Hour 12, CRRT is starting. Very common request from the procedure side.");
inr(2).addNotes("The INR is a great marker of liver function and a poor marker of bleeding risk in ALF. Spontaneous bleeding is uncommon. Ask transplant hepatology before giving plasma: they need the native INR.");
enzymes(1);
enzymes(2);
function inr(step) {
  const s = slide("Should we correct this INR?");
  body(s, [{ t: "Hour 12: INR 4.1, platelets 88. She needs a dialysis catheter", nb: true, align: "center", i: true }], { y: 1.3, h: 0.5, size: 20 });
  if (step === 1) { q(s, "2 units of FFP first?", 3.3, { size: 30 }); return s; }
  body(s, [
    { runs: [{ t: "No plasma just to fix the number", b: true, hl: true }] },
    "The INR sees only the procoagulant side. Protein C and S are low too, factor VIII and von Willebrand factor are high. Most patients are rebalanced",
    "Plasma adds volume (lungs, brain) and erases the INR trend that prognosis and listing rely on",
    { t: "What to do instead", b: true, nb: true, gap: 14 },
    "Ultrasound-guided line, experienced operator, compressible site",
    "Vitamin K once; check fibrinogen and platelets; viscoelastic testing if available",
    "Treat bleeding. Plan high-risk procedures (like an ICP monitor) separately",
  ], { y: 1.95, h: 4.9, size: 19 });
  src(s, "Update 2022 [PMID: 36001996]; SCCM 2020 [PMID: 32058387]");
  return s;
}
function kcc(step) {
  const s = slide("When do you call transplant hepatology?");
  if (step === 1) {
    q(s, "When she meets King's College criteria?", 2.6, { size: 28 });
    q(s, "When MELD is high enough?", 3.4, { size: 28 });
    return s;
  }
  q(s, "You already called. When you first suspected ALF", 1.35, { hl: true, size: 24 });
  table(s, [
    ["Acetaminophen", "Not acetaminophen"],
    [
      { t: [
        { t: "Arterial pH < 7.30 after fluids", br: true, b: true }, { t: "or all three within 24 hours:", br: true, i: true },
        { t: "INR > 6.5", br: true }, { t: "Creatinine > 3.4 mg/dL", br: true }, { t: "Grade III-IV encephalopathy", br: true },
        { t: "(Modified: lactate > 3.5 at 4 h or > 3.0 at 12 h after fluids)", i: true, size: 14 },
      ] },
      { t: [
        { t: "INR > 6.5", br: true, b: true }, { t: "or any three of:", br: true, i: true },
        { t: "Age < 10 or > 40", br: true }, { t: "Drug reaction, or indeterminate cause", br: true },
        { t: "Jaundice to encephalopathy > 7 days", br: true }, { t: "INR > 3.5", br: true }, { t: "Bilirubin > 17.5 mg/dL" },
      ] },
    ],
  ], { x: 1.2, y: 2.05, w: W - 2.4, colW: [5.47, 5.47], size: 17, rowH: [0.45, 2.6], valign: "top" });
  body(s, [{ t: "These predict death without transplant. They are not a referral threshold. Patient A: pH 7.26 on day 2", nb: true, i: true, align: "center" }],
    { y: 5.25, h: 0.8, size: 18 });
  src(s, "O'Grady 1989 criteria, as summarized in EASL 2017 [PMID: 28417882] and update 2022 [PMID: 36001996]");
  return s;
}
kcc(1).addNotes("Let them vote.");
kcc(2).addNotes("King's College criteria are specific but not very sensitive. If you wait for them, the evaluation starts too late. Patient A now meets acetaminophen criteria by pH, but the call happened on admission. Transplant referral, listing and allocation are separate decisions; the transplant team handles the last two.");
{
  const s = slide("Can plasma exchange buy time?");
  table(s, [
    ["Study", "Open randomized trial, ALF, high-volume plasma exchange for 3 days vs standard care, 182 patients"],
    ["Main finding", "Hospital survival 58.7% vs 47.8% (HR 0.56); best in patients who were not transplanted"],
    ["What it doesn't show", { t: "Not blinded; one regimen in one population. Says nothing about ACLF or about albumin dialysis devices", b: true }],
    ["So", "A bridge to discuss with transplant hepatology. Not a reason to delay listing"],
  ], { x: 0.9, y: 1.6, w: W - 1.8, colW: [2.8, 8.73], size: 18, rowH: [1.0, 1.0, 1.1, 0.9], header: false });
  src(s, "Larsen FS et al. J Hepatol 2016 [PMID: 26325537]");
  s.addNotes("High-volume plasma exchange removes cytokines and DAMPs and replaces coagulation factors. Note the INR after plasma exchange is no longer the patient's INR.");
}
{
  const s = slide("Patient A: what decides the next 24 hours?");
  body(s, [
    "Is she listed, and how urgently?",
    "Pupils and the neuro exam, ammonia on CRRT, sodium on target",
    "Vasopressor dose and lactate trend",
    "New infection",
    "Anything that would close the transplant window: fixed dilated pupils, uncontrolled sepsis, rising support despite everything",
  ], { size: 22, gap: 14 });
  s.addNotes("We are not going to tell you what happened to her. The point is what you reassess, and how often. Now, bed 7.");
}

// ---------------------------------------------------------------- Patient B
sec("Patient B: ACLF");
const B_TITLE = "56-year-old man with cirrhosis and fever";
const B_LABS = [
  ["", "Now", "Baseline"],
  ["Bilirubin (mg/dL)", { t: "5.8", red: true }, "2.1"],
  ["INR", { t: "2.1", red: true }, "1.6"],
  ["Creatinine (mg/dL)", { t: "2.6", red: true }, "0.9"],
  ["Sodium (mmol/L)", { t: "127", red: true }, "133"],
  ["WBC (/μL)", { t: "16,200", red: true }, ""],
  ["Platelets (/μL)", { t: "62,000", red: true }, ""],
  ["Lactate (mmol/L)", { t: "3.9", red: true }, ""],
];
function caseB(step) {
  const s = slide(B_TITLE, { bold: true });
  body(s, [
    "Alcohol-related cirrhosis, ascites on diuretics; last drink 3 weeks ago",
    "Temp 38.4 °C, HR 112, BP 82/46",
    "RR 26, SpO2 92% on 4 L",
    "Confused, asterixis (grade II)",
    "Urine output 15 mL/h",
  ], { x: 0.7, y: 1.5, w: 6.4, h: 3.7, size: 19 });
  table(s, B_LABS, { x: 7.4, y: 1.5, w: 5.3, colW: [2.5, 1.4, 1.4], size: 15, rowH: 0.42 });
  if (step === 1) q(s, "Is this just decompensated cirrhosis?", 5.6);
  if (step === 2) {
    q(s, "Is this just decompensated cirrhosis?", 5.3, { size: 22 });
    q(s, "What would make it ACLF? Count the failing organs", 5.95, { hl: true, size: 22 });
  }
  return s;
}
caseB(1).addNotes("Made-up patient. Same night, bed 7. After 2 L of fluid he is on norepinephrine 0.15 mcg/kg/min.");
caseB(2).addNotes("Acute decompensation alone is not ACLF. ACLF means organ failure, and the definition you use matters.");
{
  const s = slide("ALF, decompensation or ACLF?");
  table(s, [
    ["", "Acute liver failure", "Acute decompensation", "ACLF"],
    [{ t: "Liver before", b: true }, "No cirrhosis", "Cirrhosis", "Cirrhosis (or chronic liver disease, depending on definition)"],
    [{ t: "What defines it", b: true }, "INR ≥ 1.5 + encephalopathy", "Ascites, bleeding, encephalopathy, jaundice", "Decompensation + organ failure"],
    [{ t: "What usually kills", b: true }, "Brain, multiorgan failure, sepsis", "Usually not this admission", "Infection, shock, multiorgan failure"],
    [{ t: "ICU focus", b: true }, "Brain, ammonia, early CRRT", "Treat the trigger", "Source control, shock, kidney vs lung"],
    [{ t: "Transplant", b: true }, "Urgent listing pathway", "Routine evaluation", "Narrow window; reassess daily"],
  ], { x: 0.6, y: 1.4, w: W - 1.2, colW: [2.2, 3.2, 3.2, 3.53], size: 16, rowH: [0.5, 0.95, 0.8, 0.8, 0.8, 0.8] });
  src(s, "EASL ALF 2017 [PMID: 28417882]; EASL ACLF 2023 [PMID: 37364789]");
  s.addNotes("Patient A is in the first column, patient B in the last. The words sound alike; the ICU problems are different.");
}
const OF_HEAD = ["Organ", "Failure (EASL-CLIF)", "Patient B"];
const OF_ROWS = [
  ["Liver", "Bilirubin ≥ 12 mg/dL", "5.8: no"],
  ["Kidney", "Creatinine ≥ 2.0 mg/dL or on RRT", { t: "2.6: yes", hl: true, b: true }],
  ["Brain", "Encephalopathy grade III-IV", "Grade II: no"],
  ["Coagulation", "INR ≥ 2.5", "2.1: no"],
  ["Circulation", "Vasopressors (or terlipressin)", { t: "Norepinephrine: yes", hl: true, b: true }],
  ["Lungs", "PaO2/FiO2 ≤ 200, SpO2/FiO2 ≤ 214, or ventilated (not for encephalopathy)", "SpO2/FiO2 about 255: no"],
];
function organs(step) {
  const s = slide("Count the failing organs");
  const rows = [OF_HEAD.slice(0, step === 1 ? 2 : 3)].concat(OF_ROWS.map((r) => r.slice(0, step === 1 ? 2 : 3)));
  table(s, rows, { x: 0.7, y: 1.4, w: step === 1 ? 9.0 : W - 1.4, colW: step === 1 ? [2.3, 6.7] : [2.0, 6.2, 3.73], size: 17, rowH: [0.5, 0.6, 0.6, 0.6, 0.6, 0.6, 0.85] });
  if (step === 2) q(s, "Two organ failures: ACLF grade 2", 6.0, { hl: true, size: 26 });
  src(s, "CLIF-C organ failure score, EASL ACLF 2023 [PMID: 37364789]; CANONIC [PMID: 23474284]");
  return s;
}
organs(1).addNotes("Have the room count with you. Liver failure here means a bilirubin of 12, which surprises people.");
organs(2).addNotes("Kidney and circulation. Respiratory is borderline: 92% on 4 L is roughly an SpO2/FiO2 of 255 if you estimate FiO2 at about 0.36. Watch that row.");
{
  const s = slide("ACLF grades");
  table(s, [
    ["Grade", "What it takes", "28-day mortality (CANONIC)"],
    ["No ACLF", "No organ failure, or one non-kidney failure with creatinine < 1.5 and no encephalopathy", "About 5%"],
    ["ACLF 1", "Kidney failure alone; or one other organ failure plus creatinine 1.5 to 1.9 and/or grade I-II encephalopathy", "About 22%"],
    ["ACLF 2", "Two organ failures", "About 32%"],
    ["ACLF 3", "Three or more", { t: "More than 75%", b: true, red: true }],
  ], { x: 0.7, y: 1.5, w: W - 1.4, colW: [1.9, 6.9, 3.13], size: 17, rowH: [0.5, 1.0, 1.15, 0.6, 0.6] });
  body(s, [{ t: "Population numbers from a 2013 cohort. They describe groups, not your patient", nb: true, i: true, align: "center" }],
    { y: 5.7, h: 0.6, size: 18 });
  src(s, "Moreau R et al. Gastroenterology 2013 [PMID: 23474284]; EASL ACLF 2023 [PMID: 37364789]");
  s.addNotes("Grade 1 is the confusing one: kidney failure alone counts, but a single non-kidney organ failure counts only with some kidney dysfunction or mild encephalopathy. Use the CLIF-C calculator rather than memorizing it. The grade at days 3 to 7 says more than the grade at admission.");
}
{
  const s = slide("Which ACLF?");
  table(s, [
    ["", "EASL-CLIF", "NACSELD", "APASL"],
    ["Who", "Cirrhosis with acute decompensation", "Cirrhosis, hospitalized", "Chronic liver disease, with or without cirrhosis"],
    ["Defined by", "Organ failures (CLIF-C)", "Two or more extrahepatic failures: shock, grade III-IV HE, dialysis, ventilation", "Jaundice (bilirubin ≥ 5) and INR ≥ 1.5, then ascites or HE within 4 weeks"],
    ["Picks up", "Broader, earlier", "Sicker patients", "A primary liver insult"],
  ], { x: 0.6, y: 1.5, w: W - 1.2, colW: [1.8, 3.4, 3.6, 3.33], size: 16, rowH: [0.5, 0.9, 1.4, 0.75] });
  q(s, "They find different patients. Say which one you're using", 5.6, { size: 22 });
  src(s, "Kyoto consensus 2025 [PMID: 39961976]; ACG ACLF 2022 [PMID: 35006099]; AASLD 2024 [PMID: 37939273]");
  s.addNotes("Not worth memorizing all three. Worth knowing that a paper's 'ACLF' may not be your patient's ACLF. We use EASL-CLIF for the rest of this talk.");
}
function tap(step) {
  const s = slide("What tipped him over?");
  if (step === 1) { q(s, "INR 2.1, platelets 62,000. Do you tap him?", 3.0, { size: 30 }); return s; }
  body(s, [
    { runs: [{ t: "Yes, now. ", b: true }, { t: "No plasma, no platelets", hl: true, b: true }] },
    { runs: ["Ascitic fluid: ", { t: "PMN 1,240/mm³", b: true, red: true }, ". Spontaneous bacterial peritonitis"] },
    { t: "Common triggers", b: true, nb: true, gap: 18 },
    "Infection: SBP, pneumonia, urine, lines, C. difficile",
    "Alcohol-associated hepatitis",
    "GI bleeding",
    "Drugs: NSAIDs, sedatives, too much diuretic",
    "HBV flare, ischemia",
    "No trigger is found in some patients. Repeat the search if he gets worse",
  ], { y: 1.45, h: 5.4, size: 20 });
  src(s, "EASL ACLF 2023 [PMID: 37364789]; SCCM 2023 [PMID: 37052436]");
  return s;
}
tap(1).addNotes("Ask what tipped him over before showing the answer. Then the procedural question: people hesitate to tap a coagulopathic patient.");
tap(2).addNotes("Diagnostic paracentesis is low risk and should not wait for correction of the INR or platelets. Infection is the most common precipitant of ACLF in Western cohorts.");
{
  const s = slide("Why is he hypotensive?");
  table(s, [
    ["Mechanism", "What you do"],
    ["Sepsis (SBP)", "Cultures, antibiotics in the first hour, source control. Cover for prior exposure and local resistance"],
    ["Splanchnic vasodilation of cirrhosis", "Norepinephrine. Start at MAP 65 and adjust to perfusion"],
    ["Too little volume, or too much", "Ultrasound and dynamic measures. Edema does not mean the vessels are full"],
    ["Hidden bleeding", "Hemoglobin, rectal exam, think varices"],
    ["Relative adrenal insufficiency", "Hydrocortisone if shock is refractory"],
    ["Cirrhotic cardiomyopathy", "Echo"],
  ], { x: 0.8, y: 1.4, w: W - 1.6, colW: [4.0, 7.73], size: 17, rowH: [0.5, 0.85, 0.7, 0.7, 0.6, 0.6, 0.6] });
  q(s, "Usually more than one of these", 6.15, { size: 22 });
  src(s, "Surviving Sepsis 2026 [PMID: 41869847]; SCCM 2020 [PMID: 32058387]; EASL ACLF 2023 [PMID: 37364789]");
  s.addNotes("Albumin is a reasonable resuscitation fluid in cirrhosis, but every bag goes somewhere. Keep that in mind for the next few slides.");
}
function hrs(step) {
  const s = slide("Does he have HRS?");
  body(s, [{ t: "Evening: creatinine 3.0, urine 10 mL/h, still on norepinephrine", nb: true, align: "center", i: true }], { y: 1.3, h: 0.5, size: 19 });
  if (step === 1) { q(s, "HRS? Start terlipressin?", 3.3, { size: 30 }); return s; }
  table(s, [
    ["What many of us learned (ICA 2015)", "Now (ADQI-ICA 2024)"],
    [
      { t: [{ t: "No response after 2 days of diuretic withdrawal and albumin 1 g/kg", br: true }, { t: "No shock", br: true }, { t: "No nephrotoxins, no structural kidney disease" }] },
      { t: [{ t: "Cirrhosis with ascites", br: true }, { t: "AKI by creatinine and/or urine output", br: true }, { t: "No response after at least 24 hours of volume resuscitation, when needed", br: true }, { t: "No strong alternative explanation as the main cause" }] },
    ],
  ], { x: 0.8, y: 2.0, w: W - 1.6, colW: [5.86, 5.87], size: 18, rowH: [0.5, 1.9], valign: "top" });
  q(s, "Septic shock on norepinephrine is a strong alternative. Treat the shock first", 5.3, { hl: true, size: 21 });
  src(s, "ADQI-ICA consensus, J Hepatol 2024 [PMID: 38527522]");
  return s;
}
hrs(1).addNotes("The reflex in many units: oliguric cirrhotic, give albumin for 48 hours, then terlipressin.");
hrs(2).addNotes("The mandatory 48-hour albumin challenge is gone. Assessment is faster and individualized. But that cuts both ways: you also need to look for the other causes, and right now sepsis is the obvious one.");
{
  const s = slide("Kidney failure in cirrhosis is usually a mixture");
  body(s, [
    { t: "Possible contributors", b: true, nb: true },
    "Low effective volume",
    "Tubular injury: sepsis, contrast, drugs",
    "HRS physiology",
    "Tense ascites (abdominal compartment)",
    "Congestion",
  ], { x: 0.7, y: 1.4, w: 5.8, h: 5.0, size: 20 });
  body(s, [
    { t: "Look", b: true, nb: true },
    "Urinalysis and sediment",
    "Drug list",
    "Ultrasound: kidneys, bladder, IVC, heart, lungs",
    "Bladder pressure if the belly is tight",
    { runs: ["A low urine sodium is ", { t: "not", b: true }, " proof of HRS"] },
  ], { x: 6.8, y: 1.4, w: 5.9, h: 5.0, size: 20 });
  src(s, "ADQI-ICA consensus 2024 [PMID: 38527522]");
  s.addNotes("These coexist and change over the admission. A diagnosis of HRS made on day 1 should be re-examined on day 2.");
}
const B2_ROWS = [
  ["", "Admission", "Day 2"],
  ["Albumin received", "", "110 g (SBP dose) + 2 L crystalloid"],
  ["Breathing", "SpO2 92% on 4 L", { t: "SpO2 86% on 6 L, RR 32, crackles", red: true, b: true }],
  ["Ultrasound", "", { t: "Diffuse B-lines, IVC full", red: true }],
  ["Creatinine (mg/dL)", "2.6", { t: "3.1", red: true }],
  ["Urine output", "15 mL/h", { t: "10 mL/h", red: true }],
  ["Norepinephrine (mcg/kg/min)", "0.15", "0.22"],
];
function day2B(step) {
  const s = slide("Day 2: worse kidney, worse lungs");
  table(s, B2_ROWS, { x: 1.2, y: 1.4, w: W - 2.4, colW: [2.9, 3.0, 5.03], size: 17, rowH: 0.5 });
  if (step === 1) q(s, "More albumin? Terlipressin? Something else?", 5.4, { size: 26 });
  if (step === 2) {
    q(s, "First, what are the lungs telling you?", 5.2, { size: 24 });
    q(s, "Now on high-flow, FiO2 0.6, SpO2 90%: SpO2/FiO2 150. That's a third organ failure", 5.9, { hl: true, size: 20 });
  }
  return s;
}
day2B(1).addNotes("This is the hinge of the second case. The kidney is worse, and the reflex is to treat the kidney.");
day2B(2).addNotes("Kidney, circulation and now lungs: ACLF grade 3. Respiratory failure here partly came from what we gave him.");
{
  const s = slide("Will fixing the kidney hurt the lungs?");
  body(s, [
    { runs: [{ t: "Terlipressin: not for him today", b: true }] },
    { t: "Label: contraindicated with hypoxia or worsening respiratory symptoms; don't start if SpO2 < 90%, stop if it falls below 90%", lvl: 1 },
    { t: "Label: avoid in ACLF grade 3; volume overload raises the risk of respiratory failure", lvl: 1 },
    "Stop the albumin while he is wet",
    "He is already on a vasoconstrictor. Norepinephrine, titrated to perfusion",
    "If he can't make urine, RRT to take the fluid off",
    "Midodrine and octreotide? Not in someone on IV pressors",
  ], { y: 1.4, h: 4.6, size: 20 });
  q(s, "Check oxygen and volume before any kidney treatment", 6.05, { hl: true, size: 20 });
  src(s, "TERLIVAZ prescribing information, revised 6/2026; ADQI-ICA 2024 [PMID: 38527522]");
  s.addNotes("Before any terlipressin dose: baseline SpO2, lung exam, volume status, and whether he is ACLF grade 3. Norepinephrine is an ICU alternative for HRS when terlipressin is contraindicated or unavailable. RRT in ACLF should follow usual indications plus trajectory and transplant potential; avoid the rule 'dialysis only if listed'. A time-limited trial is reasonable.");
}
{
  const s = slide("Does HRS reversal mean survival?");
  table(s, [
    ["Study", "CONFIRM: terlipressin + albumin vs placebo + albumin, type 1 HRS, 300 patients"],
    ["Main finding", "Verified HRS reversal 32% vs 17%"],
    ["The catch", { t: "Death from respiratory disorders by day 90: 11% vs 2%. Respiratory failure about 14% vs 5% (label)", b: true }],
    ["What it doesn't show", "A survival benefit. 90-day mortality was not different"],
  ], { x: 0.9, y: 1.6, w: W - 1.8, colW: [2.8, 8.73], size: 18, rowH: [0.9, 0.8, 1.1, 0.9], header: false });
  src(s, "Wong F et al. NEJM 2021 [PMID: 33657294]; TERLIVAZ prescribing information, revised 6/2026");
  s.addNotes("The respiratory harm clustered in patients with volume overload and ACLF grade 3, which is how the label language came about. The label's own reanalysis gives slightly different reversal numbers (29% vs 16%); either way the direction is the same.");
}
{
  const s = slide("Should we treat the albumin number?");
  table(s, [
    ["Study", "ATTIRE: daily albumin to keep serum albumin ≥ 30 g/L vs standard care, hospitalized decompensated cirrhosis, 777 patients"],
    ["Main finding", "No difference in infection, kidney dysfunction or death (29.7% vs 30.2%)"],
    ["The catch", { t: "More serious adverse events with albumin, including fluid overload and pulmonary edema", b: true }],
  ], { x: 0.9, y: 1.4, w: W - 1.8, colW: [2.8, 8.73], size: 17, rowH: [1.0, 0.75, 0.85], header: false });
  body(s, [
    { t: "When albumin is indicated", b: true, nb: true },
    "SBP: 1.5 g/kg on day 1, 1 g/kg on day 3",
    "Paracentesis over 5 L: 6 to 8 g per liter removed",
    "HRS-AKI: with a vasoconstrictor, dosed to volume status",
  ], { y: 4.35, h: 2.4, size: 19 });
  src(s, "China L et al. NEJM 2021 [PMID: 33657293]; ADQI-ICA 2024 [PMID: 38527522]");
  s.addNotes("ATTIRE doesn't invalidate albumin for its accepted uses. It does tell you that giving albumin to fix a number causes harm without benefit. Patient B got the right albumin for SBP and still got wet.");
}
function trajectory(step) {
  const s = slide("What changed since yesterday?");
  const rows = [
    ["", "Day 1", "Day 2", "Day 3", "Day 5"],
    ["Norepinephrine (mcg/kg/min)", "0.15", "0.22", "0.12", "Off"],
    ["Breathing", "4 L", "HFNC, FiO2 0.6", "HFNC, FiO2 0.4", "2 L"],
    ["Kidney", "Cr 2.6", "Cr 3.1", "CRRT started", "On CRRT"],
    ["Encephalopathy", "Grade II", "Grade II", "Grade I", "Grade I"],
    ["Bilirubin / INR", "5.8 / 2.1", "6.4 / 2.3", "6.1 / 2.2", "5.2 / 2.0"],
    ["ACLF grade", "2", { t: "3", red: true, b: true }, "2", step === 2 ? { t: "1", hl: true, b: true } : "?"],
  ];
  table(s, rows, { x: 0.7, y: 1.4, w: W - 1.4, colW: [3.33, 2.15, 2.15, 2.15, 2.15], size: 17, rowH: 0.48, align: ["left", "center", "center", "center", "center"] });
  if (step === 1) q(s, "Better or worse? What do you tell his family?", 5.6, { size: 24 });
  if (step === 2) body(s, [
    "The grade at days 3 to 7 predicts outcome better than the grade at admission",
    "Persistent ACLF 3 at days 3 to 7, especially with four or more organ failures, has a very high mortality without transplant",
    "If he is not a transplant candidate, discuss goals of care with the family and involve palliative care",
  ], { y: 4.85, h: 2.0, size: 17, gap: 4 });
  src(s, "Made-up numbers for teaching. CLIF-C ACLF score [PMID: 24950482]; EASL ACLF 2023 [PMID: 37364789]");
  return s;
}
trajectory(1).addNotes("We don't tell you how he does after day 5. The reassessment is the point.");
trajectory(2).addNotes("Grading is a snapshot; the trend is what you act on. Kidney failure on RRT still counts as an organ failure. Bring palliative care in alongside, not instead of, full support. Document what the time-limited trial is and when you'll reassess.");
{
  const s = slide("Too sick for a transplant, or sick enough to need one?");
  body(s, [
    "A ventilator, pressors or dialysis do not by themselves exclude transplant",
    "Selected patients with ACLF grade 3 do well after transplant. The window is short",
    { t: "What closes the window", b: true, nb: true, gap: 16 },
    "Uncontrolled infection",
    "Rising vasopressor needs, severe respiratory failure",
    "Irreversible brain injury",
    "Frailty and comorbidity",
    "Alcohol: centers now evaluate individually rather than by a fixed abstinence rule",
  ], { y: 1.4, h: 5.4, size: 20 });
  src(s, "Lancet Gastroenterol Hepatol 2024 [PMID: 38309288]; AASLD/AST candidate evaluation 2026 [PMID: 41405234]; EASL ACLF 2023 [PMID: 37364789]");
  s.addNotes("Referral, candidacy, listing and allocation are four different decisions. The ICU team owns the referral and the information. Status 1A and other allocation rules: check current OPTN policy before quoting them.");
}
{
  const s = slide("Calling hepatology: have this ready");
  table(s, [
    ["Patient A (ALF)", "Patient B (ACLF)"],
    [
      { t: [
        { t: "Cause and time course (days from jaundice to encephalopathy)", br: true },
        { t: "Encephalopathy grade, pupils, sedation", br: true },
        { t: "Airway and ventilator settings", br: true },
        { t: "Ammonia, sodium, CRRT", br: true },
        { t: "INR, lactate, pH, glucose trends", br: true },
        { t: "Pressors, infection", br: true },
        { t: "Social support, intent of ingestion" },
      ] },
      { t: [
        { t: "Cause of cirrhosis, recent alcohol use", br: true },
        { t: "Precipitant and source control", br: true },
        { t: "Organ failures today and yesterday", br: true },
        { t: "Pressor dose, oxygen, RRT", br: true },
        { t: "MELD, CLIF-C scores", br: true },
        { t: "Frailty, comorbidities", br: true },
        { t: "Prior transplant evaluation, support" },
      ] },
    ],
  ], { x: 0.9, y: 1.5, w: W - 1.8, colW: [5.76, 5.77], size: 19, rowH: [0.5, 3.2], valign: "top" });
  s.addNotes("A good call makes the transplant team's decision faster. Trends, not single values.");
}
{
  const s = slide("ALF and ACLF: what changes at the bedside");
  table(s, [
    ["", "Acute liver failure", "ACLF"],
    [{ t: "Ammonia", b: true }, "Predicts cerebral edema. Act on it (CRRT)", "Doesn't diagnose HE. Don't trend it to dose lactulose"],
    [{ t: "Lactulose", b: true }, "Not established; bowel distension can complicate surgery", "Yes for overt HE (plus rifaximin), avoid dehydration"],
    [{ t: "Sodium", b: true }, "Keep it high, 145 to 155 (center protocol)", "Often chronically low: correct slowly, no more than 8 mmol/L a day"],
    [{ t: "Antibiotics", b: true }, "No routine prophylaxis; low threshold to treat", "Treat infection; prophylaxis with GI bleeding"],
    [{ t: "INR", b: true }, "Prognosis, not bleeding risk", "Same"],
  ], { x: 0.6, y: 1.4, w: W - 1.2, colW: [2.0, 5.06, 5.07], size: 17, rowH: [0.5, 0.85, 0.85, 0.85, 0.85, 0.6] });
  src(s, "ACG ALF 2023 [PMID: 37377263]; SCCM 2023 [PMID: 37052436]; update 2022 [PMID: 36001996]");
  s.addNotes("Probably the most useful slide to photograph. The sodium row is where people get hurt: an induced-hypernatremia target transferred into a chronically hyponatremic cirrhotic causes osmotic demyelination.");
}

// ---------------------------------------------------------------- Closing
sec("Closing");
{
  const s = slide("Back to our patients");
  body(s, [
    "Which one needed transplant hepatology before the tests came back?",
    "Why did a falling ALT make you more worried?",
    "When is CRRT right before the creatinine is high?",
    "Why isn't lactulose for ACLF evidence for ALF?",
    "Why were albumin and terlipressin the wrong next step for bed 7?",
    "What would make you change yesterday's plan?",
  ], { size: 22, gap: 14, x: 1.4, w: W - 2.8 });
  s.addNotes("Ask the room. Don't put the answers up.");
}
{
  const s = slide("Take home");
  body(s, [
    "Big enzymes don't make it liver failure. Get an INR and examine the patient",
    "Stabilize, treat the cause and call transplant hepatology in the same hour",
    { runs: ["ALF: ", { t: "protect the brain", b: true }, ". Intubate at grade III, keep the CO2 normal and the sodium up, and start CRRT for rising ammonia"] },
    "ACLF: count the organs, find the trigger",
    "ACLF: check oxygenation and volume status before albumin or terlipressin",
    "Reassess organ failures daily. The trend matters more than the admission score",
  ], { size: 22, gap: 14 });
}
{
  const s = slide(null, { master: "BLANK" });
  s.addText("Questions?", { x: 0.8, y: 2.8, w: W - 1.6, h: 1.4, fontFace: "Georgia", fontSize: 54, align: "center",
    valign: "middle", color: "000000", isTextBox: true, margin: 0 });
}

// ---------------------------------------------------------------- Appendix
sec("Appendix");
{
  const s = slide("Appendix: West Haven grades");
  table(s, [
    ["Grade", "What you see"],
    ["I", "Short attention, mild confusion, reversed sleep, subtle personality change"],
    ["II", "Lethargy, disorientation to time, obvious personality change, asterixis"],
    ["III", "Somnolent but rousable to voice or pain, grossly disoriented, bizarre behavior"],
    ["IV", "Coma"],
  ], { x: 1.2, y: 1.6, w: W - 2.4, colW: [1.4, 9.53], size: 18, rowH: [0.5, 0.8, 0.8, 0.8, 0.6] });
  s.addNotes("In ALF, grade III-IV is the intubation and ICP-risk threshold.");
}
{
  const s = slide("Appendix: sources (1)");
  body(s, [
    "SCCM ALF/ACLF ICU guidelines, part 1. Crit Care Med 2020 [PMID: 32058387]",
    "SCCM ALF/ACLF ICU guidelines, part 2. Crit Care Med 2023 [PMID: 37052436]",
    "EASL acute liver failure guideline. J Hepatol 2017 [PMID: 28417882]",
    "ACG acute liver failure guideline. Am J Gastroenterol 2023 [PMID: 37377263]",
    "Management of acute liver failure: update 2022. Semin Liver Dis [PMID: 36001996]",
    "Acute liver failure: a practical update. JHEP Rep 2024 [PMID: 39170946]",
    "EASL ACLF guideline. J Hepatol 2023 [PMID: 37364789]",
    "AASLD ACLF and critically ill cirrhosis guidance. Hepatology 2024 [PMID: 37939273], errata [PMID: 38551831], [PMID: 42467893]",
    "ACG ACLF guideline. Am J Gastroenterol 2022 [PMID: 35006099]",
    "ADQI-ICA consensus on AKI in cirrhosis. J Hepatol 2024 [PMID: 38527522]",
    "Surviving Sepsis Campaign 2026. Crit Care Med [PMID: 41869847]",
    "EASL autoimmune hepatitis guideline. J Hepatol 2025 [PMID: 40348684]",
  ], { size: 15, gap: 4, y: 1.35, h: 5.5 });
}
{
  const s = slide("Appendix: sources (2)");
  body(s, [
    "Moreau R et al. CANONIC. Gastroenterology 2013 [PMID: 23474284]",
    "Jalan R et al. CLIF-C ACLF score. J Hepatol 2014 [PMID: 24950482]",
    "Lee WM et al. NAC in non-acetaminophen ALF. Gastroenterology 2009 [PMID: 19524577]",
    "Clemmesen JO et al. Cerebral herniation and arterial ammonia. Hepatology 1999;29:648-53",
    "Bernal W et al. Arterial ammonia, HE and intracranial hypertension. Hepatology 2007 [PMID: 17685471]",
    "Bhatia V et al. Arterial ammonia in ALF. Gut 2006;55:98-104",
    "Kumar R et al. Persistent hyperammonemia in ALF. Clin Gastroenterol Hepatol 2012;10:925-31",
    "Cardoso FS et al. CRRT and ammonia in ALF. Hepatology 2018 [PMID: 28859230]",
    "Pre-emptive CRRT in ALF with cerebral edema. Aliment Pharmacol Ther 2026 [PMID: 42332991]",
    "Larsen FS et al. High-volume plasma exchange. J Hepatol 2016 [PMID: 26325537]",
    "Wong F et al. CONFIRM. NEJM 2021 [PMID: 33657294]",
    "China L et al. ATTIRE. NEJM 2021 [PMID: 33657293]",
    "Liver transplantation for ACLF. Lancet Gastroenterol Hepatol 2024 [PMID: 38309288]",
    "AASLD/AST candidate evaluation guideline. Hepatology 2026 [PMID: 41405234]",
    "Kyoto consensus on ACLF. Hepatol Int 2025 [PMID: 39961976]",
    "TERLIVAZ (terlipressin) prescribing information, revised 6/2026",
  ], { size: 15, gap: 4, y: 1.35, h: 5.5 });
}

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
