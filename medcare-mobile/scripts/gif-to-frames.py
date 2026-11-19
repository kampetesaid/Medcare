#!/usr/bin/env python3
"""
Convertit le GIF animé du logo en images pour l'animation d'ouverture de Medcare.

Usage :  python3 scripts/gif-to-frames.py  chemin/vers/logo-anime.gif

Génère :
  assets/splash/frame0.png … frameN.png   (animation, recadrées de façon identique)
  assets/splash/meta.json                 (nombre d'images, durée, ratio — lu par SplashScreen)
  assets/logo-full.png                    (logo complet, dernière image)
  assets/logo-mark.png                    (emblème seul, sans le mot MedCare)
  assets/icon.png, adaptive-icon.png, splash.png

Dépendance : pip install pillow
Astuce qualité : exporte le GIF en 2x ou 3x (≥ 800 px de large). Un GIF en 0,5x sera flou en plein écran.
"""
import json, sys, os
from PIL import Image, ImageSequence

SCALE_MIN_WIDTH = 900      # largeur minimale des images d'animation (agrandies si besoin)
MARK_CUT_RATIO = 0.768      # hauteur (en fraction du logo) où l'on coupe pour isoler l'emblème — à ajuster

src = sys.argv[1]
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(root, "assets")
os.makedirs(os.path.join(out, "splash"), exist_ok=True)

gif = Image.open(src)
frames = [f.convert("RGBA").copy() for f in ImageSequence.Iterator(gif)]
durations = [f.info.get("duration", 100) for f in ImageSequence.Iterator(gif)]

# Boîte englobante commune : toutes les images gardent le même cadrage (pas de saut)
boxes = [f.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox() for f in frames]
x0 = min(b[0] for b in boxes); y0 = min(b[1] for b in boxes)
x1 = max(b[2] for b in boxes); y1 = max(b[3] for b in boxes)
pad = 8
box = (max(0, x0 - pad), max(0, y0 - pad), min(frames[0].width, x1 + pad), min(frames[0].height, y1 + pad))
cw, ch = box[2] - box[0], box[3] - box[1]
scale = max(1.0, SCALE_MIN_WIDTH / cw)
size = (round(cw * scale), round(ch * scale))

for i, f in enumerate(frames):
    f.crop(box).resize(size, Image.LANCZOS).save(os.path.join(out, "splash", f"frame{i}.png"), optimize=True)

json.dump({"frames": len(frames), "frameMs": int(sum(durations) / len(durations)), "ratio": size[0] / size[1]},
          open(os.path.join(out, "splash", "meta.json"), "w"))

# Logo complet + emblème
last = frames[-1]
lb = last.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox()
full = last.crop(lb)
full.resize((round(full.width * scale), round(full.height * scale)), Image.LANCZOS).save(os.path.join(out, "logo-full.png"), optimize=True)

cut = lb[1] + round((lb[3] - lb[1]) * MARK_CUT_RATIO)
mark = last.crop((lb[0], lb[1], lb[2], cut))
mark = mark.crop(mark.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox())
mark = mark.resize((round(mark.width * scale), round(mark.height * scale)), Image.LANCZOS)
mark.save(os.path.join(out, "logo-mark.png"), optimize=True)

def on_canvas(img, canvas, frac, bg):
    c = Image.new("RGBA", (canvas, canvas), bg)
    r = min(canvas * frac / img.width, canvas * frac / img.height)
    t = img.resize((round(img.width * r), round(img.height * r)), Image.LANCZOS)
    c.alpha_composite(t, ((canvas - t.width) // 2, (canvas - t.height) // 2))
    return c

on_canvas(mark, 1024, 0.78, (255, 255, 255, 255)).convert("RGB").save(os.path.join(out, "icon.png"))
on_canvas(mark, 1024, 0.60, (0, 0, 0, 0)).save(os.path.join(out, "adaptive-icon.png"))
Image.new("RGB", (1284, 2778), (255, 255, 255)).save(os.path.join(out, "splash.png"))
print("OK :", len(frames), "images,", size, "px")
