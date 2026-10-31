# AGENTS.md

Rules for any coding agent working in this repository.

## Read first

1. `PRD.md` — what to build. It is the source of truth for features and behavior.
2. `DESIGN.md` — how it should look. Follow it before styling anything.
3. `PROPOSAL.md` — the original idea, for background only.

If these files disagree, PRD.md wins for behavior and DESIGN.md wins for appearance. If something isn't covered, ask instead of guessing.

## The main rule

**Use the simplest code that works, and add nothing I did not ask for.**

That means:

- Build only what PRD.md describes. No extra features, settings, pages, or "nice to have" additions.
- No frameworks, libraries, build tools, bundlers, TypeScript, or package managers. No `package.json`. No React, no Tailwind.
- Nothing loaded from a CDN or any outside URL: no web fonts, no icon sets, no scripts, no stylesheets. The only outside URLs in the code are the three API endpoints.
- Plain HTML, CSS, and JavaScript that runs by opening the page in a browser.
- Prefer a short, readable function over a clever one. Prefer fewer files over more.
- Don't add abstractions, config systems, classes, or helpers until the same code is needed in at least two places.
- Don't add comments that only repeat what the code says. A short comment explaining *why* is fine.
- Don't refactor or reformat code you weren't asked to change.

## Project structure

```
index.html         the page
style.css          all styles
app.js             fetching, combining data, rendering (uses the two files below)
recommend.js       weather conditions, seasons, and activity picking; no page code, so tests can run it
activities.js      the 37 RootMap activities and local celebrations (generated once, see below)
images/activities/ WebP copies of the RootMap activity photos
tests/             Node tests for recommend.js: node --test tests/recommend.test.js
design/            mockup and trial pages (reference only)
```

Don't add files beyond these without asking. The one exception is `api/`, described below.

## APIs and keys

The project uses three APIs, and **none of them needs a key**:

- Open-Meteo Geocoding (city → latitude/longitude)
- Open-Meteo Forecast (weather)
- Nager.Date (public holidays)

Call them directly from `app.js` with `fetch`. The whole site stays static and is deployed on GitHub Pages.

Every fetch follows this pattern:

- Use `fetch()` with `await` inside an `async` function. No `.then()` chains, no XMLHttpRequest.
- Wrap it in `try/catch`.
- Check `response.ok` before reading the body, because a 404 or 400 does not throw.
- For the geocoder, also check that `data.results` exists, because "not found" comes back as `200` with no `results`.
- On failure, show the matching state from PRD.md section 8 and `console.error` the details.

Use only the field names listed in PRD.md section 7.2. They were checked against real responses. Don't guess field names. If you need a field that isn't listed, `console.log` the real response first and tell me what you found.

Keep the fetching code short and easy to follow. I have to be able to explain every line of it myself.

If a future feature ever needs an API key:

- The project gets **one** serverless function in `api/` that holds the key (read from an environment variable) and calls that API.
- The key never appears in `index.html`, `app.js`, `activities.js`, or anywhere in the git history. Never commit a `.env` file.
- Everything else stays static. Only that one function runs on a server.
- Don't add this function unless I ask for a feature that needs it.

## Data and storage

- Activities and local celebrations live in `activities.js`, in the shape PRD.md section 7.5 describes.
- Every activity comes from RootMap. Don't write new activities or change anything inside an entry's `rootmap` part: it is the original text, copied from RootMap at the commit named at the top of the file. Little Days additions go only in `littleDays`.
- Never present a Little Days judgement (place, weather, season, holiday tag) as if it were RootMap's. Holiday tags are shown as "holiday-inspired".
- Never change the RootMapMVP repository.
- Save the city, child's age, and weekly plan in `localStorage` only. No cookies, no backend, no database.
- Wrap `localStorage` reads and writes in `try/catch` so the page still works if storage is blocked.

## States

Every state in PRD.md section 8 (empty, loading, error, invalid input, in use) must look and behave exactly as written there, with the wording given. Build the error state early, while the code is still short, and test it with DevTools → Network → Offline.

## HTML

Use semantic HTML: `<header>`, `<main>`, `<section>` with headings, `<form>` for the search, `<label>` for every input, `<button>` for every action, `<dialog>` for activity details. No clickable `<div>`s. It must be readable on a phone.

## Working style

- Do one piece at a time, as I ask for it. Don't build the whole app in one go.

- Commit directly to `main`. No branches unless I ask for one.
- Make small commits, each with a clear message saying what changed.
- After a change to `recommend.js` or `activities.js`, run `node --test tests/recommend.test.js`.
- After a change, open `index.html` in a browser (or a local static server) and check it works, including at phone width. Say what you checked.
- The page must never say outdoor play is "safe". Weather advice stays conservative (PRD.md 7.4).
- If something is broken or you skipped a step, say so plainly.
- Don't commit, push, open a pull request, or deploy unless I ask.
