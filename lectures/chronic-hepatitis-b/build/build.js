// Builds "Chronic Hepatitis B" in the style of Mohammad Almeqdadi's existing decks.
// Default is the 60-minute version. SHORT=1 builds the 30-minute version: slides inside ext(() => {...}) are left out.
const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");
const { applyTheme } = require(process.env.SKILL + "/scripts/apply_theme.js");

const OUT = process.argv[2];
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
pres.title = "Chronic Hepatitis B";

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
  const shortFirst = o.noLabel !== false && meas.every((r) => !r[0] || r[0].every((ln) => ln.map((x) => x.t).join("").length <= 16));
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
    // a first column of short values (signs, panel names, test names) is centered like the rest
    const label = ci === 0 && !o.noLabel && !shortFirst;
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
    valAxisMinVal: o.min != null ? o.min : 0, valAxisMaxVal: o.max != null ? o.max : 100, valAxisMajorUnit: o.unit || 25,
    valAxisLabelFormatCode: o.valFmt || '0"%"', valAxisHidden: !!o.hideVal,
    valGridLine: { color: "E3E3E3", size: 0.5 }, catGridLine: { style: "none" },
    catAxisLabelFontFace: TBL_FONT, valAxisLabelFontFace: TBL_FONT, catAxisLabelFontSize: o.catSize || 15, valAxisLabelFontSize: 12,
    catAxisLabelColor: "000000", valAxisLabelColor: GREY,
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: o.fmt || '0"%"', dataLabelFontSize: o.labSize || 16,
    dataLabelFontFace: TBL_FONT, dataLabelColor: "000000", dataLabelFontBold: true,
    showLegend: !!o.legend, legendPos: "b", legendFontFace: TBL_FONT, legendFontSize: 14,
    showTitle: !!o.title, title: o.title, titleFontFace: "Georgia", titleFontSize: 16, titleColor: "000000",
    catAxisLabelPos: o.catPos || "nextTo",
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

const ext = (fn) => { if (!SHORT) fn(); };
const CAP = (s, t, x, y, w) => s.addText(t, { x, y, w, h: 0.5, fontFace: "Georgia", fontSize: 15, italic: true, align: "center", color: GREY, isTextBox: true, margin: 0 });

const NAVY = "1F4E79", SLATE = "9DB4CA", TEAL = "2E7D8C", OCHRE = "C08A3E";

// Stand-in for a screenshot that still has to come from the paper itself
function holder(s, x, y, w, h, text) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: "FFFFFF" }, line: { color: "A6A6A6", width: 1, dashType: "dash" }, objectName: "Placeholder" });
  s.addText(text, { x, y, w, h, fontFace: "Georgia", fontSize: 16, italic: true, align: "center", valign: "middle", color: "7F7F7F", isTextBox: true, margin: 10 });
  console.warn("placeholder: slide " + NUMBERED.length + ": " + text.slice(0, 60));
}

// Horizontal timeline: items [{ y: "1965", t: "text" }], evenly spaced
function timeline(s, items, y0, x0 = 0.9, x1 = W - 0.9, size = 17) {
  const n = items.length, step = (x1 - x0) / n;
  s.addShape(pres.shapes.LINE, { x: x0, y: y0, w: x1 - x0, h: 0, line: { color: "595959", width: 2 } });
  items.forEach((it, i) => {
    const cx = x0 + step * (i + 0.5);
    s.addShape(pres.shapes.OVAL, { x: cx - 0.09, y: y0 - 0.09, w: 0.18, h: 0.18, fill: { color: NAVY }, line: { color: NAVY, width: 1 } });
    s.addText(it.y, { x: cx - step / 2, y: y0 - 0.85, w: step, h: 0.6, fontFace: "Georgia", fontSize: 28, bold: true, align: "center", valign: "bottom", color: "000000", isTextBox: true, margin: 0 });
    s.addText(it.t, { x: cx - step / 2 + 0.08, y: y0 + 0.3, w: step - 0.16, h: 3.4, fontFace: "Georgia", fontSize: size, align: "center", valign: "top", color: "000000", isTextBox: true, margin: 0 });
  });
}

// Bars drawn as shapes so a reveal can add bars without moving anything. items: { label, v, show, color, text }
function vbars(s, items, o) {
  const { x, y, w, h, max } = o;
  const n = items.length, slot = w / n, bw = Math.min(1.6, slot * 0.55);
  s.addShape(pres.shapes.LINE, { x, y: y + h, w, h: 0, line: { color: "595959", width: 1.5 } });
  items.forEach((it, i) => {
    const cx = x + slot * (i + 0.5);
    const bh = (h * it.v) / max;
    if (it.show !== false) {
      s.addShape(pres.shapes.RECTANGLE, { x: cx - bw / 2, y: y + h - bh, w: bw, h: bh, fill: { color: it.color || NAVY }, line: { color: it.color || NAVY, width: 0.5 } });
      s.addText(it.text || `${it.v}%`, { x: cx - slot / 2, y: y + h - bh - 0.5, w: slot, h: 0.45, fontFace: "Calibri", fontSize: 22, bold: true, align: "center", valign: "bottom", color: it.red ? RED : "000000", isTextBox: true, margin: 0 });
    }
    s.addText(it.label, { x: cx - slot / 2 + 0.05, y: y + h + 0.08, w: slot - 0.1, h: 0.8, fontFace: "Calibri", fontSize: 18, align: "center", valign: "top", color: "000000", isTextBox: true, margin: 0 });
  });
}

// Time axis with bars: o.ticks = labels evenly spaced, rows = [{ label, from, to, fill, text, show }] in tick units
function gantt(s, o) {
  const lx = o.x, lw = o.labelW || 3.2, ax = lx + lw, aw = o.w - lw, n = o.ticks.length, step = aw / (n - 1);
  const rh = o.rowH || 0.75;
  o.ticks.forEach((t, i) => {
    const tx = ax + step * i;
    s.addShape(pres.shapes.LINE, { x: tx, y: o.y, w: 0, h: rh * o.rows.length + 0.1, line: { color: "D9D9D9", width: 0.75 } });
    s.addText(t, { x: tx - step / 2, y: o.y + rh * o.rows.length + 0.15, w: step, h: 0.4, fontFace: "Calibri", fontSize: 16, align: "center", color: "595959", isTextBox: true, margin: 0 });
  });
  o.rows.forEach((r, i) => {
    const ry = o.y + i * rh + 0.08;
    s.addText(r.label, { x: lx, y: ry, w: lw - 0.15, h: rh - 0.16, fontFace: "Georgia", fontSize: 16, align: "right", valign: "middle", color: "000000", isTextBox: true, margin: 0 });
    if (r.show === false) return;
    const bx = ax + step * r.from, bw = Math.max(0.12, step * (r.to - r.from));
    s.addShape(pres.shapes.RECTANGLE, { x: bx, y: ry, w: bw, h: rh - 0.16, fill: { color: r.fill || NAVY }, line: { color: r.fill || NAVY, width: 0.5 } });
    if (r.text) s.addText(r.text, { x: bx, y: ry, w: Math.max(bw, 2.2), h: rh - 0.16, fontFace: "Calibri", fontSize: 15, bold: true, align: bw < 2.2 ? "left" : "center", valign: "middle", color: r.dark ? "000000" : "FFFFFF", isTextBox: true, margin: bw < 2.2 ? [0, 0, 0, bw + 0.08] : 0 });
  });
}

// A table slide: title, table, optional question and source
function tableSlide(title, rows, o, notes, source) {
  const s = slide(title);
  const t = table(s, rows, { x: 0.8, y: o.y || 1.5, w: W - 1.6, size: o.size || 20, ...o.tbl });
  if (o.after) o.after(s, t);
  if (source) src(s, source);
  s.addNotes(notes);
  return s;
}

const COVER = path.join(IMG, "cover-chb.jpg");
const HAS_COVER = fs.existsSync(COVER);
// Summary-slide flowchart pieces. kind: q (grey question box), treat (navy), decide (slate), watch (white), cond (plain condition)
function fbox(s, text, x, y, w, h, kind = "cond", size = 17) {
  const st = {
    q: { fill: "F2F2F2", line: "7F7F7F", color: "000000", b: true },
    treat: { fill: NAVY, line: NAVY, color: "FFFFFF", b: true },
    decide: { fill: SLATE, line: SLATE, color: "000000", b: true },
    watch: { fill: "FFFFFF", line: "595959", color: "000000", b: true },
    cond: { fill: "FFFFFF", line: "BFBFBF", color: "000000", b: false },
  }[kind];
  s.addText(text, { shape: pres.shapes.RECTANGLE, x, y, w, h, fill: { color: st.fill }, line: { color: st.line, width: 1 },
    fontFace: TBL_FONT, fontSize: size, bold: st.b, color: st.color, align: "center", valign: "middle", margin: 4 });
}
// Straight arrow, horizontal or vertical
function farrow(s, x1, y1, x2, y2, label) {
  s.addShape(pres.shapes.LINE, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1),
    flipH: x2 < x1, flipV: y2 < y1, line: { color: "595959", width: 1.5, endArrowType: "triangle" } });
  if (label) s.addText(label, { x: Math.min(x1, x2), y: Math.min(y1, y2) - 0.32, w: Math.max(Math.abs(x2 - x1), 0.6), h: 0.3,
    fontFace: TBL_FONT, fontSize: 14, bold: true, align: "center", color: GREY, isTextBox: true, margin: 0 });
}
function fline(s, x1, y1, x2, y2) {
  s.addShape(pres.shapes.LINE, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1), line: { color: "595959", width: 1.5 } });
}
// Audience question with four options; the answer is highlighted on the second step
function mcq(title, question, opts, correct, img, notes, source) {
  return twoStep((step) => {
    const s = slide(title);
    const tw = img ? 7.5 : W - 1.8;
    s.addText(question, { x: 0.6, y: 1.25, w: tw, h: 1.0, fontFace: "Georgia", fontSize: 24, bold: true, valign: "middle", color: "000000", isTextBox: true, margin: 0 });
    opts.forEach((o, i) => {
      const hit = step === 2 && i === correct;
      s.addText([{ text: "ABCD"[i] + ".  " + o, options: { highlight: hit ? HL : undefined, bold: hit } }],
        { x: 0.8, y: 2.55 + i * 0.95, w: tw - 0.2, h: 0.8, fontFace: "Georgia", fontSize: 22, valign: "middle", color: "000000", isTextBox: true, margin: 0 });
    });
    if (img) pic(s, img.file, 8.3, 1.2, 4.8, 5.7, img.alt);
    if (source) src(s, source);
    s.addNotes(notes);
    return s;
  });
}
// Forest plot drawn as shapes. rows: { label, hr, lo, hi }; linear axis from o.min to o.max
function forest(s, rows, o) {
  const ax = o.x + o.labelW, aw = o.w - o.labelW, X = (v) => ax + ((v - o.min) / (o.max - o.min)) * aw;
  const rh = o.rowH || 0.9, y1 = o.y + rh * rows.length;
  s.addShape(pres.shapes.LINE, { x: X(1), y: o.y - 0.1, w: 0, h: y1 - o.y + 0.2, line: { color: "7F7F7F", width: 1, dashType: "dash" } });
  s.addShape(pres.shapes.LINE, { x: ax, y: y1 + 0.1, w: aw, h: 0, line: { color: "595959", width: 1 } });
  o.ticks.forEach((v) => s.addText(String(v), { x: X(v) - 0.4, y: y1 + 0.15, w: 0.8, h: 0.3, fontFace: TBL_FONT, fontSize: 14, align: "center", color: GREY, isTextBox: true, margin: 0 }));
  if (o.axisL) s.addText(o.axisL, { x: ax, y: y1 + 0.5, w: X(1) - ax, h: 0.35, fontFace: TBL_FONT, fontSize: 14, align: "center", color: GREY, isTextBox: true, margin: 0 });
  if (o.axisR) s.addText(o.axisR, { x: X(1), y: y1 + 0.5, w: ax + aw - X(1), h: 0.35, fontFace: TBL_FONT, fontSize: 14, align: "center", color: GREY, isTextBox: true, margin: 0 });
  rows.forEach((r, i) => {
    const cy = o.y + rh * (i + 0.5);
    s.addText(r.label, { x: o.x, y: cy - rh / 2, w: o.labelW - 0.2, h: rh, fontFace: TBL_FONT, fontSize: 17, align: "right", valign: "middle", color: "000000", isTextBox: true, margin: 0 });
    s.addShape(pres.shapes.LINE, { x: X(r.lo), y: cy, w: X(r.hi) - X(r.lo), h: 0, line: { color: NAVY, width: 2.5 } });
    s.addShape(pres.shapes.RECTANGLE, { x: X(r.hr) - 0.11, y: cy - 0.11, w: 0.22, h: 0.22, fill: { color: NAVY }, line: { color: NAVY, width: 1 } });
    s.addText(`${r.hr.toFixed(2)} (${r.lo.toFixed(2)} to ${r.hi.toFixed(2)})`, { x: ax + aw + 0.15, y: cy - 0.25, w: 2.6, h: 0.5, fontFace: TBL_FONT, fontSize: 16, valign: "middle", color: "000000", isTextBox: true, margin: 0 });
  });
}

const QR_PDF = SHORT ? "qr-slides-30.png" : "qr-slides-60.png";

// ---------------------------------------------------------------- Cover
sec("Opening");
{
  const s = pres.addSlide({ masterName: "BLANK", sectionTitle: section });
  if (HAS_COVER) s.addImage({ path: COVER, x: -0.05, y: 0, w: 13.43, h: 7.5, altText: "Watercolor cover illustration" });
  const tx = HAS_COVER ? 7.1 : 2.4, tw = HAS_COVER ? W - 7.1 - 0.45 : W - 4.8;
  s.addText("Chronic Hepatitis B", { x: tx, y: 1.75, w: tw, h: 1.45, fontFace: "Georgia", fontSize: 44, bold: true, align: "center", valign: "middle", color: "000000", isTextBox: true, margin: 0 });
  s.addShape(pres.shapes.LINE, { x: tx + 1.2, y: 3.6, w: tw - 2.4, h: 0, line: { color: "A6A6A6", width: 1 } });
  s.addText([
    { text: "Mohammad Almeqdadi, MD", options: { bold: true, fontSize: 20, breakLine: true } },
    { text: "Transplant Hepatologist and Gastroenterologist", options: { fontSize: 16, breakLine: true } },
    { text: "Assistant Professor of Medicine and Surgery", options: { fontSize: 16, breakLine: true } },
    { text: "X: @mfalmeqdadi", options: { fontSize: 16, color: "595959" } },
  ], { x: tx, y: 4.0, w: tw, h: 1.6, fontFace: "Georgia", align: "center", valign: "top", color: "000000", isTextBox: true, margin: 0, paraSpaceAfter: 4 });
  s.addImage({ path: LOGO_IMG, x: HAS_COVER ? tx + 0.15 : tx + (tw - 3.79) / 2, y: 5.85, w: 3.79, h: 0.77, altText: "Tufts University School of Medicine" });
  s.addImage({ path: path.join(IMG, QR_PDF), x: W - 1.7, y: 5.3, w: 1.3, h: 1.3, altText: "QR code linking to the slides PDF" });
  s.addText("Slides (PDF)", { x: W - 1.83, y: 6.65, w: 1.55, h: 0.3, fontFace: "Georgia", fontSize: 11, align: "center", color: "595959", isTextBox: true, margin: 0 });
  if (HAS_COVER) s.addText("Illustrations generated with Google Gemini", { x: 0.4, y: 7.0, w: 5, h: 0.3, fontFace: "Georgia", fontSize: 11, italic: true, color: "7F7F7F", isTextBox: true, margin: 0 });
  s.addNotes("Everything in the cases is made up for teaching; none of it is a real patient. Three patients carry the talk: a man we follow from age 34 to 57, a woman about to start rituximab, and a pregnant woman.");
}

// ---------------------------------------------------------------- Objectives
{
  const s = slide("Objectives");
  body(s, [{ t: "By the end of this talk you should be able to:", nb: true, i: true }], { x: 0.7, w: 7.6, y: 1.35, h: 0.5, size: 22 });
  body(s, [
    "Read a hepatitis B serology panel",
    "Place a patient in the right phase",
    "Decide who to treat, using the current guidelines",
    "Estimate HCC risk and set up surveillance",
    "Prevent reactivation and transmission to the baby",
  ], { size: 22, gap: 12, x: 0.7, w: 7.4, y: 2.05, h: 4.8 });
  pic(s, "blood-tubes.png", 8.3, 1.2, 4.8, 5.7, "Watercolor of blood collection tubes in a rack");
  s.addNotes("Several of the recommendations changed in the last two years: AASLD/IDSA 2025, EASL 2025, WHO 2024. Where the guidelines disagree I show them side by side.");
}

// ---------------------------------------------------------------- History
sec("History");
{
  const s = slide("The Australia antigen");
  pic(s, "blumberg-title.png", 0.6, 1.3, 7.3, 2.6, "Title and summary of Blumberg, Alter and Visnich, JAMA 1965", { left: true });
  pic(s, "blumberg-1963.png", 0.6, 4.15, 7.3, 2.1, "Paragraph describing the serum from an Australian aborigine", { left: true });
  body(s, [
    "Found in the serum of some normal people from foreign populations, and in none of the normal US subjects",
    "Frequent in acute leukemia, which is why the paper is about leukemia",
    "Blumberg shared the 1976 Nobel Prize with Carleton Gajdusek",
  ], { x: 8.2, y: 1.7, w: 4.7, size: 21, gap: 16 });
  src(s, "Blumberg BS, Alter HJ, Visnich S. JAMA 1965;191:541-546. PMID 14239025.");
  s.addNotes("Tell the story the way you like to. In 1963 the Philadelphia group tested sera from transfused hemophilia patients against a panel of 24 normal sera, including sera from foreign populations. Two hemophilia sera made a precipitin line with one panel serum, from an Australian aborigine. That is where the name comes from. The 1965 paper was about leukemia; the link to hepatitis came later. The Nobel citation reads: 'for their discoveries concerning new mechanisms for the origin and dissemination of infectious diseases' (NIH Nobel page). Then one sentence for the rest: Dane saw the virus particle in 1970, Maupas gave the first plasma-derived vaccine in 1976, Szmuness proved it worked in 1980, and Beasley tied the carrier state to liver cancer in 1981. A vaccine against a cancer came before any cancer screening test.");
}
ext(() => {
  {
    const s = slide("Prince, 1968");
    pic(s, "prince-title.png", 1.2, 1.35, W - 2.4, 4.5, "Title and first paragraph of Prince, PNAS 1968");
    body(s, ["Okochi and Murakami reported the antigen in Japanese the same year"], { x: 1.2, y: 6.0, w: W - 2.4, h: 0.7, size: 20 });
    src(s, "Prince AM. PNAS 1968;60:814-821, PMID 4970112. Okochi K, Murakami S. Vox Sang 1968;15:374-385, PMID 5749015.");
    s.addNotes("Prince detected the antigen in blood during the incubation period of serum hepatitis, which tied it to post-transfusion hepatitis and made screening of blood possible.");
  }
  {
    const s = slide("Dane, 1970");
    pic(s, "dane-title.png", 0.6, 1.4, 6.3, 5.2, "Title and summary of Dane, Cameron and Briggs, Lancet 1970");
    pic(s, "dane-fig1.png", 7.3, 1.3, 5.5, 5.5, "Electron micrograph, Figure 1 of the paper");
    src(s, "Dane DS, Cameron CH, Briggs M. Lancet 1970;1:695-698. PMID 4190997.");
    s.addNotes("The 42 nm particle is the whole virion; the numerous 22 nm particles and long forms are surface antigen only. This is why HBsAg circulates in huge excess over virions.");
  }
  {
    const s = slide("Szmuness, 1980");
    pic(s, "szmuness-title.png", 0.5, 1.3, 8.0, 5.5, "Title and abstract of Szmuness et al., NEJM 1980", { left: true });
    s.addText([{ text: "Infected", options: { fontSize: 22, breakLine: true } },
      { text: "1.4 to 3.4%", options: { fontSize: 40, bold: true, color: NAVY, breakLine: true } }, { text: "vaccine", options: { fontSize: 20, color: GREY, breakLine: true } },
      { text: " ", options: { fontSize: 14, breakLine: true } },
      { text: "18 to 27%", options: { fontSize: 40, bold: true, color: RED, breakLine: true } }, { text: "placebo", options: { fontSize: 20, color: GREY } }],
      { x: 8.8, y: 1.6, w: 4.2, h: 4.6, fontFace: "Georgia", align: "center", valign: "middle", color: "000000", isTextBox: true, margin: 0 });
    src(s, "Szmuness W et al. N Engl J Med 1980;303:833-841. PMID 6997738.");
    s.addNotes("Randomized, double-blind, placebo-controlled, 1,083 men at high risk. Infection in only 1.4 to 3.4% of vaccinees versus 18 to 27% with placebo. The plasma-derived vaccine of Maupas (Lancet 1976) was the first human immunization; a recombinant yeast vaccine followed (McAleer, Nature 1984). Say 'licensed in the mid-1980s'.");
  }
  {
    const s = slide("Beasley, Taiwan, 1981");
    pic(s, "beasley-title.png", 0.6, 1.35, 6.6, 5.4, "Title and summary of Beasley et al., Lancet 1981", { left: true });
    table(s, [["", "HBsAg carriers", "Non-carriers"],
      ["HCC per 100,000 person-years", "1,158", "5"],
      ["Deaths from HCC or cirrhosis", "54.3% of 105", "1.5% of 202"]],
      { x: 7.5, y: 2.2, w: 5.4, size: 17 });
    s.addText("Relative risk 223", { x: 7.5, y: 4.4, w: 5.4, h: 0.6, fontFace: "Georgia", fontSize: 24, bold: true, align: "center", isTextBox: true, margin: 0 });
    src(s, "Beasley RP et al. Lancet 1981;2:1129-1133. PMID 6118576.");
    s.addNotes("22,707 Chinese men, civil servants in Taiwan, followed prospectively. The 95% CI of 28 to 1,479 for the relative risk is quoted from a 2018 historical review (Koshiol, Cancer Epidemiol), not from the 1981 paper.");
  }
});

// ---------------------------------------------------------------- Burden and testing
sec("Testing");
twoStep((step) => {
  const s = slide("Hepatitis B worldwide");
  q(s, "How many people with chronic hepatitis B know it?", 1.3, { size: 26 });
  vbars(s, [
    { label: "Living with chronic hepatitis B (254 million)", v: 100, text: "100%", color: SLATE },
    { label: "Diagnosed", v: 13, show: step === 2, text: "13%", color: NAVY },
    { label: step === 2 ? "Treated (about 7 million)" : "Treated", v: 3, show: step === 2, text: "3%", color: NAVY, red: true },
  ], { x: 2.2, y: 2.4, w: W - 4.4, h: 3.5, max: 100 });
  src(s, "WHO news release 9 April 2024 (2022 estimates), rounded. WHO Global hepatitis report 2024.");
  s.addNotes("Let them guess. Answer: about 13% diagnosed and about 3% treated. WHO 2022 estimates: 254 million living with chronic HBV, 1.2 million new infections a year, 1.3 million deaths from HBV and HCV combined, 83% of them HBV. In the US, CDC estimates 580,000 to 2.4 million people living with chronic HBV, about two-thirds unaware (CDC 2023, PMID 36893044).");
  return s;
});
ext(() => {
  twoStep((step) => {
    const s = slide("Who becomes chronic?");
    q(s, "How often does infection become chronic, by age at infection?", 1.3, { size: 24 });
    vbars(s, [
      { label: "Infected at birth", v: 90, show: step === 2, text: "About 90%", color: NAVY },
      { label: "Infected at age 1 to 4", v: 30, show: step === 2, text: "About 30%", color: NAVY },
      { label: "Infected as an adult", v: 5, show: step === 2, text: "Under 5%", color: NAVY },
    ], { x: 2.2, y: 2.4, w: W - 4.4, h: 3.5, max: 100 });
    src(s, "WHO guidelines for chronic hepatitis B, 2024. CDC perinatal hepatitis B overview, 2025.");
    s.addNotes("Conditional risk once infected, not the risk that an exposed infant becomes infected. The bar for adults is drawn at 5% for scale; the figure is 'under 5%'.");
    return s;
  });
});
twoStep((step) => {
  const s = slide("Screening an adult for hepatitis B");
  q(s, "Which three tests make up the screening panel?", 1.3, { size: 24 });
  table(s, [["Question", "Test"],
    ["Is there a current infection?", ans(step, "HBsAg")],
    ["Is the patient immune?", ans(step, "Anti-HBs")],
    ["Has the patient ever been exposed?", ans(step, "Total anti-HBc")]],
    { x: 1.6, y: 2.2, w: W - 3.2, size: 24, minRowH: 0.85 });
  if (step === 2) {
    q(s, "Once for every adult 18 and older, and in every pregnancy", 5.5, { size: 22, hl: true, h: 0.55 });
    q(s, "HBsAg positive: test anti-HDV once", 6.15, { size: 22, hl: true, h: 0.55 });
  }
  src(s, "CDC recommendations, MMWR Recomm Rep 2023;72(1):1-25, PMID 36893044. Anti-HDV: EASL 2025, PMID 40348683.");
  s.addNotes("CDC 2023: screen every adult 18 and older at least once with the triple panel, regardless of disclosed risk, and screen in each pregnancy. HBsAg alone misses anti-HBc-only patients, who are the ones at risk of reactivation. Vaccination: all adults 19 to 59 (ACIP 2022); Heplisav-B, Engerix-B and Recombivax HB are in use. PreHevbrio was withdrawn in November 2024 because the company closed, not for safety. Hepatitis D: EASL 2025 tests every HBsAg-positive patient once with total anti-HDV, then HDV RNA if positive; AASLD 2018 tests by risk. A nucleos(t)ide analogue does not treat HDV. Bulevirtide got FDA accelerated approval on 22 May 2026.");
  return s;
});

// ---------------------------------------------------------------- Serology
sec("Serology");
twoStep((step) => {
  const s = slide("Five panels");
  q(s, "What does each panel mean?", 1.25, { size: 24 });
  table(s, [["", "HBsAg", "Total anti-HBc", "IgM anti-HBc", "Anti-HBs", "Interpretation"],
    ["Panel 1", "–", "–", "–", "–", ans(step, "Susceptible")],
    ["Panel 2", "–", "–", "–", "+", ans(step, "Vaccinated")],
    ["Panel 3", "–", "+", "–", "+", ans(step, "Resolved infection")],
    ["Panel 4", "+", "+", "–", "–", ans(step, "Chronic infection")],
    ["Panel 5", "+", "+", "+", "–", ans(step, "Acute infection")]],
    { x: 0.8, y: 1.95, w: W - 1.6, size: 22, minRowH: 0.78 });
  src(s, "Interpretation per CDC 2023 (Table 1), MMWR Recomm Rep 2023;72(1):1-25.");
  s.addNotes("Chronic means HBsAg present for more than 6 months, so panel 4 needs a repeat. IgM anti-HBc also turns positive during a flare of chronic hepatitis B or a reactivation, so IgM plus a high ALT is not always acute infection: look at the history and the DNA. Resolved infection can reactivate under immunosuppression, which leads to the next slide.");
  return s;
});
twoStep((step) => {
  const s = slide("61-year-old woman starting rituximab");
  table(s, [["HBsAg", "Total anti-HBc", "Anti-HBs", "HBV DNA", "ALT"], ["–", { t: "+", red: true }, "–", "Not done", "28 U/L"]],
    { x: 1.2, y: 1.35, w: W - 2.4, size: 22, minRowH: 0.6 });
  q(s, "What could this be, and what do you order?", 2.9, { size: 24 });
  table(s, [["Possibility", "How you sort it out"],
    [ans(step, "Resolved infection, anti-HBs has waned"), ans(step, "HBV DNA undetectable")],
    [ans(step, "Occult infection"), ans(step, "HBV DNA detectable")],
    [ans(step, "Window period"), ans(step, "IgM anti-HBc positive")],
    [ans(step, "False-positive anti-HBc"), ans(step, "Repeat testing, DNA undetectable")]],
    { x: 1.2, y: 3.55, w: W - 2.4, size: 20, minRowH: 0.62, noLabel: false });
  src(s, "CDC 2023 (Table 1), PMID 36893044; AASLD 2018 hepatitis B guidance, PMID 29405329.");
  s.addNotes("Isolated anti-HBc is not the same as occult infection: occult needs detectable HBV DNA with a negative HBsAg. Order HBV DNA and repeat the panel. Whatever the answer, a patient who is anti-HBc positive and about to get an anti-CD20 drug needs prophylaxis (we come back to this).");
  return s;
});

// ---------------------------------------------------------------- Phases
sec("Phases");
{
  const mk = (n) => {
    const s = slide("Natural history of chronic hepatitis B");
    if (n === 1) q(s, "Where do HBV DNA, ALT and the antigens go over a lifetime?", 1.15, { size: 22, h: 0.5 });
    pic(s, `phases-${n}.png`, 0.9, 1.65, W - 1.8, 5.25, "Layered natural history figure");
    const notes = [
      "Draw it with the room: three panels, age in decades along the bottom. Schematic, not data.",
      "HBV DNA first. Very high in early life, falls in the third and fourth decades, then either stays low or rises again. The dashed lines are 20,000 and 2,000 IU/mL.",
      "Now ALT. Normal for decades, then flares when the immune system finally attacks. Each flare can cause fibrosis.",
      "The antigens. HBsAg stays positive. HBeAg is lost and anti-HBe appears when the patient seroconverts, around the fourth decade in this schematic.",
      "Now name the phases. New names above, old names below. The shaded phases are the hepatitis phases. Not every patient goes through all four, and the age axis is schematic.",
    ];
    s.addNotes(notes[n - 1]);
    return s;
  };
  mk(1); [2, 3, 4, 5].forEach((n) => { cont(); mk(n); });
}
ext(() => twoStep((step) => {
  const s = slide("Match the labs to the phase");
  table(s, [["HBeAg", "HBV DNA (IU/mL)", "ALT", "Phase"],
    ["Positive", "10,000,000 or more", "Normal", ans(step, "HBeAg-positive chronic infection")],
    ["Positive", "10,000 to 10,000,000", "Raised", ans(step, "HBeAg-positive chronic hepatitis")],
    ["Negative", "Below 2,000", "Normal", ans(step, "HBeAg-negative chronic infection")],
    ["Negative", "Above 2,000", "Raised", ans(step, "HBeAg-negative chronic hepatitis")]],
    { x: 0.8, y: 1.6, w: W - 1.6, size: 22, minRowH: 0.9, noLabel: true });
  src(s, "EASL Clinical Practice Guidelines on hepatitis B 2025, Table 4. J Hepatol 2025;83:502-583, PMID 40348683. Typical values.");
  s.addNotes("Old names: immune tolerant, immune clearance (immune-active), inactive carrier or immune control, immune escape. AASLD 2018 uses immune-tolerant, HBeAg-positive immune-active, inactive and HBeAg-negative immune-active CHB. These are descriptions of phases, not treatment criteria. A patient can move between phases, and HBsAg loss is a fifth state (HBsAg-negative phase).");
  return s;
}));

// ---------------------------------------------------------------- Patient 1: who to treat
sec("Who to treat");
const P1_ROWS = (age, dna, alt) => [
  ["Test", "Result"],
  ["HBsAg", "Positive"],
  ["HBeAg", "Positive"],
  ["Anti-HBe", "Negative"],
  ["HBV DNA", { t: dna, red: true }],
  ["ALT (ULN 35)", alt],
  ["Platelets", "245 ×10⁹/L"],
  ["Liver stiffness", "5.1 kPa"],
];
ext(() => {
  tableSlide("Fibrosis staging by elastography", [["", "EASL 2025", "WHO 2024"],
    ["Significant fibrosis (F2)", "Above 7 kPa", "Above 7 kPa, or APRI above 0.5"],
    ["Advanced fibrosis (F3)", "Above 8 kPa", "–"],
    ["Cirrhosis (F4)", "Above 11 kPa", "–"]],
    { size: 20, tbl: { x: 0.5, minRowH: 1.0, w: 7.6 }, after: (s) => pic(s, "fibroscan-probe.png", 8.4, 1.3, 4.6, 5.4, "Watercolor of a transient elastography probe") },
    "EASL 2025 Table 6 lists F2 above 7 kPa, F3 above 8 and F4 above 11. WHO 2024 uses APRI above 0.5 or elastography above 7 kPa as a treatment pathway, with no DNA threshold. Do not teach a single FibroScan cut-off of 8 for every purpose. The patient you are about to meet has 5.1 kPa.",
    "EASL 2025 PMID 40348683; WHO 2024 chapter 5.");
});
twoStep((step) => {
  const s = slide("34-year-old man, born in Vietnam");
  table(s, P1_ROWS(34, "60,000,000 IU/mL", "24 U/L"), { x: 0.5, y: 1.3, w: 7.3, size: 22, minRowH: 0.55, noLabel: true });
  pic(s, "man-34.png", 8.0, 1.15, 5.2, 5.8, "Watercolor of a man in his thirties seated in clinic");
  q(s, "Do you treat him?", 5.75, { size: 26, x: 0.5, w: 7.3 });
  if (step === 2) q(s, "AASLD: no, monitor every 3 to 6 months. EASL 2025 would consider treatment over 30", 6.25, { size: 19, hl: true, x: 0.3, w: 7.7, h: 0.8 });
  s.addNotes("HBsAg found at a blood donation, asymptomatic, ALT normal on two checks six months apart. This is the HBeAg-positive chronic infection (immune tolerant) phase. AASLD/IDSA 2025 R3 defines it as HBeAg positive, DNA above 10,000,000 IU/mL and persistently normal ALT on at least two measurements 6 months apart. At 34 with no fibrosis, the US recommendation is to monitor (AASLD 2018 R2A: against antiviral therapy in immune-tolerant adults). EASL 2025 observes HBeAg-positive chronic infection only in people under 30 at low risk, so in Europe he could already be offered treatment. Stiffness 5.1 kPa is below the EASL F2 cut-off of 7 kPa. All values are made up.");
  return s;
});
twoStep((step) => {
  const s = slide("Same man, now 41 years old");
  table(s, P1_ROWS(41, "55,000,000 IU/mL", "26 U/L"), { x: 0.5, y: 1.3, w: 7.3, size: 22, minRowH: 0.55, noLabel: true });
  pic(s, "man-34.png", 8.0, 1.15, 5.2, 5.8, "Watercolor of a man in his thirties seated in clinic");
  q(s, "Does the answer change?", 5.75, { size: 26, x: 0.5, w: 7.3 });
  if (step === 2) q(s, "Over 40: treatment is suggested. He chose to wait. Start ultrasound and AFP every 6 months", 6.25, { size: 19, hl: true, x: 0.3, w: 7.7, h: 0.8 });
  s.addNotes("AASLD/IDSA 2025 R3 (conditional, very low certainty): for immune-tolerant adults, antiviral therapy is supported if over 40 or with grade 2 / stage 2 or worse disease. The recommendation text says 'over 40' and the guideline's algorithm says '40 or more'. The evidence is observational and the AASLD technical review calls it very uncertain, so this is a shared decision. In our story he hears the options and chooses to keep monitoring, which is why he is untreated at 52. He is now a man from an endemic region over 40, so HCC surveillance starts here (AASLD 2023), whatever he decides about treatment.");
  return s;
});
ext(() => {
  {
    const s = slide("Treat everyone with high DNA and normal ALT?");
    bars(s, [{ name: "Immune tolerant, untreated", labels: ["10-year HCC"], values: [12.7] }, { name: "Immune active, treated", labels: ["10-year HCC"], values: [6.1] }],
      { x: 0.5, y: 1.5, w: 6.0, h: 4.6, colors: [SLATE, NAVY], max: 15, unit: 5, legend: true, labSize: 18, catSize: 16, fmt: '0.0"%"', title: "Kim, Gut 2018" });
    bars(s, [{ name: "Immune tolerant, FIB-4 under 1.45", labels: ["5-year HCC"], values: [0] }, { name: "Comparators", labels: ["5-year HCC"], values: [1.4] }],
      { x: 6.8, y: 1.5, w: 6.0, h: 4.6, colors: [SLATE, NAVY], max: 15, unit: 5, legend: true, labSize: 18, catSize: 16, fmt: '0.0"%"', title: "Jeon, Clin Mol Hepatol 2021" });
    src(s, "Kim GA et al. Gut 2018;67:945-952, PMID 29055908. Jeon MY et al. Clin Mol Hepatol 2021;27:295-304, PMID 33317247.");
    s.addNotes("Two studies that point in opposite directions. Kim: Korean retrospective cohort, 413 untreated immune-tolerant versus 1,497 treated immune-active patients; 10-year HCC 12.7% vs 6.1%, adjusted HR 2.54 (1.54 to 4.18); death or transplant 9.7% vs 3.4%. The untreated group used a broad definition (DNA at least 20,000), broader than strict immune tolerance, and the groups are different phases. Jeon found no HCC at 1, 3 and 5 years in biomarker-defined immune tolerance with FIB-4 under 1.45, versus 0.2, 0.6 and 1.4% in the comparators. Integration of HBV DNA and clonal expansion are already seen in young immune-tolerant patients (Mason, Gastroenterology 2016, 26 patients), which is biology, not proof that early treatment prevents HCC. The AASLD technical review grades the evidence for clinical benefit in immune tolerance as very uncertain.");
  }
});
{
  const s = slide("Same man, now 52 years old");
  table(s, [["Test", "Result"], ["HBsAg", "Positive"], ["HBeAg", "Negative"], ["Anti-HBe", "Positive"], ["HBV DNA", { t: "8,000 IU/mL", red: true }],
    ["ALT", { t: "48 U/L", red: true }], ["Platelets", "190 ×10⁹/L"], ["FIB-4", "1.8"], ["Liver stiffness", "6.8 kPa"], ["eGFR", "45 mL/min"]],
    { x: 0.5, y: 1.2, w: 7.3, size: 20, minRowH: 0.47, noLabel: true });
  pic(s, "man-52.png", 8.0, 1.15, 5.2, 5.8, "Watercolor of the same man in his fifties, gray at the temples, with reading glasses");
  q(s, "Do you treat him?", 6.2, { size: 26, x: 0.5, w: 7.3 });
  s.addNotes("He lost HBeAg and seroconverted in his late 40s. DNA 8,000, ALT 48 (1.4 times the AASLD upper limit of 35), no advanced fibrosis. His eGFR is 45 from diabetic kidney disease, which matters for the drug. Let the room commit. The next slides show what each guideline says.");
}
{
  const s = slide("What counts as a normal ALT?");
  bars(s, [{ name: "Men", labels: ["AASLD", "WHO 2024", "EASL 2025"], values: [35, 30, 40] }, { name: "Women", labels: ["AASLD", "WHO 2024", "EASL 2025"], values: [25, 19, 40] }],
    { x: 0.6, y: 1.3, w: 8.2, h: 5.4, colors: [NAVY, SLATE], max: 50, unit: 10, valFmt: "0", fmt: "0", legend: true, labSize: 18, catSize: 17, title: "Upper limit of normal ALT, U/L" });
  s.addText([{ text: "His ALT", options: { fontSize: 24, breakLine: true } }, { text: "48 U/L", options: { fontSize: 54, bold: true, color: RED, breakLine: true } },
    { text: "Above all three limits", options: { fontSize: 22 } }], { x: 9.0, y: 2.3, w: 3.9, h: 2.8, fontFace: "Georgia", align: "center", valign: "middle", color: "000000", isTextBox: true, margin: 0 });
  src(s, "Upper limits of normal as listed in the guidelines. AASLD 2018 PMID 29405329; WHO 2024; EASL 2025 PMID 40348683.");
  s.addNotes("The old reference ranges included people with fatty liver, which is why the blood-donor data gave lower limits (30 for men and 19 for women in the ASHM chapter). Whichever limit you use, 48 is raised. Next slide: what each guideline does with it.");
}
twoStep((step) => {
  const s = slide("One patient, four guidelines");
  q(s, "Hands up if you would treat him", 1.2, { size: 24 });
  table(s, [["", "AASLD 2018", "AASLD/IDSA 2025", "EASL 2025", "WHO 2024"],
    ["Age 34, HBeAg positive", ans(step, "Monitor"), ans(step, "Monitor"), ans(step, "Consider treating"), ans(step, "Monitor")],
    ["Age 41, same labs", ans(step, "Monitor"), ans(step, "Treatment suggested"), ans(step, "Consider treating"), ans(step, "Monitor")],
    ["Age 52, HBeAg negative", ans(step, "Check fibrosis"), ans(step, "Shared decision"), ans(step, { t: "Treat", b: true }), ans(step, { t: "Treat", b: true })]],
    { x: 0.6, y: 1.9, w: W - 1.2, size: 20, minRowH: 0.95 });
  if (step === 2) q(s, "At 52 he chose to start treatment", 6.0, { size: 24, hl: true });
  src(s, "AASLD 2018 PMID 29405329; AASLD/IDSA 2025 Hepatology 2026;83:974-997 PMID 41186418; EASL 2025 PMID 40348683; WHO 2024 (NBK614987).");
  s.addNotes("At 34: the US guidelines monitor; EASL 2025 observes HBeAg-positive chronic infection only under 30 at low risk; WHO 2024 has no pathway for him without fibrosis, raised ALT or a family history. At 41: AASLD/IDSA 2025 R3 suggests treatment over 40. At 52: AASLD 2018 treats HBeAg-negative patients with DNA above 2,000 and ALT at least 2 times the upper limit (70 for a man), and otherwise asks you to assess fibrosis or inflammation and weigh age and family history; his stiffness is 6.8, so by 2018 rules he is not treated, but for that reason. AASLD/IDSA 2025 R4 suggests treatment by shared decision in the indeterminate group. EASL 2025: DNA at least 2,000 with ALT above the upper limit: treat. WHO 2024: DNA above 2,000 and ALT above the upper limit: treat. Cirrhosis is treated by all four, at any DNA level (summary slide).");
  return s;
});
ext(() => twoStep((step) => {
  const s = slide("Does treating this group help?");
  table(s, [["Study", "Design", "Patients", "Outcome"],
    ["Huang 2023", "Observational", "855, no advanced fibrosis", "HCC, 5 to 15 years"],
    ["TORCH-B 2021", "Randomized", "160, ALT 1 to 2 x ULN", "Progression at 3 years"],
    ["Lai 2025", "Meta-analysis, 103 studies", "Grey zone", "Treatment IRR 0.38 for HCC"],
    ["ATTENTION 2025", "Randomized, interim", "734, TAF vs observation", "Events 2 vs 9, HR 0.21 (CI crosses 1)"]],
    { x: 0.6, y: 1.25, w: W - 1.2, size: 16, minRowH: 0.45 });
  if (step === 2) {
    bars(s, [{ name: "Treated", labels: ["5 years", "10 years", "15 years"], values: [3, 4, 9] }, { name: "Untreated", labels: ["5 years", "10 years", "15 years"], values: [3, 15, 19] }],
      { x: 0.6, y: 4.1, w: 6.6, h: 2.8, colors: [NAVY, SLATE], max: 25, unit: 5, legend: true, labSize: 14, catSize: 14 });
    bars(s, [{ name: "TDF", labels: ["Progression of 1 or more Ishak stage"], values: [26] }, { name: "Placebo", labels: ["Progression of 1 or more Ishak stage"], values: [47] }],
      { x: 7.4, y: 4.1, w: 5.4, h: 2.8, colors: [NAVY, SLATE], max: 60, unit: 20, legend: true, labSize: 14, catSize: 13 });
    s.addText("Huang: cumulative HCC risk, %", { x: 0.6, y: 3.75, w: 6.6, h: 0.3, fontFace: "Calibri", fontSize: 15, align: "center", color: GREY, isTextBox: true, margin: 0 });
    s.addText("TORCH-B: histologic progression, %", { x: 7.4, y: 3.75, w: 5.4, h: 0.3, fontFace: "Calibri", fontSize: 15, align: "center", color: GREY, isTextBox: true, margin: 0 });
  } else {
    q(s, "What do you expect?", 4.9, { size: 26 });
  }
  src(s, "Huang DQ, Hepatology 2023, PMID 37184202. Hsu YC, Lancet Infect Dis 2021, PMID 33524314. Lai JC, J Hepatol 2025, PMID 39577468. Lim YS, Lancet Gastroenterol Hepatol 2025, PMID 39914435.");
  s.addNotes("Huang: 855 patients in the indeterminate phase without advanced fibrosis; weighted analysis, adjusted HR for HCC 0.30 (0.10 to 0.60). Treated 3, 4 and 9% at 5, 10 and 15 years, untreated 3, 15 and 19%. Observational, so residual confounding remains. TORCH-B: 160 Taiwanese patients, TDF 300 mg for 3 years versus placebo, paired biopsies: progression of at least one Ishak stage 19/73 (26%) versus 34/73 (47%), RR 0.56 (0.35 to 0.88). Lai 2025: significant fibrosis in 39.7%, HCC 0.32% a year, treatment IRR 0.38 (0.18 to 0.79), heterogeneity high (I2 85.7% for HCC). ATTENTION interim: TAF 369 vs observation 365, ages 40 to 80, noncirrhotic, median 17.7 months; HR 0.21, 97.5% CI 0.04 to 1.20, did not cross its stopping boundary. Promising, not definitive. None of these randomized treatment against HCC.");
  return s;
}));

{
  const s = slide("Who to treat: summary (US)");
  fbox(s, "HBsAg positive", 4.65, 1.15, 4.0, 0.5, "q", 18);
  farrow(s, 6.65, 1.65, 6.65, 1.9);
  fbox(s, "Cirrhosis?", 4.9, 1.9, 3.5, 0.5, "q", 18);
  farrow(s, 8.4, 2.15, 9.7, 2.15, "Yes");
  fbox(s, "Treat, any DNA level", 9.7, 1.9, 3.2, 0.5, "treat", 18);
  fline(s, 6.65, 2.4, 6.65, 2.6); fline(s, 2.4, 2.6, 9.1, 2.6);
  s.addText("No", { x: 6.75, y: 2.33, w: 0.6, h: 0.3, fontFace: TBL_FONT, fontSize: 14, bold: true, color: GREY, isTextBox: true, margin: 0 });
  farrow(s, 2.4, 2.6, 2.4, 2.8); farrow(s, 9.1, 2.6, 9.1, 2.8);
  fbox(s, "HBeAg positive", 0.5, 2.8, 3.8, 0.5, "q", 17);
  fbox(s, "HBeAg negative", 7.2, 2.8, 3.8, 0.5, "q", 17);
  const L = [["DNA above 20,000 and ALT 2 times ULN or more", "Treat", "treat"],
    ["DNA above 10 million, normal ALT, over 40 or F2 or worse", "Treatment suggested", "treat"],
    ["Between the two: the grey zone", "Shared decision", "decide"],
    ["DNA above 10 million, normal ALT, 40 or younger, no fibrosis", "Monitor", "watch"]];
  const Rr = [["DNA above 2,000 and ALT 2 times ULN or more", "Treat", "treat"],
    ["Between the two: the grey zone", "Shared decision", "decide"],
    ["DNA below 2,000, normal ALT", "Monitor", "watch"]];
  L.forEach((r, i) => { const y = 3.5 + i * 0.83; fbox(s, r[0], 0.3, y, 4.2, 0.74, "cond", 16); farrow(s, 4.5, y + 0.37, 4.85, y + 0.37); fbox(s, r[1], 4.85, y, 1.85, 0.74, r[2], 16); });
  Rr.forEach((r, i) => { const y = 3.5 + i * 0.83; fbox(s, r[0], 7.0, y, 4.2, 0.74, "cond", 16); farrow(s, 11.2, y + 0.37, 11.55, y + 0.37); fbox(s, r[1], 11.55, y, 1.5, 0.74, r[2], 16); });
  src(s, "AASLD 2018 (PMID 29405329); AASLD/IDSA 2025 R3, R4 and Figure 5 (PMID 41186418). ALT ULN 35 men, 25 women.");
  s.addNotes("This is the US version: AASLD 2018 thresholds for immune-active disease, with the two AASLD/IDSA 2025 changes. R3 (conditional, very low certainty): immune-tolerant adults over 40, or with grade 2 / stage 2 or worse disease, are suggested for treatment; the text says over 40 and the algorithm says 40 or more. R4: the indeterminate (grey zone) group, which is not limited to HBeAg-negative patients, is a shared decision. Cirrhosis: AASLD 2018 R7A treats compensated cirrhosis with low viremia regardless of ALT, R7B treats decompensated cirrhosis regardless of DNA, ALT or HBeAg, and the 2025 Figure 5 treats both regardless of DNA or ALT. EASL 2025 asks for detectable DNA in compensated cirrhosis. EASL 2025 and WHO 2024 treat more people: DNA above 2,000 with ALT above ULN, or significant fibrosis. Pregnancy and immunosuppression are separate pathways, covered later. 'Monitor' means ALT and DNA every 3 to 6 months and a fibrosis check.");
}

// ---------------------------------------------------------------- Drugs
sec("Drugs");
twoStep((step) => {
  const s = slide("Same man at 52, eGFR 45");
  q(s, "Which nucleos(t)ide analogue for him?", 1.2, { size: 24 });
  table(s, [["", "Dose", "At eGFR 30 to 49", ""],
    ["Entecavir", "0.5 mg daily", ans(step, "0.5 mg every 48 hours"), ans(step, "Dose-adjust")],
    ["TDF", "300 mg daily", ans(step, "300 mg every 48 hours"), ans(step, "Dose-adjust, kidney and bone effects")],
    ["TAF", "25 mg daily with food", ans(step, "25 mg daily"), ans(step, { t: "No adjustment", b: true })]],
    { x: 0.6, y: 1.9, w: W - 1.2, size: 21, minRowH: 0.95 });
  if (step === 2) q(s, "TAF, or entecavir with the dose adjusted", 6.1, { size: 24, hl: true });
  src(s, "US prescribing information: Baraclude, Viread, Vemlidy (DailyMed). Renal doses use creatinine clearance.");
  s.addNotes("The renal rows are from the US labels. Entecavir: for CrCl 30 to 49, 0.25 mg daily or 0.5 mg every 48 hours; use the oral solution for the daily fractions. TDF: CrCl 30 to 49, 300 mg every 48 hours. TAF: no adjustment at CrCl 15 or above. TAF is not recommended in Child-Pugh B or C in the US label, and the old statement that TAF cannot be used on dialysis is out of date. Bone and kidney data for TAF versus TDF are in the extended version. He started TAF.");
  return s;
});
ext(() => twoStep((step) => {
  const s = slide("TAF versus TDF at week 48");
  table(s, [["HBV DNA below 29 IU/mL", "TAF", "TDF"], ["HBeAg-positive (Chan)", "64%", "67%"], ["HBeAg-negative (Buti)", "94%", "93%"]],
    { x: 0.4, y: 1.4, w: 5.6, size: 20, minRowH: 0.65 });
  if (step === 1) q(s, "What differs?", 4.6, { size: 26, x: 0.6, w: 12 });
  if (step === 2) {
    bars(s, [{ name: "TAF", labels: ["Hip, HBeAg-neg", "Spine, HBeAg-neg", "Hip, HBeAg-pos", "Spine, HBeAg-pos"], values: [-0.29, -0.88, -0.10, -0.42] },
             { name: "TDF", labels: ["Hip, HBeAg-neg", "Spine, HBeAg-neg", "Hip, HBeAg-pos", "Spine, HBeAg-pos"], values: [-2.16, -2.51, -1.72, -2.29] }],
      { x: 6.0, y: 1.3, w: 6.9, h: 5.3, colors: [NAVY, SLATE], min: -3, max: 0, unit: 1, catPos: "low", valFmt: '0.0"%"', fmt: '0.00"%"', legend: true, labSize: 13, catSize: 13 });
    s.addText("Change in bone mineral density, %", { x: 6.0, y: 1.0, w: 6.9, h: 0.3, fontFace: "Calibri", fontSize: 14, align: "center", color: GREY, isTextBox: true, margin: 0 });
    s.addText("Median eGFR change in the HBeAg-negative trial: -1.8 (TAF) vs -4.8 mL/min (TDF)", { x: 0.6, y: 3.6, w: 5.2, h: 1.0, fontFace: "Georgia", fontSize: 17, isTextBox: true, margin: 0 });
  }
  src(s, "Chan HLY et al. Lancet Gastroenterol Hepatol 2016;1:185-195 (PMID 28404091). Buti M et al. 2016;1:196-206 (PMID 28404092).");
  s.addNotes("Two phase 3 noninferiority trials, 875 HBeAg-positive and 426 HBeAg-negative patients, double-blind. Antiviral efficacy was the same. Bone loss was smaller on TAF at the hip (-0.10% vs -1.72% and -0.29% vs -2.16%) and spine (-0.42% vs -2.29% and -0.88% vs -2.51%). The 96-week pooled analysis (Agarwal, J Hepatol 2018) held up. The 8-year report (Buti, Aliment Pharmacol Ther 2024) switched the TDF arm to TAF at year 2 or 3, so it is not a randomized 8-year comparison. Observational data do not settle entecavir versus tenofovir for HCC (Choi 2023 individual patient meta-analysis HR 0.77, 0.61 to 0.98; Lee 2020 HR 1.03, 0.70 to 1.51).");
  return s;
}));
ext(() => {
  {
    const s = slide("Entecavir or tenofovir for HCC?");
    forest(s, [{ label: "Lee 2020, propensity analysis, 3,022 patients", hr: 1.03, lo: 0.70, hi: 1.51 },
      { label: "Choi 2023, individual patient meta-analysis, 42,939 patients", hr: 0.77, lo: 0.61, hi: 0.98 }],
      { x: 0.4, y: 1.6, w: 9.9, labelW: 4.4, rowH: 1.2, min: 0.5, max: 1.6, ticks: [0.5, 0.75, 1, 1.25, 1.5], axisL: "Favors tenofovir", axisR: "Favors entecavir" });
    s.addText("Hazard ratio for HCC, tenofovir vs entecavir", { x: 4.8, y: 1.05, w: 5.5, h: 0.4, fontFace: TBL_FONT, fontSize: 16, bold: true, align: "center", color: "000000", isTextBox: true, margin: 0 });
    s.addText("Yoo 2025, Korea, TAF vs TDF: 12.38 vs 15.39 HCC per 1,000 person-years, 17,537 in each matched group", { x: 0.8, y: 5.6, w: W - 1.6, h: 0.7, fontFace: "Georgia", fontSize: 18, align: "center", color: "000000", isTextBox: true, margin: 0 });
    src(s, "Lee SW et al. Gut 2020;69:1301-1308, PMID 31672838. Choi WM et al. J Hepatol 2023;78:534-542, PMID 36572349. Yoo HJ et al. JHEP Rep 2025;7:101268, PMID 39867683.");
    s.addNotes("The observational data are inconsistent and sensitive to design, including different start dates and follow-up. No randomized trial compares HCC. The 2019 Choi cohort in Korea has a retraction-and-replacement notice, so do not quote its original estimate. Yoo 2025 (J Hepatol Reports): TDF/TAF incidence rate ratio 1.24, entecavir/TAF 1.08 (p = 0.219); abstract only. Renal function, bone disease, resistance, pregnancy, adherence and access still decide the drug.");
  }
  tableSlide("Pegylated interferon", [["Strategy", "Trial", "Result"],
    ["Switch from entecavir, HBeAg-positive", "OSST, 200 patients", "HBsAg loss 8.5% vs 0% at week 48"],
    ["Add to TDF for 48 weeks", "Marcellin, 740 patients", "HBsAg loss 9.1% (48 weeks), 2.8% (16 weeks), 0% (TDF alone), 2.8% (PegIFN alone) at week 72"]],
    { size: 19, tbl: { minRowH: 1.0 } },
    "A finite course for selected compensated patients who accept the side effects: higher ALT, lower DNA, favorable genotype and early qHBsAg decline help selection. Avoid in decompensated cirrhosis and pregnancy. These are selected populations, not general cure rates.",
    "Ning Q et al. J Hepatol 2014;61:777-784, PMID 24915612. Marcellin P et al. Gastroenterology 2016;150:134-144, PMID 26453773.");
});

tableSlide("Choosing the drug: summary", [["Situation", "Drug"],
  [{ t: "Most patients", b: true }, "Entecavir, TDF or TAF"],
  [{ t: "Kidney or bone disease, or at risk", b: true }, "TAF, or entecavir with the dose adjusted"],
  [{ t: "Prior lamivudine resistance", b: true }, "TDF or TAF, not entecavir"],
  [{ t: "HIV", b: true }, "TDF or TAF as part of ART"],
  [{ t: "Decompensated cirrhosis", b: true }, "Entecavir 1 mg or TDF (no TAF in Child-Pugh B or C)"],
  [{ t: "Wants a finite course", b: true }, "Pegylated interferon, selected patients"],
  [{ t: "On treatment", b: true }, "DNA every 3 months, then every 3 to 6 months"]],
  { size: 20, y: 1.3, tbl: { minRowH: 0.66 } },
  "AASLD 2018: entecavir, TDF and TAF are first line. Entecavir or TAF are preferred over TDF with renal dysfunction or bone disease, or risk of them. Lamivudine resistance confers cross-resistance to entecavir, so use tenofovir. Entecavir alone is not adequate in HIV: it selects HIV M184V. Pregnancy is on its own slide later: TDF has the randomized data; AASLD/IDSA 2025 R1 accepts TDF or TAF. Decompensated cirrhosis: entecavir is 1 mg daily, not 0.5 mg (Baraclude label); the 2025 Figure 5 lists TAF, but the US label does not recommend it in Child-Pugh B or C, so say that. PegIFN is contraindicated in decompensated cirrhosis and in pregnancy. Monitoring on treatment: DNA every 3 months until undetectable, then every 3 to 6 months; on TDF, creatinine, phosphate, urine glucose and protein at least yearly (AASLD 2018). EASL 2025 uses 3 to 6 months at first, then 6 to 12.",
  "AASLD 2018 (PMID 29405329); AASLD/IDSA 2025 (PMID 41186418); US prescribing information.");

// ---------------------------------------------------------------- HCC
sec("HCC risk");
twoStep((step) => {
  const s = slide("Calculating PAGE-B");
  const hl = (v) => (step === 2 ? { t: v, hl: true } : v);
  table(s, [["Variable", "Category", "Points"],
    ["Age, years", "16 to 29", "0"], ["", "30 to 39", "2"], ["", "40 to 49", "4"], ["", "50 to 59", hl("6")], ["", "60 to 69", "8"], ["", "70 or older", "10"],
    ["Sex", "Female", "0"], ["", "Male", hl("6")],
    ["Platelets, ×10⁹/L", "200 or more", "0"], ["", "100 to 199", hl("6")], ["", "Under 100", "9"]],
    { x: 0.6, y: 1.2, w: 6.6, size: 18, minRowH: 0.46 });
  body(s, [{ t: "52-year-old man", nb: true, b: true }, { t: "Started on TAF", nb: true }, { t: "Platelets 190", nb: true }], { x: 7.5, y: 1.5, w: 5.2, h: 1.9, size: 22, gap: 6 });
  if (step === 1) q(s, "What is his PAGE-B score?", 4.3, { x: 7.5, w: 5.2, h: 1.0, size: 24 });
  if (step === 2) {
    q(s, "6 + 6 + 6 = 18", 3.5, { x: 7.5, w: 5.2, size: 28, hl: true });
    body(s, [{ t: "High risk: 18 or more", nb: true }, { t: "5-year HCC about 16 to 17%", nb: true }], { x: 7.5, y: 4.15, w: 5.2, h: 1.0, size: 20 });
    s.addImage({ path: path.join(IMG, "qr-calculator.png"), x: 7.7, y: 5.3, w: 1.45, h: 1.45, altText: "QR code to the HBV HCC risk calculator" });
    s.addText("Calculator: qaddodi.github.io/chb-hcc-risk", { x: 9.3, y: 5.5, w: 3.7, h: 1.0, fontFace: "Georgia", fontSize: 16, valign: "middle", isTextBox: true, margin: 0 });
  }
  src(s, "Points as printed in EASL 2025 Table 13. PAGE-B: Papatheodoridis GV et al. J Hepatol 2016.");
  s.addNotes("PAGE-B was derived in 1,815 White European adults treated with entecavir or tenofovir (1,325 derivation, 490 validation) and has three groups: 9 or less, 10 to 17 and 18 or more. Five-year HCC was 0, 3 and 17% in derivation and 0, 4 and 16% in validation. He was started on TAF when he was 52, so PAGE-B applies. In a US veterans cohort of 3,101 treated patients (39.5% White, 36.3% Black), PAGE-B had a 3-year AUC of 0.73.");
  return s;
});
ext(() => {
  const s = slide("Calculate it yourself");
  table(s, [["PAGE-B", "5-year HCC, derivation", "5-year HCC, validation"], ["9 or less", "0%", "0%"], ["10 to 17", "3%", "4%"], ["18 or more", "17%", "16%"]],
    { x: 0.6, y: 1.5, w: 7.2, size: 20, minRowH: 0.75 });
  s.addImage({ path: path.join(IMG, "qr-calculator.png"), x: 9.2, y: 1.5, w: 3.0, h: 3.0, altText: "QR code to the HBV HCC risk calculator" });
  s.addText("qaddodi.github.io/chb-hcc-risk", { x: 8.2, y: 4.55, w: 5.0, h: 0.4, fontFace: "Georgia", fontSize: 17, align: "center", isTextBox: true, margin: 0 });
  body(s, [
    "PAGE-B was built in treated patients; REACH-B was built in untreated patients",
    "The HBsAg-based model on the site is a 2026 research model, not validated",
  ], { x: 0.6, y: 4.5, w: 7.3, h: 2.2, size: 19, gap: 10 });
  src(s, "PAGE-B: Papatheodoridis GV et al. J Hepatol 2016. VA validation: Kim 2022.");
  s.addNotes("The calculator is mine. PAGE-B matches the published table. The second model (HBsAg-HCC, Guo 2026, 1,190 training and 506 validation patients) is a research model, not externally validated. The calculator does not include REACH-B, aMAP or REAL-B.");
});
twoStep((step) => {
  const s = slide("Who gets surveillance?");
  q(s, "Ultrasound and AFP every 6 months?", 1.2, { size: 24, x: 0.4, w: 8.4 });
  pic(s, "ultrasound-probe.png", 8.8, 1.3, 4.4, 5.6, "Watercolor of an abdominal ultrasound probe");
  table(s, [["Patient", "Surveillance"],
    ["Compensated cirrhosis, Child-Pugh A", ans(step, "Yes")],
    ["Man from an endemic region, age 38, no cirrhosis", ans(step, "No")],
    ["Man from an endemic region, age 46, no cirrhosis", ans(step, "Yes")],
    ["Woman from an endemic region, age 46, no cirrhosis", ans(step, "No")],
    ["Family history of HCC", ans(step, "Yes")],
    ["PAGE-B score of 12", ans(step, "Yes")]],
    { x: 0.4, y: 1.9, w: 8.4, size: 20, minRowH: 0.62 });
  src(s, "AASLD HCC practice guidance 2023, Table 1. Hepatology 2023;78:1922-1965, PMID 37199193.");
  s.addNotes("AASLD 2023 Table 1: noncirrhotic HBV: men over 40 and women over 50 from endemic regions; people of African origin earlier (the wording is origin-based, not an instruction to start every Black American at 20); family history of HCC; PAGE-B 10 or more (the table prints 'over 10' while the score's own intermediate group starts at 10). Ultrasound plus AFP every 6 months (level 2, strong). The thresholds behind these groups are about 0.2% a year for noncirrhotic HBV and 1.0% for cirrhosis. These are model-based decision thresholds, not biological cut-offs. Continue surveillance after HBsAg loss in cirrhosis, family history, men who lost HBsAg after 40 and women after 50 (AASLD/IDSA 2025 R6).");
  return s;
});
ext(() => {
  tableSlide("Which HCC score for which patient", [["Score", "Built in", "Variables"],
    ["PAGE-B", "1,815 treated White Europeans", "Age, sex, platelets"],
    ["mPAGE-B", "3,001 treated Asian patients", "Age, sex, platelets, albumin"],
    ["REACH-B", "3,584 untreated Taiwanese, noncirrhotic", "Sex, age, ALT, HBeAg, DNA"],
    ["aMAP", "17,374, mostly treated Asian HBV", "Age, sex, albumin-bilirubin, platelets"],
    ["REAL-B", "8,048 treated Asian patients", "Sex, age, alcohol, diabetes, cirrhosis, platelets, AFP"]],
    { size: 19, tbl: { minRowH: 0.8 } },
    "In 3,101 treated US veterans (39.5% White, 36.3% Black, 13.6% Asian; 113 HCC over 4.5 years) the 3-year AUC was 0.73 for PAGE-B and 0.57 for REACH-B; REAL-B and some AFP-containing models were above 0.80. REACH-B does poorly when moved from untreated noncirrhotic patients into treated ones, including those with cirrhosis. In HIV/HBV on tenofovir (2,963 patients), PAGE-B had a C-index of 0.77 and a negative predictive value of 99.4% below 10 at 5 years.",
    "PAGE-B PMID 26678008; mPAGE-B PMID 30075230; REACH-B PMID 21497551; aMAP PMID 32707225; REAL-B PMID 31550363; Kim HS, J Hepatol 2022, PMID 34563579.");
  tableSlide("Does qHBsAg refine HCC risk?", [["Tseng, Gastroenterology 2012", "Result"],
    ["2,688 noncirrhotic Taiwanese, 191 HCC, mean 14.7 years", "HBeAg-negative with DNA under 2,000: HBsAg 1,000 or more vs under 1,000 gave adjusted HR 13.7 (4.8 to 39.3)"],
    ["Whole cohort", "DNA was the stronger predictor; HBsAg alone did not add independently"]],
    { size: 19, tbl: { minRowH: 1.1 } },
    "What the literature supports: a high HBsAg in an HBeAg-negative patient with low DNA predicts HCC, and the best studied cut-off is 1,000 IU/mL. Not supported: that qHBsAg adds nothing in F3 to F4, a universal cut-off of 100, and any reading of qHBsAg as an integration-burden meter. The Tseng 2013 Hepatology paper is about hepatitis events (HR 1.5), and the 13.2 hazard ratio in the 2012 Hepatology paper is for HBsAg loss, not HCC.",
    "Tseng TC et al. Gastroenterology 2012;142:1140-1149, PMID 22333950.");
});

// ---------------------------------------------------------------- Special situations
{
  const s = slide("HCC surveillance: summary");
  body(s, [
    { t: "Ultrasound and AFP every 6 months", b: true },
    "Cirrhosis",
    "No cirrhosis, from an endemic region: men over 40, women over 50; people of African origin earlier",
    "Family history of HCC",
    "PAGE-B 10 or more",
    "Hepatitis D coinfection",
    { t: "Keep going after HBsAg loss if:", b: true },
    "Cirrhosis or a family history of HCC, or HBsAg lost after 40 in men and after 50 in women",
  ], { x: 0.6, y: 1.3, w: 7.6, h: 5.5, size: 21, gap: 8 });
  pic(s, "ultrasound-probe.png", 8.5, 1.4, 4.5, 5.3, "Watercolor of an abdominal ultrasound probe");
  src(s, "AASLD HCC guidance 2023, Table 1 (PMID 37199193); AASLD/IDSA 2025 R6 to R9 (PMID 41186418).");
  s.addNotes("AASLD 2023 Table 1 and AASLD/IDSA 2025 R6 to R9 (all conditional, very low certainty). Cirrhosis: Child-Pugh A and B patients who could be treated for HCC; Child C only if a transplant candidate. HIV coinfection: men 18 and older and women 40 and older. HBV and HCV: use the HBV criteria after HCV is treated. Surveillance continues on antivirals even when DNA is suppressed.");
}
sec("Special situations");
twoStep((step) => {
  const s = slide("Risk of HBV reactivation");
  q(s, "HBsAg negative, anti-HBc positive: how risky is each drug?", 1.2, { size: 22 });
  const R = (v) => ans(step, v === "High" ? { t: v, red: true, b: true } : v);
  table(s, [["Drug", "Reactivation risk"],
    ["Rituximab or other anti-CD20", R("High")],
    ["Anthracyclines", R("Moderate")],
    ["JAK inhibitors", R("Moderate")],
    ["Prednisone 10 mg or more for 4 weeks or longer", R("Moderate")],
    ["Anti-TNF", R("Low")],
    ["Immune checkpoint inhibitors", R("Low")],
    ["Methotrexate, azathioprine", R("Low")]],
    { x: 1.2, y: 1.85, w: W - 2.4, size: 20, minRowH: 0.6 });
  src(s, "AGA guideline 2025, Table 6. Gastroenterology 2025;168:267-284, PMID 39863345. High above 10%, moderate 1 to 10%, low below 1%.");
  s.addNotes("Our patient from earlier: anti-HBc positive, HBsAg negative, starting rituximab. AGA risk categories: high above 10%, moderate 1 to 10%, low below 1%. The risk depends on the drug and on serostatus: for HBsAg-positive patients, most of these drugs are high risk (anti-TNF, anthracyclines, JAK inhibitors). EASL 2025 Table 14 differs on several assignments (for example anti-TNF moderate and anthracyclines high in resolved infection), so do not mix the tables. There is no separate current ASH guideline; do not cite one.");
  return s;
});
twoStep((step) => {
  const s = slide("Rituximab, six cycles");
  q(s, "What do you give, and for how long?", 1.2, { size: 24, x: 0.3, w: 8.4 });
  pic(s, "iv-infusion.png", 8.5, 1.1, 4.7, 5.8, "Watercolor of an IV bag and infusion pump on a pole");
  gantt(s, { x: 0.2, y: 2.2, w: 8.4, labelW: 2.5, rowH: 0.9, ticks: ["Start", "Month 6", "Month 12", "Month 18", "Month 24"], rows: [
    { label: "Rituximab", from: 0, to: 0.95, fill: SLATE, dark: true },
    { label: "Entecavir, TDF or TAF", from: 0, to: 3, fill: NAVY, text: "Continue 12 months after the last dose", show: step === 2 },
  ] });
  if (step === 2) q(s, "Start before the first dose", 5.0, { size: 24, hl: true, x: 0.4, w: 8.0, h: 0.6 });
  src(s, "AGA 2025 (PMID 39863345); AASLD 2018 (PMID 29405329); EASL 2025 (PMID 40348683).");
  s.addNotes("High-risk exposure with anti-HBc positive: prophylaxis rather than monitoring (AGA R1, strong). Use a high-barrier drug: entecavir, TDF or TAF. Continue at least 6 months after the immunosuppression ends and at least 12 months for B-cell-depleting therapy (AGA and AASLD 2018); EASL 2025 says 6 to 12 months and at least 18 months after B-cell depletion. For a moderate-risk exposure in a DNA-negative resolved infection, AGA favors prophylaxis but accepts monitoring. ACR 2021 and ASCO 2020 give the rheumatology and oncology versions.");
  return s;
});
{
  const s = slide("Before immunosuppression: summary");
  fbox(s, "Before chemotherapy or immunosuppression: HBsAg, anti-HBc, anti-HBs", 2.4, 1.2, 8.5, 0.6, "q", 18);
  fline(s, 6.65, 1.8, 6.65, 2.1); fline(s, 2.35, 2.1, 10.95, 2.1);
  [2.35, 6.65, 10.95].forEach((x) => farrow(s, x, 2.1, x, 2.4));
  fbox(s, "HBsAg positive", 0.45, 2.4, 3.8, 0.6, "q", 17);
  fbox(s, "HBsAg negative, anti-HBc positive", 4.75, 2.4, 3.8, 0.6, "q", 17);
  fbox(s, "All negative", 9.05, 2.4, 3.8, 0.6, "q", 17);
  farrow(s, 2.35, 3.0, 2.35, 3.35); fbox(s, "Prophylaxis: entecavir, TDF or TAF", 0.45, 3.35, 3.8, 1.0, "treat", 18);
  farrow(s, 6.65, 3.0, 6.65, 3.35); fbox(s, "High risk (anti-CD20, stem cell transplant): prophylaxis", 4.75, 3.35, 3.8, 0.95, "treat", 17);
  farrow(s, 6.65, 4.3, 6.65, 4.5); fbox(s, "Moderate risk: prophylaxis preferred, or DNA and ALT every 1 to 3 months", 4.75, 4.5, 3.8, 0.95, "decide", 16);
  farrow(s, 6.65, 5.45, 6.65, 5.6); fbox(s, "Low risk: monitor", 4.75, 5.6, 3.8, 0.5, "watch", 16);
  farrow(s, 10.95, 3.0, 10.95, 3.35); fbox(s, "Vaccinate", 9.05, 3.35, 3.8, 1.0, "watch", 18);
  fbox(s, "Prophylaxis: start before the first dose; continue 6 months after the last dose, 12 months after anti-CD20", 0.45, 6.25, 12.4, 0.55, "cond", 16);
  src(s, "AGA 2025 (PMID 39863345); AASLD 2018 (PMID 29405329); EASL 2025 (PMID 40348683).");
  s.addNotes("AGA 2025: high risk above 10%, moderate 1 to 10%, low below 1%. HBsAg positive: prophylaxis for high- and moderate-risk drugs and for chemotherapy; AGA does not insist on it for every low-risk drug, so say 'nearly all'. HBsAg negative, anti-HBc positive: prophylaxis for anti-CD20 and stem cell transplant; for moderate risk AGA favors prophylaxis but accepts monitoring; low risk is monitoring. Duration: 6 months after the last dose, 12 after B-cell depleting therapy (AGA, AASLD 2018); EASL 2025 says 18 after B-cell depletion. Anti-HBs does not change the decision for anti-CD20. All negative: vaccinate (ACIP: all adults 19 to 59, and 60 and older with risk factors).");
}
twoStep((step) => {
  const s = slide("29-year-old woman, 20 weeks pregnant");
  table(s, [["HBsAg", "HBeAg", "HBV DNA", "ALT"], ["Positive", "Positive", { t: "5,000,000 IU/mL", red: true }, "22 U/L"]],
    { x: 0.4, y: 1.35, w: 6.9, size: 20, minRowH: 0.6 });
  s.addText("What do you do for her and the baby?", { x: 0.4, y: 2.75, w: 6.9, h: 0.6, fontFace: "Georgia", fontSize: 22, bold: true, align: "center", valign: "middle", color: "000000", isTextBox: true, margin: 0 });
  pic(s, "pregnant-patient.png", 7.6, 1.2, 5.5, 5.6, "Watercolor of a seated pregnant woman in profile");
  if (step === 2) {
    body(s, [
      "TDF or TAF from week 28, because DNA is above 200,000 IU/mL",
      "Baby: hepatitis B vaccine and HBIG within 12 hours of birth",
    ], { x: 0.6, y: 3.7, w: 7.0, h: 2.8, size: 24, gap: 16 });
  }
  s.addNotes("Born in Ethiopia, HBeAg positive, all values made up. AASLD/IDSA 2025 R1 (strong, moderate certainty): DNA above 200,000 at any point, start TDF or TAF at week 28 (consider week 16 when infant HBIG is not available). WHO 2024 also treats HBeAg-positive mothers regardless of DNA. Mother's ALT is normal, so this is prophylaxis to prevent transmission; stopping at delivery is allowed when treatment was only for that purpose, with DNA and ALT every 1 to 3 months for 6 months. Infant: single-antigen hepatitis B vaccine plus HBIG within 12 hours at separate sites, then complete the series. Breastfeeding is not prohibited.");
  src(s, "AASLD/IDSA 2025 R1, Hepatology 2026;83:974-997, PMID 41186418. CDC perinatal hepatitis B guidance.");
  return s;
});
ext(() => {
  const s = slide("Tenofovir in pregnancy: the trials");
  bars(s, [{ name: "TDF", labels: ["Pan 2016, intention to treat", "Pan 2016, per protocol"], values: [5, 0] }, { name: "Usual care", labels: ["Pan 2016, intention to treat", "Pan 2016, per protocol"], values: [18, 7] }],
    { x: 0.6, y: 1.3, w: 6.6, h: 4.3, colors: [NAVY, SLATE], max: 20, unit: 5, legend: true, labSize: 16, catSize: 14 });
  table(s, [["Jourdain 2018", "TDF", "Placebo"], ["Infected infants", "0 of 147", "3 of 147"], ["p", "0.12", ""]], { x: 7.6, y: 2.0, w: 5.2, size: 19, minRowH: 0.7 });
  s.addText("Infant HBIG and vaccine were given about an hour after birth in Thailand", { x: 7.6, y: 4.4, w: 5.2, h: 1.0, fontFace: "Georgia", fontSize: 17, isTextBox: true, margin: 0 });
  src(s, "Pan CQ et al. N Engl J Med 2016;374:2324-2334, PMID 27305192. Jourdain G et al. N Engl J Med 2018;378:911-923, PMID 29514030.");
  s.addNotes("Pan: 200 HBeAg-positive mothers with DNA above 200,000, TDF from week 30 to 32 to 4 weeks postpartum versus usual care: infant infection 5/97 (5%) vs 18/100 (18%) by intention to treat, 0 vs 6/88 (7%) per protocol. Post-withdrawal ALT elevations in mothers 45% vs 30%. Jourdain: 331 women, TDF from week 28 to 2 months postpartum: infant infection 0/147 vs 3/147 (2%), p = 0.12. A 2025 randomized trial (Pan, JAMA) starting TDF at week 16 without HBIG was noninferior to week 28 plus HBIG: 1/131 vs 0/142.");
});
mcq("Same woman, after delivery", "She is on TDF. Can she breastfeed?", [
  "No, tenofovir in breast milk harms the baby",
  "Yes",
  "Only after the vaccine series",
  "Only if her DNA is undetectable",
], 1, { file: "newborn-vaccine.png", alt: "Watercolor of a sleeping swaddled newborn beside a vaccine syringe on a tray" },
  "Breastfeeding is not prohibited (AASLD 2018 and AASLD/IDSA 2025). Tenofovir levels in breast milk are low, and the baby has had vaccine and HBIG. Let the room vote first; many think the answer is no.",
  "AASLD 2018 (PMID 29405329); AASLD/IDSA 2025 (PMID 41186418).");
{
  const s = slide("Pregnancy: summary");
  body(s, [
    "Test HBsAg in every pregnancy",
    "HBsAg positive: check DNA and ALT",
    { t: "DNA above 200,000: TDF or TAF from week 28", b: true },
    "Baby: hepatitis B vaccine and HBIG within 12 hours of birth, then finish the series",
    "Test the baby at 9 to 12 months: HBsAg and anti-HBs",
    "Breastfeeding is fine",
    "If she stops after delivery: DNA and ALT every 1 to 3 months for 6 months",
  ], { x: 0.6, y: 1.3, w: 7.6, h: 5.5, size: 21, gap: 10 });
  pic(s, "pregnant-patient.png", 8.5, 1.3, 4.5, 5.4, "Watercolor of a seated pregnant woman in profile");
  src(s, "AASLD/IDSA 2025 R1 (PMID 41186418); CDC 2023 (PMID 36893044); CDC perinatal hepatitis B guidance.");
  s.addNotes("AASLD/IDSA 2025 R1 (strong, moderate certainty): DNA above 200,000 at any point, start TDF or TAF at week 28; consider week 16 when infant HBIG is not available. Stopping at delivery is allowed when the drug was only for prevention. WHO 2024 also treats HBeAg-positive mothers regardless of DNA. Infant testing: HBsAg and anti-HBs, not anti-HBc. CDC 2023 screens every pregnancy. Mother on drug only for prevention and stops after delivery: DNA and ALT every 1 to 3 months for 6 months. Infant testing is at 9 to 12 months, or 1 to 2 months after a delayed final dose. Evidence: Pan, NEJM 2016 (transmission 5% vs 18% by intention to treat) and Jourdain, NEJM 2018 (0 vs 3 infected infants, p = 0.12).");
}
// ---------------------------------------------------------------- Stopping, cure, new drugs
sec("Stopping and what is new");
twoStep((step) => {
  const s = slide("Same man, 57 years old, five years on TAF");
  table(s, [["Condition for stopping", "Our patient", "Met?"],
    ["No cirrhosis or advanced disease", "Stiffness 5.9 kPa", ans(step, "Yes")],
    ["HBV DNA undetectable for 2 years or more", "Undetectable for 5 years", ans(step, "Yes")],
    ["HBsAg under 100 IU/mL", "400 IU/mL", ans(step, { t: "No", red: true, b: true })],
    ["HBeAg seroconversion 1 year or more", "In his late 40s", ans(step, "Yes")],
    ["No HIV or HDV", "Both negative", ans(step, "Yes")],
    ["Reliable follow-up", "Yes", ans(step, "Yes")]],
    { x: 0.4, y: 1.25, w: 8.6, size: 18, minRowH: 0.56 });
  pic(s, "man-52.png", 9.1, 1.3, 4.1, 5.0, "Watercolor of the same man in his fifties, gray at the temples, with reading glasses");
  q(s, "Can he stop?", 5.6, { size: 26, x: 0.4, w: 8.6 });
  if (step === 2) q(s, "No. Continue until HBsAg is lost", 6.2, { size: 22, hl: true, x: 0.4, w: 8.6 });
  src(s, "AASLD/IDSA 2025 R5. Hepatology 2026;83:974-997, PMID 41186418.");
  s.addNotes("HBeAg negative, started on TAF at 52. AASLD/IDSA 2025 R5 (conditional, very low certainty) suggests continuing until HBsAg loss; stopping only in exceptions: no advanced complications, DNA undetectable at least 2 years, qHBsAg under 100, no HIV or HDV, reliable follow-up. If HBeAg-positive at the start, seroconverted at least 1 year. The text says 2 years and the guideline's Figure 4 legend says 3, so quote 2 to 3. If you do stop: DNA and ALT every 1 to 3 months for 6 months, then every 3 months for 6 to 12 months, then every 3 to 6 months. Retreat for DNA 10,000 or more, ALT above 5 times ULN, bilirubin above 2.5 or decompensation (Table 3). Evidence in the extended version. Values are made up.");
  return s;
});
mcq("Same man: if he had stopped TAF", "Which result means restart now?", [
  "ALT 1.5 times ULN",
  "HBV DNA 10,000 IU/mL",
  "HBsAg 200 IU/mL",
  "Anti-HBs negative",
], 1, { file: "man-52.png", alt: "Watercolor of the same man in his fifties, gray at the temples, with reading glasses" },
  "AASLD/IDSA 2025 Table 3: restart at once for DNA 10,000 or more, ALT above 5 times ULN, bilirubin above 2.5 mg/dL, or decompensation. A mild ALT rise after stopping is expected and is watched, not treated straight away.",
  "AASLD/IDSA 2025 Table 3 (PMID 41186418).");
{
  const s = slide("Stopping: summary");
  body(s, [
    { t: "Default: continue until HBsAg is lost", b: true },
    { t: "Stop only if all of these:", b: true },
    "No cirrhosis",
    "DNA undetectable for 2 years or more",
    "If HBeAg positive at the start: seroconverted 1 year or more",
    "HBsAg under 100 IU/mL",
    "No HIV or HDV",
    "Reliable follow-up",
  ], { x: 0.5, y: 1.3, w: 5.7, h: 5.2, size: 21, gap: 8 });
  s.addText("After stopping", { x: 6.5, y: 1.3, w: 6.5, h: 0.45, fontFace: "Georgia", fontSize: 20, bold: true, align: "center", color: "000000", isTextBox: true, margin: 0 });
  fbox(s, "Months 0 to 6: DNA and ALT every 1 to 3 months", 6.7, 1.9, 6.2, 0.6, "watch", 16);
  farrow(s, 9.8, 2.5, 9.8, 2.75);
  fbox(s, "Months 6 to 12: every 3 months", 6.7, 2.75, 6.2, 0.6, "watch", 16);
  farrow(s, 9.8, 3.35, 9.8, 3.6);
  fbox(s, "After 12 months: every 3 to 6 months", 6.7, 3.6, 6.2, 0.6, "watch", 16);
  fbox(s, "Restart now: DNA 10,000 or more, ALT above 5 times ULN, bilirubin above 2.5 mg/dL, or decompensation", 6.7, 4.7, 6.2, 1.2, "treat", 17);
  src(s, "AASLD/IDSA 2025 R5 and Table 3 (PMID 41186418).");
  s.addNotes("R5 is conditional, very low certainty. The text says 2 years of suppression and the Figure 4 legend says 3. Follow-up and retreatment triggers are from Table 3; the table says ALT above 5 times ULN and the prose says 5 times or more.");
}
ext(() => {
  tableSlide("What happens when you stop", [["Study", "Patients", "HBsAg loss", "Retreatment"],
    ["STOP-NUC, randomized (Van Bommel 2023)", "166", "10.1% vs 0% at 96 weeks", "13.9%"],
    ["RETRACT-B, cohort (Hirode 2022)", "1,552", "3.2% at 12 months, 13.0% at 48 months", "–"],
    ["FINITE, randomized (Berg 2017)", "42", "4 of 21 (19%) in the stop arm at 144 weeks", "13 of 21 stayed off therapy"]],
    { size: 18, tbl: { minRowH: 0.9 } },
    "RETRACT-B: end-of-treatment HBsAg under 100 predicted loss (subdistribution HR 22.5, 13.1 to 38.7); loss was much more likely in White than Asian patients (HR 6.8). STOP-NUC: 79 per arm, DNA undetectable at least 4 years; in those with HBsAg under 1,000, loss was 7 of 25 (28%). Loss, relapse, retreatment and sustained remission are different endpoints and cannot be subtracted from each other. RETRACT-B retreatment: the overall rate is not in the abstract, so the cell is left empty. Severe flares can happen: a case of HBV-induced liver failure requiring emergency transplant after a finite-treatment strategy (REEF-2 report).",
    "van Bömmel F et al. J Hepatol 2023;78:926-936, PMID 37062574. Hirode G et al. Gastroenterology 2022;162:757-771, PMID 34762906. Berg T et al. J Hepatol 2017;67:918-924, PMID 28736139.");
  tableSlide("Definitions of cure", [["Endpoint", "Definition"],
    ["Functional cure", "HBsAg loss and HBV DNA below quantification, 24 weeks off therapy"],
    ["Partial cure", "HBsAg under 100 IU/mL and DNA below quantification, 24 weeks off therapy"],
    ["Sterilizing cure", "Elimination of the viral templates (cccDNA and integrated DNA)"]],
    { size: 21, tbl: { minRowH: 1.0 } },
    "From the 2022 AASLD/EASL endpoint conference report (published 2023). Standard nucleos(t)ide therapy rarely gives HBsAg loss. Functional cure does not show that cccDNA or integrated DNA are gone.",
    "Ghany MG et al. J Hepatol 2023;79:1254-1269, PMID 37377088.");
});
twoStep((step) => {
  const s = slide("Same man at 57: a new drug");
  q(s, "Is he a candidate for bepirovirsen?", 1.2, { size: 24, x: 0.4, w: 8.6 });
  table(s, [["FDA label", "Our patient", "Met?"],
    ["Adult, no cirrhosis", "Stiffness 5.9 kPa", ans(step, "Yes")],
    ["On a nucleos(t)ide analogue 6 months or more", "TAF for 5 years", ans(step, "Yes")],
    ["HBV DNA suppressed", "Undetectable", ans(step, "Yes")],
    ["HBsAg 3,000 IU/mL or lower", "400 IU/mL", ans(step, "Yes")]],
    { x: 0.4, y: 1.9, w: 8.6, size: 19, minRowH: 0.62 });
  pic(s, "man-52.png", 9.1, 1.3, 4.1, 5.0, "Watercolor of the same man in his fifties, gray at the temples, with reading glasses");
  if (step === 2) {
    q(s, "Yes. FDA approved 20 October 2026", 5.25, { size: 24, hl: true, x: 0.4, w: 8.6 });
    s.addText("About 1 in 5 had HBsAg loss 24 weeks after stopping all treatment; none on placebo", { x: 0.4, y: 5.9, w: 8.6, h: 0.8, fontFace: "Georgia", fontSize: 19, align: "center", valign: "middle", color: "000000", isTextBox: true, margin: 0 });
  }
  src(s, "FDA news release 20 October 2026. Hou J et al. N Engl J Med 2026;394:2395-2406, PMID 42206582 (B-Well 1 and 2).");
  s.addNotes("Bepirovirsen (Hibsago) is an antisense oligonucleotide given under the skin for up to 24 weeks, together with the existing antiviral, which continues for at least 24 weeks after the last injection; some patients can then stop it. Across the two trials 24% met the criteria to stop their existing medicine versus none on placebo, and 19% still had suppressed virus with undetectable HBsAg 24 weeks after stopping all hepatitis B treatment. FDA also authorized a Roche qHBsAg assay as a companion diagnostic. Boxed warning for serious liver reactions and low platelets; warnings include worsening kidney function and vasculitis. For hepatitis D, bulevirtide (Hepcludex) got FDA accelerated approval on 22 May 2026.");
  return s;
});
ext(() => {
  const s = slide("Bepirovirsen: B-Well 1 and 2");
  bars(s, [{ name: "Bepirovirsen", labels: ["B-Well 1", "B-Well 2"], values: [20, 19] }, { name: "Placebo", labels: ["B-Well 1", "B-Well 2"], values: [0, 0] }],
    { x: 0.6, y: 1.3, w: 7.0, h: 4.6, colors: [NAVY, SLATE], max: 25, unit: 5, legend: true, labSize: 18, catSize: 16 });
  body(s, ["Functional cure at week 72: HBsAg loss and DNA below quantification at least 24 weeks off all therapy", "127 of 650 vs 0 of 328, and 106 of 570 vs 0 of 286", "Trial entry: noncirrhotic, stable NA, HBsAg 100 to 3,000 IU/mL", "Grade 3 or higher adverse events 16% vs 3%"],
    { x: 7.9, y: 1.5, w: 5.0, h: 5.2, size: 17, gap: 10 });
  src(s, "Hou J et al. N Engl J Med 2026;394:2395-2406, PMID 42206582 (B-Well 1 and 2).");
  s.addNotes("The sponsor's phase 3 trials: 978 and 856 participants. The FDA pooled figure is 19%. The earlier phase 2b B-Clear (Yuen, NEJM 2022, 457 participants): 300 mg for 24 weeks gave sustained response in 9% on NA and 10% off NA. Eligibility is narrow (noncirrhotic, suppressed, low HBsAg), so this is not a cure rate for all patients with hepatitis B.");
});
ext(() => {
  sec("Other situations");
  tableSlide("Coinfection with HIV or HCV", [["Coinfection", "What to do"],
    ["HIV", "ART must include TDF or TAF plus emtricitabine or lamivudine. Entecavir alone is not HIV treatment"],
    ["HCV, HBsAg positive", "DNA every 4 to 8 weeks during direct-acting antivirals and for 3 months after"],
    ["HCV, HBsAg negative and anti-HBc positive", "Much lower risk. Check DNA and HBsAg if the ALT rises unexpectedly"]],
    { size: 19, tbl: { minRowH: 1.0 } },
    "AASLD 2018 guidance statements (ungraded). Current HIV guidance and drug interactions still need review before choosing the ART regimen.",
    "AASLD 2018, PMID 29405329.");
  tableSlide("Hepatitis D: who to test", [["", "AASLD 2018", "EASL 2025"],
    ["Who", "Risk-based: endemic origin, HIV, injection drug use, high ALT with low DNA", "Every HBsAg-positive patient, at least once"],
    ["How", "Total anti-HDV, then HDV RNA if positive", "Total anti-HDV, then HDV RNA"]],
    { size: 19, tbl: { minRowH: 1.2 } },
    "Total anti-HDV for exposure, HDV RNA for current infection. A nucleos(t)ide analogue suppresses HBV but does not treat HDV. In the core version, give this one line only: test every HBsAg-positive patient once.",
    "AASLD 2018, PMID 29405329; EASL 2025, PMID 40348683.");
  const s = slide("Bulevirtide for hepatitis D");
  bars(s, [{ name: "Bulevirtide", labels: ["Combined response", "HDV RNA undetectable"], values: [48, 20] }, { name: "Delayed treatment", labels: ["Combined response", "HDV RNA undetectable"], values: [2, 0] }],
    { x: 0.6, y: 1.3, w: 7.0, h: 4.4, colors: [NAVY, SLATE], max: 60, unit: 20, legend: true, labSize: 16, catSize: 15 });
  body(s, ["FDA accelerated approval 22 May 2026", "8.5 mg subcutaneously, once a day", "Adults without cirrhosis or with compensated cirrhosis", "Boxed warning: stopping can cause severe exacerbations"],
    { x: 7.9, y: 1.7, w: 5.0, h: 4.5, size: 19, gap: 12 });
  src(s, "FDA news release 22 May 2026. MYR301, week 48. Combined response: HDV RNA undetectable or 2 log decline, and normal ALT.");
  s.addNotes("MYR301 as described by FDA: immediate treatment with 8.5 mg once daily for 144 weeks versus delayed treatment (48 weeks observation, then treatment). Week 48 combined response 48% vs 2%; undetectable HDV RNA 20% vs 0%; at weeks 96 and 144 undetectable RNA 36% and 50%. Accelerated approval rests on this surrogate response; clinical benefit needs confirmation. Side effects: hypersensitivity, injection site reactions, headache, abdominal pain, fatigue, itching. The US label dose is 8.5 mg; MYR301 tested 2 and 10 mg (NEJM: 45% and 48%), and the EU dose is 2 mg. Gilead is the sponsor.");
  tableSlide("Cirrhosis and decompensation", [["Jang, observational", "Treated", "Untreated"], ["First decompensation, n = 707", "423", "284"], ["5-year transplant-free survival", "59.7%", "46.0%"], ["Delisted on treatment", "33.9%", ""]],
    { size: 21, tbl: { x: 0.5, w: 7.7, minRowH: 0.85 }, after: (s) => pic(s, "cirrhotic-liver.png", 8.4, 1.2, 4.7, 5.6, "Watercolor of a small nodular cirrhotic liver") },
    "Not randomized, and the antivirals were those of that era. Do not promise one-third delisting to every patient today. AASLD 2018 R7B: treat decompensated disease indefinitely regardless of DNA, ALT or HBeAg, and assess for transplant. PegIFN is contraindicated. The US TAF label does not recommend Child-Pugh B or C. Call transplant hepatology.",
    "Jang JW et al. Hepatology 2015;61:1809-1820, PMID 25627342.");
  {
    const s2 = slide("HBV and liver transplant");
    bars(s2, [{ name: "De novo HBV", labels: ["No prophylaxis", "Any prophylaxis", "HBIG alone", "Lamivudine alone", "HBIG plus lamivudine"], values: [48, 12, 19, 2.6, 2.8] }],
      { x: 0.6, y: 1.3, w: 7.4, h: 4.9, colors: [NAVY], max: 60, unit: 20, labSize: 15, catSize: 12, fmt: '0.0"%"', title: "De novo HBV after an anti-HBc-positive liver, %" });
    body(s2, ["Anti-HBc positive donor, HBV-naive recipient (Cholongitas, older regimens)", "Entecavir alone without HBIG: 265 recipients, 92% HBsAg negative and 100% DNA undetectable at 8 years (Fung)", "Long-term nucleos(t)ide analogue for HBsAg-negative recipients of anti-HBc-positive grafts"],
      { x: 8.3, y: 1.5, w: 4.7, h: 5.0, size: 17, gap: 12 });
    src(s2, "Cholongitas E et al. J Hepatol 2010;52:272-279, PMID 20034693. Fung J et al. Hepatology 2017;66:1036-1044, PMID 28370215. AASLD 2018.");
    s2.addNotes("Cholongitas: 39 studies, 903 recipients, regimens of that time, so the rates are not contemporary entecavir or tenofovir rates. AASLD 2018 supports indefinite high-barrier NA after transplant for HBV; selected low-risk patients may get no HBIG or 5 to 7 days plus NA, higher-risk patients (HIV, HDV, adherence concerns) HBIG plus NA. HBIG alone is not appropriate. Fung 2017: nine-year survival 85%, no fatal HBV recurrence reported.");
  }
  tableSlide("Children and adolescents", [["", "Who is treated"],
    ["AASLD 2018", "HBeAg-positive, age 2 to under 18, raised ALT and measurable DNA. Normal ALT: no routine treatment"],
    ["WHO 2024", "Adolescents 12 and older use the adult pathways. Younger children are individualized"],
    ["US labels", "Entecavir and TDF from age 2. TAF from age 6 and 25 kg"]],
    { size: 19, tbl: { x: 0.5, w: 7.7, minRowH: 1.0 }, after: (s) => pic(s, "newborn-vaccine.png", 8.4, 1.2, 4.7, 5.6, "Watercolor of a sleeping swaddled newborn beside a vaccine syringe on a tray") },
    "Label ages are approval ages, not indications to treat. WHO's noninvasive fibrosis cut-offs are not validated in children and adolescents.",
    "AASLD 2018 R9A and R9B; WHO 2024 chapter 8; DailyMed labels.");
});

ext(() => {
  tableSlide("In the pipeline", [["Agent", "Phase 2 result", "Caution"],
    ["Xalnesiran (siRNA)", "HBsAg loss 24 weeks off treatment: 3 to 7% alone, 23% with PegIFN, 0% on NA alone", "Background NA continued"],
    ["Elebsiran with PegIFN", "HBsAg loss 21% (200 mg) and 33% (100 mg) vs 6% with PegIFN alone", "NA stopping follow-up ongoing"]],
    { size: 20, tbl: { minRowH: 1.3 } },
    "The endpoints matter: HBsAg decline on NA, HBsAg loss with NA continuing, and sustained functional cure off all therapy are not the same. Xalnesiran (Hou 2024 NEJM, 159 participants; all HBsAg loss was at baseline HBsAg under 1,000). Elebsiran (ENSURE, Wong, Nat Med 2026): part 1 N = 55. JNJ-3989 REEF-1 (Yuen 2023, 470 randomized). Imdusiran (Yuen 2026) is phase 1. Checkpoint inhibitor trials: an imdusiran plus durvalumab registry entry was withdrawn with no enrollment, which says nothing about the class.",
    "Hou J et al. N Engl J Med 2024;391:2098-2109, PMID 39774313. Wong GLH et al. Nat Med 2026;32:151-159, PMID 41203919.");
});

// ---------------------------------------------------------------- Recap and close
sec("Close");
{
  const s = slide("Back to our patients");
  const P = [["man-52.png", "Watercolor of the man in his fifties", "Man, 34 to 57", "Monitor, surveillance from 41, TAF at 52. Now a candidate for bepirovirsen"],
    ["iv-infusion.png", "Watercolor of an IV bag and infusion pump", "Woman, 61, rituximab", "Entecavir, TDF or TAF before the first dose, 12 months after the last"],
    ["pregnant-patient.png", "Watercolor of a seated pregnant woman", "Woman, 29, pregnant", "TDF or TAF from week 28. Vaccine and HBIG within 12 hours"]];
  P.forEach((p, i) => {
    const x = 0.5 + i * 4.2;
    pic(s, p[0], x, 1.25, 3.9, 3.6, p[1]);
    s.addText(p[2], { x, y: 4.95, w: 3.9, h: 0.5, fontFace: "Georgia", fontSize: 20, bold: true, align: "center", valign: "middle", color: "000000", isTextBox: true, margin: 0 });
    s.addText(p[3], { x, y: 5.45, w: 3.9, h: 1.3, fontFace: "Georgia", fontSize: 17, align: "center", valign: "top", color: "000000", isTextBox: true, margin: 0 });
  });
  s.addNotes("Close the loop on the three patients. Then take questions.");
}
{
  const s = slide(null, { master: "BLANK" });
  const CLOSE = path.join(IMG, "closing-chb.jpg"), HAS_CLOSE = fs.existsSync(CLOSE);
  if (HAS_CLOSE) s.addImage({ path: CLOSE, x: -0.05, y: 0, w: 13.43, h: 7.5, altText: "Watercolor of a liver in warm light on ivory paper" });
  const cx = HAS_CLOSE ? 7.1 : 0.8, cw = HAS_CLOSE ? 5.7 : W - 1.6;
  s.addText("Questions?", { x: cx, y: 1.3, w: cw, h: 1.3, fontFace: "Georgia", fontSize: 54, align: "center", valign: "middle", color: "000000", isTextBox: true, margin: 0 });
  s.addText("X: @mfalmeqdadi", { x: cx, y: 2.75, w: cw, h: 0.5, fontFace: "Georgia", fontSize: 20, align: "center", color: "595959", isTextBox: true, margin: 0 });
  s.addImage({ path: path.join(IMG, QR_PDF), x: cx + cw / 2 - 1.25, y: 3.5, w: 2.5, h: 2.5, altText: "QR code linking to the slides PDF" });
  s.addText("Slides (PDF)", { x: cx, y: 6.1, w: cw, h: 0.35, fontFace: "Georgia", fontSize: 14, align: "center", color: "595959", isTextBox: true, margin: 0 });
  s.addNotes("The QR code opens the slides PDF. The HBV HCC risk calculator is at qaddodi.github.io/chb-hcc-risk.");
  endMain();
}

(async () => {
  addSlideNumbers();
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
