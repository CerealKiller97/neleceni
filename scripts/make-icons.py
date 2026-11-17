"""Draws the toolbar icons (a muted speaker on a red tile). Needs Pillow: pip install pillow.
Run from the repo root: python3 scripts/make-icons.py"""
from PIL import Image, ImageDraw

S = 1024  # draw large, then downscale for clean edges
RED, WHITE = (176, 32, 32, 255), (255, 255, 255, 255)

img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
d.rounded_rectangle([40, 40, S - 40, S - 40], radius=220, fill=RED)

# Speaker: box + cone
d.rectangle([200, 400, 330, 624], fill=WHITE)
d.polygon([(330, 400), (520, 240), (520, 784), (330, 624)], fill=WHITE)

# Cross
w = 70
d.line([(620, 400), (844, 624)], fill=WHITE, width=w)
d.line([(844, 400), (620, 624)], fill=WHITE, width=w)
for x, y in [(620, 400), (844, 624), (844, 400), (620, 624)]:
    d.ellipse([x - w / 2, y - w / 2, x + w / 2, y + w / 2], fill=WHITE)

for size in (16, 32, 48, 128):
    img.resize((size, size), Image.LANCZOS).save(f'static/icons/icon{size}.png', optimize=True)
print('Wrote static/icons/icon{16,32,48,128}.png')
