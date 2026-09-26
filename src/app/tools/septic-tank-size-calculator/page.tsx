import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import SepticTankTool from "@/components/SepticTankTool";
import { requireTool } from "@/config/tools";

const SLUG = "septic-tank-size-calculator";
// Fails the build if the registry entry is missing, so a page can never exist
// without being wired into the nav, footer and sitemap.
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Septic Tank Size Calculator: EPA's Bedroom-Based Table 4-13",
  description:
    "Enter the number of bedrooms and get the minimum septic tank capacity from EPA's Onsite Wastewater Treatment Systems Manual, Table 4-13 — the exact page and figures, not a paraphrase. Free, no sign-up.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function SepticTankSizeCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to look up a septic tank's minimum size",
        steps: [
          {
            name: "Count the bedrooms",
            text: "Table 4-13 is scoped to one- and two-family dwellings and sizes the tank by bedroom count, not square footage or occupancy. Use whatever your local code counts as a bedroom — this page doesn't adjudicate that, it just looks up the number you give it.",
          },
          {
            name: "Note whether the home has a garbage disposal",
            text: "The source manual states that most state codes require a larger tank when a garbage disposal is used, but it gives no specific gallon figure for the increase. Checking this box surfaces that sentence rather than silently ignoring it or inventing a number.",
          },
          {
            name: "Read the table figure, and the footnote if it applies",
            text: "1- and 2-bedroom homes both read 750 gallons in the table, but the table's own footnote says many states have raised the effective minimum to 1,000 gallons or more regardless. Both numbers are shown, not just the raw table row.",
          },
          {
            name: "For more than 8 bedrooms, use the separate rule of thumb instead",
            text: "Table 4-13 stops at 8 bedrooms. Past that, the manual gives a different, less specific rule for buildings other than one- or two-family homes — two to three times the estimated daily design flow — shown clearly as a separate, rougher estimate rather than a table lookup.",
          },
          {
            name: "Confirm the actual requirement with your local code",
            text: "This table is what a federal design manual reports as typical of most local codes, not a national mandate. The manual says outright that many jurisdictions have increased the minimum. Your local health department or code official has the number that actually governs a specific permit.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where the table figure is the thing you need",
        items: [
          {
            title: "Checking a contractor's quoted tank size before signing off",
            body: "A quote that specifies a 1,000-gallon tank for a 4-bedroom house is easy to check against the published table, which calls for 1,200 gallons at that bedroom count. Catching the gap before installation is far cheaper than after.",
          },
          {
            title: "Understanding why an inspector flagged an existing tank",
            body: "A home with a 750-gallon tank and 4 bedrooms — perhaps added onto after the tank was installed — is exactly the mismatch an inspection turns up. Seeing the table's own 1,200-gallon figure for that bedroom count explains the finding in plain terms.",
          },
          {
            title: "Sizing a tank for a home addition that adds a bedroom",
            body: "Going from 3 to 4 bedrooms moves the table figure from 1,000 to 1,200 gallons, a concrete number to bring to whoever pulls the permit for the addition.",
          },
          {
            title: "Budgeting for a larger tank because the house has a garbage disposal",
            body: "The manual is explicit that state codes commonly require a size increase for a garbage disposal, without giving a number. Knowing that fact before getting quotes avoids being surprised that a contractor's recommended size is larger than the table's plain bedroom figure.",
          },
          {
            title: "Explaining to a buyer why a 1-bedroom cottage still has a 1,000-gallon tank",
            body: "The table row reads 750 gallons for 1 bedroom, but its own footnote says many states have set 1,000 gallons as an outright minimum. A buyer asking why the installed tank doesn't match the 'chart size' they found online gets an accurate answer instead of a shrug.",
          },
          {
            title: "Comparing a real estate listing's septic details against a bedroom count",
            body: "A listing that states tank size and bedroom count can be checked against the published table in one lookup, ahead of a full inspection, as a first-pass sanity check rather than a final answer.",
          },
          {
            title: "Deciding what to ask a permitting office before a large home build",
            body: "A home with more than 8 bedrooms falls outside Table 4-13 entirely. Seeing that plainly, plus the manual's separate flow-based rule of thumb, is a better starting question for a permitting office than guessing from a chart that wasn't built for that size of house.",
          },
          {
            title: "Checking a paraphrased 'EPA septic size chart' found on a vendor's site",
            body: "Several sites that rank for this exact search restate the EPA figures with errors — one states 900 gallons for 3 bedrooms and 1,000 for 4, where the actual table says 1,000 and 1,200. Checking a specific bedroom count against the source table settles the discrepancy.",
          },
          {
            title: "Working out roughly what a non-residential building's tank should be",
            body: "A small business or accessory building isn't a one- or two-family dwelling, so the bedroom table doesn't apply. The manual's separate two-to-three-times-daily-flow rule of thumb gives a rough range to bring to a designer, clearly labelled as a different and less specific calculation.",
          },
          {
            title: "Settling a disagreement between two calculator sites that give different numbers",
            body: "Because several ranking pages paraphrase the same EPA table inconsistently, going to a page that reproduces the table's actual rows (and links the source PDF and page number) is the fastest way to find out which number, if either, is right.",
          },
        ],
      }}
      dataSection={{
        heading: "Where this table comes from",
        paragraphs: [
          "The tank-capacity figures come from Table 4-13 in the U.S. Environmental Protection Agency's Onsite Wastewater Treatment Systems Manual (EPA/625/R-00/008, February 2002), page 4-40. EPA attributes the table to the International Private Sewage Disposal Code (International Code Council, 1995) and describes it as typical of most local plumbing codes for one- and two-family residences: 750 gallons for one or two bedrooms, 1,000 for three, 1,200 for four, 1,425 for five, 1,650 for six, 1,875 for seven, and 2,100 for eight. The table carries its own footnote on the 750-gallon rows: many states have separately established 1,000 gallons as a minimum regardless of what the bedroom-based row reads, and this page shows that footnote rather than only the raw number. The daily design-flow range shown alongside the table (100 to 150 gallons per bedroom per day) is also the manual's own stated figure, from a different section of the same document.",
          "This is a lookup, not a live calculation: the table is compiled into the page exactly as it was read from the source PDF, and nothing is fetched from EPA or anywhere else while you use the tool. The manual itself is a free federal publication with no login or licence requirement.",
          "The limits are worth stating as plainly as the manual states them. This is explicitly a model reference, not a nationally binding number — EPA's own text says the table is 'typical of most local codes,' not universal, and that many jurisdictions have raised the effective minimum above what individual rows show. The table is also scoped specifically to one- and two-family dwellings; it says nothing about commercial buildings, multi-family housing, or homes above 8 bedrooms, all of which fall outside its stated range. Where the source itself notes a real effect without giving a number — a garbage disposal typically requiring a state-code size increase — this page states that fact and stops, rather than inventing a multiplier the source doesn't provide.",
          "What this page must not be used for is a permit application or a final purchasing decision. It reports what a federal design manual's own table says for the bedroom count entered. It does not know your state or county's actual adopted code, does not size a drainfield, and does not replace the local health department or code official whose approval actually governs a specific septic system.",
        ],
        sources: [
          {
            label: "USEPA — Onsite Wastewater Treatment Systems Manual (EPA/625/R-00/008)",
            href: "https://www.epa.gov/sites/default/files/2015-06/documents/2004_07_07_septics_septic_2002_osdm_all.pdf",
            note: "Table 4-13, page 4-40 — the tank-capacity-by-bedroom figures used here",
          },
          {
            label: "U.S. Environmental Protection Agency — Septic Systems",
            href: "https://www.epa.gov/septic",
            note: "EPA's general onsite wastewater treatment resource hub",
          },
        ],
      }}
      faqs={[
        {
          question: "Does this replace checking with my local health department?",
          answer:
            "No. The manual this page cites says outright that its table is 'typical of most local codes,' not a universal figure, and that many jurisdictions have raised the minimum tank size above individual table rows. The office that actually issues a septic permit has the number that governs your specific property.",
        },
        {
          question: "Why do 1-bedroom and 2-bedroom homes both show 750 gallons?",
          answer:
            "Because that's what Table 4-13 states for both rows. The table carries its own footnote on exactly those two rows: many states have separately set 1,000 gallons as a minimum tank size regardless of the bedroom-based figure, which is why this page shows both the raw table number and the footnote rather than only one or the other.",
        },
        {
          question: "What if the home has a garbage disposal?",
          answer:
            "The source manual states that most state codes require a size increase for this, but it does not give a specific gallon figure anywhere in the document. This page quotes that sentence and stops rather than inventing an adjustment number the source doesn't provide — check your local code for the actual required increase.",
        },
        {
          question: "What about a building that isn't a one- or two-family home?",
          answer:
            "Table 4-13 is explicitly scoped to one- and two-family dwellings. For anything else, the same manual gives a separate, rougher rule of thumb — two to three times the estimated daily design flow — which this page shows only when your bedroom count falls outside the table's own 1-to-8 range, and labels clearly as a different kind of estimate.",
        },
        {
          question: "Is this the same as the number a permit application will ask for?",
          answer:
            "It might match, or it might not — that depends entirely on what your state or county has adopted, and the manual is explicit that many places have amended this baseline upward. Treat this page as what a recognized federal reference reports, not as a substitute for your jurisdiction's actual adopted code.",
        },
        {
          question: "Why do other sites give different numbers for the same bedroom count?",
          answer:
            "Several pages that rank for this search state EPA figures that don't match the actual table — for example, some state 900 gallons for a 3-bedroom home where Table 4-13 actually says 1,000. This page reproduces the table's own rows directly from the source PDF, with the page number, rather than paraphrasing it.",
        },
        {
          question: "Can I reuse these figures?",
          answer:
            "The table is a public federal publication and the numbers are yours to use. Cite the source manual and table number rather than this page, and check the PDF directly if you need the surrounding design guidance this page doesn't reproduce in full.",
        },
      ]}
    >
      <SepticTankTool />
    </ToolPageLayout>
  );
}
