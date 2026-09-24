# Code patterns

The non-obvious mechanics. Each of these cost real time to discover.

## 1. Hedged requests, not sequential retries

Government endpoints are **erratic, not merely slow**. Measured on USDA SDA, eight identical
spatial queries in one session: `1.02s, 1.30s, 1.34s, 1.25s, 7.66s, 1.06s, 2.58s, 2.16s`.

Sequential retry is the wrong tool for that shape — a legitimate 7.7s response blows a 4s
timeout, and you then wait another 4s before trying again. **Hedge instead:** fire another
identical request while the first is in flight, take whichever returns first.

```ts
const HEDGE_DELAYS_MS = [0, 4_000, 10_000];
const OVERALL_DEADLINE_MS = 32_000;
```

Use `hedged()` / `hedgedFetchJson()` from `src/lib/hedge.ts`.

Two rules:

1. **Hedge only idempotent reads, never a write.** A POST that is really a query is fine; a POST
   that changes something is not.
2. **Surface the hedge to the user** — the `onRetry` callback drives a line under the spinner. A
   silent 8-second wait reads as a frozen page.

The losing attempts must receive the `AbortSignal`, or they keep running and waste the visitor's
bandwidth.

## 2. Resolve the key first, then query by it

A spatial function inside a multi-table join makes the server re-evaluate it per joined row. Two
steps — resolve the key, then query by that indexed key — is dramatically faster.

Generalises to any spatial-lookup-then-detail dataset, and to the fallback query too: get the
nearby keys spatially, *then* ask what those keys contain.

## 3. Never interpolate an unvalidated value into SQL

Keys come back from the service but still get concatenated into a query string. Validate the
shape first:

```ts
if (!/^\d+$/.test(key)) throw new ToolError("unavailable", "...");
```

Do this even when the value came from the same API you are querying. Numbers going into a WKT
string need `toFixed()` too, or a small value arrives in exponent notation and the query fails.

## 4. The geography ring-orientation trap

Converting polygons to SQL Server's `geography` type to get true-metre distances **silently
returns 0 for every row** — rings are not consistently wound, and a clockwise ring read as
geography means "the whole globe except this area", so the query point is inside all of them.

Use planar `STDistance` for **ordering**, scaled to approximate metres for display:

```ts
const cos = Math.cos((lat * Math.PI) / 180);
const metresPerDegree = 111_320 * Math.sqrt((1 + cos * cos) / 2);
```

Display as `~175 m` with a footnote. Honest, not falsely precise.

## 5. Rank by what the user cares about

A nearby-features list ordered by the database's natural sort is meaningless to a visitor. Rank
by distance, or by whatever the user actually means.

**Dedupe after sorting**, so the kept occurrence is the nearest one — and dedupe on the value the
user *sees*. Deduping the soil fallback by map unit key still showed "Clarion" three times,
because one series spans three map units. Deduping by name gave four distinct soils.

Also filter for significance. Near central Chicago every nearby soil series is a 1% minor
inclusion; `majcompflag = 'Yes'` correctly returns nothing, which is more honest than presenting
a 1% inclusion as the surrounding ground.

Conversely, do not filter by *name*: "Beltsville-Urban land complex" reads like a dead zone but
contains a real series with a full profile. Ask the data what it holds.

## 6. Null-handling is the default, not an edge case

Every field that can be absent is `number | null` or `string | null`, and the UI prints
`Not rated`, never `undefined`.

Detect the "nothing useful here" state **explicitly** rather than letting it render as a wall of
blanks. Prefer an empirical test — "does this record actually carry any measured value?" — over
a hardcoded list of known-bad names.

## 7. Typed errors with a `kind`

The UI must distinguish "there is genuinely no data for this input" (explain it, offer the
fallback) from "the service is down" (say so, invite a retry).

```ts
export type ErrorKind = "no-data" | "unavailable" | "bad-input";
```

Only `unavailable` gets a retry button. Offering "try again" for a point in the ocean is
misleading.

## 8. Prototype before touching React

Prove the data pipeline before building UI. A single zero-build HTML file works; so does `curl`
plus a Node script driving the real `lib/` module, which has the advantage of exercising the code
that will actually ship.

If you do use an HTML file, serve it over HTTP, not `file://` — an opaque origin breaks `fetch`.
Mark prototypes as disposable and delete them once the real pages run.

## 9. Testing without a build

Node strips TypeScript types and runs `.ts` directly, so the shipping library can be exercised
against the live service before the app builds:

```bash
node --experimental-strip-types script.mjs
```

**Avoid TS parameter properties (`constructor(readonly x: T)`) in `lib/`** — they need a
transform, not just type stripping.

Node also requires explicit extensions in relative imports, while the bundler wants them omitted.
Use a small `resolve` hook in the test harness rather than changing the shipping code.

## 10. Know what the service does when it fails

Check the failure shapes before writing the client, not after:

- **USDA SDA errors** come back as XML `<ServiceExceptionReport>` with **HTTP 200**, even when
  `format=JSON` was requested. Check for a leading `<` before parsing.
- **A no-match query** returns `{}` — no `Table` key, not an empty array.
- **Ambiguous column names** are a hard error: `muname` exists in both `mapunit` and `muaggatt`.

## 11. Check CORS on the real request, not only the preflight

A preflight can pass while the actual response is served from a cache without the header.
Nominatim sits behind Varnish whose `Vary` does not include `Origin`, so a cached copy comes back
without `Access-Control-Allow-Origin` and fails in the browser at random. Sample several times,
and prefer a provider that is consistent.
