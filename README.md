# SF Bar Crawl Tracker

A web app to track every bar in San Francisco, with map + list, check-off, and a
percentage-complete tracker. Includes a **verified check-in** prototype: users can
only mark a bar visited when they are physically there (geofence) and record a short
video of themselves taking a drink, which is checked for real drinking motion.

## Run locally
```bash
./serve.sh              # starts http://localhost:8000
# open http://localhost:8000/          -> index.html (verified check-in app)
# open http://localhost:8000/map.html  -> simple map tracker (no check-in gate)
```
Camera + geolocation require a secure context. `localhost` works. For phone testing
over your Mac, use a tunnel (see docs/phone_testing_instructions.md).

## Files
- `index.html` — main app: Leaflet map, 575 bars, geofenced video check-in, % tracker.
- `map.html` — lighter version: map + list + tap-to-check-off, no verification.
- `data/bars_full.json` — 575 SF bars (name, neighborhood, category, lat, lon).
- `scripts/build_data.py` — rebuilds/cleans the dataset from a raw OSM export.
- `docs/phone_testing_instructions.md` — step-by-step phone testing via cloudflared.

## Data
Bars come from OpenStreetMap (Overpass API): amenity = bar/pub/nightclub, breweries,
and restaurants tagged with a bar. Neighborhood is assigned by nearest-centroid, so a
few near boundaries may sit in an adjacent district. To refresh, re-run the Overpass
query (see build_data.py header) and rebuild.

## How check-in verification works (prototype)
1. **Geofence** — must be within 150 m of the bar (`RADIUS_M`).
2. **Live camera** — front camera opens in-app (no file upload).
3. **Record ~4 s** — frames sampled during recording (`CLIP_MS`, `FRAMES`).
4. **Verdict** — `motionScore()` measures frame-to-frame movement as a stand-in for a
   real vision model. Above `MOTION_THRESH` = pass; a static pose fails. This is where
   the production vision model plugs in.

State is in `localStorage` (`sfbars_*` keys): visited set, custom bars, check-in meta
(timestamp, distance, thumbnail). No backend yet.

## Roadmap
- **Auto-reload** during dev (watch + refresh) for faster iteration.
- **Backend** (accounts + DB + hosting) so check-ins are server-recorded, tamper-
  resistant, and visible to the organizer.
- **Real vision model** for the drinking-motion check; keep evidence for manual review
  of flagged cases.
- **Stronger liveness** (randomized prompts) and optional QR-at-venue for presence.
- **Production concerns**: 21+ age verification, privacy/consent for stored video,
  data retention, and letting non-alcoholic drinks count.
