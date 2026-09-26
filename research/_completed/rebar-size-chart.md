# Tool research: rebar size chart

Researched 2026-09-26. Keyword data from Semrush (US database, live account, observed
2026-09-26, pulled via the user's authenticated Chrome session). Anything not verified is listed
in section 10 and must not appear as fact on the page.

---

## 1. The keyword

- **Exact search phrase:** `rebar size chart`
- **Proposed slug:** `rebar-size-chart`
- **Proposed H1 / name:** Rebar Size Chart
- **Tagline:** Pick a bar size (#3–#11) and get its diameter, cross-sectional area and weight per
  foot in both US customary and metric units, from a state DOT's published reinforcement table.
- **Category:** existing `construction` ("Construction & DIY") — added this session for the roof
  pitch calculator; a rebar reference is squarely the same bucket.
- **Scope:** US (bar numbers #3–#11 are the US customary system; metric equivalents are shown
  alongside, sourced from the same table)
- **EMD candidate:** none proposed yet

**Keyword data (Semrush, US database, observed 2026-09-26):**

| Keyword | Volume | KD | Intent | CPC |
|---|---|---|---|---|
| rebar size chart | 2,900 | 5 | Informational | $0.91 |
| rebar diameter chart | 2,400 | 6 | Informational | $0.91 |
| steel rebar sizes | 2,400 | 32 | Informational | $0.48 |
| rebar sizes | 3,600 | 22 | Informational | $0.48 |
| rebar dimensions | 1,600 | 23 | Informational | $0.48 |
| rebar sizes chart | 1,300 | 11 | Informational | $1.01 |
| rebar size table | 1,300 | 6 | Informational | $1.01 |
| 4 rebar diameter | 1,300 | 22 | Informational | $1.46 |
| rebar size | 1,000 | 21 | Informational | $0.58 |
| steel rebar size chart | 880 | 15 | Informational | $0.91 |
| rebar weight chart | 880 | 22 | Informational | $0.00 |
| rebar diameter | 590 | 22 | Informational | $0.00 |
| sizes of rebar | 590 | 13 | Informational | $0.48 |
| rebar chart | 590 | 14 | Informational | $0.00 |
| rebar sizing | 480 | 16 | Informational | $0.58 |
| rebar thickness | 480 | 28 | Informational | $1.07 |
| 3 rebar size | 480 | 9 | Informational | $0.00 |
| rebar chart size | 260 | 11 | Informational | $1.01 |
| rebar chart sizes | 260 | 8 | Informational | $0.91 |
| what size is #4 rebar | 260 | 5 | Informational | $0.00 |
| what size is #5 rebar | 170 | 10 | Informational | $0.00 |
| standard rebar sizes | 140 | 12 | Informational | $0.00 |

The full "rebar size" topic in Semrush's Keyword Magic Tool holds 118,500 keyword variants
(19.06M combined monthly volume, average KD 24%). Almost the entire long tail is the same
question asked about a specific bar number — "what size is #4 rebar," "diameter of #8 rebar,"
"number 6 rebar diameter," "9 rebar size" — dozens of these at KD 0–15. **This is exactly the
one-question-many-phrasings shape** the hub's near-duplicate rule exists for: one interactive
chart covering bars #3–#11, selectable by number, answers all of them without a page per bar
size. `rebar size chart` itself is the highest-volume, lowest-difficulty head term in the set.

## 2. The question this answers

Given a US rebar bar number, what is its nominal diameter, cross-sectional area and weight per
foot, in both US customary and metric units?

## 3. Why the existing options are poor

**Google, US, checked earlier in this session for `rebar size chart` — every result is a small
commercial steel-supplier or fabricator site, no government, standards-body or reference
publisher anywhere on page 1:**

1. harrissupplysolutions.com — a steel supplier's blog page
2. steelworld.uk — a UK steel supplier (wrong country/standard for a US search)
3. camblinsteel.com — a steel service company's page
4. field-pm.com — a construction-management SaaS's reference page
5. pinterest.com — a pin board, not a source
6. reinforcing-bar.com — single-purpose supplier domain, "customized sizes according to your
   requirements," i.e. a sales page with a chart attached
7. upstaterebar.com — a supplier's PDF spec sheet
8. lbiw.com (Long Beach Iron Works) — a fabricator's resource page

**Not one of the eight is a citable, checkable source** — every page is commercial, several are
selling rebar directly, and none names where its numbers come from. The actual bar-number system
is defined by ASTM A615/A706, which is a paywalled standard, but the same physical dimensions are
republished verbatim in numerous free state Department of Transportation specifications, because
every US highway agency needs the table to write bridge and pavement specs. **That free,
government-published version of the same table is what's missing from the SERP.**

- Buy signals observed:
  - [x] Every ranking result is a small commercial site with no named, checkable source
  - [x] Several results are themselves sales pages for the product the chart describes — a
        structural conflict of interest for anyone relying on the numbers to spec real work
  - [ ] Forum threads — not prominent in top 10 for the head term
  - [ ] Third-party "how to use the official tool" — n/a, no official interactive tool exists
- Walk-away signals checked:
  - [ ] Funded SaaS with a pricing page ranking top 5 — **no**
  - [ ] Entrenched high-authority site holding every long-tail term — **no**; the field is
        exclusively small commercial sites
  - [ ] Paid licence needed for the data — **the ASTM standard itself is paywalled**, but the
        same dimensions are freely published by state DOTs (Section 4) — no licence needed for
        the figures actually used here
- **Duplicates an existing tool?** No. Nothing else on the hub covers reinforcing steel.

## 4. The data source

Not an API — a published reference table, same pattern as the septic tank tool.

- **Name and publisher:** Illinois Department of Transportation, Standard 001001-02, "Areas of
  Reinforcement Bars — English (Metric)," issued 1-1-97, most recently revised and approved
  1-1-2009.
- **Endpoint or file:**
  https://idot.illinois.gov/content/dam/soi/en/web/idot/documents/doing-business/standards/highway-standards/pdf/226-001001-02_areasofreinfrebars.pdf
- **Licence / terms URL:** public Illinois state government publication, freely distributed as a
  highway design standard
- **API key needed?** No — nothing is fetched at runtime
- **Quota or rate limit:** n/a

### Verification — actual commands and output, 2026-09-26

```bash
curl -s -L -A "Mozilla/5.0" \
  "https://idot.illinois.gov/content/dam/soi/en/web/idot/documents/doing-business/standards/highway-standards/pdf/226-001001-02_areasofreinfrebars.pdf" \
  -o idot_rebar.pdf -w "HTTP %{http_code} bytes %{size_download}\n"
# → HTTP 200 bytes 227833

pdftotext -layout idot_rebar.pdf idot_rebar.txt
# table is real text (unlike the septic and roof-pitch source tables), but the multi-column
# spacing layout garbled column alignment on extraction — cross-checked by rendering the page
# to a 250 dpi PNG (PyMuPDF) and reading the bar size / diameter / area / weight columns
# directly from the image, then confirmed against the raw text extraction. Both agree exactly.
```

A second state DOT source was located and would serve as a cross-check (Texas DOT, Item 440,
"Table 1. Size, Area, and Weight of Reinforcing Steel Bars") but **ftp.txdot.gov and
plans.txdot.gov both failed to load from this network** — a similar block to the one already
documented for osha.gov in this repo's Gotchas. The IDOT table alone is used; its values are
internally consistent with the ASTM-derived area formula (see below), which serves as the actual
cross-check.

**Verbatim, IDOT Standard 001001-02, retrieved 2026-09-26 (bar sizes #3–#11 — the table does not
cover #14 or #18, so this tool does not either):**

| Bar size | Diameter (in) | Diameter (mm) | Area (sq in) | Area (sq mm) | Weight (lb/ft) | Weight (kg/m) |
|---|---|---|---|---|---|---|
| 3 | 0.375 | 9.5 | 0.110 | 71 | 0.376 | 0.560 |
| 4 | 0.500 | 12.7 | 0.196 | 129 | 0.668 | 0.944 |
| 5 | 0.625 | 15.9 | 0.307 | 199 | 1.043 | 1.552 |
| 6 | 0.750 | 19.1 | 0.442 | 284 | 1.502 | 2.235 |
| 7 | 0.875 | 22.2 | 0.601 | 387 | 2.044 | 3.042 |
| 8 | 1.000 | 25.4 | 0.785 | 510 | 2.670 | 3.973 |
| 9 | 1.128 | 28.7 | 1.000 | 645 | 3.400 | 5.060 |
| 10 | 1.270 | 32.3 | 1.267 | 819 | 4.303 | 6.404 |
| 11 | 1.410 | 35.8 | 1.561 | 1006 | 5.313 | 7.907 |

**Cross-check against geometry:** nominal area = π/4 × diameter². For bar #8: π/4 × 1.000² =
0.7854, matching the table's 0.785 to three decimals. For bar #4: π/4 × 0.500² = 0.1963, matching
0.196. This confirms the table's diameters and areas are mutually consistent (the numbers are not
independently sourced typos), and it's why this tool computes area/weight for display precision
directly from the table's own diameter using the same relationship, rather than risking a
transcription error re-typing nine rows of area figures by hand — **the weight-per-foot figures
are used exactly as published, not recomputed**, since a computed steel-density figure would be
this tool's own number, not the cited table's.

## 5. It is a lookup (plus simple arithmetic), not an API

The core answer is a **lookup**: pick a bar size, get its row. The only calculation is
multiplying the table's own weight-per-foot figure by a user-entered length, which is arithmetic
on a cited figure, not a new formula:

```
total weight (lb) = weight per foot (lb/ft, from table) × length (ft)
```

**Worked example, by hand:** 20 feet of #5 rebar: 1.043 lb/ft × 20 ft = 20.86 lb.

**Checked against which independent reference?** The table was read twice — once via
`pdftotext`, once via a rendered page image — and the two independently extracted readings agree
on every cell. The area column was additionally checked against the diameter column via
π/4 × d² for all nine rows (Section 4), which is the geometric cross-check available for a table
lookup with no second independent publisher reachable from this network (see the TxDOT note
above).

## 6. The dead zone

| Input that fails | What happens | How common |
|---|---|---|
| A bar size outside #3–#11 (e.g. #14, #18) | The IDOT table doesn't cover it — no number to give | Uncommon in typical residential/light-commercial work, real in heavy structural work |
| Zero or negative length entered for the weight calculation | No physical meaning | Rare but reachable |
| A metric bar designation (e.g. "16M") entered expecting a lookup | This tool is keyed to US bar numbers 3–11 only, not soft-metric designations | Uncommon for the target keyword's phrasing, which is overwhelmingly US bar-number based |

- **How the fallback explains the gap in plain language:** selecting a size outside the table's
  range isn't possible in the first place — the tool offers only the nine sizes IDOT's table
  actually publishes, rather than accepting free-text input that could silently miss a size. This
  is the honest choice for a pure lookup, matching the roof pitch tool's principle of not
  guessing past a table's stated range.
- **What the source still records when the main answer is missing:** n/a — there is no "missing"
  case within the offered range; the dead zone is entirely about staying honest at the table's
  edges (bars #14/#18 simply aren't offered as options).
- **The weight calculator's zero/negative guard** rejects non-positive lengths outright with a
  plain message, rather than showing a negative or zero weight.

## 7. The output

- **Headline:** the selected bar's diameter, e.g. "#5 — 0.625 in (15.9 mm) diameter."
- **Supporting detail:** cross-sectional area and weight per foot in both unit systems; the full
  nine-row table for comparison; an optional total-weight figure when a length is entered.
- **Source + retrieval date shown on the result card:** yes — Illinois DOT Standard 001001-02,
  retrieved 2026-09-26, linking to the source PDF.

## 8. Content notes

- **10 uses** — to be written on the page, each specific (e.g. "Checking a supplier's invoice
  line against the published weight per foot before accepting a delivery," "Converting a metric
  spec drawing's bar callout into the US bar number a US supplier stocks," "Estimating total
  steel weight for a small footing pour from a known length of #4 bar," "Settling what '#5 rebar'
  actually measures across two different fabricators' documentation").
- **Data section must cover:** that the actual naming/dimension standard is ASTM A615/A706, which
  is paywalled, and that this table is a free state DOT republication of the same dimensions used
  for highway design — not this hub's own measurement or testing; that the table only covers
  bars #3–#11; that a specific project's actual required grade, tolerance and bend requirements
  come from the project's own specification and ASTM A615/A706 itself, not from this page.
- **6–8 FAQs**, including "is this the same as ASTM A615?" (same dimensions, different — free —
  publisher), "why does #9 have an oddly specific diameter (1.128 in)?" (bar numbering above #8
  is based on equivalent round-bar area, not a clean fraction — worth a plain-language line),
  "does this cover metric rebar?" (no, US bar numbers 3–11 only), "why do #14 and #18 not appear?"
  (outside the cited table's range).

## 9. Privacy

- **New third-party service the visitor's browser will contact?** **No.** The table is compiled
  into the page; nothing is fetched at runtime. `thirdPartyServices` in `site.ts` is unchanged.

## 10. Open questions / what is still unverified

- **TxDOT's Item 440 table (a second state DOT source) could not be read** — both
  `ftp.txdot.gov` and `plans.txdot.gov` failed to load from this network, the same failure shape
  already documented for `osha.gov` in this repo's Gotchas. The IDOT table stands alone, with the
  π/4×d² geometric relationship as the available cross-check (Section 4). If TxDOT's table
  becomes reachable later, comparing it against IDOT's would be a good follow-up, though the
  two are very unlikely to disagree since both ultimately republish the same ASTM dimensions.
- **Bar sizes #14 and #18 are not covered** because IDOT's table stops at #11. The tool does not
  offer them rather than inventing figures for them.
- **The bar-number-to-diameter assignment itself is defined by ASTM A615/A706**, which this
  research did not read directly (paywalled). The page must attribute the *numbering system's
  existence* to ASTM without claiming to have read or quoted the ASTM document itself — only the
  IDOT republication was actually read.
