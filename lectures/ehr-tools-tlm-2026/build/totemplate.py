# Moves the built deck onto the AASLD TLM 2026 speaker template.
# usage: python3 totemplate.py built.pptx template.pptx out.pptx
# Cover -> "Title Slide Green - No Headshot", last slide -> "Thank You Slide 1",
# everything else -> "Text Slide". Content below the title is scaled into the space
# above the AASLD logo row; source lines and slide numbers move to the bottom rows.
import copy, re, sys
from lxml import etree
from pptx import Presentation
from pptx.util import Inches, Pt, Emu

src_path, tpl_path, out_path = sys.argv[1:4]
NS = {"p": "http://schemas.openxmlformats.org/presentationml/2006/main",
      "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
      "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships"}
R = "{%s}" % NS["r"]
EMU = 914400
Y0, Y_SRC_LIMIT, YT = 1.12, 6.9, 6.12      # content band in the built deck, and its bottom on the template
K = (YT - Y0) / (Y_SRC_LIMIT - Y0)
CX = 13.333 / 2
FONT = "Arial"

src = Presentation(src_path)
dst = Presentation(tpl_path)
lay = {l.name: l for l in dst.slide_layouts}

# drop the template's sample slides
sldIdLst = dst.slides._sldIdLst
for sid in list(sldIdLst):
    dst.part.drop_rel(sid.rId)
    sldIdLst.remove(sid)

def relink(el, s_part, d_part):
    for node in el.iter():
        for att in list(node.attrib):
            if att.startswith(R) and att[len(R):] in ("embed", "id", "link", "pict"):
                rid = node.get(att)
                if rid not in s_part.rels:
                    continue
                rel = s_part.rels[rid]
                if rel.is_external:
                    new = d_part.relate_to(rel.target_ref, rel.reltype, is_external=True)
                else:
                    new = d_part.relate_to(rel.target_part, rel.reltype)
                node.set(att, new)

def scale_fonts(el, k):
    for node in el.iter("{%s}rPr" % NS["a"], "{%s}defRPr" % NS["a"], "{%s}endParaRPr" % NS["a"]):
        sz = node.get("sz")
        if sz:
            node.set("sz", str(max(800, int(round(int(sz) * k / 50.0)) * 50)))

def fonts(el):
    for node in el.iter("{%s}latin" % NS["a"], "{%s}cs" % NS["a"], "{%s}ea" % NS["a"]):
        if node.get("typeface") in ("Georgia", "Calibri"):
            node.set("typeface", FONT)

def xfrm_of(el):
    x = el.find(".//a:xfrm", NS)
    if x is None:
        x = el.find(".//p:xfrm", NS)
    return x

def move(el, fn):
    x = xfrm_of(el)
    if x is None:
        return
    off, ext = x.find("a:off", NS), x.find("a:ext", NS)
    vals = [int(off.get("x")), int(off.get("y")), int(ext.get("cx")), int(ext.get("cy"))]
    nx, ny, nw, nh = fn(*[v / EMU for v in vals])
    off.set("x", str(int(nx * EMU))); off.set("y", str(int(ny * EMU)))
    ext.set("cx", str(int(nw * EMU))); ext.set("cy", str(int(nh * EMU)))

def shrink(x, y, w, h):
    return CX + (x - CX) * K, Y0 + (y - Y0) * K, w * K, h * K

def name_of(el):
    c = el.find(".//p:cNvPr", NS)
    return c.get("name") if c is not None else ""

def notes(s_slide, d_slide):
    if s_slide.has_notes_slide:
        t = s_slide.notes_slide.notes_text_frame.text
        if t.strip():
            d_slide.notes_slide.notes_text_frame.text = t

def white_text(d_slide, text, x, y, w, h, size):
    tb = d_slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    for i, line in enumerate(text.split("\n")):
        para = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        para.text = line
        para.font.size = Pt(size); para.font.name = FONT
        para.font.color.rgb = __import__("pptx").dml.color.RGBColor(0xFF, 0xFF, 0xFF)

slides = list(src.slides)
for i, s in enumerate(slides):
    if i == 0:
        d = dst.slides.add_slide(lay["Title Slide Green - No Headshot"])
        title = [p for p in d.placeholders if p.placeholder_format.type in (1, 3)][0]
        sub = [p for p in d.placeholders if p.placeholder_format.type == 4][0]
        title.text_frame.text = "Epically Efficient Electronic Health Record Tools to Improve Your Practice"
        title.text_frame.paragraphs[0].runs[0].font.size = Pt(40)
        lines = ["Mohammad Almeqdadi, MD", "Transplant Hepatologist and Gastroenterologist",
                 "Assistant Professor of Medicine and Surgery, Tufts University School of Medicine"]
        sub.text_frame.text = lines[0]
        for l in lines[1:]:
            sub.text_frame.add_paragraph().text = l
        for k, para in enumerate(sub.text_frame.paragraphs):
            para.runs[0].font.size = Pt(22 if k == 0 else 18)
        notes(s, d)
        continue
    if i == len(slides) - 1:
        d = dst.slides.add_slide(lay["Thank You Slide 1"])
        d.placeholders[0].text_frame.text = "Questions?"
        white_text(d, "X: @mfalmeqdadi", 0.46, 4.95, 6.0, 0.5, 20)
        notes(s, d)
        continue

    d = dst.slides.add_slide(lay["Text Slide"])
    tree = d.shapes._spTree
    # keep the template title placeholder, drop its body placeholder
    d_title = None
    for p in list(d.placeholders):
        if p.placeholder_format.type == 1 or p.name.startswith("Title"):
            d_title = p
        else:
            tree.remove(p._element)

    # background (watercolor slides)
    bg = s._element.find("p:cSld/p:bg", NS)
    if bg is not None:
        nb = copy.deepcopy(bg)
        relink(nb, s.part, d.part)
        cs = d._element.find("p:cSld", NS)
        cs.insert(0, nb)

    full = [sh for sh in s.shapes if sh.shape_type == 13 and sh.width / EMU > 13 and sh.height / EMU > 7.3]
    if full and bg is None:
        blip = full[0]._element.find(".//a:blip", NS)
        rel = s.part.rels[blip.get(R + "embed")]
        rid = d.part.relate_to(rel.target_part, rel.reltype)
        nb = etree.fromstring('<p:bg xmlns:p="%s" xmlns:a="%s" xmlns:r="%s"><p:bgPr><a:blipFill dpi="0" rotWithShape="1"><a:blip r:embed="%s"/><a:srcRect/><a:stretch><a:fillRect/></a:stretch></a:blipFill><a:effectLst/></p:bgPr></p:bg>' % (NS["p"], NS["a"], NS["r"], rid))
        d._element.find("p:cSld", NS).insert(0, nb)
        bg = nb
    s_title = None
    for sh in s.shapes:
        if sh.is_placeholder:
            s_title = sh.text_frame.text
    if s_title and d_title is not None:
        d_title.text_frame.text = s_title
        for r in d_title.text_frame.paragraphs[0].runs:
            r.font.size = Pt(32)
    elif d_title is not None:
        tree.remove(d_title._element)

    for sh in s.shapes:
        if sh.is_placeholder:
            continue
        if full and sh == full[0]:
            continue
        el = copy.deepcopy(sh._element)
        n = name_of(el)
        if n == "Part":
            continue                      # the template title sits where our part label was
        relink(el, s.part, d.part)
        fonts(el)
        if n == "SlideNumber":
            move(el, lambda x, y, w, h: (11.9, 7.08, 0.9, 0.28))
        elif n == "Source":
            move(el, lambda x, y, w, h: (0.39, 6.22, 10.5, 0.62))
            scale_fonts(el, 0.9)
        else:
            if bg is None:
                move(el, shrink)
                scale_fonts(el, K)
                # tables keep their own column widths and row heights
                for gc in el.iter("{%s}gridCol" % NS["a"]):
                    gc.set("w", str(int(int(gc.get("w")) * K)))
                for tr in el.iter("{%s}tr" % NS["a"]):
                    tr.set("h", str(int(int(tr.get("h")) * K)))
        tree.append(el)
    notes(s, d)

dst.save(out_path)
print("slides", len(dst.slides))
