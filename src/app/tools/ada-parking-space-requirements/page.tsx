import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import AdaParkingTool from "@/components/AdaParkingTool";
import { requireTool } from "@/config/tools";

const SLUG = "ada-parking-space-requirements";
// Fails the build if the registry entry is missing, so a page can never exist
// without being wired into the nav, footer and sitemap.
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "ADA Parking Space Requirements: How Many Accessible Spaces You Need",
  description:
    "Enter the total spaces in a parking lot and get the minimum number of accessible and van-accessible spaces from the 2010 ADA Standards Table 208.2, plus the space and aisle widths. Free, no sign-up.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function AdaParkingSpaceRequirementsPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out the required accessible spaces",
        steps: [
          {
            name: "Count the spaces in one parking facility",
            text: "Count every space in the lot or garage, including any accessible spaces already striped. If the site has more than one separate lot or garage, count each one on its own — the standard calculates the requirement per facility, not from the site total.",
          },
          {
            name: "Choose what the parking serves",
            text: "Most facilities use Table 208.2. Hospital outpatient facilities and rehabilitation or outpatient physical therapy facilities use a percentage of their patient and visitor spaces instead. A doctor's office or clinic that is not part of a hospital uses the table.",
          },
          {
            name: "Read the accessible total and the van count",
            text: "The result gives the minimum accessible spaces and how many of them must be van-accessible — one for every six, or fraction of six. Van spaces are part of the accessible total, not extra.",
          },
          {
            name: "Check the widths",
            text: "Car spaces need 96 inches of width, van spaces 132 inches (or 96 inches with a 96-inch aisle), and every accessible space needs an access aisle at least 60 inches wide. Two spaces can share one aisle.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where the accessible-space count matters",
        items: [
          {
            title: "Restriping a small business parking lot",
            body: "Restriping is the moment a lot's layout is easiest to change. Knowing the minimum count for the number of spaces being painted avoids a fresh layout that still falls short.",
          },
          {
            title: "Responding to an accessibility complaint about a lot",
            body: "A complaint or demand letter often cites the number of accessible spaces. Working the Table 208.2 arithmetic for the actual space count shows exactly what the standard's minimum is before deciding how to respond with a lawyer.",
          },
          {
            title: "A paving contractor quoting a new lot",
            body: "The accessible and van counts change how many aisles, signs and wider stalls a job needs. Getting the count right in the quote avoids a change order after the layout is approved.",
          },
          {
            title: "An architect or designer checking a site plan",
            body: "A plan that moves from 500 to 501 spaces crosses from a fixed table row into the 2 percent band and jumps from 9 to 11 required accessible spaces. Checking the count after every layout change catches that jump.",
          },
          {
            title: "A church adding an overflow lot",
            body: "A separate overflow lot is its own parking facility, with its own minimum. Counting it with the main lot gives the wrong answer for both.",
          },
          {
            title: "A property manager auditing several lots on one site",
            body: "An office park with three separate lots calculates three requirements, which can add up to more accessible spaces than one combined calculation would. Running each lot separately matches how the standard counts.",
          },
          {
            title: "A clinic inside a hospital planning patient parking",
            body: "Hospital outpatient facilities use 10 percent of patient and visitor spaces, not Table 208.2 — for 85 spaces that is 9 instead of 4. Knowing which rule applies changes the layout considerably.",
          },
          {
            title: "A physical therapy practice leasing a building with parking",
            body: "Outpatient physical therapy facilities use 20 percent of patient and visitor spaces. Checking the existing lot against that figure before signing a lease shows how much restriping the space would need.",
          },
          {
            title: "Converting regular stalls to accessible ones",
            body: "Accessible spaces with their aisles take more width than standard stalls, so adding them often removes regular spaces. Calculating the required count first gives the number to design around.",
          },
          {
            title: "Settling an argument about whether van spaces count extra",
            body: "The van requirement is a subset of the accessible total under §208.2.4. A lot needing 5 accessible spaces needs 1 van space among those 5, not 6 accessible spaces in total.",
          },
        ],
      }}
      dataSection={{
        heading: "Where these numbers come from",
        paragraphs: [
          "The counts come from the 2010 ADA Standards for Accessible Design, published by the U.S. Department of Justice, read from ADA.gov on 2026-10-03. Table 208.2 sets the minimum accessible spaces by the total spaces in a parking facility: 1 for 1 to 25 spaces, rising by one per band to 9 for 401 to 500, then 2 percent of the total for 501 to 1,000, and 20 plus 1 for each 100 or fraction thereof over 1,000. Section 208.2.1 sets 10 percent of patient and visitor spaces for hospital outpatient facilities, and 208.2.2 sets 20 percent for rehabilitation and outpatient physical therapy facilities. Section 208.2.4 requires one van space for every six or fraction of six accessible spaces. Section 104.2 says that where a ratio or percentage leaves a fraction, the next greater whole number is provided — which is why 2 percent of 501 spaces (10.02) becomes 11.",
          "The page applies those rules to the number you enter, in your browser. Nothing is sent anywhere or stored. The widths shown are from §502.2 and §502.3: 96-inch car spaces, 132-inch van spaces (or 96 inches with a 96-inch aisle), and access aisles at least 60 inches wide.",
          "The limits are real. The count is per parking facility, as the advisory to §208.2 states, so a site with several lots needs one calculation per lot. Resident parking at residential facilities follows §208.2.3 and depends on the number of dwelling units with mobility features, which this page does not calculate; guest and employee parking at those facilities does use Table 208.2. The page does not address the location, signage, slope or vertical clearance rules in §208.3 and §502, and state or local building codes can set different or higher requirements.",
          "This page is not legal advice and must not be used to decide whether a specific lot complies with the ADA. It reports the arithmetic of the cited sections for the count you enter. For a compliance question, the official text and an accessibility specialist or attorney are the right sources.",
        ],
        sources: [
          {
            label: "ADA.gov — 2010 ADA Standards for Accessible Design",
            href: "https://www.ada.gov/law-and-regs/design-standards/2010-stds/",
            note: "Table 208.2, §208.2.1–208.2.4, §104.2 and §502, the source of every figure on this page",
          },
          {
            label: "U.S. Access Board — Guide to the ADA Standards, Chapter 5: Parking Spaces",
            href: "https://www.access-board.gov/ada/guides/chapter-5-parking/",
            note: "the federal Access Board's plain-language guide to the same requirements",
          },
          {
            label: "ADA National Network — Accessible Parking fact sheet",
            href: "https://adata.org/factsheet/parking",
            note: "a further plain-language summary of the same table",
          },
        ],
      }}
      faqs={[
        {
          question: "How many ADA parking spaces are required?",
          answer:
            "It depends on the total spaces in the parking facility. Under Table 208.2 of the 2010 ADA Standards: 1 for up to 25 spaces, 2 for 26–50, 3 for 51–75, 4 for 76–100, 5 for 101–150, 6 for 151–200, 7 for 201–300, 8 for 301–400, 9 for 401–500, 2 percent of the total for 501–1,000, and 20 plus 1 per 100 (or fraction) over 1,000. Medical facilities have their own percentages.",
        },
        {
          question: "Do van-accessible spaces count toward the total?",
          answer:
            "Yes. Section 208.2.4 says that of the accessible spaces required, at least one in every six (or fraction of six) must be a van space. They are part of the total, not added to it. A lot needing 7 accessible spaces needs 2 of them to be van-accessible.",
        },
        {
          question: "Does a small lot with only a few spaces need an accessible space?",
          answer:
            "Table 208.2 starts at 1 to 25 spaces, which requires 1 accessible space, and because of §208.2.4 that one space must be van-accessible. The table does not set a lower cut-off.",
        },
        {
          question: "If my site has two lots, do I add them together?",
          answer:
            "No. The advisory to §208.2 states that the number is calculated separately for each parking facility, not from the total of all facilities on the site. Run the calculator once per lot or garage.",
        },
        {
          question: "How wide does an ADA parking space have to be?",
          answer:
            "Under §502.2, car spaces are 96 inches wide minimum and van spaces 132 inches minimum, or 96 inches where the access aisle beside it is 96 inches wide. Under §502.3, access aisles are 60 inches wide minimum and run the full length of the space; two spaces may share one aisle.",
        },
        {
          question: "Is a doctor's office a hospital outpatient facility?",
          answer:
            "Not under the standard's advisory to §208.2.1, which says doctors' offices, independent clinics and other facilities not located in hospitals are not hospital outpatient facilities for this purpose. They use Table 208.2.",
        },
        {
          question: "Is this the same as my state's requirement?",
          answer:
            "Not necessarily. This page uses the federal 2010 ADA Standards. Many states and cities have their own accessibility codes, which can require more. Where they differ, both may apply — check with your local building department.",
        },
      ]}
    >
      <AdaParkingTool />
    </ToolPageLayout>
  );
}
