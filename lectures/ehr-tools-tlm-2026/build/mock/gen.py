# Generates the Epic-like mock-up screens as HTML. Every name and value here is invented.
import math, os, sys

OUT = os.path.dirname(os.path.abspath(__file__))

CSS = """
* { box-sizing: border-box; }
body { zoom: 1; margin: 0; background: #fff; font-family: 'Liberation Sans', Arial, sans-serif; font-size: 13px; color: #1d1d1d; }
.win { border: 1px solid #b9c3cf; background: #fff; display: inline-block; }
.bar { background: #e9eef4; border-bottom: 1px solid #c5ced9; padding: 5px 10px; display: flex; align-items: center; gap: 14px; font-size: 12px; color: #33475b; }
.bar .ttl { font-weight: bold; color: #1f3b57; font-size: 13px; }
.pt { white-space: nowrap; overflow: hidden; background: #3d5a78; color: #fff; padding: 6px 12px; font-size: 13px; display: flex; gap: 22px; align-items: baseline; }
.pt b { font-size: 15px; letter-spacing: .3px; }
.pt .sm { color: #dbe5ef; font-size: 12px; }
table.syn { border-collapse: collapse; }
table.syn td { height: 27px; padding: 0 7px; border-bottom: 1px solid #edf0f3; white-space: nowrap; font-size: 15px; }
table.syn td.v { width: 112px; text-align: left; border-right: 1px solid #f1f3f5; }
table.syn td.lab { width: 210px; color: #222; border-left: 1px solid #d5dbe2; background: #fbfcfd; }
table.syn tr.hd td { background: #fff; border-top: 1px solid #c9d1da; border-bottom: 1px solid #c9d1da; font-weight: bold; color: #1f3b57; height: 28px; }
table.syn tr.hd td.lab { background: #f3f6f9; }
table.syn tr.dates td { font-size: 14px; color: #33475b; height: 34px; vertical-align: bottom; border-bottom: 1px solid #c5ced9; }
.car { float: right; color: #6d7f92; font-size: 10px; }
.ab { color: #c00000; font-weight: bold; }
.ab::after { content: " \\25B2"; font-size: 10px; }
.lo { color: #c00000; font-weight: bold; }
.lo::after { content: " \\25BC"; font-size: 10px; }
.med { display: inline-block; background: #efdcf3; border: 1px solid #b98ac6; border-radius: 10px; padding: 0 8px; height: 20px; line-height: 19px; font-size: 13px; color: #3a1f45; overflow: hidden; }
.dc { background: #f2f2f2; border-color: #aaa; color: #555; }
.hl td { background: #ffff00 !important; }
.hlc { background: #ffff00; }
.grey { color: #8a96a3; }
.chk { display: inline-block; width: 13px; height: 13px; border: 1px solid #6d7f92; border-radius: 2px; vertical-align: -2px; margin-right: 6px; background: #fff; text-align: center; line-height: 11px; font-size: 11px; }
.chk.on { background: #2f6fa7; border-color: #2f6fa7; color: #fff; }
.chk.on::after { content: "\\2713"; }
.btn { display: inline-block; border: 1px solid #9fb0c2; background: linear-gradient(#fff, #e8edf2); border-radius: 3px; padding: 3px 10px; font-size: 12px; color: #1f3b57; }
.btn.pri { background: #2f6fa7; color: #fff; border-color: #245a88; }
.tab { display: inline-block; padding: 6px 12px; font-size: 12px; color: #33475b; border-right: 1px solid #d5dbe2; }
.tab.on { background: #fff; font-weight: bold; color: #1f3b57; border-bottom: 2px solid #2f6fa7; }
table.grid { border-collapse: collapse; width: 100%; }
table.grid th { background: #eef2f6; text-align: left; font-size: 13.5px; color: #33475b; padding: 5px 8px; border-bottom: 1px solid #c5ced9; font-weight: bold; }
table.grid td { padding: 6px 8px; border-bottom: 1px solid #edf0f3; font-size: 15px; white-space: nowrap; }
.link { color: #1a5a9c; text-decoration: underline; }
.field { background: #e6f1fb; border: 1px solid #9cc3e6; padding: 0 4px; border-radius: 2px; }
.wild { background: #fff4c2; border: 1px solid #e3c55c; padding: 0 3px; }
"""

def page(name, body, width):
    html = f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body><div id='m' style='width:{width}px'>{body}</div></body></html>"
    with open(os.path.join(OUT, name + ".html"), "w") as f:
        f.write(html)

def meld(b, n, i, c, a):
    b = max(b, 1); i = max(i, 1); c = min(max(c, 1), 3); n = min(max(n, 125), 137); a = min(max(a, 1.5), 3.5)
    return round(4.56*math.log(b) + 0.82*(137-n) - 0.24*(137-n)*math.log(b) + 9.09*math.log(i) + 11.14*math.log(c)
                 + 1.85*(3.5-a) - 1.83*(3.5-a)*math.log(c) + 6)

PT = "<div class='pt'><b>ZZTEST, LIVER</b><span class='sm'>58 y.o. M</span><span class='sm'>MRN 000000001</span><span class='sm'>Hepatology</span><span class='sm'>Allergies: No Known Allergies</span></div>"

def synbar(title, extra=""):
    return (f"<div class='bar'><span class='ttl'>Synopsis</span><span>{title}</span>{extra}<span style='margin-left:auto'><span class='chk on'></span>All Rows</span>"
            "<span>&#x21bb; Just now</span></div>")

def hd(label, n):
    return "<tr class='hd'>" + "<td class='v'></td>" * n + f"<td class='lab'>{label}<span class='car'>&#x2303;</span></td></tr>"

def row(label, vals, cls=""):
    cells = ""
    for v in vals:
        if v is None or v == "":
            cells += "<td class='v'></td>"
        elif isinstance(v, tuple):
            cells += f"<td class='v'><span class='{v[1]}'>{v[0]}</span></td>"
        else:
            cells += f"<td class='v'>{v}</td>"
    return f"<tr class='{cls}'>{cells}<td class='lab'>{label}</td></tr>"

def medrow(label, spans, n, cls=""):
    # spans: list of (start_col, ncols, text, dc)
    cells, c = "", 0
    for (s, k, t, dc) in spans:
        while c < s:
            cells += "<td class='v'></td>"; c += 1
        w = 112 * k - 16
        cells += f"<td class='v' colspan='{k}'><span class='med{' dc' if dc else ''}' style='width:{w}px'>&#x2302; {t}</span></td>"; c += k
    while c < n:
        cells += "<td class='v'></td>"; c += 1
    return f"<tr class='{cls}'>{cells}<td class='lab'>{label}</td></tr>"

# ------------------------------------------------------------ Synopsis, cirrhosis view (slide 7)
DATES = ["10/14/25", "1/12/26", "4/20/26", "7/14/26", "9/22/26", "10/19/26"]
LABS = [  # bili, Na, INR, Cr, alb
    (1.4, 138, 1.2, 0.8, 3.5), (1.6, 138, 1.3, 0.9, 3.4), (2.0, 136, 1.4, 1.0, 3.2),
    (2.6, 134, 1.5, 1.2, 3.0), (2.9, 132, 1.6, 1.3, 2.9), (3.1, 131, 1.7, 1.4, 2.8)]
MELDS = [meld(*l) for l in LABS]

def flag(v, lo, hi, fmt="{}"):
    s = fmt.format(v)
    if v > hi: return (s, "ab")
    if v < lo: return (s, "lo")
    return s

def cirrhosis(hl):
    n = len(DATES)
    dates = "<tr class='dates'>" + "".join(f"<td class='v'><span class='grey'>2025</span><br>{d}</td>" if i == 0 else f"<td class='v'><br>{d}</td>" for i, d in enumerate(DATES)) + "<td class='lab'></td></tr>"
    t = "<table class='syn'>" + dates
    t += hd("Scores", n)
    t += row("MELD 3.0", [str(m) for m in MELDS], "hl" if hl else "")
    t += row("Child-Pugh", ["A6", "", "B7", "B8", "", "B9"])
    t += hd("Labs", n)
    t += row("Bilirubin, total", [flag(l[0], 0.2, 1.2) for l in LABS])
    t += row("Sodium", [flag(l[1], 135, 145) for l in LABS])
    t += row("Creatinine", [flag(l[3], 0.7, 1.3) for l in LABS], "hl" if hl else "")
    t += row("Albumin", [flag(l[4], 3.5, 5.0) for l in LABS])
    t += row("Platelets", [("112", "lo"), ("98", "lo"), ("90", "lo"), ("84", "lo"), ("79", "lo"), ("76", "lo")])
    t += row("INR", [flag(l[2], 0.9, 1.1) for l in LABS])
    t += hd("Liver Meds", n)
    t += medrow("furosemide", [(1, 2, "20 mg daily", False), (3, 3, "40 mg daily", False)], n)
    t += medrow("spironolactone", [(1, 2, "50 mg daily", False), (3, 3, "100 mg daily", False)], n)
    t += medrow("lactulose", [(3, 3, "20 g 2 times daily", False)], n)
    t += medrow("carvedilol", [(0, 4, "6.25 mg 2 times daily", False), (4, 1, "D/C", True)], n)
    t += "</table>"
    body = f"<div class='win'>{PT}{synbar('Liver Disease')}{t}</div>"
    page("synopsis-cirrhosis" + ("-hl" if hl else ""), body, 1100)

def workup(hl):
    def r(label, val, date, gap=False):
        cls = "hl" if (hl and gap) else ""
        return f"<tr class='{cls}'><td class='v' style='width:120px'>{val}</td><td class='v' style='width:96px'>{date}</td><td class='lab' style='width:300px'>{label}</td></tr>"
    def h(label):
        return f"<tr class='hd'><td class='v'></td><td class='v'></td><td class='lab'>{label}<span class='car'>&#x2303;</span></td></tr>"
    t = "<table class='syn' style='width:100%'><tr class='dates'><td class='v'>Most Recent<br><span class='grey'>20 years</span></td><td class='v'></td><td class='lab'></td></tr>"
    t += h("Hepatitis")
    t += r("Hepatitis B surface antigen", "Non Reactive", "11/02/19")
    t += r("Hepatitis B surface antibody", "<span class='lo'>&lt;3.5</span>", "11/02/19", True)
    t += r("Hepatitis B core antibody", "<span class='grey'>&mdash;</span>", "", True)
    t += r("Hepatitis C antibody", "Non Reactive", "10/14/25")
    t += h("Iron")
    t += r("Transferrin saturation", "<span class='ab'>68</span>", "10/14/25", True)
    t += r("Ferritin", "<span class='ab'>1,240</span>", "10/14/25", True)
    t += r("HFE gene analysis", "<span class='grey'>&mdash;</span>", "", True)
    t += h("Other causes")
    t += r("ANA Direct", "Negative", "10/14/25")
    t += r("Immunoglobulin G (IgG)", "1,310", "10/14/25")
    t += r("Alpha-1-Antitrypsin", "112", "10/14/25")
    t += r("Ceruloplasmin", "24", "10/14/25")
    t += h("MASLD Section")
    t += r("BMI", "<span class='ab'>28.7</span>", "10/19/26")
    t += r("Hemoglobin A1c", "<span class='ab'>6.1</span>", "10/19/26", True)
    t += r("Triglycerides", "<span class='ab'>182</span>", "10/19/26", True)
    t += r("HDL cholesterol", "<span class='lo'>34</span>", "10/19/26", True)
    t += r("LDL cholesterol", "114", "10/19/26")
    t += "</table>"
    body = f"<div class='win'>{PT}{synbar('CLD Workup')}{t}</div>"
    page("synopsis-workup" + ("-hl" if hl else ""), body, 600)

def transplant():
    D = ["8/03/26", "8/17/26", "8/31/26", "9/14/26", "9/28/26", "10/12/26", "10/26/26"]
    n = len(D)
    dates = "<tr class='dates'>" + "".join(f"<td class='v'><br>{d}</td>" for d in D) + "<td class='lab'></td></tr>"
    t = "<table class='syn'>" + dates
    t += hd("Immunosuppression", n)
    t += medrow("tacrolimus", [(0, 2, "3 mg 2 times daily", False), (2, 3, "2 mg 2 times daily", False), (5, 2, "1.5 mg 2 times daily", False)], n)
    t += medrow("mycophenolate", [(0, 7, "1,000 mg 2 times daily", False)], n)
    t += medrow("prednisone", [(0, 3, "5 mg daily", False), (3, 1, "D/C", True)], n)
    t += row("Tacrolimus, trough", [("12.4", "ab"), ("11.1", "ab"), "9.2", "8.1", "7.4", "6.9", "6.2"], "")
    t += hd("Infection Monitoring", n)
    t += row("CMV DNA, QN PCR", ["Not Det", "", "Not Det", "", "Not Det", "", "Not Det"])
    t += hd("Labs", n)
    t += row("Creatinine", [("1.62", "ab"), ("1.55", "ab"), ("1.41", "ab"), "1.28", "1.19", "1.14", "1.10"])
    t += row("Potassium", [("5.4", "ab"), "5.1", "4.9", "4.7", "4.6", "4.5", "4.4"])
    t += row("ALT", ["44", "39", "30", "27", "26", "24", "22"])
    t += "</table>"
    body = f"<div class='win'>{PT.replace('Hepatology', 'Transplant Hepatology').replace('LIVER<', 'ECHO<').replace('58 y.o.', '61 y.o.')}{synbar('Liver Post-Transplant')}{t}</div>"
    page("synopsis-transplant", body, 1200)

# ------------------------------------------------------------ Chart search (slide 10)
def chart_search():
    body = f"""<div class='win' style='width:880px'>{PT}
<div class='bar'><span class='ttl'>Chart Search</span></div>
<div style='padding:12px 14px; position:relative; height:430px'>
 <div style='border:2px solid #2f6fa7; border-radius:3px; padding:6px 10px; font-size:15px; width:420px'>&#x1F50D;&#xFE0E; EGD<span style='color:#2f6fa7'>|</span></div>
 <div style='position:absolute; left:450px; top:16px; font-size:13px; color:#33475b'>Open from anywhere: <span style='display:inline-block; border:1px solid #9fb0c2; border-bottom-width:3px; border-radius:4px; padding:1px 7px; background:#f6f8fa; font-weight:bold'>Ctrl</span> + <span style='display:inline-block; border:1px solid #9fb0c2; border-bottom-width:3px; border-radius:4px; padding:1px 14px; background:#f6f8fa; font-weight:bold'>Space</span></div>
 <div style='margin-top:10px; font-size:12px; color:#33475b'>Filter: <span class='btn'>All</span> <span class='btn'>Notes</span> <span class='btn'>Procedures</span> <span class='btn'>Media</span> <span class='btn'>Outside records</span></div>
 <div style='margin-top:12px; width:420px'>
  <div style='font-weight:bold; color:#1f3b57; border-bottom:1px solid #c5ced9; padding:4px 0'>Procedures (2)</div>
  <div style='padding:6px 4px; background:#e6f1fb'><b><span class='hlc'>EGD</span> with biopsy</b><br><span class='grey'>3/14/2023 &middot; Lakeside GI Associates &middot; Outside</span></div>
  <div style='padding:6px 4px'><b><span class='hlc'>EGD</span></b><br><span class='grey'>5/02/2019 &middot; Riverbend Medical Center &middot; Outside</span></div>
  <div style='font-weight:bold; color:#1f3b57; border-bottom:1px solid #c5ced9; padding:4px 0; margin-top:6px'>Notes (4)</div>
  <div style='padding:6px 4px'>Procedure note: <span class='hlc'>EGD</span><br><span class='grey'>3/14/2023 &middot; Outside</span></div>
  <div style='padding:6px 4px'>Progress note: &ldquo;...due for repeat <span class='hlc'>EGD</span>...&rdquo;<br><span class='grey'>10/14/2025 &middot; Outside</span></div>
  <div style='font-weight:bold; color:#1f3b57; border-bottom:1px solid #c5ced9; padding:4px 0; margin-top:6px'>Media (1)</div>
  <div style='padding:6px 4px'><span class='hlc'>EGD</span> images<br><span class='grey'>3/14/2023</span></div>
 </div>
 <div style='position:absolute; left:450px; top:120px; width:400px; border:1px solid #9fb0c2; box-shadow:0 2px 6px rgba(0,0,0,.18); background:#fff'>
  <div style='background:#eef2f6; padding:6px 10px; font-weight:bold; color:#1f3b57'><span class='hlc'>EGD</span> with biopsy &middot; 3/14/2023</div>
  <div style='padding:10px; line-height:1.55; font-size:12.5px'>
   <b>Findings:</b> Two columns of small (&lt;5 mm) esophageal varices without red wale signs. Mild portal hypertensive gastropathy. Duodenum normal; biopsies taken.<br><br>
   <b>Impression:</b> Small esophageal varices.<br><br>
   <b>Recommendation:</b> Nonselective beta blocker. Repeat <span class='hlc'>EGD</span> as indicated.
  </div>
 </div>
</div></div>"""
    page("chart-search", body, 882)

# ------------------------------------------------------------ Chart Review filter (slide 11)
def chart_review(step):
    # Notes tab; step 0 = all notes, step 1 = our Hepatology quick filter applied
    tabs = "".join(f"<span class='tab{' on' if t == 'Notes' else ''}'>{t}</span>" for t in ["Encounters", "Notes", "Labs", "Imaging", "Procedures", "Media", "Letters"])
    OUTI = "<span style='display:inline-block; width:17px; height:17px; border-radius:50%; background:#1F4E79; color:#fff; font:bold italic 14px/17px Georgia, serif; text-align:center; vertical-align:-3px'>e</span>"
    allrows = [("10/21/2026", "Telephone", "Front desk", "Scheduling", ""),
               ("10/19/2026", "Progress Notes", "Rahman, Leah", "Hepatology", ""),
               ("10/18/2026", "Nursing Note", "Reyes, Ana", "Infusion", ""),
               ("10/14/2026", "Patient Instructions", "Rahman, Leah", "Hepatology", ""),
               ("10/02/2026", "Progress Notes", "Patel, Ravi", "Primary Care", ""),
               ("9/30/2026", "Result Note", "Rahman, Leah", "Hepatology", ""),
               ("9/12/2026", "Telephone", "MyChart", "Hepatology", ""),
               ("8/27/2026", "Progress Notes", "Kim, Jae", "Cardiology", ""),
               ("8/09/2026", "Discharge Summary", "Stone, Lia", "Riverbend Medical Center", "o"),
               ("7/14/2026", "Procedures", "Ng, Tom", "Interventional Radiology", "")]
    heprows = [("10/19/2026", "Progress Notes", "Rahman, Leah", "Hepatology", ""),
               ("7/22/2026", "Procedures", "Ortiz, Sam", "Gastroenterology: EGD, small varices", ""),
               ("4/20/2026", "Progress Notes", "Rahman, Leah", "Hepatology", ""),
               ("10/14/2025", "Progress Notes", "Walsh, Kim", "Hepatology, Riverbend Medical Center", "o"),
               ("8/09/2025", "Imaging", "Lu, Ann", "MRI: LI-RADS 3, 1.1 cm, Riverbend", "o"),
               ("3/14/2023", "Procedures", "Diaz, Ray", "EGD, Lakeside GI Associates", "o"),
               ("2/11/2019", "Pathology", "Hart, Joy", "Liver biopsy, North Shore Health", "o")]
    rows = heprows if step else allrows
    tr = "".join(f"<tr><td style='width:26px'>{OUTI if o else ''}</td><td>{a}</td><td>{b}</td><td>{c}</td><td>{d}</td></tr>" for a, b, c, d, o in rows)
    qf = lambda t, on=False: f"<span style='display:inline-block; border:1px solid {'#245a88' if on else '#9fb0c2'}; background:{'#2f6fa7' if on else '#fff'}; color:{'#fff' if on else '#1f3b57'}; border-radius:12px; padding:3px 12px; margin-right:6px; font-size:13px'>{t}</span>"
    shown = "7 of 214 notes" if step else "214 notes"
    body = f"""<div class='win' style='width:900px'>{PT}
<div class='bar'><span class='ttl'>Chart Review</span></div>
<div style='background:#f3f6f9; border-bottom:1px solid #c5ced9'>{tabs}</div>
<div style='padding:8px 10px; font-size:13px; display:flex; align-items:center'>
 <span class='grey' style='margin-right:8px'>Quick Filters:</span>{qf('Hepatology', step == 1)}{qf('My Notes')}{qf('Last 12 months')}{qf('Outside notes')}<span style='margin-left:auto' class='grey'>{shown}</span></div>
<table class='grid'><tr><th></th><th>Date</th><th>Type</th><th>Author</th><th>Department</th></tr>{tr}</table>
<div style='padding:6px 10px; font-size:12px' class='grey'>{OUTI} = outside record (Care Everywhere)</div>
</div>"""
    page(f"chart-review-{step}", body, 902)

def care_everywhere():
    orgs = [("Riverbend Medical Center", "2014 to 2025", "241"), ("North Shore Health", "2018 to 2019", "48"), ("Lakeside GI Associates", "2019 to 2023", "23")]
    tr = "".join(f"<tr><td><span class='chk on'></span>{a}</td><td>{b}</td><td style='text-align:right'>{c}</td></tr>" for a, b, c in orgs)
    docs = [("8/09/2025", "MR abdomen w wo contrast: LI-RADS 3 observation, 1.1 cm"), ("10/14/2025", "Hepatology clinic note"), ("2/11/2019", "Liver biopsy: bridging fibrosis, steatohepatitis")]
    td = "".join(f"<tr><td>{a}</td><td class='link'>{b}</td></tr>" for a, b in docs)
    body = f"""<div class='win' style='width:620px'>{PT}
<div class='bar'><span class='ttl'>Care Everywhere</span><span>Outside records</span><span style='margin-left:auto'>312 documents</span></div>
<table class='grid'><tr><th>Organization</th><th>Dates</th><th style='text-align:right'>Documents</th></tr>{tr}</table>
<div style='padding:8px 10px 4px; font-weight:bold; color:#1f3b57'>Recent</div>
<table class='grid'>{td}</table>
<div style='padding:8px 10px'><span class='btn'>Reconcile outside data</span> <span class='btn'>Open in Chart Review</span></div>
</div>"""
    page("care-everywhere", body, 622)

# ------------------------------------------------------------ SmartPhrase (slide 12)
def note(step):
    tool = "<div class='bar' style='gap:8px'><span class='ttl'>Progress Notes</span><span class='btn'><b>B</b></span><span class='btn'><i>I</i></span><span class='btn'><u>U</u></span><span class='btn'>+ SmartPhrase</span><span class='btn'>SmartLinks</span><span class='btn'>Insert</span></div>"
    top = "<div style='color:#555'>ZZTEST, LIVER is a 58 y.o. male seen for cirrhosis.</div><br><b>ASSESSMENT AND PLAN</b><br>"
    if step == 1:
        txt = top + "<span style='background:#e6f1fb'>.cirrhosiscare</span><span style='color:#2f6fa7'>|</span>"
        txt += """<div style='margin-top:4px; width:520px; border:1px solid #9fb0c2; box-shadow:0 2px 6px rgba(0,0,0,.15); font-size:12px'>
<div style='padding:5px 8px; background:#2f6fa7; color:#fff'><b>CIRRHOSISCARE</b> &nbsp; Cirrhosis health maintenance</div>
<div style='padding:5px 8px'><b>CIRRHOSISNEW</b> &nbsp; New cirrhosis referral</div>
<div style='padding:5px 8px'><b>CIRRHOSISDISCH</b> &nbsp; Cirrhosis discharge instructions</div></div>"""
        txt += "<div style='height:160px'></div>"
    else:
        txt = top + f"""Cirrhosis, alcohol-associated. MELD 3.0 <span class='field'>{MELDS[-1]}</span> (<span class='field'>10/19/26</span>). Child-Pugh <span class='field'>B9</span>.<br>
- HCC surveillance: last imaging <span class='field'>MR abdomen w wo contrast 7/14/2026</span>. Next due in <span class='field'>{{3 months / 6 months}}</span>.<br>
- Varices: last EGD <span class='field'>3/14/2023, small varices</span>. On carvedilol: <span class='field'>{{yes / no}}</span>.<br>
- Ascites: furosemide <span class='field'>40 mg daily</span>, spironolactone <span class='field'>100 mg daily</span>. Na <span class='field'>131</span>, Cr <span class='field'>1.4</span>.<br>
- HE: lactulose <span class='field'>20 g 2 times daily</span>, rifaximin <span class='field'>550 mg 2 times daily</span>.<br>
- Vaccines: hepatitis B <span class='wild'>***</span>, pneumococcal <span class='wild'>***</span>.<br>
- Alcohol: PEth <span class='field'>210</span> (<span class='field'>10/19/26</span>). <span class='wild'>***</span><br>
- Transplant: <span class='field'>{{refer / discussed / not a candidate}}</span>."""
    body = f"<div class='win' style='width:860px'>{PT}{tool}<div style='padding:14px 16px; font-size:17px; line-height:1.7; min-height:420px'>{txt}</div></div>"
    page(f"note-smartphrase-{step}", body, 842)

# ------------------------------------------------------------ Order set (slide 13)
def order_set():
    def sec(t): return f"<div style='background:#eef2f6; padding:5px 10px; font-weight:bold; color:#1f3b57; border-top:1px solid #c5ced9'>&#x25BE; {t}</div>"
    def o(t, on=True, sub=""): return f"<div style='padding:4px 10px 4px 24px'><span class='chk{' on' if on else ''}'></span>{t} <span class='grey'>{sub}</span></div>"
    body = f"""<div class='win' style='width:600px'>{PT}
<div class='bar'><span class='ttl'>Order Sets</span><span>HEP NEW CIRRHOSIS VISIT</span><span style='margin-left:auto' class='grey'>My version</span></div>
{sec('Labs')}{o('Comprehensive metabolic panel')}{o('CBC with differential')}{o('Prothrombin time / INR')}{o('Alpha-fetoprotein')}{o('Hepatitis B panel', sub='(sAg, sAb, core Ab)')}{o('Hepatitis C antibody, reflex RNA')}{o('Iron panel and ferritin')}{o('PEth')}
{sec('Imaging')}{o('US abdomen with elastography')}{o('MR abdomen w wo contrast', False, '(if US limited)')}
{sec('Referrals')}{o('Nutrition', False)}{o('Social work', False)}
<div style='padding:10px; border-top:1px solid #c5ced9; display:flex; gap:8px'><span class='btn'>Save as my version</span><span class='btn pri' style='margin-left:auto'>Sign</span></div>
</div>"""
    page("order-set", body, 602)

# ------------------------------------------------------------ In Basket (slide 15)
def inbasket():
    folders = [("Results", 14), ("Patient Medical Advice Request", 23), ("Rx Request", 9), ("Cc'd Charts", 17), ("Staff Message", 5), ("Letter Queue", 2)]
    fl = "".join(f"<div style='padding:5px 8px;{' background:#d9e7f5; font-weight:bold' if i == 0 else ''}'>{a} <span style='float:right' class='grey'>{b}</span></div>" for i, (a, b) in enumerate(folders))
    msgs = [("ZZTEST, LIVER", "AFP", "10/20"), ("ZZTEST, ALPHA", "CMP", "10/20"), ("ZZTEST, BRAVO", "US abdomen", "10/19"), ("ZZTEST, CHARLIE", "CBC", "10/19"), ("ZZTEST, DELTA", "INR", "10/18")]
    ml = "".join(f"<div style='padding:6px 8px; border-bottom:1px solid #edf0f3;{' background:#e6f1fb' if i == 0 else ''}'><b>{a}</b><br><span class='grey'>{b} &middot; {c}</span></div>" for i, (a, b, c) in enumerate(msgs))
    qa = "".join(f"<span class='btn' style='margin:0 4px 4px 0'>&#x26A1;&#xFE0E; {t}</span>" for t in ["Normal, MyChart letter", "Normal, mail letter", "Repeat in 1 week", "Call patient", "Route to RN"])
    body = f"""<div class='win' style='width:960px; zoom:1.2'>
<div class='bar'><span class='ttl'>In Basket</span><span class='btn'>Refresh</span><span class='btn'>Out of contact</span><span class='btn'>Attach</span><span style='margin-left:auto'>Dr. Example</span></div>
<div style='display:flex; height:400px'>
 <div style='width:230px; border-right:1px solid #c5ced9; background:#fbfcfd; font-size:12px'>{fl}</div>
 <div style='width:200px; border-right:1px solid #c5ced9; font-size:12px'>{ml}</div>
 <div style='flex:1; padding:10px 12px'>
  <div style='margin-bottom:8px'>{qa}</div>
  <div style='font-weight:bold; color:#1f3b57; margin:6px 0'>ZZTEST, LIVER &middot; Alpha-fetoprotein</div>
  <table class='grid'><tr><th>Component</th><th>Value</th><th>Ref range</th><th>Collected</th></tr>
  <tr><td>Alpha-fetoprotein</td><td>3.1 ng/mL</td><td>0.0 to 8.3</td><td>10/19/2026</td></tr></table>
  <div style='margin-top:14px; font-size:12px' class='grey'>Previous: 3.4 (4/20/2026), 3.2 (10/14/2025)</div>
  <div style='margin-top:18px; border:1px dashed #9fb0c2; padding:8px; font-size:12.5px; line-height:1.5'><b>Result note</b> (.RESULTNORMAL): Your AFP, a blood test we use to screen for liver cancer, is normal. We will repeat it with your next imaging.</div>
 </div>
</div></div>"""
    page("inbasket", body, 1160)

# ------------------------------------------------------------ Transplant tools (slide 19)
def committee():
    body = f"""<div class='win' style='width:560px'>
<div class='pt'><b>ZZTEST, LIVER</b><span class='sm'>Liver transplant evaluation</span></div>
<div class='bar'><span class='ttl'>Insights for Committee Review</span><span class='grey'>Generated summary, review the sources</span></div>
<div style='padding:12px 14px; font-size:13px; line-height:1.55'>
<b>Previous presentations</b><br>Not previously presented.<br><br>
<b>Concerns</b>
<div>&bull; PEth 210 ng/mL on 10/19/2026 <sup class='link'>1</sup></div>
<div>&bull; Lives alone; caregiver plan not yet confirmed <sup class='link'>2</sup></div>
<div>&bull; LI-RADS 3 observation, 1.1 cm, on MRI 8/2025 <sup class='link'>3</sup></div><br>
<b>References</b>
<div class='grey' style='font-size:12px'>1. Lab result, PEth, 10/19/2026<br>2. Progress note, Social Work, 10/20/2026<br>3. Outside imaging, MR abdomen, 8/09/2025</div>
</div></div>"""
    page("committee-insights", body, 562)

def meld_submit():
    rows = [("ZZTEST, LIVER", "10/19/26", "24", True), ("ZZTEST, ALPHA", "10/18/26", "31", True), ("ZZTEST, BRAVO", "10/17/26", "18", True), ("ZZTEST, CHARLIE", "9/30/26", "15", False), ("ZZTEST, DELTA", "10/19/26", "27", True)]
    tr = "".join(f"<tr><td><span class='chk{' on' if e else ''}'></span>{a}</td><td>{b}</td><td style='text-align:center'>{c}</td><td>{'Yes' if e else '<span class=grey>Not new</span>'}</td></tr>" for a, b, c, e in rows)
    body = f"""<div class='win' style='width:560px'>
<div class='bar'><span class='ttl'>MELD Lab Submission</span><span>Liver waitlist</span></div>
<table class='grid'><tr><th>Patient</th><th>New labs</th><th style='text-align:center'>MELD 3.0</th><th>Eligible</th></tr>{tr}</table>
<div style='padding:10px; display:flex'><span class='grey' style='font-size:12px'>4 selected</span><span class='btn pri' style='margin-left:auto'>Submit to UNOS</span></div>
</div>"""
    page("meld-submit", body, 562)

# ------------------------------------------------------------ Signal report (slide 22)
def signal():
    def m(label, you, peer, unit, worse_high=True, maxv=None):
        maxv = maxv or 6
        wy, wp = 260 * you / maxv, 260 * peer / maxv
        col = "#c00000" if (you > peer) == worse_high else "#3d5a78"
        return f"""<tr><td style='width:240px'>{label}</td>
<td style='width:300px'><div style='height:11px; width:{wy}px; background:{col}'></div><div style='height:7px; width:{wp}px; background:#b9c3cf; margin-top:2px'></div></td>
<td style='width:80px; text-align:right'><b>{you}</b> {unit}</td><td style='width:90px; text-align:right' class='grey'>{peer} {unit}</td></tr>"""
    body = f"""<div class='win' style='width:780px'>
<div class='bar'><span class='ttl'>Provider Efficiency Report</span><span>Dr. Example &middot; Hepatology</span><span style='margin-left:auto'>Aug to Oct 2026</span></div>
<div style='padding:10px 12px'>
<table class='grid'><tr><th>Per day with appointments</th><th><span style='display:inline-block;width:10px;height:10px;background:#3d5a78'></span> You &nbsp; <span style='display:inline-block;width:10px;height:6px;background:#b9c3cf'></span> Peers</th><th style='text-align:right'>You</th><th style='text-align:right'>Peers</th></tr>
{m('Time in the system', 5.1, 4.3, 'h')}
{m('Time in notes', 1.9, 1.4, 'h')}
{m('Time in In Basket', 1.1, 0.8, 'h')}
{m('Time in chart review', 1.2, 1.1, 'h')}
{m('Time outside scheduled hours', 1.4, 0.9, 'h')}
{m('Notes closed same day', 61, 78, '%', False, 100)}
</table>
<div style='margin-top:12px; display:flex; gap:12px'>
 <div style='flex:1; border:1px solid #c5ced9; padding:8px 10px'><div class='grey' style='font-size:12px'>Proficiency score</div><div style='font-size:24px; font-weight:bold; color:#c00000'>4.2 <span style='font-size:13px' class='grey'>/ 10 &middot; peers 6.1</span></div></div>
 <div style='flex:1.6; border:1px solid #c5ced9; padding:8px 10px; font-size:12.5px; line-height:1.5'><div class='grey' style='font-size:12px'>Personalization</div>SmartPhrases used: 3 &middot; Preference list orders: 0<br>Chart search: rarely &middot; QuickActions: none</div>
</div></div></div>"""
    page("signal-report", body, 782)

# ------------------------------------------------------------ Full views: every section, as Mohammad's real views have them
def grey_hd(label, n):
    return "<tr class='hd'>" + "<td class='v'></td>" * n + f"<td class='lab' style='color:#a7b2bd; font-weight:normal'>{label}</td></tr>"

def full_pre():
    n = len(DATES)
    dates = "<tr class='dates'>" + "".join(f"<td class='v'><span class='grey'>2025</span><br>{d}</td>" if i == 0 else f"<td class='v'><br>{d}</td>" for i, d in enumerate(DATES)) + "<td class='lab'></td></tr>"
    t = "<table class='syn'>" + dates
    t += hd("Transplants", n) + row("ABO Rh", ["", "", "", "", "", "O POS"]) + row("Transplant status", ["", "", "", "", "Referred", "In evaluation"])
    t += hd("Vitals", n)
    t += row("Weight", ["84.1 kg", "", "85.0 kg", "86.9 kg", "", "88.2 kg"]) + row("BMI", ["27.4", "", "27.7", "28.3", "", "28.7"])
    t += row("BP", ["128/76", "", "118/70", "112/64", "", ("98/58", "lo")]) + row("Pulse", ["74", "", "70", "68", "", "64"])
    t += hd("Scores", n)
    t += row("MELD 3.0", [str(m) for m in MELDS]) + row("Child-Pugh", ["A6", "", "B7", "B8", "", "B9"])
    t += row("Fib-4", ["4.9", "5.3", "5.6", "6.1", "6.4", "6.8"]) + row("APRI", ["1.4", "1.5", "2.0", "2.0", "2.3", "2.3"])
    t += row("NAFLD Fibrosis Score", ["1.2", "", "1.4", "", "", "1.7"]) + row("AST:ALT", ["1.5", "1.6", "1.6", "1.7", "1.8", "1.8"])
    t += hd("Hematology Labs", n)
    t += row("WBC", ["4.8", "4.4", "4.1", "3.9", ("3.6", "lo"), ("3.4", "lo")]) + row("Hemoglobin", [("12.9", "lo"), ("12.4", "lo"), ("11.8", "lo"), ("11.2", "lo"), ("10.9", "lo"), ("10.6", "lo")])
    t += row("Platelets", [("112", "lo"), ("98", "lo"), ("90", "lo"), ("84", "lo"), ("79", "lo"), ("76", "lo")]) + row("INR", [flag(l[2], 0.9, 1.1) for l in LABS])
    t += hd("Chemistry Labs", n)
    t += row("AST", [("62", "ab"), ("58", "ab"), ("71", "ab"), ("66", "ab"), ("74", "ab"), ("69", "ab")]) + row("ALT", [("41", "ab"), "37", ("44", "ab"), "38", ("42", "ab"), "39"])
    t += row("Alkaline phosphatase", ["118", ("131", "ab"), ("140", "ab"), ("138", "ab"), ("152", "ab"), ("149", "ab")])
    t += row("Bilirubin, total", [flag(l[0], 0.2, 1.2) for l in LABS]) + row("Bilirubin, direct", ["0.5", ("0.6", "ab"), ("0.8", "ab"), ("1.1", "ab"), ("1.3", "ab"), ("1.4", "ab")])
    t += row("Albumin", [flag(l[4], 3.5, 5.0) for l in LABS]) + row("Sodium", [flag(l[1], 135, 145) for l in LABS])
    t += row("Potassium", ["4.2", "4.4", "4.5", "4.8", "4.9", ("5.2", "ab")]) + row("Creatinine", [flag(l[3], 0.7, 1.3) for l in LABS])
    t += row("eGFR", ["98", "94", "86", "69", ("62", "lo"), ("57", "lo")])
    t += hd("Other Labs", n) + row("AFP", ["3.2", "", "3.4", "", "", "3.1"]) + row("Vitamin D, 25-OH", ["", "", ("18", "lo"), "", "", "31"])
    t += hd("Fluid Analysis", n) + row("Ascitic fluid PMN", ["", "", "", "", "120", ""]) + row("Ascitic fluid protein", ["", "", "", "", "0.9", ""])
    t += grey_hd("Blood Products", n) + grey_hd("Micro", n)
    t += hd("Anti-infectives", n) + medrow("ciprofloxacin", [(4, 2, "500 mg daily", False)], n)
    t += hd("Liver Meds", n)
    t += medrow("furosemide", [(1, 2, "20 mg daily", False), (3, 3, "40 mg daily", False)], n)
    t += medrow("spironolactone", [(1, 2, "50 mg daily", False), (3, 3, "100 mg daily", False)], n)
    t += medrow("lactulose", [(3, 3, "20 g 2 times daily", False)], n)
    t += medrow("rifaximin", [(4, 2, "550 mg 2 times daily", False)], n)
    t += medrow("carvedilol", [(0, 4, "6.25 mg 2 times daily", False), (4, 1, "D/C", True)], n)
    t += hd("Rest of the Meds", n)
    t += medrow("pantoprazole", [(0, 6, "40 mg daily", False)], n) + medrow("cholecalciferol", [(2, 4, "2,000 units daily", False)], n)
    t += hd("Imaging", n)
    t += row("US ABDOMEN W ELASTOGRAPHY", ["&#x24D8;", "", "&#x24D8;", "", "", ""]) + row("MR ABDOMEN W WO CONTRAST", ["", "", "", "&#x24D8;", "", ""])
    t += row("CT CHEST WO CONTRAST", ["", "", "", "", "", "&#x24D8;"])
    t += hd("Cardiac", n) + row("TRANSTHORACIC ECHO", ["", "", "", "", "", "&#x24D8;"]) + row("DOBUTAMINE STRESS ECHO", ["", "", "", "", "", "&#x24D8;"])
    t += hd("Procedures", n) + row("PARACENTESIS", ["", "", "", "", "&#x24D8;", ""]) + row("EGD", ["", "", "", "", "", ""])
    t += grey_hd("Urine/Stool Output", n) + grey_hd("Dialysis/CRRT", n)
    t += hd("Toxicology", n) + row("PEth 16:0/18:1", ["", "", "", "", "", ("210", "ab")]) + row("Drug screen, urine", ["", "", "", "", "", "Negative"])
    t += "</table>"
    body = f"<div class='win'>{PT}{synbar('Liver Disease')}{t}</div>"
    page("full-pre", body, 1100)

def full_post():
    # same order as our real post-transplant view: vitals, immunosuppression and levels, infections, then labs and meds
    D = [("8mo 0wk", "6/15/26", "09:12"), ("", "7/13/26", "10:07"), ("8mo 2wk", "8/10/26", "08:57"), ("", "9/14/26", "11:20"), ("9mo 2wk", "10/12/26", "10:35"), ("", "10/26/26", "09:40")]
    n = len(D)
    dates = "<tr class='dates'>" + "".join(f"<td class='v'><b>{w}</b><br>{d}<br><span class='grey'>{t}</span></td>" for w, d, t in D) + "<td class='lab'></td></tr>"
    t = "<table class='syn'>" + dates
    t += grey_hd("Infection/Rejection", n)
    t += hd("Vitals", n) + row("Weight", ["74.2 kg", "", "73.6 kg", "", "74.0 kg", "74.3 kg"]) + row("Temp", ["36.8", "", "36.7", "", "36.6", "36.7"])
    t += row("Pulse", ["78", "", "74", "", "72", "70"]) + row("BP", [("142/86", "ab"), "", "134/80", "", "126/76", "124/74"]) + row("BMI (Calculated)", ["24.3", "", "24.1", "", "24.2", "24.3"])
    t += hd("Immunosuppression", n)
    t += medrow("tacrolimus", [(0, 2, "3 mg BID oral", False), (2, 2, "2 mg BID oral", False), (4, 2, "1.5 mg BID oral", False)], n)
    t += medrow("mycophenolate mofetil", [(0, 6, "1,000 mg BID oral", False)], n)
    t += hd("Immunosuppression Levels", n) + row("Tacrolimus, LC-MS/MS", [("11.8", "ab"), ("10.9", "ab"), "8.4", "7.9", "6.1", "5.8"])
    t += "<tr class='hd'>" + "<td class='v'></td>" * n + "<td class='lab'>TXP Synopsis Immunology<span class='car'>&#x2304;</span></td></tr>"
    t += grey_hd("Anti-infectives", n)
    t += hd("Infection Monitoring", n)
    t += row("CMV DNA, QN PCR", ["Not Detected", "", "Not Detected", "", "Not Detected", ""]) + row("CMV Qn DNA PCR", ["&lt;35 IU/mL", "", "&lt;35 IU/mL", "", "&lt;35 IU/mL", ""])
    t += row("log10 CMV Qn DNA", ["&lt;1.54", "", "&lt;1.54", "", "&lt;1.54", ""])
    t += hd("Chemistry Labs", n)
    t += row("AST", ["31", "28", "24", "22", "25", "20"]) + row("ALT", [("44", "ab"), "39", "30", "27", "26", "22"])
    t += row("Alkaline phosphatase", [("162", "ab"), ("140", "ab"), ("131", "ab"), "118", "104", "98"]) + row("Bilirubin, total", ["0.9", "0.8", "0.7", "0.6", "0.7", "0.6"])
    t += row("Bilirubin, direct", ["0.3", "0.2", "0.2", "0.1", "0.2", "0.1"]) + row("Albumin", ["3.9", "4.1", "4.2", "4.3", "4.4", "4.4"])
    t += row("Sodium", ["138", "139", "140", "139", "141", "140"]) + row("Potassium", [("5.4", "ab"), "5.1", "4.9", "4.7", "4.6", "4.4"])
    t += row("Cr", [("1.62", "ab"), ("1.55", "ab"), ("1.41", "ab"), "1.28", "1.19", "1.10"]) + row("eGFRcr", [("48", "lo"), ("51", "lo"), ("57", "lo"), "64", "70", "76"])
    t += row("Magnesium", [("1.5", "lo"), ("1.6", "lo"), "1.7", "1.8", "1.9", "1.9"]) + row("Phosphorus", ["3.1", "3.3", "3.4", "3.2", "3.5", "3.4"])
    t += row("PEth 16:0/18:1 (POPEth)", ["", "", "Negative", "", "", "Negative"])
    t += hd("Hematology Labs", n)
    t += row("Auto WBC", [("3.4", "lo"), ("3.6", "lo"), "4.2", "4.8", "5.1", "5.6"]) + row("Hgb", [("10.1", "lo"), ("10.8", "lo"), ("11.6", "lo"), ("12.2", "lo"), "13.1", "13.6"])
    t += row("Platelets", [("128", "lo"), ("142", "lo"), "168", "182", "190", "201"]) + row("Neutrophils Absolute", ["2.10", "2.32", "2.88", "3.16", "3.40", "3.69"])
    t += row("Lymphocytes Absolute", [("0.62", "lo"), ("0.71", "lo"), ("0.88", "lo"), "1.02", "1.20", "1.38"]) + row("INR", ["1.1", "1.0", "1.0", "1.0", "1.0", "1.0"])
    t += grey_hd("Other Meds", n)
    t += hd("Toxicology", n) + row("PEth 16:0/18:1 (POPEth)", ["", "", "Negative", "", "", "Negative"])
    t += hd("Rest of the Meds", n)
    t += medrow("acetaminophen", [(0, 6, "500-1,000 mg q6h PRN oral", False)], n) + medrow("cholecalciferol", [(0, 6, "25 mcg daily oral", False)], n)
    t += medrow("pantoprazole sodium", [(0, 2, "40 mg daily oral", False)], n) + medrow("magnesium oxide", [(0, 4, "400 mg BID oral", False)], n)
    t += medrow("patiromer", [(0, 1, "8.4 g daily", False), (1, 1, "D/C", True)], n)
    t += "</table>"
    pt = PT.replace('Hepatology', 'Transplant Hepatology').replace('LIVER<', 'ECHO<').replace('58 y.o.', '61 y.o.')
    body = f"<div class='win'>{pt}<div class='bar'><span class='ttl'>Synopsis</span><span>Liver-Post 1 Year</span><span style='margin-left:auto'><span class='chk on'></span>All Rows</span><span>&#x21bb; &lt;1m ago</span></div>{t}</div>"
    page("full-post", body, 1100)

def full_workup(hl=False):
    GAPS = {"Hepatitis B surface antibody", "Hepatitis B core antibody", "HFE gene analysis", "Hemoglobin A1c", "Triglycerides", "HDL cholesterol"}
    def r(label, val, date):
        cls = " class='hl'" if (hl and label in GAPS) else ""
        return f"<tr{cls}><td class='v' style='width:130px'>{val}</td><td class='v' style='width:100px'>{date}</td><td class='lab' style='width:320px'>{label}</td></tr>"
    def h(label, grey=False):
        if grey: return f"<tr class='hd'><td class='v'></td><td class='v'></td><td class='lab' style='color:#a7b2bd; font-weight:normal'>{label}</td></tr>"
        return f"<tr class='hd'><td class='v'></td><td class='v'></td><td class='lab'>{label}<span class='car'>&#x2303;</span></td></tr>"
    ab = lambda v: f"<span class='ab'>{v}</span>"
    lo = lambda v: f"<span class='lo'>{v}</span>"
    no = "<span class='grey'>&mdash;</span>"
    t = "<table class='syn' style='width:100%'><tr class='dates'><td class='v'>Most Recent<br><span class='grey'>20 years</span></td><td class='v'></td><td class='lab'></td></tr>"
    t += h("Transplants") + r("ABO Rh", "O POS", "10/19/26")
    t += h("Scores") + r("MELD 3.0", str(MELDS[-1]), "10/19/26") + r("Fib-4", "6.8", "10/19/26") + r("NAFLD Fibrosis Score", "1.7", "10/19/26") + r("APRI", "2.3", "10/19/26") + r("AST:ALT", "1.8", "10/19/26") + r("R Factor", "1.4", "10/19/26")
    t += h("Hepatitis Section") + r("Hepatitis A antibody, total", "Reactive", "11/02/19") + r("Hepatitis B surface antigen", "Non Reactive", "11/02/19")
    t += r("Hepatitis B surface antibody", lo("&lt;3.5"), "11/02/19") + r("Hepatitis B core antibody", no, "") + r("Hepatitis C antibody", "Non Reactive", "10/14/25") + r("HIV-1/2 Ag/Ab", "Non Reactive", "10/14/25")
    t += h("Hemochromatosis") + r("Iron", ab("176"), "10/14/25") + r("TIBC", "259", "10/14/25") + r("Transferrin saturation", ab("68"), "10/14/25") + r("Ferritin", ab("1,240"), "10/14/25") + r("HFE gene analysis", no, "")
    t += h("Autoimmune Hepatitis") + r("ANA Direct", "Negative", "10/14/25") + r("Actin (Smooth Muscle) Ab", no, "") + r("Protein electrophoresis", no, "") + r("Immunoglobulin G (IgG)", "1,310", "10/14/25")
    t += h("Alpha-1 Antitrypsin") + r("Alpha-1-Antitrypsin", "112", "10/14/25") + r("Alpha-1 phenotype", no, "")
    t += h("Wilson Disease") + r("Ceruloplasmin", "24", "10/14/25")
    t += h("MASLD Section") + r("Weight", "88.2 kg", "10/19/26") + r("BMI", ab("28.7"), "10/19/26") + r("Hemoglobin A1c", ab("6.1"), "10/19/26") + r("Glucose, fasting", ab("112"), "10/19/26")
    t += r("Cholesterol, total", "184", "10/19/26") + r("Triglycerides", ab("182"), "10/19/26") + r("HDL cholesterol", lo("34"), "10/19/26") + r("LDL cholesterol", "114", "10/19/26")
    t += h("Others (Biopsies, etc)") + r("Liver biopsy, outside", "&#x24D8;", "2/11/19")
    t += h("Procedures", True)
    t += h("Cardiac") + r("TRANSTHORACIC ECHO", "&#x24D8;", "10/19/26")
    t += h("Imaging") + r("CT CHEST WO CONTRAST", "&#x24D8;", "10/19/26") + r("MR ABDOMEN W WO CONTRAST", "&#x24D8;", "7/14/26") + r("US ABDOMEN W ELASTOGRAPHY", "&#x24D8;", "4/20/26")
    t += "</table>"
    body = f"<div class='win'>{PT}{synbar('CLD Workup')}{t}</div>"
    page("full-workup" + ("-hl" if hl else ""), body, 640)

# ------------------------------------------------------------ Chart search dropdown: related terms, trends, math (layout after the Epic Specialist Spotlight video)
LBL = "style='color:#5b6b7b; font-size:13px; padding:8px 14px 4px'"
def dd(name, pt_name, age, query, inner):
    body = f"""<div style='background:#e9edf1; padding:8px 0 10px 0'>
<div style='margin:0 0 0 8px; width:640px; background:#fff; border:1px solid #b9c4cf; border-radius:6px; box-shadow:0 4px 14px rgba(0,0,0,.22); font-size:15px'>
 <div style='padding:10px 14px; border-bottom:1px solid #dde3e9; font-size:17px'>&#x1F50D;&#xFE0E; {query}<span style='color:#2f6fa7'>|</span></div>
 {inner}
 <div style='height:8px'></div>
</div></div>"""
    page(name, body.replace("class='chip'", "style='display:inline-block; border:1px solid #c5ced9; border-radius:12px; padding:3px 10px; margin-right:6px; font-size:13px'"), 658)

def ptrow(n, age):
    return f"<div style='padding:7px 14px; border-bottom:1px solid #dde3e9; display:flex; justify-content:space-between'><span><b style='color:#1f3b57'>{n}</b><br><span class='grey' style='font-size:13px'>{age}</span></span><span style='text-align:right; font-size:13px'>Office Visit &middot; Hepatology<br><span class='grey'>10/19/2026</span></span></div>"

def sugg(rows):
    out = f"<div {LBL}>Search the Chart</div>"
    for i, (t, ic) in enumerate(rows):
        out += f"<div style='padding:6px 14px;{' background:#dcefe9' if i == 0 else ''}'>{ic} {t}</div>"
    return out

def spot(text, title, body, links=True):
    lk = "<div style='padding:4px 0 8px; color:#2f6fa7; font-size:13px'>&#9776; Results &nbsp;&nbsp; &#8599; Trend &nbsp;&nbsp; &#9636; Full Report</div>" if links else ""
    return f"""<div {LBL}>Spotlight</div>
<div style='margin:0 14px 6px; border:1px solid #dde3e9; border-radius:4px; padding:8px 12px'>
 <div style='font-size:14px'>{text}</div>{lk}
 <div style='border-left:4px solid #b03a3a; padding:6px 0 6px 12px'>
  <div style='display:inline-block; background:#f8dede; color:#a12a2a; font-weight:bold; border-radius:12px; padding:3px 12px'>{title}</div>
  {body}
 </div></div>"""

MG = "&#9670;"
def cs_related():
    rows = [("hepatitis b", "&#x1F50D;&#xFE0E;"), ("hepatitis b <b>core antibody</b>", "&#x1F50D;&#xFE0E;"),
            ("<b>entecavir</b> 0.5 mg tablet &middot; <span class='grey'>active med</span>", "&#128138;"), ("<b>tenofovir</b> disoproxil 300 mg &middot; <span class='grey'>stopped 2021</span>", "&#128138;")]
    tbl = """<table style='margin-top:8px; font-size:14px; border-collapse:collapse; width:100%'>
<tr class='grey'><td style='padding:3px 0'>Component</td><td>1 mo ago</td><td>7 mo ago</td></tr>
<tr><td style='padding:3px 0'><b>Hepatitis B surface antigen</b></td><td class='ab'>Reactive</td><td class='ab'>Reactive</td></tr>
<tr><td style='padding:3px 0'><b>HBV DNA, quantitative</b></td><td>Not detected</td><td class='ab'>1,240 IU/mL</td></tr></table>"""
    inner = ptrow("ZZTEST, GOLF", "Male, 47 y.o.") + sugg(rows) + spot("ZZTEST, GOLF's latest result for &lsquo;hepatitis b&rsquo; was on 9/30/2026.", "&#9888; Hepatitis B surface antigen", tbl)
    dd("cs-related", "ZZTEST, GOLF", "47 y.o. M", "hepatitis b", inner)

def cs_trend():
    yrs = ["2016", "2018", "2019", "2021", "2023", "2025", "2026"]
    alt = [64, 71, 58, 49, 52, 41, 39]
    wt = [104, 108, 101, 96, 97, 91, 89]
    W_, H_, x0, x1, y0 = 560, 230, 46, 500, 18
    xs = [x0 + 15 + i * (x1 - x0 - 30) / (len(yrs) - 1) for i in range(len(yrs))]
    YA = lambda v: y0 + (120 - v) * (H_ - y0 - 35) / 120     # ALT 0-120 U/L, left axis
    YW = lambda v: y0 + (110 - v) * (H_ - y0 - 35) / 60      # weight 50-110 kg, right axis
    A, Wc = "#2f6fa7", "#2E7D8C"
    svg = f"<svg width='{W_}' height='{H_}' style='font-family:Liberation Sans; font-size:12px'>"
    for v in (0, 40, 80, 120):
        svg += f"<line x1='{x0}' y1='{YA(v):.0f}' x2='{x1}' y2='{YA(v):.0f}' stroke='#e3e8ee'/><text x='{x0-24}' y='{YA(v)+4:.0f}' fill='{A}'>{v}</text>"
    for v in (50, 70, 90, 110):
        svg += f"<text x='{x1+6}' y='{YW(v)+4:.0f}' fill='{Wc}'>{v}</text>"
    svg += f"<line x1='{x0}' y1='{YA(40):.0f}' x2='{x1}' y2='{YA(40):.0f}' stroke='#c00000' stroke-dasharray='5 4'/><text x='{x0+4}' y='{YA(40)+15:.0f}' fill='#c00000'>ALT ULN 40</text>"
    svg += "<polyline points='" + " ".join(f"{x:.0f},{YW(v):.0f}" for x, v in zip(xs, wt)) + f"' fill='none' stroke='{Wc}' stroke-width='2.5' stroke-dasharray='7 4'/>"
    svg += "<polyline points='" + " ".join(f"{x:.0f},{YA(v):.0f}" for x, v in zip(xs, alt)) + f"' fill='none' stroke='{A}' stroke-width='2.5'/>"
    for x, a_, w_, y in zip(xs, alt, wt, yrs):
        svg += f"<circle cx='{x:.0f}' cy='{YA(a_):.0f}' r='4' fill='{A}'/><text x='{x-8:.0f}' y='{YA(a_)+18:.0f}' fill='{A}'>{a_}</text>"
        svg += f"<rect x='{x-3.5:.0f}' y='{YW(w_)-3.5:.0f}' width='7' height='7' fill='{Wc}'/><text x='{x-10:.0f}' y='{YW(w_)-9:.0f}' fill='{Wc}'>{w_}</text>"
        svg += f"<text x='{x-15:.0f}' y='{H_-6}' fill='#6d7f92'>{y}</text>"
    svg += "</svg>"
    leg = f"<div style='font-size:13px; margin:2px 0 6px'><span style='color:{A}'>&#9679; ALT (U/L), left</span> &nbsp;&nbsp; <span style='color:{Wc}'>&#9632; Weight (kg), right</span></div>"
    btn = lambda t, on=False: f"<span style='display:inline-block; border:1px solid #c5ced9; border-radius:3px; padding:2px 9px; margin-right:5px; font-size:12px;{' background:#dcefe9' if on else ''}'>{t}</span>"
    card = f"""<div {LBL}>Spotlight</div>
<div style='margin:0 14px 6px; border:1px solid #dde3e9; border-radius:4px; padding:8px 12px'>
 <div style='font-size:14px'>Here are ZZTEST, HOTEL's trended labs and vitals.</div>
 <div style='border-left:4px solid #7b3fa0; padding:6px 0 6px 12px; margin-top:6px'>
  <div style='display:flex; justify-content:space-between'><span style='display:inline-block; background:#eadcf3; color:#5b2a7c; font-weight:bold; border-radius:12px; padding:3px 12px'>Trend &middot; ALT and weight</span><span class='grey' style='font-size:13px'>10/2016 - 10/2026</span></div>
  {leg}{svg}
  <div style='text-align:center'>{btn('All Data')}{btn('10 Years', True)}{btn('5 Years')}{btn('1 Year')}</div>
 </div></div>"""
    q = "trend alt weight 10 years"
    inner = ptrow("ZZTEST, HOTEL", "Male, 52 y.o.") + sugg([(q, "&#x1F50D;&#xFE0E;")]) + card
    dd("cs-trend", "ZZTEST, HOTEL", "52 y.o. M", q, inner)

def cs_math():
    inner = f"<div {LBL}>Calculation</div><div style='padding:10px 14px; background:#dcefe9; font-size:20px'>&#128425; <b>= 1,040</b> <span class='grey' style='font-size:15px'>&middot; Copy answer to clipboard</span></div>"
    inner += ptrow("ZZTEST, INDIA", "Female, 54 y.o.") + sugg([("80x13", "&#x1F50D;&#xFE0E;")]).replace(" background:#dcefe9", "")
    dd("cs-math", "ZZTEST, INDIA", "54 y.o. F", "80x13", inner)

# ------------------------------------------------------------ Order search with preference list (Preference Lists guide)
def order_search():
    STAR = "<span style='color:#e0a100; font-size:17px'>&#9733;</span>"
    tabs = "".join(f"<span class='tab{' on' if t == 'Browse' else ''}'>{t}</span>" for t in ["Browse", "Preference List", "Database"])
    sec = lambda t: f"<tr><td colspan='3' style='background:#eef2f6; font-weight:bold; color:#1f3b57'>&#9662; {t}</td></tr>"
    r = lambda n, d, st=True: f"<tr><td style='width:28px'>{STAR if st else ''}</td><td>{n}</td><td class='grey'>{d}</td></tr>"
    rows = sec("My Favorites: MELD labs") + r("CMP, CBC, Protime-INR", "Routine, once") + r("AFP tumor marker", "Added to every MELD draw")
    rows += sec("My Favorites: HCC tumor markers") + r("AFP", "Routine, once") + r("AFP-L3%", "Routine, once") + r("DCP (des-gamma-carboxy prothrombin)", "Routine, once")
    rows += sec("My Favorites: CLD workup") + r("Hepatitis A, B and C panel, iron studies, HFE", "Routine, once") + r("ANA, ASMA, IgG, alpha-1 antitrypsin, ceruloplasmin", "Routine, once") + r("PEth (phosphatidylethanol)", "Routine, once")
    rows += sec("My Favorites: imaging") + r("MRI abdomen w wo contrast", "Comment: triphasic, liver protocol")
    body = f"""<div class='win' style='width:780px'>{PT}
<div class='bar'><span class='ttl'>Order Search</span><span style='margin-left:auto' class='btn'>&#128101; Follow Users</span></div>
<div style='padding:8px 10px'><span style='display:inline-block; width:420px; border:2px solid #2f6fa7; border-radius:3px; padding:4px 8px; font-size:15px'>&#x1F50D;&#xFE0E; <span class='grey'>Search orders</span></span></div>
<div style='background:#f3f6f9; border-bottom:1px solid #c5ced9'>{tabs}</div>
<table class='grid'>{rows}</table>
<div style='padding:6px 10px; font-size:12px' class='grey'>{STAR} = on my preference list (click the star on any order to add it)</div>
</div>"""
    page("order-search", body, 782)

def cs_ocr():
    scan = """<div style='background:#f7f5ef; border:1px solid #cfc9b8; padding:12px 16px; font-family:"Liberation Serif", serif; font-size:14px; color:#333; transform:rotate(-0.6deg); box-shadow:inset 0 0 18px rgba(120,110,80,.18)'>
<div style='text-align:center; font-weight:bold; letter-spacing:1px'>RIVERBEND MEDICAL CENTER &middot; HEPATOLOGY</div>
<div style='font-size:12px; text-align:center; color:#666'>FAX &middot; Page 3 of 7</div><br>
Assessment: steatotic liver disease, ongoing alcohol use.<br>
Transient <span class='hlc'>elastography</span> 6/02/2024: liver stiffness 12.4 kPa,<br>CAP 310 dB/m, IQR/median 18%.<br>
Plan: repeat <span class='hlc'>elastography</span> in 1 year, AUDIT-C each visit.</div>"""
    res = f"""<div {LBL}>Search the Chart</div>
<div style='padding:7px 14px; background:#dcefe9'>&#128462; <b>Scanned fax</b>: referral, Riverbend <span class='grey'>&middot; 6/14/2024 &middot; 2 matches</span></div>
<div style='padding:7px 14px'>&#128462; Imaging: US abdomen w <span class='hlc'>elastography</span> <span class='grey'>&middot; 4/20/2026</span></div>
<div style='margin:8px 14px 6px; border:1px solid #b9c4cf; border-radius:4px; box-shadow:0 2px 8px rgba(0,0,0,.18); padding:10px 12px'>
 <div style='font-size:13px; color:#5b6b7b; margin-bottom:8px'>Hover preview &middot; text read from the scanned fax</div>{scan}
 <div style='font-size:13px; margin-top:8px' class='grey'>Matches: page 3 (2)</div></div>"""
    inner = ptrow("ZZTEST, LIVER", "Male, 58 y.o.") + res
    dd("cs-ocr", "ZZTEST, LIVER", "58 y.o. M", "elastography", inner)

order_search(); cs_ocr()
cs_related(); cs_trend(); cs_math()
full_pre(); full_post(); full_workup(); full_workup(True)
cirrhosis(False); cirrhosis(True); workup(False); workup(True); transplant(); chart_search(); chart_review(0); chart_review(1); care_everywhere()
note(1); note(2); order_set(); inbasket(); committee(); meld_submit(); signal()
print("MELD", MELDS)
