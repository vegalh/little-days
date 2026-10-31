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
  if (RAIN_CODES.includes(day.code) || (day.rainChance >= LIMITS.rainChance && !snowy)) {
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

// Steps 1–3: age, safety and weather, season. These only remove activities.
function canDo(activity, age, weather, season) {
  const meta = activity.littleDays;
  if (age < meta.minAge || age > meta.maxAge) return false;
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
function pickIdeas(day, activities, age, shown) {
  const candidates = activities
    .filter((a) => canDo(a, age, day.weather, day.season))
    .map((a, index) => ({
      activity: a,
      index,
      holiday: matchesHoliday(a, day.holidays),
      outside: a.littleDays.place !== "indoor" && canGoOutside(a, day.weather),
    }));

  // Steps 4–5: holiday first, then whatever has been shown least this week.
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
function planWeek(days, activities, age) {
  const shown = {};
  return days.map((day) => {
    const ideas = pickIdeas(day, activities, age, shown);
    // Being featured counts more, so the featured activity changes every day.
    ideas.forEach((idea, i) => {
      shown[idea.activity.id] = (shown[idea.activity.id] || 0) + (i === 0 ? 3 : 1);
    });
    return ideas;
  });
}

if (typeof module !== "undefined") {
  module.exports = { LIMITS, weatherFor, seasonFor, canDo, canGoOutside, matchesHoliday, pickIdeas, planWeek };
}
