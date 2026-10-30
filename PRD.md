# Little Days — Product Requirements

## 1. Summary

Little Days is a one-page web tool that helps parents of children ages 1–6 plan simple activities for the coming week. The parent enters a city and picks their child's age. The page shows a seven-day forecast and, for each day, two or three activities that suit the weather, any holiday that day, and the child's age, plus what the child should wear. The parent can add activities to a weekly plan that stays saved in the browser.

## 2. Problem

Parents want to spend good time with their young children but don't have time to plan. Generic activity lists ignore the things that actually decide what works on a given day: whether it will rain, how cold it is, whether a holiday is coming, and what a child of that age can do.

## 3. Users

**Primary:** a parent or caregiver of one child aged 1–6, planning on a phone or laptop, usually at the start of the week or the night before.

They want answers fast ("what can we do Saturday?"), not a lot of reading. Most have no special materials, just ordinary household items.

## 4. Goals

- A parent can go from opening the page to a planned week in under two minutes.
- Every suggestion fits that day's weather and the child's age.
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

## 6. User stories

1. As a parent, I type my city so the forecast is for where I live.
2. As a parent, I pick my child's age so the activities fit what my child can do.
3. As a parent, I see the next seven days with the high, low, chance of rain, and an icon for the conditions.
4. As a parent, I see two or three activity ideas for each day.
5. As a parent, I see when a day is a holiday or celebration, with an activity that goes with it.
6. As a parent, I see what my child should wear and what to bring for each day.
7. As a parent, I open an activity to see instructions, materials, how long it takes, and what it helps my child develop.
8. As a parent, I add an activity to a day in my weekly plan, and remove it if I change my mind.
9. As a parent, I come back later and my city, child's age, and plan are still there.

## 7. Functional requirements

### 7.1 Inputs

| Input | Control | Behavior |
|---|---|---|
| City | Text field + search button (Enter also submits) | Geocodes the city, then fetches the forecast and holidays. If several places match, use the first result and show its name, state/region, and country so the parent can tell. Adding the state works ("Portland, Maine"). |
| Child's age | Selector with 1, 2, 3, 4, 5, 6 | Changes only the activity suggestions. Does not refetch weather. |

Defaults on first visit: no city (show a short prompt to enter one), age 3.

### 7.2 Data sources

All three are free and need no key.

| Source | Endpoint | Fields used |
|---|---|---|
| Open-Meteo Geocoding | `https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1` | `results[0]`: `latitude`, `longitude`, `name`, `admin1`, `country`, `country_code` |
| Open-Meteo Forecast | `https://api.open-meteo.com/v1/forecast?latitude=..&longitude=..&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=auto` | `daily.time`, `daily.temperature_2m_max`, `daily.temperature_2m_min`, `daily.precipitation_probability_max`, `daily.weather_code` |
| Nager.Date | `https://date.nager.at/api/v3/PublicHolidays/{year}/{countryCode}` | `date`, `localName`, `name`, `countryCode` |

Plus a small local list of celebrations not in Nager.Date (for example Halloween, Valentine's Day, Mother's Day, Father's Day, first day of each season).

Temperatures are shown in °F for US locations and °C everywhere else. Open-Meteo returns °C unless the request adds `&temperature_unit=fahrenheit`, so add it when `country_code` is `US`.

How each API behaves (checked against real responses on 2026-10-30):

| Situation | What the API returns |
|---|---|
| Geocoder finds the city | `200`, JSON with a `results` array |
| Geocoder finds nothing | `200`, JSON **with no `results` field**. This is not an error status, so the code must check for it. |
| Geocoder gets 1 character | `200`, no `results` (same as not found) |
| Forecast gets a bad request | `400`, `{"error": true, "reason": "..."}` |
| Nager.Date gets a country it doesn't support | `404`, empty body |
| No internet | `fetch` throws |

`daily` holds parallel arrays: index 0 of every array is today, index 1 is tomorrow, and so on.

### 7.3 Combining the data

- Days are matched by date string (`YYYY-MM-DD`) across the forecast, the public holidays, and the local celebrations.
- If the seven days span two years, fetch holidays for both years.
- A day can have zero, one, or more holidays. Show all of them.

### 7.4 Weather categories

Each day gets one category, used by both activities and clothing:

| Category | Rule |
|---|---|
| Stormy | weather code 95–99 |
| Snowy | weather code 71–77 or 85–86 |
| Rainy | weather code 51–67 or 80–82, **or** rain chance ≥ 50% |
| Hot | high ≥ 85°F (29°C) |
| Cold | high < 45°F (7°C) |
| Nice | anything else |

Check them in the order listed; the first one that matches wins.

### 7.5 Activity recommendations

- Activities live in a local data file written by hand. Each activity has: `id`, `title`, `minAge`, `maxAge`, `setting` (`indoor` / `outdoor` / `either`), `weather` (list of categories it suits), optional `holiday` (name it goes with), `time` (minutes), `materials`, `steps`, and `benefits`.
- For each day, show activities where the child's age is between `minAge` and `maxAge` and the day's category is in `weather`.
- Stormy and Snowy-when-Cold days show indoor activities only.
- If the day is a holiday with a matching activity, that activity comes first.
- Show 2–3 per day. Try not to repeat the same activity on two days in the same week.
- The starting list should have at least 30 activities, with enough for every category at every age.

### 7.6 Clothing and preparation

Each day shows a short clothing line and an optional "bring" line, from rules like:

| Condition | Wear | Bring |
|---|---|---|
| High < 32°F / 0°C | Heavy coat, hat, mittens, warm boots | — |
| High 32–49°F / 0–9°C | Warm jacket, hat | — |
| High 50–64°F / 10–17°C | Light jacket or sweater, layers | — |
| High 65–84°F / 18–28°C | T-shirt, light layer for the morning if the low is under 55°F / 13°C | — |
| High ≥ 85°F / 29°C | Light, loose clothes, sun hat | Water, sunscreen |
| Rainy | Add rain boots and a raincoat | Towel, spare socks |
| Snowy | Add snow pants and waterproof boots | Spare mittens |
| Stormy | Plan to stay indoors | — |

### 7.7 Activity details

Clicking an activity opens its details: title, age range, time, materials, numbered steps, and developmental benefits. The details view has an "Add to plan" button for that day.

### 7.8 Weekly plan

- Shows the same seven days, each listing the activities the parent added.
- Each item can be removed.
- The plan, city, and age are saved in `localStorage` and loaded when the page opens.
- Plan entries are stored by date. Entries for dates before today are dropped when the page loads.

## 8. Page states

Every message below appears in one place: a **status area** at the top of the "This week" section, right under its heading. The status area has `role="status"` and `aria-live="polite"` so screen readers announce changes. Only one message shows at a time. The exception is the invalid-input message, which sits under the city field (8.4).

The "My plan" section is never hidden or cleared by any of these states. A saved plan stays visible even when the weather can't load.

### 8.1 Empty

**First visit (no city saved).**
- The city field is empty and gets focus. The age selector shows 3.
- The status area says: "Enter your city to see this week's weather and activity ideas."
- No day cards.
- "My plan" says: "Your plan is empty. Pick activities from the days above to add them here."

**Returning visit (city saved).** The page doesn't sit empty. It fills in the saved city and age and starts a search right away, going straight to Loading (8.2).

**Search finds no city.** The geocoder answered, but with no `results`.
- The status area says: "We couldn't find "{what they typed}". Check the spelling, or add the state or country, like "Portland, Maine"."
- Any day cards from an earlier search are removed so old weather isn't mistaken for the new city.
- The city field keeps the text and gets focus so the parent can fix it.
- The saved city is **not** replaced.

**A day has no matching activity.** In that day's card, in place of the activity list: "No ideas for this day yet."

**Empty plan day.** Within "My plan", a day with nothing added says "Nothing planned".

### 8.2 Loading

Starts when a valid search is submitted. One request chain runs: geocode first, then forecast and holidays together (`Promise.all`).

- The search button is disabled and its text changes to "Searching…". This stops double submits.
- The status area says: "Getting the weather for {city}…"
- Day cards from an earlier search are removed.
- The city field and age selector stay usable.
- When everything finishes, the button goes back to "Search" and the page moves to In use, Empty, or Error.

Changing the child's age never triggers Loading. It makes no request and only re-renders the activities.

### 8.3 Error

A request has failed when `fetch` throws (offline, DNS, CORS) **or** `response.ok` is false (for example the forecast's `400`). Every fetch sits in `try/catch` and checks `response.ok`. Details go to `console.error`, including the forecast's `reason` field when there is one. The parent never sees raw error text.

**Geocode or forecast fails.**
- The status area says: "We couldn't load the weather right now. Check your internet connection and try again."
- Under it is a **Try again** button that repeats the last search with the same city.
- No day cards. The search button is enabled again.
- The saved city is not replaced.

**Holidays fail** (offline after the forecast loaded, a `404` for an unsupported country, or any other non-ok answer).
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

The age selector can't be invalid, because it only offers 1–6. Activity "Add to plan" buttons can't be invalid either. An activity that's already in the plan for that day shows "Added ✓" and is disabled, so it can't be added twice.

### 8.5 In use

The data has loaded and the page shows what it worked out from it.

- The status area is empty. Above the cards is one line naming the place and dates, for example "Boston, Massachusetts, United States · Fri Oct 30 – Thu Nov 5". It confirms the geocoder picked the right city.
- **Seven day cards**, one per entry in `daily.time`. Each shows:
  - Day and date, a weather icon, and a text label from `weather_code` (for example "Partly cloudy")
  - High and low in °F or °C, and "Rain {n}%"
  - Holiday tag(s), if that date matches a public holiday or local celebration
  - **Worked out:** the weather category (7.4), the "Wear" and "Bring" lines (7.6), and 2–3 ranked activities (7.5) for the child's age
- Changing the age re-ranks the activities in every card right away, with no request.
- Clicking an activity opens its details (7.7). "Add to plan" saves it and updates "My plan" right away.
- **My plan** lists the seven forecast days with their added activities and a "Remove" button for each.
- The city and age are saved to `localStorage` only after a successful search.

## 9. Technical constraints

- Static site: HTML, CSS, and plain JavaScript. No framework, no library, no build step, nothing from a CDN.
- Data is fetched with `fetch()` and `await`, and rendered with JavaScript.
- Deployed on GitHub Pages.
- Must work in the current versions of Chrome, Safari, and Firefox, on phones and desktops.
- No API keys. See AGENTS.md.

## 10. Acceptance criteria

- [ ] Entering "Boston" shows seven days of Boston weather with highs, lows, rain chance, and conditions.
- [ ] Changing the age from 2 to 5 changes the activity list without a new weather request.
- [ ] A rainy day shows only activities marked for rain, and clothing that includes rain gear.
- [ ] A day that is a public holiday or a listed celebration shows the holiday's name and a related activity first, when one exists.
- [ ] Each activity's details show materials, steps, time, and benefits.
- [ ] Added activities appear in the weekly plan and are still there after a refresh.
- [ ] A city that doesn't exist shows the not-found message, not a broken page.
- [ ] With an empty city field, or one letter, pressing Search sends no request (check the Network tab) and shows the message under the field.
- [ ] While a search runs, the button says "Searching…" and is disabled.
- [ ] With DevTools set to Offline, a search shows the weather error and a Try again button, and the saved plan is still visible.
- [ ] With `date.nager.at` blocked, the forecast and activities still show, with the holidays note.
- [ ] The page is usable at 375px wide.

## 11. Open questions

- Should the parent be able to pick °F or °C instead of it following the country?
- When a city name matches several places (Portland, OR vs. Portland, ME), is "first result plus showing the full name" enough, or does the parent need to choose?
- Should there be a way to see more than three ideas for a day?
