# Tool research: egress window calculator

Researched 2026-10-03 (Semrush via sr04 mirror in the user's Chrome, Google US SERP, source read from ICC's free reader in Chrome).
Not built yet. Waiting for the user's go-ahead.

---

## 1. The keyword

- **Exact search phrase:** `egress window calculator`
- **Proposed slug:** `egress-window-calculator`
- **Proposed H1 / name:** Egress Window Calculator
- **Tagline:** Enter your window's clear opening and sill height and see whether it meets each IRC R310 minimum, with the reason it fails.
- **Category:** `construction` (existing)
- **Scope:** US (jurisdictions adopting the IRC)

### Semrush, US, observed 2026-10-03

| Keyword | Volume | KD | CPC |
|---|---|---|---|
| egress window requirements | 3,600 | 23 | $2.71 |
| egress window size | 2,400 | 20 | $1.57 |
| egress window calculator | 590 | **7** | $1.72 |
| egress window size requirements | 260 | 15 | $2.53 |
| basement egress window requirements | 260 | 19 | $2.58 |
| egress window well requirements | 210 | 13 | $1.43 |

One page can absorb the cluster (about 7,300/mo). The tool answers "does my window meet the requirement", which is the same question.

## 2. The question this answers

Does this window (or window well) meet the IRC minimum size for an emergency escape and rescue opening?

## 3. Why the existing options are poor

- **`egress window size requirements`** (Google US 2026-10-03, **no AI Overview**): Home Depot buying guide, thegreategressco (seller), egresspros (seller), sananselmo.gov PDF, jbsash (window maker), anokamn.gov "Egress window sizing chart" PDF, codes.iccsafe.org. **No calculator on page 1.**
- **`egress window calculator`** (AI Overview present): Jeld-Wen, Viwinco, Success Windows, ProVia (all window manufacturers, tied to their own product lines), thegreategressco and egresswindowcost (sellers), remodelcalculators, ai-architectures. **Every result except two sells windows or installs them.** Same pattern as the rebar and roof pitch picks: the seller has a conflict of interest and cites nothing checkable.
- **Buy signals:**
  - [x] Cities (San Anselmo, Anoka) publish their own sizing charts as PDFs because people get it wrong
  - [x] The code is free to read but mixes in 4 separate rules (area, width, height, sill height) plus area-well rules that people must combine themselves
- **Walk-away signals:** no SaaS. Code text is free to read on ICC's site.
- **Duplicate on the hub?** No. Roof pitch uses IRC Chapter 9. This is Chapter 3, a different question.

## 4. The data source

- **Name and publisher:** 2021 International Residential Code, Section R310, ICC
- **URL:** https://codes.iccsafe.org/content/IRC2021P1/chapter-3-building-planning
  (curl returns **403**. Read in the user's Chrome, the same way as the roof pitch tool on 2026-09-26)
- **Licence:** ICC copyright on the text. Cite section numbers and state the numeric limits. Never reproduce code prose at length (same approach as the roof pitch tool).
- **Network at runtime:** none. Limits compile into the page.

### Verified (read 2026-10-03)

- **R310.2.1:** net clear opening not less than **5.7 sq ft**. Exception: **5 sq ft** for grade-floor openings.
- **R310.2.2:** minimum net clear opening **height 24 in**, **width 20 in**, "the result of normal operation of the opening"
- **R310.2.3:** bottom of the clear opening not greater than **44 in** above the floor
- **R310.2.4:** under decks/porches: path not less than 36 in high × 36 in wide
- **R310.4:** area wells exist as a section. **Their sub-sections (min area, projection, ladder depth) were not fully extracted.** Read before building.

## 5. Calculation

- **Formula:** net clear area = clear width × clear height ÷ 144 (inches → sq ft). Then pass/fail on each of the 4 limits separately.
- **Worked example:** 20 × 24 in = 480 sq in = 3.33 sq ft. Passes both dimension minimums but **fails** 5.7 sq ft. This is the classic trap the tool should show. 24 × 36 in = 6.0 sq ft → passes.
- **Cross-check:** the Anoka MN sizing chart PDF (reference only, not the source).

## 6. Dead zone

| Input | Handling |
|---|---|
| User enters rough opening or frame size, not clear opening | Big warning plus an explanation of "net clear opening". The answer is only as good as the measurement |
| Sliding vs casement vs double-hung | Clear opening differs by window type. Ask for measured clear opening, give no model-specific deductions |
| Local amendments | State that jurisdictions amend the IRC. Give no number |
| Zero/negative/huge values | bad-input |

## 7. The output

- **Headline:** "Meets IRC R310 minimums" or "Does not meet: area 3.33 sq ft is below 5.7 sq ft"
- **Detail:** a 4-row checklist (area, width, height, sill), each with its section number
- **Source line:** 2021 IRC §R310.2.1–R310.2.3, read 2026-10-03

## 8. Content notes

Uses: a homeowner finishing a basement bedroom, a buyer checking a "bedroom" claim in a listing, a landlord before a rental inspection, a window installer quoting a replacement, a home inspector, a flipper. FAQs: why does my 20×24 window fail, grade-floor exception, does a basement need one, replacement windows, window well size, is this my local code.

## 9. Privacy

No new third-party service.

## 10. Open questions

- R310.4 area-well numbers not extracted yet (needed if wells are included in v1. They could also be left out of v1).
- The IRC replacement-window exception (R310.2.5 / R310.6 area) not read.
