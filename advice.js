// Units, "What to wear", "Why these activities?" and activity details (PRD.md 7.6–7.8).
// No page code here, so tests can run it in Node. All rules use °C, km/h and the UV index.

// --- Units ---

function toFahrenheit(celsius) {
  return celsius * 9 / 5 + 32;
}

function toMph(kmh) {
  return kmh * 0.621371;
}

// unit is "F" (°F and mph) or "C" (°C and km/h).
// A missing value shows "–", never a made-up number.
function formatTemp(celsius, unit) {
  if (celsius == null) return "–";
  return `${Math.round(unit === "F" ? toFahrenheit(celsius) : celsius)}°`;
}

function formatWind(kmh, unit) {
  if (kmh == null) return "–";
  return unit === "F" ? `${Math.round(toMph(kmh))} mph` : `${Math.round(kmh)} km/h`;
}

// --- What to wear ---

const WEAR_LIMITS = {
  freezing: 0, // feels-like high, °C
  cool: 10,
  mild: 18,
  hot: 27,
  coolMorning: 12, // feels-like low, °C
  rainChance: 40, // %
  windy: 40, // gusts, km/h
  uvProtect: 3, // UV index
  uvHigh: 6,
};

// day: { code, feelsMax, feelsMin, rainChance, gusts, uv, weather }. Any value may be null.
// Returns { wear: [], bring: [], notes: [] }. Missing values are left out, never guessed.
function whatToWear(day) {
  const wear = [];
  const bring = [];
  const notes = [];
  const { hazards, cautions } = day.weather;

  if (hazards.length) wear.push("Plan to stay indoors today");

  const t = day.feelsMax;
  if (t == null) {
    notes.push("The temperature forecast isn't available, so check before you dress.");
  } else if (t < WEAR_LIMITS.freezing) {
    wear.push("Heavy winter coat", "Hat, mittens and scarf", "Warm waterproof boots");
  } else if (t < WEAR_LIMITS.cool) {
    wear.push("Warm coat", "Hat and gloves");
  } else if (t < WEAR_LIMITS.mild) {
    wear.push("Light jacket or sweater");
  } else if (t < WEAR_LIMITS.hot) {
    wear.push("T-shirt and light layers");
    if (day.feelsMin != null && day.feelsMin < WEAR_LIMITS.coolMorning) {
      wear.push("An extra layer for the cool morning");
    }
  } else {
    wear.push("Light, loose clothes", "Sun hat");
    bring.push("Water bottle");
  }

  const rainy = cautions.includes("rain") || hazards.includes("heavyRain") || hazards.includes("freezingRain") ||
    (day.rainChance != null && day.rainChance >= WEAR_LIMITS.rainChance);
  if (rainy) {
    wear.push("Raincoat", "Waterproof shoes");
    bring.push("Spare socks");
  }

  if (cautions.includes("snow") || hazards.includes("heavySnow")) {
    wear.push("Snow pants and waterproof boots");
    bring.push("Spare mittens");
  }

  if (day.gusts != null && day.gusts >= WEAR_LIMITS.windy) wear.push("A windproof layer");

  if (day.uv != null && day.uv >= WEAR_LIMITS.uvProtect) {
    const hasHat = wear.some((item) => /\bhat\b/i.test(item));
    bring.push(hasHat ? "Sunscreen" : "Sunscreen and a sun hat");
    if (day.uv >= WEAR_LIMITS.uvHigh) bring.push("Shade at midday");
  }

  return { wear, bring, notes };
}

// --- Why these activities? ---

const CAUTION_WORDS = { rain: "rain", snow: "light snow", cold: "cold air", hot: "heat", wind: "gusty wind" };
const HAZARD_WORDS = {
  storm: "thunderstorms",
  heavyRain: "heavy rain",
  freezingRain: "freezing rain",
  heavySnow: "heavy snow",
  extremeHeat: "extreme heat",
  extremeCold: "extreme cold",
  dangerousWind: "strong wind",
};

// "a", "a and b", "a, b and c"
function listWords(words) {
  return words.length <= 1 ? words.join("") : `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}

// day: { high, weather, holidays, celebrations, season }, conditionLabel: "Clear",
// ideas: from pickIdeas(), age: number, unit: "F" or "C". Returns a list of sentences.
function explainDay(day, conditionLabel, ideas, age, unit) {
  if (!ideas.length) return [];
  const sentences = [];
  const title = (idea) => idea.activity.rootmap.title;

  const holidayIdea = ideas.find((i) => i.holiday);
  if (holidayIdea) {
    const tag = holidayIdea.activity.littleDays.holidays[0];
    const isCelebration = (day.celebrations || []).some((name) => name.toLowerCase().includes(tag.toLowerCase()));
    sentences.push(isCelebration
      ? `If your family celebrates ${tag}, ${title(holidayIdea)} is a ${tag}-inspired idea for today.`
      : `It's ${tag}, so ${title(holidayIdea)} comes first as a ${tag}-inspired idea.`);
  }

  const { hazards, cautions } = day.weather;
  // The holiday idea was already named above, so it isn't repeated here.
  const others = ideas.filter((i) => i !== holidayIdea);
  const outdoor = others.filter((i) => i.outside).map(title);
  const indoor = others.filter((i) => !i.outside).map(title);
  if (hazards.length) {
    const all = ideas.length === 3 ? "all three ideas are" : ideas.length === 2 ? "both ideas are" : "this idea is";
    sentences.push(`With ${HAZARD_WORDS[hazards[0]]} in the forecast, outdoor play isn't a good idea today, so ${all} indoors.`);
  } else if (cautions.length) {
    const words = listWords(cautions.map((c) => CAUTION_WORDS[c]));
    let sentence = indoor.length
      ? `With ${words} in the forecast, ${listWords(indoor)} ${indoor.length === 1 ? "comes" : "come"} first`
      : `With ${words} in the forecast, the indoor ideas come first`;
    sentence += outdoor.length ? `, and ${listWords(outdoor)} can work outside if you dress for it.` : ".";
    sentences.push(sentence);
  } else {
    const weatherWords = day.high == null ? `It's ${conditionLabel.toLowerCase()}` : `It's ${conditionLabel.toLowerCase()} and ${formatTemp(day.high, unit)}`;
    if (outdoor.length) {
      let sentence = `${weatherWords}, so ${listWords(outdoor)} ${outdoor.length === 1 ? "gets" : "get"} you outside`;
      sentence += indoor.length ? `, with ${listWords(indoor)} as an indoor option.` : ".";
      sentences.push(sentence);
    } else {
      sentences.push(`${weatherWords}, and these ideas work indoors.`);
    }
  }

  const seasonal = ideas.find((i) => i !== holidayIdea && i.activity.littleDays.seasons);
  if (seasonal) sentences.push(`${title(seasonal)} is a seasonal pick for ${day.season}.`);

  const who = ideas.length === 3 ? "All three suit" : ideas.length === 2 ? "Both suit" : "It suits";
  sentences.push(`${who} a ${age}-year-old.`);
  return sentences;
}

// --- Activity details ---

// Everything shown in the details dialog, taken from the original RootMap record.
function activityDetails(activity) {
  const original = activity.rootmap;
  return {
    id: activity.id,
    title: original.title,
    ages: original.age,
    duration: `About ${original.minutes} minutes`,
    description: original.description,
    materials: original.materials,
    steps: original.steps,
    practices: original.domains,
    safety: original.safety || null,
    photo: activity.littleDays.photo,
  };
}

if (typeof module !== "undefined") {
  module.exports = {
    toFahrenheit, toMph, formatTemp, formatWind,
    WEAR_LIMITS, whatToWear, explainDay, activityDetails,
  };
}
