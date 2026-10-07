# App Store Screenshots & Creatives

Assets for App Store Connect → **Product Page**.

Full copy + checklist: [docs/app-store-product-page.md](../docs/app-store-product-page.md)

---

## Where each file goes

| Connect location | What to upload | Folder |
|---|---|---|
| **App Previews and Screenshots** → iPhone 6.9" | Portrait PNGs | `iphone-18/` |
| **App Previews and Screenshots** → iPad 13" | Portrait PNGs | `ipad-13/` |
| **Header** | Landscape creative (21:9) | `search-results/header-3840x1646.png` |
| **Search Results** | Landscape creative (3:2) | `search-results/search-results-3840x2560.png` |

Do **not** upload portrait phone screenshots into Header or Search Results — Connect rejects wrong dimensions, and edge-heavy layouts get cropped in Preview.

---

## Device screenshots (portrait)

| Folder | Size | Slot |
|---|---|---|
| `iphone-18/` | 1320×2868 | Required iPhone 6.9" |
| `ipad-13/` | 2064×2752 | Required iPad 13" |
| `iphone-duo-outer/` | 1398×2034 | Duo outer — skip until Connect accepts |
| `iphone-duo-inner/` | 2007×2853 | Duo inner — skip until Connect accepts |

Each device folder has five screens × two variants:

| File | Content |
|---|---|
| `01-dashboard.png` / `-hero.png` | Today’s progress UI / branded hero |
| `02-tracker.png` / `-hero.png` | Calculator + restaurants / branded hero |
| `03-fasting.png` / `-hero.png` | Fasting tracker / branded hero |
| `04-journal.png` / `-hero.png` | Journal / branded hero |
| `05-profile.png` / `-hero.png` | Profile / branded hero |

### Recommended upload order

Same order for `iphone-18/` and `ipad-13/`:

1. `01-dashboard-hero.png` (or `01-dashboard.png` for more UI)
2. `02-tracker.png`
3. `03-fasting.png`
4. `04-journal.png`
5. `05-profile.png`

Prefer **feature** PNGs (no `-hero`) for slots 2–5 so the carousel shows product UI. Some top/bottom clipping in Connect Preview is normal device framing.

### Regenerate screenshots

Preview server must be running:

```bash
PATH="$HOME/.local/node-v22.23.3-darwin-arm64/bin:$PATH" \
  node scripts/capture-app-store-screenshots.mjs
```

Optional: `SCREENSHOT_URL=http://127.0.0.1:5012`

---

## Header & Search Results creatives (landscape)

Built from real product assets (App Icon, `assets/` food photos, `iphone-18/` UI). Branding is centered for Apple’s crop safe zone.

| File | Size | Use |
|---|---|---|
| `header-3840x1646.png` | 3840×1646 (21:9) | **Header** tab |
| `search-results-3840x2560.png` | 3840×2560 (3:2) | **Search Results** tab (preferred) |
| `search-results-1920x1280.png` | 1920×1280 (3:2) | Search Results alternate |
| `search-results-universal-5244x2950.png` | 5244×2950 (16:9) | Optional one file for Header + Search |

### Regenerate creatives

```bash
PATH="$HOME/.local/node-v22.23.3-darwin-arm64/bin:$PATH" \
  node scripts/generate-app-store-creatives.mjs
```

Requires a local Pillow venv (created automatically at `.venv-img/`, gitignored).

---

## Quick Connect checklist

- [ ] Header ← `search-results/header-3840x1646.png`
- [ ] Search Results ← `search-results/search-results-3840x2560.png`
- [ ] iPhone 6.9" ← five files from `iphone-18/` in order above
- [ ] iPad 13" ← five files from `ipad-13/` in order above
- [ ] Skip Duo folders until Connect exposes those slots
- [ ] Use Connect **Preview** on iPhone + iPad before submit
