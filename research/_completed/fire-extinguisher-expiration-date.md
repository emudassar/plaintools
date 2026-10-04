# Tool research: fire extinguisher expiration date

Researched 2026-10-04 (Semrush via the sr04 mirror in the user's Chrome, Semrush SERP Analysis for the
Google US top 10, Bing for intitle checks, source read from eCFR). Built 2026-10-04.


> **BUILT 2026-10-04.** Full Table L-1 read (last row: "Dry powder, cartridge or cylinder operated with
> mild steel shells" = 12; footnote 1 = soldered/riveted copper or brass shells removed from service by
> 1982-01-01). **New find:** OSHA's own 1910.157(e)(4) sets the 6-year emptying/maintenance rule for
> stored-pressure dry chemical (12-year types), restarted by recharge or hydro test, with disposables
> exempt. So the 6-year rule is stated from OSHA, without quoting NFPA 10. Section last amended 2017-01-01.

---

## 1. The keyword

- **Exact search phrase:** `fire extinguisher expiration date`
- **Proposed slug:** `fire-extinguisher-expiration-date`
- **Proposed H1 / name:** When Does My Fire Extinguisher Expire?
- **Tagline:** Pick your extinguisher type and enter its manufacture or last test date to get the next
  hydrostatic test date from OSHA's Table L-1.
- **Category:** `safety` (existing)
- **Scope:** US

### Semrush, US, observed 2026-10-04

| Keyword | Volume | KD | CPC |
|---|---|---|---|
| fire extinguisher expiration date | 1,000 | **6** | $1.79 |
| fire extinguisher hydrostatic test | 70 | 10 | $4.18 |

- Family: **134 variations, 5.5K/mo total.**
- Related, a separate question and **not** this tool: `how many fire extinguishers do i need`
  590/KD 4.

## 2. The question this answers

Given the type of extinguisher and its date, when is its next hydrostatic test due?

## 3. Why the existing options are poor

- **Google US top 10** (Semrush SERP Analysis, 2026-10-04, AI Overview and video carousel present):
  support.firstalert.com (23 RD), pyebarkerfs.com (1 RD), kidde.com (2 RD), encorefireprotection.com
  (0 RD), elementfire.com, **a Facebook video**, **reddit r/firePE**, kordfire.com (twice),
  certasitepro.com. **No tool on page 1.** Most results are extinguisher sellers or service companies.
- **Bing intitle check** (`intitle:"fire extinguisher" intitle:calculator expiration`): about 20
  results, and **none is a fire-extinguisher expiry tool**. The only fire-extinguisher calculator found
  was a coverage calculator (superglobalcalculator.com).
- **Buy signals:**
  - [x] A Reddit thread on a fire-protection subreddit ranks. Even pros ask.
  - [x] Two brands (First Alert, Kidde) answer for their own disposables only. Nobody covers the
        rechargeable types by Table L-1.
- **Walk-away signals:** no SaaS, no entrenched authority. The source is free gov text.
- **Duplicate on the hub?** No. `osha-soil-classification` is a different OSHA standard.

## 4. The data source

- **Name and publisher:** 29 CFR 1910.157(f), "Hydrostatic testing", Table L-1, OSHA, published on eCFR
- **Endpoint (verification only):**
  `https://www.ecfr.gov/api/versioner/v1/full/2026-09-01/title-29.xml?part=1910&section=1910.157`
  → **HTTP 200, 4,395 bytes** with `--compressed`. (osha.gov itself returns 403 to automated requests
  from this network, as logged in MEMORY.md. eCFR is the same text.)
- **Licence:** US federal regulation, public domain
- **Network at runtime:** none

### Verified, Table L-1 read from eCFR (2026-10-04)

| Type | Test interval (years) |
|---|---|
| Soda acid (stainless steel shell) | 5 |
| Cartridge operated water and/or antifreeze | 5 |
| Stored pressure water and/or antifreeze | 5 |
| Wetting agent | 5 |
| Foam (stainless steel shell) | 5 |
| AFFF | 5 |
| Loaded stream | 5 |
| Dry chemical with stainless steel | 5 |
| Carbon dioxide | 5 |
| Dry chemical, stored pressure, mild steel / brazed brass / aluminum shells | 12 |
| Dry chemical, cartridge or cylinder operated, mild steel shells | 12 |
| Halon 1211 | 12 |
| Halon 1301 | 12 |
| Dry powder, cartridge or cylinder operated… | (row truncated in the extract. **Read in full before building**) |

Also in 1910.157(f): the test is required at the Table L-1 interval except when the unit has been
repaired by soldering/welding, has damaged threads, pitting corrosion, has been burned in a fire, or a
calcium chloride agent was used in a stainless shell. These are the dead-zone conditions.

## 5. Calculation

- Input: type (from the Table L-1 rows), date of manufacture or last hydrostatic test.
- Output: next hydro test due = date + 5 or 12 years.
- Worked example: CO2 extinguisher last tested March 2022 → due March 2027.

## 6. The dead zone

| Input | Answer |
|---|---|
| Disposable (non-rechargeable) home unit | Not a Table L-1 hydro question. Say so, and point to the manufacturer's label. **Do not invent a 12-year figure** unless a citable source is read |
| Damaged / repaired / burned unit | 1910.157(f) conditions apply. No date maths |
| Type not in Table L-1 (e.g. wet chemical / Class K) | Say the table does not list it |
| Soldered brass soda-acid / foam | The table footnotes these "(until 1/1/82)". Show the footnote, not a date |
| Future date | Error |

## 7. The output

- **Headline:** "Next hydrostatic test due **March 2027**" / "Overdue since …".
- **Below:** the Table L-1 row used, plus a note that 1910.157(e) also requires annual maintenance
  (read (e) before stating it), with the source and retrieval date on the card.

## 8. Content notes

- OSHA applies to workplaces. The page must say that, and not present it as a home rule.
- NFPA 10 (the inspection standard most fire marshals use) is copyrighted. Name it, but don't quote it.
  The 6-year maintenance often quoted online is NFPA 10. **Do not state it unless read in NFPA's free
  read-only viewer.**

## 9. Privacy

- New third-party service? **No.**

## 10. Open questions

- Read the full Table L-1 (last rows plus footnotes) and 1910.157(e) before building.
