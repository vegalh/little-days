const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const HOLIDAYS_URL = "https://date.nager.at/api/v3/PublicHolidays";

const form = document.querySelector("#search-form");
const cityInput = document.querySelector("#city");
const cityMessage = document.querySelector("#city-message");
const searchButton = document.querySelector("#search-button");
const ageSelect = document.querySelector("#age");
const statusArea = document.querySelector("#status");
const placeLine = document.querySelector("#place-line");
const holidayNote = document.querySelector("#holiday-note");
const week = document.querySelector("#week");
const ideasSection = document.querySelector("#ideas");
const ideasHeading = document.querySelector("#ideas-heading");
const ideasSubtitle = document.querySelector("#ideas-subtitle");
const warningsBox = document.querySelector("#warnings");
const ideaList = document.querySelector("#idea-list");

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

// The last successful search: { place, days, holidaysLoaded }
let current = null;
let selectedDay = 0;

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

// Returns the daily arrays: time, temperature_2m_max, temperature_2m_min, ...
async function getForecast(place) {
  const url = `${FORECAST_URL}?latitude=${place.latitude}&longitude=${place.longitude}` +
    "&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max," +
    "precipitation_probability_max,weather_code,wind_gusts_10m_max" +
    "&timezone=auto";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Forecast failed with status ${response.status}`);
  }
  const data = await response.json();
  return data.daily;
}

// Returns a list of { date, name, ... }, or null if holidays couldn't be loaded.
// A failure here never stops the forecast from showing.
async function getHolidays(countryCode, years) {
  try {
    const lists = await Promise.all(years.map(async (year) => {
      const response = await fetch(`${HOLIDAYS_URL}/${year}/${countryCode}`);
      // Nager.Date answers 404 for countries it doesn't cover.
      if (!response.ok) {
        throw new Error(`Holidays failed with status ${response.status}`);
      }
      return response.json();
    }));
    return lists.flat();
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function search(city) {
  showLoading(city);
  try {
    const place = await findCity(city);
    if (!place) {
      showNotFound(city);
      return;
    }
    const [daily, holidays] = await Promise.all([
      getForecast(place),
      getHolidays(place.country_code, yearsThisWeek()),
    ]);
    current = { place, days: buildDays(place, daily, holidays || []), holidaysLoaded: holidays !== null };
    selectedDay = 0;
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

// One object per forecast day, with what recommend.js needs.
function buildDays(place, daily, holidays) {
  return daily.time.map((date, i) => {
    const forecast = {
      code: daily.weather_code[i],
      feelsMax: daily.apparent_temperature_max[i],
      gusts: daily.wind_gusts_10m_max[i],
      rainChance: daily.precipitation_probability_max[i],
    };
    return {
      date,
      high: daily.temperature_2m_max[i],
      low: daily.temperature_2m_min[i],
      ...forecast,
      weather: weatherFor(forecast),
      season: seasonFor(date, place.latitude),
      holidays: holidaysOn(date, holidays),
    };
  });
}

function holidaysOn(date, holidays) {
  const names = holidays.filter((h) => h.date === date).map((h) => h.name);
  for (const c of LOCAL_CELEBRATIONS) {
    if (date.slice(5) === c.date) names.push(c.name);
  }
  return [...new Set(names)];
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

cityInput.addEventListener("input", clearInvalid);

// Changing the age or the day re-renders; neither sends a request.
ageSelect.addEventListener("change", () => {
  if (current) render();
});

week.addEventListener("click", (event) => {
  const button = event.target.closest(".day");
  if (!button) return;
  selectedDay = Number(button.dataset.index);
  render();
  week.querySelector(`[data-index="${selectedDay}"]`).focus();
});

// A photo that fails to load becomes a plain tile instead of a broken image.
document.addEventListener("error", (event) => {
  if (event.target.tagName !== "IMG") return;
  event.target.closest(".art").classList.add("art-missing");
  event.target.remove();
}, true);

// --- Page states (PRD.md section 8) ---

function showStatus(className, text) {
  statusArea.className = `status ${className}`;
  statusArea.innerHTML = "";
  const message = document.createElement("p");
  message.textContent = text;
  statusArea.append(message);
}

function clearWeek() {
  week.hidden = true;
  week.innerHTML = "";
  placeLine.hidden = true;
  holidayNote.hidden = true;
  ideasSection.hidden = true;
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
  const age = Number(ageSelect.value);
  const plan = planWeek(current.days, ACTIVITIES, age);
  renderWeek(plan);
  renderIdeas(current.days[selectedDay], plan[selectedDay], age);
}

function renderWeek(plan) {
  const { place, days } = current;
  const name = [place.name, place.admin1, place.country].filter(Boolean).join(", ");
  placeLine.textContent = `${name} · ${formatDay(days[0].date)} – ${formatDay(days[days.length - 1].date)}`;
  placeLine.hidden = false;
  holidayNote.hidden = current.holidaysLoaded;

  week.innerHTML = days.map((day, i) => {
    const [icon, label] = WEATHER[day.code] || ["🌡️", "Unknown"];
    const featured = plan[i][0];
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

function renderIdeas(day, ideas, age) {
  const [, label] = WEATHER[day.code] || ["", "Unknown"];
  ideasHeading.textContent = `Ideas for ${toDate(day.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`;
  ideasSubtitle.textContent = [`For a ${age}-year-old`, `${temp(day.high)} and ${label.toLowerCase()}`, ...day.holidays].join(" · ");

  const { hazards, cautions, notes } = day.weather;
  const lines = [...hazards, ...cautions, ...notes].map((key) => WARNINGS[key](day));
  if (hazards.length) lines.push("Outdoor ideas are left out today.");
  warningsBox.innerHTML = `
    ${lines.length ? `<ul>${lines.map((line) => `<li>${line}</li>`).join("")}</ul>` : ""}
    <p class="warnings-footnote">These ideas use the daily forecast for the whole area. Check the weather before you go out, and come inside if it changes.</p>`;
  warningsBox.classList.toggle("has-warnings", lines.length > 0);

  ideaList.innerHTML = ideas.length
    ? ideas.map(ideaHtml).join("")
    : `<p class="status">No ideas for this day yet.</p>`;
  ideasSection.hidden = false;
}

function ideaHtml({ activity, outside, holiday }) {
  const original = activity.rootmap;
  const meta = activity.littleDays;
  const where = meta.place === "outdoor" ? "Outdoor"
    : meta.place === "indoor" || !outside ? "Indoor"
    : "Outdoor or indoor";
  return `
    <article class="idea">
      ${photoHtml(activity, "(max-width: 719px) 96px, 320px")}
      <div class="idea-body">
        <h3>${escapeHtml(original.title)}</h3>
        <p class="meta">${where} · ${original.minutes} min · Ages ${meta.minAge}–${meta.maxAge}</p>
        ${holiday ? `<p><span class="tag tag-holiday">${escapeHtml(meta.holidays[0])}-inspired idea</span></p>` : ""}
        <p class="idea-description">${escapeHtml(original.description)}</p>
        <ul class="tags">${original.domains.slice(0, 3).map((d) => `<li class="tag tag-soft">${escapeHtml(d)}</li>`).join("")}</ul>
        ${original.safety ? `<p class="safety"><strong>Safety:</strong> ${escapeHtml(original.safety)}</p>` : ""}
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

// "2026-10-30" alone is read as UTC midnight, which is the day before in the US.
// Adding a time makes it local midnight.
function toDate(isoDate) {
  return new Date(`${isoDate}T00:00`);
}

function formatDay(isoDate) {
  return toDate(isoDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// The forecast is in °C and km/h; the page shows °F and mph until the unit switch is built.
function temp(celsius) {
  return `${Math.round(celsius * 9 / 5 + 32)}°`;
}

function wind(kmh) {
  return `${Math.round(kmh * 0.621)} mph`;
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

showEmpty();
