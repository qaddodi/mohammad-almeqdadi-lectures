// Builds "Liver Transplantation: When to Refer and What's New" (Maine Medical Center grand rounds, 11/2026)
// in the style of Mohammad Almeqdadi's existing decks.
// Tufts program numbers never go in the repo (MY_STYLE.md). They live in a JSON file in the project folder;
// pass its path as TUFTS_DATA for the talk copy. Without it the build is the public copy for the repo and the QR PDF.
const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");
const { applyTheme } = require(process.env.SKILL + "/scripts/apply_theme.js");

const OUT = process.argv[2];
const COVER_IMG = process.argv[3];
const LOGO_IMG = process.argv[4];
const TUFTS = process.env.TUFTS_DATA ? JSON.parse(fs.readFileSync(process.env.TUFTS_DATA, "utf8")) : null;
const PUBLIC = !TUFTS;
// pictures we can show in the room but shouldn't post (the full NYT page) sit next to the Tufts JSON
const PRIVATE_IMG = TUFTS ? path.dirname(process.env.TUFTS_DATA) : null;

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
pres.title = "Liver Transplantation: When to Refer and What's New";

const W = 13.333;
const RED = "C00000";
const GREY = "595959";
const HL = "FFFF00";
const TBL_FONT = "Calibri";
const NAVY = "1F4E79", SLATE = "9DB4CA", TEAL = "2E7D8C";

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

// Bar chart in the deck's style: navy for the bar that matters, slate for the rest, red only for the harmful value
function bars(s, data, o) {
  s.addChart(pres.charts.BAR, data, {
    x: o.x, y: o.y, w: o.w, h: o.h, barDir: o.dir || "col", barGrouping: o.grouping || "clustered", barOverlapPct: o.grouping === "stacked" ? 100 : undefined, barGapWidthPct: o.gap || 60,
    chartColors: o.colors || [NAVY, SLATE],
    valAxisMinVal: 0, valAxisMaxVal: o.max || 100, valAxisMajorUnit: o.unit || 25,
    valAxisLabelFormatCode: o.valFmt || '0"%"', valAxisHidden: !!o.hideVal,
    valGridLine: { color: "E3E3E3", size: 0.5 }, catGridLine: { style: "none" },
    catAxisLabelFontFace: TBL_FONT, valAxisLabelFontFace: TBL_FONT, catAxisLabelFontSize: o.catSize || 15, valAxisLabelFontSize: 12,
    catAxisLabelColor: "000000", valAxisLabelColor: GREY,
    showValue: !o.noVal, dataLabelPosition: o.grouping === "stacked" ? "ctr" : "outEnd", dataLabelFormatCode: o.fmt || '0"%"', dataLabelFontSize: o.labSize || 16,
    dataLabelFontFace: TBL_FONT, dataLabelColor: o.labColor || "000000", dataLabelFontBold: true,
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

// Paper slide for a specialist room: title block and result on one slide, no "What do you think they found?"
function titleBlock(s, file, y, maxH, alt, maxW = W - 2.8) {
  return pic(s, file, (W - maxW) / 2, y, maxW, maxH, alt + ": title block");
}
// Plain text at a spot, Georgia
function txt(s, text, x, y, w, h, o = {}) {
  s.addText(text, { x, y, w, h, fontFace: o.font || "Georgia", fontSize: o.size || 18, align: o.align || "left", valign: o.valign || "top",
    color: o.color || "000000", bold: !!o.b, italic: !!o.i, isTextBox: true, margin: o.margin != null ? o.margin : 2, objectName: o.name });
}
const G1 = "Dove L et al. AASLD/AST candidate evaluation guideline. Hepatology 2026;83(6):1609-45 [PMID: 41405234]";
const G2 = "Te HS et al. AASLD/AST graft-related complications guideline. Liver Transpl 2026;32(3):444-90 [PMID: 40844852]";
const G3 = "Sharma P et al. AASLD/AST non-graft complications guideline. Liver Transpl 2026;32(8):1157-93 [PMID: 41405235]";
const SRTR = "Kwong AJ et al. OPTN/SRTR 2024 Annual Data Report: Liver. Am J Transplant 2026;26(8S1):S214-S320 [PMID: 42276697]";

// ---------------------------------------------------------------- Cover
sec("Opening");
{
  const s = pres.addSlide({ masterName: "BLANK", sectionTitle: section });
  // watercolor cover from Gemini (prompt in the lecture folder); the road is on the right, title on the plain left half
  s.addImage({ path: path.join(IMG, "cover-coast-road.jpg"), x: -0.05, y: 0, w: 13.43, h: 7.5, altText: "Watercolor of a coastal road in Maine running south toward a distant city" });
  const tx = 0.35, tw = 5.9;
  s.addText([
    { text: "Liver Transplantation", options: { fontSize: 32, breakLine: true } },
    { text: "When to Refer and What's New", options: { fontSize: 23 } },
  ], { x: tx, y: 1.2, w: tw, h: 1.6, fontFace: "Georgia", bold: true, align: "center", valign: "middle", color: "000000", isTextBox: true, margin: 0 });
  s.addShape(pres.shapes.LINE, { x: tx + 1.3, y: 3.1, w: tw - 2.6, h: 0, line: { color: "A6A6A6", width: 1 } });
  s.addText([
    { text: "Mohammad Almeqdadi, MD", options: { bold: true, fontSize: 20, breakLine: true } },
    { text: "Transplant Hepatologist, Tufts Medical Center", options: { fontSize: 16, breakLine: true } },
    { text: "Assistant Professor of Medicine and Surgery", options: { fontSize: 16, breakLine: true } },
    { text: "Tufts University School of Medicine", options: { fontSize: 16, breakLine: true } },
    { text: "X: @mfalmeqdadi", options: { fontSize: 16, color: "595959" } },
  ], { x: tx, y: 3.35, w: tw, h: 1.95, fontFace: "Georgia", align: "center", valign: "top", color: "000000", isTextBox: true, margin: 0, paraSpaceAfter: 4 });
  s.addImage({ path: LOGO_IMG, x: tx + 0.05, y: 5.75, w: 3.5, h: 0.71, altText: "Tufts University School of Medicine" });
  // QR to the PDF of these slides on GitHub (the public copy, without Tufts numbers)
  s.addImage({ path: path.join(IMG, "qr-slides.png"), x: tx + tw - 1.45, y: 5.4, w: 1.3, h: 1.3, altText: "QR code linking to the slides PDF" });
  s.addText("Slides (PDF)", { x: tx + tw - 1.58, y: 6.75, w: 1.55, h: 0.3, fontFace: "Georgia", fontSize: 11, align: "center",
    color: "595959", isTextBox: true, margin: 0 });
  s.addText("Illustrations generated with Google Gemini", { x: 0.4, y: 7.08, w: 5, h: 0.3, fontFace: "Georgia", fontSize: 11,
    italic: true, color: "7F7F7F", isTextBox: true, margin: 0 });
  s.addNotes("Maine Medical Center grand rounds. About 45 minutes, then questions. Two halves: when to refer and who can be a candidate now, then what's new in where the livers come from and what to do when a transplant patient lands on your service.");
}
{
  const s = slide("Disclosures");
  txt(s, "No relevant financial relationships to disclose.", 0.9, 3.2, W - 1.8, 0.8, { size: 26, align: "center", valign: "middle" });
}
{
  const s = slide("Objectives");
  pic(s, "lighthouse-spot.jpg", 6.9, 2.1, 6.2, 4.0, "Watercolor of a lighthouse on a rocky Maine shore");
  body(s, [
    "Recognize which patients need a transplant evaluation, and which need a call the same day",
    "See how candidacy has changed",
    "Understand where donor livers come from now",
    "Care for a transplant recipient on your service",
  ], { size: 22, gap: 18, x: 0.5, w: 6.2, y: 1.7, h: 4.8 });
  s.addNotes("Four parts. The first half is for everyone who sees patients with liver disease. The second half has the newer data, and the last part is for anyone who admits a transplant patient.");
}

// ---------------------------------------------------------------- Part 1. How we got here
sec("How we got here");
{
  const s = slide("How did liver transplant start?");
  const p = pic(s, "history-timeline.png", 0.6, 1.3, W - 1.2, 5.5, "Timeline of milestones in liver transplantation, 1952 to 2013");
  // Starzl's two boxes: the first human attempt (1963) and the first long survivor (1967); pixel boxes on the 1185 x 542 original
  const k = p.w / 1185;
  [[16, 418, 248, 66], [236, 318, 160, 90]].forEach(([x, y, w, h]) =>
    s.addShape(pres.shapes.RECTANGLE, { x: p.x + x * k, y: p.y + y * k, w: w * k, h: h * k, fill: { type: "none" }, line: { color: RED, width: 2.25 }, objectName: "Highlight" }));
  src(s, "Timeline 1 from Zarrinpar A, Busuttil RW. Nat Rev Gastroenterol Hepatol 2013;10(7):434-40 [PMID: 23752825]");
  s.addNotes("The first human liver transplant was attempted by Thomas Starzl in Denver in March 1963, in a child with biliary atresia who didn't survive the operation. The next several patients died within weeks, and programs stopped. In 1967 Starzl had the first patient who lived more than a year. What made it a real treatment was immunosuppression: Calne's cyclosporine at the end of the 1970s, and the 1983 NIH consensus conference that called liver transplant a treatment for end-stage liver disease rather than an experiment.");
}
{
  const s = slide("Who was Thomas Starzl?");
  if (PRIVATE_IMG) {
    // talk copy: the whole NYT page with the AP photo; the repo copy has only the headline
    s.addImage({ path: path.join(PRIVATE_IMG, "starzl-nyt.png"), x: 0.6, y: 1.3, w: 4.92, h: 5.4, altText: "New York Times obituary: Dr. Thomas E. Starzl, Pioneering Liver Surgeon, Dies at 90, with his 1989 photo in a Pittsburgh operating room" });
  } else {
    pic(s, "starzl-nyt-headline.png", 0.4, 2.6, 5.4, 1.3, "New York Times headline: Dr. Thomas E. Starzl, Pioneering Liver Surgeon, Dies at 90");
  }
  body(s, [
    "1963, Denver: first human liver transplant attempt",
    "1967: first patient to live more than a year after one",
    "1980: cyclosporine with steroids; survival finally good enough to offer it widely",
    "1989, Pittsburgh: tacrolimus",
    "Died March 4, 2017, at 90",
  ], { size: 20, gap: 16, x: 6.0, w: 6.9, y: 1.6, h: 5.1 });
  src(s, "The New York Times, March 5, 2017. Starzl TE et al. Homotransplantation of the liver in humans. Surg Gynecol Obstet 1963;117:659-76 [PMID: 14100514]");
  s.addNotes("He moved to Pittsburgh in 1981, and tacrolimus (FK506) came out of his program there in 1989. He died at home in Pittsburgh.");
}
{
  const s = slide("How did the first liver transplants go?");
  pic(s, "starzl-1963-title.png", 0.5, 1.35, 6.4, 3.3, "Starzl TE et al. Homotransplantation of the liver in humans. Surg Gynecol Obstet, December 1963: title block", { left: true });
  body(s, [
    "Patient 1, 1 March 1963: a 3-year-old with biliary atresia, died of bleeding on the operating table",
    "Patients 2 and 3 died 22 and 7½ days later, of pulmonary emboli",
  ], { size: 19, gap: 14, x: 0.5, w: 6.4, y: 4.75, h: 2.0 });
  pic(s, "starzl-1963-excerpt.png", 7.2, 1.3, 5.7, 5.5, "Excerpt from the 1963 paper describing the three patients and patient 1");
  src(s, "Starzl TE et al. Surg Gynecol Obstet 1963;117:659-76 [PMID: 14100514]. Scan: University of Pittsburgh D-Scholarship");
  s.addNotes("The original paper, from Denver. The first child died on the table of hemorrhage from a profound clotting defect, which the paper describes in detail. The next two lived long enough to show the operation could be done, and both died of pulmonary emboli. After more deaths, programs stopped in 1964 until Starzl tried again in 1967.");
}

// ---------------------------------------------------------------- Part 2. Is it worth it?
sec("Is it worth it?");
{
  const s = slide("How do patients do after a liver transplant?");
  pic(s, "srtr-li59.png", 0.9, 1.3, W - 1.8, 5.5, "SRTR 2024 Figure LI 59: percentage of adult liver recipients who died by 6 months, 1, 3, 5 and 10 years, by transplant year");
  src(s, "OPTN/SRTR 2024 Annual Data Report, Figure LI 59. " + SRTR.replace("Kwong AJ et al. OPTN/SRTR 2024 Annual Data Report: Liver. ", ""));
  s.addNotes("These are mortality lines, not survival curves: each line is the share of adult recipients who had died by that point, by the year they were transplanted. Mortality has come down at most time points, though not every year. One-year patient survival for adults who got a deceased donor liver in 2023 was 93.5%. Of adults transplanted in 2014, 33.6% had died by 10 years [PMID: 42276697].");
}
{
  const s = slide("How much has liver transplant grown?");
  bars(s, [{ name: "Liver transplants", labels: ["2020", "2021", "2022", "2023", "2024"], values: [8906, 9234, 9527, 10659, 11458] }],
    { x: 1.4, y: 1.35, w: W - 2.8, h: 4.6, max: 12000, unit: 2000, valFmt: "#,##0", fmt: "#,##0", colors: [NAVY], catSize: 18, labSize: 18 });
  txt(s, "11,458 in 2024 (10,886 adults), 70% more than in 2014", 0.9, 6.1, W - 1.8, 0.55, { size: 22, align: "center" });
  src(s, "OPTN/SRTR Annual Data Reports, Liver, 2020-2024 [PMIDs: 35266621, 37132348, 38431359, 39947804, 42276697]");
  s.addNotes("Every year since 2020 has been a record. The 2024 report gives 70.3% more than in 2014. Part of the growth is more DCD livers and machine perfusion, which we'll come back to.");
}
if (!PUBLIC) {
  const s = slide("Liver transplants at Tufts Medical Center");
  // rough numbers only (MY_STYLE.md): bars without values, exact counts stay in the project folder
  const t = TUFTS.perYear;
  bars(s, [{ name: "Liver transplants", labels: t.labels, values: t.values }],
    { x: 1.4, y: 1.35, w: W - 2.8, h: 4.6, max: t.max, unit: t.unit, noVal: true, hideVal: true, colors: [NAVY], catSize: 16 });
  txt(s, t.line, 0.9, 6.1, W - 1.8, 0.55, { size: 22, align: "center" });
  src(s, TUFTS.source);
  s.addNotes(t.notes);
}

// ---------------------------------------------------------------- Part 2. When to refer
sec("When to refer");
bgDivider("When to refer", null, "divider-referral.jpg", "Watercolor of a clinic exam room desk with a referral letter")
  .addNotes("The part of the talk that matters most for most of the room.");
{
  const s = slide("When should a patient with cirrhosis be referred?");
  titleBlock(s, "g1-title.png", 1.25, 0.7, "AASLD/AST candidate evaluation guideline 2025", 6.0);
  const ev = ["Ascites, with or without SBP", "Variceal or portal hypertensive gastropathy bleeding", "Hepatic encephalopathy",
    "Hepatocellular carcinoma", "Hepatopulmonary syndrome or portopulmonary hypertension", "MELD 3.0 ≥12"];
  const bw = 3.75, bh = 0.92, ys = [2.2, 3.3, 4.4];
  ev.forEach((t, i) => {
    const left = i < 3, x = left ? 0.6 : W - 0.6 - bw, y = ys[i % 3];
    box(s, x, y, bw, bh, t, { size: 16, lw: 1, line: "7F7F7F", b: t.startsWith("MELD") });
    arrow(s, left ? x + bw : x, y + bh / 2, left ? 5.15 : W - 5.15, 3.76);
  });
  box(s, 5.15, 3.2, W - 10.3, 1.12, "Refer for liver transplant evaluation", { size: 18, b: true, fill: "F2F2F2" });
  txt(s, [
    { text: "Statement 1: ", options: { bold: true } },
    { text: "refer after any decompensating event. Without one, the MELD threshold is unclear: benefit may start at 12 in waitlisted patients, and most of the writing group still sees 15 as reasonable. “MELD score alone should not be a barrier to referral.”" },
  ], 0.9, 5.45, W - 1.8, 1.3, { size: 17, align: "center" });
  src(s, "Figure 1 and statement 1 redrawn from " + G1);
  s.addNotes("This is Figure 1 of the new guideline, redrawn; the MELD 3.0 ≥12 box is theirs. Any one of these events is a reason to call. The 2013 guideline said MELD 15. The MELD 12 number comes from studies of patients already on the waitlist, which weren't designed to answer when to refer. So without complications there is no firm cutoff, and 15 is still reasonable. With uncontrolled portal hypertensive complications, refer at any MELD.");
}
{
  const s = slide("Who needs a call the same day?");
  const rows = [
    ["Acute liver failure", "INR ≥1.5 and any encephalopathy, no cirrhosis"],
    ["Severe acute liver injury", "Jaundice and a rising INR, still awake"],
    ["ACLF", "Cirrhosis with new organ failure"],
  ];
  rows.forEach(([h, d], i) => {
    const y = 1.5 + i * 1.3;
    box(s, 0.6, y, 4.6, 1.05, [{ text: h, options: { bold: true, breakLine: true } }, { text: d, options: { fontSize: 15 } }], { size: 18, line: "7F7F7F" });
    arrow(s, 5.2, y + 0.525, 6.0, 3.0);
  });
  box(s, 6.0, 2.45, 2.6, 1.1, "Call transplant hepatology", { size: 18, b: true, fill: "F2F2F2" });
  pic(s, "phone.jpg", 8.9, 1.4, 4.1, 3.6, "Watercolor of a desk phone with the handset off the hook");
  txt(s, [
    { text: "ALF: ", options: { bold: true } },
    { text: "call “in the first few hours after presentation, and prior to meeting ALF diagnostic criteria,” because complications can make the transfer unsafe (statements 3-4). " },
    { text: "ACLF: ", options: { bold: true } },
    { text: "refer (statement 2). Insurance, substance use or infection shouldn't hold up the call." },
  ], 0.6, 5.35, W - 1.2, 1.4, { size: 17, align: "center" });
  src(s, G1 + ". ACG ALF guideline 2023 [PMID: 37377263]");
  s.addNotes("This is the one that matters most for a hospital without a transplant program. About a third of ALF patients get a transplant, a third recover, and the transplant center can help with both. Don't wait for King's College criteria or for encephalopathy to get worse. The guideline says barriers like insurance, substance use or infection should be sorted out quickly but shouldn't stop the referral. The ICU side of ALF and ACLF is in my ALF lecture.");
}
{
  const s = slide("Why did MELD 15 become the rule?");
  // survival benefit by MELD band, drawn from the old slide's summary of Merion 2005 (no hazard ratios on the slide)
  const x0 = 0.9, x1 = W - 0.9, y = 2.2, h = 1.0;
  const edge = { 6: 0, 12: 3.1, 15: 5.4, 18: 7.7, 40: x1 - x0 };
  const meld = (m) => x0 + edge[m];
  const bands = [
    [6, 12, "MELD 6-11", "C00000", "FFFFFF", "Death risk after transplant higher than staying on the list"],
    [12, 15, "12-14", "E8B4B4", "000000", "Still higher"],
    [15, 18, "15-17", "D9D9D9", "000000", "No clear benefit"],
    [18, 40, "18 and up", NAVY, "FFFFFF", "Transplant comes out ahead, more so as MELD rises"],
  ];
  bands.forEach(([a, b, lab, fill, col, under]) => {
    s.addShape(pres.shapes.RECTANGLE, { x: meld(a), y, w: meld(b) - meld(a), h, fill: { color: fill }, line: { color: "FFFFFF", width: 1.5 } });
    txt(s, lab, meld(a), y, meld(b) - meld(a), h, { size: 16, align: "center", valign: "middle", color: col, b: true, font: TBL_FONT });
    txt(s, under, meld(a) + 0.03, y + h + 0.12, meld(b) - meld(a) - 0.06, 1.3, { size: 16, align: "center", font: TBL_FONT });
  });
  body(s, [
    "US waitlist candidates: transplant vs staying on the list, by MELD updated on the list and just before transplant",
    "A 2009 decision analysis came to the same threshold of 15",
    "Both were before MELD-Na, MELD 3.0 and today's donor pool",
  ], { size: 20, gap: 10, y: 4.65, h: 2.1 });
  src(s, "Merion RM et al. Am J Transplant 2005;5(2):307-13 [PMID: 15643990]. Perkins JD et al. Liver Transpl 2009;15(2):242-54 [PMID: 19177441]");
  s.addNotes("This is where 15 came from. Merion used MELD as it changed on the list, not just the listing score. Between 15 and 17 the study couldn't show a one-year benefit either way. It set the old benefit threshold for transplant; it was never a study of when to refer. That was 2005 data, and the next slide is the living donor data.");
}
{
  const s = slide("Is there benefit below MELD 15 with a living donor?");
  titleBlock(s, "jackson-ldlt-title.png", 1.25, 1.2, "Jackson WE et al. JAMA Surg 2022", 6.5);
  pic(s, "jackson-ldlt-fig1b.png", 0.6, 2.6, 6.2, 4.2, "Figure 1B: covariate-adjusted one-year hazard ratio of death with living donor LT vs staying on the list, by MELD-Na category");
  body(s, [
    { t: "Adjusted, compared with staying on the list:", nb: true, i: true },
    "MELD-Na 11-13: aHR 0.64 (0.47-0.88)",
    "MELD-Na 14-16: aHR 0.47 (0.34-0.66)",
    "Modeled gain of 13-17 life-years",
  ], { size: 19, gap: 14, x: 7.0, w: 6.0, y: 2.9, h: 3.8 });
  src(s, [{ text: "Jackson WE, Malamon JS, Kaplan B, Saben JL, Schold JD, " }, { text: "Pomposelli JJ", options: { highlight: HL } },
    { text: ", Pomfret EA. JAMA Surg 2022;157(10):926-932 [PMID: 35921119]" }]);
  s.addNotes("With a living donor the benefit starts well below 15, so living donation is worth raising before a patient reaches the old deceased donor threshold. Figure 1B, adjusted for age at listing, sex and primary diagnosis. James Pomposelli, one of the authors, is now our colleague at Tufts.");
}
{
  const s = slide("Where did MELD come from?");
  const a = pic(s, "meld-malinchoc-title.png", 0.6, 1.4, 7.0, 2.3, "Malinchoc M et al. Hepatology 2000: title block");
  // Fredric Gordon is at Tufts: highlight his name (pixel box on the 815 x 259 original)
  const k = a.w / 815;
  s.addShape(pres.shapes.RECTANGLE, { x: a.x + 254 * k, y: a.y + 222 * k, w: 100 * k, h: 26 * k, fill: { color: HL, transparency: 55 }, line: { type: "none" }, objectName: "Highlight" });
  pic(s, "meld-kamath-title.png", 0.6, 4.2, 7.0, 2.3, "Kamath PS et al. Hepatology 2001: title block");
  body(s, [
    "2000: built at Mayo to predict death after an elective TIPS",
    "2001: worked just as well across end-stage liver disease",
    "2002: became the basis for US liver allocation",
  ], { size: 20, gap: 18, x: 8.0, w: 4.9, y: 1.8, h: 4.8 });
  src(s, [{ text: "Malinchoc M, Kamath PS, " }, { text: "Gordon FD", options: { highlight: HL } },
    { text: ", et al. Hepatology 2000;31(4):864-71 [PMID: 10733541]. Kamath PS et al. Hepatology 2001;33(2):464-70 [PMID: 11172350]" }]);
  s.addNotes("MELD started as a TIPS score. Fredric Gordon, one of the authors of the original paper, is our colleague at Tufts.");
}
{
  const s = slide("What's new in MELD 3.0?");
  table(s, [
    ["", "MELD-Na", "MELD 3.0"],
    ["Bilirubin", "✓", "✓"],
    ["INR", "✓", "✓"],
    ["Creatinine", "✓ (cap 4.0)", "✓ (cap 3.0)"],
    ["Sodium", "✓", "✓"],
    ["Albumin", "", { t: "✓", b: true }],
    ["Female sex", "", { t: "✓ (+1.33)", b: true }],
    ["Interaction terms", "MELD × Na", "Bili × Na, albumin × Cr"],
  ], { x: 0.6, y: 1.5, w: 7.2, size: 18, minRowH: 0.56 });
  body(s, [
    "Used for allocation since July 2023",
    "90-day mortality: C-statistic 0.869 vs 0.862",
    "In simulation, at least 20 fewer waitlist deaths a year",
  ], { size: 20, gap: 16, x: 8.2, w: 4.7, y: 1.9, h: 4.6 });
  src(s, "Kim WR, Mannalithara A, Heimbach JK, et al. Gastroenterology 2021;161(6):1887-1895.e4 [PMID: 34481845]");
  s.addNotes("MELD 3.0 = 1.33 (if female) + 4.56 ln(bilirubin) + 0.82 (137 − Na) − 0.24 (137 − Na) ln(bilirubin) + 9.09 ln(INR) + 11.14 ln(creatinine) + 1.85 (3.5 − albumin) − 1.83 (3.5 − albumin) ln(creatinine) + 6. Women had higher waitlist mortality at the same lab values; the sex term covers part of that, and the access gap tied to body size is still there. For real numbers use the OPTN calculator, which applies the lab bounds (sodium 125-137, albumin 1.5-3.5, creatinine 1-3), the dialysis rule, rounding, and the 6-40 range.");
}
function women(step) {
  const s = slide("Did MELD 3.0 help women?");
  bars(s, [
    { name: "Before MELD 3.0", labels: ["Transplants going to women", "90-day waitlist dropout, women"], values: step === 1 ? [0, 0] : [37.0, 14.4] },
    { name: "After MELD 3.0", labels: ["Transplants going to women", "90-day waitlist dropout, women"], values: step === 1 ? [0, 0] : [41.7, 9.1] },
  ], { x: 1.6, y: 1.3, w: W - 3.2, h: 4.15, max: 50, unit: 10, fmt: '0.0"%"', legend: true, colors: [SLATE, NAVY], catSize: 18, noVal: step === 1 });
  txt(s, "Conference analysis, 12 months before vs 12 months after July 2023. Dropout: died or too sick for transplant", 0.9, 5.45, W - 1.8, 0.35, { size: 14, align: "center", i: true, color: GREY });
  if (step === 2) txt(s, "The gain was largest right after the change and narrowed over time. Waitlisted women still die more often: 15.0 vs 12.4 per 100 patient-years in 2024.",
    0.9, 5.9, W - 1.8, 0.9, { size: 19, align: "center" });
  src(s, "Kwong AJ, The Liver Meeting 2024, abstract 5002 (conference data). Tanaka T et al. Hepatology 2026;84(1):106-16 [PMID: 41100798]. Di Napoli M et al. Front Transplant 2026 [PMID: 42266471]. SRTR 2024 ADR [PMID: 42276697]");
  return s;
}
women(1).addNotes("Two numbers: the share of transplants that went to women, and how many waitlisted women dropped out within 90 days, before and after July 2023.");
cont(); women(2).addNotes("Transplants to women went from 37.0% to 41.7%, and 90-day dropout in women fell from 14.4% to 9.1% (conference data). Tanaka compared the change in women with the change in men: the relative gain in transplant access for women was OR 1.36 at implementation and 1.18 at 3 months, and it faded later. The gap hasn't closed.");
{
  const s = slide("How should frailty change the evaluation?");
  const tests = ["Grip strength", "Chair stands (5)", "Balance (3 positions)"];
  tests.forEach((t, i) => {
    box(s, 0.5 + i * 2.35, 1.6, 2.15, 1.0, t, { size: 17, line: "7F7F7F" });
    arrow(s, 0.5 + i * 2.35 + 1.075, 2.6, 3.95, 3.35);
  });
  box(s, 2.1, 3.35, 3.7, 0.9, "Liver Frailty Index", { size: 20, b: true, fill: "F2F2F2" });
  // the three bands on one scale
  const sx = 0.5, sw = 6.9, sy = 5.0;
  [["Robust", "<3.2", 0, 0.4, SLATE, "000000"], ["Prefrail", "3.2-4.3", 0.4, 0.75, "D9D9D9", "000000"], ["Frail", "≥4.4", 0.75, 1, NAVY, "FFFFFF"]]
    .forEach(([lab, v, a, b, fill, col]) => {
      s.addShape(pres.shapes.RECTANGLE, { x: sx + a * sw, y: sy, w: (b - a) * sw, h: 1.1, fill: { color: fill }, line: { color: "FFFFFF", width: 1.5 } });
      txt(s, [{ text: lab, options: { bold: true, breakLine: true } }, { text: v }], sx + a * sw, sy, (b - a) * sw, 1.1, { size: 18, align: "center", valign: "middle", color: col, font: TBL_FONT });
    });
  arrow(s, 3.95, 4.25, 3.95, sy);
  body(s, [
    "Measure it with a standard tool (statement 33)",
    "Frailty raises the risk after transplant, but alone it doesn't rule a patient out (44-45)",
    "Frailty also predicts death on the waitlist",
  ], { size: 20, gap: 18, x: 7.8, w: 5.1, y: 1.7, h: 4.8 });
  src(s, "Lai JC, Tandon P, Bernal W, et al. Hepatology 2021;74(3):1611-44 [PMID: 34233031]. " + G1.replace("Dove L et al. AASLD/AST candidate evaluation guideline. ", "Dove L et al. "));
  s.addNotes("Takes about 3 minutes in clinic. The calculator is free online. Frailty is something the referring team can work on while the patient waits.");
}
{
  const s = slide("What no longer rules a patient out?");
  table(s, [
    ["On its own", "2025 AASLD/AST guideline", "Statement"],
    ["Length of abstinence", "Duration alone doesn't exclude", "38"],
    ["Methadone or buprenorphine", "No denial, no taper needed", "41"],
    ["Frailty", "Assess it with a standard tool; not a sole contraindication", "44-45"],
    ["BMI >40 or <18.5", "Screen nutrition and muscle; BMI alone doesn't exclude", "48-49"],
    ["ACLF or MELD >40", "Doesn't exclude by itself", "2, 43"],
    ["Older age (living donor LT)", "Not an exclusion", "51"],
  ], { x: 0.6, y: 1.5, w: W - 1.2, size: 18, minRowH: 0.58 });
  txt(s, "Each one is still weighed with the rest of the picture, case by case.", 0.9, 6.0, W - 1.8, 0.5, { size: 19, align: "center", i: true });
  src(s, G1);
  s.addNotes("None of these should stop a first referral on its own. The 2025 guideline says each is weighed with everything else, not used as a cutoff.");
}

// ---------------------------------------------------------------- Part 3. From Maine to a transplant center
sec("From Maine to Boston");
bgDivider("From Maine to Boston", null, "divider-road-south.jpg", "Watercolor of a snowy highway heading south through pine trees")
  .addNotes("Maine has no liver transplant program, so for many patients here transplant care means travel out of state. Travel, lodging and a caregiver are part of the plan from the first visit.");
// Tufts recipients by home state: talk copy only. No Maine mortality data on this slide or in its notes (Mohammad, 2026-10-27).
if (!PUBLIC) {
  const s = slide("Where do Tufts recipients live?");
  // share by home state, no values on the bars (rough numbers only)
  const t = TUFTS.byState;
  bars(s, [
    { name: "Maine", labels: t.labels, values: t.maine },
    { name: "Other states", labels: t.labels, values: t.other },
  ], { x: 1.4, y: 1.35, w: W - 2.8, h: 4.4, max: t.max, unit: t.unit, noVal: true, hideVal: true, grouping: "stacked", colors: [NAVY, SLATE], catSize: 18 });
  txt(s, t.line, 0.9, 5.95, W - 1.8, 0.6, { size: 21, align: "center" });
  src(s, TUFTS.source);
  s.addNotes(t.notes + "Maine has no liver transplant center, so each of them made the drive south for the evaluation and the transplant.");
}
{
  const s = slide("How does a liver get from a donor to a patient?");
  pic(s, "acuity-circles.jpg", 0.5, 1.4, 7.6, 5.3, "Acuity circles of 150, 250 and 500 nautical miles around a donor hospital");
  body(s, [
    "Circles of 150, 250 and 500 nautical miles around the donor hospital",
    "Offers follow urgency first, then distance from the donor hospital",
    "Exception points are set from the median MELD at transplant (MMaT) near the donor hospital",
  ], { size: 19, gap: 16, x: 8.4, w: 4.5, y: 1.6, h: 5.0 });
  src(s, "OPTN Policy 9, liver allocation (acuity circles since February 2020)");
  s.addNotes("Status 1 (mostly acute liver failure) gets the broadest priority, then MELD within each circle. Distance is measured from the donor hospital to the transplant hospital, not to the patient's home. For a patient from Maine listed in Boston, the circles are drawn around Boston's donors, not around Portland.");
}
{
  const s = slide("What happens after the referral?");
  const steps = ["Referral", "Evaluation", "Selection committee", "Listing", "Waiting"];
  const bw = 2.05, gap = 0.45, x0 = (W - (steps.length * bw + (steps.length - 1) * gap)) / 2;
  steps.forEach((t, i) => {
    const x = x0 + i * (bw + gap);
    box(s, x, 1.55, bw, 0.85, t, { size: 16, b: i === 1, fill: i === 1 ? "F2F2F2" : "FFFFFF" });
    if (i < steps.length - 1) arrow(s, x + bw, 1.975, x + bw + gap, 1.975);
  });
  table(s, [
    ["Part of the evaluation", "What it involves"],
    ["Hepatology and surgery", "Visits, labs, CT or MRI of the liver"],
    ["Heart and lungs", "ECG and echo, then coronary testing by risk"],
    ["Social work and addiction", "Support at home, alcohol and drug history, treatment plan"],
    ["Nutrition and physical therapy", "Muscle, frailty, protein intake"],
    ["Other", "Dental, cancer screening, vaccines, financial counseling"],
  ], { x: 0.9, y: 2.9, w: W - 1.8, size: 19, minRowH: 0.62 });
  src(s, G1);
  s.addNotes("How many visits it takes depends on how sick the patient is and what has already been done locally; send what you have. Referral, evaluation, listing and exception points are separate decisions. Listing isn't the end of the work, which is the next slide.");
}
{
  const s = slide("What can you do while the patient waits?");
  body(s, [
    "Treat alcohol use disorder, with medicines and counseling",
    "Protein 1.2-1.5 g/kg ideal body weight a day, a late-evening snack",
    "Exercise for frailty",
    "Vaccines before transplant",
    "No known HCC: surveillance every 6 months",
    "Keep the MELD labs current",
  ], { size: 20, gap: 14, x: 0.6, w: 7.0, y: 1.45, h: 5.3 });
  pic(s, "waiting-list-table.jpg", 7.8, 1.35, 5.2, 5.3, "Watercolor of a grip-strength meter, a pill organizer and a vaccine vial");
  src(s, G1.replace("Dove L et al. AASLD/AST candidate evaluation guideline. ", "Dove L et al. ") + ". Lai JC et al. Hepatology 2021 [PMID: 34233031]");
  s.addNotes("This works best as shared care, with a clear owner for labs, HCC surveillance, nutrition and addiction treatment. Patients with known HCC are imaged on a different schedule by the transplant team. The patient who comes to transplant with muscle and without drinking does better.");
}

// ---------------------------------------------------------------- Part 4. Who can get a liver now
sec("Who can get a liver now");
bgDivider("Who can get a liver now", null, "divider-waiting-chair.jpg", "Watercolor of an empty waiting room chair with a coat over the arm")
  .addNotes("Selection has changed for three groups: severe alcohol-associated hepatitis, ACLF, and some cancers.");
{
  const s = slide("Can a patient who drank last month get a liver?");
  pic(s, "mathurin-km.png", 0.5, 1.35, 7.0, 5.4, "Mathurin 2011: survival after early transplant vs matched controls");
  body(s, [
    { t: "France and Belgium, not the US", b: true },
    "First episode of severe AH, not responding to steroids, strict medical and psychosocial selection",
    "26 patients, fewer than 2% of severe AH admissions",
    "6-month survival 77% vs 23% in matched controls",
  ], { size: 20, gap: 16, x: 7.8, w: 5.1, y: 1.8, h: 4.9 });
  src(s, "Mathurin P, Moreno C, Samuel D, et al. N Engl J Med 2011;365(19):1790-800 [PMID: 22070476]");
  s.addNotes("This was the paper that broke the 6-month rule. Very selected patients, and the benefit was large: 77 ± 8% vs 23 ± 8% at 6 months, P<0.001.");
}
{
  const s = slide("Did it hold up in the US?");
  pic(s, "accelerate-ah.jpg", 1.9, 1.3, W - 3.8, 3.3, "ACCELERATE-AH: survival and sustained alcohol use after early transplant");
  body(s, [
    "ACCELERATE-AH, 147 patients: sustained alcohol use carried a higher risk of death (HR 4.59)",
    "2025 analysis, 347 patients alive at discharge: 5-year survival 83.1%"
  ], { size: 19, gap: 12, x: 0.9, y: 4.85, h: 1.9 });
  src(s, "Lee BP et al. Gastroenterology 2018;155(2):422-430.e1 [PMID: 29655837]. Dukewich M et al. Am J Gastroenterol 2025;120(4):827-36 [PMID: 38994850]");
  s.addNotes("1-year survival 94% and 3-year 84%. Sustained use was 10% at 1 year and 17% at 3 years. In the 2025 analysis, continued harmful drinking carried an aHR of 3.59 (2.17-5.95) for death, and patients who got back to abstinence had predicted survival close to those who never drank harmfully. Finding and treating a return to drinking after transplant matters as much as the operation.");
}
{
  const s = slide("What about relapse?");
  titleBlock(s, "quicktrans-title.png", 1.25, 0.95, "Louvet A et al. QuickTrans, Lancet Gastroenterol Hepatol 2022", 6.0);
  pic(s, "quicktrans-fig.png", 0.6, 2.35, 5.8, 3.8, "QuickTrans: overall survival in the early transplant group vs patients not eligible");
  txt(s, "Early-LT strategy vs patients not eligible: 2-year survival 70.6% vs 28.3%", 0.6, 6.2, 5.8, 0.6, { size: 16, align: "center" });
  bars(s, [
    { name: "Early LT", labels: ["Any relapse", "High alcohol intake"], values: [34, 22] },
    { name: "Standard LT", labels: ["Any relapse", "High alcohol intake"], values: [25, 5] },
  ], { x: 6.9, y: 2.3, w: 5.9, h: 3.9, max: 40, unit: 10, legend: true, colors: [NAVY, SLATE], catSize: 15, title: "Relapse in transplanted patients: early vs standard LT" });
  txt(s, "Non-inferiority for relapse not shown", 6.9, 6.2, 5.9, 0.6, { size: 16, align: "center" });
  src(s, "Louvet A, Labreuche J, Moreno C, et al. Lancet Gastroenterol Hepatol 2022;7(5):416-25 [PMID: 35202597]");
  s.addNotes("The two panels compare different groups. The survival curve is everyone offered early transplant, transplanted or not, against patients who weren't eligible. The relapse bars are transplanted patients only, early vs standard transplant. High alcohol intake was more common after early transplant, and non-inferiority for any relapse wasn't shown. Days abstinent were 81.9% vs 88.5% in the early-LT strategy and ineligible groups (p=0.16).");
}
{
  const s = slide("What do the guidelines say now?");
  table(s, [
    ["Guideline", "Early transplant for alcohol-associated hepatitis"],
    ["EASL 2024", "Selected non-responders with favorable sobriety predictors (strong)"],
    ["ACG 2024", "Carefully selected non-responders at low risk of relapse"],
    ["AASLD/AST 2025", "Refer ALD early; abstinence duration alone doesn't exclude (37-38)"],
  ], { x: 0.5, y: 1.7, w: W - 1.0, size: 20, minRowH: 0.95 });
  src(s, "EASL CPG on liver transplantation. J Hepatol 2024;81(6):1040-86, p.1044 [PMID: 39487043]. Jophlin LL et al. Am J Gastroenterol 2024;119(1):30-54 [PMID: 38174913]. " + G1.replace("Dove L et al. AASLD/AST candidate evaluation guideline. ", "Dove L et al. "));
  s.addNotes("EASL and ACG speak directly to selected patients with severe alcohol-associated hepatitis. The AASLD/AST guideline has no numbered statement on early transplant for alcohol-associated hepatitis itself; it says to refer early and not to use the length of abstinence alone to exclude. It also says patients on methadone or buprenorphine shouldn't be denied or made to taper (statement 41).");
}
if (!PUBLIC) {
  const s = slide("What do we transplant for at Tufts?");
  const t = TUFTS.dx;
  bars(s, [
    { name: "Alcohol", labels: t.labels, values: t.alcohol },
    { name: "Other", labels: t.labels, values: t.other },
  ], { x: 1.4, y: 1.35, w: W - 2.8, h: 4.4, max: t.max, unit: t.unit, noVal: true, hideVal: true, grouping: "stacked", colors: [NAVY, SLATE], catSize: 18 });
  txt(s, t.line, 0.9, 5.95, W - 1.8, 0.8, { size: 20, align: "center" });
  src(s, TUFTS.source);
  s.addNotes(t.notes);
}
function usDx(step) {
  const s = slide(PUBLIC ? "What do US adults get a liver for?" : "Is that just Tufts?");
  const z = step === 1;
  s.addChart(pres.charts.BAR, [
    { name: "Alcohol-associated cirrhosis", labels: ["US adult recipients, 2024"], values: [z ? 0 : 33.9] },
    { name: "Alcohol-associated hepatitis", labels: ["US adult recipients, 2024"], values: [z ? 0 : 7.3] },
    { name: "Everything else", labels: ["US adult recipients, 2024"], values: [z ? 0 : 58.8] },
  ], { x: 0.9, y: 1.6, w: W - 1.8, h: 3.4, barDir: "bar", barGrouping: "percentStacked", barGapWidthPct: 40,
    chartColors: [NAVY, TEAL, SLATE], valAxisHidden: true, catAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    showValue: !z, dataLabelFormatCode: '0.0"%"', dataLabelFontSize: 20, dataLabelFontFace: TBL_FONT, dataLabelColor: "FFFFFF", dataLabelFontBold: true,
    showLegend: true, legendPos: "b", legendFontFace: TBL_FONT, legendFontSize: 16 });
  if (!z) txt(s, "Alcohol-associated liver disease: 41.1% of US adult recipients, the top diagnosis", 0.9, 5.4, W - 1.8, 0.6, { size: 21, align: "center" });
  if (!z) txt(s, "Parts are rounded, so they add to 41.2%", 0.9, 6.3, W - 1.8, 0.35, { size: 14, align: "center", i: true, color: GREY });
  src(s, "OPTN/SRTR 2024 Annual Data Report, Table LI 7. " + SRTR);
  return s;
}
usDx(1).addNotes("Share of US adult recipients in 2024 with alcohol-associated liver disease.");
cont(); usDx(2).addNotes("41% of adult recipients, a third with alcohol-associated cirrhosis and 7% with alcohol-associated hepatitis.");
{
  const s = slide("Can patients with ACLF get a liver?");
  bars(s, [
    { name: "Transplanted", labels: ["ACLF-2", "ACLF-3"], values: [10.5, 21] },
    { name: "Declined", labels: ["ACLF-2", "ACLF-3"], values: [73, 88] },
  ], { x: 0.5, y: 1.3, w: 7.0, h: 4.95, max: 100, unit: 25, fmt: '0.#"%"', legend: true, colors: [NAVY, RED], catSize: 18,
    title: "Died within a year" });
  txt(s, "Transplanted: case-fatality, no retransplant. Declined: 1-year mortality", 0.3, 6.3, 7.4, 0.4, { size: 13, align: "center", i: true, color: GREY });
  body(s, [
    "CHANCE: 612 transplanted, 144 declined, 63 centers",
    "Without ACLF: 9% case-fatality at a year after transplant",
    "AASLD 2024: selected patients with ACLF may warrant expedited transplant; palliative care can run alongside the evaluation",
  ], { size: 19, gap: 16, x: 7.8, w: 5.1, y: 1.6, h: 5.1 });
  src(s, "Gustot T, Bernal W, Fernández J, et al. CHANCE. J Hepatol 2026 [PMID: 42822699]. Karvellas CJ et al. Hepatology 2024;79(6):1463-1502, statements 47, 51 [PMID: 37939273]");
  s.addNotes("These are case-fatality numbers, not survival. This was a prospective observational study, not randomized: the transplanted patients were selected. Even so, ACLF-3 did reasonably well after transplant, and most of the declined patients died. The ICU side of this is in my ALF and ACLF lecture.");
}
{
  const s = slide("Who gets exception points?");
  table(s, [
    ["Exception", "Criteria", "Score"],
    ["HCC", { t: [{ t: "1 lesion 2-5 cm, or 2-3 lesions each 1-3 cm", br: true }, { t: "AFP ≤1000 (if >1000, must fall below 500)" }] }, "MELD, then MMaT-3"],
    ["Hepatopulmonary syndrome", "Confirmed HPS, room-air PaO2 <60 mmHg", "MMaT-3"],
    ["Portopulmonary HTN", { t: [{ t: "Before treatment: mPAP ≥35, PVR ≥3 WU", br: true }, { t: "After: mPAP <35, PVR <5; or 35 to <45, PVR <3" }] }, "MMaT-3"],
    ["Colorectal liver metastases", "Non-standard exception, reviewed", "MMaT-20 (floor 15)"],
    ["Intrahepatic cholangiocarcinoma", "Non-standard exception, reviewed", "MMaT-3"],
  ], { x: 0.5, y: 1.5, w: W - 1.0, size: 19, minRowH: 0.78 });
  src(s, "OPTN Policies 9.5.E, 9.5.G, 9.5.I (effective 10/1/2026); OPTN adult MELD exception transplant oncology review guidance");
  s.addNotes("For HCC, the exception starts at the calculated MELD and goes to MMaT minus 3 after the first extension. HPS also needs documented shunting, portal hypertension and no significant primary lung disease. HCC, HPS and PoPH are standard exceptions in policy; the two oncology rows go through the review board under its guidance, in place since February 2025. The old version of this slide had PVR in dynes and no oncology rows.");
}
{
  const s = slide("Can a liver transplant help colorectal metastases?");
  pic(s, "transmet-title.png", 0.5, 1.25, 7.3, 1.4, "Adam R et al. TransMet, Lancet 2024: title block");
  pic(s, "transmet-km.png", 0.5, 2.8, 7.3, 3.95, "TransMet: overall survival, transplant plus chemotherapy vs chemotherapy alone");
  body(s, [
    { t: "20 centers in France, Belgium and Italy, not the US", b: true },
    "94 randomized: age 18-65, BRAF wild-type, primary resected, permanently unresectable liver-only disease responding to chemotherapy",
    "5-year survival (intention to treat): 56.6% with LT plus chemotherapy vs 12.6% with chemotherapy",
    "72% of transplanted patients recurred, mostly in the lungs; almost half of recurrences were resected or ablated",
  ], { size: 17, gap: 12, x: 8.0, w: 4.95, y: 1.4, h: 5.4 });
  src(s, "Adam R, Piedvache C, Chiche L, et al. Lancet 2024;404(10458):1107-18 [PMID: 39306468]");
  s.addNotes("A randomized trial, which is rare in transplant. HR 0.37 (0.21-0.65), p=0.0003. Recurrence is common but often treatable: of 36 transplanted per protocol, 26 recurred, and 12 had the recurrence resected or ablated.");
}
{
  const s = slide("And in the US?");
  bars(s, [{ name: "3-year survival", labels: ["Living donor", "Deceased donor"], values: [74.1, 57.3] }],
    { x: 0.6, y: 1.3, w: 6.6, h: 4.95, max: 100, unit: 25, fmt: '0.0"%"', colors: [NAVY], catSize: 18, title: "3-year survival" });
  txt(s, "Registry comparison, not adjusted", 0.6, 6.3, 6.6, 0.4, { size: 14, align: "center", i: true, color: GREY });
  body(s, [
    "158 transplants for colorectal metastases at 33 US centers, Dec 2017 to Mar 2025",
    "About half from living donors",
    "3-year survival 66.7%, disease-free 44.0%",
    "Exception points by review since Feb 2025",
  ], { size: 19, gap: 16, x: 7.6, w: 5.3, y: 1.6, h: 5.1 });
  src(s, "Chávez-Villa M, Sasaki K, Nakayama T, et al. Liver Transpl 2026;32(4):508-17 [PMID: 41086433]");
  s.addNotes("Half of these were living donor transplants. The donor groups differ in who was selected and in the grafts: 68.2% of the deceased donor livers were out-of-sequence offers. So the bars don't show that the donor type caused the difference. If a patient with colorectal metastases asks about transplant, it's worth a call.");
}
{
  const s = slide("Who can get a transplant for intrahepatic CCA?");
  table(s, [
    ["", "With cirrhosis", "Without cirrhosis"],
    ["Tumor", "Solitary, unresectable, <3 cm", "Unresectable"],
    ["Biopsy", "Required", "Required"],
    ["Before listing", "6 months stable after treatment", "≥6 months stable on systemic therapy"],
    ["Outside the liver", "No disease", "No disease"],
    ["Setting", "Exception points by review (MMaT-3)", "Research protocols only"],
  ], { x: 0.9, y: 1.6, w: W - 1.8, size: 19, minRowH: 0.66 });
  src(s, "Kodali S, Kulik L, D'Allessio A, et al. ILTS-ILCA consensus. Liver Transpl 2025;31(6):815-31 [PMID: 40014003]. " + G1.replace("Dove L et al. AASLD/AST candidate evaluation guideline. ", "Dove L et al. ") + ", statement 11. OPTN transplant oncology review guidance");
  s.addNotes("Cut if running long. Small tumors in cirrhosis, often found on the explant, did well, which is where this started. The guideline says under 3 cm; the OPTN review guidance says 3 cm or less. The treatment before listing can be local or systemic. Once listed, imaging every 3 months has to show no growth and no new tumors.");
}

// ---------------------------------------------------------------- Part 5. Where the livers come from
sec("Where the livers come from");
bgDivider("Where the livers come from", null, "divider-organ-cooler.jpg", "Watercolor of an organ transport cooler on a hospital cart")
  .addNotes("The reason transplant numbers are going up.");
{
  const s = slide("What kinds of donors are there?");
  box(s, W / 2 - 1.5, 1.4, 3.0, 0.7, "Donor livers", { size: 18, b: true, fill: "F2F2F2" });
  box(s, 1.5, 2.65, 4.4, 0.75, "Deceased donor", { size: 18, b: true });
  box(s, W - 5.9, 2.65, 4.4, 0.75, "Living donor", { size: 18, b: true });
  arrow(s, W / 2, 2.1, 3.7, 2.65); arrow(s, W / 2, 2.1, W - 3.7, 2.65);
  const kids = [
    [1.1, "Brain death (DBD)"], [3.8, "Circulatory death (DCD)"],
    [W - 6.4, "Right lobe"], [W - 3.9, "Left lobe or left lateral segment"],
  ];
  kids.forEach(([x, t], i) => {
    const w = i < 2 ? 2.2 : 2.3;
    box(s, x, 4.0, w, 1.0, t, { size: 15 });
    arrow(s, i < 2 ? 3.7 : W - 3.7, 3.4, x + w / 2, 4.0);
  });
  txt(s, "Either can go whole or be split", 0.4, 5.1, 6.4, 0.4, { size: 15, align: "center", i: true, color: GREY });
  txt(s, "DCD: 43% of US deceased donor liver transplants in 2025", 0.4, 5.6, 6.4, 0.9, { size: 17, align: "center" });
  txt(s, "Living donor: 4.5% of US adult liver transplants in 2024", W - 6.4, 5.6, 6.0, 0.9, { size: 17, align: "center" });
  src(s, "Giorgakis E et al. Transpl Int 2026;39:16689 [PMID: 42294094]. " + SRTR);
  s.addNotes("A split liver goes to two recipients, usually an adult and a child. The growth is almost all DCD.");
}
{
  const s = slide("How much has DCD grown?");
  bars(s, [{ name: "DCD share", labels: ["2016", "2025"], values: [7.4, 43.2] }],
    { x: 0.5, y: 1.3, w: 5.4, h: 4.5, max: 50, unit: 10, fmt: '0.0"%"', colors: [NAVY], catSize: 18, title: "DCD share of deceased donor LTs" });
  bars(s, [
    { name: "Pre-MP era", labels: ["NRP", "NMP"], values: [3.0, 2.3] },
    { name: "Machine perfusion era", labels: ["NRP", "NMP"], values: [21.7, 35.6] },
  ], { x: 6.3, y: 1.3, w: 6.6, h: 4.5, max: 40, unit: 10, fmt: '0.0"%"', legend: true, colors: [SLATE, NAVY], catSize: 18, title: "Use of NRP and NMP" });
  txt(s, "Adult DCD recipients: median wait 112 vs 62 days, earlier vs later era" + (PUBLIC ? "" : TUFTS.dcdLine),
    0.9, 6.0, W - 1.8, 0.75, { size: 19, align: "center" });
  src(s, "Giorgakis E, Ziogas IA, Moris D, et al. Transpl Int 2026;39:16689 [PMID: 42294094]" + (PUBLIC ? "" : ". Tufts Medical Center program data"));
  s.addNotes("DCD went from about 1 in 14 deceased donor livers to more than 4 in 10. The paper gives end points and era comparisons, not every year. "
    + "The shorter wait is for adult DCD recipients only, and the paper doesn't show that perfusion caused it. The earlier era already had some perfusion in trials. "
    + "Some of you will have read about the federal review of a Kentucky procurement organization in July 2025. DCD has strict rules: death is declared by a team that has nothing to do with the transplant, and there is a waiting period after the heart stops. That review led HRSA to ask for new national safeguards. The OPTN board approved them in 2026: anyone involved, the family included, can call a pause, and families get a standard set of information. They take effect November 18, 2026, the day of this talk.");
}
{
  const s = slide("Why did DCD livers worry us?");
  pic(s, "nas-etiology.jpg", 0.5, 1.3, 7.3, 5.45, "Causes of non-anastomotic biliary strictures: ischemic, immunologic and bile salt injury, with the peribiliary plexus");
  body(s, [
    "After transplant, the donor bile ducts depend on the hepatic artery, through the peribiliary plexus",
    "Warm ischemia during DCD injures that plexus and the duct lining",
    "Weeks to months later: non-anastomotic strictures, sometimes needing retransplant",
  ], { size: 19, gap: 16, x: 8.1, w: 4.8, y: 1.6, h: 5.1 });
  src(s, "Seehofer D, Eurich D, Veltzke-Schlieker W, Neuhaus P. Am J Transplant 2013;13(2):253-65 [PMID: 23331505]");
  s.addNotes("This is the complication that kept DCD use low for years, and it's what the perfusion machines are meant to prevent.");
}
{
  const s = slide("What does a perfusion machine do?");
  pic(s, "schneeberger-life.png", 0.3, 1.3, 6.9, 3.9, "Cold storage vs normothermic machine perfusion of a donor liver", { left: true });
  pic(s, "jceh-options.jpg", 7.35, 1.3, 5.7, 3.9, "Options for machine perfusion and regional perfusion for DBD and DCD livers");
  body(s, [
    { runs: [{ t: "HOPE: ", b: true }, "cold and oxygenated, usually at the transplant center just before implant"] },
    { runs: [{ t: "NMP: ", b: true }, "warm and blood-based; the liver makes bile and can be assessed before use"] },
    { runs: [{ t: "NRP: ", b: true }, "oxygenated blood flow restored to the donor's abdominal organs after death is declared"] },
  ], { size: 18, gap: 10, y: 5.2, h: 1.65 });
  src(s, "Schneeberger S. Nature 2018;557(7703):40-1 [PMID: 29713063]. J Clin Exp Hepatol 2024;14(2):101309 [PMID: 38274508]");
  s.addNotes("Cold storage just slows metabolism down. The machines either replace oxygen cold or keep the liver working at body temperature, and the warm ones let us see whether the liver works before we commit to it.");
}
{
  const s = slide("What did the trials show?");
  table(s, [
    ["Trial", "Machine", "Main result"],
    ["Nasralla, Nature 2018 (220 LTs)", "NMP", "Peak AST and discard 50% lower"],
    ["PROTECT, JAMA Surg 2022", "NMP (OCS)", { t: [{ t: "EAD 18% vs 31%", br: true }, { t: "Ischemic biliary 2.6% vs 9.9%" }] }],
    ["DHOPE-DCD, NEJM 2021", "DHOPE", { t: [{ t: "Symptomatic NAS 6% vs 18%", br: true }, { t: "at 6 months (RR 0.36)" }] }],
  ], { x: 0.4, y: 1.5, w: 8.0, size: 17, minRowH: 0.8 });
  pic(s, "dhope-fig.png", 8.6, 1.3, 4.45, 3.9, "DHOPE-DCD Figure 1: cumulative incidence of non-anastomotic strictures, machine perfusion vs control");
  txt(s, "The 2025 AASLD/AST and 2024 EASL guidelines both recommend machine perfusion for DCD and extended-criteria livers.",
    0.9, 5.55, W - 1.8, 0.9, { size: 19, align: "center" });
  src(s, "Nasralla D et al. Nature 2018 [PMID: 29670285]. Markmann JF et al. JAMA Surg 2022 [PMID: 34985503]. van Rijn R et al. N Engl J Med 2021 [PMID: 33626248]. Te HS et al. 2026, statements 6-10 [PMID: 40844852]. EASL 2024, p.1062");
  s.addNotes("Nasralla measured graft injury as peak AST. PROTECT's ischemic biliary complications are at 12 months, and it also used 51% of the DCD livers it assessed vs 26% in the control arm. Nasralla's machine kept livers 54% longer. The three trials studied different livers and end points; none compared one machine with another. They are the basis for the guideline recommendations on the line below.");
}
{
  const s = slide("What about living donors?");
  pic(s, "graft-types.jpg", 0.4, 1.3, 7.2, 5.4, "Living donor graft types: right lobe, left lobe and left lateral segment");
  body(s, [
    "4.5% of US adult liver transplants in 2024",
    "Aim for a graft-to-recipient weight ratio of 0.8% or more",
    "Caution above MELD 30",
    "Older recipient age alone doesn't exclude",
    "The benefit starts at low MELD (Jackson 2022)",
  ], { size: 19, gap: 14, x: 7.9, w: 5.0, y: 1.6, h: 5.1 });
  src(s, G1.replace("Dove L et al. AASLD/AST candidate evaluation guideline. ", "Dove L et al. ") + ", statements 50-53. " + SRTR);
  s.addNotes("Adult recipients mostly get a right lobe. The graft size ratio is a planning target, not a hard cutoff. The main message: bring up living donation early, at the first visit.");
}

// ---------------------------------------------------------------- Part 6. Your patient had a transplant
sec("Your patient had a transplant");
bgDivider("Your patient had a transplant", null, "divider-pill-box.jpg", "Watercolor of an open weekly pill organizer and a glass of water")
  .addNotes("For everyone who admits or follows a transplant patient.");
{
  const s = slide("Abnormal liver tests after transplant: what next?");
  body(s, [
    "New or rising liver tests: call transplant hepatology the same day",
    "Look at the timing, the pattern, new drugs and old labs",
    "Doppler ultrasound and a correctly timed tacrolimus trough",
    "Think vascular, biliary, infection, drugs and rejection",
    "The transplant team decides on a biopsy",
  ], { size: 20, gap: 16, x: 0.6, w: 6.6, y: 1.6, h: 5.1 });
  const p = pic(s, "acr-2.jpg", 7.4, 1.35, 5.6, 4.6, "Biopsy showing acute cellular rejection: portal inflammation, bile duct injury and endotheliitis");
  txt(s, "Acute cellular rejection", p.x, p.y + p.h + 0.08, p.w, 0.4, { size: 15, align: "center", i: true, color: GREY });
  src(s, G2 + ", statement 34. Histology: Liver Fellow Network");
  s.addNotes("The guideline has no numbered algorithm for abnormal tests; statement 34 covers the biopsy, and the rest is our practice. Rejection is one cause among several, so please call us before giving steroids.");
}
{
  const s = slide("MRCP or ERCP for a suspected stricture?");
  titleBlock(s, "asge-title.png", 1.3, 1.25, "ASGE guideline on post-liver transplant biliary strictures 2023", 6.4);
  table(s, [
    ["Situation", "Next step"],
    ["Suspected stricture", { t: "MRCP first (strong)", b: true }],
    ["High suspicion, or intervention likely", "ERCP directly (weak)"],
    ["Normal MRCP, picture still fits", "ERCP (weak)"],
    ["Progressive ischemic cholangiopathy", "Consider retransplant"],
  ], { x: 1.6, y: 2.9, w: W - 3.2, size: 19, minRowH: 0.62 });
  src(s, G2 + ", statements 15, 16, 24. Kohli DR et al. ASGE guideline. Gastrointest Endosc 2023;97(4):607-14 [PMID: 36797162]");
  s.addNotes("The ASGE guideline lands in the same place: MRCP when the diagnosis is unclear, ERCP when you expect to treat.");
}
{
  const s = slide("Which drugs change tacrolimus levels?");
  table(s, [
    ["Raise levels (toxicity)", "Lower levels (rejection)"],
    ["Fluconazole, voriconazole, posaconazole", "Rifampin"],
    ["Clarithromycin, erythromycin", "Phenytoin, carbamazepine"],
    ["Diltiazem, verapamil", "Phenobarbital"],
    ["Nirmatrelvir/ritonavir (Paxlovid)", "St John's wort"],
    ["Ritonavir- or cobicistat-boosted HIV drugs", ""],
    ["Grapefruit, cannabidiol (CBD)", ""],
  ], { x: 0.9, y: 1.4, w: W - 1.8, size: 20, minRowH: 0.6, noLabel: true });
  txt(s, "Starting or stopping a drug, or the patient can't take pills: call transplant pharmacy or hepatology for a plan.", 0.9, 5.85, W - 1.8, 0.8, { size: 19, align: "center", i: true });
  src(s, "Tacrolimus (Prograf) prescribing information. " + G3);
  s.addNotes("This is the slide to photograph. Any new drug in a transplant patient, check it against tacrolimus, and stopping a drug matters as much as starting one. Nirmatrelvir/ritonavir is a common one now: it can push levels very high within days. No herbal supplements without asking the transplant team, and no grapefruit (statements 2-3).");
}
{
  const s = slide("What does the primary care doctor need to do?");
  table(s, [
    ["", "2025 guideline", "Statement"],
    ["Screening", "BP, weight, glucose and lipids every year", "53"],
    ["Type 2 diabetes", "Metformin; GLP-1 RA or SGLT2i first if high CV, HF or CKD risk", "58-59"],
    ["Hypertension", "Amlodipine or felodipine; ACEi or ARB if CVD or CKD", "60-61"],
    ["Lipids", "Hydrophilic statin first", "62"],
    ["Obesity", "GLP-1 RA if diet and exercise aren't enough", "64"],
    ["CKD", "Consider nephrology at stage 4", "76, 79, 82"],
  ], { x: 0.5, y: 1.5, w: W - 1.0, size: 20, minRowH: 0.72 });
  src(s, G3);
  s.addNotes("After the first year, the long-term problems are cardiovascular disease, kidney disease, cancer and the side effects of immunosuppression, more than the graft. For CKD the transplant team lowers tacrolimus; please don't stop it.");
}
{
  const s = slide("What else does the primary care doctor need to do?");
  table(s, [
    ["", "2025 guideline", "Statement"],
    ["Cancer", "Age-appropriate screening; skin exam every year", "44-45"],
    ["Vaccines", "ACIP schedule for immunocompromised adults; no live vaccines", "19-20"],
    ["Alcohol", "None, whatever the original liver disease", "9"],
    ["Elective surgery", "At least 3 months after LT, with stable graft function", "83-84"],
    ["Pregnancy", "Wait a year, with 6 months of stable graft function", "24, 26"],
  ], { x: 0.5, y: 1.5, w: W - 1.0, size: 20, minRowH: 0.8 });
  src(s, G3);
  s.addNotes("Skin cancer is the most common cancer after transplant. Mycophenolate has to be stopped 6 weeks before conception in women and 90 days in men. The transplant team manages immunosuppression around surgery. The guideline also covers bone health and a yearly check for depression and alcohol use.");
}
{
  const s = slide("Take-home points");
  pic(s, "lighthouse-spot.jpg", 7.55, 2.2, 5.55, 3.8, "Watercolor of a lighthouse on a rocky Maine shore");
  body(s, [
    "Refer after any decompensating event. Without one, a low MELD isn't a reason to wait if the score misses how sick the patient is",
    "Acute liver failure or ACLF: call the same day",
    "Recent drinking calls for assessment and treatment, not an automatic no",
    "Colorectal metastases and selected cholangiocarcinoma are worth a call",
    "After transplant, abnormal liver tests mean a call to transplant hepatology the same day",
    "Check every new drug against tacrolimus",
  ], { size: 19, gap: 12, x: 0.5, w: 6.9, y: 1.4, h: 5.45 });
  src(s, "AASLD/AST guidelines: candidate evaluation [PMID: 41405234], graft complications [PMID: 40844852], non-graft complications [PMID: 41405235]");
}
{
  const s = slide(null, { master: "BLANK" });
  s.addImage({ path: path.join(IMG, "cover-coast-road.jpg"), x: -0.05, y: 0, w: 13.43, h: 7.5, altText: "Watercolor of a coastal road in Maine running south toward a distant city" });
  s.addText("Questions?", { x: 0.6, y: 2.8, w: 6.0, h: 1.4, fontFace: "Georgia", fontSize: 54, align: "center",
    valign: "middle", color: "000000", isTextBox: true, margin: 0 });
}
endMain();

// ---------------------------------------------------------------- Appendix
sec("Appendix");
const SOURCES = [
  [
    "AASLD/AST candidate evaluation guideline. Hepatology 2026 [PMID: 41405234]",
    "AASLD/AST graft-related complications guideline. Liver Transpl 2026 [PMID: 40844852]",
    "AASLD/AST non-graft complications guideline. Liver Transpl 2026 [PMID: 41405235]",
    "EASL CPG on liver transplantation. J Hepatol 2024 [PMID: 39487043]",
    "ACG alcohol-associated liver disease guideline. Am J Gastroenterol 2024 [PMID: 38174913]",
    "ACG acute liver failure guideline. Am J Gastroenterol 2023 [PMID: 37377263]",
    "AASLD ACLF and critically ill cirrhosis guidance. Hepatology 2024 [PMID: 37939273]",
    "Lai JC et al. Frailty and sarcopenia guidance. Hepatology 2021 [PMID: 34233031]",
    "Kodali S et al. ILTS-ILCA iCCA consensus. Liver Transpl 2025 [PMID: 40014003]",
    "OPTN Policy 9 (effective 10/1/2026) and transplant oncology review guidance",
    "OPTN/SRTR Annual Data Reports, Liver, 2020-2024 [PMIDs: 35266621, 37132348, 38431359, 39947804, 42276697]",
  ],
  [
    "Zarrinpar A, Busuttil RW. Nat Rev Gastroenterol Hepatol 2013 [PMID: 23752825]",
    "Starzl TE et al. Homotransplantation of the liver in humans. Surg Gynecol Obstet 1963 [PMID: 14100514]",
    "Malinchoc M et al. Hepatology 2000 [PMID: 10733541]; Kamath PS et al. Hepatology 2001 [PMID: 11172350]",
    "Kim WR et al. MELD 3.0. Gastroenterology 2021 [PMID: 34481845]",
    "Tanaka T et al. MELD 3.0 and sex disparities. Hepatology 2026 [PMID: 41100798]",
    "Di Napoli M et al. Front Transplant 2026 [PMID: 42266471]",
    "Merion RM et al. Survival benefit of LT. Am J Transplant 2005 [PMID: 15643990]",
    "Perkins JD et al. LT at MELD ≤14, decision analysis. Liver Transpl 2009 [PMID: 19177441]",
    "Jackson WE et al. Living donor LT benefit. JAMA Surg 2022 [PMID: 35921119]",
    "Mathurin P et al. Early LT for alcoholic hepatitis. N Engl J Med 2011 [PMID: 22070476]",
    "Lee BP et al. ACCELERATE-AH. Gastroenterology 2018 [PMID: 29655837]",
    "Dukewich M et al. Early LT for AH, 5-year outcomes. Am J Gastroenterol 2025 [PMID: 38994850]",
  ],
  [
    "Louvet A et al. QuickTrans. Lancet Gastroenterol Hepatol 2022 [PMID: 35202597]",
    "Gustot T et al. CHANCE. J Hepatol 2026 [PMID: 42822699]",
    "Adam R et al. TransMet. Lancet 2024 [PMID: 39306468]",
    "Chávez-Villa M et al. LT for colorectal metastases in the US. Liver Transpl 2026 [PMID: 41086433]",
    "Giorgakis E et al. DCD and machine perfusion in the US. Transpl Int 2026 [PMID: 42294094]",
    "Seehofer D et al. Non-anastomotic strictures. Am J Transplant 2013 [PMID: 23331505]",
    "Schneeberger S. Nature 2018 [PMID: 29713063]; J Clin Exp Hepatol 2024 [PMID: 38274508]",
    "Nasralla D et al. Nature 2018 [PMID: 29670285]; Markmann JF et al. PROTECT. JAMA Surg 2022 [PMID: 34985503]",
    "van Rijn R et al. DHOPE-DCD. N Engl J Med 2021 [PMID: 33626248]",
    "Kohli DR et al. ASGE post-LT biliary strictures. Gastrointest Endosc 2023 [PMID: 36797162]",
    "Tacrolimus (Prograf) prescribing information",
    "The New York Times, March 5, 2017 (Starzl obituary)",
  ],
];
SOURCES.forEach((list, i) => {
  const s = slide(`Appendix: sources (${i + 1})`);
  body(s, list, { size: 16, gap: 5, y: 1.35, h: 5.5 });
});

(async () => {
  addSlideNumbers();
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
