# Little Days — Design Direction

Read this before writing any CSS or markup.

**Chosen direction: RootMap family.** Little Days now shares RootMap's palette, fonts, controls and icons (sections 2–4). The earlier Storybook trial ([design/trial-a.html](design/trial-a.html)) and Paper planner ([design/trial-b.html](design/trial-b.html)) and the original mockup ([design/mockup.png](design/mockup.png)) are kept for reference only. Where they disagree with this file, this file wins.

## 1. Feeling

A neighborhood field guide: like a well-made nature journal with a real map tucked inside. Warm, calm, a little playful. It is for the adult (parent or teacher), not the child, so it's grown-up and elegant, never cartoonish.

- **Warm, not cute.** Cream paper, forest green, autumn accents. No bubble fonts, mascots, or rainbow colors.
- **A guide, not a map app.** The map supports the places; it never takes over the page. No toolbars, layer menus, or dense controls. One map, one list, a few gentle filters.
- **Not a dashboard.** No data tables, KPI tiles, or admin-style sidebars, even in Classroom mode.
- **Glanceable.** A place card answers "what is it, how far is the walk, is the weather right, what might we notice" in about three seconds.
- **Honest.** What Google and Open-Meteo say looks different from what Little Days suggests (section 6, "Verified and Little Days content").
- **Made for phones.** Most families use it one-handed. The phone layout is designed on its own (section 5), not the desktop layout squeezed down.

## 2. Color

The colors come from **Peninsula Montessori Academy's Newton site** (peninsulama.com/newton): white and light-grey pages, honey-gold headings, near-black text and warm peach highlights. The fonts, shapes and icons still follow RootMap (sections 3–4).

Defined as CSS custom properties on `:root` in `style.css`. **`style.css` is the source of truth**: this table lists exactly what it defines. Component styles use the tokens, never raw hex values. Don't rename a token that's in use; add a new one only when a component needs it, and add it here.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#F6F6F6` | Page background (their light-grey sections) |
| `--surface` | `#FFFFFF` | Cards, controls, status areas |
| `--tint` | `#FDF4E6` | Soft cream panels: Little Days notes, What to wear, the segmented-control track |
| `--apricot` | `#FDEBCF` | Warm boxes: weather warnings, the route reminder |
| `--peach` | `#FAC97F` | Their peach highlight (defined for accents) |
| `--selected` | `#FCE3BC` | Selected pill and day, selected place card |
| `--ink` | `#1B1B1B` | Main text |
| `--ink-soft` | `#5E5E5E` | Secondary text, labels, unselected controls |
| `--heading` | `#917140` | Headings, logo, place and activity titles (their deeper gold; their lighter `#B58D51` is too faint for text) |
| `--accent` | `#917140` | Buttons, selected text, focus ring, markers, route line (4.8:1 with white text) |
| `--accent-ink` | `#FFFFFF` | Text on accent |
| `--line` | `#E8E2D8` | Borders, dividers |
| `--sky` | `#7FA7C9` | Rain/cool details (defined, not used yet) |
| `--leaf-ink` | `#3F6B35` | "Added ✓", status tags |
| `--holiday` | `#96421A` | Holiday tags |
| `--warning` | `#7A4F00` | Warning icons, "Indoor day" tag |
| `--google-gray` | `#5E5E5E` | Only Google's "Google Maps" text attribution |
| `--shadow` | `0 6px 20px rgba(27,27,27,.06)` | The one soft shadow, on cards |

Text on a peach or cream background is `--ink`, never gold: gold on peach is too faint. Buttons are rounded pills, like the site's.

Shape tokens: `--radius` (20px, cards) and `--radius-small` (14px, controls, RootMap's `--radius-control`). Font tokens: section 3.

Sky, leaf, holiday, and warning colors are only for small tags and text, never large backgrounds. Body text must meet WCAG AA contrast (4.5:1) on `--bg`, `--surface`, `--tint` and `--apricot`.

**Map colors.** Markers and the route line use `--accent` (read with `getComputedStyle`, since Google's map can't read CSS variables). The start marker uses `--ink`. The map keeps Google's default style.

Dark mode is not part of version 1. The Autocomplete element is set to `color-scheme: light` so it matches.

## 3. Type

RootMap's two fonts, **bundled with the site** in `fonts/` (woff2, SIL Open Font License, `fonts/OFL.txt`). Nothing is loaded from Google Fonts or any CDN, which also keeps the site fast in mainland China.

- **Headings** (`--font-head`): `"Caveat", cursive`, weights 600 and 700. A handwritten script for the logo, page title, section headings, day names, and place and activity titles. Caveat runs small, so its sizes are larger than a serif's would be.
- **Body** (`--font-body`): `"Nunito", system-ui, sans-serif`, weights 400, 600, 700. Rounded and friendly, for everything else.
- **Chinese** (`html:lang(zh-CN)`) uses the system's Chinese font, as RootMap does: `"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif`, never a downloaded one (a full Chinese font is too large, and Google Fonts is slow in mainland China). Headings are weight 600 with slight letter spacing, at Chinese sizes: logo 24px, hero 36px (phone 28px), section headings 28px (phone 24px), card titles 21px, panel and detail headings 20px, day names 17px. Line height 1.65.
- **EN / 中文 switch:** a small pill at the end of the top bar (white, gold bold text, 1.5px `--line` border, at least 40px tall), showing the other language in its own script.
- Base size 16px, line height 1.5. Headings line height 1.15, color `--heading`.

| Role | Desktop | Phone |
|---|---|---|
| Logo | 32px / 700 | same |
| Hero title | 62px / 700 | 44px |
| Section heading (h2) | 40px / 700 | 34px |
| Place and activity title (h3) | 27–28px / 700 | 25–26px |
| Panel and detail headings | 26px / 700 | same |
| Day name | 24px / 700 | same |
| Body | 16px | 16px |
| Labels, meta, tags | 13–14px / 600 | same |

- Temperatures, walking minutes and distances use `font-variant-numeric: tabular-nums`, in Nunito (never Caveat).
- Sentence case everywhere ("Add to my week", "Want to explore"). No all-caps.

## 4. Shape and spacing

- **Corners:** cards, panels and the map frame `--radius: 20px`; inputs, buttons, pills and art tiles `--radius-small: 14px` (pills 12px); tags fully rounded.
- **Borders:** 1px `--line`. Secondary buttons have a 1.5px `--accent` border on `--surface`.
- **Shadow:** `--shadow`, RootMap's single soft shadow, on cards (controls card, place cards, saved places, idea cards, day cards, Now and Next hours, My week, status areas) and on the selected segment.
- **Segmented controls** (°F/°C, Family/Classroom, walking time, filters, List/Map, My Places tabs) follow RootMap's: a `--tint` track with 3px padding and 12px corners; the selected segment is `--surface` (white) with `--accent` bold text, 9px corners and a small shadow. RootMap uses its pale green here; white was chosen so the selection is easy to see. Unselected segments are `--ink-soft`.
- **Interest chips** follow RootMap's filter pills: `--surface`, 1px `--line`, 12px corners; the selected pill is `--selected` with an `--accent` border and text.
- **Icons:** RootMap's line icons (24 × 24, 1.8 stroke, `currentColor`) for navigation: compass (Explore), sun (Weather), heart (My Places), calendar (My week). Weather and category emoji stay, always next to text.
- **Spacing** uses a 4px base: 4, 8, 12, 16, 24, 32, 48.
- Content max width 1040px, centered, except the Explore section, which may widen to 1200px on large screens so the map has room. Side gutter 16px on phones, 24px from 720px up.

## 5. Layout and navigation

### Navigation

Little Days is **four views, one shown at a time**: **Explore** (with the search controls and the hero), **Weather** (with the at-home ideas), **My Places** and **My week**. The URL hash chooses the view (`#explore`, `#weather`, `#my-places`, `#my-week`), so links like "More weather" and the browser's back button work without a router. The current tab has `aria-current="page"`: gold text with a gold underline in the top bar, bold gold in the phone's bottom bar. Switching views scrolls to the top. The footer (Your data) shows under every view.

Explore on a computer (1100px and up) is an app layout: the search controls in a sticky column on the left (380px), the results (tabs, filters, list and map side by side) on the right. Between 720px and 1100px the controls sit above the results. On phones everything is one column.

The section table below lists where each part lives.

| Section | id | Reached by |
|---|---|---|
| Home (hero + controls) | `#start` | the logo |
| Explore | `#explore` | "Explore" link; after a search the page scrolls here (`scrollIntoView`, no smooth scroll under reduced motion) |
| Weather | `#weather` | "Weather" link, and "More weather" in the compact weather line; shown once a location is chosen |
| Ideas for {day} | `#ideas` | optional at-home ideas, under Weather |
| My Places | `#my-places` | "My Places" link (with a count when there are saved places) |
| My week | `#my-week` | "My week" link |
| Footer | — | — |

**Header:** an original two-leaf sprout mark (inline SVG, `--heading` gold, `.logo-mark`) next to the "Little Days" wordmark (serif, `--accent`) on the left, links "Explore · Weather · My Places · My week" on the right. On phones the header links move to a **bottom bar** (fixed, `--surface`, top border `--line`, four equal 44px+ targets with an emoji above a 12px label: 🧭 Explore, ☀️ Weather, 📍 My Places, 🗓️ My week, `env(safe-area-inset-bottom)` padding), so they're reachable with a thumb. The page gets matching bottom padding so nothing hides behind it.

### Page order

1. **Header**
2. **Home** (`#start`): title "Your neighborhood is full of little discoveries.", subheading "Find meaningful places to explore with young children, right outside your door.", then the controls card (section 6), in this order:
   1. Location
   2. Current weather (the compact line, next to the location controls, as soon as a location is chosen)
   3. Ages
   4. Family or Classroom
   5. Walking time
   6. Interests
   7. The search button (and the °F / °C switch)
3. **Explore** (`#explore`): status area, interest tabs, filters, then list and map.
4. **Weather** (`#weather`): Now, Next hours, the seven-day strip, then warnings and "What to wear" for the selected day.
5. **Ideas for {day}** (`#ideas`): optional at-home ideas: three activities and "Why these activities?".
6. **My Places** (`#my-places`).
7. **My week** (`#my-week`).
8. **Footer**: attributions, then "Your data" in three labeled parts: Privacy, Backup & restore, Delete your data.

### Desktop (720px and up)

- **Hero:** title and subheading, then the controls card full width.
- **Controls card:** row 1 location (field wide, "Use my location" beside it) with the compact weather line to its right (min 280px) once a location is chosen, wrapping under it when there isn't room; row 2 the location line and example button; row 3 Ages, Who's exploring, Walking time side by side; row 4 Interests chips (wrapping); row 5 the °F / °C switch on the left and the primary button on the right.
- **Weather:** Now and Next hours side by side in one panel; the seven-day strip below (seven cards in one row, `grid-auto-flow: column`, min 132px each, scrolls sideways inside its own container only if needed); warnings and "What to wear" side by side below the strip.
- **Explore:** two columns, **list on the left (minmax(340px, 5fr)), map on the right (7fr)**. The map is `position: sticky; top: 16px; height: calc(100vh - 32px)`, max 760px, so it stays in view while the list scrolls with the page. Cards are one column in the list.
- **Ideas:** three cards side by side (`repeat(auto-fill, minmax(260px, 1fr))`), then "Why these activities?".
- **My Places:** status tabs, then cards in two columns.
- **Place and activity details:** centered `<dialog>`, max 640px wide (place) or 520px (activity), max height 90vh, scrolls inside.

### Phone (under 720px): designed on its own

- **Hero** is short: 32px title, subheading, then the controls card stacked. The location field is full width with "Use my location" as a full-width secondary button under it. Ages is a full-width dropdown button. Who's exploring and Walking time are full-width segmented controls (five 44px segments fit 343px). Interest chips wrap. The primary button is full width at the bottom. The adult reaches the button after little scrolling.
- **Weather:** Now on top, Next hours as a sideways-swiping row of six columns, then the seven-day strip as a sideways-swiping row of compact day cards (112px wide, `scroll-snap-type: x mandatory`, the next card peeking in). Neither wraps into a tall grid, and the page itself never scrolls sideways. Warnings and "What to wear" follow, stacked.
- **Explore:** a **List / Map switch** (two radio buttons styled as a segmented control) sticks to the top of the section while scrolling it. List is shown first. Only one of list and map is visible at a time; the hidden one uses `hidden`, so it isn't reachable by keyboard or screen reader.
  - **List:** full-width place cards, 12px apart.
  - **Map:** full width, `height: calc(100dvh - 160px)` (min 360px), so it fits between the switch and the bottom bar. Tapping a marker opens a **peek card** pinned to the bottom of the map: the place's number, name, walking time and a "Details" button. "Details" opens the place details.
- **Compact day cards** show day, date, icon, high/low, rain %, holiday and "Indoor day" tags, and the featured activity's photo, but not the condition text or activity name.
- **Ideas** are stacked full-width cards in a row layout: a 96px photo on the left, then title, meta, description, tags and safety note.
- **My Places:** tabs scroll sideways if they don't fit; cards are full width.
- **Place and activity details** open as a bottom sheet: full width, top corners rounded 20px, max height 90vh, scrolls inside. The close button stays visible at the top (sticky header inside the sheet).
- All touch targets are at least 44 × 44px. Spacing between cards is 12px, card padding 16px.

## 6. Components

### Controls

**Controls card**: `--surface`, 20px radius, 16px padding (24px from 720px up), the one soft shadow. Labels above fields, 14px / 600. Inputs 44px tall on `--bg` with a `--line` border, 12px radius.

**Location**
- Google's `<gmp-place-autocomplete>` sits under a visible `<label>` "Address or place". It's styled to match the other inputs using only what Google exposes: on the element, `font-family: var(--font-body)`, `color-scheme: light`; `::part(input)` gets the 44px height, `--bg` background, `--line` border and 12px radius (`!important`, needed to win over Google's own part styles); `::part(focus-ring)` gets `--accent` as a `border-color` (not `outline-color`, which the part doesn't expose); `::part(prediction-list)` gets `--surface`, a `--line` border and 12px radius; `::part(prediction-item-selected)` gets `--selected`. Google's own icon and suggestion attribution inside the list are left as they are. Chromium only applies `::part()` rules from a `<link>` stylesheet once that stylesheet is toggled after the custom element upgrades, so `google.js` briefly disables and re-enables the stylesheet (`refreshPartStyles()`) once the Autocomplete element is ready.
- **"Use my location"**: secondary button with "📍" (`aria-hidden`). While asking: disabled, "Finding you…".
- **"Try an example address"** (only while Google Maps is available): a text button (underlined, `--accent`, 14px) under the field. Pressing it fills the field with "221 Washington Street, Newton, MA 02458", sets the location with one Google text search (PRD.md 7.1), and marks the line under it "Example address", in `--ink-soft`, so it's never mistaken for the adult's own location.
- **Location chosen**: a line under the field: "📍 Your current location" or the formatted address, in 14px `--ink-soft`, with a "Change" text button.
- **If Google Maps is unavailable** (not configured, refused or failed), the Autocomplete is replaced by the earlier city search: a text field "City (for weather)" with the browser's suggestion list (`<datalist>`, Open-Meteo geocoding) and a "Show weather" button on the same row, styled like the earlier Search button. A note under it in `--ink-soft`: "Maps aren't available right now, so you can check the weather by city." Nothing in the fallback looks like place discovery: no example button, no map, and Explore shows its setup or unavailable message.

**Compact weather line** (in the controls card, next to the location, once a location is chosen): a `--tint` strip, 12px radius, 12px padding: "☀️ Now 64° · feels like 61° · Rain 10% · Wind 9 mph", then the first weather warning for today if there is one ("⚠︎ Rain is possible (60%)…"). It links to `#weather` ("More weather"). While loading: "Getting the weather…" in `--ink-soft`.

**Ages**: a custom dropdown ("collapsible listbox" pattern) with label "Ages": a button showing the current value with a caret, opening a themed `--surface` listbox (`--line` border, 12px radius, the one soft shadow) below it; the selected option is `--selected`. Arrow keys, Home/End, Enter/Space, Escape and outside clicks work as expected. A real `<select id="ages">` is kept `hidden` for state and fires its native `change` event when an option is picked, so the rest of the app reads Ages the same way it always has.

**Who's exploring**: segmented control (two radio buttons in a `<fieldset>`, legend "Who's exploring"): Family / Classroom. Same style as the °F / °C switch. In Classroom mode, a 14px `--ink-soft` note appears under Walking time: "Google's walking times are for one adult walking steadily. A group of young children usually takes much longer, so plan extra time."

**Walking time**: segmented control, five radio buttons (5, 10, 15, 20, 30), legend "Walking time (minutes)".

**Interests (one search at a time)**: a `<fieldset>` with legend "What would you like to explore?" and **seven radio buttons styled as chips**: 🌳 Nature · 🥖 Everyday Life · 🚒 Community Helpers · 🎨 Art & Culture · 🐦 Animals & Wildlife · 🤸 Movement · ✨ All. One is chosen at a time and **none is chosen at first**. Choosing "All" shows a 14px `--ink-soft` note: "All searches six kinds of places, so it takes a little longer." Chips: pill, 44px tall, `--surface` with a `--line` border; chosen chip `--accent` background with `--accent-ink` text. Emoji are `aria-hidden`.

**°F / °C switch**: two radio buttons styled as a segmented control inside a `<fieldset>` with the legend "Temperature". The selected side is `--accent` with `--accent-ink` text.

**Primary button**: "Find Little Adventures" (wording from PRD.md). While searching: disabled, "Searching…".

### Weather

**Now**: a `--surface` card: large temperature (40px serif, tabular), weather emoji and condition, then "Feels like 61°", "Wind 9 mph, gusts 20 mph", "Rain 10% this hour", and the rain amount when it's raining.

**Next hours**: six equal columns (time, emoji, temperature, "Rain n%"), each column 64px min. Each column is labelled with its hour ("6 PM"), including the current one, so it isn't confused with the Now card's 15-minute values.

**Day card** (a `<button>` with `aria-pressed`), unchanged:
- Day name (serif), date, weather emoji, high (bold) and low (`--ink-soft`), condition text, "Rain n%".
- Holiday or celebration: a pumpkin tag inside the card ("Halloween").
- Hazard day: an "Indoor day" tag in `--warning`.
- Featured activity: its photo (4:3 tile) and title at the bottom, title clamped to two lines.
- Selected: 2px `--accent` border and `--selected` background. One at a time.

**Weather warnings**: a `--tint` panel, 20px radius. One line per warning, each starting with "⚠︎" in `--warning`, then the forecast reminder in 14px `--ink-soft`. On a clear day only the reminder shows. Plain and calm, never red. The existing wording is kept exactly.

**What to wear**: `--tint` panel, 20px radius, "🧥 What to wear" heading, Wear and Bring lists. Never collapsed or hidden. On phones it comes before everything else under the strip.

**Weather status line**: inside the Weather section, a `--surface` card like the status area (below), for "Getting the weather…" and the weather error with its Try again button.

### Explore

**Status area**: under the "Explore" heading. A `--surface` card, 20px radius, 16px padding, one sentence and at most one button. Loading text is `--ink-soft`, with no spinner and no placeholder cards. Error has a 4px left border in `--accent` and a secondary "Try again" button. Never a red banner.

**Interest tabs**: after the first search, the seven interests appear again at the top of Explore as a row of chips (scrolls sideways on phones), with the searched one chosen. Choosing another interest searches that one, **once per visit**: results for an interest already searched this visit are shown again from memory, with no new request. A small "✓" on a chip marks interests already loaded. "All" searches only the interests not loaded yet. Changing the location or walking time clears what's loaded.

**Filters**: one row under the tabs: Setting (All / Indoors / Outdoors) and Explored (All / Not explored yet / Explored) as small segmented controls, then "Clear filters" as a text button. Under them, in 14px `--ink-soft`: "{n} places · walking times from Google". When places are hidden by the walking limit: "{n} places are more than a {limit}-minute walk."

**Weather limitation line**: 14px `--ink-soft`, above the list: "These notes use the forecast for the whole area and fixed temperature levels. They're a starting point, not a safety check. Use your own judgement and your setting's rules."

**Place card** (`<article>`), `--surface`, 20px radius, 16px padding, 1px `--line` border. Two parts:

1. **From Google** (top, on `--surface`):
   - A number badge (28px circle, `--accent`, `--accent-ink`, matching the map marker), then the place name as the h3 (a `<button>` styled as a heading, opens details), clamped to two lines.
   - Address, 14px `--ink-soft`.
   - Walking line: "🚶 12 min walk · 0.6 mi" (16px / 600, tabular), then "Google walking estimate" (13px `--ink-soft`). Or "Walking time unavailable" in `--ink-soft`, or "Checking walking time…".
2. **Little Days notes** (bottom, a `--tint` box, 12px radius, 12px padding, a 13px / 600 `--ink-soft` label "Little Days notes"):
   - Category tag, and the setting ("Outdoors" or "Indoors", marked "estimate")
   - Access line (PRD.md 7.11) in 14px. An estimate reads as PRD.md 7.11 words it ("Business (Little Days estimate). Access not verified."); "Access not verified." is always in the same line, never hidden. "Contact before a classroom visit" follows in 14px / 600. A verified line (none in version 1) would carry a "Verified" tag in `--leaf-ink` and its source, and never sit inside the Little Days notes box.
   - Weather note: "⚠︎" + text in the warning style, or the clear-day line
   - Age note in 14px
   - The idea: "Notice: …" (one line from the guide)
3. **Footer row**: "Save" (secondary) on the left and "Details" (secondary) on the right; both 44px. A saved place shows its status tag instead of Save ("Want to explore", "Explored · 2 visits", or "Revisit").

An **explored place stays in the list**. Its idea line reads "Next visit: …", from the next guide set, so revisiting offers a new perspective. Its card gets a small "Explored" tag in `--leaf-ink`.

The two-part card is how Google content is visually separated from Little Days content (Google's policy asks for a border, background or whitespace between them).

**Selected place**: when a card's details are open, or its marker was the last tapped, the card gets the `--selected` background and a 2px `--accent` border, and its marker grows (`scale: 1.2`).

**Map frame**: 20px radius, 1px `--line` border, `overflow: hidden`. Google's logo, attribution and terms links are never covered by our own elements; the phone peek card sits above them with enough bottom margin. Only Google's zoom control is shown (`disableDefaultUI: true`, `zoomControl: true`), plus fullscreen on desktop.

**Markers**: Google's `AdvancedMarkerElement` with a `PinElement`: background `--accent`, border `--accent`, glyph the place's list number in `--accent-ink`. The start marker is a `--ink` pin with the glyph "●" and the title "Start". Markers have the place name as their `title`, so they're announced and reachable by keyboard (`gmpClickable`).

### Place details

A native `<dialog>`, `--bg` background, sections separated by 24px. Order:

1. **Header** (sticky inside the dialog): place name (h2, serif), address, category tag, and "Close" (secondary). Under it, "Places from Google Maps" is not needed because the map below shows Google's attribution.
2. **Map**: 16:10 frame (20px radius) with the start and place markers and the walking route as a `--accent` line, 5px wide, 0.9 opacity. Under it: "🚶 12 min walk · 0.6 mi (Google walking estimate)", any Google warnings under "From Google:" in 14px, then the **route reminder** in a `--tint` box with "⚠︎" in `--warning`. If the route failed: "Walking route unavailable."
3. **Weather**: the selected day's emoji, condition, high/low, rain %, and the weather note.
4. **Before you set off**: access line, age note, and the link "Check hours and details on Google Maps ↗" (opens in a new tab).
5. **Little Days ideas**: one `--tint` panel, 20px radius, labelled "Little Days ideas", with short h3 sections: Why explore this place? · What children might notice · Before you go · During the visit · After the visit · Practical life · At home afterwards (activity titles as buttons that open activity details). Lists are short, one sentence per item, no bullets heavier than a small `--leaf-ink` dot. On a revisit the panel starts with "A new perspective for visit {n}".
6. **Your visits**: two toggles (buttons with `aria-pressed`), "Want to explore" and "Visit again", and "Remove from My Places" as a text button. Under them the journal, newest first: date in bold, the observation, "Next time: …", each entry with a 3px `--tint` left rule. Then a `--surface` box "Record a visit" (date, "What did you notice? (optional)", "An idea for next time (optional)", the hint about children's names) with the primary button "Mark as explored". No scores, badges or streaks.
7. **Add to my week**: a `--surface` box: date (required), time (optional), theme (optional), notes (optional, a 3-row textarea), and "Add to my week" (primary, wide). After adding: "Added to {Sat, Nov 7} ✓" in `--leaf-ink`.

Opening moves focus to the dialog title; Escape and Close close it, and focus returns to what opened it.

### At-home ideas

**Activity card**: `--surface`, 20px radius. Photo (4:3 tile), serif title (a button that opens details), meta line "Indoor · 15 min · Ages 2–3", the holiday-inspired label when it applies, the RootMap description, up to three domain tags in `--ink-soft`, the RootMap safety note in 14px `--ink-soft` with "Safety:" in bold, and an "Add to my week" primary button at the bottom. Unchanged.

**Why these activities?**: `--tint` panel, 20px radius, "💡" heading, two to four sentences. Unchanged.

**Activity details**: native `<dialog>`, max 520px wide on desktop and a bottom sheet on phones. Order: art tile, title, meta, "What you'll need" in a `--tint` box, numbered steps, "What your child practices", then "Add to my week" (primary, wide) and "Close" (secondary). Unchanged.

### My Places

A major section, as prominent as Explore.

- **Heading** "My Places", and directly under it the **Google Maps text attribution** (component "Google attribution" below), since this list shows Google content without a map. My week shows it above its rows when any place entry is listed.
- **Status tabs**: three tabs as a segmented control with counts: "Want to explore (3)" · "Explored (5)" · "Revisit (1)". The first tab with places is shown first.
- **Saved place card**: `--surface`, 20px radius. Name (h3, serif) and address, then "Last explored Nov 2 · 2 visits" or "Saved Nov 4" in 14px `--ink-soft`, the latest "Next time" idea, and "Exploration history (n)" as a `<details>` showing the journal. "Open" (secondary) and "Remove" (text button) at the bottom. Status is changed in place details.
- A place whose details couldn't be fetched shows "Place details unavailable right now" as its title, in `--ink-soft`, with the status, note and Remove still working.
- **Empty tab**: "No places here yet." plus one helpful line: Want to explore → "Save places from Explore to plan your next walk."; Explored → "Mark places as explored after you visit."; Revisit → "Places you'd like to see again, with fresh ideas, appear here."

### My week

One `--surface` card with rows (day + date on the left, entries on the right). Each row shows that day's weather in 14px when it's in the forecast ("☀️ 64° / 48° · Rain 10%") or "Forecast not available yet for this date." in `--ink-soft`.

- **Place entry**: "📍" + place name (button, opens details), then time and theme on one line ("10:00 · Things with wheels"), notes in 14px `--ink-soft`, and "Edit" and "Remove" text buttons. Edit turns the entry into a small `--surface` form in place.
- **Activity entry**: activity title (button, opens activity details) and "Remove".
- Empty days say "Nothing planned" in `--ink-soft`. On phones each row stacks day above entries.

### Shared

**Tags**: pill, 13px / 600, 2px × 10px padding, background is the color at 15% (`color-mix`), text is the full color.

**Buttons**
- Primary: `--accent` background, `--accent-ink` text, 12px radius, at least 44px tall.
- Secondary: transparent, `--accent` text and border.
- Text button: no border, `--accent`, underlined, still at least 44px tall as a target.
- Added / Explored: transparent, `--leaf-ink` text and border, "Added ✓", disabled.
- Disabled (while searching): 50% opacity, `cursor: not-allowed`.
- Focus ring on everything that can be focused: `outline: 2px solid var(--accent); outline-offset: 2px`. Google's Autocomplete uses its own `::part(focus-ring)`, set to the same color.

**Field message** (invalid input): directly under its field, 14px, `--ink`, starting with "⚠︎ ". The field border turns `--accent`.

**Google attribution** (where Google content is shown without a visible map: the phone List view, My Places, My week): the text "Google Maps" with `translate="no"`, `font-family: Roboto, var(--font-body)` (no font is loaded), 14px / 400, color `--google-gray`, never wrapped, at the top or bottom of the same container. Never hidden, covered or restyled beyond these rules.

**Footer**: `--tint` band. Attributions ("Map data and places © Google" is shown by the map itself; the footer says "Weather by Open-Meteo · Holidays by Nager.Date · Activities from RootMap"), then "Your data" in three labeled `.data-group` parts so each action is easy to find:
- **Privacy**: the existing bullet list (nothing leaves the browser, location is optional, etc.).
- **Backup & restore**: a short paragraph explaining that a backup file can move data to another browser or serve as a copy, and that restoring replaces (not merges) what's saved; "Save a backup file" and "Restore from a backup file" buttons.
- **Delete your data**: its own heading and paragraph, visually flagged with `--warning` text since it's destructive and irreversible; "Delete my saved data" button.

## 7. Imagery

- **Activity photos** are the original RootMap photos, copied into `images/activities/` as WebP, 480 and 960 pixels wide.
- Shown in a fixed 4:3 frame (`aspect-ratio: 4 / 3; object-fit: cover`) with 12px corners.
- Every `<img>` has `srcset` (480w, 960w), `sizes`, `width`/`height` (no layout shift), `loading="lazy"` and `decoding="async"`. `alt=""`, because the title next to it says what it shows.
- **Missing photo:** a plain `--tint` tile with the title's first letter in the serif face at 50% opacity. Never a broken-image icon.
- **Places have no photos** in version 1 (Google photos are a pricier field and need author credit). The number badge and category emoji are enough.
- **Weather and categories** use emoji, `aria-hidden="true"`, always next to text that says the same thing: weather ☀️ 🌤️ ⛅ ☁️ 🌫️ 🌧️ ❄️ ⛈️; categories 🌳 🥖 🚒 🎨 🐦 🤸 ✨; places 📍; walking 🚶.
- No icon fonts and no images from outside URLs. Google's map tiles and markers come with the Maps API.

## 8. Motion

Almost none. 150ms fades on hover color and dialog open. Smooth `scroll-snap` on the phone strips. The map's own panning and zooming are left to Google; Little Days adds no animation to it, and fits the map to the markers once per search. Nothing bounces. All transitions are off under `prefers-reduced-motion`.

## 9. Accessibility

- Semantic elements: `<header>`, `<nav>` (header links and the phone bottom bar), `<main>`, `<section>` with headings, `<form role="search">`, `<label>` for every input, `<fieldset>`/`<legend>` for every radio group, `<button>` for every action, `<article>` for place cards, `<dialog>` for details.
- Status areas: `role="status"`, `aria-live="polite"`. Walking times arriving after the list don't announce one by one; one message announces "Walking times are ready."
- Weather, holidays, statuses and categories never rely on color or emoji alone.
- Works with only a keyboard. The list is the main way to reach places; the map is an extra view. Every place on the map is also in the list, in the same order and number.
- On phones, switching to Map moves focus to the map's heading; switching back moves it to the first card.

## 10. Don't

- No gradients, glassmorphism, or big hero images.
- Nothing loaded from a CDN or Google Fonts (Google's Maps API script is the one exception, PRD.md 9.1). The only fonts are the bundled Caveat and Nunito files in `fonts/`. Google's text attribution names Roboto first but allows the sans-serif fallback, so no Roboto is loaded.
- No CSS framework or component library.
- No decorative animation.
- No all-caps text.
- No Google Maps look-alike chrome: no floating search bar over the map, no side drawer, no layer switcher, no Street View.
- No ratings, stars, reviews, opening hours or prices on cards.
- Never hide, cover or restyle Google's logo and attributions.
