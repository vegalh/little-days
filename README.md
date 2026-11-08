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

## Where the implementation differed from my expectation

I expected a simple tool that a busy teacher would want to open. The first versions the agent built had the features I asked for, but I didn't want to use them.

- **Too many features piled together.** The first build ([`e0d65e0`](https://github.com/vegalh/little-days/commit/e0d65e02d27e22ec79dad467895ad3db45be4e85)) put the search, the forecast, the activity ideas and My week on one long page, and each new feature made it longer. Nothing told me where to look first. I had it split into four pages, Explore, Weather, My Places and My week ([`85b01d7`](https://github.com/vegalh/little-days/commit/85b01d7f00d1ed1ceeedc1be91a55af46e6ebcda)), so each one does one job.
- **It felt like entering an address every time.** The address was saved, but the search box stayed at the top of Explore, so every visit began with a form. A teacher's school doesn't move. I first asked for a one-time setup step ([`3bce793`](https://github.com/vegalh/little-days/commit/3bce793632367920c73ae15151ad2bdd6fe1c808)), and later removed the address step entirely, so the site opens on Peninsula Montessori Academy ([`685815c`](https://github.com/vegalh/little-days/commit/685815cc1388b22869686cfc41176fbb54c17b0d)).
- **The filters were hard to use.** They were a long column of buttons, and the options at the bottom were hidden below the edge of a phone screen. I had them rebuilt as short dropdowns that fit on one screen ([`8aaa0db`](https://github.com/vegalh/little-days/commit/8aaa0db5566e8115829b215544e92330a36c39da), [`f57dfb0`](https://github.com/vegalh/little-days/commit/f57dfb019c5a0fa0f007086c93fb5adc8a290960)), and removed a row of buttons on Explore that only repeated them ([`fed5abb`](https://github.com/vegalh/little-days/commit/fed5abbecee11118ae88623370c4916634539eb0)).
- **The agent's idea of where children can go was too narrow.** It started from parks and a few hand-picked kinds of places, and showed 12 at most. Young children can learn almost anywhere an adult goes, so I had it include shops, restaurants, banks and more, and leave out only places like alcohol and tobacco shops ([`b99b585`](https://github.com/vegalh/little-days/commit/b99b585f1260460c28597500037a5aaf8df4656f)). The list near the school grew to 229 places.
- **The printed plan made more work for teachers.** It had blank boxes and a checklist to fill in by hand. I wanted something teachers could send without writing anything, so it became a card to screenshot for families ([`dea24d4`](https://github.com/vegalh/little-days/commit/dea24d4f254304654da533186268e8b64c8055d3)). Young children can't write yet, so the guide's ruled box became a full page for drawing ([`f57dfb0`](https://github.com/vegalh/little-days/commit/f57dfb019c5a0fa0f007086c93fb5adc8a290960)).
- **The first plan cost more than I expected.** Live Google searches for places and walking routes were billed as people used the site. For one school that wasn't worth it, so the places are now prepared ahead from OpenStreetMap and Google is used only for the map and Street View ([`685815c`](https://github.com/vegalh/little-days/commit/685815cc1388b22869686cfc41176fbb54c17b0d)). The trade-off is that walking times are estimates from distance, and most places have no photo.

## AI-output reflection

**A case where I changed the AI's first output:** the agent's first answer to "how do we keep this free?" was to remove Google completely. I told it I still needed the Google map and links, but that the map shouldn't reload the place search every time, and that I wanted more places. The result is [`685815c`](https://github.com/vegalh/little-days/commit/685815cc1388b22869686cfc41176fbb54c17b0d): a prepared list of places, with Google only drawing the map.

**A case where I accepted the first output:** the weather thresholds in [`e8d1808`](https://github.com/vegalh/little-days/commit/e8d1808a090a8271f7cd427dc41d0c875b92961d), such as how hot, cold or windy counts as a warning, are unchanged since the agent first wrote them with tests. I kept them because they were conservative, which is what I want when the page is advising on young children going outside.

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
| `PROPOSAL.md`, `PRD.md`, `DESIGN.md` | The original idea, what to build, and how it should look |
| `docs/` | The live check and design references |
| `tools/` | Scripts that regenerate `data/places.js` and `data/activities.js` |
| `tests/` | `unit/` for the logic, `e2e/` for the browser |

## How it's built

Plain HTML, CSS and JavaScript, with no framework, build step or runtime dependencies. It runs as a static site on GitHub Pages.

| Service | Used for |
|---|---|
| [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript) | The results map and Street View (links to Google Maps for directions and hours) |
| [OpenStreetMap](https://www.openstreetmap.org/) | The places near the school, prepared ahead by `tools/import-osm.py` |
| [Open-Meteo](https://open-meteo.com/en/docs) | Forecast |
| [Nager.Date](https://date.nager.at/Api) | Public holidays |

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

- [PRD.md](PRD.md): what to build, and the source of truth for behavior
- [DESIGN.md](DESIGN.md): how it should look
- [AGENTS.md](AGENTS.md): rules for coding agents working in this repository
- [PROPOSAL.md](PROPOSAL.md): the original idea, for background

## Credits

Activities and photos come from RootMap. Caveat and Nunito are bundled under the SIL Open Font License ([assets/fonts/OFL.txt](assets/fonts/OFL.txt)). Places are from OpenStreetMap (© OpenStreetMap contributors, ODbL), the map from Google Maps, weather from [Open-Meteo](https://open-meteo.com/) and holidays from [Nager.Date](https://date.nager.at/).
