# ByteWise Nutritionist — iOS (Xcode) Deployment

## Prerequisites (macOS)

1. **Xcode 16+** with iOS SDK and Command Line Tools  
2. **Apple Developer account** (signing + App Store Connect)  
3. **Node.js 20+** and project dependencies: `npm install`  
4. **`.env`** at repo root with production client vars (especially `VITE_APP_URL`)

The native app loads bundled web assets from `dist/public` but calls your **production API** at `VITE_APP_URL` (e.g. `https://www.bytewisenutritionist.com`).

## One-command prepare

```bash
cp .env.example .env   # fill in VITE_SUPABASE_* , VITE_APP_URL , etc.
npm install
npm run ios:prepare
npm run ios:open
```

`ios:prepare` will:

1. Run `vite build`  
2. Create `ios/` with `npx cap add ios` if missing (folder is gitignored)  
3. `npx cap sync ios` (copy web build + Capacitor plugins)  
4. Apply HealthKit `Info.plist` strings and entitlements via `scripts/apply-ios-healthkit.mjs`

## Xcode checklist

1. Open **`ios/App/App.xcworkspace`** (or use `npm run ios:open`).  
2. **Signing & Capabilities**  
   - Team: your Apple Developer team  
   - Bundle ID: `com.bytewise.nutritionist`  
   - Enable **HealthKit** if not already present (entitlements copied from `native/healthkit/App.entitlements`)  
3. **Version / build** — increment **Marketing Version** and **Build** before Archive.  
4. **Run** on a physical device (recommended for Camera, Health, push).  
5. **Product → Archive** → Distribute to App Store Connect.

## App identity

| Setting | Value |
|--------|--------|
| App ID | `com.bytewise.nutritionist` |
| Display name | ByteWise Nutritionist |
| Min iOS | 14.0+ (Capacitor 7 default) |
| URL scheme | `bytewise-nutritionist` |

## Plugins (Capacitor 7)

Camera, Filesystem, Haptics, Keyboard, Local/Push Notifications, Splash Screen, Status Bar, **@capgo/capacitor-health** (Apple Health read/write).

After changing plugins or `capacitor.config.ts`:

```bash
npm run ios:prepare
```

## Live reload (optional dev)

In `capacitor.config.ts` you can temporarily set:

```ts
server: { url: 'http://YOUR_MAC_IP:5173', cleartext: true }
```

Remove before App Store builds.

## Troubleshooting

| Issue | Fix |
|--------|-----|
| API 404 / network errors in app | Set `VITE_APP_URL` and rebuild (`npm run ios:prepare`) |
| Health data empty | Profile → Connect Apple Health; grant read for Activity + nutrition |
| `ios/` missing | Run `npm run ios:add` or `npm run ios:prepare` |
| SPM / pod errors | In Xcode: File → Packages → Reset Package Caches |

---

**Scripts:** `npm run ios:prepare` · `npm run ios:open` · `npm run cap:sync`
