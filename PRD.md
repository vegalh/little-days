# Little Days — Product Requirements

## 1. Summary

Little Days is a one-page web tool that helps parents of young children plan simple activities for the coming week. Version 1 covers ages 2–6, because every activity comes from the RootMap collection and it has nothing for children under 2. The parent enters a city. The page shows a seven-day calendar with the weather, any holiday, and one featured activity for each day. Choosing a day shows three activities that suit that day's weather, season and holiday, what the child should wear, and a short explanation of why these activities were picked. The parent can add activities to a weekly plan that stays saved in the browser.

## 2. Problem

Parents want to spend good time with their young children but don't have time to plan. Generic activity lists ignore the things that actually decide what works on a given day: whether it will rain, how cold it is, and whether a holiday is coming.

## 3. Users

**Primary:** a parent or caregiver of one child aged 2–6, planning on a phone or laptop, usually at the start of the week or the night before.

They want answers fast ("what can we do Saturday?"), not a lot of reading. Most have no special materials, just ordinary household items.

## 4. Goals

- A parent can go from opening the page to a planned week in under two minutes.
- Outdoor suggestions only appear when the forecast allows them, with a clear warning when conditions call for care.
- Clothing advice is concrete ("rain boots and a light jacket"), not just a temperature.
- The weekly plan is still there after a refresh.

## 5. Non-goals (version 1)

- User accounts, logins, or syncing across devices
- More than one child profile at a time
- Sharing, printing, or exporting the plan
- Notifications or reminders
- Activities written by users
- Locations outside what the Open-Meteo geocoder can find
- Paid APIs or anything that needs an API key
- Children under 2 (RootMap has no activities for them yet)
- New activities written for Little Days: all activities come from RootMap

## 6. User stories

1. As a parent, I type my city so the forecast is for where I live.
2. As a parent, I see each activity's recommended ages, so I can skip ideas that don't suit my child.
3. As a parent, I see the next seven days with the high, low, chance of rain, and an icon for the conditions, and one featured activity on each day.
4. As a parent, I see a clear warning when the weather calls for care, and indoor ideas when it isn't a day for outdoor play.
5. As a parent, I choose a day and see three activity ideas for it.
6. As a parent, I see holidays and celebrations right on the calendar days, with an activity that goes with them.
7. As a parent, I see what my child should wear and what to bring for the chosen day.
8. As a parent, I read a short reason why these activities were picked, so I can trust the suggestions.
9. As a parent, I switch between °F and °C.
10. As a parent, I open an activity to see instructions, materials, how long it takes, and what it helps my child develop.
11. As a parent, I add an activity to a day in my weekly plan, and remove it if I change my mind.
12. As a parent, I come back later and my city, temperature unit, and plan are still there.

## 7. Functional requirements

### 7.1 Inputs

| Input | Control | Behavior |
|---|---|---|
| City | Text field + search button (Enter also submits) | Geocodes the city, then fetches the forecast and holidays. If several places match, use the first result and show its name, state/region, and country so the parent can tell. Adding the state works ("Portland, Maine"). |
| Temperature | °F / °C switch (two radio buttons) | Changes how every temperature (and wind speed: mph or km/h) is shown. Does not refetch weather (see 7.2). Saved in `localStorage`. |
| Day | Each day card in the seven-day calendar is a button | Selects that day. Only one day is selected at a time. |

Defaults on first visit: no city (show a short prompt to enter one), °F. After a search, today is selected.

### 7.2 Data sources

All three APIs are free and need no key.

| Source | Endpoint | Fields used |
|---|---|---|
| Open-Meteo Geocoding | `https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1` | `results[0]`: `latitude`, `longitude`, `name`, `admin1`, `country`, `country_code` |
| Open-Meteo Forecast | `https://api.open-meteo.com/v1/forecast?latitude=..&longitude=..&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_probability_max,weather_code,wind_gusts_10m_max,uv_index_max&timezone=auto` | `daily.time`, `daily.temperature_2m_max`, `daily.temperature_2m_min`, `daily.apparent_temperature_max` (feels-like high, °C), `daily.apparent_temperature_min` (feels-like low, °C), `daily.uv_index_max`, `daily.precipitation_probability_max` (%), `daily.weather_code` (WMO code), `daily.wind_gusts_10m_max` (km/h) |
| Nager.Date | `https://date.nager.at/api/v3/PublicHolidays/{year}/{countryCode}` | `date`, `name` (English name, shown and used for matching) |

Plus a small, hand-reviewed list of **celebrations** that aren't public holidays, in `celebrations.js`. It is kept apart from Nager.Date's public holidays, and each celebration lists the countries where it's widely observed, so the page doesn't assume every family celebrates it:

| Celebration | Date | Countries (ISO codes) |
|---|---|---|
| Halloween | Oct 31 | US, CA, IE, GB |
| Valentine's Day | Feb 14 | US, CA, GB, IE, AU, NZ |

Everywhere else, these dates show nothing. Even where a celebration is shown, the page words its idea as optional ("If your family celebrates Halloween…", 7.7).

The forecast is always requested in °C and km/h (Open-Meteo's defaults) and kept that way in the code. The °F / °C switch only changes the display: °F = °C × 9/5 + 32 and mph = km/h × 0.621, rounded to whole numbers. All rules (7.4, 7.6) use °C and km/h, so they work the same whichever unit is shown. °F goes with mph, °C with km/h. The conversions live in `advice.js` (`formatTemp`, `formatWind`).

How each API behaves (checked against real responses on 2026-10-30 and 2026-10-31):

| Situation | What the API returns |
|---|---|
| Geocoder finds the city | `200`, JSON with a `results` array |
| Geocoder finds nothing | `200`, JSON **with no `results` field**. This is not an error status, so the code must check for it. |
| Geocoder gets 1 character | `200`, no `results` (same as not found) |
| Forecast gets a bad request | `400`, `{"error": true, "reason": "..."}` |
| Nager.Date gets a country it doesn't support | `404` (e.g. `XX`) or `204 No Content` (e.g. `AE`), empty body. The page shows "Nager.Date doesn't list public holidays for this country, so none are shown." |
| No internet | `fetch` throws |

`daily` holds parallel arrays: index 0 of every array is today, index 1 is tomorrow, and so on. Any daily value can be `null` (for example `precipitation_probability_max` or `uv_index_max` for some places). The page never fills in a missing value: it shows "Rain –" and leaves out any advice that depends on the missing value.

### 7.3 Combining the data

- Days are matched by date string (`YYYY-MM-DD`) across the forecast, the public holidays, and the local celebrations.
- If the seven days span two years, fetch holidays for both years.
- A day can have zero, one, or more public holidays and celebrations. Show all of them on its calendar card. Both kinds count for holiday matching (7.5).

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

**Recommendation order** (code: `pickIdeas` and `planWeek` in `recommend.js`). The first two steps decide what *may* be shown; the last two only change the order. A holiday can never bring back an activity that steps 1–2 removed. There is no age filter: all 37 activities suit ages 2–6 or part of it, and each card shows its recommended ages so the parent can judge.

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

- Parents add an activity to a date with "Add to my week" (on an idea card, for the selected day, or in the details dialog).
- The same activity can't be added twice to the same date; the button shows "Added ✓" and is disabled.
- My week lists the seven forecast days, plus any later saved dates, each with its activities and a "Remove" button. Days with nothing say "Nothing planned".
- Before any search (or if the weather fails), My week still lists saved dates from today on.
- Saved in `localStorage` under `littleDays.plan.v1` as `{ "YYYY-MM-DD": ["activity-id", ...] }`, using RootMap IDs and ISO dates only. No names, accounts or personal information.
- When the page loads, dates before today and IDs that aren't in `activities.js` are dropped.
- Settings are saved under `littleDays.settings.v1`: `{ city, unit }`.
- Code: `plan.js` (pure functions; storage is passed in so tests can use a fake).

## 8. Page states

Every message below appears in one place: a **status area** at the top of the "This week" section, right under its heading. The status area has `role="status"` and `aria-live="polite"` so screen readers announce changes. Only one message shows at a time. The exception is the invalid-input message, which sits under the city field (8.4).

The "My week" section is never hidden or cleared by any of these states. A saved plan stays visible even when the weather can't load.

### 8.1 Empty

**First visit (no city saved).**
- The city field is empty and gets focus. The switch shows °F.
- The status area says: "Enter your city to see this week's weather and activity ideas."
- No calendar, no "Ideas for {day}" section.
- "My week" says: "Your week is empty. Pick activities from the days above to add them here." (or lists saved dates, 7.9)

**Returning visit (city saved).** The page doesn't sit empty. It fills in the saved city and unit and starts a search right away, going straight to Loading (8.2).

**Search finds no city.** The geocoder answered, but with no `results`.
- The status area says: "We couldn't find "{what they typed}". Check the spelling, or add the state or country, like "Portland, Maine"."
- Any day cards from an earlier search are removed so old weather isn't mistaken for the new city.
- The city field keeps the text and gets focus so the parent can fix it.
- The saved city is **not** replaced.

**A day has no matching activity.** That day's card shows "No idea yet" where the featured activity would be. When that day is selected, the ideas area says: "No ideas for this day yet." The "What to wear" and "Why these activities?" panels still show.

**Empty plan day.** Within "My week", a day with nothing added says "Nothing planned".

### 8.2 Loading

Starts when a valid search is submitted. One request chain runs: geocode first, then forecast and holidays together (`Promise.all`).

- The search button is disabled and its text changes to "Searching…". This stops double submits.
- The status area says: "Getting the weather for {city}…"
- Day cards from an earlier search are removed.
- The city field and unit switch stay usable.
- When everything finishes, the button goes back to "Search" and the page moves to In use, Empty, or Error.

Changing the unit or the selected day never triggers Loading. Neither makes a request. They only re-render.

### 8.3 Error

A request has failed when `fetch` throws (offline, DNS, CORS) **or** `response.ok` is false (for example the forecast's `400`). Every fetch sits in `try/catch` and checks `response.ok`. Details go to `console.error`, including the forecast's `reason` field when there is one. The parent never sees raw error text.

**Geocode or forecast fails.**
- The status area says: "We couldn't load the weather right now. Check your internet connection and try again."
- Under it is a **Try again** button that repeats the last search with the same city.
- No day cards. The search button is enabled again.
- The saved city is not replaced.

**Holidays fail** (offline after the forecast loaded, or a non-ok answer other than 204/404). An unsupported country (204/404) isn't a failure: it shows its own note (7.2) and no error.
- This doesn't block the page. The forecast, clothing, and activities show normally (In use).
- Local celebrations (Halloween, etc.) still show, because they come from `activities.js` and not the API.
- One small note appears under the "This week" heading: "Public holidays couldn't be loaded, so they aren't shown."

**localStorage blocked** (for example private browsing in some browsers).
- The page works normally for this visit. Nothing is saved, and no message is shown.

How to test: DevTools → Network → **Offline**, then search. That should show the weather error. To test the holiday error alone, block `date.nager.at` in DevTools (Network → right-click a request → Block request domain).

### 8.4 Invalid input

The page refuses these before sending any request:

| Input | Rule | Message under the city field |
|---|---|---|
| City empty or only spaces | trim, then length 0 | "Type a city name first." |
| City 1 character | trim, then length < 2 (the geocoder can't search one letter) | "Type at least 2 letters." |

When input is refused:
- No request is sent and the status area doesn't change. Whatever was showing stays.
- The message appears directly under the city field in `--ink`, not red. The field gets `aria-invalid="true"` and `aria-describedby` pointing to the message, and keeps focus.
- The message and `aria-invalid` clear as soon as the parent types.

The unit switch can't be invalid, because it only offers fixed choices. Activity "Add to my week" buttons can't be invalid either. An activity that's already in the plan for that day shows "Added ✓" and is disabled, so it can't be added twice.

### 8.5 In use

The data has loaded and the page shows what it worked out from it.

- The status area is empty. Above the calendar is one line naming the place and dates, for example "Boston, Massachusetts, United States · Fri Oct 30 – Thu Nov 5". It confirms the geocoder picked the right city.
- **Seven-day calendar**, one day card per entry in `daily.time`. Each shows:
  - Day and date, a weather icon, and a text label from `weather_code` (for example "Partly cloudy")
  - High and low in the selected unit, and "Rain {n}%"
  - Holiday or celebration tag(s), if that date matches one
  - "Indoor day" tag on a hazard day (7.4)
  - **Worked out:** the day's featured activity (7.5), with its photo and title
- One day is selected (today, after a search). Selecting another day updates the section below right away.
- **Ideas for {weekday, month day}**, for the selected day. Everything here is worked out:
  - Weather warnings for that day and the forecast reminder (7.4)
  - Three ranked activity cards (7.5): photo, title, "Indoor/Outdoor · {minutes} min · Ages {min}–{max}", the holiday-inspired label when it applies, description, up to three domain tags, safety note, and an "Add to my week" button 
  - "What to wear" (7.6); on phones it comes before the ideas
  - "Why these activities?" (7.7)
- Changing the unit updates every temperature on the page right away, with no request.
- Clicking an activity title opens its details (7.8). "Add to my week" saves it and updates "My week" right away.
- **My week** lists the seven forecast days with their added activities and a "Remove" button for each.
- The city is saved to `localStorage` only after a successful search. The unit is saved whenever it changes (7.9).

## 9. Technical constraints

- Static site: HTML, CSS, and plain JavaScript. No framework, no library, no build step, nothing from a CDN.
- Data is fetched with `fetch()` and `await`, and rendered with JavaScript.
- Deployed on GitHub Pages.
- Must work in the current versions of Chrome, Safari, and Firefox, on phones and desktops.
- No API keys. See AGENTS.md.

## 10. Acceptance criteria

- [ ] Entering "Boston" shows seven days of Boston weather with highs, lows, rain chance, and conditions.
- [ ] Today is selected after a search, and clicking another day shows that day's three ideas, clothing, and explanation.
- [ ] Switching °F to °C changes every temperature without a new weather request.
- [ ] The "Why these activities?" text names the holiday (if any) and the weather, and matches what is shown.
- [ ] A day with a hazard (thunderstorm, heavy rain or snow, freezing rain, extreme heat or cold, dangerous wind) shows "Indoor day", its warning, and no outdoor ideas.
- [ ] A mild rain, light snow, cold, hot or windy day shows its warning, indoor ideas first, and at most one outdoor idea marked as suiting that condition.
- [ ] A rainy day's clothing includes rain gear.
- [ ] On Halloween an autumn city sees "Washing a Pumpkin" featured with "Halloween-inspired idea"; a city where it's spring doesn't.
- [ ] No activity is featured twice in the same week.
- [ ] Every activity shows its RootMap photo; a missing photo shows a plain tile, not a broken image.
- [ ] `node --test` passes.
- [ ] Halloween shows for Boston but not for Paris or Dubai.
- [ ] Escape and Close both close the details dialog, and focus returns to the title that opened it.
- [ ] A missing UV index or rain chance leaves its advice out instead of guessing.
- [ ] A day that is a public holiday or a listed celebration shows the holiday's name on its calendar card, and a related activity is featured, when one exists.
- [ ] Each activity's details show materials, steps, time, developmental domains, and the safety note.
- [ ] Added activities appear in the weekly plan and are still there after a refresh.
- [ ] A city that doesn't exist shows the not-found message, not a broken page.
- [ ] With an empty city field, or one letter, pressing Search sends no request (check the Network tab) and shows the message under the field.
- [ ] While a search runs, the button says "Searching…" and is disabled.
- [ ] With DevTools set to Offline, a search shows the weather error and a Try again button, and the saved week is still visible.
- [ ] With `date.nager.at` blocked, the forecast and activities still show, with the holidays note, and Halloween still shows (local list).
- [ ] The page is usable at 375px wide.

## 11. Open questions

- When a city name matches several places (Portland, OR vs. Portland, ME), is "first result plus showing the full name" enough, or does the parent need to choose?
- Should there be a way to see more than three ideas for a day?
- Is the celebrations country list (7.2) right? It was chosen by hand for the MVP.
- The heat and cold levels are the same everywhere. In hot-climate cities (for example Dubai in early November, feels-like ~37°C) every day is an indoor day. Is that the right call, or should the heat level allow early-morning or evening outdoor ideas?
- RootMap has no activities for snow play, windy-day play, Christmas or winter holidays, spring celebrations, or summer. Those days fall back to ordinary indoor and outdoor ideas.
