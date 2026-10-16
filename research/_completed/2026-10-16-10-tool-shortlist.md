# 10-tool shortlist: fresh corners sweep, 2026-10-16

None of these overlap the 72 live tools or the earlier shortlists. All were built in the same
session, each against the source listed (verified before code).

## How this was found (all real data, pulled 2026-10-16)

1. **Semrush Keyword Magic (US db)** via balochseotools (sr03). 113 seeds aimed at corners not
   swept before: bikes, homebrewing, knitting/crochet/quilting, candles, firewood, hay, small
   livestock gestation, RV/trailer, landscaping (topsoil, pavers, flagstone, sod, seed, lime),
   HVAC/plumbing sizing, interior trim (baseboard, crown, wainscoting, shiplap), framing spans
   (rafter, joist, beam, header, truss), boating/paddling/fishing, welding, machining, chain,
   belt, pulley and sprocket. Filter KD ≤ 20, volume ≥ 100 → **15,319 keywords**; tool-shaped
   with KD ≤ 14 and volume ≥ 200 → **572**.
2. **Top-10 SERP check for 70 candidates** (Semrush page AS / referring domains).
   "Strong" = page AS ≥ 25, or ≥ 25 ref domains, or a big calculator/retail brand.
   **S = number of strong pages in the top 10.**

Format: **volume/mo · KD · S**, with notable ranking pages as `domain(pageAS/refdomains)`.

## The 10 built

| # | Slug | Data | Who ranks now | Source used |
|---|---|---|---|---|
| 1 | goat-gestation-calculator | 2,900 · KD 14 · S1 (+ goat gestation chart 590) | americangoatsociety(15/38), abga(7/9), small breeder sites | Merck Veterinary Manual, "Pregnancy in Goats" (145–155 d, avg 150) + gestation table |
| 2 | pig-gestation-calculator | 210 · KD 6 · S1 (+ gestation chart for pigs 320, gestation calculator for pigs 260, pigs gestation calculator 260) | cpsswine(10/5), farmkeep(7/1), omnicalculator(34/9) | Merck table (pig 114 d) + Pork Industry Handbook "Calculating Swine Schedules" (113–116 d) |
| 3 | knitting-needle-size-chart | 3,600 · KD 12 · S1 (+ knitting pin sizes 2,400, 1.5 mm knitting needle size 1,900) | sheepandstitch(16/31), vogueknitting(14/7), knitpro(8/2) | Craft Yarn Council "Hooks & Needles" standard (mm ↔ US) |
| 4 | deck-beam-span-chart | 1,900 · KD 14 · **S0** (+ deck beam span calculator 480 S0, beam span chart deck 590) | decks.com(17/3), iccsafe(12/3), up.codes(12/5) | IRC 2024 Tables R507.5(1)–(4), cross-checked cell by cell against IRC 2021 |
| 5 | firewood-calculator | 1,600 · KD 10 · S3 (+ firewood calculator cord 1,900, cord of wood calculator 880 S2, how much is a face cord 1,300) | bostonfirewood(0/0), chimneyworks(3/4), omnicalculator(43/18) | NIST Handbook 130 cord definition (128 ft³), as adopted in Connecticut's regulation |
| 6 | baseboard-calculator | 1,300 · KD 14 · S1 | themouldingcompany(16/4), turn2engineering(21/1), inchcalculator(45/24) | Arithmetic (perimeter − openings, + waste, ÷ stock length) |
| 7 | how-many-screws-per-sheet-of-drywall | 1,000 · KD 5 · **S0** | reddit, thespruce(19/15), steeler(4/3) | IRC 2024 Table R702.3.5 maximum fastener spacing |
| 8 | roller-chain-size-chart | 720 · KD 10 · **S0** (+ chain size chart 1,900 S1, how to measure chain size 480) | peerchain(15/9), usarollerchain(14/2), ustsubaki(6/3) | Tsubaki Europe "ANSI G8" dimension table (RS25–RS240) |
| 9 | crown-molding-angle-chart | 590 · KD 13 · **S0** (+ crown molding calculator 390) | thisiscarpentry(7/6), blocklayer(8/8), dewalt.ca(0/0) | Compound-miter formulas (as given in Wikipedia "Crown molding"); check: 38° spring at 90° → 31.6° / 33.9° |
| 10 | fishing-reel-line-capacity-calculator | 320 · KD 0 · **S0** | weak calculator sites (0/0) | Spool volume ∝ diameter² × length (cylinder volume) |

## Dropped during source verification
- **quilt size chart / quilt sizes** (1,900 / 4,400, S1): the only standard for mattress sizes
  (ISPA voluntary dimensional guideline) is paywalled; no free citable source → swapped for #2.

## Reserves (weak SERP, not built)
ceiling joist span chart 1,000 S1 · scfm to cfm calculator 320 S1 · tree spacing calculator 320 S1 ·
dehumidifier size calculator 210 S1 · chicken feed calculator 260 S0 · danforth anchor size chart
260 S0 · rv battery size chart 260 S0 · roller chain was 720 S0 (built) · welding rod size chart
210 S0 · fabric yardage conversion chart 210 S0 · air compressor cfm calculator 210 S0 ·
stair baluster spacing 210 S0 · french drain gravel calculator 210 S1 · flagstone calculator 320 S1 ·
lvl beam span chart 1,600 S0 (manufacturer-specific, skipped) · rafter calculator 5,400 S1 (mycarpentry 45/51).

## Rejected (strong SERP)
topsoil calculator (S5), paver sand calculator (S5), plant spacing calculator (S5), drywall screw
calculator (S6), priming sugar calculator (S4), pulley rpm calculator (S4), strike water (S3),
sprocket calculator (S3, sprocketcalculator.com 67/1595), thread pitch calculator (S3).

## Caveats
- Volumes / KD are Semrush US estimates; page AS is Semrush page-level.
- No Google allintitle checks this round.
