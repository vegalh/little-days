# Little Days

**Big discoveries, close to home.**

Little Days helps early childhood teachers and families find real places near their school or home where young children can explore, notice and learn. That means parks and gardens, but also libraries, bakeries, coffee shops, post offices, fire stations and the other everyday parts of a neighborhood.

**Live site:** https://vegalh.github.io/little-days/

## What it does

- **Explore:** a map and list of real nearby places, with Google's walking times. Filter by walking time, ages, kind of place, day, indoors or outdoors, and whether a place usually needs booking.
- **Place guides:** a hand-written guide for each kind of place, with things to notice and ideas for before, during and after a visit.
- **Weather:** a seven-day forecast with conservative advice and what to wear, which also shapes the suggestions for each place.
- **At-home activities:** 37 activities from [RootMap](https://github.com/vegalh/rootmapmvp), chosen for the weather and season.
- **My Places:** saved places and a journal of visits.
- **My week:** a weekly plan that becomes a card for families, ready to screenshot or print with nothing to write. The printed guide ends with a full page for a child's drawing.
- **Classroom and Family modes:** different wording and reminders for a group or a family. Classroom is the default.
- **Chinese and English:** the page opens in Chinese, and the EN button switches and remembers the choice.

## How it stays honest

- Places, addresses, walking times and forecasts come from real API responses. Missing data is shown as missing, never guessed.
- Little Days' own judgements, such as a place's category, booking and access, are labeled as estimates. The page doesn't say that a place welcomes children or has children's classes.
- The page never says a place, walk or route is "safe".

## Privacy

There are no accounts, no backend, no cookies and no analytics. Saved places, plans and notes stay in the browser's `localStorage`, with a backup file the adult can export. Only Google place IDs are stored, and no child's details are collected or sent to any API.

## Cost

Opening the site sends no Places or Routes request and loads no map. New visitors see a fixed example address and free weather, and Google is only asked after **See nearby places** or **Show places**. Places stay in memory for the visit, so moving between pages doesn't search again.

## How it's built

Plain HTML, CSS and JavaScript, with no framework, build step or runtime dependencies. It runs as a static site on GitHub Pages.

| Service | Used for |
|---|---|
| Google Maps JavaScript API, Places API (New), Routes API | Address search, nearby places, maps, walking times |
| Open-Meteo | Forecast, and city search when Google Maps is unavailable |
| Nager.Date | Public holidays |

## Run it locally

You need Python 3 to serve the page. The site runs without a Google key, with weather only.

```sh
cp config.example.js config.js   # add your own Google browser key
python3 -m http.server 8472
```

Then open http://localhost:8472/. `config.js` is gitignored, so never commit a real key. A browser key must be restricted in Google Cloud to your site's addresses and to the three Google APIs above.

## Tests

```sh
npm install
npx playwright install
node --test          # logic tests
npx playwright test  # browser tests, desktop and phone
```

Both suites mock every outside request, so they prove the page handles responses, not that the real APIs work. [tests/LIVE-CHECK.md](tests/LIVE-CHECK.md) is the manual check against the real APIs.

## Deployment

Every push to `main` runs [.github/workflows/pages.yml](.github/workflows/pages.yml), which runs the logic tests, copies the site files and writes `config.js` from repository secrets. It can also be started by hand from the Actions tab.

## Project documents

- [PRD.md](PRD.md): what to build, and the source of truth for behavior
- [DESIGN.md](DESIGN.md): how it should look
- [AGENTS.md](AGENTS.md): rules for coding agents working in this repository
- [PROPOSAL.md](PROPOSAL.md): the original idea, for background

## Credits

Activities and photos come from RootMap. Caveat and Nunito are bundled under the SIL Open Font License ([fonts/OFL.txt](fonts/OFL.txt)). Place data and maps are from Google Maps, weather from [Open-Meteo](https://open-meteo.com/) and holidays from [Nager.Date](https://date.nager.at/).
