/**
 * Generates the printable blank maps registered in src/config/blank-maps.ts.
 *
 *   GEO_RAW=<folder with the source files> MAPSHAPER=<path to mapshaper's package dir> \
 *     node scripts/build-blank-maps.mjs [slug ...]
 *
 * Writes, per map:  public/maps/blank/<slug>-{blank,labeled,colored,cities}.svg
 * and one facts file: src/data/blank-maps.json  (unit names, areas, populations).
 *
 * Source files expected in GEO_RAW (all public domain, downloaded 2026-10-18):
 *   cb_2024_us_county_500k/  cb_2024_us_state_5m/        US Census Bureau cartographic boundaries 2024
 *   2024_Gaz_place_national/2024_Gaz_place_national.txt  Census Gazetteer 2024 (place points)
 *   acs-b01003.dat acs-b19013.dat                         ACS 2019-2023 5-year table-based summary file
 *   ne_50m_admin_0_countries.geojson                      Natural Earth v5.1 admin-0 (1:50m)
 *   ne_10m_admin_1_states_provinces.geojson               Natural Earth v5.1 admin-1 (1:10m)
 *   ne_10m_populated_places_simple.geojson                Natural Earth v5.1 populated places
 *
 * mapshaper (MPL-2.0) is a build-time tool only and is not a dependency of the site:
 * it does the dissolves, projections, simplification, non-adjacent colouring and
 * label points. This script writes the SVG itself.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { blankMaps } from "../src/config/blank-maps.ts";

const RAW = process.env.GEO_RAW;
if (!RAW) throw new Error("Set GEO_RAW to the folder holding the source files.");
const msEntry = process.env.MAPSHAPER ? path.join(process.env.MAPSHAPER, "mapshaper.js") : "mapshaper";
const mapshaper = (await import(process.env.MAPSHAPER ? pathToFileURL(msEntry).href : msEntry)).default;

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "..");
const OUT_SVG = path.join(ROOT, "public", "maps", "blank");
const OUT_JSON = path.join(ROOT, "src", "data", "blank-maps.json");
fs.mkdirSync(OUT_SVG, { recursive: true });
fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });

const SIZE = 2400; // longest side of the SVG viewBox, px
const PAD = 24;
const PALETTE = ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6", "#ffffcc", "#e5d8bd", "#fddaec"];

const readJson = (f) => JSON.parse(fs.readFileSync(path.join(RAW, f), "utf8"));

async function ms(cmd, input) {
  return mapshaper.applyCommands(cmd, input);
}

/* ------------------------------------------------------------------ */
/* Source data                                                         */
/* ------------------------------------------------------------------ */

async function shpToGeojson(dir) {
  const cache = path.join(RAW, `${dir}.geojson`);
  if (!fs.existsSync(cache)) {
    const out = await ms(`-i ${path.join(RAW, dir, dir + ".shp").replace(/\\/g, "/")} -proj wgs84 -o out.json format=geojson precision=0.000001`, {});
    fs.writeFileSync(cache, out["out.json"]);
  }
  return JSON.parse(fs.readFileSync(cache, "utf8"));
}

/** ACS table-based summary file: GEO_ID|E001|M001 -> Map(GEO_ID -> estimate). Negative values are Census jam codes (no estimate). */
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

const popAcs = acs("acs-b01003.dat");
const incomeAcs = acs("acs-b19013.dat");

const ne0 = readJson("ne_50m_admin_0_countries.geojson");
const ne1 = readJson("ne_10m_admin_1_states_provinces.geojson");
const nePlaces = readJson("ne_10m_populated_places_simple.geojson");

const usStates = await shpToGeojson("cb_2024_us_state_5m");
const usCounties = await shpToGeojson("cb_2024_us_county_500k");

/** Census places with ACS population, for the "with cities" variant of US maps. */
function censusPlaces() {
  const rows = fs.readFileSync(path.join(RAW, "2024_Gaz_place_national", "2024_Gaz_place_national.txt"), "utf8").split("\n").slice(1);
  const out = [];
  for (const r of rows) {
    const c = r.split("\t").map((s) => s.trim());
    if (c.length < 12) continue;
    const pop = popAcs.get(`1600000US${c[1]}`);
    if (!pop) continue;
    out.push({
      statefp: c[1].slice(0, 2),
      name: c[3].replace(/ (city and borough|city|town|village|borough|CDP|municipality|urban county|consolidated government \(balance\)|metropolitan government \(balance\)|unified government \(balance\)|\(balance\))$/i, "").trim(),
      pop,
      lat: Number(c[10]),
      lon: Number(c[11]),
    });
  }
  return out;
}
const usPlaces = censusPlaces();

/* ------------------------------------------------------------------ */
/* Unit features per map (WGS84), with id / name / abbr                */
/* ------------------------------------------------------------------ */

const feat = (geometry, props) => ({ type: "Feature", geometry, properties: props });

const unnamed = [];
const dupes = [];

function unitsFor(map) {
  const b = map.build;
  if (map.kind === "us-state") {
    return usCounties.features
      .filter((f) => f.properties.STATEFP === b.code)
      .map((f) => {
        const p = f.properties;
        return feat(f.geometry, {
          id: p.GEOID,
          name: p.NAMELSAD.replace(/ (County|Parish|Planning Region|City and Borough|Borough|Census Area|Municipality)$/, ""),
          full: p.NAMELSAD,
          landKm2: p.ALAND / 1e6,
          pop: popAcs.get(`0500000US${p.GEOID}`) ?? null,
          income: incomeAcs.get(`0500000US${p.GEOID}`) ?? null,
        });
      });
  }
  if (map.kind === "us") {
    const skip = new Set(["60", "66", "69", "72", "78"]);
    return usStates.features
      .filter((f) => !skip.has(f.properties.STATEFP))
      .map((f) => {
        const p = f.properties;
        return feat(f.geometry, {
          id: p.STATEFP,
          name: p.NAME,
          abbr: p.STUSPS,
          landKm2: p.ALAND / 1e6,
          pop: popAcs.get(`0400000US${p.STATEFP}`) ?? null,
          income: incomeAcs.get(`0400000US${p.STATEFP}`) ?? null,
        });
      });
  }
  if (map.kind === "world" || map.kind === "continent") {
    const want = b.continents ? new Set(b.continents) : null;
    return ne0.features
      .filter((f) => (want ? want.has(f.properties.CONTINENT) : true))
      .map((f) => {
        const p = f.properties;
        return feat(f.geometry, {
          id: p.ADM0_A3,
          name: p.NAME,
          abbr: p.ISO_A2_EH && p.ISO_A2_EH !== "-99" ? p.ISO_A2_EH : p.ADM0_A3,
          pop: p.POP_EST ?? null,
          popYear: p.POP_YEAR ?? null,
          type: p.TYPE,
        });
      });
  }
  // country: Natural Earth admin-1
  const rename = b.rename ?? {};
  const exclude = new Set(b.exclude ?? []);
  const merge = b.merge ?? {};
  const units = [];
  // name_en is the better English name, but Natural Earth gives a few pairs the same one
  // (Kyiv oblast / Kyiv city, Altai Republic / Altai Krai). For those, fall back to `name`.
  const enCount = new Map();
  for (const f of ne1.features) {
    if (f.properties.adm0_a3 === b.code && f.properties.name_en) enCount.set(f.properties.name_en, (enCount.get(f.properties.name_en) ?? 0) + 1);
  }
  for (const f of ne1.features) {
    const p = f.properties;
    if (p.adm0_a3 !== b.code) continue;
    let name = p.name_en && enCount.get(p.name_en) === 1 ? p.name_en : p.name || p.name_en;
    if (!b.dissolve && p.name_en && enCount.get(p.name_en) > 1) dupes.push(`${b.code}: ${p.name_en} -> ${name}`);
    if (b.dissolve) name = p[b.dissolve] || name;
    // A few Natural Earth admin-1 records carry no name (small islands, slivers); they cannot be labelled or listed.
    if (!name) {
      unnamed.push(`${b.code}:${p.adm1_code}`);
      continue;
    }
    if (exclude.has(name) || exclude.has(p.name) || exclude.has(p.type_en)) continue;
    name = rename[name] ?? name;
    name = merge[name] ?? name;
    units.push(feat(f.geometry, { grp: name, abbr: p.postal || null }));
  }
  return units;
}

function citiesFor(map, unitIds) {
  if (map.kind === "us-state") {
    return usPlaces
      .filter((c) => c.statefp === map.build.code)
      .sort((a, b) => b.pop - a.pop)
      .slice(0, 10);
  }
  if (map.kind === "us") {
    const skip = new Set(["60", "66", "69", "72", "78"]);
    return usPlaces.filter((c) => !skip.has(c.statefp)).sort((a, b) => b.pop - a.pop).slice(0, 25);
  }
  const all = nePlaces.features.map((f) => f.properties);
  if (map.kind === "world" || map.kind === "continent") {
    return all
      .filter((p) => p.featurecla === "Admin-0 capital" && unitIds.has(p.adm0_a3))
      .sort((a, b) => b.pop_max - a.pop_max)
      .slice(0, map.kind === "world" ? 40 : 25)
      .map((p) => ({ name: p.name, pop: p.pop_max, lat: p.latitude, lon: p.longitude, capital: true }));
  }
  return all
    .filter((p) => p.adm0_a3 === map.build.code)
    .sort((a, b) => b.pop_max - a.pop_max)
    .slice(0, 10)
    .map((p) => ({ name: p.name, pop: p.pop_max, lat: p.latitude, lon: p.longitude, capital: p.featurecla === "Admin-0 capital" }));
}

/* ------------------------------------------------------------------ */
/* Projection                                                          */
/* ------------------------------------------------------------------ */

function bboxOf(fc) {
  let w = 180, s = 90, e = -180, n = -90;
  const walk = (c) => {
    if (typeof c[0] === "number") {
      if (c[0] < w) w = c[0];
      if (c[0] > e) e = c[0];
      if (c[1] < s) s = c[1];
      if (c[1] > n) n = c[1];
    } else c.forEach(walk);
  };
  fc.features.forEach((f) => walk(f.geometry.coordinates));
  return [w, s, e, n];
}

function projFor(map, fc) {
  if (map.build.proj) return map.build.proj;
  const [w, s, e, n] = bboxOf(fc);
  let lon0 = (w + e) / 2;
  if (e - w > 180) {
    // Spans the antimeridian (Alaska's Aleutians, Fiji): centre on the eastern-hemisphere side.
    const lons = [];
    fc.features.forEach((f) => {
      const walk = (c) => (typeof c[0] === "number" ? lons.push(c[0] < 0 ? c[0] + 360 : c[0]) : c.forEach(walk));
      walk(f.geometry.coordinates);
    });
    lons.sort((a, b) => a - b);
    lon0 = lons[Math.floor(lons.length / 2)];
    if (lon0 > 180) lon0 -= 360;
  }
  const lat0 = (s + n) / 2;
  return `+proj=laea +lat_0=${lat0.toFixed(3)} +lon_0=${lon0.toFixed(3)}`;
}

/* ------------------------------------------------------------------ */
/* SVG writer                                                          */
/* ------------------------------------------------------------------ */

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function makeFit(fc) {
  const [x0, y0, x1, y1] = bboxOf(fc);
  const k = (SIZE - 2 * PAD) / Math.max(x1 - x0, y1 - y0);
  const width = Math.round((x1 - x0) * k + 2 * PAD);
  const height = Math.round((y1 - y0) * k + 2 * PAD);
  return { k, width, height, X: (x) => (x - x0) * k + PAD, Y: (y) => (y1 - y) * k + PAD };
}

function pathD(geom, fit) {
  const rings = geom.type === "Polygon" ? geom.coordinates : geom.type === "MultiPolygon" ? geom.coordinates.flat() : [];
  // Relative commands on a 0.5 px grid keep files small; at 2400 px that is invisible.
  const q = (v) => Math.round(v * 2) / 2;
  let d = "";
  for (const ring of rings) {
    let px = 0, py = 0, started = false, n = 0;
    for (const pt of ring) {
      const x = q(fit.X(pt[0])), y = q(fit.Y(pt[1]));
      if (!started) {
        d += `M${x} ${y}`;
        started = true;
      } else {
        const dx = x - px, dy = y - py;
        if (dx === 0 && dy === 0) continue;
        d += `l${dx}${dy < 0 ? "" : " "}${dy}`;
        n++;
      }
      px = x;
      py = y;
    }
    if (n >= 2) d += "z";
    else d = d.replace(/M[^M]*$/, "");
  }
  return d.replace(/ -/g, "-");
}

function pxBox(geom, fit) {
  let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity;
  const walk = (c) => {
    if (typeof c[0] === "number") {
      const x = fit.X(c[0]), y = fit.Y(c[1]);
      if (x < w) w = x;
      if (x > e) e = x;
      if (y < s) s = y;
      if (y > n) n = y;
    } else c.forEach(walk);
  };
  walk(geom.coordinates);
  return { w: e - w, h: n - s };
}

const CHAR_W = 0.58; // average glyph width / font size for the sans-serif stack used
const MIN_FONT = 10;

/** Largest font that fits the label in the shape's box. */
const fitSize = (text, box) => Math.min((box.w * 0.9) / (CHAR_W * text.length), box.h * 0.7);

function labelFor(name, abbr, box, base, allowBig) {
  let text = name;
  const room = fitSize(text, box);
  // Very large shapes (Canada on a continent map) may go up to twice the common size.
  let size = allowBig && room > 4 * base ? Math.min(room / 2.5, 2 * base) : Math.min(base, room);
  if (size < MIN_FONT && abbr) {
    text = abbr;
    size = Math.min(base, fitSize(text, box));
  }
  if (size < MIN_FONT) {
    size = MIN_FONT;
    const chars = Math.max(3, Math.floor((box.w * 0.95) / (CHAR_W * MIN_FONT)));
    if (text.length > chars) text = text.slice(0, chars - 1) + "…";
  }
  return { text, size: Math.round(size * 10) / 10 };
}

/**
 * Greedy label placement, largest place first: try the label right, left, above, below its
 * dot; drop the place if every position overlaps one already placed. Returns [x, y, name, capital, anchor].
 */
function placeCities(features, fit, font) {
  const placed = [];
  const out = [];
  const hit = (b) => placed.some((p) => b.x0 < p.x1 && b.x1 > p.x0 && b.y0 < p.y1 && b.y1 > p.y0);
  const sorted = [...features].sort((a, b) => b.properties.pop - a.properties.pop);
  for (const f of sorted) {
    const [lx, ly] = f.geometry.coordinates;
    const x = Math.round(fit.X(lx)), y = Math.round(fit.Y(ly));
    const r = Math.round(font * 0.3);
    const w = CHAR_W * font * f.properties.name.length + 4;
    const h = font * 1.1;
    const dot = { x0: x - r, x1: x + r, y0: y - r, y1: y + r };
    const options = [
      { a: "start", tx: x + r + 6, ty: y + font * 0.35, b: { x0: x + r + 4, x1: x + r + 6 + w, y0: y - h / 2, y1: y + h / 2 } },
      { a: "end", tx: x - r - 6, ty: y + font * 0.35, b: { x0: x - r - 6 - w, x1: x - r - 4, y0: y - h / 2, y1: y + h / 2 } },
      { a: "middle", tx: x, ty: y - r - 6, b: { x0: x - w / 2, x1: x + w / 2, y0: y - r - 6 - h, y1: y - r - 2 } },
      { a: "middle", tx: x, ty: y + r + font, b: { x0: x - w / 2, x1: x + w / 2, y0: y + r + 2, y1: y + r + 6 + h } },
    ];
    if (hit(dot)) continue;
    const ok = options.find((o) => o.b.x0 >= 0 && o.b.x1 <= fit.width && o.b.y0 >= 0 && o.b.y1 <= fit.height && !hit(o.b));
    if (!ok) continue;
    placed.push(dot, ok.b);
    out.push([x, y, f.properties.name, f.properties.capital ? 1 : 0, ok.a, Math.round(ok.tx), Math.round(ok.ty)]);
  }
  return out;
}

function svgDoc(fit, title, body) {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fit.width} ${fit.height}" width="${fit.width}" height="${fit.height}">` +
    `<title>${esc(title)}</title>` +
    `<rect width="100%" height="100%" fill="#ffffff"/>` +
    body +
    `</svg>\n`
  );
}

/* ------------------------------------------------------------------ */
/* One map                                                             */
/* ------------------------------------------------------------------ */

async function build(map) {
  const units = { type: "FeatureCollection", features: unitsFor(map) };
  if (units.features.length === 0) throw new Error(`${map.slug}: no units`);
  const unitIds = new Set(units.features.map((f) => f.properties.id).filter(Boolean));
  const cities = citiesFor(map, unitIds);
  const cityFc = {
    type: "FeatureCollection",
    features: cities.map((c) => feat({ type: "Point", coordinates: [c.lon, c.lat] }, { name: c.name, pop: c.pop, capital: c.capital ? 1 : 0 })),
  };

  const isCountry = map.kind === "country";
  const proj = projFor(map, units);
  // Continents: project a densified lon/lat frame with the shapes, then clip to that frame's
  // projected bounding box, so cut edges run straight along the edge of the image.
  const c = map.build.clip;
  const frame = c ? `-rectangle bbox=${c.join(",")} name=frame ` : "";
  const clip = c ? `-rectangle source=frame name=box -clip box target=units ` : "";
  // Area in km2 from the full-resolution WGS84 geometry (spherical, mapshaper's this.area), before simplification.
  const prep = isCountry
    ? `-dissolve grp copy-fields=abbr -each "id=grp, name=grp, areaKm2=this.area/1e6"`
    : `-each "areaKm2=this.area/1e6"`;
  const cmd =
    `-i units.json name=units -i cities.json name=cities ` +
    `-target units ${prep} ${frame}` +
    `-proj ${proj} densify target=* ` +
    clip +
    `-target units -simplify resolution=${SIZE}x${SIZE} keep-shapes -clean ` +
    `-classify non-adjacent colors='${PALETTE.join(",")}' save-as=fill ` +
    `-points inner + name=labels ` +
    `-target units -dissolve + name=outline ` +
    `-o target=units,labels,outline,cities format=geojson precision=0.01`;
  const out = await ms(cmd, { "units.json": units, "cities.json": cityFc });
  const g = (n) => JSON.parse(out[`${n}.json`]);
  const U = g("units"), L = g("labels"), O = g("outline"), C = out["cities.json"] ? g("cities") : { features: [] };

  const fit = makeFit(U);
  const stroke = Math.max(0.8, SIZE / 2000);
  const unitPaths = U.features.map((f, i) => ({ key: `u${i}`, id: f.properties.id, name: f.properties.name, fill: f.properties.fill, d: pathD(f.geometry, fit) }));
  const outline = (O.features ? O.features.map((f) => f.geometry) : O.geometries).map((g) => pathD(g, fit)).join("");

  // The blank SVG is the only SVG stored. The page builds the labelled, coloured and
  // with-cities versions in the browser from the overlay below, so the borders line up exactly.
  const blank = svgDoc(
    fit,
    `Blank map of ${map.name}`,
    `<g class="units" fill="none" stroke="#3a3a3a" stroke-width="${stroke}" stroke-linejoin="round">` +
      unitPaths.map((u) => `<path id="${u.key}" d="${u.d}"><title>${esc(u.name)}</title></path>`).join("") +
      `</g><path d="${outline}" fill="none" stroke="#1a1a1a" stroke-width="${(stroke * 2.2).toFixed(2)}" stroke-linejoin="round"/>`,
  );

  const byId = new Map(U.features.map((f) => [f.properties.id, f]));
  const fitted = L.features.map((f) => {
    const u = byId.get(f.properties.id);
    return { f, box: u ? pxBox(u.geometry, fit) : { w: 60, h: 20 } };
  });
  const sizes = fitted.map(({ f, box }) => fitSize(f.properties.name, box)).sort((x, y) => x - y);
  const base = Math.max(MIN_FONT + 4, Math.min(40, sizes[Math.floor(sizes.length * (sizes.length > 120 ? 0.3 : 0.5))] ?? 20));
  const labels = fitted.map(({ f, box }) => {
    const { text, size } = labelFor(f.properties.name, f.properties.abbr, box, base, fitted.length < 80);
    const [x, y] = f.geometry.coordinates;
    return [Math.round(fit.X(x)), Math.round(fit.Y(y) + size * 0.35), size, text];
  });
  const cityFont = Math.round(SIZE / 70);
  const overlay = {
    w: fit.width,
    h: fit.height,
    fills: unitPaths.map((u) => u.fill),
    labels,
    cityFont,
    cities: placeCities(C.features, fit, cityFont),
  };
  fs.writeFileSync(path.join(OUT_SVG, `${map.slug}.svg`), blank);
  fs.writeFileSync(path.join(OUT_SVG, `${map.slug}.json`), JSON.stringify(overlay));
  const bytes = { blank: Buffer.byteLength(blank), overlay: Buffer.byteLength(JSON.stringify(overlay)) };

  // Facts for the page: one row per unit, from the source files.
  const area = new Map(U.features.map((f) => [f.properties.id, f.properties.areaKm2]));
  const rows = units.features.length && !isCountry
    ? units.features.map((f) => ({
        id: f.properties.id,
        name: f.properties.name,
        full: f.properties.full ?? null,
        landKm2: f.properties.landKm2 != null ? Math.round(f.properties.landKm2) : null,
        areaKm2: area.get(f.properties.id) != null ? Math.round(area.get(f.properties.id)) : null,
        pop: f.properties.pop ?? null,
        popYear: f.properties.popYear ?? null,
        income: f.properties.income ?? null,
        type: f.properties.type ?? null,
      }))
    : U.features.map((f) => ({ id: f.properties.id, name: f.properties.name, areaKm2: Math.round(f.properties.areaKm2) }));
  rows.sort((a, b) => a.name.localeCompare(b.name));

  return {
    slug: map.slug,
    width: fit.width,
    height: fit.height,
    count: rows.length,
    rows,
    cities: cities.map((c) => ({ name: c.name, pop: c.pop, capital: !!c.capital })),
    bytes,
    projection: proj,
  };
}

const only = new Set(process.argv.slice(2));
const existing = fs.existsSync(OUT_JSON) ? JSON.parse(fs.readFileSync(OUT_JSON, "utf8")) : {};
for (const map of blankMaps) {
  if (only.size && !only.has(map.slug)) continue;
  const t = Date.now();
  const facts = await build(map);
  existing[map.slug] = facts;
  console.log(
    `${map.slug.padEnd(22)} ${String(facts.count).padStart(4)} ${map.units.padEnd(36)} ${facts.width}x${facts.height} ` +
      `blank ${(facts.bytes.blank / 1024).toFixed(0)}K  ${((Date.now() - t) / 1000).toFixed(1)}s`,
  );
}
const ordered = Object.fromEntries(blankMaps.filter((m) => existing[m.slug]).map((m) => [m.slug, existing[m.slug]]));
fs.writeFileSync(OUT_JSON, JSON.stringify(ordered));
console.log(`wrote ${Object.keys(ordered).length} maps`);
if (dupes.length) console.log(`duplicate name_en, used name: ${dupes.join("; ")}`);
if (unnamed.length) console.log(`skipped unnamed admin-1 records: ${unnamed.join(", ")}`);
