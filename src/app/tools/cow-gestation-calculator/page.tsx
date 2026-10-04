import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import CowGestationTool from "@/components/CowGestationTool";
import { requireTool } from "@/config/tools";

const SLUG = "cow-gestation-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Cow Gestation Calculator: Calving Date from Breeding Date",
  description:
    "Enter a breeding or AI date and get the calving date at the traditional 283 days, at the 278.6-day average from a 101,787-mating Angus study, and the window most calves arrive in. Calving-season mode for bull exposure.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function CowGestationCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out a calving date",
        steps: [
          {
            name: "Enter the breeding or AI date",
            text: "The date the cow was bred or inseminated. For natural service over a period, tick the bull-exposure box and enter the day the bull went in and the day he came out.",
          },
          {
            name: "Optionally choose the cow's age",
            text: "In the study the source reports, younger dams carried slightly shorter — 277.7 days at 2 years against 279.6 days at 8 — so the tool uses the age-specific average when you pick one.",
          },
          {
            name: "Read the 283-day date",
            text: "This is the figure traditional beef-cattle references use, and the one most gestation tables print.",
          },
          {
            name: "Compare it with the study average",
            text: "A study of 101,787 Angus AI matings found an average of 278.6 days — more than four days shorter. Both dates are shown so you can see the gap.",
          },
          {
            name: "Plan around the window, not one day",
            text: "About two-thirds of the study's gestations fell between 274.2 and 283.3 days, and the full range was 264 to 292. The tool turns both into calendar dates.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where the calving date matters",
        items: [
          {
            title: "Moving heifers to the calving pasture in time",
            body: "If the traditional 283 days is used but calves arrive closer to 279, heifers can calve before they are moved to where they can be watched. Seeing both dates avoids being four days late.",
          },
          {
            title: "Scheduling night checks",
            body: "The likely window shows when most cows should calve, so night checks can start before the first expected births rather than on the textbook date.",
          },
          {
            title: "Planning a calving season from bull dates",
            body: "With the bull turned in on 1 May and pulled on 30 June, the tool gives the first and last expected calving dates for the whole season.",
          },
          {
            title: "Lining up labor and vet cover",
            body: "Knowing the season runs, for example, from early February to early April lets a ranch book help and a vet for the right weeks.",
          },
          {
            title: "Timing pre-calving vaccinations and supplementation",
            body: "Programs keyed to weeks before calving need a calving date to count back from. The study average gives an earlier anchor than 283 days.",
          },
          {
            title: "Checking a cow that seems overdue",
            body: "A cow past 283 days is still within the 264–292-day range the study observed. The tool shows where her date sits in that range.",
          },
          {
            title: "Planning around an AI program",
            body: "For a fixed-time AI date, the tool gives a single expected date plus the window — useful for separating AI calves from clean-up bull calves.",
          },
          {
            title: "Setting up a calving book or spreadsheet",
            body: "Running each breeding date through the tool gives the expected date to record against each cow.",
          },
          {
            title: "Understanding why calves come earlier than the chart",
            body: "The source explains that Angus gestation length has fallen by 4.3 days over the study period, alongside selection for lower birth weight and easier calving.",
          },
          {
            title: "Planning calf sales and weaning dates",
            body: "Calf age is counted from the calving date, so an expected calving season gives an early read on when calves will reach a planned weaning or sale age.",
          },
        ],
      }}
      dataSection={{
        heading: "Where the gestation figures come from",
        paragraphs: [
          "The figures come from Kansas State University Extension: Sandy Johnson, extension beef specialist, 'When Is She Due? Understanding Gestation Length in Modern Beef Cattle', K-State Beef Tips, 1 July 2026. The article states that traditional beef-cattle references often cite an average gestation length of 283 days, then reports a study of 101,787 American Angus AI matings from 2000 to 2020 (Gilleland, 2022, North Carolina State University) with a mean of 278.6 days, a standard deviation of 4.69 days, and a minimum and maximum of 264 and 292 days. About two-thirds of gestations fell between 274.2 and 283.3 days. A second table gives the mean by age of dam, from 277.7 days for 2-year-olds to 279.6 days for 8-year-olds.",
          "The page adds those numbers of days to the date you enter, in UTC calendar days so daylight-saving changes never move a result, and rounds fractional days to the nearest whole day. For a bull-exposure period, the first date uses the turn-in date and the last uses the pull date.",
          "Everything runs in your browser; nothing is sent or stored.",
          "The limits matter here. The study data are from American Angus cattle conceived by AI; other breeds, crossbred cattle and natural service may differ, and the source says the calf's own genetics had the most influence on gestation length. A breeding date only says when the cow could have conceived, not that she did.",
          "This page counts days. It is not a pregnancy diagnosis — a veterinarian's pregnancy check confirms conception and stage — and it gives no advice on managing calving.",
        ],
        sources: [
          {
            label: "K-State Beef Tips — When Is She Due? Understanding Gestation Length in Modern Beef Cattle (July 2026)",
            href: "https://enewsletters.k-state.edu/beeftips/2026/07/01/when-is-she-due-understanding-gestation-length-in-modern-beef-cattle/",
            note: "The 283-day reference figure, the Angus study statistics and the age-of-dam table",
          },
          {
            label: "Kansas State University — Beef Tips newsletter",
            href: "https://enewsletters.k-state.edu/beeftips/",
            note: "The extension newsletter the article appears in",
          },
        ],
      }}
      faqs={[
        {
          question: "How long is a cow pregnant?",
          answer:
            "Traditional beef-cattle references cite an average of 283 days. A study of 101,787 Angus AI matings reported by K-State Extension found an average of 278.6 days, with two-thirds between 274.2 and 283.3 days and a full range of 264 to 292 days.",
        },
        {
          question: "Why does the calculator show two dates?",
          answer:
            "Because the two figures differ by more than four days. Most printed gestation tables use 283 days; the recent Angus study found calves arriving earlier on average. Showing both makes the gap visible instead of hiding it.",
        },
        {
          question: "Does the cow's age change the date?",
          answer:
            "Slightly. In the study, mean gestation rose from 277.7 days for 2-year-old dams to 279.6 days for 8-year-olds. Pick an age to use that age's average.",
        },
        {
          question: "Does this work for dairy cows or other breeds?",
          answer:
            "The 283-day figure is a general beef-cattle reference, and the study figures are for American Angus. Other breeds and dairy cattle may differ, and the page cannot correct for that.",
        },
        {
          question: "How do I calculate a calving season for natural service?",
          answer:
            "Tick the bull-exposure box and enter the day the bull went in and the day he came out. The tool counts from the first date for the earliest calves and from the last date for the latest.",
        },
        {
          question: "My cow is past her due date. Is something wrong?",
          answer:
            "This page cannot say. It can show that the study recorded gestations as long as 292 days. A veterinarian is the person to assess a cow that seems overdue.",
        },
        {
          question: "Why are Angus calves arriving earlier than the old charts say?",
          answer:
            "The source reports that gestation length in the study fell by 4.3 days over 2000–2020, which it notes coincides with industry selection for lower birth weights and easier calving.",
        },
      ]}
    >
      <CowGestationTool />
    </ToolPageLayout>
  );
}
