import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import RoofPitchTool from "@/components/RoofPitchTool";
import { requireTool } from "@/config/tools";

const SLUG = "roof-pitch-calculator";
// Fails the build if the registry entry is missing, so a page can never exist
// without being wired into the nav, footer and sitemap.
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Roof Pitch Calculator: Pitch, Angle, Rafter Length and IRC Minimums",
  description:
    "Enter the rise and run, or the angle, and get the pitch as x-in-12, the angle in degrees, the slope percentage and the rafter length — plus which roof coverings the 2021 IRC allows at that slope. Free, no sign-up.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function RoofPitchCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find your roof pitch",
        steps: [
          {
            name: "Measure the rise and run",
            text: "Run is the horizontal distance from the wall's outer edge to a point directly under the ridge; rise is the vertical height gained over that same distance. A rafter square or a level and tape measure both work — measure along a 12-inch (or 1-metre) section of run if that is easier than measuring the whole roof.",
          },
          {
            name: "Keep both measurements in the same unit",
            text: "Rise in inches against run in feet is the single easiest way to get a wildly wrong answer, because the error is a clean factor of 12 and the result still looks plausible. Pick one unit for both fields.",
          },
          {
            name: "Or enter the angle instead",
            text: "If you already have the angle from a digital level or an app, use the angle mode instead of rise and run. Add a run figure as well if you also want a rafter length out of it.",
          },
          {
            name: "Read the pitch as x-in-12",
            text: "This is the form the US construction trade actually uses — a 6:12 roof rises 6 inches for every 12 inches of horizontal run. The angle in degrees and the slope as a percentage are the same measurement in two other common forms, shown alongside it.",
          },
          {
            name: "Check the IRC panel against your roofing material",
            text: "The result includes the 2021 International Residential Code's minimum slope for each common covering, with the exact code section. This tells you what the model code allows — not what your specific jurisdiction, wind zone, snow load or product's own instructions might additionally require.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where the exact pitch is the thing you need",
        items: [
          {
            title: "Checking whether a shed roof can actually take the shingles already bought",
            body: "A shed built at 2:12 sits right at the IRC's floor for asphalt shingles, and right below the 3:12 floor for wood shingles or metal shingles. Running the actual rise and run through the code table before the material goes up avoids a roof that fails inspection or leaks within a season.",
          },
          {
            title: "Settling a disagreement with a contractor's quoted pitch before signing",
            body: "A quote that states '6/12 pitch' is easy to verify against a tape measure and a level on the existing structure. Measuring the real rise and run and comparing the result to what was quoted turns a verbal claim into a number either side can check.",
          },
          {
            title: "Working out rafter length before ordering lumber for a lean-to",
            body: "Rafter length comes straight from the Pythagorean theorem once rise and run are known, and ordering lumber a few inches short because the pitch was guessed rather than measured is an expensive way to find out.",
          },
          {
            title: "Deciding if a steep A-frame cabin roof needs special shingle installation",
            body: "The IRC specifically calls out 21:12 (175 percent) as the point where asphalt shingles must follow the manufacturer's own installation instructions rather than standard fastening. A steep cabin or playhouse roof is exactly the shape that can cross that line without looking obviously extreme.",
          },
          {
            title: "Converting a roof angle from a laser level into a buildable ratio",
            body: "Many digital angle finders report degrees, but lumber, trim and rafter-square markings are cut and labeled in the x-in-12 convention. Converting once, correctly, avoids compounding a rounding error across every rafter in the roof.",
          },
          {
            title: "Checking a flat-roof drainage slope against the built-up-roof minimum",
            body: "The IRC sets a 1/4:12 minimum slope for built-up roofs specifically for drainage, not appearance. A roof that reads as visually flat can still be measured against that 2-percent floor to see whether it actually sheds water by design or is relying on the membrane alone.",
          },
          {
            title: "Comparing a pergola or porch roof slope against the main house roof",
            body: "An attached structure is often built shallower than the main roof for headroom reasons. Calculating both pitches side by side shows exactly how much shallower, which matters for whichever covering material is being carried over from the main roof.",
          },
          {
            title: "Reading a roof pitch off an old set of plans that only gives an angle",
            body: "Older or hand-drawn plans sometimes specify a roof in degrees rather than the x-in-12 form a lumberyard or framer expects. Converting it once against a cited formula, rather than approximating, keeps the rest of the framing calculations consistent with the original design.",
          },
          {
            title: "Checking whether a low-slope metal roof needs lap sealant or a standing seam",
            body: "The IRC treats lapped metal panels very differently depending on whether lap sealant is used — 3:12 without it, 1/2:12 with it — and standing-seam systems separately again, at 1/4:12. A slope that fails one of those three rows can pass another, which changes which product is actually viable.",
          },
          {
            title: "Sanity-checking a roofline before a solar installer's site visit",
            body: "Panel-mounting quotes and structural questions both depend on the roof's actual pitch. Having a measured, calculated figure in hand before a site visit — rather than an eyeballed guess — makes the installer's own assessment easier to compare against.",
          },
        ],
      }}
      dataSection={{
        heading: "Where these numbers come from",
        paragraphs: [
          "The pitch, angle, slope percentage and rafter length are standard right-triangle trigonometry applied to rise and run: pitch as x-in-12 is (rise ÷ run) × 12, the angle is the arctangent of rise over run, slope percent is (rise ÷ run) × 100, and rafter length is the Pythagorean theorem, √(rise² + run²). None of that needs a citation beyond the x-in-12 convention itself, which is standard US residential-construction usage and is the same form the International Residential Code uses throughout its own roofing chapter. The implementation was checked against Omni Calculator's own published worked example (run 6 m, rise 1.5 m, giving a rafter of 6.18 m, a pitch of 25 percent, an angle of 14 degrees and a 3:12 ratio) purely as an independent arithmetic cross-check, and separately by hand against a 6-in-12 roof, which is exactly 26.565 degrees and a 13.416-inch rafter for a 12-inch run.",
          "The minimum-slope table is a direct citation: the 2021 International Residential Code, Chapter 9 'Roof Assemblies', Section R905, read from ICC's free public Digital Codes reader on 2026-09-26. Each row states the exact code section — for example R905.2.2 for asphalt shingles' 2:12 floor, or R905.10.2's three separate minimums for metal panels depending on seam type and sealant. The table is compiled into this page rather than fetched live, the same approach this hub uses for the OSHA soil classifier and the water softener calculator, because the underlying figures are fixed published text rather than a dataset that changes per query.",
          "The limits are worth stating plainly. The International Residential Code is a model code: the International Code Council publishes it, but individual states and municipalities adopt it with their own amendments, which can raise a minimum slope above what is shown here. This page has no way to know which edition your jurisdiction has adopted, what local amendments apply, or what your specific wind zone or ground snow load requires — both of which can independently push a real minimum higher than the code floor. A roofing product's own manufacturer instructions can also require more than the code minimum, and where they do, the manufacturer's instructions govern, not the code table.",
          "What this page must not be used for is a substitute for a local building department, a licensed contractor's assessment, or a manufacturer's installation instructions. It reports what the cited code section says at the slope you calculated. It does not tell you what pitch to build, does not approve or reject a specific roof, and cannot account for anything the geometry and the cited table do not cover — structural loading, fire rating, ventilation, or any local amendment to the model code.",
        ],
        sources: [
          {
            label: "ICC Digital Codes — 2021 IRC, Chapter 9, Roof Assemblies",
            href: "https://codes.iccsafe.org/content/IRC2021P1/chapter-9-roof-assemblies",
            note: "the minimum-slope-by-covering figures used in the result table",
          },
          {
            label: "International Code Council",
            href: "https://www.iccsafe.org/",
            note: "publisher of the International Residential Code",
          },
          {
            label: "Omni Calculator — Roof Pitch Calculator",
            href: "https://www.omnicalculator.com/construction/roof-pitch",
            note: "used only as an independent cross-check of the geometry, not as a source for this page's figures",
          },
        ],
      }}
      faqs={[
        {
          question: "Is a 4:12 pitch the same as 33 percent?",
          answer:
            "Yes for the percentage, but not for the angle, and that's worth understanding rather than assuming. Slope percent is linear — it is just rise over run times 100, so 4:12 is exactly 33.3 percent. The angle is not linear against the ratio, because it comes from an arctangent: 4:12 is about 18.4 degrees, but doubling the pitch to 8:12 does not double the angle — 8:12 is about 33.7 degrees, not 36.8. The calculator shows all three so you never have to convert one to another by assuming a straight-line relationship that doesn't hold for degrees.",
        },
        {
          question: "Can I use this instead of checking with my local building department?",
          answer:
            "No. This page cites the 2021 International Residential Code, which is a model code — the version and amendments your specific city or county has actually adopted can differ, and local wind zone or snow load requirements can push a real minimum above what's shown here. The IRC panel tells you what the model code's floor is, not what your jurisdiction currently requires.",
        },
        {
          question: "Why does my slope show as allowed for one material but not another?",
          answer:
            "Because the IRC sets a different minimum slope for each covering, based on how that material sheds water. A 2:12 roof clears the asphalt shingle minimum (also 2:12) but falls under the 3:12 floor for wood shingles, wood shakes and metal shingles, and well under slate's 4:12. The table shows every material's own threshold rather than a single blended answer, because that is how the code itself is structured.",
        },
        {
          question: "What if my rise and run are in different units?",
          answer:
            "Convert one of them first, or use the unit selector so both fields share the same unit before calculating — the tool does not attempt to guess or auto-convert mismatched units, because a silent wrong guess is worse than asking you to fix it. A rise typed in inches against a run typed in feet gives an answer off by a factor of 12, and it will look like a plausible pitch rather than an obvious error.",
        },
        {
          question: "Does this work for a shed, lean-to or pergola, not just a house roof?",
          answer:
            "Yes — the geometry doesn't know or care what the structure is; it only needs a rise and a run (or an angle). The IRC minimum-slope table is written for residential roof coverings generally, so it applies just as directly to an outbuilding's roof as to a house, though very small structures are sometimes exempt from parts of the code entirely — that exemption is a question for your local building department, not something this page determines.",
        },
        {
          question: "What is the minimum roof pitch for snow?",
          answer:
            "The IRC's minimum-slope table isn't built around snow specifically — those minimums are about water shedding and material fastening. Snow load is handled elsewhere in the code, through structural design requirements based on your specific location's ground snow load, which this page does not calculate. A steeper pitch generally sheds snow more readily, but how much a given roof needs to structurally carry is a separate engineering question from the slope figure this tool reports.",
        },
        {
          question: "Can I reuse these figures?",
          answer:
            "The geometry is arithmetic and yours to use freely. The minimum-slope figures are drawn from the International Residential Code, published by the International Code Council — cite the code itself rather than this page, and check the current text at the link above, since code editions are periodically revised and this page reflects the 2021 edition as read on the date shown on the result card.",
        },
      ]}
    >
      <RoofPitchTool />
    </ToolPageLayout>
  );
}
