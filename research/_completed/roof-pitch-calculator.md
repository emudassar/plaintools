# Tool research: roof pitch calculator

Researched 2026-09-26. Keyword data from Semrush (US database, live account, observed
2026-09-26). Anything not verified is listed in section 10 and must not appear as fact on the
page.

---

## 1. The keyword

- **Exact search phrase:** `roof pitch calculator`
- **Proposed slug:** `roof-pitch-calculator`
- **Proposed H1 / name:** Roof Pitch Calculator
- **Tagline:** Enter the rise and run (or the angle) and get the pitch as x-in-12, the angle in
  degrees, the slope percentage and the rafter length — plus what the IRC allows a roof at that
  slope to be covered with.
- **Category:** new — `property` doesn't fit a construction-measurement tool well. Proposing
  `construction` ("Construction & DIY" — measurements, framing and material questions with a
  concrete numeric or code answer). Broad enough to hold future tools (concrete, lumber, framing).
- **Scope:** US (the x-in-12 convention and the cited code are both US; degrees/percent are
  universal so worldwide visitors still get a correct answer, just without the IRC panel meaning
  anything to them — this is disclosed, not hidden)
- **EMD candidate:** none proposed yet

**Keyword data (Semrush, US database, observed 2026-09-26):**

| Keyword | Volume | KD | Intent | CPC |
|---|---|---|---|---|
| roof pitch calculator | 14,800 | 23 | Informational | $2.12 |
| roof slope calculator | 5,400 | 31 | Informational | $2.12 |
| figure roof pitch calculator | 1,600 | 31 | Informational | $2.14 |
| pitch calculator | 1,600 | 22 | Informational (too broad — ambiguous with music pitch, not targeted) | $1.92 |
| roof slope calculator online | 720 | 17 | Informational | $0.00 |
| shed roof pitch calculator | 390 | 17 | Informational | $1.61 |
| shed roof rise calculator | 320 | 19 | Informational | $0.00 |
| roof angle calculator | 320 | 32 | Informational | $2.00 |
| pitch calculator roof | 320 | 21 | Informational | $2.12 |
| how to figure roof pitch calculator | 320 | 44 | Informational | $0.53 |
| roof calculator pitch | 210 | 22 | Informational | $2.12 |
| roof pitch calculator app | 210 | 50 | Informational (wants a phone app, not a page — not this tool) | $1.36 |
| lean to roof pitch calculator | 210 | 16 | Informational | $1.88 |
| online roof pitch calculator | 260 | 26 | Informational | $0.00 |
| how to measure roof pitch calculator | 260 | 19 | Informational | $0.99 |
| roof pitch to angle calculator | 140 | 16 | Informational | $2.12 |
| roof pitch calculator chart | 140 | 43 | Informational | $2.97 |
| roof rise calculator | 140 | 19 | Commercial | $2.91 |
| roof height calculator | 140 | 15 | Informational | $2.30 |
| 4 12 pitch roof calculator | 140 | 23 | Informational | $1.86 |
| roof pitch formula | 210 | 15 | Informational | $2.30 |
| roof pitch angle chart | 170 | 13 | Informational | $0.97 |
| roof angle calculator (generic) | 320 | 32 | Informational | $2.00 |
| pergola roof slope calculator | 90 | 14 | Informational | $0.00 |

The full "roof pitch" topic in Semrush's Keyword Magic Tool holds 80,200 keyword variants
(4.19M combined monthly volume, average KD 19%), and the narrower "roof pitch calculator" topic
holds 111,200 variants (4.78M combined volume, average KD 22%). The distribution is one broad
head term plus hundreds of low-volume phrasing variants of the **same three questions**: what is
my pitch, what angle is that, how long is the rafter — expressed with every combination of
"roof/roofing", "pitch/slope/angle", "calculator/calc/estimator/finder", and building type
(shed/lean-to/pergola/porch). **This is one tool, not several** — the rule against near-duplicate
pages for keyword variations applies directly: a single page that accepts rise+run OR an angle
and clearly states it works for any roof (including sheds, lean-tos and pergolas) captures this
whole cluster without a page per phrasing.

## 2. The question this answers

Given two roof measurements (rise and run, or an angle), what is the pitch as x-in-12, the angle
in degrees, the slope as a percentage, the rafter length — and what does the IRC say about which
roof coverings are allowed at that slope?

## 3. Why the existing options are poor

**Google, US, checked 2026-09-26 for `roof pitch calculator` — every result is a small,
uncredentialed calculator site, with no government, standards-body or major-publisher page
anywhere on page 1:**

1. omnicalculator.com — general-purpose calculator aggregator (construction is one of ~40
   categories it covers)
2. roofpitch-calculator.com — single-purpose domain, no named author, no cited source for its
   pitch-category thresholds
3. roofsnap.com — roof-estimation software company's resource page
4. mycarpentry.com — hobbyist carpentry site
5. ls-usa.com — a roofing-products manufacturer's marketing page with a calculator bolted on
6. thecivilcity.com — civil-engineering content site, uncredentialed
7. rapidtakeoffsandestimating.com.au — an Australian estimating firm (wrong country for a US
   visitor, since the code citation below is US-specific)
8. kuretruss.com.au — an Australian truss manufacturer

None of these eight cite an actual building code for what a calculated pitch means in practice.
Several state pitch-category thresholds ("flat roofs are 1/2:12 to 2:12", "conventional pitch is
4:12 to 9:12") without attributing them to anything, and the thresholds are not fully consistent
between sites. **Not one of them answers the question a visitor who just calculated their pitch
actually has next: is this slope even allowed for the roofing material they have or want?** That
answer exists, it's free, and it's a matter of public code text (Section 4 below) — it is simply
missing from every page that currently ranks.

- Buy signals observed:
  - [x] Every ranking result is a small, single-purpose or hobbyist site — no authoritative
        source has claimed this query
  - [x] The pitch-category thresholds ("low/conventional/steep") are restated across sites with
        no citation and minor disagreement between them, which is what uncited copying looks like
  - [ ] Forum threads — not observed in top 10 for the head term
  - [ ] Third-party "how to use the official tool" posts — n/a, there is no official tool
- Walk-away signals checked:
  - [ ] Funded SaaS with a pricing page ranking top 5 — **no**; RoofSnap's page is a free
        resource page, not a gated product page
  - [ ] Entrenched high-authority site holding every long-tail term — **no**; the field is
        exclusively small calculator and hobbyist sites
  - [ ] Paid licence needed for the data — **no**; the formula is geometry and the code citation
        (Section 4) is freely published by ICC
- **Duplicates an existing tool?** No. The hub's other property tool (soil type) and the
  water-softener calculator are unrelated systems.

## 4. The data source

Two parts: a calculation (rise/run trigonometry — universal, no citation needed for the maths
itself) plus a citable reference table (the IRC's minimum roof slope per covering material, which
is the actual value-add this page has that nothing else ranking does).

- **Name and publisher:** 2021 International Residential Code (IRC), Chapter 9 "Roof
  Assemblies", published by the International Code Council (ICC)
- **Endpoint or file:** https://codes.iccsafe.org/content/IRC2021P1/chapter-9-roof-assemblies
  (ICC's free public-access reading portal — no login, no paywall, no API; text is read once and
  compiled into the page, the same pattern as the water-softener tool citing Penn State Extension)
- **Licence / terms URL:** https://www.iccsafe.org/about/policies-and-procedures/terms-of-use/ —
  ICC's free-access portal is intended for exactly this kind of reading and citing; the page links
  back to the source rather than reproducing the full code text
- **API key needed?** No — nothing is fetched at runtime, same as the water-softener tool
- **Quota or rate limit:** n/a

### Verification — read directly, 2026-09-26

```
GET https://codes.iccsafe.org/content/IRC2021P1/chapter-9-roof-assemblies
→ HTTP 200, full chapter text rendered (client-side; read via browser, not curl — ICC's
  reader is a JS application, confirmed by fetching the page and reading the rendered text)
```

Not applicable: **the page makes no request to ICC or anywhere else at runtime.** The minimum-slope
figures below are compiled into the page exactly as the OSHA tool compiles in clause text and the
water-softener tool compiles in Penn State's figures.

**Verbatim minimum slopes, read from IRC 2021 Chapter 9, Section R905, 2026-09-26:**

| Covering | Code section | Minimum slope | Note |
|---|---|---|---|
| Mineral-surfaced roll roofing | R905.5.2 | 1:12 (8% slope) | — |
| Built-up roofs | R905.9.1 | 1/4:12 (2% slope); 1/8:12 (1%) for coal-tar | design slope for drainage |
| Asphalt shingles | R905.2.2 | 2:12 (17% slope) | 2:12 up to <4:12 requires double underlayment |
| Clay and concrete tile | R905.3.2 | 2½:12 (25% slope — IRC states this specific fraction as 25%) | 2½:12 up to <4:12 requires double underlayment |
| Metal roof shingles | R905.4.2 | 3:12 (25% slope) | — |
| Wood shingles | R905.7.2 | 3:12 (25% slope) | — |
| Wood shakes | R905.8.2 | 3:12 (25% slope) | — |
| Metal roof panels — standing-seam systems | R905.10.2(3) | 1/4:12 (2% slope) | — |
| Metal roof panels — lapped, non-soldered seam, with lap sealant | R905.10.2(2) | 1/2:12 (4% slope) | Sealant applied per manufacturer's instructions |
| Metal roof panels — lapped, non-soldered seam, no lap sealant | R905.10.2(1) | 3:12 (25% slope) | — |
| Slate shingles | R905.6.2 | 4:12 (33% slope) | — |

Also verbatim, R905.2.6: "Where the roof slope exceeds 21 units vertical in 12 units horizontal
(21:12, 175-percent slope), shingles shall be installed in accordance with the manufacturer's
approved installation instructions" — used as the page's upper-end note for asphalt shingles.

## 5. It is a calculation, not an API

**Formula — standard right-triangle trigonometry, the same relationship every construction
reference and Omni Calculator's own published roof pitch calculator use:**

```
pitch (as a fraction)   = rise / run
slope percent           = (rise / run) × 100
angle in degrees        = atan(rise / run), converted from radians
pitch as x-in-12        = (rise / run) × 12
rafter length           = √(rise² + run²)          (Pythagorean theorem)
```

**Where documented:** this is elementary trigonometry (tangent of the roof angle equals opposite
over adjacent) applied to the standard US construction convention of measuring pitch against a
12-inch run — not something that requires a citation for the maths itself, per the same
reasoning the soil tool's texture triangle math and this project's OSHA/water-softener tools use
for their own arithmetic. The x-in-12 convention itself is standard US residential-construction
usage reflected throughout IRC Chapter 9 (every slope in Section 4 above is stated in that form
by the code itself), which is the citation for the *convention*, not the trigonometry.

**Worked example, by hand, cross-checked against Omni Calculator's own published example**
(https://www.omnicalculator.com/construction/roof-pitch, read 2026-09-26 — used only as an
independent cross-check, not as this page's source):

```
run = 6 m, rise = 1.5 m
rafter = √(1.5² + 6²) = √(2.25 + 36) = √38.25 = 6.18 m
pitch  = 1.5 / 6 = 0.25 = 25%
angle  = atan(0.25) = 14.04° ≈ 14°
x:12   = 0.25 × 12 = 3, i.e. 3:12
```

Omni's published result: rafter 6.18 m, pitch 25%, angle 14°, ratio 3:12. **The implementation
must reproduce all four figures for these inputs — that is the cross-check.**

**Second worked example, classic construction numbers, checked by hand:**

```
run = 12 in, rise = 6 in
rafter = √(6² + 12²) = √180 = 13.416 in
pitch  = 6/12 = 50%
angle  = atan(0.5) = 26.565°
x:12   = 6, i.e. 6:12
```

## 6. The dead zone

| Input that fails | What happens | How common |
|---|---|---|
| Run = 0 | Division by zero — pitch and x:12 are undefined; angle is 90° (a vertical wall, not a roof) | Rare but reachable by typo |
| Rise = 0 | Pitch is 0, angle is 0°, x:12 is 0:12 — a genuinely flat roof, not an error | Common for low-slope/flat-roof questions |
| Negative rise or run | Not a physical roof measurement | Rare, but must be rejected with a clear message rather than silently producing a negative angle |
| Rise and run in different units (e.g. rise in inches, run in feet) | Silently wrong answer, off by a factor of 12 | **The most likely real mistake** — same class of error as the water-softener tool's gpg/mg-L mix-up |
| Angle input ≥ 90° or ≤ 0° when entering by angle instead of rise/run | Undefined or nonsensical pitch | Rare, but must be rejected |
| Slope steeper than 21:12 (175%) | IRC still has something to say (R905.2.6, manufacturer's instructions govern) rather than the normal table row | Uncommon in residential work, common for A-frame / decorative structures |
| A material row in the IRC table with no exact match to the calculated slope (falls between two thresholds) | The page must show every material the slope clears, not just the nearest one | Normal case, not an edge case — most pitches fall inside more than one material's allowed range |

- **How the fallback explains the gap in plain language:** run = 0 or negative inputs produce a
  named error ("Enter a run greater than zero — a horizontal distance of zero has no defined
  pitch") rather than `Infinity` or `NaN` rendered to the page.
- **What the source still records when the main answer is missing:** n/a for the geometry (it
  either computes or is rejected outright); for the IRC panel, a pitch below every material's
  minimum (e.g. under 1:12) still shows the full table with every row marked "not allowed at this
  slope" rather than an empty section.
- **Unit-confusion guard:** rise and run are collected with an explicit, shared unit selector
  (inches, feet, or millimetres/metres) rather than two free-text boxes, which removes the
  water-softener-style mixed-unit failure mode at the input stage instead of trying to detect it
  after the fact.

## 7. The output

- **Headline:** the pitch as x-in-12 (the form the US construction trade actually uses), e.g.
  "6:12".
- **Supporting detail:** angle in degrees, slope as a percentage, rafter length (given a run), a
  plain-language pitch category (flat/low/conventional/steep, each with its own threshold stated
  and attributed to where it came from — the IRC slope table where applicable, not an uncited
  "low/medium/steep" label), and the IRC minimum-slope-by-material panel showing which common
  roof coverings that slope qualifies for, each linked to its code section.
- **Source + retrieval date shown on the result card:** yes — IRC 2021, Chapter 9, retrieved
  2026-09-26, linking to the ICC reader page. The trigonometry itself is stated as "geometry, not
  a cited figure" rather than attributed to the code.

## 8. Content notes

- **10 uses** — to be written on the page, each a specific person with a specific consequence
  (e.g. "Checking whether a shed roof at 2:12 can actually take asphalt shingles before buying
  them", "Working out the rafter length for a lean-to before ordering lumber", "Settling a
  disagreement with a contractor's quoted pitch before signing", "Checking a steep A-frame cabin
  roof against the point where the IRC requires manufacturer's special installation instructions
  rather than standard shingle nailing").
- **Data section must cover:** that the geometry is universal trigonometry, not a citation; that
  the minimum-slope table is IRC 2021 Chapter 9 and is a **model code** that individual
  jurisdictions may adopt with amendments (so a local building department can require something
  stricter — the page must say this plainly); that it does not know the visitor's actual local
  amendments, wind zone, snow load or manufacturer's specific product requirements, all of which
  can move the real minimum above the IRC baseline.
- **6–8 FAQs**, including "is 4:12 the same as 33%?" (no — the percent/degree relationship is not
  linear, worth showing why), "can I use this instead of my local building department?" (no —
  local amendments), "why does the same roof show as allowed for one material and not another?".

## 9. Privacy

- **New third-party service the visitor's browser will contact?** **No.** Nothing is fetched;
  the arithmetic runs in the browser and the IRC table is compiled into the page at build time,
  exactly like the water-softener tool. `thirdPartyServices` in `src/config/site.ts` is unchanged.

## 10. Open questions / what is still unverified

- **The IRC is a model code.** Actual required minimums can be higher where a local jurisdiction
  has amended it, and manufacturer installation instructions can also impose a stricter minimum
  than the code floor. The page must say this rather than imply the IRC number is the final word
  everywhere.
- **No claim is made about non-US roofing conventions** (metric pitch-in-degrees is common
  outside the US) beyond providing the angle and percent, which are unit-agnostic.
