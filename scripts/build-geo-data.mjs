/**
 * Builds the static lookup files the map tools read in the browser.
 *
 *   GEO_RAW=<source folder> MAPSHAPER=<mapshaper package dir> node scripts/build-geo-data.mjs
 *
 * Output (public/data/, fetched by tools on demand; src/data/, imported at build time):
 *   public/data/zcta.json          ZIP Code Tabulation Areas: point, population, income, home value, land area
 *   public/data/places.json        Census places (cities, towns, CDPs): point, population, land area
 *   public/data/tracts.json        Census tracts: point, population, land area (population-within-radius)
 *   public/data/counties.json      Counties: point, population, income, home value, land area
 *   public/data/geo/us-counties.json   Albers USA paths per county + state borders (choropleth tools)
 *   public/data/geo/us-states.json     Albers USA paths per state
 *   public/data/geo/world.json         Robinson paths per country
 *   public/data/geo/world-lonlat.json  Natural Earth 1:110m countries, lon/lat (globes, size comparison)
 *   public/data/geo/counties/<SS>.json  one state's counties in lon/lat (interactive county map)
 *   public/data/geo/tz-world.json      Robinson paths per time zone (timezone-boundary-builder "now")
 *   public/data/geo/tz-us.json         Albers USA paths per US time zone
 *   src/data/geo-centers.json      area-weighted centres of countries and US states
 *   src/data/earth-lines.json      where the Equator, tropics, polar circles and prime meridian cross land
 *
 * Sources (all downloaded 2026-10-18): Census 2024 Gazetteer + cartographic boundaries, ACS 2019-2023
 * 5-year table-based summary file (B01003, B19013, B25077), Natural Earth v5.1, timezone-boundary-builder 2026e (ODbL).
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const RAW = process.env.GEO_RAW;
if (!RAW) throw new Error("Set GEO_RAW");
const mapshaper = (await import(pathToFileURL(path.join(process.env.MAPSHAPER, "mapshaper.js")).href)).default;
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "..");
const PUB = path.join(ROOT, "public", "data");
const GEO = path.join(PUB, "geo");
fs.mkdirSync(path.join(GEO, "counties"), { recursive: true });

const readJson = (f) => JSON.parse(fs.readFileSync(path.join(RAW, f), "utf8"));
const write = (file, data) => {
  const s = JSON.stringify(data);
  fs.writeFileSync(file, s);
  console.log(`${path.relative(ROOT, file).padEnd(44)} ${(s.length / 1024).toFixed(0)} KB`);
};
const ms = (cmd, input) => mapshaper.applyCommands(cmd, input);
const r4 = (x) => Math.round(x * 1e4) / 1e4;

/* ---------------- ACS ---------------- */
function acs(file) {
  const m = new Map();
  for (const line of fs.readFileSync(path.join(RAW, file), "utf8").split("\n").slice(1)) {
    const [id, e] = line.split("|");
    if (!id) continue;
    const v = Number(e);
    m.set(id, Number.isFinite(v) && v >= 0 ? v : null);
  }
  return m;
}
const POP = acs("acs-b01003.dat");
const INC = acs("acs-b19013.dat");
const HOME = acs("acs-b25077.dat");

function gaz(name) {
  const rows = fs.readFileSync(path.join(RAW, name, `${name}.txt`), "utf8").split("\n");
  const head = rows[0].split("\t").map((s) => s.trim());
  return rows.slice(1).filter((r) => r.trim()).map((r) => {
    const c = r.split("\t").map((s) => s.trim());
    return Object.fromEntries(head.map((h, i) => [h, c[i]]));
  });
}

/* ---------------- point datasets ---------------- */
// [zip, lat, lon, population, median household income, median home value, land sq mi]
const zcta = gaz("2024_Gaz_zcta_national").map((z) => {
  const id = `860Z200US${z.GEOID}`;
  return [z.GEOID, r4(+z.INTPTLAT), r4(+z.INTPTLONG), POP.get(id) ?? null, INC.get(id) ?? null, HOME.get(id) ?? null, Math.round(+z.ALAND_SQMI * 10) / 10];
});
write(path.join(PUB, "zcta.json"), { source: "Census 2024 Gazetteer (ZCTA points, land area); ACS 2019-2023 5-year B01003, B19013, B25077", rows: zcta });

// [name, state USPS, lat, lon, population, land sq mi, GEOID, legal description]
const LSAD_SUFFIX = / (city and borough|city|town|village|borough|CDP|municipality|urban county|zona urbana|comunidad|consolidated government \(balance\)|metropolitan government \(balance\)|unified government \(balance\)|\(balance\))$/i;
const places = gaz("2024_Gaz_place_national").map((p) => {
  const m = p.NAME.match(LSAD_SUFFIX);
  return [p.NAME.replace(LSAD_SUFFIX, "").trim(), p.USPS, r4(+p.INTPTLAT), r4(+p.INTPTLONG), POP.get(`1600000US${p.GEOID}`) ?? null, Math.round(+p.ALAND_SQMI * 10) / 10, p.GEOID, m ? m[1] : ""];
});
write(path.join(PUB, "places.json"), { source: "Census 2024 Gazetteer (places); ACS 2019-2023 5-year B01003", rows: places });

// [lat, lon, population, land km2 x10]
const tracts = gaz("2024_Gaz_tracts_national").map((t) => [r4(+t.INTPTLAT), r4(+t.INTPTLONG), POP.get(`1400000US${t.GEOID}`) ?? 0, Math.round((+t.ALAND / 1e6) * 10) / 10]);
write(path.join(PUB, "tracts.json"), { source: "Census 2024 Gazetteer (tract points); ACS 2019-2023 5-year B01003", rows: tracts });

// [fips, name, USPS, lat, lon, population, income, home value, land sq mi]
const countiesGaz = gaz("2024_Gaz_counties_national");
const counties = countiesGaz.map((c) => {
  const id = `0500000US${c.GEOID}`;
  return [c.GEOID, c.NAME, c.USPS, r4(+c.INTPTLAT), r4(+c.INTPTLONG), POP.get(id) ?? null, INC.get(id) ?? null, HOME.get(id) ?? null, Math.round(+c.ALAND_SQMI * 10) / 10];
});
write(path.join(PUB, "counties.json"), { source: "Census 2024 Gazetteer (counties); ACS 2019-2023 5-year B01003, B19013, B25077", rows: counties });

/* ---------------- projected path sets ---------------- */
function bbox(fc) {
  let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity;
  const walk = (c) => {
    if (typeof c[0] === "number") {
      w = Math.min(w, c[0]); e = Math.max(e, c[0]); s = Math.min(s, c[1]); n = Math.max(n, c[1]);
    } else c.forEach(walk);
  };
  for (const f of fc.features ?? []) if (f.geometry) walk(f.geometry.coordinates);
  for (const g of fc.geometries ?? []) walk(g.coordinates);
  return [w, s, e, n];
}
function fitter(box, width) {
  const k = width / (box[2] - box[0]);
  return { k, w: Math.round(width), h: Math.round((box[3] - box[1]) * k), X: (x) => (x - box[0]) * k, Y: (y) => (box[3] - y) * k };
}
function pathD(geom, fit) {
  if (!geom) return "";
  const polys = geom.type === "Polygon" ? [geom.coordinates] : geom.type === "MultiPolygon" ? geom.coordinates : geom.type === "LineString" ? [[geom.coordinates]] : geom.type === "MultiLineString" ? [geom.coordinates] : [];
  const closed = geom.type.endsWith("Polygon");
  let d = "";
  for (const poly of polys)
    for (const ring of poly) {
      let px = 0, py = 0, n = 0, out = "";
      ring.forEach((pt, i) => {
        const x = Math.round(fit.X(pt[0]) * 2) / 2, y = Math.round(fit.Y(pt[1]) * 2) / 2;
        if (i === 0) out += `M${x} ${y}`;
        else {
          const dx = x - px, dy = y - py;
          if (!dx && !dy) return;
          out += `l${dx}${dy < 0 ? "" : " "}${dy}`;
          n++;
        }
        px = x; py = y;
      });
      if (n >= (closed ? 2 : 1)) d += out + (closed ? "z" : "");
    }
  return d.replace(/ -/g, "-");
}
async function project(fc, cmd, outName = "out") {
  const out = await ms(`-i in.json name=in ${cmd} -o ${outName}.json format=geojson precision=0.01`, { "in.json": fc });
  return JSON.parse(out[`${outName}.json`]);
}

const usCounties = readJson("cb_2024_us_county_500k.geojson");
const usStates = readJson("cb_2024_us_state_5m.geojson");
const TERR = new Set(["60", "66", "69", "72", "78"]);
const stateName = Object.fromEntries(usStates.features.map((f) => [f.properties.STATEFP, f.properties.NAME]));
const stateUsps = Object.fromEntries(usStates.features.map((f) => [f.properties.STATEFP, f.properties.STUSPS]));

// US counties + state borders, Albers USA, ~1000 px wide.
{
  const fc = { type: "FeatureCollection", features: usCounties.features.filter((f) => !TERR.has(f.properties.STATEFP)).map((f) => ({ type: "Feature", geometry: f.geometry, properties: { id: f.properties.GEOID, name: f.properties.NAMELSAD, st: f.properties.STUSPS } })) };
  const out = await ms(
    `-i in.json name=c -proj albersusa -simplify resolution=1400x900 keep-shapes -clean -dissolve st + name=s -innerlines target=s + name=sb -o target=c,sb format=geojson precision=0.01`,
    { "in.json": fc },
  );
  const C = JSON.parse(out["c.json"]), SB = JSON.parse(out["sb.json"]);
  const fit = fitter(bbox(C), 1000);
  write(path.join(GEO, "us-counties.json"), {
    w: fit.w,
    h: fit.h,
    counties: C.features.map((f) => [f.properties.id, f.properties.name, f.properties.st, pathD(f.geometry, fit)]),
    stateLines: (SB.features ? SB.features.map((f) => f.geometry) : SB.geometries).map((g) => pathD(g, fit)).join(""),
  });
}

// US states, Albers USA.
{
  const fc = { type: "FeatureCollection", features: usStates.features.filter((f) => !TERR.has(f.properties.STATEFP)).map((f) => ({ type: "Feature", geometry: f.geometry, properties: { id: f.properties.STUSPS, name: f.properties.NAME } })) };
  const P = await project(fc, `-proj albersusa -simplify resolution=1600x1000 keep-shapes -clean`, "in");
  const fit = fitter(bbox(P), 1000);
  write(path.join(GEO, "us-states.json"), { w: fit.w, h: fit.h, states: P.features.map((f) => [f.properties.id, f.properties.name, pathD(f.geometry, fit)]) });
}

// World, Robinson.
const ne50 = readJson("ne_50m_admin_0_countries.geojson");
{
  const fc = { type: "FeatureCollection", features: ne50.features.map((f) => ({ type: "Feature", geometry: f.geometry, properties: { id: f.properties.ADM0_A3, name: f.properties.NAME, cont: f.properties.CONTINENT } })) };
  const P = await project(fc, `-proj +proj=robin -simplify resolution=2000x1000 keep-shapes -clean`, "in");
  const fit = fitter(bbox(P), 1000);
  write(path.join(GEO, "world.json"), { w: fit.w, h: fit.h, countries: P.features.map((f) => [f.properties.id, f.properties.name, f.properties.cont, pathD(f.geometry, fit)]) });
}

// World 1:110m in lon/lat, quantised.
{
  const ne110 = readJson("ne_110m_admin_0_countries.geojson");
  const q = (g) => JSON.parse(JSON.stringify(g, (k, v) => (typeof v === "number" ? Math.round(v * 100) / 100 : v)));
  write(path.join(GEO, "world-lonlat.json"), {
    source: "Natural Earth 1:110m Admin 0 – Countries, v5.1",
    countries: ne110.features.map((f) => ({ id: f.properties.ADM0_A3, name: f.properties.NAME, geometry: q(f.geometry) })),
  });
}

// One file per state: counties in lon/lat, simplified for an OSM web map.
for (const st of Object.keys(stateName)) {
  if (TERR.has(st) && st !== "72") continue;
  const fc = { type: "FeatureCollection", features: usCounties.features.filter((f) => f.properties.STATEFP === st).map((f) => ({ type: "Feature", geometry: f.geometry, properties: { id: f.properties.GEOID, name: f.properties.NAMELSAD } })) };
  if (!fc.features.length) continue;
  const P = await project(fc, `-simplify 6% keep-shapes -clean`, "in");
  const q = (g) => JSON.parse(JSON.stringify(g, (k, v) => (typeof v === "number" ? Math.round(v * 1e4) / 1e4 : v)));
  fs.writeFileSync(path.join(GEO, "counties", `${st}.json`), JSON.stringify({ state: stateName[st], usps: stateUsps[st], counties: P.features.map((f) => ({ id: f.properties.id, name: f.properties.name, geometry: q(f.geometry) })) }));
}
console.log("public/data/geo/counties/*.json written");

// Time zones (timezone-boundary-builder, ODbL).
{
  const tz = readJson(path.join("tz", "combined-with-oceans-now.json"));
  const P = await project(tz, `-proj +proj=robin -simplify resolution=1600x800 keep-shapes -clean`, "in");
  const fit = fitter(bbox(P), 1000);
  write(path.join(GEO, "tz-world.json"), { w: fit.w, h: fit.h, zones: P.features.map((f) => [f.properties.tzid, pathD(f.geometry, fit)]) });

  const us = { type: "FeatureCollection", features: usStates.features.filter((f) => !TERR.has(f.properties.STATEFP)) };
  const out = await ms(
    `-i tz.json name=tz -i us.json name=us -target us -dissolve -target tz -filter '/^(America|Pacific)\\//.test(tzid)' -clip us -proj albersusa target=* -simplify resolution=1600x1000 keep-shapes -clean -target us -proj albersusa -o target=tz,us format=geojson precision=0.01`,
    { "tz.json": tz, "us.json": us },
  );
  const T = JSON.parse(out["tz.json"]);
  const fit2 = fitter(bbox(T), 1000);
  write(path.join(GEO, "tz-us.json"), { w: fit2.w, h: fit2.h, zones: T.features.filter((f) => f.geometry).map((f) => [f.properties.tzid, pathD(f.geometry, fit2)]) });
}

/* ---------------- centres ---------------- */
/**
 * Area-weighted centre of a shape on a sphere, over ALL its parts (Alaska and Hawaii count for the US).
 * The shape is cut into thin rows of latitude; within a row, the land intervals are integrated exactly:
 * each surface element dA = cos(lat) dlat dlon contributes its unit vector, and the summed vector is
 * turned back into a latitude and longitude.
 */
function vectorSum(geometry) {
  const b = bbox({ features: [{ geometry }] });
  const rows = 3000;
  const dlat = (b[3] - b[1]) / rows || 1e-6;
  let X = 0, Y = 0, Z = 0, area = 0;
  for (let i = 0; i < rows; i++) {
    const lat = b[1] + (i + 0.5) * dlat;
    const phi = (lat * Math.PI) / 180;
    for (const [lo1, lo2] of crossings(geometry, "lat", lat)) {
      const a1 = (lo1 * Math.PI) / 180, a2 = (lo2 * Math.PI) / 180;
      const w = Math.cos(phi) * ((dlat * Math.PI) / 180);
      X += w * Math.cos(phi) * (Math.sin(a2) - Math.sin(a1));
      Y += w * Math.cos(phi) * (Math.cos(a1) - Math.cos(a2));
      Z += w * Math.sin(phi) * (a2 - a1);
      area += w * (a2 - a1);
    }
  }
  return { X, Y, Z, area };
}
const toLatLon = ({ X, Y, Z }) => [Math.round(((Math.atan2(Z, Math.hypot(X, Y)) * 180) / Math.PI) * 1e4) / 1e4, Math.round(((Math.atan2(Y, X) * 180) / Math.PI) * 1e4) / 1e4];

/**
 * Area-weighted centre of a shape on a sphere, over ALL its parts (Alaska and Hawaii count for the US),
 * plus the centre of its largest part. The shape is cut into thin rows of latitude; within a row the land
 * intervals are integrated exactly: each surface element dA = cos(lat) dlat dlon contributes its unit
 * vector, and the summed vector is turned back into a latitude and longitude.
 */
async function centreOf(geometry) {
  const all = vectorSum(geometry);
  const parts = geometry.type === "MultiPolygon" ? geometry.coordinates.map((c) => vectorSum({ type: "Polygon", coordinates: c })) : [all];
  const main = parts.reduce((m, p) => (p.area > m.area ? p : m), parts[0]);
  const [lat, lon] = toLatLon(all);
  const share = main.area / all.area;
  if (share > 0.97) return { lat, lon, parts: parts.length };
  const [mlat, mlon] = toLatLon(main);
  return { lat, lon, parts: parts.length, mainLat: mlat, mainLon: mlon, mainShare: Math.round(share * 1000) / 1000 };
}
{
  const ne10 = readJson("ne_10m_admin_0_countries.geojson");
  const countries = [];
  for (const f of ne10.features) {
    countries.push({ id: f.properties.ADM0_A3, name: f.properties.NAME, type: f.properties.TYPE, ...(await centreOf(f.geometry)) });
  }
  const states = [];
  const st500 = readJson("cb_2024_us_state_500k.geojson");
  for (const f of st500.features) {
    if (TERR.has(f.properties.STATEFP) && f.properties.STATEFP !== "72") continue;
    states.push({ id: f.properties.STUSPS, name: f.properties.NAME, ...(await centreOf(f.geometry)) });
  }
  countries.sort((a, b) => a.name.localeCompare(b.name));
  states.sort((a, b) => a.name.localeCompare(b.name));
  write(path.join(ROOT, "src", "data", "geo-centers.json"), { countries, states });
}

/* ---------------- line crossings ---------------- */
// WGS84
const A = 6378137, F = 1 / 298.257223563, E2 = F * (2 - F);
const parallelRadius = (lat) => {
  const p = (lat * Math.PI) / 180;
  return (A * Math.cos(p)) / Math.sqrt(1 - E2 * Math.sin(p) ** 2);
};
function meridianArc(lat1, lat2) {
  // Numerical integral of M(phi) d(phi), M = a(1-e2)/(1-e2 sin^2)^1.5
  const n = 200, a1 = (lat1 * Math.PI) / 180, a2 = (lat2 * Math.PI) / 180;
  let s = 0;
  for (let i = 0; i < n; i++) {
    const p = a1 + ((i + 0.5) * (a2 - a1)) / n;
    s += (A * (1 - E2)) / (1 - E2 * Math.sin(p) ** 2) ** 1.5;
  }
  return Math.abs((s * (a2 - a1)) / n);
}
function crossings(geometry, axis, value) {
  // axis "lat": intervals of longitude where the parallel lies inside the shape; "lon": intervals of latitude.
  const polys = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  const out = [];
  for (const poly of polys) {
    const hits = [];
    for (const ring of poly)
      for (let i = 1; i < ring.length; i++) {
        const [x1, y1] = ring[i - 1], [x2, y2] = ring[i];
        const [a1, a2, b1, b2] = axis === "lat" ? [y1, y2, x1, x2] : [x1, x2, y1, y2];
        if ((a1 <= value && a2 > value) || (a2 <= value && a1 > value)) hits.push(b1 + ((value - a1) / (a2 - a1)) * (b2 - b1));
      }
    hits.sort((p, q) => p - q);
    for (let i = 0; i + 1 < hits.length; i += 2) out.push([hits[i], hits[i + 1]]);
  }
  return out;
}
{
  const ne10 = readJson("ne_10m_admin_0_countries.geojson");
  // Mean obliquity of the ecliptic at 2026-01-01 0h TT, IAU 2006 (Capitaine et al. 2003):
  // eps = 84381.406" - 46.836769"T - 0.0001831"T^2 + 0.00200340"T^3, T in Julian centuries from J2000.
  const T = (2461041.5 - 2451545.0) / 36525;
  const eps = (84381.406 - 46.836769 * T - 0.0001831 * T * T + 0.0020034 * T ** 3) / 3600;
  const lines = {
    equator: { axis: "lat", value: 0 },
    "tropic-of-cancer": { axis: "lat", value: eps },
    "tropic-of-capricorn": { axis: "lat", value: -eps },
    "arctic-circle": { axis: "lat", value: 90 - eps },
    "antarctic-circle": { axis: "lat", value: -(90 - eps) },
    "prime-meridian": { axis: "lon", value: 0 },
  };
  const result = { obliquityDeg: Math.round(eps * 1e6) / 1e6, obliquityEpoch: "2026-01-01", lines: {} };
  for (const [key, { axis, value }] of Object.entries(lines)) {
    const rows = [];
    for (const f of ne10.features) {
      const iv = crossings(f.geometry, axis, value);
      if (!iv.length) continue;
      const km = iv.reduce((s, [p, q]) => s + (axis === "lat" ? (parallelRadius(value) * ((q - p) * Math.PI)) / 180 : meridianArc(p, q)) / 1000, 0);
      rows.push({ id: f.properties.ADM0_A3, name: f.properties.NAME, type: f.properties.TYPE, from: Math.round(Math.min(...iv.flat()) * 100) / 100, to: Math.round(Math.max(...iv.flat()) * 100) / 100, segments: iv.length, km: Math.round(km) });
    }
    rows.sort((a, b) => a.from - b.from);
    result.lines[key] = { axis, value: Math.round(value * 1e6) / 1e6, countries: rows };
  }
  const gl = readJson("ne_10m_geographic_lines.geojson");
  const idl = gl.features.find((f) => f.properties.name === "International Date Line");
  result.dateLine = idl.geometry.coordinates.map((line) => line.map(([x, y]) => [Math.round(x * 1000) / 1000, Math.round(y * 1000) / 1000]));
  write(path.join(ROOT, "src", "data", "earth-lines.json"), result);
}
console.log("done");
