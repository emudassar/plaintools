import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import SheepGestationTool from "@/components/SheepGestationTool";
import { requireTool } from "@/config/tools";

const SLUG = "sheep-gestation-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Sheep Gestation Calculator: Lambing Date from Breeding Date",
  description:
    "Enter a breeding date, or the dates a ram or crayon colour was on, and get the lambing window from the Merck Veterinary Manual's 144–150-day normal gestation for sheep. Free, no sign-up.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function SheepGestationCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out a lambing date",
        steps: [
          {
            name: "Enter the breeding date",
            text: "For a hand-mated or artificially inseminated ewe, enter the single date. The Merck Veterinary Manual notes that exact gestation length is seldom known otherwise.",
          },
          {
            name: "Or enter a period",
            text: "If the ram ran with the flock, tick the box and enter when he went in and came out. For a marking harness, enter the dates a crayon colour was on to get that colour group's window.",
          },
          {
            name: "Read the lambing window",
            text: "The headline counts 144 days from the first date and 150 days from the last — the manual's normal gestation range applied to your dates.",
          },
          {
            name: "Check the single-date figures",
            text: "The 147-day midpoint of that range and the 150-day figure from Merck's gestation table are shown for planning around one date.",
          },
          {
            name: "Plan for the whole window",
            text: "The source describes calculating a lambing date within a 14- to 17-day period when working from crayon colours, so a window, not a single day, is the realistic answer.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where a lambing date matters",
        items: [
          {
            title: "Getting the lambing shed ready on time",
            body: "Pens, bedding and supplies need to be ready before the first ewe lambs, which the window's opening date tells you.",
          },
          {
            title: "Grouping ewes by crayon colour",
            body: "Ewes marked by the same crayon colour form a lambing group. Entering that colour's on and off dates gives the group's window so they can be housed and watched together.",
          },
          {
            title: "Scheduling night checks",
            body: "Knowing when the window opens and closes means checks can be planned instead of starting too late or running weeks too long.",
          },
          {
            title: "Planning feed in late pregnancy",
            body: "Late-pregnancy feeding programs count back from lambing, so an expected date gives the start point.",
          },
          {
            title: "Timing pre-lambing vaccinations",
            body: "Programs keyed to weeks before lambing need a lambing date to count back from.",
          },
          {
            title: "Planning a short, tight lambing season",
            body: "Seeing how a ram exposure of 16 days turns into a lambing window of about three weeks helps when deciding how long to leave the ram in.",
          },
          {
            title: "Booking shearing or help around lambing",
            body: "Labor and contractors can be booked against the window rather than a guess.",
          },
          {
            title: "Checking whether a ewe is overdue",
            body: "If a ewe is past the window's end, the date she was bred and the 150-day figure are concrete numbers to bring to a veterinarian.",
          },
          {
            title: "Planning lamb sales or show dates",
            body: "Lamb age is counted from lambing, so the window gives an early read on when lambs will reach a target age.",
          },
          {
            title: "Keeping flock records",
            body: "Running each mating date through the tool gives an expected date to record against each ewe or group.",
          },
        ],
      }}
      dataSection={{
        heading: "Where the gestation figures come from",
        paragraphs: [
          "The figures come from the Merck Veterinary Manual. In 'Overview of Prolonged Gestation in Cattle and Sheep' (John F. Mee, Teagasc, last updated September 2024), the manual states that in sheep the normal gestation length is 144–150 days, and that the exact gestation length is seldom known unless ewes were served in hand or by artificial insemination. It also describes marking harnesses with crayon colours changed at 14- to 17-day intervals, from which a lambing date within a 14- to 17-day period is calculated. The manual's 'Approximate Gestation Periods' table lists sheep at 150 days.",
          "The page adds those numbers of days to the dates you enter, in UTC calendar days so daylight-saving changes never shift a result. For a period, the window runs from 144 days after the first date to 150 days after the last. The 147-day figure is the midpoint of the 144–150-day range — simple arithmetic, labelled as such, not a measured average.",
          "Everything runs in your browser; nothing is sent or stored.",
          "The limits: the source gives a range for sheep generally and does not break it down by breed or litter size here, so the page does not either. A breeding date or ram period only says when a ewe could have conceived, not that she did.",
          "This page counts days. It does not diagnose pregnancy — the source mentions ultrasound for confirmation — and gives no advice on managing lambing.",
        ],
        sources: [
          {
            label: "Merck Veterinary Manual — Overview of Prolonged Gestation in Cattle and Sheep",
            href: "https://www.merckvetmanual.com/reproductive-system/prolonged-gestation-in-cattle-and-sheep/overview-of-prolonged-gestation-in-cattle-and-sheep",
            note: "Normal sheep gestation of 144–150 days and the crayon-colour method",
          },
          {
            label: "Merck Veterinary Manual — Approximate Gestation Periods (table)",
            href: "https://www.merckvetmanual.com/multimedia/table/approximate-gestation-periods",
            note: "Lists sheep at 150 days",
          },
        ],
      }}
      faqs={[
        {
          question: "How long are sheep pregnant?",
          answer:
            "The Merck Veterinary Manual gives a normal gestation length of 144–150 days for sheep, and its gestation table lists 150 days. The midpoint of the range is 147 days.",
        },
        {
          question: "Why does it give a window instead of one date?",
          answer:
            "Because gestation itself varies by several days, and the source notes the exact length is seldom known unless ewes were hand-mated or inseminated. With a ram in the flock, the conception date within the period is unknown too.",
        },
        {
          question: "How do I use crayon colours with this?",
          answer:
            "Enter the date a colour went on as the start and the date it was changed as the end. The window you get is for the ewes marked in that colour. The manual describes changing colours at 14- to 17-day intervals.",
        },
        {
          question: "Do different breeds lamb at different times?",
          answer:
            "The source used here gives one range for sheep and does not split it by breed, so the page does not adjust for breed.",
        },
        {
          question: "Can I use this for goats?",
          answer: "No. This page uses the figures for sheep. Goats have their own gestation figures and need a separate calculation.",
        },
        {
          question: "My ewe is past the window. What should I do?",
          answer:
            "This page can't say. It can show how far past the manual's normal range she is; a veterinarian is the person to assess her.",
        },
      ]}
    >
      <SheepGestationTool />
    </ToolPageLayout>
  );
}
