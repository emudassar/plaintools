# Tool research: water softener size calculator

Researched 2026-09-22. All figures below were read from the live sources on that date; anything
not verified is listed in section 10 and must not appear as fact on the page.

---

## 1. The keyword

- **Exact search phrase:** `water softener size calculator`
- **Proposed slug:** `water-softener-size-calculator`
- **Proposed H1 / name:** Water Softener Size Calculator
- **Tagline:** Enter your water hardness and household size and get the grains removed per day,
  the capacity that implies, and how often a given unit would regenerate — with the extension
  publication behind each number.
- **Category:** existing `property` ("Home & Property"). The blurb is currently address-shaped
  ("a specific building, plot or address") and needs widening to cover the systems serving a
  building. Label stays; only the blurb changes.
- **Scope:** US (grains per gallon is a US unit; both cited sources are US extension services)
- **EMD candidate:** none proposed yet

**Keyword data (Semrush, US database, observed 2026-09-22 — recorded as observed, not estimated):**

| Keyword | Volume | KD | CPC |
|---|---|---|---|
| water softener size calculator | 590 | 15 | $1.67 |
| water softener sizing calculator | 140 | 9 | $1.35 |
| sizing a water softener calculator | 90 | 12 | n/a |
| how many grains water softener do i need | 90 | 12 | $0.98 |
| sizing water softener calculator | 70 | 13 | n/a |
| commercial water softener sizing calculator | 50 | 7 | n/a |

## 2. The question this answers

How many grains of hardness does this household remove per day, and what capacity and
regeneration interval does that work out to?

## 3. Why the existing options are poor

**Every result on page 1 is sold by someone who sells softeners.** Google, US, checked
2026-09-22 for `how to size a water softener`:

1. industrialh2osolutions.com — an **industrial** water company ranking for a residential query
2. lowes.com — retailer
3. hillwater.com — installer
4. watertech.com — manufacturer
5. reddit.com
6. homewater101.com — brand-operated
7. whirlpoolwatersolutions.com — manufacturer
8. help.afwfilters.com — retailer

There is no neutral calculator, no cited method, and no government or extension page anywhere in
the top 8. Position 1 is an intent mismatch (industrial vendor, residential query) and Reddit
ranks at 5, both of which say Google cannot find a satisfying answer.

The contrast is instructive: for `what do my well water test results mean`, page 1 is Penn State
Extension, CDC, wellowner.org, Colorado EPHT, Wisconsin Extension, MN Dept of Health and MSU
Extension. **The institutions have written the interpretation content but not the arithmetic**,
and the sellers have filled the arithmetic gap with uncited rules of thumb that differ from each
other (75 vs 80 gallons per person, "add 4 gpg per ppm iron" vs "add 5").

Penn State Extension publishes the calculation, with a worked example, and it is buried in the
middle of a long article with no calculator attached.

- Buy signals observed:
  - [x] Authoritative source exists but is unusable for the task — Penn State's method is a
        static worked example inside a 3,000-word page, not something you can put your own
        numbers into
  - [x] People doing the calculation by hand — the vendor pages all restate the arithmetic
        because the searcher plainly wants a number
  - [x] Forum thread ranking (Reddit at position 5)
  - [ ] Third-party "how to use the official tool" posts — n/a, there is no official tool
- Walk-away signals checked:
  - [ ] Funded SaaS with a pricing page in top 5 — **no**
  - [ ] Entrenched high-authority site holding every long-tail term — **no**; the field is
        vendors and one Reddit thread
  - [ ] Paid licence needed — **no**, both sources are free public extension publications
- **Duplicates an existing tool?** No. The hub has a soil lookup and an OSHA classifier.

## 4. The data source

Not an API. See section 5.

- **Name and publisher:** Penn State Extension, "Water Softening"; North Dakota State University
  Extension, "Water Softening (Ion Exchange)"
- **Endpoint or file:** https://extension.psu.edu/water-softening ·
  https://www.ndsu.edu/agriculture/extension/publications/water-softening-ion-exchange
- **API key needed?** No — nothing is fetched at runtime
- **Quota or rate limit:** n/a

### Verification — actual commands and output

```bash
curl -s -m 40 -A "Mozilla/5.0" -L "https://extension.psu.edu/water-softening" -o psu.html \
  -w "HTTP %{http_code} bytes %{size_download}\n"
# → HTTP 200 bytes 387472

curl -s -m 40 -A "Mozilla/5.0" -L \
  "https://www.ndsu.edu/agriculture/extension/publications/water-softening-ion-exchange" \
  -o ndsu.html -w "HTTP %{http_code} bytes %{size_download}\n"
# → HTTP 200 bytes 64208
```

CORS is not applicable: **the page makes no request at runtime.** The figures are compiled in,
exactly as the OSHA tool compiles in its clause text.

## 5. It is a calculation, not an API

**Formula — verbatim from Penn State Extension, "Water Softening":**

> Sample Calculation for Determining a Regeneration Cycle
> 20,000 = Sample capacity (number of grains per regeneration)
> 75 gallons = average person usage per day
> 10 gpg = raw water hardness
> 4 people = household size
> 75 gallons (10 gpg) x 4 = 3,000 grains per day used
> 20,000/3,000 = about 6-7 day regeneration

So:

```
grains per day        = gallons per person per day × hardness (gpg) × people
required capacity     = grains per day × days wanted between regenerations
days between regens   = rated capacity ÷ grains per day
```

**Other verbatim figures from the same page:**

- > A gpg is used exclusively as a hardness unit and equals approximately 17 mg/l or ppm.
- Table 1, Water Hardness Classification — Soft: less than 1.0 gpg / less than 17 ppm ·
  Slightly hard: 1.0 to 3.5 / 17 to 60 · Moderately hard: 3.5 to 7.0 / 60 to 120 ·
  Hard: 7.0 to 10.5 / 120 to 180 · Very hard: greater than 10.5 / greater than 180
- > levels below 7.0 gpg will probably not cause major scaling and soap film
- > The exchange of hardness minerals for sodium adds 7.5 milligrams per quart for each gpg of
  > hardness removed.
- > Estimates indicate that about 50 gallons of water are used for each regeneration cycle.
- > Although colorless, reduced iron will be removed by the unit, red-oxidized iron (iron that
  > has been exposed to air or chlorine) will clog the resin.

**Verbatim from NDSU Extension, "Water Softening (Ion Exchange)":**

- > Some softeners will also remove up to 10 ppm of iron and manganese. Water supplies with high
  > levels of iron and manganese (greater than 10 ppm) may need a dedicated iron removal system.
- > The presence of excess iron or hydrogen sulfide can inhibit the effectiveness of a water
  > softening unit. Installation of the iron removal equipment may be required.
- > Water used in recharging a water softener may overload or reduce the effectiveness of small
  > septic or sewer systems.

**Worked example, by hand:** 75 × 10 × 4 = 3,000 grains/day. 20,000 ÷ 3,000 = 6.67 days.

**Checked against which independent reference?** Penn State's own published example, which
states the expected output ("about 6-7 day regeneration"). The implementation must reproduce
3,000 and 6.67 exactly for those inputs. This is the cross-check.

**Deliberately NOT implemented:** an iron-to-hardness compensation multiplier. Vendor pages add
"4 gpg" or "5 gpg" per ppm of iron; the figure differs between them and **no citable source for
it was found**. Iron is therefore reported against NDSU's 10 ppm sentence rather than folded
into the hardness number.

## 6. The dead zone

| Input that fails | What happens | How common |
|---|---|---|
| Hardness 0 | Grains/day is 0; capacity ÷ 0 is infinite. No regeneration interval exists | Rare but reachable |
| Hardness below 1.0 gpg | PSU classifies as Soft; PSU also says below 7.0 gpg "will probably not cause major scaling and soap film" | Common in soft-water regions |
| mg/L typed into the gpg box | 200 "gpg" is really ~3,400 mg/L. Answer is silently 17× too big | **The most likely error of all** |
| Iron + manganese over 10 ppm | NDSU says a dedicated iron removal system may be needed | Common on untreated wells |
| Rated capacity smaller than one day's grains | Regeneration more than once a day | Reachable with a small cabinet unit on very hard water |
| 0 people / 0 gallons per day | No demand, no answer | Rare |

- **How the fallback explains the gap:** each of these produces a named panel quoting the source
  sentence that applies, not a blank result.
- **What the source still records when the main answer is missing:** hardness classification and
  the gpg↔mg/L conversion are always shown, even when the interval cannot be computed.
- **Unit-confusion guard:** a gpg figure above 100 triggers a bad-input error naming mg/L,
  because 100 gpg is ~1,700 mg/L and far outside PSU's table.

## 7. The output

- **Headline:** grains of hardness removed per day.
- **Supporting detail:** required rated capacity for the chosen interval · days between
  regenerations for a rated capacity the user enters · PSU hardness class with both units ·
  sodium added per quart · water used per regeneration and per year · iron/manganese panel where
  entered · every figure attributed inline.
- **Source + retrieval date on the result card:** yes — Penn State Extension and NDSU Extension,
  retrieved 2026-09-22.

## 8. Content notes

Uses, data section and FAQs written on the page. The data section must say plainly that the
page applies a published extension method to typed numbers, that hardness must come from an
actual water test, and that it does not select or recommend equipment.

## 9. Privacy

- **New third-party service?** **No.** Nothing is fetched; the arithmetic runs in the browser.
  `thirdPartyServices` in `src/config/site.ts` is unchanged and the generated privacy policy
  stays correct.

## 10. Open questions / what is still unverified

- **No citable source found for an iron-to-hardness compensation factor.** Not implemented.
- **75 gallons per person per day is Penn State's figure**, used in their example. It is offered
  as an editable default and attributed on the page. No claim is made that it is a national
  average — EPA WaterSense figures were not read for this build.
- **"Commonly sold" grain capacities (24,000 / 32,000 / 48,000) are not a cited fact** and are
  not presented as one. Rated capacity is a field the user fills from their own unit's label.
- **NDSU's 10 ppm sentence does not say whether the limit is iron alone, manganese alone, or the
  two combined.** The page flags the ambiguity and quotes the sentence rather than resolving it.
- The two extension pages are undated on the live HTML; the retrieval date is recorded instead.
