"""Download Eurostat NUTS GeoJSON files (run once, commit outputs)."""
import json
import pathlib
import urllib.request

GEO = pathlib.Path(__file__).parent.parent / "public" / "geo"
GEO.mkdir(parents=True, exist_ok=True)

BASE = "https://gisco-services.ec.europa.eu/distribution/v2/nuts/geojson"

files = [
    (f"{BASE}/NUTS_RG_10M_2021_4326_LEVL_2.geojson", "nuts2_10m.geojson"),
    (f"{BASE}/NUTS_RG_01M_2021_4326_LEVL_3.geojson", "nuts3_1m.geojson"),
]

for url, name in files:
    out = GEO / name
    if out.exists():
        print(f"[SKIP] {name} already exists ({out.stat().st_size/1024/1024:.1f}MB)")
        continue
    print(f"Downloading {name}...")
    urllib.request.urlretrieve(url, out)
    size_mb = out.stat().st_size / 1024 / 1024
    print(f"  Saved {size_mb:.1f}MB -> {out}")

# Filter NUTS3 to Poland + Romania only to reduce from ~50MB to ~3MB
nuts3_full = GEO / "nuts3_1m.geojson"
nuts3_filtered = GEO / "nuts3_pl_ro_1m.geojson"

if nuts3_full.exists() and not nuts3_filtered.exists():
    print("Filtering NUTS3 to PL+RO...")
    full = json.load(open(nuts3_full, encoding="utf-8"))
    filtered = {
        **full,
        "features": [
            f for f in full["features"]
            if f["properties"].get("CNTR_CODE") in ("PL", "RO")
        ],
    }
    json.dump(filtered, open(nuts3_filtered, "w", encoding="utf-8"), ensure_ascii=False)
    n = len(filtered["features"])
    size_kb = nuts3_filtered.stat().st_size / 1024
    print(f"  Filtered NUTS3 (PL+RO): {n} features, {size_kb:.0f}KB -> {nuts3_filtered.name}")
elif nuts3_filtered.exists():
    print(f"[SKIP] {nuts3_filtered.name} already exists")
