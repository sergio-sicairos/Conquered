# Handoff: Conquered — Bar Check-In & Ranking

## Overview

**Conquered** is an iOS-style web app for tracking every bar in San Francisco. You check into bars you're physically at, rate each 1–3 stars, and watch your "percent of the city conquered" climb. Your 3-star bars automatically form a shareable list; you can also build custom lists. A leaderboard ranks friends by percentage conquered, and is the main discovery surface — you find someone above you and read what they rate highly.

The core loop: **conquer → rate → your taste becomes a list → friends use it to decide where to go.**

This handoff covers migrating an existing prototype repo (`sergio-sicairos/Conquered`) to this design. The backend plumbing largely exists; the design layer and data model are what change. See `MIGRATION.md` for the repo-specific plan — read it before this file's implementation details.

## About the Design Files

The files in this bundle are **design references created in HTML** — prototypes showing intended look and behavior, **not production code to copy directly.**

`Bar Conquest — Prototype.dc.html` is a working, stateful prototype: click through it to understand the flows, transitions, and how state propagates across screens. It is built on a bespoke HTML component runtime and is not meant to ship.

Your task is to **recreate these designs in the target codebase's environment**, using its established patterns. The existing repo is vanilla JS with no build step; the recommended target is Next.js + React (see `MIGRATION.md`), but if the team prefers to stay vanilla, the design translates fine — nothing here requires a framework.

## Fidelity

**High-fidelity.** Colors, typography, spacing, and interactions are final. Recreate the UI pixel-perfectly. Exact values are in **Design Tokens** below.

Two caveats:
- Photo areas are diagonal-stripe placeholders. Real venue photography replaces them.
- The city map is a placeholder rectangle. Real implementation uses a map library (see **Map** under Assets).

---

## Screens / Views

All screens live in a 390 × 844 viewport (iPhone 14/15 logical size). Layout is a vertical flex column:
`status bar (50px, fixed)` → `scrolling content (flex:1)` → `tab bar (fixed, when shown)` → `home indicator (24px, fixed)`.

Screen background `#F1EBDB` unless noted. Content columns use `24px` horizontal padding.

---

### 1. Map / Conquest Home

**Purpose:** The dashboard. Shows how much of the city you've taken and what's nearby to take next.

**Layout:** Scrolling column: header row → progress block → map → neighborhood list → search → bar list.

**Components:**

**Header row** — `display:flex; justify-content:space-between; align-items:baseline`
- Left: `SAN FRANCISCO` — Space Mono 10px, `letter-spacing:.2em`, `#17140F`
- Right: `412 BARS ON MAP` — Space Mono 10px, `#8A8175`. *(Use the real dataset count — 575.)*

**Progress block** — `display:flex; align-items:center; gap:16px; margin-top:12px`
- **Ring:** 108 × 108px circle. `background: conic-gradient(#F0451E 0 {pct}%, rgba(23,20,15,.13) {pct}% 100%)`, `transition: background .5s`. Inner circle 82 × 82px, `#F1EBDB`, `border:2px solid #17140F`, centered flex column:
  - Percentage — Anton 27px, `line-height:.9`, `#F0451E`, one decimal (e.g. `21.1%`)
  - `CONQUERED` — Space Mono 8px, `letter-spacing:.1em`, `#8A8175`
- **Count stack:** flex:1
  - `87` — Anton 40px, `line-height:.85`, with `/412` as a 20px `#8A8175` span
  - `BARS CHECKED IN` — Space Mono 10px, `letter-spacing:.06em`, `#8A8175`, `margin-top:5px`
  - **Star chips** — `display:flex; gap:5px; margin-top:8px`, Space Mono 9px, `padding:2px 6px`:
    - `★★★ 31` — bg `#F0451E`, text `#F1EBDB`
    - `★★ 38` — bg `#1F3FE0`, text `#F1EBDB`
    - `★ 18` — `border:1.5px solid #17140F`, transparent bg

**Map** — `height:104px; margin:14px 24px 0; border:2px solid #17140F`. Placeholder is a 45° stripe pattern with a red dot grid overlay (`radial-gradient(#F0451E 1.6px, transparent 2px)`, `background-size:19px 19px`, `opacity:.5`) representing pins. Caption bottom-right: `CITY MAP — YOUR PINS`, Space Mono 9px, `#6B6153`.

**Neighborhood progress** — heading `BY NEIGHBORHOOD`, Space Mono 10px, `letter-spacing:.18em`. Rows in `display:flex; flex-direction:column; gap:7px`. Each row:
- Label row: name (Space Mono 10px, `#17140F`) + `24/58 · 41%` (Space Mono 10px, `#8A8175`), `justify-content:space-between`
- Bar: `height:7px`, track `rgba(23,20,15,.13)`, fill `#F0451E`, `transition: width .5s`

**Search input** — full width, `border:2px solid #17140F`, bg `#FBF7EC`, `padding:9px 11px`, Space Mono 12px, `outline:none`. Placeholder `Search bars…`. Filters live on every keystroke against bar name and neighborhood.

**Bar rows** — `display:flex; gap:12px; align-items:center; padding:12px 0`, divider `1.5px solid rgba(23,20,15,.16)`, cursor pointer.
- **Chip:** 38 × 38px, `border:2px solid #17140F`. Unvisited: `+`, transparent bg. Visited: the star string (`★★★`), bg `rgba(240,69,30,.12)`, text `#F0451E`, 13px
- **Middle:** name (Archivo 700, 15px) / context line (11px, `#4A4237`) / `NEIGHBORHOOD · 0.2 MI` (Space Mono 9px, `letter-spacing:.06em`, `#8A8175`)
- **Chevron:** `›` Anton 20px
- **Sort:** unvisited first, visited sink to the bottom
- Context line reads `You rated it ★★★` when visited, otherwise a social hook (`3 friends gave this ★★★`)

**Empty state:** `NO BARS MATCH THAT.` — Space Mono 11px, `#8A8175`, centered, `padding:22px 0`.

---

### 2. Bar Detail

**Purpose:** Decide whether to go, and check in.

**Layout:** Scrolling content + pinned two-button footer.

**Components:**
- **Back:** `‹ MAP` — Space Mono 12px, `padding:4px 24px 8px`
- **Photo:** `height:176px`, stripe placeholder, `border-top/bottom: 3px solid #17140F`
  - **Status stamp** — absolute `top:14px; left:16px`, `transform: rotate(-7deg)`, `border:2px solid #F0451E`, text `#F0451E`, Anton 15px, `padding:3px 10px`, `letter-spacing:.06em`. Reads `UNCONQUERED` (transparent bg) or `CONQUERED` (bg `rgba(240,69,30,.15)`)
  - Caption bottom-right: `PHOTO — {BAR NAME}`, Space Mono 9px, `#6B6153`
- **Name** — Anton 34px, `line-height:.95`
- **Address** — `▲ 3010 20th St · 0.2 MI`, Space Mono 11px, `#8A8175`
- **Tags** — wrapping flex, `gap:6px`, each `border:1.5px solid #17140F`, `padding:2px 7px`, Space Mono 9px
- **Friends card** — `border:2px solid #17140F`, bg `#FBF7EC`, `padding:12px`, `margin-top:16px`. Label tab absolutely positioned `top:-9px; left:12px`, bg `#1F3FE0`, text `#F1EBDB`, Space Mono 9px, `letter-spacing:.12em`, `padding:2px 8px`, reading `YOUR FRIENDS`. Body: a friend quote, 12px, `#2A251D`, `line-height:1.45`. Footer: aggregate (`3 × ★★★ · ON 4 FRIENDS' LISTS`), Space Mono 9px, `#8A8175`
- **Your rating card** — only when visited. `border:2px solid #F0451E`, `padding:12px`. Label `YOUR RATING` (Space Mono 9px, `#F0451E`), then stars 20px `#F0451E` left, `CHECKED IN TODAY` right
- **Footer:** primary button flex:1, bg `#F0451E`, text `#F1EBDB`, Anton 19px, `padding:15px`, `border:2px solid #17140F`. Label `◎ CHECK IN`, or `◎ CHANGE MY RATING` if already visited. Secondary 54px square button `▲` (directions), bg `#F1EBDB`, same border

---

### 3. Rank Sheet

**Purpose:** The moment after checking in. Rate the bar 1–3 stars.

**Inverted screen** — bg `#17140F`, text `#F1EBDB`. Enters with `animation: sheetUp .28s ease-out` (translateY 100% → 0).

**Components:**
- **Header (centered):** `CHECKED IN · 9:41 PM` (Space Mono 10px, `letter-spacing:.22em`, `#F0451E`) → bar name (Anton 38px, `line-height:.9`) → badge `BAR #88 CONQUERED` (`border:2px solid #F0451E`, `#F0451E`, Anton 16px, `padding:4px 12px`, `transform: rotate(-3deg)`)
- **Divider:** `height:2px`, `rgba(241,235,219,.22)`
- **`RANK IT`** — Anton 21px, with sub `ONE TAP. YOU CAN CHANGE IT LATER.` Space Mono 10px `#8A8175`
- **Three options** — `display:flex; flex-direction:column; gap:10px`. Each `padding:13px`, `border:2px`, `transition: background .15s`, cursor pointer:
  - Star column: `width:56px`, 18px, `letter-spacing:1px`
  - Title Anton 18px; sub Space Mono 10px
  - **Unselected:** border `rgba(241,235,219,.4)`, bg transparent, text `#F1EBDB`, sub `#8A8175`. Star color: `#F0451E` for ★★★, `#1F3FE0` for ★★, `#8A8175` for ★
  - **Selected:** border and bg `#F0451E`, all text `#17140F`, trailing `✓` Anton 19px

  | Stars | Title | Sub |
  |---|---|---|
  | ★★★ | `ONE OF THE CITY'S BEST` | `ADDS IT TO YOUR 3-STAR LIST` |
  | ★★ | `SOLID. WOULD RETURN.` | `SAVED TO YOUR PASSPORT` |
  | ★ | `BEEN THERE. DONE.` | `COUNTS FOR THE MAP ONLY` |

- **Note field** — `border:2px dashed rgba(241,235,219,.35)`, `padding:11px`. Label `ADD A NOTE (OPTIONAL)`; transparent borderless input, 13px, `#F1EBDB`, placeholder `Sit at the back bar…`
- **Footer:** `CANCEL` (96px, transparent, `border:2px solid rgba(241,235,219,.35)`, Space Mono 11px, `#8A8175`) + save button flex:1, Anton 19px
  - **Save disabled** (no rating picked): bg `rgba(241,235,219,.25)`, text `#8A8175`, label `PICK A RATING`
  - **Save enabled:** bg `#F1EBDB`, text `#17140F`, label `SAVE CHECK-IN`

---

### 4. Saved Confirmation

**Purpose:** Reward. The single most important screen for whether the app feels fun.

**Full-bleed `#F0451E`**, text `#17140F`, centered column, `padding:0 34px`.

**Components (staggered entrance):**
- **Stamp** — `border:4px solid #17140F`, `padding:12px 20px`, `animation: stampIn .5s cubic-bezier(.2,1.4,.4,1) both` (scale 2.4 + rotate −14° → scale 1 + rotate −4°, fading in). Contains `CONQUERED` (Anton 44px, `line-height:.9`) and `★★★ · BAR #88` (Space Mono 11px, `letter-spacing:.2em`)
- **Bar name** — Anton 26px, `margin-top:26px`, `animation: riseIn .4s .3s both`
- **Stats** — `SAN FRANCISCO · 21.4%` / `MISSION NOW 43%`, Space Mono 12px, `line-height:1.7`, delay `.45s`
- **List badge** — only when ★★★: bg `#17140F`, text `#F1EBDB`, Space Mono 10px, `letter-spacing:.1em`, `padding:6px 12px`, reads `ADDED TO YOUR ★★★ LIST`, delay `.6s`
- **Button** — `SEE MY PASSPORT`, bg `#17140F`, text `#F1EBDB`, Anton 18px, `padding:14px 40px`, delay `.7s`

`riseIn` = translateY(14px) + opacity 0 → translateY(0) + opacity 1.

No tab bar. Home indicator is `#17140F` on the red.

---

### 5. Passport (Your Profile)

**Purpose:** Proof of what you've done. Your identity in the app.

**Components:**
- **Identity row** — 62px avatar (stripe placeholder, `border:2px solid #17140F`) + name (Anton 25px) + `@sam · SF · RANK #4` (Space Mono 10px, `#8A8175`) + right-aligned percentage (Anton 28px, `#F0451E`) over `OF SF` (Space Mono 8px)
- **Stat bar** — three equal columns, `border-top/bottom: 3px solid #17140F`, dividers `1.5px solid rgba(23,20,15,.2)`. Each: number Anton 19px, label Space Mono 9px `#8A8175`. Columns: `CHECK-INS`, `★★★ BARS` (number in `#F0451E`), `LISTS`
- **Tabs** — `PASSPORT` (active: bg `#17140F`, text `#F1EBDB`) / `LISTS` / `MAP` (inactive: `border:1.5px solid #17140F`), Space Mono 10px, `padding:3px 9px`
- **`RECENT`** heading, then check-in rows: star column `width:50px` 13px `#F0451E` / name Archivo 700 15px + neighborhood Space Mono 9px `#8A8175` / date Space Mono 10px `#8A8175`. Newest first — today's check-ins sort to the top

---

### 6. Lists

**Purpose:** What your taste looks like to other people.

**Components:**
- **Title** `YOUR LISTS` — Anton 36px
- **Tabs** — same as Passport, `LISTS` active
- **Automatic 3-star card** — inverted: bg and border `#17140F`, text `#F1EBDB`, `padding:14px`. Label tab `top:-9px; left:12px`, bg `#F0451E`, text `#17140F`, Space Mono 9px, reads `AUTOMATIC`
  - Title `MY 3-STAR BARS` (Anton 25px) + count (Anton 25px, `#F0451E`), `justify-content:space-between; align-items:flex-end`
  - Sub: `EVERY BAR YOU RATED ★★★ · UPDATES ITSELF`, Space Mono 9px, `#8A8175`
  - Preview: up to 5 rows, each name (Archivo 700 13px) + neighborhood (Space Mono 9px `#8A8175`), divider `1px solid rgba(241,235,219,.18)`
- **`LISTS YOU MADE`** heading + count. Rows: index (Anton 23px, `#F0451E`, `width:30px`) / title (Archivo 700 14px) + meta `6 BARS · PUBLIC` (Space Mono 9px) / `EDIT` chip (`border:1.5px solid #17140F`, Space Mono 10px)
- **New list** — `border:2px dashed #17140F`, `padding:13px`, centered `＋ NEW LIST`, Anton 17px

---

### 7. The Ranks (Leaderboard)

**Purpose:** Competition, and the primary way you discover people worth following.

**Components:**
- **Title** `THE RANKS` (Anton 38px) + sub `% OF SAN FRANCISCO CONQUERED` (Space Mono 10px, `letter-spacing:.14em`, `#8A8175`)
- **Filter chips** — `FRIENDS` (active, bg `#F0451E`, text `#F1EBDB`) / `CITY-WIDE` / `MISSION`
- **Rule** `height:3px; background:#17140F`
- **Rows** — rank number (Anton 28px, `#F0451E`, `width:32px`) / 38px avatar / name (Archivo 700 15px) + sub `164 BARS · SEE THEIR LISTS` (Space Mono 10px, `#8A8175`) / percentage (Anton 21px). **Your row** has bg `rgba(240,69,30,.1)` and sub `THAT'S YOU`. Rows are tappable → friend profile
- **Sorting is live** — as you check in, you climb past other users

---

### 8. Friend Profile

**Purpose:** Read someone's lists after finding them in the rankings.

**Components:**
- Back `‹ THE RANKS`
- Identity row identical to Passport, with `@devdrinks · RANK #1 IN SF` and `39.8%` / `164 BARS`
- **Two buttons** — `FOLLOWING ✓` (bg `#F0451E`, text `#F1EBDB`) and `COMPARE MAPS` (bg `#F1EBDB`), both flex:1, Anton 14px, `padding:9px`, `border:2px solid #17140F`
- **`HIS LISTS`** — rows: index (Anton 24px `#F0451E`) / title (Archivo 700 15px) + meta (Space Mono 9px) + `#1 · Zeitgeist` (12px, `#4A4237`) / chevron
- **Overlap card** — `border:2px solid #17140F`, bg `#FBF7EC`. Label `OVERLAP` (Space Mono 9px, `#1F3FE0`). Body: *"You've both conquered **34 bars**. He gave ★★★ to 11 you haven't hit yet."* — this is the hook that converts browsing into going out

---

### Tab Bar

Shown on Map, Lists, Ranks, Passport only. `border-top:3px solid #17140F`, bg `#F1EBDB`, Space Mono 10px, `letter-spacing:.06em`, each item `flex:1; padding:13px 0; text-align:center`.

Items: `MAP` · `LISTS` · `◎` (center, Anton 20px, `padding:8px 0` — quick check-in) · `RANKS` · `YOU`.
Active item: bg `#F0451E`, text `#F1EBDB`.

Home indicator: 24px tall bar, 130 × 5px pill, `border-radius:3px`. Color inverts per screen (`#17140F` on light, `#F1EBDB` on the dark rank sheet).

---

## Interactions & Behavior

**Navigation**
- Tab bar switches between Map / Lists / Ranks / Passport
- Bar row → Bar Detail. `‹ MAP` returns
- `◎ CHECK IN` → Rank Sheet (slides up). `CANCEL` returns to Bar Detail
- Rating + `SAVE CHECK-IN` → Saved Confirmation → `SEE MY PASSPORT` → Passport
- Leaderboard row → Friend Profile. `‹ THE RANKS` returns
- Passport/Lists secondary tabs cross-navigate

**Validation**
- Save is inert until a rating is selected; the button label states why (`PICK A RATING`)
- **Production adds a geofence gate:** check-in must fail outside ~150m of the venue with a clear message. The repo already implements this

**Live-updating state.** After a check-in, all of these change immediately: total count, percentage (one decimal), conic ring fill, neighborhood row and bar width, star tallies, the 3-star list, passport, leaderboard position and ordering.

**Animations**
- `sheetUp` — .28s ease-out, rank sheet entrance
- `stampIn` — .5s `cubic-bezier(.2,1.4,.4,1)`, overshooting stamp
- `riseIn` — .4s, staggered at .3s / .45s / .6s / .7s on the confirmation
- Ring `background` and neighborhood bar `width` transition at .5s
- Rank option `background` transitions at .15s

**Re-rating.** Visiting an already-conquered bar shows the current rating and offers `◎ CHANGE MY RATING`. The rank sheet opens pre-selected. Re-rating does not increment the conquered count.

**States to design before shipping** (not in the prototype): loading, geofence-denied, offline, zero-state for a new user at 0%, and error on failed write.

---

## State Management

```
screen        'map' | 'bar' | 'rank' | 'saved' | 'passport' | 'lists' | 'ranks' | 'friend'
barId         currently open bar
pending       0 | 1 | 2 | 3   — rating selected but unsaved
note          check-in note draft
query         search filter
checkins      { [barId]: { stars, date } }
saved         { name, stars, three, hoodLine } — confirmation payload
```

**Derived, never stored:** conquered count, percentage, star tallies, neighborhood progress, the 3-star list, leaderboard position. All computed from `checkins`. *Do not persist the 3-star list as its own collection* — it is a query (`where stars == 3`).

**Transitions:** `openBar` sets barId + screen. `startCheckin` sets screen and pre-seeds `pending`. `saveCheckin` writes the check-in, builds the `saved` payload, clears `pending`/`note`. `afterSave` navigates to passport.

**Data fetching:** bars load once from the dataset. User check-ins load on auth. Leaderboard needs friends' aggregate counts — denormalize a `conqueredCount` per user rather than counting documents on read.

---

## Design Tokens

**Colors**
| Token | Hex | Use |
|---|---|---|
| Paper | `#F1EBDB` | Screen background |
| Ink | `#17140F` | Text, borders, inverted panels |
| Red | `#F0451E` | Primary accent, active states, ★★★ |
| Blue | `#1F3FE0` | Secondary accent, ★★, label tabs |
| Card | `#FBF7EC` | Raised card fill |
| Muted | `#8A8175` | Secondary text |
| Body | `#4A4237` | Body copy on paper |
| Body dark | `#2A251D` | Card body copy |
| Caption | `#6B6153` | Photo captions |
| Stripe A / B | `#E1D8C2` / `#EFE7D3` | Placeholder pattern |
| Device bezel | `#100E0B` | Prototype frame only |

Alphas: dividers `rgba(23,20,15,.16)`, track `rgba(23,20,15,.13)`, stat divider `rgba(23,20,15,.2)`, dark divider `rgba(241,235,219,.18)`, dark border `rgba(241,235,219,.4)`, your-row tint `rgba(240,69,30,.1)`, visited chip `rgba(240,69,30,.12)`.

**Typography** — all Google Fonts.
| Family | Use |
|---|---|
| **Anton** 400 | Display: numbers, screen titles, buttons, stamps |
| **Archivo** 400/700 | UI body, list item names (700) |
| **Space Mono** 400/700 | Labels, metadata, captions, chips |

Scale: 44 / 40 / 38 / 36 / 34 / 28 / 27 / 26 / 25 / 24 / 23 / 21 / 20 / 19 / 18 / 15 / 14 / 13 / 12 / 11 / 10 / 9 / 8 px.
Tight display leading (`.85`–`.95`). Letter-spacing on mono labels: `.06em`–`.22em`, always uppercase.

**Spacing** — 2 / 3 / 4 / 5 / 6 / 7 / 8 / 9 / 10 / 11 / 12 / 13 / 14 / 16 / 18 / 24 / 26 / 34px. Screen gutter `24px`.

**Borders** — hairline `1.5px`, standard `2px`, heavy `3px`, stamp `4px`. **Radius: 0 everywhere** except the device frame, avatars on the leaderboard, and the home indicator pill. Square corners are core to the aesthetic — do not round them.

**Shadows** — none in-app. The only shadow is the prototype's device frame.

---

## Assets

**Fonts** — Anton, Archivo (400,500,600,700), Space Mono (400,700), via Google Fonts:
```
https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap
```

**Photography** — none supplied. Every stripe placeholder is a venue photo slot: bar detail hero (390 × 176), avatars (38–62px square), map (390 × 104). Source venue photos or let users contribute them.

**Icons** — no icon library. All glyphs are typographic: `▲` location, `◎` check-in, `›` chevron, `＋` add, `★` rating, `✓` confirm, `≡` reorder. Keep it that way — an icon set would fight the aesthetic.

**Map** — the placeholder must become a real map. The existing repo uses Leaflet + CARTO tiles in `map.html` and Google Maps in `index.html`. **Recommendation: Mapbox GL JS**, styled to the palette — paper `#F1EBDB` base, ink roads, red pins for conquered, hollow for unconquered. Google Maps styling cannot get close to this look; Leaflet with a custom tile set can.

---

## Files

| File | What it is |
|---|---|
| `Bar Conquest — Prototype.dc.html` | **Primary reference.** Fully interactive prototype — all 8 screens, live state, real transitions |
| `Top Lists — iOS Concept.dc.html` | Static concept canvas. Turn `2a` is this design; turns `1a`/`1b` are an earlier, broader "top lists of anything" exploration, kept for context on where the product came from |
| `support.js` | Runtime required by the two `.dc.html` files. Not part of the design |
| `MIGRATION.md` | **Read first.** Repo-specific plan: what to keep from `sergio-sicairos/Conquered`, the Firestore schema change, and known issues |

Open the `.dc.html` files directly in a browser. In the prototype, use `↺ RESET DEMO` to restore the starting state.
