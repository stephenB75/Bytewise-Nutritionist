/**
 * Generate App Store Header / Search Results creatives from real app assets.
 *
 * Sources:
 * - App icon: ios/.../AppIcon-512@2x.png
 * - Food photography: assets/*.jpg (same set as in-app heroes)
 * - Device UI: app-store-screenshots/iphone-18/*.png
 *
 * Focal content stays inside Apple center safe zones.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'app-store-screenshots', 'search-results');
const VENV = path.join(ROOT, '.venv-img');

const ICON = path.join(
  ROOT,
  'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png',
);
const PHONE = path.join(ROOT, 'app-store-screenshots/iphone-18/03-fasting.png');
const FOOD_HEADER = path.join(ROOT, 'assets/salad-6948004_1920_1753859530085-1zwSa4Vt.jpg');
const FOOD_SEARCH = path.join(ROOT, 'assets/mango-1534061_1920_1753859530079-BEyrLl3D.jpg');
const FOOD_UNIV = path.join(ROOT, 'assets/vegetable-2924245_1920_1753859477807-CZELXr6Z.jpg');

function ensurePillow() {
  const py = path.join(VENV, 'bin', 'python');
  if (!fs.existsSync(py)) {
    console.log('Creating local venv for Pillow…');
    spawnSync('python3', ['-m', 'venv', VENV], { stdio: 'inherit' });
    spawnSync(path.join(VENV, 'bin', 'pip'), ['install', 'pillow', '-q'], { stdio: 'inherit' });
  }
  return py;
}

const PY_SCRIPT = `
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance, ImageOps
from pathlib import Path

ROOT = Path(${JSON.stringify(ROOT)})
OUT = Path(${JSON.stringify(OUT_DIR)})
OUT.mkdir(parents=True, exist_ok=True)

ICON = Image.open(Path(${JSON.stringify(ICON)})).convert("RGBA")
PHONE = Image.open(Path(${JSON.stringify(PHONE)})).convert("RGB")
FOOD_H = Image.open(Path(${JSON.stringify(FOOD_HEADER)})).convert("RGB")
FOOD_S = Image.open(Path(${JSON.stringify(FOOD_SEARCH)})).convert("RGB")
FOOD_U = Image.open(Path(${JSON.stringify(FOOD_UNIV)})).convert("RGB")

def load_font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf",
    ]
    for p in candidates:
        try:
            return ImageFont.truetype(p, size)
        except Exception:
            pass
    return ImageFont.load_default()

def cover_crop(src, w, h, focus=(0.5, 0.45)):
    sw, sh = src.size
    scale = max(w / sw, h / sh)
    nw, nh = int(sw * scale + 0.5), int(sh * scale + 0.5)
    im = src.resize((nw, nh), Image.Resampling.LANCZOS)
    left = int((nw - w) * focus[0])
    top = int((nh - h) * focus[1])
    left = max(0, min(left, nw - w))
    top = max(0, min(top, nh - h))
    return im.crop((left, top, left + w, top + h))

def rounded_rect_mask(size, radius):
    mask = Image.new("L", size, 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, size[0] - 1, size[1] - 1], radius=radius, fill=255)
    return mask

def round_icon(icon, size, radius_ratio=0.2237):
    """iOS-style squircle-ish rounded square."""
    icon = icon.resize((size, size), Image.Resampling.LANCZOS)
    if icon.mode != "RGBA":
        icon = icon.convert("RGBA")
    r = max(8, int(size * radius_ratio))
    mask = rounded_rect_mask((size, size), r)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(icon, (0, 0), mask)
    # subtle white ring
    ring = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    rd = ImageDraw.Draw(ring)
    rd.rounded_rectangle([1, 1, size - 2, size - 2], radius=r, outline=(255, 255, 255, 220), width=max(3, size // 80))
    out = Image.alpha_composite(out, ring)
    return out

def phone_mockup(screen, target_h, bezel=22, radius=72, top_fraction=0.52):
    """Portrait phone showing the top of the UI (readable), not the whole long page shrunk."""
    crop_h = max(400, int(screen.height * top_fraction))
    screen = screen.crop((0, 0, screen.width, crop_h))
    aspect = screen.width / screen.height
    ph = target_h
    pw = int(ph * aspect)
    screen_r = screen.resize((pw, ph), Image.Resampling.LANCZOS)
    outer_w = pw + bezel * 2
    outer_h = ph + bezel * 2
    frame = Image.new("RGBA", (outer_w, outer_h), (0, 0, 0, 0))
    fd = ImageDraw.Draw(frame)
    fd.rounded_rectangle([0, 0, outer_w - 1, outer_h - 1], radius=radius, fill=(248, 250, 252, 255))
    # inner screen
    inner = Image.new("RGBA", (pw, ph), (0, 0, 0, 0))
    smask = rounded_rect_mask((pw, ph), max(24, radius - bezel))
    inner.paste(screen_r.convert("RGBA"), (0, 0), smask)
    frame.alpha_composite(inner, (bezel, bezel))
    # notch hint
    nw, nh = int(pw * 0.34), max(18, bezel)
    fd.rounded_rectangle(
        [(outer_w - nw) // 2, bezel // 2, (outer_w + nw) // 2, bezel // 2 + nh],
        radius=nh // 2,
        fill=(15, 23, 42, 255),
    )
    return frame

def drop_shadow(img, blur=36, opacity=160, offset=(18, 28)):
    w, h = img.size
    ox, oy = offset
    canvas = Image.new("RGBA", (w + abs(ox) + blur * 2, h + abs(oy) + blur * 2), (0, 0, 0, 0))
    shadow = Image.new("RGBA", img.size, (0, 0, 0, opacity))
    # use alpha of img as shadow shape if present
    if img.mode == "RGBA":
        shadow.putalpha(img.split()[-1].point(lambda a: min(a, opacity)))
    sx = blur + (ox if ox > 0 else 0)
    sy = blur + (oy if oy > 0 else 0)
    canvas.paste(shadow, (sx, sy), shadow)
    canvas = canvas.filter(ImageFilter.GaussianBlur(blur // 2))
    ix = blur + (0 if ox > 0 else -ox)
    iy = blur + (0 if oy > 0 else -oy)
    canvas.alpha_composite(img, (ix, iy))
    return canvas

def vignette_overlay(w, h, strength=125):
    """Soft radial darken only — no hard side bands (those looked like seams)."""
    cx, cy = w // 2, int(h * 0.48)
    grad = Image.new("L", (256, 256), 0)
    gd = ImageDraw.Draw(grad)
    for r in range(128, 0, -1):
        a = int(255 * (1 - r / 128) ** 1.35)
        gd.ellipse([128 - r, 128 - r, 128 + r, 128 + r], fill=a)
    grad = grad.resize((w, h), Image.Resampling.BICUBIC)
    edge = grad.point(lambda p: 255 - p)
    shade = Image.new("RGBA", (w, h), (10, 14, 24, 0))
    shade.putalpha(edge.point(lambda p: int(p * strength / 255)))
    plate = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    pd = ImageDraw.Draw(plate)
    pd.ellipse(
        [cx - int(w * 0.28), cy - int(h * 0.38), cx + int(w * 0.28), cy + int(h * 0.38)],
        fill=(15, 23, 42, 95),
    )
    plate = plate.filter(ImageFilter.GaussianBlur(max(50, w // 40)))
    return Image.alpha_composite(shade, plate)

def draw_wordmark(draw, cx, y, title_size, subtitle_size):
    """Proper wordmark (not the clipped BWN_Logo.png)."""
    title_font = load_font(title_size, bold=True)
    sub_font = load_font(subtitle_size, bold=False)
    title = "Bytewise"
    sub = "Nutritionist"
    tb = draw.textbbox((0, 0), title, font=title_font)
    sb = draw.textbbox((0, 0), sub, font=sub_font)
    tw, th = tb[2] - tb[0], tb[3] - tb[1]
    sw, sh = sb[2] - sb[0], sb[3] - sb[1]
    # shadow for legibility on photos
    for dx, dy in ((2, 2), (0, 0)):
        color = (0, 0, 0, 160) if dx else (255, 255, 255, 255)
        draw.text((cx - tw // 2 + dx, y + dy), title, font=title_font, fill=color)
    y2 = y + th + max(8, title_size // 12)
    for dx, dy in ((2, 2), (0, 0)):
        color = (0, 0, 0, 140) if dx else (251, 191, 36, 255)  # amber accent
        draw.text((cx - sw // 2 + dx, y2 + dy), sub, font=sub_font, fill=color)
    return y2 + sh

def compose(w, h, food, safe, *, icon_size, title_size, tag_size, phone_h=0, focus=(0.5, 0.42)):
    """safe = (l, t, r, b) art-safe rectangle."""
    base = cover_crop(food, w, h, focus=focus).convert("RGBA")
    base = ImageEnhance.Color(base).enhance(1.08)
    base = ImageEnhance.Contrast(base).enhance(1.05)
    base = Image.alpha_composite(base, vignette_overlay(w, h, strength=150))

    l, t, r, b = safe
    cx = (l + r) // 2
    cy = (t + b) // 2
    sw, sh = r - l, b - t

    layer = base
    icon = round_icon(ICON, icon_size)
    tag_font = load_font(tag_size, bold=False)
    chip_font = load_font(max(28, tag_size - 6), bold=True)
    tagline = "Calories, fasting & Apple Health"
    chips = ["Track meals", "Fasting", "Apple Health"]

    # Measure stack height to vertically center in safe zone
    title_font = load_font(title_size, bold=True)
    sub_font = load_font(int(title_size * 0.72), bold=True)
    tb = ImageDraw.Draw(Image.new("RGB", (10, 10))).textbbox((0, 0), "Bytewise", font=title_font)
    sb = ImageDraw.Draw(Image.new("RGB", (10, 10))).textbbox((0, 0), "Nutritionist", font=sub_font)
    tag_bb = ImageDraw.Draw(Image.new("RGB", (10, 10))).textbbox((0, 0), tagline, font=tag_font)
    gap = max(14, title_size // 10)

    phone_img = None
    phone_box_h = 0
    if phone_h > 0:
        phone_img = phone_mockup(PHONE, phone_h)
        phone_img = drop_shadow(phone_img, blur=40, opacity=150, offset=(12, 24))
        phone_box_h = phone_img.height + gap

    chip_h = 0
    chip_total_w = 0
    chip_sizes = []
    for c in chips:
        bb = ImageDraw.Draw(Image.new("RGB", (10, 10))).textbbox((0, 0), c, font=chip_font)
        cw = bb[2] - bb[0] + 44
        ch = bb[3] - bb[1] + 26
        chip_sizes.append((cw, ch))
        chip_total_w += cw
        chip_h = max(chip_h, ch)
    chip_total_w += 18 * (len(chips) - 1)

    text_block_h = (
        icon_size
        + gap
        + (tb[3] - tb[1])
        + max(6, title_size // 14)
        + (sb[3] - sb[1])
        + gap
        + (tag_bb[3] - tag_bb[1])
        + gap
        + chip_h
    )

    # Layout: if phone, put brand left-of-center and phone right-of-center WITHIN safe
    if phone_img is not None:
        # Keep both inside safe: brand column + phone
        brand_w = int(sw * 0.48)
        phone_w = phone_img.width
        total_w = brand_w + 36 + phone_w
        if total_w > sw:
            # shrink phone to fit
            scale = (sw - brand_w - 36) / phone_w
            nw = max(120, int(phone_img.width * scale))
            nh = max(120, int(phone_img.height * scale))
            phone_img = phone_img.resize((nw, nh), Image.Resampling.LANCZOS)
            phone_w = nw
            total_w = brand_w + 36 + phone_w

        left0 = cx - total_w // 2
        # Brand column center
        bx = left0 + brand_w // 2
        stack_h = text_block_h
        y = cy - stack_h // 2

        # icon
        layer.alpha_composite(icon, (bx - icon_size // 2, y))
        y += icon_size + gap
        draw = ImageDraw.Draw(layer)
        y = draw_wordmark(draw, bx, y, title_size, int(title_size * 0.72))
        y += gap
        tw = tag_bb[2] - tag_bb[0]
        for dx, dy in ((2, 2), (0, 0)):
            color = (0, 0, 0, 140) if dx else (241, 245, 249, 255)
            draw.text((bx - tw // 2 + dx, y + dy), tagline, font=tag_font, fill=color)
        y += (tag_bb[3] - tag_bb[1]) + gap
        x = bx - chip_total_w // 2
        for c, (cw, ch) in zip(chips, chip_sizes):
            draw.rounded_rectangle([x, y, x + cw, y + ch], radius=ch // 2, fill=(15, 23, 42, 200))
            bb = draw.textbbox((0, 0), c, font=chip_font)
            draw.text(
                (x + (cw - (bb[2] - bb[0])) // 2, y + (ch - (bb[3] - bb[1])) // 2 - 1),
                c,
                font=chip_font,
                fill=(248, 250, 252, 255),
            )
            x += cw + 18

        # phone
        px = left0 + brand_w + 36
        py = cy - phone_img.height // 2
        # clamp inside safe
        px = max(l, min(px, r - phone_img.width))
        py = max(t, min(py, b - phone_img.height))
        layer.alpha_composite(phone_img, (px, py))
    else:
        # Centered brand stack only (header / universal)
        stack_h = text_block_h
        y = cy - stack_h // 2
        layer.alpha_composite(icon, (cx - icon_size // 2, y))
        y += icon_size + gap
        draw = ImageDraw.Draw(layer)
        y = draw_wordmark(draw, cx, y, title_size, int(title_size * 0.72))
        y += gap
        tw = tag_bb[2] - tag_bb[0]
        for dx, dy in ((2, 2), (0, 0)):
            color = (0, 0, 0, 140) if dx else (241, 245, 249, 255)
            draw.text((cx - tw // 2 + dx, y + dy), tagline, font=tag_font, fill=color)
        y += (tag_bb[3] - tag_bb[1]) + gap
        x = cx - chip_total_w // 2
        for c, (cw, ch) in zip(chips, chip_sizes):
            draw.rounded_rectangle([x, y, x + cw, y + ch], radius=ch // 2, fill=(15, 23, 42, 200))
            bb = draw.textbbox((0, 0), c, font=chip_font)
            draw.text(
                (x + (cw - (bb[2] - bb[0])) // 2, y + (ch - (bb[3] - bb[1])) // 2 - 1),
                c,
                font=chip_font,
                fill=(248, 250, 252, 255),
            )
            x += cw + 18

    return layer.convert("RGB")

# Header 21:9 — brand only in center safe (1646×661)
HW, HH = 3840, 1646
inset = 40
safe_h = (
    (HW - 1646) // 2 + inset,
    (HH - 661) // 2 + inset,
    (HW + 1646) // 2 - inset,
    (HH + 661) // 2 - inset,
)
header = compose(
    HW, HH, FOOD_H, safe_h,
    icon_size=200, title_size=108, tag_size=48, phone_h=0, focus=(0.5, 0.40),
)
header_path = OUT / "header-3840x1646.png"
header.save(header_path, "PNG", optimize=True)

# Search 3:2 — brand + phone inside safe (2168×1030)
SW, SH = 3840, 2560
inset_s = 36
safe_s = (
    (SW - 2168) // 2 + inset_s,
    (SH - 1030) // 2 + inset_s,
    (SW + 2168) // 2 - inset_s,
    (SH + 1030) // 2 - inset_s,
)
search = compose(
    SW, SH, FOOD_S, safe_s,
    icon_size=170, title_size=96, tag_size=42, phone_h=900, focus=(0.48, 0.42),
)
search_path = OUT / "search-results-3840x2560.png"
search.save(search_path, "PNG", optimize=True)
search.resize((1920, 1280), Image.Resampling.LANCZOS).save(OUT / "search-results-1920x1280.png", "PNG", optimize=True)

# Universal 16:9 — compact centered brand (safe ~1402×962 above center)
UW, UH = 5244, 2950
safe_uw, safe_uh = 1402, 962
safe_ul = (UW - safe_uw) // 2
safe_ut = int(UH * 0.40 - safe_uh / 2)
safe_u = (safe_ul + 24, safe_ut + 24, safe_ul + safe_uw - 24, safe_ut + safe_uh - 24)
univ = compose(
    UW, UH, FOOD_U, safe_u,
    icon_size=160, title_size=78, tag_size=38, phone_h=0, focus=(0.5, 0.42),
)
univ_path = OUT / "search-results-universal-5244x2950.png"
univ.save(univ_path, "PNG", optimize=True)

for p in (header_path, search_path, OUT / "search-results-1920x1280.png", univ_path):
    im = Image.open(p)
    print(f"{p.name} {im.size} {im.mode} {p.stat().st_size}")
`;

const py = ensurePillow();
for (const f of [ICON, PHONE, FOOD_HEADER, FOOD_SEARCH, FOOD_UNIV]) {
  if (!fs.existsSync(f)) {
    console.error('Missing asset:', f);
    process.exit(1);
  }
}
fs.mkdirSync(OUT_DIR, { recursive: true });
const tmp = path.join(OUT_DIR, '_gen_creatives.py');
fs.writeFileSync(tmp, PY_SCRIPT);
const res = spawnSync(py, [tmp], { stdio: 'inherit' });
fs.unlinkSync(tmp);
if (res.status !== 0) process.exit(res.status || 1);
console.log(`\nWrote creatives → ${OUT_DIR}`);
