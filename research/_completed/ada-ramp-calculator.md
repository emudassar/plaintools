# Tool research: ada ramp calculator

Researched 2026-10-03 (Semrush via sr04 mirror in the user's Chrome, Google US SERP, source read from ada.gov).
Not built yet. Waiting for the user's go-ahead.

---

## 1. The keyword

- **Exact search phrase:** `ada ramp calculator`
- **Proposed slug:** `ada-ramp-calculator`
- **Proposed H1 / name:** ADA Ramp Calculator
- **Tagline:** Enter the rise and get the minimum ramp length, number of runs and landings, and whether handrails are required, per the 2010 ADA Standards §405.
- **Category:** `construction` (existing), or a shared "Codes & Compliance" label with the parking tool
- **Scope:** US

### Semrush, US, observed 2026-10-03

| Keyword | Volume | KD | CPC |
|---|---|---|---|
| ada ramp requirements | 6,600 | 34 | $0.86 |
| ada ramp slope | 2,900 | 22 | $0.51 |
| ada ramp calculator | 590 | 22 | $1.98 |
| wheelchair ramp length calculator | 590 | 18 | $0.49 |

Largest demand cluster of the three picks (about 10,700/mo combined).

## 2. The question this answers

How long does an ADA-compliant ramp need to be for my rise, and how many landings does it need?

## 3. Why the existing options are poor

- **`ada ramp calculator`** (Google US 2026-10-03, AI Overview present): upsideinnovations (ramp seller), ezaccess (ramp seller), Omni Calculator, NJ DOT (*curb* ramp design, a different question), LS Building Products, National Ramp (seller), HomeAdvisor.
- **`wheelchair ramp length calculator`:** upsideinnovations, ezaccess, Roll-A-Ramp, theramppeople.co.uk (UK), Omni, DiscountRamps, Reliable Ramps, DME Superstore. **Six of eight sell ramps.**
- **`ada ramp requirements`:** access-board.gov #1, then National Ramp, accessibilitychecker, ada-compliance.com, simplifiedbuilding (railing seller), ezaccess, upsideinnovations.
- **The gap:** this is a seller-dominated calculator SERP with no section-cited tool. Omni's page says "ADA requires a minimum slope of 1:20". That is a misreading: 1:20 is where a walkway becomes a ramp, not a minimum. Seller calculators tend to stop at length and skip the 30-inch-per-run limit, the 6-inch handrail trigger and the existing-building exception table. **Weakest gap of the three.** Calculators do rank, but they are conflicted and uncited (the same shape as the rebar and roof pitch picks).
- **Walk-away signals:** no SaaS. Source is free government text.
- **Duplicate on the hub?** No. Roof pitch is a slope tool for roofs. This one is a different question with a different source.

## 4. The data source

- **Name and publisher:** 2010 ADA Standards for Accessible Design, U.S. DOJ
- **URL:** https://www.ada.gov/law-and-regs/design-standards/2010-stds/ (HTTP 200, fetched 2026-10-03)
- **Licence:** US federal government work
- **Network at runtime:** none

### Verified text (read 2026-10-03)

- **405.2:** running slope not steeper than **1:12**. Exception, Table 405.2 (existing sites only): steeper than 1:10 up to 1:8 → max rise **3 in**. Steeper than 1:12 up to 1:10 → max rise **6 in**. Steeper than 1:8 prohibited.
- **405.5:** clear width **36 in** minimum (between handrails where provided)
- **405.6:** rise for any ramp run **30 in** maximum
- **405.7:** landings at top and bottom of each run. **405.7.3** length **60 in** min. **405.7.4** change of direction → **60 × 60 in** min. **405.7.2** landing at least as wide as the widest run.
- **405.8:** runs with rise **greater than 6 in** require handrails (§505)
- Still to read: 405.3 cross slope (1:48), 405.9 edge protection detail.

## 5. Calculation

- **Formula:** min run length (in) = rise × 12. Runs = ceil(rise / 30). Intermediate landings = runs − 1. Total landings = runs + 1. Handrails if any run's rise > 6 in.
- **Worked example:** 24 in rise → 288 in = 24 ft run, 1 run, 2 landings, handrails required. 45 in rise → 540 in = 45 ft of ramp, 2 runs, 1 intermediate landing (60 in), handrails required.
- **Cross-check:** HomeAdvisor and the AI Overview both state "1 foot per inch of rise", which matches.

## 6. Dead zone

| Input | Handling |
|---|---|
| Rise 0 / negative | bad-input |
| Rise ≤ 0.5 in | Changes in level fall under §303, not ramps. Say so |
| Existing building, short rise | Offer the Table 405.2 exception only when the user marks "existing facility" |
| Private home | ADA applies to public accommodations and government facilities. Say so plainly, give no advice |
| Very large rise (e.g. > 120 in) | Still computes. Show the length so the user sees why lifts exist (fact only) |

## 7. The output

- **Headline:** "Minimum ramp length: 24 ft (1:12)"
- **Detail:** runs, landings with sizes, handrails yes/no, min width 36 in, each with its section number
- **Source line:** 2010 ADA Standards §405.2–405.8, retrieved 2026-10-03

## 8. Content notes

Uses: a family planning a ramp for a parent coming home from hospital, a small shop owner after an accessibility complaint, a church, a contractor quoting, a landlord, an occupational therapist making a home-visit report. FAQs: is 1:12 the law for homes, what if I have no room, how many landings, when are handrails needed, what about 1:20, is a portable ramp different.

## 9. Privacy

No new third-party service.

## 10. Open questions

- §303 change-in-level threshold numbers not read yet.
- Gap is moderate, not strong. Build after the other two if order matters.
