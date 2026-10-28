// Builds "ALF and ACLF in the ICU" in the style of Mohammad Almeqdadi's existing decks.
const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");
const { applyTheme } = require(process.env.SKILL + "/scripts/apply_theme.js");

const OUT = process.argv[2];
// SHORT=1 builds the short version: same deck with some slides left out (marked 'if (!SHORT)')
const SHORT = process.env.SHORT === "1";
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
// The closing "Questions?" slide is the last counted slide; the appendix after it is A1, A2, ...
let MAIN_END = null;
function endMain() { MAIN_END = LOGICAL; }
function addSlideNumbers() {
  const total = MAIN_END || LOGICAL;
  NUMBERED.forEach(({ s, n }, i) => {
    if (i === 0) return; // not on the cover
    s.addText(n > total ? `A${n - total}` : `${n}/${total}`, { x: W - 1.3, y: 7.0, w: 0.9, h: 0.3, fontSize: 9, color: "A6A6A6", fontFace: "Georgia",
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
// Columns are sized from the measured text so cells stay on one line when they can.
// First column (labels) is left-aligned; the header and the value cells are centered unless the text has to wrap.
const CW = JSON.parse(fs.readFileSync(path.join(__dirname, "carlito-widths.json"), "utf8"));
const TBL_PAD = 0.24; // cell margins plus a little slack, inches
function textW(t, size, bold) {
  const m = bold ? CW.b : CW.r;
  let w = 0;
  for (const ch of String(t)) w += m[ch] != null ? m[ch] : 0.55;
  return (w * size) / 72;
}
// hidden answers (ans) are measured but not shown, so both steps of a reveal get the same layout
const unhide = (x) => (x && typeof x === "object" && "hidden" in x ? x.hidden : x);
function cellLines(c, fs, header) {
  c = unhide(c);
  if (c == null) c = "";
  if (typeof c === "string") c = { t: c };
  const runs = Array.isArray(unhide(c.t)) ? unhide(c.t) : [{ ...c, t: unhide(c.t) }];
  const lines = [[]];
  runs.forEach((rr) => {
    rr = unhide(rr);
    if (typeof rr === "string") rr = { t: rr };
    lines[lines.length - 1].push({ t: String(unhide(rr.t) ?? ""), size: rr.size || c.size || fs, b: !!(rr.b || c.b || header) });
    if (rr.br) lines.push([]);
  });
  return lines;
}
function lineW(line) { return line.reduce((a, r) => a + textW(r.t, r.size, r.b), 0); }
function wrapCount(line, width) {
  // greedy word wrap of one line of runs
  let n = 1, cur = 0;
  line.forEach((r) => r.t.split(/(\s+)/).forEach((word) => {
    const ww = textW(word, r.size, r.b);
    if (cur + ww > width && cur > 0 && word.trim()) { n++; cur = textW(word.trimStart(), r.size, r.b); }
    else cur += ww;
  }));
  return n;
}
function table(s, rows, o) {
  const fs = o.size || 14;
  const nc = Math.max(...rows.map((r) => r.length));
  const hasHead = o.header !== false;
  const meas = rows.map((r, ri) => r.map((c) => cellLines(c, fs, hasHead && ri === 0)));
  // column widths: water-fill so short columns get what they need and long ones share the rest
  let colW = o.colW;
  if (!o.keepW) {
    const need = [...Array(nc)].map((_, ci) => Math.max(0.5, ...meas.map((r) => (r[ci] ? Math.max(...r[ci].map(lineW)) : 0))) + TBL_PAD);
    const total = need.reduce((a, b) => a + b, 0);
    if (total <= o.w) {
      const extra = o.w - total;
      colW = need.map((n) => n + (extra * n) / total);
    } else {
      colW = Array(nc).fill(0);
      let open = need.map((_, i) => i), left = o.w, changed = true;
      // the label column keeps its width if it is not too greedy
      if (need[0] <= 0.4 * o.w) { colW[0] = need[0]; left -= need[0]; open = open.slice(1); }
      while (changed && open.length) {
        changed = false;
        const fair = left / open.length;
        const fit = open.filter((i) => need[i] <= fair);
        if (fit.length) {
          fit.forEach((i) => { colW[i] = need[i]; left -= need[i]; });
          open = open.filter((i) => !fit.includes(i)); changed = true;
        }
      }
      const sumOpen = open.reduce((a, i) => a + need[i], 0);
      open.forEach((i) => { colW[i] = (left * need[i]) / sumOpen; });
    }
    colW = colW.map((w) => Math.round(w * 100) / 100);
    colW[nc - 1] = Math.round((o.w - colW.slice(0, -1).reduce((a, b) => a + b, 0)) * 100) / 100;
  }
  // row heights from the number of lines each cell needs
  const lineH = (fs * 1.22) / 72, rowPad = 0.14;
  const lines = meas.map((r) => r.map((cl, ci) => cl.reduce((a, l) => a + wrapCount(l, colW[ci] - TBL_PAD + 0.1), 0)));
  const rowH = lines.map((r) => Math.max(o.minRowH || Math.max(0.4, fs * 0.026), Math.max(...r) * lineH + rowPad));
  lines.forEach((r, ri) => r.forEach((n, ci) => {
    if (n > meas[ri][ci].length) console.warn(`wrap: slide ${NUMBERED.length} r${ri} c${ci} (${n} lines): ${meas[ri][ci].map((l) => l.map((x) => x.t).join("")).join(" / ").slice(0, 70)}`);
  }));
  // a column is centered only if every body cell in it is a single line
  const first = hasHead ? 1 : 0;
  const colCenter = [...Array(nc)].map((_, ci) => lines.slice(first).every((r, k) => {
    const m = meas[first + k][ci];
    return !m || (m.length === 1 && r[ci] <= 1);
  }));
  const data = rows.map((r, ri) => r.map((c, ci) => {
    if (c && typeof c === "object" && "hidden" in c) c = "";
    if (c == null) c = "";
    if (typeof c === "string") c = { t: c };
    if (c.t && typeof c.t === "object" && "hidden" in c.t) c = { ...c, t: "" };
    const header = hasHead && ri === 0;
    const runs = Array.isArray(c.t) ? c.t : [c];
    const text = runs.map((rr) => {
      if (rr && typeof rr === "object" && "hidden" in rr) rr = "";
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
    const label = ci === 0 && !o.noLabel;
    const auto = label ? "left" : (header || colCenter[ci] ? "center" : "left");
    return { text, options: {
      fill: { color: c.fill || (header ? (o.headFill || "F2F2F2") : "FFFFFF") },
      align: c.align || auto,
      valign: o.valign === "top" && !header ? "top" : "middle", color: "000000",
    } };
  }));
  s.addTable(data, { x: o.x, y: o.y, w: o.w, colW, rowH,
    border: { type: "solid", pt: 0.75, color: "A6A6A6" }, margin: o.margin || [3, 6, 3, 6],
    fontFace: TBL_FONT, fontSize: fs, color: "000000", autoPage: false, objectName: o.name || "Table" });
  return { h: rowH.reduce((a, b) => a + b, 0), colW };
}

function q(s, text, y, opts = {}) {
  s.addText(text, { x: opts.x != null ? opts.x : 0.9, y, w: opts.w || W - 1.8, h: opts.h || 0.6, fontFace: "Georgia", fontSize: opts.size || 24,
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
const ans = (step, v) => (step === 1 ? { hidden: v } : v);
function twoStep(fn) { fn(1); cont(); return fn(2); }

// Picture at its own aspect ratio, fitted in a box and centered in it
function pngSize(f) {
  const b = fs.readFileSync(f);
  if (b[0] !== 0xff) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  for (let i = 2; i < b.length;) {
    const m = b[i + 1], len = b.readUInt16BE(i + 2);
    if (m >= 0xc0 && m <= 0xc3) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
    i += 2 + len;
  }
  throw new Error("no size: " + f);
}
function pic(s, file, x, y, maxW, maxH, alt, o = {}) {
  const f = path.join(IMG, file); const [pw, ph] = pngSize(f);
  let w = maxW, h = (maxW * ph) / pw;
  if (h > maxH) { h = maxH; w = (maxH * pw) / ph; }
  const px = o.left ? x : x + (maxW - w) / 2;
  s.addImage({ path: f, x: px, y, w, h, altText: alt });
  return { x: px, y, w, h };
}
// Spot picture centered under a question
function qPic(s, file, y, h, alt) { return pic(s, file, 0.9, y, W - 1.8, h, alt); }
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
  const s = slide("Bed 4 and bed 7", { master: "CONTENT" });
  table(s, [
    ["Bed 4", "Bed 7"],
    ["28-year-old woman", "56-year-old man"],
    ["No known liver disease", "Alcohol-related cirrhosis with ascites"],
    ["Nausea and vomiting for 4 days", "Fever, confusion, low blood pressure"],
  ], { x: 0.4, y: 1.9, w: 7.2, size: 16, noLabel: true, minRowH: 0.55 });
  pic(s, "two-beds.jpg", 7.75, 1.3, 5.2, 4.3, "Watercolor of two empty ICU beds side by side");
  body(s, [{ t: "Is it the same disease?", nb: true, i: true, align: "center" }],
    { y: 5.95, h: 0.6, size: 22 });
  s.addNotes("Introduce both up front so the contrast is there from the start. We'll start with bed 4 and come back to bed 7.");
}

bgDivider("Bed 4", "28F, 4 days of nausea", "divider-bed4.jpg", "Watercolor of an empty ICU bed with an IV pole and monitor").addNotes("First patient.");
const A_TITLE = "28F, 4 days of nausea";
const A_LABS = [
  ["Test", "Result"],
  ["AST", { t: "6,820 U/L", red: true }],
  ["ALT", { t: "5,940 U/L", red: true }],
  ["ALP", "128 U/L"],
  ["Bilirubin", { t: "2.9 mg/dL", red: true }],
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
    ["Bilirubin", { t: "2.9 mg/dL", red: true }],
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
    ["Typical causes", "Acetaminophen, HAV, HEV, ischemia", "HBV", "DILI, AIH, unknown cause"],
    ["Cerebral edema", { t: "Common", b: true }, "Less common", "Uncommon"],
    ["Spontaneous recovery", "More likely", "Intermediate", { t: "Less likely", b: true }],
  ], { x: 0.8, y: 4.15, w: W - 1.6, size: 16 });
  src(s, "EASL ALF guideline 2017 [PMID: 28417882]; ACG ALF 2023 [PMID: 37377263]; Management of ALF: update 2022 [PMID: 36001996]");
  s.addNotes("The time course is not trivia. The faster it comes on, the more you worry about the brain, and paradoxically the better the chance of spontaneous recovery. The slow ones have less cerebral edema but do worse without a transplant. Patient A is hyperacute.");
}
twoStep((step) => {
  const s = slide("Same patient, but wide awake");
  body(s, [{ t: "Same labs and INR 2.4, but fully oriented with no asterixis", nb: true, i: true, align: "center" }], { y: 1.3, h: 0.5, size: 20 });
  if (step === 1) {
    q(s, "What do you call this, and what do you do now?", 1.95, { size: 28 });
    qPic(s, "awake-bed.jpg", 2.75, 4.2, "Watercolor of an empty hospital bed sitting up, with a cup of water, a book and a phone on the tray table");
    return s;
  }
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
  const s = pres.addSlide({ masterName: "BLANK", sectionTitle: section });
  s.addImage({ path: path.join(IMG, "organs-alf-empty.jpg"), x: -0.05, y: 0, w: 13.43, h: 7.5,
    altText: "Watercolor outline of a human figure with no organs drawn in" });
  s.addText("Which other organs fail in ALF?", { x: 0.45, y: 0.35, w: 4.6, h: 1.2, fontFace: "Georgia", fontSize: 30,
    valign: "top", color: "000000", isTextBox: true, margin: 0 });
  return s;
}
// Answer step: Mohammad's Gemini anatomical figure, labels on the quiet thirds pointing at each organ
function featuresAnswer() {
  const s = pres.addSlide({ masterName: "BLANK", sectionTitle: section });
  s.addImage({ path: path.join(IMG, "organs-alf.jpg"), x: -0.05, y: 0, w: 13.43, h: 7.5,
    altText: "Watercolor anatomical figure showing the brain, lungs, heart, liver, pancreas, adrenals, kidneys, spleen and bone marrow" });
  s.addText("Which other organs fail in ALF?", { x: 0.45, y: 0.35, w: 4.6, h: 1.2, fontFace: "Georgia", fontSize: 30,
    valign: "top", color: "000000", isTextBox: true, margin: 0 });
  const label = (side, ly, name, detail, px, py) => {
    const lx = side === "L" ? 0.5 : 8.85, lw = 4.0;
    s.addText([{ text: name, options: { bold: true, fontSize: 18, breakLine: true } }, { text: detail, options: { fontSize: 16, color: "404040" } }],
      { x: lx, y: ly - 0.35, w: lw, h: 0.7, fontFace: "Georgia", align: side === "L" ? "right" : "left", valign: "middle", color: "000000", isTextBox: true, margin: 0 });
    const x1 = side === "L" ? lx + lw + 0.1 : lx - 0.1;
    s.addShape(pres.shapes.LINE, { x: Math.min(x1, px), y: Math.min(ly, py), w: Math.abs(px - x1) || 0.001, h: Math.abs(py - ly) || 0.001,
      flipH: px < x1, flipV: py < ly, line: { color: "595959", width: 1, endArrowType: "oval" }, objectName: "Leader" });
  };
  label("R", 1.0, "Brain", "encephalopathy, cerebral edema", 6.55, 1.0);
  label("L", 3.0, "Lungs", "ARDS", 5.99, 3.14);
  label("R", 2.9, "Heart and vessels", "vasodilatory shock", 6.75, 3.3);
  label("L", 4.1, "Liver", "hypoglycemia, lactate, INR", 6.1, 4.25);
  label("R", 3.85, "Spleen and immune system", "infection", 7.34, 4.17);
  label("R", 4.8, "Adrenals", "relative insufficiency", 7.07, 4.62);
  label("L", 5.05, "Kidneys", "AKI", 6.16, 4.97);
  label("R", 5.75, "Pancreas", "pancreatitis", 6.75, 4.62);
  label("L", 6.2, "Bone marrow", "suppression", 5.83, 6.6);
  s.addText("Figure content after Bernal W, Wendon J.\nN Engl J Med 2013;369:2525-34", { x: 0.45, y: 6.8, w: 4.3, h: 0.5, fontFace: "Georgia",
    fontSize: 10, italic: true, color: GREY, isTextBox: true, margin: 0, valign: "bottom", objectName: "Source" });
  return s;
}
features(1).addNotes("Let them list organs. Most will get brain and kidney. Fewer think of the adrenals, the marrow or the immune system.");
cont(); featuresAnswer().addNotes("This is why these patients are ICU patients. Hypoglycemia, lactic acidosis, vasodilatory shock, relative adrenal insufficiency, AKI, lung injury and a high risk of infection. The liver is one organ on this picture.");
{
  const s = slide(A_TITLE);
  q(s, "What's your next step?", 3.2, { size: 36, h: 1.0 });
  s.addNotes("Wait for answers. Usually people list tests in order. That's the trap.");
}
{
  const s = slide("The first hour");
  table(s, [
    ["Support", "Workup"],
    [
      { t: [{ t: "ICU bed", br: true }, { t: "Glucose every 1 to 2 hours", br: true }, { t: "Volume, perfusion, lactate", br: true }, { t: "Neuro checks" }] },
      { t: [{ t: "Acetaminophen level", br: true }, { t: "Viral, autoimmune, Wilson, toxicology", br: true }, { t: "Doppler ultrasound", br: true }, { t: "Pregnancy test" }] },
    ],
  ], { x: 1.2, y: 1.7, w: W - 2.4, size: 26, valign: "top", noLabel: true });
  q(s, "Send the workup while you resuscitate", 5.6, { size: 24 });
  s.addNotes("The classic mistake is a serial workup: wait for the hepatitis panel, then the autoimmune markers, then act. Support and workup run in parallel. Who else to call, and when, comes later in the talk.");
}
twoStep((step) => {
  const s = slide("Which cause changes treatment right away?");
  table(s, [
    ["If you suspect", "Clues", "Send", "Don't wait to"],
    ["Acetaminophen", "AST/ALT in the thousands, OTC use", "Level, combination products", ans(step, "Start NAC")],
    ["Herpes simplex", "Fever, very high AST/ALT, little jaundice", "HSV PCR (blood)", ans(step, "Start IV acyclovir")],
    ["Hepatitis B", "Endemic area, chemo or immunosuppression", "HBsAg, anti-HBc IgM, DNA", ans(step, "Entecavir or tenofovir")],
    ["Autoimmune hepatitis", "Woman, other autoimmune disease", "ANA, ASMA, IgG", ans(step, "Steroids with hepatology")],
    ["Wilson disease", "Under 40, Coombs-negative hemolysis", "Ceruloplasmin, urine copper", ans(step, "Urgent transplant")],
    ["AFLP, HELLP", "Third trimester, high BP, low platelets", "hCG", ans(step, "Obstetrics: delivery")],
    ["Budd-Chiari", "Pain, ascites, big liver", "Doppler or CT", ans(step, "Anticoagulate; TIPS")],
    ["Ischemic hepatitis", "Shock or arrest, very high LDH", "Echo", ans(step, "Fix the circulation")],
    ["Amanita", "Wild mushrooms, diarrhea 6-24 h later", "Poison control", ans(step, "NAC, silibinin")],
  ], { x: 0.5, y: 1.3, w: W - 1.0, size: 16 });
  src(s, "Update 2022 [PMID: 36001996]; practical update 2024 [PMID: 39170946]; EASL AIH 2025 [PMID: 40348684]");
  s.addNotes("Clues: acetaminophen gives the highest aminotransferases with a low bilirubin early. HSV is often anicteric with fever and leukopenia, and a rash is absent in about half. HBV reactivation follows chemotherapy, rituximab or steroids. Wilson: young, Coombs-negative hemolysis, ALP disproportionately low (ALP to bilirubin ratio under 4), AST to ALT over 2.2. Ischemic hepatitis peaks early with a very high LDH and falls fast once the circulation is fixed. The point of the workup in the ICU is the column on the right. Some of these you start empirically before the test comes back: NAC, acyclovir. Negative autoimmune serologies do not exclude acute AIH. Wilson disease presenting as ALF basically means transplant.");
  return s;
});
function caseA_apap(step) {
  const s = slide(A_TITLE);
  body(s, [
    "Roommate: \"She was taking a lot of the Tylenol with codeine, plus cold medicine, for 3 days\"",
    { runs: ["Acetaminophen level: ", { t: "12 μg/mL", b: true }, ", time of last dose unknown"] },
  ], { x: 0.6, y: 1.4, w: 7.5, h: 1.9, size: 20 });
  pic(s, "cold-flu-meds.jpg", 8.35, 1.35, 4.6, 5.4, "Watercolor of a cold and flu medicine box and pill bottles");
  q(s, "Can you use the nomogram?", 3.4, { x: 0.6, w: 7.5 });
  if (step === 2) {
    body(s, [
      { runs: [{ t: "No.", b: true }, " Rumack-Matthew is for a single acute ingestion with a known time"] },
      "Repeated supratherapeutic use and late presentation: the level can be low or undetectable",
      { runs: [{ t: "Start NAC now", hl: true, b: true }] },
    ], { x: 0.6, y: 4.05, w: 7.5, h: 2.8, size: 20 });
  }
  return s;
}
caseA_apap(1).addNotes("Combination products are where the hidden acetaminophen is. Ask about every over-the-counter product by name.");
cont(); caseA_apap(2).addNotes("An undetectable or low level late in the course does not exclude acetaminophen toxicity [PMID: 36001996]. NAC is safe enough that the threshold to start it is low. Dosing per your pharmacy protocol.");
if (!SHORT) {
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
  if (step === 1) {
    const s = pres.addSlide({ masterName: "BLANK", sectionTitle: section });
    s.addImage({ path: path.join(IMG, "brain-background.jpg"), x: -0.05, y: 0, w: 13.43, h: 7.5,
      altText: "Watercolor of a normal human brain, side view, on ivory paper" });
    s.addText("Ammonia: ALF vs cirrhosis", { x: 6.2, y: 0.45, w: 6.9, h: 0.8, fontFace: "Georgia", fontSize: 30,
      align: "center", valign: "middle", color: "000000", isTextBox: true, margin: 0 });
    s.addText("Why do patients with cirrhosis rarely get cerebral edema, even with a high ammonia?", { x: 6.6, y: 2.6, w: 6.1, h: 2.0,
      fontFace: "Georgia", fontSize: 28, bold: true, align: "center", valign: "middle", color: "000000", isTextBox: true, margin: 0, objectName: "Question" });
    return s;
  }
  const s = slide("Ammonia: ALF vs cirrhosis");
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
    ["Study (arterial, μmol/L)", "Patients", "What they found", "The catch"],
    ["Clemmesen 1999", "44 ALF", { t: "Herniated: mean 230 vs 118; all above 146", b: true }, "Small, one center"],
    ["Bhatia 2006", "80 ALF", "≥ 124 on admission predicted death", "Endpoint was death, not ICH"],
    ["Bernal 2007", "165, HE III-IV", { t: [{ t: "> 100: severe HE. " }, { t: "> 200: ICH in 55%", b: true }] }, "200 missed most ICH"],
    ["Kumar 2012", "295 ALF", { t: "≥ 122 for 3 days: survival 23% vs 72%", b: true }, "Trend beat a single value"],
  ], { x: 0.6, y: 1.35, w: W - 1.2, size: 18 });
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
  if (step === 1) {
    q(s, "Yes or no?", 1.95, { size: 34 });
    qPic(s, "lactulose.jpg", 2.75, 4.2, "Watercolor of a cup and a bottle of lactulose syrup");
    return s;
  }
  table(s, [
    ["Why people give it", "Why not"],
    ["Ammonia drives brain swelling", { t: "No proven benefit in ALF (ALFSG)", b: true }],
    ["It's what we do in cirrhosis", "Distended bowel gets in the way at transplant"],
    ["Cheap; AASLD 2011 allowed it early", "Diarrhea: free water loss, sodium swings"],
    ["", "Liquid by mouth or tube: aspiration risk"],
  ], { x: 0.8, y: 2.0, w: W - 1.6, size: 20, noLabel: true });
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
    ], { y: 1.8, h: 2.0, size: 22, x: 0.7, w: 6.3 });
    pic(s, "nasal-cannula.jpg", 7.25, 1.3, 5.7, 5.6, "Watercolor of a nasal cannula on a wall oxygen flowmeter and a suction tip");
    q(s, "Intubate now, or wait until she can't protect her airway?", 4.3, { x: 0.7, w: 6.3, h: 1.2 });
    return s;
  }
  q(s, "Grade III-IV encephalopathy in ALF: intubate", 1.4, { hl: true, size: 24 });
  table(s, [
    ["Before", "During", "After"],
    [
      { t: [{ t: "Preoxygenate", br: true }, { t: "Norepinephrine ready", br: true }, { t: "Check glucose", br: true }, { t: "Head of bed 30°, neck neutral" }] },
      { t: [{ t: "Avoid hypotension (CPP)", br: true }, { t: "No coughing or bucking (ICP)", br: true }, { t: "Most experienced operator" }] },
      { t: [{ t: "Propofol: short-acting, may lower ICP", br: true }, { t: "Avoid long-acting benzodiazepines", br: true }, { t: "Check pupils: sedation hides the exam" }] },
    ],
  ], { x: 0.8, y: 2.3, w: W - 1.6, size: 19, valign: "top", noLabel: true });
  src(s, "Practical update 2024 [PMID: 39170946]; ACG ALF 2023 [PMID: 37377263]; SCCM 2020 [PMID: 32058387]");
  return s;
}
intubate(1).addNotes("I'd intubate her now. Most fellows want to wait. In ALF the progression from grade II to grade IV can be fast, and an emergency intubation in a coagulopathic, hypotensive patient with a swollen brain is the worst version of this procedure.");
cont(); intubate(2).addNotes("The goals are airway protection, controlled ventilation, and no swings in blood pressure or CO2. Peri-intubation hypotension drops cerebral perfusion pressure; coughing raises ICP. Plan it like a neuro intubation.");
function hypercap(step) {
  const s = slide("Can we use permissive hypercapnia?");
  body(s, [{ t: "After intubation: bilateral infiltrates, P/F 150 on PEEP 10", nb: true, align: "center", i: true }], { y: 1.3, h: 0.5, size: 20 });
  if (step === 1) {
    q(s, "Lung protection or brain protection?", 1.95, { size: 28 });
    qPic(s, "ventilator.jpg", 2.75, 4.2, "Watercolor of an ICU ventilator");
    return s;
  }
  table(s, [
    ["", "For the lungs (ARDS)", "For the brain (ICP)", "What we do"],
    [{ t: "Tidal volume", b: true }, "6 mL/kg PBW", "Watch the CO2", "6 mL/kg, raise the rate"],
    [{ t: "CO2", b: true }, "Tolerate a high CO2", "High CO2 raises ICP", { t: "Keep the CO2 normal", b: true }],
    [{ t: "Hyperventilation", b: true }, "No", "Lowers ICP briefly", "Short rescue for herniation only"],
    [{ t: "PEEP", b: true }, "Recruit", "High PEEP: less venous return", "Set for O2 and BP; PEEP is fine"],
  ], { x: 0.7, y: 2.0, w: W - 1.4, size: 19 });
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
  ], { size: 20, gap: 12, x: 0.5, w: 7.3 });
  pic(s, "head-of-bed-30.jpg", 7.95, 1.4, 5.05, 5.3, "Watercolor of an empty ICU bed with the head raised about 30 degrees");
  src(s, "SCCM 2023 [PMID: 37052436]; update 2022 [PMID: 36001996]; Bernal W et al. J Hepatol 2016;65:273-9");
  s.addNotes("Sodium targets differ between sources: the 2022 update uses 145 to 155 for prevention, the 2024 practical review a lower range. Agree on one with transplant hepatology and write it in the orders. Hypertonic saline is a conditional SCCM recommendation for patients at risk of intracranial hypertension. The cooling trial randomized intubated high-risk ALF patients to 34 vs 36 °C for 72 hours; no difference in intracranial hypertension or survival. Avoid fever, don't induce hypothermia.");
}
{
  const s = slide("Rising ICP: hypertension, bradycardia, a new pupil");
  body(s, [
    "Hyperosmolar bolus (hypertonic saline or mannitol)",
    "Brief hyperventilation as a bridge",
    "Call the transplant team now",
    { t: "Things to know", b: true, nb: true, gap: 18 },
    "Hypertension and bradycardia come late. Don't wait for them",
    "A normal head CT does not exclude raised ICP",
    "ICP monitors are not routine; SCCM suggests against (very low certainty)",
  ], { x: 0.7, y: 1.4, w: 7.0, h: 5.4, size: 19, gap: 10 });
  pic(s, "ct-edema.png", 7.6, 1.4, 5.4, 5.3, "Head CT: normal and with effaced sulci");
  src(s, "SCCM 2023 [PMID: 37052436]; practical update 2024 [PMID: 39170946]");
  s.addNotes("A new pupil asymmetry or a sudden change in the exam is enough to act. Treat first, then image if a bleed or another structural lesion is possible.");
}
function crrt(step) {
  const s = slide("The creatinine is only 1.3");
  body(s, [{ t: "Ammonia 182 → 214 μmol/L, grade III, urine output 15 mL/h", nb: true, align: "center", i: true }], { y: 1.3, h: 0.5, size: 20 });
  if (step === 1) {
    q(s, "Do you wait for a conventional dialysis indication?", 1.95, { size: 28 });
    qPic(s, "urine-bag.jpg", 2.75, 4.2, "Watercolor of a urine drainage bag with a little dark urine");
    return s;
  }
  q(s, "No. In ALF, start CRRT for the ammonia", 2.0, { hl: true, size: 24 });
  body(s, [
    "ACG 2023: suggests early CRRT for hyperammonemia with grade II or higher encephalopathy, even without a renal indication (conditional, very low certainty)",
    "Continuous, not intermittent: fewer swings in blood pressure and brain water",
    "Call nephrology now",
  ], { y: 2.8, h: 4.0, size: 20, w: 8.6 });
  pic(s, "crrt-machine.jpg", 9.6, 2.6, 3.3, 4.3, "Watercolor of a CRRT machine with filter and circuit");
  src(s, "ACG ALF guideline 2023 [PMID: 37377263]; update 2022 [PMID: 36001996]");
  return s;
}
crrt(1).addNotes("Ask them. Nephrology will often say the creatinine doesn't meet criteria. That's the wrong frame for ALF.");
cont(); crrt(2).addNotes("Ammonia around 150 to 200 is a high-risk context in the literature, not a universal threshold. Look at the trajectory and the neuro exam. Coordinate the CRRT fluid with the sodium plan or the dialysis will pull her sodium back down.");
inr(1).addNotes("Hour 12, CRRT is starting. Very common request from the procedure side.");
cont(); inr(2).addNotes("The INR is a great marker of liver function and a poor marker of bleeding risk in ALF. Spontaneous bleeding is uncommon. Ask transplant hepatology before giving plasma: they need the native INR.");
// Stravitz 2012: what the TEG shows when the INR is high in ALF
twoStep((step) => {
  // Mohammad's Gemini TEG tracing as the background, text on the right, question below
  const s = pres.addSlide({ masterName: "BLANK", sectionTitle: section });
  s.addImage({ path: path.join(IMG, "teg-background.jpg"), x: -0.05, y: 0, w: 13.43, h: 7.5,
    altText: "Watercolor of a normal TEG tracing with R, K, alpha angle, MA and Ly30 marked" });
  s.addText("Is her blood thin?", { x: 0.5, y: 0.3, w: W - 1, h: 0.85, fontFace: "Georgia", fontSize: 34,
    align: "center", valign: "middle", color: "000000", isTextBox: true, margin: 0 });
  if (step === 1) {
    body(s, [
      { t: "What a TEG measures in whole blood", b: true, nb: true },
      { runs: [{ t: "R: ", b: true }, "time until the clot starts (clotting factors)"] },
      { runs: [{ t: "K and α-angle: ", b: true }, "how fast the clot builds (fibrinogen)"] },
      { runs: [{ t: "MA: ", b: true }, "how strong the clot gets (platelets, fibrinogen)"] },
      { runs: [{ t: "Ly30: ", b: true }, "how much of the clot breaks down in 30 minutes"] },
    ], { x: 8.4, y: 1.5, w: 4.6, h: 4.4, size: 19, gap: 10 });
    q(s, "Her INR is 4.1. What will her TEG show?", 6.35, { size: 26 });
    return s;
  }
  bars(s, [{ name: "Patients", labels: ["All 5 normal", "1-2 low", "3-4 low", "Hypercoagulable"], values: [63, 25, 12, 8] }],
    { x: 8.3, y: 1.3, w: 4.75, h: 2.9, max: 75, colors: ["000000"], gap: 60, title: "51 patients, mean INR 3.4", catSize: 12 });
  body(s, [
    "Most had a completely normal TEG, even with INRs up to 9.6",
    "A weak clot (low MA) only when platelets were below about 126,000",
    "Encephalopathy: stronger clots, not weaker",
  ], { x: 8.4, y: 4.25, w: 4.6, h: 1.85, size: 16, gap: 6 });
  q(s, "A high INR doesn't mean she will bleed", 6.35, { hl: true, size: 26 });
  src(s, "Stravitz RT et al. J Hepatol 2012;56:129-36 [PMID: 21703173]");
  return s;
}).addNotes("Answer to the question: in most patients, normal. 51 patients with acute liver injury (INR at least 1.5) or ALF (the same plus encephalopathy), mean INR 3.4, range 1.5 to 9.6. 32 of 51 (63%) had all five TEG parameters normal; 8 had one abnormal in the hypocoagulable direction, 5 had two, 4 had three, 2 had four. 4 patients (8%) had parameters in the hypercoagulable range. Lysis at 30 minutes was normal in all 51. Factors V and VII were low, but protein C, protein S and antithrombin fell too, and factor VIII was about 4 times normal. The INR measures only the procoagulant factors the liver makes; the liver also makes the anticoagulants, which fall just as far, and the endothelium pours out factor VIII and von Willebrand factor. The TEG sees the whole balance. That's why spontaneous bleeding is uncommon and why plasma before a line is not needed. Caveat: TEG is not validated to predict procedural bleeding, and a low platelet count or low fibrinogen still matters.");
{
  // Mohammad's Gemini figure carries all the slide text; only the source is added here
  const s = pres.addSlide({ masterName: "BLANK", sectionTitle: section });
  s.addImage({ path: path.join(IMG, "rebalanced-hemostasis.jpg"), x: -0.05, y: 0, w: 13.43, h: 7.5,
    altText: "Balance scale: low factors II, V, VII, IX, X, low fibrinogen and low platelets favor bleeding; low protein C, S and antithrombin and high factor VIII and von Willebrand factor favor clotting" });
  s.addText("Concept from Lisman T, Porte RJ. Blood 2010", { x: 0.4, y: 7.12, w: 4.0, h: 0.28, fontFace: "Georgia",
    fontSize: 10, italic: true, color: GREY, isTextBox: true, margin: 0, valign: "bottom", objectName: "Source" });
  s.addNotes("Both sides go down together. The INR only tests the left pan, so it makes the patient look much more anticoagulated than she is. Viscoelastic tests look at clot formation in whole blood and in ALF are often close to normal despite a high INR, though they miss the endothelium and the protein C system too. The balance is fragile: infection, kidney failure and procedures tip it, and thrombosis, including line-related clots, is real.");
}
twoStep((step) => {
  const s = slide("Calling nephrology");
  if (step === 1) { q(s, "What do you ask them for?", 3.2, { size: 32 }); return s; }
  body(s, [
    "Indication: ammonia 214 and grade III encephalopathy. The creatinine doesn't matter here",
    "Start now and keep it running. A clotted filter means the ammonia climbs back",
    "One sodium plan: the CRRT fluid and the hypertonic saline together",
    "Watch phosphate and potassium, and calcium if they use citrate",
  ], { x: 0.7, y: 1.6, w: 8.4, h: 4.8, size: 22, gap: 16 });
  pic(s, "crrt-machine.jpg", 9.3, 1.3, 3.6, 5.5, "Watercolor of a CRRT machine with filter and circuit");
  src(s, "ACG ALF 2023 [PMID: 37377263]; update 2022 [PMID: 36001996]");
  return s;
}).addNotes("No universal dose or ammonia target to stop at; use your center's protocol. Where it usually goes wrong is the circuit: it keeps clotting, so the delivered clearance is a fraction of what was ordered. The other problem is a sodium plan that nobody owns. Citrate can build up in liver failure, so follow the total to ionized calcium ratio.");
{
  const s = slide(null, { master: "BLANK" });
  s.addText("I know what you're thinking...", { x: 0.8, y: 2.6, w: W - 1.6, h: 1.4, fontFace: "Georgia", fontSize: 44, italic: true,
    align: "center", valign: "middle", color: "000000", isTextBox: true, margin: 0 });
  s.addNotes("Pause. Someone in the room has heard it from nephrology.");
}
function cvvh(step) {
  const s = slide("\"CVVH doesn't clear ammonia\"");
  if (step === 1) { q(s, "True or false?", 3.2, { size: 32 }); return s; }
  body(s, [
    "Ammonia is tiny (17 Da), water soluble and not protein bound",
    "It crosses the filter with the water (convection, CVVH) or down its gradient (diffusion, CVVHD)",
    "What matters is the effluent dose and hours on a working circuit, more than the mode",
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
}
cvvh(1);
// Mohammad's Dwight Schrute "False." meme between the question and the answer
cont();
{
  const s = slide(null, { master: "BLANK" });
  const meme = path.join(IMG, "dwight-false.png");
  if (fs.existsSync(meme)) {
    const [mw, mh] = pngSize(meme); const w = Math.min(W - 1, (6.6 * mw) / mh);
    s.addImage({ path: meme, x: (W - w) / 2, y: (7.5 - (w * mh) / mw) / 2, w, h: (w * mh) / mw, altText: "Dwight Schrute: False." });
  } else {
    s.addText("False.", { x: 0.8, y: 2.6, w: W - 1.6, h: 1.8, fontFace: "Georgia", fontSize: 96, bold: true,
      align: "center", valign: "middle", color: "000000", isTextBox: true, margin: 0 });
  }
  s.addNotes("Let the room enjoy it, then the details.");
}
cont();
cvvh(2);
twoStep((step) => {
  const s = slide("Does early CRRT actually help?");
  table(s, [
    ["", "US ALF Study Group (2018)", "Pilot RCT (2026)"],
    ["Design", "Registry, observational", "Open label, ALF with cerebral edema"],
    ["Comparison", "CRRT vs no CRRT", "CRRT within 12 h vs delayed"],
    ["Finding", ans(step, "Lower ammonia, better survival"), ans(step, "Same 28-day survival; fewer deaths by day 7")],
    ["Catch", { t: ans(step, "Association; selection bias"), b: true }, { t: ans(step, "Small, one center, protocol violations"), b: true }],
  ], { x: 0.7, y: 1.5, w: W - 1.4, size: 21 });
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
  if (step === 1) {
    q(s, "2 units of FFP first?", 1.95, { size: 30 });
    qPic(s, "ffp-bag.jpg", 2.75, 4.2, "Watercolor of a unit of fresh frozen plasma");
    return s;
  }
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
    q(s, "When she meets King's College criteria?", 1.55, { size: 28 });
    q(s, "When MELD is high enough?", 2.25, { size: 28 });
    qPic(s, "phone.jpg", 3.05, 3.85, "Watercolor of a desk phone with the handset off the hook");
    return s;
  }
  q(s, "You should have called on admission, when you first suspected ALF", 1.6, { hl: true, size: 24 });
  body(s, [
    "King's College criteria predict death without transplant. They are specific, not sensitive",
    "They are not a referral threshold. If you wait for them, the evaluation starts too late",
    { runs: ["Patient A: arterial pH ", { t: "7.26", b: true, red: true }, " on day 2 after fluids. She now meets the acetaminophen criteria"] },
  ], { y: 2.6, h: 3.4, size: 20, gap: 14, w: 7.8 });
  pic(s, "phone.jpg", 8.6, 2.5, 4.4, 4.3, "Watercolor of a desk phone with the handset off the hook");
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
        { t: "Age < 10 or > 40", br: true }, { t: "Drug reaction or unknown cause", br: true },
        { t: "Jaundice to encephalopathy > 7 days", br: true }, { t: "INR > 3.5", br: true }, { t: "Bilirubin > 17.5 mg/dL" },
      ] },
    ],
  ], { x: 1.2, y: 1.5, w: W - 2.4, size: 18, valign: "top", noLabel: true });
  body(s, [{ t: "Original O'Grady criteria; the lactate line is the later modification", nb: true, i: true, align: "center" }],
    { y: 4.75, h: 0.6, size: 17 });
  src(s, "O'Grady 1989 criteria, as summarized in EASL 2017 [PMID: 28417882] and update 2022 [PMID: 36001996]");
  s.addNotes("Specific but not sensitive. Use them to understand prognosis, not to decide when to call.");
}
kcc(1).addNotes("Let them vote.");
cont(); kcc(2).addNotes("King's College criteria are specific but not very sensitive. If you wait for them, the evaluation starts too late. Patient A now meets acetaminophen criteria by pH, but the call happened on admission. Transplant referral, listing and allocation are separate decisions; the transplant team handles the last two.");
// plasma exchange: paper then table reveal in the long version, the answered table alone in the short one
function plex(step) {
  const s = slide("Does plasma exchange help in ALF?");
  table(s, [
    ["", "Larsen 2016", "Burke 2025"],
    [{ t: "Design", b: true }, "RCT, 182 ALF", "UK, 7 centers, 378 ALF"],
    [{ t: "Plasma exchange", b: true }, "High volume × 3 days", "120 patients, matched"],
    [{ t: "Survival", b: true }, ans(step, "58.7% vs 47.8% (HR 0.56)"), ans(step, "51.4% vs 62.6% (p = 0.12)")],
    [{ t: "Catch", b: true }, { t: ans(step, "Not blinded; no ACLF"), b: true }, { t: ans(step, "Retrospective; sicker patients got it"), b: true }],
  ], { x: 0.4, y: 1.5, w: 8.7, size: 18, minRowH: 0.7 });
  if (step === 2) q(s, "Better blood pressure, no proven survival benefit", 5.6, { hl: true, size: 22, x: 0.4, w: 8.7 });
  pic(s, "plasma-exchange.jpg", 9.3, 1.25, 3.75, 5.6, "Watercolor of an apheresis machine for plasma exchange");
  src(s, "Larsen FS et al. J Hepatol 2016 [PMID: 26325537]; Burke L et al. J Hepatol 2025;82:615-21 [PMID: 39362282]");
  s.addNotes("Larsen: high-volume plasma exchange removes cytokines and DAMPs and replaces coagulation factors; hospital survival was better in the trial. Burke: all seven UK transplant centers, 2013 to 2021, propensity matched. Noradrenaline fell from 0.35 to 0.16 mcg/kg/min after plasma exchange, but overall survival (51.4% vs 62.6%) and transplant-free survival (42.6% vs 53.1%) were not better. Observational: plasma exchange went to older, sicker patients (acetaminophen, meeting King's College criteria, higher noradrenaline), and practice varied between centers. If you use it, use it early and as a bridge, and don't delay listing for it. The INR after plasma exchange is no longer the patient's INR, so tell transplant hepatology before the first session.");
  return s;
}
if (!SHORT) {
  paper("Does plasma exchange help in ALF?", "larsen-title.png", "larsen-fig1.png",
    "Larsen FS et al. J Hepatol 2016;64:69-78 [PMID: 26325537]", "Larsen 2016 plasma exchange trial", 2.4)
    .addNotes("Their Figure 1: hospital survival, high-volume plasma exchange (HPV) vs standard medical treatment (SMT), log-rank p = 0.0058.");
  twoStep(plex);
} else plex(2);

{
  const s = slide("Bed 4 on day 3");
  table(s, [
    ["Problem", "What she's on", "What we watch"],
    ["Acetaminophen ALF, pH 7.26", "NAC; listed 1A on day 2", "Time to an offer"],
    ["HE III-IV, ammonia 182", "Intubated, CO2 normal, Na 145-155, CRRT", "Pupils, ammonia, Na"],
    ["Lactate 5.8 and rising", "Volume, MAP, look for infection", "Lactate, MAP, pressors"],
    ["INR 5.6, not bleeding", { t: "No plasma", b: true }, "Bleeding, INR trend"],
    ["Infection risk", "Surveillance cultures", "Low bar for antimicrobials"],
  ], { x: 0.7, y: 1.4, w: W - 1.4, size: 20, minRowH: 0.6 });
  src(s, "Made-up numbers for teaching");
  s.addNotes("This is where she is while she waits. What would take her off the list: fixed dilated pupils, uncontrolled sepsis, rising support despite everything. If she becomes hypotensive: norepinephrine first, vasopressin next, hydrocortisone if refractory, and keep the MAP high enough for cerebral perfusion. Status 1A is the OPTN category for ALF in the ICU; check current policy before quoting details.");
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
if (!SHORT) {
  const s = slide("Back to day 1: bed 7");
  table(s, [
    [{ t: "Bed 4", grey: true }, { t: "Bed 7", hl: true }],
    [{ t: "28-year-old woman", grey: true }, "56-year-old man"],
    [{ t: "Acetaminophen ALF", grey: true }, "Alcohol-related cirrhosis with ascites"],
    [{ t: "Intubated, on CRRT", grey: true }, "Fever, confusion, low blood pressure"],
  ], { x: 2.2, y: 2.0, w: 8.9, size: 20, noLabel: true });
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
  if (step === 1) {
    q(s, "INR 2.1, platelets 62,000. Do you tap him?", 1.55, { size: 30 });
    qPic(s, "ascites-bed.jpg", 2.35, 4.6, "Watercolor of a thin man in a hospital bed with a tense, distended abdomen");
    return s;
  }
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
  ], { y: 1.45, h: 5.4, size: 20, w: 8.0 });
  pic(s, "paracentesis.jpg", 8.6, 1.5, 4.4, 5.2, "Watercolor of a paracentesis set with tubes of ascitic fluid and a culture bottle");
  src(s, "EASL ACLF 2023 [PMID: 37364789]; SCCM 2023 [PMID: 37052436]");
  return s;
}
tap(1).addNotes("Ask what tipped him over before showing the answer. Then the procedural question: people hesitate to tap a coagulopathic patient.");
cont(); tap(2).addNotes("Diagnostic paracentesis is low risk and should not wait for correction of the INR or platelets. Infection is the most common precipitant of ACLF in Western cohorts.");
// Mohammad's Gemini figure: empty outline on the question step, causes labeled on the answer step
function hypotension(step) {
  const s = pres.addSlide({ masterName: "BLANK", sectionTitle: section });
  s.addImage({ path: path.join(IMG, step === 1 ? "organs-alf-empty.jpg" : "hypotension-cirrhosis.jpg"), x: -0.05, y: 0, w: 13.43, h: 7.5,
    altText: step === 1 ? "Watercolor outline of a human figure with no organs drawn in"
      : "Watercolor figure of a man with cirrhosis showing the heart, IVC, nodular liver, varices, adrenals, ascites and dilated mesenteric vessels" });
  s.addText("Why is he hypotensive?", { x: 0.45, y: 0.35, w: 5.6, h: 1.2, fontFace: "Georgia", fontSize: 30,
    valign: "top", color: "000000", isTextBox: true, margin: 0 });
  if (step === 1) return s;
  const label = (side, ly, name, detail, px, py) => {
    const lx = side === "L" ? 0.3 : 8.5, lw = side === "L" ? 4.8 : 4.65;
    s.addText([{ text: name, options: { bold: true, fontSize: 18, breakLine: true } }, { text: detail, options: { fontSize: 14, color: "404040" } }],
      { x: lx, y: ly - 0.45, w: lw, h: 0.9, fontFace: "Georgia", align: side === "L" ? "right" : "left", valign: "middle", color: "000000", isTextBox: true, margin: 0 });
    const x1 = side === "L" ? lx + lw + 0.1 : lx - 0.1;
    s.addShape(pres.shapes.LINE, { x: Math.min(x1, px), y: Math.min(ly, py), w: Math.abs(px - x1) || 0.001, h: Math.abs(py - ly) || 0.001,
      flipH: px < x1, flipV: py < ly, line: { color: "595959", width: 1, endArrowType: "oval" }, objectName: "Leader" });
  };
  label("L", 2.75, "Too little volume, or too much", "Ultrasound and dynamic measures", 6.55, 3.6);
  label("L", 5.5, "Sepsis (SBP)", "Cultures, antibiotics within 1 h, source control", 5.95, 6.25);
  label("R", 2.4, "Cirrhotic cardiomyopathy", "Echo", 7.2, 3.2);
  label("R", 3.6, "Hidden bleeding", "Hemoglobin, rectal exam, think varices", 6.95, 3.98);
  label("R", 4.75, "Relative adrenal insufficiency", "Hydrocortisone if shock is refractory", 7.05, 4.43);
  label("R", 5.9, "Splanchnic vasodilation", "Norepinephrine, MAP 65, adjust to perfusion", 6.85, 5.5);
  s.addText("Usually more than one of these", { x: 0.45, y: 6.55, w: 5.4, h: 0.45, fontFace: "Georgia", fontSize: 20, bold: true,
    highlight: HL, align: "left", valign: "middle", color: "000000", isTextBox: true, margin: 0 });
  return s;
}
hypotension(1).addNotes("Let them list causes before you show the figure. Most will say sepsis and volume.");
cont(); hypotension(2).addNotes("For SBP, cover for prior antibiotic exposure and local resistance. Albumin is a reasonable resuscitation fluid in cirrhosis, but every bag goes somewhere. Keep that in mind for the next few slides. Sources: Surviving Sepsis 2026 [PMID: 41869847]; SCCM 2020 [PMID: 32058387]; EASL ACLF 2023 [PMID: 37364789].");
if (!SHORT) twoStep((step) => {
  const s = slide("Too little volume, or too much?");
  pic(s, step === 1 ? "ivc-q.png" : "ivc.png", 0.8, 1.4, W - 1.6, 4.3, "IVC on ultrasound, two patients");
  if (step === 1) { q(s, "Which one would you give more fluid?", 6.0, { size: 24 }); return s; }
  body(s, [{ t: "Left: a full, plethoric IVC. Right: an IVC that collapses", nb: true, i: true, align: "center" }], { y: 5.85, h: 0.45, size: 18 });
  q(s, "Check the IVC, lungs and heart before more fluid", 6.3, { size: 22 });
  s.addNotes("Ascites and a tense belly change IVC size and collapse, so use it with the lungs, the heart and the trend, not alone. Edema in a cirrhotic doesn't mean the vessels are full.");
  return s;
});
twoStep((step) => {
  const s = slide("ALF, decompensation or ACLF?");
  table(s, [
    ["", "Acute liver failure", "Acute decompensation", "ACLF"],
    [{ t: "Liver before", b: true }, ans(step, "No cirrhosis"), ans(step, "Cirrhosis"), ans(step, "Cirrhosis or chronic liver disease")],
    [{ t: "Defined by", b: true }, ans(step, "INR ≥ 1.5 + HE"), ans(step, "Ascites, bleeding, HE, jaundice"), ans(step, "Decompensation + organ failure")],
    [{ t: "Usually kills", b: true }, ans(step, "Brain, sepsis"), ans(step, "Bleeding, infection"), ans(step, "Infection, shock, organ failure")],
    [{ t: "ICU focus", b: true }, ans(step, "Brain, ammonia, early CRRT"), ans(step, "Treat the trigger"), ans(step, "Source, shock, kidney vs lung")],
    [{ t: "Transplant", b: true }, ans(step, "Urgent listing"), ans(step, "Refer by MELD or complication"), ans(step, "Narrow window; reassess daily")],
  ], { x: 0.6, y: 1.4, w: W - 1.2, size: 17, minRowH: 0.6 });
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
  ["Lungs", "P/F ≤ 200, S/F ≤ 214, or ventilated (not for HE)", "P/F 211: no"],
];
function organs(step) {
  const s = slide("Count the failing organs");
  // Same three columns on both steps; the patient column is measured but left empty until the answer
  const rows = [OF_HEAD].concat(OF_ROWS.map((r) => [r[0], r[1], ans(step, r[2])]));
  table(s, rows, { x: 0.7, y: 1.4, w: W - 1.4, size: 19, minRowH: 0.6 });
  if (step === 2) q(s, "Two organ failures: ACLF grade 2", 6.0, { hl: true, size: 26 });
  src(s, "CLIF-C organ failure score, EASL ACLF 2023 [PMID: 37364789]; CANONIC [PMID: 23474284]");
  return s;
}
organs(1).addNotes("Have the room count with you. Liver failure here means a bilirubin of 12, which surprises people.");
cont(); organs(2).addNotes("Kidney and circulation. Respiratory is borderline: PaO2 74 on a Venturi mask at 0.35 is a P/F of 211. That's why he's on a Venturi mask here: nasal cannula doesn't give you a reliable FiO2, so if the grade depends on the lungs, get a gas on a known FiO2. Watch that row.");
if (!SHORT) {
  const s = slide("ACLF grades");
  table(s, [
    ["Grade", "What it takes"],
    ["No ACLF", { t: [
      { t: "No organ failure", br: true },
      { t: "or one liver, clotting, circulation or lung failure, creatinine < 1.5, no HE", br: true },
      { t: "or brain failure alone, creatinine < 1.5" } ] }],
    ["ACLF 1", { t: [
      { t: "Kidney failure alone", br: true },
      { t: "or one liver, clotting, circulation or lung failure + creatinine 1.5-1.9 or HE I-II", br: true },
      { t: "or brain failure alone + creatinine 1.5-1.9" } ] }],
    ["ACLF 2", { t: "Two organ failures", b: true }],
    ["ACLF 3", { t: "Three or more", b: true }],
  ], { x: 0.9, y: 1.45, w: W - 1.8, size: 18 });
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
function apxWhichAclf() {
  const s = slide("Appendix: which ACLF?");
  table(s, [
    ["", "EASL-CLIF", "NACSELD", "APASL"],
    [{ t: "Who", b: true }, "Decompensated cirrhosis", "Cirrhosis, inpatient", "CLD ± cirrhosis"],
    [{ t: "Defined by", b: true }, "Organ failures (CLIF-C)", "≥ 2 extrahepatic failures", "Liver insult: jaundice + INR ≥ 1.5"],
    [{ t: "Picks up", b: true }, "Broader, earlier", "Sicker patients", "A primary liver insult"],
  ], { x: 0.6, y: 1.5, w: W - 1.2, size: 20, minRowH: 0.65 });
  q(s, "They find different patients. Say which one you're using", 5.6, { size: 22 });
  src(s, "Kyoto consensus 2025 [PMID: 39961976]; ACG ACLF 2022 [PMID: 35006099]; AASLD 2024 [PMID: 37939273]");
  s.addNotes("Not worth memorizing all three. Worth knowing that a paper's 'ACLF' may not be your patient's ACLF. The talk uses EASL-CLIF.");
}
function hrs(step) {
  const s = slide("Does he have HRS?");
  body(s, [{ t: "12 hours later: creatinine 3.0, urine 10 mL/h, still on norepinephrine", nb: true, align: "center", i: true }], { y: 1.3, h: 0.5, size: 19 });
  if (step === 1) {
    q(s, "HRS? Start terlipressin?", 1.95, { size: 30 });
    qPic(s, "terlipressin-vial.jpg", 2.75, 4.2, "Watercolor of a vial of powder and a syringe");
    return s;
  }
  const a = (v) => (step === 2 ? { hidden: v } : v);
  table(s, [
    ["HRS-AKI (ADQI-ICA 2024)", "Bed 7, day 1", ""],
    ["Cirrhosis with ascites", a("Yes"), { t: a("✅"), align: "center" }],
    ["AKI by creatinine or urine output", a("Cr 0.9 → 3.0, urine 10 mL/h"), { t: a("✅"), align: "center" }],
    ["No response to 24 h of volume, if needed", a("2 L on arrival; too early"), { t: a("❌"), align: "center" }],
    ["No other main cause (shock, toxins, structural)", { t: a("Septic shock on norepinephrine"), b: true, red: true }, { t: a("❌"), align: "center" }],
  ], { x: 0.7, y: 1.95, w: W - 1.4, size: 19, minRowH: 0.55 });
  if (step === 2) q(s, "Go down the list for him. Which boxes does he tick?", 5.6, { size: 24 });
  else q(s, "Not HRS yet. Treat the shock first", 5.6, { hl: true, size: 24 });
  src(s, "ADQI-ICA consensus, J Hepatol 2024 [PMID: 38527522]");
  return s;
}
hrs(1).addNotes("The reflex in many units: oliguric cirrhotic, give albumin for 48 hours, then terlipressin.");
cont(); hrs(2).addNotes("Let the room fill it in.");
cont(); hrs(3).addNotes("AKI here means creatinine up 0.3 mg/dL or more within 48 hours, or 50% or more within 7 days, and/or urine output 0.5 mL/kg/h or less for 6 hours or more. The mandatory 48-hour albumin challenge is gone, and a patient who is already wet doesn't need a fluid challenge to satisfy a clock. HRS physiology and tubular injury can coexist. Assessment is faster and individualized. But that cuts both ways: you also need to look for the other causes, and right now sepsis is the obvious one.");
if (!SHORT) {
  const s = slide("Kidney failure in cirrhosis is usually a mixture");
  body(s, [
    { t: "Possible contributors", b: true, nb: true },
    "Low effective volume",
    "Tubular injury: sepsis, contrast, drugs",
    "HRS physiology",
    "Tense ascites (abdominal compartment)",
    "Congestion",
  ], { x: 0.6, y: 1.4, w: 4.4, h: 5.0, size: 19 });
  pic(s, "kidney.jpg", 4.95, 1.4, 3.3, 5.0, "Watercolor of a kidney with its hilar vessels and ureter");
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
function heB(step) {
  const s = slide("Day 1: more confused");
  body(s, [
    "More disoriented, pulling at his lines, asterixis. Awake, follows commands",
    { runs: ["The nurse sent an ammonia: ", { t: "88 μmol/L", b: true }] },
  ], { y: 1.4, h: 1.2, size: 21 });
  if (step === 1) {
    q(s, "More lactulose? Repeat the ammonia in 6 hours?", 2.6, { size: 26 });
    qPic(s, "ammonia-on-ice.jpg", 3.35, 3.6, "Watercolor of a blood tube standing in a cup of ice");
    return s;
  }
  q(s, "Look for a precipitant. The ammonia level won't help", 2.75, { hl: true, size: 22 });
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
if (!SHORT) heB(1).addNotes("The reflex is to give more lactulose and recheck the ammonia. Let them say it.");
if (!SHORT) { cont(); heB(2).addNotes("In cirrhosis, HE is a clinical diagnosis. The ammonia level doesn't grade it, and chasing it doesn't help. Every worsening needs the same search for a precipitant as the admission did. Lactulose is right for overt HE, but too much gives you dehydration, hypernatremia and a worse kidney. Don't make every first episode an automatic two-drug start."); }
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
    q(s, "First, look at his oxygen", 5.2, { size: 24 });
    q(s, "Now on high-flow, FiO2 0.6, SpO2 90%: SpO2/FiO2 150. That's a third organ failure", 5.9, { hl: true, size: 20 });
  }
  return s;
}
day2B(1).addNotes("The kidney is worse, and the reflex is to treat the kidney.");
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
  if (step === 1) {
    q(s, "Terlipressin, more albumin, or dialysis?", 1.55, { size: 28 });
    qPic(s, "kidney-options.jpg", 2.35, 4.6, "Watercolor of a vial, a bottle of albumin and a dialysis catheter on a tray");
    return s;
  }
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
if (!SHORT) paper("Does HRS reversal mean survival?", "confirm-title.png", "confirm-concl.png",
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
if (!SHORT) paper("Should we treat the albumin number?", "attire-title.png", "attire-concl.png",
  "China L et al. N Engl J Med 2021;384:808-17 [PMID: 33657293]", "ATTIRE trial")
  .addNotes("ATTIRE: 777 hospitalized patients with decompensated cirrhosis and albumin under 30 g/L, in 35 UK hospitals.");
{
  const s = slide("Should we treat the albumin number?");
  table(s, [
    [{ t: "Study", b: true }, "777 inpatients: albumin to ≥ 30 g/L vs standard care"],
    [{ t: "Finding", b: true }, "Infection, kidney dysfunction or death: 29.7% vs 30.2%"],
    [{ t: "The catch", b: true }, { t: "More serious adverse events, including pulmonary edema", b: true }],
  ], { x: 0.9, y: 1.4, w: W - 1.8, size: 20, header: false, minRowH: 0.6 });
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
bgDivider("Transplant in ACLF", null, "divider-transplant.jpg", "Watercolor of a donor liver in an organ bag on ice in a transport cooler").addNotes("Back to the question both families will ask.");
twoStep((step) => {
  const s = slide("Is he too sick for a transplant?");
  if (step === 1) {
    q(s, "ACLF 3 on a ventilator. Would you call?", 1.55, { size: 28 });
    qPic(s, "icu-bay.jpg", 2.35, 4.6, "Watercolor of an ICU bed surrounded by a ventilator, infusion pumps and a CRRT machine");
    return s;
  }
  body(s, [
    "A ventilator, pressors or dialysis do not by themselves exclude transplant",
    "Selected patients with ACLF grade 3 do well after transplant, if it happens early",
    { t: "What makes transplant unlikely", b: true, nb: true, gap: 16 },
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
function callingTH(title) {
  const s = slide(title);
  table(s, [
    ["Patient A (ALF)", "Patient B (ACLF)"],
    [
      { t: [
        { t: "Cause, days from jaundice to HE", br: true },
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
  ], { x: 0.9, y: 2.15, w: W - 1.8, size: 20, valign: "top", noLabel: true });
  q(s, "Call first. Gather this while you wait for the call back", 1.45, { hl: true, size: 22 });
  s.addNotes("Nothing on this list should delay the first call. A good call makes the transplant team's decision faster. Trends, not single values. Referral, candidacy, listing and allocation are separate decisions; the first one is ours.");
}
if (!SHORT) callingTH("Calling transplant hepatology");
if (!SHORT) twoStep((step) => {
  const s = slide("ALF and ACLF: what changes at the bedside");
    table(s, [
    ["", "Acute liver failure", "ACLF"],
    [{ t: "Ammonia", b: true }, ans(step, "With HE grade and trend: brain risk, CRRT"), ans(step, "Doesn't diagnose HE; don't trend it")],
    [{ t: "Lactulose", b: true }, ans(step, "No proven benefit; distends the bowel"), ans(step, "Yes for overt HE ± rifaximin")],
    [{ t: "Sodium", b: true }, ans(step, "HE III-IV: often 145-155, match CRRT"), ans(step, "Often low: ≤ 8 mmol/L per 24 h")],
    [{ t: "Antibiotics", b: true }, ans(step, "No routine prophylaxis; low threshold"), ans(step, "Treat fast; prophylaxis with GI bleed")],
    [{ t: "INR", b: true }, ans(step, "Tracks severity, not bleeding"), ans(step, "Same; judge the procedure")],
  ], { x: 0.6, y: 1.7, w: W - 1.2, size: 20, minRowH: 0.65 });
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
  pic(s, "two-beds.jpg", 0.35, 2.25, 4.2, 3.6, "Watercolor of two empty ICU beds side by side");
  body(s, [
    "Who needed transplant hepatology before the labs?",
    "Why did a falling ALT worry us more?",
    "When is CRRT right before the creatinine rises?",
    "Why doesn't cirrhosis lactulose data apply to ALF?",
    "Why not albumin and terlipressin for bed 7?",
    "What would make you change yesterday's plan?",
  ], { size: 21, gap: 22, x: 4.8, w: 8.3, y: 1.9, h: 5.0 });
  s.addNotes("Ask the room. Don't put the answers up.");
}
{
  const s = slide("Summary");
  body(s, [
    "High AST and ALT alone are not liver failure. Get an INR and examine the patient",
    "Stabilize, treat the cause and call transplant hepatology in the same hour",
    { runs: ["ALF: ", { t: "protect the brain", b: true }, ". Intubate at grade III, keep the CO2 normal, follow your center's sodium plan, and start CRRT for rising ammonia"] },
    "ACLF: count the organs, find the trigger",
    "ACLF: check oxygenation and volume status before albumin or terlipressin",
    "Reassess organ failures daily. The trend matters more than the admission score",
  ], { size: 20, gap: 14, x: 0.5, w: 7.7 });
  pic(s, "pocket-notebook.jpg", 8.45, 1.4, 4.55, 5.3, "Watercolor of a pocket notebook, a pen and a penlight");
}
{
  const s = slide(null, { master: "BLANK" });
  s.addImage({ path: path.join(IMG, "closing-liver.jpg"), x: -0.05, y: 0, w: 13.43, h: 7.5, altText: "Watercolor of a healthy liver in warm light on ivory paper" });
  s.addText("Questions?", { x: 7.1, y: 1.3, w: 5.7, h: 1.4, fontFace: "Georgia", fontSize: 54, align: "center",
    valign: "middle", color: "000000", isTextBox: true, margin: 0 });
  // same QR as the cover: the long-version PDF
  s.addImage({ path: path.join(IMG, "qr-slides.png"), x: 7.1 + 5.7 / 2 - 1.25, y: 3.1, w: 2.5, h: 2.5, altText: "QR code linking to the slides PDF" });
  s.addText("Slides (PDF)", { x: 7.1, y: 5.7, w: 5.7, h: 0.4, fontFace: "Georgia", fontSize: 16, align: "center",
    color: "595959", isTextBox: true, margin: 0 });
}
endMain();

// ---------------------------------------------------------------- Appendix
sec("Appendix");
{
  const s = slide("Appendix: West Haven grades");
  table(s, [
    ["Grade", "What you see"],
    ["I", "Short attention, mild confusion, reversed sleep, subtle personality change"],
    ["II", "Lethargy, disorientation to time, obvious personality change, asterixis"],
    ["III", "Somnolent but rousable, grossly disoriented, bizarre behavior"],
    ["IV", "Coma"],
  ], { x: 1.2, y: 1.6, w: W - 2.4, size: 20, minRowH: 0.65 });
  s.addNotes("In ALF, grade III-IV is the intubation and ICP-risk threshold.");
}
apxKcc();
apxAmmonia();
apxWhichAclf();
apxMathurin();
if (SHORT) callingTH("Appendix: calling transplant hepatology");
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
    "Larsen FS et al. High-volume plasma exchange in ALF. J Hepatol 2016 [PMID: 26325537]",
    "Burke L et al. Plasma exchange in a real-world ALF cohort. J Hepatol 2025;82:615-21 [PMID: 39362282]",
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
