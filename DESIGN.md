# Little Days — Design Direction

Read this before writing any CSS or markup.

## 1. Feeling

Calm, warm, and easy to use one-handed. Picture a parent holding a toddler and glancing at a phone. It should feel like a tidy paper planner on the kitchen counter, not a kids' app and not a weather dashboard.

- **Warm, not cute.** No cartoon mascots, bubble fonts, or rainbow colors. The parent is the user, not the child.
- **Quiet, not empty.** Soft colors and plenty of space, but every day card should be packed with useful information.
- **Glanceable.** Each day should answer "what's the weather, what do we wear, what can we do" in about three seconds.

## 2. Color

Define these as CSS custom properties on `:root`. Use the tokens everywhere; don't write hex values in component styles.

| Token | Light | Use |
|---|---|---|
| `--bg` | `#FBF7F1` (warm paper) | Page background |
| `--surface` | `#FFFFFF` | Cards |
| `--ink` | `#2E2A26` | Main text |
| `--ink-soft` | `#6B635B` | Secondary text, labels |
| `--line` | `#E8E0D5` | Borders, dividers |
| `--accent` | `#D9784A` (terracotta) | Buttons, selected states, links |
| `--accent-ink` | `#FFFFFF` | Text on accent |
| `--sky` | `#7FA7C9` | Rain, cool weather |
| `--sun` | `#E8B04B` | Sunny, hot weather |
| `--leaf` | `#7FA37A` | Nice weather, "added to plan" |
| `--holiday` | `#B86B8F` | Holiday tags |

Weather and holiday colors are used only for small tags and icons, never for large areas of background. Body text on `--bg` and `--surface` must meet WCAG AA contrast (4.5:1).

Dark mode: optional for version 1. If added, use `@media (prefers-color-scheme: dark)` and redefine the same tokens.

## 3. Type

- System fonts only. Nothing is loaded from a CDN, including Google Fonts: `font-family: ui-rounded, "SF Pro Rounded", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;`. Apple devices get a rounded, friendly face. Others get their clean system font.
- Base size 16px. Line height 1.5.
- Scale: page title 28px / 700, section heading 20px / 700, day name 18px / 700, body 16px / 400, small labels 14px / 600.
- Temperatures use `font-variant-numeric: tabular-nums` so numbers line up.
- Sentence case everywhere ("Add to plan", not "Add To Plan" or "ADD TO PLAN").

## 4. Layout

Top to bottom, in one column:

1. **Header** — "Little Days" and a one-line description.
2. **Controls** — city field with search button, and the age selector, on one row on desktop, stacked on phones.
3. **This week** — seven day cards.
4. **My plan** — the saved weekly plan.

Widths:

- Content max width 960px, centered.
- Phones (< 640px): day cards stack in one column. 16px side padding.
- Tablet and up: day cards in a grid, `repeat(auto-fill, minmax(260px, 1fr))`.
- No horizontal scrolling at any width down to 320px.

Spacing uses a 4px base: 4, 8, 12, 16, 24, 32, 48. Cards have 16px padding and 12px gaps between items.

## 5. Components

**Day card**
- Top row: day name and date on the left ("Sat · Nov 1"), weather icon and high/low on the right.
- Under that: rain chance, and a holiday tag if there is one.
- "Wear" line, then "Bring" line if any, in `--ink-soft` with a small label.
- Activity list: 2–3 rows, each with the title and time ("15 min"). The whole row is clickable and opens the details.
- Card: `--surface`, 1px `--line` border, 12px corner radius, no heavy shadows (at most `0 1px 2px rgba(0,0,0,0.04)`).

**Weather icon**
- Use emoji (☀️ ⛅ 🌧️ ❄️ ⛈️ 🌫️). No icon library.

**Tags** (holiday, weather category)
- Small pill: 14px text, 4px × 8px padding, full radius, tinted background (the token at about 15% opacity) and text in the full color.

**Buttons**
- Primary: `--accent` background, `--accent-ink` text, 8px radius, at least 44px tall.
- Secondary: transparent background, `--accent` text, 1px `--accent` border.
- Visible focus ring on everything that can be focused: `outline: 2px solid var(--accent); outline-offset: 2px`.

**Activity details**
- Use the native `<dialog>` element. On phones it fills the width; on desktop, max 520px wide.
- Order: title, age range and time as tags, materials as a list, numbered steps, benefits, then "Add to plan" (primary) and "Close" (secondary).
- Escape and the Close button both close it.

**My plan**
- Seven rows, one per day. Empty days say "Nothing planned" in `--ink-soft`.
- Each planned activity shows its title and a "Remove" text button.
- When an activity is added, the matching row in the day card shows a small ✓ in `--leaf`.

**Status area** (empty, loading, error, not-found — see PRD.md section 8)
- Sits right under the "This week" heading, full width of the content.
- Plain text in a light card: `--surface`, 1px `--line` border, 12px radius, 16px padding. Never a red banner.
- One sentence and, if useful, one button (for example **Try again**, styled as secondary).
- Loading: the same card with the message in `--ink-soft`. No spinner or skeleton cards.
- Error: the same card with a 4px left border in `--accent`.

**Field message** (invalid input)
- Directly under the city field, 14px, `--ink`, with a ⚠︎ before the text. The field border turns `--accent`.

**Disabled button** (while searching, or "Added ✓")
- 50% opacity, `cursor: not-allowed`. "Added ✓" uses `--leaf` text on a transparent background.

## 6. Motion

Almost none. A 150ms fade on dialog open and on hover color changes. Nothing bounces or slides. Respect `prefers-reduced-motion` by turning transitions off.

## 7. Accessibility

- Use real elements: `<button>` for actions, `<label>` for every input, `<h2>`/`<h3>` for sections and days.
- Touch targets at least 44 × 44px.
- Don't show weather only with color or emoji; always include text (for example "Rain 70%").
- The page must work with only a keyboard.

## 8. Don't

- No gradients, glassmorphism, or big hero images.
- No web fonts and nothing loaded from a CDN.
- No CSS framework or component library.
- No decorative animations.
- No all-caps text.
