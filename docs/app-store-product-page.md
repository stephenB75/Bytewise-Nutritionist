# App Store Product Page Prep

Ready-to-paste copy and asset checklist for App Store Connect → **App Information / Product Page**  
(**Header and Search Results** + **App Previews and Screenshots**).

App version referenced: **1.25.1** (build 4)  
Bundle ID: `com.bytewise.nutritionist`

---

## Header and Search Results

Paste these into App Store Connect. Character limits are noted.

### Name (30 max)

```
Bytewise Nutritionist
```

21 characters.

### Subtitle (30 max)

```
Calories, fasting & Health
```

27 characters. Shows under the name in search results.

### Promotional Text (170 max)

Can be updated anytime without a new binary.

```
Track meals, macros, fasting, and Apple Fitness in one place—with restaurant menus, journal trends, and shareable progress reports.
```

131 characters.

### Description

```
Bytewise Nutritionist helps you track food, macros, fasting, and activity in one clear place—built for everyday use on iPhone.

TODAY’S PROGRESS
See daily calories, protein, carbs, fat, and sugar against your goals. Water tracking, weekly progress, and micronutrient averages stay on your dashboard so you always know where you stand.

TRACK FOOD FAST
Log meals with the calorie calculator, packaged-food barcode scan, AI photo analysis, custom recipes, and restaurant menus—including popular Spanish and other cuisine options. Meal types stay organized for breakfast, lunch, dinner, and snacks.

INTERMITTENT FASTING
Run popular fasting plans with a live timer, milestones, and trends so you can see duration patterns over time.

JOURNAL & TRENDS
Review what you ate, spot food-type trends for the week, and export a 30-day PDF report with macros, micros, water, fasting, shared activities, and Apple Health when available.

APPLE HEALTH & FITNESS
On iPhone, connect Apple Health to show steps, move calories, distance, sleep score, exercise minutes, and workouts alongside nutrition—updated from your device.

FRIENDS & FAMILY
Share activity summaries with people you invite. Keep up to four posts and pull them into your progress report.

Privacy-minded: your activity from Apple Health stays on your iPhone; nutrition data follows your account settings. Create a free account to sync across devices.

Download Bytewise and build a clearer picture of how you eat, fast, and move.
```

### Keywords (100 max, comma-separated)

Do not repeat the app name. Prefer no spaces after commas when tight on space.

```
calorie,nutrition,fasting,macros,meal tracker,diet,apple health,food log,intermittent fasting,weight
```

100 characters (at the limit).

### What’s New (for 1.25.1)

```
• Clearer 30-day PDF reports with charts kept next to their data
• Apple Health and Exercise cards refresh automatically from your device
• Stronger iOS notifications (bell + banners with sound)
• Food Type Trends on Journal and Fasting Trends Observed
• Spanish restaurant menus and dietary sugar tracking on the dashboard
• Activity sharing with friends (up to 4 posts) and report summaries
```

### Categories & rating

| Field | Value |
|-------|--------|
| Primary category | Health & Fitness |
| Secondary category | Food & Drink |
| Age rating | 4+ (nutrition / lifestyle) |

### URLs

| Field | URL |
|-------|-----|
| Marketing | https://www.bytewisenutritionist.com |
| Support | https://www.bytewisenutritionist.com |
| Privacy Policy | https://www.bytewisenutritionist.com (host your privacy page; contact privacy@bytewisenutritionist.com) |

Support email (App Review / users): `support@bytewisenutritionist.com`  
Privacy email: `privacy@bytewisenutritionist.com`

---

## App Previews and Screenshots

Portrait PNGs are already sized in [`app-store-screenshots/`](../app-store-screenshots/).

### Required device sets

| App Store slot | Folder | Size |
|----------------|--------|------|
| iPhone 6.9" | `app-store-screenshots/iphone-18/` | 1320 × 2868 |
| iPad 13" | `app-store-screenshots/ipad-13/` | 2064 × 2752 |

Skip **iPhone Duo** folders until App Store Connect exposes those slots.

### Upload order (hero first, then product UI)

Use the same order for iPhone 6.9" and iPad 13":

| Slot | File | What it shows |
|------|------|----------------|
| 1 | `01-dashboard-hero.png` | Branded hero + today’s progress |
| 2 | `02-tracker.png` | Food tracker / calculator |
| 3 | `03-fasting.png` | Intermittent fasting |
| 4 | `04-journal.png` | Journal |
| 5 | `05-profile.png` | Profile / settings |

Optional alternates (same size): plain `01-dashboard.png` or other `*-hero.png` files if you prefer a different mix. Keep **slot 1** as a strong brand/hero image.

### Connect steps

1. Open the app in App Store Connect → version → **App Previews and Screenshots**.
2. Select **iPhone 6.9-inch** → upload the five files above from `iphone-18/`.
3. Select **iPad Pro (6th gen) 13-inch** (or the matching 13" iPad slot) → upload the same five filenames from `ipad-13/`.
4. Leave App Preview videos empty for now (see storyboard below).
5. Confirm localization (English U.S.) uses this media set.

### Regenerate screenshots (if needed)

With the preview server running:

```bash
PATH="$HOME/.local/node-v22.23.3-darwin-arm64/bin:$PATH" \
  node scripts/capture-app-store-screenshots.mjs
```

Optional: `SCREENSHOT_URL=http://127.0.0.1:5012`

---

## App Preview videos (optional — storyboard only)

No video files are produced in this prep. Use this 15–30 second outline when you record later (portrait, matching each device size).

| Seconds | Scene | On-screen focus |
|---------|--------|-----------------|
| 0–5 | Dashboard | Today’s Progress, calories / macros |
| 5–12 | Tracker | Search or log a meal; show calories landing |
| 12–18 | Fasting | Active timer or plan |
| 18–24 | Journal | Week view or food-type trends |
| 24–30 | End card | Bytewise Nutritionist wordmark + “Track food, fasting & Health” |

Tips: no voiceover required; prefer device mute-friendly captions; avoid unfinished UI or guest empty states if possible.

---

## Quick checklist

- [ ] Name, subtitle, promotional text pasted
- [ ] Description and keywords pasted
- [ ] What’s New set for this version
- [ ] Categories: Health & Fitness + Food & Drink
- [ ] Marketing / Support / Privacy URLs set
- [ ] iPhone 6.9" screenshots (5) uploaded in order above
- [ ] iPad 13" screenshots (5) uploaded in order above
- [ ] App Preview videos skipped or recorded from storyboard
- [ ] Review localization and age rating before submit
