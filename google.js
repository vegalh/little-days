// Everything that touches google.maps (AGENTS.md): loading the Maps JavaScript API and the
// results map. The places themselves come from places.js, so no Places or Routes request
// is ever made: the map is the only billed part, one load per visit.

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
