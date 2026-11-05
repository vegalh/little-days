# Live check: real APIs (PRD.md 10.3)

Mocked tests (`npx playwright test`) prove the page handles responses. They don't prove the real APIs work. This checklist does. Run it by hand, and record each run at the bottom.

Never paste a key into this file, a test, or a commit.

## Setup

1. `cp config.example.js config.js`, then put the **dev** key and your map ID in `config.js` (it's gitignored).
2. `python3 -m http.server 8000` in the repository, then open `http://localhost:8000` in Chrome.
3. Open DevTools: Console and Network (tick "Preserve log").

## Phase 2 checks

| # | Check | How to confirm it's real | Pass? |
|---|---|---|---|
| 1 | Maps JS loads | Network: `maps.googleapis.com/maps/api/js?key=…` is `200`. Console: no `Google Maps JavaScript API error`. Explore says "Choose a location and what you'd like to explore…" | |
| 2 | Autocomplete | Typing "221 Wash" shows Google suggestions including Newton, MA. Network shows Places requests (`places.googleapis.com` from Google's own code). | |
| 3 | Picked place fields | Console: "Little Days: first Autocomplete place response". Check that `location`, `formattedAddress` and `addressComponents` exist, and that the country component has `shortText: "US"` and `types` including `"country"`. Note any difference here and in PRD.md 7.2. | |
| 4 | Example address | "Try an example address" shows "… · Example address". Console: "first searchByText response". `localStorage` `littleDays.settings.v2` has `location: null`. | |
| 5 | Saved address | Pick an address, reload. The weather comes back with no typing. Console: "first fetchFields response". Network: **no** `searchNearby` request. | |
| 6 | Open-Meteo | Network: `api.open-meteo.com/v1/forecast?latitude=42.35&longitude=-71.21…` (2 decimals) is `200`. The Now temperature matches open-meteo.com for Newton within a degree or two. Next hours start at the current hour. | |
| 7 | Holidays | Network: `date.nager.at/api/v3/PublicHolidays/2026/US` is `200`. | |
| 8 | Geolocation allowed | "Use my location" asks for permission (only when pressed). The weather loads; the line says "Your current location"; holidays note says they show for an address or city. | |
| 9 | Geolocation denied | Block location for the site, press the button: "Location access is off, so type an address instead." | |
| 10 | Wrong key | Change one character of the key in `config.js`, reload: Explore says "Google Maps isn't available right now…" and the city field appears. City weather works. | |
| 11 | No key | Rename `config.js`, reload: "Maps and places aren't set up on this copy of Little Days yet." City weather works. | |
| 12 | Referrer restriction | Open the site from `http://127.0.0.1:8471` (not an allowed referrer): Google refuses the key (as check 10). | |
| 13 | Prod key restriction | With the **prod** key in `config.js` on localhost: refused (as check 10). | |
| 14 | Billing view | Google Cloud console → APIs & Services → each API → Metrics: requests appear only for the APIs used so far. | |

## Phase 3 checks

| # | Check | How to confirm it's real | Pass? |
|---|---|---|---|
| 15 | No search on load | Reload with a saved address: Network shows **no** `searchNearby` until you press Find Little Adventures. | |
| 16 | Nearby search | Choose Nature, press Find. Console: "first searchNearby response": check each place has `id`, `displayName`, `formattedAddress`, `location`, `primaryType`, `types`. Spot-check two places in Google Maps: they exist at their markers. If Google rejects a place type, the console shows the error; note it and fix PRD.md 7.10. | |
| 17 | Map | A real Google map with the Start marker and numbered markers matching the list. Google's logo and terms are visible. If markers are missing, check the console for a map ID error (the map ID must allow vector/advanced markers). | |
| 18 | Route matrix | Console: "first computeRouteMatrix response". At most 5 places show a walking time; check `matrix.rows[0].items[i]` has `durationMillis`, `distanceMeters`, `condition`. If Google rejects `travelMode: "WALKING"`, note the error: that's the one unconfirmed option (PRD.md 7.2). | |
| 19 | Walking time vs Google Maps | For one place, compare the card's time with Google Maps' own walking directions from the same address. They should be close. | |
| 20 | More walking times | "Check walking time" on a 6th+ place sends one more matrix request with one destination. | |
| 21 | Route | Open a place. Console: "first computeRoutes response". The detail map draws a green route line; any Google warnings show under "From Google:". | |
| 22 | All | Choose All, press Find: up to 6 `searchNearby` requests, then 1 matrix with at most 5 destinations. Switching to a loaded interest sends nothing. | |
| 23 | Storage | DevTools → Application → Local Storage: `littleDays.places.v1` holds only place IDs and `{ status, visits, note }`, no names or addresses. | |
| 24 | Billing view | Metrics show Places API (New) and Routes API requests matching what you did, and nothing unexpected. | |

## Phase 4–5 checks

| # | Check | How to confirm it's real | Pass? |
|---|---|---|---|
| 25 | One detail map | Open two places: the dialog keeps one map (one `.gm-style` inside `#place-map`), the old route line is gone, the new one is drawn. | |
| 26 | Routes reused | Reopen the first place: Network shows no new `ComputeRoutes`. | |
| 27 | Markers kept | Switch °F/°C and the day: no new Google requests, the same marker elements stay on the map. | |
| 28 | Saved place details | Save a place, reload, scroll to My Places: one `GetPlace` loads its real name and address. | |
| 29 | Results map reused | Change the walking time and search again: still one results map. | |

## Runs

| Date | Browser | Key | Checks passed | Notes |
|---|---|---|---|---|
| 2026-11-04 (Phase 5) | Chromium (Playwright), localhost:8472 | dev | 1, 2, 3, 5, 16, 17, 18, 21, 25, 26, 27, 28 | One address pick (39 Autocomplete requests, 1 GetPlace), 1 Nature search, 1 matrix (5), 2 ComputeRoutes for 3 openings, 2 maps in total, 0 requests for °C + day change (same 10 marker elements), Save → reload → 1 GetPlace for the address and 1 for the saved place. The saved-place request fired before the script scrolled, most likely because the browser restored the scroll position; the wait-until-visible behavior is checked only with mocks. 29 not run live (mocked only). |
| 2026-11-04 | Chromium (Playwright), localhost:8472 | dev | 1, 2, 3, 10 (via a blocked referrer), 16, 17, 18, 21 | One address pick, one Nature search (10 places), one route matrix (5 destinations), one route. All `200`. Fixed Google's marker deprecations afterwards (`glyphText`, pin as content, `gmp-click`); that fix is checked with mocks only. Not run: 4–9, 11–15, 19, 20, 22–24. |
