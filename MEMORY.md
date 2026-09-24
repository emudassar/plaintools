# MEMORY.md

**Update this at the end of every session. Use absolute dates.**

---

## Current stage

**Layer 1 — 3 tools live locally, nothing deployed, no domain registered.**

Last session: **2026-09-22** (second session that day). Tool #3 (Water Softener Size Calculator)
was researched, built and verified. It is the **first tool chosen from a deliberate niche search
rather than opportunistically** — see "The niche decision" below.

Earlier on **2026-09-22**: tool #2 (OSHA Soil Classification) was researched, built and
verified, and the **validation rule that changed how tools get picked** was established — see
"Decisions worth remembering".

Session of **2026-09-20**: the site was built from zero — stack, architecture, tool #1, all legal
and static pages, documentation and the `/add-tool` skill.

Nothing is published. There is no domain, no hosting, no analytics, no ads.

## Live tools

| Tool | Slug | Scope | Data source | Status |
|---|---|---|---|---|
| What Soil Type Is My Property? | `what-soil-type-is-my-property` | US | USDA NRCS Soil Data Access (SSURGO) | live (local only) |
| OSHA Soil Classification | `osha-soil-classification` | US | 29 CFR 1926 Subpart P, Appendix A | live (local only) |
| Water Softener Size Calculator | `water-softener-size-calculator` | US | Penn State Extension + NDSU Extension | live (local only) |

EMD candidates: `whatsoiltype.com` (tool #1), `oshasoiltype.com` (tool #2) — **neither
availability checked.** No EMD proposed for tool #3.

Categories now in use: `property` ("Home & Property"), `safety` ("Workplace & Safety"). The
`property` blurb was widened on 2026-09-22 to "a specific building or plot, or the systems that
serve it" so it could hold tool #3 without inventing a new bucket.

## Tool #2 — OSHA Soil Classification, built 2026-09-22

- **Keyword cluster** (Semrush, US database, data dated 2026-09-22 — recorded as observed):
  `osha soil types` 260/KD 25 · `type a soil osha` 170/KD 29 · `osha soil classification`
  140/KD 30 · `types of soil osha` 110/KD 35 · `what is a characteristic of type b soil`
  90/KD 19 · `osha type c soil` 70/KD 23 · `osha soil classification chart` 70/KD 23 ·
  `what is type b soil` 70/KD 13 ("Very easy"). CPC $0.00 across the cluster.
- **Why it passed the gap test:** the #1 result for `what is type b soil` is an **osha.gov PDF**
  ("Soil Classification Training Outline.pdf"). Positions 2–4 are a blog, a university safety
  page and a supplier page. **No interactive classifier ranks anywhere in the top 10.**
- **Source:** 29 CFR 1926 Subpart P read from the GPO CFR XML
  (`govinfo.gov/content/pkg/CFR-2024-title29-vol8/xml/CFR-2024-title29-vol8-part1926-subpartP.xml`,
  HTTP 200, 91,584 bytes). Every clause on the result card is **verbatim** from that file.
- **No network at runtime.** The criteria are compiled into the page, so nothing was added to
  `thirdPartyServices` and the privacy policy is unchanged and still correct.
- **Verified 2026-09-22:** 33/33 logic cases pass under `node --experimental-strip-types`,
  including the inclusive boundaries (exactly 1.5 tsf → A, exactly 0.5 tsf → C), the Type B (iii)
  exception (sand + previously disturbed stays C, is *not* promoted to B), dry vs submerged
  unstable rock, and three bad-input throws. Driven end-to-end in the browser: clay 2.0 tsf +
  fissured → Type B; sand → Type C; sand + disturbed → Type C; stable rock → Stable Rock with the
  conditional fields correctly hidden. Zero console errors. `npm run build` passes, slug guard
  passes, sitemap contains the URL, wasm-fallback count 0.
- **Dead zone handled:** a cohesive soil with no unconfined compressive strength returns a
  **range** ("Type B or Type C") plus the governing least-stable class and the measurement that
  would settle it — it never guesses. A Type C condition (seeping water, steep dip) settles the
  answer even with no strength figure, and that path is tested.
- **Not verified, deliberately:** osha.gov returns HTTP 403 to every automated request from this
  network, so OSHA's own training PDF could **not** be read. Nothing on the page cites it, and
  Appendix A (d)'s individual manual test procedures were never extracted — the page must not
  describe them as if quoting them.

## The niche decision — 2026-09-22

A niche search was run in Semrush (via the user's mirror, sr03/sr04/sr05.balochseotools.com —
**sr03 is free-tier and its 10 free requests were exhausted; sr04/sr05 are the paid session and
both throttle after ~30 bulk keywords**). The chosen niche:

**Neutral equipment-decision content for US private-well water treatment** — what equipment,
in what order, at what size. Explicitly **not** water-test interpretation.

**Why that line was drawn** (Google, US, 2026-09-22, observed):

- `how to size a water softener`, `iron filter for well water`, `water softener or iron filter
  first`, `well water filtration system` — page 1 is **100% companies selling the equipment**,
  plus Reddit. No neutral tool, no calculator, no cited method anywhere.
- `what do my well water test results mean` — page 1 is **Penn State Extension, CDC,
  wellowner.org, Colorado EPHT, Wisconsin Extension, MN Dept of Health, MSU Extension**.
  Institutions own interpretation. **Do not compete there** — it is also where the YMYL risk is.

Keyword data observed (Semrush US, 2026-09-22): `well water filtration system` 90,500/KD 26/
$3.56 · `iron filter for well water` 3,600/KD 18/$1.77 · `well pump size calculator` 590/KD 3/
$0.85 · `water softener size calculator` 590/KD 15/$1.67 · `well water treatment system`
590/KD 32/**$5.30** · `how to get rid of sulfur smell in well water` 590/KD 37/$1.15 ·
`well pressure tank sizing` 210/KD 8/$0.19 · `water softener sizing calculator` 140/KD 9/$1.35 ·
`iron filter vs water softener` 40/KD 0/$1.82. Pool sizes (broad match): `water softener`
8.38M/mo over 89.0K keywords, `well pump` 2.66M/mo over 98.3K, `well water` 2.33M/mo over 90.0K.

**Benchmark, measured:** `waterfilterguru.com` — AS 51, 219.3K organic traffic/mo, 22.2K organic
keywords, **3,000 referring domains**, 12.4K backlinks, trend **−3%**, and only **329 URLs**
(293 posts + 36 pages, counted from its sitemap). Links, not page count, are the cost of the top
of this niche. `homewater101.com` holds page 1 for `how to size a water softener` on **62 URLs**
total, and `midatlanticwater.net` — a regional Maryland dealer — ranks nationally on 244 blog
posts. The field is content-poor, not authority-rich.

**Rejected, with reasons — do not re-propose from metrics alone:**

- **Compact tractor / implement compatibility.** Genuinely weak SERPs and real demand
  (`tractordata` 14,800/mo navigational, KD 15, $3.02). Killed on monetization: `tractor tire
  size chart` 480/KD 11/**$0.00**, `category 1 3 point hitch dimensions` 140/KD 6/**$0.00**,
  `skid steer quick attach dimensions` 140/KD 3/**$0.00**. Advertisers do not bid on it.
- **Welding filler metal** — `welding rod chart` 590/KD 19/**$0.18**, and YouTube owns it.
- **Boat propeller sizing** — `prop slip calculator` 1,000/KD 12/$0.00, `boat propeller size
  calculator` 70/KD 27/$0.11. Too small.
- **`well pump size calculator` as an entry tool** — KD 3 and still rejected. Page 1 already has
  eight working calculators (toolgrit, calcengineer, Dultmeier, Flint & Walling, Atlas Copco,
  Grundfos, RPS, scwellservice). The 2026-09-22 rule caught it.
- **`water hardness by zip code` as the wedge** — already has dedicated tools including an EMD
  (`waterhardnessbyzip.com`) plus several vendor tools. Crowded.

**Data sources checked live 2026-09-22, results worth keeping:**

- **Water Quality Portal** (waterqualitydata.us, EPA/USGS/NWQMC) — HTTP 200, no key. Iowa well
  stations 3.05 MB CSV; hardness for one county 78 KB. **But iron results in Iowa wells since
  2010 = only 650 rows.** Coverage supports a county/aquifer layer, **not** an address-level
  lookup like the soil tool. Do not plan one.
- **NSF certified drinking water treatment units listing** — `info.nsf.org/Certified/DWTU/`
  returns HTTP 200 and is public. Lets the site state what a product is certified for **without
  owning or testing one**. NSF's JSON API returned **403**; WQA's product finder **301**s. Both
  need follow-up before programmatic use.
- `waterservices.usgs.gov` NWIS site service returned **503** — may be transient, recheck.
- Affiliate program pages: `uswatersystems.com/pages/affiliate-program` **200**;
  `springwellwater.com/affiliate-program/` **403** (blocked, unknown);
  `discountwatersofteners.com/affiliate-program` **404**. **No commission rate is known.**

**Ad-network thresholds, read from the official pages 2026-09-22:** Journey by Mediavine needs
1,000 Tier-1 sessions in 30 days; full Mediavine qualifies on $5,000 annual ad revenue; Raptive
needs 25,000 monthly pageviews, and 100,000 for its RPM-guarantee offer. **No RPM figure for
this vertical is published by either network** — any revenue number is an assumption.

## Tool #3 — Water Softener Size Calculator, built 2026-09-22

- **Slug/keyword:** `water-softener-size-calculator` (590/mo, KD 15, CPC $1.67).
- **Method source:** Penn State Extension, "Water Softening" — their own worked example is the
  whole calculation: *"75 gallons (10 gpg) x 4 = 3,000 grains per day used … 20,000/3,000 =
  about 6-7 day regeneration"*. Also supplies the gpg↔17 mg/L conversion, the five-band Table 1
  classification, sodium at 7.5 mg/quart per gpg removed, and ~50 gallons per regeneration.
  NDSU Extension, "Water Softening (Ion Exchange)" supplies the iron/manganese 10 ppm sentence
  and the septic note. Both retrieved 2026-09-22, both HTTP 200, text quoted verbatim.
- **No network at runtime.** Figures compiled in, so `thirdPartyServices` is unchanged and the
  generated privacy policy is still correct (verified: the built policy still lists exactly
  USDA SDA and Photon, nothing else).
- **Cross-check: the implementation reproduces Penn State's published example exactly** —
  3,000 grains/day and 6.67 days for their inputs. That is the independent reference.
- **Verified 2026-09-22:** 42/42 logic cases passed under `node --experimental-strip-types`,
  including every Table 1 boundary (0.99→Soft, 1.0→Slightly hard, 3.5/3.51, 7.0/7.01,
  10.5/10.51), the mg/L↔gpg round trip, zero hardness, metered-demand override, the iron
  thresholds and nine bad-input throws. Driven end-to-end in the browser with real clicks and
  typing: happy path 3,000 grains/day + 6.67 days; 170 mg/L produced the identical answer to
  10 gpg; 9 ppm iron + 2 ppm manganese triggered the over-limit panel with both NDSU sentences;
  0.5 gpg produced the Soft panel; 200 in the gpg box produced the unit-confusion error.
  `npm run build` passes, slug guard passes, sitemap contains the URL, 6 JSON-LD blocks all
  valid with HowTo steps=6 and FAQPage questions=8 matching the rendered page, one H1, wasm
  count 0.
- **Deliberately NOT implemented: the iron-to-hardness compensation multiplier.** Vendor pages
  add 4 or 5 gpg per ppm of iron, they disagree, and **no citable source for either was found**.
  Iron is reported against NDSU's sentence instead. If a citable source turns up, this is the
  one upgrade the tool is waiting for.
- **NDSU's "up to 10 ppm of iron and manganese" does not say whether the limit is each or
  combined.** The page adds them (stricter reading) and displays the ambiguity, same pattern as
  the OSHA tool's silty-clay-loam note.
- **75 gallons/person/day is Penn State's figure**, used in their example, shown as an editable
  default and attributed. It is *not* presented as a national average; EPA WaterSense was never
  read.

## Done

- **Stack**: Next.js 15.5.25, React 19.3.0, TypeScript 5.9.3, Tailwind 4.3.3. Static export
  (`output: "export"`, `trailingSlash: true`). Dev on port 3100. `npm run build` passes clean.
- **Architecture**: one registry entry in `src/config/tools.ts` wires a tool into the homepage
  grid, tools index, nav dropdown, footer, related-tool blocks and sitemap. `src/config/site.ts`
  is the single rebrand point. Both verified by inspection — no second registration site exists.
- **Build-time slug guard** in `tools.ts`. Tested against 6 invalid slugs (filler word ×2,
  duplicate, bad shape, trailing hyphen, over-length) — all throw. Valid slug passes.
- **`requireTool(slug)`** added so a tool page fails the build if its registry entry is missing.
- **Privacy policy is generated** from `thirdPartyServices` in `site.ts`. Two services listed:
  USDA NRCS Soil Data Access and Photon.
- **Pages**: home, `/tools/`, `/about/`, the tool page, privacy policy, terms of use, disclaimer,
  `robots.ts`, `sitemap.ts`. All 9 routes return 200 on the dev server and in the static export.
- **Sitewide copy is subject-neutral.** Home, nav, footer and About contain nothing about soil.
- **Documentation**: `CLAUDE.md` (with a Gotchas section), `README.md`, `TOOL-PIPELINE.md`,
  `research/_TEMPLATE.md`, `prototype/README.md`, and
  `.claude/skills/add-tool/` with `SKILL.md` + `references/content-rules.md` +
  `references/code-patterns.md`.

### Verified against live services on 2026-09-20

- **USDA SDA**: JSON, no key, no quota, `Access-Control-Allow-Origin: *` on preflight.
- **Timing**: 8 identical spatial queries — 1.02 / 1.30 / 1.34 / 1.25 / 7.66 / 1.06 / 2.58 /
  2.16 s. A 7.5× spread; this is why the client hedges instead of retrying.
- **Texture cross-check**: own triangle vs USDA's `texdesc` over **4,000 real horizons** →
  **96.92% agreement**; **all 123 disagreements lie within 2 percentage points of a class
  boundary, none away from one.** The implementation is correct; the residual is because
  `texdesc` is field-assigned while the percentages are separately aggregated.
- **Browser end-to-end, dev server**: an Iowa address returned Downs silt loam, Johnson County,
  90% Downs, well drained, group C, slope 7%, surface 3/74/23 at pH 6.0. **Re-queried USDA
  independently for the same coordinates and every field matched exactly**, including map unit
  key 407952.
- **Coordinate-paste + reverse geocoding in the browser**: `33.45, -90.65` resolved to
  "Court Avenue, Indianola, Mississippi" and returned Dubbs very fine sandy loam, Sunflower
  County, group B, flooding Rare — matching the earlier Node run exactly.
- **Dead zone in the browser**: 1600 Pennsylvania Ave returned Udorthents with no profile, the
  "Why this is blank" explanation, the fields USDA still records, and Beltsville ~70 m away
  labelled as surrounding ground.
- **Ocean (30, −45) in the browser**: typed `no-data` error, correct message, no crash, no
  console errors, and correctly **no** retry button (only `unavailable` offers one).
- **Nav dropdown**: click opens, Escape closes, click-away closes, hover opens — all confirmed
  by driving real DOM events.
- **Structured data**: 6 JSON-LD blocks, all valid JSON, and the counts match the rendered page
  (HowTo 6 steps, FAQPage 8 questions, one H1).

## Not done / blocked / needs a human

- **Legal pages need review by a lawyer.** All three are drafts and say so on the page itself.
- **`jurisdiction` in `src/config/site.ts` is still the placeholder `[YOUR COUNTRY / STATE]`.**
  It renders visibly on the legal pages. Set it before launch.
- **No domain registered.** `PlainTools` / `plaintools.com` are placeholders throughout. Renaming
  after indexing is expensive, so decide before publishing.
- **Layer 2 (programmatic) and Layer 3 (studies) not started.** The architecture supports them.
- **Search volume and KD now exist for the water cluster and the rejected niches** (Semrush,
  US, 2026-09-22 — see "The niche decision"), recorded exactly as observed. **No RPM, revenue,
  commission rate, conversion rate or traffic projection exists for anything**, and none has
  been estimated. Do not let a later session invent these. Semrush organic-traffic figures for
  competitor domains are Semrush's estimates, not measured traffic.
- **`whatsoiltype.com` availability not checked.**
- **Only tested in the built-in browser** at 1280×900. No cross-browser or real-device testing.
- **Screenshots could not be captured** during verification (the pane timed out rendering);
  verification was done via page text, the accessibility tree and DOM inspection instead.

### Known behaviour worth remembering, not bugs

- **`step` on a number input silently blocks form submission.** Tool #3 shipped briefly with
  `step="1000"` and `min="1"` on the rated-capacity field. HTML5 anchors steps to `min`, so
  20000 was invalid against 1 + 1000n, and the browser **silently refused to submit** — no
  console error, no visible message, the click just did nothing. Cost real time on 2026-09-22
  because the handler, the state and the logic were all fine. **Use `step="any"` on any number
  input that accepts arbitrary values**, and reserve `step="1"` for genuine integer fields whose
  `min` is 0 or 1. Symptom to recognise: calling the React `onSubmit` prop directly works, a
  real click does not.
- **The user's Chrome has an extension that injects `bis_skin_checked` / `bis_register`
  attributes**, which produces a loud React hydration-mismatch error on every page. It is the
  extension, not the app — the built-in browser shows no such error. Do not chase it.

- **`npm run build` while `npm run dev` is running breaks the dev server.** Both share `.next`,
  so the build rewrites the chunks underneath the running server and every route then returns
  *Internal Server Error* with `Cannot find module './124.js'` / `Cannot read properties of
  undefined (reading '/_app')`. Cost time on 2026-09-22 before it was recognised. **Nothing is
  wrong with the code** — restart the dev server. Build with dev stopped where possible.
- **`read_page` silently truncates.** During 2026-09-22 verification it reported 4 checkboxes,
  then 2 on an identical page, and never listed the second `<select>` or the submit button.
  Querying the real DOM showed all controls present and correctly labelled. **Trust the DOM over
  the accessibility-tree dump** when a control looks missing.

- **Photon geocoding is fuzzy.** "2110 Burlington Ave, Ames, Iowa" resolved to a Burlington
  Street in *Iowa City*. This is why the matched address is displayed prominently at the top of
  the result card — the user can see where it actually landed. Do not remove that.
- **Hovering the Tools button then clicking it closes the menu**, because hover opens and click
  toggles. Standard menu-button behaviour, left as-is deliberately.
- **USDA has no nearby named soil for some city centres** (Chicago Loop, Atlanta tested). The
  tool says so rather than offering a 1%-share inclusion. That is intended.

## Decisions worth remembering

- **Pick tools by SERP weakness, not by keyword difficulty.** Established 2026-09-22 after KD
  alone pointed at two tools that should not be built. Low KD on a commodity utility usually
  reflects **low commercial value, not an opening** — the incumbents are just old and unglamorous.
  The signal that matters is: *is the authoritative source unusable, and does no working tool
  rank?* An osha.gov PDF at #1 with no classifier in the top 10 is a real gap. Three polished
  free tools in the top 4 is not, whatever the KD says.
- **Rejected 2026-09-22, with reasons — do not revisit from metrics alone:**
  - **`halfway between two places`** (720 US / 1.8K global, KD 23 "Easy"). SERP: whatshalfway.com
    #1 (120 countries, venue filters, meeting planner, journey planner), travelmath.com #2
    (AS 72, 222.7K backlinks), meetways.com #3 (travel mode, POI search, directions, reviews),
    splitthedistance.com #4 (sells search credits). Three mature free tools, each doing *more*
    than a midpoint calculation. Fails "existing options are genuinely poor".
  - **`flood zone by address`** (5.4K, KD 56). `hazards.fema.gov` and `msc.fema.gov` both return
    HTTP 000 (connection refused) from this network — in curl **and** in a real Chrome browser,
    with photon.komoot.io returning 200 as a control. The source cannot be verified from here, so
    it cannot be shipped from here. Recheck the block before reconsidering.
  - **`as the crow flies distance`** (2.4K, KD 17). gps-coordinates.net #1 (AS 54, 127.2K
    backlinks) and freemaptools.com #2 (AS 51) hold the top with working tools; average top-10
    AS 54, *higher* than the halfway SERP. Penetrable but not weak.
- **Photon, not Nominatim, for geocoding.** Nominatim sits behind a Varnish cache whose `Vary`
  does not include `Origin`, so a cached copy can be served **without**
  `Access-Control-Allow-Origin` and fail in the browser at random — observed directly on
  2026-09-20. Photon was consistent across every sample, does forward *and* reverse, and keeps
  the privacy policy down to one geocoder.
- **USDA's own `texdesc` is shown as authoritative**, and the calculated class is used only when
  no label exists. USDA's label carries particle-size modifiers ("Very fine sandy loam") that a
  triangle cannot produce from percentages.
- **Dead-zone detection is empirical**, not a hardcoded name list: does the dominant component
  actually carry horizon data? `compkind` is used only to word the explanation.
- **The nearby-soil fallback filters on `majcompflag = 'Yes'`**, not on map unit name. Filtering
  by name would have discarded "Beltsville-Urban land complex", which contains a real series.
- **Dedupe the fallback by series name, after sorting by distance.** Deduping by map unit key
  showed "Clarion" three times in a Des Moines suburb.
- **TypeScript must stay on 5.x.** TypeScript 7.0.2 (the native preview) has no `main` entry and
  no `parseJsonConfigFileContent`, so Next 15 silently fails to read `tsconfig.json` and every
  `@/*` import breaks with a confusing "module not found". This cost real time — do not "upgrade".
- **`baseUrl: "."` is required** in `tsconfig.json` for the `@/*` paths to resolve.
- **npm on this machine is very slow and overlapping installs corrupt `node_modules`.** One
  install took 31 minutes. Killing one mid-extraction left `next` incomplete and the swc binary
  truncated; separately, a backgrounded install that finished late **pruned the native
  `@next/swc-win32-x64-msvc` that a later install had already placed**, silently downgrading
  builds to wasm after they had been verified. Both were found and repaired on 2026-09-20 — the
  final state has native swc (build logs zero wasm warnings). After any interrupted install,
  verify integrity explicitly; see the Gotchas section in `CLAUDE.md` for the exact checks.

## Next 3–5 actions

1. **Decide the real name and register the domain**, then update `name` / `domain` / `url` in
   `src/config/site.ts`. Do this *before* anything is indexed.
2. **Set `jurisdiction`** in `src/config/site.ts` and get the three legal pages reviewed.
3. **Deploy the static export** (`out/`) and submit the sitemap to Search Console. This is now
   the blocking action: tool #3 exists specifically to test whether the water niche is rankable,
   and that question cannot be answered without real query data. The test is whether a single
   page with no links reaches impressions and page-2 positions on `water softener size
   calculator` within about 90 days.
4. **Then decide on the niche**, from Search Console rather than from the SERP read. If tool #3
   gains traction, the next tools are the rest of the equipment-decision cluster (iron filter
   vs softener, treatment order, pressure tank sizing). If it flatlines, the niche cost one tool
   instead of a year.
5. **Prototype Layer 2** off the existing pipeline — one page per named soil series, each with
   its genuinely distinct official description. Only if each page carries real distinct data.
