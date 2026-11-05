// Place discovery logic (PRD.md 7.10–7.12). No page code here, so tests can run it in Node.
// Places here are plain objects made from Google's results:
// { id, name, address, location: { lat, lng }, primaryType, types, category }

// Little Days categories → Google place types (all from Google's Table A, checked
// 2026-11-04). They're searched as includedPrimaryTypes, so a supermarket that also
// lists "bakery" among its types isn't shown as a bakery.
const CATEGORIES = {
  "nature": { label: "Nature", emoji: "🌳", types: ["park", "botanical_garden", "garden", "hiking_area"] },
  "everyday-life": {
    label: "Everyday Life", emoji: "🥖",
    types: ["bakery", "grocery_store", "supermarket", "market", "farmers_market", "florist", "hardware_store", "book_store"],
  },
  "community-helpers": {
    label: "Community Helpers", emoji: "🚒",
    types: ["fire_station", "police", "post_office", "city_hall", "community_center"],
  },
  "art-culture": {
    label: "Art & Culture", emoji: "🎨",
    types: ["library", "museum", "art_gallery", "performing_arts_theater", "cultural_center"],
  },
  "animals-wildlife": {
    label: "Animals & Wildlife", emoji: "🐦",
    types: ["zoo", "aquarium", "farm", "pet_store", "dog_park", "wildlife_park", "wildlife_refuge"],
  },
  "movement": { label: "Movement", emoji: "🤸", types: ["playground", "athletic_field", "sports_complex"] },
};
const CATEGORY_KEYS = Object.keys(CATEGORIES);

const WALK_METERS_PER_MINUTE = 80; // an adult's walking pace; only sets the search area
const MAX_RESULTS = 10; // per category search
const ALL_SHORTLIST = 12;
const ROUTE_BATCH = 5; // walking times calculated at first (PRD.md 7.12)

function searchRadius(minutes) {
  return minutes * WALK_METERS_PER_MINUTE;
}

// The categories a search needs: one, or for "all" every category not loaded yet.
function categoriesToSearch(interest, loaded) {
  const wanted = interest === "all" ? CATEGORY_KEYS : [interest];
  return wanted.filter((key) => !loaded[key]);
}

// Straight-line distance in meters. Used only to order places, never shown as a time.
function straightLine(a, b) {
  const rad = (degrees) => degrees * Math.PI / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}

// loaded: { categoryKey: [place, ...] }. One category: all its places, closest first.
// All: up to 2 of the closest from each category, then the closest of the rest, up to 12.
// A place found by two searches belongs to the first category in CATEGORIES.
function shortlist(loaded, interest, origin) {
  const keys = interest === "all" ? CATEGORY_KEYS : [interest];
  const seen = new Set();
  const byCategory = keys.map((key) => (loaded[key] || [])
    .filter((place) => place.location && !seen.has(place.id) && seen.add(place.id))
    .map((place) => ({ ...place, category: key, distance: straightLine(origin, place.location) }))
    .sort((a, b) => a.distance - b.distance));
  if (interest !== "all") return byCategory[0].slice(0, MAX_RESULTS);

  const firsts = byCategory.flatMap((places) => places.slice(0, 2));
  const rest = byCategory.flatMap((places) => places.slice(2)).sort((a, b) => a.distance - b.distance);
  return [...firsts, ...rest].slice(0, ALL_SHORTLIST).sort((a, b) => a.distance - b.distance);
}

// Places that still need a walking time, closest first, at most ROUTE_BATCH.
// routes: { placeId: { status: "ok" | "none" | "failed" | "pending", ... } }
function routeTargets(places, routes, limit = ROUTE_BATCH) {
  return places.filter((place) => !routes[place.id]).slice(0, limit);
}

// Splits places by the walking-time limit. Places without a Google walking time are
// never hidden: Little Days can't tell (PRD.md 7.12).
function byWalkingTime(places, routes, minutes) {
  const within = [];
  const unknown = [];
  let over = 0;
  for (const place of places) {
    const route = routes[place.id];
    if (route && route.status === "ok") {
      if (route.durationMillis > minutes * 60000) over++;
      else within.push(place);
    } else {
      unknown.push(place);
    }
  }
  return { within, unknown, over };
}

// Walking minutes, rounded up, as Google's estimate.
function walkingMinutes(durationMillis) {
  return Math.max(1, Math.ceil(durationMillis / 60000));
}

// --- Access and setting (PRD.md 7.11): Little Days estimates, never verified ---

const ACCESS = {
  outdoor: {
    label: "Park or outdoor space",
    types: ["park", "playground", "dog_park", "hiking_area", "athletic_field"],
    note: "Check posted rules.",
  },
  publicService: {
    label: "Public-service building",
    types: ["library", "post_office", "city_hall", "fire_station", "police"],
    contact: true,
  },
  business: {
    label: "Business",
    types: ["bakery", "grocery_store", "supermarket", "market", "farmers_market", "florist", "hardware_store", "book_store", "pet_store"],
    contact: true,
  },
};

const OUTDOOR_TYPES = [
  "park", "playground", "dog_park", "hiking_area", "athletic_field", "garden", "botanical_garden",
  "farm", "zoo", "wildlife_park", "wildlife_refuge",
];

// The place's own primary type, or the first of its types that Little Days knows.
function placeType(place) {
  if (place.primaryType) return place.primaryType;
  const known = Object.values(CATEGORIES).flatMap((c) => c.types);
  return (place.types || []).find((type) => known.includes(type)) || null;
}

// { estimate: label or null, note: extra text or null, contact: bool }.
// verified is always false: version 1 has no source that verifies access.
function accessFor(place) {
  const type = placeType(place);
  const kind = Object.values(ACCESS).find((a) => a.types.includes(type));
  return {
    verified: false,
    estimate: kind ? kind.label : null,
    note: kind && kind.note ? kind.note : null,
    contact: Boolean(kind && kind.contact),
  };
}

// Age notes (PRD.md 7.13), by the chosen age range.
const AGE_NOTES = {
  "under-2": ["Google doesn't say whether a route suits strollers. Look out for curbs, steps and missing sidewalks."],
  "2-3": ["Hold hands near roads, parking lots and water."],
  "4-6": ["Agree on where to stop and wait before each crossing."],
};
AGE_NOTES["2-6"] = [...AGE_NOTES["2-3"], ...AGE_NOTES["4-6"]];

function ageNotes(ages) {
  return AGE_NOTES[ages] || AGE_NOTES["2-6"];
}

function settingFor(place) {
  return OUTDOOR_TYPES.includes(placeType(place)) ? "outdoors" : "indoors";
}

// "All", "indoors" or "outdoors".
function filterBySetting(places, setting) {
  return setting === "all" ? places : places.filter((place) => settingFor(place) === setting);
}

if (typeof module !== "undefined") {
  module.exports = {
    CATEGORIES, CATEGORY_KEYS, MAX_RESULTS, ROUTE_BATCH, searchRadius, categoriesToSearch, straightLine,
    shortlist, routeTargets, byWalkingTime, walkingMinutes, placeType, accessFor, settingFor, filterBySetting, ageNotes,
  };
}
