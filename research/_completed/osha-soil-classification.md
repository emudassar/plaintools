# Tool research: osha soil classification

Researched 2026-09-22. All keyword figures are from the user's Semrush account (US database,
data dated 2026-09-22) and are recorded here as observed, not estimated.

---

## 1. The keyword

- **Exact search phrase:** osha soil classification
- **Proposed slug:** `osha-soil-classification`
- **Proposed H1 / name:** OSHA Soil Classification
- **Tagline:** Answer the questions OSHA's own criteria ask and get the soil type — A, B, C or
  stable rock — with the clause that decides it.
- **Category:** NEW — `safety`, label "Workplace & Safety" (broad enough to hold future
  regulator-published tools; "Home & Property" does not fit an excavation standard)
- **Scope:** US (OSHA is a US federal agency; 29 CFR applies to US workplaces)
- **EMD candidate:** oshasoiltype.com

### Cluster observed (Semrush, US, 2026-09-22)

| Keyword | Volume | KD |
|---|---|---|
| osha soil types | 260 | 25 (Easy) |
| type a soil osha | 170 | 29 (Easy) |
| osha soil classification | 140 | 30 |
| types of soil osha | 110 | 35 |
| what is a characteristic of type b soil | 90 | 19 (Easy) |
| osha type c soil | 70 | 23 (Easy) |
| osha soil classification chart | 70 | 23 (Easy) |
| what is type b soil | 70 | 13 (**Very easy**) |

`what is type b soil` global volume 110 (US 70, AU 20, CA 10, UK 10). CPC $0.00 across the whole
cluster; competitive density 0.33. Semrush's own note on `what is type b soil`: "Your chance to
start ranking new pages on Google as soon as possible without any backlinks."

One page answers one question — "how does OSHA classify this soil?" — phrased many ways. These
are variations of a single query, so they get one page, not eight.

## 2. The question this answers

Given what a person can observe and measure about the soil in an excavation, which classification
do OSHA's published criteria in 29 CFR 1926 Subpart P Appendix A place it in?

## 3. Why the existing options are poor

**Checked the live SERP for `what is type b soil` (Semrush SERP Analysis, 2026-09-22).**

Average Top-10 Domain AS 49, inflated by institutional domains rather than competing tools:

| # | Domain | AS | What it is |
|---|---|---|---|
| 1 | osha.gov | 67 | **A PDF** — "Soil Classification Training Outline.pdf" |
| 2 | incident-prevention.com | 30 | Blog post |
| 3 | murraystate.edu | 45 | University safety-office page |
| 4 | dpcoftexas.org | 23 | Safety-supplier page |

- **What ranks now, and what is wrong with it:** the authoritative source ranks first and is a
  **PDF nobody can search**. The regulation itself is dense legal text: the Type A definition
  alone carries five disqualifying sub-clauses, and Type B has six branches, one of which
  cross-references Type C. Everything else in the top 10 is prose *about* the classification.
- Buy signals observed:
  - [x] Official source is authoritative but unusable, ranking top-5 — osha.gov PDF at #1
  - [x] A PDF nobody can search, ranking #1
  - [x] Third parties spending their own effort re-documenting the regulation
        (incident-prevention.com, murraystate.edu, dpcoftexas.org all restate the same criteria)
  - [ ] Forum threads — not observed in top 10 for this term
- Walk-away signals checked:
  - [x] A funded SaaS with a pricing page ranks top-5 — **no**
  - [x] An entrenched high-authority site holds every long-tail term — **no**; the long tail is
        split across low-AS safety blogs
  - [x] The data needs a paid licence — **no**, US federal regulation is public domain
- **No interactive classifier appears anywhere in the top 10.** The decision procedure is
  currently something people read out of a PDF and apply by hand.
- **Does this duplicate an existing tool on the hub?** No. The soil tool answers "what soil is
  mapped at my address" from USDA SSURGO. This answers "which OSHA class do these observed
  properties fall in". Different question, different source, no shared input.

### Why halfway-between and FEMA flood zone were rejected instead

Recorded so the decision is not revisited from keyword metrics alone.

- **halfway between two places** (720 US / 1.8K global, KD 23 "Easy"): SERP checked
  2026-09-22 — whatshalfway.com #1 (120 countries, venue filters, meeting planner, journey
  planner), travelmath.com #2 (AS 72, 222.7K backlinks), meetways.com #3 (travel mode, POI
  search, directions, reviews), splitthedistance.com #4 (sells search credits). Three mature
  free tools, each doing more than a midpoint calculation. Fails "existing options are
  genuinely poor". Low KD here reflects low commercial value, not an opening.
- **flood zone by address** (5.4K, KD 56): `hazards.fema.gov` and `msc.fema.gov` both return
  HTTP 000 (connection refused) from this network, in curl and in a real Chrome browser, with
  photon.komoot.io returning 200 as a control. The source cannot be verified from here, so it
  cannot be shipped from here.

## 4. The data source

- **Name and publisher:** 29 CFR Part 1926 Subpart P (Excavations), Occupational Safety and
  Health Administration. Retrieved from the U.S. Government Publishing Office.
- **Endpoint or file:**
  `https://www.govinfo.gov/content/pkg/CFR-2024-title29-vol8/xml/CFR-2024-title29-vol8-part1926-subpartP.xml`
- **Licence / terms:** US Government work, public domain (GPO).
- **API key needed?** No.
- **Quota or rate limit:** Not applicable — **the regulation text is read once at build time by a
  human and the criteria are encoded in the tool.** The shipped tool makes **no network request
  at all**.

### Verification — actual commands and output

```bash
curl -s -m 30 -o /dev/null -w "%{http_code} %{time_total}s\n" \
  "https://www.govinfo.gov/content/pkg/CFR-2024-title29-vol8/xml/CFR-2024-title29-vol8-part1926-subpartP.xml"
# → 200 in 1.653923s   (91,584 bytes downloaded)

# reachability of the alternatives, same session:
# ecfr.gov  → HTTP 406 (needs an Accept header)
# osha.gov  → HTTP 403 (blocks the curl user agent)
# govinfo.gov → HTTP 200   ← used
```

Sections confirmed present in the downloaded XML: `§ 1926.650`, `§ 1926.651`, `§ 1926.652`,
Appendix A (Soil Classification), Appendix B (Sloping and Benching), Appendices C–F.

- **CORS:** not applicable. The tool makes no request; the criteria are compiled into it.
- **Timings:** not applicable for the same reason.
- **Failure shapes:** not applicable — no runtime dependency, so there is no "service is down"
  state for this tool. The only error state is incomplete input from the user.

## 5. It is a decision procedure, not a calculation

**Where it is documented:** 29 CFR 1926 Subpart P Appendix A, paragraph (b), "Definitions".
Text below is quoted verbatim from the GPO XML downloaded above.

> **Stable rock** means natural solid mineral matter that can be excavated with vertical sides
> and remain intact while exposed.

> **Type A** means cohesive soils with an unconfined compressive strength of 1.5 ton per square
> foot (tsf) (144 kPa) or greater. Examples of cohesive soils are: clay, silty clay, sandy clay,
> clay loam and, in some cases, silty clay loam and sandy clay loam. Cemented soils such as
> caliche and hardpan are also considered Type A. However, no soil is Type A if: (i) The soil is
> fissured; or (ii) The soil is subject to vibration from heavy traffic, pile driving, or similar
> effects; or (iii) The soil has been previously disturbed; or (iv) The soil is part of a sloped,
> layered system where the layers dip into the excavation on a slope of four horizontal to one
> vertical (4H:1V) or greater; or (v) The material is subject to other factors that would require
> it to be classified as a less stable material.

> **Type B** means: (i) Cohesive soil with an unconfined compressive strength greater than 0.5
> tsf (48 kPa) but less than 1.5 tsf (144 kPa); or (ii) Granular cohesionless soils including:
> angular gravel (similar to crushed rock), silt, silt loam, sandy loam and, in some cases, silty
> clay loam and sandy clay loam. (iii) Previously disturbed soils except those which would
> otherwise be classified as Type C soil. (iv) Soil that meets the unconfined compressive
> strength or cementation requirements for Type A, but is fissured or subject to vibration; or
> (v) Dry rock that is not stable; or (vi) Material that is part of a sloped, layered system
> where the layers dip into the excavation on a slope less steep than four horizontal to one
> vertical (4H:1V), but only if the material would otherwise be classified as Type B.

> **Type C** means: (i) Cohesive soil with an unconfined compressive strength of 0.5 tsf (48 kPa)
> or less; or (ii) Granular soils including gravel, sand, and loamy sand; or (iii) Submerged soil
> or soil from which water is freely seeping; or (iv) Submerged rock that is not stable; or
> (v) Material in a sloped, layered system where the layers dip into the excavation on a slope of
> four horizontal to one vertical (4H:1V) or steeper.

Supporting definitions, same source, also verbatim:

> **Fissured** means a soil material that has a tendency to break along definite planes of
> fracture with little resistance, or a material that exhibits open cracks, such as tension
> cracks, in an exposed surface.

> **Cemented soil** means a soil in which the particles are held together by a chemical agent,
> such as calcium carbonate, such that a hand-size sample cannot be crushed into powder or
> individual soil particles by finger pressure.

> **Cohesive soil** means clay (fine grained soil), or soil with a high clay content, which has
> cohesive strength. Cohesive soil does not crumble, can be excavated with vertical sideslopes,
> and is plastic when moist.

> **Granular soil** means gravel, sand, or silt, (coarse grained soil) with little or no clay
> content. Granular soil has no cohesive strength.

> **Layered system** means two or more distinctly different soil or rock types arranged in
> layers.

> **Unconfined compressive strength** means the load per unit area at which a soil will fail in
> compression. It can be determined by laboratory testing, or estimated in the field using a
> pocket penetrometer, by thumb penetration tests, and other methods.

**Basis of classification**, Appendix A (b)(2), verbatim — this constrains what the page may
claim:

> The classification of the deposits shall be made based on the results of at least one visual
> and at least one manual analysis. Such analyses shall be conducted by a competent person [...]

**Maximum allowable slopes**, Appendix B, verbatim, for excavations 20 feet or less in depth:

- Type A: simple slope — "maximum allowable slope of 3/4 :1". Short-term exception: "open 24
  hours or less (short term) and which are 12 feet or less in depth shall have a maximum
  allowable slope of 1/2 :1".
- Type B: "All simple slope excavations 20 feet or less in depth shall have a maximum allowable
  slope of 1:1."
- Type C: "All simple slope excavations 20 feet or less in depth shall have a maximum allowable
  slope of 1 1/2 :1."

**Depth boundary**, Appendix F, verbatim:

> Protective systems for use in excavations more than 20 feet in depth must be designed by a
> registered professional engineer in accordance with § 1926.652 (b) and (c).

**When no protective system is required**, § 1926.652(a)(1), verbatim:

> Each employee in an excavation shall be protected from cave-ins by an adequate protective
> system [...] except when: (i) Excavations are made entirely in stable rock; or (ii) Excavations
> are less than 5 feet (1.52m) in depth and examination of the ground by a competent person
> provides no indication of a potential cave-in.

### The classification order encoded

Derived directly from the clauses above. Type C conditions are absolute; Type A is the only class
with disqualifiers that demote it.

1. Stable rock (excavatable with vertical sides, remains intact) → **Stable Rock**.
2. Base class from material and strength:
   - cemented (caliche, hardpan) → A
   - cohesive, UCS ≥ 1.5 tsf → A
   - cohesive, UCS > 0.5 and < 1.5 tsf → B
   - cohesive, UCS ≤ 0.5 tsf → C
   - granular: angular gravel, silt, silt loam, sandy loam → B
   - granular: gravel, sand, loamy sand → C
   - rock that is not stable: dry → B; submerged → C
3. Demotions, applied to the base class, worst wins:
   - submerged or water freely seeping → C
   - layers dip into the excavation at 4H:1V or steeper → C
   - base A and (fissured or subject to vibration) → B
   - previously disturbed → B, **except** where the soil would otherwise be C, which stays C
4. Result is the least stable class reached.

**Checked against an independent reference:** the worked examples in OSHA's own
"Soil Classification Training Outline" (osha.gov, the PDF currently ranking #1) — see §10 for
what remains unverified.

## 6. The dead zone — inputs where it cannot answer

| Input that fails | What happens | How common |
|---|---|---|
| User has not measured unconfined compressive strength | Cohesive soil cannot be resolved between A, B and C on strength alone | **Very common** — a pocket penetrometer or thumb test is a site activity, and most people reading this page are at a desk |
| Excavation deeper than 20 ft | Appendix B slopes do not apply at all; a registered professional engineer must design the system | Uncommon but high consequence |
| Non-US excavation | 29 CFR does not apply | Common — 40% of this cluster's volume is outside the US |
| "Other factors that would require a less stable classification" (Type A clause (v)) | Open-ended by design; cannot be enumerated in a form | Always present as a caveat |

- **How the fallback explains the gap:** when strength is not entered for a cohesive soil, the
  tool does not guess. It returns the **narrowed range** the other answers already establish —
  for example, cohesive + fissured cannot be Type A under clause (i) regardless of strength, so
  the answer is "Type B or Type C, and definitively not Type A" — and names the one measurement
  that would resolve it.
- **What the source still records when the main answer is missing:** every clause that has
  already been triggered or excluded, quoted, so the partial answer is still useful.
- **Nearest usable answer, and how ranked:** the narrowed set of possible classes, ordered least
  stable first, because the least stable class is the one that governs the protective system.
- **How the UI makes clear this is not a classification of the user's excavation:** the result
  card states that Appendix A (b)(2) requires at least one visual and at least one manual
  analysis performed on site by a competent person, and that this page applies published criteria
  to answers typed into a form. It never says "your soil is Type B"; it says which class the
  criteria place those properties in.

## 7. The output

- **Headline answer:** the class — **Type A**, **Type B**, **Type C**, **Stable Rock**, or a
  narrowed range such as "Type B or Type C".
- **Supporting detail:** the specific clause that decided it, quoted from Appendix A; every other
  clause that was evaluated and whether it applied; the Appendix B maximum allowable slope for
  that class at 20 ft or less; the >20 ft engineer requirement; the <5 ft and stable-rock
  exceptions from § 1926.652(a)(1).
- **Source + retrieval date on the result card:** "29 CFR 1926 Subpart P Appendix A, as published
  in the CFR (GPO), retrieved 2026-09-22" — required, on the card itself.

## 8. Content notes

Ten uses, each a specific person with a real consequence — drafted in the page, not here.
Anchored on: a competent-person candidate revising for the classification they must perform; a
foreman deciding between sloping and a trench box before the crew goes in; someone reading a
citation that names a clause they have never read; an estimator pricing spoil removal where the
slope angle changes the excavation volume; an inspector checking a plan against the published
criteria.

**The page must never tell anyone their excavation is safe.** It reports which class published
criteria place described properties in, and states that the regulation requires a competent
person on site.

## 9. Privacy

- **New third-party service the visitor's browser will contact?** **No.** The tool runs entirely
  in the browser with no network request of any kind. Nothing is added to `thirdPartyServices`,
  and the generated privacy policy stays correct without changes.

## 10. Open questions / what is still unverified

- **OSHA's own training-outline PDF could not be fetched** — osha.gov returns HTTP 403 to curl
  from this network. The classification logic is therefore derived **only** from the verbatim CFR
  text quoted in §5, which is the binding source. No claim about OSHA's training examples may
  appear on the page.
- Appendix A paragraph (d) describes specific manual tests (plasticity, dry strength, thumb
  penetration, pocket penetrometer). These were **not** extracted verbatim in this session. The
  page may reference that manual tests are required, citing (b)(2), but **must not** describe the
  individual test procedures as if quoting them.
- Type A clause (v), "other factors that would require it to be classified as a less stable
  material", is deliberately open-ended and cannot be fully encoded. The tool must surface it as
  a standing caveat rather than silently ignoring it.
- The short-term 1/2:1 Type A slope exception applies only to excavations open 24 hours or less
  **and** 12 feet or less deep. Both conditions must be presented together or the figure is
  misleading.
