const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const HOLIDAYS_URL = "https://date.nager.at/api/v3/PublicHolidays";

const form = document.querySelector("#search-form");
const cityInput = document.querySelector("#city");
const cityOptions = document.querySelector("#city-options");
const cityMessage = document.querySelector("#city-message");
const searchButton = document.querySelector("#search-button");
const unitInputs = document.querySelectorAll("input[name=unit]");
const statusArea = document.querySelector("#status");
const placeLine = document.querySelector("#place-line");
const holidayNote = document.querySelector("#holiday-note");
const week = document.querySelector("#week");
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
  storage = { getItem: () => null, setItem: () => {} };
}

const ACTIVITY_IDS = ACTIVITIES.map((a) => a.id);
const settings = loadSettings(storage); // { city, unit }
let plan = loadPlan(storage, isoToday(), ACTIVITY_IDS);
// The last successful search: { place, days, holidayProblem }
let current = null;
let selectedDay = 0;
// The button that opened the details dialog, to return focus to it.
let dialogOpener = null;
// Places offered while typing, by label: { "Portland, Maine, United States": place }
let suggestions = {};
let suggestTimer = null;

// Returns the first matching place, or null if the geocoder found nothing.
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
    // The parent kept typing, so this answer is out of date.
    if (cityInput.value.trim() !== text) return;
    suggestions = {};
    for (const place of data.results || []) suggestions[placeName(place)] = place;
    cityOptions.innerHTML = Object.keys(suggestions).map((name) => `<option value="${escapeHtml(name)}">`).join("");
  } catch (error) {
    // Suggestions are optional: Search still works and shows its own error.
    console.error(error);
  }
}

function placeName(place) {
  return [place.name, place.admin1, place.country].filter(Boolean).join(", ");
}

// Returns the daily arrays: time, temperature_2m_max, temperature_2m_min, ...
async function getForecast(place) {
  const url = `${FORECAST_URL}?latitude=${place.latitude}&longitude=${place.longitude}` +
    "&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min," +
    "precipitation_probability_max,weather_code,wind_gusts_10m_max,uv_index_max" +
    "&timezone=auto";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Forecast failed with status ${response.status}`);
  }
  const data = await response.json();
  return data.daily;
}

// Returns { holidays: [{ date, name, ... }], problem }, where problem is null,
// "unsupported" (Nager.Date has no data for the country) or "failed".
// A problem here never stops the forecast from showing.
async function getHolidays(countryCode, years) {
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

async function search(city) {
  showLoading(city);
  try {
    // A picked suggestion is used as is; anything typed is looked up.
    const place = suggestions[city] || await findCity(city);
    if (!place) {
      showNotFound(city);
      return;
    }
    const [daily, holidays] = await Promise.all([
      getForecast(place),
      getHolidays(place.country_code, yearsThisWeek()),
    ]);
    current = { place, days: buildDays(place, daily, holidays.holidays), holidayProblem: holidays.problem };
    selectedDay = 0;
    settings.city = city;
    saveSettings(storage, settings);
    statusArea.className = "status";
    statusArea.innerHTML = "";
    render();
  } catch (error) {
    console.error(error);
    showError(city);
  } finally {
    searchButton.disabled = false;
    searchButton.textContent = "Search";
  }
}

// One object per forecast day, with what recommend.js and advice.js need.
function buildDays(place, daily, holidays) {
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
    const celebrations = celebrationsOn(date, place.country_code);
    return {
      date,
      high: daily.temperature_2m_max[i],
      low: daily.temperature_2m_min[i],
      ...forecast,
      weather: weatherFor(forecast),
      season: seasonFor(date, place.latitude),
      celebrations,
      holidays: [...new Set([...publicHolidays, ...celebrations])],
    };
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (city.length === 0) {
    showInvalid("Type a city name first.");
  } else if (city.length < 2) {
    showInvalid("Type at least 2 letters.");
  } else {
    search(city);
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

// Changing the unit or day re-renders; neither sends a request.
for (const input of unitInputs) {
  input.addEventListener("change", () => {
    settings.unit = input.value;
    saveSettings(storage, settings);
    if (current) render();
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
  if (add) addActivity(add.dataset.add, add.dataset.date);
  if (remove) removeActivity(remove.dataset.remove, remove.dataset.date);
});

// A photo that fails to load becomes a plain tile instead of a broken image.
document.addEventListener("error", (event) => {
  if (event.target.tagName !== "IMG") return;
  event.target.closest(".art").classList.add("art-missing");
  event.target.remove();
}, true);

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

function showStatus(className, text) {
  statusArea.className = `status ${className}`;
  statusArea.innerHTML = "";
  const message = document.createElement("p");
  message.textContent = text;
  statusArea.append(message);
}

function clearWeek() {
  current = null;
  week.hidden = true;
  week.innerHTML = "";
  placeLine.hidden = true;
  holidayNote.hidden = true;
  ideasSection.hidden = true;
  renderPlan();
}

function showEmpty() {
  showStatus("", "Enter your city to see this week's weather and activity ideas.");
}

function showLoading(city) {
  searchButton.disabled = true;
  searchButton.textContent = "Searching…";
  clearWeek();
  showStatus("loading", `Getting the weather for ${city}…`);
}

function showNotFound(city) {
  showStatus("", `We couldn't find "${city}". Check the spelling, or add the state or country, like "Portland, Maine".`);
  cityInput.focus();
}

function showError(city) {
  showStatus("error", "We couldn't load the weather right now. Check your internet connection and try again.");
  const retry = document.createElement("button");
  retry.type = "button";
  retry.className = "button-secondary";
  retry.textContent = "Try again";
  retry.addEventListener("click", () => search(city));
  statusArea.append(retry);
}

function showInvalid(text) {
  cityMessage.textContent = `⚠︎ ${text}`;
  cityMessage.hidden = false;
  cityInput.setAttribute("aria-invalid", "true");
  cityInput.setAttribute("aria-describedby", "city-message");
  cityInput.focus();
}

function clearInvalid() {
  cityMessage.hidden = true;
  cityInput.removeAttribute("aria-invalid");
  cityInput.removeAttribute("aria-describedby");
}

// --- In use ---

function render() {
  const weekPlan = planWeek(current.days, ACTIVITIES);
  renderWeek(weekPlan);
  renderIdeas(current.days[selectedDay], weekPlan[selectedDay]);
  renderPlan();
}

function renderWeek(weekPlan) {
  const { place, days } = current;
  placeLine.textContent = `${placeName(place)} · ${formatDay(days[0].date)} – ${formatDay(days[days.length - 1].date)}`;
  placeLine.hidden = false;
  holidayNote.textContent = current.holidayProblem === "unsupported"
    ? "Nager.Date doesn't list public holidays for this country, so none are shown."
    : "Public holidays couldn't be loaded, so they aren't shown.";
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

function renderIdeas(day, ideas) {
  const [, label] = WEATHER[day.code] || ["", "Unknown"];
  ideasHeading.textContent = `Ideas for ${toDate(day.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`;
  ideasSubtitle.textContent = [`${temp(day.high)} and ${label.toLowerCase()}`, ...day.holidays].join(" · ");

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
savePlan(storage, plan); // keep the cleaned-up plan
renderPlan();
if (settings.city) {
  cityInput.value = settings.city;
  search(settings.city);
} else {
  showEmpty();
}
