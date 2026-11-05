// Recommendation logic (PRD.md 7.4–7.5). No page code here, so tests can run it in Node.

// Open-Meteo WMO weather codes
const HAZARD_CODES = {
  storm: [95, 96, 99],
  heavyRain: [65, 82],
  freezingRain: [56, 57, 66, 67],
  heavySnow: [75, 86],
};
const RAIN_CODES = [51, 53, 55, 61, 63, 80, 81];
const SNOW_CODES = [71, 73, 77, 85];
const FOG_CODES = [45, 48];

const LIMITS = {
  extremeHeat: 32, // feels-like high, °C
  hot: 27,
  cold: 5,
  extremeCold: -10,
  dangerousWind: 70, // gusts, km/h
  windy: 50,
  rainChance: 50, // %
};

// day: { code, feelsMax, gusts, rainChance }
// hazards: outdoor play is not suggested at all.
// cautions: outdoor play only for activities that suit every caution.
// notes: shown as a warning, no effect on activities.
function weatherFor(day) {
  const hazards = [];
  const cautions = [];
  const notes = [];

  for (const [name, codes] of Object.entries(HAZARD_CODES)) {
    if (codes.includes(day.code)) hazards.push(name);
  }

  if (day.feelsMax >= LIMITS.extremeHeat) hazards.push("extremeHeat");
  else if (day.feelsMax >= LIMITS.hot) cautions.push("hot");

  if (day.feelsMax <= LIMITS.extremeCold) hazards.push("extremeCold");
  else if (day.feelsMax < LIMITS.cold) cautions.push("cold");

  if (day.gusts >= LIMITS.dangerousWind) hazards.push("dangerousWind");
  else if (day.gusts >= LIMITS.windy) cautions.push("wind");

  const snowy = SNOW_CODES.includes(day.code) || HAZARD_CODES.heavySnow.includes(day.code);
  if (SNOW_CODES.includes(day.code)) cautions.push("snow");
  // Precipitation chance counts as rain unless the forecast says it falls as snow.
  // A wet hazard already says more, and "works in rain gear" would contradict it.
  const wetHazard = hazards.some((name) => ["storm", "heavyRain", "freezingRain"].includes(name));
  if (!wetHazard && (RAIN_CODES.includes(day.code) || (day.rainChance >= LIMITS.rainChance && !snowy))) {
    cautions.push("rain");
  }

  if (FOG_CODES.includes(day.code)) notes.push("fog");

  return { hazards, cautions, notes };
}

// Northern-hemisphere seasons by month, swapped south of the equator.
function seasonFor(isoDate, latitude) {
  const month = Number(isoDate.slice(5, 7));
  const north = ["winter", "winter", "spring", "spring", "spring", "summer",
    "summer", "summer", "autumn", "autumn", "autumn", "winter"][month - 1];
  if (latitude >= 0) return north;
  return { winter: "summer", spring: "autumn", summer: "winter", autumn: "spring" }[north];
}

function canGoOutside(activity, weather) {
  return weather.hazards.length === 0 &&
    weather.cautions.every((c) => activity.littleDays.weather.includes(c));
}

// Steps 1–2: safety and weather, season. These only remove activities.
function canDo(activity, weather, season) {
  const meta = activity.littleDays;
  if (meta.seasons && !meta.seasons.includes(season)) return false;
  if (meta.place === "outdoor") return canGoOutside(activity, weather);
  return true; // indoor, or "either", which can always be done inside
}

function matchesHoliday(activity, holidayNames) {
  return activity.littleDays.holidays.some((tag) =>
    holidayNames.some((name) => name.toLowerCase().includes(tag.toLowerCase())));
}

// day: { weather, season, holidays: [names] }. shown: { id: times shown earlier this week }
// Returns up to three { activity, outside, holiday }.
function pickIdeas(day, activities, shown) {
  const candidates = activities
    .filter((a) => canDo(a, day.weather, day.season))
    .map((a, index) => ({
      activity: a,
      index,
      holiday: matchesHoliday(a, day.holidays),
      outside: a.littleDays.place !== "indoor" && canGoOutside(a, day.weather),
    }));

  // Steps 3–4: holiday first, then whatever has been shown least this week.
  candidates.sort((x, y) =>
    (y.holiday - x.holiday) ||
    ((shown[x.activity.id] || 0) - (shown[y.activity.id] || 0)) ||
    (x.index - y.index));

  const hazard = day.weather.hazards.length > 0;
  const clear = !hazard && day.weather.cautions.length === 0;
  // Clear: two outdoor ideas and one indoor. Caution: at most one outdoor. Hazard: none.
  const outdoorSlots = hazard ? 0 : clear ? 2 : 1;

  // An "either" activity is suggested outside only when it fills an outdoor slot.
  const picks = [];
  const used = (c) => picks.some((p) => p.activity === c.activity);
  const holiday = candidates.find((c) => c.holiday);
  if (holiday) picks.push({ ...holiday, outside: holiday.activity.littleDays.place === "outdoor" });

  const outdoor = candidates
    .filter((c) => c.outside && !used(c))
    .slice(0, Math.max(0, outdoorSlots - picks.filter((p) => p.outside).length));
  const indoor = candidates
    .filter((c) => c.activity.littleDays.place !== "outdoor" && !used(c) && !outdoor.includes(c))
    .slice(0, 3 - picks.length - outdoor.length)
    .map((c) => ({ ...c, outside: false }));

  // Outdoor ideas lead on clear days; indoor ones lead otherwise.
  picks.push(...(clear ? [...outdoor, ...indoor] : [...indoor, ...outdoor]));

  // Top up if one group ran short.
  for (const c of candidates) {
    if (picks.length >= 3) break;
    if (!used(c)) picks.push({ ...c, outside: c.activity.littleDays.place === "outdoor" });
  }

  return picks.slice(0, 3).map(({ activity, outside, holiday }) => ({ activity, outside, holiday }));
}

// days: [{ weather, season, holidays }] in date order. Returns three ideas per day;
// the first one is the day's featured activity.
function planWeek(days, activities) {
  const shown = {};
  return days.map((day) => {
    const ideas = pickIdeas(day, activities, shown);
    // Being featured counts more, so the featured activity changes every day.
    ideas.forEach((idea, i) => {
      shown[idea.activity.id] = (shown[idea.activity.id] || 0) + (i === 0 ? 3 : 1);
    });
    return ideas;
  });
}

// The hourly entries from the current hour on (PRD.md 7.3). Open-Meteo's hourly arrays
// start at local midnight, so the first entries are usually in the past. currentTime is
// Open-Meteo's current.time ("2026-11-04T17:15"), in the place's own time zone; the
// browser's clock isn't used, because the visitor may be in another time zone.
function nextHours(hourly, currentTime, count = 6) {
  const thisHour = `${currentTime.slice(0, 13)}:00`;
  const start = hourly.time.findIndex((time) => time >= thisHour);
  if (start === -1) return [];
  return hourly.time.slice(start, start + count).map((time, i) => ({
    time,
    temperature: hourly.temperature_2m[start + i],
    rainChance: hourly.precipitation_probability[start + i],
    code: hourly.weather_code[start + i],
  }));
}

// The forecast for one hour of one date, or null if it's outside the forecast.
// time is "HH:MM"; the entry for that hour is used.
function hourForecast(hourly, date, time) {
  const i = hourly.time.indexOf(`${date}T${time.slice(0, 2)}:00`);
  if (i === -1 || hourly.temperature_2m[i] == null) return null;
  return { temperature: hourly.temperature_2m[i], rainChance: hourly.precipitation_probability[i] };
}

// The highest rain chance in the next three hours, when it reaches the rain caution
// level (PRD.md 7.15), or null. hours come from nextHours.
function rainSoon(hours) {
  const chances = hours.slice(0, 3).map((hour) => hour.rainChance).filter((chance) => chance != null);
  const highest = Math.max(...chances);
  return chances.length && highest >= LIMITS.rainChance ? highest : null;
}

// On a hazard day, indoor places come first; otherwise the order stays (PRD.md 7.15).
// settingOf(place) is "indoors" or "outdoors".
function orderForWeather(places, weather, settingOf) {
  if (!weather || !weather.hazards.length) return places;
  return [...places].sort((a, b) => (settingOf(a) === "outdoors") - (settingOf(b) === "outdoors"));
}

if (typeof module !== "undefined") {
  module.exports = {
    LIMITS, weatherFor, seasonFor, canDo, canGoOutside, matchesHoliday, pickIdeas, planWeek, nextHours, hourForecast,
    rainSoon, orderForWeather,
  };
}
