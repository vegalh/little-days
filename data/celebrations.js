// Celebrations that aren't public holidays (PRD.md 7.2). Kept apart from Nager.Date's
// public holidays. Each lists the countries (ISO codes) where it is widely observed;
// elsewhere the date shows nothing, so the page doesn't assume every family celebrates it.
// Hand-reviewed MVP list. Dates are month-day.
const CELEBRATIONS = [
  { name: "Halloween", date: "10-31", countries: ["US", "CA", "IE", "GB"] },
  { name: "Valentine's Day", date: "02-14", countries: ["US", "CA", "GB", "IE", "AU", "NZ"] },
];

// Names of the celebrations on an ISO date in a country.
function celebrationsOn(isoDate, countryCode) {
  return CELEBRATIONS
    .filter((c) => c.date === isoDate.slice(5) && c.countries.includes(countryCode))
    .map((c) => c.name);
}

if (typeof module !== "undefined") {
  module.exports = { CELEBRATIONS, celebrationsOn };
}
