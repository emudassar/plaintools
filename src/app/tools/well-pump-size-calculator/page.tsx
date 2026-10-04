import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import WellPumpSizeTool from "@/components/WellPumpSizeTool";
import { requireTool } from "@/config/tools";

const SLUG = "well-pump-size-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Well Pump Size Calculator: GPM Your Home Needs",
  description:
    "Count your bathrooms and fixtures and get the well pump capacity in gallons per minute by both methods in the Water Systems Council's guide — fixture count and seven-minute peak demand — checked against your well's yield.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function WellPumpSizeCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to size a well pump's flow",
        steps: [
          {
            name: "Count the bathrooms",
            text: "Enter full and half bathrooms. They set the column of the peak-demand table and count toward fixtures.",
          },
          {
            name: "Count every other water outlet",
            text: "Kitchen sink, dishwasher, washing machine, laundry tub, outside hose outlets, and anything else that draws water — irrigation, a pool, a hot tub. The source says all of these must be included.",
          },
          {
            name: "Add the well's yield if you know it",
            text: "The source's rule is never to install a pump with a greater capacity than the well. A yield from the well log or a test lets the tool check that.",
          },
          {
            name: "Read both figures",
            text: "The fixture-count method gives one gallon per minute per fixture. The peak-demand table gives a minimum pump for the home's number of bathrooms. The source says they give similar results.",
          },
          {
            name: "Take the pressure side to a professional",
            text: "Flow is half the choice. Depth to water, lift and pipe friction decide the pressure the pump must make, which this page does not calculate.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where the pump flow figure matters",
        items: [
          {
            title: "Replacing a failed well pump",
            body: "Knowing the household needs about 14 gpm, not whatever the old pump happened to be, gives a concrete number to discuss with a well contractor.",
          },
          {
            title: "Adding a bathroom to a house on a well",
            body: "Going from 2.5 to 3 bathrooms moves the table figure from 14 to 17 gpm. The tool shows whether that change puts demand past the well's yield.",
          },
          {
            title: "Checking a low-yield well before buying a house",
            body: "If the house needs 12–14 gpm and the well log shows 5 gpm, the source says demand has to be met with added storage rather than a bigger pump.",
          },
          {
            title: "Planning irrigation or a pool on well water",
            body: "Each extra outlet adds a gallon per minute to the fixture count. The tool shows how far irrigation zones or a pool push the total.",
          },
          {
            title: "Understanding why pressure drops when two showers run",
            body: "Several fixtures running at once is exactly what the source's seven-minute peak demand describes. The table gives that peak for the home, a figure to compare the installed pump against.",
          },
          {
            title: "Sizing a pump for a new build",
            body: "Before plumbing is finished, the planned fixture count gives a capacity figure for the pump specification.",
          },
          {
            title: "Comparing two contractors' recommendations",
            body: "If one quote specifies 10 gpm and another 20, the published methods for the actual home are a neutral reference.",
          },
          {
            title: "Converting to gallons per hour",
            body: "Some pumps are rated in gph. The table shows both — 14 gpm is 840 gph.",
          },
          {
            title: "Explaining a pump choice to a homeowner",
            body: "A well contractor can show the fixture count and the peak-demand table behind a recommendation.",
          },
          {
            title: "Deciding whether a larger pressure tank is the answer",
            body: "When the well cannot match peak demand, the source points to added storage. Seeing the 7-minute peak gallons against what the well supplies in 7 minutes frames that conversation.",
          },
        ],
      }}
      dataSection={{
        heading: "Where the sizing methods come from",
        paragraphs: [
          "Both methods come from the Water Systems Council's wellcare information sheet 'Sizing a Well Pump'. The first: 'The capacity of the pump system in gallons per minute should equal the number of fixtures in the home,' including kitchen, bath, appliances, outside irrigation, a pool and special fixtures such as a hot tub. Its worked example — two bathrooms of three outlets each, a kitchen sink, dishwasher, washing machine, laundry tub and two hose outlets — comes to 12 fixtures and 12 gpm, and this page reproduces it.",
          "The second is the sheet's Table 1, a seven-minute peak demand by number of bathrooms: 45 gallons and a minimum 7 gpm pump for one bathroom, 70 gallons and 10 gpm for 1.5, 98 gallons and 14 gpm for 2–2.5, and 122 gallons and 17 gpm for 3–4. The source says seven minutes is the average high-use period for a shower or automatic washer, and that the two methods give similar results.",
          "Everything is calculated in your browser; nothing is sent or stored.",
          "The limits: the table stops at four bathrooms and, in the source's words, its values 'are average and do not include higher or lower extremes.' Half bathrooms are counted here as two outlets (sink and toilet), an assumption, because the source's example has only full baths. And this is only the flow requirement: the pressure the pump must produce depends on depth, lift and friction, which need a well professional.",
          "This page does not recommend a pump model, horsepower or setting depth, and it does not test a well's yield. The source directs well owners to a licensed well contractor or the pump manufacturer for selection.",
        ],
        sources: [
          {
            label: "Water Systems Council — Sizing a Well Pump (wellcare information sheet, PDF)",
            href: "https://www.watersystemscouncil.org/download/wellcare_information_sheets/basic_well_information_sheets/Sizing-a-Well-Pump.pdf",
            note: "Fixture-count method, Table 1 peak demand, the well-capacity rule",
          },
          {
            label: "Water Systems Council — wellcare information sheets",
            href: "https://www.watersystemscouncil.org/",
            note: "The organisation's free well-owner resources",
          },
        ],
      }}
      faqs={[
        {
          question: "What size well pump do I need for a 2-bathroom house?",
          answer:
            "The Water Systems Council's peak-demand table gives a minimum 14 gpm pump for 2 to 2.5 bathrooms. Its fixture-count example for a typical 2-bathroom home comes to 12 gpm.",
        },
        {
          question: "How many gallons per minute does a house need?",
          answer:
            "By the fixture-count method, one gpm per fixture or outlet in the home. By the peak-demand table, 7 to 17 gpm for one to four bathrooms.",
        },
        {
          question: "What if my well yields less than the pump size?",
          answer:
            "The source says never to install a pump with a greater capacity than the well, and that when peak demand exceeds the well's rate, the pump is sized within the well's capacity and peak demand is met with added storage.",
        },
        {
          question: "Why are there two different answers?",
          answer:
            "Because the source gives two common methods. It says they give similar results; the page shows both rather than picking one.",
        },
        {
          question: "Does this tell me the horsepower?",
          answer:
            "No. Horsepower depends on the flow and the pressure the pump must deliver, which depends on depth to water, lift and pipe friction. That calculation is for a well professional with the pump manufacturer's curves.",
        },
        {
          question: "What pressure should my well system run at?",
          answer:
            "The source says most modern systems are set to operate between 30 and 50 psi or between 40 and 60 psi. This page does not size for pressure.",
        },
      ]}
    >
      <WellPumpSizeTool />
    </ToolPageLayout>
  );
}
