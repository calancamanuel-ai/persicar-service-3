#!/usr/bin/env python3
"""Migliora le foto senza generare nulla: solo pulizia, toni e nitidezza.

    python3 scripts/tratta-foto.py [sorgente] [uscita]
    default: materiale/foto-scelte -> materiale/foto-trattate

Per ogni foto:
1. denoise spaziale leggero (ffmpeg nlmeans s=2): toglie i blocchi di compressione di Instagram;
2. livelli: punto del nero e del bianco allo 0,4%, senza cambiare la tinta;
3. bilanciamento: metà correzione verso un neutro appena caldo, così il set ha una sola temperatura
   al posto dei filtri Instagram diversi da video a video;
4. saturazione al 94%;
5. maschera di contrasto leggera (raggio 1,2, 55%, soglia 2).
Nessun ingrandimento, nessun dettaglio inventato. Servono ffmpeg, Pillow e numpy.
"""
import os
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

src = sys.argv[1] if len(sys.argv) > 1 else "materiale/foto-scelte"
out = sys.argv[2] if len(sys.argv) > 2 else "materiale/foto-trattate"
os.makedirs(out, exist_ok=True)


def tratta(im: Image.Image) -> Image.Image:
    im = ImageOps.autocontrast(im, cutoff=(0.4, 0.4), preserve_tone=True)
    a = np.asarray(im).astype(np.float32)
    lum = a.mean(-1)
    mid = (lum > 60) & (lum < 200)
    m = a[mid].mean(0)
    target = m.mean() * np.array([1.025, 1.0, 0.965])
    gain = np.clip(target / m, 0.9, 1.1)
    a = a * (0.5 + 0.5 * gain)
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    im = ImageEnhance.Color(im).enhance(0.94)
    return im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=55, threshold=2))


for f in sorted(os.listdir(src)):
    if not f.lower().endswith((".webp", ".png", ".jpg", ".jpeg")):
        continue
    name = os.path.splitext(f)[0]
    with tempfile.TemporaryDirectory() as tmp:
        dn = os.path.join(tmp, "dn.png")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(src, f), "-vf", "nlmeans=s=2:p=7:r=13", dn], check=True)
        tratta(Image.open(dn).convert("RGB")).save(os.path.join(out, name + ".webp"), lossless=True, method=6)
    print("trattata", name)
