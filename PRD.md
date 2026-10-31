# Little Days — Product Requirements

## 1. Summary

Little Days is a one-page web tool that helps parents of children ages 1–6 plan simple activities for the coming week. The parent enters a city and picks their child's age. The page shows a seven-day calendar with the weather, any holiday, and one featured activity for each day. Choosing a day shows three activities that suit that day's weather, holiday, and the child's age, what the child should wear, and a short explanation of why these activities were picked. The parent can add activities to a weekly plan that stays saved in the browser.

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
3. As a parent, I see the next seven days with the high, low, chance of rain, and an icon for the conditions, and one featured activity on each day.
4. As a parent, I choose a day and see three activity ideas for it.
5. As a parent, I see holidays and celebrations right on the calendar days, with an activity that goes with them.
6. As a parent, I see what my child should wear and what to bring for the chosen day.
7. As a parent, I read a short reason why these activities were picked, so I can trust the suggestions.
8. As a parent, I switch between °F and °C.
9. As a parent, I open an activity to see instructions, materials, how long it takes, and what it helps my child develop.
10. As a parent, I add an activity to a day in my weekly plan, and remove it if I change my mind.
11. As a parent, I come back later and my city, child's age, temperature unit, and plan are still there.

## 7. Functional requirements

### 7.1 Inputs

| Input | Control | Behavior |
|---|---|---|
| City | Text field + search button (Enter also submits) | Geocodes the city, then fetches the forecast and holidays. If several places match, use the first result and show its name, state/region, and country so the parent can tell. Adding the state works ("Portland, Maine"). |
| Child's age | Selector with 1, 2, 3, 4, 5, 6 | Changes only the activity suggestions, the featured activities, and the explanation. Does not refetch weather. |
| Temperature | °F / °C switch (two radio buttons) | Changes how every temperature is shown. Does not refetch weather (see 7.2). |
| Day | Each day card in the seven-day calendar is a button | Selects that day. Only one day is selected at a time. |

Defaults on first visit: no city (show a short prompt to enter one), age 3, °F. After a search, today is selected.

### 7.2 Data sources

All three are free and need no key.

| Source | Endpoint | Fields used |
|---|---|---|
| Open-Meteo Geocoding | `https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1` | `results[0]`: `latitude`, `longitude`, `name`, `admin1`, `country`, `country_code` |
| Open-Meteo Forecast | `https://api.open-meteo.com/v1/forecast?latitude=..&longitude=..&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=auto` | `daily.time`, `daily.temperature_2m_max`, `daily.temperature_2m_min`, `daily.precipitation_probability_max`, `daily.weather_code` |
| Nager.Date | `https://date.nager.at/api/v3/PublicHolidays/{year}/{countryCode}` | `date`, `localName`, `name`, `countryCode` |

Plus a small local list of celebrations not in Nager.Date (for example Halloween, Valentine's Day, Mother's Day, Father's Day, first day of each season).

The forecast is always requested in °C (Open-Meteo's default) and kept in °C in the code. The °F / °C switch only changes the display: °F = °C × 9/5 + 32, rounded to a whole number. All rules (7.4, 7.6) use °C, so they work the same whichever unit is shown.

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

### 7.5 Calendar and activity recommendations

- Activities live in a local data file written by hand. Each activity has: `id`, `title`, `minAge`, `maxAge`, `setting` (`indoor` / `outdoor` / `either`), `weather` (list of categories it suits), optional `holiday` (name it goes with), `time` (minutes), `materials`, `steps`, and `benefits`.
- For each day, show activities where the child's age is between `minAge` and `maxAge` and the day's category is in `weather`.
- Stormy and Snowy-when-Cold days show indoor activities only.
- If the day is a holiday with a matching activity, that activity comes first.
- Matching activities are ranked: holiday match first, then activities whose `setting` best fits the day (outdoor on Nice days, indoor on Rainy, Stormy, Snowy, Cold, and Hot days), then by `id` so the order is stable.
- **Calendar (each day card):** shows the top-ranked activity as the day's featured activity, by emoji and short title. Try not to feature the same activity on two days in the same week.
- **Selected day:** shows the top three ranked activities for that day, starting with the featured one. If fewer than three match, show the ones that do.
- The starting list should have at least 30 activities, with enough for every category at every age.

### 7.6 Clothing and preparation

The selected day shows a "What to wear" panel: a short list of clothing and an optional "bring" list, from rules like the ones below. It's always shown for the selected day and on phones it comes before the activities (DESIGN.md section 5).

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

### 7.7 Why these activities?

The selected day shows a short "Why these activities?" panel: one or two sentences built from templates, using the same facts that picked the activities. Nothing is made up and nothing comes from an AI.

The sentence pieces, joined in this order, using only the ones that apply:

1. Holiday: "It's {holiday}, so a {holiday} activity comes first."
2. Weather: one phrase per category, with the high in the selected unit. For example Nice: "It's {condition lowercase} and {high}°, a good day to play outside."; Rainy: "Rain is likely ({rain}%), so these are indoor ideas."; Cold: "It's cold ({high}°), so most of these stay indoors."
3. Age: "Each one suits a {age}-year-old."

Example: "It's Halloween, so a Halloween activity comes first. It's mainly clear and 53°, a good day to play outside. Each one suits a 3-year-old."

### 7.8 Activity details

Clicking an activity opens its details: title, age range, time, materials, numbered steps, and developmental benefits. The details view has an "Add to my week" button for the selected day.

### 7.9 Weekly plan

- Shows the same seven days, each listing the activities the parent added.
- Each item can be removed.
- The plan, city, age, and temperature unit are saved in `localStorage` and loaded when the page opens.
- Plan entries are stored by date. Entries for dates before today are dropped when the page loads.

## 8. Page states

Every message below appears in one place: a **status area** at the top of the "This week" section, right under its heading. The status area has `role="status"` and `aria-live="polite"` so screen readers announce changes. Only one message shows at a time. The exception is the invalid-input message, which sits under the city field (8.4).

The "My week" section is never hidden or cleared by any of these states. A saved plan stays visible even when the weather can't load.

### 8.1 Empty

**First visit (no city saved).**
- The city field is empty and gets focus. The age selector shows 3 and the switch shows °F.
- The status area says: "Enter your city to see this week's weather and activity ideas."
- No calendar, no "Ideas for {day}" section.
- "My week" says: "Your week is empty. Pick activities from the days above to add them here."

**Returning visit (city saved).** The page doesn't sit empty. It fills in the saved city, age, and unit and starts a search right away, going straight to Loading (8.2).

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
- The city field, age selector, and unit switch stay usable.
- When everything finishes, the button goes back to "Search" and the page moves to In use, Empty, or Error.

Changing the child's age, the unit, or the selected day never triggers Loading. None of them makes a request. They only re-render.

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

The age selector and unit switch can't be invalid, because they only offer fixed choices. Activity "Add to my week" buttons can't be invalid either. An activity that's already in the plan for that day shows "Added ✓" and is disabled, so it can't be added twice.

### 8.5 In use

The data has loaded and the page shows what it worked out from it.

- The status area is empty. Above the calendar is one line naming the place and dates, for example "Boston, Massachusetts, United States · Fri Oct 30 – Thu Nov 5". It confirms the geocoder picked the right city.
- **Seven-day calendar**, one day card per entry in `daily.time`. Each shows:
  - Day and date, a weather icon, and a text label from `weather_code` (for example "Partly cloudy")
  - High and low in the selected unit, and "Rain {n}%"
  - Holiday or celebration tag(s), if that date matches one
  - **Worked out:** the day's featured activity (7.5) for the child's age
- One day is selected (today, after a search). Selecting another day updates the section below right away.
- **Ideas for {weekday, month day}**, for the selected day. Everything here is worked out:
  - Three ranked activity cards (7.5), each with an "Add to my week" button
  - "What to wear" (7.6)
  - "Why these activities?" (7.7)
- Changing the age updates the featured activities, the three ideas, and the explanation right away, with no request.
- Changing the unit updates every temperature on the page right away, with no request.
- Clicking an activity title opens its details (7.8). "Add to my week" saves it and updates "My week" right away.
- **My week** lists the seven forecast days with their added activities and a "Remove" button for each.
- The city is saved to `localStorage` only after a successful search. Age and unit are saved whenever they change.

## 9. Technical constraints

- Static site: HTML, CSS, and plain JavaScript. No framework, no library, no build step, nothing from a CDN.
- Data is fetched with `fetch()` and `await`, and rendered with JavaScript.
- Deployed on GitHub Pages.
- Must work in the current versions of Chrome, Safari, and Firefox, on phones and desktops.
- No API keys. See AGENTS.md.

## 10. Acceptance criteria

- [ ] Entering "Boston" shows seven days of Boston weather with highs, lows, rain chance, and conditions.
- [ ] Today is selected after a search, and clicking another day shows that day's three ideas, clothing, and explanation.
- [ ] Changing the age from 2 to 5 changes the featured and recommended activities without a new weather request.
- [ ] Switching °F to °C changes every temperature without a new weather request.
- [ ] The "Why these activities?" text names the holiday (if any), the weather, and the child's age, and matches what is shown.
- [ ] A rainy day shows only activities marked for rain, and clothing that includes rain gear.
- [ ] A day that is a public holiday or a listed celebration shows the holiday's name on its calendar card, and a related activity is featured, when one exists.
- [ ] Each activity's details show materials, steps, time, and benefits.
- [ ] Added activities appear in the weekly plan and are still there after a refresh.
- [ ] A city that doesn't exist shows the not-found message, not a broken page.
- [ ] With an empty city field, or one letter, pressing Search sends no request (check the Network tab) and shows the message under the field.
- [ ] While a search runs, the button says "Searching…" and is disabled.
- [ ] With DevTools set to Offline, a search shows the weather error and a Try again button, and the saved week is still visible.
- [ ] With `date.nager.at` blocked, the forecast and activities still show, with the holidays note.
- [ ] The page is usable at 375px wide.

## 11. Open questions

- When a city name matches several places (Portland, OR vs. Portland, ME), is "first result plus showing the full name" enough, or does the parent need to choose?
- Should there be a way to see more than three ideas for a day?
