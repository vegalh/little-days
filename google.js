// Everything that touches google.maps (AGENTS.md): loading the Maps JavaScript API,
// address Autocomplete, the example address, reloading a saved address, nearby search,
// walking times and routes, and the maps.
// Google is only called through these libraries, never with fetch (PRD.md 7.2).

const EXAMPLE_ADDRESS = "221 Washington Street, Newton, MA 02458";
const LOCATION_FIELDS = ["location", "formattedAddress", "addressComponents"];

// Loads the API once. Resolves when it's ready; rejects if the script can't load.
// Google reports a refused key (wrong key, address not allowed, API not enabled,
// billing off) later, by calling window.gm_authFailure, so that's passed in too.
function loadGoogleMaps(key, onAuthFailure) {
  return new Promise((resolve, reject) => {
    window.littleDaysMapsReady = resolve;
    window.gm_authFailure = onAuthFailure;
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}` +
      "&loading=async&callback=littleDaysMapsReady";
    script.async = true;
    script.addEventListener("error", () => reject(new Error("The Maps JavaScript API script failed to load")));
    document.head.append(script);
  });
}

// Turns a Google Place into a Little Days location. Only the place ID is ever saved.
function locationFromPlace(place, kind = "place") {
  // The address component fields haven't been checked against a live response yet (PRD.md 7.2).
  const country = (place.addressComponents || []).find((part) => part.types.includes("country"));
  return {
    kind,
    placeId: place.id,
    label: place.formattedAddress,
    latitude: place.location.lat(),
    longitude: place.location.lng(),
    countryCode: country ? country.shortText : null,
  };
}

// Logs the first real response of each call, so its field names can be checked (AGENTS.md).
const logged = new Set();
function logFirst(name, value) {
  if (logged.has(name)) return;
  logged.add(name);
  console.log(`Little Days: first ${name} response (check against PRD.md 7.2)`, value);
}

// Puts Google's address field into slot. onPick gets a location; onError gets any failure.
async function setupAutocomplete(slot, labelId, onPick, onError) {
  const { PlaceAutocompleteElement } = await google.maps.importLibrary("places");
  const field = new PlaceAutocompleteElement();
  field.id = "address";
  field.placeholder = "Start typing an address";
  // The real input is inside Google's shadow DOM, so a <label for> can't reach it.
  field.setAttribute("aria-labelledby", labelId);
  field.addEventListener("gmp-select", async ({ placePrediction }) => {
    try {
      const place = placePrediction.toPlace();
      await place.fetchFields({ fields: LOCATION_FIELDS });
      logFirst("Autocomplete place", place.toJSON ? place.toJSON() : place);
      onPick(locationFromPlace(place));
    } catch (error) {
      onError(error);
    }
  });
  field.addEventListener("gmp-error", onError);
  slot.replaceChildren(field);
  return field;
}

// One text search for the demo address. Returns a location, or null if Google finds nothing.
async function findExampleAddress() {
  const { Place } = await google.maps.importLibrary("places");
  const { places } = await Place.searchByText({
    textQuery: EXAMPLE_ADDRESS,
    fields: LOCATION_FIELDS,
    maxResultCount: 1,
  });
  logFirst("searchByText", places);
  if (!places || !places.length) return null;
  return locationFromPlace(places[0], "example");
}

// Fetches a saved address again by its place ID (only the ID is stored, PRD.md 9.4).
async function placeLocation(placeId) {
  const { Place } = await google.maps.importLibrary("places");
  const place = new Place({ id: placeId });
  await place.fetchFields({ fields: LOCATION_FIELDS });
  logFirst("fetchFields", place.toJSON ? place.toJSON() : place);
  return locationFromPlace(place);
}

// --- Nearby places (PRD.md 7.10) ---

const PLACE_FIELDS = ["id", "displayName", "formattedAddress", "location", "primaryType", "types"];

// Google's Place → a plain object for explore.js. Kept in memory only (PRD.md 9.4).
function placeFromGoogle(place) {
  return {
    id: place.id,
    name: place.displayName,
    address: place.formattedAddress,
    location: place.location ? { lat: place.location.lat(), lng: place.location.lng() } : null,
    primaryType: place.primaryType || null,
    types: place.types || [],
  };
}

// center: { lat, lng }; radius in meters; types: Google primary types for one category.
async function searchNearbyPlaces(center, radius, types) {
  const { Place, SearchNearbyRankPreference } = await google.maps.importLibrary("places");
  const { places } = await Place.searchNearby({
    fields: PLACE_FIELDS,
    locationRestriction: { center, radius },
    includedPrimaryTypes: types,
    maxResultCount: MAX_RESULTS,
    rankPreference: SearchNearbyRankPreference.DISTANCE,
  });
  logFirst("searchNearby", places);
  return (places || []).map(placeFromGoogle);
}

// --- Walking (PRD.md 7.12) ---

// One request for several places. Returns { placeId: { status, durationMillis, distanceMeters } },
// where status is "ok", or "none" when Google found no walking route.
async function walkingTimes(origin, places) {
  const { RouteMatrix } = await google.maps.importLibrary("routes");
  const { matrix } = await RouteMatrix.computeRouteMatrix({
    origins: [origin],
    destinations: places.map((place) => place.location),
    travelMode: "WALKING",
    fields: ["durationMillis", "distanceMeters", "condition"],
  });
  logFirst("computeRouteMatrix", matrix);
  // One row for the one origin; its items follow the destinations' order.
  const items = matrix.rows[0].items;
  const times = {};
  places.forEach((place, i) => {
    const item = items[i];
    times[place.id] = item && item.condition === "ROUTE_EXISTS" && item.durationMillis != null
      ? { status: "ok", durationMillis: item.durationMillis, distanceMeters: item.distanceMeters }
      : { status: "none" };
  });
  return times;
}

// One walking route, for the detail map. Returns null when Google has none.
async function walkingRoute(origin, destination) {
  const { Route } = await google.maps.importLibrary("routes");
  const { routes } = await Route.computeRoutes({
    origin,
    destination,
    travelMode: "WALKING",
    fields: ["durationMillis", "distanceMeters", "path", "warnings"],
  });
  logFirst("computeRoutes", routes);
  const route = routes && routes[0];
  if (!route || route.durationMillis == null) return null;
  return {
    durationMillis: route.durationMillis,
    distanceMeters: route.distanceMeters,
    warnings: route.warnings || [],
    path: (route.path || []).map((point) => ({ lat: point.lat, lng: point.lng })),
  };
}

// --- Maps ---

// Google's map can't read CSS variables, so the colors are read from the page.
function cssColor(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

async function createMap(element, center, mapId) {
  const { Map: GoogleMap } = await google.maps.importLibrary("maps");
  return new GoogleMap(element, {
    center,
    zoom: 15,
    mapId,
    disableDefaultUI: true,
    zoomControl: true,
    clickableIcons: false,
  });
}

// Removes old markers, then shows the start and one numbered marker per place
// (place.number). Returns { placeId: { marker, pin } } for highlighting.
async function showMarkers(map, origin, places, onChoose, oldMarkers = {}) {
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
  for (const { marker } of Object.values(oldMarkers)) marker.map = null;
  const accent = cssColor("--accent");
  const ink = cssColor("--ink");
  const onAccent = cssColor("--accent-ink");
  // glyphText and the pin itself as content: Google deprecated glyph and pin.element.
  const start = new PinElement({ background: ink, borderColor: ink, glyphColor: onAccent, glyphText: "●" });
  const markers = { start: { marker: new AdvancedMarkerElement({ map, position: origin, content: start, title: "Start" }) } };
  const bounds = new google.maps.LatLngBounds(origin);
  for (const place of places) {
    const pin = new PinElement({ background: accent, borderColor: accent, glyphColor: onAccent, glyphText: String(place.number) });
    const marker = new AdvancedMarkerElement({ map, position: place.location, content: pin, title: place.name, gmpClickable: true });
    marker.addEventListener("gmp-click", () => onChoose(place.id));
    markers[place.id] = { marker, pin };
    bounds.extend(place.location);
  }
  if (places.length) map.fitBounds(bounds, 48);
  return markers;
}

function highlightMarker(markers, id) {
  for (const [key, { marker, pin }] of Object.entries(markers)) {
    if (!pin) continue;
    pin.scale = key === id ? 1.25 : 1;
    marker.zIndex = key === id ? 10 : null;
  }
}

// The detail map: start, the place, and the walking route line when there is one.
async function showRouteMap(element, origin, place, route, mapId) {
  const map = await createMap(element, place.location, mapId);
  await showMarkers(map, origin, [place], () => {});
  if (route && route.path.length) {
    const { Polyline } = await google.maps.importLibrary("maps");
    new Polyline({ map, path: route.path, strokeColor: cssColor("--accent"), strokeOpacity: 0.9, strokeWeight: 5 });
  }
}
