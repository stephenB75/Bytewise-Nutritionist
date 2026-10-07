/**
 * Generate App Store Header / Search Results creatives with Apple center safe zones.
 *
 * Focal content stays inside the published art-safe rectangles so Connect previews
 * do not clip logos/text (edge-aligned layouts fail on product-page headers).
 *
 * Sizes (Apple Asset Library / Connect, 2026):
 * - Header 21:9:     3840 × 1646  (safe ≈ 1646 × 661, centered)
 * - Search 3:2:      3840 × 2560  (safe ≈ 2168 × 1030, centered)
 * - Universal 16:9:  5244 × 2950  (safe ≈ 1402 × 962, slightly above center)
 * - Search alt 3:2:  1920 × 1280  (scaled from 3840×2560)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'app-store-screenshots', 'search-results');
const HERO_SRC = path.join(ROOT, 'app-store-screenshots', 'iphone-18', '01-dashboard-hero.png');
const LOGO_SRC = path.join(ROOT, 'client', 'public', 'BWN_Logo.png');
const VENV = path.join(ROOT, '.venv-img');

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
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
from pathlib import Path

ROOT = Path(${JSON.stringify(ROOT)})
OUT = Path(${JSON.stringify(OUT_DIR)})
OUT.mkdir(parents=True, exist_ok=True)
hero = Image.open(Path(${JSON.stringify(HERO_SRC)})).convert("RGB")
logo = Image.open(Path(${JSON.stringify(LOGO_SRC)})).convert("RGBA")

def load_font(size, bold=False):
    paths = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for p in paths:
        try:
            return ImageFont.truetype(p, size)
        except Exception:
            pass
    return ImageFont.load_default()

def cover_crop(src, w, h):
    sw, sh = src.size
    scale = max(w / sw, h / sh)
    nw, nh = int(sw * scale), int(sh * scale)
    im = src.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - w) // 2
    top = (nh - h) // 2
    return im.crop((left, top, left + w, top + h))

def darken(im, factor=0.42):
    return ImageEnhance.Brightness(im).enhance(factor)

def draw_safe_debug(draw, box, color=(255, 0, 0, 80)):
    # unused in production; kept for local tuning
    pass

def centered_brand(canvas, safe, title_size, sub_size, tag_size, logo_size, show_chips=True):
    """Paint logo + title + tagline centered inside safe (l, t, r, b)."""
    l, t, r, b = safe
    sw, sh = r - l, b - t
    cx = (l + r) // 2
    layer = canvas.convert("RGBA")
    draw = ImageDraw.Draw(layer)

    # Soft vignette plate behind text for legibility
    plate_w = int(sw * 0.92)
    plate_h = int(sh * 0.88)
    plate = Image.new("RGBA", (plate_w, plate_h), (0, 0, 0, 0))
    pd = ImageDraw.Draw(plate)
    pd.rounded_rectangle([0, 0, plate_w - 1, plate_h - 1], radius=min(72, plate_h // 6), fill=(15, 23, 42, 150))
    px = cx - plate_w // 2
    py = t + (sh - plate_h) // 2
    layer.alpha_composite(plate, (px, py))

    lg = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    # white badge
    badge = Image.new("RGBA", (logo_size + 36, logo_size + 36), (0, 0, 0, 0))
    bd = ImageDraw.Draw(badge)
    bd.rounded_rectangle([0, 0, logo_size + 35, logo_size + 35], radius=40, fill=(255, 255, 255, 240))
    badge.alpha_composite(lg, (18, 18))

    title_font = load_font(title_size, bold=True)
    sub_font = load_font(sub_size, bold=True)
    tag_font = load_font(tag_size, bold=False)
    chip_font = load_font(max(28, tag_size - 8), bold=True)

    title = "Bytewise Nutritionist"
    tagline = "Calories, fasting & Apple Health"
    chips = ["Track meals", "Fasting", "Apple Health"]

    # Measure stack
    tw = draw.textbbox((0, 0), title, font=title_font)
    title_w = tw[2] - tw[0]
    tag_bb = draw.textbbox((0, 0), tagline, font=tag_font)
    tag_w = tag_bb[2] - tag_bb[0]

    gap = max(16, title_size // 10)
    chip_h = 0
    chip_total_w = 0
    chip_sizes = []
    if show_chips:
        for c in chips:
            bb = draw.textbbox((0, 0), c, font=chip_font)
            cw = bb[2] - bb[0] + 48
            ch = bb[3] - bb[1] + 28
            chip_sizes.append((cw, ch))
            chip_total_w += cw
            chip_h = max(chip_h, ch)
        chip_total_w += 20 * (len(chips) - 1)

    stack_h = (logo_size + 36) + gap + (tw[3] - tw[1]) + gap // 2 + (tag_bb[3] - tag_bb[1])
    if show_chips:
        stack_h += gap + chip_h

    y = py + (plate_h - stack_h) // 2
    layer.alpha_composite(badge, (cx - (logo_size + 36) // 2, y))
    y += logo_size + 36 + gap

    draw = ImageDraw.Draw(layer)
    draw.text((cx - title_w // 2, y), title, font=title_font, fill=(255, 255, 255, 255))
    y += (tw[3] - tw[1]) + gap // 2
    # accent
    bar_w = min(160, title_w // 4)
    draw.rounded_rectangle([cx - bar_w // 2, y, cx + bar_w // 2, y + 8], radius=4, fill=(251, 146, 60, 255))
    y += 8 + gap // 2
    draw.text((cx - tag_w // 2, y), tagline, font=tag_font, fill=(226, 232, 240, 255))
    y += (tag_bb[3] - tag_bb[1]) + gap

    if show_chips:
        x = cx - chip_total_w // 2
        for c, (cw, ch) in zip(chips, chip_sizes):
            draw.rounded_rectangle([x, y, x + cw, y + ch], radius=ch // 2, fill=(30, 41, 59, 230))
            bb = draw.textbbox((0, 0), c, font=chip_font)
            twc = bb[2] - bb[0]
            thc = bb[3] - bb[1]
            draw.text((x + (cw - twc) // 2, y + (ch - thc) // 2 - 2), c, font=chip_font, fill=(248, 250, 252, 255))
            x += cw + 20

    return layer.convert("RGB")

def make_bg(w, h):
    # Atmosphere only — blur food color out of the hero so UI copy never bleeds through.
    band = cover_crop(hero, w, h)
    band = band.filter(ImageFilter.GaussianBlur(max(60, min(w, h) // 12)))
    band = darken(band, 0.28)
    wash = Image.new("RGB", (w, h), (15, 23, 42))
    draw = ImageDraw.Draw(wash)
    for i in range(h):
        t = i / max(1, h - 1)
        r = int(12 + 55 * t)
        g = int(18 + 22 * t)
        b = int(36 + 8 * t)
        draw.line([(0, i), (w, i)], fill=(r, g, b))
    base = Image.blend(band, wash, 0.72)
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    cx, cy = w // 2, int(h * 0.50)
    for rad, a in [(int(min(w, h) * 0.50), 100), (int(min(w, h) * 0.28), 130)]:
        gd.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], fill=(251, 146, 60, a))
    glow = glow.filter(ImageFilter.GaussianBlur(max(50, w // 35)))
    return Image.alpha_composite(base.convert("RGBA"), glow).convert("RGB")

# --- Header 21:9 ---
HW, HH = 3840, 1646
# Art-safe ≈ 1646×661 centered — inset further so Connect/device chrome cannot clip
inset = 48
safe_h = (
    int((HW - 1646) / 2) + inset,
    int((HH - 661) / 2) + inset,
    int((HW + 1646) / 2) - inset,
    int((HH + 661) / 2) - inset,
)
header = make_bg(HW, HH)
header = centered_brand(header, safe_h, title_size=88, sub_size=64, tag_size=46, logo_size=120, show_chips=True)
header_path = OUT / "header-3840x1646.png"
header.save(header_path, "PNG", optimize=True)

# --- Search Results 3:2 ---
SW, SH = 3840, 2560
safe_s = (int((SW - 2168) / 2), int((SH - 1030) / 2), int((SW + 2168) / 2), int((SH + 1030) / 2))
search = make_bg(SW, SH)
search = centered_brand(search, safe_s, title_size=120, sub_size=88, tag_size=60, logo_size=180, show_chips=True)
search_path = OUT / "search-results-3840x2560.png"
search.save(search_path, "PNG", optimize=True)

search_lo = search.resize((1920, 1280), Image.Resampling.LANCZOS)
search_lo_path = OUT / "search-results-1920x1280.png"
search_lo.save(search_lo_path, "PNG", optimize=True)

# --- Universal 16:9 (Header + Search) ---
UW, UH = 5244, 2950
# Safe ≈ 1402×962, slightly above center
safe_uw, safe_uh = 1402, 962
safe_ul = (UW - safe_uw) // 2
safe_ut = int(UH * 0.38 - safe_uh / 2)  # slightly above geometric center
safe_u = (safe_ul, safe_ut, safe_ul + safe_uw, safe_ut + safe_uh)
univ = make_bg(UW, UH)
univ = centered_brand(univ, safe_u, title_size=72, sub_size=56, tag_size=40, logo_size=110, show_chips=False)
univ_path = OUT / "search-results-universal-5244x2950.png"
univ.save(univ_path, "PNG", optimize=True)

for p in (header_path, search_path, search_lo_path, univ_path):
    im = Image.open(p)
    print(f"{p.name} {im.size} {im.mode} {p.stat().st_size}")
`;

const py = ensurePillow();
fs.mkdirSync(OUT_DIR, { recursive: true });
const tmp = path.join(OUT_DIR, '_gen_creatives.py');
fs.writeFileSync(tmp, PY_SCRIPT);
const res = spawnSync(py, [tmp], { stdio: 'inherit' });
fs.unlinkSync(tmp);
// Clean venv? keep for regenerates; add to gitignore if needed
if (res.status !== 0) process.exit(res.status || 1);
console.log(`\nWrote creatives → ${OUT_DIR}`);
console.log('Re-upload header-3840x1646.png (Header) and search-results-3840x2560.png (Search Results) in Connect.');
