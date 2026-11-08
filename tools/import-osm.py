#!/usr/bin/env python3
"""Regenerates places.js: the places near the school, from OpenStreetMap.

Run it once in a while: python3 tools/import-osm.py
It needs curl and an internet connection. A photo set by hand in places.js is kept.
Names and positions are OpenStreetMap's (ODbL): the page credits "© OpenStreetMap contributors".
"""
import json
import math
import re
import subprocess
import time
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "places.js"
SCHOOL = {"name": "Peninsula Montessori Academy", "label": "221 Washington St, Newton, MA 02458",
          "latitude": 42.35725, "longitude": -71.18498, "countryCode": "US"}
# A 30-minute walk by the page's estimate (80 m a minute, streets 1.3 times the straight line).
RADIUS = round(30 * 80 / 1.3)

# OpenStreetMap tag → the Little Days place type (explore.js CATEGORIES).
TYPES = {
    ("leisure", "park"): "park", ("leisure", "nature_reserve"): "park", ("leisure", "garden"): "garden",
    ("leisure", "playground"): "playground", ("leisure", "pitch"): "athletic_field",
    ("leisure", "sports_centre"): "sports_complex", ("leisure", "swimming_pool"): "sports_complex",
    ("leisure", "dog_park"): "dog_park",
    ("amenity", "library"): "library", ("amenity", "post_office"): "post_office",
    ("amenity", "fire_station"): "fire_station", ("amenity", "police"): "police",
    ("amenity", "townhall"): "city_hall", ("amenity", "community_centre"): "community_center",
    ("amenity", "arts_centre"): "cultural_center", ("amenity", "theatre"): "performing_arts_theater",
    ("amenity", "cafe"): "cafe", ("amenity", "ice_cream"): "ice_cream_shop", ("amenity", "marketplace"): "market",
    ("shop", "bakery"): "bakery", ("shop", "supermarket"): "supermarket", ("shop", "greengrocer"): "grocery_store",
    ("shop", "florist"): "florist", ("shop", "hardware"): "hardware_store", ("shop", "books"): "book_store",
    ("shop", "toys"): "toy_store", ("shop", "bicycle"): "bicycle_store", ("shop", "shoes"): "shoe_store",
    ("shop", "pet"): "pet_store", ("shop", "garden_centre"): "garden_center", ("shop", "deli"): "deli",
    ("shop", "coffee"): "coffee_shop", ("shop", "second_hand"): "thrift_store",
    ("tourism", "museum"): "museum", ("tourism", "gallery"): "art_gallery", ("tourism", "zoo"): "zoo",
    ("tourism", "aquarium"): "aquarium",
    ("amenity", "restaurant"): "restaurant", ("amenity", "fast_food"): "restaurant", ("amenity", "bank"): "bank",
    ("amenity", "pharmacy"): "pharmacy", ("amenity", "doctors"): "doctor", ("amenity", "dentist"): "doctor",
    ("amenity", "clinic"): "doctor", ("amenity", "veterinary"): "veterinary_care",
    ("amenity", "place_of_worship"): "place_of_worship", ("amenity", "cinema"): "movie_theater",
    ("railway", "station"): "train_station",
    ("shop", "pastry"): "bakery", ("shop", "convenience"): "convenience_store", ("shop", "hairdresser"): "barber_shop",
    ("shop", "beauty"): "barber_shop", ("shop", "laundry"): "laundry", ("shop", "dry_cleaning"): "laundry",
    ("shop", "chemist"): "pharmacy", ("shop", "seafood"): "grocery_store", ("shop", "butcher"): "grocery_store",
}
# Children can visit almost anywhere an adult goes. Left out: alcohol, tobacco, cannabis and
# adult shops, gambling, weapons, traffic-heavy car places, and places that aren't for visiting.
SKIP_SHOPS = {"alcohol", "wine", "beverages", "tobacco", "e-cigarette", "cannabis", "erotic", "weapons", "pawnbroker",
              "car", "car_repair", "car_parts", "tyres", "motorcycle", "fuel", "funeral_directors", "storage_rental",
              "lottery", "betting", "gambling", "vacant"}
# Names that aren't places to take children: districts, research and college libraries.
SKIP = re.compile(r"historic district|research|college|higher education|braille|safety network|information center|ups store", re.I)


def overpass(selectors):
    around = f"around:{RADIUS},{SCHOOL['latitude']},{SCHOOL['longitude']}"
    query = "[out:json][timeout:90];(" + "".join(f"nwr({around}){s}[name];" for s in selectors) + ");out center tags;"
    # The public server is often busy, so a failed request is tried again after a pause.
    for attempt in range(4):
        result = subprocess.run(["curl", "-s", "-m", "120", "-A", "little-days-import", "--data-urlencode", f"data={query}",
                                 "https://overpass-api.de/api/interpreter"], capture_output=True, text=True)
        if result.stdout.startswith("{"):
            return json.loads(result.stdout)["elements"]
        time.sleep(20 * (attempt + 1))
    raise SystemExit("OpenStreetMap's server didn't answer. Try again later.")


# Several small requests, since one big one is often refused.
def fetch():
    named = [(k, v) for k, v in TYPES if k != "shop"]
    return (overpass([f'["{k}"="{v}"]' for k, v in named])
            + overpass(["[shop]"]))


def place_type(tags):
    for key in ("leisure", "tourism", "railway", "amenity", "shop"):
        if (key, tags.get(key)) in TYPES:
            return TYPES[(key, tags[key])]
    shop = tags.get("shop")
    return "store" if shop and shop not in SKIP_SHOPS else None


def distance(lat, lng):
    return math.hypot((lat - SCHOOL["latitude"]) * 111000, (lng - SCHOOL["longitude"]) * 82000)


def main():
    old = OUT.read_text(encoding="utf8") if OUT.exists() else ""
    photos = dict(re.findall(r'id: "([^"]+)".*?photo: ("[^"]*"|null)', old))
    places = {}
    for element in fetch():
        tags = element.get("tags", {})
        kind = place_type(tags)
        if not kind or tags.get("shop") in SKIP_SHOPS or SKIP.search(tags["name"]):
            continue
        point = element.get("center", element)
        place_id = f'osm-{element["type"]}-{element["id"]}'
        street = " ".join(x for x in (tags.get("addr:housenumber"), tags.get("addr:street")) if x)
        address = ", ".join(x for x in (street, tags.get("addr:city")) if x)
        places[place_id] = (distance(point["lat"], point["lon"]), place_id, tags["name"], kind, point["lat"], point["lon"], address)
    lines = [f'  {{ id: "{pid}", name: {json.dumps(name, ensure_ascii=False)}, primaryType: "{kind}", lat: {lat:.5f}, lng: {lng:.5f}, '
             f'address: {json.dumps(address)}, photo: {photos.get(pid, "null")} }},'
             for _, pid, name, kind, lat, lng, address in sorted(places.values())]
    OUT.write_text(f"""// The school and the places near it (PRD.md 7.10), so Explore needs no paid search.
// Generated by tools/import-osm.py on {date.today().isoformat()}: rerun it once in a while to update.
//
// Names and positions are from OpenStreetMap (© OpenStreetMap contributors, ODbL). Google's
// names, addresses and photos can't be stored here: its terms don't allow it.
// photo: a picture the school took, in images/places/ (for example "images/places/farlow-park.webp"),
// or null to show the category icon. A photo set here is kept when the script runs again.
// No page code here, so tests can run it in Node.

const SCHOOL = {json.dumps(SCHOOL, indent=2).replace('"name"', 'name').replace('"label"', 'label').replace('"latitude"', 'latitude').replace('"longitude"', 'longitude').replace('"countryCode"', 'countryCode')};

const PLACES = [
{chr(10).join(lines)}
];

if (typeof module !== "undefined") {{
  module.exports = {{ SCHOOL, PLACES }};
}}
""", encoding="utf8")
    print(f"{len(lines)} places within {RADIUS} m written to places.js")


if __name__ == "__main__":
    main()
