import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import PoolPumpRunTimeTool from "@/components/PoolPumpRunTimeTool";
import { requireTool } from "@/config/tools";

const SLUG = "pool-pump-run-time-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Pool Pump Run Time Calculator: Hours per Turnover and per Day",
  description:
    "Enter pool gallons and the flow rate through your filter and get how long one turnover takes and how many hours a day the pump must run — with the CDC Model Aquatic Health Code's maximum turnover times for public pools.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function PoolPumpRunTimeCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out pump run time",
        steps: [
          {
            name: "Enter the pool volume",
            text: "Gallons or litres. For a public venue the MAHC says the total volume includes any surge or balance tank.",
          },
          {
            name: "Enter the flow rate through the filter",
            text: "The MAHC defines turnover using the flow through the filtration process. A flow meter reading is the most reliable figure; water pumped to features without filtering does not count.",
          },
          {
            name: "Enter how many turnovers a day you want",
            text: "One turnover means a volume of water equal to the whole pool has passed through the filter once. The tool does not choose a number; enter the one you are working to.",
          },
          {
            name: "Optionally compare with the MAHC table",
            text: "For a public pool, pick its venue type to see the maximum turnover time in MAHC Table 4.7.1.10 and the flow needed to meet it.",
          },
          {
            name: "Read hours per turnover and per day",
            text: "The result shows one turnover's time, the daily run time, and a warning if the requested turnovers do not fit in 24 hours at that flow.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where the run-time figure matters",
        items: [
          {
            title: "Setting a timer on a new pump",
            body: "A 20,000-gallon pool at 50 gpm turns over once in 6 hours 40 minutes. That is a timer setting, not a guess.",
          },
          {
            title: "Cutting electricity use with a variable-speed pump",
            body: "Running at lower speed gives lower flow and a longer turnover. Entering the flow at each speed shows how many hours a day each setting needs for the same turnovers.",
          },
          {
            title: "Checking whether a pump can keep up",
            body: "If two turnovers a day comes out at more than 24 hours, the pump cannot do it at that flow. The tool says so and shows the most it can manage running non-stop.",
          },
          {
            title: "Checking a public pool against the MAHC maximum",
            body: "An operator can see whether a measured flow meets Table 4.7.1.10 for their venue type — 6 hours for most pools, 1 hour for wading pools, half an hour for hot spas.",
          },
          {
            title: "Sizing a pump for a commercial pool design",
            body: "The flow needed to meet a venue's maximum turnover is the minimum filtration flow a design has to deliver, before any other component requirements.",
          },
          {
            title: "Understanding why water clarity changed after a pump swap",
            body: "A replacement pump that moves less water lengthens turnover. Comparing flows before and after shows by how much.",
          },
          {
            title: "Working in litres per minute",
            body: "Outside the US, flow is often in L/min and volume in litres. Both are accepted and converted.",
          },
          {
            title: "Planning a spa's filtration",
            body: "The MAHC sets a half-hour maximum turnover for spas at 93–104°F. Small volume, short cycle — the arithmetic shows the flow that implies.",
          },
          {
            title: "Explaining a run schedule to a pool owner",
            body: "A pool technician can show the volume, flow and arithmetic behind a recommended timer setting.",
          },
          {
            title: "Checking a flow meter reading during an inspection",
            body: "With the meter's gpm and the venue type, the tool shows whether the measured turnover is within the model code's maximum.",
          },
        ],
      }}
      dataSection={{
        heading: "Where the figures come from",
        paragraphs: [
          "The calculation follows the definition in the CDC's Model Aquatic Health Code (MAHC), 2023 4th edition, section 4.7.1.10.2: turnover time is 'the total volume of water divided by the total design recirculation flow rate through the filtration process.' With volume in gallons and flow in gallons per minute, hours per turnover = gallons ÷ (gpm × 60). Daily run time is that figure multiplied by the number of turnovers you enter.",
          "The optional comparison uses MAHC Table 4.7.1.10, 'Aquatic Venue Maximum Allowable Turnover Times': activity pools and lazy rivers 2 hours, diving pools 8 hours, interactive water play 0.5 hours, plunge pools, runout slides and wading pools 1 hour, wave pools 2 hours, all other pools 6 hours; and for spa, therapy and exercise pools, 0.5 hours at 93–104°F, or 1, 2 or 4 hours at 72–93°F depending on gallons per person. The MAHC also says the required turnover is the lesser of the table figure and the time individual components such as skimmers require — this page covers only the table.",
          "Everything is worked out in your browser; nothing is sent or stored.",
          "The limits: the result is only as good as the flow figure. Pump output depends on the resistance of the pipes and filter, and the MAHC requires public pools to have a flow meter accurate to ±5%. The MAHC is a model code for public aquatic venues — states and localities decide whether to adopt it — and it sets no turnover figure for private residential pools.",
          "This page does not choose a run schedule, check other code requirements, or replace a pool designer's or health department's review of a public venue.",
        ],
        sources: [
          {
            label: "CDC — 2023 Model Aquatic Health Code, 4th edition (PDF)",
            href: "https://www.cdc.gov/model-aquatic-health-code/media/pdfs/2023-MAHC-508.pdf",
            note: "Section 4.7.1.10 and Table 4.7.1.10, turnover definition and maximum turnover times",
          },
          {
            label: "CDC — Model Aquatic Health Code",
            href: "https://www.cdc.gov/model-aquatic-health-code/",
            note: "The MAHC home page, with the annex explaining the code",
          },
        ],
      }}
      faqs={[
        {
          question: "How long should I run my pool pump?",
          answer:
            "Long enough for the number of turnovers you are working to. One turnover takes your volume divided by the filter flow — for 20,000 gallons at 50 gpm, 6 hours 40 minutes. This page does not choose the number of turnovers for a private pool; no MAHC figure applies to residential pools.",
        },
        {
          question: "What is a pool turnover?",
          answer:
            "The time it takes for a volume of water equal to the whole pool to pass through the filter. The MAHC defines turnover time as the total volume divided by the recirculation flow rate through the filtration process.",
        },
        {
          question: "What turnover does the Model Aquatic Health Code require?",
          answer:
            "For public venues, Table 4.7.1.10 sets maximums: 6 hours for most pools, 8 for diving pools, 2 for activity pools, lazy rivers and wave pools, 1 for wading and plunge pools and runout slides, 0.5 for interactive water play and hot spas. Whether it applies depends on whether your state or county has adopted it.",
        },
        {
          question: "Where do I find my flow rate?",
          answer:
            "From a flow meter on the return line, if fitted. Public pools under the MAHC must have one. Without a meter, the flow depends on the pump and the resistance of the plumbing and filter, so a number taken only from the pump's label is less certain.",
        },
        {
          question: "Does water pumped to slides or features count?",
          answer:
            "Not for turnover. The MAHC says unfiltered water withdrawn and returned by a separate pump, for features such as slides, does not factor into turnover time.",
        },
        {
          question: "Why does it say my turnovers don't fit in a day?",
          answer:
            "Because at the flow you entered, one turnover takes long enough that the number you asked for adds up to more than 24 hours. The tool shows the most turnovers that flow can achieve running non-stop.",
        },
      ]}
    >
      <PoolPumpRunTimeTool />
    </ToolPageLayout>
  );
}
