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
  const data = rows.map((r, ri) => r.map((c, ci) => {
    if (c == null) c = "";
    if (typeof c === "string") c = { t: c };
    const header = o.header !== false && ri === 0;
    const runs = Array.isArray(c.t) ? c.t : [c];
    const text = runs.map((rr, k) => {
      if (typeof rr === "string") rr = { t: rr };
      const ro = { fontFace: TBL_FONT, fontSize: rr.size || c.size || fs };
      if (rr.b || header || c.b) ro.bold = true;
      if (rr.red || c.red) ro.color = RED;
      else if (rr.grey || c.grey) ro.color = "8C8C8C";
      if (rr.hl || c.hl) ro.highlight = HL;
      if (rr.i || c.i) ro.italic = true;
      if (rr.br) ro.breakLine = true;
      return { text: rr.t, options: ro };
    });
    return { text, options: {
      fill: { color: c.fill || (header ? (o.headFill || "F2F2F2") : "FFFFFF") },
      align: c.align || (o.align && o.align[ci]) || "left",
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

const IMG = path.join(__dirname, "img");

// Bar chart in the deck's style: white, black and grey, red only for the harmful value, labels on the bars
function bars(s, data, o) {
  s.addChart(pres.charts.BAR, data, {
    x: o.x, y: o.y, w: o.w, h: o.h, barDir: "col", barGrouping: "clustered", barGapWidthPct: o.gap || 60,
    chartColors: o.colors || ["000000", "A6A6A6"],
    valAxisMinVal: 0, valAxisMaxVal: o.max || 100, valAxisMajorUnit: o.unit || 25,
    valAxisLabelFormatCode: o.valFmt || '0"%"', valAxisHidden: !!o.hideVal,
    valGridLine: { color: "E3E3E3", size: 0.5 }, catGridLine: { style: "none" },
    catAxisLabelFontFace: TBL_FONT, valAxisLabelFontFace: TBL_FONT, catAxisLabelFontSize: o.catSize || 15, valAxisLabelFontSize: 12,
    catAxisLabelColor: "000000", valAxisLabelColor: GREY,
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: o.fmt || '0"%"', dataLabelFontSize: o.labSize || 16,
    dataLabelFontFace: TBL_FONT, dataLabelColor: "000000", dataLabelFontBold: true,
    showLegend: !!o.legend, legendPos: "b", legendFontFace: TBL_FONT, legendFontSize: 14,
    showTitle: !!o.title, title: o.title, titleFontFace: "Georgia", titleFontSize: 16, titleColor: "000000",
    layout: o.layout,
  });
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
    "Disoriented to time, asterixis. Still there after the glucose is fixed",
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
    { t: "AASLD and ACG: chronic liver disease without cirrhosis still allows ALF. EASL: no prior liver disease at all", lvl: 1 },
    { t: "Wilson disease, autoimmune hepatitis and vertically acquired HBV can still count if recognized within 26 weeks", lvl: 1 },
  ], { x: 0.8, y: 1.3, w: W - 1.6, h: 2.6, size: 20 });
  table(s, [
    ["Jaundice to encephalopathy", "Hyperacute (< 1 week)", "Acute (1 to 4 weeks)", "Subacute (4 to 12 weeks)"],
    ["Typical causes", "Acetaminophen, HAV, HEV, ischemia", "HBV", "Idiosyncratic drug injury, AIH, indeterminate"],
    ["Cerebral edema", { t: "Common", b: true }, "Less common", "Uncommon"],
    ["Recovery without transplant", "More likely", "Intermediate", { t: "Less likely", b: true }],
  ], { x: 0.8, y: 4.15, w: W - 1.6, colW: [3.0, 2.9, 2.9, 2.93], size: 15, rowH: 0.55 });
  src(s, "EASL ALF guideline 2017 [PMID: 28417882]; ACG ALF 2023 [PMID: 37377263]; Management of ALF: update 2022 [PMID: 36001996]");
  s.addNotes("The time course is not trivia. The faster it comes on, the more you worry about the brain, and paradoxically the better the chance of spontaneous recovery. The slow ones have less cerebral edema but do worse without a transplant. Patient A is hyperacute.");
}
function features(step) {
  const s = slide("What else fails?");
  if (step === 1) { q(s, "It's called liver failure. Which other organs fail?", 3.2, { size: 28 }); return s; }
  s.addImage({ path: path.join(IMG, "alf-features.png"), x: (W - 5.25) / 2, y: 1.3, w: 5.25, h: 5.33, altText: "Clinical features of acute liver failure by organ" });
  src(s, "Bernal W, Wendon J. N Engl J Med 2013;369:2525-34, Figure 1");
  return s;
}
features(1).addNotes("Let them list organs. Most will get brain and kidney. Fewer think of the adrenals, the marrow or the immune system.");
features(2).addNotes("This is why these patients are ICU patients. Hypoglycemia, lactic acidosis, vasodilatory shock, relative adrenal insufficiency, AKI, lung injury and a high risk of infection. The liver is one organ on this picture.");
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
    { runs: [{ t: "One acute ingestion at a known time: it tells you when NOT to give NAC", b: true, hl: true }] },
    "Late, repeated or unknown-time ingestion: a low level doesn't rule out liver injury",
    { t: "If she had taken it all at once", b: true, nb: true, gap: 16 },
    "8 hours: 12 is below the line, no NAC",
    "20 hours: above the line, NAC",
    { runs: ["But it was 3 days of repeated doses. ", { t: "There is no time zero", b: true }, ". Give NAC"] },
  ], { x: 8.3, y: 1.4, w: 4.6, h: 5.4, size: 18 });
  src(s, "Rumack BH, Matthew H. Pediatrics 1975; US/Canada acetaminophen consensus 2023 [PMID: 37552484]");
  s.addNotes("Show them what it is first: a semi-log plot, the line halves every 4 hours (a half-life of about 4 hours), and the US treatment line sits 25% below the original 200 line for a safety margin. Then try to put her on it. Her 12 crosses the treatment line at roughly 18 to 19 hours. Before that she looks fine, after that she needs NAC. The point to leave them with: the nomogram is a tool for deciding who can safely go without NAC after a single timed ingestion. It is not the trigger for starting NAC in someone who is already sick. Call poison control or toxicology early. Opioids, including the codeine in her Tylenol with codeine, can slow absorption, so a single early level can mislead after an acute ingestion. With repeated supratherapeutic dosing over 3 days there is no single ingestion time, so it can't clear her, and she gets NAC.");
}
caseA_apap(2).addNotes("An undetectable or low level late in the course does not exclude acetaminophen toxicity [PMID: 36001996]. NAC is safe enough that the threshold to start it is low. Dosing per your pharmacy protocol.");
{
  const s = slide("NAC for every kind of acute liver failure?");
  body(s, [{ t: "Adult non-acetaminophen ALF, randomized, NAC vs placebo, 173 patients", nb: true, i: true, align: "center" }],
    { y: 1.25, h: 0.5, size: 19 });
  bars(s, [
    { name: "NAC", labels: ["Coma grade I-II", "Coma grade III-IV", "All patients"], values: [52, 9, 40] },
    { name: "Placebo", labels: ["Coma grade I-II", "Coma grade III-IV", "All patients"], values: [30, 22, 27] },
  ], { x: 0.7, y: 1.8, w: 7.9, h: 4.1, max: 75, legend: true, title: "Transplant-free survival at 3 weeks" });
  bars(s, [
    { name: "NAC", labels: ["All patients"], values: [70] },
    { name: "Placebo", labels: ["All patients"], values: [66] },
  ], { x: 8.9, y: 1.8, w: 3.7, h: 3.62, max: 75, title: "Overall survival at 3 weeks", gap: 80 });
  body(s, [{ t: "Reasonable in early non-acetaminophen ALF. Don't extrapolate to advanced coma, children or ACLF", nb: true, align: "center", b: true }],
    { y: 6.05, h: 0.7, size: 19 });
  src(s, "Lee WM et al. Gastroenterology 2009 [PMID: 19524577]");
  s.addNotes("Overall survival at 3 weeks was not different. The transplant-free survival benefit was in coma grade I-II, which is a subgroup. That doesn't support NAC in advanced non-acetaminophen ALF or in ACLF. ACG 2023 suggests NAC in non-acetaminophen ALF; this trial is why the early-coma patients are the ones most likely to benefit. And don't carry the grade III-IV result over to Patient A: in acetaminophen ALF, NAC continues when she gets worse.");
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
function apxAmmonia() {
  const s = slide("Appendix: arterial ammonia studies in ALF");
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
  src(s, "Clemmesen 1999 [PMID: 10051463]; Bhatia 2006 [PMID: 16024550]; Bernal 2007 [PMID: 17685471]; Kumar 2012 [PMID: 22521861]");
  s.addNotes("All four used arterial ammonia, measured in micromoles per liter. The pattern is consistent: higher and more persistent ammonia, more cerebral edema and death. But no single cutoff works on its own. In Bernal's King's cohort, more than 200 meant intracranial hypertension in 55%, yet most patients who developed ICH were below 200. So use it as a risk marker together with the grade of encephalopathy, the time course and the trend. Patient A went 182 then 214. That's the trajectory you act on with CRRT. Practical point: whatever you send, arterial or venous, put it on ice and get it run quickly. A delayed sample reads falsely high. In cirrhosis, by contrast, a single ammonia doesn't diagnose HE and shouldn't be trended to dose lactulose.");
}
{
  const s = slide("Ammonia: how high is too high?");
  s.addImage({ path: path.join(IMG, "ammonia-bottle.png"), x: 0.35, y: 0.12, w: 0.5, h: 1.1, altText: "Bottle of household ammonia" });
  // plot area fixed so the 146 line can be drawn at the right height
  const cx = 0.6, cy = 1.3, cw = 5.6, ch = 4.1, lay = { x: 0.14, y: 0.14, w: 0.82, h: 0.72 };
  bars(s, [{ name: "Mean arterial ammonia", labels: ["Herniated (n = 14)", "No herniation (n = 30)"], values: [230, 118] }],
    { x: cx, y: cy, w: cw, h: ch, max: 250, unit: 50, valFmt: "0", fmt: "0", colors: [RED, "A6A6A6"], gap: 90,
      title: "Clemmesen 1999: ammonia, μmol/L", layout: lay });
  const y146 = cy + ch * (lay.y + lay.h * (1 - 146 / 250));
  s.addShape(pres.shapes.LINE, { x: cx + cw * lay.x, y: y146, w: cw * lay.w, h: 0,
    line: { color: "000000", width: 1.5, dashType: "dash" }, objectName: "Line146" });
  s.addText("146", { x: cx + cw * (lay.x + lay.w) - 0.6, y: y146 - 0.36, w: 0.6, h: 0.32, fontFace: TBL_FONT, fontSize: 14,
    bold: true, align: "right", color: "000000", isTextBox: true, margin: 0 });
  bars(s, [
    { name: "Ammonia ≥ 122 for 3 days", labels: ["Survival", "Cerebral edema"], values: [23, 71] },
    { name: "Ammonia falling", labels: ["Survival", "Cerebral edema"], values: [72, 37] },
  ], { x: 6.8, y: 1.3, w: 6.0, h: 4.1, max: 100, colors: [RED, "A6A6A6"], legend: true, title: "Kumar 2012: 295 patients" });
  q(s, "Above 150 to 200 and not falling: worry about the brain", 5.55, { hl: true, size: 22 });
  body(s, [{ t: "No single level rules ICH in or out. Read it with the HE grade and the trend", nb: true, i: true, align: "center" }],
    { y: 6.1, h: 0.6, size: 18 });
  src(s, "Clemmesen JO et al. Hepatology 1999 [PMID: 10051463]; Kumar R et al. Clin Gastroenterol Hepatol 2012 [PMID: 22521861]; more studies in the appendix");
  s.addNotes("Left: in Copenhagen, ammonia was drawn at the onset of grade III encephalopathy. The 14 patients who herniated had about twice the arterial ammonia of those who didn't, and all of them were above 146. Right: in Delhi, ammonia that stayed at or above 122 for three days went with a third of the survival and twice the cerebral edema of ammonia that came down. These are associations, not proof that lowering the number saves the patient, but they are why we trend it and start CRRT. In Bernal's King's cohort, more than 200 meant intracranial hypertension in 55%, yet most patients who developed ICH were below 200. Practical point: whatever you send, put it on ice and get it run quickly. A delayed sample reads falsely high. In cirrhosis, a single ammonia doesn't diagnose HE and shouldn't be trended to dose lactulose.");
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
    [{ t: "Tidal volume", b: true }, "6 mL/kg predicted body weight", "Fine, but low volumes can push the CO2 up", "Do it, and raise the rate to hold the CO2"],
    [{ t: "CO2", b: true }, "Tolerate a high CO2", "High CO2 dilates vessels and raises ICP", { t: "Aim for normal CO2. No permissive hypercapnia when ICP is a concern", b: true }],
    [{ t: "Hyperventilation", b: true }, "No", "Lowers ICP briefly; if overdone or prolonged, can cause ischemia", "Only as a short rescue for herniation"],
    [{ t: "PEEP", b: true }, "Recruit", "Very high pressures can impair venous return", "Set it for oxygen and blood pressure. PEEP is not forbidden"],
  ], { x: 0.7, y: 2.0, w: W - 1.4, colW: [2.1, 2.9, 3.4, 3.53], size: 16, rowH: [0.5, 0.75, 1.1, 0.85, 0.85] });
  src(s, "SCCM 2020 [PMID: 32058387]; practical update 2024 [PMID: 39170946]");
  return s;
}
hypercap(1).addNotes("This is the PCCM-specific tradeoff. ARDS teaching says accept hypercapnia. Neuro teaching says don't.");
hypercap(2).addNotes("Low tidal volume still applies. What changes is the CO2 target. Prophylactic hyperventilation is out; brief hyperventilation as a bridge in impending herniation is a different thing.");
{
  const s = slide("CO2 and cerebral blood flow");
  // schematic: axes from (x0, y0), PaCO2 0 to 100 mmHg across gw inches
  const x0 = 1.5, y0 = 6.0, gw = 6.6, top = 1.6;
  const px = (v) => x0 + (v / 100) * gw;
  s.addShape(pres.shapes.RECTANGLE, { x: px(35), y: top, w: px(45) - px(35), h: y0 - top, fill: { color: "EDEDED" }, line: { type: "none" }, objectName: "Target" });
  s.addText("Aim here", { x: px(28), y: top - 0.38, w: px(52) - px(28), h: 0.34, fontFace: "Georgia", fontSize: 14, bold: true,
    align: "center", color: "000000", isTextBox: true, margin: 0 });
  s.addShape(pres.shapes.LINE, { x: x0, y: y0, w: gw + 0.2, h: 0, line: { color: "000000", width: 1.25 }, objectName: "XAxis" });
  s.addShape(pres.shapes.LINE, { x: x0, y: top - 0.1, w: 0, h: y0 - top + 0.1, line: { color: "000000", width: 1.25 }, objectName: "YAxis" });
  [20, 40, 60, 80, 100].forEach((v) => {
    s.addShape(pres.shapes.LINE, { x: px(v), y: y0, w: 0, h: 0.08, line: { color: "000000", width: 1 } });
    s.addText(String(v), { x: px(v) - 0.3, y: y0 + 0.1, w: 0.6, h: 0.3, fontFace: TBL_FONT, fontSize: 14, align: "center", color: "000000", isTextBox: true, margin: 0 });
  });
  s.addText("PaCO2 (mmHg)", { x: x0, y: y0 + 0.42, w: gw, h: 0.35, fontFace: TBL_FONT, fontSize: 15, align: "center", color: "000000", isTextBox: true, margin: 0 });
  s.addText("Cerebral blood flow", { x: x0 - 2.05, y: (top + y0) / 2 - 0.18, w: 3.4, h: 0.36, rotate: 270, fontFace: TBL_FONT, fontSize: 15,
    align: "center", color: "000000", isTextBox: true, margin: 0 });
  // flat below 20, roughly linear from 20 to 80, flat above 80
  const ylo = 5.15, yhi = 2.2, cTop = yhi - 0.05;
  const pts = [[5, ylo + 0.05], [15, ylo], [25, ylo - 0.25], [75, yhi + 0.25], [85, yhi], [97, yhi - 0.05]];
  s.addShape(pres.shapes.CUSTOM_GEOMETRY, { x: px(0), y: cTop, w: gw, h: ylo + 0.15 - cTop, line: { color: "000000", width: 3 },
    points: [
      { x: px(5) - px(0), y: pts[0][1] - cTop },
      { x: px(15) - px(0), y: pts[1][1] - cTop },
      { x: px(85) - px(0), y: pts[4][1] - cTop, curve: { type: "cubic", x1: px(30) - px(0), y1: ylo - cTop, x2: px(70) - px(0), y2: yhi - cTop } },
      { x: px(97) - px(0), y: pts[5][1] - cTop },
    ], objectName: "CBFcurve" });
  s.addText("Hyperventilation: less flow, lower ICP for a short time; too much can cause ischemia", { x: px(1), y: 3.2, w: 2.0, h: 1.3,
    fontFace: "Georgia", fontSize: 14, color: "000000", isTextBox: true, margin: 0, valign: "bottom" });
  s.addText("Permissive hypercapnia: more flow, more blood volume, higher ICP", { x: px(64), y: 3.9, w: 2.3, h: 1.3,
    fontFace: "Georgia", fontSize: 14, color: RED, isTextBox: true, margin: 0, valign: "top" });
  body(s, [
    "Between about 20 and 80 mmHg, cerebral blood flow rises with PaCO2",
    "In a swollen brain, more blood volume means a higher ICP",
    "Keep PaCO2 normal. Hyperventilate only as a short bridge for herniation",
  ], { x: 8.7, y: 1.6, w: 4.2, h: 4.6, size: 19, gap: 14 });
  src(s, "Schematic, not to scale. Standard cerebral physiology");
  s.addNotes("Draw this on the board if you don't have the slide. It's the reason the ARDS habit of tolerating a high CO2 doesn't carry over to a patient with grade III-IV encephalopathy and a high ammonia.");
}
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
    "Call nephrology tonight, not in the morning",
  ], { y: 2.8, h: 4.0, size: 20 });
  src(s, "ACG ALF guideline 2023 [PMID: 37377263]; update 2022 [PMID: 36001996]");
  return s;
}
crrt(1).addNotes("Ask them. Nephrology will often say the creatinine doesn't meet criteria. That's the wrong frame for ALF.");
crrt(2).addNotes("Ammonia around 150 to 200 is a high-risk context in the literature, not a universal threshold. Look at the trajectory and the neuro exam. Coordinate the CRRT fluid with the sodium plan or the dialysis will pull her sodium back down.");
{
  const s = slide("CRRT for ammonia: what to agree on with nephrology");
  table(s, [
    ["", "What to watch and say"],
    [{ t: "Why", b: true }, "It's for the ammonia and the brain, not the creatinine. Give them the HE grade, the ammonia trend, urine output and fluid status"],
    [{ t: "Dose", b: true }, "Prescribed vs delivered. Filter clotting and downtime mean less clearance, and the ammonia climbs back. Recheck it"],
    [{ t: "Sodium", b: true }, "One plan for replacement fluid or dialysate, hypertonic saline and every other sodium source. Check the sodium often"],
    [{ t: "Safety", b: true }, "Phosphate and potassium fall. Blood pressure drops at connection. Anticoagulation per your protocol; citrate can build up in liver failure, so follow the total to ionized calcium ratio"],
  ], { x: 0.8, y: 1.45, w: W - 1.6, colW: [1.8, 9.93], size: 18, rowH: [0.5, 1.05, 1.05, 1.05, 1.3] });
  src(s, "ACG ALF 2023 [PMID: 37377263]; Cardoso FS et al. Hepatology 2018 [PMID: 28859230]; update 2022 [PMID: 36001996]");
  s.addNotes("No universal dose or ammonia target to stop at; use your center's protocol. The common failure is not the decision to start, it's a circuit that keeps clotting so the delivered clearance is a fraction of what was ordered, and a sodium plan that nobody owns.");
}
{
  const s = slide("\"CVVH doesn't clear ammonia\"");
  body(s, [
    "Ammonia is tiny (17 Da), water soluble and not protein bound",
    "It crosses the filter with the water (convection, CVVH) or down its gradient (diffusion, CVVHD)",
    "So what matters is effluent flow and hours on a working circuit, not the letters",
    { runs: ["More effluent, more clearance: ", { t: "90 vs 35 mL/kg/h", b: true }, " (Slack 2014)"] },
    { runs: ["54 ALF patients on CRRT: median ammonia ", { t: "151 → 52 μmol/L", b: true }, " by day 5 (Warrillow 2020)"] },
  ], { x: 0.7, y: 1.4, w: 6.6, h: 4.3, size: 19, gap: 10 });
  bars(s, [{ name: "Ammonia clearance", labels: ["CVVH", "CVVHD", "CVVHDF"], values: [27, 21, 20] }],
    { x: 7.5, y: 1.35, w: 5.3, h: 4.3, max: 40, unit: 10, valFmt: "0", fmt: "0", colors: ["000000", "7F7F7F", "7F7F7F"], gap: 80,
      title: "Ammonia clearance, mL/min (12 patients)" });
  q(s, "It does. About half the clearance of urea, so dose and filter life matter", 5.9, { hl: true, size: 21 });
  src(s, "Fisher C et al. Blood Purif 2022 [PMID: 35042216]; Warrillow SJ et al. Crit Care Med 2020 [PMID: 31939790]; Slack AJ et al. Liver Int 2014");
  s.addNotes("You will hear this from nephrology. The physiology says otherwise: ammonia is a small, unbound, water-soluble molecule, and it moves across a high-flux filter with convection as well as diffusion. In Fisher's study of 12 patients with liver failure the three modalities gave similar ammonia clearance at the same effluent rate (no significant difference), and in the same patients urea clearance was about 50 mL/min and creatinine 42, so ammonia clears less well than urea but clearly clears. Why the doubt? The liver and the muscle keep making it, so the level falls slowly; a clotting circuit with a lot of downtime delivers much less than what was ordered; and at low effluent doses the effect is small. In Warrillow's cohort the fall tracked how long patients were on CRRT more than the hourly dose. Ask for a high effluent rate and an anticoagulation plan that keeps the filter running.");
}
{
  const s = slide("Does early CRRT actually help?");
  table(s, [
    ["", "US ALF Study Group cohort (2018)", "Pilot RCT (2026)"],
    ["Design", "Large registry, observational", "Open label, ALF with cerebral edema; both arms got plasma exchange"],
    ["Comparison", "CRRT vs no CRRT", "CRRT within 12 hours vs CRRT only if plasma exchange failed"],
    ["Finding", "CRRT linked to lower ammonia and better 21-day transplant-free survival", "Primary endpoint, 28-day survival: similar by intention to treat. Fewer deaths in the first 7 days (2.2% vs 17.8%)"],
    ["Catch", { t: "Association. Sicker or healthier patients may have been picked for CRRT", b: true }, { t: "Small pilot, one center, many protocol violations. Worth a bigger trial, not a rule", b: true }],
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
  q(s, "No. The INR, the lactate and her brain are all worse", 6.15, { hl: true, size: 24 });
  src(s, "Made-up numbers for teaching");
  s.addNotes("Falling AST and ALT don't prove recovery. A rising INR, rising lactate and worse encephalopathy mean she is getting worse despite lower enzymes. One explanation is that there is little liver left to release them; shock and other causes also push the lactate up. Read the whole trajectory, not one line [PMID: 36001996]. Point out the day 2 arterial pH of 7.26 after fluids. It comes back on the King's College slide.");
  return s;
}
inr(1).addNotes("Hour 12, CRRT is starting. Very common request from the procedure side.");
inr(2).addNotes("The INR is a great marker of liver function and a poor marker of bleeding risk in ALF. Spontaneous bleeding is uncommon. Ask transplant hepatology before giving plasma: they need the native INR.");
{
  const s = slide("Rebalanced hemostasis");
  const cxm = W / 2;
  // fulcrum and beam
  s.addShape(pres.shapes.ISOSCELES_TRIANGLE, { x: cxm - 0.55, y: 4.42, w: 1.1, h: 1.0, fill: { color: "000000" }, line: { color: "000000" }, objectName: "Fulcrum" });
  s.addShape(pres.shapes.RECTANGLE, { x: 1.4, y: 4.3, w: W - 2.8, h: 0.12, fill: { color: "000000" }, line: { color: "000000" }, objectName: "Beam" });
  const pan = (x, head, lines) => {
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.55, w: 4.9, h: 2.65, fill: { color: "FFFFFF" }, line: { color: "000000", width: 1.25 }, objectName: "Pan" });
    s.addText([{ text: head, options: { bold: true, fontSize: 20, breakLine: true } }]
      .concat(lines.map((t, i) => ({ text: t, options: { fontSize: 17, breakLine: i < lines.length - 1, paraSpaceBefore: 6 } }))),
      { x, y: 1.55, w: 4.9, h: 2.65, fontFace: "Georgia", align: "center", valign: "middle", color: "000000", isTextBox: true, margin: 6 });
  };
  pan(1.6, "Favors bleeding", ["Low factors II, V, VII, IX, X", "Low fibrinogen when severe", "Low platelets"]);
  pan(W - 1.6 - 4.9, "Favors clotting", ["Low protein C and protein S", "Low antithrombin", "High factor VIII and von Willebrand factor"]);
  s.addText("The INR sees part of this side", { x: 1.6, y: 4.6, w: 4.9, h: 0.45, fontFace: "Georgia", fontSize: 18, bold: true, color: RED,
    align: "center", isTextBox: true, margin: 0 });
  s.addText("The INR doesn't see this side", { x: W - 1.6 - 4.9, y: 4.6, w: 4.9, h: 0.45, fontFace: "Georgia", fontSize: 18, bold: true,
    color: RED, align: "center", isTextBox: true, margin: 0 });
  body(s, [{ t: "Balanced in most patients, but easily tipped either way: both bleeding and thrombosis happen", nb: true, i: true, align: "center" }],
    { y: 5.85, h: 0.7, size: 19 });
  src(s, "Concept from Lisman T, Porte RJ. Blood 2010");
  s.addNotes("Both sides go down together. The INR only tests the left pan, so it makes the patient look much more anticoagulated than she is. Viscoelastic tests look at clot formation in whole blood and in ALF are often close to normal despite a high INR, though they miss the endothelium and the protein C system too. The balance is fragile: infection, kidney failure and procedures tip it, and thrombosis, including line-related clots, is real.");
}
enzymes(1);
enzymes(2);
function inr(step) {
  const s = slide("Should we correct this INR?");
  body(s, [{ t: "Hour 12: INR 4.1, platelets 88,000. She needs a dialysis catheter", nb: true, align: "center", i: true }], { y: 1.3, h: 0.5, size: 20 });
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
  q(s, "You already called. When you first suspected ALF", 1.6, { hl: true, size: 26 });
  body(s, [
    "King's College criteria predict death without transplant. They are specific, not sensitive",
    "They are not a referral threshold. If you wait for them, the evaluation starts too late",
    { runs: ["Patient A: arterial pH ", { t: "7.26", b: true, red: true }, " on day 2 after fluids. She now meets the acetaminophen criteria"] },
  ], { y: 2.6, h: 3.4, size: 21, gap: 14 });
  src(s, "O'Grady 1989 criteria, as summarized in EASL 2017 [PMID: 28417882]; full criteria in the appendix");
  return s;
}
function apxKcc() {
  const s = slide("Appendix: King's College criteria");
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
  ], { x: 1.2, y: 1.5, w: W - 2.4, colW: [5.47, 5.47], size: 17, rowH: [0.45, 2.6], valign: "top" });
  body(s, [{ t: "Original O'Grady criteria; the lactate line is the later modification", nb: true, i: true, align: "center" }],
    { y: 4.75, h: 0.6, size: 17 });
  src(s, "O'Grady 1989 criteria, as summarized in EASL 2017 [PMID: 28417882] and update 2022 [PMID: 36001996]");
  s.addNotes("Specific but not sensitive. Use them to understand prognosis, not to decide when to call.");
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
{
  const s = slide("Back to the first night: bed 7");
  table(s, [
    [{ t: "Bed 4", grey: true }, { t: "Bed 7", hl: true }],
    [{ t: "28-year-old woman", grey: true }, "56-year-old man"],
    [{ t: "Acetaminophen ALF", grey: true }, "Alcohol-related cirrhosis with ascites"],
    [{ t: "Intubated, on CRRT, transplant hepatology involved", grey: true }, "Fever, confusion, low blood pressure"],
  ], { x: 2.2, y: 2.0, w: 8.9, colW: [4.45, 4.45], size: 20, rowH: 0.65, align: ["center", "center"] });
  q(s, "Is this liver failure too?", 5.2, { size: 26 });
  s.addNotes("While bed 4 is going on, the nurse from bed 7 calls: his pressure is 82/46. Same night, same unit, a sick liver again. Let them guess before the next slide whether this is the same disease.");
}
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
    "RR 26, SpO2 92% on a 35% Venturi mask; PaO2 74",
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
    [{ t: "What usually kills", b: true }, "Brain, multiorgan failure, sepsis", "Bleeding, infection. Can turn into ACLF", "Infection, shock, multiorgan failure"],
    [{ t: "ICU focus", b: true }, "Brain, ammonia, early CRRT", "Treat the trigger", "Source control, shock, kidney vs lung"],
    [{ t: "Transplant", b: true }, "Urgent listing pathway", "Refer when MELD or the complication calls for it", "Narrow window; reassess daily"],
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
  ["Lungs", "PaO2/FiO2 ≤ 200, SpO2/FiO2 ≤ 214, or ventilated (not for encephalopathy)", "PaO2/FiO2 211: no"],
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
organs(2).addNotes("Kidney and circulation. Respiratory is borderline: PaO2 74 on a Venturi mask at 0.35 is a P/F of 211. That's why he's on a Venturi mask here: nasal cannula doesn't give you a reliable FiO2, so if the grade depends on the lungs, get a gas on a known FiO2. Watch that row.");
{
  const s = slide("ACLF grades");
  table(s, [
    ["Grade", "What it takes"],
    ["No ACLF", { t: [
      { t: "No organ failure; or", br: true },
      { t: "one failure of liver, clotting, circulation or lungs, with creatinine < 1.5 and no HE; or", br: true },
      { t: "brain failure alone, with creatinine < 1.5" } ] }],
    ["ACLF 1", { t: [
      { t: "Kidney failure alone; or", br: true },
      { t: "one failure of liver, clotting, circulation or lungs, with creatinine 1.5 to 1.9 and/or grade I-II HE; or", br: true },
      { t: "brain failure alone, with creatinine 1.5 to 1.9" } ] }],
    ["ACLF 2", "Two organ failures"],
    ["ACLF 3", "Three or more"],
  ], { x: 0.9, y: 1.45, w: W - 1.8, colW: [2.0, 9.73], size: 18, rowH: [0.5, 1.4, 1.4, 0.55, 0.55] });
  body(s, [{ t: "\"No ACLF\" is a label, not a promise. Use the CLIF-C calculator", nb: true, i: true, align: "center" }],
    { y: 6.0, h: 0.6, size: 18 });
  src(s, "Moreau R et al. Gastroenterology 2013 [PMID: 23474284]; EASL ACLF 2023 [PMID: 37364789]");
  s.addNotes("Grade 1 is the confusing one: kidney failure alone counts, but a single other organ failure counts only with some kidney dysfunction, or mild encephalopathy for the non-brain organs. Brain failure alone needs the creatinine of 1.5 to 1.9. A patient with grade III HE and a normal creatinine is 'no ACLF' by this system, and can still be very sick. Use the CLIF-C calculator rather than memorizing it. The grade at days 3 to 7 says more than the grade at admission.");
}
{
  const s = slide("28-day mortality by ACLF grade");
  bars(s, [{ name: "28-day mortality", labels: ["No ACLF", "ACLF 1", "ACLF 2", "ACLF 3"], values: [4.7, 22.1, 32.0, 76.7] }],
    { x: 2.0, y: 1.4, w: 9.3, h: 4.4, max: 100, fmt: '0.0"%"', colors: ["7F7F7F", "7F7F7F", "7F7F7F", RED], gap: 70, catSize: 17 });
  body(s, [{ t: "CANONIC, 1,343 patients, 2013. These numbers describe groups, not your patient", nb: true, i: true, align: "center" }],
    { y: 5.95, h: 0.6, size: 18 });
  src(s, "Moreau R et al. Gastroenterology 2013 [PMID: 23474284]");
  s.addNotes("Patient B is grade 2 tonight. That is a group number from a 2013 cohort, not his number. The jump to grade 3 is the one to remember. The grade at days 3 to 7 says more than the grade at admission, which comes back later.");
}
function apxWhichAclf() {
  const s = slide("Appendix: which ACLF?");
  table(s, [
    ["", "EASL-CLIF", "NACSELD", "APASL"],
    ["Who", "Cirrhosis with acute decompensation", "Cirrhosis, hospitalized", "Chronic liver disease, with or without cirrhosis"],
    ["Defined by", "Organ failures (CLIF-C)", "Two or more extrahepatic failures: shock, grade III-IV HE, dialysis, ventilation", "Jaundice (bilirubin ≥ 5) and INR ≥ 1.5, then ascites or HE within 4 weeks"],
    ["Picks up", "Broader, earlier", "Sicker patients", "A primary liver insult"],
  ], { x: 0.6, y: 1.5, w: W - 1.2, colW: [1.8, 3.4, 3.6, 3.33], size: 16, rowH: [0.5, 0.9, 1.4, 0.75] });
  q(s, "They find different patients. Say which one you're using", 5.6, { size: 22 });
  src(s, "Kyoto consensus 2025 [PMID: 39961976]; ACG ACLF 2022 [PMID: 35006099]; AASLD 2024 [PMID: 37939273]");
  s.addNotes("Not worth memorizing all three. Worth knowing that a paper's 'ACLF' may not be your patient's ACLF. The talk uses EASL-CLIF.");
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
      { t: [{ t: "Cirrhosis with ascites", br: true }, { t: "AKI by creatinine and/or urine output", br: true }, { t: "No improvement within 24 hours of volume resuscitation, if he needs it", br: true }, { t: "No albumin challenge if he is already euvolemic or wet", br: true }, { t: "No strong alternative explanation as the main cause" }] },
    ],
  ], { x: 0.8, y: 2.0, w: W - 1.6, colW: [5.86, 5.87], size: 18, rowH: [0.5, 1.9], valign: "top" });
  q(s, "Septic shock on norepinephrine is a strong alternative. Treat the shock first", 5.3, { hl: true, size: 21 });
  src(s, "ADQI-ICA consensus, J Hepatol 2024 [PMID: 38527522]");
  return s;
}
hrs(1).addNotes("The reflex in many units: oliguric cirrhotic, give albumin for 48 hours, then terlipressin.");
hrs(2).addNotes("AKI here means creatinine up 0.3 mg/dL or more within 48 hours, or 50% or more within 7 days, and/or urine output 0.5 mL/kg/h or less for 6 hours or more. The mandatory 48-hour albumin challenge is gone, and a patient who is already wet doesn't need a fluid challenge to satisfy a clock. HRS physiology and tubular injury can coexist. Assessment is faster and individualized. But that cuts both ways: you also need to look for the other causes, and right now sepsis is the obvious one.");
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
function heB(step) {
  const s = slide("Night 1: more confused");
  body(s, [
    "Midnight: more confused, pulling at his lines. Rouses to voice, asterixis",
    { runs: ["The nurse sent an ammonia: ", { t: "88 μmol/L", b: true }] },
  ], { y: 1.4, h: 1.2, size: 21 });
  if (step === 1) { q(s, "More lactulose? Repeat the ammonia in the morning?", 3.6, { size: 26 }); return s; }
  q(s, "Look for the reason first. The ammonia doesn't tell you", 2.75, { hl: true, size: 22 });
  body(s, [
    "Glucose, sodium, oxygen and CO2",
    "Is the infection controlled? Cultures, source, antibiotic coverage",
    "Bleeding, sedatives and opioids, withdrawal, seizures, a new focal deficit (CT head)",
    "Lactulose for overt HE: 2 to 3 soft stools a day. By tube if he can't swallow safely; watch for dehydration and high sodium",
    "Rifaximin is an add-on, mainly to prevent the next episode",
    "Grade III-IV and a poor airway: intubate",
    "No repeat ammonia",
  ], { y: 3.4, h: 3.45, size: 18, gap: 4 });
  src(s, "EASL HE guideline 2022 [PMID: 35724930]; SCCM 2023 [PMID: 37052436]");
  return s;
}
heB(1).addNotes("The reflex is to give more lactulose and recheck the ammonia. Let them say it.");
heB(2).addNotes("In cirrhosis, HE is a clinical diagnosis. The ammonia level doesn't grade it, and chasing it doesn't help. Every worsening needs the same search for a precipitant as the admission did. Lactulose is right for overt HE, but too much gives you dehydration, hypernatremia and a worse kidney. Don't make every first episode an automatic two-drug start.");
const B2_ROWS = [
  ["", "Admission", "Day 2"],
  ["Albumin received", "", "110 g (SBP dose, 1.5 g/kg at 73 kg) + 2 L crystalloid"],
  ["Breathing", "SpO2 92%, Venturi 35%", { t: "SpO2 86% on Venturi 50%, RR 32, crackles", red: true, b: true }],
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
day2B(2).addNotes("Kidney, circulation and now lungs: ACLF grade 3. Fluid and albumin are a likely part of this, with B-lines and a full IVC. But think about pneumonia, ARDS and the heart too before you decide it's all volume.");
{
  const s = slide("Will fixing the kidney hurt the lungs?");
  body(s, [
    { runs: [{ t: "Terlipressin: not for him today", b: true }] },
    { t: "Label: contraindicated with hypoxia or worsening respiratory symptoms; don't start if SpO2 < 90%, stop if it falls below 90%", lvl: 1 },
    { t: "Label: avoid in ACLF grade 3; volume overload raises the risk of respiratory failure", lvl: 1 },
    "Stop the albumin while he is wet",
    "He is already on a vasoconstrictor. Norepinephrine, titrated to perfusion",
    "Still overloaded and not making urine despite this: RRT to take fluid off",
    "Midodrine and octreotide? They work poorly, and not in someone on IV pressors",
  ], { y: 1.4, h: 4.6, size: 20 });
  q(s, "Check oxygen and volume before any kidney treatment", 6.05, { hl: true, size: 20 });
  src(s, "TERLIVAZ prescribing information, revised 6/2026; ADQI-ICA 2024 [PMID: 38527522]");
  s.addNotes("Before any terlipressin dose: baseline SpO2, lung exam, volume status, and whether he is ACLF grade 3. Norepinephrine is an ICU alternative for HRS when terlipressin is contraindicated or unavailable. RRT in ACLF should follow usual indications plus trajectory and transplant potential; avoid the rule 'dialysis only if listed'. A time-limited trial is reasonable.");
}
{
  const s = slide("Midodrine and octreotide for HRS-AKI?");
  bars(s, [
    { name: "Terlipressin + albumin (n = 27)", labels: ["Complete response", "Complete or partial response"], values: [55.5, 70.4] },
    { name: "Midodrine + octreotide + albumin (n = 21)", labels: ["Complete response", "Complete or partial response"], values: [4.8, 28.6] },
  ], { x: 0.6, y: 1.4, w: 7.4, h: 5.3, max: 100, fmt: '0.0"%"', legend: true });
  body(s, [
    { t: "Randomized, 8 Italian centers, type 1 HRS. 49 randomized (27 vs 22), 48 analyzed", b: true, nb: true },
    "Stopped early at the interim analysis because the difference was already clear",
    "Blood pressure rose more with terlipressin",
    "3-month survival 59% vs 43%; too small to tell",
    { runs: [{ t: "Use it only if terlipressin and norepinephrine are not options", b: true, hl: true }] },
  ], { x: 8.3, y: 1.5, w: 4.6, h: 5.2, size: 19, gap: 12 });
  src(s, "Cavallin M et al. Hepatology 2015;62:567-74 [PMID: 25644760]; ADQI-ICA 2024 [PMID: 38527522]");
  s.addNotes("Midodrine and octreotide were the US default for years because terlipressin wasn't available. In the randomized comparison with terlipressin, 1 of 21 analyzed patients had a complete response. It wasn't powered for mortality. Most of them are on the floor at the time, so the practical message for the ICU is simple: once he needs an ICU bed, norepinephrine with albumin is the alternative to terlipressin, not midodrine and octreotide. About half of the midodrine non-responders were rescued with terlipressin, and most of those then responded.");
}
{
  const s = slide("Does HRS reversal mean survival?");
  bars(s, [
    { name: "Terlipressin + albumin", labels: ["Verified HRS reversal", "Respiratory death by day 90"], values: [32, 11] },
    { name: "Placebo + albumin", labels: ["Verified HRS reversal", "Respiratory death by day 90"], values: [17, 2] },
  ], { x: 0.6, y: 1.4, w: 7.4, h: 5.3, max: 40, unit: 10, legend: true });
  body(s, [
    { t: "CONFIRM: type 1 HRS, 300 patients", b: true, nb: true },
    "More kidneys recovered",
    { t: "More patients died of respiratory failure", red: true, b: true },
    "All-cause 90-day mortality was not different",
    "Respiratory failure as an adverse event: about 14% vs 5% (label)",
  ], { x: 8.3, y: 1.6, w: 4.5, h: 5.0, size: 20, gap: 12 });
  src(s, "Wong F et al. NEJM 2021 [PMID: 33657294]; TERLIVAZ prescribing information, revised 6/2026");
  s.addNotes("The respiratory harm clustered in patients with volume overload and ACLF grade 3, which is how the label language came about. The label's own reanalysis gives slightly different reversal numbers (29% vs 16%); either way the direction is the same.");
}
{
  const s = slide("Should we treat the albumin number?");
  table(s, [
    ["Study", "ATTIRE: daily albumin to keep serum albumin ≥ 30 g/L vs standard care, hospitalized decompensated cirrhosis, 777 patients"],
    ["Main finding", "Composite of new infection, kidney dysfunction or death: 29.7% vs 30.2%"],
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
    ["Oxygen, SpO2", "Venturi 0.35, 92%", "HFNC 0.6, 90%", "HFNC 0.4, 95%", "2 L, 97%"],
    ["Lung failure?", "No (P/F 211)", { t: "Yes (S/F 150)", red: true }, "No (S/F 238)", "No"],
    ["Kidney", "Cr 2.6", "Cr 3.1", "CRRT started", "On CRRT"],
    ["Encephalopathy", "Grade II", "Grade II", "Grade I", "Grade I"],
    ["Bilirubin / INR", "5.8 / 2.1", "6.4 / 2.3", "6.1 / 2.2", "5.2 / 2.0"],
    ["ACLF grade", "2", { t: "3", red: true, b: true }, "2", step === 2 ? { t: "1", hl: true, b: true } : "?"],
  ];
  table(s, rows, { x: 0.7, y: 1.3, w: W - 1.4, colW: [3.33, 2.15, 2.15, 2.15, 2.15], size: 16, rowH: 0.44, align: ["left", "center", "center", "center", "center"] });
  if (step === 1) q(s, "Better or worse? What do you tell his family?", 5.65, { size: 24 });
  if (step === 2) body(s, [
    "The grade at days 3 to 7 predicts outcome better than the grade at admission",
    "Persistent ACLF 3 at days 3 to 7, especially with four or more organ failures, has a very high mortality without transplant",
    "If he is not a transplant candidate, discuss goals of care with the family and involve palliative care",
  ], { y: 5.0, h: 1.9, size: 16, gap: 2 });
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
    { t: "What can close the window", b: true, nb: true, gap: 16 },
    "Uncontrolled infection",
    "Rising vasopressor needs, severe respiratory failure",
    "Irreversible brain injury",
    "Frailty and comorbidity",
    "Alcohol: centers now evaluate individually rather than by a fixed abstinence rule",
  ], { x: 0.7, y: 1.4, w: 7.4, h: 5.4, size: 18 });
  bars(s, [{ name: "1-year survival", labels: ["Transplanted (n = 73)", "Not transplanted"], values: [83.9, 7.9] }],
    { x: 8.3, y: 1.5, w: 4.6, h: 4.9, max: 100, fmt: '0.0"%"', colors: ["000000", "A6A6A6"], gap: 70, catSize: 14,
      title: "ACLF 3: 1-year survival" });
  body(s, [{ t: "Selected patients, not randomized", nb: true, i: true, align: "center" }], { x: 8.3, y: 6.35, w: 4.6, h: 0.45, size: 16 });
  src(s, "Artru F et al. J Hepatol 2017 [PMID: 28645736]; Lancet Gastroenterol Hepatol 2024 [PMID: 38309288]; AASLD/AST 2026 [PMID: 41405234]");
  s.addNotes("Referral, candidacy, listing and allocation are four different decisions. The ICU team owns the referral and the information. Status 1A and other allocation rules: check current OPTN policy before quoting them. Artru's comparison is not randomized: the transplanted patients were selected, so the gap overstates what transplant adds for an unselected ACLF 3 patient. It still shows that ACLF 3 alone is not a reason to say no.");
}
function apxMathurin() {
  const s = slide("Appendix: early transplant for alcohol-associated hepatitis");
  s.addImage({ path: path.join(IMG, "mathurin-km.png"), x: 0.5, y: 1.4, w: 7.4, h: 5.25, altText: "Survival with early transplant vs matched controls" });
  body(s, [
    "26 patients with a first episode of severe alcohol-associated hepatitis, not responding to steroids",
    "Highly selected: first liver-related event, close family support, no severe other illness, agreed to abstinence",
    { runs: ["6-month survival ", { t: "77% vs 23%", b: true }] },
    "Recent drinking alone is not a reason to skip the call",
  ], { x: 8.2, y: 1.6, w: 4.7, h: 5.0, size: 19, gap: 12 });
  src(s, "Mathurin P et al. N Engl J Med 2011 [PMID: 22070476]");
  s.addNotes("This is the study that broke the six-month rule. The selection was strict, and later US data (ACCELERATE-AH) showed similar results in selected patients. Patient B's trigger was SBP, not alcohol-associated hepatitis; this is here for the alcohol question that comes up with every cirrhotic in the ICU. The alcohol history is a question for the transplant team, not a decision the ICU makes alone.");
}
{
  const s = slide("Calling transplant hepatology");
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
  ], { x: 0.9, y: 2.15, w: W - 1.8, colW: [5.76, 5.77], size: 18, rowH: [0.5, 3.0], valign: "top" });
  q(s, "Call first. Gather this while you wait for the call back", 1.45, { hl: true, size: 22 });
  s.addNotes("Nothing on this list should delay the first call. A good call makes the transplant team's decision faster. Trends, not single values. Referral, candidacy, listing and allocation are separate decisions; the first one is ours.");
}
{
  const s = slide("ALF and ACLF: what changes at the bedside");
  table(s, [
    ["", "Acute liver failure", "ACLF"],
    [{ t: "Ammonia", b: true }, "With the HE grade and the trend: brain risk, and when to start CRRT. No level rules out ICH", "Doesn't diagnose HE. Don't trend it to dose lactulose"],
    [{ t: "Lactulose", b: true }, "No proven benefit; bowel distension can get in the way of surgery", "Yes for overt HE, plus treat the trigger. Rifaximin as an add-on. Avoid dehydration"],
    [{ t: "Sodium", b: true }, "Grade III-IV or high ammonia: center protocol, often 145 to 155, matched to the CRRT fluid", "Often chronically low: correct slowly. In high-risk patients, no more than 8 mmol/L in 24 hours"],
    [{ t: "Antibiotics", b: true }, "No routine prophylaxis; low threshold to treat", "Treat infection fast; prophylaxis with GI bleeding"],
    [{ t: "INR", b: true }, "Tracks severity, poor at predicting bleeding. No plasma just for the number", "Same. Judge the procedure and the patient"],
  ], { x: 0.6, y: 1.35, w: W - 1.2, colW: [1.9, 5.11, 5.12], size: 16, rowH: [0.45, 0.9, 0.9, 0.95, 0.6, 0.75] });
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
    { runs: ["ALF: ", { t: "protect the brain", b: true }, ". Intubate at grade III, keep the CO2 normal, follow your center's sodium plan, and start CRRT for rising ammonia"] },
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
apxKcc();
apxAmmonia();
apxWhichAclf();
apxMathurin();
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
    "EASL hepatic encephalopathy guideline. J Hepatol 2022 [PMID: 35724930]",
    "US/Canada acetaminophen poisoning consensus. JAMA Netw Open 2023 [PMID: 37552484]",
  ], { size: 15, gap: 4, y: 1.35, h: 5.5 });
}
{
  const s = slide("Appendix: sources (2)");
  body(s, [
    "Moreau R et al. CANONIC. Gastroenterology 2013 [PMID: 23474284]",
    "Jalan R et al. CLIF-C ACLF score. J Hepatol 2014 [PMID: 24950482]",
    "Lee WM et al. NAC in non-acetaminophen ALF. Gastroenterology 2009 [PMID: 19524577]",
    "Clemmesen JO et al. Cerebral herniation and arterial ammonia. Hepatology 1999 [PMID: 10051463]",
    "Bernal W et al. Arterial ammonia, HE and intracranial hypertension. Hepatology 2007 [PMID: 17685471]",
    "Bhatia V et al. Arterial ammonia in ALF. Gut 2006 [PMID: 16024550]",
    "Kumar R et al. Persistent hyperammonemia in ALF. Clin Gastroenterol Hepatol 2012 [PMID: 22521861]",
    "Cardoso FS et al. CRRT and ammonia in ALF. Hepatology 2018 [PMID: 28859230]",
    "Pre-emptive CRRT in ALF with cerebral edema. Aliment Pharmacol Ther 2026 [PMID: 42332991]",
    "Larsen FS et al. High-volume plasma exchange. J Hepatol 2016 [PMID: 26325537]",
    "Cavallin M et al. Terlipressin vs midodrine and octreotide. Hepatology 2015 [PMID: 25644760]",
    "Wong F et al. CONFIRM. NEJM 2021 [PMID: 33657294]",
    "Artru F et al. Transplant in ACLF grade 3. J Hepatol 2017 [PMID: 28645736]",
    "Mathurin P et al. Early transplant for alcoholic hepatitis. NEJM 2011 [PMID: 22070476]",
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
