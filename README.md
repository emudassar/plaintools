# PlainTools

> Free tools that each do one job.

A hub of small, free, single-purpose web tools. The hub has no subject: a tool belongs here if
people genuinely need the answer, the answer can be produced accurately from a free citable
source, and the existing options are weak.

`PlainTools` is a placeholder name, deliberately subject-neutral. A name tied to one topic boxes
the hub in by tool number three, and renaming after indexing is expensive. Change it in
`src/config/site.ts` — that one file rebrands the whole site.

---

## The strategy

Build one hub with many small tools. Each targets one exact-match keyword and answers one
mechanical question from free data. Watch which tools actually pull traffic. Whichever wins gets
**graduated** onto its own exact-match domain. The hub is a cheap testbed; the EMD is the capture
vehicle once a keyword proves itself. You only need one site to start.

## The three layers

| Layer | What it is | Status |
|---|---|---|
| **1 — Tools** | 40–70 pages, one per exact-match keyword, titled the way people type it. Navigational-utility queries: the searcher is typing the name of a tool they want to use. | **1 of 40–70 built** |
| **2 — Programmatic** | Hundreds to thousands of pages from the same data pipeline that powers the tools. A scripting job, not a writing job. This is where the traffic curve bends. | Not started — structure supports it |
| **3 — Studies** | 3–5 original pieces published with a downloadable CSV under CC-BY, engineered to be cited. A named finding, per-state breakdowns, a permanent citation block. | Not started |

All three are required. Layer 1 is being built now; the code is structured so 2 and 3 are
possible without rework.

**Layer 2 is legitimate only when each page carries genuinely distinct data.** One page per named
soil series with its own official description is real. One page per "soil type in \[city]" with
the same text and a swapped name is a doorway page. The distinction is not negotiable.

## The graduation rule

Do not register a second domain on a hunch. A tool graduates only when **all four** hold:

1. It has held meaningful organic traffic for 60+ days (not a spike).
2. Its head keyword has real, repeatable volume — confirmed in Search Console, not a keyword tool.
3. The exact-match domain is actually available.
4. You can fill a whole site around it: 10+ related tools, plus a programmatic layer.

Until then every new tool goes on the hub. The hub is the cheap place to be wrong.

---

## Status

| Tool | Slug | Scope | Data source | Status |
|---|---|---|---|---|
| What Soil Type Is My Property? | `what-soil-type-is-my-property` | US | USDA NRCS Soil Data Access (SSURGO) | **live** |

EMD candidate for tool #1: `whatsoiltype.com` — **availability not checked**.

### Before launch

- [x] Set `jurisdiction` in `src/config/site.ts` (Pakistan)
- [ ] Have the three legal pages reviewed — they are drafts, not legal advice
- [x] Register a domain and update `name` / `domain` / `url` in `src/config/site.ts` (`plaintools.site`)
- [ ] Check the EMD candidate's availability

---

## Verified, not assumed

Everything in this section was actually measured against the live services on **2026-09-20**.
Nothing here is estimated.

**USDA Soil Data Access**

- Returns JSON from `POST https://sdmdataaccess.sc.egov.usda.gov/Tabular/post.rest`. Confirmed.
- No API key, no registration, no quota encountered.
- `OPTIONS` preflight returns `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods:
  GET,POST,OPTIONS`, `Access-Control-Allow-Headers: Content-Type`. Client-side use is viable.
- **Timing, 8 identical spatial queries:** 1.02, 1.30, 1.34, 1.25, 7.66, 1.06, 2.58, 2.16 seconds
  — a 7.5× spread. This is why the client hedges rather than retries.
- Errors are returned as XML `<ServiceExceptionReport>` with HTTP 200, even when `format=JSON`
  was requested. A no-match query returns `{}` with no `Table` key.

**Geocoding**

- Photon (`photon.komoot.io`) is keyless and returned `Access-Control-Allow-Origin: *` on every
  sampled request, forward and reverse.
- Nominatim returned **no** `Access-Control-Allow-Origin` header on one sampled request — a
  Varnish cache HIT whose `Vary` does not include `Origin`. It sent the header on 6/6 subsequent
  samples, so the failure is intermittent rather than constant. Photon is used instead, which
  also removes one service from the privacy policy.

**Texture classification cross-check**

The texture triangle in `src/lib/texture.ts` was implemented independently from the USDA
definitions, then compared against USDA's own `texdesc` label on **4,000 real SSURGO horizons**:

- **96.92% agreement** (3,877 of 4,000). 123 disagreements.
- **All 123 disagreements fall within 2 percentage points of a class boundary. Zero disagree
  away from a boundary.**

That pattern indicates the implementation is correct rather than buggy: SSURGO's `texdesc` is
assigned in the field by a soil scientist, while the sand/silt/clay figures are a separately
aggregated representative estimate, so the two land on opposite sides of a boundary in edge
cases. USDA's own label is therefore shown as authoritative, and the calculated class is used
only where no label exists.

USDA's label also carries particle-size modifiers the triangle cannot produce — "Very fine sandy
loam" where the percentages give "Sandy loam", "Fine sand" where they give "Sand". The base class
agrees in both observed cases; the modifier is extra information, not a conflict.

**Dead-zone behaviour, tested at real coordinates**

| Location | Result |
|---|---|
| Iowa farm (41.75, −93.75) | Nicollet loam, pH 6.2, water table 50 cm, septic *Very limited*, prime farmland |
| Mississippi Delta (33.45, −90.65) | Dubbs very fine sandy loam, well drained, septic *Somewhat limited* |
| Florida (27.95, −81.80) | Apopka fine sand, 95.7% sand |
| Urban DC (38.8976, −77.0365) | Udorthents — **no profile**; falls back to Beltsville ~76 m away |
| Chicago Loop (41.8827, −87.6233) | Urban land — **no profile**, and no major series nearby; says so |
| Atlanta (33.755, −84.39) | Urban land — **no profile**, no nearby series; says so |
| Des Moines suburb (41.6005, −93.6091) | Urban land — **no profile**; falls back to Clarion ~17 m away |
| Ocean (30, −45) | Typed `no-data` error in 276 ms — no crash |

Four of the five urban points return no soil profile, confirming that **the urban dead zone is
the normal result for most people's homes, not an edge case.**

### Not verified — deliberately not estimated

- **Search volume, keyword difficulty, traffic, RPM or revenue for any keyword.** No data was
  available and none has been guessed.
- **Competitor depth.** No competing site was analysed.
- **EMD availability.** `whatsoiltype.com` was not checked.
- **Cross-browser rendering.** Verified in the built-in browser only.
- **Whether the legal pages are adequate.** They are drafts and need a lawyer.

---

## Development

```bash
npm run dev        # http://localhost:3100
npm run build      # static export to out/ — runs the slug guard
npm run typecheck
```

See `CLAUDE.md` for the architecture rules and a Gotchas section, `TOOL-PIPELINE.md` for how a
new tool gets built, and `MEMORY.md` for current state.
