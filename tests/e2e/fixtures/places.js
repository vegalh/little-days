// Made-up places for the browser tests, served instead of places.js (tests/e2e/mock-apis.js).
// The school is where the forecast fixture is; every place is a short walk away.
const SCHOOL = { name: "Test School", label: "1 School Rd, Newton, MA", latitude: 42.3496, longitude: -71.2111, countryCode: "US" };

const PLACES = [
  { id: "fake-park-1", name: "Test Park", primaryType: "park", lat: 42.3510, lng: -71.2120, address: "1 Test Rd, Newton, MA", photo: null },
  { id: "fake-garden-1", name: "Test Garden", primaryType: "garden", lat: 42.3480, lng: -71.2080, address: "2 Test Rd, Newton, MA", photo: null },
  { id: "fake-bakery-1", name: "Test Bakery", primaryType: "bakery", lat: 42.3500, lng: -71.2100, address: "3 Test Rd, Newton, MA", photo: "assets/images/activities/duck-walk-480.webp", credit: "A Test Author, CC BY-SA 4.0", creditUrl: "https://commons.wikimedia.org/wiki/File:Test.jpg" },
  { id: "fake-library-1", name: "Test Library", primaryType: "library", lat: 42.3530, lng: -71.2150, address: "4 Test Rd, Newton, MA", photo: null },
  { id: "fake-fire-1", name: "Test Fire Station", primaryType: "fire_station", lat: 42.3460, lng: -71.2050, address: "5 Test Rd, Newton, MA", photo: null },
  { id: "fake-playground-1", name: "Test Playground", primaryType: "playground", lat: 42.3540, lng: -71.2160, address: "6 Test Rd, Newton, MA", photo: null },
];
