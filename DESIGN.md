# Little Days — Design Direction

Read this before writing any CSS or markup.

**Chosen direction: Storybook** ([design/trial-a.html](design/trial-a.html)), with the softer card corners of Paper planner ([design/trial-b.html](design/trial-b.html)). Both trials and the original mockup ([design/mockup.png](design/mockup.png)) are kept for reference. Where they disagree with this file, this file wins.

## 1. Feeling

Like a well-made picture book on the kitchen counter: warm, calm, and a little playful, inspired by nature. It is for the parent, not the child, so it's grown-up and elegant, never cartoonish.

- **Warm, not cute.** Cream paper, forest green, autumn accents. No bubble fonts, mascots, or rainbow colors.
- **Glanceable.** Each day answers "what's the weather, what do we wear, what can we do" in about three seconds.
- **Made for phones.** Most parents will use it one-handed. The phone layout is designed on its own (section 5), not just the desktop layout squeezed down.

## 2. Color

Defined as CSS custom properties on `:root`. Component styles use the tokens, never raw hex values.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#FBF6EC` | Page background (warm cream) |
| `--surface` | `#FFFDF8` | Cards |
| `--tint` | `#F1F3E8` | Soft green panels: art tiles, "What to wear", "Why these activities?" |
| `--ink` | `#22352C` | Main text (deep green-black) |
| `--ink-soft` | `#5E6B63` | Secondary text, labels |
| `--line` | `#ECE3D3` | Borders, dividers |
| `--accent` | `#2F5A46` | Forest green: buttons, selected day, headings, focus ring |
| `--accent-ink` | `#FFFFFF` | Text on accent |
| `--selected` | `#FFF8EC` | Background of the selected day |
| `--sun` | `#E9A93B` | Sunny/hot weather details |
| `--sky` | `#7FA7C9` | Rain/cool weather details |
| `--leaf` | `#6E9A62` | "Added ✓" |
| `--holiday` | `#96421A` | Holiday and celebration tags, holiday-inspired label (deep pumpkin; darkened from `#D9692B` to pass AA on its tint) |
| `--warning` | `#7A4F00` | Weather warning icons, "Indoor day" tag |

Weather, leaf, holiday, and warning colors are only for small tags and text, never large backgrounds. Body text must meet WCAG AA contrast (4.5:1) on `--bg`, `--surface`, and `--tint`.

Dark mode is not part of version 1.

## 3. Type

System fonts only. Nothing is loaded from a CDN, including Google Fonts.

- **Headings** (`--font-head`): `"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif`. Elegant serif for the page title, section headings, day names, and activity titles.
- **Body** (`--font-body`): `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
- Base size 16px, line height 1.5. Headings line height 1.15.

| Role | Desktop | Phone |
|---|---|---|
| Hero title | 56px / 700 | 34px |
| Section heading (h2) | 30px / 700 | 24px |
| Activity title (h3) | 21px / 700 | 19px |
| Day name | 18px / 700 | 16px |
| Body | 16px | 16px |
| Labels, meta, tags | 13–14px / 600 | same |

- Temperatures use `font-variant-numeric: tabular-nums`.
- Sentence case everywhere ("Add to my week"). No all-caps.

## 4. Shape and spacing

- **Corners** (from Paper planner): cards and panels `--radius: 20px`; inputs, buttons, and art tiles `12px`; tags fully rounded.
- **Borders:** 1px `--line`. Shadow at most `0 1px 2px rgba(0,0,0,.04)`, on the controls card only.
- **Spacing** uses a 4px base: 4, 8, 12, 16, 24, 32, 48.
- Content max width 1040px, centered. Side gutter 16px on phones, 24px from 720px up.

## 5. Layout

One column of sections, in the user's order of tasks:

1. **Header**: 🌱 Little Days logo (serif, `--accent`) and a "My week" link that jumps to the plan.
2. **Hero + controls**: title "Every day holds a little adventure.", one line of description, then the controls card with city + Search and the °F / °C switch.
3. **This week**: place and dates line, status area, then the seven-day strip.
4. **Ideas for {day}**: three activity cards for the selected day, then "What to wear" and "Why these activities?".
5. **My week**: the saved plan.
6. **Footer**: "Weather by Open-Meteo · Holidays by Nager.Date".

### Desktop (720px and up)

- Controls on one row: city (wide), unit switch.
- Seven-day strip: all seven cards in one row (`grid-auto-flow: column`, min 132px each). It scrolls sideways inside its own container only if the window is too narrow.
- Ideas: three cards side by side (`repeat(auto-fill, minmax(260px, 1fr))`), with a 120px art tile on top.
- "What to wear" and "Why these activities?" sit side by side, below the ideas.

### Phone (under 720px): designed on its own

- **Hero** is short: 34px title, description, then controls stacked. City and Search stay on one row; the unit switch sits on the next row. The parent reaches the forecast after very little scrolling.
- **Seven-day strip** becomes a sideways-swiping row of compact day cards (112px wide, `scroll-snap-type: x mandatory`). The edge of the next card peeks in so it's clear the row swipes. It doesn't wrap into a tall grid. The page itself never scrolls sideways.
- Compact day cards show day, date, icon, high/low, rain %, the holiday and "Indoor day" tags, and the featured activity's photo. They don't show the condition text or the featured activity's name, to keep them short.
- **"What to wear" comes first**, directly under the strip and above the ideas. On a phone it's the thing a parent checks while getting out the door.
- **Ideas** are stacked full-width cards in a row layout: a 96px photo on the left, then title, meta, description, tags and safety note. (Once the details dialog exists, the description can move there on phones.)
- "Why these activities?" follows the ideas.
- **Activity details** open as a bottom sheet: full width, top corners rounded 20px, max height 90vh, scrolls inside.
- All touch targets are at least 44 × 44px. Spacing between cards is 12px, card padding 16px.

## 6. Components

**Controls card**: `--surface`, 20px radius, 16px padding, the one soft shadow. Labels above fields, 14px / 600. Inputs 44px tall on `--bg` with a `--line` border.

**°F / °C switch**: two radio buttons styled as a segmented control inside a `<fieldset>` with the legend "Temperature". The selected side is `--accent` with `--accent-ink` text.

**Day card** (a `<button>` with `aria-pressed`)
- Day name (serif), date, weather emoji, high (bold) and low (`--ink-soft`), condition text, "Rain n%".
- Holiday or celebration: a pumpkin tag inside the card ("Halloween"). It's part of the card, not a separate banner.
- Hazard day: an "Indoor day" tag in `--warning`.
- Featured activity: its photo (4:3 tile) and title at the bottom of the card, title clamped to two lines so photos line up across the week.
- Selected: 2px `--accent` border and `--selected` background. Only one day is selected at a time.

**Activity card**: `--surface`, 20px radius. Photo (4:3 tile), serif title (later a button that opens details), meta line "Indoor · 15 min · Ages 2–3", the holiday-inspired label when it applies ("Halloween-inspired idea", holiday tag style), the RootMap description, up to three domain tags in `--ink-soft`, the RootMap safety note in 14px `--ink-soft` with "Safety:" in bold, and later an "Add to my week" primary button at the bottom.

**Weather warnings**: a `--tint` panel, 20px radius, directly above the three ideas. One line per warning, each starting with "⚠︎" in `--warning`, then the forecast reminder in 14px `--ink-soft`. On a clear day only the reminder shows. Warnings are plain and calm, never red or alarming.

**What to wear** and **Why these activities?**: `--tint` panels, 20px radius. A heading with an emoji (🧥 / 💡), then a short list or two sentences. "What to wear" is never collapsed or hidden.

**Tags**: pill, 13px / 600, 2px × 10px padding, background is the color at 15% (`color-mix`), text is the full color.

**Buttons**
- Primary: `--accent` background, `--accent-ink` text, 12px radius, at least 44px tall.
- Secondary: transparent, `--accent` text and border.
- Added: transparent, `--leaf` text and border, "Added ✓", disabled.
- Disabled (while searching): 50% opacity, `cursor: not-allowed`.
- Focus ring on everything that can be focused: `outline: 2px solid var(--accent); outline-offset: 2px`.

**Activity details**: native `<dialog>`, max 520px wide on desktop and a bottom sheet on phones. Order: art tile, title, meta, "What you'll need" in a `--tint` box, numbered steps, "What your child practices", then "Add to my week" (primary, wide) and "Close" (secondary). Escape closes it.

**My week**: one `--surface` card with seven rows (day + date on the left, items on the right). Empty days say "Nothing planned" in `--ink-soft`. Each item has a "Remove" text button. On phones each row stacks day above items.

**Status area**: under the "This week" heading. A `--surface` card, 20px radius, 16px padding, one sentence and at most one button. Loading text is `--ink-soft`, with no spinner and no placeholder cards. Error has a 4px left border in `--accent` and a secondary "Try again" button. Never a red banner.

**Field message** (invalid input): directly under the city row, 14px, `--ink`, starting with "⚠︎ ". The field border turns `--accent`.

## 7. Imagery

- **Activity photos** are the original RootMap photos, copied into `images/activities/` as WebP, 480 and 960 pixels wide. They're real photos of children doing the activity, which suits the warm, grown-up feel better than illustrations.
- Shown in a fixed 4:3 frame (`aspect-ratio: 4 / 3; object-fit: cover`) with 12px corners, so photos of different shapes line up.
- Every `<img>` has `srcset` (480w, 960w), `sizes`, `width`/`height` (no layout shift), `loading="lazy"` and `decoding="async"`. `alt=""`, because the title right next to it says what it shows.
- **Missing photo:** a plain `--tint` tile with the title's first letter in the serif face at 50% opacity. Never a broken-image icon.
- **Weather** still uses emoji (☀️ 🌤️ ⛅ ☁️ 🌫️ 🌧️ ❄️ ⛈️), `aria-hidden="true"`, always next to text that says the same thing.
- No icon fonts and no images from outside URLs.

## 8. Motion

Almost none. 150ms fades on hover color and dialog open. Smooth `scroll-snap` on the phone strip. Nothing bounces. All transitions are off under `prefers-reduced-motion`.

## 9. Accessibility

- Semantic elements: `<header>`, `<main>`, `<section>` with headings, `<form role="search">`, `<label>` for every input, `<fieldset>`/`<legend>` for the unit switch, `<button>` for every action, `<dialog>` for details.
- Status area: `role="status"`, `aria-live="polite"`.
- Weather and holidays never rely on color or emoji alone.
- Works with only a keyboard. The day strip is a list of buttons in date order.

## 10. Don't

- No gradients, glassmorphism, or big hero images.
- No web fonts and nothing loaded from a CDN.
- No CSS framework or component library.
- No decorative animation.
- No all-caps text.
