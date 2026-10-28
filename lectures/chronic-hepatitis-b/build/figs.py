# Draws the layered natural-history figure (phases-1..5.png) and the QR codes used in the deck.
import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.patches
import matplotlib.pyplot as plt
from matplotlib import font_manager as fm
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer
from qrcode.image.styles.colormasks import SolidFillColorMask

for f in fm.findSystemFonts():
    if "Carlito" in f: fm.fontManager.addfont(f)
plt.rcParams["font.family"] = "Carlito"

NAVY, TEAL, OCHRE, GREY, RED = "#1F4E79", "#2E7D8C", "#C08A3E", "#8C8C8C", "#C00000"
rng = np.random.default_rng(7)

def wob(x, amp, f1, f2, ph):
    return amp * (np.sin(f1 * x + ph) * 0.6 + np.sin(f2 * x + 2 * ph) * 0.4)

x = np.linspace(0.05, 8.3, 900)
# schematic viral load, log10 IU/mL (not data)
dna = np.where(x < 2.4, 8.3 + wob(x, 0.12, 5, 11, 0.3),
      np.where(x < 4.1, 8.0 - (x - 2.4) * 1.9 + wob(x, 0.55, 14, 23, 1.1),
      np.where(x < 6.6, 2.9 + wob(x, 0.35, 6, 13, 2.0) - 0.15 * (x - 4.1),
               3.0 + (x - 6.6) * 0.9 + wob(x, 0.7, 9, 17, 0.4))))
dna = np.where((x >= 4.1) & (x < 4.3), np.interp(x, [4.1, 4.3], [4.6, 3.0]), dna)
# schematic ALT, U/L
alt = 22 + 0 * x
def flare(c, h, w): return h * np.exp(-((x - c) / w) ** 2)
for c, h, w in [(2.55, 220, .07), (3.1, 330, .08), (3.45, 340, .07), (3.9, 310, .08), (4.2, 140, .06),
                (3.0, 200, .05), (3.7, 210, .05)]:
    alt = alt + flare(c, h, w)
for c in np.arange(6.7, 8.3, 0.17):
    alt = alt + flare(c, rng.uniform(70, 160), 0.05)
alt = alt + rng.normal(0, 1.2, x.size)

def fig(step, out):
    f = plt.figure(figsize=(11.2, 6.4), dpi=170)
    gs = f.add_gridspec(3, 1, height_ratios=[3.0, 1.6, 2.2], hspace=0.12, left=0.115, right=0.985, top=0.855, bottom=0.17)
    a1, a2, a3 = f.add_subplot(gs[0]), f.add_subplot(gs[1]), f.add_subplot(gs[2])
    for a in (a1, a2, a3):
        a.set_xlim(0, 8.4)
        for s in ("top", "right"): a.spines[s].set_visible(False)
        a.tick_params(length=3, labelsize=12)
    a1.set_ylim(2, 9); a1.set_yticks([3, 5, 7, 9]); a1.set_yticklabels(["1,000", "100,000", "10,000,000", "1,000,000,000"])
    a1.set_ylabel("HBV DNA (IU/mL)", fontsize=13); a1.set_xticks([])
    a2.set_ylim(0, 3); a2.set_yticks([]); a2.set_xticks([]); a2.spines["left"].set_visible(False)
    a3.set_ylim(0, 420); a3.set_yticks([0, 100, 200, 300, 400]); a3.set_ylabel("ALT (U/L)", fontsize=13)
    a3.set_xticks(range(0, 9)); a3.set_xlabel("Age, decades (schematic, not every patient follows this course)", fontsize=12)
    if step >= 2:
        a1.plot(x, dna, color=NAVY, lw=2.2)
        for v, lab in [(np.log10(20000), "20,000"), (np.log10(2000), "2,000")]:
            a1.axhline(v, color=GREY, lw=1, ls=(0, (3, 3)))
            a1.text(8.38, v + 0.08, lab, ha="right", fontsize=11, color="#595959")
    if step >= 3:
        a3.plot(x, alt, color=TEAL, lw=2.0)
        a3.axhline(35, color=GREY, lw=1, ls=(0, (3, 3)))
        a3.text(0.05, 48, "ULN", ha="left", fontsize=11, color="#595959")
    if step >= 4:
        rows = [("HBsAg", 2.4, 8.3, "+"), ("HBeAg", 1.4, 4.1, "+"), ("Anti-HBe", 0.4, 4.1, None)]
        for lab, y, cut, _ in rows:
            a2.text(-0.12, y, lab, ha="right", va="center", fontsize=13, transform=a2.transData)
        xs = np.arange(0.1, 8.3, 0.18)
        for xv in xs:
            a2.text(xv, 2.4, "+", ha="center", va="center", fontsize=12)
            a2.text(xv, 1.4, "+" if xv < 4.1 else "–", ha="center", va="center", fontsize=12, color="black" if xv < 4.1 else GREY)
            a2.text(xv, 0.4, "–" if xv < 4.1 else "+", ha="center", va="center", fontsize=12, color=GREY if xv < 4.1 else "black")
    if step >= 5:
        bands = [(0, 2.4, "HBeAg-positive\nchronic infection", "Immune tolerant", False),
                 (2.4, 4.1, "HBeAg-positive\nchronic hepatitis", "Immune clearance", True),
                 (4.1, 6.6, "HBeAg-negative\nchronic infection", "Immune control", False),
                 (6.6, 8.4, "HBeAg-negative\nchronic hepatitis", "Immune escape", True)]
        for a in (a1, a2, a3):
            for lo, hi, _, _, hep in bands:
                if hep: a.axvspan(lo, hi, color="#F4DADA", alpha=0.55, lw=0)
        for lo, hi, new, old, hep in bands:
            a1.text((lo + hi) / 2, 9.75, new, ha="center", va="bottom", fontsize=12.5, bbox=None)
            a1.text((lo + hi) / 2, 9.2, old, ha="center", va="bottom", fontsize=11, color="#595959", style="italic")
        for v in (2.4, 4.1, 6.6): a1.axvline(v, color="#BBBBBB", lw=0.8, ymax=1.0)
        f.patches.append(matplotlib.patches.FancyArrowPatch((0.13, 0.04), (0.975, 0.04), transform=f.transFigure,
                         arrowstyle="-|>", mutation_scale=18, color=OCHRE, lw=2))
        f.text(0.55, 0.055, "Risk of fibrosis and HCC rises with time spent in the hepatitis phases", ha="center", va="bottom", fontsize=12.5, color=OCHRE)
    f.savefig(out, facecolor="white")
    plt.close(f)

for s in range(1, 6): fig(s, f"img/phases-{s}.png")

def qr(url, out):
    q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=22, border=1)
    q.add_data(url); q.make(fit=True)
    img = q.make_image(image_factory=StyledPilImage, module_drawer=RoundedModuleDrawer(),
                       color_mask=SolidFillColorMask(back_color=(255, 255, 255), front_color=(0x1A, 0x1F, 0x31)))
    img = img.convert("RGBA")
    px = img.load()
    for i in range(img.width):
        for j in range(img.height):
            if px[i, j][:3] == (255, 255, 255): px[i, j] = (255, 255, 255, 0)
    img.save(out)

RAW = "https://raw.githubusercontent.com/qaddodi/mohammad-almeqdadi-lectures/main/lectures/chronic-hepatitis-b/"
qr(RAW + "CHB-slides-30min.pdf", "img/qr-slides-30.png")
qr(RAW + "CHB-slides-60min.pdf", "img/qr-slides-60.png")
qr("https://qaddodi.github.io/chb-hcc-risk/", "img/qr-calculator.png")
