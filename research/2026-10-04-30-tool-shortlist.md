# 30-tool shortlist: low-competition keyword sweep, 2026-10-04

A shortlist, not 30 research files. Each pick still needs its own `research/<slug>.md` (from
`_TEMPLATE.md`) with the source verified **before** `/add-tool`. Nothing here was built.

## How this was found (all real data, pulled 2026-10-04)

1. **Semrush Keyword Magic (US db)** through Mudassar's balochseotools login. ~6,300 keywords
   collected from 29 tool-type seeds (calculator, chart, lookup, decoder, date code, "how many",
   requirements, spacing, btu/gpm/cfm, wire size …) plus 80 "<trade> calculator" seeds for local
   businesses (pool, HVAC, roofing, paving, salon, restaurant, trucking, towing, welding …).
   Filter: **KD 0–14, volume 100–20,000.**
2. **Top-10 SERP check for 215 candidates** (Semrush SERP data per keyword: ranking URL, page
   Authority Score, referring domains to that page). "Strong" = page AS ≥ 25, or ≥ 25 ref domains,
   or a big calculator/retail brand (omnicalculator, calculator.net, inchcalculator, Home Depot,
   Lowe's, Wikipedia …). **S-score = how many strong pages are in the top 10.**
3. **Google `allintitle:`** for 15 finalists (Google CAPTCHA-blocks after ~10 queries, so the rest
   rely on step 2).

Semrush KD alone is not trusted: e.g. *concrete block calculator* is KD 11 but has omnicalculator,
Lowe's and two exact-match domains with 189–289 ref domains. Those were dropped.

Format below: **volume/mo · KD · S-score · allintitle** — top 3 ranking pages as
`domain(pageAS/refdomains)`.

## The 30

### Pool service (7 tools, one weak cluster)
| # | Keyword (= slug) | Data | Top 3 now | Source to cite |
|---|---|---|---|---|
| 1 | pool salt calculator | 6,600 · KD 2 · S0 · 650 | pool.shop(0/0), apple app page(0/0), 123calculus(0/0) | Chlorinator manuals (Hayward/Pentair ppm tables); ppm math |
| 2 | pool shock calculator | 1,600 · KD 9 · S1 · 333 | freepoolcalculator(15/2), thepoolnerd(6/1), hthpools(7/4) | Product label dose per 10k gal; CDC MAHC |
| 3 | muriatic acid pool calculator | 720 · KD 3 · S1 · 363 | thepoolnerd(0/0), pooloperationmanagement(6/3), troublefreepool(58/63) | Acid demand tables (TFP/Orenda formula, cite) |
| 4 | pool alkalinity calculator | 590 · KD 2 · S1 | ahperformance(7/240), thepoolnerd(6/2), horizonpoolsupply(0/0) | Sodium bicarbonate dose (1.5 lb/10k gal raises ~10 ppm) |
| 5 | pool stabilizer calculator | 480 · KD 4 · S1 · 272 | horizonpoolsupply(21/1), poolchemicalcalculator(0/0), pooldial(3/3) | Cyanuric acid dose math |
| 6 | pool pump run time calculator | 480 · KD 5 · S1 · 843 | blue-white(9/7), lesliespool(14/18), pgpoolandspa(0/0) | Turnover = gallons ÷ GPM; MAHC turnover rates |
| 7 | pool heater size calculator | 320 · KD 14 · S0 · 1,020 | poolwarehouse(7/3), pentair(18/6), hayward(18/5) | energy.gov pool heater sizing formula |

### Farm / ranch (2)
| 8 | cow gestation calculator | 5,400 · KD 20 · S0 · 1,460 | angus.org(15/7), cattlemax(14/4), wisc.edu(17/5) | 283-day average (university extension). "cattle gestation calculator" is the same 5,400, same tool |
| 9 | sheep gestation calculator | 1,000 · KD 7 · S1 | duraferm(9/7), reprospecialty(7/2), farmkeep(0/0) | ~147 days (extension). Note: separate species page; check rule 7 before also doing goat (2,900, S3) / horse (880, S1) |

### HVAC / plumbing / electrical trades (4)
| 10 | r22 pt chart | 4,400 · KD 13 · S0 | igasusa(0/1), honeywell(16/1), hudsontech(0/0) | Manufacturer PT data or CoolProp (open-source). Siblings: r410a 3,600 (S1), r404a 1,900 (S0), r134a 1,900 (S1), r32 1,900 (S1); decide one tool vs one page each (rule 7) |
| 11 | well pump size calculator | 590 · KD 3 · S1 · 703 | dultmeier(6/1), flintandwalling(0/0), grundfos(12/5) | Fixture-count GPM + total dynamic head (pump maker guides) |
| 12 | 1/8 npt tap drill size → slug `npt-tap-drill-size` | 1,600 · KD 5 · S0 (+ "npt tap drill size chart" 480 · KD 3 · S0) | drillsandcutters(6/3), maxtow(0/0), garagejournal(0/0) | ASME B1.20.1 / Machinery's Handbook table |
| 13 | sine bar calculator | 390 · KD 8 · S0 | machiningdoctor(11/7), littlemachineshop(8/4), custompartnet(0/0) | Gauge block height = L × sin θ |

### Construction / paving / roofing / decks (8)
| 14 | asphalt tonnage calculator | 1,000 · KD 10 · S0 · 776 | asphaltisbest(16/6), pikeindustries(5/1), amerasphalt(0/1) | Area × depth × ~145 lb/ft³ (NAPA/state DOT) |
| 15 | asphalt millings calculator | 590 · KD 2 · S1 | homeprojectcalculators(16/3), gravelshop(6/2), amirecycling(0/0) | Volume × millings density (supplier spec) |
| 16 | garage door spring calculator | 880 · KD 3 · S0 · 2,740 (+ size calc 390, torsion 390, size chart 1,000, chart 480) | diygaragedoorparts(10/5), instockgaragedoors(0/0), ddmgaragedoors(0/0) | Torsion spring IPPT / wire-size formulas (spring engineering refs, DASMA) |
| 17 | door handing chart | 1,000 · KD 4 · S0 | trudoor(0/1), allegion(0/1), schererbros(0/0) | BHMA/ANSI A156.115 handing convention (LH/RH/LHR/RHR) |
| 18 | deck joist span calculator | 720 · KD 13 · S0 | decks.com(10/5), decksgo(12/8), ls-usa(7/1) | AWC DCA 6 span tables (free) |
| 19 | hip roof calculator | 480 · KD 14 · S0 | blocklayer(8/4), planetcalc(14/4), vcalc(0/0) | Roof geometry (pairs with live roof-pitch tool) |
| 20 | gutter coil calculator | 260 · KD 0 · S0 | lynchaluminum(9/1), senox(10/2), guttersupply(0/0) | Coil width per gutter size (manufacturer yield charts) |
| 21 | playground mulch calculator | 210 · KD 6 · S1 | jetmulch(1/2), gravelshop(0/0), aaastateofplay(0/1) | **CPSC Public Playground Safety Handbook** depth table (strong citation) |

### Small business: restaurants, pressure washing, trucking, freight, supplements (5)
| 22 | tip pool calculator | 390 · KD 8 · S0 · 447 (+ "tip pooling calculator" 260 · KD 4) | justthetipout(0/1), kayapush(0/0), reddit | Pure split math (hours / points); DOL FLSA tip-pool page for context |
| 23 | pressure washer nozzle calculator | 320 · KD 5 · S0 · **152** (+ "nozzle size calculator" 210 · KD 3) | mtmhydroparts(0/1), camspray(0/0), dultmeier(0/0) | Nozzle orifice tables (GPM ∝ √PSI), manufacturer charts |
| 24 | truck cost per mile calculator | 210 · KD 12 · S0 | thetruckersreport(11/7), motorcarrierhq(4/5), chrobinson(17/2) | Cost ÷ miles; ATRI operational-cost study for benchmarks |
| 25 | linear feet calculator freight | 480 · KD 9 · S1 | freightrun(5/7), wnad(15/1), cjctransport(0/0) | Pallet footprint / 2-across loading math |
| 26 | capsule size chart | 880 · KD 13 · S0 | lfacapsulefillers(8/2), capsuline(16/21), vivion(6/4) | Capsule volumes from Lonza/Capsugel spec sheets |

### Everyday / hobby (4)
| 27 | motorcycle wind chill chart | 2,400 · KD 4 · S1 | norcalpgr(8/6), reddit, motorcyclegrandtouring(2/1) | **NWS 2001 wind chill formula** (speed + temp in → chart + number) |
| 28 | christmas tree light calculator | 1,000 · KD 6 · S1 · 1,170 | christmaslightcontractor(0/1), holiday-light-express(1/3), certifiedlights(0/1) | Lights-per-foot rule; **seasonal, build in October** |
| 29 | aquarium gravel calculator | 720 · KD 13 · S1 · 1,010 (+ "fish tank gravel calculator" 720 · KD 9) | waterlifeaquarium(6/3), fishstores(0/0), seahorseaquariums(0/0) | Tank L × W × depth × substrate density |
| 30 | chainsaw file size chart | 1,000 · KD 14 · S0 | simsgardenmachinery(9/4), husqvarna(15/1), pinterest | Oregon/Stihl chain pitch → file size tables |

## Reserves (also weak, slightly lower value)
shower floor slope calculator 170 · KD 0 · S1 (IPC ¼ in/ft) · icf concrete calculator 210 · S0 ·
tire balancing beads calculator 390 · S1 · roof drain calculator 210 · S1 (IPC table 1106) ·
3 phase electrical power calculator 210 · S0 · plumbing drain slope calculator 210 · S1 ·
deck load calculator 480 · S1 · horse gestation calculator 880 · S1 ·
louis vuitton date code 1,300 · S0 (no official source for the code format, so held back by
the never-fabricate rule) · pool turnover calculator 210 · S0 (overlaps #6).

## Rejected despite low KD (strong SERP)
concrete block calculator, pea gravel calculator, post hole concrete, tire stretch, tire gear
ratio, pizza dough hydration, fence post depth, concrete step, booster seat requirements by state
(NHTSA / saferide4kids), wheel offset, freight class, pallet calculator, rug size chart,
ceiling fan size calculator, dog gestation (omnicalculator #1).

## Caveats
- Volumes and KD are Semrush US estimates; page AS is Semrush's page-level score.
- allintitle counts were only possible for 15 keywords before Google's CAPTCHA.
- Each tool still has to pass the add-tool five checks, especially the citable-source check.
