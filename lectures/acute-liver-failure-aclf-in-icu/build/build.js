// Builds "ALF and ACLF in the ICU" in the style of Mohammad Almeqdadi's existing decks.
const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");
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
});
pres.defineSlideMaster({
  title: "SECTION",
  background: { color: "FFFFFF" },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 2.6, w: W - 1.6, h: 1.4,
      fontFace: "Georgia", fontSize: 44, color: "000000", align: "center", valign: "middle" }, text: "" } },
  ],
});
pres.defineSlideMaster({ title: "BLANK", background: { color: "FFFFFF" } });

// Slide numbers count ideas, not clicks: every step of a reveal shares one number, shown as "X/Y".
// Call cont() right before building a reveal step that continues the previous slide.
const NUMBERED = [];
let LOGICAL = 0, CONT = false;
const _addSlide = pres.addSlide.bind(pres);
pres.addSlide = (o) => {
  const s = _addSlide(o);
  if (!CONT) LOGICAL++;
  CONT = false;
  NUMBERED.push({ s, n: LOGICAL });
  return s;
};
function cont() { CONT = true; }
function addSlideNumbers() {
  NUMBERED.forEach(({ s, n }, i) => {
    if (i === 0) return; // not on the cover
    s.addText(`${n}/${LOGICAL}`, { x: W - 1.3, y: 7.0, w: 0.9, h: 0.3, fontSize: 9, color: "A6A6A6", fontFace: "Georgia",
      align: "right", isTextBox: true, margin: 0, objectName: "SlideNumber" });
  });
}

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

// Every question gets two slides: blank first, then the answer
const ans = (step, v) => (step === 1 ? "" : v);
function twoStep(fn) { fn(1); cont(); return fn(2); }

// Picture at its own aspect ratio, fitted in a box and centered in it
function pngSize(f) { const b = fs.readFileSync(f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; }
function pic(s, file, x, y, maxW, maxH, alt, o = {}) {
  const f = path.join(IMG, file); const [pw, ph] = pngSize(f);
  let w = maxW, h = (maxW * ph) / pw;
  if (h > maxH) { h = maxH; w = (maxH * pw) / ph; }
  const px = o.left ? x : x + (maxW - w) / 2;
  s.addImage({ path: f, x: px, y, w, h, altText: alt });
  return { x: px, y, w, h };
}
// The paper itself: title block from the PDF, then a figure or the authors' conclusion
function paper(title, top, bottom, source, alt, topH = 3.0, top1) {
  return twoStep((step) => paperStep(step, title, top, bottom, source, alt, topH, top1));
}
// top1: a crop of the title block without the paper's title, when the title itself gives away the result
function paperStep(step, title, top, bottom, source, alt, topH, top1) {
  const s = slide(title);
  const a = pic(s, step === 1 && top1 ? top1 : top, 1.4, 1.2, W - 2.8, topH, alt + ": title", { line: true });
  if (step === 1) q(s, "What do you think they found?", a.y + a.h + 0.6, { size: 24 });
  if (step === 2 && bottom) pic(s, bottom, 1.4, a.y + a.h + 0.25, W - 2.8, 6.75 - (a.y + a.h + 0.25), alt, { line: true });
  src(s, source);
  return s;
}

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

// Section divider: big centered title, grey subtitle, optional picture
function divider(title, sub, img) {
  const s = pres.addSlide({ masterName: "BLANK", sectionTitle: section });
  const ty = img ? 0.9 : 2.5;
  s.addText(title, { x: 0.8, y: ty, w: W - 1.6, h: 1.2, fontFace: "Georgia", fontSize: 48, align: "center", valign: "middle",
    color: "000000", isTextBox: true, margin: 0 });
  if (sub) s.addText(sub, { x: 0.8, y: ty + 1.2, w: W - 1.6, h: 0.6, fontFace: "Georgia", fontSize: 24, align: "center",
    color: "7F7F7F", isTextBox: true, margin: 0 });
  if (img) {
    s.addImage({ path: img.path, x: (W - img.w) / 2, y: 3.0, w: img.w, h: img.h, altText: img.alt });
    if (img.caption) s.addText(img.caption, { x: 0.8, y: 3.05 + img.h, w: W - 1.6, h: 0.45, fontFace: "Georgia", fontSize: 15,
      italic: true, align: "center", color: GREY, isTextBox: true, margin: 0 });
  }
  return s;
}

// Section page on one of Mohammad's Gemini watercolors: full-bleed, title on the plain half
function bgDivider(title, sub, file, alt, side = "left") {
  const s = pres.addSlide({ masterName: "BLANK", sectionTitle: section });
  s.addImage({ path: path.join(IMG, file), x: -0.05, y: 0, w: 13.43, h: 7.5, altText: alt });
  const tx = side === "left" ? 0.6 : 7.1, tw = 5.7;
  // bottom-anchored so a two-line title grows upward instead of into the subtitle
  s.addText(title, { x: tx, y: 1.55, w: tw, h: 2.2, fontFace: "Georgia", fontSize: 48, align: "center", valign: "bottom",
    color: "000000", isTextBox: true, margin: 0 });
  if (sub) s.addText(sub, { x: tx, y: 3.75, w: tw, h: 0.6, fontFace: "Georgia", fontSize: 24, align: "center",
    color: "595959", isTextBox: true, margin: 0 });
  return s;
}

// ---------------------------------------------------------------- Cover
sec("Opening");
{
  const s = pres.addSlide({ masterName: "BLANK", sectionTitle: section });
  // watercolor cover Mohammad made in Gemini (prompt in the lecture folder); title sits on the plain right half
  s.addImage({ path: path.join(IMG, "cover-alf-aclf-icu.jpg"), x: -0.05, y: 0, w: 13.43, h: 7.5, altText: "Watercolor illustration of a liver in dim ICU light, on ivory paper" });
  const tx = 7.1, tw = W - tx - 0.45;
  s.addText([
    { text: "Acute Liver Failure", options: { fontSize: 38, breakLine: true } },
    { text: "and ACLF in the ICU", options: { fontSize: 34 } },
  ], { x: tx, y: 1.75, w: tw, h: 1.45, fontFace: "Georgia", bold: true, align: "center", valign: "middle", color: "000000", isTextBox: true, margin: 0 });
  s.addShape(pres.shapes.LINE, { x: tx + 1.2, y: 3.6, w: tw - 2.4, h: 0, line: { color: "A6A6A6", width: 1 } });
  s.addText([
    { text: "Mohammad Almeqdadi, MD", options: { bold: true, fontSize: 20, breakLine: true } },
    { text: "Transplant Hepatologist and Gastroenterologist", options: { fontSize: 16, breakLine: true } },
    { text: "Assistant Professor of Medicine and Surgery", options: { fontSize: 16, breakLine: true } },
    { text: "X: @mfalmeqdadi", options: { fontSize: 16, color: "595959" } },
  ], { x: tx, y: 4.0, w: tw, h: 1.6, fontFace: "Georgia", align: "center", valign: "top", color: "000000", isTextBox: true, margin: 0, paraSpaceAfter: 4 });
  s.addImage({ path: LOGO_IMG, x: tx + 0.15, y: 5.85, w: 3.79, h: 0.77, altText: "Tufts University School of Medicine" });
  // QR to the PDF of these slides on GitHub
  s.addImage({ path: path.join(IMG, "qr-slides.png"), x: W - 1.7, y: 5.3, w: 1.3, h: 1.3, altText: "QR code linking to the slides PDF" });
  s.addText("Slides (PDF)", { x: W - 1.83, y: 6.65, w: 1.55, h: 0.3, fontFace: "Georgia", fontSize: 11, align: "center",
    color: "595959", isTextBox: true, margin: 0 });
  s.addText("Illustrations generated with Google Gemini", { x: 0.4, y: 7.0, w: 5, h: 0.3, fontFace: "Georgia", fontSize: 11,
    italic: true, color: "7F7F7F", isTextBox: true, margin: 0 });
  s.addNotes("Pulmonary and critical care fellows. About 60 minutes with questions as we go. Two patients in the unit at the same time. Everything in the cases is made up for teaching; none of it is a real patient.");
}

// ---------------------------------------------------------------- Roadmap
{
  const s = slide("Objectives");
  body(s, [{ t: "By the end of this talk you should be able to:", nb: true, i: true }], { x: 1.6, w: W - 3.2, y: 1.35, h: 0.5, size: 22 });
  body(s, [
    "Tell acute liver failure apart from severe acute liver injury and from ACLF",
    "Plan the first hour of care in ALF",
    "Manage the brain and the ammonia in ALF",
    "Recognize and grade ACLF, and find the trigger",
    "Work through AKI in cirrhosis",
    "Know when to call transplant hepatology",
  ], { size: 22, gap: 12, x: 1.6, w: W - 3.2, y: 2.05, h: 4.8 });
  s.addNotes("We'll get to each of these through two patients who are in the unit at the same time.");
}

// ---------------------------------------------------------------- Patient A
sec("Patient A");
{
  const s = slide("Two patients, same ICU", { master: "CONTENT" });
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

bgDivider("Bed 4", "28F, 4 days of nausea", "divider-bed4.jpg", "Watercolor of an empty ICU bed with an IV pole and monitor").addNotes("First patient.");
const A_TITLE = "28F, 4 days of nausea";
const A_LABS = [
  ["Test", "Result"],
  ["AST", { t: "6,820 U/L", red: true }],
  ["ALT", { t: "5,940 U/L", red: true }],
  ["Alkaline phosphatase", "128 U/L"],
  ["Total bilirubin", { t: "2.9 mg/dL", red: true }],
  ["Creatinine", "1.0 mg/dL"],
];
function caseA(step) {
  const s = slide(A_TITLE);
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
cont(); caseA(2).addNotes("This is the same distinction as in the acute liver injury lecture: the size of the enzyme rise is not the severity of the illness.");
cont(); caseA(3).addNotes("Liver failure is a clinical diagnosis: coagulopathy plus encephalopathy in someone without cirrhosis. Ask for the INR and examine the patient.");
twoStep((step) => {
  const s = slide(A_TITLE);
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
  if (step === 2) q(s, "This is acute liver failure", 4.9, { hl: true, size: 28 });
  s.addNotes("Coagulopathy, encephalopathy, short course, no cirrhosis. Note the glucose: hypoglycemia is part of the picture, and it is also a reason the mental status can look worse than it is. Fix the glucose and re-examine.");
  return s;
});
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
twoStep((step) => {
  const s = slide("Same patient, but wide awake");
  body(s, [{ t: "Same labs and INR 2.4, but fully oriented with no asterixis", nb: true, i: true, align: "center" }], { y: 1.3, h: 0.5, size: 20 });
  if (step === 1) { q(s, "What do you call this, and what do you do now?", 3.4, { size: 28 }); return s; }
  body(s, [
    { runs: [{ t: "Severe acute liver injury", b: true }, ", not ALF yet"] },
    "No encephalopathy, so it doesn't meet the definition",
    "But it can become ALF within hours",
    { t: "Check glucose often and examine the patient every few hours", lvl: 1 },
    "And the opposite trap:",
    { t: "Hypoglycemia, sedatives, sepsis, alcohol withdrawal and seizures can all look like encephalopathy", lvl: 1 },
  ], { y: 1.95, h: 4.9, size: 21 });
  s.addNotes("Two errors in opposite directions. Calling everything with a high INR liver failure, and blaming every change in mental status on the liver.");
  return s;
});
function features(step) {
  const s = slide("Which other organs fail in ALF?");
  if (step === 1) return s;
  s.addImage({ path: path.join(IMG, "alf-features.png"), x: (W - 5.25) / 2, y: 1.3, w: 5.25, h: 5.33, altText: "Clinical features of acute liver failure by organ" });
  src(s, "Bernal W, Wendon J. N Engl J Med 2013;369:2525-34, Figure 1");
  return s;
}
features(1).addNotes("Let them list organs. Most will get brain and kidney. Fewer think of the adrenals, the marrow or the immune system.");
cont(); features(2).addNotes("This is why these patients are ICU patients. Hypoglycemia, lactic acidosis, vasodilatory shock, relative adrenal insufficiency, AKI, lung injury and a high risk of infection. The liver is one organ on this picture.");
{
  const s = slide(A_TITLE);
  q(s, "What's your next step?", 3.2, { size: 36, h: 1.0 });
  s.addNotes("Wait for answers. Usually people list tests in order. That's the trap.");
}
{
  const s = slide("Two things at the same time");
  table(s, [
    ["Keep her alive", "Find the cause"],
    [
      { t: [{ t: "ICU bed", br: true }, { t: "Glucose every 1 to 2 hours", br: true }, { t: "Volume, perfusion, lactate", br: true }, { t: "Neuro checks" }] },
      { t: [{ t: "Acetaminophen level", br: true }, { t: "Viral, autoimmune, Wilson, toxicology", br: true }, { t: "Doppler ultrasound", br: true }, { t: "Pregnancy test" }] },
    ],
  ], { x: 1.6, y: 1.6, w: W - 3.2, colW: [5.07, 5.06], size: 20, rowH: [0.55, 2.2], valign: "top", align: ["left", "left"] });
  q(s, "Both start in the first hour", 4.9, { hl: true });
  s.addNotes("The classic mistake is a serial workup: wait for the hepatitis panel, then the autoimmune markers, then act. Support and workup run in parallel. Who else to call, and when, comes later in the talk.");
}
twoStep((step) => {
  const s = slide("Which cause changes treatment right away?");
  table(s, [
    ["If you suspect", "Send", "Don't wait for the result to"],
    ["Acetaminophen", "Level, ingestion history, combination products", ans(step, "Start NAC")],
    ["Herpes simplex", "HSV PCR (blood)", ans(step, "Start IV acyclovir")],
    ["Hepatitis B", "HBsAg, anti-HBc IgM, HBV DNA", ans(step, "Start entecavir or tenofovir")],
    ["Autoimmune hepatitis", "ANA, ASMA, IgG (can be negative)", ans(step, "Discuss steroids with hepatology, list in parallel")],
    ["Wilson disease", "Ceruloplasmin, urine copper, hemolysis, low ALP", ans(step, "Prepare for urgent transplant")],
    ["Pregnancy (AFLP, HELLP)", "hCG", ans(step, "Call obstetrics, plan delivery")],
    ["Budd-Chiari", "Doppler ultrasound or CT", ans(step, "Anticoagulation, discuss TIPS or transplant")],
    ["Ischemic hepatitis", "Echo, history of shock", ans(step, "Fix the circulation")],
    ["Mushrooms (Amanita)", "Wild mushrooms, then diarrhea 6 to 24 hours later", ans(step, "NAC, call poison control (silibinin if available)")],
  ], { x: 0.7, y: 1.3, w: W - 1.4, colW: [2.9, 4.6, 4.43], size: 14, rowH: 0.5 });
  src(s, "Update 2022 [PMID: 36001996]; practical update 2024 [PMID: 39170946]; EASL AIH 2025 [PMID: 40348684]");
  s.addNotes("The point of the workup in the ICU is the column on the right. Some of these you start empirically before the test comes back: NAC, acyclovir. Negative autoimmune serologies do not exclude acute AIH. Wilson disease presenting as ALF basically means transplant.");
  return s;
});
function caseA_apap(step) {
  const s = slide(A_TITLE);
  body(s, [
    "Roommate: \"She was taking a lot of the Tylenol with codeine, plus cold medicine, for 3 days\"",
    { runs: ["Acetaminophen level: ", { t: "12 μg/mL", b: true }, ", time of last dose unknown"] },
  ], { x: 0.7, y: 1.4, w: 7.7, h: 1.9, size: 20 });
  pic(s, "dayquil.png", 8.7, 1.3, 4.0, 2.0, "Cold and flu box listing acetaminophen");
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
cont(); caseA_apap(2).addNotes("An undetectable or low level late in the course does not exclude acetaminophen toxicity [PMID: 36001996]. NAC is safe enough that the threshold to start it is low. Dosing per your pharmacy protocol.");
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
paper("NAC for every kind of acute liver failure?", "lee-title.png", "lee-concl.png",
  "Lee WM et al. Gastroenterology 2009;137:856-64 [PMID: 19524577]", "Lee 2009 NAC trial", 3.0, "lee-title-notitle.png")
  .addNotes("The ALFSG trial: 173 adults with non-acetaminophen ALF, NAC or placebo for 72 hours, 24 US centers. Read their conclusion, then the numbers.");
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
  const s = slide(A_TITLE);
  table(s, A10_ROWS, { x: 1.5, y: 1.4, w: W - 3.0, colW: [3.0, 3.0, 4.33], size: 17, rowH: 0.5 });
  q(s, "What worries you most?", 5.8);
  s.addNotes("Hour 12. Hepatology has seen her and the transplant evaluation is under way. Let them pick. Kidney? Lactate? The answer for a hyperacute patient with this ammonia is the brain.");
}
cont();
{
  const s = slide(A_TITLE);
  table(s, A10_ROWS, { x: 1.5, y: 1.4, w: W - 3.0, colW: [3.0, 3.0, 4.33], size: 17, rowH: 0.5 });
  q(s, "Her brain", 5.55, { hl: true, size: 26 });
  body(s, [{ t: "When do you intubate?  Do you wait for the creatinine before dialysis?", nb: true, align: "center", i: true }],
    { y: 6.1, h: 0.6, size: 20 });
  s.addNotes("Two decisions we own as intensivists. Before answering, why is the brain the problem?");
}
// brain section page comes after the reveal so the picture doesn't give the answer away
bgDivider("Ammonia and the brain", null, "divider-brain.jpg", "Watercolor of a brain in coronal section")
  .addNotes("Astrocytes in chronic liver disease have time to adapt to ammonia. In hyperacute ALF they don't, and they swell.");
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
    { runs: [{ t: "Makes it worse: ", b: true }, "inflammation and infection, loss of autoregulation, fever, low sodium"] },
    { runs: [{ t: "Highest risk: ", b: true }, "hyperacute course, young, grade III-IV encephalopathy, ammonia persistently above 150 to 200 μmol/L, AKI, vasopressors"] },
  ], { y: 4.4, h: 2.4, size: 19 });
  src(s, "Update 2022 [PMID: 36001996]; practical update 2024 [PMID: 39170946]");
  s.addNotes("This is why ammonia is actionable in ALF. The brain has no time to adapt, unlike in cirrhosis where astrocytes compensate over months. Every element of the bundle that follows maps to a box on this slide.");
}
// Why ALF brains swell and cirrhotic brains mostly don't: the histology, labeled
twoStep((step) => {
  const s = slide("Same ammonia, different brain");
  if (step === 1) {
    q(s, "Why do patients with cirrhosis rarely get cerebral edema, even with a high ammonia?", 3.0, { size: 26, h: 1.2 });
    return s;
  }
  const ix = 0.6, iy = 1.3, iw = 5.4, ih = 4.03;
  s.addImage({ path: path.join(IMG, "astrocytes.png"), x: ix, y: iy, w: iw, h: ih, altText: "Brain histology with an Alzheimer type II astrocyte and normal glial nuclei" });
  const pt = (fx, fy) => [ix + fx * iw, iy + fy * ih];
  const lab = (text, x, w, to) => {
    s.addText(text, { x, y: 5.45, w, h: 0.6, fontFace: "Georgia", fontSize: 13, color: "000000", valign: "top", isTextBox: true, margin: 0 });
    const [x2, y2] = to, x1 = x + 0.6, y1 = 5.42;
    s.addShape(pres.shapes.LINE, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1) || 0.001, h: Math.abs(y2 - y1),
      flipH: x2 < x1, flipV: y2 < y1, line: { color: "000000", width: 2, endArrowType: "triangle" }, objectName: "Pointer" });
  };
  lab([{ text: "Alzheimer type II astrocyte: ", options: { bold: true } }, { text: "big, pale nucleus" }], ix, 3.3, pt(0.43, 0.60));
  lab([{ text: "Normal glial nucleus: ", options: { bold: true } }, { text: "small and dark" }], ix + 3.5, 2.6, pt(0.78, 0.53));
  body(s, [
    "Astrocytes clear ammonia by turning it and glutamate into glutamine",
    "Glutamine pulls water into the cell",
    { runs: [{ t: "Cirrhosis: ", b: true }, "over months the astrocyte pushes out other solutes (myo-inositol, taurine) to make room. It swells only a little. This is the cell you see under the microscope"] },
    { runs: [{ t: "ALF: ", b: true }, "the ammonia comes in days. No time to adapt, so the astrocytes swell and the brain swells with them"] },
  ], { x: 6.6, y: 1.35, w: W - 7.2, h: 4.6, size: 18, gap: 10 });
  q(s, "Cerebral edema is common in hyperacute ALF and rare in cirrhosis", 6.25, { hl: true, size: 20 });
  s.addNotes("Alzheimer type II astrocytes are a sign of chronic hyperammonemia: cirrhosis, Wilson disease, urea cycle defects. They show adaptation. In hyperacute ALF the astrocytes don't get the time, which is why the young acetaminophen patient herniates at an ammonia a cirrhotic would tolerate. Point at the big pale nucleus in the middle, then the small dark normal nuclei.");
  return s;
});
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
twoStep((step) => {
  const s = slide("Ammonia: how high is too high?");
  s.addImage({ path: path.join(IMG, "ammonia-bottle.png"), x: 0.35, y: 0.12, w: 0.5, h: 1.1, altText: "Bottle of household ammonia" });
  // plot area fixed so the 146 line can be drawn at the right height
  const cx = 0.6, cy = 1.3, cw = 5.6, ch = 4.1, lay = { x: 0.14, y: 0.14, w: 0.82, h: 0.72 };
  bars(s, [{ name: "Mean arterial ammonia", labels: ["Herniated (n = 14)", "No herniation (n = 30)"], values: [230, 118] }],
    { x: cx, y: cy, w: cw, h: ch, max: 250, unit: 50, valFmt: "0", fmt: "0", colors: [RED, "A6A6A6"], gap: 90,
      title: "Clemmesen 1999: ammonia, μmol/L", layout: lay });
  const y146 = cy + ch * (lay.y + lay.h * (1 - 146 / 250));
  if (step === 2) s.addShape(pres.shapes.LINE, { x: cx + cw * lay.x, y: y146, w: cw * lay.w, h: 0,
    line: { color: "000000", width: 1.5, dashType: "dash" }, objectName: "Line146" });
  if (step === 2) s.addText("146", { x: cx + cw * (lay.x + lay.w) - 0.6, y: y146 - 0.36, w: 0.6, h: 0.32, fontFace: TBL_FONT, fontSize: 14,
    bold: true, align: "right", color: "000000", isTextBox: true, margin: 0 });
  bars(s, [
    { name: "Ammonia ≥ 122 for 3 days", labels: ["Survival", "Cerebral edema"], values: [23, 71] },
    { name: "Ammonia falling", labels: ["Survival", "Cerebral edema"], values: [72, 37] },
  ], { x: 6.8, y: 1.3, w: 6.0, h: 4.1, max: 100, colors: [RED, "A6A6A6"], legend: true, title: "Kumar 2012: 295 patients" });
  if (step === 1) q(s, "So what number worries you?", 5.6, { size: 24 });
  else {
  q(s, "Above 150 to 200 and not falling: worry about the brain", 5.55, { hl: true, size: 22 });
  body(s, [{ t: "No single level rules ICH in or out. Read it with the HE grade and the trend", nb: true, i: true, align: "center" }],
    { y: 6.1, h: 0.6, size: 18 });
  }
  src(s, "Clemmesen JO et al. Hepatology 1999 [PMID: 10051463]; Kumar R et al. Clin Gastroenterol Hepatol 2012 [PMID: 22521861]; more studies in the appendix");
  s.addNotes("Left: in Copenhagen, ammonia was drawn at the onset of grade III encephalopathy. The 14 patients who herniated had about twice the arterial ammonia of those who didn't, and all of them were above 146. Right: in Delhi, ammonia that stayed at or above 122 for three days went with a third of the survival and twice the cerebral edema of ammonia that came down. These are associations, not proof that lowering the number saves the patient, but they are why we trend it. In Bernal's King's cohort, more than 200 meant intracranial hypertension in 55%, yet most patients who developed ICH were below 200. Practical point: whatever you send, put it on ice and get it run quickly. A delayed sample reads falsely high. In cirrhosis, a single ammonia doesn't diagnose HE and shouldn't be trended to dose lactulose.");
  return s;
});
twoStep((step) => {
  const s = slide("Lactulose for her?");
  body(s, [{ t: "Hour 12: ammonia 182 μmol/L, grade III. In a cirrhotic we'd already be giving it", nb: true, i: true, align: "center" }],
    { y: 1.3, h: 0.5, size: 19 });
  if (step === 1) { q(s, "Yes or no?", 3.2, { size: 34 }); return s; }
  table(s, [
    ["Why people give it", "Why not"],
    ["Ammonia drives the brain swelling", { t: "No proven benefit. ALFSG matched comparison: a little longer survival time, no difference in encephalopathy or outcome", b: true }],
    ["It's what we do in cirrhosis", "Gas-distended bowel gets in the surgeon's way at transplant"],
    ["Cheap, and the AASLD position paper allows it in early grades, short of diarrhea", "Diarrhea means free water loss and volume swings, which fight your sodium target"],
    ["", "Liquid by mouth or tube: aspiration risk"],
  ], { x: 0.8, y: 2.0, w: W - 1.6, colW: [5.0, 6.73], size: 17, rowH: [0.5, 0.95, 0.7, 0.85, 0.7], valign: "middle" });
  q(s, "Not for her", 6.05, { hl: true, size: 22 });
  src(s, "AASLD position paper 2011, rec. 26; Alba L, Hay JE, Lee WM et al. J Hepatol 2002;36(Suppl 1):33 (abstract); ACG ALF 2023 [PMID: 37377263]");
  return s;
}).addNotes("The ALF Study Group data were a retrospective comparison presented only as an abstract: a small increase in survival time with lactulose, no difference in encephalopathy grade or overall outcome. The 2011 AASLD position paper allowed lactulose in early encephalopathy, orally or rectally, but not to the point of diarrhea, and warned about bowel distension during transplant. Neither the 2023 ACG guideline nor EASL 2017 recommends it. What actually lowers her ammonia comes in a few slides; don't give it away here. In ACLF it's the opposite: lactulose is first-line for overt HE.");
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
      { t: [{ t: "Propofol: short-acting, may lower ICP", br: true }, { t: "Avoid long-acting benzodiazepines", br: true }, { t: "Sedation hides the neuro exam: check pupils" }] },
    ],
  ], { x: 0.8, y: 2.3, w: W - 1.6, colW: [3.6, 4.1, 4.03], size: 18, rowH: [0.5, 1.9], valign: "top" });
  src(s, "Practical update 2024 [PMID: 39170946]; ACG ALF 2023 [PMID: 37377263]; SCCM 2020 [PMID: 32058387]");
  return s;
}
intubate(1).addNotes("I'd intubate her now. Most fellows want to wait. In ALF the progression from grade II to grade IV can be fast, and an emergency intubation in a coagulopathic, hypotensive patient with a swollen brain is the worst version of this procedure.");
cont(); intubate(2).addNotes("The goals are airway protection, controlled ventilation, and no swings in blood pressure or CO2. Peri-intubation hypotension drops cerebral perfusion pressure; coughing raises ICP. Plan it like a neuro intubation.");
function hypercap(step) {
  const s = slide("Can we use permissive hypercapnia?");
  body(s, [{ t: "After intubation: bilateral infiltrates, P/F 150 on PEEP 10", nb: true, align: "center", i: true }], { y: 1.3, h: 0.5, size: 20 });
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
cont(); hypercap(2).addNotes("Low tidal volume still applies. What changes is the CO2 target. Prophylactic hyperventilation is out; brief hyperventilation as a bridge in impending herniation is a different thing.");
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
  const s = slide("Protecting the brain: every patient with grade III-IV");
  body(s, [
    "Head of bed 30°, neck neutral",
    "Treat fever, avoid hypoglycemia",
    { runs: ["Sodium ", { t: "145 to 155 mmol/L", b: true }, " with hypertonic saline (use your center's protocol)"] },
    "Avoid fluid overload",
    "Treat seizures, EEG if in doubt. No routine prophylaxis",
    "No cooling: 34 °C did not prevent intracranial hypertension in an RCT",
  ], { size: 21, gap: 12, w: 7.9 });
  s.addImage({ path: path.join(IMG, "head-of-bed-30.png"), x: 8.75, y: 1.5, w: 4.2, h: 4.2, altText: "Watercolor of an empty ICU bed with the head raised about 30 degrees" });
  src(s, "SCCM 2023 [PMID: 37052436]; update 2022 [PMID: 36001996]; Bernal W et al. J Hepatol 2016;65:273-9");
  s.addNotes("Sodium targets differ between sources: the 2022 update uses 145 to 155 for prevention, the 2024 practical review a lower range. Agree on one with transplant hepatology and write it in the orders. Hypertonic saline is a conditional SCCM recommendation for patients at risk of intracranial hypertension. The cooling trial randomized intubated high-risk ALF patients to 34 vs 36 °C for 72 hours; no difference in intracranial hypertension or survival. Avoid fever, don't induce hypothermia.");
}
{
  const s = slide("A surge: new hypertension, bradycardia or a pupil");
  body(s, [
    "Hyperosmolar bolus (hypertonic saline or mannitol)",
    "Brief hyperventilation as a bridge",
    "Call the transplant team now",
    { t: "Things to know", b: true, nb: true, gap: 18 },
    "Hypertension and bradycardia come late. Don't wait for them",
    "A normal head CT does not exclude raised ICP",
    "ICP monitors are not routine; SCCM suggests against (very low certainty)",
  ], { x: 0.7, y: 1.4, w: 7.0, h: 5.4, size: 19, gap: 10 });
  pic(s, "ct-edema.png", 7.9, 2.0, 4.9, 3.6, "Head CT: normal and with effaced sulci");
  src(s, "SCCM 2023 [PMID: 37052436]; practical update 2024 [PMID: 39170946]");
  s.addNotes("A new pupil asymmetry or a sudden change in the exam is enough to act. Treat first, then image if a bleed or another structural lesion is possible.");
}
function crrt(step) {
  const s = slide("The creatinine is only 1.3");
  body(s, [{ t: "Ammonia 182 → 214 μmol/L, grade III, urine output 15 mL/h", nb: true, align: "center", i: true }], { y: 1.3, h: 0.5, size: 20 });
  if (step === 1) { q(s, "Do you wait for a conventional dialysis indication?", 3.3, { size: 28 }); return s; }
  q(s, "No. In ALF, start CRRT for the ammonia", 2.0, { hl: true, size: 24 });
  body(s, [
    "ACG 2023: suggests early CRRT for hyperammonemia with grade II or higher encephalopathy, even without a renal indication (conditional, very low certainty)",
    "Continuous, not intermittent: fewer swings in blood pressure and brain water",
    "Call nephrology now",
  ], { y: 2.8, h: 4.0, size: 20, w: 8.0 });
  s.addImage({ path: path.join(IMG, "crrt-machine.png"), x: 9.05, y: 2.65, w: 3.85, h: 3.85, altText: "Watercolor of a CRRT machine with filter and circuit" });
  src(s, "ACG ALF guideline 2023 [PMID: 37377263]; update 2022 [PMID: 36001996]");
  return s;
}
crrt(1).addNotes("Ask them. Nephrology will often say the creatinine doesn't meet criteria. That's the wrong frame for ALF.");
cont(); crrt(2).addNotes("Ammonia around 150 to 200 is a high-risk context in the literature, not a universal threshold. Look at the trajectory and the neuro exam. Coordinate the CRRT fluid with the sodium plan or the dialysis will pull her sodium back down.");
inr(1).addNotes("Hour 12, CRRT is starting. Very common request from the procedure side.");
cont(); inr(2).addNotes("The INR is a great marker of liver function and a poor marker of bleeding risk in ALF. Spontaneous bleeding is uncommon. Ask transplant hepatology before giving plasma: they need the native INR.");
twoStep((step) => {
  const s = slide("INR 4.2. What does the TEG say?");
  pic(s, "stravitz-teg.png", 2.4, 1.3, W - 4.8, 4.6, "Normal thromboelastogram in acute liver failure", { line: true });
  if (step === 2) body(s, [{ t: "Normal in all five TEG measures, in a patient with ALF and an INR of 4.2", nb: true, i: true, align: "center" }], { y: 6.05, h: 0.5, size: 18 });
  src(s, "Stravitz RT et al. J Hepatol 2012;56:129-36 [PMID: 21703173]");
  s.addNotes("51 patients with acute liver injury or failure, mean INR 3.4. Mean TEG values were normal, and all five TEG parameters were normal in 63%. Low clot strength showed up only with platelets under about 126,000. Factors V and VII were low, but so were the anticoagulant proteins, and factor VIII was high.");
  return s;
});
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
  const s = slide(null, { master: "BLANK" });
  s.addText("I know what you're thinking...", { x: 0.8, y: 2.6, w: W - 1.6, h: 1.4, fontFace: "Georgia", fontSize: 44, italic: true,
    align: "center", valign: "middle", color: "000000", isTextBox: true, margin: 0 });
  s.addNotes("Pause. Someone in the room has heard it from nephrology.");
}
twoStep((step) => {
  const s = slide("\"CVVH doesn't clear ammonia\"");
  if (step === 1) { q(s, "True or false?", 3.2, { size: 32 }); return s; }
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
  return s;
});
twoStep((step) => {
  const s = slide("Does early CRRT actually help?");
  pic(s, "cardoso-fig1b.png", 1.9, 1.3, W - 3.8, 4.7, "Ammonia on days 1 to 3 with CRRT, intermittent RRT or no RRT", { line: true });
  if (step === 2) body(s, [{ t: "Ammonia fell from about 140 to under 90 μmol/L over 3 days on CRRT. Little change with intermittent RRT or no RRT", nb: true, i: true, align: "center" }],
    { y: 6.1, h: 0.6, size: 17 });
  src(s, "Cardoso FS et al. Hepatology 2018;67:711-20 [PMID: 28859230]");
  s.addNotes("US ALF Study Group registry, 1,186 patients. Panel b of their Figure 1. The CRRT patients started higher, which is why they got CRRT. Observational, so it shows ammonia comes down on CRRT, not that CRRT saved them.");
  return s;
});
twoStep((step) => {
  const s = slide("Does early CRRT actually help?");
  table(s, [
    ["", "US ALF Study Group cohort (2018)", "Pilot RCT (2026)"],
    ["Design", "Large registry, observational", "Open label, ALF with cerebral edema"],
    ["Comparison", "CRRT vs no CRRT", "CRRT within 12 hours vs delayed CRRT"],
    ["Finding", ans(step, "CRRT linked to lower ammonia and better 21-day transplant-free survival"), ans(step, "Primary endpoint, 28-day survival: similar by intention to treat. Fewer deaths in the first 7 days (2.2% vs 17.8%)")],
    ["Catch", { t: ans(step, "Association. Sicker or healthier patients may have been picked for CRRT"), b: true }, { t: ans(step, "Small pilot, one center, many protocol violations. Needs a larger trial"), b: true }],
  ], { x: 0.7, y: 1.5, w: W - 1.4, colW: [1.9, 5.0, 5.03], size: 16, rowH: [0.5, 0.8, 0.8, 1.2, 1.1] });
  src(s, "Cardoso FS et al. Hepatology 2018 [PMID: 28859230]; Aliment Pharmacol Ther 2026 [PMID: 42332991]");
  s.addNotes("The 2026 trial is interesting but don't oversell it. The early mortality signal is real in the abstract; 28-day survival by intention to treat was comparable, and the per-protocol analysis is biased by crossovers. Read the full methods before quoting more numbers.");
  return s;
});

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
enzymes(1);
cont(); enzymes(2);
function inr(step) {
  const s = slide("Should we correct this INR?");
  body(s, [{ t: "Hour 12: INR 4.1, platelets 88,000. She needs a dialysis catheter", nb: true, align: "center", i: true }], { y: 1.3, h: 0.5, size: 20 });
  if (step === 1) { q(s, "2 units of FFP first?", 3.3, { size: 30 }); return s; }
  body(s, [
    { runs: [{ t: "No plasma just to fix the number", b: true, hl: true }] },
    "The INR measures only part of clotting, and in ALF it doesn't predict who bleeds",
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
    s.addImage({ path: path.join(IMG, "phone.png"), x: (W - 2.9) / 2, y: 4.2, w: 2.9, h: 2.9, altText: "Watercolor of a desk phone with the handset off the hook" });
    return s;
  }
  q(s, "You should have called on admission, when you first suspected ALF", 1.6, { hl: true, size: 24 });
  body(s, [
    "King's College criteria predict death without transplant. They are specific, not sensitive",
    "They are not a referral threshold. If you wait for them, the evaluation starts too late",
    { runs: ["Patient A: arterial pH ", { t: "7.26", b: true, red: true }, " on day 2 after fluids. She now meets the acetaminophen criteria"] },
  ], { y: 2.6, h: 3.4, size: 21, gap: 14, w: 8.4 });
  s.addImage({ path: path.join(IMG, "phone.png"), x: 9.4, y: 2.6, w: 3.5, h: 3.5, altText: "Watercolor of a desk phone with the handset off the hook" });
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
cont(); kcc(2).addNotes("King's College criteria are specific but not very sensitive. If you wait for them, the evaluation starts too late. Patient A now meets acetaminophen criteria by pH, but the call happened on admission. Transplant referral, listing and allocation are separate decisions; the transplant team handles the last two.");
paper("Can plasma exchange buy time?", "larsen-title.png", "larsen-fig1.png",
  "Larsen FS et al. J Hepatol 2016;64:69-78 [PMID: 26325537]", "Larsen 2016 plasma exchange trial", 2.4)
  .addNotes("Their Figure 1: hospital survival, high-volume plasma exchange (HPV) vs standard medical treatment (SMT), log-rank p = 0.0058.");
twoStep((step) => {
  const s = slide("Can plasma exchange buy time?");
  table(s, [
    ["Study", "Open randomized trial, ALF, high-volume plasma exchange for 3 days vs standard care, 182 patients"],
    ["Main finding", "Hospital survival 58.7% vs 47.8% (HR 0.56); best in patients who were not transplanted"],
    ["What it doesn't show", { t: ans(step, "Not blinded; one regimen in one population. Says nothing about ACLF or about albumin dialysis devices"), b: true }],
    ["So", ans(step, "A bridge to discuss with transplant hepatology. Not a reason to delay listing")],
  ], { x: 0.9, y: 1.6, w: W - 1.8, colW: [2.8, 8.73], size: 18, rowH: [1.0, 1.0, 1.1, 0.9], header: false });
  src(s, "Larsen FS et al. J Hepatol 2016 [PMID: 26325537]");
  s.addNotes("High-volume plasma exchange removes cytokines and DAMPs and replaces coagulation factors. Note the INR after plasma exchange is no longer the patient's INR.");
  return s;
});

{
  const s = slide("Let's recap: bed 4, day 3");
  table(s, [
    ["Problem", "What she's on", "What we watch"],
    ["Acetaminophen ALF, meets King's (pH 7.26)", "NAC. Listed status 1A on day 2", "Time to an offer"],
    ["Grade III-IV encephalopathy, ammonia 182", "Intubated, normal CO2, sodium 145 to 155, CRRT", "Pupils, ammonia on CRRT, sodium"],
    ["Lactate 5.8 and rising", "Volume and MAP, look for infection", "Lactate, MAP, pressor need"],
    ["INR 5.6, not bleeding", "No plasma", "Bleeding, INR trend"],
    ["Infection risk", "Surveillance cultures", "New fever or shock: low bar for antibiotics and antifungals"],
  ], { x: 0.7, y: 1.4, w: W - 1.4, colW: [3.9, 4.1, 3.93], size: 16, rowH: [0.45, 0.75, 0.75, 0.6, 0.6, 0.75] });
  src(s, "Made-up numbers for teaching");
  s.addNotes("This is where she is while she waits. What would close the window: fixed dilated pupils, uncontrolled sepsis, rising support despite everything. If she becomes hypotensive: norepinephrine first, vasopressin next, hydrocortisone if refractory, and keep the MAP high enough for cerebral perfusion. Status 1A is the OPTN category for ALF in the ICU; check current policy before quoting details.");
}
{
  const s = slide(null, { master: "BLANK" });
  s.addImage({ path: path.join(IMG, "pause-stethoscope.jpg"), x: -0.05, y: 0, w: 13.43, h: 7.5, altText: "Watercolor of a coiled stethoscope on ivory paper" });
  s.addText("Any questions so far?", { x: 0.8, y: 1.9, w: W - 1.6, h: 1.4, fontFace: "Georgia", fontSize: 48, align: "center",
    valign: "middle", color: "000000", isTextBox: true, margin: 0 });
}

// ---------------------------------------------------------------- Patient B
sec("Patient B");
bgDivider("Bed 7", "56M, cirrhosis and fever", "divider-bed7.jpg", "Watercolor of a shrunken nodular cirrhotic liver").addNotes("Second patient, in the unit at the same time.");
{
  const s = slide("Back to day 1: bed 7");
  table(s, [
    [{ t: "Bed 4", grey: true }, { t: "Bed 7", hl: true }],
    [{ t: "28-year-old woman", grey: true }, "56-year-old man"],
    [{ t: "Acetaminophen ALF", grey: true }, "Alcohol-related cirrhosis with ascites"],
    [{ t: "Intubated, on CRRT, transplant hepatology involved", grey: true }, "Fever, confusion, low blood pressure"],
  ], { x: 2.2, y: 2.0, w: 8.9, colW: [4.45, 4.45], size: 20, rowH: 0.65, align: ["center", "center"] });
  q(s, "Is this liver failure too?", 5.2, { size: 26 });
  s.addNotes("While bed 4 is going on, the nurse from bed 7 calls: his pressure is 82/46. Same day, same unit, a sick liver again. Let them guess before the next slide whether this is the same disease.");
}
const B_TITLE = "56M, cirrhosis and fever";
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
  const s = slide(B_TITLE);
  body(s, [
    "Alcohol-related cirrhosis, ascites on diuretics; last drink 3 weeks ago",
    "Temp 38.4 °C, HR 112, BP 82/46",
    "RR 26, SpO2 92% on a 35% Venturi mask; PaO2 74",
    "Confused, asterixis (grade II)",
    "Urine output 15 mL/h",
  ], { x: 0.7, y: 1.5, w: 6.4, h: 3.7, size: 19 });
  table(s, B_LABS, { x: 7.4, y: 1.5, w: 5.3, colW: [2.5, 1.4, 1.4], size: 15, rowH: 0.42 });
  q(s, "What's your next step?", step === 1 ? 5.6 : 5.3, { size: step === 1 ? 24 : 22 });
  if (step === 2) q(s, "Find the source: cultures, antibiotics", 5.95, { hl: true, size: 22 });
  return s;
}
caseB(1).addNotes("Made-up patient. Same day, bed 7. After 2 L of fluid he is on norepinephrine 0.15 mcg/kg/min.");
cont(); caseB(2).addNotes("Same as bed 4: treat first, label later. We'll count organs once the antibiotics are in.");
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
  ], { y: 1.45, h: 5.4, size: 20, w: 8.3 });
  s.addImage({ path: path.join(IMG, "paracentesis.png"), x: 9.25, y: 1.7, w: 3.75, h: 3.75, altText: "Watercolor of a paracentesis set with tubes of ascitic fluid and a culture bottle" });
  src(s, "EASL ACLF 2023 [PMID: 37364789]; SCCM 2023 [PMID: 37052436]");
  return s;
}
tap(1).addNotes("Ask what tipped him over before showing the answer. Then the procedural question: people hesitate to tap a coagulopathic patient.");
cont(); tap(2).addNotes("Diagnostic paracentesis is low risk and should not wait for correction of the INR or platelets. Infection is the most common precipitant of ACLF in Western cohorts.");
twoStep((step) => {
  const s = slide("Why is he hypotensive?");
  table(s, [
    ["Mechanism", "What you do"],
    [ans(step, "Sepsis (SBP)"), ans(step, "Cultures, antibiotics in the first hour, source control. Cover for prior exposure and local resistance")],
    [ans(step, "Splanchnic vasodilation of cirrhosis"), ans(step, "Norepinephrine. Start at MAP 65 and adjust to perfusion")],
    [ans(step, "Too little volume, or too much"), ans(step, "Ultrasound and dynamic measures")],
    [ans(step, "Hidden bleeding"), ans(step, "Hemoglobin, rectal exam, think varices")],
    [ans(step, "Relative adrenal insufficiency"), ans(step, "Hydrocortisone if shock is refractory")],
    [ans(step, "Cirrhotic cardiomyopathy"), ans(step, "Echo")],
  ], { x: 0.8, y: 1.4, w: W - 1.6, colW: [4.0, 7.73], size: 17, rowH: [0.5, 0.85, 0.7, 0.7, 0.6, 0.6, 0.6] });
  if (step === 2) q(s, "Usually more than one of these", 6.15, { size: 22 });
  src(s, "Surviving Sepsis 2026 [PMID: 41869847]; SCCM 2020 [PMID: 32058387]; EASL ACLF 2023 [PMID: 37364789]");
  s.addNotes("Albumin is a reasonable resuscitation fluid in cirrhosis, but every bag goes somewhere. Keep that in mind for the next few slides.");
  return s;
});
twoStep((step) => {
  const s = slide("Too little volume, or too much?");
  pic(s, step === 1 ? "ivc-q.png" : "ivc.png", 0.8, 1.4, W - 1.6, 4.3, "IVC on ultrasound, two patients");
  if (step === 1) { q(s, "Which one would you give more fluid?", 6.0, { size: 24 }); return s; }
  body(s, [{ t: "Left: a full, plethoric IVC. Right: an IVC that collapses", nb: true, i: true, align: "center" }], { y: 5.85, h: 0.45, size: 18 });
  q(s, "Look before you give the next liter", 6.3, { size: 22 });
  s.addNotes("Ascites and a tense belly change IVC size and collapse, so use it with the lungs, the heart and the trend, not alone. Edema in a cirrhotic doesn't mean the vessels are full.");
  return s;
});
{
  const s = slide("Splanchnic vasodilation in cirrhosis");
  s.addImage({ path: path.join(IMG, "splanchnic.png"), x: (W - 8.9) / 2, y: 1.3, w: 8.9, h: 5.35, altText: "Splanchnic vasodilation in cirrhosis" });
  src(s, "Rondon-Berrios H, Velez JCQ. Clin Liver Dis 2022");
  s.addNotes("Portal hypertension, nitric oxide, splanchnic vasodilation, a low effective arterial volume, then RAAS, sympathetic tone and vasopressin. That's his baseline MAP, his sodium of 127 and his kidney, before the infection even started.");
}
twoStep((step) => {
  const s = slide("ALF, decompensation or ACLF?");
  table(s, [
    ["", "Acute liver failure", "Acute decompensation", "ACLF"],
    [{ t: "Liver before", b: true }, ans(step, "No cirrhosis"), ans(step, "Cirrhosis"), ans(step, "Cirrhosis (or chronic liver disease, depending on definition)")],
    [{ t: "What defines it", b: true }, ans(step, "INR ≥ 1.5 + encephalopathy"), ans(step, "Ascites, bleeding, encephalopathy, jaundice"), ans(step, "Decompensation + organ failure")],
    [{ t: "What usually kills", b: true }, ans(step, "Brain, multiorgan failure, sepsis"), ans(step, "Bleeding, infection. Can turn into ACLF"), ans(step, "Infection, shock, multiorgan failure")],
    [{ t: "ICU focus", b: true }, ans(step, "Brain, ammonia, early CRRT"), ans(step, "Treat the trigger"), ans(step, "Source control, shock, kidney vs lung")],
    [{ t: "Transplant", b: true }, ans(step, "Urgent listing pathway"), ans(step, "Refer when MELD or the complication calls for it"), ans(step, "Narrow window; reassess daily")],
  ], { x: 0.6, y: 1.4, w: W - 1.2, colW: [2.2, 3.2, 3.2, 3.53], size: 16, rowH: [0.5, 0.95, 0.8, 0.8, 0.8, 0.8] });
  src(s, "EASL ALF 2017 [PMID: 28417882]; EASL ACLF 2023 [PMID: 37364789]");
  s.addNotes("Patient A is in the first column, patient B in the last. The words sound alike; the ICU problems are different.");
  return s;
});
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
cont(); organs(2).addNotes("Kidney and circulation. Respiratory is borderline: PaO2 74 on a Venturi mask at 0.35 is a P/F of 211. That's why he's on a Venturi mask here: nasal cannula doesn't give you a reliable FiO2, so if the grade depends on the lungs, get a gas on a known FiO2. Watch that row.");
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
  body(s, [{ t: "A patient with \"no ACLF\" can still be very sick. Use the CLIF-C calculator", nb: true, i: true, align: "center" }],
    { y: 6.0, h: 0.6, size: 18 });
  src(s, "Moreau R et al. Gastroenterology 2013 [PMID: 23474284]; EASL ACLF 2023 [PMID: 37364789]");
  s.addNotes("Grade 1 is the confusing one: kidney failure alone counts, but a single other organ failure counts only with some kidney dysfunction, or mild encephalopathy for the non-brain organs. Brain failure alone needs the creatinine of 1.5 to 1.9. A patient with grade III HE and a normal creatinine is 'no ACLF' by this system, and can still be very sick. Use the CLIF-C calculator rather than memorizing it. The grade at days 3 to 7 says more than the grade at admission.");
}
{
  const s = slide("28-day mortality by ACLF grade");
  bars(s, [{ name: "28-day mortality", labels: ["No ACLF", "ACLF 1", "ACLF 2", "ACLF 3"], values: [4.7, 22.1, 32.0, 76.7] }],
    { x: 2.0, y: 1.4, w: 9.3, h: 4.4, max: 100, fmt: '0.0"%"', colors: ["7F7F7F", "7F7F7F", "7F7F7F", RED], gap: 70, catSize: 17 });
  body(s, [{ t: "CANONIC, 1,343 patients, 2013", nb: true, i: true, align: "center" }],
    { y: 5.95, h: 0.6, size: 18 });
  src(s, "Moreau R et al. Gastroenterology 2013 [PMID: 23474284]");
  s.addNotes("Patient B is grade 2 on day 1. That is a group number from a 2013 cohort, not his number. The jump to grade 3 is the one to remember. The grade at days 3 to 7 says more than the grade at admission, which comes back later.");
}
{
  const s = slide("Why do the organs fail?");
  const bw = 3.3, bh = 0.95, y1 = 1.6, y2 = 3.4;
  box(s, 0.6, y1, bw, bh, "Trigger: SBP");
  box(s, 4.95, y1, bw, bh, "Bacterial products and damaged-cell signals (PAMPs, DAMPs)");
  box(s, 9.3, y1, bw, bh, "Systemic inflammation, cytokine storm", { b: true });
  arrow(s, 0.6 + bw, y1 + bh / 2, 4.95, y1 + bh / 2);
  arrow(s, 4.95 + bw, y1 + bh / 2, 9.3, y1 + bh / 2);
  box(s, 9.3, y2, bw, bh, "Worse vasodilation on top of portal hypertension");
  box(s, 4.95, y2, bw, bh, "Immune paralysis, mitochondrial failure");
  box(s, 0.6, y2, bw, bh, "Organ failure", { b: true, color: RED, line: RED });
  arrow(s, 9.3 + bw / 2, y1 + bh, 9.3 + bw / 2, y2);
  arrow(s, 9.3, y2 + bh / 2, 4.95 + bw, y2 + bh / 2);
  arrow(s, 4.95, y2 + bh / 2, 0.6 + bw, y2 + bh / 2);
  body(s, [
    { runs: ["Bed 7 so far: ", { t: "kidney", b: true, red: true }, " and ", { t: "circulation", b: true, red: true }] },
    "Treat the trigger early and support the organs; there is no drug for the inflammation itself",
  ], { y: 4.8, h: 1.8, size: 20, gap: 10 });
  src(s, "Concept from Arroyo V, Moreau R, Jalan R. N Engl J Med 2020");
  s.addNotes("ALF had its 'why does the brain swell'. This is the ACLF version. The precipitant sets off systemic inflammation in a patient who is already vasodilated, and the organs fail from a mix of low perfusion, inflammation and mitochondrial dysfunction. The patient is both inflamed and immunosuppressed, which is why second infections are common.");
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
function hrs(step) {
  const s = slide("Does he have HRS?");
  body(s, [{ t: "12 hours later: creatinine 3.0, urine 10 mL/h, still on norepinephrine", nb: true, align: "center", i: true }], { y: 1.3, h: 0.5, size: 19 });
  if (step === 1) { q(s, "HRS? Start terlipressin?", 3.3, { size: 30 }); return s; }
  const a = (v) => (step === 2 ? "" : v);
  table(s, [
    ["HRS-AKI (ADQI-ICA 2024)", "Bed 7, day 1", ""],
    ["Cirrhosis with ascites", a("Yes"), { t: a("✅"), align: "center" }],
    ["AKI by creatinine and/or urine output", a("Creatinine 0.9 → 3.0, urine 10 mL/h"), { t: a("✅"), align: "center" }],
    ["No improvement within 24 hours of volume resuscitation, if he needs it", a("2 L given on arrival. Too early to say"), { t: a("❌"), align: "center" }],
    ["No strong alternative explanation (shock, nephrotoxins, structural injury)", { t: a("Septic shock on norepinephrine"), b: true, red: true }, { t: a("❌"), align: "center" }],
  ], { x: 0.7, y: 1.95, w: W - 1.4, colW: [5.6, 5.0, 1.33], size: 17, rowH: [0.45, 0.55, 0.65, 0.75, 0.75] });
  if (step === 2) q(s, "Go down the list for him. Which boxes does he tick?", 5.6, { size: 24 });
  else q(s, "Not HRS yet. Treat the shock first", 5.6, { hl: true, size: 24 });
  src(s, "ADQI-ICA consensus, J Hepatol 2024 [PMID: 38527522]");
  return s;
}
function hrsDefs() {
  const s = slide("HRS-AKI: what changed in 2024");
  table(s, [
    ["What many of us learned (ICA 2015)", "Now (ADQI-ICA 2024)"],
    [
      { t: [{ t: "No response after 2 days of diuretic withdrawal and albumin 1 g/kg", br: true }, { t: "No shock", br: true }, { t: "No nephrotoxins, no structural kidney disease" }] },
      { t: [{ t: "Cirrhosis with ascites", br: true }, { t: "AKI by creatinine and/or urine output", br: true }, { t: "No improvement within 24 hours of volume resuscitation, if he needs it", br: true }, { t: "No albumin challenge if he is already euvolemic or wet", br: true }, { t: "No strong alternative explanation as the main cause" }] },
    ],
  ], { x: 0.8, y: 1.5, w: W - 1.6, colW: [5.86, 5.87], size: 20, rowH: [0.55, 2.6], valign: "top" });
  q(s, "Faster to call. But you still have to look for the other causes", 5.3, { size: 22 });
  src(s, "Angeli P et al. J Hepatol 2015 (ICA); ADQI-ICA consensus, J Hepatol 2024 [PMID: 38527522]");
  return s;
}
hrs(1).addNotes("The reflex in many units: oliguric cirrhotic, give albumin for 48 hours, then terlipressin.");
hrsDefs().addNotes("The left column is what most of us were taught. The 48-hour albumin challenge is gone, and there is no fluid challenge at all for a patient who is already wet.");
hrs(2).addNotes("Let the room fill it in.");
cont(); hrs(3).addNotes("AKI here means creatinine up 0.3 mg/dL or more within 48 hours, or 50% or more within 7 days, and/or urine output 0.5 mL/kg/h or less for 6 hours or more. The mandatory 48-hour albumin challenge is gone, and a patient who is already wet doesn't need a fluid challenge to satisfy a clock. HRS physiology and tubular injury can coexist. Assessment is faster and individualized. But that cuts both ways: you also need to look for the other causes, and right now sepsis is the obvious one.");
{
  const s = slide("Kidney failure in cirrhosis is usually a mixture");
  body(s, [
    { t: "Possible contributors", b: true, nb: true },
    "Low effective volume",
    "Tubular injury: sepsis, contrast, drugs",
    "HRS physiology",
    "Tense ascites (abdominal compartment)",
    "Congestion",
  ], { x: 0.6, y: 1.4, w: 4.4, h: 5.0, size: 19 });
  s.addImage({ path: path.join(IMG, "kidney.png"), x: 5.0, y: 1.75, w: 3.3, h: 3.3, altText: "Watercolor of a kidney with its hilar vessels and ureter" });
  body(s, [
    { t: "Look", b: true, nb: true },
    "Urinalysis and sediment",
    "Drug list",
    "Ultrasound: kidneys, bladder, IVC, heart, lungs",
    "Bladder pressure if the belly is tight",
    { runs: ["A low urine sodium is ", { t: "not", b: true }, " proof of HRS"] },
  ], { x: 8.3, y: 1.4, w: 4.5, h: 5.0, size: 19 });
  src(s, "ADQI-ICA consensus 2024 [PMID: 38527522]");
  s.addNotes("These coexist and change over the admission. A diagnosis of HRS made on day 1 should be re-examined on day 2.");
}
{
  const s = slide("Function and damage: four kinds of AKI");
  pic(s, "adqi-fig4.png", 2.2, 1.25, W - 4.4, 5.5, "ADQI framework of AKI phenotypes by function and damage markers");
  src(s, "Nadim MK et al. J Hepatol 2024;81:163-83 [PMID: 38527522], Fig. 4 (CC BY 2.0, adapted from ADQI)");
  s.addNotes("HRS-AKI sits in the bottom row: dysfunction, with or without damage. ATN and HRS can coexist. Damage markers such as urine NGAL help where available; a urine sediment helps everywhere.");
}
function heB(step) {
  const s = slide("Day 1: more confused");
  body(s, [
    "More disoriented, pulling at his lines, asterixis. Awake, follows commands",
    { runs: ["The nurse sent an ammonia: ", { t: "88 μmol/L", b: true }] },
  ], { y: 1.4, h: 1.2, size: 21 });
  if (step === 1) { q(s, "More lactulose? Repeat the ammonia in 6 hours?", 3.6, { size: 26 }); return s; }
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
cont(); heB(2).addNotes("In cirrhosis, HE is a clinical diagnosis. The ammonia level doesn't grade it, and chasing it doesn't help. Every worsening needs the same search for a precipitant as the admission did. Lactulose is right for overt HE, but too much gives you dehydration, hypernatremia and a worse kidney. Don't make every first episode an automatic two-drug start.");
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
cont(); const D2B = day2B(2);
{
  const s = slide("Day 2: what do his lungs look like?");
  pic(s, "cxr-edema.png", 0.6, 1.3, 5.6, 5.4, "Chest X-ray with bilateral pulmonary edema");
  pic(s, "blines.png", 6.5, 1.3, 6.2, 5.4, "Lung ultrasound with B-lines");
  src(s, "Images for teaching, not this patient");
  s.addNotes("Bilateral airspace disease on the film and many B-lines on ultrasound: water in the lungs. It could still be pneumonia or ARDS, so look at the whole picture before you call it all volume.");
}
D2B.addNotes("Kidney, circulation and now lungs: ACLF grade 3. Fluid and albumin are a likely part of this, with B-lines and a full IVC. But think about pneumonia, ARDS and the heart too before you decide it's all volume.");
twoStep((step) => {
  const s = slide("What would you do for his kidney today?");
  if (step === 1) { q(s, "Terlipressin, more albumin, or dialysis?", 3.2, { size: 28 }); return s; }
  body(s, [
    { runs: [{ t: "Terlipressin: not for him today", b: true }] },
    { t: "Label: don't start if SpO2 < 90% or breathing is getting worse", lvl: 1 },
    { t: "Label: avoid in ACLF grade 3 and in volume overload", lvl: 1 },
    "Stop the albumin while he is wet",
    "He is already on a vasoconstrictor. Norepinephrine, titrated to perfusion",
    "RRT if he stays overloaded. For HRS, RRT is a bridge to transplant: if he isn't a candidate, talk about goals before you start",
  ], { y: 1.4, h: 4.6, size: 20 });
  q(s, "Check oxygen and volume before any kidney treatment", 6.05, { size: 20 });
  src(s, "TERLIVAZ prescribing information, revised 6/2026; ADQI-ICA 2024 [PMID: 38527522]");
  s.addNotes("Before any terlipressin dose: baseline SpO2, lung exam, volume status, and whether he is ACLF grade 3. Norepinephrine is an ICU alternative for HRS when terlipressin is contraindicated or unavailable. RRT for volume overload or acidosis follows the usual ICU indications. RRT for HRS alone is a bridge to transplant; in a patient who is not a candidate, it is a goals-of-care conversation first, and a time-limited trial is one honest option.");
  return s;
});
{
  const s = slide("What each HRS drug does to the heart and lungs");
  pic(s, "adqi-fig5.png", 1.4, 1.25, W - 2.8, 5.5, "Effects of HRS-AKI treatments on vascular beds, heart, kidney and lungs");
  src(s, "Nadim MK et al. J Hepatol 2024;81:163-83 [PMID: 38527522], Fig. 5 (CC BY 2.0, adapted from ADQI)");
  s.addNotes("Terlipressin raises kidney perfusion pressure but shunts splanchnic blood centrally, raises afterload and lowers cardiac output, and can constrict the pulmonary vessels. Add large doses of albumin and you get pulmonary edema. Norepinephrine raises cardiac output and causes less splanchnic shunting. Midodrine with octreotide gives only modest splanchnic constriction.");
}
paper("Does HRS reversal mean survival?", "confirm-title.png", "confirm-concl.png",
  "Wong F et al. N Engl J Med 2021;384:818-28 [PMID: 33657294]", "CONFIRM trial")
  .addNotes("CONFIRM: 300 patients with HRS type 1, terlipressin plus albumin vs placebo plus albumin, randomized 2:1. Their own conclusion already has the catch in it.");
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
paper("Should we treat the albumin number?", "attire-title.png", "attire-concl.png",
  "China L et al. N Engl J Med 2021;384:808-17 [PMID: 33657293]", "ATTIRE trial")
  .addNotes("ATTIRE: 777 hospitalized patients with decompensated cirrhosis and albumin under 30 g/L, in 35 UK hospitals.");
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
twoStep((step) => {
  const s = slide("Midodrine and octreotide for HRS-AKI?");
  if (step === 1) {
    body(s, [{ t: "Head to head: terlipressin vs midodrine plus octreotide, both with albumin, type 1 HRS", nb: true, align: "center" }], { y: 2.2, h: 0.9, size: 22 });
    q(s, "How different can two vasoconstrictors be?", 3.6, { size: 28 });
    return s;
  }
  bars(s, [
    { name: "Terlipressin + albumin (n = 27)", labels: ["Complete response", "Complete or partial response"], values: [55.5, 70.4] },
    { name: "Midodrine + octreotide + albumin (n = 21)", labels: ["Complete response", "Complete or partial response"], values: [4.8, 28.6] },
  ], { x: 0.6, y: 1.4, w: 7.4, h: 5.3, max: 100, fmt: '0.0"%"', legend: true });
  body(s, [
    { t: "Randomized, 8 Italian centers, type 1 HRS. 49 randomized (27 vs 22), 48 analyzed", b: true, nb: true },
    "Stopped early at the interim analysis because the difference was already clear",
    "Blood pressure rose more with terlipressin",
    "3-month survival 59% vs 43%; too small to tell",
    "Not a substitute for IV pressors in the ICU",
    { runs: [{ t: "Use it only if terlipressin and norepinephrine are not options", b: true, hl: true }] },
  ], { x: 8.3, y: 1.5, w: 4.6, h: 5.2, size: 17, gap: 8 });
  src(s, "Cavallin M et al. Hepatology 2015;62:567-74 [PMID: 25644760]; ADQI-ICA 2024 [PMID: 38527522]");
  s.addNotes("Midodrine and octreotide were the US default for years because terlipressin wasn't available. In the randomized comparison with terlipressin, 1 of 21 analyzed patients had a complete response. It wasn't powered for mortality. Most of them are on the floor at the time, so the practical message for the ICU is simple: once he needs an ICU bed, norepinephrine with albumin is the alternative to terlipressin, not midodrine and octreotide. About half of the midodrine non-responders were rescued with terlipressin, and most of those then responded.");
  return s;
});
function trajectory(step) {
  const s = slide("What changed since yesterday?");
  const rows = [
    ["", "Day 1", "Day 2", "Day 3", "Day 5"],
    ["Norepinephrine (mcg/kg/min)", "0.15", "0.22", "0.12", "Off"],
    ["Oxygen, SpO2", "Venturi 0.35, 92%", "HFNC 0.6, 90%", "HFNC 0.4, 95%", "2 L, 97%"],
    ["Lung failure?", "No (P/F 211)", { t: "Yes (S/F 150)", red: true }, "No (S/F 238)", "No"],
    ["Kidney", "Cr 2.6", "Cr 3.1", "CRRT for fluid", "On CRRT"],
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
trajectory(1).addNotes("Day 3: CRRT started for fluid overload and oliguria, while the transplant evaluation was under way. Ask the room whether he is better or worse.");
cont(); trajectory(2).addNotes("Grading is a snapshot; the trend is what you act on. Kidney failure on RRT still counts as an organ failure. Bring palliative care in alongside, not instead of, full support. Document what the time-limited trial is and when you'll reassess.");
bgDivider("Who gets a liver?", "Transplant in ACLF", "divider-transplant.jpg", "Watercolor of a donor liver in an organ bag on ice in a transport cooler").addNotes("Back to the question both families will ask.");
twoStep((step) => {
  const s = slide("Too sick for a transplant, or sick enough to need one?");
  if (step === 1) { q(s, "Ventilator, pressors, CRRT, ACLF 3. Is he too sick?", 3.2, { size: 28 }); return s; }
  body(s, [
    "A ventilator, pressors or dialysis do not by themselves exclude transplant",
    "Selected patients with ACLF grade 3 do well after transplant. The window is short",
    { t: "What can close the window", b: true, nb: true, gap: 16 },
    "Uncontrolled infection",
    "Rising vasopressor needs, severe respiratory failure",
    "Irreversible brain injury",
    "Frailty and comorbidity",
    "Alcohol: centers now evaluate individually rather than by a fixed abstinence rule",
  ], { x: 0.6, y: 1.4, w: 6.9, h: 5.4, size: 18 });
  const t = pic(s, "artru-title.png", 7.7, 1.3, 5.1, 1.4, "Artru 2017: title", { line: true });
  pic(s, "artru-fig2.png", 7.7, t.y + t.h + 0.15, 5.1, 6.3 - (t.y + t.h + 0.15), "One-year survival, transplanted ACLF 3 vs non-transplanted controls");
  body(s, [{ t: "Selected patients, not randomized", nb: true, i: true, align: "center" }], { x: 7.7, y: 6.35, w: 5.1, h: 0.45, size: 16 });
  src(s, "Artru F et al. J Hepatol 2017 [PMID: 28645736]; Lancet Gastroenterol Hepatol 2024 [PMID: 38309288]; AASLD/AST 2026 [PMID: 41405234]");
  s.addNotes("Referral, candidacy, listing and allocation are four different decisions. The ICU team owns the referral and the information. Status 1A and other allocation rules: check current OPTN policy before quoting them. Artru's comparison is not randomized: the transplanted patients were selected, so the gap overstates what transplant adds for an unselected ACLF 3 patient. It still shows that ACLF 3 alone is not a reason to say no. The curve shows 83.6% for all 73 transplanted patients; the abstract's 83.9% vs 7.9% is the matched comparison.");
  return s;
});
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
twoStep((step) => {
  const s = slide("ALF and ACLF: what changes at the bedside");
  body(s, [{ t: "Both have a sick liver. Do they have the same disease?", nb: true, i: true, align: "center" }], { y: 1.15, h: 0.45, size: 18 });
  table(s, [
    ["", "Acute liver failure", "ACLF"],
    [{ t: "Ammonia", b: true }, ans(step, "With the HE grade and the trend: brain risk, and when to start CRRT. No level rules out ICH"), ans(step, "Doesn't diagnose HE. Don't trend it to dose lactulose")],
    [{ t: "Lactulose", b: true }, ans(step, "No proven benefit; bowel distension can get in the way of surgery"), ans(step, "Yes for overt HE, plus treat the trigger. Rifaximin as an add-on. Avoid dehydration")],
    [{ t: "Sodium", b: true }, ans(step, "Grade III-IV or high ammonia: center protocol, often 145 to 155, matched to the CRRT fluid"), ans(step, "Often chronically low: correct slowly. In high-risk patients, no more than 8 mmol/L in 24 hours")],
    [{ t: "Antibiotics", b: true }, ans(step, "No routine prophylaxis. Surveillance cultures, low threshold to treat"), ans(step, "Treat infection fast; prophylaxis with GI bleeding")],
    [{ t: "INR", b: true }, ans(step, "Tracks severity, poor at predicting bleeding. No plasma just for the number"), ans(step, "Same. Judge the procedure and the patient")],
  ], { x: 0.6, y: 1.7, w: W - 1.2, colW: [1.9, 5.11, 5.12], size: 16, rowH: [0.45, 0.9, 0.9, 0.95, 0.75, 0.75] });
  src(s, "ACG ALF 2023 [PMID: 37377263]; SCCM 2023 [PMID: 37052436]; update 2022 [PMID: 36001996]");
  s.addNotes("Probably the most useful slide to photograph. The sodium row is where people get hurt: an induced-hypernatremia target transferred into a chronically hyponatremic cirrhotic causes osmotic demyelination.");
  return s;
});

// ---------------------------------------------------------------- Closing
sec("Closing");
{
  const s = slide("What happened to them");
  const tl = (y, label, marks) => {
    s.addText(label, { x: 0.6, y: y - 0.75, w: 6, h: 0.45, fontFace: "Georgia", fontSize: 20, bold: true, color: "000000", isTextBox: true, margin: 0 });
    s.addShape(pres.shapes.LINE, { x: 1.5, y, w: W - 3.0, h: 0, line: { color: "000000", width: 2 } });
    marks.forEach(([pos, day, txt]) => {
      const x = 1.5 + pos * (W - 3.0);
      s.addShape(pres.shapes.OVAL, { x: x - 0.09, y: y - 0.09, w: 0.18, h: 0.18, fill: { color: "000000" }, line: { color: "000000" } });
      s.addText([{ text: day, options: { bold: true, breakLine: true } }, { text: txt }], { x: x - 1.15, y: y + 0.18, w: 2.3, h: 0.95,
        fontFace: "Georgia", fontSize: 14, align: "center", valign: "top", color: "000000", isTextBox: true, margin: 0 });
    });
  };
  tl(2.3, "Bed 4", [[0.0, "Day 0", "Admitted, NAC"], [0.22, "Day 1", "Intubated, CRRT"], [0.44, "Day 2", "Listed 1A"], [0.66, "Day 4", "Transplanted"], [1.0, "Day 19", "Home"]]);
  tl(4.85, "Bed 7", [[0.0, "Day 1", "SBP, ACLF 2"], [0.2, "Day 2", "ACLF 3"], [0.42, "Day 5", "Off pressors, ACLF 1"], [0.66, "Day 12", "Off CRRT"], [1.0, "Day 21", "Home, transplant clinic"]]);
  src(s, "Made-up outcomes for teaching");
  s.addNotes("Both made it, which is not the usual story. Bed 7 could just as easily have stayed ACLF 3 on day 5, and then the conversation is the one on the transplant slide.");
}
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
  const s = slide("Some tricks of the trade");
  body(s, [
    "High AST and ALT alone are not liver failure. Get an INR and examine the patient",
    "Stabilize, treat the cause and call transplant hepatology in the same hour",
    { runs: ["ALF: ", { t: "protect the brain", b: true }, ". Intubate at grade III, keep the CO2 normal, follow your center's sodium plan, and start CRRT for rising ammonia"] },
    "ACLF: count the organs, find the trigger",
    "ACLF: check oxygenation and volume status before albumin or terlipressin",
    "Reassess organ failures daily. The trend matters more than the admission score",
  ], { size: 22, gap: 14 });
}
{
  const s = slide(null, { master: "BLANK" });
  s.addImage({ path: path.join(IMG, "closing-liver.jpg"), x: -0.05, y: 0, w: 13.43, h: 7.5, altText: "Watercolor of a healthy liver in warm light on ivory paper" });
  s.addText("Questions?", { x: 7.1, y: 2.8, w: 5.7, h: 1.4, fontFace: "Georgia", fontSize: 54, align: "center",
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
  addSlideNumbers();
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
