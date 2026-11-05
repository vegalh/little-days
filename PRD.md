# Little Days — Product Requirements

**Little Days — Big Discoveries, Close to Home.**

## 1. Summary

Little Days helps early childhood educators and families find real places near their home or school where young children can explore, notice and learn: parks and gardens, but also libraries, bakeries, post offices, fire stations and other everyday parts of a neighborhood. It should feel like a neighborhood field guide, not an activity generator.

The adult enters an address (or uses their device location once), says who is exploring (a family or a classroom, and a broad age range), how far they want to walk, and what they're interested in. The page shows real nearby places from Google on a real map, with Google's walking-time estimates, the weather, and short exploration guides. Places can be saved, marked as explored, revisited with fresh prompts, and added to My Week.

Everything from the earlier version stays: the seven-day forecast with its conservative weather rules, "What to wear", the 37 RootMap activities (now also offered as at-home ideas after a visit), holidays, and My Week.

The site stays static: plain HTML, CSS and JavaScript on GitHub Pages, with no backend.

## 2. Problem

Adults want to take young children out into the world, but planning takes time. They don't know what's nearby beyond the usual playground, they can't easily tell how long the walk is, and generic activity lists ignore the weather and the place itself. Educators also need to plan for groups, which makes walking time, access and weather matter more.

## 3. Users

**Families:** a parent or caregiver of children aged 0–6, planning on a phone, often on the day.

**Classrooms:** early childhood and Montessori teachers planning a neighborhood walk for a group, usually on a laptop, a few days ahead.

Version 1 is built first for ages 2–6. Children under 2 are supported with age notes but get no at-home ideas, because RootMap has none for them yet.

## 4. Goals

- From opening the page to a list of real nearby places takes under a minute.
- Every place, address, walking time and forecast shown comes from a real API response. Nothing is invented. When data is missing, the page says so.
- Weather shapes the suggestions (7.4, 7.15), and the page never says outdoor play or a route is "safe".
- What the APIs say (verified data) is always visually and verbally separate from what Little Days suggests (Little Days ideas).
- Saved places, explored status and My Week are still there after a refresh, stored only in the browser.
- Google Maps Platform costs stay small and predictable (9.3).

## 5. Non-goals (version 1)

- A backend, server functions, accounts, logins, or syncing across devices
- Analytics or tracking of any kind
- Children's names, photos, birthdays or profiles
- Opening hours, prices, entry fees, or "free" labels (7.11). The page links to Google Maps instead.
- Booking, or saying a business accepts classroom visits
- Claiming a walking route suits strollers, toddlers or groups
- AI-written text. Exploration guides are written and reviewed by hand (7.14).
- Sharing, printing or exporting
- Notifications or reminders
- New RootMap activities: all activities still come from RootMap

## 6. User stories

1. As an adult, I type an address and pick it from Google's suggestions, so the search starts from the right place.
2. As an adult, I press "Use my location" to search from where I am, and if I say no, I can still type an address.
3. As an adult, I choose Family or Classroom and a broad age range, without giving any child's details.
4. As an adult, I choose how long I'm willing to walk (5–30 minutes) and what we're interested in.
5. As an adult, I see real nearby places on a map and in a list, with their address, category, and Google's walking time.
6. As an adult, I see weather notes on each place, and indoor places first when the weather is poor.
7. As an adult, I filter places by walking time, category, indoor/outdoor, and whether we've already explored them.
8. As an adult, I open a place to see the walking route, the weather, and a short guide for before, during and after the visit.
9. As a teacher, I'm reminded that walking times for a group of small children are longer than Google's estimate, and to check the route and ask the place before a group visit.
10. As an adult, I save places I want to explore, mark them as explored, and mark them to revisit with new prompts.
11. As an adult, I add a place to a date in My Week with an optional time, theme and notes, and see the forecast for that date when it's available.
12. As an adult, I still see the seven-day forecast, what to wear, and at-home ideas from RootMap.
13. As an adult, I switch between °F and °C.
14. As an adult, I delete everything Little Days has saved on this device.

## 7. Functional requirements

### 7.1 Inputs

All inputs sit in the controls card. Nothing about the child is collected beyond the broad age range, and the age range and mode are never sent to any API.

| Input | Control | Behavior |
|---|---|---|
| Address | Google Place Autocomplete (`PlaceAutocompleteElement`, 7.2) with the visible label "Address or place" | Suggestions come from Google as the adult types. Picking one sets the location (its `location`, `formattedAddress`, and country code from `addressComponents`). Typed text that wasn't picked is not used (8.4). |
| City (fallback) | Text field "City (for weather)" with the browser's suggestion list (`<datalist>`) and a "Show weather" button | Shown **only when Google Maps is unavailable** (not configured, refused, or failed to load, 8.3). Works exactly like the earlier city search: after a pause in typing (2+ letters, 300 ms) up to five Open-Meteo matches appear as "name, state/region, country"; a picked one is used as is, a typed one is geocoded and the first result is used and named. It gives **weather only**: no places and no walking routes. |
| Use my location | `<button>` "Use my location" | Asks the browser for the position **only when pressed** (`navigator.geolocation.getCurrentPosition`, once, `timeout: 10000`, `maximumAge: 300000`). Never `watchPosition`, never on page load. The location line reads "Your current location". Works with or without Google. |
| Example | `<button>` "Try an example address" | Shown only when Google Maps is available. Looks up the demo address **221 Washington Street, Newton, MA 02458** with one Google text search (7.2). It's only an example: it is never saved (7.18) and never treated as the adult's location. |
| Who's exploring | Two radio buttons: **Family** / **Classroom** | Changes wording and reminders (7.13). Default Family. |
| Ages | `<select>`: Under 2, 2–3, 4–6, Mixed 2–6 | Changes age notes (7.13) and at-home ideas (7.5). Default Mixed 2–6. |
| Walking time | Five radio buttons: 5, 10, 15, 20, 30 min | Sets the search area (7.10) and the walking-time filter (7.12). Default 15. |
| Interests | Seven radio buttons styled as chips: the six categories (7.10) and **All** | One is chosen at a time. **None is chosen at first**, so nothing is searched by default. A category is one search; All is one search per category not yet loaded (7.10). |
| Temperature | °F / °C switch | Changes every temperature, wind speed (mph / km/h), rain amount (in / mm) and distance (mi / km). Doesn't refetch anything. Saved. |
| Search | Primary button "Find Little Adventures" | Starts the place search (8.2). This is the **only** thing that starts a Google Places search. |
| Day | Each day card in the seven-day strip is a button | Selects the day used for weather notes on places, What to wear, and at-home ideas. Today after a search. |

**Choosing a location fetches the weather right away** (Open-Meteo and Nager.Date, no Google request). **Places are fetched only when the adult presses "Find Little Adventures"**, never on page load, never on a return visit, and never just because a location or interest changed. Changing mode, ages, units, the day or filters never makes a request. Changing the location or walking time clears the places loaded so far; the next search starts fresh.

### 7.2 Data sources

| Source | How it's called | Used for |
|---|---|---|
| Google Maps JavaScript API | One script loaded with Google's bootstrap loader, then `google.maps.importLibrary(...)` | The map (`maps`), markers (`marker`, `AdvancedMarkerElement`) |
| Places API (New), through the JS `places` library | `PlaceAutocompleteElement`, `Place.searchNearby`, `Place.searchByText` (example address only), `place.fetchFields` | Address suggestions, nearby places, details for saved places |
| Routes API, through the JS `routes` library | `RouteMatrix.computeRouteMatrix` (walking times for the shortlist), `Route.computeRoutes` (one route, drawn on the detail map) | Walking time, walking distance, route line, route warnings |
| Open-Meteo Forecast | `fetch` (below) | Current weather, next hours, seven days |
| Open-Meteo Geocoding | `fetch`, **only in the weather-only fallback** (7.1) | City → latitude/longitude and country code |
| Nager.Date | `fetch`, unchanged | Public holidays |
| `celebrations.js` | Local file, unchanged | Celebrations that aren't public holidays |
| Browser Geolocation API | `getCurrentPosition` | Optional device location |

**Google is called only through the Maps JavaScript API and its libraries**, with a browser key restricted to the site's addresses and to these three APIs (9.2). The page never calls Google's REST web services (`places.googleapis.com`, `routes.googleapis.com`) with `fetch`.

**Google fields used.** Each Google call asks only for the fields below (the field list sets the price, 9.3).

What's been checked so far (Google's JavaScript reference, 2026-11-04):
- Confirmed in the docs: `PlaceAutocompleteElement` (`gmp-select` event with `placePrediction.toPlace()`, `gmp-error` event, a settable `value`, styling through `::part(input)`, `::part(prediction-list)` and others); `Place.searchNearby` (`fields`, `locationRestriction` up to 50,000 m, `includedTypes` or `includedPrimaryTypes`, up to 50 types, `maxResultCount`, `rankPreference` `DISTANCE` / `POPULARITY`, returns `{ places }`); `Place` properties `id`, `displayName`, `formattedAddress`, `location`, `addressComponents`, `primaryType`, `types`, `googleMapsURI`, `attributions`; `RouteMatrix.computeRouteMatrix` (returns `{ matrix }`, read as `matrix.rows[].items[]`, `fields` required, items have `durationMillis`, `distanceMeters`, `condition` `ROUTE_EXISTS` / `ROUTE_NOT_FOUND`, `error`; at most 625 origin × destination pairs); `Route.computeRoutes` (returns `{ routes }`, `fields` required, routes have `durationMillis`, `distanceMeters`, `path`, `warnings`, `createPolylines()`).
- **Checked against live responses on 2026-11-04** (dev key, `localhost:8472`, around 221 Washington St, Newton, MA; Maps JS 3.66):
  - Autocomplete → `fetchFields`: `AutocompletePlaces` and `GetPlace` answered `200`; the picked place gave a location and a US country code from `addressComponents` (holidays loaded).
  - `searchNearby` (Nature types, 1200 m, `includedPrimaryTypes`, `maxResultCount: 10`, `DISTANCE`): 10 real places, each with `id`, `displayName` (a string), `formattedAddress`, `location`, `primaryType`, `types`. Every Nature type was accepted.
  - `computeRouteMatrix` with `travelMode: "WALKING"` and 5 destinations: `matrix.rows[0].items[]` in destination order, each with `condition: "ROUTE_EXISTS"`, `durationMillis`, `distanceMeters`.
  - `computeRoutes` (walking): one route with `durationMillis`, `distanceMeters`, `warnings` (empty here) and `path` (points with `lat`, `lng`, `altitude`).
  - Markers: Google deprecated `PinElement`'s `glyph` (use `glyphText`), `pin.element` (use the pin itself) and `addListener` on markers (use `addEventListener("gmp-click")`). The code uses the new forms.
- **Not yet checked live:** the example address (`searchByText`), the types of the other five categories, quota errors, and an empty nearby result.

| Call | Fields requested |
|---|---|
| Autocomplete pick → `fetchFields` | `location`, `formattedAddress`, `addressComponents` |
| Example → `searchByText` | `location`, `formattedAddress`, `addressComponents`, `maxResultCount: 1` |
| `searchNearby` (7.10) | `id`, `displayName`, `formattedAddress`, `location`, `primaryType`, `types` |
| Saved place → `fetchFields` (7.17) | `displayName`, `formattedAddress`, `location`, `primaryType`, `types` |
| `computeRouteMatrix` | `durationMillis`, `distanceMeters`, `condition` |
| `computeRoutes` | `durationMillis`, `distanceMeters`, `path`, `warnings` |

**Open-Meteo Forecast.** One request, rounded location (7.18):

`https://api.open-meteo.com/v1/forecast?latitude=..&longitude=..&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_gusts_10m,precipitation&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_gusts_10m&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_probability_max,precipitation_sum,weather_code,wind_speed_10m_max,wind_gusts_10m_max,uv_index_max&timezone=auto&forecast_days=7`

Checked against a real response on 2026-11-04 (Newton, MA):

| Block | Fields | Notes |
|---|---|---|
| `current` | `time`, `temperature_2m`, `apparent_temperature` (°C), `weather_code` (WMO), `wind_speed_10m`, `wind_gusts_10m` (km/h), `precipitation` (mm) | `time` is local, for example `2026-11-04T17:15` (15-minute steps) |
| `hourly` | `time`, `temperature_2m`, `apparent_temperature`, `precipitation_probability` (%), `precipitation` (mm), `weather_code`, `wind_speed_10m`, `wind_gusts_10m` | 168 entries, starting at local midnight today (`2026-11-04T00:00`), not at the current hour |
| `daily` | `time`, `temperature_2m_max`, `temperature_2m_min`, `apparent_temperature_max`, `apparent_temperature_min`, `precipitation_probability_max`, `precipitation_sum` (mm), `weather_code`, `wind_speed_10m_max`, `wind_gusts_10m_max`, `uv_index_max` | 7 dates, index 0 is today |

Everything is requested in °C, km/h and mm and kept that way in the code; the switch only changes the display. °F = °C × 9/5 + 32, mph = km/h × 0.621, in = mm ÷ 25.4 (two decimals, because 15-minute amounts are small), mm with one decimal, mi = km × 0.621 (one decimal). Conversions live in `advice.js`. Any value can be `null`; the page never fills one in.

**Open-Meteo Geocoding** (fallback only, unchanged from the earlier version and checked 2026-10-30): `https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1` (search) and `&count=5` (suggestions). Fields: `results[]` → `latitude`, `longitude`, `name`, `admin1`, `country`, `country_code`. "Not found" (and a 1-letter name) is `200` with **no `results` field**, so the code checks for it.

**Nager.Date.** Unchanged: `https://date.nager.at/api/v3/PublicHolidays/{year}/{countryCode}`, fields `date`, `name`. The country code comes from the chosen address (`addressComponents`, the `country` part's short name) or, in the fallback, the city's `country_code`. With device location there is no country, so holidays and celebrations aren't shown and the strip says "Holidays show when you search an address." (No extra reverse-geocoding call.)

**Celebrations** (`celebrations.js`): unchanged.

| Celebration | Date | Countries (ISO codes) |
|---|---|---|
| Halloween | Oct 31 | US, CA, IE, GB |
| Valentine's Day | Feb 14 | US, CA, GB, IE, AU, NZ |

How each API behaves:

| Situation | What happens | Checked |
|---|---|---|
| Forecast gets a bad request | `400`, `{"error": true, "reason": "..."}` | 2026-10-30 |
| Nager.Date gets an unsupported country | `404` or `204 No Content`, empty body. The page shows "Nager.Date doesn't list public holidays for this country, so none are shown." | 2026-10-31 |
| No internet | `fetch` throws; Google library calls reject | 2026-10-30 (fetch) |
| Google key missing, wrong, not allowed for this address, an API not enabled, or billing off | The Maps JS API calls `window.gm_authFailure` and/or library calls reject | Not yet: check in Phase 2 |
| Google quota exceeded | Library calls reject (expected `RESOURCE_EXHAUSTED` / `OVER_QUERY_LIMIT` in the message) | Not yet: check in Phase 2 |
| Nearby search finds nothing | Expected: an empty `places` array | Not yet: check in Phase 2 |
| Geolocation refused | The error callback gets `code` 1 (`PERMISSION_DENIED`); 2 is unavailable, 3 is timeout | Browser standard |

### 7.3 Combining the data

- Days are matched by date string (`YYYY-MM-DD`) across the forecast, public holidays, celebrations and My Week.
- If the seven days span two years, fetch holidays for both years.
- Hourly entries are matched to "now" by comparing `hourly.time` with `current.time` (both local to the place, `YYYY-MM-DDTHH:MM`). `hourly` starts at local midnight, so its first entries are usually in the past and are never shown as "next". The "Next hours" row starts at the entry for the hour containing `current.time` (for `17:15`, the `17:00` entry, labelled "5 PM": every column is labelled with its hour, because the Now card shows the 15-minute `current` values, which can differ slightly from the hourly ones) and shows the next six entries from there (fewer if the forecast runs out). The browser's own clock and time zone are never used for this. Code: `nextHours` in `recommend.js`.
- Places from different category searches are merged by `id`. A place found by two searches belongs to the first category in the order of 7.10.
- Walking times are matched to places by their position in the destinations list sent to `computeRouteMatrix`.

### 7.4 Weather conditions

A daily forecast covers a whole area and a whole day, so it can't show that it is safe to play outside. The page never says outdoor play is "safe". It is conservative instead: it holds outdoor ideas back when the forecast points to danger, and warns when conditions call for care. Every selected day also shows: "These ideas use the daily forecast for the whole area. Check the weather before you go out, and come inside if it changes."

Each day gets a list of **hazards**, **cautions**, and **notes** (code: `weatherFor` in `recommend.js`):

**Hazards: no outdoor ideas at all.** The day card shows an "Indoor day" tag.

| Hazard | Rule | Warning shown |
|---|---|---|
| Thunderstorm | code 95, 96, 99 | "Thunderstorms are forecast. Stay indoors while there is thunder or lightning." |
| Heavy rain | code 65, 82 | "Heavy rain is forecast." |
| Freezing rain | code 56, 57, 66, 67 | "Freezing rain is forecast, so paths may be icy." |
| Heavy snow | code 75, 86 | "Heavy snow is forecast." |
| Extreme heat | feels-like high ≥ 32°C (90°F) | "It may feel like {x}° at the hottest part of the day. That's too hot for outdoor play." |
| Extreme cold | feels-like high ≤ −10°C (14°F) | "It may feel like {x}° at the warmest part of the day. That's too cold for outdoor play." |
| Dangerous wind | gusts ≥ 70 km/h (43 mph) | "Gusts may reach {x}. That's too windy to play outside, especially near trees." |

On a hazard day the page also says "Outdoor ideas are left out today."

**Cautions: outdoor play is allowed, but only activities marked as suiting that condition (7.5).**

| Caution | Rule | Warning shown |
|---|---|---|
| Rain | code 51, 53, 55, 61, 63, 80, 81, **or** precipitation chance ≥ 50% unless the code says snow | "Rain is possible ({n}%). Any outdoor idea today works in rain gear; skip it if the rain gets heavy." |
| Snow | code 71, 73, 77, 85 | "Light snow is forecast. Dress warmly and keep outdoor time short." |
| Cold | feels-like high < 5°C (41°F) | "It may feel like {x}° at the warmest part of the day. Keep outdoor time short and dress warmly." |
| Hot | feels-like high 27–31°C (81–89°F) | "It may feel like {x}°. Play outside early or late, in the shade, with water and sun protection." |
| Wind | gusts 50–69 km/h (31–42 mph) | "Gusts may reach {x}. Stay clear of trees and loose branches." |

**Notes: a warning only.** Fog (code 45, 48): "Fog is forecast. Stay close together near roads."

A day with none of these is **clear**.

Why these thresholds: the feels-like high (`apparent_temperature_max`) includes wind chill and humidity, which matter more for small children than air temperature. The wind levels sit above ordinary breezy days: Boston's forecast on 2026-10-31 had gusts of 39–45 km/h on most days, so a lower caution level would fire nearly every day. The dangerous-wind level is below the US National Weather Service wind-advisory gust level (74 km/h / 46 mph), to stay on the careful side.

### 7.5 Activities and recommendations

These are the **at-home ideas**: shown for the selected day in "Ideas for {day}", as the featured activity on each day card, and under "At home afterwards" in place details (7.14). They work as before, with one change: the age range filter (7.13).

**Source.** All 37 activities come from RootMap (`https://github.com/vegalh/rootmapmvp`, `src/data/activities.ts`, commit `80cae2e`). Nothing new is written for Little Days. They live in `activities.js`, which Little Days reads locally; RootMap isn't needed at runtime and isn't changed. Each entry keeps the original apart from what Little Days adds:

```js
{
  id: "bark-rubbing",          // original RootMap ID
  rootmap: { ... },            // the original record, copied unchanged
  littleDays: {                // added for Little Days
    minAge: 2, maxAge: 6,      // read from rootmap.age ("2–6 years"), shown on cards
    place: "outdoor",          // "indoor", "outdoor", or "either"
    weather: ["cold"],         // cautions it still suits outdoors (7.4)
    seasons: null,             // null = any season, or e.g. ["autumn"]
    holidays: [],              // holiday-inspired tags
    photo: { width: 960, height: 720 }  // size of the WebP copy, or null
  }
}
```

The page shows from `rootmap`: `title`, `minutes`, `description`, the first three `domains` (developmental areas, shown as tags), and `safety` when there is one. `materials`, `steps` and the Chinese translations (`zh`) are kept for the activity details (7.8).

**How Little Days metadata was set:**
- `place`: from RootMap `settings` (`park` or `walking` means outdoor, `home` means indoor), checked by hand. "Either" means it works inside or out.
- `weather`: only for outdoor and "either" activities. For example `duck-walk` suits rain, snow, cold and wind; `bark-rubbing` suits only cold (wet bark and blowing paper don't work).
- `seasons`: only when the activity needs something seasonal. Fallen leaves → autumn; fresh leaves or small flowers → spring to autumn. The season comes from the date, and is swapped for cities south of the equator (latitude < 0).
- `holidays`: two approved **holiday-inspired** tags: `washing-pumpkin` → Halloween and `mashing-potatoes` → Thanksgiving. The original activities weren't written for these holidays; the page labels them "Halloween-inspired idea" and leaves the RootMap description unchanged. Other autumn activities are tagged by season only.

**Recommendation order** (code: `pickIdeas` and `planWeek` in `recommend.js`). The first two steps decide what *may* be shown; the last two only change the order. A holiday can never bring back an activity that steps 1–2 removed. Before step 1, activities whose `minAge`–`maxAge` doesn't overlap the chosen age range (7.13) are left out; with "Under 2" none are left. Each card still shows its recommended ages so the adult can judge.

1. **Safety and weather:** indoor activities are always allowed. "Either" activities are always allowed, done indoors when the weather doesn't suit them. Outdoor activities are allowed only when the day has no hazard and every caution is in the activity's `weather`.
2. **Season:** if `seasons` is set, it includes the day's season.
3. **Holiday:** an activity whose holiday tag appears in one of the day's holiday names (for example "Thanksgiving" in "Thanksgiving Day") comes first.
4. **Variety:** activities shown less often earlier in the week come first. Being a day's featured activity counts more than being one of its three ideas, so the featured activity changes every day.

**Indoor and outdoor balance** for the three ideas:
- Clear day: two outdoor ideas (outdoor or "either") lead, then one indoor.
- Caution day: two indoor ideas lead, then at most one outdoor idea that suits the conditions. Mild rain, light snow, cold and wind can still have an outdoor idea.
- Hazard day: three indoor ideas.

An "either" activity in an indoor slot is labelled "Indoor".

**Calendar:** each day card shows the first idea as its featured activity, with its photo and title. **Selected day:** shows all three ideas.

**Photos.** Each activity uses its original RootMap photo, copied into `images/activities/` as WebP at 480 and 960 pixels wide (`{id}-480.webp`, `{id}-960.webp`, quality 78) with `srcset`, `sizes`, `width`/`height` and `loading="lazy"`. The RootMap originals aren't changed. If a photo is missing or fails to load, a plain tinted tile with the title's first letter is shown, never a broken image.

### 7.6 What to wear

The selected day shows a "What to wear" panel with a short **Wear** list and an optional **Bring** list. Rules and thresholds are in one place, `WEAR_LIMITS` and `whatToWear` in `advice.js`, and use °C, km/h and the UV index whatever unit is shown.

| Condition (from the forecast) | Wear | Bring |
|---|---|---|
| Feels-like high < 0°C | Heavy winter coat; hat, mittens and scarf; warm waterproof boots | — |
| Feels-like high 0–9°C | Warm coat; hat and gloves | — |
| Feels-like high 10–17°C | Light jacket or sweater | — |
| Feels-like high 18–26°C | T-shirt and light layers | — |
| …and feels-like low < 12°C | An extra layer for the cool morning | — |
| Feels-like high ≥ 27°C | Light, loose clothes; sun hat | Water bottle |
| Rain caution or hazard (7.4), or precipitation chance ≥ 40% | Raincoat; waterproof shoes | Spare socks |
| Snow caution or heavy snow | Snow pants and waterproof boots | Spare mittens |
| Gusts ≥ 40 km/h | A windproof layer | — |
| UV index ≥ 3 | — | Sunscreen (and a sun hat, if no hat is already in Wear) |
| UV index ≥ 6 | — | Also: shade at midday |

- A missing value is never guessed. With no feels-like high, the temperature lines are left out and the panel says "The temperature forecast isn't available, so check before you dress." With no UV index, the sun lines are left out.
- On a hazard day the list starts with "Plan to stay indoors today."
- The panel always ends with: "These tips are for comfort. They don't make outdoor play safe in bad weather."

### 7.7 Why these activities?

The selected day shows a short "Why these activities?" panel: two to four sentences built by `explainDay` in `advice.js` from the same facts that picked the ideas. Fixed rules, no AI.

Sentences, in this order, using only the ones that apply:

1. **Holiday** (an idea matched a holiday): public holiday: "It's {holiday}, so {title} comes first as a {holiday}-inspired idea." Celebration (7.2): "If your family celebrates {holiday}, {title} is a {holiday}-inspired idea for today."
2. **Weather and place**, one of:
   - Clear: "It's {condition} and {high}, so {outdoor titles} get you outside, with {indoor title} as an indoor option."
   - Caution: "With {cautions} in the forecast, {indoor titles} come first" + if there is an outdoor idea: ", and {title} can work outside if you dress for it." Otherwise ".". Caution words: rain → "rain", snow → "light snow", cold → "cold air", hot → "heat", wind → "gusty wind".
   - Hazard: "With {hazard} in the forecast, outdoor play isn't a good idea today, so all three ideas are indoors." Hazard words: storm → "thunderstorms", heavyRain → "heavy rain", freezingRain → "freezing rain", heavySnow → "heavy snow", extremeHeat → "extreme heat", extremeCold → "extreme cold", dangerousWind → "strong wind".
3. **Season** (an idea has `seasons` set and isn't the holiday idea): "{title} is a seasonal pick for {season}."

The weather sentence leaves out the holiday idea, since sentence 1 already named it.

Example (Boston, Oct 31): "If your family celebrates Halloween, Washing a Pumpkin is a Halloween-inspired idea for today. It's clear and 54°, so Rolling in the Leaves and Tossing Leaves with a Stick get you outside. Rolling in the Leaves is a seasonal pick for autumn."

### 7.8 Activity details

Clicking an activity's title (in the ideas or in My week) opens its details in a `<dialog>`. Everything comes from the activity's `rootmap` record (built by `activityDetails` in `advice.js`); nothing is written for Little Days:

| Shown | From |
|---|---|
| Photo | the WebP copy (960 px), or the plain tile |
| Title | `rootmap.title` |
| Recommended ages | `rootmap.age` ("2–6 years") |
| Estimated duration | `rootmap.minutes` ("About 15 minutes") |
| Description | `rootmap.description` |
| What you'll need | `rootmap.materials` (left out when empty: "Nothing to prepare.") |
| Steps | `rootmap.steps`, numbered |
| What your child practices | `rootmap.domains` |
| Safety | `rootmap.safety`, only when present |

- An **Add to {Sat, Oct 31}** button adds it to the selected day (opened from My week: that entry's day). If it's already there, the button reads "Added ✓" and is disabled.
- Opening moves focus into the dialog (to its title). Escape and the Close button close it, and focus returns to the button that opened it. While open, the page behind can't be reached with the keyboard (`showModal`).

### 7.9 My week

My week holds two kinds of entries: **place visits** and **at-home activities** (RootMap).

- **Add a place** from its details (7.16): date (`<input type="date">`, today or later), optional time, optional exploration theme (up to 80 characters), optional preparation notes (up to 500). "Add to My Week" saves it. The same place can be added to the same date only once.
- **Add an activity** with "Add to my week", as before (7.5, 7.8). The same activity can't be added twice to the same date ("Added ✓", disabled).
- My week lists the seven forecast days plus any later saved dates. Each date shows its entries with a "Remove" button. Days with nothing say "Nothing planned".
- **Weather for a date:** when the date is in `daily.time`, its row shows the icon, condition, high/low and "Rain {n}%", plus any hazard or caution word from 7.4. Otherwise it says "Forecast not available yet for this date." Nothing is estimated for dates outside the forecast.
- A place entry shows the place's name (a button that opens its details), time and theme, notes, and **Edit** and **Remove**. Edit turns the entry into a small form (date, time, theme, notes) with "Save changes" and "Cancel"; moving it to a date where the same place is already planned is refused. Names come from Google this visit (7.17), fetched only once My week is on screen; if that fails it shows "Saved place (details unavailable right now)". When a place entry is listed, My week shows the Google Maps text attribution (9.4).
- **Planning a visit never marks the place explored.** Only recording a visit does (7.17).
- Before any search, or if the weather fails, My week still lists saved dates from today on, without weather.

Saved in `localStorage` under `littleDays.plan.v2`. Activities stay exactly as in v1 (their RootMap ID as a string), and place visits are objects beside them:

```js
{
  "2026-11-07": [
    "bark-rubbing",
    { kind: "place", entry: "v1k2x9ab", placeId: "ChIJ...", category: "nature", time: "10:00", theme: "Things with wheels", notes: "Bring the clipboard" }
  ]
}
```

- `entry` is the planned visit's own ID (for Edit and Remove). `category` is the Little Days category. `time` is `"HH:MM"` or `""`; `theme` (80) and `notes` (500) are the adult's own text, or `""`.
- **Migration:** a v1 plan is already a valid v2 plan, so if `littleDays.plan.v2` doesn't exist, `littleDays.plan.v1` is read as it is, saved as v2, and v1 is removed. Nothing in v1 is lost.
- When the page loads, dates before today, unknown activity IDs and malformed entries are dropped. Place IDs can't be checked offline, so they're kept until removed.
- Code: `plan.js` (pure functions; storage is passed in so tests can use a fake).

### 7.10 Place discovery

**Categories.** Google doesn't have Little Days' categories, so each one is a list of Google place types. **The types below have not been checked yet**: Phase 3 runs each category's search once and removes any type the API rejects, then updates this table.

| Category | Google place types (`includedTypes`) |
|---|---|
| Nature | `park`, `botanical_garden`, `garden`, `hiking_area` |
| Everyday Life | `bakery`, `grocery_store`, `supermarket`, `market`, `florist`, `hardware_store`, `book_store` |
| Community Helpers | `fire_station`, `police`, `post_office`, `city_hall` |
| Art & Culture | `library`, `museum`, `art_gallery`, `performing_arts_theater`, `cultural_center` |
| Animals & Wildlife | `zoo`, `aquarium`, `farm`, `pet_store`, `dog_park`, `wildlife_park` |
| Movement | `playground`, `athletic_field`, `sports_complex` |

The category shown on a card comes from this table (the search that found it), so it is a **Little Days label**, not Google's.

**Search.** Only when "Find Little Adventures" is pressed (7.1). A category means one `Place.searchNearby`; **All** means one per category not loaded yet, all at once. Each search:

- `locationRestriction`: a circle around the search location with radius = walking minutes × 80 m (5 → 400 m, 10 → 800 m, 15 → 1200 m, 20 → 1600 m, 30 → 2400 m). 80 m a minute is an adult's walking pace. This only sets the search area; walking times come from routes (7.12).
- `includedTypes`: the category's types. `maxResultCount`: 10. `rankPreference`: distance.
- `fields`: only those in 7.2.

No place details are fetched for search results: the search fields are enough for cards.

**Reusing results.** Results and walking times for a category are kept **in page memory only, for this visit** (never in `localStorage`), keyed by category. Choosing a category that's already loaded shows it again with no request; All loads only what's missing. Changing the location or the walking time empties this memory. A reload starts over. (Phase 5 reviews this against Google's terms; showing results again within one visit is ordinary display, not storage.)

**Shortlist.** To keep route requests small:

1. Merge the shown categories' results by `id` (7.3) and drop any without a `location`.
2. Order by straight-line distance from the search location. This distance is used only for choosing the shortlist; it is never shown as a walking time.
3. One category: up to 10 places (all its results). All: up to 2 of the closest from each category, then fill with the closest of the rest, up to **12 places**.

Only these are shown. Walking times are calculated for at most **5** of them at first (7.12). Code for steps 1–3 and the category table lives in `explore.js` (no page code, tested in Node).

### 7.11 Access and setting

Google doesn't say who may visit a place, and a place type is never proof of public access. Access information comes in three kinds, always shown apart:

| Kind | Source | Shown as |
|---|---|---|
| **Verified** | A source that states access for that specific place. **Version 1 has none**, so no place shows verified access. The kind exists so a future source can't be confused with estimates. | "Verified: {what the source says} ({source})" |
| **Little Days estimate** | The place's `primaryType` (falling back to the category), using the table below | The estimate, labelled "Little Days estimate", **always followed by** "Access not verified." |
| **Unknown** | Everything else | "Access not verified." |

| Estimate | Types | Shown as |
|---|---|---|
| Park or outdoor space | `park`, `playground`, `dog_park`, `hiking_area`, `athletic_field` | "Park or outdoor space (Little Days estimate). Access not verified. Check posted rules." |
| Public-service building | `library`, `post_office`, `city_hall`, `fire_station`, `police` | "Public-service building (Little Days estimate). Access not verified. Contact before a classroom visit." |
| Business | `bakery`, `grocery_store`, `supermarket`, `market`, `florist`, `hardware_store`, `book_store`, `pet_store` | "Business (Little Days estimate). Access not verified. Contact before a classroom visit." |
| — | everything else | "Access not verified." |

The page never says a place is public, open to visitors, or accepts organized or classroom visits.

| Setting | Types |
|---|---|
| Outdoors | `park`, `playground`, `dog_park`, `hiking_area`, `athletic_field`, `garden`, `botanical_garden`, `farm`, `zoo`, `wildlife_park` |
| Indoors | everything else |

Never shown: opening hours, prices, "free", entry rules, accessibility, or whether a place welcomes children or classes. Each card and detail instead has **"Check hours and details on Google Maps"**, a plain link to `https://www.google.com/maps/search/?api=1&query={name}&query_place_id={id}`.

### 7.12 Walking time

**Shortlist times.** After the shortlist is ready, one `RouteMatrix.computeRouteMatrix` with the search location as the only origin, walking travel mode, and as destinations **the 5 closest shortlisted places that don't have a walking time yet** (closest by straight line). Every other place shows **"Walking time not checked yet"** and a **"Check walking time"** button, which sends one route-matrix request for that place only. Opening a place's details also calculates its route (below), which gives its walking time too. Walking times are kept in page memory for the visit, per place and starting point.

- A destination whose element has a duration (and a condition saying a route exists) shows **"{n} min walk · {distance}"**, with minutes rounded up and the label "Google walking estimate".
- Anything else shows **"Walking time unavailable"**. Its straight-line distance may be shown as "About {d} away in a straight line", never as a time.
- While the request runs, cards show "Checking walking time…".

**Walking-time filter.** A place with a walking time over the chosen limit is hidden, and a line says "{n} places are more than a {limit}-minute walk." Places with no walking time aren't hidden (Little Days can't tell), but are listed after the others under "Walking time unavailable".

**Detail route.** Opening a place calls `Route.computeRoutes` once (walking, from the search location) and draws the route on the detail map. The result is kept in memory for this visit only. Any `warnings` Google returns are shown word for word under "From Google:". If the route fails: "Walking route unavailable." and no line is drawn.

**Always shown with a route** (detail): "A Google walking route isn't a check that the way suits young children. Before you go, look for busy road crossings, water, construction, closed or restricted areas, and the weather, and plan enough adults to supervise." Classroom mode adds: "Walk the route yourself before taking a group."

The search location is the address or device position at the time of the search. Without one (for example a saved place opened before any search), walking time says "Search from an address to see the walking time."

### 7.13 Family, Classroom and ages

Both modes show the same places. Mode and ages only change the notes, all labelled as Little Days notes:

**Classroom mode**
- Under the walking-time choice, above the place list, and in place details: "Google walking estimates may not reflect the time needed when accompanying young children. Check crossings and the route before visiting."
- On every place, whatever its access estimate: "Contact before a classroom visit." (if the access line doesn't already say it). Little Days never knows whether a place accepts organized visits.
- The extra route line in 7.12.

**Age notes** (one per card and in details):

| Ages | Note |
|---|---|
| Under 2 | "Google doesn't say whether a route suits strollers. Look out for curbs, steps and missing sidewalks." |
| 2–3 | "Hold hands near roads, parking lots and water." |
| 4–6 | "Agree on where to stop and wait before each crossing." |
| Mixed 2–6 | both the 2–3 and 4–6 notes |

Ages also filter at-home ideas (7.5): an activity is offered when its `minAge`–`maxAge` overlaps the chosen range. "Under 2" has none (8.1).

### 7.14 Exploration guides

`guides.js` holds short, hand-written guides: one per common place type (`park`, `playground`, `garden`/`botanical_garden`, `library`, `bakery`, grocery types, `post_office`, `fire_station`, `museum`/`art_gallery`), and one per category as the fallback for every other type. They're **written for Little Days and reviewed by hand** before they ship, and labelled "Little Days idea" on the page. They're about the kind of place, never the specific place: no claims about what a place has, offers, or allows.

```js
nature: {
  why: "One sentence: why this kind of place is worth exploring with young children.",
  sets: [                      // at least two, so revisits get new prompts
    {
      notice:   ["...", "...", "..."],   // What children might notice (3)
      before:   ["...", "..."],          // Before you go (up to 2)
      during:   ["...", "...", "..."],   // During the visit (up to 3)
      after:    ["...", "..."],          // After the visit (up to 2)
      practical: "..."                   // One Practical Life or other extension
    }
  ],
  activities: ["bark-rubbing", "..."]    // RootMap IDs offered as at-home ideas after the visit
}
```

- Prompts invite observation, language, movement, the senses, independence and child-led discovery, in plain words with no academic terms. Each one is a short sentence, worded as an invitation ("if your child is interested", "wonder together"), never a task to complete. Every guide starts with: "Ideas, not tasks: follow what your child notices, and stop when they've had enough."
- **Perspectives:** each guide has three sets, one per visit, each with its own focus (for a bakery: shapes and colors, then smells and ingredients, then people and their jobs). Place details show them as three tabs, "First visit", "Second visit", "Third visit", with the first chosen. From Phase 4 the starting tab is the number of recorded visits to that place (7.17) modulo three, so each visit brings the next perspective.
- The card shows one "notice" line as its exploration idea. The detail shows the full set.
- `activities` are hand-picked RootMap IDs. In the detail they appear under "At home afterwards", filtered by weather and age (7.5), and open the activity details (7.8).

### 7.15 Weather-aware discovery

Places use the same weather rules as 7.4, for the **selected day**. The thresholds stay in one place (`recommend.js`, `WEAR_LIMITS` in `advice.js`), so they can be changed in one spot.

| Day | Outdoor places | Indoor places | Order |
|---|---|---|---|
| Hazard | The hazard warning, then "Outdoor places are better left for another day." | "For the walk there:" + the hazard warning | Indoor places first |
| Caution | The caution warnings | "For the walk there:" + the caution warnings | Unchanged |
| Clear | "The forecast looks good for time outdoors." | nothing | Unchanged |

- **Today only:** if any of the next three hours has `precipitation_probability` ≥ 50%, outdoor places also show "Rain is likely in the next few hours ({n}%)."
- **No weather** (it failed to load): every card says "Weather unavailable. Check the forecast before you go."
- Above the list, every time: "These notes use the forecast for the whole area and fixed temperature levels. They're a starting point, not a safety check. Use your own judgement and your setting's rules."
- The page never says a place or a walk is "safe".

**Weather panel** (above the seven-day strip):
- **Now:** icon, condition, temperature, "feels like {x}", wind and gusts, and "{x} rain in the last 15 minutes" when `current.precipitation` > 0.
- **Next hours:** six columns from the current hour: hour ("6 PM"), icon, temperature, "Rain {n}%".
- Then the seven-day strip (8.5).

### 7.16 Place cards, map and details

**Verified and Little Days content look different.** Facts from Google and Open-Meteo are shown plainly. Everything Little Days adds (category, access and setting estimates, weather notes, age notes, guides) sits under a small "Little Days notes" label in the card, and under "Little Days ideas" in the detail.

**Place card** (`<article>` in a list):
- Name (`displayName`) and address (`formattedAddress`), from Google
- Walking time and distance, or "Walking time unavailable" (7.12)
- Category, access and setting (7.10–7.11)
- Weather note (7.15) and age note (7.13)
- One exploration idea (7.14)
- Status: a "Save" button (sets "Want to explore"), or the current status as a tag
- The name is a button that opens the details

**Map:** a Google map with one marker for the search location ("Start") and one numbered marker per place in the filtered list, numbered like the list. Choosing a marker selects it and shows a preview. The map keeps Google's logo and attributions visible. **Markers are reused:** a redraw (units, day, filters, walking times arriving) only adds markers for new places, removes those no longer listed, and updates a changed number; the map is refit only when the set of places changes.

**Detail map:** one Google map inside the details dialog, created the first time a place is opened and reused for every place after: it moves to the new place, replaces the place marker, clears the old route line and draws the new one. Routes are kept in page memory per starting point and place, so reopening a place doesn't ask Google again.

**Layout:** on desktop (720px and up) the list and map sit side by side. On phones a **List / Map** switch (two radio buttons) shows one at a time, List first. Details are specified in DESIGN.md.

**Interest tabs** (top of Explore, after the first search): the seven interests again, with the searched one chosen. Choosing one shows it from memory if it's loaded (7.10); otherwise it does nothing until "Find Little Adventures" (repeated next to the tabs) is pressed. Loaded interests carry a "✓".

**Filters** (above the list, applied on the page with no new request):
- Setting: All / Indoors / Outdoors
- Explored: All / Not explored yet / Explored (from 7.17)

The walking-time limit is the 7.1 input (7.12). There's no age filter on places: ages change the notes, not which places appear. There's no free/paid filter (7.11). "Clear filters" resets both.

**Place details** (`<dialog>`, a bottom sheet on phones), in this order:
1. Name, address, category
2. A map with the walking route (7.12), walking time and distance, Google's warnings, the route reminder
3. Weather for the selected day and the weather note (7.15)
4. Access and setting (7.11), age note (7.13), and the Google Maps link
5. Little Days ideas: Why explore this place?, What children might notice, Before you go, During the visit, After the visit, Practical Life, At home afterwards (7.14)
6. Buttons: Save / Mark as explored / Revisit (7.17)
7. Add to My Week: date, time, theme, notes, and the button (7.9)
8. Close

Focus behaves as in 7.8: it moves into the dialog on open, Escape and Close close it, and focus returns to what opened it.

### 7.17 My Places and the exploration journal

Saved in `localStorage` under `littleDays.places.v2`, keyed by Google place ID:

```js
{
  "ChIJ...": {
    status: "explored",            // "want", "explored" or "revisit"
    category: "nature",            // the Little Days category it was found under
    saved: "2026-11-02",           // when it was first saved
    visits: [                      // the journal, oldest first
      { date: "2026-11-04", observation: "Children noticed different leaf shapes.", next: "Look for changes in the trees." }
    ],
    note: ""                       // only a note carried over from v1
  }
}
```

**Journal.** Each recorded visit is one entry: the place ID (the key), the visit date, an optional observation (500) and an optional idea for next time (200). It's a simple record for the adult, not an assessment: no children's names, photos or profiles. Entries are added, never overwritten, so a place can have many visits.

**Actions** (in place details, under "Your visits"):
- **Want to explore** (toggle) → status `want`. "Save" on a card does the same.
- **Visit again** (toggle) → status `revisit`. Visits stay.
- **Record a visit** form: date (today or earlier), "What did you notice?" (optional), "An idea for next time" (optional), hint "Saved only in this browser. Please don't write children's names.", and **Mark as explored**, which adds a journal entry and sets status `explored`.
- **Remove from My Places**, after `confirm()`: deletes the entry and its journal.
- The journal shows under the buttons, newest first.

**Revisits.** The number of journal entries chooses the guide's first perspective (7.14): no visits → First visit, one → Second visit, and so on, repeating after three. Details then say "You've recorded {n} visits, so a new perspective comes first." On a card, an explored place keeps showing in results with its status tag ("Explored · 2 visits") and its idea line reads "Next visit: …" from that next perspective. A place counts as explored for the Explored filter when it has at least one visit.

**My Places section:** the Google Maps text attribution under the heading (9.4), three tabs with counts ("Want to explore (3)", "Explored (5)", "Revisit (1)"), then cards: name and address, "Last explored {date} · {n} visits" or "Saved {date}", the latest "Next time" idea, "Exploration history ({n})" (a `<details>` with the journal), **Open** (details) and **Remove**. Empty tabs say "No places here yet. Save places from Explore to plan your next walk.", "No explored places yet. Record a visit from a place's details after you go." or "Places you'd like to visit again, with fresh ideas, appear here."

**Names and addresses aren't stored.** Google's terms allow keeping place IDs, not place content. Places in the current results are already known. For the rest, the page fetches their fields (7.2) with `fetchFields` **only once My Places (or My week) is on screen**, once per place per visit, at most 50. A place that fails shows "Place details unavailable right now" and keeps its status and journal; its Open button is disabled. A saved place opened without a search uses the chosen address as the route's starting point, or says "Choose a starting point at the top of the page to see the walking route."

**Migration:** if `littleDays.places.v2` doesn't exist, `littleDays.places.v1` is read: each visit date becomes a journal entry with empty texts, a v1 note is kept as `note` (shown under the journal if not empty), saved as v2, and v1 is removed.

### 7.18 Saved data and privacy

Everything is stored in `localStorage` on this device, and every read and write is wrapped in `try/catch`:

| Key | Holds |
|---|---|
| `littleDays.settings.v2` | `{ unit, mode, ages, minutes, interest, location }`: `unit` `"F"`/`"C"`; `mode` `"family"`/`"classroom"`; `ages` `"under-2"`/`"2-3"`/`"4-6"`/`"2-6"`; `minutes` 5/10/15/20/30; `interest` a category key, `"all"`, or `null`; `location` `{ kind: "place", placeId }`, `{ kind: "city", name }` or `null`. |
| `littleDays.places.v2` | My Places and the journal (7.17) |
| `littleDays.plan.v2` | My week (7.9) |

- **Location.** Saved once its weather has loaded: a picked Google address as its place ID, or a fallback city as the name that was searched. On a return visit the page restores it, fetches its location again (one Google place-details request, or one Open-Meteo geocoding request), and **refreshes the weather only**. It never starts a place search (8.1). Device location and the example address are **never saved**. Device coordinates are kept in memory for this visit only.
- **Settings migration:** if `littleDays.settings.v2` doesn't exist, `littleDays.settings.v1` is read: its `unit` is kept and its `city` becomes `{ kind: "city", name: city }`, so a returning visitor still gets their weather. The rest takes the defaults (7.1). The result is saved as v2 and v1 is removed.
- **What goes where:** Google gets the address text typed into Autocomplete and the search location (for nearby search and routes). Open-Meteo gets latitude and longitude **rounded to 2 decimals** (about 1 km), which is plenty for a forecast, and in the fallback the city name typed. Nager.Date gets the country code and year. The age range, mode, notes, themes and My Places never leave the device.
- No analytics, no cookies set by Little Days, no backend.
- **Export my data:** a button in "Your data" that downloads `little-days-data-YYYY-MM-DD.json`: `{ format: "little-days-data", version: 1, exported, settings, places, plan }`, exactly what Little Days stores (settings, My Places with the journal, My week). It never contains an API key (none is stored) or Google place details (only place IDs). The page then says "Your data was saved to a file. It contains your journal, so keep it somewhere private."
- **Import my data:** a button that opens a file picker. **Importing replaces** what's saved in this browser; it doesn't merge (the page says so next to the buttons). The file is checked first (under 1 MB, valid JSON, `format` and `version` match, all three parts present), then every part goes through the same cleaning as stored data, and only safe IDs are accepted as keys (no `__proto__`, `constructor` and so on). A file that fails says why and "Your saved data hasn't changed." A valid one asks `confirm("Replace everything Little Days has saved in this browser with this backup ({n} places)? This can't be undone.")`. If storage refuses a write (full or blocked), what was there before is put back and the page says "The backup couldn't be saved in this browser (storage may be full or blocked). Your saved data hasn't changed." After a successful import the page reloads.
- **Delete my saved data:** a button set apart on its own line in "Your data". After `confirm("Delete your saved places, journal entries, plan and choices from this browser? This can't be undone.")` it removes every `littleDays.*` key, old versions included, and reloads the page.
- **Your data** in the footer, as a short list: saved places, journal entries, plan and choices are stored only in this browser, with no accounts or sync; location permission is optional and asked only for "Use my location", and the device's position is never stored; place details, maps and walking routes come from Google Maps, and Little Days keeps only Google's place IDs; weather comes from Open-Meteo and holidays from Nager.Date; please don't write children's names in notes or journal entries.

## 8. Page states

There are three status areas, each `role="status"` and `aria-live="polite"`, showing one message at a time:

- **Location status**, under the location controls: location problems (refused, unavailable, saved address can't load, city not found).
- **Weather status**, at the top of the Weather section: weather loading and errors.
- **Explore status**, under the "Explore" heading: Google setup, place loading and place errors.

Field messages sit under their field (8.4).

Each part fails on its own: weather, holidays, nearby search and walking times are separate requests, and one failing never hides another's results. **A failed request never shows old or made-up data**: weather from an earlier location is removed when a new location is chosen, and places from an earlier search are removed when a new search starts.

"My Places" and "My week" are never hidden or cleared by any of these states.

### 8.1 Empty

**First visit.**
- No location. The switch shows °F, mode Family, ages Mixed 2–6, walking 15 min, no interest chosen.
- Location status: "Enter an address or use your location to see the weather and find places to explore nearby." (In the fallback: "Enter your city or use your location to see the weather.")
- The compact weather line and the Weather section are hidden.
- Explore status: "Choose a location and what you'd like to explore, then press Find Little Adventures." (or a setup message, 8.3)
- My Places: "No saved places yet. Save places from your search to find them here." My week: "Your week is empty." (or saved dates, 7.9).

**Returning visit.** Saved choices are restored. If a location is saved, its location is fetched again and the weather loads (8.2). **No place search starts.** Explore status: "Press Find Little Adventures to see places near {location}." If no interest is saved, it asks to choose one first, as on a first visit.
- A saved Google address that can't be loaded (Google unavailable or the request fails): location status "We couldn't load your saved address. Enter it again." The saved place ID is kept.
- A saved city the geocoder no longer finds: the not-found message below. The saved city is kept.

**City not found** (fallback): the geocoder answered with no `results`. Location status: "We couldn't find "{what they typed}". Check the spelling, or add the state or country, like "Portland, Maine"." The weather from an earlier location is removed, the field keeps its text and gets focus, and the saved location isn't replaced.

**No places found.** The searches answered with nothing: "We didn't find {interest} places within about a {n}-minute walk. Try a longer walk or another interest."

**Everything filtered out.** "No places match these filters." and a secondary "Clear filters" button.

**Under 2 and at-home ideas.** "Little Days doesn't have at-home ideas for children under 2 yet."

**A day has no matching activity** and **empty plan day**: unchanged ("No ideas for this day yet.", "Nothing planned").

### 8.2 Loading

**Device location.** While the browser is asked: the button is disabled and says "Finding you…". Nothing else changes.

**Weather.** Starts as soon as a location is chosen (picked address, fallback city, device location, example, or a restored saved location).
- The previous location's weather is removed.
- Compact weather line: "Getting the weather…" in `--ink-soft`. Weather status: "Getting the weather for {location}…"
- The fallback's "Show weather" button is disabled and says "Searching…" while the city is geocoded and its weather loads.
- Weather and holidays load together. When the forecast arrives the Weather section fills in (8.5); holidays never hold it up.

**Places.** Starts only with "Find Little Adventures".
- The button is disabled and says "Searching…".
- Explore status: "Finding little adventures near {location}…" ({location} is the address, "your location", or the example address).
- Results and markers from an earlier search are removed (but loaded categories stay in memory, 7.10).
- The list appears when the searches finish. Walking times then show "Checking walking time…" until the route matrix returns.

Changing units, mode, ages, the selected day or filters never starts Loading or makes a request.

### 8.3 Error

Details always go to `console.error`. The adult never sees raw error text. Errors are never shown in red.

| What failed | What the adult sees | What still works |
|---|---|---|
| **No Google key configured** (`config.js` missing, or its key is empty) | Explore status: "Maps and places aren't set up on this copy of Little Days yet." The fallback city field replaces the address field. No example button. | Weather by city or device location, the seven-day strip, at-home ideas, My week (place names show as unavailable) |
| **Google refuses the key or fails to load** (wrong key, address not allowed, API not enabled, billing off, network: `gm_authFailure`, the script's `error` event, `gmp-error`, or a rejected library call) | Explore status: "Google Maps isn't available right now, so places and walking times can't be shown." The fallback city field replaces the address field. Any Google location already chosen keeps its weather. | Same as above |
| **Nearby search fails** (network, quota, other) | Explore status: "We couldn't load nearby places right now. Check your connection and try again." + **Try again** (repeats the search) | Weather |
| **Walking times fail** (the matrix rejects) | Every card: "Walking time unavailable". One note above the list: "Walking times couldn't be checked right now, so the walking-time filter is off." | Places, map, weather |
| **Detail route fails** | "Walking route unavailable." in the detail | Everything else in the detail |
| **Weather fails** (`fetch` throws or `response.ok` is false) | Weather status: "We couldn't load the weather right now. Check your internet connection and try again." + **Try again** (repeats the weather request for the same location). The compact line says "Weather unavailable right now." Cards: "Weather unavailable. Check the forecast before you go." | Places, walking times, My week without weather |
| **City geocoding fails** (fallback; `fetch` throws or not ok) | The weather error above | Everything else |
| **City suggestions fail** (fallback) | Nothing; no list appears | "Show weather" still works |
| **Holidays fail** | "Public holidays couldn't be loaded, so they aren't shown." under the strip | Everything; celebrations still show |
| **Holidays unsupported** (204/404) | "Nager.Date doesn't list public holidays for this country, so none are shown." | Everything |
| **No country** (device location) | "Holidays show when you search an address or city." under the strip | Everything |
| **Saved place details fail** | "Place details unavailable right now" on that row | Status, notes, Remove |
| **Location refused** (`code` 1) | Location status: "Location access is off, so type an address instead." (fallback: "…type a city instead."). The address or city field gets focus. | Everything |
| **Location unavailable or timed out** (`code` 2 or 3), or no Geolocation support | Location status: "We couldn't find your location. Type an address instead." (fallback: "…type a city instead.") | Everything |
| **localStorage blocked** | Nothing shown; nothing is saved this visit | Everything |
| **Offline** | Each part shows its own message above | My Places statuses and My week from storage |

How to test: DevTools → Network → **Offline**, then choose a location (weather error) or search (places error). Block `maps.googleapis.com` to test the Google fallback while weather works. Block `api.open-meteo.com` for the weather error alone, and `date.nager.at` for holidays. Deny the location prompt, or use DevTools → Sensors → Location → "Location unavailable", for the location errors. Rename `config.js` for the missing-key state.

### 8.4 Invalid input

Refused before any request. The message sits directly under its field, in `--ink`, starting with "⚠︎ ". The field gets `aria-invalid="true"` and `aria-describedby`, and keeps focus. The message clears when the input changes. The status areas don't change.

| Input | Rule | Message |
|---|---|---|
| No location | "Find Little Adventures" with no location chosen | "Enter an address or use your location first." (under the address field) |
| Address typed but not picked | Text in the field that doesn't match the last picked suggestion | "Pick an address from the suggestions." |
| City empty (fallback) | trim, then length 0 | "Type a city name first." |
| City 1 character (fallback) | trim, then length < 2 | "Type at least 2 letters." |
| No interest | "Find Little Adventures" with no interest chosen | "Choose what you'd like to explore." (under the interests) |
| My week date | Empty or before today | "Choose today or a later date." |

Theme and notes can't be too long (`maxlength`). Walking time, mode, ages and units only offer fixed choices.

### 8.5 In use

From top to bottom (DESIGN.md sets the look):

1. **Header** with the name and links to Explore, Weather, My Places and My week (a bottom bar on phones).
2. **Home:** "Your neighborhood is full of little discoveries." and "Find meaningful places to explore with young children, right outside your door." Then the controls card (7.1), with the **compact weather line** next to the location controls once a location is chosen: "☀️ Now 64° · feels like 61° · Rain 10% · Wind 9 mph", and today's first weather warning if there is one.
3. **Explore:** status area, interest tabs, the weather limitation line, filters, then the list and map (7.16).
4. **Weather** (7.15): one line naming the place and dates ("221 Washington St, Newton, MA 02458, USA · Wed Nov 4 – Tue Nov 10"), Now, Next hours, and the seven-day strip. Day cards are unchanged from the earlier version: day and date, icon, condition, high/low, "Rain {n}%", holiday and celebration tags, "Indoor day" on a hazard day, and the featured at-home activity. Today is selected. Under the strip: the selected day's weather warnings and forecast reminder (7.4) and What to wear (7.6).
5. **Ideas for {day}** (optional at-home ideas): three at-home ideas (7.5) and Why these activities? (7.7).
6. **My Places** (7.17).
7. **My week** (7.9).
8. **Footer:** attributions (Google's attribution is shown by the map itself and by the logo in My Places; the footer says "Weather by Open-Meteo · Holidays by Nager.Date · Activities from RootMap"), the privacy note and "Delete my saved data" (7.18).

Changing the unit updates every temperature, wind, rain amount and distance right away. Selecting a day updates the weather notes on places, the warnings, What to wear and the Ideas section, with no request.

## 9. Technical constraints and setup

### 9.1 Constraints

- Static site: HTML, CSS and plain JavaScript on GitHub Pages. No framework, no build step, no bundler, no backend.
- The only script loaded from outside is Google's Maps JavaScript API bootstrap. The Maps API then loads its own code and makes its own requests to Google; that's expected.
- `fetch` is used only for Open-Meteo and Nager.Date.
- `package.json` exists only for the Playwright dev dependency (10.2). The site never loads anything from `node_modules`.
- Works in the current Chrome, Safari and Firefox, on phones and desktops.

### 9.2 Google Cloud setup

Project: `little-days-513800`. Done already: billing, the three APIs, and the dev key (`little-days-dev`, websites `http://localhost:8472/*`, the three APIs).

1. **Enable exactly three APIs:** Maps JavaScript API, Places API (New), Routes API. Not the legacy "Places API", "Directions API" or "Distance Matrix API".
2. **Map ID** (needed in production for the numbered markers): Google Maps Platform → Map management → Create map ID → type **JavaScript**, **Vector**. Name it `little-days-prod`. Its ID goes into the `GOOGLE_MAPS_MAP_ID` secret (9.5). `DEMO_MAP_ID` is for local development only.
3. **Production key checklist** (`little-days-prod`, a separate key from the dev key):
   - [ ] Application restriction **Websites**: `https://vegalh.github.io/little-days/*` only. No localhost, no `*.github.io`.
   - [ ] API restriction: **only** Maps JavaScript API, Places API (New), Routes API.
   - [ ] The dev key keeps only `http://localhost:8472/*` (and `http://localhost:8000/*` if you use that port).
   - [ ] **Regenerate the dev key** (it was pasted into a chat on 2026-11-04) and paste the new one into the local `config.js`.
   - [ ] The production key is stored only as a GitHub repository secret, never in a file or message.
   - [ ] Quotas and budget alerts below are set before the first deployment.
4. **Quotas** (APIs & Services → each API → Quotas & system limits → per day). For a pilot of up to about 50 explorations a day:

   | API | Method | Daily cap |
   |---|---|---|
   | Maps JavaScript API | map loads | 300 |
   | Places API (New) | Autocomplete | 3,000 (Google's widget sends a request per typed character) |
   | Places API (New) | GetPlace (place details) | 500 |
   | Places API (New) | SearchNearby | 400 |
   | Places API (New) | SearchText (example address) | 100 |
   | Routes API | ComputeRouteMatrix | 300 (each up to 5 elements, plus 1 per "Check walking time") |
   | Routes API | ComputeRoutes | 500 |

   Raise them only after looking at real use in Metrics. When a cap is hit, the page shows its error states (8.3) rather than charging more.
5. **Budget** (Billing → Budgets & alerts): a monthly budget of **$25** for the project with email alerts at **25%, 50%, 90% and 100%**. Alerts don't stop spending; the quotas do.
6. **Local config:** `cp config.example.js config.js`, then put the dev key in `googleMapsKey`. `config.js` is in `.gitignore`.

### 9.3 Cost

Google bills per request, by SKU, and the **fields requested set the SKU** (for example, asking `searchNearby` for opening hours or ratings moves it to a higher tier). Prices and free monthly usage change, so check Google's current pricing page and the billing report rather than this file.

Requests Little Days makes (checked live on 2026-11-04, PRD 7.2):

| When | Requests |
|---|---|
| Page load | The Maps API script only. No map is created until a search, so no map load is billed. |
| Typing an address | Autocomplete requests: Google's widget sends one per typed character (39 for the full demo address, live). Little Days can't change this. They form one session that ends with the place-details request below. |
| Picking an address | 1 place-details request |
| Example address | 1 text search, once per visit |
| One search (one interest) | 1 map load (the first search of the visit only; later searches reuse the map) + 1 nearby search + 1 route matrix (up to 5 elements) |
| One search (All) | up to 6 nearby searches (only the categories not loaded yet) + 1 route matrix (up to 5 elements) |
| "Check walking time" on another place | 1 route matrix with 1 element |
| Showing an interest again in the same visit | Nothing (kept in page memory, 7.10) |
| A return visit | 1 place-details request to restore a saved address. No search. Weather and holidays are free. |
| Opening a place | 1 compute-routes request the first time per place and starting point (reused after that), and 1 map load the first time only: the one detail map is reused for every place |
| Saved places not in the results | 1 place-details request each, only once My Places or My week is on screen (max 50 per visit) |
| Changing units, mode, ages, the day or filters | Nothing: the list redraws and existing markers are reused (live-checked) |

**A typical exploration** (type and pick an address, search one interest, open two places, one saved place in My Places): 1 Autocomplete session (~20–40 requests), 2 place details, 1 nearby search, 1 route matrix (5 elements), 2 compute-routes, 2 map loads.

**Billable operations to watch:** map loads (Dynamic Maps), Autocomplete, Place Details, Nearby Search (the fields asked for put it in the Pro tier: `displayName` is a Pro field), Text Search, Compute Route Matrix (billed per element), Compute Routes.

### 9.4 Google Maps Platform rules

- Places and routes are shown on or next to a Google map, with Google's logo and attributions left visible. Wherever Google place content is shown **without a visible Google map** (the place list in the phone List view, My Places, My week), the same container shows Google's **text attribution** "Google Maps", as Google's policy allows: spelled exactly, on one line, `translate="no"`, `font-family: Roboto, var(--font-body)` (Google says loading Roboto is optional and a sans-serif fallback is fine, so no font is loaded), weight 400, 12–16 px, color `#5E5E5E` (4.5:1 on our backgrounds). No logo file is needed.
- **Third-party attributions:** Google's policy requires showing a place's `attributions` when Google returns them. Little Days doesn't request that field yet, so none are received or shown. Before a wider launch, decide whether to request it (check its billing tier) and show it with each place (13).
- **Storage:** only Google place IDs are stored (Google allows keeping them indefinitely). Names, addresses, coordinates, walking times and routes from Google are kept in page memory for the visit and fetched again next time; exports contain only place IDs (7.18).
- Google content is never changed or shown as Little Days' own.

### 9.5 Deployment

**Workflow:** `.github/workflows/pages.yml`. It runs **only when started by hand** (Actions → "Deploy to GitHub Pages" → Run workflow), never on push. It checks out the code, runs `node --test`, copies only the site files (`index.html`, `style.css`, the `.js` files and `images/`) into `_site`, writes `_site/config.js` from two repository secrets, and publishes `_site` with GitHub's Pages actions. There's no build step. `node_modules`, `tests`, `tools`, `design`, the docs and the package files aren't published.

**Repository secrets** (Settings → Secrets and variables → Actions → New repository secret):

| Secret | Value |
|---|---|
| `GOOGLE_MAPS_BROWSER_KEY` | the **production** browser key (9.2) |
| `GOOGLE_MAPS_MAP_ID` | the production JavaScript map ID (9.2) |

The workflow stops with a message if either is missing. The key ends up in the published `config.js`, as a browser key always does; the website and API restrictions are what protect it.

**First deployment:**
1. Finish the 9.2 checklist (map ID, production key, quotas, budget).
2. Add the two secrets.
3. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
4. Commit and push `main` (including the workflow) when you're ready.
5. Actions → "Deploy to GitHub Pages" → Run workflow on `main`. Watch it finish.
6. Open `https://vegalh.github.io/little-days/` and run tests/LIVE-CHECK.md checks 1–3, 16–18 and 21 with the production key. Check 12 (a different address is refused) confirms the restriction.

**Updating:** push to `main`, then run the workflow again.

**Rollback:**
- To go back to an earlier version: Actions → "Deploy to GitHub Pages" → open the last good run → **Re-run all jobs**. It redeploys that run's commit. Or `git revert` the bad commit, push, and run the workflow.
- To take Google features offline at once (for example a key problem or unexpected cost): in Google Cloud, remove the website from the production key's restrictions or disable the key. The site keeps working in its weather-only fallback (8.3).
- To take the whole site down: Settings → Pages → **Unpublish site**.
- If the production key leaks beyond its restrictions: regenerate it in Google Cloud, update the secret, and run the workflow.

## 10. Testing

### 10.1 Logic tests (`node --test`)

Every logic file has Node tests, using fakes for storage. Run after any change to a logic file or `activities.js`. The existing 48 tests keep passing. New tests cover at least:

- Category table, search radius per walking time, merging and the 12-place shortlist (`explore.js`)
- Access and setting estimates (`explore.js`)
- Walking-time filter, including places with no time (`explore.js`)
- Weather notes for indoor and outdoor places on hazard, caution and clear days, and the next-hours rain note (`recommend.js`)
- Unit conversions for rain and distance (`advice.js`)
- My Places: save, mark explored (once per date), revisit, remove, guide-set choice (`plan.js`, `guides.js`)
- My week v2: add and remove places and activities, duplicates, cleaning, **v1 → v2 migration**, settings migration (`plan.js`)

### 10.2 Browser tests (Playwright, mocked)

`npx playwright test` serves the folder with `python3 -m http.server 8471` (its own port, so it never clashes with a dev server on 8000) and runs in two projects: **desktop** (1280 × 800) and **phone** (375 × 812, touch).

**Every external request is mocked** with `page.route`: a small fake of the `google.maps` libraries (`tests/e2e/fake-google-maps.js`) and JSON fixtures for Open-Meteo and Nager.Date. Geolocation is set with Playwright's `geolocation` and `permissions` options. These tests prove the page handles each response correctly. **They don't prove the real APIs work.**

Journeys: location permission denied; manual address selection; places success; places empty; places failure; weather success; weather failure; routes success; routes failure (and "Walking time unavailable"); walking-time filter; saving a place; marking explored; revisiting (a new guide set); adding a place to My week and seeing its weather; a refresh keeps everything; delete my data; desktop layout (list and map side by side); phone layout (List/Map switch, no sideways page scroll, 44px targets).

### 10.3 Live check (manual, real APIs)

`tests/LIVE-CHECK.md` is a checklist run by hand with the dev key on `localhost:8000`, and with the prod key on the published site. Each run is recorded with the date, browser and result. For each API it says how to confirm a real response (DevTools Network panel and the Phase 2 `console.log`s):

- Maps JS: the map shows real streets, and the Network panel shows requests to `maps.googleapis.com` with status 200.
- Autocomplete: typing "221 Wash" suggests the Newton address; picking it shows the formatted address.
- Nearby search: places in the list exist on the map at their markers; spot-check two in Google Maps.
- Routes: walking times appear; one is checked against Google Maps' own walking directions.
- Open-Meteo: the "Now" temperature matches open-meteo.com for the same place.
- Geolocation: allowing it searches from the device location; denying it shows 8.3's message.
- Restrictions: the prod key, used from `localhost`, is refused (expected).

Reports always say which results come from mocked tests and which from a live check. A feature is "live-verified" only after a live check passes.

## 11. Development phases

One phase at a time. Each phase ends with: what changed, the tests run and their results, failures and limitations, and the next step. Nothing is committed, pushed or deployed unless asked.

| Phase | Scope | Needs a Google key? |
|---|---|---|
| **1. Docs** | This PRD and AGENTS.md. Then DESIGN.md for the new parts (controls, weather panel, place cards, map/list, place details, My Places). | No |
| **2. Foundation** | `.gitignore`, `config.example.js`, loading the Maps JS API with the 8.3 setup errors; the weather-only city fallback (Open-Meteo geocoding); Use my location; Autocomplete and the example address (built, mock-tested only until a key is configured); Open-Meteo current + hourly + daily with the compact line and the Weather section; location state; settings v2 and migration; the new page order and navigation; Playwright set up with the first journeys. No place search yet. | To run live. The code and mocked tests can be done without one. |
| **3. Discovery** | The remaining controls (ages, mode, walking time, interest, Find Little Adventures); `explore.js` (categories, radius, shortlist, access, setting, filters); nearby search; map and markers; route matrix (5 at first, more on request); place cards with weather, age and access notes; Save (Want to explore); List/Map switch; place details with the route, weather and the guide; `guides.js` (drafted for your review) with three perspectives; at-home ideas in details. | Same |
| **4. Experience** | My Places section; explored and revisit (linking visits to perspectives); the Explored filter; My week v2 with places and migration; delete my data; footer privacy note. | Same |
| **5. Readiness** | Full Playwright run on desktop and phone; `tests/LIVE-CHECK.md` run live; billing and quota review; the Pages workflow (not run until you approve deploying). | Yes |

## 12. Acceptance criteria

- [ ] Picking "221 Washington Street, Newton, MA 02458" from suggestions and pressing Find Little Adventures shows real nearby places on a Google map and in a list, with weather for Newton.
- [ ] "Use my location" asks for permission only when pressed. Denying it shows "Location access is off, so type an address instead." and the address field still works.
- [ ] Every card shows a Google walking time or "Walking time unavailable", never a guessed time.
- [ ] With 10 minutes chosen, no place with a longer Google walking time is listed, and the count of hidden places is shown.
- [ ] Classroom mode shows the group walking-time note, and every place says "Access not verified" unless verified, with "Contact before a classroom visit" on businesses and public-service buildings.
- [ ] Opening the page, choosing a location, or returning to the page never sends a Google Places search; only "Find Little Adventures" does.
- [ ] Choosing a location shows real Open-Meteo weather right away: Now, the next six hours starting at the current hour (not midnight), and seven days.
- [ ] Verified data and Little Days notes are visibly labelled apart on cards and in details.
- [ ] On a hazard day, indoor places come first and outdoor places carry the hazard warning.
- [ ] Opening a place shows the walking route on a map, the route reminder, the weather and a full exploration guide.
- [ ] Save, Mark as explored and Revisit work, survive a refresh, and Revisit shows a different guide set.
- [ ] Adding a place to a forecast date in My week shows that day's weather; a date beyond the forecast says "Forecast not available yet for this date."
- [ ] An existing v1 plan still appears after upgrading, as activity entries.
- [ ] localStorage contains no place names, addresses or coordinates, only place IDs and the adult's own text.
- [ ] "Delete my saved data" removes every `littleDays.*` key.
- [ ] With `config.js` missing, the page says maps aren't set up, and weather by city (fallback) and by device location still works.
- [ ] With Network → Offline, the places and weather errors show with Try again, and My Places and My week are still visible.
- [ ] The page never says "safe" about weather, a place or a route.
- [ ] °F/°C changes temperatures, wind, rain amounts and distances with no new request.
- [ ] All earlier at-home criteria still hold: hazard days have no outdoor at-home ideas, What to wear, Why these activities?, activity details, Halloween only where listed.
- [ ] `node --test` and `npx playwright test` pass (mocked).
- [ ] `tests/LIVE-CHECK.md` has a passing live run recorded for every API.
- [ ] No page scrolls sideways at 375px, and every control is at least 44 × 44px.

## 13. Open questions

- **Free/paid filter.** Google's `priceLevel` is mostly for restaurants and is in a pricier field tier, so "free" can't be verified cheaply. Version 1 shows no price information. Is that acceptable?
- **Opening hours.** Showing `regularOpeningHours` would move nearby search to a pricier tier. Version 1 links to Google Maps instead. Keep it that way?
- **The category type lists** (7.10) and the access estimates (7.11) are a first pass and need your review once real results come in.
- **Guides** (7.14) were drafted and then edited for child-led wording on 2026-11-04; they still need your review before the pilot, since they're Little Days' own words.
- **Third-party attributions** (9.4): request Google's `attributions` field and show it with each place before a wider launch?
- **Rain caution wording:** a drizzle code with a low chance shows "Rain is possible (14%)". Correct by the rules (7.4), but it may read oddly.
- The earlier open questions still stand: the global heat and cold levels for hot-climate cities, the celebrations country list, and RootMap's gaps (no snow, wind, winter-holiday or summer activities).
