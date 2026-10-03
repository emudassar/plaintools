import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import EgressWindowTool from "@/components/EgressWindowTool";
import { requireTool } from "@/config/tools";

const SLUG = "egress-window-calculator";
// Fails the build if the registry entry is missing, so a page can never exist
// without being wired into the nav, footer and sitemap.
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Egress Window Calculator: Check Size Against IRC R310 Requirements",
  description:
    "Enter a window's clear opening width, height and sill height and see which 2021 IRC egress requirements it meets — 5.7 sq ft area, 20 in width, 24 in height, 44 in sill — plus window well size. Free, no sign-up.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function EgressWindowCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to check an egress window",
        steps: [
          {
            name: "Open the window the normal way",
            text: "The code measures the opening produced by normal operation of the window. Open a casement fully, raise a double-hung sash as far as it goes, slide a slider all the way across. Do not remove sashes or use a tilt-out position.",
          },
          {
            name: "Measure the net clear width and height",
            text: "Measure the clear space a person could pass through, inside the sash and frame. This is always smaller than the glass size, the frame size and the rough opening listed on a window order — those larger figures are the most common reason a window that looks big enough fails.",
          },
          {
            name: "Measure from the floor to the bottom of the opening",
            text: "Measure from the finished floor inside the room to the lowest point of the clear opening. The IRC limit is 44 inches.",
          },
          {
            name: "Say where the ground is outside",
            text: "Enter whether the bottom of the opening is above or below the ground outside, and by how much. Within 44 inches either way makes it a grade-floor opening, which has a lower area minimum. Below the ground means an area well is required, and you can enter its inside dimensions too.",
          },
          {
            name: "Read each requirement separately",
            text: "The result checks area, width, height and sill height one by one, each with its IRC section. A window can pass both minimum dimensions and still fail on area — a 20 by 24 inch opening is only 3.33 square feet.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where the egress numbers decide the outcome",
        items: [
          {
            title: "Finishing a basement bedroom before the permit inspection",
            body: "A basement sleeping room needs its own emergency escape opening under R310.1. Checking the planned window and its well against the numbers before the wall is framed is far cheaper than cutting a larger opening in a foundation wall after an inspector fails it.",
          },
          {
            title: "Checking a listing that calls a basement room a bedroom",
            body: "A buyer can measure the one window in that room during a showing. If the clear opening is well under 5.7 square feet, the bedroom count in the listing deserves a question before an offer is priced on it.",
          },
          {
            title: "Ordering a replacement window without shrinking the opening",
            body: "A new window with a thicker frame can produce a smaller clear opening than the one it replaces. Measuring the old opening and comparing it with the new unit's published clear-opening figures shows whether the swap loses compliance.",
          },
          {
            title: "Seeing why a 20 by 24 inch window fails",
            body: "Both figures meet the minimum width and height, which is why many people assume the window passes. The area works out to 3.33 square feet, well short of 5.7. Running the numbers shows that the minimums are separate tests, not one test.",
          },
          {
            title: "Sizing a window well for a basement egress window",
            body: "A well needs at least 9 square feet of horizontal area and at least 36 inches of projection and width. A pre-made well that is 36 inches wide but only 24 inches deep from the wall fails on projection even though it looks substantial.",
          },
          {
            title: "Finding out whether a deep window well needs a ladder",
            body: "Above 44 inches of depth the code requires a permanently affixed ladder or steps. Knowing that before digging decides whether the well kit being bought needs a ladder add-on.",
          },
          {
            title: "Converting an attic into a habitable room",
            body: "Habitable attics need an emergency escape opening too. A gable-end window that sits high on the wall can meet every size rule and still fail the 44-inch sill limit, which is where a platform or step is often discussed with the building department.",
          },
          {
            title: "A landlord preparing for a rental inspection",
            body: "Where a local rental inspection checks sleeping rooms for an escape opening, measuring each bedroom window ahead of time shows which rooms are worth a closer look before the inspector arrives.",
          },
          {
            title: "Comparing two window styles for the same rough opening",
            body: "A casement opens almost the full frame, while a slider or double-hung opens roughly half of it. Entering the clear opening each style would produce for the same wall opening shows which one can meet the area minimum.",
          },
          {
            title: "Checking a ground-level window under a deck",
            body: "An opening under a deck or porch has its own rule in R310.2.4: it must be fully openable and lead out through a path at least 36 inches high and 36 inches wide. The size check here is the first half; the path under the deck is the second.",
          },
        ],
      }}
      dataSection={{
        heading: "Where these numbers come from",
        paragraphs: [
          "Every limit on this page comes from the 2021 International Residential Code, Section R310 'Emergency Escape and Rescue Openings', read from the International Code Council's free public Digital Codes reader on 2026-10-03. R310.2.1 sets a net clear opening of not less than 5.7 square feet, with an exception of 5 square feet for grade-floor openings. R310.2.2 sets a minimum net clear height of 24 inches and width of 20 inches, measured as the result of normal operation of the opening. R310.2.3 limits the bottom of the clear opening to 44 inches above the floor. The grade-floor definition — bottom of the clear opening not more than 44 inches above or below the finished ground level adjacent to it — is from the code's Chapter 2. Area wells are R310.4.1 (9 square feet, 36 inches of projection and width) and R310.4.2 (a ladder or steps when deeper than 44 inches).",
          "The page computes the area as width times height divided by 144, then compares each measurement with its own limit. All of it runs in your browser against figures compiled into the page; nothing you type is sent anywhere or stored.",
          "The limits matter as much as the numbers. The IRC is a model code that states and cities adopt with their own amendments, and some still enforce an older edition — the governing requirement is whatever your jurisdiction has adopted. The check is only as accurate as the measurement: entering a frame or rough-opening size instead of the net clear opening will make a non-compliant window look compliant. The page does not cover the replacement-window provisions in R310.5, the dwelling-addition and existing-basement provisions in R310.6 and R310.7, the sprinkler exception in R310.1, operating-hardware rules in R310.1.1, or the bars, grilles and covers rules in R310.4.4.",
          "This page must not be used in place of a building official's decision or a permit review. It reports which of the cited minimums the entered measurements meet. It does not say whether a room may be used as a bedroom, approve a window or well, or account for local amendments.",
        ],
        sources: [
          {
            label: "ICC Digital Codes — 2021 IRC, Chapter 3, Building Planning (Section R310)",
            href: "https://codes.iccsafe.org/content/IRC2021P1/chapter-3-building-planning",
            note: "the egress opening and area well requirements",
          },
          {
            label: "ICC Digital Codes — 2021 IRC, Chapter 2, Definitions",
            href: "https://codes.iccsafe.org/content/IRC2021P1/chapter-2-definitions",
            note: "the definition of a grade-floor emergency escape and rescue opening",
          },
          {
            label: "International Code Council",
            href: "https://www.iccsafe.org/",
            note: "publisher of the International Residential Code",
          },
        ],
      }}
      faqs={[
        {
          question: "What size does an egress window need to be?",
          answer:
            "Under the 2021 IRC, the net clear opening must be at least 5.7 square feet (5 square feet for a grade-floor opening), at least 24 inches high and at least 20 inches wide, with the bottom of the opening no more than 44 inches above the floor. All four have to be met at once — the calculator checks each one separately so you can see which one fails.",
        },
        {
          question: "Why does my 20 by 24 inch window fail if it meets both minimums?",
          answer:
            "Because area is a separate requirement. 20 × 24 inches is 480 square inches, which is 3.33 square feet — well below 5.7. To reach 5.7 square feet at the minimum width of 20 inches, the opening would need to be about 41 inches high; at the minimum height of 24 inches, about 34.2 inches wide.",
        },
        {
          question: "What is a grade-floor opening?",
          answer:
            "The IRC defines it as an emergency escape opening whose bottom is not more than 44 inches above or below the finished ground level next to it. Those openings can meet a 5 square foot area minimum instead of 5.7. The width, height and sill limits stay the same.",
        },
        {
          question: "Is the clear opening the same as the window size?",
          answer:
            "No. Window sizes are usually given as frame or rough-opening dimensions, which include the frame and, for double-hung and sliding windows, the half that does not open. The net clear opening is the space a person can actually pass through with the window opened normally. Manufacturers often publish a clear-opening figure for each unit; otherwise measure it.",
        },
        {
          question: "Do I need a window well, and how big?",
          answer:
            "R310.4 requires an area well where the bottom of the clear opening is below the ground outside. It needs a horizontal area of at least 9 square feet with a projection and width of at least 36 inches, must let the window open fully, and needs a permanently affixed ladder or steps when it is deeper than 44 inches.",
        },
        {
          question: "Can I use this instead of asking the building department?",
          answer:
            "No. This page cites the 2021 IRC model code. Your jurisdiction may have adopted a different edition or amended it, and the building official decides whether a specific opening complies. Use the result to know which measurements to discuss, not as an approval.",
        },
        {
          question: "Does every basement need an egress window?",
          answer:
            "R310.1 requires an emergency escape opening in basements, habitable attics and every sleeping room, with exceptions — including basements used only for mechanical equipment up to 200 square feet, and certain sprinklered dwellings. Whether an exception applies to your basement is a question for your building department; this page checks the size of an opening, not whether one is required.",
        },
      ]}
    >
      <EgressWindowTool />
    </ToolPageLayout>
  );
}
