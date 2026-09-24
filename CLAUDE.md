# CLAUDE.md — project instructions

## What this is

A hub of small, free, single-purpose web tools. **The hub has no subject.** A tool belongs here if:

1. people genuinely need the answer,
2. the answer can be produced accurately from a free, citable source, and
3. the existing options are weak.

Tool #2 may have nothing to do with tool #1. That is the model working, not a problem.

**The one hard consequence:** sitewide copy is subject-neutral **by rule**. The homepage, nav,
footer and About page must still read correctly after a completely unrelated tool is added.
Subject-specific writing lives on that tool's own page and nowhere else.

The hub is a cheap testbed. When one tool proves itself, it graduates onto its own exact-match
domain — see the graduation rule in `README.md`.

## Stack

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4. Static export, no server.
Dev port **3100**.

```bash
npm run dev        # http://localhost:3100
npm run build      # static export to out/ — also runs the slug guard
npm run typecheck  # tsc --noEmit
```

**Do not add a dependency until something actually imports it.**

## Layout

```
src/config/site.ts     ← THE rebrand file. Also thirdPartyServices → generates the privacy policy.
src/config/tools.ts    ← THE registry. One entry wires up everything.
src/lib/               data clients and calculation logic, framework-free
src/components/        SiteHeader, ToolPageLayout (+ToolCard), Schema, LegalPage, <Name>Tool
src/app/               routes
.claude/skills/add-tool/   the automated tool-build procedure
research/              drop tool research here, then run /add-tool
prototype/             disposable
```

## The two rules that keep the architecture honest

1. **Adding one entry to `src/config/tools.ts` wires a tool into the homepage grid, the tools
   index, the nav dropdown, the footer, related-tool blocks and the sitemap.** There is no second
   place to register a tool. If you find yourself editing a second file to add a tool, the
   architecture is wrong — fix it rather than working around it.

2. **Changing `name`/`domain`/`url` in `src/config/site.ts` rebrands the whole site** — titles,
   schema, sitemap, robots, footer, canonicals. No other file may contain the name or domain as a
   literal.

## Hard rules

1. **Never give advice.** Report what the source says or what the formula gives, and cite it.
   "USDA rates this map unit *Very limited* for septic absorption fields" is a fact.
   "You can't build here" is advice, and it is the sentence that gets a site sued.
2. **Cite the source on the result itself**, with a retrieval date — not just in the footer.
3. **Never fabricate** a source, endpoint, formula, statistic, test result, credential or
   experience. If you did not run it, do not say you ran it.
4. **The tool renders before any prose.** Nobody reads the intro.
5. **One tool = one keyword.** If it answers two questions, it is two tools and two pages.
6. **Never rename a slug after indexing.** The slug is the keyword.
7. **No near-duplicate pages** for keyword variations, locations or input permutations.
8. **Never make sitewide copy about one subject.**

Plus: if a slug fails the build-time guard in `tools.ts`, **fix the slug — never weaken the
guard**. And any tool calling a new third-party service **must** add it to `thirdPartyServices`
in `site.ts`, or the privacy policy becomes factually wrong.

## Adding a tool

Put research in `research/`, then follow `.claude/skills/add-tool/SKILL.md` (the manual version
is `TOOL-PIPELINE.md`). Build order: registry (`status: "planned"`) → `lib/` → component → page →
verify → flip to `"live"`.

## Gotchas

These cost real time to discover. They are all verified against the live services, 2026-09-20.

**USDA Soil Data Access**

- **Errors come back as XML, with HTTP 200, even when `format=JSON` was requested.** The body is
  a `<ServiceExceptionReport>`. Never call `res.json()` without checking for a leading `<` first.
- **A query matching nothing returns `{}`** — no `Table` key at all, not an empty array.
- **`muname` exists in both `mapunit` and `muaggatt`.** An unqualified reference is rejected as an
  ambiguous column name. Qualify every column in a join.
- **Response times are erratic, not merely slow.** Eight identical spatial queries measured
  1.02 / 1.30 / 1.34 / 1.25 / 7.66 / 1.06 / 2.58 / 2.16 seconds. Use the hedged-request helper in
  `lib/hedge.ts`, never a sequential retry.
- **Put the spatial function in its own query.** Resolve the map unit key first, then query by
  that indexed key. A spatial function inside a multi-table join is re-evaluated per joined row.
- **`STDistance` returns degrees, not metres.** Casting to `geography` to fix that silently
  returns 0 for every row, because SSURGO ring winding is inconsistent and a clockwise ring read
  as `geography` means "the whole globe except this area". Order by planar distance and scale for
  display only — `degreesToApproxMetres()` in `lib/soil.ts`.
- **The same map unit appears as multiple polygons.** Sort by distance, then dedupe, so the row
  you keep is the nearest one. Dedupe by the *name the user sees*, not by the key.
- **`majcompflag` matters.** Near central Chicago every nearby series is a 1% minor inclusion.
  Filtering to major components returns nothing there — which is the honest answer, and better
  than presenting a 1% inclusion as the surrounding ground.
- **Do not filter nearby map units by name.** "Beltsville-Urban land complex" reads like a dead
  zone but contains Beltsville, a real series with a full profile. Ask the database which
  components are series carrying horizon data instead.

**Geocoding**

- **Nominatim's CORS header is not reliable.** It sits behind a Varnish cache whose `Vary` does
  not include `Origin`, so a cached copy can come back *without*
  `Access-Control-Allow-Origin` and fail in the browser at random. Observed directly. Photon was
  consistent across every sample and does both forward and reverse — use Photon.

**Tooling**

- **Node runs the `lib/*.ts` files directly** (`--experimental-strip-types`), so a data client can
  be exercised against the live service before the app builds. **Avoid TS parameter properties
  (`constructor(readonly x: T)`) in `lib/`** — they need a transform, not just type stripping.
  Node also needs explicit extensions in relative imports; the test harness uses a small resolve
  hook rather than changing the shipping code.
- **npm on this machine is extremely slow** (a single package's metadata took >25 s). One install
  took 31 minutes. That is the network, not a broken install.
- **Never leave two `npm install` runs overlapping, and never kill one mid-extraction.** Both
  happened here and both did damage:
  - A killed install left `next` partially extracted (`Cannot find module './render-server'`) and
    a truncated swc binary (`not a valid Win32 application`). Windows then held locks on the
    files for a while; `cmd //c rmdir /s /q` succeeded on a second attempt once they released.
  - A *backgrounded* install that finished 31 minutes later **pruned packages a later foreground
    install had already placed**, silently removing `@next/swc-win32-x64-msvc` after the build had
    been verified. Symptom: builds still pass but fall back to wasm, with an
    `Attempted to load @next/swc-win32-x64-msvc` warning and much slower compiles.
  - After any interrupted install, check integrity explicitly rather than trusting exit code 0:
    ```bash
    ls node_modules/next/dist/server/lib/render-server.js
    ls node_modules/@next/swc-win32-x64-msvc/*.node
    npm run build 2>&1 | grep -ci "wasm\|Attempted to load @next/swc"   # want 0
    ```
  - Also clear abandoned downloads in `%LOCALAPPDATA%\next-swc\*.temp-*`, which block re-fetching.
