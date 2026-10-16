import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import PigGestationTool from "@/components/PigGestationTool";
import { requireTool } from "@/config/tools";

const SLUG = "pig-gestation-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Pig Gestation Calculator: Farrowing Date and Gestation Chart",
  description:
    "Enter a sow or gilt's breeding date and get the farrowing date at 114 days (3 months, 3 weeks, 3 days), the 113–116-day farrowing window, and a gestation chart of key dates.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function PigGestationCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out a farrowing date",
        steps: [
          { name: "Enter the breeding date", text: "The date the sow or gilt was bred or inseminated." },
          { name: "Read the farrowing date", text: "114 days after breeding — the figure in the Merck Veterinary Manual's gestation table." },
          { name: "Check the window", text: "The Pork Industry Handbook works with a 113–116-day range; the window shows those dates." },
          { name: "Use the chart", text: "The gestation chart lists dates at days 21, 42, 57, 84 and across the farrowing window." },
        ],
      }}
      uses={{
        heading: "10 situations where a farrowing date matters",
        items: [
          { title: "Moving a sow to the farrowing crate", body: "Crate or pen moves are planned ahead of farrowing; the window shows when." },
          { title: "Planning farrowing-room capacity", body: "Knowing which sows farrow in which week shows whether the rooms will be full." },
          { title: "Batch farrowing schedules", body: "The Pork Industry Handbook's scheduling method starts from the same 113–116-day range." },
          { title: "Planning feed changes", body: "Late-gestation and lactation feed changes are timed from the farrowing date." },
          { title: "Scheduling pre-farrowing vaccinations", body: "Programs keyed to weeks before farrowing need a date to count back from." },
          { title: "Arranging attendance at farrowing", body: "Someone on hand around the expected date can be planned for the window." },
          { title: "Hobby and homestead pigs", body: "A single sow's due date is the same arithmetic as a commercial herd's." },
          { title: "Planning weaning and sale dates", body: "Weaning and sale ages count from farrowing, so the date sets the rest of the calendar." },
          { title: "Checking how far along a sow is", body: "The chart shows the gestation day on any planning date." },
          { title: "Keeping breeding records", body: "Each service date run through the tool gives an expected date to record per sow." },
        ],
      }}
      dataSection={{
        heading: "Where the gestation figures come from",
        paragraphs: [
          "The 114-day figure is the pig entry in the Merck Veterinary Manual's 'Approximate Gestation Periods' table. The 113–116-day range comes from the Pork Industry Handbook fact sheet 'Calculating Swine Schedules' (Michigan State University Extension Bulletin E-2139, May 1988), which says: 'The rule of thumb for swine gestation periods is 3 months, 3 weeks and 3 days. For our purposes, we will use a range of 113-116 days.' The MSU copy is an archive edition, marked as not for current recommendations; it is cited here only for that day range.",
          "The page adds those numbers of days to the date you enter, in UTC calendar days so daylight-saving changes never shift a result. The gestation chart is plain date arithmetic from the same breeding date.",
          "Everything runs in your browser; nothing is sent or stored.",
          "The limits: these are herd-level figures. Individual sows and gilts can farrow outside the 113–116-day range, and the page does not adjust for parity, breed or litter size. With several inseminations, the page counts from whichever date you enter.",
          "This page counts days. It does not confirm pregnancy and gives no advice on managing farrowing — that is for the keeper and their veterinarian.",
        ],
        sources: [
          {
            label: "Merck Veterinary Manual — Approximate Gestation Periods (table)",
            href: "https://www.merckvetmanual.com/multimedia/table/approximate-gestation-periods",
            note: "Lists pigs at 114 days",
          },
          {
            label: "Pork Industry Handbook — Calculating Swine Schedules (MSU E-2139, 1988)",
            href: "https://archive.lib.msu.edu/DMC/extension_publications/e2139/e2139_88.pdf",
            note: "3 months, 3 weeks, 3 days; range 113–116 days",
          },
        ],
      }}
      faqs={[
        { question: "How long is a pig pregnant?", answer: "About 114 days — the figure in the Merck Veterinary Manual's gestation table, often remembered as 3 months, 3 weeks and 3 days." },
        { question: "What is the normal range?", answer: "The Pork Industry Handbook uses a range of 113–116 days for scheduling. Individual sows can fall outside it." },
        { question: "Is it different for gilts?", answer: "The sources used here give one figure for pigs and do not split it by parity, so the page does not adjust for gilts." },
        { question: "Which date do I enter after several inseminations?", answer: "Whichever date you want to count from. The page cannot know which service resulted in the pregnancy." },
        { question: "Does it work for pot-bellied or other pig breeds?", answer: "The sources give a figure for pigs generally, not by breed, so the page uses the same figure for all." },
        { question: "My sow is past 116 days. What should I do?", answer: "This page can't say. It can show how far past the range she is; a veterinarian is the person to assess her." },
      ]}
    >
      <PigGestationTool />
    </ToolPageLayout>
  );
}
