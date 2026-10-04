# Tool research: propane tank expiration date

Researched 2026-10-04 (Semrush via the sr04 mirror in the user's Chrome, Semrush SERP Analysis for the
Google US top 10, Bing for intitle checks, source read from eCFR). Built 2026-10-04.


> **BUILT 2026-10-04. Correction found while building:** section 4 below quotes "12 years after the
> original test date and at seven (7) year intervals". That is §180.209(**j**), which covers cylinders
> used as **fire extinguishers**, not propane. The tool uses §180.209(**e**) and (**g**): first
> requalification 12 years after manufacture, then +12 (plain date, volumetric expansion), +10 ("S",
> proof pressure) or +5 ("E", external visual). Marks per §180.213(f)(1), (f)(4), (f)(5). Text current as
> of 2026-10-01 (the 2026-08-04 amendment, 91 FR 49357, only changed 3A/3AA bundles in (b)).
> PHMSA's leaflet (`propane_en_v3.pdf`, read in Chrome, curl gets 403) says 10 / 10 / 10 / 5. That
> predates **85 FR 68790** (effective 2020-11-30, NPGA petition), which set today's 12-year periods.
> The page explains this discrepancy.

---

## 1. The keyword

- **Exact search phrase:** `propane tank expiration date`
- **Proposed slug:** `propane-tank-expiration-date`
- **Proposed H1 / name:** When Does My Propane Tank Expire?
- **Tagline:** Enter the date stamped on your cylinder's collar (and any requalification marks) and get
  the date it next needs requalifying under 49 CFR 180.209.
- **Category:** `safety` (existing). Decide at build time whether `property` reads better.
- **Scope:** US (DOT cylinders). Canada uses TC marks. Out of scope, and the page should say so.

### Semrush, US, observed 2026-10-04

| Keyword | Volume | KD | CPC |
|---|---|---|---|
| propane tank recertification | 5,400 | 14 | $3.23 |
| propane tank expiration date | 720 | **9** | $0.00 |
| expiration date on a propane tank | 720 | 7 | |
| expiration propane tank date | 590 | 8 | |
| expiration date on propane tank | 390 | 7 | |
| expiration date for propane tank | 320 | 5 | |
| propane tank date code | 260 | 11 | $0.00 |
| how to read propane tank date | 170 | **1** | $0.00 |

- "propane tank expiration date" family: **107 variations, 4.6K/mo total**, plus 42 questions
  ("where is the expiration date on a propane tank", 90/KD 4, and similar).
- "propane tank recertification" family: **424 variations, 14.4K/mo**. Its head term is mostly
  "near me" / transactional, so the page targets the *when* questions and not the head term.

## 2. The question this answers

My propane cylinder is stamped with a date. When does it next need requalifying (recertifying)?

## 3. Why the existing options are poor

- **Google US top 10 for `propane tank expiration date`** (Semrush SERP Analysis, 2026-10-04,
  AI Overview present): **#1 Reddit** (r/YouShouldKnow, 0 referring domains), ferrellgas blog (9 RD),
  fosterfuels blog (11 RD), cynch.com (1 RD), **propane.ca PDF fact sheet**, bluerhino FAQ, a
  **Facebook video**, amerigas blog. **No calculator or checker on page 1.** Every page except the PDF
  belongs to a company that sells propane or swaps tanks.
- **`propane tank recertification`** top 10: amerigas, ferrellgas, a **Facebook group post**,
  cynch, a local fuel dealer, **phmsa.dot.gov PDF** (`propane_en_v3.pdf`), a dealer service page,
  a **cruisersforum thread**, paracogas, a local ice-and-fuel shop. No tool.
- **Bing intitle check:** only two small calculator pages exist anywhere (littlecalcs.com
  "Propane Tank Recertification Date Calculator", bbqmath.com). Neither is in Google's top 10.
- **Buy signals:**
  - [x] An official PDF (PHMSA) ranks, plus a Canadian association PDF. People need the rule decoded.
  - [x] A Reddit thread is #1 and a forum thread and Facebook group rank. People ask each other.
  - [x] The rule has three paths (12-year water-jacket, 7-year proof pressure, 5-year visual "E"), so
        reading the stamp is genuinely confusing.
- **Walk-away signals:** no SaaS, no high-authority site holding the long tail, source is free gov text.
- **Duplicate on the hub?** No.

## 4. The data source

- **Name and publisher:** 49 CFR 180.209, "Requirements for requalification of specification
  cylinders", US DOT / PHMSA, published on eCFR
- **Endpoint (used for verification only):**
  `https://www.ecfr.gov/api/versioner/v1/full/2026-09-01/title-49.xml?part=180&section=180.209`
  → **HTTP 200, 6,324 bytes** (needs `--compressed`; without it eCFR returns 406 "requires response
  compression")
- **Licence:** US federal regulation, public domain
- **Network at runtime:** none. Rules compile into the page, so `thirdPartyServices` is unchanged.

### Verified, quoted from the eCFR text (2026-10-04)

- "A requalification must be performed by the end of 12 years after the original test date and at
  12-year intervals thereafter" (water-jacket / direct expansion).
- "For the proof-pressure test, a requalification must be performed by the end of 12 years after the
  original test date and at seven (7) y[ear intervals]…"
- External visual inspection instead of hydrostatic test: "subsequent inspections are required at
  five-year intervals after the first inspection."

**Not yet read in detail:** the exact paragraph letters for each path and the requalification marking
format (the letter codes such as "E" and "S", and where they are stamped, are in 180.213). Read both
before writing the page. The tool must not describe a mark it has not seen in the regulation.

## 5. Calculation

- Input: original test (manufacture) month/year from the collar, plus optional last requalification
  date and method (water-jacket, proof pressure, visual "E").
- Output: next requalification due date = last date + 12, 7 or 5 years by method, or original + 12 if
  never requalified. Also state whether that date has passed as of today.
- Worked example: stamped `05-19`, never requalified → due by the end of May 2031.

## 6. The dead zone

| Input | Answer |
|---|---|
| Stamp unreadable / no date | Explain where it is (collar), and that without it no date can be given |
| Non-DOT (TC-only) cylinder | Out of scope, say why |
| Large ASME tanks (home 250/500 gal) | **Different rules: ASME tanks are not requalified like DOT cylinders.** Must be stated, never calculated |
| Future date entered | Error |
| Damaged / rusty cylinder | No date maths applies. Quote 180.205 condemnation conditions only if read |

## 7. The output

- **Headline:** "Requalification due by **May 2031**" (or "Overdue since …").
- **Below:** the path used and the arithmetic, the rule quoted, and the source with retrieval date on
  the card.

## 8. Content notes

- No advice ("safe to use" / "throw it away"). State what the regulation says. Refill dealers
  enforce it, so the page can say a dealer may refuse an out-of-date cylinder only if a source says so.
- FAQs: where is the date, what does the E mean, are 100 lb / forklift cylinders the same, are home
  ASME tanks covered (no), does Blue Rhino swap matter, can I requalify it myself.

## 9. Privacy

- New third-party service? **No.**

## 10. Open questions

- Read 180.209 path paragraphs and 180.213 marking rules in full before building.
- AI Overview is present on the main query. Clicks still go to page-1 pages, but expect lower CTR
  than the volume suggests.
