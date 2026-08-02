# Migration Plan — `sergio-sicairos/Conquered`

Read this before `README.md`. It covers what already exists in the repo, what to keep, and the one data-model change that everything else depends on.

Repo: `sergio-sicairos/Conquered`, branch `main`. Read at 2026-08-01.

---

## Verdict: take over the repo, don't start fresh

The existing project is the same product one generation back. The backend plumbing that is normally the slow, expensive part is already working. What's missing is the design layer and a data model that can hold a rating.

**Recommended:** new branch on this repo, same Vercel project (keeps domain and environment variables). Keep `data/`, `scripts/`, the Firebase initialization and auth block. Replace the UI.

---

## What exists today

| File | What it is | Verdict |
|---|---|---|
| `data/bars_full.json` | **575 SF bars** from OpenStreetMap — `{id, name, neighborhood, category, lat, lon}` | **Keep.** This is the most valuable asset in the repo |
| `scripts/build_data.py` | Cleans/dedupes a raw Overpass export into `bars_full.json` | **Keep.** Needed to refresh the dataset |
| `index.html` | Google Maps + Firebase auth + Firestore. Google sign-in works; persists `users/{uid}.visited` | **Keep the auth/Firebase block, replace the UI** |
| `map.html` | 80KB Leaflet version — map + list + tap-to-check-off, `localStorage` only | **Delete.** Competing implementation, no auth |
| `dev-server.js` / `serve.sh` | Static server with polling live-reload | Keep for now; redundant if you move to Next.js |
| `docs/phone_testing_instructions.md` | Phone testing via cloudflared | **Keep.** Still the fastest way to test geolocation on a real device |
| `CLAUDE.md` / `README.md` | Project context, accurate | Update as you go |

The README also documents a **geofenced video check-in** (150m radius, ~4s clip, `motionScore()` motion-detection stand-in for a real vision model). That anti-cheat work is real and worth preserving — but note the current `index.html` on `main` does not contain it. Recover it from git history if it's been overwritten.

---

## The one change that matters: the data model

Today:

```js
visited = new Set(["Trick Dog|Mission", ...])   // stored at users/{uid}.visited
```

A `Set` of `"name|neighborhood"` strings **cannot hold a star rating, a timestamp, or a note** — and it breaks if a bar is renamed upstream in OSM. Every feature in the new design (ratings, the automatic 3-star list, the leaderboard, friend overlap) depends on replacing it.

`bars_full.json` already has stable `id`s. Use them as the key.

### Proposed Firestore schema

```
users/{uid}
  displayName, handle, photoURL, city: "sf"
  conqueredCount: 87        // denormalized, incremented on write
  createdAt

checkins/{uid}_{barId}      // deterministic id = idempotent, one row per user per bar
  uid, barId
  barName, neighborhood     // denormalized for cheap list rendering
  stars: 1 | 2 | 3
  note: string
  ts: timestamp
  lat, lng, distanceM       // geofence evidence
  verified: boolean

lists/{listId}
  uid, title, isPublic, order: [barId], createdAt

follows/{followerUid}_{followeeUid}
  followerUid, followeeUid, createdAt
```

**Rules of thumb:**

- **Never store the 3-star list.** It is `checkins where uid == me && stars == 3`. Storing it creates two sources of truth that will drift.
- **Do store `conqueredCount`** on the user. The leaderboard reads six users; counting their check-in documents on every read is a needless fan-out. Increment it in the same write as the check-in.
- **Percentage = `conqueredCount / totalBarsInCity`.** Store the city total (575) in config, not hardcoded in components — the number changes when you rebuild the dataset.
- **Re-rating updates `stars` in place**; it must not touch `conqueredCount`.

### Migration path for existing data

If any users already have a `visited` Set, write a one-time script: for each string, split on `|`, match to a bar by name + neighborhood, and create a check-in doc with `stars: 2` and `verified: false`. Log unmatched entries — nearest-centroid neighborhood assignment means a few won't resolve.

---

## Known issues to fix

1. **The Google Maps API key is committed in `index.html`.** The repo's own `CLAUDE.md` says not to hardcode keys in client HTML. Firebase config being public is fine and by design — the Maps key is not. Add HTTP-referrer restrictions in Google Cloud Console, restrict it to the Maps JS API only, and rotate it. Do this today; it's currently usable by anyone who views source.

2. **Two competing apps.** `index.html` and `map.html` implement the same thing differently, with different state stores. Pick `index.html`, delete the other.

3. **`localStorage` as source of truth.** Already noted in `CLAUDE.md` — it's per-device and user-editable. With Firestore in place, use it only as an offline cache.

4. **Neighborhood accuracy.** Assigned by nearest centroid, so bars near boundaries get mislabeled. The design surfaces neighborhoods prominently (progress bars, every list row), so errors are visible. Consider real neighborhood polygons; SF publishes them as open data.

5. **`totalBars` must match reality.** The prototype says 412; the dataset has 575. Percentages are the core mechanic — drive them from the dataset, never a literal.

---

## Suggested build order

1. Rotate and restrict the Maps key. Delete `map.html`.
2. Stand up the new Firestore schema; migrate `visited` if there's real data.
3. Rebuild the **Map / Conquest Home** screen against real bars — this validates dataset, geo, and percentage math together.
4. **Bar Detail → Rank Sheet → Saved Confirmation.** The core loop. Restore the geofence gate here.
5. **Passport** and **Lists** — both are queries over check-ins, so they come nearly free once step 4 works.
6. **Ranks** and **Friend Profile** — needs `follows` and denormalized counts. Last, because it's the only part requiring a social graph.

Steps 3–5 are a testable app on their own. The leaderboard makes it social, but the single-player loop should feel good first.

---

## Stack notes

- **Framework:** the repo is vanilla JS with no build step, and this design does not require a framework. But state now propagates across eight screens (a check-in updates six visible numbers at once), which is where vanilla starts to hurt. **Next.js + React on the existing Vercel project** is the recommended move.
- **Auth:** Firebase Google sign-in already works — keep it. Don't migrate to Supabase just for tidiness; the cost is real and the benefit is not.
- **Map:** switch to **Mapbox GL JS**. Google Maps styling cannot reach this design's look; Mapbox can be styled to the paper/ink palette directly.
- **Fonts:** Anton, Archivo, Space Mono via Google Fonts. Self-host if you care about the first-paint flash — the display type is prominent enough that swapping is noticeable.
