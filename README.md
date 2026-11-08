# Little Days

**Big discoveries, close to home.**

Little Days helps the teachers and families of Peninsula Montessori Academy (Newton, MA) find real places near the school where young children can explore, notice and learn. That means parks and gardens, but also libraries, bakeries, coffee shops, post offices, fire stations and the other everyday parts of a neighborhood.

**Live site:** https://vegalh.github.io/little-days/

## What it does

- **Explore:** a Google map and a list of about 230 places within a 30-minute walk of the school (shops, restaurants, parks, libraries, banks, fire stations and more, leaving out alcohol, tobacco and traffic-heavy car places), prepared ahead, with estimated walking times and links to Google Maps for directions and hours. Filter by walking time, ages, kind of place, day, indoors or outdoors, and whether a place usually needs booking.
- **Place guides:** a hand-written guide for each kind of place, with things to notice and ideas for before, during and after a visit.
- **Weather:** a seven-day forecast with conservative advice and what to wear, which also shapes the suggestions for each place.
- **At-home activities:** 37 activities from [RootMap](https://github.com/vegalh/rootmapmvp), chosen for the weather and season.
- **My Places:** saved places and a journal of visits.
- **My week:** a weekly plan that becomes a card for families, ready to screenshot or print with nothing to write. The printed guide ends with a full page for a child's drawing.
- **Classroom and Family modes:** different wording and reminders for a group or a family. Classroom is the default.
- **Chinese and English:** the page opens in Chinese, and the EN button switches and remembers the choice.

## How to use it

1. Open the [live site](https://vegalh.github.io/little-days/). It opens in Chinese; use the language button at the top to switch to English.
2. In **Explore**, browse the map and the list of places near the school. Use **Filters** to narrow them by walking time, ages, kind of place, day, indoors or outdoors, and booking, then press **Show places**.
3. Open a place to read its guide, and press **Save** to keep it in **My Places**. After a trip, use **Record a visit** there to add it to your journal.
4. In **Weather**, check the seven-day forecast, what to wear, and at-home activities chosen for the weather.
5. Use **Add to my week** on a place or activity, then open **My week** to see the plan and share or print it for families.

## How it stays honest

- Places come from OpenStreetMap and forecasts from Open-Meteo. Walking times are labelled as estimates from distance. Missing data is shown as missing, never guessed.
- Little Days' own judgements, such as a place's category, booking and access, are labeled as estimates. The page doesn't say that a place welcomes children or has children's classes.
- The page never says a place, walk or route is "safe".

## Privacy

There are no accounts, no backend, no cookies and no analytics. Saved places, plans and notes stay in the browser's `localStorage`, with a backup file the adult can export. No child's details are collected or sent to any API, and the page never asks for the device's location.

## Cost

The places are prepared ahead in `places.js`, so the site never searches Google. The only billed Google item is one map load per visit, and Google gives 10,000 a month free. Directions and hours open Google Maps by plain link, which is free.

## Where things are

| Folder | What's in it |
|---|---|
| `index.html` | The page |
| `css/` | All styles |
| `js/` | The code: `app.js` draws the page, `google.js` the map; the rest is logic with no page code |
| `data/` | Content: places, activities, exploration guides, celebrations |
| `assets/` | Fonts and images |
| `docs/` | Product requirements, the proposal, the live check, design references |
| `tools/` | Scripts that regenerate `data/places.js` and `data/activities.js` |
| `tests/` | `unit/` for the logic, `e2e/` for the browser |

## How it's built

Plain HTML, CSS and JavaScript, with no framework, build step or runtime dependencies. It runs as a static site on GitHub Pages.

| Service | Used for |
|---|---|
| Google Maps JavaScript API | The results map (links to Google Maps for directions and hours) |
| OpenStreetMap | The places near the school, prepared ahead by `tools/import-osm.py` |
| Open-Meteo | Forecast |
| Nager.Date | Public holidays |

## Run it locally

You need Python 3 to serve the page. Without a Google key, everything works except the map.

```sh
cp config.example.js config.js   # add your own Google browser key
python3 -m http.server 8472
```

Then open http://localhost:8472/. `config.js` is gitignored, so never commit a real key. A browser key must be restricted in Google Cloud to your site's addresses and to the Maps JavaScript API only.

## Updating the places

```sh
python3 tools/import-osm.py
```

This regenerates `data/places.js` from OpenStreetMap and keeps any photo set by hand. To add the school's own photo, put a WebP file in `assets/images/places/` and set that place's `photo` and `credit` in `data/places.js`.

## Tests

```sh
npm install
npx playwright install
node --test          # logic tests
npx playwright test  # browser tests, desktop and phone
```

Both suites mock every outside request, so they prove the page handles responses, not that the real APIs work. [docs/LIVE-CHECK.md](docs/LIVE-CHECK.md) is the manual check against the real APIs.

## Deployment

Every push to `main` runs [.github/workflows/pages.yml](.github/workflows/pages.yml), which runs the logic tests, copies the site files and writes `config.js` from repository secrets. It can also be started by hand from the Actions tab.

## Project documents

- [docs/PRD.md](docs/PRD.md): what to build, and the source of truth for behavior
- [DESIGN.md](DESIGN.md): how it should look
- [AGENTS.md](AGENTS.md): rules for coding agents working in this repository
- [docs/PROPOSAL.md](docs/PROPOSAL.md): the original idea, for background

## Credits

Activities and photos come from RootMap. Caveat and Nunito are bundled under the SIL Open Font License ([assets/fonts/OFL.txt](assets/fonts/OFL.txt)). Places are from OpenStreetMap (© OpenStreetMap contributors, ODbL), the map from Google Maps, weather from [Open-Meteo](https://open-meteo.com/) and holidays from [Nager.Date](https://date.nager.at/).
