// A tiny stand-in for the Maps JavaScript API, served instead of Google's script in
// mocked browser tests only (PRD.md 10.2). It copies the shapes Little Days expects from
// Google's reference docs; it proves nothing about the real API.
// Tests set window.FAKE_GOOGLE = { authFailure, failFetch, failNearby, emptyNearby, failRoutes }
// before the page loads,
// pick an address with window.fakePickAddress(), and read window.fakeGoogleCalls.
(() => {
  const options = window.FAKE_GOOGLE || {};
  const ADDRESS = {
    id: "ChIJfakeNewtonPlaceId",
    formattedAddress: "221 Washington St, Newton, MA 02458, USA",
    lat: 42.3496,
    lng: -71.2111,
  };
  window.fakeGoogleCalls = [];

  function fill(place) {
    place.formattedAddress = ADDRESS.formattedAddress;
    place.location = { lat: () => ADDRESS.lat, lng: () => ADDRESS.lng };
    place.addressComponents = [{ types: ["country", "political"], shortText: "US", longText: "United States" }];
  }

  class Place {
    constructor({ id }) {
      this.id = id;
    }
    async fetchFields({ fields }) {
      window.fakeGoogleCalls.push({ call: "fetchFields", id: this.id, fields });
      if (options.failFetch) throw new Error("fake fetchFields failure");
      fill(this);
      // A saved place from the made-up list gets its own name, type and location back.
      const known = NEARBY.find((p) => p.id === this.id);
      if (known) {
        Object.assign(this, { displayName: known.name, formattedAddress: known.address, primaryType: known.primaryType, types: [known.primaryType] });
        this.location = { lat: () => known.lat, lng: () => known.lng };
      }
      return { place: this };
    }
    static async searchNearby(request) {
      window.fakeGoogleCalls.push({ call: "searchNearby", request });
      if (options.failNearby) throw new Error("fake searchNearby failure");
      if (options.emptyNearby) return { places: [] };
      const places = NEARBY.filter((p) => request.includedPrimaryTypes.includes(p.primaryType)).map((p) => {
        const place = new Place({ id: p.id });
        Object.assign(place, { displayName: p.name, formattedAddress: p.address, primaryType: p.primaryType, types: [p.primaryType] });
        place.location = { lat: () => p.lat, lng: () => p.lng };
        if (p.id === "fake-park-1") {
          place.photos = [{
            getURI: () => "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
            authorAttributions: [{ displayName: "A Test Author", uri: "https://example.test/author" }],
          }];
        }
        return place;
      });
      return { places };
    }
    static async searchByText(request) {
      window.fakeGoogleCalls.push({ call: "searchByText", request });
      const place = new Place({ id: ADDRESS.id });
      fill(place);
      return { places: [place] };
    }
  }

  class AutocompleteSuggestion {
    static async fetchAutocompleteSuggestions() {
      window.fakeGoogleCalls.push({ call: "fetchAutocompleteSuggestions" });
      if (options.refuseAddress) throw Object.assign(new Error("Requests are blocked."), { code: 7 });
      throw Object.assign(new Error("Rpc failed due to xhr error."), { code: 2 });
    }
  }

  // Google's element keeps its input in a shadow DOM; a plain child input is enough here.
  class PlaceAutocompleteElement extends HTMLElement {
    connectedCallback() {
      if (this.input) return;
      this.input = document.createElement("input");
      this.input.setAttribute("aria-label", "Address or place");
      this.input.style.cssText = "width: 100%; min-height: 46px; padding: 0 12px; font: inherit; border: 0; background: transparent;";
      this.input.value = this.pendingValue || "";
      this.append(this.input);
    }
    get value() { return this.input ? this.input.value : this.pendingValue || ""; }
    set value(text) {
      if (this.input) this.input.value = text;
      else this.pendingValue = text;
    }
  }
  customElements.define("gmp-place-autocomplete", PlaceAutocompleteElement);

  // A suggestions request failing: Google's real gmp-error carries no details.
  window.fakeAddressError = () => document.querySelector("gmp-place-autocomplete").dispatchEvent(new Event("gmp-error"));

  window.fakePickAddress = () => {
    const field = document.querySelector("gmp-place-autocomplete");
    field.value = ADDRESS.formattedAddress;
    const event = new Event("gmp-select");
    event.placePrediction = { toPlace: () => new Place({ id: ADDRESS.id }) };
    field.dispatchEvent(event);
  };

  // Made-up places near the demo address, for tests only.
  const NEARBY = [
    { id: "fake-park-1", name: "Test Park", address: "1 Test Rd, Newton, MA", primaryType: "park", lat: 42.3510, lng: -71.2120 },
    { id: "fake-garden-1", name: "Test Garden", address: "2 Test Rd, Newton, MA", primaryType: "garden", lat: 42.3480, lng: -71.2080 },
    { id: "fake-bakery-1", name: "Test Bakery", address: "3 Test Rd, Newton, MA", primaryType: "bakery", lat: 42.3500, lng: -71.2100 },
    { id: "fake-library-1", name: "Test Library", address: "4 Test Rd, Newton, MA", primaryType: "library", lat: 42.3530, lng: -71.2150 },
    { id: "fake-fire-1", name: "Test Fire Station", address: "5 Test Rd, Newton, MA", primaryType: "fire_station", lat: 42.3460, lng: -71.2050 },
    { id: "fake-playground-1", name: "Test Playground", address: "6 Test Rd, Newton, MA", primaryType: "playground", lat: 42.3540, lng: -71.2160 },
  ];

  // Walking times grow with the destination's position; the garden has no route.
  const RouteMatrix = {
    async computeRouteMatrix(request) {
      window.fakeGoogleCalls.push({ call: "computeRouteMatrix", destinations: request.destinations.length, request });
      if (options.failRoutes) throw new Error("fake route matrix failure");
      const items = request.destinations.map((d, i) => Math.abs(d.lat - 42.348) < 1e-6
        ? { condition: "ROUTE_NOT_FOUND" }
        : { condition: "ROUTE_EXISTS", durationMillis: (i + 1) * 2 * 60000 + 1000, distanceMeters: (i + 1) * 320 });
      return { matrix: { rows: [{ items }] } };
    },
  };
  const Route = {
    async computeRoutes(request) {
      window.fakeGoogleCalls.push({ call: "computeRoutes", request });
      if (options.failRoutes) throw new Error("fake route failure");
      return { routes: [{ durationMillis: 7 * 60000, distanceMeters: 560, warnings: ["Fake warning from the test double."], path: [request.origin, request.destination] }] };
    },
  };

  window.fakeMapCount = 0;
  class FakeMap {
    constructor(element, opts) {
      this.element = element;
      this.opts = opts;
      element.dataset.fakeMap = String(++window.fakeMapCount);
    }
    fitBounds() {}
    setCenter() {}
    setZoom() {}
  }
  class PinElement {
    constructor(opts) { Object.assign(this, opts); }
  }
  class AdvancedMarkerElement {
    constructor(opts) {
      Object.assign(this, opts);
      window.fakeMarkers = window.fakeMarkers || [];
      window.fakeMarkers.push(this);
      this.listeners = {};
    }
    addEventListener(type, fn) { this.listeners[type] = fn; }
  }
  window.fakePolylines = [];
  class Polyline {
    constructor(opts) { Object.assign(this, opts); window.fakePolylines.push(this); }
    setMap(map) { this.map = map; }
  }
  class LatLngBounds { constructor() {} extend() {} }

  // Street View: a view for every spot, unless the test says there's none.
  class StreetViewService {
    async getPanorama(request) {
      window.fakeGoogleCalls.push({ call: "getPanorama", request });
      if (options.noStreetView) throw Object.assign(new Error("ZERO_RESULTS"), { code: "ZERO_RESULTS" });
      return { data: { location: { pano: `pano-${request.location.lat}` } } };
    }
  }
  class StreetViewPanorama {
    constructor(element) {
      window.fakePanoramas = (window.fakePanoramas || 0) + 1;
      element.dataset.fakePanorama = "";
    }
    setPano(pano) { window.fakePano = pano; }
    setVisible() {}
  }

  window.google = {
    maps: {
      LatLngBounds,
      ControlPosition: { RIGHT_TOP: "RIGHT_TOP" },
      importLibrary: async (name) => {
        window.fakeGoogleCalls.push({ call: "importLibrary", name });
        if (name === "places") return { Place, PlaceAutocompleteElement, AutocompleteSuggestion, SearchNearbyRankPreference: { DISTANCE: "DISTANCE" } };
        if (name === "routes") return { RouteMatrix, Route };
        if (name === "maps") return { Map: FakeMap, Polyline };
        if (name === "marker") return { AdvancedMarkerElement, PinElement };
        if (name === "streetView") return { StreetViewService, StreetViewPanorama, StreetViewSource: { OUTDOOR: "outdoor" } };
        return {};
      },
    },
  };

  window.fakeGoogleLanguage = new URL(document.currentScript.src).searchParams.get("language");
  const callback = new URL(document.currentScript.src).searchParams.get("callback");
  window[callback]();
  // Google reports a refused key after the script has loaded.
  if (options.authFailure) setTimeout(() => window.gm_authFailure(), 50);
})();
