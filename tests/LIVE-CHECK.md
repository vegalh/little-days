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
| 1 | Maps JS loads | Network: `maps.googleapis.com/maps/api/js?key=…` is `200`. Console: no `Google Maps JavaScript API error`. the one-time step shows the address field. | |
| 2 | Autocomplete | Typing "221 Wash" shows Google suggestions including Newton, MA. Network shows Places requests (`places.googleapis.com` from Google's own code). | |
| 3 | Picked place fields | Console: "Little Days: first Autocomplete place response". Check that `location`, `formattedAddress` and `addressComponents` exist, and that the country component has `shortText: "US"` and `types` including `"country"`. Note any difference here and in PRD.md 7.2. | |
| 4 | Example address | "Try an example" shows "… · Example address". Console: "first searchByText response". `localStorage` `littleDays.settings.v2` has `location: null`. | |
| 5 | Saved address | Pick an address, reload. The address, weather and places come back with no typing. Console: "first fetchFields response". Network: 1 `GetPlace`, then the search of check 22. | |
| 6 | Open-Meteo | Network: `api.open-meteo.com/v1/forecast?latitude=42.35&longitude=-71.21…` (2 decimals) is `200`. The Now temperature matches open-meteo.com for Newton within a degree or two. Next hours start at the current hour. | |
| 7 | Holidays | Network: `date.nager.at/api/v3/PublicHolidays/2026/US` is `200`. | |
| 8 | Geolocation allowed | "Use my location" asks for permission (only when pressed). The weather loads; the line says "Your current location"; holidays note says they show for an address or city. | |
| 9 | Geolocation denied | Block location for the site, press the button: "Location access is off, so type an address instead." | |
| 10 | Wrong key | Change one character of the key in `config.js`, reload and type an address: Google refuses the first request, and the city field appears. City weather works. | |
| 11 | No key | Rename `config.js`, reload: "Maps and places aren't set up on this copy of Little Days yet." City weather works. | |
| 12 | Referrer restriction | Open the site from `http://127.0.0.1:8472` (not an allowed referrer): Google refuses the key (as check 10). | |
| 13 | Prod key restriction | With the **prod** key in `config.js` on localhost: refused (as check 10). | |
| 14 | Billing view | Google Cloud console → APIs & Services → each API → Metrics: requests appear only for the APIs used so far. | |

## Phase 3 checks

| # | Check | How to confirm it's real | Pass? |
|---|---|---|---|
| 15 | Search on open | Reload with a saved address on Explore: places load by themselves. Reload on `#my-week`: Network shows **no** `searchNearby` until you open Explore. | |
| 16 | Nearby search | Open Filters, choose Nature, close Filters. Console: "first searchNearby response": check each place has `id`, `displayName`, `formattedAddress`, `location`, `primaryType`, `types`. Spot-check two places in Google Maps: they exist at their markers. If Google rejects a place type, the console shows the error; note it and fix PRD.md 7.10. | |
| 17 | Map | A real Google map with the Start marker and numbered markers matching the list. Google's logo and terms are visible. If markers are missing, check the console for a map ID error (the map ID must allow vector/advanced markers). | |
| 18 | Route matrix | Console: "first computeRouteMatrix response". At most 5 places show a walking time; check `matrix.rows[0].items[i]` has `durationMillis`, `distanceMeters`, `condition`. If Google rejects `travelMode: "WALKING"`, note the error: that's the one unconfirmed option (PRD.md 7.2). | |
| 19 | Walking time vs Google Maps | For one place, compare the card's time with Google Maps' own walking directions from the same address. They should be close. | |
| 20 | More walking times | "Check walking time" on a 6th+ place sends one more matrix request with one destination. | |
| 21 | Route | Open a place. Console: "first computeRoutes response". The detail map draws a green route line; any Google warnings show under "From Google:". | |
| 22 | All | With All chosen (the default), open Explore: up to 6 `searchNearby` requests, then 1 matrix with at most 5 destinations. Switching to a loaded interest sends nothing. | |
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
| 30 | Address request fails | Block `AutocompletePlaces` in DevTools, type: the field and text stay, with the message and Try again. Unblock, press Try again: real suggestions appear. | |

## Runs

| Date | Browser | Key | Checks passed | Notes |
|---|---|---|---|---|
| 2026-11-05 (home base, final review) | Chromium (Playwright), localhost:8472, 390 × 844 and 1280 × 800, English and Chinese | dev | 1, 2, 4, 5, 7–12, 15, 17, 18, 20–23, 25–27, 29, 30. Partly: 3 (address and country worked, fields not read one by one), 6 (request and 2 decimals, temperature not compared), 16 (real places, chosen with All), 19 (card matched Google's own route, not Google Maps), 28 (real name shown in My Places). Not run: 13 (no prod key here), 14 and 24 (Cloud console) | Real typing ("221 Washington St Newton"): 5 suggestions, 24 `AutocompletePlaces`, 1 `GetPlace`, 6 `SearchNearby`, 1 `ComputeRouteMatrix`, all `200`. Return visit on Explore: 1 `GetPlace`, 6 `SearchNearby`, 1 matrix. Return visit on My week: `GetPlace` only. Moving between views: 0. `farm` returned a `winery`, now filtered out. A wrong key and a blocked referrer don't reach `gm_authFailure` on a page with no map, so 8.3's refusal check is what brings the fallback. Automated browser, not real phones: real iPhone and Android keyboards not tested. |
| 2026-11-05 (mobile-first redesign) | Chromium (Playwright), localhost:8472, 390 × 844 and 1280 × 800, English and Chinese | dev | 1, 4, 16, 17, 18, 22 | Two passes with the example address, no typing. English, default All: 1 SearchText, 6 SearchNearby (all six categories accepted), 1 ComputeRouteMatrix, 1 map load, then one place opened: 1 ComputeRoutes, 1 detail map; 12 cards, 13 markers, no console errors. Chinese, Nature: 1 SearchText, 1 SearchNearby, 1 ComputeRouteMatrix, 1 map load; 9 cards. Checked on the real page: one-box search field and focus ring, map size at both widths, marker preview, Google logo and terms visible. Autocomplete typing, saved address and geolocation weren't run. |
| 2026-11-04 (Phase 5) | Chromium (Playwright), localhost:8472 | dev | 1, 2, 3, 5, 16, 17, 18, 21, 25, 26, 27, 28 | One address pick (39 Autocomplete requests, 1 GetPlace), 1 Nature search, 1 matrix (5), 2 ComputeRoutes for 3 openings, 2 maps in total, 0 requests for °C + day change (same 10 marker elements), Save → reload → 1 GetPlace for the address and 1 for the saved place. The saved-place request fired before the script scrolled, most likely because the browser restored the scroll position; the wait-until-visible behavior is checked only with mocks. 29 not run live (mocked only). |
| 2026-11-04 | Chromium (Playwright), localhost:8472 | dev | 1, 2, 3, 10 (via a blocked referrer), 16, 17, 18, 21 | One address pick, one Nature search (10 places), one route matrix (5 destinations), one route. All `200`. Fixed Google's marker deprecations afterwards (`glyphText`, pin as content, `gmp-click`); that fix is checked with mocks only. Not run: 4–9, 11–15, 19, 20, 22–24. |
