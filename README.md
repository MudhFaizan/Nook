# Nook — Cozy Habit Tracker (PWA)

This folder is a ready-to-deploy Progressive Web App (PWA) version of **Nook — Cozy Habit Tracker**.

## What's Inside
- `index.html` — The Nook app with PWA meta tags, dynamic light/dark status-bar theming, standalone safe-area padding, shortcut URL support, offline awareness, and in-app install prompt handling.
- `manifest.json` — Web App Manifest (`standalone` display, app icons, maskable icon, and Home Screen shortcuts for Today, New Ritual, and Insights).
- `sw.js` — Service Worker that precaches the app shell and caches Tailwind, Google Fonts, and Phosphor Icons for offline use after your first visit.
- `icons/` — App icons (`192x192`, `512x512`, `512x512` maskable, `180x180` Apple touch icon, and `favicon.svg`).

## Testing Locally
Service workers and PWA installation require `localhost` or `https://` (they will not register over `file://`).

Run a quick local server from this folder:
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000` in Chrome, Edge, or Safari.

## Deploying to HTTPS (for Installing on Phone)
Upload this entire folder to any static HTTPS host:
- **Netlify Drop**: Drag and drop the unzipped folder onto [app.netlify.com/drop](https://app.netlify.com/drop).
- **Vercel / Cloudflare Pages / GitHub Pages**: Push the folder contents to a repository and deploy as a static site.

Once deployed over HTTPS:
- **Android / Desktop Chrome or Edge**: Tap the **Install** banner or open **Settings → Install Nook App**.
- **iPhone / iPad (Safari)**: Open the URL in Safari, tap **Share**, then choose **Add to Home Screen**.
