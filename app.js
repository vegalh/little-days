const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const HOLIDAYS_URL = "https://date.nager.at/api/v3/PublicHolidays";

const form = document.querySelector("#location-form");
const googleLocation = document.querySelector("#google-location");
const addressSlot = document.querySelector("#address-slot");
const cityLocation = document.querySelector("#city-location");
const cityInput = document.querySelector("#city");
const cityOptions = document.querySelector("#city-options");
const cityButton = document.querySelector("#city-button");
const locationMessage = document.querySelector("#location-message");
const locateButton = document.querySelector("#locate");
const exampleButton = document.querySelector("#example");
const locationLine = document.querySelector("#location-line");
const locationStatus = document.querySelector("#location-status");
const nowLine = document.querySelector("#now-line");
const unitInputs = document.querySelectorAll("input[name=unit]");
const exploreStatus = document.querySelector("#explore-status");
const agesSelect = document.querySelector("#ages");
const allNote = document.querySelector(".all-note");
const interestMessage = document.querySelector("#interest-message");
const findButton = document.querySelector("#find");
const exploreTabs = document.querySelector("#explore-tabs");
const exploreResults = document.querySelector("#explore-results");
const exploreNotes = document.querySelector("#explore-notes");
const placeListBox = document.querySelector("#place-list-box");
const placeList = document.querySelector("#place-list");
const placeMapBox = document.querySelector("#place-map-box");
const exploreMap = document.querySelector("#explore-map");
const mapPeek = document.querySelector("#map-peek");
const placeDialog = document.querySelector("#place-dialog");
const placeBody = document.querySelector("#place-body");
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

// One sentence per weather condition from recommend.js (PRD.md 7.4).
const WARNINGS = {
  storm: () => "Thunderstorms are forecast. Stay indoors while there is thunder or lightning.",
  heavyRain: () => "Heavy rain is forecast.",
  freezingRain: () => "Freezing rain is forecast, so paths may be icy.",
  heavySnow: () => "Heavy snow is forecast.",
  extremeHeat: (d) => `It may feel like ${temp(d.feelsMax)} at the hottest part of the day. That's too hot for outdoor play.`,
  extremeCold: (d) => `It may feel like ${temp(d.feelsMax)} at the warmest part of the day. That's too cold for outdoor play.`,
  dangerousWind: (d) => `Gusts may reach ${wind(d.gusts)}. That's too windy to play outside, especially near trees.`,
  rain: (d) => `Rain is possible${d.rainChance == null ? "" : ` (${d.rainChance}%)`}. Any outdoor idea today works in rain gear; skip it if the rain gets heavy.`,
  snow: () => "Light snow is forecast. Dress warmly and keep outdoor time short.",
  cold: (d) => `It may feel like ${temp(d.feelsMax)} at the warmest part of the day. Keep outdoor time short and dress warmly.`,
  hot: (d) => `It may feel like ${temp(d.feelsMax)}. Play outside early or late, in the shade, with water and sun protection.`,
  wind: (d) => `Gusts may reach ${wind(d.gusts)}. Stay clear of trees and loose branches.`,
  fog: () => "Fog is forecast. Stay close together near roads.",
};

// localStorage can be missing or blocked; the page then works without saving.
let storage;
try {
  storage = window.localStorage;
} catch {
  storage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
}

// config.js is gitignored and may be missing (PRD.md 9.2).
const config = window.LITTLE_DAYS_CONFIG || {};
const ACTIVITY_IDS = ACTIVITIES.map((a) => a.id);
const settings = loadSettings(storage); // PRD.md 7.18
let plan = loadPlan(storage, isoToday(), ACTIVITY_IDS);
// Saved Google place IDs and the adult's own data only (PRD.md 7.17).
let savedPlaces = loadPlaces(storage);
// "loading", "ready", "missing" (no key) or "failed" (refused or didn't load)
let mapsState = config.googleMapsKey ? "loading" : "missing";
// The chosen location: { kind, label, latitude, longitude, countryCode, placeId or name }.
// kind is "place" (picked address), "example", "city" (fallback) or "device".
let place = null;
// The weather for that location: { location, now, hours, days, holidayProblem }
let current = null;
let selectedDay = 0;
// Counts weather requests, so an answer for an older location is ignored.
let weatherRequest = 0;
// The text of the last address picked from Google's suggestions.
let pickedLabel = "";
// The button that opened the details dialog, to return focus to it.
let dialogOpener = null;
// Fallback cities offered while typing, by label: { "Portland, Maine, United States": place }
let suggestions = {};
let suggestTimer = null;

// --- Open-Meteo and Nager.Date ---

// Returns the first matching city, or null if the geocoder found nothing.
async function findCity(name) {
  const url = `${GEOCODE_URL}?name=${encodeURIComponent(name)}&count=1`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geocoding failed with status ${response.status}`);
  }
  const data = await response.json();
  // "Not found" is a 200 with no results field, not an error status.
  if (!data.results) {
    return null;
  }
  return data.results[0];
}

// Fills the city list with up to five matching places.
async function suggestCities(text) {
  try {
    const response = await fetch(`${GEOCODE_URL}?name=${encodeURIComponent(text)}&count=5`);
    if (!response.ok) {
      throw new Error(`City suggestions failed with status ${response.status}`);
    }
    const data = await response.json();
    // The adult kept typing, so this answer is out of date.
    if (cityInput.value.trim() !== text) return;
    suggestions = {};
    for (const city of data.results || []) suggestions[cityName(city)] = city;
    cityOptions.innerHTML = Object.keys(suggestions).map((name) => `<option value="${escapeHtml(name)}">`).join("");
  } catch (error) {
    // Suggestions are optional: Show weather still works and shows its own error.
    console.error(error);
  }
}

function cityName(city) {
  return [city.name, city.admin1, city.country].filter(Boolean).join(", ");
}

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
// "no-country" (device location), "unsupported" (Nager.Date has no data for the
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

// --- Location ---

// Every way of choosing a location ends here: show it, then load its weather.
function chooseLocation(location) {
  place = location;
  clearInvalid();
  locationStatus.textContent = "";
  const example = location.kind === "example" ? " · Example address" : "";
  locationLine.textContent = `📍 ${location.label}${example}`;
  locationLine.hidden = false;
  resetExplore();
  return loadWeather(location);
}

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
      days: buildDays(location, data.daily, holidays.holidays),
      holidayProblem: holidays.problem,
    };
    selectedDay = 0;
    // Only a picked address or a searched city is saved, never a device position
    // or the example (PRD.md 7.18).
    if (location.kind === "place" || location.kind === "city") {
      settings.location = location;
      saveSettings(storage, settings);
    }
    showStatus(weatherStatus, "", "");
    render();
  } catch (error) {
    if (request !== weatherRequest) return;
    console.error(error);
    showWeatherError(() => loadWeather(location));
  }
}

// The weather-only fallback: Open-Meteo geocoding, then the weather.
async function searchCity(city) {
  cityButton.disabled = true;
  cityButton.textContent = "Searching…";
  weatherRequest++;
  showWeatherLoading(city);
  try {
    // A picked suggestion is used as is; anything typed is looked up.
    const found = suggestions[city] || await findCity(city);
    if (!found) {
      showNotFound(city);
      return;
    }
    await chooseLocation({
      kind: "city",
      name: city,
      label: cityName(found),
      latitude: found.latitude,
      longitude: found.longitude,
      countryCode: found.country_code,
    });
  } catch (error) {
    console.error(error);
    showWeatherError(() => searchCity(city));
  } finally {
    cityButton.disabled = false;
    cityButton.textContent = "Show weather";
  }
}

// Asks for the position only now, once (PRD.md 7.1). It's never watched or saved.
function locate() {
  if (!navigator.geolocation) {
    showLocationProblem(2);
    return;
  }
  locateButton.disabled = true;
  locateButton.textContent = "Finding you…";
  navigator.geolocation.getCurrentPosition(
    (position) => {
      resetLocateButton();
      chooseLocation({
        kind: "device",
        label: "Your current location",
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        countryCode: null,
      });
    },
    (error) => {
      resetLocateButton();
      console.error(error);
      showLocationProblem(error.code);
    },
    { timeout: 10000, maximumAge: 300000 },
  );
}

function resetLocateButton() {
  locateButton.disabled = false;
  locateButton.innerHTML = `<span aria-hidden="true">📍</span> Use my location`;
}

// A saved location comes back on a return visit: weather only, never a place search.
async function restoreLocation(saved) {
  if (saved.kind === "city") {
    cityInput.value = saved.name;
    await searchCity(saved.name);
    return;
  }
  await googleStarted;
  try {
    if (mapsState !== "ready") throw new Error("Google Maps isn't available to load the saved address");
    await chooseLocation(await placeLocation(saved.placeId));
  } catch (error) {
    console.error(error);
    showStatus(locationStatus, "", "We couldn't load your saved address. Enter it again.");
  }
}

// --- Google Maps ---

async function startGoogle() {
  googleLocation.hidden = false;
  try {
    await loadGoogleMaps(config.googleMapsKey, () => useFallback(new Error("Google refused the Maps key (gm_authFailure)")));
    await setupAutocomplete(addressSlot, "address-label", (location) => {
      pickedLabel = location.label;
      chooseLocation(location);
    }, useFallback);
    // Google may have refused the key while the address field was being set up.
    if (mapsState === "failed") return;
    mapsState = "ready";
    exampleButton.hidden = false;
    showChoices();
    renderExploreStatus();
  } catch (error) {
    useFallback(error);
  }
}

// Without Google, the city field gives weather only: no places, no walking routes.
function useFallback(error) {
  if (error) console.error(error);
  mapsState = config.googleMapsKey ? "failed" : "missing";
  googleLocation.hidden = true;
  exampleButton.hidden = true;
  cityLocation.hidden = false;
  clearInvalid();
  resetExplore();
  renderFirstVisit();
}

async function useExample() {
  exampleButton.disabled = true;
  try {
    const location = await findExampleAddress();
    if (!location) throw new Error("Google found nothing for the example address");
    const field = document.querySelector("#address");
    if (field) field.value = EXAMPLE_ADDRESS;
    pickedLabel = EXAMPLE_ADDRESS;
    await chooseLocation(location);
  } catch (error) {
    console.error(error);
    showStatus(locationStatus, "", "We couldn't load the example address right now.");
  } finally {
    exampleButton.disabled = false;
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
      season: seasonFor(date, location.latitude),
      celebrations,
      holidays: [...new Set([...publicHolidays, ...celebrations])],
    };
  });
}

// --- Events ---

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (cityLocation.hidden) {
    // Google's field: only a picked suggestion counts as a location (PRD.md 8.4).
    const field = document.querySelector("#address");
    if (field && field.value && field.value !== pickedLabel) {
      showInvalid(field, "Pick an address from the suggestions.");
    }
    return;
  }
  const city = cityInput.value.trim();
  if (city.length === 0) {
    showInvalid(cityInput, "Type a city name first.");
  } else if (city.length < 2) {
    showInvalid(cityInput, "Type at least 2 letters.");
  } else {
    searchCity(city);
  }
});

cityInput.addEventListener("input", () => {
  clearInvalid();
  clearTimeout(suggestTimer);
  const text = cityInput.value.trim();
  if (text.length < 2 || suggestions[text]) return;
  // Wait for a pause in typing so every keystroke doesn't send a request.
  suggestTimer = setTimeout(() => suggestCities(text), 300);
});

addressSlot.addEventListener("input", clearInvalid);
findButton.addEventListener("click", findAdventures);

document.addEventListener("change", (event) => {
  const { name, value } = event.target;
  if (name === "interest" || name === "explore-interest") chooseInterest(value);
  if (name === "mode") {
    settings.mode = value;
    saveSettings(storage, settings);
    showChoices();
    renderPlaces();
  }
  if (name === "minutes") {
    settings.minutes = Number(value);
    saveSettings(storage, settings);
    if (place) resetExplore();
    else showChoices();
  }
  if (name === "setting-filter") renderPlaces();
  if (name === "explore-view") {
    applyView();
    // Moving between the list and the map keeps the keyboard in the same place.
    if (value === "map") document.querySelector("#map-heading").focus();
    else placeList.querySelector("button")?.focus();
  }
});

agesSelect.addEventListener("change", () => {
  settings.ages = agesSelect.value;
  saveSettings(storage, settings);
  renderPlaces();
});

function clearFilters() {
  document.querySelector("input[name=setting-filter][value=all]").checked = true;
  renderPlaces();
}
document.querySelector("#clear-filters").addEventListener("click", clearFilters);

// Hovering or focusing a card highlights its marker.
for (const type of ["mouseover", "focusin"]) {
  placeList.addEventListener(type, (event) => {
    const card = event.target.closest(".place-card");
    if (card && explore && explore.markers) highlightMarker(explore.markers, card.dataset.place);
  });
}

window.matchMedia("(max-width: 719px)").addEventListener("change", applyView);

placeDialog.addEventListener("close", () => {
  if (placeOpener && placeOpener.isConnected) placeOpener.focus();
  placeOpener = null;
});
locateButton.addEventListener("click", locate);
exampleButton.addEventListener("click", useExample);

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
  const walk = event.target.closest("[data-walk]");
  if (walk) checkWalkingTimes(explore.shortlist.filter((p) => p.id === walk.dataset.walk));
  if (event.target.closest("[data-place-close]")) placeDialog.close();
  if (event.target.closest("[data-clear-filters]")) clearFilters();
  const perspective = event.target.closest("[data-perspective]");
  if (perspective) showPerspective(perspective.dataset.placeId, Number(perspective.dataset.perspective));
  if (add) addActivity(add.dataset.add, add.dataset.date);
  if (remove) removeActivity(remove.dataset.remove, remove.dataset.date);
});

// A photo that fails to load becomes a plain tile instead of a broken image.
document.addEventListener("error", (event) => {
  if (event.target.tagName !== "IMG") return;
  event.target.closest(".art").classList.add("art-missing");
  event.target.remove();
}, true);

// --- Explore (PRD.md 7.10–7.16) ---

// What's loaded for the current starting point and walking time, kept in page memory
// only (PRD.md 7.10): { key, origin, loaded: { category: [place] }, routes: { placeId: route },
// detailRoutes: { placeId: route or null }, shortlist, partial, routesFailed, map, markers }
let explore = null;
let selectedPlace = null;
// The place shown in the details dialog, and the button that opened it.
let placeOpener = null;

function interestChipsHtml(name) {
  const options = [...CATEGORY_KEYS.map((key) => [key, CATEGORIES[key]]), ["all", { label: "All", emoji: "✨" }]];
  return options.map(([key, { label, emoji }]) => `
    <label class="chip">
      <input type="radio" name="${name}" value="${key}">
      <span><span aria-hidden="true">${emoji}</span><span>${label}</span><span class="chip-loaded" hidden>✓<span class="visually-hidden"> (loaded)</span></span></span>
    </label>`).join("");
}

// The chosen interest, ages, mode and walking time, shown on both sets of chips.
function showChoices() {
  for (const input of document.querySelectorAll("input[name=interest], input[name=explore-interest]")) {
    input.checked = input.value === settings.interest;
  }
  for (const input of document.querySelectorAll("input[name=mode]")) input.checked = input.value === settings.mode;
  for (const input of document.querySelectorAll("input[name=minutes]")) input.checked = Number(input.value) === settings.minutes;
  agesSelect.value = settings.ages;
  allNote.hidden = settings.interest !== "all";
  for (const note of document.querySelectorAll(".classroom-note")) note.hidden = settings.mode !== "classroom";
  for (const label of document.querySelectorAll(".chip")) {
    const key = label.querySelector("input").value;
    const loaded = explore && (key === "all" ? CATEGORY_KEYS.every((k) => explore.loaded[k]) : explore.loaded[key]);
    label.querySelector(".chip-loaded").hidden = !loaded;
  }
  findButton.disabled = mapsState !== "ready";
}

function placeLabel() {
  return place.kind === "device" ? "your location" : place.label;
}

function exploreKey() {
  return `${place.latitude},${place.longitude},${settings.minutes}`;
}

// A new starting point or walking time starts over (PRD.md 7.10).
function resetExplore() {
  explore = null;
  selectedPlace = null;
  exploreResults.hidden = true;
  exploreTabs.hidden = true;
  placeList.innerHTML = "";
  mapPeek.hidden = true;
  showChoices();
  renderExploreStatus();
}

// The only thing that starts a Places search (PRD.md 7.1).
async function findAdventures() {
  clearInvalid();
  if (!place) {
    const field = cityLocation.hidden ? document.querySelector("#address") : cityInput;
    showInvalid(field || locateButton, "Enter an address or use your location first.");
    return;
  }
  if (!settings.interest) {
    interestMessage.textContent = "⚠︎ Choose what you'd like to explore.";
    interestMessage.hidden = false;
    document.querySelector("input[name=interest]").focus();
    return;
  }
  if (mapsState !== "ready") return;
  if (!explore || explore.key !== exploreKey()) {
    explore = {
      key: exploreKey(),
      origin: { lat: place.latitude, lng: place.longitude },
      loaded: {},
      routes: {},
      detailRoutes: {},
      shortlist: [],
    };
  }
  const run = explore;
  const keys = categoriesToSearch(settings.interest, run.loaded);
  if (keys.length) {
    findButton.disabled = true;
    findButton.textContent = "Searching…";
    exploreResults.hidden = true;
    showStatus(exploreStatus, "loading", `Finding little adventures near ${placeLabel()}…`);
    const results = await Promise.allSettled(keys.map((key) =>
      searchNearbyPlaces(run.origin, searchRadius(settings.minutes), CATEGORIES[key].types)));
    findButton.textContent = "Find Little Adventures";
    findButton.disabled = false;
    if (run !== explore) return; // the location or walking time changed meanwhile
    results.forEach((result, i) => {
      if (result.status === "fulfilled") run.loaded[keys[i]] = result.value;
      else console.error(result.reason);
    });
    const failed = results.filter((result) => result.status === "rejected").length;
    if (failed === results.length) {
      showStatus(exploreStatus, "error", "We couldn't load nearby places right now. Check your connection and try again.", findAdventures);
      return;
    }
    run.partial = failed > 0;
  }
  await showResults(true);
  document.querySelector("#explore").scrollIntoView({ block: "start", behavior: reducedMotion() ? "auto" : "smooth" });
}

// checkRoutes: false when only switching to an interest already loaded, so that
// switching never sends a request by itself.
async function showResults(checkRoutes) {
  explore.shortlist = shortlist(explore.loaded, settings.interest, explore.origin);
  selectedPlace = null;
  showChoices();
  exploreTabs.hidden = false;
  if (!explore.shortlist.length) {
    exploreResults.hidden = true;
    const interest = settings.interest === "all" ? "" : `${CATEGORIES[settings.interest].label.toLowerCase()} `;
    showStatus(exploreStatus, "", `We didn't find ${interest}places within about a ${settings.minutes}-minute walk. Try a longer walk or another interest.`);
    return;
  }
  showStatus(exploreStatus, "", "");
  exploreResults.hidden = false;
  exploreTabs.hidden = false;
  await renderPlaces();
  if (checkRoutes) await checkWalkingTimes(routeTargets(explore.shortlist, explore.routes));
}

// One route-matrix request for up to 5 places (PRD.md 7.12).
async function checkWalkingTimes(targets) {
  if (!targets.length) return;
  const run = explore;
  for (const target of targets) run.routes[target.id] = { status: "pending" };
  renderPlaces();
  try {
    Object.assign(run.routes, await walkingTimes(run.origin, targets));
  } catch (error) {
    console.error(error);
    for (const target of targets) run.routes[target.id] = { status: "failed" };
    run.routesFailed = true;
  }
  if (run !== explore) return;
  await renderPlaces();
  announce("Walking times are ready.");
}

function settingFilter() {
  return document.querySelector("input[name=setting-filter]:checked").value;
}

// The list and the map markers, in the same order and numbers.
async function renderPlaces() {
  if (!explore || exploreResults.hidden) return;
  const day = current ? current.days[selectedDay] : null;
  const filtered = filterBySetting(explore.shortlist, settingFilter());
  const { within, unknown, over } = byWalkingTime(filtered, explore.routes, settings.minutes);
  const weather = day && day.weather;
  const shown = [...orderForWeather(within, weather, settingFor), ...orderForWeather(unknown, weather, settingFor)];
  shown.forEach((p, i) => { p.number = i + 1; });

  const notes = [`${shown.length} ${shown.length === 1 ? "place" : "places"} near ${escapeHtml(placeLabel())} · walking times from Google`];
  if (over) notes.push(`${over} ${over === 1 ? "place is" : "places are"} more than a ${settings.minutes}-minute walk.`);
  if (explore.partial) notes.push("Some kinds of places couldn't be loaded right now.");
  if (explore.routesFailed) notes.push("Walking times couldn't be checked right now, so the walking-time filter is off for those places.");
  exploreNotes.innerHTML = `
    ${notes.map((note) => `<p>${note}</p>`).join("")}
    <p>These notes use the forecast for the whole area and fixed temperature levels. They're a starting point, not a safety check. Use your own judgement and your setting's rules.</p>
    ${settings.mode === "classroom" ? `<p class="classroom-line">${CLASSROOM_WALKING}</p>` : ""}`;

  if (!shown.length) {
    placeList.innerHTML = `<div class="status"><p>No places match these filters.</p>
      <button type="button" class="button-secondary" data-clear-filters>Clear filters</button></div>`;
  } else {
    placeList.innerHTML = shown.map((p, i) => {
      const heading = i === within.length && within.length && unknown.length
        ? `<h3 class="list-divider">No Google walking time yet</h3>` : "";
      return heading + placeCardHtml(p, day);
    }).join("");
  }

  // The list is complete without the map, so a map problem never hides it.
  try {
    if (!explore.map) explore.map = await createMap(exploreMap, explore.origin, config.googleMapId || "DEMO_MAP_ID");
    explore.markers = await showMarkers(explore.map, explore.origin, shown, selectPlace, explore.markers);
  } catch (error) {
    console.error(error);
  }
}

const CLASSROOM_WALKING = "Google walking estimates may not reflect the time needed when accompanying young children. Check crossings and the route before visiting.";

function walkHtml(placeItem) {
  const route = explore.routes[placeItem.id];
  if (!route) {
    return `Walking time not checked yet
      <button type="button" class="link-button" data-walk="${placeItem.id}">Check walking time</button>`;
  }
  if (route.status === "pending") return `<span class="walk-pending">Checking walking time…</span>`;
  if (route.status !== "ok") return "Walking time unavailable";
  return `<span aria-hidden="true">🚶</span> ${walkingMinutes(route.durationMillis)} min walk · ${formatDistance(route.distanceMeters, settings.unit)}
    <span class="walk-source">Google walking estimate</span>`;
}

function accessHtml(placeItem) {
  const access = accessFor(placeItem);
  const contact = access.contact || settings.mode === "classroom";
  return `${access.estimate ? `${access.estimate} (Little Days estimate). ` : ""}Access not verified.` +
    `${access.note ? ` ${access.note}` : ""}${contact ? ` <strong>Contact before a classroom visit.</strong>` : ""}`;
}

// Weather notes for a place on the selected day (PRD.md 7.15). Never says "safe".
function placeWeatherLines(placeItem, day) {
  if (!day) return ["Weather unavailable. Check the forecast before you go."];
  const outdoors = settingFor(placeItem) === "outdoors";
  const { hazards, cautions, notes } = day.weather;
  const warnings = [...hazards, ...cautions, ...notes].map((key) => WARNINGS[key](day));
  const lines = [];
  if (warnings.length) {
    if (!outdoors) lines.push(`For the walk there: ${warnings[0]}`, ...warnings.slice(1));
    else lines.push(...warnings);
    if (hazards.length && outdoors) lines.push("Outdoor places are better left for another day.");
  } else if (outdoors) {
    lines.push("The forecast looks good for time outdoors.");
  }
  const soon = selectedDay === 0 && outdoors ? rainSoon(current.hours) : null;
  if (soon) lines.push(`Rain is likely in the next few hours (${soon}%).`);
  return lines;
}

function placeCardHtml(placeItem, day) {
  const category = CATEGORIES[placeItem.category];
  const guide = guideFor(placeType(placeItem), placeItem.category);
  const saved = savedPlaces[placeItem.id];
  const name = escapeHtml(placeItem.name || "Unnamed place");
  return `
    <article class="place-card${placeItem.id === selectedPlace ? " is-selected" : ""}" data-place="${placeItem.id}">
      <div class="place-google">
        <span class="place-number" aria-hidden="true">${placeItem.number}</span>
        <div>
          <h3><button type="button" class="place-title" data-place-open="${placeItem.id}">
            <span class="visually-hidden">${placeItem.number}. </span>${name}</button></h3>
          <p class="place-address">${escapeHtml(placeItem.address || "")}</p>
          <p class="place-walk">${walkHtml(placeItem)}</p>
        </div>
      </div>
      <div class="place-notes">
        <p class="notes-label">Little Days notes</p>
        <p class="place-tags"><span class="tag tag-soft"><span aria-hidden="true">${category.emoji}</span> ${category.label}</span>
          <span class="tag tag-soft">${settingFor(placeItem) === "outdoors" ? "Outdoors" : "Indoors"} (estimate)</span></p>
        <p>${accessHtml(placeItem)}</p>
        <ul class="place-weather">${placeWeatherLines(placeItem, day).map((line) => `<li>${line}</li>`).join("")}</ul>
        <p>${ageNotes(settings.ages).join(" ")}</p>
        <p class="place-idea"><strong>Notice:</strong> ${escapeHtml(guide.sets[0].notice[0])}</p>
      </div>
      <div class="place-actions">
        ${saved ? `<span class="tag tag-saved">Want to explore ✓</span>`
          : `<button type="button" class="button-secondary" data-save="${placeItem.id}" aria-label="Save ${name}">Save</button>`}
        <button type="button" class="button-secondary" data-place-open="${placeItem.id}" aria-label="Details for ${name}">Details</button>
      </div>
    </article>`;
}

// A marker or card was chosen: highlight both, and show the preview on the map.
function selectPlace(id) {
  selectedPlace = id;
  const placeItem = explore.shortlist.find((p) => p.id === id);
  if (!placeItem) return;
  highlightMarker(explore.markers || {}, id);
  for (const card of placeList.querySelectorAll(".place-card")) {
    card.classList.toggle("is-selected", card.dataset.place === id);
  }
  mapPeek.innerHTML = `
    <p class="peek-title"><span class="place-number" aria-hidden="true">${placeItem.number}</span> ${escapeHtml(placeItem.name || "")}</p>
    <p class="peek-walk">${walkHtml(placeItem)}</p>
    <button type="button" data-place-open="${id}">Details</button>`;
  mapPeek.hidden = false;
  if (!isPhone()) placeList.querySelector(`[data-place="${id}"]`)?.scrollIntoView({ block: "nearest", behavior: reducedMotion() ? "auto" : "smooth" });
}

function savePlaceId(id) {
  savedPlaces = savePlace(savedPlaces, id);
  storePlaces(storage, savedPlaces);
  const placeItem = explore.shortlist.find((p) => p.id === id);
  announce(`Saved ${placeItem ? placeItem.name : "the place"} to Want to explore.`);
  renderPlaces();
  // Only the buttons change, so the detail map stays.
  const actions = placeBody.querySelector(".place-actions");
  if (placeDialog.open && actions) actions.innerHTML = placeActionsHtml(id);
}

// On phones only one of the list and the map shows (DESIGN.md 5).
function applyView() {
  const view = document.querySelector("input[name=explore-view]:checked").value;
  placeListBox.hidden = isPhone() && view === "map";
  placeMapBox.hidden = isPhone() && view === "list";
}

function isPhone() {
  return window.matchMedia("(max-width: 719px)").matches;
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// --- Place details (PRD.md 7.16) ---

async function openPlace(id, opener) {
  placeOpener = opener;
  renderPlaceDetails(id, 0);
  placeDialog.showModal();
  document.querySelector("#place-title").focus();
  const placeItem = explore.shortlist.find((p) => p.id === id);
  const run = explore;
  if (!(id in run.detailRoutes)) {
    try {
      run.detailRoutes[id] = await walkingRoute(run.origin, placeItem.location);
    } catch (error) {
      console.error(error);
      run.detailRoutes[id] = null;
    }
    // The route also gives this place's walking time, if the matrix hasn't.
    const route = run.detailRoutes[id];
    if (route && (!run.routes[id] || run.routes[id].status !== "ok")) {
      run.routes[id] = { status: "ok", durationMillis: route.durationMillis, distanceMeters: route.distanceMeters };
    }
  }
  if (run !== explore || !placeDialog.open) return;
  renderRoute(id);
  try {
    await showRouteMap(document.querySelector("#place-map"), run.origin, placeItem, run.detailRoutes[id], config.googleMapId || "DEMO_MAP_ID");
  } catch (error) {
    console.error(error);
  }
}

function renderPlaceDetails(id, perspective) {
  const placeItem = explore.shortlist.find((p) => p.id === id);
  const day = current ? current.days[selectedDay] : null;
  const guide = guideFor(placeType(placeItem), placeItem.category);
  const category = CATEGORIES[placeItem.category];
  const name = escapeHtml(placeItem.name || "Unnamed place");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeItem.name || "")}&query_place_id=${encodeURIComponent(id)}`;
  placeBody.innerHTML = `
    <header class="place-head">
      <div>
        <h2 id="place-title" tabindex="-1">${name}</h2>
        <p class="place-address">${escapeHtml(placeItem.address || "")}</p>
        <p><span class="tag tag-soft"><span aria-hidden="true">${category.emoji}</span> ${category.label}</span></p>
      </div>
      <button type="button" class="button-secondary" data-place-close>Close</button>
    </header>

    <section class="place-section" aria-labelledby="route-heading">
      <h3 id="route-heading">Walking route</h3>
      <div id="place-map" class="map map-detail"></div>
      <div id="place-route"><p class="walk-pending">Checking the walking route…</p></div>
      <p class="route-reminder">A Google walking route isn't a check that the way suits young children. Before you go, look for busy road crossings, water, construction, closed or restricted areas, and the weather, and plan enough adults to supervise.
        ${settings.mode === "classroom" ? `<br>${CLASSROOM_WALKING} Walk the route yourself before taking a group.` : ""}</p>
    </section>

    <section class="place-section" aria-labelledby="weather-detail-heading">
      <h3 id="weather-detail-heading">Weather${day ? ` on ${formatDay(day.date)}` : ""}</h3>
      ${day ? `<p>${(WEATHER[day.code] || ["🌡️", "Unknown"]).map((part, i) => i ? part : `<span aria-hidden="true">${part}</span>`).join(" ")} ·
        ${temp(day.high)} / ${temp(day.low)} · ${day.rainChance == null ? "Rain –" : `Rain ${day.rainChance}%`}</p>` : ""}
      <ul class="place-weather">${placeWeatherLines(placeItem, day).map((line) => `<li>${line}</li>`).join("")}</ul>
    </section>

    <section class="place-section" aria-labelledby="before-heading">
      <h3 id="before-heading">Before you set off</h3>
      <p>${accessHtml(placeItem)}</p>
      <p>${ageNotes(settings.ages).join(" ")}</p>
      <p><a href="${mapsUrl}" target="_blank" rel="noopener">Check hours and details on Google Maps<span aria-hidden="true"> ↗</span></a></p>
    </section>

    <section class="place-section ideas-panel" aria-labelledby="ideas-detail-heading">
      <p class="notes-label">Little Days ideas</p>
      <h3 id="ideas-detail-heading">Why explore this place?</h3>
      <p>${escapeHtml(guide.why)}</p>
      <div class="perspectives" role="group" aria-label="Visit">
        ${guide.sets.map((set, i) => `<button type="button" class="perspective" data-perspective="${i}" data-place-id="${id}"
          aria-pressed="${i === perspective}">${["First", "Second", "Third"][i]} visit</button>`).join("")}
      </div>
      <div id="guide-set">${guideSetHtml(guide.sets[perspective])}</div>
      ${atHomeHtml(guide, day)}
    </section>

    <div class="place-actions">${placeActionsHtml(id)}</div>`;
  if (explore.detailRoutes[id] !== undefined) renderRoute(id);
}

function placeActionsHtml(id) {
  return `${savedPlaces[id] ? `<span class="tag tag-saved">Want to explore ✓</span>` : `<button type="button" data-save="${id}">Save</button>`}
    <button type="button" class="button-secondary" data-place-close>Close</button>`;
}

// Switching perspective changes only the guide, so the detail map stays.
function showPerspective(id, perspective) {
  const placeItem = explore.shortlist.find((p) => p.id === id);
  const guide = guideFor(placeType(placeItem), placeItem.category);
  placeBody.querySelector("#guide-set").innerHTML = guideSetHtml(guide.sets[perspective]);
  for (const button of placeBody.querySelectorAll(".perspective")) {
    button.setAttribute("aria-pressed", String(Number(button.dataset.perspective) === perspective));
  }
}

function guideSetHtml(set) {
  const list = (items) => `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  return `
    <p class="perspective-focus">Focus: ${escapeHtml(set.focus)}</p>
    <h4>What children might notice</h4>${list(set.notice)}
    <h4>Before you go</h4>${list(set.before)}
    <h4>During the visit</h4>${list(set.during)}
    <h4>After the visit</h4>${list(set.after)}
    <h4>Practical life</h4><p>${escapeHtml(set.practical)}</p>`;
}

// RootMap activities for afterwards, for the chosen ages and the day's weather (PRD.md 7.5).
function atHomeHtml(guide, day) {
  const range = { "under-2": [0, 1], "2-3": [2, 3], "4-6": [4, 6], "2-6": [2, 6] }[settings.ages];
  const ideas = guide.activities.map(activityById).filter((activity) => activity &&
    activity.littleDays.minAge <= range[1] && activity.littleDays.maxAge >= range[0] &&
    (!day || canDo(activity, day.weather, day.season)));
  if (!ideas.length) {
    return settings.ages === "under-2" ? `<h4>At home afterwards</h4><p>Little Days doesn't have at-home ideas for children under 2 yet.</p>` : "";
  }
  const date = day ? day.date : isoToday();
  return `<h4>At home afterwards</h4>
    <ul>${ideas.slice(0, 2).map((activity) => `<li><button type="button" class="link-button" data-open="${activity.id}" data-date="${date}">
      ${escapeHtml(activity.rootmap.title)}</button> <span class="source-note">from RootMap</span></li>`).join("")}</ul>`;
}

function renderRoute(id) {
  const box = document.querySelector("#place-route");
  if (!box) return;
  const route = explore.detailRoutes[id];
  if (!route) {
    box.innerHTML = `<p>Walking route unavailable.</p>`;
    return;
  }
  box.innerHTML = `
    <p class="place-walk"><span aria-hidden="true">🚶</span> ${walkingMinutes(route.durationMillis)} min walk · ${formatDistance(route.distanceMeters, settings.unit)}
      <span class="walk-source">Google walking estimate</span></p>
    ${route.warnings.length ? `<p class="route-warnings">From Google: ${route.warnings.map(escapeHtml).join(" ")}</p>` : ""}`;
}

// Choosing an interest never searches by itself (PRD.md 7.1): an interest already
// loaded for this starting point shows again from memory; otherwise Find is needed.
function chooseInterest(value) {
  settings.interest = value;
  saveSettings(storage, settings);
  interestMessage.hidden = true;
  showChoices();
  if (!explore || explore.key !== exploreKey()) {
    renderExploreStatus();
  } else if (!categoriesToSearch(value, explore.loaded).length) {
    showResults(false);
  } else {
    exploreResults.hidden = true;
    const label = value === "all" ? "" : `${CATEGORIES[value].label.toLowerCase()} `;
    showStatus(exploreStatus, "", `Press Find Little Adventures to see ${label}places near ${placeLabel()}.`, findAdventures, "Find Little Adventures");
  }
}

// --- My week ---

function addActivity(id, date) {
  plan = addToPlan(plan, date, id);
  savePlan(storage, plan);
  if (current) render();
  else renderPlan();
  announce(`Added ${activityById(id).rootmap.title} to ${formatDay(date)}.`);
  // The card was re-drawn, so put focus back on the same activity's title.
  document.querySelector(`#idea-list [data-open="${id}"][data-date="${date}"]`)?.focus();
}

function removeActivity(id, date) {
  plan = removeFromPlan(plan, date, id);
  savePlan(storage, plan);
  if (current) render();
  else renderPlan();
  announce(`Removed ${activityById(id).rootmap.title} from ${formatDay(date)}.`);
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
  return [...dates].filter((d) => d >= isoToday()).sort();
}

function renderPlan() {
  const dates = planDates();
  if (!dates.length) {
    planBox.innerHTML = `<p class="status">Your week is empty. Pick activities from the days above to add them here.</p>`;
    return;
  }
  planBox.innerHTML = `<ul class="plan">${dates.map((date) => {
    const ids = plan[date] || [];
    const items = ids.map((id) => {
      const title = escapeHtml(activityById(id).rootmap.title);
      return `
        <li>
          <button type="button" class="link-button" data-open="${id}" data-date="${date}">${title}</button>
          <button type="button" class="link-button remove-button" data-remove="${id}" data-date="${date}"
            aria-label="Remove ${title} from ${formatDay(date)}">Remove</button>
        </li>`;
    }).join("");
    return `
      <li>
        <h3 class="plan-day">${formatDay(date)}</h3>
        ${ids.length ? `<ul class="plan-items">${items}</ul>` : `<p class="plan-empty">Nothing planned</p>`}
      </li>`;
  }).join("")}</ul>`;
}

// --- Activity details ---

function openDetails(id, date, opener) {
  const details = activityDetails(activityById(id));
  dialogOpener = { id, date, element: opener };
  dialogBody.innerHTML = `
    ${photoHtml(activityById(id), "(max-width: 719px) 100vw, 520px")}
    <h2 id="details-title" tabindex="-1">${escapeHtml(details.title)}</h2>
    <p class="meta">Ages ${escapeHtml(details.ages.replace(" years", ""))} · ${details.duration}</p>
    <p>${escapeHtml(details.description)}</p>
    <div class="details-box">
      <h3>What you'll need</h3>
      ${details.materials.length
        ? `<ul>${details.materials.map((m) => `<li>${escapeHtml(m)}</li>`).join("")}</ul>`
        : `<p>Nothing to prepare.</p>`}
    </div>
    <h3>Steps</h3>
    <ol>${details.steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>
    <h3>What your child practices</h3>
    <ul>${details.practices.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>
    ${details.safety ? `<h3>Safety</h3><p>${escapeHtml(details.safety)}</p>` : ""}
    <p class="source-note">From the RootMap activity collection.</p>`;
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
  dialogAdd.textContent = added ? "Added ✓" : `Add to ${formatDay(date)}`;
  dialogAdd.classList.toggle("button-added", added);
}

dialogAdd.addEventListener("click", () => {
  const { id, date } = dialogAdd.dataset;
  plan = addToPlan(plan, date, id);
  savePlan(storage, plan);
  if (current) render();
  else renderPlan();
  updateDialogAdd();
  dialogStatus.textContent = `Added to ${formatDay(date)}.`;
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
function showStatus(area, className, text, retry, retryLabel = "Try again") {
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

function renderFirstVisit() {
  if (place || settings.location) return;
  showStatus(locationStatus, "", cityLocation.hidden
    ? "Enter an address or use your location to see the weather and find places to explore nearby."
    : "Enter your city or use your location to see the weather.");
}

function renderExploreStatus() {
  if (mapsState === "loading") {
    showStatus(exploreStatus, "", "");
  } else if (mapsState === "missing") {
    showStatus(exploreStatus, "", "Maps and places aren't set up on this copy of Little Days yet.");
  } else if (mapsState === "failed") {
    showStatus(exploreStatus, "", "Google Maps isn't available right now, so places and walking times can't be shown.");
  } else if (place && settings.interest) {
    showStatus(exploreStatus, "", `Press Find Little Adventures to see places near ${placeLabel()}.`);
  } else {
    showStatus(exploreStatus, "", "Choose a location and what you'd like to explore, then press Find Little Adventures.");
  }
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
  renderPlan();
}

function showWeatherLoading(label) {
  clearWeather();
  weatherSection.hidden = false;
  showStatus(weatherStatus, "loading", `Getting the weather for ${label}…`);
  nowLine.innerHTML = `<p class="now-loading">Getting the weather…</p>`;
  nowLine.hidden = false;
}

function showWeatherError(retry) {
  clearWeather();
  showStatus(weatherStatus, "error", "We couldn't load the weather right now. Check your internet connection and try again.", retry);
  nowLine.innerHTML = `<p class="now-loading">Weather unavailable right now.</p>`;
  nowLine.hidden = false;
}

function showNotFound(city) {
  place = null;
  locationLine.hidden = true;
  clearWeather();
  weatherSection.hidden = true;
  showStatus(locationStatus, "", `We couldn't find "${city}". Check the spelling, or add the state or country, like "Portland, Maine".`);
  cityInput.focus();
}

function showLocationProblem(code) {
  const instead = cityLocation.hidden ? "an address" : "a city";
  showStatus(locationStatus, "", code === 1
    ? `Location access is off, so type ${instead} instead.`
    : `We couldn't find your location. Type ${instead} instead.`);
  (cityLocation.hidden ? document.querySelector("#address") : cityInput)?.focus();
}

function showInvalid(field, text) {
  locationMessage.textContent = `⚠︎ ${text}`;
  locationMessage.hidden = false;
  field.setAttribute("aria-invalid", "true");
  field.setAttribute("aria-describedby", "location-message");
  field.focus();
}

function clearInvalid() {
  locationMessage.hidden = true;
  for (const field of document.querySelectorAll("[aria-describedby=location-message]")) {
    field.removeAttribute("aria-invalid");
    field.removeAttribute("aria-describedby");
  }
}

// --- In use ---

function render() {
  const weekPlan = planWeek(current.days, ACTIVITIES);
  const day = current.days[selectedDay];
  renderNow();
  renderWeek(weekPlan);
  renderDayWeather(day);
  renderIdeas(day, weekPlan[selectedDay]);
  renderPlan();
  renderPlaces();
}

// The compact line in the controls card and the Now / Next hours panel (PRD.md 7.15).
function renderNow() {
  const { now, hours, days } = current;
  const [icon, label] = WEATHER[now.weather_code] || ["🌡️", "Unknown"];
  const rainChance = hours.length && hours[0].rainChance != null ? `${hours[0].rainChance}%` : "–";
  const today = days[0].weather;
  const firstWarning = [...today.hazards, ...today.cautions, ...today.notes][0];
  nowLine.innerHTML = `
    <p><span aria-hidden="true">${icon}</span> ${label} · Now ${temp(now.temperature_2m)} ·
      feels like ${temp(now.apparent_temperature)} · Rain ${rainChance} · Wind ${wind(now.wind_speed_10m)}</p>
    ${firstWarning ? `<p class="now-warning">${WARNINGS[firstWarning](days[0])}</p>` : ""}
    <a href="#weather">More weather</a>`;
  nowLine.hidden = false;

  weatherNow.innerHTML = `
    <div class="now-card">
      <h3>Now</h3>
      <p class="now-temp">${temp(now.temperature_2m)}</p>
      <p><span aria-hidden="true">${icon}</span> ${label}</p>
      <p>Feels like ${temp(now.apparent_temperature)}</p>
      <p>Wind ${wind(now.wind_speed_10m)}, gusts ${wind(now.wind_gusts_10m)}</p>
      <p>Rain ${rainChance} this hour</p>
      ${now.precipitation > 0 ? `<p>${formatRain(now.precipitation, settings.unit)} rain in the last 15 minutes</p>` : ""}
    </div>
    <div class="hours">
      <h3>Next hours</h3>
      <ol class="hour-list">${hours.map((hour) => {
        const [hourIcon, hourLabel] = WEATHER[hour.code] || ["🌡️", "Unknown"];
        return `
          <li>
            <span class="hour-time">${formatHour(hour.time)}</span>
            <span class="hour-icon" aria-hidden="true">${hourIcon}</span>
            <span class="visually-hidden">${hourLabel}</span>
            <span class="hour-temp">${temp(hour.temperature)}</span>
            <span class="hour-rain">${hour.rainChance == null ? "Rain –" : `Rain ${hour.rainChance}%`}</span>
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
    "no-country": "Holidays show when you search an address or city.",
    unsupported: "Nager.Date doesn't list public holidays for this country, so none are shown.",
    failed: "Public holidays couldn't be loaded, so they aren't shown.",
  }[current.holidayProblem] || "";
  holidayNote.hidden = !current.holidayProblem;

  week.innerHTML = days.map((day, i) => {
    const [icon, label] = WEATHER[day.code] || ["🌡️", "Unknown"];
    const featured = weekPlan[i][0];
    const date = toDate(day.date);
    return `
      <li>
        <button class="day" type="button" data-index="${i}" aria-pressed="${i === selectedDay}">
          <span class="day-name">${date.toLocaleDateString("en-US", { weekday: "short" })}</span>
          <span class="day-date">${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          <span class="day-icon" aria-hidden="true">${icon}</span>
          <span class="day-temps">
            <span class="visually-hidden">High</span> ${temp(day.high)}
            <span class="day-low"><span class="visually-hidden">Low</span> ${temp(day.low)}</span>
          </span>
          <span class="day-condition">${label}</span>
          <span class="day-rain">${day.rainChance == null ? "Rain –" : `Rain ${day.rainChance}%`}</span>
          ${day.holidays.map((h) => `<span class="tag tag-holiday">${escapeHtml(h)}</span>`).join("")}
          ${day.weather.hazards.length ? `<span class="tag tag-warning">Indoor day</span>` : ""}
          <span class="day-pick">
            ${featured ? `${photoHtml(featured.activity, "112px")}
              <span class="day-pick-title">${escapeHtml(featured.activity.rootmap.title)}</span>`
              : "No idea yet"}
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
  if (hazards.length) lines.push("Outdoor ideas are left out today.");
  warningsBox.innerHTML = `
    ${lines.length ? `<ul>${lines.map((line) => `<li>${line}</li>`).join("")}</ul>` : ""}
    <p class="warnings-footnote">These ideas use the daily forecast for the whole area. Check the weather before you go out, and come inside if it changes.</p>`;
  warningsBox.classList.toggle("has-warnings", lines.length > 0);

  const wear = whatToWear(day);
  wearBox.innerHTML = `
    <h3><span aria-hidden="true">🧥</span> What to wear</h3>
    ${wear.wear.length ? `<ul>${wear.wear.map((w) => `<li>${w}</li>`).join("")}</ul>` : ""}
    ${wear.bring.length ? `<p class="panel-label">Bring</p><ul>${wear.bring.map((b) => `<li>${b}</li>`).join("")}</ul>` : ""}
    ${wear.notes.map((n) => `<p>${n}</p>`).join("")}
    <p class="panel-footnote">These tips are for comfort. They don't make outdoor play safe in bad weather.</p>`;
  dayWeather.hidden = false;
}

function renderIdeas(day, ideas) {
  const [, label] = WEATHER[day.code] || ["", "Unknown"];
  ideasHeading.textContent = `Ideas for ${toDate(day.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`;
  ideasSubtitle.textContent = [`${temp(day.high)} and ${label.toLowerCase()}`, ...day.holidays].join(" · ");

  ideaList.innerHTML = ideas.length
    ? ideas.map((idea) => ideaHtml(idea, day.date)).join("")
    : `<p class="status">No ideas for this day yet.</p>`;

  const why = explainDay(day, label, ideas, settings.unit);
  whyBox.innerHTML = `
    <h3><span aria-hidden="true">💡</span> Why these activities?</h3>
    <p>${why.map(escapeHtml).join(" ")}</p>`;
  whyBox.hidden = why.length === 0;

  ideasSection.hidden = false;
}

function ideaHtml({ activity, outside, holiday }, date) {
  const original = activity.rootmap;
  const meta = activity.littleDays;
  const where = meta.place === "outdoor" ? "Outdoor"
    : meta.place === "indoor" || !outside ? "Indoor"
    : "Outdoor or indoor";
  const added = isPlanned(plan, date, activity.id);
  const title = escapeHtml(original.title);
  return `
    <article class="idea">
      ${photoHtml(activity, "(max-width: 719px) 96px, 320px")}
      <div class="idea-body">
        <h3><button type="button" class="idea-title" data-open="${activity.id}" data-date="${date}">${title}</button></h3>
        <p class="meta">${where} · ${original.minutes} min · Ages ${meta.minAge}–${meta.maxAge}</p>
        ${holiday ? `<p><span class="tag tag-holiday">${escapeHtml(meta.holidays[0])}-inspired idea</span></p>` : ""}
        <p class="idea-description">${escapeHtml(original.description)}</p>
        <ul class="tags">${original.domains.slice(0, 3).map((d) => `<li class="tag tag-soft">${escapeHtml(d)}</li>`).join("")}</ul>
        ${original.safety ? `<p class="safety"><strong>Safety:</strong> ${escapeHtml(original.safety)}</p>` : ""}
        ${added
          ? `<button type="button" class="button-added" disabled>Added ✓</button>`
          : `<button type="button" data-add="${activity.id}" data-date="${date}" aria-label="Add ${title} to my week">Add to my week</button>`}
      </div>
    </article>`;
}

// The photo, or a plain tile with the title's first letter if there isn't one.
function photoHtml(activity, sizes) {
  const photo = activity.littleDays.photo;
  const initial = escapeHtml(activity.rootmap.title[0]);
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
  return toDate(isoDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// "2026-11-04T19:00" (the place's local time) → "7 PM". Read and shown as local time,
// so the visitor's own time zone doesn't shift it.
function formatHour(isoTime) {
  return new Date(isoTime).toLocaleTimeString("en-US", { hour: "numeric" });
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


// --- Start ---

for (const input of unitInputs) input.checked = input.value === settings.unit;
document.querySelector("#interest-chips").innerHTML = interestChipsHtml("interest");
document.querySelector("#explore-chips").innerHTML = interestChipsHtml("explore-interest");
showChoices();
applyView();
saveSettings(storage, settings); // finishes a v1 → v2 migration (PRD.md 7.18)
savePlan(storage, plan); // keep the cleaned-up plan
renderPlan();
renderExploreStatus();
// Resolves once Google is ready or the fallback is in place.
const googleStarted = config.googleMapsKey ? startGoogle() : Promise.resolve(useFallback());
renderFirstVisit();
if (settings.location) restoreLocation(settings.location);
