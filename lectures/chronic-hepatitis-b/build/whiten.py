# Pushes the near-white paper of a Gemini spot illustration to pure white so it sits cleanly on a white slide.
# usage: python3 whiten.py in.jpg out.png
import sys
import numpy as np
from PIL import Image
a = np.array(Image.open(sys.argv[1]).convert("RGB")).astype(float)
lo, hi = 212.0, 236.0
m = a.min(axis=2, keepdims=True)
t = np.clip((m - lo) / (hi - lo), 0, 1)
a = a * (1 - t) + 255 * t
Image.fromarray(a.astype("uint8")).resize((1200, 1200), Image.LANCZOS).save(sys.argv[2], optimize=True)
