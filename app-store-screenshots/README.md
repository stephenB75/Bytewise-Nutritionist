# App Store Screenshots

Portrait PNGs sized for App Store Connect upload.

**Product page copy & upload guide:** [docs/app-store-product-page.md](../docs/app-store-product-page.md)

**Recommended Connect order (hero first):** `01-dashboard-hero.png` → `02-tracker.png` → `03-fasting.png` → `04-journal.png` → `05-profile.png` (same order for `iphone-18/` and `ipad-13/`).

| Folder | Device | Size | App Store slot |
|---|---|---|---|
| `iphone-18/` | iPhone 18 (6.9" / Pro Max class) | 1320×2868 | Required 6.9" iPhone |
| `iphone-duo-outer/` | iPhone Duo outer display | 1398×2034 | Duo (when Connect accepts) |
| `iphone-duo-inner/` | iPhone Duo inner display | 2007×2853 | Duo (when Connect accepts) |
| `ipad-13/` | iPad 13" | 2064×2752 | Required iPad |

Each folder has five screens × two variants:

| File | Content |
|---|---|
| `01-dashboard.png` / `-hero.png` | Today’s progress UI / branded hero |
| `02-tracker.png` / `-hero.png` | Calculator + restaurants / branded hero |
| `03-fasting.png` / `-hero.png` | Fasting tracker / branded hero |
| `04-journal.png` / `-hero.png` | Journal / branded hero |
| `05-profile.png` / `-hero.png` | Profile / branded hero |

Regenerate with the preview server running:

```bash
PATH="$HOME/.local/node-v22.23.3-darwin-arm64/bin:$PATH" \
  node scripts/capture-app-store-screenshots.mjs
```

Optional: `SCREENSHOT_URL=http://127.0.0.1:5012`

Note: Apple has published iPhone Duo sizes; App Store Connect may not accept Duo uploads until that slot is enabled later in 2026. iPhone 18 and iPad 13" sets are ready to upload now.
