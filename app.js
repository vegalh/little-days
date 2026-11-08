const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const HOLIDAYS_URL = "https://date.nager.at/api/v3/PublicHolidays";

// A small line-icon pin, replacing the 📍 emoji everywhere a location is labelled.
const PIN_ICON = '<svg class="icon icon-inline" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21S5 13.4 5 9a7 7 0 1 1 14 0c0 4.4-7 12-7 12Z"/><circle cx="12" cy="9" r="2.3"/></svg>';

// One line icon per category, on the place cards: a kind of place, never a picture of one.
const CATEGORY_ICONS = {
  "nature": '<path d="M20 4c-9 0-15 4.5-15 11 0 1.8.6 3.4 1.6 4.4C7.6 20.4 9.2 21 11 21c6.5 0 9-8 9-17ZM4 21c2-5 5.5-8.5 10-11"/>',
  "everyday-life": '<path d="M4 10h16l-1.6 9a1.5 1.5 0 0 1-1.5 1.2H7.1a1.5 1.5 0 0 1-1.5-1.2L4 10ZM8 10l3-6M16 10l-3-6M9.5 14v3M14.5 14v3"/>',
  "community-helpers": '<path d="M12 3l7 3v5c0 4.6-3 8.1-7 10-4-1.9-7-5.4-7-10V6l7-3ZM12 8.5v6M9 11.5h6"/>',
  "art-culture": '<path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-1 2-2 0-1.4-1-1.8-1-3 0-1.1.9-2 2-2h2.2c2 0 3.8-1.4 3.8-3.6C21 6.1 17 3 12 3Z"/><circle cx="7.5" cy="11.5" r="1"/><circle cx="10.5" cy="7.5" r="1"/><circle cx="15.5" cy="7.5" r="1"/>',
  "animals-wildlife": '<circle cx="6" cy="11" r="1.8"/><circle cx="9.8" cy="6.8" r="1.8"/><circle cx="14.2" cy="6.8" r="1.8"/><circle cx="18" cy="11" r="1.8"/><path d="M12 11.5c-2.6 0-5 3-5 5.5 0 1.7 1.2 2.7 2.8 2.7 1 0 1.5-.5 2.2-.5s1.2.5 2.2.5c1.6 0 2.8-1 2.8-2.7 0-2.5-2.4-5.5-5-5.5Z"/>',
  "movement": '<circle cx="14" cy="4.5" r="2"/><path d="M6 9l4-1.5 4 1 3 3.5M13.5 8.5l-2 5 3.5 2.5v5M11.5 13.5L9 17l-4 1"/>',
};

const locationLine = document.querySelector("#location-line");
const nowLine = document.querySelector("#now-line");
const unitInputs = document.querySelectorAll("input[name=unit]");
const exploreStatus = document.querySelector("#explore-status");
const agesSelect = document.querySelector("#ages");
const filtersToggle = document.querySelector("#filters-toggle");
const filtersPanel = document.querySelector("#filters-panel");
const filtersDone = document.querySelector("#filters-done");
const filtersCount = document.querySelector("#filters-count");
const filtersSummary = document.querySelector("#filters-summary");
const filtersActive = document.querySelector("#filters-active");
const resetFiltersButton = document.querySelector("#reset-filters");
const exploreResults = document.querySelector("#explore-results");
const exploreNotes = document.querySelector("#explore-notes");
const mapBox = document.querySelector("#place-map-box");
const exploreMap = document.querySelector("#explore-map");
const mapPeek = document.querySelector("#map-peek");
const streetBox = document.querySelector("#place-street");
const placeList = document.querySelector("#place-list");
const placeDialog = document.querySelector("#place-dialog");
const placeBody = document.querySelector("#place-body");
const placeHead = document.querySelector("#place-head");
const routeBox = document.querySelector("#place-route");
const routeReminder = document.querySelector("#route-reminder");
const placesList = document.querySelector("#places-list");
const weatherSection = document.querySelector("#weather");
const weatherStatus = document.querySelector("#weather-status");
const weatherNow = document.querySelector("#weather-now");
const placeLine = document.querySelector("#place-line");
const holidayNote = document.querySelector("#holiday-note");
const week = document.querySelector("#week");
const dayWeather = document.querySelector("#day-weather");
const ideasSection = document.querySelector("#ideas");
const ideasHeading = document.querySelector("#ideas-heading");
const ideasSubtitle = document.querySelector("#ideas-subtitle");
const warningsBox = document.querySelector("#warnings");
const wearBox = document.querySelector("#wear");
const ideaList = document.querySelector("#idea-list");
const whyBox = document.querySelector("#why");
const planBox = document.querySelector("#plan");
const planHeading = document.querySelector("#plan-heading");
const dialog = document.querySelector("#details");
const dialogBody = document.querySelector("#details-body");
const dialogAdd = document.querySelector("#details-add");
const dialogStatus = document.querySelector("#details-status");
const announcer = document.querySelector("#announce");
const printArea = document.querySelector("#print-area");

// WMO weather codes used by Open-Meteo: [emoji, label]
const WEATHER = {
  0: ["☀️", "Clear"],
  1: ["🌤️", "Mainly clear"],
  2: ["⛅", "Partly cloudy"],
  3: ["☁️", "Overcast"],
  45: ["🌫️", "Fog"],
  48: ["🌫️", "Fog"],
  51: ["🌦️", "Light drizzle"],
  53: ["🌦️", "Drizzle"],
  55: ["🌦️", "Heavy drizzle"],
  56: ["🌧️", "Freezing drizzle"],
  57: ["🌧️", "Freezing drizzle"],
  61: ["🌧️", "Light rain"],
  63: ["🌧️", "Rain"],
  65: ["🌧️", "Heavy rain"],
  66: ["🌧️", "Freezing rain"],
  67: ["🌧️", "Freezing rain"],
  71: ["❄️", "Light snow"],
  73: ["❄️", "Snow"],
  75: ["❄️", "Heavy snow"],
  77: ["❄️", "Snow grains"],
  80: ["🌦️", "Showers"],
  81: ["🌧️", "Showers"],
  82: ["🌧️", "Heavy showers"],
  85: ["❄️", "Snow showers"],
  86: ["❄️", "Snow showers"],
  95: ["⛈️", "Thunderstorm"],
  96: ["⛈️", "Thunderstorm"],
  99: ["⛈️", "Thunderstorm"],
};

// An activity's RootMap text in the page's language: RootMap has its own Chinese for each one.
function rootmapText(activity) {
  return LANG === "zh" ? { ...activity.rootmap, ...activity.rootmap.zh } : activity.rootmap;
}

// A category as a word inside a sentence: "nature places", "自然地点".
function interestWord(key) {
  return LANG === "zh" ? tr(CATEGORIES[key].label) : CATEGORIES[key].label.toLowerCase();
}

// [emoji, label] for a WMO code, with the label in the page's language.
function weatherOf(code) {
  const [icon, label] = WEATHER[code] || ["🌡️", "Unknown"];
  return [icon, tr(label)];
}

// One sentence per weather condition from recommend.js (PRD.md 7.4).
const WARNINGS = {
  storm: () => tr("Thunderstorms are forecast. Stay indoors while there is thunder or lightning."),
  heavyRain: () => tr("Heavy rain is forecast."),
  freezingRain: () => tr("Freezing rain is forecast, so paths may be icy."),
  heavySnow: () => tr("Heavy snow is forecast."),
  extremeHeat: (d) => tr("It may feel like {temp} at the hottest part of the day. That's too hot for outdoor play.", { temp: temp(d.feelsMax) }),
  extremeCold: (d) => tr("It may feel like {temp} at the warmest part of the day. That's too cold for outdoor play.", { temp: temp(d.feelsMax) }),
  dangerousWind: (d) => tr("Gusts may reach {wind}. That's too windy to play outside, especially near trees.", { wind: wind(d.gusts) }),
  rain: (d) => d.rainChance == null
    ? tr("Rain is possible. Any outdoor idea today works in rain gear; skip it if the rain gets heavy.")
    : tr("Rain is possible ({chance}%). Any outdoor idea today works in rain gear; skip it if the rain gets heavy.", { chance: d.rainChance }),
  snow: () => tr("Light snow is forecast. Dress warmly and keep outdoor time short."),
  cold: (d) => tr("It may feel like {temp} at the warmest part of the day. Keep outdoor time short and dress warmly.", { temp: temp(d.feelsMax) }),
  hot: (d) => tr("It may feel like {temp}. Play outside early or late, in the shade, with water and sun protection.", { temp: temp(d.feelsMax) }),
  wind: (d) => tr("Gusts may reach {wind}. Stay clear of trees and loose branches.", { wind: wind(d.gusts) }),
  fog: () => tr("Fog is forecast. Stay close together near roads."),
};

// The same conditions in a few words, for the compact weather line. The full sentences
// above stay on the Weather view and in place details.
const SHORT_WARNINGS = {
  storm: () => tr("Thunderstorms forecast"),
  heavyRain: () => tr("Heavy rain forecast"),
  freezingRain: () => tr("Freezing rain forecast"),
  heavySnow: () => tr("Heavy snow forecast"),
  extremeHeat: () => tr("Too hot for outdoor play"),
  extremeCold: () => tr("Too cold for outdoor play"),
  dangerousWind: () => tr("Too windy to play outside"),
  rain: () => tr("Rain possible"),
  snow: () => tr("Light snow forecast"),
  cold: () => tr("Cold today, dress warmly"),
  hot: () => tr("Hot today, find some shade"),
  wind: () => tr("Windy today"),
  fog: () => tr("Fog forecast"),
};

// localStorage can be missing or blocked; the page then works without saving.
let storage;
try {
  storage = window.localStorage;
} catch {
  storage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
}

// config.js is gitignored and may be missing (PRD.md 9.2). Without a key there's no map.
const config = window.LITTLE_DAYS_CONFIG || {};
const ACTIVITY_IDS = ACTIVITIES.map((a) => a.id);
const settings = loadSettings(storage); // PRD.md 7.18
// The page's language (PRD.md 7.19): the saved choice, or else the browser's.
const LANG = settings.lang || "zh";
const LOCALE = LANG === "zh" ? "zh-CN" : "en-US";
const tr = (text, vars) => translate(LANG, text, vars);
let plan = loadPlan(storage, isoToday(), ACTIVITY_IDS);
// Saved place IDs and the adult's own data only (PRD.md 7.17).
let savedPlaces = loadPlaces(storage);
// Every walk starts at the school (places.js).
const place = { label: SCHOOL.name, latitude: SCHOOL.latitude, longitude: SCHOOL.longitude, countryCode: SCHOOL.countryCode };
// "loading", "ready", or "off" (no key, refused or didn't load). The map is the only Google part.
let mapsState = config.googleMapsKey ? "loading" : "off";
// The weather for that location: { location, now, hours, days, holidayProblem }
let current = null;
let selectedDay = 0;
// Counts weather requests, so an answer for an older location is ignored.
let weatherRequest = 0;
// The button that opened the details dialog, to return focus to it.
let dialogOpener = null;
// --- Open-Meteo and Nager.Date ---

// Returns Open-Meteo's { current, hourly, daily } (PRD.md 7.2). The location is rounded
// to 2 decimals (about 1 km), which is plenty for a forecast (PRD.md 7.18).
async function getForecast(location) {
  const url = `${FORECAST_URL}?latitude=${location.latitude.toFixed(2)}&longitude=${location.longitude.toFixed(2)}` +
    "&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_gusts_10m,precipitation" +
    "&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code," +
    "wind_speed_10m,wind_gusts_10m" +
    "&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min," +
    "precipitation_probability_max,precipitation_sum,weather_code,wind_speed_10m_max,wind_gusts_10m_max,uv_index_max" +
    "&timezone=auto&forecast_days=7";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Forecast failed with status ${response.status}`);
  }
  return response.json();
}

// Returns { holidays: [{ date, name, ... }], problem }, where problem is null,
// "no-country", "unsupported" (Nager.Date has no data for the
// country) or "failed". A problem here never stops the forecast from showing.
async function getHolidays(countryCode, years) {
  if (!countryCode) return { holidays: [], problem: "no-country" };
  try {
    const lists = await Promise.all(years.map(async (year) => {
      const response = await fetch(`${HOLIDAYS_URL}/${year}/${countryCode}`);
      // Nager.Date answers 204 (no content) or 404 for countries it doesn't cover.
      if (response.status === 204 || response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error(`Holidays failed with status ${response.status}`);
      }
      return response.json();
    }));
    if (lists.includes(null)) return { holidays: [], problem: "unsupported" };
    return { holidays: lists.flat(), problem: null };
  } catch (error) {
    console.error(error);
    return { holidays: [], problem: "failed" };
  }
}

// --- Weather ---

async function loadWeather(location) {
  const request = ++weatherRequest;
  showWeatherLoading(location.label);
  try {
    const [data, holidays] = await Promise.all([
      getForecast(location),
      getHolidays(location.countryCode, yearsThisWeek()),
    ]);
    // A newer location was chosen while this one loaded.
    if (request !== weatherRequest) return;
    current = {
      location,
      now: data.current,
      hours: nextHours(data.hourly, data.current.time),
      hourly: data.hourly,
      days: buildDays(location, data.daily, holidays.holidays),
      holidayProblem: holidays.problem,
    };
    selectedDay = 0;
    showStatus(weatherStatus, "", "");
    render();
  } catch (error) {
    if (request !== weatherRequest) return;
    console.error(error);
    showWeatherError(() => loadWeather(location));
  }
}

// One object per forecast day, with what recommend.js and advice.js need.
function buildDays(location, daily, holidays) {
  return daily.time.map((date, i) => {
    const forecast = {
      code: daily.weather_code[i],
      feelsMax: daily.apparent_temperature_max[i],
      feelsMin: daily.apparent_temperature_min[i],
      gusts: daily.wind_gusts_10m_max[i],
      rainChance: daily.precipitation_probability_max[i],
      uv: daily.uv_index_max[i],
    };
    const publicHolidays = holidays.filter((h) => h.date === date).map((h) => h.name);
    const celebrations = celebrationsOn(date, location.countryCode);
    return {
      date,
      high: daily.temperature_2m_max[i],
      low: daily.temperature_2m_min[i],
      ...forecast,
      weather: weatherFor(forecast),
      publicHolidays,
      season: seasonFor(date, location.latitude),
      celebrations,
      holidays: [...new Set([...publicHolidays, ...celebrations])],
    };
  });
}

// --- Events ---

document.addEventListener("change", (event) => {
  const { name, value } = event.target;
  if (name === "interest") chooseInterest(value);
  if (name === "mode") {
    settings.mode = value;
    saveSettings(storage, settings);
    showChoices();
    renderSubtitles();
    renderMyPlaces();
    renderPlaces();
    if (placeDialog.open && openPlaceId && findPlace(openPlaceId)) renderPlaceDetails(findPlace(openPlaceId));
    renderPlan();
  }
  if (name === "minutes") {
    settings.minutes = Number(value);
    saveSettings(storage, settings);
    resetExplore();
  }
  if (name === "explore-day") {
    selectedDay = Number(value);
    render();
  }
  if (name === "setting-filter" || name === "booking-filter" || name === "explored-filter") {
    renderPlaces();
    renderFilterSummary();
  }
  if (name === "places-tab") renderMyPlaces();
});

agesSelect.addEventListener("change", () => {
  settings.ages = agesSelect.value;
  saveSettings(storage, settings);
  renderPlaces();
  renderFilterSummary();
});

function clearFilters() {
  for (const id of ["setting-filter", "booking-filter", "explored-filter"]) document.querySelector(`#${id}`).value = "all";
  renderPlaces();
  renderFilterSummary();
}

filtersToggle.addEventListener("click", () => {
  filtersPanel.showModal();
  filtersToggle.setAttribute("aria-expanded", "true");
});

filtersDone.addEventListener("click", () => filtersPanel.close());
document.querySelector("#filters-close").addEventListener("click", () => filtersPanel.close());
filtersPanel.addEventListener("click", (event) => {
  if (event.target === filtersPanel) filtersPanel.close();
});

// A changed walking time or interest is worked out when the sheet closes.
filtersPanel.addEventListener("close", () => {
  filtersToggle.setAttribute("aria-expanded", "false");
  filtersToggle.focus();
  if (!explore || categoriesToSearch(settings.interest, explore.loaded).length) exploreHere();
});

// What differs from the defaults (the first of each SETTING_CHOICES list). The mode isn't a
// filter: it stays until the adult changes it, so Reset can never quietly drop the Classroom
// reminders (PRD.md 7.13).
function changedFilters() {
  const changed = [];
  if (settings.ages !== SETTING_CHOICES.ages[0]) changed.push(agesSelect.selectedOptions[0].textContent);
  if (settings.minutes !== SETTING_CHOICES.minutes[0]) changed.push(tr("{minutes} min walk", { minutes: settings.minutes }));
  if (settings.interest !== SETTING_CHOICES.interest[0]) changed.push(tr(CATEGORIES[settings.interest].label));
  if (selectedDay && current) changed.push(formatDay(current.days[selectedDay].date));
  const setting = settingFilter();
  if (setting !== "all") changed.push(setting === "indoors" ? tr("Indoors") : tr("Outdoors"));
  const booking = document.querySelector("#booking-filter").value;
  if (booking !== "all") changed.push(booking === "walk-in" ? tr("Usually walk in") : tr("Book or call first"));
  const explored = document.querySelector("#explored-filter").value;
  if (explored !== "all") changed.push(explored === "new" ? tr("Not explored yet") : tr("Explored"));
  return changed;
}

function renderFilterSummary() {
  const changed = changedFilters();
  filtersActive.textContent = changed.join(" · ");
  filtersSummary.hidden = !changed.length;
  resetFiltersButton.hidden = !changed.length;
  filtersCount.textContent = changed.length;
  filtersCount.hidden = !changed.length;
}

resetFiltersButton.addEventListener("click", () => {
  settings.ages = SETTING_CHOICES.ages[0];
  if (settings.minutes !== SETTING_CHOICES.minutes[0]) {
    settings.minutes = SETTING_CHOICES.minutes[0];
    resetExplore();
  }
  selectedDay = 0;
  if (current) render();
  clearFilters();
  chooseInterest(SETTING_CHOICES.interest[0]);
  filtersToggle.focus();
});

// Hovering or focusing a card highlights its marker.
for (const type of ["mouseover", "focusin"]) {
  placeList.addEventListener(type, (event) => {
    const card = event.target.closest(".place-card");
    if (card && resultsView.markers) highlightMarker(resultsView.markers, card.dataset.place);
  });
}

// Tapping a card (anywhere but its buttons) selects it and its marker.
placeList.addEventListener("click", (event) => {
  const card = event.target.closest(".place-card");
  if (card && !event.target.closest("button")) selectPlace(card.dataset.place);
});

placeDialog.addEventListener("close", () => {
  if (placeOpener && placeOpener.isConnected) placeOpener.focus();
  placeOpener = null;
  openPlaceId = null;
});

// Forms inside the details dialog and My week are drawn often, so one listener handles them.
document.addEventListener("submit", (event) => {
  const form = event.target;
  if (form.matches("[data-visit-form]")) submitVisit(form);
  else if (form.matches("[data-plan-form]")) submitPlanForm(form);
  else if (form.matches("[data-edit-form]")) submitEditVisit(form);
  else return;
  event.preventDefault();
});

// Backup (PRD.md 7.18): a JSON file of what Little Days stores.
const dataStatus = document.querySelector("#data-status");
const importFile = document.querySelector("#import-file");

document.querySelector("#export-data").addEventListener("click", () => {
  const data = exportData(storage, isoToday(), ACTIVITY_IDS);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  link.download = `little-days-data-${isoToday()}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  dataStatus.textContent = tr("Your data was saved to a file. It contains your journal, so keep it somewhere private.");
});

document.querySelector("#import-data").addEventListener("click", () => importFile.click());

importFile.addEventListener("change", async () => {
  const file = importFile.files[0];
  importFile.value = "";
  if (!file) return;
  const { data, error } = readImport(await file.text(), isoToday(), ACTIVITY_IDS);
  if (error) {
    dataStatus.textContent = `${tr(error)} ${tr("Your saved data hasn't changed.")}`;
    return;
  }
  const count = Object.keys(data.places).length;
  if (!confirm(count === 1
    ? tr("Replace everything Little Days has saved in this browser with this backup ({count} place)? This can't be undone.", { count })
    : tr("Replace everything Little Days has saved in this browser with this backup ({count} places)? This can't be undone.", { count }))) {
    dataStatus.textContent = tr("Import cancelled. Your saved data hasn't changed.");
    return;
  }
  if (!replaceSavedData(storage, data)) {
    dataStatus.textContent = tr("The backup couldn't be saved in this browser (storage may be full or blocked). Your saved data hasn't changed.");
    return;
  }
  location.reload();
});

document.querySelector("#delete-data").addEventListener("click", () => {
  if (!confirm(tr("Delete your saved places, journal entries, plan and choices from this browser? This can't be undone."))) return;
  deleteSavedData(storage);
  location.reload();
});

// Changing the unit or day re-renders; neither sends a request.
for (const input of unitInputs) {
  input.addEventListener("change", () => {
    settings.unit = input.value;
    saveSettings(storage, settings);
    if (current) render();
    else renderPlaces();
  });
}

week.addEventListener("click", (event) => {
  const button = event.target.closest(".day");
  if (!button) return;
  selectedDay = Number(button.dataset.index);
  render();
  week.querySelector(`[data-index="${selectedDay}"]`).focus();
});

// Buttons inside the ideas and My week are re-drawn often, so one listener handles them.
document.addEventListener("click", (event) => {
  const open = event.target.closest("[data-open]");
  const add = event.target.closest("[data-add]");
  const remove = event.target.closest("[data-remove]");
  if (open) openDetails(open.dataset.open, open.dataset.date, open);
  const placeOpen = event.target.closest("[data-place-open]");
  if (placeOpen) openPlace(placeOpen.dataset.placeOpen, placeOpen);
  const save = event.target.closest("[data-save]");
  if (save) savePlaceId(save.dataset.save);
  if (event.target.closest("[data-place-close]")) placeDialog.close();
  const status = event.target.closest("[data-status]");
  if (status) setStatus(status.dataset.placeId, status.dataset.status);
  const removePlaceButton = event.target.closest("[data-remove-place]");
  if (removePlaceButton) removeSavedPlace(removePlaceButton.dataset.removePlace);
  const edit = event.target.closest("[data-edit-visit]");
  if (edit) {
    editingEntry = edit.dataset.editVisit;
    renderPlan();
    planBox.querySelector("[data-edit-form] input")?.focus();
  }
  if (event.target.closest("[data-cancel-edit]")) {
    editingEntry = null;
    renderPlan();
    planHeading.focus();
  }
  const removeVisitButton = event.target.closest("[data-remove-visit]");
  if (removeVisitButton) removeVisit(removeVisitButton.dataset.removeVisit);
  if (event.target.closest("[data-clear-filters]")) clearFilters();
  const perspective = event.target.closest("[data-perspective]");
  if (perspective) showPerspective(perspective.dataset.placeId, Number(perspective.dataset.perspective));
  if (add) addActivity(add.dataset.add, add.dataset.date);
  if (remove) removeActivity(remove.dataset.remove, remove.dataset.date);
  if (event.target.closest("[data-print-week]")) openShare();
  const printGuideButton = event.target.closest("[data-print-guide]");
  if (printGuideButton) printGuideFor(printGuideButton.dataset.printGuide);
  const streetButton = event.target.closest("[data-street-view]");
  if (streetButton) openStreetView(streetButton);
});

// A photo that fails to load becomes a plain tile instead of a broken image.
document.addEventListener("error", (event) => {
  if (event.target.tagName !== "IMG") return;
  event.target.closest(".art")?.classList.add("art-missing");
  event.target.remove();
}, true);

// --- Explore (PRD.md 7.10–7.16) ---

// The places within the chosen walking time, worked out from places.js and kept in page
// memory: { key, origin, loaded: { category: [place] }, routes: { placeId: estimate }, shortlist }
let explore = null;
// The results map, kept for the whole visit (a new map is a new billed load): { map, markers }.
const resultsView = { markers: {} };
let selectedPlace = null;
// The place shown in the details dialog, and the button that opened it.
let placeOpener = null;
// places.js in the shape explore.js uses.
const LISTED = PLACES.map((p) => ({ ...p, location: { lat: p.lat, lng: p.lng }, types: [p.primaryType] }));

// The chosen interest, ages, mode and walking time, shown in Filters.
function showChoices() {
  document.querySelector("#interest").value = settings.interest;
  for (const input of document.querySelectorAll("input[name=mode]")) input.checked = input.value === settings.mode;
  document.querySelector("#minutes").value = settings.minutes;
  agesSelect.value = settings.ages;
  for (const note of document.querySelectorAll(".classroom-note")) note.hidden = settings.mode !== "classroom";
  renderFilterSummary();
}

function exploreKey() {
  return String(settings.minutes);
}

// A new walking time starts over (PRD.md 7.10).
function resetExplore() {
  explore = null;
  selectedPlace = null;
  showResultsArea(false);
  placeList.innerHTML = "";
  showChoices();
}

// The map and the list show together, so markers from earlier results never stay alone.
function showResultsArea(visible) {
  exploreResults.hidden = !visible;
  mapBox.hidden = !visible || mapsState === "off";
  if (!visible) mapPeek.hidden = true;
}

// Nothing here asks a service, so it runs whenever Explore is what's on screen.
function exploreHere() {
  if (viewName() === "explore") findAdventures();
}

function findAdventures() {
  if (!explore || explore.key !== exploreKey()) {
    explore = { key: exploreKey(), origin: { lat: place.latitude, lng: place.longitude }, loaded: {}, routes: {}, shortlist: [] };
  }
  for (const key of categoriesToSearch(settings.interest, explore.loaded)) {
    explore.loaded[key] = nearbyPlaces(LISTED, explore.origin, settings.minutes, CATEGORIES[key].types);
  }
  showResults();
}

function showResults() {
  explore.shortlist = shortlist(explore.loaded, settings.interest, explore.origin);
  for (const p of explore.shortlist) explore.routes[p.id] = estimateWalk(explore.origin, p);
  showChoices();
  selectedPlace = null;
  if (!explore.shortlist.length) {
    showResultsArea(false);
    placeList.innerHTML = "";
    showStatus(exploreStatus, "", settings.interest === "all"
      ? tr("We didn't find places within about a {minutes}-minute walk. Try a longer walk or another interest.", { minutes: settings.minutes })
      : tr("We didn't find {interest} places within about a {minutes}-minute walk. Try a longer walk or another interest.",
        { interest: interestWord(settings.interest), minutes: settings.minutes }));
    return;
  }
  showStatus(exploreStatus, "", "");
  showResultsArea(true);
  renderPlaces();
}

function settingFilter() {
  return document.querySelector("#setting-filter").value;
}

// The list and the map markers, in the same order and numbers.
async function renderPlaces() {
  if (!explore || exploreResults.hidden) return;
  const day = current ? current.days[selectedDay] : null;
  const exploredOnly = document.querySelector("#explored-filter").value;
  const filtered = filterByBooking(filterBySetting(explore.shortlist, settingFilter()), document.querySelector("#booking-filter").value)
    .filter((p) => exploredOnly === "all" || (visitCount(savedPlaces, p.id) > 0) === (exploredOnly === "explored"));
  const { within, over } = byWalkingTime(filtered, explore.routes, settings.minutes);
  const shown = orderForWeather(within, day && day.weather, settingFor);
  shown.forEach((p, i) => { p.number = i + 1; });

  const notes = [tr(shown.length === 1 ? "{count} place · walking times estimated from distance, ideas from Little Days" : "{count} places · walking times estimated from distance, ideas from Little Days",
    { count: shown.length })];
  if (!day) notes.push(tr("Weather unavailable. Check the forecast before you go."));
  for (const holiday of day ? day.publicHolidays : []) {
    notes.push(tr("{holiday} falls on this day. Many services close, so check hours before you go.", { holiday: escapeHtml(tr(holiday)) }));
  }
  if (over) notes.push(tr(over === 1 ? "{count} place is more than a {minutes}-minute walk." : "{count} places are more than a {minutes}-minute walk.",
    { count: over, minutes: settings.minutes }));
  exploreNotes.innerHTML = `
    ${notes.map((note) => `<p>${note}</p>`).join("")}
    ${settings.mode === "classroom" ? `<p class="classroom-line">${CLASSROOM_WALKING}</p>` : ""}`;

  placeList.innerHTML = shown.length ? shown.map((p) => placeCardHtml(p, day)).join("")
    : `<div class="status"><p>${tr("No places match these filters.")}</p>
      <button type="button" class="button-secondary" data-clear-filters>${tr("Clear filters")}</button></div>`;

  // Never create or fit a map in a box with no size (another view is showing): showView()
  // draws it when Explore comes back. The list is complete without it.
  if (mapsState !== "ready" || !exploreMap.offsetHeight) return;
  try {
    if (!resultsView.map) resultsView.map = await createMap(exploreMap, explore.origin, config.googleMapId || "DEMO_MAP_ID");
    resultsView.markers = await syncMarkers(resultsView.map, explore.origin, shown, selectPlace, resultsView.markers);
  } catch (error) {
    console.error(error);
  }
}

// Loads Google's map script once. If it can't, the page carries on without the map.
async function startMap() {
  try {
    await loadGoogleMaps(config.googleMapsKey, () => stopMap(new Error("Google refused the Maps key (gm_authFailure)")), LOCALE);
    if (mapsState === "off") return;
    mapsState = "ready";
    if (explore && !exploreResults.hidden) showResultsArea(true);
    renderPlaces();
  } catch (error) {
    stopMap(error);
  }
}

function stopMap(error) {
  console.error(error);
  mapsState = "off";
  mapBox.hidden = true;
}

// The forecast days as buttons above the results, so the day can be chosen while looking
// at places. It's the same selectedDay the Weather view uses.
function renderExploreDays() {
  const box = document.querySelector("#explore-days-box");
  box.hidden = !current;
  if (!current) return;
  document.querySelector("#explore-day").innerHTML = current.days.map((day, i) => {
    const parts = [formatDay(day.date), temp(day.high), ...(day.weather.hazards.length ? [tr("Indoor day")] : []), ...day.publicHolidays.map((h) => tr(h))];
    return `<option value="${i}"${i === selectedDay ? " selected" : ""}>${escapeHtml(parts.join(" · "))}</option>`;
  }).join("");
}

const CLASSROOM_WALKING = tr("These walking times are estimated from distance and may not reflect the time needed with young children. Check crossings and the route before visiting.");

function walkHtml(placeItem) {
  const route = explore.routes[placeItem.id];
  return `<span aria-hidden="true">🚶</span> ${tr("About {minutes} min walk", { minutes: walkingMinutes(route.durationMillis) })} · ${formatDistance(route.distanceMeters, settings.unit)}`;
}

// Classroom mode's line under the walking time, from the same estimate.
function roundTripHtml(placeItem) {
  if (settings.mode !== "classroom") return "";
  return `<p class="place-access">${tr("Round trip by this estimate: {minutes} min. Allow more with a group.", { minutes: walkingMinutes(explore.routes[placeItem.id].durationMillis) * 2 })}</p>`;
}

function accessHtml(placeItem) {
  const access = accessFor(placeItem);
  const contact = access.contact || settings.mode === "classroom";
  const booking = bookingFor(placeItem) === "book" ? tr("Better to book or call first (Little Days estimate).")
    : settings.mode === "classroom" ? "" : tr("Usually no booking needed (Little Days estimate).");
  return `${booking ? `${booking} ` : ""}${access.estimate ? `${tr("{estimate} (Little Days estimate).", { estimate: tr(access.estimate) })} ` : ""}${tr("Access not verified.")}` +
    `${access.note ? ` ${tr(access.note)}` : ""}${contact ? ` <strong>${tr("Contact before a classroom visit.")}</strong>` : ""}`;
}

// Weather notes for a place on the selected day (PRD.md 7.15). Never says "safe".
function placeWeatherLines(placeItem, day) {
  if (!day) return [tr("Weather unavailable. Check the forecast before you go.")];
  const outdoors = settingFor(placeItem) === "outdoors";
  const { hazards, cautions, notes } = day.weather;
  const warnings = [...hazards, ...cautions, ...notes].map((key) => WARNINGS[key](day));
  const lines = [];
  if (warnings.length) {
    if (!outdoors) lines.push(tr("For the walk there: {warning}", { warning: warnings[0] }), ...warnings.slice(1));
    else lines.push(...warnings);
    if (hazards.length && outdoors) lines.push(tr("Outdoor places are better left for another day."));
  } else if (outdoors) {
    lines.push(tr("The forecast looks good for time outdoors."));
  }
  const soon = selectedDay === 0 && outdoors ? rainSoon(current.hours) : null;
  if (soon) lines.push(tr("Rain is likely in the next few hours ({chance}%).", { chance: soon }));
  return lines;
}

// The same heart outline used for the "My Places" nav icon, so saving reads as one idea.
const HEART_PATH = "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5a5.5 5.5 0 0 0 1-8.9z";

// Short enough to read in a few seconds (PRD.md 7.16). The address, access, age and
// weather notes are in the place details; only what can't wait stays here: the hazard
// line on outdoor places, and the access reminder in Classroom mode.
function placeCardHtml(placeItem, day) {
  const category = CATEGORIES[placeItem.category];
  const guide = guideFor(placeType(placeItem), placeItem.category);
  const visits = visitCount(savedPlaces, placeItem.id);
  const idea = guideText(guide.sets[perspectiveFor(guide, visits)].notice[0]);
  const name = escapeHtml(placeItem.name || tr("Unnamed place"));
  const hazard = day && day.weather.hazards.length && settingFor(placeItem) === "outdoors";
  return `
    <article class="place-card${placeItem.id === selectedPlace ? " is-selected" : ""}" data-place="${placeItem.id}">
      <span class="place-icon art" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24">${CATEGORY_ICONS[placeItem.category]}</svg>
        ${placeItem.photo ? `<img src="${escapeHtml(placeItem.photo)}" alt="" loading="lazy">` : ""}</span>
      <div class="place-body">
      <h3><span class="place-number" aria-hidden="true">${placeItem.number}</span>
        <button type="button" class="place-title" data-place-open="${placeItem.id}">
          <span class="visually-hidden">${placeItem.number}. </span>${name}</button></h3>
      <p class="place-meta"><span class="place-walk">${walkHtml(placeItem)}</span>
        <span class="tag tag-soft">${tr(category.label)}</span></p>
      ${roundTripHtml(placeItem)}
      ${hazard ? `<p class="place-alert">${tr("Outdoor places are better left for another day.")}</p>` : ""}
      ${settings.mode === "classroom" ? `<p class="place-access">${tr("Access not verified.")} <strong>${tr("Contact before a classroom visit.")}</strong></p>` : ""}
      ${placeItem.credit ? `<p class="place-credit">${tr("Photo:")} <a href="${escapeHtml(placeItem.creditUrl)}" target="_blank" rel="noopener">${escapeHtml(placeItem.credit)}</a></p>` : ""}
      <p class="place-idea"><span class="idea-label">${visits ? tr("Little Days idea for next visit:") : tr("Little Days idea:")}</span> ${escapeHtml(idea)}</p>
      <div class="place-actions">
        <button type="button" class="button-secondary" data-place-open="${placeItem.id}" aria-label="${tr("View details for {name}", { name })}">${tr("View details")}</button>
        ${savedPlaces[placeItem.id] ? statusTagHtml(placeItem.id)
          : `<button type="button" class="button-quiet" data-save="${placeItem.id}" aria-label="${tr("Save {name}", { name })}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${HEART_PATH}"/></svg> ${tr("Save")}</button>`}
      </div>
      </div>
    </article>`;
}

// A marker or card was chosen: highlight both, and show the preview on the map.
function selectPlace(id) {
  selectedPlace = id;
  const placeItem = explore.shortlist.find((p) => p.id === id);
  if (!placeItem) return;
  highlightMarker(resultsView.markers, id);
  for (const card of placeList.querySelectorAll(".place-card")) {
    card.classList.toggle("is-selected", card.dataset.place === id);
  }
  mapPeek.innerHTML = `
    <p class="peek-title"><span class="place-number" aria-hidden="true">${placeItem.number}</span> ${escapeHtml(placeItem.name || "")}</p>
    <p class="peek-walk">${walkHtml(placeItem)}</p>
    <button type="button" data-place-open="${id}" aria-label="${tr("View details for {name}", { name: escapeHtml(placeItem.name || "") })}">${tr("View details")}</button>`;
  mapPeek.hidden = false;
  if (mapBeside()) placeList.querySelector(`[data-place="${id}"]`)?.scrollIntoView({ block: "nearest", behavior: reducedMotion() ? "auto" : "smooth" });
}

// The wide layout, with the map beside the places (style.css).
function mapBeside() {
  return window.matchMedia("(min-width: 960px)").matches;
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// --- Place details (PRD.md 7.16) ---

let openPlaceId = null;

// A place to show: from the current results (with its list number), or from places.js for a
// saved place. Returns null for a place no longer on the list.
function findPlace(id) {
  const listed = explore && explore.shortlist.find((p) => p.id === id);
  if (listed) return listed;
  const known = LISTED.find((p) => p.id === id);
  if (!known) return null;
  const saved = savedPlaces[id];
  return { ...known, category: categoryOf({ ...known, category: saved && saved.category }) };
}

function openPlace(id, opener) {
  const placeItem = findPlace(id);
  if (!placeItem) return;
  placeOpener = opener;
  openPlaceId = id;
  renderPlaceDetails(placeItem);
  renderRoute(placeItem);
  if (!placeDialog.open) placeDialog.showModal();
  document.querySelector("#place-title").focus();
}

// Everything in the dialog except the walk, which stays while the rest is redrawn (after
// saving, recording a visit, or planning).
function renderPlaceDetails(placeItem, perspective) {
  const id = placeItem.id;
  const day = current ? current.days[selectedDay] : null;
  const guide = guideFor(placeType(placeItem), placeItem.category);
  const category = CATEGORIES[placeItem.category];
  const visits = visitCount(savedPlaces, id);
  const suggested = perspectiveFor(guide, visits);
  const shown = perspective == null ? suggested : perspective;
  const name = escapeHtml(placeItem.name || tr("Unnamed place"));
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${placeItem.name} ${placeItem.address || `${placeItem.lat},${placeItem.lng}`}`)}`;

  placeHead.innerHTML = `
    <div>
      <h2 id="place-title" tabindex="-1">${name}</h2>
      <p class="place-address">${escapeHtml(placeItem.address || "")}</p>
      <p><span class="tag tag-soft">${tr(category.label)}</span>
        <span class="tag tag-soft">${tr("{setting} (estimate)", { setting: settingFor(placeItem) === "outdoors" ? tr("Outdoors") : tr("Indoors") })}</span>
        ${statusTagHtml(id)}</p>
    </div>
    <button type="button" class="button-secondary" data-place-close>${tr("Close")}</button>`;
  routeReminder.innerHTML = `${tr("This walking time is estimated from distance, not a checked route, and isn't a check that the way suits young children. Before you go, look for busy road crossings, water, construction, closed or restricted areas, and the weather, and plan enough adults to supervise.")}
    ${settings.mode === "classroom" ? `<br>${CLASSROOM_WALKING} ${tr("Walk the route yourself before taking a group.")}` : ""}`;

  placeBody.innerHTML = `
    <section class="place-section" aria-labelledby="weather-detail-heading">
      <h3 id="weather-detail-heading">${day ? tr("Weather on {day}", { day: formatDay(day.date) }) : tr("Weather")}</h3>
      ${day ? `<p>${(weatherOf(day.code)).map((part, i) => i ? part : `<span aria-hidden="true">${part}</span>`).join(" ")} ·
        ${temp(day.high)} / ${temp(day.low)} · ${day.rainChance == null ? tr("Rain –") : tr("Rain {chance}%", { chance: day.rainChance })}</p>` : ""}
      <ul class="place-weather">${placeWeatherLines(placeItem, day).map((line) => `<li${line === tr("The forecast looks good for time outdoors.") ? ` class="is-good"` : ""}>${line}</li>`).join("")}</ul>
      <p class="note">${tr("These notes use the forecast for the whole area and fixed temperature levels. They're a starting point, not a safety check. Use your own judgement and your setting's rules.")}</p>
    </section>

    <section class="place-section" aria-labelledby="before-heading">
      <h3 id="before-heading">${tr("Before you set off")}</h3>
      <p>${accessHtml(placeItem)}</p>
      <p>${ageNotes(settings.ages).map((note) => tr(note)).join(" ")}</p>
      <p><a href="${mapsUrl}" target="_blank" rel="noopener">${tr("Check hours and details on Google Maps")}<span aria-hidden="true"> ↗</span></a></p>
    </section>

    ${planFormHtml(placeItem, guide.sets[suggested].focus, day)}

    <section class="place-section ideas-panel" aria-labelledby="ideas-detail-heading">
      <p class="notes-label">${tr("Little Days ideas")}</p>
      <h3 id="ideas-detail-heading">${tr("Why explore this place?")}</h3>
      <p>${escapeHtml(guideText(guide.why))}</p>
      <p class="guide-note">${guideText(GUIDE_NOTE)}</p>
      ${visits ? `<p class="perspective-note">${tr(visits === 1 ? "You've recorded {count} visit, so a new perspective comes first." : "You've recorded {count} visits, so a new perspective comes first.", { count: visits })}</p>` : ""}
      <div class="perspectives" role="group" aria-label="${tr("Visit")}">
        ${guide.sets.map((set, i) => `<button type="button" class="perspective" data-perspective="${i}" data-place-id="${id}"
          aria-pressed="${i === shown}">${tr(["First visit", "Second visit", "Third visit"][i])}</button>`).join("")}
      </div>
      <div id="guide-set">${guideSetHtml(guide.sets[shown])}</div>
      ${atHomeHtml(guide, day)}
    </section>

    ${visitsHtml(placeItem)}

    <div class="place-actions">
      <button type="button" class="button-secondary" data-print-guide="${id}">${tr("Print Adventure Guide")}</button>
      <button type="button" class="button-secondary" data-place-close>${tr("Close")}</button>
    </div>`;
}

function statusTagHtml(id) {
  const entry = savedPlaces[id];
  if (!entry) return "";
  const visits = entry.visits.length;
  const label = { want: tr("Want to explore"), explored: tr("Explored"), revisit: tr("Revisit") }[entry.status];
  const text = entry.status === "want" || !visits ? label : tr(visits === 1 ? "{label} · {count} visit" : "{label} · {count} visits", { label, count: visits });
  return `<span class="tag tag-saved">${text}</span>`;
}

// My Places status, the journal, and the form to record a visit (PRD.md 7.17).
function visitsHtml(placeItem) {
  const id = placeItem.id;
  const entry = savedPlaces[id];
  const pressed = (status) => String(Boolean(entry && entry.status === status));
  return `
    <section class="place-section" aria-labelledby="visits-heading">
      <h3 id="visits-heading">${tr("Your visits")}</h3>
      <div class="status-buttons">
        <button type="button" class="toggle" data-status="want" data-place-id="${id}" aria-pressed="${pressed("want")}">${tr("Want to explore")}</button>
        <button type="button" class="toggle" data-status="revisit" data-place-id="${id}" aria-pressed="${pressed("revisit")}">${tr("Visit again")}</button>
        ${entry ? `<button type="button" class="link-button remove-button" data-remove-place="${id}">${tr("Remove from My Places")}</button>` : ""}
      </div>
      ${journalHtml(entry)}
      <form class="visit-form" data-visit-form="${id}" novalidate>
        <h4>${tr("Record a visit")}</h4>
        <label>${tr("Date")} <input type="date" name="date" value="${isoToday()}" max="${isoToday()}" required></label>
        <label>${tr("What did you notice?")} <span class="optional">${tr("(optional)")}</span>
          <textarea name="observation" rows="2" maxlength="500" placeholder="${tr("The children noticed different leaf shapes.")}"></textarea></label>
        <label>${tr("An idea for next time")} <span class="optional">${tr("(optional)")}</span>
          <input type="text" name="next" maxlength="200" placeholder="${tr("Look for changes in the trees.")}"></label>
        <p class="hint">${tr("Saved only in this browser. Please don't write children's names.")}</p>
        <p class="field-message" data-form-message hidden></p>
        <button type="submit">${tr("Mark as explored")}</button>
      </form>
    </section>`;
}

function journalHtml(entry) {
  if (!entry || !entry.visits.length) return "";
  const visits = [...entry.visits].reverse();
  return `<ol class="journal" reversed>${visits.map((visit) => `
    <li>
      <p class="journal-date">${formatDay(visit.date)}</p>
      ${visit.observation ? `<p>${escapeHtml(visit.observation)}</p>` : ""}
      ${visit.next ? `<p><strong>${tr("Next time:")}</strong> ${escapeHtml(visit.next)}</p>` : ""}
    </li>`).join("")}</ol>
    ${entry.note ? `<p class="journal-note"><strong>${tr("Note:")}</strong> ${escapeHtml(entry.note)}</p>` : ""}`;
}

// Planning a visit never marks it explored (PRD.md 7.9).
function planFormHtml(placeItem, focus, day) {
  const date = day && day.date >= isoToday() ? day.date : isoToday();
  return `
    <section class="place-section" aria-labelledby="plan-form-heading">
      <form class="plan-form" data-plan-form="${placeItem.id}" novalidate>
        <h3 id="plan-form-heading">${tr("Add to my week")}</h3>
        <div class="form-row">
          <label>${tr("Date")} <input type="date" name="date" value="${date}" min="${isoToday()}" required></label>
          <label>${tr("Time")} <span class="optional">${tr("(optional)")}</span> <input type="time" name="time"></label>
        </div>
        <label>${tr("Exploration theme")} <span class="optional">${tr("(optional)")}</span>
          <input type="text" name="theme" maxlength="80" value="${escapeHtml(tr(focus))}"></label>
        <label>${tr("Preparation notes")} <span class="optional">${tr("(optional)")}</span>
          <textarea name="notes" rows="2" maxlength="500" placeholder="${tr("Bring a bag for treasures.")}"></textarea></label>
        <p class="field-message" data-form-message hidden></p>
        <button type="submit">${tr("Add to my week")}</button>
        <p class="form-done" data-form-done role="status"></p>
      </form>
    </section>`;
}

// Guide text in the chosen language, worded for a class in Classroom mode.
function guideText(text) {
  return settings.mode === "classroom" ? forGroup(tr(text)) : tr(text);
}

// Switching perspective changes only the guide.
function showPerspective(id, perspective) {
  const placeItem = findPlace(id);
  const guide = guideFor(placeType(placeItem), placeItem.category);
  placeBody.querySelector("#guide-set").innerHTML = guideSetHtml(guide.sets[perspective]);
  for (const button of placeBody.querySelectorAll(".perspective")) {
    button.setAttribute("aria-pressed", String(Number(button.dataset.perspective) === perspective));
  }
}

function guideSetHtml(set) {
  const list = (items) => `<ul>${items.map((item) => `<li>${escapeHtml(guideText(item))}</li>`).join("")}</ul>`;
  return `
    <p class="perspective-focus">${escapeHtml(tr("Focus: {focus}", { focus: tr(set.focus) }))}</p>
    <h4>${tr("What children might notice")}</h4>${list(set.notice)}
    <h4>${tr("Before you go")}</h4>${list(set.before)}
    <h4>${tr("During the visit")}</h4>${list(set.during)}
    <h4>${tr("After the visit")}</h4>${list(set.after)}
    <h4>${tr("Practical life")}</h4><p>${escapeHtml(guideText(set.practical))}</p>`;
}

// RootMap activities for afterwards, for the chosen ages and the day's weather (PRD.md 7.5).
function atHomeHtml(guide, day) {
  const range = { "under-2": [0, 1], "2-3": [2, 3], "4-6": [4, 6], "2-6": [2, 6] }[settings.ages];
  const ideas = guide.activities.map(activityById).filter((activity) => activity &&
    activity.littleDays.minAge <= range[1] && activity.littleDays.maxAge >= range[0] &&
    (!day || canDo(activity, day.weather, day.season)));
  if (!ideas.length) {
    return settings.ages === "under-2" ? `<h4>${tr("At home afterwards")}</h4><p>${tr("Little Days doesn't have at-home ideas for children under 2 yet.")}</p>` : "";
  }
  const date = day ? day.date : isoToday();
  return `<h4>${tr("At home afterwards")}</h4>
    <ul>${ideas.slice(0, 2).map((activity) => `<li><button type="button" class="link-button" data-open="${activity.id}" data-date="${date}">
      ${escapeHtml(rootmapText(activity).title)}</button> <span class="source-note">${tr("from RootMap")}</span></li>`).join("")}</ul>`;
}

// The walk from the school: Little Days' estimate, and a free link to Google's walking route.
function renderRoute(placeItem) {
  const walk = estimateWalk({ lat: place.latitude, lng: place.longitude }, placeItem);
  const directions = `https://www.google.com/maps/dir/?api=1&origin=${place.latitude},${place.longitude}&destination=${placeItem.lat},${placeItem.lng}&travelmode=walking`;
  routeBox.innerHTML = `
    <p class="place-walk"><span aria-hidden="true">🚶</span> ${tr("About {minutes} min walk", { minutes: walkingMinutes(walk.durationMillis) })} · ${formatDistance(walk.distanceMeters, settings.unit)}
      <span class="walk-source">${tr("Little Days estimate")}</span></p>
    <p><a href="${directions}" target="_blank" rel="noopener">${tr("See the walking route on Google Maps")}<span aria-hidden="true"> ↗</span></a></p>
    ${mapsState === "ready" ? `<button type="button" class="button-secondary" data-street-view>${tr("Show Street View")}</button>` : ""}`;
  streetBox.hidden = true;
}

// Only when asked: each Street View shown is billed past Google's free 5,000 a month.
async function openStreetView(button) {
  const placeItem = findPlace(openPlaceId);
  if (!placeItem) return;
  button.disabled = true;
  streetBox.hidden = false;
  try {
    if (!await showStreetView(streetBox, { lat: placeItem.lat, lng: placeItem.lng })) {
      streetBox.hidden = true;
      button.outerHTML = `<p>${tr("Google has no Street View here.")}</p>`;
      return;
    }
    button.remove();
  } catch (error) {
    console.error(error);
    streetBox.hidden = true;
    button.outerHTML = `<p>${tr("Street View isn't available right now.")}</p>`;
  }
}

// After a change to My Places: the cards, the section, and the open dialog.
function placesChanged(id, message) {
  storePlaces(storage, savedPlaces);
  renderPlaces();
  renderMyPlaces();
  if (placeDialog.open && openPlaceId === id) {
    const placeItem = findPlace(id);
    if (placeItem) renderPlaceDetails(placeItem);
  }
  if (message) announce(message);
}

function savePlaceId(id) {
  const placeItem = findPlace(id);
  savedPlaces = savePlace(savedPlaces, id, placeItem && placeItem.category, isoToday());
  placesChanged(id, tr("Saved {name} to Want to explore.", { name: placeItem ? placeItem.name : tr("the place") }));
}

function setStatus(id, status) {
  const placeItem = findPlace(id);
  savedPlaces = setPlaceStatus(savedPlaces, id, status, placeItem && placeItem.category, isoToday());
  placesChanged(id, status === "revisit" ? tr("Marked to visit again.") : tr("Marked as want to explore."));
  placeDialog.querySelector(`[data-status="${status}"]`)?.focus();
}

function removeSavedPlace(id) {
  const placeItem = findPlace(id);
  const name = placeItem ? placeItem.name : tr("this place");
  if (!confirm(tr("Remove {name} from My Places? Its journal entries will be removed too.", { name }))) return;
  savedPlaces = removePlace(savedPlaces, id);
  placesChanged(id, tr("Removed {name} from My Places.", { name }));
}

function formMessage(form, text) {
  const message = form.querySelector("[data-form-message]");
  message.textContent = text ? `⚠︎ ${text}` : "";
  message.hidden = !text;
}

// Recording a visit adds a journal entry; earlier entries stay as they are.
function submitVisit(form) {
  const id = form.dataset.visitForm;
  const date = form.elements.date.value;
  if (!date || date > isoToday()) {
    formMessage(form, tr("Choose today or an earlier date."));
    form.elements.date.focus();
    return;
  }
  const placeItem = findPlace(id);
  savedPlaces = recordVisit(savedPlaces, id, placeItem && placeItem.category, isoToday(), {
    date, observation: form.elements.observation.value, next: form.elements.next.value,
  });
  placesChanged(id, tr("Recorded a visit on {day}.", { day: formatDay(date) }));
  document.querySelector("#visits-heading")?.focus();
}

function newEntryId() {
  return `v${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function submitPlanForm(form) {
  const id = form.dataset.planForm;
  const date = form.elements.date.value;
  if (!date || date < isoToday()) {
    formMessage(form, tr("Choose today or a later date."));
    form.elements.date.focus();
    return;
  }
  if (isPlacePlanned(plan, date, id)) {
    formMessage(form, tr("This place is already in your week for {day}.", { day: formatDay(date) }));
    return;
  }
  formMessage(form, "");
  const placeItem = findPlace(id);
  plan = addPlaceToPlan(plan, date, {
    placeId: id,
    category: placeItem && placeItem.category,
    time: form.elements.time.value,
    theme: form.elements.theme.value,
    notes: form.elements.notes.value,
  }, newEntryId());
  savePlan(storage, plan);
  renderPlan();
  form.querySelector("[data-form-done]").textContent = tr("Added to {day} ✓", { day: formatDay(date) });
}

// --- My Places (PRD.md 7.17) ---

function placesTab() {
  return document.querySelector("input[name=places-tab]:checked").value;
}

function lastActivity(entry) {
  return entry.visits.length ? entry.visits[entry.visits.length - 1].date : entry.saved;
}

function renderMyPlaces() {
  const ids = Object.keys(savedPlaces);
  for (const span of document.querySelectorAll("[data-count]")) {
    span.textContent = `(${ids.filter((id) => savedPlaces[id].status === span.dataset.count).length})`;
  }
  const tab = placesTab();
  const shown = ids.filter((id) => savedPlaces[id].status === tab)
    .sort((a, b) => (lastActivity(savedPlaces[a]) < lastActivity(savedPlaces[b]) ? 1 : -1));
  if (!shown.length) {
    placesList.innerHTML = `<div class="status"><p>${{
      want: settings.mode === "classroom" ? tr("No places here yet. Save places from Explore to plan your next class walk.")
        : tr("No places here yet. Save places from Explore to plan your next walk."),
      explored: tr("No explored places yet. Record a visit from a place's details after you go."),
      revisit: tr("Places you'd like to visit again, with fresh ideas, appear here."),
    }[tab]}</p><a class="button-secondary link-as-button" href="#explore">${tr("Find places")}</a></div>`;
    return;
  }
  placesList.innerHTML = shown.map((id) => savedPlaceHtml(id)).join("");
}

function savedPlaceHtml(id) {
  const entry = savedPlaces[id];
  const info = findPlace(id);
  const visits = entry.visits.length;
  const title = info ? escapeHtml(info.name || tr("Unnamed place")) : tr("This place isn't on the list anymore.");
  const latest = entry.visits[visits - 1];
  return `
    <article class="saved-place">
      <h3${info ? "" : ` class="unavailable"`}>${title}</h3>
      ${info ? `<p class="place-address">${escapeHtml(info.address || "")}</p>` : ""}
      <p class="saved-meta">${visits ? tr(visits === 1 ? "Last explored {day} · {count} visit" : "Last explored {day} · {count} visits", { day: formatDay(latest.date), count: visits })
        : entry.saved ? tr("Saved {day}", { day: formatDay(entry.saved) }) : tr("Saved")}</p>
      ${latest && latest.next ? `<p><strong>${tr("Next time:")}</strong> ${escapeHtml(latest.next)}</p>` : ""}
      ${visits ? `<details class="history"><summary>${tr("Exploration history ({count})", { count: visits })}</summary>${journalHtml(entry)}</details>` : ""}
      <div class="place-actions">
        <button type="button" class="button-secondary" data-place-open="${id}" ${info ? "" : "disabled"}
          aria-label="${tr("Open {name}", { name: info ? escapeHtml(info.name || "") : "" })}">${tr("Open")}</button>
        <button type="button" class="link-button remove-button" data-remove-place="${id}">${tr("Remove")}</button>
      </div>
    </article>`;
}

// An interest already worked out shows again from memory. A new one is worked out now, or
// when Filters closes if it's open.
function chooseInterest(value) {
  settings.interest = value;
  saveSettings(storage, settings);
  showChoices();
  if (explore && explore.key === exploreKey() && !categoriesToSearch(value, explore.loaded).length) showResults();
  else if (!filtersPanel.open) exploreHere();
}

// --- My week ---

function addActivity(id, date) {
  plan = addToPlan(plan, date, id);
  savePlan(storage, plan);
  if (current) render();
  else renderPlan();
  announce(tr("Added {title} to {day}.", { title: rootmapText(activityById(id)).title, day: formatDay(date) }));
  // The card was re-drawn, so put focus back on the same activity's title.
  document.querySelector(`#idea-list [data-open="${id}"][data-date="${date}"]`)?.focus();
}

function removeActivity(id, date) {
  plan = removeFromPlan(plan, date, id);
  savePlan(storage, plan);
  if (current) render();
  else renderPlan();
  announce(tr("Removed {title} from {day}.", { title: rootmapText(activityById(id)).title, day: formatDay(date) }));
  planHeading.focus();
}

function announce(text) {
  announcer.textContent = "";
  setTimeout(() => { announcer.textContent = text; }, 50);
}

// Forecast days plus any saved dates from today on.
function planDates() {
  const dates = new Set(Object.keys(plan));
  if (current) current.days.forEach((d) => dates.add(d.date));
  const schoolDay = (d) => settings.mode !== "classroom" || plan[d] || ![0, 6].includes(toDate(d).getDay());
  return [...dates].filter((d) => d >= isoToday() && schoolDay(d)).sort();
}

// The planned visit being edited in My week, by its entry ID.
let editingEntry = null;

function renderPlan() {
  const dates = planDates();
  if (!dates.length) {
    planBox.innerHTML = `<div class="status"><p>${tr("Your week is empty. Add activities or places to plan your week.")}</p>
      <a class="button-secondary link-as-button" href="#explore">${tr("Find places")}</a></div>`;
    return;
  }
  const placeIds = Object.values(plan).flat().filter((x) => typeof x === "object").map((x) => x.placeId);
  // My week can be redrawn while a visit is being edited (weather or place details
  // arriving), so what's been typed is carried over.
  const editForm = planBox.querySelector("[data-edit-form]");
  const draft = editForm && editForm.dataset.editForm === editingEntry ? new FormData(editForm) : null;
  planBox.innerHTML = `
    ${placeIds.length ? `<p class="data-credit" translate="no">© OpenStreetMap contributors</p>` : ""}
    <ul class="plan">${dates.map((date) => {
      const entries = dayEntries(date);
      const items = entries.map((entry) => typeof entry === "string" ? activityItemHtml(entry, date) : placeItemHtml(entry, date)).join("");
      return `
        <li>
          <div>
            <h3 class="plan-day">${formatDay(date)}</h3>
            ${planWeatherHtml(date)}
          </div>
          ${entries.length ? `<ul class="plan-items">${items}</ul>` : `<p class="plan-empty">${tr("Nothing planned")}</p>`}
        </li>`;
    }).join("")}</ul>`;
  const newForm = planBox.querySelector("[data-edit-form]");
  if (draft && newForm) {
    for (const [name, value] of draft) newForm.elements[name].value = value;
  }
}

// The day's forecast when the date is in it; never an estimate beyond it (PRD.md 7.9).
function planWeatherHtml(date) {
  if (!current) return "";
  const day = current.days.find((d) => d.date === date);
  if (!day) return `<p class="plan-weather">${tr("Forecast not available yet for this date.")}</p>`;
  const [icon, label] = weatherOf(day.code);
  const alerts = (plan[date] || []).length ? dayAlerts(day) : [];
  return `<p class="plan-weather"><span aria-hidden="true">${icon}</span> ${label} · ${temp(day.high)} / ${temp(day.low)} ·
    ${day.rainChance == null ? tr("Rain –") : tr("Rain {chance}%", { chance: day.rainChance })}</p>
    ${day.holidays.map((h) => `<span class="tag tag-holiday">${escapeHtml(tr(h))}</span>`).join("")}
    ${alerts.map((line) => `<p class="plan-alert">${line}</p>`).join("")}`;
}

// The day's warnings as full sentences, worst first (PRD.md 7.4).
function dayAlerts(day) {
  const { hazards, cautions, notes } = day.weather;
  return [...hazards, ...cautions, ...notes].map((key) => WARNINGS[key](day));
}

// True when an outdoor place is planned on a day with a hazard (PRD.md 7.15).
function outdoorOnHazardDay(info, date) {
  const day = current ? current.days.find((d) => d.date === date) : null;
  return Boolean(info && day && day.weather.hazards.length && settingFor(info) === "outdoors");
}

// A day's entries: visits with a time first, earliest first, then everything else.
function dayEntries(date) {
  const timeOf = (entry) => (typeof entry === "object" && entry.time) || "99";
  return [...(plan[date] || [])].sort((a, b) => timeOf(a).localeCompare(timeOf(b)));
}

// "Forecast at 9:30 AM: 52°, Rain 10%" for a visit with a time, or "".
function visitForecast(visit, date) {
  const hour = current && visit.time ? hourForecast(current.hourly, date, visit.time) : null;
  if (!hour) return "";
  return tr("Forecast at {time}: {temp}, {rain}", {
    time: formatTime(visit.time),
    temp: temp(hour.temperature),
    rain: hour.rainChance == null ? tr("Rain –") : tr("Rain {chance}%", { chance: hour.rainChance }),
  });
}

function activityItemHtml(id, date) {
  const title = escapeHtml(rootmapText(activityById(id)).title);
  return `
    <li>
      <button type="button" class="link-button" data-open="${id}" data-date="${date}">${title}</button>
      <button type="button" class="link-button remove-button" data-remove="${id}" data-date="${date}"
        aria-label="${tr("Remove {title} from {day}", { title, day: formatDay(date) })}">${tr("Remove")}</button>
    </li>`;
}

function placeItemHtml(visit, date) {
  const info = findPlace(visit.placeId);
  const name = info ? escapeHtml(info.name || tr("Unnamed place")) : tr("Saved place (details unavailable right now)");
  if (editingEntry === visit.entry) {
    return `
      <li class="plan-place">
        <form class="edit-visit-form" data-edit-form="${visit.entry}" novalidate>
          <p class="plan-place-name">${PIN_ICON} ${name}</p>
          <div class="form-row">
            <label>${tr("Date")} <input type="date" name="date" value="${date}" min="${isoToday()}" required></label>
            <label>${tr("Time")} <span class="optional">${tr("(optional)")}</span> <input type="time" name="time" value="${visit.time}"></label>
          </div>
          <label>${tr("Exploration theme")} <span class="optional">${tr("(optional)")}</span>
            <input type="text" name="theme" maxlength="80" value="${escapeHtml(visit.theme)}"></label>
          <label>${tr("Preparation notes")} <span class="optional">${tr("(optional)")}</span>
            <textarea name="notes" rows="2" maxlength="500">${escapeHtml(visit.notes)}</textarea></label>
          <p class="field-message" data-form-message hidden></p>
          <div class="place-actions">
            <button type="submit">${tr("Save changes")}</button>
            <button type="button" class="button-secondary" data-cancel-edit>${tr("Cancel")}</button>
          </div>
        </form>
      </li>`;
  }
  const meta = [formatTime(visit.time), visit.theme].filter(Boolean).map(escapeHtml).join(" · ");
  return `
    <li class="plan-place">
      <div>
        ${PIN_ICON}
        ${info ? `<button type="button" class="link-button" data-place-open="${visit.placeId}">${name}</button>` : `<span>${name}</span>`}
        ${meta ? `<p class="plan-meta">${meta}</p>` : ""}
        ${visitForecast(visit, date) ? `<p class="plan-meta">${visitForecast(visit, date)}</p>` : ""}
        ${visit.notes ? `<p class="plan-notes">${escapeHtml(visit.notes)}</p>` : ""}
        ${outdoorOnHazardDay(info, date) ? `<p class="plan-alert">${tr("Outdoor place on a day with a weather warning. Consider moving this visit.")}</p>` : ""}
      </div>
      <div class="plan-place-actions">
        <button type="button" class="link-button" data-edit-visit="${visit.entry}" aria-label="${tr("Edit the visit to {name}", { name })}">${tr("Edit")}</button>
        <button type="button" class="link-button remove-button" data-remove-visit="${visit.entry}"
          aria-label="${tr("Remove the visit to {name} from {day}", { name, day: formatDay(date) })}">${tr("Remove")}</button>
      </div>
    </li>`;
}

function submitEditVisit(form) {
  const entry = form.dataset.editForm;
  const date = form.elements.date.value;
  if (!date || date < isoToday()) {
    formMessage(form, tr("Choose today or a later date."));
    form.elements.date.focus();
    return;
  }
  const before = plan;
  plan = updatePlannedPlace(plan, entry, {
    date, time: form.elements.time.value, theme: form.elements.theme.value, notes: form.elements.notes.value,
  });
  if (plan === before) {
    formMessage(form, tr("This place is already in your week for {day}.", { day: formatDay(date) }));
    return;
  }
  savePlan(storage, plan);
  editingEntry = null;
  renderPlan();
  announce(tr("Saved the changes to your visit."));
  planHeading.focus();
}

function removeVisit(entry) {
  plan = removePlannedPlace(plan, entry);
  savePlan(storage, plan);
  if (editingEntry === entry) editingEntry = null;
  renderPlan();
  announce(tr("Removed the visit from your week."));
  planHeading.focus();
}

// --- Share and print (PRD.md 7.9, 7.14, 7.20) ---
// The share card and the guide are built from state already in memory (the
// plan, savedPlaces, findPlace's cache and the current forecast): printing never makes a
// weather or holiday request. style.css's @media print shows only #print-area.
// The private journal (an entry's observation/next, PRD.md 7.17) is never printed here.

function printBrandHtml() {
  return `
    <p class="logo print-brand" translate="no">
      <svg class="logo-mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path class="logo-mark-leaf" d="M12 13C7.6 13 4.5 9.7 4.5 5.1 9.3 5.1 12 8.5 12 13Z"/>
        <path class="logo-mark-leaf" d="M12 13c4.4 0 7.5-3.3 7.5-7.9-4.8 0-7.5 3.4-7.5 7.9Z"/>
        <path class="logo-mark-stem" d="M12 21v-8.2"/>
      </svg>
      Little Days
    </p>`;
}

// A sun, a cloud and a flower, drawn here because nothing can load from outside (AGENTS.md).
const PRINT_DOODLES = `
  <svg class="print-doodles" viewBox="0 0 130 70" aria-hidden="true" focusable="false">
    <g stroke="#E9A23B" stroke-width="3" stroke-linecap="round">
      <path d="M40 6v7M40 47v7M16 30h7M57 30h7M23 13l5 5M52 42l5 5M57 13l-5 5M28 42l-5 5"/>
    </g>
    <circle cx="40" cy="30" r="13" fill="#F6C75E"/>
    <circle cx="35" cy="28" r="1.8" fill="#26251F"/><circle cx="45" cy="28" r="1.8" fill="#26251F"/>
    <path d="M35 34q5 4 10 0" fill="none" stroke="#26251F" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M76 46a9 9 0 0 1 2-18 12 12 0 0 1 23-2 10 10 0 0 1 8 20Z" fill="#FFF" stroke="#7FA7C9" stroke-width="2.5" stroke-linejoin="round"/>
    <g fill="#E98B7A"><circle cx="112" cy="58" r="4"/><circle cx="120" cy="58" r="4"/><circle cx="116" cy="52" r="4"/><circle cx="116" cy="64" r="4"/></g>
    <circle cx="116" cy="58" r="3" fill="#F6C75E"/>
  </svg>`;

function printHeroHtml(title, lines) {
  return `
    <header class="print-hero">
      ${PRINT_DOODLES}
      ${printBrandHtml()}
      <h1 class="print-title">${title}</h1>
      ${lines}
    </header>`;
}

// The weather line for one date: the real forecast when it's in range, never a guess
// (PRD.md 7.9), or else the exact fallback text the print spec asks for.
function printWeatherHtml(day) {
  if (!day) return tr("Weather forecast not available yet.");
  const [icon, label] = weatherOf(day.code);
  const rain = day.rainChance == null ? tr("Rain –") : tr("Rain {chance}%", { chance: day.rainChance });
  const holidays = day.holidays.map((h) => ` · ${escapeHtml(tr(h))}`).join("");
  return `<span aria-hidden="true">${icon}</span> ${label} · ${temp(day.high)} / ${temp(day.low)} · ${rain}${holidays}
    ${dayAlerts(day).map((line) => `<br><strong>${line}</strong>`).join("")}`;
}

// A card built only from what's already planned, so nothing has to be written for it. The same
// card is screenshotted or printed. Only days with something planned, so no empty pages.
function plannedDates() {
  return planDates().filter((date) => (plan[date] || []).length);
}

// range: "week", or one planned date.
function shareCardHtml(range) {
  const dates = range === "week" ? plannedDates() : [range];
  const hasPlace = dates.some((date) => plan[date].some((entry) => typeof entry === "object"));
  return `
    <article class="print-page ${range === "week" ? "print-week" : "print-single"}">
      ${printHeroHtml(tr("Our Little Adventures"), dates.length > 1 ? `<p class="print-subtitle">${printWeekRange(dates)}</p>` : "")}
      ${hasPlace ? `<p class="data-credit" translate="no">© OpenStreetMap contributors</p>` : ""}
      ${dates.length ? dates.map((date) => printDayHtml(date, range !== "week")).join("") : `<p class="print-empty">${tr("Your week is empty. Add activities or places to plan your week.")}</p>`}
    </article>`;
}

function renderShareCard() {
  document.querySelector("#share-card").innerHTML = shareCardHtml(document.querySelector("#share-range").value);
}

function openShare() {
  document.querySelector("#share-range").innerHTML = [
    `<option value="week">${tr("This week")}</option>`,
    ...plannedDates().map((date) => `<option value="${date}">${formatDay(date)}</option>`),
  ].join("");
  renderShareCard();
  shareDialog.showModal();
}

const shareDialog = document.querySelector("#share-dialog");
document.querySelector("#share-range").addEventListener("change", renderShareCard);
document.querySelector("#share-close").addEventListener("click", () => shareDialog.close());
document.querySelector("#share-clean").addEventListener("click", (event) => {
  event.stopPropagation();
  shareDialog.classList.add("is-clean");
});
shareDialog.addEventListener("click", () => shareDialog.classList.remove("is-clean"));
shareDialog.addEventListener("close", () => shareDialog.classList.remove("is-clean"));
document.querySelector("#share-print").addEventListener("click", () => {
  printArea.innerHTML = document.querySelector("#share-card").innerHTML;
  window.print();
});

// Dates are already formatted for the page's language (formatDay); only the dash joining
// them is language-neutral, so no translation is needed here.
function printWeekRange(dates) {
  const first = formatDay(dates[0]);
  const last = formatDay(dates[dates.length - 1]);
  return first === last ? first : `${first} – ${last}`;
}

// Tips come from the forecast, so they need no writing and only appear when there is one.
function printWearHtml(day) {
  if (!day) return "";
  const { wear, bring } = whatToWear(day);
  return `
    <div class="print-wear">
      ${wear.length ? `<p><strong>${tr("What to wear")}:</strong> ${wear.map((w) => tr(w)).join(LANG === "zh" ? "、" : ", ")}</p>` : ""}
      ${bring.length ? `<p><strong>${tr("Bring")}:</strong> ${bring.map((b) => tr(b)).join(LANG === "zh" ? "、" : ", ")}</p>` : ""}
      <p class="print-item-meta">${tr("These tips are for comfort. They don't make outdoor play safe in bad weather.")}</p>
    </div>`;
}

// Only called for dates that have at least one entry.
function printDayHtml(date, withWear) {
  const day = current ? current.days.find((d) => d.date === date) : null;
  const items = dayEntries(date).map((entry) => typeof entry === "string" ? printActivityItemHtml(entry) : printPlaceItemHtml(entry, date)).join("");
  return `
    <section class="print-day">
      <h2>${formatDay(date)}</h2>
      <p class="print-weather">${printWeatherHtml(day)}</p>
      ${day && day.weather.hazards.length ? `<p class="print-week-alert">⚠︎ ${tr("Indoor day")}</p>` : ""}
      <ul class="print-items">${items}</ul>
      ${withWear ? printWearHtml(day) : ""}
    </section>`;
}

function printActivityItemHtml(id) {
  const activity = activityById(id);
  if (!activity) return "";
  return `
    <li class="print-item">
      <p class="print-item-title">${escapeHtml(rootmapText(activity).title)}</p>
      <p class="print-item-meta">${tr("from RootMap")}</p>
    </li>`;
}

// A planned visit: the place's name and address (from OpenStreetMap, so the credit above
// covers it) and only the adult's own preparation notes, never the private journal.
function printPlaceItemHtml(visit, date) {
  const info = findPlace(visit.placeId);
  const name = info ? escapeHtml(info.name || tr("Unnamed place")) : tr("Saved place (details unavailable right now)");
  const meta = [formatTime(visit.time), visit.theme].filter(Boolean).map(escapeHtml).join(" · ");
  return `
    <li class="print-item">
      <p class="print-item-title">${name}</p>
      ${info && info.address ? `<p class="print-item-address">${escapeHtml(info.address)}</p>` : ""}
      ${meta ? `<p class="print-item-meta">${meta}</p>` : ""}
      ${visitForecast(visit, date) ? `<p class="print-item-meta">${visitForecast(visit, date)}</p>` : ""}
      ${visit.notes ? `<p class="print-item-notes">${escapeHtml(visit.notes)}</p>` : ""}
    </li>`;
}

// Reads the perspective actually shown (the tab the adult chose, not just the suggested
// one) straight from the dialog, since showPerspective() never re-renders the whole dialog.
function printGuideFor(id) {
  const placeItem = findPlace(id);
  if (!placeItem) return;
  const activeTab = placeBody.querySelector(".perspective[aria-pressed=true]");
  const shown = activeTab ? Number(activeTab.dataset.perspective) : 0;
  printGuide(placeItem, shown, current ? current.days[selectedDay] : null);
}

function printGuide(placeItem, shown, day) {
  const guide = guideFor(placeType(placeItem), placeItem.category);
  const set = guide.sets[shown];
  const list = (items) => `<ul>${items.map((item) => `<li>${escapeHtml(guideText(item))}</li>`).join("")}</ul>`;
  printArea.innerHTML = `
    <article class="print-page print-guide">
      ${printHeroHtml(escapeHtml(placeItem.name || tr("Unnamed place")), `
        ${placeItem.address ? `<p class="print-address">${escapeHtml(placeItem.address)}</p>` : ""}
        <p class="print-perspective">${tr(["First visit", "Second visit", "Third visit"][shown])}</p>`)}
      <p class="data-credit" translate="no">© OpenStreetMap contributors</p>
      <div class="print-sections">
      <section class="print-section">
        <h2>${day ? tr("Weather on {day}", { day: formatDay(day.date) }) : tr("Weather")}</h2>
        <p>${printWeatherHtml(day)}</p>
      </section>
      <section class="print-section">
        <h2>${tr("Why explore this place?")}</h2>
        <p>${escapeHtml(guideText(guide.why))}</p>
      </section>
      <section class="print-section">
        <h2>${tr("Exploration focus")}</h2>
        <p>${escapeHtml(tr(set.focus))}</p>
      </section>
      <section class="print-section">
        <h2>${tr("What children might notice")}</h2>
        ${list(set.notice)}
      </section>
      <section class="print-section">
        <h2>${tr("Before you go")}</h2>
        ${list(set.before)}
      </section>
      <section class="print-section">
        <h2>${tr("During the visit")}</h2>
        ${list(set.during)}
      </section>
      <section class="print-section">
        <h2>${tr("After the visit")}</h2>
        ${list(set.after)}
      </section>
      <section class="print-section">
        <h2>${tr("Practical life extension")}</h2>
        <p>${escapeHtml(guideText(set.practical))}</p>
      </section>
      </div>
      <section class="print-drawing">
        <h2>${tr("Draw what you noticed")}</h2>
        <div class="print-drawing-box" aria-hidden="true">${PRINT_DOODLES}</div>
      </section>
    </article>`;
  window.print();
}

// --- Activity details ---

function openDetails(id, date, opener) {
  const details = activityDetails(activityById(id), LANG);
  dialogOpener = { id, date, element: opener };
  dialogBody.innerHTML = `
    ${photoHtml(activityById(id), "(max-width: 719px) 100vw, 520px")}
    <h2 id="details-title" tabindex="-1">${escapeHtml(details.title)}</h2>
    <p class="meta">${tr("Ages {ages}", { ages: escapeHtml(details.ages.replace(" years", "")) })} · ${details.duration}</p>
    <p>${escapeHtml(details.description)}</p>
    <div class="details-box">
      <h3>${tr("What you'll need")}</h3>
      ${details.materials.length
        ? `<ul>${details.materials.map((m) => `<li>${escapeHtml(m)}</li>`).join("")}</ul>`
        : `<p>${tr("Nothing to prepare.")}</p>`}
    </div>
    <h3>${tr("Steps")}</h3>
    <ol>${details.steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>
    <h3>${guideText("What your child practices")}</h3>
    <ul>${details.practices.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>
    ${details.safety ? `<h3>${tr("Safety")}</h3><p>${escapeHtml(details.safety)}</p>` : ""}
    <p class="source-note">${tr("From the RootMap activity collection.")}</p>`;
  dialogAdd.dataset.id = id;
  dialogAdd.dataset.date = date;
  dialogStatus.textContent = "";
  updateDialogAdd();
  dialog.showModal();
  document.querySelector("#details-title").focus();
}

function updateDialogAdd() {
  const { id, date } = dialogAdd.dataset;
  const added = isPlanned(plan, date, id);
  dialogAdd.disabled = added;
  dialogAdd.textContent = added ? tr("Added ✓") : tr("Add to {day}", { day: formatDay(date) });
  dialogAdd.classList.toggle("button-added", added);
}

dialogAdd.addEventListener("click", () => {
  const { id, date } = dialogAdd.dataset;
  plan = addToPlan(plan, date, id);
  savePlan(storage, plan);
  if (current) render();
  else renderPlan();
  updateDialogAdd();
  dialogStatus.textContent = tr("Added to {day}.", { day: formatDay(date) });
  document.querySelector("#details-close").focus();
});

document.querySelector("#details-close").addEventListener("click", () => dialog.close());

// Escape closes the dialog too (built into <dialog>). Either way, focus goes back
// to the button that opened it, or the same button after a re-render.
dialog.addEventListener("close", () => {
  if (!dialogOpener) return;
  const { id, date, element } = dialogOpener;
  const target = element.isConnected ? element : document.querySelector(`[data-open="${id}"][data-date="${date}"]`);
  (target || planHeading).focus();
  dialogOpener = null;
});

// --- Page states (PRD.md section 8) ---

// Shows one message (and optionally a Try again button) in a status area.
function showStatus(area, className, text, retry, retryLabel = tr("Try again")) {
  area.className = `${area.classList.contains("hint") ? "hint" : "status"} ${className}`.trim();
  area.innerHTML = "";
  if (!text) return;
  const message = document.createElement("p");
  message.textContent = text;
  area.append(message);
  if (retry) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button-secondary";
    button.textContent = retryLabel;
    button.addEventListener("click", retry);
    area.append(button);
  }
}

// The subtitles follow who's exploring.
function renderSubtitles() {
  const classroom = settings.mode === "classroom";
  document.querySelector("#weather-subtitle").textContent = classroom ? tr("What to expect before taking the class out.") : tr("What to expect before you head out.");
  document.querySelector("#places-subtitle").textContent = classroom ? tr("Places for class walks.") : tr("Places to explore together.");
  document.querySelector("#plan-subtitle").textContent = classroom ? tr("School days in the week ahead.") : tr("The week ahead.");
}

// Removes the weather of an earlier location, so it isn't mistaken for the new one.
function clearWeather() {
  current = null;
  weatherNow.hidden = true;
  week.hidden = true;
  week.innerHTML = "";
  dayWeather.hidden = true;
  placeLine.hidden = true;
  holidayNote.hidden = true;
  ideasSection.hidden = true;
  nowLine.hidden = true;
  renderExploreDays();
  renderPlan();
}

function showWeatherLoading(label) {
  clearWeather();
  weatherSection.hidden = false;
  showStatus(weatherStatus, "loading", tr("Getting the weather for {place}…", { place: label }));
  nowLine.className = "now-line";
  nowLine.innerHTML = `<p class="now-loading">${tr("Getting the weather…")}</p>`;
  nowLine.hidden = false;
}

function showWeatherError(retry) {
  clearWeather();
  showStatus(weatherStatus, "error", tr("We couldn't load the weather right now. Check your internet connection and try again."), retry);
  nowLine.className = "now-line";
  nowLine.innerHTML = `<p class="now-loading">${tr("Weather unavailable right now.")}</p>`;
  nowLine.hidden = false;
}

// --- In use ---

function render() {
  const weekPlan = planWeek(current.days, ACTIVITIES);
  const day = current.days[selectedDay];
  renderNow();
  renderWeek(weekPlan);
  renderDayWeather(day);
  renderIdeas(day, weekPlan[selectedDay]);
  renderExploreDays();
  renderFilterSummary();
  renderPlan();
  renderPlaces();
}

// The compact line by the search and the Now / Next hours panel (PRD.md 7.15).
function renderNow() {
  const { now, hours, days } = current;
  const [icon, label] = weatherOf(now.weather_code);
  const rainChance = hours.length && hours[0].rainChance != null ? `${hours[0].rainChance}%` : "–";
  const today = days[0].weather;
  const firstWarning = [...today.hazards, ...today.cautions, ...today.notes][0];
  // Only a day with nothing to warn about gets the friendly line; it never says "safe".
  const summary = firstWarning ? SHORT_WARNINGS[firstWarning]() : tr("Nice for exploring");
  nowLine.className = `now-line${today.hazards.length ? " now-hazard" : ""}`;
  nowLine.innerHTML = `
    <p><span aria-hidden="true">${icon}</span> <span class="visually-hidden">${label}</span> ${temp(now.temperature_2m)} ·
      <span${firstWarning ? ` class="now-warning"` : ""}>${summary}</span></p>
    <a href="#weather">${tr("More weather")}</a>`;
  nowLine.hidden = false;

  weatherNow.innerHTML = `
    <div class="now-card">
      <h3>${tr("Now")}</h3>
      <p class="now-temp">${temp(now.temperature_2m)}</p>
      <p><span aria-hidden="true">${icon}</span> ${label}</p>
      <p>${tr("Feels like {temp}", { temp: temp(now.apparent_temperature) })}</p>
      <p>${tr("Wind {wind}, gusts {gusts}", { wind: wind(now.wind_speed_10m), gusts: wind(now.wind_gusts_10m) })}</p>
      <p>${tr("Rain {rain} this hour", { rain: rainChance })}</p>
      ${now.precipitation > 0 ? `<p>${tr("{amount} rain in the last 15 minutes", { amount: formatRain(now.precipitation, settings.unit) })}</p>` : ""}
    </div>
    <div class="hours">
      <h3>${tr("Next hours")}</h3>
      <ol class="hour-list">${hours.map((hour) => {
        const [hourIcon, hourLabel] = weatherOf(hour.code);
        return `
          <li>
            <span class="hour-time">${formatHour(hour.time)}</span>
            <span class="hour-icon" aria-hidden="true">${hourIcon}</span>
            <span class="visually-hidden">${hourLabel}</span>
            <span class="hour-temp">${temp(hour.temperature)}</span>
            <span class="hour-rain">${hour.rainChance == null ? tr("Rain –") : tr("Rain {chance}%", { chance: hour.rainChance })}</span>
          </li>`;
      }).join("")}</ol>
    </div>`;
  weatherNow.hidden = false;
}

function renderWeek(weekPlan) {
  const { location, days } = current;
  placeLine.textContent = `${location.label} · ${formatDay(days[0].date)} – ${formatDay(days[days.length - 1].date)}`;
  placeLine.hidden = false;
  holidayNote.textContent = {
    "no-country": tr("Holidays show when you search an address or city."),
    unsupported: tr("Nager.Date doesn't list public holidays for this country, so none are shown."),
    failed: tr("Public holidays couldn't be loaded, so they aren't shown."),
  }[current.holidayProblem] || "";
  holidayNote.hidden = !current.holidayProblem;

  week.innerHTML = days.map((day, i) => {
    const [icon, label] = weatherOf(day.code);
    const featured = weekPlan[i][0];
    const date = toDate(day.date);
    return `
      <li>
        <button class="day" type="button" data-index="${i}" aria-pressed="${i === selectedDay}">
          <span class="day-name">${date.toLocaleDateString(LOCALE, { weekday: "short" })}</span>
          <span class="day-date">${date.toLocaleDateString(LOCALE, { month: "short", day: "numeric" })}</span>
          <span class="day-icon" aria-hidden="true">${icon}</span>
          <span class="day-temps">
            <span class="visually-hidden">${tr("High")}</span> ${temp(day.high)}
            <span class="day-low"><span class="visually-hidden">${tr("Low")}</span> ${temp(day.low)}</span>
          </span>
          <span class="day-condition">${label}</span>
          <span class="day-rain">${day.rainChance == null ? tr("Rain –") : tr("Rain {chance}%", { chance: day.rainChance })}</span>
          ${day.holidays.map((h) => `<span class="tag tag-holiday">${escapeHtml(tr(h))}</span>`).join("")}
          ${day.weather.hazards.length ? `<span class="tag tag-warning">${tr("Indoor day")}</span>` : ""}
          <span class="day-pick">
            ${featured ? `${photoHtml(featured.activity, "112px")}
              <span class="day-pick-title">${escapeHtml(rootmapText(featured.activity).title)}</span>`
              : tr("No idea yet")}
          </span>
        </button>
      </li>`;
  }).join("");
  week.hidden = false;
}

// The selected day's warnings and "What to wear", under the strip.
function renderDayWeather(day) {
  const { hazards, cautions, notes } = day.weather;
  const lines = [...hazards, ...cautions, ...notes].map((key) => WARNINGS[key](day));
  if (hazards.length) lines.push(tr("Outdoor ideas are left out today."));
  warningsBox.innerHTML = `
    ${lines.length ? `<ul>${lines.map((line) => `<li>${line}</li>`).join("")}</ul>` : ""}
    <p class="warnings-footnote">${tr("These ideas use the daily forecast for the whole area. Check the weather before you go out, and come inside if it changes.")}</p>`;
  warningsBox.classList.toggle("has-warnings", lines.length > 0);

  const wear = whatToWear(day);
  wearBox.innerHTML = `
    <h3><span aria-hidden="true">🧥</span> ${tr("What to wear")}</h3>
    ${wear.wear.length ? `<ul>${wear.wear.map((w) => `<li>${tr(w)}</li>`).join("")}</ul>` : ""}
    ${wear.bring.length ? `<p class="panel-label">${tr("Bring")}</p><ul>${wear.bring.map((b) => `<li>${tr(b)}</li>`).join("")}</ul>` : ""}
    ${wear.notes.map((n) => `<p>${tr(n)}</p>`).join("")}
    <p class="panel-footnote">${tr("These tips are for comfort. They don't make outdoor play safe in bad weather.")}</p>`;
  dayWeather.hidden = false;
}

function renderIdeas(day, ideas) {
  const [, label] = weatherOf(day.code);
  ideasHeading.textContent = tr("Ideas for {day}", { day: toDate(day.date).toLocaleDateString(LOCALE, { weekday: "long", month: "short", day: "numeric" }) });
  ideasSubtitle.textContent = [tr("{temp} and {condition}", { temp: temp(day.high), condition: LANG === "zh" ? label : label.toLowerCase() }), ...day.holidays.map((h) => tr(h))].join(" · ");

  ideaList.innerHTML = ideas.length
    ? ideas.map((idea) => ideaHtml(idea, day.date)).join("")
    : `<p class="status">${tr("No ideas for this day yet.")}</p>`;

  const why = explainDay(day, label, ideas, settings.unit, LANG);
  whyBox.innerHTML = `
    <h3><span aria-hidden="true">💡</span> ${tr("Why these activities?")}</h3>
    <p>${why.map(escapeHtml).join(" ")}</p>`;
  whyBox.hidden = why.length === 0;

  ideasSection.hidden = false;
}

function ideaHtml({ activity, outside, holiday }, date) {
  const original = rootmapText(activity);
  const meta = activity.littleDays;
  const where = meta.place === "outdoor" ? tr("Outdoor")
    : meta.place === "indoor" || !outside ? tr("Indoor")
    : tr("Outdoor or indoor");
  const added = isPlanned(plan, date, activity.id);
  const title = escapeHtml(original.title);
  return `
    <article class="idea">
      ${photoHtml(activity, "(max-width: 719px) 96px, 320px")}
      <div class="idea-body">
        <h3><button type="button" class="idea-title" data-open="${activity.id}" data-date="${date}">${title}</button></h3>
        <p class="meta">${tr("{where} · {minutes} min · Ages {min}–{max}", { where, minutes: original.minutes, min: meta.minAge, max: meta.maxAge })}</p>
        ${holiday ? `<p><span class="tag tag-holiday">${escapeHtml(tr("{holiday}-inspired idea", { holiday: tr(meta.holidays[0]) }))}</span></p>` : ""}
        <p class="idea-description">${escapeHtml(original.description)}</p>
        <ul class="tags">${original.domains.slice(0, 3).map((d) => `<li class="tag tag-soft">${escapeHtml(d)}</li>`).join("")}</ul>
        ${original.safety ? `<p class="safety"><strong>${tr("Safety:")}</strong> ${escapeHtml(original.safety)}</p>` : ""}
        ${added
          ? `<button type="button" class="button-added" disabled>${tr("Added ✓")}</button>`
          : `<button type="button" data-add="${activity.id}" data-date="${date}" aria-label="${tr("Add {title} to my week", { title })}">${tr("Add to my week")}</button>`}
      </div>
    </article>`;
}

// The photo, or a plain tile with the title's first letter if there isn't one.
function photoHtml(activity, sizes) {
  const photo = activity.littleDays.photo;
  const initial = escapeHtml(rootmapText(activity).title[0]);
  if (!photo) return `<span class="art art-missing" data-initial="${initial}"></span>`;
  const base = `images/activities/${activity.id}`;
  return `
    <span class="art" data-initial="${initial}">
      <img src="${base}-480.webp" srcset="${base}-480.webp 480w, ${base}-960.webp 960w"
        sizes="${sizes}" width="${photo.width}" height="${photo.height}"
        alt="" loading="lazy" decoding="async">
    </span>`;
}

// --- Helpers ---

function activityById(id) {
  return ACTIVITIES.find((a) => a.id === id);
}

function temp(celsius) {
  return formatTemp(celsius, settings.unit);
}

function wind(kmh) {
  return formatWind(kmh, settings.unit);
}

// "2026-10-30" alone is read as UTC midnight, which is the day before in the US.
// Adding a time makes it local midnight.
function toDate(isoDate) {
  return new Date(`${isoDate}T00:00`);
}

function formatDay(isoDate) {
  return toDate(isoDate).toLocaleDateString(LOCALE, { weekday: "short", month: "short", day: "numeric" });
}

// "2026-11-04T19:00" (the place's local time) → "7 PM". Read and shown as local time,
// so the visitor's own time zone doesn't shift it.
function formatHour(isoTime) {
  return new Date(isoTime).toLocaleTimeString(LOCALE, { hour: "numeric" });
}

// "13:30" → "1:30 PM". Empty stays empty.
function formatTime(time) {
  return time ? new Date(`2000-01-01T${time}`).toLocaleTimeString(LOCALE, { hour: "numeric", minute: "2-digit" }) : "";
}

// Today's date in the visitor's time zone, as YYYY-MM-DD.
function isoToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

// The years this week's dates fall in (two in the last days of December).
function yearsThisWeek() {
  const today = new Date();
  const lastDay = new Date(today);
  lastDay.setDate(today.getDate() + 6);
  return [...new Set([today.getFullYear(), lastDay.getFullYear()])];
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}


// --- Language (PRD.md 7.19) ---

// index.html is written in English; in Chinese its text and labels are swapped in place.
// Text with no entry in ZH (the brand, numbers) stays as it is.
function translatePage() {
  document.documentElement.lang = LANG === "zh" ? "zh-CN" : "en";
  const switchButton = document.querySelector("#lang-switch");
  switchButton.textContent = LANG === "zh" ? "EN" : "中文";
  switchButton.lang = LANG === "zh" ? "en" : "zh-CN";
  if (LANG !== "zh") return;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.nodeValue.trim();
    if (text && ZH[text] !== undefined) node.nodeValue = node.nodeValue.replace(text, ZH[text]);
  }
  for (const element of document.querySelectorAll("[placeholder], [aria-label], [title]")) {
    for (const attribute of ["placeholder", "aria-label", "title"]) {
      const value = element.getAttribute(attribute);
      if (value && ZH[value] !== undefined) element.setAttribute(attribute, ZH[value]);
    }
  }
}

// Switching reloads the page, so everything is drawn again in the new language.
document.querySelector("#lang-switch").addEventListener("click", () => {
  settings.lang = LANG === "zh" ? "en" : "zh";
  saveSettings(storage, settings);
  location.reload();
});

// --- Views (DESIGN.md 5) ---
// Explore, Weather, My Places and My week are shown one at a time, chosen by the URL hash,
// so the back button and links like "More weather" work without a router.

const VIEWS = ["explore", "weather", "my-places", "my-week"];

function viewName() {
  return VIEWS.includes(location.hash.slice(1)) ? location.hash.slice(1) : "explore";
}

function showView() {
  const name = viewName();
  for (const view of document.querySelectorAll(".view")) view.hidden = view.dataset.view !== name;
  for (const link of document.querySelectorAll(".site-nav a")) {
    if (link.getAttribute("href") === `#${name}`) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  // The map can't be drawn while its view is hidden, so it catches up here.
  if (name !== "explore") return;
  if (explore) renderPlaces();
  else exploreHere();
}

window.addEventListener("hashchange", () => {
  showView();
  window.scrollTo(0, 0);
});

// --- Start ---

translatePage();
for (const input of unitInputs) input.checked = input.value === settings.unit;
document.querySelector("#interest").innerHTML = [["all", "All"], ...CATEGORY_KEYS.map((key) => [key, CATEGORIES[key].label])]
  .map(([key, label]) => `<option value="${key}">${tr(label)}</option>`).join("");
document.querySelector("#minutes").innerHTML = [...SETTING_CHOICES.minutes].sort((a, b) => a - b)
  .map((minutes) => `<option value="${minutes}">${tr("{minutes} min walk", { minutes })}</option>`).join("");
showChoices();
renderSubtitles();
locationLine.innerHTML = `<span class="location-label">📍 ${escapeHtml(SCHOOL.name)}</span>`;
locationLine.title = SCHOOL.label;
showView();saveSettings(storage, settings); // finishes a v1 → v2 migration (PRD.md 7.18)
savePlan(storage, plan); // keep the cleaned-up plan (and finish a v1 → v2 migration)
storePlaces(storage, savedPlaces); // the same for My Places
renderPlan();
renderMyPlaces();
loadWeather(place);
if (config.googleMapsKey) startMap();
