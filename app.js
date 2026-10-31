const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

const form = document.querySelector("#search-form");
const cityInput = document.querySelector("#city");
const cityMessage = document.querySelector("#city-message");
const searchButton = document.querySelector("#search-button");
const statusArea = document.querySelector("#status");
const placeLine = document.querySelector("#place-line");
const week = document.querySelector("#week");

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
    "&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code" +
    "&timezone=auto";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Forecast failed with status ${response.status}`);
  }
  const data = await response.json();
  return data.daily;
}

async function search(city) {
  showLoading(city);
  try {
    const place = await findCity(city);
    if (!place) {
      showNotFound(city);
      return;
    }
    const daily = await getForecast(place);
    showWeek(place, daily);
  } catch (error) {
    console.error(error);
    showError(city);
  } finally {
    searchButton.disabled = false;
    searchButton.textContent = "Search";
  }
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

function showWeek(place, daily) {
  statusArea.className = "status";
  statusArea.innerHTML = "";

  const name = [place.name, place.admin1, place.country].filter(Boolean).join(", ");
  const first = toDate(daily.time[0]);
  const last = toDate(daily.time[daily.time.length - 1]);
  placeLine.textContent = `${name} · ${formatDay(first)} – ${formatDay(last)}`;
  placeLine.hidden = false;

  week.innerHTML = "";
  daily.time.forEach((date, i) => {
    const [icon, label] = WEATHER[daily.weather_code[i]] || ["🌡️", "Unknown"];
    const day = toDate(date);
    const item = document.createElement("li");
    item.innerHTML = `
      <article class="day">
        <h3 class="day-name">${day.toLocaleDateString("en-US", { weekday: "short" })}</h3>
        <span class="day-date">${day.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        <span class="day-icon" aria-hidden="true">${icon}</span>
        <span class="day-temps">
          <span class="visually-hidden">High</span> ${toF(daily.temperature_2m_max[i])}°
          <span class="day-low"><span class="visually-hidden">Low</span> ${toF(daily.temperature_2m_min[i])}°</span>
        </span>
        <span class="day-condition">${label}</span>
        <span class="day-rain">Rain ${daily.precipitation_probability_max[i]}%</span>
      </article>`;
    week.append(item);
  });
  week.hidden = false;
}

// --- Helpers ---

// "2026-10-30" alone is read as UTC midnight, which is the day before in the US.
// Adding a time makes it local midnight.
function toDate(isoDate) {
  return new Date(`${isoDate}T00:00`);
}

function formatDay(date) {
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function toF(celsius) {
  return Math.round(celsius * 9 / 5 + 32);
}

showEmpty();
