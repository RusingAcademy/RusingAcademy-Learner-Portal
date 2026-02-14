# PWA Release Notes — RusingAcademy Learner Portal (LRDG)

**Branch:** `feat/pwa`
**Date:** 2026-02-14
**Author:** Manus (Lead PWA Engineer)
**Checkpoint:** `8cafb9c8`

---

## Summary

This release transforms the RusingAcademy Learner Portal into a fully installable Progressive Web App (PWA). All changes are aligned with the branding and patterns of the central ecosystem repository (`RusingAcademy-Ecosystem-Main-Repo`) to ensure 100% compatibility for future merges and synchronization.

---

## Changes

### 1. Manifest (`client/public/manifest.json`)

| Field | Value |
|---|---|
| `name` | RusingAcademy - LRDG Learner Portal |
| `short_name` | LRDG Portal |
| `start_url` | `/` |
| `scope` | `/` |
| `display` | `standalone` |
| `orientation` | `portrait-primary` |
| `background_color` | `#0D7377` (central repo teal) |
| `theme_color` | `#0D7377` (central repo teal) |
| `categories` | `["education", "productivity"]` |

Seven icon entries configured (192x192, 512x512, maskable 192x192, maskable 512x512, apple-touch-icon 180x180, favicon 32x32, favicon 16x16).

### 2. Icons (`client/public/icons/`)

| File | Size | Purpose |
|---|---|---|
| `icon-192x192.png` | 192x192 | Standard PWA icon |
| `icon-512x512.png` | 512x512 | Standard PWA icon (splash) |
| `icon-maskable-192x192.png` | 192x192 | Maskable (safe zone padded) |
| `icon-maskable-512x512.png` | 512x512 | Maskable (safe zone padded) |
| `apple-touch-icon.png` | 180x180 | iOS home screen |
| `favicon-32x32.png` | 32x32 | Browser tab favicon |
| `favicon-16x16.png` | 16x16 | Browser tab favicon |

All icons generated from the official RusingAcademy logo with teal (#0D7377) background. Maskable icons include 20% safe-zone padding per Google's maskable icon spec.

### 3. PWA Meta Tags (`client/index.html`)

Added/validated the following meta tags:

```html
<meta name="theme-color" content="#0D7377" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="LRDG Portal" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
<link rel="manifest" href="/manifest.json" />
```

Pattern matches the central ecosystem repo (`RusingAcademy-Ecosystem-Main-Repo/client/index.html`).

### 4. Service Worker (`client/public/sw.js`)

**Strategy:** Network-first with offline fallback (safe caching).

**Cache behavior:**

| Route Pattern | Strategy |
|---|---|
| `/api/*` | Never cached (network only) |
| `/auth/*`, `/login`, `/logout` | Never cached |
| `/coach/*`, `/hr/*`, `/admin/*` | Never cached (protected portals) |
| `/oauth/*` | Never cached |
| Static assets (JS, CSS, images) | Cache-first with network fallback |
| Navigation requests | Network-first with offline fallback |

**Key features:**
- `CACHE_VERSION = 'lrdg-v1'` for cache busting
- Automatic old cache cleanup on activation
- Offline fallback to `/offline.html` for navigation requests
- `skipWaiting()` + `clients.claim()` for immediate activation
- Pattern aligned with central repo's `sw.js`

### 5. Offline Page (`client/public/offline.html`)

Bilingual (English/French) offline fallback page with:
- RusingAcademy branding (teal gradient background)
- "You are offline" / "Vous êtes hors ligne" messaging
- Retry button
- Professional styling matching the portal design

### 6. Service Worker Registration

Registration added in `client/index.html` via inline `<script>` tag:
- Checks `navigator.serviceWorker` support
- Registers `/sw.js` on `window.load`
- Logs registration success/failure to console

---

## Test Coverage

**320/320 tests passing** (56 new PWA-specific tests)

PWA test suite (`server/pwa.test.ts`) validates:
- Manifest JSON structure and all required fields
- Icon files existence and correct dimensions
- Service worker file existence and cache patterns
- Never-cache patterns for auth/admin/coach/HR routes
- Offline fallback page existence
- Meta tags in index.html
- Service worker registration script

---

## QA Steps

### Chrome Desktop (Install Prompt)

1. Open the deployed portal URL in Chrome
2. Look for the install icon in the address bar (or three-dot menu > "Install LRDG Portal")
3. Click "Install" — the app should open in its own window with the teal theme
4. Verify the app icon appears in the OS taskbar/dock

### Android Chrome (A2HS)

1. Open the portal URL in Chrome for Android
2. Tap the three-dot menu > "Add to Home screen" (or wait for the install banner)
3. Confirm the app name "LRDG Portal"
4. Verify the icon appears on the home screen
5. Launch from home screen — should open in standalone mode (no browser chrome)

### iOS Safari (A2HS)

1. Open the portal URL in Safari on iOS
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Confirm the name "LRDG Portal"
5. Verify the apple-touch-icon appears on the home screen
6. Launch from home screen — should open in standalone mode

### Offline Mode

1. Install the PWA (any platform)
2. Navigate to a few pages to populate the cache
3. Enable airplane mode / disconnect from network
4. Navigate to a new page — should see the bilingual offline fallback
5. Reconnect — the app should resume normally

### Lighthouse Audit

1. Open Chrome DevTools > Lighthouse tab
2. Select "Progressive Web App" category
3. Run audit — expect:
   - Installable: PASS
   - PWA Optimized: PASS (theme-color, viewport, manifest)

---

## Compatibility with Central Ecosystem

All patterns in this implementation are aligned with `RusingAcademy-Ecosystem-Main-Repo`:

| Aspect | Central Repo | Learner Portal |
|---|---|---|
| Theme color | `#0D7377` | `#0D7377` |
| Background color | `#0D7377` | `#0D7377` |
| SW cache strategy | Network-first + offline fallback | Network-first + offline fallback |
| Offline page | Bilingual EN/FR | Bilingual EN/FR |
| Meta tags pattern | apple-capable, status-bar-style, theme-color | Identical pattern |
| Icon naming | `/icons/icon-*.png` | `/icons/icon-*.png` |
| Manifest location | `/manifest.json` | `/manifest.json` |

No divergent patterns. Safe for future merge/synchronization.

---

## Files Changed

```
client/index.html                    — PWA meta tags + SW registration
client/public/manifest.json          — Complete PWA manifest
client/public/sw.js                  — Service worker (network-first)
client/public/offline.html           — Bilingual offline fallback
client/public/icons/icon-192x192.png
client/public/icons/icon-512x512.png
client/public/icons/icon-maskable-192x192.png
client/public/icons/icon-maskable-512x512.png
client/public/icons/apple-touch-icon.png
client/public/icons/favicon-32x32.png
client/public/icons/favicon-16x16.png
server/pwa.test.ts                   — 56 PWA vitest tests
PWA_RELEASE_NOTES.md                 — This file
```
