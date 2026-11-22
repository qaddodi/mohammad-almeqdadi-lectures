// Builds "Tachycardia-Induced Cardiomyopathy" in the style of Mohammad Almeqdadi's existing decks.
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
pres.title = "Tachycardia-Induced Cardiomyopathy";

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
  const fs = (o.size || 14) + (o.bump != null ? o.bump : 2);
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
  const rowH = lines.map((r) => Math.max(o.minRowH || Math.max(rows.length <= 6 ? 0.6 : 0.5, fs * 0.026), Math.max(...r) * lineH + rowPad));
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
// Screenshot from a paper, placed as it is
function shot(s, file, x, y, maxW, maxH, alt) {
  return pic(s, file, x, y, maxW, maxH, alt); // no border or outline on paper screenshots (MY_STYLE)
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

const COVER = path.join(IMG, "cover-tic.png");
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


// ---------------------------------------------------------------- Helpers for this deck
const QR_PDF = "qr-slides.png";
const has = (f) => fs.existsSync(path.join(IMG, f));
// Picture if the file is there, otherwise a dashed box that says what goes there
function spot(s, file, x, y, w, h, alt, desc) {
  if (has(file)) return pic(s, file, x, y, w, h, alt);
  holder(s, x, y, w, h, desc || alt);
  return { x, y, w, h };
}
// Section page on a Gemini watercolor; until the picture exists, a white page with the title and a box for it
function patientPage(title, sub, file, alt, side, notes) {
  let s;
  if (has(file)) s = bgDivider(title, sub, file, alt, side);
  else {
    s = pres.addSlide({ masterName: "BLANK", sectionTitle: section });
    const tx = side === "left" ? 0.6 : 7.1, px = side === "left" ? 6.9 : 0.6;
    s.addText(title, { x: tx, y: 1.55, w: 5.7, h: 2.2, fontFace: "Georgia", fontSize: 44, align: "center", valign: "bottom", color: "000000", isTextBox: true, margin: 0 });
    if (sub) s.addText(sub, { x: tx, y: 3.75, w: 5.7, h: 0.9, fontFace: "Georgia", fontSize: 22, align: "center", valign: "top", color: "595959", isTextBox: true, margin: 0 });
    holder(s, px, 0.9, 5.8, 5.7, "Gemini watercolor: " + alt + " (" + file + ")");
  }
  s.addNotes(notes);
  return s;
}
// Paper slide for trainees: title block first with "What do you think they found?", then the result.
// titleImg is the screenshot from the PDF; until it exists, a box with the citation.
function paperQ(title, titleImg, cite, result, source, notes, o = {}) {
  return twoStep((step) => {
    const s = slide(title);
    if (has(titleImg)) shot(s, titleImg, 0.6, 1.3, 6.0, 2.6, "Title block: " + cite);
    else holder(s, 0.6, 1.3, 6.0, 2.6, "Title block from the PDF: " + cite);
    if (o.setup) body(s, o.setup, { x: 0.6, y: 4.15, w: 6.0, h: 2.6, size: 20, gap: 8 });
    const R = { x: 7.0, y: 1.3, w: 5.8, h: 5.4 };
    if (step === 1) q(s, "What do you think they found?", 3.6, { x: R.x, w: R.w, h: 1.0 });
    else result(s, R);
    src(s, source);
    s.addNotes(notes);
    return s;
  });
}
const TL = (s, t, x, y, w, h, o = {}) => s.addText(t, { x, y, w, h, fontFace: "Georgia", fontSize: o.size || 20, bold: !!o.b, italic: !!o.i,
  align: o.align || "left", valign: o.valign || "top", color: o.color || "000000", highlight: o.hl ? HL : undefined, isTextBox: true, margin: 0 });

// ---------------------------------------------------------------- Cover
sec("Opening");
{
  const s = pres.addSlide({ masterName: "BLANK", sectionTitle: section });
  if (HAS_COVER) s.addImage({ path: COVER, x: -0.05, y: 0, w: 13.43, h: 7.5, altText: "Watercolor of an early string-galvanometer electrocardiograph" });
  else holder(s, 0.5, 0.6, 6.2, 6.3, "Gemini watercolor: 1910s string-galvanometer electrocardiograph, quiet zone on the right (cover-tic.png)");
  const tx = 7.1, tw = W - 7.1 - 0.45;
  s.addText("Tachycardia-Induced Cardiomyopathy", { x: tx, y: 1.45, w: tw, h: 1.9, fontFace: "Georgia", fontSize: 38, bold: true, align: "center", valign: "middle", color: "000000", isTextBox: true, margin: 0 });
  s.addShape(pres.shapes.LINE, { x: tx + 1.2, y: 3.6, w: tw - 2.4, h: 0, line: { color: "A6A6A6", width: 1 } });
  s.addText([
    { text: "Mohammad Almeqdadi, MD", options: { bold: true, fontSize: 20, breakLine: true } },
    { text: "Transplant Hepatologist and Gastroenterologist", options: { fontSize: 16, breakLine: true } },
    { text: "Assistant Professor of Medicine and Surgery", options: { fontSize: 16, breakLine: true } },
    { text: "X: @mfalmeqdadi", options: { fontSize: 16, color: "595959" } },
  ], { x: tx, y: 4.0, w: tw, h: 1.6, fontFace: "Georgia", align: "center", valign: "top", color: "000000", isTextBox: true, margin: 0, paraSpaceAfter: 4 });
  s.addImage({ path: LOGO_IMG, x: tx + 0.15, y: 5.85, w: 3.79, h: 0.77, altText: "Tufts University School of Medicine" });
  s.addImage({ path: path.join(IMG, QR_PDF), x: W - 1.7, y: 5.3, w: 1.3, h: 1.3, altText: "QR code linking to the slides PDF" });
  s.addText("Slides (PDF)", { x: W - 1.83, y: 6.65, w: 1.55, h: 0.3, fontFace: "Georgia", fontSize: 11, align: "center", color: "595959", isTextBox: true, margin: 0 });
  s.addText("Illustrations generated with Google Gemini", { x: 0.4, y: 7.0, w: 5, h: 0.3, fontFace: "Georgia", fontSize: 11, italic: true, color: "7F7F7F", isTextBox: true, margin: 0 });
  s.addNotes("The patients in this talk are made up for teaching. Three of them carry the talk: a man in the ED with a fast regular rhythm, a young woman with skipped beats, and an older man whose AF everyone thinks is controlled.");
}

// ---------------------------------------------------------------- Objectives
{
  const s = slide("Objectives");
  body(s, [{ t: "By the end of this talk you should be able to:", nb: true, i: true }], { x: 0.7, w: 7.6, y: 1.35, h: 0.5, size: 22 });
  body(s, [
    "Recognize when an arrhythmia may be causing the cardiomyopathy",
    "Work up new HFrEF with a fast or irregular rhythm",
    "Choose between rate control, rhythm control and ablation",
    "Know what to do after the EF comes back",
  ], { size: 22, gap: 14, x: 0.7, w: 7.4, y: 2.05, h: 4.8 });
  pic(s, "blood-tubes.png", 8.3, 1.2, 4.8, 5.7, "Watercolor of blood collection tubes in a rack");
  s.addNotes("Tachycardia-induced cardiomyopathy is the name most people know. The reviews now call the whole group arrhythmia-induced cardiomyopathy: tachycardias, AF even when the rate is controlled, and frequent PVCs. I use both names in this talk.");
}

// ---------------------------------------------------------------- Patient A
sec("Patient A");
patientPage("54M, short of breath for six weeks", "Orthopnea and leg swelling", "divider-ed-bay.png", "an emergency department bay with an empty stretcher and a monitor", "right",
  "He walks into the ED. Six weeks of dyspnea on one flight of stairs, two pillows at night, swollen ankles. No chest pain. Triage reads the ECG as sinus tachycardia.");
{
  const s = slide("In the ED");
  table(s, [["", "Hour 0"],
    ["Heart rate", { t: "148, regular", red: true }],
    ["Blood pressure", "104/72"],
    ["SpO2, room air", { t: "94%", red: true }],
    ["JVP", { t: "Angle of the jaw", red: true }],
    ["Lungs", { t: "Crackles at both bases", red: true }],
    ["Legs", { t: "2+ pitting edema", red: true }],
    ["Triage ECG read", "Sinus tachycardia"]],
    { x: 0.8, y: 1.45, w: 7.2, size: 20 });
  pic(s, "pocket-notebook.jpg", 8.4, 1.3, 4.5, 5.4, "Watercolor of a pocket notebook, a pen and a penlight");
  q(s, "What else do you want to know?", 6.2, { x: 0.8, w: 7.2, size: 22 });
  s.addNotes("Let them ask. You want: how long the palpitations have been there (he says he has felt his heart racing for 'a couple of months'), alcohol, stimulants, thyroid symptoms, family history of cardiomyopathy or sudden death, prior ECGs. Note the heart rate: 148 and not moving. Sinus tachycardia from heart failure wanders with each breath and with activity. A rate stuck at 148 is a reason to look at the ECG again.");
}
twoStep((step) => {
  const s = slide("Labs");
  table(s, [["", "Hour 0", "Normal"],
    ["NT-proBNP, pg/mL", { t: "5,200", red: true }, "<125"],
    ["hs-troponin T, ng/L", { t: "38 → 37", red: true }, "<14"],
    ["TSH, mIU/L", "1.8", "0.4 to 4.0"],
    ["Na, mEq/L", { t: "133", red: true }, "135 to 145"],
    ["Creatinine, mg/dL", { t: "1.3", red: true }, "0.7 to 1.2"],
    ["AST / ALT, U/L", { t: "86 / 104", red: true }, "<40"],
    ["Total bilirubin, mg/dL", { t: "2.6", red: true }, "<1.2"]],
    { x: 0.8, y: 1.45, w: 7.4, size: 20 });
  q(s, step === 1 ? "What do they tell you?" : "Heart failure with a congested liver. Troponin is flat", 6.15, { x: 0.6, w: W - 1.2, size: 22, hl: step === 2 });
  pic(s, "blood-tubes.png", 8.6, 1.3, 4.2, 4.6, "Watercolor of blood collection tubes in a rack");
  src(s, "Congestive liver tests: Lau GT et al. Am J Cardiol 2002;90:1405-9. PMID 12480058.");
  s.addNotes("High NT-proBNP and a flat, low-level troponin: demand, not an infarct. The liver tests are congestion: bilirubin and the cholestatic tests track right-sided pressure and tricuspid regurgitation (Lau 2002); a big AST/ALT rise would mean low output instead. They should come back to normal when the heart does, and they did in this patient.");
  return s;
});
twoStep((step) => {
  const s = slide("Hour 0 ECG");
  spot(s, "ecg-flutter-21.png", 0.6, 1.2, W - 1.2, 4.4, "12-lead ECG, regular narrow-complex tachycardia at 148",
    step === 1 ? "12-lead ECG at Hour 0, de-identified (ecg-flutter-21.png)"
      : "Same ECG with the flutter waves marked in II, III, aVF and V1 (ecg-flutter-21-marked.png)");
  q(s, step === 1 ? "What's the rhythm?" : "Atrial flutter with 2:1 conduction", 5.85, { hl: step === 2 });
  s.addNotes(step === 1 ? "Give them time. Most of the room will say sinus tachycardia, like triage did."
    : "Typical flutter goes around the tricuspid annulus at about 300 per minute. With 2:1 block the ventricle runs at about 150 and stays there. Every other flutter wave hides in the QRS or the T wave, so look at the inferior leads and V1, and look for a second P wave. If you can't tell, adenosine or a vagal maneuver slows AV conduction for a few seconds and the flutter waves show. A fixed rate near 150 is flutter until proven otherwise.");
  return s;
});
ext(() => twoStep((step) => {
  const s = slide("A regular narrow tachycardia at 150");
  table(s, [["", "What gives it away", "Can it cause cardiomyopathy?"],
    ["Sinus tachycardia", "Gradual onset, rate varies, P before each QRS", ans(step, "Yes, if it never stops")],
    ["Atrial flutter, 2:1", "Fixed rate near 150, saw-tooth in II, III, aVF", ans(step, { t: "Yes, often", b: true })],
    ["Focal atrial tachycardia", "Abnormal P axis, warm-up, can be incessant", ans(step, "Yes")],
    ["AVNRT", "Abrupt, no visible P or pseudo-r' in V1", ans(step, "Yes, rarely")],
    ["AVRT (orthodromic)", "Retrograde P in the ST segment", ans(step, "Yes")],
    ["PJRT", "Long RP, deep inverted P in II, III, aVF", ans(step, { t: "Yes, often", b: true })]],
    { x: 0.6, y: 1.45, w: W - 1.2, size: 18 });
  if (step === 1) q(s, "Which of these can do it?", 5.6);
  src(s, "Huizar JF et al. J Am Coll Cardiol 2019;73:2328-44, PMID 31072578. Shoureshi P et al. J Am Coll Cardiol 2024;83:2214-32, PMID 38811098.");
  s.addNotes("All of them can. The ones that do it most are the ones that don't stop: flutter with 2:1 block, incessant focal atrial tachycardia and PJRT, the permanent form of junctional reciprocating tachycardia that we see mostly in children and young adults. AVNRT rarely does it because it comes and goes.");
  return s;
}));
twoStep((step) => {
  const s = slide("Hour 2 echo");
  table(s, [["", "Hour 2"],
    ["LVEF", { t: "25%", red: true }],
    ["LV end-diastolic diameter", "56 mm"],
    ["Wall thickness", "9 mm"],
    ["Mitral regurgitation", { t: "Moderate, functional", red: true }],
    ["RV function", { t: "Mildly reduced", red: true }],
    ["IVC", { t: "2.6 cm, no collapse", red: true }],
    ["LA volume index", { t: "38 mL/m²", red: true }]],
    { x: 0.8, y: 1.45, w: 7.4, size: 18 });
  spot(s, "echo-a4c.png", 8.5, 1.3, 4.3, 4.5, "Apical four-chamber echo", "Apical 4-chamber echo still (his own image if he has one; echo-a4c.png)");
  q(s, step === 1 ? "What's going on?" : "New HFrEF. The LV isn't very big for an EF of 25%", 6.15, { x: 0.6, w: W - 1.2, size: 22, hl: step === 2 });
  s.addNotes("Severe systolic dysfunction, but the LV is only mildly dilated and there is no hypertrophy. Hold on to the 56 mm; it comes back in the diagnosis section. The left atrium is mildly enlarged (normal LA volume index is 34 mL/m² or less): weeks of flutter and high filling pressure stretch the atrium too. The MR is functional, from annular dilation, and usually improves with the EF.");
  return s;
});
{
  const s = slide("Which came first?");
  box(s, 1.2, 2.3, 4.6, 1.6, "Flutter at 148 for weeks", { size: 22 });
  box(s, 7.5, 2.3, 4.6, 1.6, "A weak LV", { size: 22 });
  arrow(s, 5.9, 2.85, 7.4, 2.85);
  box(s, 7.5, 4.6, 4.6, 1.6, "A weak LV", { size: 22 });
  box(s, 1.2, 4.6, 4.6, 1.6, "Flutter at 148", { size: 22 });
  arrow(s, 7.4, 5.4, 5.9, 5.4);
  s.addNotes("This is the question for the whole talk. A cardiomyopathy stretches the atria and causes AF and flutter. Fast AF and flutter weaken the ventricle. On the day he comes in you cannot tell which one started it. Ask the room to vote and keep the vote; we come back to it at month 3.");
}

// ---------------------------------------------------------------- History
sec("History");
{
  const s = slide("Where it comes from");
  timeline(s, [
    { y: "1913", t: "Gossage and Braxton Hicks: AF, heart failure, no other heart disease" },
    { y: "1949", t: "Phillips and Levine: AF as a cause of reversible heart failure" },
    { y: "1962", t: "Whipple: pace a normal dog heart fast and it fails" },
    { y: "1971", t: "Coleman, with Braunwald: heart failure after chronic tachycardia" },
    { y: "1986", t: "Packer names it: 8 patients, EF back after the tachycardia is fixed" },
  ], 2.6, 0.7, W - 0.7, 18);
  src(s, "QJM 1913;os6:435-440. Am J Med 1949;7:478-489. Whipple 1962, cited in Shinbane JS et al. JACC 1997;29:709-15, PMID 9091514. Am Heart J 1971;81:790-8, PMID 5088355. Am J Cardiol 1986;57:563-70, PMID 3953440.");
  s.addNotes("The idea is more than a hundred years old. In 1913, only a few years after Lewis showed that 'delirium cordis' was atrial fibrillation on the string galvanometer, Gossage and Braxton Hicks reported AF with congestive failure and no other heart disease. In 1949 Phillips and Levine called AF without other heart disease 'a cause of reversible heart failure'. The dog experiments made the point that tachycardia alone can make a normal heart fail, and that it recovers. Braunwald is on the 1971 paper. Packer gave it the name in 1986.");
}
ext(() => {
  {
    const s = slide("1913");
    shot(s, "gossage-1913a.png", 3.2, 1.3, 6.9, 1.2, "Title of Gossage and Braxton Hicks, QJM 1913");
    shot(s, "gossage-1913b.png", 1.9, 2.75, 9.5, 4.0, "Case I and Fig. 1 from Gossage and Braxton Hicks, QJM 1913");
    src(s, "Gossage AM, Braxton Hicks JA. On auricular fibrillation. QJM 1913;os6:435-440. doi 10.1093/oxfordjournals.qjmed.a069352.");
    s.addNotes("Case I is a 58-year-old grocer's assistant with a dilated heart and a very irregular rhythm. Fig. 1 is a jugular and radial pulse tracing, not an ECG; this is the era of the string galvanometer, before anyone recorded an ECG at the bedside. Phillips and Levine later summarized this paper: the autopsy showed a hypertrophied, dilated LV, and Gossage and Braxton Hicks thought the heart had been normal and the changes came from the arrhythmia. I have only the first page of the 1913 paper.");
  }
  {
    const s = slide("1949");
    shot(s, "phillips-1949a.png", 0.5, 1.4, 6.2, 2.0, "Title block of Phillips and Levine, Am J Med 1949");
    body(s, ["AF with no other heart disease can cause frank congestive heart failure", "Back in sinus rhythm, all evidence of heart disease may disappear", "They cite Gossage and Hicks: the dilated LV was a result of the arrhythmia"], { x: 0.5, y: 3.6, w: 6.2, h: 3.1, size: 19, gap: 8 });
    shot(s, "phillips-1949c.png", 7.1, 1.4, 5.8, 5.3, "Paragraph of Phillips and Levine citing Gossage and Hicks");
    src(s, "Phillips E, Levine SA. Am J Med 1949;7:478-489. doi 10.1016/0002-9343(49)90397-6.");
    s.addNotes("Read the subtitle: a cause of reversible heart failure. Their point was that some patients with AF and no other heart disease develop frank congestive failure, and all evidence of heart disease can disappear once sinus rhythm is restored. Samuel Levine, of Levine's sign and the Levine murmur grades, at the Peter Bent Brigham in Boston.");
  }
  {
    const s = slide("1971");
    spot(s, "coleman-1971.png", 1.2, 1.25, W - 2.4, 3.4, "Title block of Coleman et al., Am Heart J 1971", "Title block of Coleman HN 3rd ... Braunwald E. Congestive heart failure following chronic tachycardia. Am Heart J 1971;81:790-8 (PDF needed; coleman-1971.png)");
    body(s, ["Normal dog hearts paced fast for weeks: they dilate and fail", "Stop pacing: they recover"], { x: 1.2, y: 4.9, w: W - 2.4, h: 1.6, size: 22 });
    src(s, "Coleman HN 3rd, Taylor RR, Pool PE, Whipple GH, Covell JW, Ross J Jr, Braunwald E. Am Heart J 1971;81:790-8. PMID 5088355.");
    s.addNotes("Rapid pacing became the standard heart failure model for decades. In the animal reviews, hemodynamic changes start within 24 hours of rapid pacing, end-stage failure comes at 3 to 5 weeks, and after pacing stops the EF recovers over 1 to 2 weeks (Shinbane, JACC 1997).");
  }
});
twoStep((step) => {
  const s = slide("1986: Packer names it");
  (has("packer-1986.png") ? shot : spot)(s, "packer-1986.png", 0.6, 1.25, 6.3, 2.6, "Title block of Packer et al., Am J Cardiol 1986", "Title block of Packer DL et al. Tachycardia-induced cardiomyopathy: a reversible form of left ventricular dysfunction. Am J Cardiol 1986 (PDF needed; packer-1986.png)");
  body(s, ["8 patients, ages 5 to 57", "Tachycardia for 2.5 to 41 years", "7 had an accessory pathway, 1 an ectopic atrial focus", "Surgery or ablation of the pathway or focus"], { x: 0.6, y: 4.1, w: 6.3, h: 2.6, size: 19, gap: 6 });
  vbars(s, [
    { label: "Before", v: 19, color: RED, red: true },
    { label: "8 days after", v: 33, show: step === 2, color: SLATE },
    { label: "17 months after", v: 45, show: step === 2 },
  ], { x: 7.3, y: 1.7, w: 5.6, h: 3.9, max: 60 });
  TL(s, "Mean EF", 7.3, 1.2, 5.6, 0.4, { align: "center", size: 18, color: GREY });
  if (step === 1) q(s, "What happened to the EF?", 6.2, { x: 7.3, w: 5.6, size: 22 });
  src(s, "Packer DL, Bardy GH, Worley SJ, et al. Am J Cardiol 1986;57:563-70. PMID 3953440.");
  s.addNotes("Radionuclide EF 19% before. It rose to 33% about 8 days after the tachycardia was controlled and to 45% at a mean of 17 months. It improved in 6 of 8 at rest and in one more with exercise. Biopsies in 5 showed nothing specific. The title of the paper is the definition we still use: a reversible form of left ventricular dysfunction.");
  return s;
});

// ---------------------------------------------------------------- What it is
sec("What it is");
twoStep((step) => {
  const s = slide("Two kinds");
  table(s, [["", "What it means", "After the rhythm is fixed"],
    ["Pure (arrhythmia-induced)", ans(step, "The arrhythmia is the only cause"), ans(step, "EF usually normalizes")],
    ["Superimposed (arrhythmia-mediated)", ans(step, "Worsens existing heart disease"), ans(step, "EF improves, may not normalize")]],
    { x: 0.6, y: 1.5, w: W - 1.2, size: 19, bump: 0, minRowH: 1.0 });
  if (step === 1) q(s, "What's the difference?", 4.8);
  src(s, "Joglar JA et al. 2023 ACC/AHA/ACCP/HRS AF guideline. Circulation 2024;149:e1-e156, PMID 38033089. Fenelon G et al. PACE 1996;19:95-106, PMID 8848384.");
  s.addNotes("The 2023 AF guideline uses AF-induced for the pure form and AF-mediated for the superimposed one. You usually don't know which one you have on day 1. Both get better when you treat the rhythm, which is why you treat it either way. Either way, this is the moment to call EP.");
  return s;
});
twoStep((step) => {
  const s = slide("Which rhythms?");
  table(s, [["Rhythm", "Can it cause cardiomyopathy?"],
    ["Atrial fibrillation", ans(step, { t: "Yes, the most common, even when rate controlled", b: true })],
    ["Atrial flutter", ans(step, { t: "Yes, the next most common", b: true })],
    ["Focal atrial tachycardia", ans(step, "Yes")],
    ["AVRT, PJRT, AVNRT", ans(step, "Yes")],
    ["Ventricular tachycardia", ans(step, "Yes")],
    ["PVCs", ans(step, "Yes, at a high enough burden")],
    ["Sinus tachycardia", ans(step, "Yes, rarely")]],
    { x: 1.4, y: 1.4, w: W - 2.8, size: 20 });
  src(s, "Shoureshi P et al. J Am Coll Cardiol 2024;83:2214-32, PMID 38811098. Huizar JF et al. J Am Coll Cardiol 2019;73:2328-44, PMID 31072578.");
  s.addNotes("Every one of them. AF and flutter with a fast ventricular response are the most common causes. Three more that are related but are not in this group: chronic RV pacing, LBBB and pre-excitation. They hurt the ventricle through dyssynchrony, not rate. RV pacing comes back near the end.");
  return s;
});
twoStep((step) => {
  const s = slide("How fast does it have to be?");
  body(s, [{ t: "Focal atrial tachycardia, 345 ablations, Melbourne", nb: true }, "30 had a cardiomyopathy (10%)"], { x: 0.6, y: 1.4, w: 5.6, h: 1.4, size: 20 });
  vbars(s, [
    { label: "With cardiomyopathy", v: 117, text: "117", show: step === 2 },
    { label: "Without", v: 141, text: "141", show: step === 2, color: SLATE },
  ], { x: 6.6, y: 1.9, w: 6.2, h: 3.6, max: 160 });
  TL(s, "Heart rate during the tachycardia, bpm", 6.6, 1.35, 6.2, 0.4, { align: "center", size: 18, color: GREY });
  if (step === 1) q(s, "Faster or slower?", 3.6, { x: 0.6, w: 5.6 });
  else body(s, [{ t: "Slower, but it never stopped", hl: true, b: true, nb: true }, "Incessant in 100% vs 20%", "Suspect it with a mean HR >100"], { x: 0.6, y: 3.2, w: 5.6, h: 2.8, size: 21 });
  src(s, "Medi C, Kalman JM, Haqqani H, et al. J Am Coll Cardiol 2009;53:1791-7, PMID 19422986. HR >100: Huizar JF et al. JACC 2019, PMID 31072578.");
  s.addNotes("Most people guess faster. It was the opposite: the patients with cardiomyopathy had slower tachycardias, 117 vs 141, but theirs were incessant or nearly so (100% vs 20%). The ones at 141 had symptoms, came in, and got treated. The ones at 117 walked around for months. Time spent fast matters more than how fast. Patients with cardiomyopathy were also younger (39 vs 51) and more often male. Appendage foci were often incessant.");
  return s;
});
ext(() => twoStep((step) => {
  const s = slide("Does irregular matter, or just fast?");
  body(s, [{ t: "16 patients with AF, then AV node ablation", nb: true }, "Same mean rate, 102 bpm, paced two ways", "Regular, or replaying their own AF RR intervals"], { x: 0.6, y: 1.4, w: 5.6, h: 2.0, size: 20 });
  table(s, [["", "Regular", "Irregular"],
    ["Cardiac output, L/min", "5.2", ans(step, { t: "4.4", red: true })],
    ["PCWP, mmHg", "14", ans(step, { t: "17", red: true })],
    ["Right atrial pressure, mmHg", "8", ans(step, { t: "10", red: true })]],
    { x: 6.6, y: 1.6, w: 6.2, size: 20 });
  if (step === 1) q(s, "What happens when only the rhythm changes?", 5.0);
  else q(s, "Irregularity alone lowers cardiac output", 5.0, { hl: true });
  src(s, "Clark DM, Plumb VJ, Epstein AE, Kay GN. J Am Coll Cardiol 1997;30:1039-45, PMID 9316536.");
  s.addNotes("A neat experiment. After AV node ablation they paced the ventricle at the patient's own mean AF rate, once regular and once by replaying the patient's AF RR intervals from tape. Irregular pacing at the same rate dropped output and raised filling pressures. This is one reason AF can hurt the ventricle even when the rate looks controlled, which comes back with Patient C.");
  return s;
}));
{
  const s = slide("How long does it take?");
  gantt(s, { x: 0.6, y: 1.9, w: W - 1.2, labelW: 3.6, rowH: 0.95, ticks: ["0", "1 mo", "2 mo", "3 mo", "4 mo"],
    rows: [
      { label: "Develops", from: 0.1, to: 4.0, text: "3 to 120 days from the start of the tachycardia", fill: SLATE, dark: true },
      { label: "EF recovers", from: 1.0, to: 3.0, text: "4 to 12 weeks after it stops" },
    ] });
  TL(s, "Diagnosis confirmed when the EF is better within 6 months of getting rid of the arrhythmia", 4.2, 4.3, 8.4, 0.9, { size: 20, b: true });
  pic(s, "pocket-notebook.jpg", 0.7, 4.1, 3.0, 2.7, "Watercolor of a pocket notebook");
  src(s, "Shoureshi P, Tan AY, Koneru J, et al. J Am Coll Cardiol 2024;83:2214-32, PMID 38811098.");
  s.addNotes("In the clinical series it took anywhere from 3 days to 4 months to develop. In Watanabe's 12 patients the mean time from tachycardia to heart failure was 26 days. Recovery usually starts within weeks; most of it is there by 3 months. The diagnosis is made only when the EF comes back, within 6 months of getting rid of the arrhythmia.");
}
twoStep((step) => {
  const s = slide("Pig hearts paced at 240 for 3 weeks");
  table(s, [["", "Control", "3 weeks of pacing", "4 weeks off pacing"],
    ["Fractional shortening, %", "31", ans(step, { t: "15", red: true }), ans(step, "Back to control")],
    ["LV end-diastolic dimension, cm", "3.8", ans(step, { t: "5.6", red: true }), ans(step, { t: "4.2", red: true })],
    ["LV mass, g/kg", "2.6", ans(step, "2.6"), ans(step, { t: "3.3", red: true })],
    ["Myocyte length, µm", "109", ans(step, { t: "171", red: true }), ans(step, { t: "158", red: true })]],
    { x: 0.6, y: 1.5, w: W - 1.2, size: 20 });
  if (step === 1) q(s, "What happens to the ventricle?", 4.8);
  else body(s, ["Dilates without hypertrophy", "Function comes back, but the ventricle stays big and gets thicker"], { x: 0.9, y: 4.5, w: W - 1.8, h: 1.6, size: 21 });
  src(s, "Spinale FG et al. Circ Res 1991;69:1058-67, PMID 1934334.");
  s.addNotes("Three groups of six pigs. Pacing made long, stretched myocytes and a thin, dilated ventricle with the same mass. After pacing stopped the shortening fraction normalized, but the LV stayed dilated and the mass went up. Keep this in mind: in patients, 'recovered' does not mean the heart is back to normal.");
  return s;
});
ext(() => {
  const s = slide("What the biopsy shows");
  table(s, [["", "TIC", "Compared with"],
    ["Fibrosis", "Less", "DCM and inflammatory CM"],
    ["CD68+ macrophages", { t: "More", red: true }, "DCM"],
    ["T cells", "Fewer", "Inflammatory CM"],
    ["Mitochondria", { t: "Disordered distribution", red: true }, "DCM and inflammatory CM"],
    ["Myocyte size", { t: "Larger", red: true }, "Inflammatory CM"]],
    { x: 1.0, y: 1.5, w: W - 2.0, size: 20 });
  src(s, "Mueller KAL et al. J Am Coll Cardiol 2017;69:2160-72, PMID 28449778. 189 endomyocardial biopsies: 19 TIC, 79 DCM, 91 inflammatory CM.");
  s.addNotes("Endomyocardial biopsies in new HFrEF. The ones who turned out to have TIC had less fibrosis, which fits the recovery, but abnormal mitochondria and macrophage-dominant inflammation. Proposed mechanisms from animal work: energy depletion, abnormal calcium handling, beta-receptor downregulation and neurohormonal activation. We don't know why some people get it at a given rate and others don't.");
});

// ---------------------------------------------------------------- Diagnosis
sec("Diagnosis");
twoStep((step) => {
  const s = slide("What would you send?");
  table(s, [["Question", "Test"],
    ["Coronary disease?", ans(step, "Coronary CTA or cath")],
    ["Thyroid?", ans(step, "TSH")],
    ["Alcohol, cocaine, stimulants?", ans(step, "History, urine toxicology")],
    ["Iron overload?", ans(step, "Ferritin, transferrin saturation")],
    ["Scar, myocarditis, infiltration?", ans(step, "Cardiac MRI with gadolinium")],
    ["How much of the time is he fast?", ans(step, "Monitor for ≥2 weeks")]],
    { x: 0.6, y: 1.4, w: 8.0, size: 19 });
  pic(s, "blood-tubes.png", 8.9, 1.4, 4.0, 4.6, "Watercolor of blood collection tubes in a rack");
  src(s, "Shoureshi P et al. J Am Coll Cardiol 2024;83:2214-32, PMID 38811098.");
  s.addNotes("This is the usual new-cardiomyopathy workup. The two things specific to TIC are the CMR, because scar argues against a pure TIC, and the monitor: you want the rhythm and the rate over at least two weeks, and at least 6 days to get the real PVC burden. Family history: ask about cardiomyopathy and sudden death.");
  return s;
});
twoStep((step) => {
  const s = slide("TIC or idiopathic DCM?");
  table(s, [["", "TIC (n=21)", "Idiopathic DCM (n=21)"],
    ["EF better by ≥15% after treatment", ans(step, { t: "All", b: true }), ans(step, "None")],
    ["EF before and after", ans(step, "30% → 58%"), ans(step, "No change")],
    ["LV size", ans(step, { t: "Smaller", b: true }), ans(step, "Larger")],
    ["Heart transplant", ans(step, "0"), ans(step, { t: "4 (19%)", red: true })]],
    { x: 0.8, y: 1.5, w: W - 1.6, size: 20 });
  if (step === 1) q(s, "What looks different?", 4.6);
  else q(s, "LVEDD ≤61 mm: sensitivity 100%, specificity 71% for TIC", 4.6, { hl: true });
  src(s, "Jeong YH et al. Clin Cardiol 2008;31:172-8, PMID 18404727. Seoul; AF in 12, flutter in 5, atrial tachycardia in 3, SVT in 1.");
  s.addNotes("Small single-center study, but the point holds in other series: a ventricle that is very weak but not very big suggests a process of weeks to months, not years. In the multivariable model LVEDD was the only independent predictor. Patient A's LVEDD is 56 mm. Rate control and rhythm control did equally well in this study, which is older than the ablation trials.");
  return s;
});
twoStep((step) => {
  const s = slide("Does scar on MRI matter?");
  vbars(s, [
    { label: "No LGE", v: 73, show: step === 2 },
    { label: "LGE", v: 29, show: step === 2, color: SLATE },
  ], { x: 0.6, y: 1.9, w: 5.8, h: 3.5, max: 100 });
  TL(s, "EF normal 6 months after AF ablation", 0.6, 1.3, 5.8, 0.4, { align: "center", size: 18, color: GREY });
  vbars(s, [
    { label: "TIC from PVCs/VT (19)", v: 5, show: step === 2 },
    { label: "Primary CM (5)", v: 80, show: step === 2, color: SLATE },
  ], { x: 6.9, y: 1.9, w: 5.8, h: 3.5, max: 100 });
  TL(s, "LGE on cardiac MRI", 6.9, 1.3, 5.8, 0.4, { align: "center", size: 18, color: GREY });
  if (step === 2) q(s, "No scar, better odds of full recovery", 6.25, { hl: true });
  src(s, "Prabhu S et al. (CAMERA-MRI) J Am Coll Cardiol 2017;70:1949-61, PMID 28855115. Hasdemir C et al. PACE 2012;35:465-70, PMID 22303908.");
  s.addNotes("Left: the ablation arm of CAMERA-MRI. Without ventricular LGE, 73% had a normal EF at 6 months; with LGE, 29%. Right: in idiopathic ventricular arrhythmias, only 1 of 19 patients whose EF recovered had LGE, against 4 of 5 whose EF did not. LGE doesn't rule TIC out, but it lowers the odds of full recovery.");
  return s;
});
ext(() => {
  const s = slide("NT-proBNP after cardioversion");
  table(s, [["", "Value"],
    ["Patients", "40, HR ≥100 and EF <40%"],
    ["Measured", "Before and 1 week after cardioversion"],
    ["Ratio", "Before ÷ week 1"],
    ["Ratio ≥2.3 for TIC", { t: "Sensitivity 84%, specificity 95%", b: true }]],
    { x: 0.8, y: 1.5, w: 7.6, size: 19 });
  pic(s, "blood-tubes.png", 8.8, 1.4, 4.0, 4.4, "Watercolor of blood collection tubes in a rack");
  src(s, "Nia AM et al. Clin Res Cardiol 2011;100:887-96, PMID 21538234. Pilot study, single center.");
  s.addNotes("A pilot study, so I use it as a clue, not a test. In true TIC the NT-proBNP falls fast once the rhythm is fixed; with structural disease it falls less. Patient A went from 5,200 to 1,900 in a week, a ratio of 2.7.");
});
twoStep((step) => {
  const s = slide("So how do you prove it?");
  if (step === 2) {
    q(s, "You prove it afterwards", 1.6, { x: 0.6, w: 7.2, hl: true, size: 28 });
    body(s, ["Get rid of the arrhythmia, or control the rate", "Keep the GDMT going", "Re-image: EF better within 6 months, usually by 4 to 12 weeks"], { x: 0.6, y: 2.6, w: 7.2, h: 3.6, size: 22, gap: 14 });
  }
  spot(s, "echo-machine.png", 8.2, 1.3, 4.7, 5.4, "Watercolor of an echo machine beside an exam bed", "Gemini spot: echo machine beside an exam bed (echo-machine.png)");
  src(s, "Shoureshi P et al. J Am Coll Cardiol 2024;83:2214-32, PMID 38811098.");
  s.addNotes("There is no test that proves it on day 1. Everything in this section raises or lowers your suspicion. The diagnosis is the EF coming back once the rhythm is controlled. Some papers define it as an EF improvement of 15 points or more, or to normal.");
  return s;
});
twoStep((step) => {
  const s = slide("Back to Patient A, Day 1 to 2");
  table(s, [["Test", "Result"],
    ["Coronary CTA", "No stenosis"],
    ["TSH", "1.8"],
    ["Alcohol, drugs", "Two beers a week, no stimulants"],
    ["Ferritin, transferrin saturation", "210, 28%"],
    ["Cardiac MRI", { t: "No late gadolinium enhancement", b: true }],
    ["Telemetry", { t: "Flutter 2:1 the whole time", red: true }]],
    { x: 0.8, y: 1.4, w: W - 1.6, size: 20 });
  q(s, step === 1 ? "What do you make of it?" : "Probably. We'll know in 3 months", 5.75, { hl: step === 2 });
  s.addNotes("Everything points to TIC: no CAD, no other cause, an LV that isn't very big, no scar, and a rhythm that hasn't stopped in weeks. But the honest answer is: probably, and we'll know when we re-image him.");
  return s;
});

// ---------------------------------------------------------------- Treatment
sec("Treatment");
mcq("HR 148, BP 104/72, EF 25%", "Which one would you avoid?", ["Diltiazem drip", "IV metoprolol, small doses", "IV amiodarone", "Digoxin"], 0, { file: "echo-machine.png", alt: "Watercolor of an echo machine beside an exam bed" },
  "Diltiazem and verapamil are Class 3: Harm with an EF under 40% (2023 AF guideline, recommendation 11): they worsen heart failure. Beta-blocker if the blood pressure allows; start low. IV amiodarone is reasonable for acute rate control when a beta-blocker is not tolerated or not working (2a). Digoxin is reasonable as an add-on (2a). Anticoagulate: flutter carries the same stroke risk rules as AF, and you will need a TEE before cardioversion if he has been in flutter more than 48 hours.",
  "Joglar JA et al. 2023 ACC/AHA/ACCP/HRS AF guideline. Circulation 2024;149:e1-e156, PMID 38033089.");
twoStep((step) => {
  const s = slide("Rate or rhythm?");
  if (step === 1) q(s, "Rate control or rhythm control?", 3.4, { x: 0.6, w: 7.4 });
  else {
    q(s, "Rhythm", 1.45, { x: 0.6, w: 7.4, hl: true, size: 28 });
    table(s, [["New HFrEF with AF: early rhythm control", { t: "Class 1", b: true }],
      ["Typical flutter: isthmus ablation", "91% acute success"],
      ["AF after flutter ablation", { t: "34%", red: true }]],
      { x: 0.6, y: 2.4, w: 7.4, size: 18, bump: 0, header: false, minRowH: 0.75 });
  }
  spot(s, "ep-lab.png", 8.3, 1.3, 4.6, 5.4, "Watercolor of an electrophysiology lab table under a fluoroscopy arm", "Gemini spot: EP lab table under a fluoroscopy C-arm (ep-lab.png)");
  src(s, "Joglar JA et al. Circulation 2024;149:e1-e156, PMID 38033089. Pérez FJ et al. Circ Arrhythm Electrophysiol 2009;2:393-401, PMID 19808495 (158 studies, 10,719 patients).");
  s.addNotes("Rhythm. The guideline recommendation is written for AF and the flutter evidence points the same way. Typical flutter is one of the most curable arrhythmias: acute success about 91% in the meta-analysis, and recurrence fell to about 7% with modern catheters. Warn him about AF later: a third of patients develop it after flutter ablation, half of those who had AF before.");
  return s;
});
{
  const s = slide("What we did");
  table(s, [["When", "What"],
    ["Hour 0", "Heparin, metoprolol tartrate 12.5 mg, IV furosemide"],
    ["Day 2", "TEE, cardioversion, cavotricuspid isthmus ablation"],
    ["Day 2 on", "Metoprolol succinate, sacubitril/valsartan, spironolactone, dapagliflozin"],
    ["Week 1", "NT-proBNP 5,200 → 1,900"],
    ["Discharge", "Apixaban, wearable defibrillator discussed"]],
    { x: 0.8, y: 1.5, w: W - 1.6, size: 20 });
  s.addNotes("GDMT goes on as for any HFrEF; it helps reverse remodeling whatever the cause. Anticoagulation continues at least 4 weeks after cardioversion and then by CHA2DS2-VASc. A wearable defibrillator is an option in the gap before re-imaging; it is a discussion, not a rule.");
}
ext(() => twoStep((step) => {
  const s = slide("Will his EF come back?");
  body(s, [{ t: "111 patients ablated for persistent flutter", nb: true }, "28 (25%) had a cardiomyopathy"], { x: 0.6, y: 1.4, w: W - 1.2, h: 1.0, size: 20 });
  vbars(s, [
    { label: step === 2 ? "EF improved (16 of 28)" : "EF improved", v: 57, show: step === 2 },
    { label: step === 2 ? "EF normal (12 of 28)" : "EF normal", v: 43, show: step === 2 },
    { label: step === 2 ? "No longer met ICD criteria (9 of 19)" : "No longer met ICD criteria", v: 47, show: step === 2, color: SLATE },
  ], { x: 0.8, y: 2.6, w: W - 1.6, h: 3.0, max: 100 });
  if (step === 1) q(s, "What do you think?", 3.9);
  src(s, "Pizzale S et al. Can J Cardiol 2009;25:469-72, PMID 19668781.");
  s.addNotes("A quarter of patients with persistent flutter referred for ablation had a cardiomyopathy. More than half improved, and nearly half of those who met primary-prevention ICD criteria no longer did. The only independent predictor of recovery was the average ventricular rate during flutter.");
  return s;
}));
twoStep((step) => {
  const s = slide("Should he get an ICD now?");
  table(s, [["", "Hour 0", "Month 3"], ["LVEF", { t: "25%", red: true }, "?"]], { x: 0.6, y: 1.6, w: 7.2, size: 22 });
  if (step === 2) body(s, [{ t: "No. Re-image after ≥3 months of GDMT", hl: true, b: true, nb: true }, "Primary-prevention ICD criteria apply after that", "Wearable defibrillator in the meantime, case by case"], { x: 0.6, y: 3.2, w: 7.2, h: 3.0, size: 22, gap: 12 });
  spot(s, "wearable-defibrillator.png", 8.2, 1.3, 4.7, 5.4, "Watercolor of a wearable defibrillator vest folded on a chair", "Gemini spot: wearable defibrillator vest on a chair (wearable-defibrillator.png)");
  src(s, "Al-Khatib SM et al. 2017 AHA/ACC/HRS VA guideline. J Am Coll Cardiol 2018;72:e91-e220, PMID 29097296. Pizzale S et al. 2009, PMID 19668781.");
  s.addNotes("Primary-prevention ICD criteria are for an EF of 35% or less despite at least 3 months of GDMT. In TIC many patients cross that line on the way up, as in the flutter series. Sudden death after recovery does happen (Nerheim), which is why the wearable comes up, but there is no trial in TIC.");
  return s;
});
twoStep((step) => {
  const s = slide("Month 3");
  table(s, [["", "Hour 0", "Month 3"],
    ["Rhythm", { t: "Flutter 2:1, 148", red: true }, ans(step, "Sinus, 64")],
    ["LVEF", { t: "25%", red: true }, ans(step, { t: "55%", b: true })],
    ["LVEDD", "56 mm", ans(step, "54 mm")],
    ["Mitral regurgitation", { t: "Moderate", red: true }, ans(step, "Trace")],
    ["LA volume index, mL/m²", { t: "38", red: true }, ans(step, "31")],
    ["NT-proBNP, pg/mL", { t: "5,200", red: true }, ans(step, "160")],
    ["AST / ALT, bilirubin", { t: "86 / 104, 2.6", red: true }, ans(step, "Normal")]],
    { x: 1.2, y: 1.4, w: W - 2.4, size: 18 });
  if (step === 2) q(s, "This was tachycardia-induced cardiomyopathy", 5.95, { hl: true });
  s.addNotes("Now we can answer the question from the beginning: the flutter came first. Look back at your vote. Note the LV is barely smaller; the EF recovered faster than the size. That matters later.");
  return s;
});

// ---------------------------------------------------------------- Patient C
sec("Patient C");
patientPage("68M, persistent AF for 14 months", "Resting heart rate 82 on metoprolol", "divider-clinic-c.png", "a cardiology clinic room with a chair and an ECG machine", "left",
  "Different patient, different story. He was diagnosed with AF 14 months ago, rate controlled, anticoagulated. Now he is short of breath on hills.");
{
  const s = slide("Patient C");
  table(s, [["", "Clinic"],
    ["Rhythm", { t: "AF", red: true }],
    ["Resting HR / 24-hour mean", "82 / 88"],
    ["LVEF", { t: "35%", red: true }],
    ["LVEDD", "60 mm"],
    ["LA volume index", { t: "52 mL/m²", red: true }],
    ["Coronary CTA", "No stenosis"],
    ["Cardiac MRI", "No LGE"]],
    { x: 0.8, y: 1.4, w: 7.4, size: 18 });
  spot(s, "ecg-af.png", 8.5, 1.3, 4.4, 4.4, "ECG strip of atrial fibrillation at about 82", "Rhythm strip: AF at about 82 (ecg-af.png)");
  q(s, "What do you think is weakening his LV?", 6.0, { size: 22 });
  s.addNotes("The usual answer in clinic is: rate controlled, so the AF isn't the problem, it's a cardiomyopathy that happens to have AF. Ask the room to vote again. The trials that follow answer it.");
}
ext(() => paperQ("AF-CHF, 2008", "afchf-title.png", "Roy D et al. Rhythm control versus rate control for atrial fibrillation and heart failure. N Engl J Med 2008",
  (s, R) => {
    TL(s, "Cardiovascular death, mean 37 months", R.x, R.y, R.w, 0.4, { align: "center", size: 18, color: GREY });
    vbars(s, [{ label: "Rhythm control (drugs)", v: 27 }, { label: "Rate control", v: 25, color: SLATE }], { x: R.x, y: R.y + 0.9, w: R.w, h: 3.6, max: 40 });
  },
  "Roy D et al. N Engl J Med 2008;358:2667-77, PMID 18565859. 1,376 patients, EF ≤35%; mostly amiodarone.",
  "No difference: 27% vs 25%, HR 1.06. This trial is why rate control became the default in heart failure. The catch: rhythm control was antiarrhythmic drugs, mostly amiodarone, and many patients were not in sinus rhythm much of the time. Drugs keep sinus rhythm in about 30 to 50%; ablation does better.",
  { setup: ["1,376 patients, EF ≤35%, history of AF", "Rhythm control with drugs vs rate control"] }));
paperQ("CASTLE-AF, 2018", "castle-af-title.png", "Marrouche NF et al. Catheter ablation for atrial fibrillation with heart failure. N Engl J Med 2018",
  (s, R) => {
    TL(s, "Death or HF admission", R.x, R.y, R.w / 2, 0.4, { align: "center", size: 17, color: GREY });
    TL(s, "Death", R.x + R.w / 2, R.y, R.w / 2, 0.4, { align: "center", size: 17, color: GREY });
    vbars(s, [{ label: "Ablation", v: 28.5, text: "28.5%" }, { label: "Drugs", v: 44.6, text: "44.6%", color: SLATE },
      { label: "Ablation", v: 13.4, text: "13.4%" }, { label: "Drugs", v: 25.0, text: "25.0%", color: SLATE }], { x: R.x, y: R.y + 0.9, w: R.w, h: 3.6, max: 50 });
  },
  "Marrouche NF et al. N Engl J Med 2018;378:417-27, PMID 29385358. Europe, Australia and the US; median 37.8 months.",
  "363 patients with EF ≤35% and an ICD. Ablation cut death or heart failure admission from 44.6% to 28.5% (HR 0.62) and all-cause death from 25.0% to 13.4% (HR 0.53). Limits: highly selected (3,013 screened), open label, and the device let them measure AF burden. These were not TIC patients by definition, but many probably were.",
  { setup: ["363 patients, EF ≤35%, NYHA II to IV, all with an ICD", "Ablation vs rate or rhythm control with drugs"] });
paperQ("CAMERA-MRI, 2017", "camera-mri-title.png", "Prabhu S et al. Catheter ablation versus medical rate control in atrial fibrillation and systolic dysfunction: the CAMERA-MRI study. J Am Coll Cardiol 2017",
  (s, R) => {
    TL(s, "EF change, points", R.x, R.y, R.w / 2, 0.4, { align: "center", size: 17, color: GREY });
    TL(s, "EF ≥50% at 6 months", R.x + R.w / 2, R.y, R.w / 2, 0.4, { align: "center", size: 17, color: GREY });
    vbars(s, [{ label: "Ablation", v: 18, text: "+18" }, { label: "Rate control", v: 4.4, text: "+4.4", color: SLATE },
      { label: "Ablation", v: 58, text: "58%" }, { label: "Rate control", v: 9, text: "9%", color: SLATE }], { x: R.x, y: R.y + 0.9, w: R.w, h: 3.6, max: 70 });
  },
  "Prabhu S et al. J Am Coll Cardiol 2017;70:1949-61, PMID 28855115. Australia. 4-year follow-up: Sugumar H et al. JACC Clin EP 2020;6:1721-31, PMID 33334453.",
  "This is the trial for Patient C. Persistent AF, EF 45% or less with no other explanation, and the rate already optimized. Ablation (pulmonary vein and posterior wall isolation) vs continued rate control. At 6 months the EF rose 18 points vs 4.4, and was normal in 58% vs 9%. Without LGE, 73% normalized. At 4 years the ablation group was still ahead (+16.4 vs +8.6), even though AF had come back in 57% at a low burden. Done in Australia, 68 patients, MRI-measured EF.",
  { setup: ["68 patients, persistent AF, unexplained EF ≤45%, rate already controlled", "Ablation vs continued rate control"] });
twoStep((step) => {
  const s = slide("What about the atria?");
  body(s, [
    "Normal LA volume index: ≤34 mL/m²",
    "AF-CHF, CASTLE-AF, CASTLE-HTx: LA diameter about 49 mm at entry",
    "CAMERA-MRI: LA volume index 54 mL/m² at entry",
  ], { x: 0.6, y: 1.5, w: 5.6, h: 3.6, size: 19, gap: 10 });
  TL(s, "CAMERA-MRI: LA volume index, mL/m²", 6.5, 1.3, 6.4, 0.4, { align: "center", size: 17, color: GREY });
  vbars(s, [
    { label: "Ablation, entry", v: 54.4, text: "54" },
    { label: "Ablation, 6 months", v: 43.4, text: "43", show: step === 2 },
    { label: "Rate control, entry", v: 53.9, text: "54", color: SLATE },
    { label: "Rate control, 6 months", v: 55.6, text: "56", color: SLATE, show: step === 2 }],
    { x: 6.5, y: 2.0, w: 6.4, h: 3.0, max: 70 });
  if (step === 1) q(s, "What happens to the atrium?", 6.2, { x: 0.6, w: 5.6, size: 22 });
  else q(s, "Ablation: 12 mL/m² smaller. Rate control: no change", 6.2, { x: 0.6, w: W - 1.2, size: 22, hl: true });
  src(s, "Prabhu S et al. J Am Coll Cardiol 2017;70:1949-61, PMID 28855115 (Table 2). Lang RM et al. J Am Soc Echocardiogr 2015;28:1-39, PMID 25559473. Roy D 2008; Marrouche NF 2018; Sohns C 2023 (baseline tables).");
  s.addNotes("The trial patients all had big atria: a mean or median LA diameter of 48 to 50 mm in AF-CHF, CASTLE-AF and CASTLE-HTx, and an LA volume index of 54 mL/m² in CAMERA-MRI, against a normal of 34 or less (ASE/EACVI 2015; index the volume, the diameter underestimates). In CAMERA-MRI the LA volume index fell by 12 mL/m² with ablation and did not change with rate control (P <0.0001). The atrium remodels in both directions: AF makes it bigger, and sinus rhythm lets it shrink.");
  return s;
});
ext(() => paperQ("CASTLE-HTx, 2023", "castle-htx-title.png", "Sohns C et al. Catheter ablation in end-stage heart failure with atrial fibrillation. N Engl J Med 2023",
  (s, R) => {
    TL(s, "Death, LVAD or urgent transplant", R.x, R.y, R.w, 0.4, { align: "center", size: 18, color: GREY });
    vbars(s, [{ label: "Ablation + GDMT", v: 8, text: "8%" }, { label: "GDMT", v: 30, text: "30%", color: SLATE }], { x: R.x, y: R.y + 0.9, w: R.w, h: 3.6, max: 40 });
  },
  "Sohns C et al. N Engl J Med 2023;389:1380-9, PMID 37634135. One center in Germany; stopped early for efficacy.",
  "194 patients referred for heart transplant evaluation with symptomatic AF. Ablation plus GDMT vs GDMT alone. 8% vs 30% for death, LVAD or urgent transplant, HR 0.24; all-cause death 6% vs 20%. One center, open label, stopped early, so the effect is probably smaller than this. Still: check the rhythm before listing someone for a heart.",
  { setup: ["194 patients with end-stage HF referred for heart transplant, with AF", "Ablation + GDMT vs GDMT alone"] }));
{
  const s = slide("What the 2023 guideline says");
  table(s, [["Recommendation", "Class"],
    ["New HFrEF with AF: suspect arrhythmia-induced CM, early rhythm control", { t: "1", b: true }],
    ["Ablation in selected AF + HFrEF on GDMT", { t: "1", b: true }],
    ["Diltiazem or verapamil when EF <40%", { t: "3: Harm", red: true }],
    ["Digoxin or IV amiodarone for rate control in HF", "2a"],
    ["After recovery: long-term rhythm surveillance", "2a"],
    ["Suspected TIC on rate control: HR <80 at rest, <110 with exercise", "2b"],
    ["Rate control fails: AV node ablation + biventricular pacing", "2a"],
    ["After AV node ablation: conduction system pacing instead of biventricular", "2b"]],
    { x: 0.6, y: 1.35, w: W - 1.2, size: 18 });
  src(s, "Joglar JA et al. 2023 ACC/AHA/ACCP/HRS AF guideline. Circulation 2024;149:e1-e156, PMID 38033089 (section 9.2, paraphrased).");
  s.addNotes("Paraphrased from section 9.2. The two Class 1 recommendations are the practice change: suspect it in every new HFrEF with AF, and use ablation in the right patient. For rate targets the evidence is weak: RACE II showed lenient control (<110 at rest) was as good as strict control (<80) in permanent AF, but those were not TIC patients, so in suspected TIC the guideline allows a stricter target.");
}
ext(() => twoStep((step) => {
  const s = slide("When rhythm control fails");
  body(s, [{ t: "133 patients, permanent AF, narrow QRS, HF admission in the past year", nb: true }, "AV junction ablation + CRT vs drugs for rate control"], { x: 0.6, y: 1.4, w: W - 1.2, h: 1.0, size: 20 });
  vbars(s, [{ label: "Ablate + CRT", v: 11, text: "11%", show: step === 2 }, { label: "Drugs", v: 29, text: "29%", show: step === 2, color: SLATE }], { x: 2.5, y: 3.0, w: 8.3, h: 2.6, max: 40 });
  TL(s, "All-cause death, median 29 months", 2.5, 2.5, 8.3, 0.4, { align: "center", size: 18, color: GREY });
  if (step === 1) q(s, "What do you think?", 4.0);
  src(s, "Brignole M et al. (APAF-CRT) Eur Heart J 2021;42:4731-9, PMID 34453840. Europe; stopped early for efficacy.");
  s.addNotes("When you can't keep sinus rhythm and you can't control the rate, ablate the AV junction and pace. In APAF-CRT, with biventricular pacing, death fell from 29% to 11% (HR 0.26), whatever the baseline EF. The guideline now also allows conduction system pacing as an alternative to biventricular pacing (2b). It is permanent pacemaker dependence, so it's a last step, not a first.");
  return s;
}));
twoStep((step) => {
  const s = slide("Which pacing after AV node ablation?");
  body(s, [{ t: "CONDUCT-AF: 82 patients, refractory AF, EF <50%, QRS ≤120 ms", nb: true },
    "Left bundle branch area pacing vs biventricular pacing"], { x: 0.6, y: 1.4, w: W - 1.2, h: 1.0, size: 20 });
  TL(s, "LVEF, %", 2.5, 2.55, 8.3, 0.4, { align: "center", size: 18, color: GREY });
  vbars(s, [
    { label: "Left bundle, entry", v: 36, text: "36" },
    { label: "Left bundle, 6 months", v: 46, text: "46", show: step === 2 },
    { label: "Biventricular, entry", v: 34, text: "34", color: SLATE },
    { label: "Biventricular, 6 months", v: 46, text: "46", color: SLATE, show: step === 2 }],
    { x: 2.5, y: 2.95, w: 8.3, h: 2.2, max: 60 });
  if (step === 1) q(s, "What do you think?", 6.2, { size: 22 });
  else q(s, "Same EF gain. Paced QRS 14 ms narrower, shorter procedure", 6.2, { hl: true, size: 22 });
  src(s, "Žižek D et al. (CONDUCT-AF) Eur Heart J 2026, online Oct 6, PMID 42834810. 10 centers in Europe; non-inferiority. His bundle: Huang W et al. (ALTERNATIVE-AF) Heart Rhythm 2022;19:1948-55, PMID 35843465.");
  s.addNotes("CONDUCT-AF was published this October: 82 patients with refractory AF, EF under 50%, narrow QRS and NT-proBNP over 600, randomized to left bundle branch area pacing or biventricular pacing after AV node ablation. EF went from 36% to 46% with left bundle pacing and from 34% to 46% with biventricular pacing; the difference was 0.4 points, so left bundle pacing was non-inferior. Heart failure events were similar, the paced QRS was 14 ms narrower, and procedure and fluoroscopy times were shorter. Before that, ALTERNATIVE-AF (50 patients, crossover) found His bundle pacing a little better than biventricular for EF. The 2023 AF guideline gives conduction system pacing a 2b here; that was written before CONDUCT-AF.");
  return s;
});
{
  const s = slide("Patient C, 6 months later");
  table(s, [["", "Before", "6 months after ablation"],
    ["Rhythm", { t: "AF, 82", red: true }, "Sinus, 62"],
    ["LVEF", { t: "35%", red: true }, { t: "52%", b: true }],
    ["LVEDD", "60 mm", "57 mm"],
    ["LA volume index", { t: "52 mL/m²", red: true }, "42 mL/m²"]],
    { x: 0.6, y: 1.6, w: 7.3, size: 20 });
  q(s, "A controlled rate does not rule it out", 5.0, { hl: true, x: 0.6, w: 7.3 });
  spot(s, "patient-c-walking.png", 8.3, 1.3, 4.6, 5.4, "Watercolor of a man in his late sixties walking outdoors", "Gemini spot: Patient C walking outdoors (patient-c-walking.png)");
  s.addNotes("His EF came back once he was in sinus rhythm, even though his rate had been fine. Irregularity, loss of atrial contraction and episodes of fast rates the clinic visit never sees all play a part.");
}

// ---------------------------------------------------------------- Patient B
sec("Patient B");
patientPage("38F, skipped beats for a year", "Mildly short of breath on stairs", "divider-holter.png", "a Holter monitor and its leads on a bedside table", "right",
  "A 38-year-old teacher. Palpitations she describes as skipped beats, worse lying down, for about a year. Now a little short of breath on stairs. Her primary care doctor got a Holter.");
twoStep((step) => {
  const s = slide("Her Holter and echo");
  table(s, [["", "Result"],
    ["Total beats, 24 hours", "112,400"],
    ["PVCs", { t: "29,224 (26%)", red: true }],
    ["Morphology", "Monomorphic, LBBB, inferior axis"],
    ["Nonsustained VT", "None"],
    ["LVEF / LVEDD", { t: "40% / 58 mm", red: true }],
    ["QRS in sinus", "96 ms"],
    ["Cardiac MRI", "No LGE"]],
    { x: 0.8, y: 1.4, w: 7.4, size: 20 });
  spot(s, "ecg-pvc.png", 8.5, 1.3, 4.4, 4.4, "Rhythm strip with ventricular bigeminy", "Rhythm strip: frequent monomorphic PVCs, bigeminy (ecg-pvc.png)");
  q(s, step === 1 ? "How many PVCs is too many?" : "26% is enough to do this", 6.1, { hl: step === 2, size: 22 });
  s.addNotes("LBBB morphology with an inferior axis is the right ventricular outflow tract until proven otherwise, the most common site for idiopathic PVCs, and one of the easiest to ablate. One Holter day can under- or overestimate the burden; at least 6 days of monitoring gets closer to the real number.");
  return s;
});
twoStep((step) => {
  const s = slide("PVC burden and EF");
  body(s, [{ t: "174 patients referred for PVC ablation, Michigan", nb: true }, "57 (33%) had a low EF"], { x: 0.6, y: 1.4, w: 5.8, h: 1.2, size: 20 });
  vbars(s, [{ label: "Low EF", v: 33, show: step === 2 }, { label: "Normal EF", v: 13, show: step === 2, color: SLATE }], { x: 6.9, y: 1.9, w: 5.9, h: 3.5, max: 50 });
  TL(s, "Mean PVC burden", 6.9, 1.35, 5.9, 0.4, { align: "center", size: 18, color: GREY });
  if (step === 1) q(s, "Where would you draw the line?", 3.8, { x: 0.6, w: 5.8 });
  else body(s, [{ t: ">24% best separated the groups", b: true, hl: true, nb: true }, "Sensitivity 79%, specificity 78%", "Lowest burden that caused it: 10%"], { x: 0.6, y: 3.0, w: 5.8, h: 2.8, size: 21 });
  src(s, "Baman TS et al. Heart Rhythm 2010;7:865-9, PMID 20348027.");
  s.addNotes("This is where the 10% and 24% numbers come from. Other series put the cutoff at 16% (Hasdemir, 6.8% of 249 patients with idiopathic PVCs/VT had TIC). The reviews say suspect it at a burden of 10% or more, and some patients improve after ablation at burdens as low as 6 to 8%.");
  return s;
});
ext(() => {
  const s = slide("Outside the EP lab");
  body(s, [{ t: "Cardiovascular Health Study: 1,139 older adults, normal EF, a random 24-hour Holter", nb: true }, "Top vs bottom quartile of PVCs, followed more than 13 years"], { x: 0.6, y: 1.35, w: W - 1.2, h: 1.1, size: 19 });
  forest(s, [
    { label: "EF drop at 5 years", hr: 3.10, lo: 1.42, hi: 6.77 },
    { label: "New heart failure", hr: 1.48, lo: 1.08, hi: 2.04 },
    { label: "Death", hr: 1.31, lo: 1.06, hi: 1.63 },
  ], { x: 0.6, y: 2.8, w: 9.6, labelW: 3.0, min: 0, max: 7, ticks: [0, 1, 2, 3, 4, 5, 6, 7], rowH: 0.95, axisL: "", axisR: "More PVCs, worse" });
  src(s, "Dukes JW et al. J Am Coll Cardiol 2015;66:101-9, PMID 26160626. Odds ratio for EF drop, hazard ratios for heart failure and death.");
  s.addNotes("Population data, not referral data. PVCs were associated with a falling EF, incident heart failure and death. The population-attributable risk of heart failure from PVCs was 8%. Association, not proof, but it fits the referral series.");
});
twoStep((step) => {
  const s = slide("Ablation vs no ablation");
  table(s, [["", "n", "EF before", "EF after"],
    ["Successful ablation", "22", { t: "34%", red: true }, ans(step, { t: "59%", b: true })],
    ["Ablation failed", "4", { t: "34%", red: true }, ans(step, { t: "25%", red: true })],
    ["No ablation", "11", { t: "28%", red: true }, ans(step, { t: "Unchanged in 10 of 11", red: true })]],
    { x: 1.0, y: 1.6, w: W - 2.0, size: 21 });
  if (step === 1) q(s, "What happened to the EF?", 4.4);
  else q(s, "EF normal in 18 of 22 after a successful ablation", 4.6, { hl: true });
  src(s, "Bogun F et al. Heart Rhythm 2007;4:863-7, PMID 17599667. Not randomized.");
  s.addNotes("Not randomized, but the comparison is hard to argue with: get rid of the PVCs and the EF comes back; fail, or don't try, and it doesn't. One patient in the no-ablation group went on to heart transplant. Drugs are the alternative: beta-blockers, and flecainide in a structurally normal heart; amiodarone if the EF is low and ablation isn't an option.");
  return s;
});
twoStep((step) => {
  const s = slide("Will she recover?");
  table(s, [["Predicts the EF will not normalize", "Cutoff", "Patient B"],
    ["Intrinsic QRS", ans(step, ">130 ms"), "96 ms"],
    ["PVC burden", ans(step, "<17%"), "26%"],
    ["LVEDD", ans(step, ">63 mm"), "58 mm"]],
    { x: 1.0, y: 1.6, w: W - 2.0, size: 21 });
  if (step === 2) { q(s, "She has none of the three", 4.4, { hl: true }); TL(s, "Any one of them: sensitivity 85%, specificity 98% for not normalizing", 0.9, 5.2, W - 1.8, 0.5, { align: "center", size: 18, color: GREY }); }
  src(s, "Penela D et al. Heart Rhythm 2017;14:1864-70, PMID 28756100. 155 patients ablated for PVCs with a low EF.");
  s.addNotes("Of the patients without known heart disease, about half normalized after PVCs were gone (pure PVC-induced) and half improved only partly (PVC-worsened). A wide QRS, a low burden or a big ventricle points to a cardiomyopathy that was there first. She has none of the three. She had her RVOT focus ablated; EF 58% at 4 months.");
  return s;
});
ext(() => {
  const s = slide("What the ESC guideline says");
  table(s, [["2022 ESC ventricular arrhythmia guideline", "Wording"],
    ["Unexplained low EF and PVC burden ≥10%: think of PVC-induced CM", "Should be considered"],
    ["Suspected PVC-induced CM: cardiac MRI", "Should be considered"],
    ["CM from frequent, mostly monomorphic PVCs: catheter ablation", { t: "Is recommended", b: true }]],
    { x: 0.6, y: 1.6, w: 7.5, size: 16 });
  spot(s, "ep-lab.png", 8.4, 1.3, 4.5, 5.3, "Watercolor of an electrophysiology lab table under a fluoroscopy arm", "Gemini spot: EP lab table under a fluoroscopy C-arm (ep-lab.png)");
  src(s, "Zeppenfeld K et al. Eur Heart J 2022;43:3997-4126, PMID 36017572 (as summarized by the ACC).");
  s.addNotes("ESC wording: 'is recommended' is Class I and 'should be considered' is Class IIa. [I read these from the ACC summary; check the class against the guideline table before presenting.] There is no US PVC guideline more recent than the 2017 AHA/ACC/HRS VA guideline.");
});

// ---------------------------------------------------------------- After recovery
sec("After recovery");
twoStep((step) => {
  const s = slide("Patient A, year 2");
  table(s, [["", "Month 3", "Year 2"],
    ["Rhythm", "Sinus, 64", { t: "AF, 130, for 3 weeks", red: true }],
    ["LVEF", "55%", { t: "30%", red: true }]],
    { x: 1.4, y: 1.4, w: W - 2.8, size: 20 });
  if (step === 1) q(s, "How did it fall so fast?", 3.9);
  else {
    table(s, [["24 patients with TIC (Nerheim)", "First time", "With recurrence (5)"],
      ["EF at presentation", "26%", "Dropped again"],
      ["Time for heart failure to develop", "Years", { t: "Within 6 months", red: true }],
      ["Sudden death", { t: "3 of 24", red: true }, ""]],
      { x: 1.4, y: 3.4, w: W - 2.8, size: 19 });
  }
  src(s, "Nerheim P, Birger-Botkin S, Piracha L, Olshansky B. Circulation 2004;110:247-52, PMID 15226218.");
  s.addNotes("Nerheim's 24 patients all recovered within 6 months of rate or rhythm control. In the 5 whose tachycardia came back, the EF fell quickly and heart failure came within 6 months, although it had taken years the first time. Three of the 24 died suddenly. The heart remembers. Watanabe saw the same: recurrence of heart failure in 2 of 12 and one sudden death after recovery.");
  return s;
});
twoStep((step) => {
  const s = slide("Is the heart normal again?");
  table(s, [["", "TIC before", "TIC after (14 months)", "Matched controls"],
    ["LVEF", { t: "31%", red: true }, ans(step, "55%"), ans(step, "Matched")],
    ["LV end-systolic volume index, mL/m²", { t: "55", red: true }, ans(step, { t: "33", red: true }), ans(step, "22")],
    ["LV end-diastolic volume index, mL/m²", { t: "78", red: true }, ans(step, { t: "72", red: true }), ans(step, "51")]],
    { x: 0.6, y: 1.6, w: W - 1.2, size: 19 });
  if (step === 2) q(s, "EF normal, ventricle still big", 4.6, { hl: true });
  src(s, "Dandamudi G et al. Heart Rhythm 2008;5:1111-4, PMID 18675220. 24 patients, 92% atrial arrhythmias.");
  s.addNotes("Same as the pigs. The EF normalized but the volumes stayed bigger than in age, sex and EF-matched controls. This, the abnormal mitochondria and the rapid relapse are why 'recovered' TIC still needs follow-up.");
  return s;
});
{
  const s = slide("After the EF comes back");
  body(s, [
    "Look for the arrhythmia: patch monitor, loop recorder, a smartwatch",
    "Treat a recurrence early",
    "Keep the GDMT unless cardiology decides to stop it",
    "Repeat the echo if symptoms or the rhythm come back",
  ], { size: 22, gap: 14, x: 0.6, w: 7.6, y: 1.5, h: 4.8 });
  spot(s, "smartwatch.png", 8.4, 1.3, 4.5, 5.3, "Watercolor of a smartwatch on a wrist", "Gemini spot: smartwatch on a wrist (smartwatch.png)");
  src(s, "Joglar JA et al. Circulation 2024;149:e1-e156, PMID 38033089 (surveillance after AF-induced CM, Class 2a).");
  s.addNotes("The 2023 guideline gives long-term surveillance for recurrent AF a 2a. Watches, patches, Holters and loop recorders all count. Whether GDMT can be stopped in pure TIC is not known. TRED-HF showed relapse when therapy was withdrawn in recovered dilated cardiomyopathy, but those were not TIC patients. I leave that decision to cardiology.");
}
ext(() => twoStep((step) => {
  const s = slide("A related problem: RV pacing");
  body(s, [{ t: "823 patients with complete heart block and EF >50% who got a pacemaker", nb: true }], { x: 0.6, y: 1.4, w: W - 1.2, h: 0.7, size: 20 });
  vbars(s, [{ label: "Pacing-induced cardiomyopathy, mean 4.3 years", v: 12.3, text: "12.3%", show: step === 2 }], { x: 3.5, y: 2.6, w: 6.3, h: 2.6, max: 30 });
  if (step === 1) q(s, "How many lose their EF?", 3.8);
  else q(s, "RV pacing ≥20%: HR 6.76", 5.9, { hl: true });
  src(s, "Kiehl EL et al. Heart Rhythm 2016;13:2272-8, PMID 27855853. CRT upgrade worked in 84% of those who got it.");
  s.addNotes("Not a tachycardia, but the same lesson: an electrical problem that weakens a normal ventricle and can be reversed. Here the mechanism is dyssynchrony from RV pacing. Only 29% of them were upgraded to CRT, though 84% responded.");
}));

ext(() => twoStep((step) => {
  const s = slide("Left bundle vs RV pacing");
  body(s, [{ t: "703 patients who needed a pacemaker for bradycardia, Geisinger and Rush registry", nb: true },
    "Left bundle branch area pacing vs RV pacing"], { x: 0.6, y: 1.4, w: W - 1.2, h: 1.0, size: 20 });
  TL(s, "Death, HF admission or upgrade to biventricular pacing", 0.6, 2.55, W - 1.2, 0.4, { align: "center", size: 18, color: GREY });
  vbars(s, [
    { label: "Left bundle, all", v: 10.0, text: "10.0%", show: step === 2 },
    { label: "RV, all", v: 23.3, text: "23.3%", color: SLATE, show: step === 2 },
    { label: "Left bundle, pacing >20%", v: 8.4, text: "8.4%", show: step === 2 },
    { label: "RV, pacing >20%", v: 26.1, text: "26.1%", color: SLATE, show: step === 2 }],
    { x: 1.5, y: 2.95, w: 10.3, h: 2.2, max: 35 });
  if (step === 1) q(s, "What do you think?", 4.0, { size: 22 });
  else q(s, "HR 0.46 overall, 0.32 when pacing >20%. Not randomized", 6.2, { hl: true, size: 22 });
  src(s, "Sharma PS et al. Heart Rhythm 2022;19:3-11, PMID 34481985. Observational, 2018 to 2020.");
  s.addNotes("Left bundle branch area pacing keeps the paced QRS close to the native one (121 vs 156 ms with RV pacing), so the LV contracts in sync. In this registry the composite of death, HF admission or biventricular upgrade was 10.0% vs 23.3% (HR 0.46), and the gap was biggest in patients paced more than 20% of the time, the same group that gets pacing-induced cardiomyopathy. Mortality 7.8% vs 15% and HF admissions 3.7% vs 10.5%. It is a registry, not a trial, so the groups differ in ways we can't fully adjust for.");
  return s;
}));

// ---------------------------------------------------------------- Close
sec("Close");
{
  const s = slide("Back to our patients");
  table(s, [["", "Rhythm", "EF before", "What we did", "EF after"],
    ["A, 54M", "Flutter 2:1", { t: "25%", red: true }, "Cardioversion, flutter ablation, GDMT", "55%"],
    ["B, 38F", "PVCs 26%", { t: "40%", red: true }, "RVOT PVC ablation", "58%"],
    ["C, 68M", "AF, rate 82", { t: "35%", red: true }, "AF ablation", "52%"]],
    { x: 0.5, y: 1.5, w: W - 1.0, size: 19 });
  body(s, [
    "Suspect it in any new HFrEF with AF, flutter, a rate >100 or PVCs ≥10%",
    "A regular rate stuck near 150 is flutter until proven otherwise",
    "No diltiazem when the EF is under 40%",
    "Wait on the ICD and re-image after 3 months of GDMT",
    "Keep watching after the EF comes back",
  ], { x: 0.7, y: 4.3, w: W - 1.4, h: 2.55, size: 19, gap: 4 });
  s.addNotes("Close the loop on all three, then what I'd do. Patient A at year 2 had his AF ablated and is back to 50%.");
}
{
  const s = slide(null, { master: "BLANK" });
  s.addImage({ path: path.join(IMG, "pause-stethoscope.jpg"), x: -0.05, y: 0, w: 13.43, h: 7.5, altText: "Watercolor of a coiled stethoscope on ivory paper" });
  const cx = 0.8, cw = 5.7;
  s.addText("Questions?", { x: cx, y: 1.3, w: cw, h: 1.3, fontFace: "Georgia", fontSize: 54, align: "center", valign: "middle", color: "000000", isTextBox: true, margin: 0 });
  s.addText("X: @mfalmeqdadi", { x: cx, y: 2.75, w: cw, h: 0.5, fontFace: "Georgia", fontSize: 20, align: "center", color: "595959", isTextBox: true, margin: 0 });
  s.addImage({ path: path.join(IMG, QR_PDF), x: cx + cw / 2 - 1.25, y: 3.5, w: 2.5, h: 2.5, altText: "QR code linking to the slides PDF" });
  s.addText("Slides (PDF)", { x: cx, y: 6.1, w: cw, h: 0.35, fontFace: "Georgia", fontSize: 14, align: "center", color: "595959", isTextBox: true, margin: 0 });
  s.addNotes("The QR code opens the slides PDF.");
  endMain();
}

(async () => {
  addSlideNumbers();
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
