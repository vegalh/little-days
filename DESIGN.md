# Little Days — Design Direction

Read this before writing any CSS or markup.

**Chosen direction: RootMap family.** Little Days now shares RootMap's palette, fonts, controls and icons (sections 2–4). The earlier Storybook trial ([design/trial-a.html](design/trial-a.html)) and Paper planner ([design/trial-b.html](design/trial-b.html)) and the original mockup ([design/mockup.png](design/mockup.png)) are kept for reference only. Where they disagree with this file, this file wins.

## 1. Feeling

A neighborhood field guide: like a well-made nature journal with a real map tucked inside. Warm, calm, a little playful. It is for the adult (parent or teacher), not the child, so it's grown-up and elegant, never cartoonish.

- **Warm, not cute.** Cream paper, forest green, autumn accents. No bubble fonts, mascots, or rainbow colors.
- **Show the world before the settings.** The first screen answers three things: where am I exploring from, what's nearby, and which place is worth visiting. Everything else is one tap away, in Filters, the place details or another view.
- **A guide, not a map app.** The map and the place cards work as a pair, and the map is prominent, but it's a window on the neighborhood, not a GIS tool. No toolbars, layer menus, or dense controls. One map, one list, a few gentle filters.
- **Not a dashboard.** No data tables, KPI tiles, or admin-style sidebars, even in Classroom mode.
- **Glanceable.** A place card answers "what is it, how far is the walk, what kind of place, what might we notice" in about three seconds. Longer guidance waits in the details.
- **Honest.** What Google and Open-Meteo say looks different from what Little Days suggests (section 6, "Verified and Little Days content").
- **Made for phones.** Most families use it one-handed. The phone layout is designed on its own (section 5), not the desktop layout squeezed down.

## 2. Color

A clean, warm, modern palette: primarily white with subtle warm-neutral accents and a soft olive green for selected states and primary actions. Minimal, mobile-first, and restrained — no decorative gradients, illustrations, or ornamental lines. The fonts, shapes and icons still broadly follow RootMap (sections 3–4).

Defined as CSS custom properties on `:root` in `style.css`. **`style.css` is the source of truth**: this table lists exactly what it defines. Component styles use the tokens, never raw hex values. Don't rename a token that's in use; add a new one only when a component needs it, and add it here.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#FFFFFF` | Page background |
| `--surface` | `#FFFFFF` | Cards, controls, status areas |
| `--tint` | `#FAFAF8` | Soft off-white panels: Little Days notes, What to wear, the segmented-control track |
| `--apricot` | `#FBEFD9` | Warm boxes: weather warnings, the route reminder |
| `--peach` | `#F6D9A8` | Warm highlight (defined for accents) |
| `--selected` | `#EAF0D8` | Selected pill and day, selected place card, "Use my location" fill |
| `--ink` | `#26251F` | Main text |
| `--ink-soft` | `#77766F` | Secondary text, labels, unselected controls |
| `--heading` | `#26251F` | Headings, logo, place and activity titles (same as body ink — headings get hierarchy from size and weight, not color) |
| `--accent` | `#718C43` | Olive green: buttons, selected text, focus ring, markers, route line |
| `--accent-ink` | `#FFFFFF` | Text on accent |
| `--line` | `#EAE8E2` | Borders, dividers |
| `--sky` | `#7FA7C9` | Rain/cool details (defined, not used yet) |
| `--leaf-ink` | `#4B6B2E` | "Added ✓", status tags |
| `--holiday` | `#96421A` | Holiday tags |
| `--warning` | `#8A5A00` | Warning icons, "Indoor day" tag |
| `--google-gray` | `#5E5E5E` | Only Google's "Google Maps" text attribution |
| `--shadow` | `0 1px 2px rgba(38,37,31,.04), 0 6px 20px rgba(38,37,31,.06)` | The one soft shadow, only on things that float: the Ages list and the map preview |

Text on a peach, apricot or tint background is `--ink`, never the accent color at small sizes.

Shape tokens: `--radius` (20px, cards) and `--radius-small` (14px, controls, RootMap's `--radius-control`). Font tokens: section 3.

Sky, leaf, holiday, and warning colors are only for small tags and text, never large backgrounds. Body text must meet WCAG AA contrast (4.5:1) on `--bg`, `--surface`, `--tint` and `--apricot`.

**Map colors.** Markers and the route line use `--accent` (read with `getComputedStyle`, since Google's map can't read CSS variables). The start marker uses `--ink`. The map keeps Google's default style.

Dark mode is not part of version 1. The Autocomplete element is set to `color-scheme: light` so it matches.

## 3. Type

RootMap's two fonts, **bundled with the site** in `fonts/` (woff2, SIL Open Font License, `fonts/OFL.txt`). Nothing is loaded from Google Fonts or any CDN, which also keeps the site fast in mainland China.

- **Headings** (`--font-head`) and **Body** (`--font-body`): both `"Nunito", system-ui, sans-serif`, weights 400, 600, 700. One clean, rounded sans-serif family for everything — the logo, page title, section headings, day names, place and activity titles, and body text. English heading sizes are tuned down to roughly match the Chinese sizes below, so the hierarchy reads the same in both languages.
- **Chinese** (`html:lang(zh-CN)`) uses the system's Chinese font, as RootMap does: `"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif`, never a downloaded one (a full Chinese font is too large, and Google Fonts is slow in mainland China). Headings are weight 600 with slight letter spacing, at Chinese sizes: page title 22px (phone 20px), section headings 24px (phone 22px), card titles as the table below, panel and detail headings 18px, day names 16px. Line height 1.65. `text-autospace: normal` puts a small gap between Chinese and Latin text or numbers (addresses, postal codes, "2–6 岁"), and `line-break: strict` keeps closing punctuation off the start of a line; browsers without them skip them.
- **EN / 中文 switch:** a small pill at the end of the top bar (white, olive-green bold text, 1px `--line` border, 44px tall), showing the other language in its own script.
- Base size 16px, line height 1.5. Headings line height 1.15, color `--heading` (same as body ink).

| Role | Desktop | Phone |
|---|---|---|
| Logo | 22px / 700 | 20px |
| Page title (h1) | 24px / 700 | 22px |
| Section heading (h2) | 24px / 700 | 22px |
| Place title (h3) | 18px / 700 | same |
| Activity and saved-place title (h3) | 19px / 700 | same |
| Panel and detail headings | 18px / 700 | same |
| Day name | 17px / 700 | same |
| Body | 16px | 16px |
| Labels, meta, tags | 13–14px / 600 | same |

English sizes were rescaled down from the earlier (Caveat) sizes to line up with the Chinese sizes above, since Nunito reads larger at a given size than a handwritten script does.

- Temperatures, walking minutes and distances use `font-variant-numeric: tabular-nums`.
- Sentence case everywhere ("Add to my week", "Want to explore"). No all-caps.

## 4. Shape and spacing

- **Corners:** cards, panels and the map frame `--radius: 20px`; inputs, buttons and art tiles `--radius-small: 14px`; chips and segmented tracks 12px; tags fully rounded.
- **Borders:** 1px `--line`, on cards and secondary buttons alike.
- **Shadow:** cards are flat, with only their border. `--shadow` is kept for what floats above the page (Ages list, map preview).
- **Cards share one rule** in `style.css` (`.status`, `.now-card`, `.hours`, `.idea`, `.plan`, `.place-card`, `.saved-place`): `--surface`, 1px `--line`, `--radius`. No card sits inside another card on Explore.
- **Segmented controls** (°F/°C, Family/Classroom, walking time, Setting, Explored, My Places tabs) follow RootMap's: a `--tint` track with 2px padding and 12px corners, each option 44px tall; the selected segment is `--selected` with `--accent` bold text and 9px corners. Unselected segments are `--ink-soft`.
- **Interest chips** follow RootMap's filter pills: `--surface`, 1px `--line`, 12px corners; the selected pill is `--selected` with an `--accent` border and text.
- **Icons:** RootMap's line icons (24 × 24, 1.8 stroke, `currentColor`) for navigation: compass (Explore), sun (Weather), heart (My Places), calendar (My week), plus a pin, a folded map, and a compass for the location/example/search buttons. Interest and category labels are plain text, no emoji — kept visually restrained per the mobile-first redesign. Weather emoji stay, always next to text that says the same thing.
- **Spacing** uses one scale: 4, 8, 12, 16, 24, 32 (48 for the search controls' height). Icon to label 8, label to input 8, related controls 8–12, card padding 16, between major sections 24. Use a value from the scale; the only exceptions are the 2px segmented track and a border's own compensation.
- Content max width 1040px, centered, except the Explore section, which may widen to 1200px on large screens so the map has room. Side gutter 16px on phones, 24px from 720px up.

## 5. Layout and navigation

### Navigation

Little Days is **four views, one shown at a time**: **Explore** (with the search and the map), **Weather** (with the at-home ideas), **My Places** and **My week**. The URL hash chooses the view (`#explore`, `#weather`, `#my-places`, `#my-week`), so links like "More weather" and the browser's back button work without a router. The current tab has `aria-current="page"`: olive-green text with an olive-green underline in the top bar, bold olive-green in the phone's bottom bar. Switching views scrolls to the top. The footer (Your data) shows under every view.

Explore has three parts, in this order in the page: search, map, places. Below 960px they stack in one column. From 960px the search and places share the left column (`minmax(360px, 5fr)`) and the map fills the right (`7fr`), sticky so it stays in view while the cards scroll. The search doesn't take a column of its own.

The section table below lists where each part lives.

| Section | id | Reached by |
|---|---|---|
| Explore (search, map, places) | `#explore` | "Explore" link and the logo; below 960px a search brings the map to the top (`scrollIntoView`, no smooth scroll under reduced motion) |
| Weather | `#weather` | "Weather" link, and "More weather" in the compact weather line; shown once a location is chosen |
| Ideas for {day} | `#ideas` | optional at-home ideas, under Weather |
| My Places | `#my-places` | "My Places" link (with a count when there are saved places) |
| My week | `#my-week` | "My week" link |
| Footer | — | — |

**Header:** compact, 8px above and below its 44px controls. An original two-leaf sprout mark (inline SVG, `--heading`, `.logo-mark`) next to the "Little Days" wordmark (`--accent`) on the left, links "Explore · Weather · My Places · My week" on the right. On phones the header links move to a **bottom bar** (fixed, `--surface`, top border `--line`, four equal 44px+ targets with an emoji above a 12px label: 🧭 Explore, ☀️ Weather, 📍 My Places, 🗓️ My week, `env(safe-area-inset-bottom)` padding), so they're reachable with a thumb. The page gets matching bottom padding so nothing hides behind it.

### Page order

1. **Header**
2. **Search** (Explore): the title "Little adventures, close to home.", then:
   1. Address field and location button, in one row
   2. Location line (once chosen)
   3. Compact weather line (once chosen)
   4. "Explore nearby" and Filters, in one row
   5. Filter summary (when something differs from the defaults)
   6. Filters panel (collapsed)
3. **Map** (Explore): the map, or the Explore status in its slot.
4. **Places** (Explore): interest tabs, one short line of notes, then the cards.
5. **Weather** (`#weather`): Now, Next hours, the seven-day strip, then warnings and "What to wear" for the selected day.
6. **Ideas for {day}** (`#ideas`): optional at-home ideas: three activities and "Why these activities?".
7. **My Places** (`#my-places`).
8. **My week** (`#my-week`).
9. **Footer**: attributions, then "Your data" in three labeled parts: Privacy, Backup & restore, Delete your data.

### Desktop (720px and up)

- **Weather:** Now and Next hours side by side in one panel; the seven-day strip below (seven cards in one row, `grid-auto-flow: column`, min 132px each, scrolls sideways inside its own container only if needed); warnings and "What to wear" side by side below the strip.
- **Explore:** from 960px, search and cards on the left, the map on the right: `position: sticky; top: 16px; height: calc(100vh - 84px)`, max 760px, so it fits under the header with Google's logo in view. Between 720px and 960px it's the phone's single column with a wider map, and cards two to a row.
- **Ideas:** three cards side by side (`repeat(auto-fill, minmax(260px, 1fr))`), then "Why these activities?".
- **My Places:** status tabs, then cards in two columns.
- **Place and activity details:** centered `<dialog>`, max 640px wide (place) or 520px (activity), max height 90vh, scrolls inside.

### Phone (under 720px): designed on its own

- **First screen** (390 × 844): header, one-line title, search row, "Explore nearby" with Filters, and the map slot, with no scrolling. No supporting paragraph, and no controls card around the search.
- **Weather:** Now on top, Next hours as a sideways-swiping row of six columns, then the seven-day strip as a sideways-swiping row of compact day cards (112px wide, `scroll-snap-type: x mandatory`, the next card peeking in). Neither wraps into a tall grid, and the page itself never scrolls sideways. Warnings and "What to wear" follow, stacked.
- **Explore:** map first, cards right below it, always together. There's no List/Map switch.
  - **Map:** full width, `height: clamp(240px, 40dvh, 440px)`. Before a search the slot is smaller (`clamp(160px, 24dvh, 220px)`), with a pin icon and the Explore status on `--tint`. It's never a picture of a map. After a search it comes to the top of the screen, with the first card in view under it. It isn't sticky on phones: that would leave too little room for the cards.
  - **Peek card:** tapping a marker shows a card pinned to the bottom of the map: number, name, walking time and "View details". Google's zoom control sits at the top right so it's never covered.
  - **Cards:** full width, 12px apart.
- **Compact day cards** show day, date, icon, high/low, rain %, holiday and "Indoor day" tags, and the featured activity's photo, but not the condition text or activity name.
- **Ideas** are stacked full-width cards in a row layout: a 96px photo on the left, then title, meta, description, tags and safety note.
- **My Places:** tabs scroll sideways if they don't fit; cards are full width.
- **Place and activity details** open as a bottom sheet: full width, top corners rounded 20px, max height 90vh, scrolls inside. The close button stays visible at the top (sticky header inside the sheet).
- All touch targets are at least 44 × 44px. Spacing between cards is 12px, card padding 16px.

## 6. Components

### Controls

The search has no card around it: it sits on the page, 8px between its rows. Labels in the Filters panel are above their fields, 14px / 600, 8px apart. Inputs are 44px tall on `--tint` with a `--line` border and 14px radius; the search row and its buttons are 48px.

**Location**
- **One field.** Google's `<gmp-place-autocomplete>` draws its own border and background on the element, so that's where they're set: `background-color: --tint`, `border: 1px solid --line`, `border-radius: --radius-small`, `font-family`, `color-scheme: light`. `::part(input)` is left plain (`background: transparent`, `border: 0`, `text-overflow: ellipsis`, `!important` to win over Google's part styles). Putting a border on the part as well gives a box in a box. Google's icon and clear button stay in their own 48px slots, which keeps them vertically centered and 12px from the text. `::part(focus-ring)` gets `--accent` as a `border-color` (not `outline-color`, which the part doesn't expose); `::part(prediction-list)` gets `--surface`, a `--line` border and 14px radius; `::part(prediction-item-selected)` gets `--selected`. Google's suggestion attribution is left as it is. Chromium only applies `::part()` rules from a `<link>` stylesheet once that stylesheet is toggled after the custom element upgrades, so `google.js` briefly disables and re-enables the stylesheet (`refreshPartStyles()`) once the Autocomplete element is ready. The label "Address or place" is visually hidden; the placeholder is the visible prompt.
- **"Use my location"**: a 48px secondary icon button beside the field, with its name as `aria-label` and `title`. While asking: disabled, and the location status says "Finding you…".
- **"Try an example address"**: a quiet text button under the Explore status in the empty map slot, only while Google Maps is available and no location is chosen. It fills the field with "221 Washington Street, Newton, MA 02458", sets the location with one Google text search (PRD.md 7.1), and marks the location line "Example address" so it's never mistaken for the adult's own location.
- **Location chosen**: one line under the field, "📍 {address}" in 14px `--ink-soft`, cut short with an ellipsis (the full address is its `title`). "· Example address" stays visible after the ellipsis.
- **If Google Maps is unavailable** (not configured, refused or failed), the Autocomplete is replaced by the earlier city search: a text field named "City (for weather)", placeholder "e.g. Boston", with the browser's suggestion list (`<datalist>`, Open-Meteo geocoding) and a secondary "Show weather" button in the same row. A note under it in 14px: "Maps aren't available right now, so you can check the weather by city." "Explore nearby" is hidden, and nothing in the fallback looks like place discovery: no example button, no map, and the map slot shows the setup or unavailable message.

**Compact weather line**: one line, with no box on an ordinary day: "☀️ 73° · Nice for exploring", or the day's first warning in a few words after a `--warning` "⚠︎" ("🌧️ 52° · ⚠︎ Rain possible"), and "More weather" at the right, linking to `#weather`. On a hazard day it gets an `--apricot` box, 14px radius, with 600-weight text so it can't be missed. The friendly words only appear when today has no hazard, caution or note. While loading: "Getting the weather…" in `--ink-soft`.

**Filters**: a secondary button beside "Explore nearby" (`aria-expanded`, `aria-controls`), with a small `--accent` count badge when something differs from the defaults. It opens a panel in the page, not a dialog, between two `--line` rules, with no background or card, 16px between groups, in this order: Who's exploring, Ages, Walking time, interests, the day, Setting, Explored, Temperature. Pressing "Explore nearby" closes it. Under the buttons, when anything differs: the summary line ("Classroom · 10 min walk · Nature") in 14px `--ink-soft`, and "Reset" as a text button at its right. Classroom alone shows in the summary with no Reset, because Reset keeps the mode.

**Ages**: a custom dropdown ("collapsible listbox" pattern) with label "Ages": a button showing the current value with a caret, opening a themed `--surface` listbox (`--line` border, 12px radius, the one soft shadow) below it; the selected option is `--selected`. Arrow keys, Home/End, Enter/Space, Escape and outside clicks work as expected. A real `<select id="ages">` is kept `hidden` for state and fires its native `change` event when an option is picked, so the rest of the app reads Ages the same way it always has.

**Who's exploring**: segmented control (two radio buttons in a `<fieldset>`, legend "Who's exploring"): Family / Classroom, full width. In Classroom mode, a 14px `--ink-soft` note appears under Walking time: "Google walking estimates may not reflect the time needed when accompanying young children. Check crossings and the route before visiting."

**Walking time**: full-width segmented control, five radio buttons (5, 10, 15, 20, 30), legend "Walking time (minutes)".

**Interests (one search at a time)**: a `<fieldset>` with legend "What would you like to explore?" and **seven radio buttons styled as chips**, text only (no emoji): All · Nature · Everyday Life · Community Helpers · Art & Culture · Animals & Wildlife · Movement, wrapping at their natural width so long Chinese labels never break. One is chosen at a time, and **All is chosen at first**. Choosing "All" shows a 14px `--ink-soft` note: "All searches six kinds of places, so it takes a little longer." Chips: 44px tall, 12px padding, 14px / 600, never wrapped, `--surface` with a `--line` border; chosen chip `--selected` background with an `--accent` border and text.

**°F / °C switch**: two radio buttons styled as a segmented control inside a `<fieldset>` with the legend "Temperature", in Filters.

**Primary button**: "Explore nearby" with the compass icon, 48px tall, filling the row beside Filters. The only filled button in the search. While searching: disabled, "Searching…".

### Weather

**Now**: a `--surface` card: large temperature (40px, tabular), weather emoji and condition, then "Feels like 61°", "Wind 9 mph, gusts 20 mph", "Rain 10% this hour", and the rain amount when it's raining.

**Next hours**: six equal columns (time, emoji, temperature, "Rain n%"), each column 64px min. Each column is labelled with its hour ("6 PM"), including the current one, so it isn't confused with the Now card's 15-minute values.

**Day card** (a `<button>` with `aria-pressed`), unchanged:
- Day name (bold), date, weather emoji, high (bold) and low (`--ink-soft`), condition text, "Rain n%".
- Holiday or celebration: a pumpkin tag inside the card ("Halloween").
- Hazard day: an "Indoor day" tag in `--warning`.
- Featured activity: its photo (4:3 tile) and title at the bottom, title clamped to two lines.
- Selected: 2px `--accent` border and `--selected` background. One at a time.

**Weather warnings**: a `--tint` panel, 20px radius. One line per warning, each starting with "⚠︎" in `--warning`, then the forecast reminder in 14px `--ink-soft`. On a clear day only the reminder shows. Plain and calm, never red. The existing wording is kept exactly.

**What to wear**: `--tint` panel, 20px radius, "🧥 What to wear" heading, Wear and Bring lists. Never collapsed or hidden. On phones it comes before everything else under the strip.

**Weather status line**: inside the Weather section, a `--surface` card like the status area (below), for "Getting the weather…" and the weather error with its Try again button.

### Explore

**Status area**: in the map slot, centered under the pin icon, 14px `--ink-soft` on `--tint`, with no card of its own. One sentence and at most one secondary button. No spinner and no placeholder cards. Never a red banner. (The Weather status keeps the `--surface` card.)

**Interest tabs**: after the first search, the seven interests appear again right under the map as a row of chips (scrolls sideways on phones), with the searched one chosen. Choosing another interest searches that one, **once per visit**: results for an interest already searched this visit are shown again from memory, with no new request. A small "✓" on a chip marks interests already loaded, and is left off when all of them are. "All" searches only the interests not loaded yet. Changing the location or walking time clears what's loaded.

**Notes above the list**: 14px `--ink-soft`, as few lines as possible: "{n} places · walking times from Google, ideas from Little Days", then only what applies: holidays, places over the walking limit, "Weather unavailable…", what couldn't be loaded. In Classroom mode the walking reminder follows in `--ink` / 600. The weather limitation line is in the weather section of the place details, with the weather notes it's about.

**Place card** (`<article>`), one flat card with no boxes inside, 12px top and 16px side padding:

1. The number badge (24px circle, `--accent`, `--accent-ink`, matching the map marker), then the place name (18px / 700) as the h3, a `<button>` styled as a heading with a full 44px target, opens details.
2. Walking line: "🚶 12 min walk · 0.6 mi" (600, tabular) with the category as a soft tag beside it. Or "Walking time unavailable", "Checking walking time…", or "Walking time not checked yet" with "Check walking time".
3. Only when they apply, in 14px: "⚠︎ Outdoor places are better left for another day." on a hazard day; in Classroom mode the round-trip time and "Access not verified. **Contact before a classroom visit.**"
4. The idea: "Little Days idea:" in `--leaf-ink` / 600, then one line from the guide in `--ink-soft`, at most three lines. After a visit the label is "Little Days idea for next visit:", from the next guide set, so revisiting offers a new perspective.
5. Actions, 44px: "View details" (secondary, fills the row), then "Save" with a heart (`.button-quiet`), or the status as a tag ("Want to explore", "Explored · 2 visits", "Revisit").

An **explored place stays in the list**.

Google's content (name, walking time) reads as plain facts; Little Days' additions are a tag and a labelled line in a different color, and the notes above the list say which is which. Whitespace and the label do the separating that the old inner box did.

**Selected place**: when a marker was tapped, or a card was tapped outside its buttons, the card gets the `--selected` background and a 2px `--accent` edge, its marker grows (`scale: 1.25`), and the peek card shows. Hovering or focusing a card grows its marker too.

**Map frame**: 20px radius, 1px `--line` border, `overflow: hidden`. Google's logo, attribution and terms links are never covered by our own elements; the peek card sits above them with enough bottom margin. Only Google's zoom control is shown (`disableDefaultUI: true`, `zoomControl: true`), at the top right. The map is fitted to the markers with 48px above (room for a pin) and 24px on the other sides, so a phone's small map can zoom in.

**Markers**: Google's `AdvancedMarkerElement` with a `PinElement`: background `--accent`, border `--accent`, glyph the place's list number in `--accent-ink`. The start marker is a `--ink` pin with the glyph "●" and the title "Start". Markers have the place name as their `title`, so they're announced and reachable by keyboard (`gmpClickable`).

### Place details

A native `<dialog>`, `--bg` background, sections separated by 24px. Order:

1. **Header** (sticky inside the dialog): place name (h2), address, category and setting tags, and "Close" (secondary). Under it, "Places from Google Maps" is not needed because the map below shows Google's attribution.
2. **Map**: 16:10 frame (20px radius) with the start and place markers and the walking route as a `--accent` line, 5px wide, 0.9 opacity. Under it: "🚶 12 min walk · 0.6 mi (Google walking estimate)", any Google warnings under "From Google:" in 14px, then the **route reminder** in a `--tint` box with "⚠︎" in `--warning`. If the route failed: "Walking route unavailable."
3. **Weather**: the selected day's emoji, condition, high/low, rain %, the weather note, and the weather limitation line in 14px.
4. **Before you set off**: access line, age note, and the link "Check hours and details on Google Maps ↗" (opens in a new tab).
5. **Little Days ideas**: one `--tint` panel, 20px radius, labelled "Little Days ideas", with short h3 sections: Why explore this place? · What children might notice · Before you go · During the visit · After the visit · Practical life · At home afterwards (activity titles as buttons that open activity details). Lists are short, one sentence per item, no bullets heavier than a small `--leaf-ink` dot. On a revisit the panel starts with "A new perspective for visit {n}".
6. **Your visits**: two toggles (buttons with `aria-pressed`), "Want to explore" and "Visit again", and "Remove from My Places" as a text button. Under them the journal, newest first: date in bold, the observation, "Next time: …", each entry with a 3px `--tint` left rule. Then a `--surface` box "Record a visit" (date, "What did you notice? (optional)", "An idea for next time (optional)", the hint about children's names) with the primary button "Mark as explored". No scores, badges or streaks.
7. **Add to my week**: a `--surface` box: date (required), time (optional), theme (optional), notes (optional, a 3-row textarea), and "Add to my week" (primary, wide). After adding: "Added to {Sat, Nov 7} ✓" in `--leaf-ink`.

Opening moves focus to the dialog title; Escape and Close close it, and focus returns to what opened it.

### At-home ideas

**Activity card**: `--surface`, 20px radius. Photo (4:3 tile), bold title (a button that opens details), meta line "Indoor · 15 min · Ages 2–3", the holiday-inspired label when it applies, the RootMap description, up to three domain tags in `--ink-soft`, the RootMap safety note in 14px `--ink-soft` with "Safety:" in bold, and an "Add to my week" primary button at the bottom. Unchanged.

**Why these activities?**: `--tint` panel, 20px radius, "💡" heading, two to four sentences. Unchanged.

**Activity details**: native `<dialog>`, max 520px wide on desktop and a bottom sheet on phones. Order: art tile, title, meta, "What you'll need" in a `--tint` box, numbered steps, "What your child practices", then "Add to my week" (primary, wide) and "Close" (secondary). Unchanged.

### My Places

A major section, as prominent as Explore.

- **Heading** "My Places", and directly under it the **Google Maps text attribution** (component "Google attribution" below), since this list shows Google content without a map. My week shows it above its rows when any place entry is listed.
- **Status tabs**: three tabs as a segmented control with counts: "Want to explore (3)" · "Explored (5)" · "Revisit (1)". The first tab with places is shown first.
- **Saved place card**: `--surface`, 20px radius. Name (h3) and address, then "Last explored Nov 2 · 2 visits" or "Saved Nov 4" in 14px `--ink-soft`, the latest "Next time" idea, and "Exploration history (n)" as a `<details>` showing the journal. "Open" (secondary) and "Remove" (text button) at the bottom. Status is changed in place details.
- A place whose details couldn't be fetched shows "Place details unavailable right now" as its title, in `--ink-soft`, with the status, note and Remove still working.
- **Empty tab**: "No places here yet." plus one helpful line: Want to explore → "Save places from Explore to plan your next walk."; Explored → "Mark places as explored after you visit."; Revisit → "Places you'd like to see again, with fresh ideas, appear here."

### My week

One `--surface` card with rows (day + date on the left, entries on the right). Each row shows that day's weather in 14px when it's in the forecast ("☀️ 64° / 48° · Rain 10%") or "Forecast not available yet for this date." in `--ink-soft`.

- **Place entry**: "📍" + place name (button, opens details), then time and theme on one line ("10:00 · Things with wheels"), notes in 14px `--ink-soft`, and "Edit" and "Remove" text buttons. Edit turns the entry into a small `--surface` form in place.
- **Activity entry**: activity title (button, opens activity details) and "Remove".
- Empty days say "Nothing planned" in `--ink-soft`. On phones each row stacks day above entries.

### Shared

**Tags**: pill, 13px / 600, 2px × 10px padding, background is the color at 15% (`color-mix`), text is the full color.

**Buttons** (one base rule on `button`, then variants): inline-flex, icon and label centered, 8px between them, at least 44px tall, 16px side padding, 14px radius, weight 600. A short label never wraps (`white-space: nowrap`).
- Primary (the default): `--accent` background, `--accent-ink` text. At most one per area.
- Secondary (`.button-secondary`, and `.toggle` and `.perspective`, which fill with `--accent` when pressed): `--surface`, `--accent` text, 1px `--line` border that turns `--accent` on hover.
- Quiet (`.button-quiet`): no border or fill, `--ink-soft`, for the lesser of two actions.
- Icon (`.icon-button`): a secondary button as a square.
- Text (`.link-button`): no border, `--accent`, underlined, may wrap, still 44px tall as a target.
- Title buttons (`.place-title`, `.idea-title`): look like the heading, wrap freely, 44px tall.
- Added / Explored: transparent, `--leaf-ink` text and border, "Added ✓", disabled.
- Disabled (while searching): 50% opacity, `cursor: not-allowed`.
- Focus ring on everything that can be focused: `outline: 2px solid var(--accent); outline-offset: 2px`. Google's Autocomplete uses its own `::part(focus-ring)`, set to the same color.

**Field message** (invalid input): directly under its field, 14px, `--ink`, starting with "⚠︎ ". The field border turns `--accent`.

**Google attribution** (where Google content can be seen without a visible map: above the place cards, which scroll past the map on phones, My Places, My week): the text "Google Maps" with `translate="no"`, `font-family: Roboto, var(--font-body)` (no font is loaded), 14px / 400, color `--google-gray`, never wrapped, at the top or bottom of the same container. Never hidden, covered or restyled beyond these rules.

**Footer**: `--tint` band. Attributions ("Map data and places © Google" is shown by the map itself; the footer says "Weather by Open-Meteo · Holidays by Nager.Date · Activities from RootMap"), then "Your data" in three labeled `.data-group` parts so each action is easy to find:
- **Privacy**: the existing bullet list (nothing leaves the browser, location is optional, etc.).
- **Backup & restore**: a short paragraph explaining that a backup file can move data to another browser or serve as a copy, and that restoring replaces (not merges) what's saved; "Save a backup file" and "Restore from a backup file" buttons.
- **Delete your data**: its own heading and paragraph, visually flagged with `--warning` text since it's destructive and irreversible; "Delete my saved data" button.

## 7. Imagery

- **Activity photos** are the original RootMap photos, copied into `images/activities/` as WebP, 480 and 960 pixels wide.
- Shown in a fixed 4:3 frame (`aspect-ratio: 4 / 3; object-fit: cover`) with 12px corners.
- Every `<img>` has `srcset` (480w, 960w), `sizes`, `width`/`height` (no layout shift), `loading="lazy"` and `decoding="async"`. `alt=""`, because the title next to it says what it shows.
- **Missing photo:** a plain `--tint` tile with the title's first letter at 50% opacity. Never a broken-image icon.
- **Places have no photos** in version 1 (Google photos are a pricier field and need author credit). The number badge is enough; category is shown as a plain-text tag, not emoji.
- **Weather** uses emoji, `aria-hidden="true"`, always next to text that says the same thing: ☀️ 🌤️ ⛅ ☁️ 🌫️ 🌧️ ❄️ ⛈️. Categories, places and walking are plain text/line icons, no emoji (the one exception is the compact "📍 {address}" location-line status text, kept as emoji because several tests assert its exact text content).
- No icon fonts and no images from outside URLs. Google's map tiles and markers come with the Maps API.

## 8. Motion

Almost none. 150ms fades on hover color and dialog open. Smooth `scroll-snap` on the phone strips. The map's own panning and zooming are left to Google; Little Days adds no animation to it, and fits the map to the markers once per search. Nothing bounces. All transitions are off under `prefers-reduced-motion`.

## 9. Accessibility

- Semantic elements: `<header>`, `<nav>` (header links and the phone bottom bar), `<main>`, `<section>` with headings, `<form role="search">`, `<label>` for every input, `<fieldset>`/`<legend>` for every radio group, `<button>` for every action, `<article>` for place cards, `<dialog>` for details.
- Status areas: `role="status"`, `aria-live="polite"`. Walking times arriving after the list don't announce one by one; one message announces "Walking times are ready."
- Weather, holidays, statuses and categories never rely on color or emoji alone.
- Works with only a keyboard. The list is the main way to reach places; every place on the map is also in the list, in the same order and number. The map is reachable in page order, between the search and the places.
- Filters is a button with `aria-expanded` and `aria-controls`. The closed panel uses `hidden`, so it isn't reachable by keyboard or screen reader. The address field and location button keep their accessible names without visible labels.

## 10. Don't

- No gradients, glassmorphism, or big hero images.
- Nothing loaded from a CDN or Google Fonts (Google's Maps API script is the one exception, PRD.md 9.1). The only font is the bundled Nunito family in `fonts/`. Google's text attribution names Roboto first but allows the sans-serif fallback, so no Roboto is loaded.
- No CSS framework or component library.
- No decorative animation.
- No all-caps text.
- No Google Maps look-alike chrome: no floating search bar over the map, no side drawer, no layer switcher, no Street View.
- No fake map: never tiles, drawings or invented pins in the empty map slot.
- No ratings, stars, reviews, opening hours or prices on cards.
- Never hide, cover or restyle Google's logo and attributions.

## 11. Print

Print My Week (PRD.md 7.9) and Print Adventure Guide (PRD.md 7.14, 7.20) use the same visual language as the rest of the page, carried into a printed, mostly-black-and-white field guide rather than a screen-style layout: native `window.print()`, `@media print`, `@page` and print-only DOM in `#print-area` — no PDF library, no second design system.

- **Typography and color:** the same Nunito/system-Chinese fonts and `--ink`/`--ink-soft` text colors as on screen, at slightly larger, ink-efficient sizes (15–16px body, 18–26px headings) for a comfortable read on paper. Color is used sparingly: the perspective pill ("First visit") keeps `--selected`/`--accent` (`print-color-adjust: exact` makes it render), and weather icons keep their native emoji color; everything else prints in ink-efficient black and gray.
- **Branding:** the same header lockup as the app (the sprout `logo-mark` SVG + "Little Days" wordmark), once at the top of every printed page.
- **Layout:** a single column, generous line-height, and the same gentle borders and rounded corners (`--radius-small`) as on-screen cards — but no shadows (wasted ink) and no background tint behind the whole page (stays `#FFF` so `@page` margins and any printer's own header/footer sit cleanly outside it).
- **A nature-journal feel, not a spreadsheet:** short prose and short bulleted lists, generous whitespace between sections, and two deliberately plain, undecorated spaces for the family to fill in by hand — a ruled note box ("What did we notice?") on every My Week day and the Adventure Guide, and a plain dashed drawing box ("Draw what you noticed") on the Adventure Guide only.
- **Pagination:** a My Week day, a planned item, and a guide section each use `break-inside: avoid` so the browser never splits one across a page boundary. `@page` sets only a margin (14mm), never a fixed `size`, so the browser's own US Letter/A4 choice and "Save as PDF" are respected.
- **What's left out of print:** everything else on the page (header, bottom nav, maps, dialogs, filters) is hidden under `@media print`; the private exploration journal is never printed; a missing forecast or missing place detail shows the same plain-text fallback as on screen, never a guess or a blank gap.
