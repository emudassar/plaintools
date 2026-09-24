import { ToolError } from "./errors";
import { hedged, type HedgeOptions } from "./hedge";
import { classifyTexture, type TextureClass } from "./texture";

/**
 * USDA NRCS Soil Data Access (SDA) client — SSURGO soil survey data.
 *
 * VERIFIED 2026-09-20 against the live service:
 *  - POST https://sdmdataaccess.sc.egov.usda.gov/Tabular/post.rest returns JSON
 *  - no API key, no quota, no registration
 *  - OPTIONS preflight returns Access-Control-Allow-Origin: *
 *    (also Allow-Methods GET,POST,OPTIONS and Allow-Headers Content-Type)
 *  - timing on 8 identical spatial queries: 1.02 / 1.30 / 1.34 / 1.25 / 7.66 /
 *    1.06 / 2.58 / 2.16 seconds. A 7.5x spread, hence hedged requests.
 *
 * GOTCHA: SDA returns errors as an XML <ServiceExceptionReport>, with HTTP 200,
 * EVEN WHEN format=JSON was requested. Never assume the body is JSON.
 * GOTCHA: a query that matches nothing returns `{}` — no `Table` key at all.
 * GOTCHA: `muname` exists in both `mapunit` and `muaggatt`; qualify it or the
 * service rejects the query as an ambiguous column name.
 */

const SDA_ENDPOINT = "https://sdmdataaccess.sc.egov.usda.gov/Tabular/post.rest";

/** Radius for the surrounding-ground fallback when a point has no soil profile. */
export const FALLBACK_RADIUS_M = 550;

export interface SoilHorizon {
  topCm: number | null;
  bottomCm: number | null;
  sandPct: number | null;
  siltPct: number | null;
  clayPct: number | null;
  ph: number | null;
  organicMatterPct: number | null;
  /** USDA's own texture label. Authoritative when present. */
  usdaTexture: string | null;
  /** Our own triangle classification. Used only when usdaTexture is absent. */
  computedTexture: TextureClass | null;
}

export interface SoilComponent {
  name: string;
  percentOfMapUnit: number | null;
  /** "Series", "Miscellaneous area", "Taxon above family", ... */
  kind: string | null;
  drainageClass: string | null;
  taxonomicClass: string | null;
  slopePct: number | null;
  septicRating: string | null;
  horizons: SoilHorizon[];
}

export interface NearbySoil {
  mukey: string;
  /** The named soil series, e.g. "Beltsville". */
  name: string;
  /** The map unit it sits in, e.g. "Beltsville-Urban land complex, 0 to 8 percent slopes". */
  mapUnitName: string;
  /** Share of that map unit, so the user can judge how representative it is. */
  percentOfMapUnit: number | null;
  /** Approximate, derived from a planar degree distance. See scaling note below. */
  approxMetres: number;
}

export interface SoilResult {
  queryLabel: string;
  lat: number;
  lon: number;
  mukey: string;
  mapUnitName: string;
  surveyArea: string | null;
  drainageClass: string | null;
  hydrologicGroup: string | null;
  floodFrequency: string | null;
  waterTableMinCm: number | null;
  bedrockDepthCm: number | null;
  farmlandClass: string | null;
  components: SoilComponent[];
  dominant: SoilComponent | null;
  /** False for Urban land, Water, fill and similar — the dead zone. */
  hasProfile: boolean;
  /** Plain-language reason the profile is missing. Null when hasProfile. */
  profileAbsentReason: string | null;
  /** Named soil mapped nearby. ONLY meaningful when hasProfile is false. */
  nearby: NearbySoil[];
  retrievedAt: string;
}

/* ------------------------------------------------------------------ */
/* Query plumbing                                                      */
/* ------------------------------------------------------------------ */

type Cell = string | null;

async function sdaQuery(sql: string, options: HedgeOptions = {}): Promise<Cell[][]> {
  const body = JSON.stringify({ format: "JSON", query: sql });

  const text = await hedged<string>(async (signal) => {
    const res = await fetch(SDA_ENDPOINT, {
      // An idempotent read despite the verb, so it is safe to hedge.
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal,
    });
    if (!res.ok) throw new Error(`SDA HTTP ${res.status}`);
    return res.text();
  }, options).catch((e) => {
    throw new ToolError(
      "unavailable",
      "The USDA soil data service did not respond. It is run by USDA NRCS and is sometimes slow or offline — please try again in a moment.",
      e instanceof Error ? e.message : String(e),
    );
  });

  // SDA reports query errors as XML with an HTTP 200. Catch that before parsing.
  if (text.trimStart().startsWith("<")) {
    const detail = /<ServiceException>([\s\S]*?)<\/ServiceException>/
      .exec(text)?.[1]
      ?.trim();
    throw new ToolError(
      "unavailable",
      "The USDA soil data service rejected the lookup. Please try again.",
      detail ?? text.slice(0, 200),
    );
  }

  let parsed: { Table?: Cell[][] };
  try {
    parsed = JSON.parse(text) as { Table?: Cell[][] };
  } catch {
    throw new ToolError(
      "unavailable",
      "The USDA soil data service returned an unreadable response. Please try again.",
      text.slice(0, 200),
    );
  }

  // No match returns `{}` with no Table key. An empty result, not an error.
  return parsed.Table ?? [];
}

const num = (v: Cell): number | null => {
  if (v === null) return null;
  const t = v.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

/** SSURGO pads some char columns ("No "). Trim, and treat blanks as null. */
const str = (v: Cell): string | null => {
  if (v === null) return null;
  const t = v.trim();
  return t === "" ? null : t;
};

/* ------------------------------------------------------------------ */
/* Distance                                                            */
/* ------------------------------------------------------------------ */

/**
 * Converts a PLANAR degree distance to approximate metres.
 *
 * WHY NOT `geography`: casting SSURGO polygons to SQL Server's `geography`
 * type to get true-metre distances silently returns 0 for every row. Polygon
 * rings are not consistently wound, and a clockwise ring read as `geography`
 * means "the whole globe except this area" — so the query point falls inside
 * all of them. We therefore order by planar STDistance and scale for DISPLAY
 * only, labelling the output "~" rather than implying precision we lack.
 */
export function degreesToApproxMetres(degrees: number, lat: number): number {
  const cos = Math.cos((lat * Math.PI) / 180);
  const metresPerDegree = 111_320 * Math.sqrt((1 + cos * cos) / 2);
  return degrees * metresPerDegree;
}

/* ------------------------------------------------------------------ */
/* Dead-zone detection                                                 */
/* ------------------------------------------------------------------ */

/**
 * A horizon row is only useful if it carries at least one measured property.
 * SSURGO happily returns rows of all-nulls.
 */
function horizonHasData(h: SoilHorizon): boolean {
  return (
    h.usdaTexture !== null || h.sandPct !== null || h.clayPct !== null || h.ph !== null
  );
}

/**
 * Explains WHY there is no soil profile, in plain language.
 *
 * Detection is empirical (does the dominant component actually carry horizon
 * data?) rather than a hardcoded list of names. `compkind` is used only to
 * explain the gap. Component kinds present in SSURGO, verified 2026-09-20:
 * Series, Taxadjunct, Family, Variant, Taxon above family, Miscellaneous area.
 */
function absentReasonFor(component: SoilComponent | null, mapUnitName: string): string {
  const name = (component?.name ?? mapUnitName).toLowerCase();

  if (name.includes("water")) {
    return "USDA maps this point as open water, so there is no soil profile to describe.";
  }
  if (name.includes("urban land")) {
    return "USDA maps this point as Urban land — ground so altered by buildings, roads and paving that surveyors could not describe a natural soil profile. No texture, pH or drainage was recorded for it.";
  }
  if (name.includes("udorthents") || name.includes("dumps") || name.includes("pits")) {
    return "USDA maps this point as disturbed or made ground: soil that has been cut, filled or excavated. The original profile was removed or buried, so no texture, pH or drainage was recorded.";
  }
  if (name.includes("rock outcrop") || name.includes("rubble")) {
    return "USDA maps this point as exposed rock or rubble, so there is no soil profile to describe.";
  }
  if (component?.kind === "Miscellaneous area") {
    return `USDA classes "${component.name}" as a miscellaneous area — land with little or no natural soil — so no texture, pH or drainage was recorded.`;
  }
  return "USDA mapped this point but recorded no soil profile for it: the survey holds no texture, pH or drainage readings for this map unit.";
}

/* ------------------------------------------------------------------ */
/* The lookup                                                          */
/* ------------------------------------------------------------------ */

/**
 * STEP 1 — resolve the map unit key for a point.
 *
 * Resolving the key FIRST and then querying by it is dramatically faster than
 * putting the spatial function inside a multi-table join, which makes the
 * server re-evaluate the intersection once per joined row.
 */
async function resolveMukey(
  lat: number,
  lon: number,
  options: HedgeOptions,
): Promise<string> {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new ToolError("bad-input", "Those coordinates are not valid.");
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw new ToolError("bad-input", "Those coordinates are outside the Earth's range.");
  }

  // Fixed precision keeps the interpolated WKT free of exponent notation.
  const wkt = `point(${lon.toFixed(6)} ${lat.toFixed(6)})`;
  const rows = await sdaQuery(
    `SELECT mukey FROM SDA_Get_Mukey_from_intersection_with_WktWgs84('${wkt}')`,
    options,
  );

  const mukey = rows[0]?.[0]?.trim();
  if (!mukey) {
    throw new ToolError(
      "no-data",
      "USDA has no soil survey coverage for that point. That normally means it falls over open water or outside the United States — the SSURGO survey only covers US land.",
    );
  }
  return mukey;
}

/**
 * Keys come back from the service but are still concatenated into a query
 * string, so validate the shape before interpolating. Never trust a value just
 * because it arrived from the same API.
 */
function assertMukey(mukey: string): void {
  if (!/^\d+$/.test(mukey)) {
    throw new ToolError(
      "unavailable",
      "The soil service returned an unexpected map unit key.",
      mukey,
    );
  }
}

/**
 * Finds named soil series mapped near a point that has none of its own.
 *
 * TWO STEPS, deliberately (see the note on resolveMukey): the spatial scan
 * returns map unit keys only, and the component lookup then runs against those
 * indexed keys. Putting the component join inside the spatial query makes the
 * server re-evaluate STDistance once per joined component row.
 *
 * We do NOT filter by map unit name. "Beltsville-Urban land complex" reads like
 * a dead zone but contains Beltsville, a real series with a full profile —
 * excluding it by name throws away the best available answer. Instead we ask
 * the database which nearby components are actual series carrying horizon data.
 */
async function fetchNearby(
  lat: number,
  lon: number,
  excludeMukey: string,
  options: HedgeOptions,
): Promise<NearbySoil[]> {
  // Convert the metre radius to degrees for the planar comparison.
  const metresPerDegree = degreesToApproxMetres(1, lat);
  const radiusDeg = FALLBACK_RADIUS_M / metresPerDegree;
  const point = `geometry::Point(${lon.toFixed(6)},${lat.toFixed(6)},4326)`;

  // STEP 1 — nearby map units and their distances, spatial work only.
  const polyRows = await sdaQuery(
    `SELECT TOP 50 p.mukey, mu.muname, p.mupolygongeo.STDistance(${point}) AS d ` +
      `FROM mupolygon p INNER JOIN mapunit mu ON p.mukey = mu.mukey ` +
      `WHERE p.mupolygongeo.STDistance(${point}) < ${radiusDeg.toFixed(8)} ` +
      `ORDER BY d`,
    options,
    // The fallback is a nicety. Never fail the whole page because it did not load.
  ).catch(() => [] as Cell[][]);

  // Rows arrive sorted by distance, so DEDUPE AFTER SORTING: the occurrence we
  // keep is then the NEAREST polygon of that map unit, not an arbitrary one.
  const byMukey = new Map<string, { mapUnitName: string; metres: number }>();
  for (const row of polyRows) {
    const mukey = str(row[0]);
    const mapUnitName = str(row[1]);
    const deg = num(row[2]);
    if (!mukey || !mapUnitName || deg === null) continue;
    if (mukey === excludeMukey) continue;
    if (byMukey.has(mukey)) continue;
    byMukey.set(mukey, { mapUnitName, metres: degreesToApproxMetres(deg, lat) });
  }
  if (byMukey.size === 0) return [];

  // Every key came from SDA, but it is still going into a query string.
  const keys = [...byMukey.keys()].filter((k) => /^\d+$/.test(k));
  if (keys.length === 0) return [];

  // STEP 2 — which of those actually hold a named series with real horizons?
  //
  // `majcompflag = 'Yes'` is USDA's own definition of a MAJOR component, and it
  // matters: near central Chicago every nearby series is a 1% minor inclusion.
  // Offering "Drummer, 1% of the map unit" as the surrounding ground would be
  // misleading, so we would rather return nothing and say so.
  const compRows = await sdaQuery(
    `SELECT c.mukey, c.compname, c.comppct_r FROM component c ` +
      `WHERE c.mukey IN (${keys.join(",")}) AND c.compkind = 'Series' ` +
      `AND c.majcompflag = 'Yes' ` +
      `AND EXISTS (SELECT 1 FROM chorizon ch WHERE ch.cokey = c.cokey ` +
      `AND ch.claytotal_r IS NOT NULL) ` +
      `ORDER BY c.comppct_r DESC`,
    options,
  ).catch(() => [] as Cell[][]);

  const candidates: NearbySoil[] = [];
  const seenMukey = new Set<string>();
  for (const row of compRows) {
    const mukey = str(row[0]);
    const name = str(row[1]);
    if (!mukey || !name) continue;
    const poly = byMukey.get(mukey);
    if (!poly) continue;
    // Rows are ordered by share, so the first hit per map unit is its dominant series.
    if (seenMukey.has(mukey)) continue;
    seenMukey.add(mukey);
    candidates.push({
      mukey,
      name,
      mapUnitName: poly.mapUnitName,
      percentOfMapUnit: num(row[2]),
      approxMetres: poly.metres,
    });
  }

  // Rank by what the user actually cares about — proximity — and only THEN
  // dedupe by series name, so the copy we keep is the nearest one. A suburban
  // point can sit beside three Clarion map units at 17m, 66m and 216m; the user
  // wants "Clarion, ~17m", not the same name listed three times.
  candidates.sort((a, b) => a.approxMetres - b.approxMetres);
  const seenName = new Set<string>();
  const out: NearbySoil[] = [];
  for (const c of candidates) {
    if (seenName.has(c.name)) continue;
    seenName.add(c.name);
    out.push(c);
    if (out.length >= 4) break;
  }
  return out;
}

export interface LookupOptions extends HedgeOptions {
  queryLabel?: string;
}

/** Full soil lookup for a point. The single entry point used by the UI. */
export async function lookupSoil(
  lat: number,
  lon: number,
  options: LookupOptions = {},
): Promise<SoilResult> {
  const { queryLabel, ...hedge } = options;

  const mukey = await resolveMukey(lat, lon, hedge);
  assertMukey(mukey);

  // STEP 2 — everything else keys off the resolved mukey, which is indexed.
  const [muRows, compRows, horizonRows, interpRows] = await Promise.all([
    sdaQuery(
      `SELECT mu.muname, l.areaname, ma.drclassdcd, ma.hydgrpdcd, ma.flodfreqdcd, ` +
        `ma.wtdepannmin, ma.brockdepmin, mu.farmlndcl ` +
        `FROM mapunit mu ` +
        `INNER JOIN muaggatt ma ON mu.mukey = ma.mukey ` +
        `INNER JOIN legend l ON mu.lkey = l.lkey ` +
        `WHERE mu.mukey = ${mukey}`,
      hedge,
    ),
    sdaQuery(
      `SELECT cokey, compname, comppct_r, compkind, drainagecl, taxclname, slope_r ` +
        `FROM component WHERE mukey = ${mukey} ORDER BY comppct_r DESC`,
      hedge,
    ),
    sdaQuery(
      `SELECT c.cokey, ch.hzdept_r, ch.hzdepb_r, ch.sandtotal_r, ch.silttotal_r, ` +
        `ch.claytotal_r, ch.ph1to1h2o_r, ch.om_r, ctg.texdesc ` +
        `FROM component c ` +
        `INNER JOIN chorizon ch ON c.cokey = ch.cokey ` +
        `LEFT OUTER JOIN chtexturegrp ctg ON ch.chkey = ctg.chkey AND ctg.rvindicator = 'Yes' ` +
        `WHERE c.mukey = ${mukey} ORDER BY c.cokey, ch.hzdept_r`,
      hedge,
    ),
    sdaQuery(
      `SELECT c.cokey, ci.interphrc FROM component c ` +
        `INNER JOIN cointerp ci ON c.cokey = ci.cokey ` +
        `WHERE c.mukey = ${mukey} AND ci.ruledepth = 0 ` +
        `AND ci.mrulename = 'ENG - Septic Tank Absorption Fields'`,
      hedge,
    ),
  ]);

  const mu = muRows[0];
  if (!mu) {
    throw new ToolError(
      "no-data",
      "USDA resolved a map unit for that point but holds no description for it.",
    );
  }

  const septicByCokey = new Map<string, string>();
  for (const row of interpRows) {
    const cokey = str(row[0]);
    const rating = str(row[1]);
    if (cokey && rating) septicByCokey.set(cokey, rating);
  }

  const horizonsByCokey = new Map<string, SoilHorizon[]>();
  for (const row of horizonRows) {
    const cokey = str(row[0]);
    if (!cokey) continue;
    const sand = num(row[3]);
    const silt = num(row[4]);
    const clay = num(row[5]);
    const horizon: SoilHorizon = {
      topCm: num(row[1]),
      bottomCm: num(row[2]),
      sandPct: sand,
      siltPct: silt,
      clayPct: clay,
      ph: num(row[6]),
      organicMatterPct: num(row[7]),
      usdaTexture: str(row[8]),
      computedTexture: classifyTexture(sand, silt, clay),
    };
    if (!horizonHasData(horizon)) continue;
    const list = horizonsByCokey.get(cokey) ?? [];
    list.push(horizon);
    horizonsByCokey.set(cokey, list);
  }

  const components: SoilComponent[] = compRows.flatMap((row) => {
    const cokey = str(row[0]);
    const name = str(row[1]);
    if (!cokey || !name) return [];
    return [
      {
        name,
        percentOfMapUnit: num(row[2]),
        kind: str(row[3]),
        drainageClass: str(row[4]),
        taxonomicClass: str(row[5]),
        slopePct: num(row[6]),
        septicRating: septicByCokey.get(cokey) ?? null,
        horizons: horizonsByCokey.get(cokey) ?? [],
      },
    ];
  });

  const dominant = components[0] ?? null;
  const hasProfile = (dominant?.horizons.length ?? 0) > 0;

  // Only pay for the spatial fallback query when the point is actually dead.
  const nearby = hasProfile ? [] : await fetchNearby(lat, lon, mukey, hedge);

  return {
    queryLabel: queryLabel ?? `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
    lat,
    lon,
    mukey,
    mapUnitName: str(mu[0]) ?? "Unnamed map unit",
    surveyArea: str(mu[1]),
    drainageClass: str(mu[2]),
    hydrologicGroup: str(mu[3]),
    floodFrequency: str(mu[4]),
    waterTableMinCm: num(mu[5]),
    bedrockDepthCm: num(mu[6]),
    farmlandClass: str(mu[7]),
    components,
    dominant,
    hasProfile,
    profileAbsentReason: hasProfile ? null : absentReasonFor(dominant, str(mu[0]) ?? ""),
    nearby,
    retrievedAt: new Date().toISOString(),
  };
}
