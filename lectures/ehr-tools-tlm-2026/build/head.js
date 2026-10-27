// Builds "Epically Efficient EHR Tools" (TLM 2026) in the style of Mohammad Almeqdadi's decks. Not for the public repo.
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
pres.title = "Epically Efficient Electronic Health Record Tools to Improve Your Practice";

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

