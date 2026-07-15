# CLAUDE.md — project context

## What this is
"SF Bar Crawl Tracker" — a web app to track visiting every bar in San Francisco, plus
a **verified check-in** system that confirms a user is physically at a bar and records
a short video of them drinking (anti-cheat vs. posing with someone else's drink).

Built as static single-file HTML prototypes in a previous session; now moving to a real
project here for faster iteration and a backend.

## Current state
- Front-end prototypes are complete and working (tested on iPhone via cloudflared).
- No backend. All state is in browser `localStorage`.
- AI verification is currently a **motion-detection stand-in**, not a real model.

## Layout
- `index.html` — flagship app: Leaflet/OSM map + list + geofenced video check-in.
- `map.html` — simpler tracker (tap to check off, no verification).
- `data/bars_full.json` — 575 bars: `{id,name,neighborhood,category,lat,lon}`.
- `scripts/build_data.py` — cleans/dedupes a raw Overpass JSON export into bars_full.json.
- `docs/phone_testing_instructions.md` — phone testing steps.

## Conventions (current code)
- Vanilla JS, no framework/build step. Everything inline in the HTML files.
- Map: Leaflet 1.9.4 + leaflet.markercluster 1.5.3 (CDN); CARTO Voyager tiles.
- State keys: `sfbars_visited_v1` (Set of `name|neighborhood`), `sfbars_custom_v1`,
  `sfbars_meta_v1`, `sfbars_view_v1`, `sfbars_age_v1`.
- Tunables in `index.html`: `RADIUS_M=150`, `CLIP_MS=4000`, `FRAMES=8`, `MOTION_THRESH=6`.
- Camera/geolocation need HTTPS or localhost.

## Suggested next steps
1. Add dev auto-reload (e.g., a tiny websocket/live-reload or a `vite` migration).
2. Stand up a backend (auth, DB, storage) for real, tamper-resistant check-ins.
3. Replace `motionScore()` with a real vision model call (server-side; keep API keys off
   the client). Store flagged clips for manual review.
4. Add 21+ verification and a privacy/consent + data-retention policy before public release.
5. Consider migrating the two HTML files toward a component structure if the UI grows.

## Gotchas
- Neighborhoods are nearest-centroid approximations; boundary bars can be mislabeled.
- `localStorage` is per-device and user-editable — not a source of truth for verification.
- Don't hardcode any API keys/tokens in client HTML.
