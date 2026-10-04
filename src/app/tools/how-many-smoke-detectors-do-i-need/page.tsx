import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import SmokeAlarmTool from "@/components/SmokeAlarmTool";
import { requireTool } from "@/config/tools";

const SLUG = "how-many-smoke-detectors-do-i-need";
// Fails the build if the registry entry is missing, so a page can never exist
// without being wired into the nav, footer and sitemap.
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "How Many Smoke Detectors Do I Need? IRC Minimum by Room and Level",
  description:
    "Enter your bedrooms, sleeping areas and levels and get the minimum number of smoke alarms the International Residential Code requires (2024 R310.3 or 2021 R314.3), with each location listed. Free, no sign-up.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function HowManySmokeDetectorsPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to count the smoke alarms a house needs",
        steps: [
          {
            name: "Pick the code edition",
            text: "The 2024 IRC lists smoke alarm locations in Section R310.3; the 2021 IRC in R314.3. Items 1 to 5 are the same in both. The 2024 edition adds sleeping lofts and changes the distance from cooking appliances. Your building department can say which edition your area has adopted.",
          },
          {
            name: "Count the bedrooms and the sleeping areas",
            text: "Each sleeping room needs an alarm, and so does the area just outside each separate group of bedrooms. Bedrooms off one hallway are one sleeping area; a bedroom wing on another floor or at the other end of the house is a second.",
          },
          {
            name: "Count the levels without bedrooms",
            text: "Each additional story needs an alarm, including a basement or habitable attic but not a crawl space or uninhabitable attic. A split level less than a full story below the level above, with no door between, is covered by the alarm above.",
          },
          {
            name: "Add tall-ceiling rooms and lofts",
            text: "A room open to a bedroom hallway whose ceiling is 24 inches or more higher than the hallway needs its own alarm. Under the 2024 edition, so does the room a sleeping loft is open to.",
          },
          {
            name: "Read the total and the interconnection rule",
            text: "The result lists each location with its code item. When more than one alarm is required, the code requires them to be interconnected so that one sounding sets off all of them.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where the count matters",
        items: [
          {
            title: "Finishing a basement under a permit",
            body: "Under R310.2.2 (R314.2.2 in 2021), work that needs a permit brings the whole dwelling up to the smoke alarm locations required for new homes. A finished basement can mean new alarms in the bedrooms upstairs too, which is easy to miss when budgeting.",
          },
          {
            title: "Adding a bedroom",
            body: "A new bedroom adds one alarm inside it, and a second outside it if it creates a new sleeping area. Knowing that before the inspection avoids a failed final.",
          },
          {
            title: "Checking a new build before the final inspection",
            body: "Going through the house room by room with the code's own list catches a missing alarm in a bonus room or basement before the inspector does.",
          },
          {
            title: "Buying alarms for a whole house",
            body: "A two-story, four-bedroom house with a basement can need far more alarms than the 'one per floor' people assume. Counting first avoids a second trip to the store.",
          },
          {
            title: "Understanding why an inspector wants an alarm in the living room",
            body: "A vaulted living room open to the bedroom hallway, with a ceiling 24 inches or more above the hallway's, triggers item 5. The result shows that item and the reason.",
          },
          {
            title: "Planning a split-level house",
            body: "A split level less than a full story below the level above, with no door between, can be covered by the alarm above. The count shows whether that exception removes an alarm.",
          },
          {
            title: "Adding a sleeping loft under the 2024 code",
            body: "The 2024 edition added a requirement for an alarm in the room a sleeping loft opens to. Someone working from the 2021 list, or an older article, will miss it.",
          },
          {
            title: "Deciding whether alarms must be interconnected",
            body: "Once more than one alarm is required, the code requires them to be interconnected or to be listed wireless alarms that all sound together. Knowing that shapes what to buy.",
          },
          {
            title: "Placing the kitchen-adjacent alarm",
            body: "The two editions set different distances from a cooking appliance: 2024 says 10 feet, or 6 where necessary; 2021 sets distances by alarm type. The result shows the rule for the edition picked.",
          },
          {
            title: "Settling 'one per bedroom' versus 'one per floor'",
            body: "Both rules of thumb are incomplete. The code requires both, plus an alarm outside each sleeping area. Listing the locations side by side shows where each rule of thumb falls short.",
          },
        ],
      }}
      dataSection={{
        heading: "Where this count comes from",
        paragraphs: [
          "The locations come from the International Residential Code, the model code for one- and two-family dwellings and townhouses published by the International Code Council (ICC). In the 2024 edition they are in Section R310.3 (smoke alarms were renumbered from R314 in that edition); in the 2021 edition, Section R314.3. Both were read on October 4, 2026 in ICC's free Digital Codes reader. The list is: each sleeping room; outside each separate sleeping area, near the bedrooms; each additional story including basements and habitable attics, with a split-level exception; at least 3 feet from the door of a bathroom with a tub or shower where possible; the hallway and the room where a room open to a bedroom hallway has a ceiling 24 inches or more higher; and, in 2024 only, the room a sleeping loft is open to.",
          "This page counts those locations for the layout you enter, in your browser. A story with bedrooms already has alarms from the first two items, so only stories without bedrooms add one for the story rule. The hallway alarm required with a tall-ceiling room is taken to be the one outside that sleeping area. Nothing is sent or stored. The National Fire Protection Association's public guidance gives the same core locations (every sleeping room, outside each sleeping area, every level including the basement), which is a useful cross-check.",
          "Its limits: the IRC is a model code. It only applies where a state or city has adopted it, possibly an older edition, often with local amendments, and it applies to new construction and to alterations that need a permit. It does not cover apartment buildings or commercial occupancies, which fall under other codes. The IRC also requires alarms to comply with NFPA 72, a copyrighted standard this page does not reproduce, so detailed mounting rules beyond the location list are not covered here. Carbon monoxide alarms are a separate section and a separate question.",
          "What it must not be used for: as a substitute for the building department's requirements on a permit, or as a statement that a particular house is safe. It reports the minimum the code text gives for the layout entered.",
        ],
        sources: [
          {
            label: "ICC: 2024 International Residential Code, Chapter 3",
            href: "https://codes.iccsafe.org/content/IRC2024P1/chapter-3-building-planning",
            note: "Sections R310.2 to R310.4: where smoke alarms are required, their locations and interconnection",
          },
          {
            label: "ICC: 2021 International Residential Code, Chapter 3",
            href: "https://codes.iccsafe.org/content/IRC2021P1/chapter-3-building-planning",
            note: "Sections R314.2 to R314.4, the same rules under the 2021 numbering",
          },
          {
            label: "NFPA: Installing and maintaining smoke alarms",
            href: "https://www.nfpa.org/education-and-research/home-fire-safety/smoke-alarms",
            note: "Public consumer guidance with the same core locations",
          },
        ],
      }}
      faqs={[
        {
          question: "Is it one smoke detector per floor or one per bedroom?",
          answer:
            "Both, and more. The IRC requires an alarm in each sleeping room, one outside each separate sleeping area, and one on each additional story including the basement. A three-bedroom ranch with a basement needs at least five.",
        },
        {
          question: "Does the hallway outside the bedrooms need its own alarm?",
          answer:
            "Yes. Item 2 of the location list requires one outside each separate sleeping area, in the immediate vicinity of the bedrooms. That is usually the hallway that serves them.",
        },
        {
          question: "Does the basement need a smoke detector?",
          answer:
            "Yes. The story rule explicitly includes basements and habitable attics, and excludes crawl spaces and uninhabitable attics.",
        },
        {
          question: "Do the smoke detectors have to be interconnected?",
          answer:
            "When more than one is required in a dwelling unit, yes: R310.4 (R314.4 in 2021) requires that one alarm sounding sets off all of them. Listed wireless alarms that all sound together satisfy this without wiring.",
        },
        {
          question: "Does this apply to my existing house?",
          answer:
            "The IRC applies these locations to new construction and, under R310.2.2 (R314.2.2 in 2021), when alterations, repairs or additions that need a permit are done, with exceptions for things like roofing, siding, windows, doors, decks and plumbing or mechanical work. Some states and cities have their own rules for existing homes or home sales.",
        },
        {
          question: "Why did it give no count when I entered zero bedrooms?",
          answer:
            "The location list is built around sleeping rooms. With none, it does not say where the first alarm goes, even though the code still requires smoke alarms in every dwelling unit. Rather than guess, the page says so. For a studio, the local code official decides how the sleeping space is treated.",
        },
        {
          question: "Which edition should I pick?",
          answer:
            "The one your state or city has adopted, which your building department can confirm. Items 1 to 5 of the list are the same in both. The 2024 edition adds the sleeping loft and changes the distance from cooking appliances.",
        },
      ]}
    >
      <SmokeAlarmTool />
    </ToolPageLayout>
  );
}
