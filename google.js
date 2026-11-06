// Everything that touches google.maps (AGENTS.md): loading the Maps JavaScript API,
// address Autocomplete, the example address, reloading a saved address, nearby search,
// walking times and routes, and the maps.
// Google is only called through these libraries, never with fetch (PRD.md 7.2).

const EXAMPLE_ADDRESS = "221 Washington Street, Newton, MA 02458";
const LOCATION_FIELDS = ["location", "formattedAddress", "addressComponents"];

// Loads the API once. Resolves when it's ready; rejects if the script can't load.
// Google reports a refused key (wrong key, address not allowed, API not enabled,
// billing off) later, by calling window.gm_authFailure, so that's passed in too.
// language ("en-US" or "zh-CN") sets the map labels, place names and addresses Google returns.
function loadGoogleMaps(key, onAuthFailure, language) {
  return new Promise((resolve, reject) => {
    window.littleDaysMapsReady = resolve;
    window.gm_authFailure = onAuthFailure;
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}` +
      `&language=${encodeURIComponent(language)}&loading=async&callback=littleDaysMapsReady`;
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

// Puts Google's address field into slot, with any text already typed. onPick gets a
// location; onError gets a failed suggestions or details request.
async function setupAutocomplete(slot, labelId, onPick, onError, text = "") {
  const { PlaceAutocompleteElement } = await google.maps.importLibrary("places");
  const field = new PlaceAutocompleteElement();
  field.id = "address";
  field.placeholder = tr("Start typing an address");
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
  field.value = text;
  refreshPartStyles();
  return field;
}

// gmp-error has no details, and a refused key doesn't reach gm_authFailure on a page without a
// map. So one direct request asks why: true only if Google refused it (a bad key, a blocked
// address, an API turned off). A network, server or quota failure is false.
async function mapsRefused(text) {
  try {
    const { AutocompleteSuggestion } = await google.maps.importLibrary("places");
    await AutocompleteSuggestion.fetchAutocompleteSuggestions({ input: text || "a" });
    return false;
  } catch (error) {
    console.error(error);
    return error.code === 7 || error.code === 16 || /api key/i.test(error.message);
  }
}

// Chromium keeps using the pre-upgrade style match for this field's ::part() rules
// (style.css, the search field), so our theming (the focus ring in particular) is
// ignored until something forces a restyle. Briefly disabling our stylesheet forces
// that restyle; confirmed live that this is needed only once, right after the
// element is created.
function refreshPartStyles() {
  const sheet = document.querySelector('link[rel="stylesheet"][href="style.css"]');
  if (!sheet) return;
  sheet.disabled = true;
  void document.body.offsetHeight;
  sheet.disabled = false;
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

// The first photo of a search result, with the credit Google requires beside it, so one with
// no author isn't used. Only the address goes here: the image is paid for when it loads.
function photoFromGoogle(place) {
  const photo = (place.photos || [])[0];
  const author = photo && (photo.authorAttributions || [])[0];
  if (!author) return null;
  return { url: photo.getURI({ maxWidth: 240 }), author: author.displayName, authorUrl: author.uri };
}

// Google's Place → a plain object for explore.js. Kept in memory only (PRD.md 9.4).
function placeFromGoogle(place) {
  return {
    id: place.id,
    name: place.displayName,
    address: place.formattedAddress,
    location: place.location ? { lat: place.location.lat(), lng: place.location.lng() } : null,
    primaryType: place.primaryType || null,
    types: place.types || [],
    photo: photoFromGoogle(place),
  };
}

// center: { lat, lng }; radius in meters; types: Google primary types for one category.
async function searchNearbyPlaces(center, radius, types) {
  const { Place, SearchNearbyRankPreference } = await google.maps.importLibrary("places");
  const { places } = await Place.searchNearby({
    fields: [...PLACE_FIELDS, "photos"],
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
    // Top right, so the preview card at the bottom of the map never covers it.
    zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_TOP },
    clickableIcons: false,
  });
}

// Keeps markers in step with the list without rebuilding them: markers is
// { start, placeId: { marker, pin } } from the last call (changed in place and returned).
// origin is the starting point, or null for none (no start marker).
// Only new places get new markers, only removed places lose theirs, and a changed list
// number just updates the pin. The map is refit only when the set of places changes.
async function syncMarkers(map, origin, places, onChoose, markers = {}) {
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
  const accent = cssColor("--accent");
  const onAccent = cssColor("--accent-ink");
  let changed = false;
  const ids = new Set(places.map((place) => place.id));
  for (const [id, { marker }] of Object.entries(markers)) {
    if (id !== "start" && !ids.has(id)) {
      marker.map = null;
      delete markers[id];
      changed = true;
    }
  }
  if (!origin && markers.start) {
    markers.start.marker.map = null;
    delete markers.start;
  } else if (origin && !markers.start) {
    const ink = cssColor("--ink");
    // glyphText and the pin itself as content: Google deprecated glyph and pin.element.
    const start = new PinElement({ background: ink, borderColor: ink, glyphColor: onAccent, glyphText: "●" });
    markers.start = { marker: new AdvancedMarkerElement({ map, position: origin, content: start, title: "Start" }) };
    changed = true;
  } else if (origin) {
    markers.start.marker.position = origin;
  }
  for (const place of places) {
    const entry = markers[place.id];
    if (entry) {
      if (entry.pin.glyphText !== String(place.number)) entry.pin.glyphText = String(place.number);
      continue;
    }
    const pin = new PinElement({ background: accent, borderColor: accent, glyphColor: onAccent, glyphText: String(place.number) });
    const marker = new AdvancedMarkerElement({ map, position: place.location, content: pin, title: place.name, gmpClickable: true });
    marker.addEventListener("gmp-click", () => onChoose(place.id));
    markers[place.id] = { marker, pin };
    changed = true;
  }
  if (changed && !origin && places.length === 1) {
    map.setCenter(places[0].location);
    map.setZoom(16);
  } else if (changed && places.length) {
    const bounds = new google.maps.LatLngBounds();
    if (origin) bounds.extend(origin);
    for (const place of places) bounds.extend(place.location);
    // Room for a pin above its point; the sides stay tight so a phone's small map can zoom in.
    map.fitBounds(bounds, { top: 48, right: 24, bottom: 24, left: 24 });
  }
  return markers;
}

function highlightMarker(markers, id) {
  for (const [key, { marker, pin }] of Object.entries(markers)) {
    if (!pin) continue;
    pin.scale = key === id ? 1.25 : 1;
    marker.zIndex = key === id ? 10 : null;
  }
}

// The one detail map, reused for every place: view is { map, markers, line }, kept by
// the caller. Opening another place moves the place marker, clears the old route line
// and draws the new one. origin is null when there's no starting point (no route).
async function showRouteMap(view, element, origin, place, route, mapId) {
  if (!view.map) view.map = await createMap(element, place.location, mapId);
  if (view.line) {
    view.line.setMap(null);
    view.line = null;
  }
  view.markers = await syncMarkers(view.map, origin, [place], () => {}, view.markers || {});
  if (route && route.path.length) {
    const { Polyline } = await google.maps.importLibrary("maps");
    view.line = new Polyline({ map: view.map, path: route.path, strokeColor: cssColor("--accent"), strokeOpacity: 0.9, strokeWeight: 5 });
  }
}

// A saved place's Google details, fetched again each visit (only its ID is stored, PRD.md 9.4).
async function placeDetails(id) {
  const { Place } = await google.maps.importLibrary("places");
  const place = new Place({ id });
  await place.fetchFields({ fields: PLACE_FIELDS.filter((field) => field !== "id") });
  return placeFromGoogle(place);
}
