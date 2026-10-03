# Tool research: ada parking space requirements

Researched 2026-10-03 (Semrush via sr04 mirror in the user's Chrome, Google US SERP, source read from ada.gov).
Not built yet. Waiting for the user's go-ahead.

---

## 1. The keyword

- **Exact search phrase:** `ada parking space requirements`
- **Proposed slug:** `ada-parking-space-requirements`
- **Proposed H1 / name:** How Many ADA Parking Spaces Are Required?
- **Tagline:** Enter your total parking spaces and get the minimum accessible and van-accessible count from the 2010 ADA Standards, with the space and aisle dimensions.
- **Category:** `construction` fits loosely. A broader "Codes & Compliance" label might hold this and the ramp tool better. Decide at build time.
- **Scope:** US
- **EMD candidate:** (not checked)

### Semrush, US, observed 2026-10-03

| Keyword | Volume | KD | CPC |
|---|---|---|---|
| ada parking space requirements | 2,900 | 31 | $5.68 |
| ada parking requirements | 2,900 | 29 | $5.68 |
| handicap parking requirements | 720 | 26 | $0.54 |
| how many ada parking spaces are required | 110 | 28 | $0.00 |
| ada parking ratio | 40 | 30 | $0.00 |
| ada parking calculator | no data returned | | |

The $5.68 CPC is the highest of anything checked this session.

## 2. The question this answers

How many accessible (and van-accessible) parking spaces does a parking facility with N spaces need?

## 3. Why the existing options are poor

- **What ranks now** (Google US, 2026-10-03, AI Overview present on both queries):
  - `ada parking space requirements`: ada.gov, access-board.gov, then paving and striping contractors (Wright Construction, Anderson Striping, Rose Paving, Unique Paving, AF&G fence), Seton (sign seller) and adata.org.
  - `how many ada parking spaces required`: ada.gov, access-board.gov, adata.org, then four contractor blogs (modernnw, hscpavementmaintenance, andersonstriping, cojoasphalt) plus adacentral.
- **No calculator ranks in the top 8 of either query.** The answer is a lookup in Table 208.2, plus a percentage band (501–1000), a formula over 1,000, a van rule ("every six or fraction of six"), and separate medical-facility percentages. People work this out by hand.
- **Buy signals:**
  - [x] Several paving companies wrote posts explaining the same table, which shows demand and that the official text is hard to use
  - [x] People do the calculation by hand (the 2% band, the over-1,000 formula and the van rounding are where mistakes happen)
  - [ ] Official tool ranking top 5: the gov pages are text, not a tool
- **Walk-away signals:** no funded SaaS in the top 5. ada.gov ranks #1 but is a text guide. Data is free US government text.
- **Duplicate on the hub?** No.

## 4. The data source

- **Name and publisher:** 2010 ADA Standards for Accessible Design, U.S. Department of Justice
- **URL:** https://www.ada.gov/law-and-regs/design-standards/2010-stds/ (HTTP 200, 733,962 bytes, fetched 2026-10-03)
- **Licence:** US federal government work (no copyright)
- **API key / network at runtime:** none. The table compiles into the page, so `thirdPartyServices` is unchanged.

### Verified text (read from the page 2026-10-03)

- **Table 208.2:** 1–25 → 1 · 26–50 → 2 · 51–75 → 3 · 76–100 → 4 · 101–150 → 5 · 151–200 → 6 · 201–300 → 7 · 301–400 → 8 · 401–500 → 9 · 501–1000 → "2 percent of total" · 1001 and over → "20, plus 1 for each 100, or fraction thereof, over 1000"
- **208.2 advisory:** the count is calculated **separately for each parking facility**, not from the site total.
- **208.2.1 Hospital outpatient facilities:** 10% of patient and visitor spaces.
- **208.2.2 Rehabilitation and outpatient physical therapy facilities:** 20% of patient and visitor spaces.
- **208.2.4 Van spaces:** "For every six or fraction of six parking spaces required by 208.2 ... at least one shall be a van parking space"
- **502.2:** car spaces 96 in wide min, van spaces 132 in wide min (exception: 96 in when the aisle is 96 in).
- **502.3:** access aisle rules (two spaces may share one aisle).

**Still to read before building:** 208.2.3 (residential facilities), the exact 502.3.1 aisle widths, and how 2% rounds (whether "2 percent" rounds up). Do not code rounding until the text or the DOJ guidance says so.

## 5. Calculation

- **Formula:** table lookup, plus `ceil(total × 0.02)` for 501–1000 *(rounding to be confirmed)*, plus `20 + ceil((total − 1000) / 100)` for 1001+. Van count is `ceil(required / 6)`.
- **Worked example (by hand):** 120 spaces → 5 accessible → ceil(5/6) = 1 van. 1,250 spaces → 20 + ceil(250/100) = 23 → ceil(23/6) = 4 van.
- **Independent cross-check:** ADA National Network (adata.org) and the Access Board's Chapter 5 guide publish the same table.

## 6. Dead zone

| Input | What happens |
|---|---|
| 0 or negative spaces, decimal | bad-input error |
| Several lots on one site | Explain the per-facility rule. One calculation per lot |
| Hospital outpatient or rehab facility | Use 208.2.1 / 208.2.2 percentages, not the table |
| Residential facility | 208.2.3 applies (not read yet) |
| State or local code stricter | State it exists, give no number (no advice) |

## 7. The output

- **Headline:** "Minimum accessible spaces: 5, of which at least 1 van-accessible"
- **Detail:** the table row used, car/van/aisle widths from 502, the per-facility note
- **Source line on the card:** 2010 ADA Standards §208.2, §208.2.4, §502, retrieved 2026-10-03

## 8. Content notes

Uses: a small business owner restriping a lot, a property manager checking before a DOJ complaint, a paving contractor quoting a job, an architect checking a site plan, a church adding overflow parking. FAQs: does the count use all lots combined, does a van space count toward the total, what about lots under 25 spaces, hospital vs doctor's office, is this the same as my state code.

## 9. Privacy

No new third-party service.

## 10. Open questions

- Rounding of the 2% band (see §4).
- 208.2.3 residential rules not read yet.
- No legal advice. Report what the standard says only.
