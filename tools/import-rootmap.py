"""Regenerate data/activities.js and assets/images/activities/ from RootMapMVP.

RootMapMVP is only read, never changed. The activity list and the hand-reviewed
Little Days metadata (place, weather, seasons, holidays) come from the current
activities.js and are kept as they are; only the `rootmap` records, the ages read
from them, and the photos are refreshed.

To add an activity, add `{ "id": "...", "littleDays": { "place": ..., "weather": [...],
"seasons": null, "holidays": [] } }` to activities.js by hand, then run this script.

Usage (from the Little Days folder):
  python3 tools/import-rootmap.py [--rootmap ~/Documents/GitHub/RootMapMVP]

Needs Node (to read RootMap's TypeScript data) and Pillow (`pip install Pillow`).
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
REVIEWED = ["place", "weather", "seasons", "holidays"]
PHOTO_WIDTHS = (480, 960)

# Evaluates RootMap's src/data/activities.ts as plain JS: photo imports become their paths.
EXTRACT_JS = r"""
const fs = require("fs");
let src = fs.readFileSync(process.argv[1], "utf8");
src = src.replace(/^import type .*$/gm, "")
  .replace(/^import (\w+) from "(.*)";$/gm, 'const $1 = "$2";')
  .replace(/export const activities: Activity\[\] =/, "const activities =")
  .replace(/export const categories[\s\S]*$/, "");
process.stdout.write(JSON.stringify(new Function(src + "\nreturn activities;")()));
"""
READ_CURRENT_JS = "process.stdout.write(JSON.stringify(require(process.argv[1]).ACTIVITIES))"


def node(code, arg):
    return json.loads(subprocess.run(["node", "-e", code, arg], check=True, capture_output=True, text=True).stdout)


def git(rootmap, *args):
    return subprocess.run(["git", "-C", str(rootmap), *args], check=True, capture_output=True, text=True).stdout.strip()


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--rootmap", type=Path, default=Path.home() / "Documents/GitHub/RootMapMVP")
    rootmap = parser.parse_args().rootmap.expanduser()
    data_file = rootmap / "src/data/activities.ts"
    photos = rootmap / "src/assets/activities"

    # Only import from a committed state, so the recorded commit really describes the data.
    if git(rootmap, "status", "--porcelain", "--", "src/data/activities.ts", "src/assets/activities"):
        sys.exit("RootMapMVP has uncommitted changes to its activities or photos. Commit them first.")
    commit = git(rootmap, "rev-parse", "--short", "HEAD")

    source = {a["id"]: a for a in node(EXTRACT_JS, str(data_file))}
    current = node(READ_CURRENT_JS, str(ROOT / "data" / "activities.js"))

    out_photos = ROOT / "assets/images/activities"
    out_photos.mkdir(parents=True, exist_ok=True)
    entries = []
    for entry in current:
        activity_id = entry["id"]
        if activity_id not in source:
            sys.exit(f"{activity_id} is not in RootMapMVP at {commit}.")
        reviewed = entry.get("littleDays", {})
        missing = [field for field in REVIEWED if field not in reviewed]
        if missing:
            sys.exit(f"{activity_id} needs hand-reviewed littleDays fields first: {', '.join(missing)}")

        original = source[activity_id]
        low, high = original["age"].split(" ")[0].split("–")

        photo = None
        source_photo = photos / Path(original["image"]).name
        if source_photo.exists():
            with Image.open(source_photo) as im:
                im = im.convert("RGB")
                for width in PHOTO_WIDTHS:
                    height = round(im.height * width / im.width)
                    im.resize((width, height), Image.LANCZOS).save(
                        out_photos / f"{activity_id}-{width}.webp", "WEBP", quality=78, method=6)
                photo = {"width": PHOTO_WIDTHS[-1], "height": round(im.height * PHOTO_WIDTHS[-1] / im.width)}

        entries.append({
            "id": activity_id,
            "rootmap": original,
            "littleDays": {
                "minAge": int(low),
                "maxAge": int(high),
                **{field: reviewed[field] for field in REVIEWED},
                "photo": photo,
            },
        })

    header = f"""// Activities for Little Days.
//
// Each entry has two parts:
// - `rootmap`: copied unchanged from RootMapMVP (https://github.com/vegalh/rootmapmvp),
//   src/data/activities.ts at commit {commit}. Titles, ages, descriptions, materials,
//   steps, domains, safety notes and Chinese translations are the original text.
//   `rootmap.image` is the original photo path in that repo.
// - `littleDays`: added for Little Days only, not part of the original activity.
//   minAge/maxAge are read from `rootmap.age`. place, weather, seasons and holidays are
//   hand-reviewed Little Days judgements (see PRD.md 7.4–7.5). Holiday tags are
//   holiday-inspired suggestions; the original activities were not written for those
//   holidays. photo is the size of the WebP copy in assets/images/activities/ (null if none).
//
// Generated by tools/import-rootmap.py. Edit littleDays fields by hand; re-run the script
// to refresh the rootmap records and photos. RootMapMVP is not needed at runtime.

"""
    footer = """
if (typeof module !== "undefined") {
  module.exports = { ACTIVITIES };
}
"""
    body = "const ACTIVITIES = " + json.dumps(entries, ensure_ascii=False, indent=2) + ";\n"
    (ROOT / "data" / "activities.js").write_text(header + body + footer)
    no_photo = [e["id"] for e in entries if e["littleDays"]["photo"] is None]
    print(f"Wrote {len(entries)} activities from RootMapMVP {commit}. Missing photos: {no_photo or 'none'}")


if __name__ == "__main__":
    main()
