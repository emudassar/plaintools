import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import ChristmasCountdownTool from "@/components/ChristmasCountdownTool";
import { requireTool } from "@/config/tools";

const SLUG = "how-many-days-until-christmas";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "How Many Days Until Christmas? Live Countdown",
  description:
    "A live countdown to Christmas Day, December 25, in days, hours, minutes and seconds, plus how many days until every other major US holiday this year.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function HowManyDaysUntilChristmasPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to read the Christmas countdown",
        steps: [
          { name: "Open the page", text: "The countdown starts from today's date on your device." },
          { name: "Read the days", text: "Whole days until December 25, plus a clock counting to midnight." },
          { name: "Check other holidays", text: "The table lists the next date of every major US holiday and how many days away it is." },
        ],
      }}
      uses={{
        heading: "10 ways people use a Christmas countdown",
        items: [
          { title: "Kids asking every morning", body: "Parents show the number of sleeps left without counting on a calendar." },
          { title: "Shopping and shipping", body: "A shopper checks how many days remain before the last order dates retailers announce." },
          { title: "Advent and classroom calendars", body: "A teacher sets up a countdown display for the class." },
          { title: "Travel planning", body: "A family booking flights home checks how far away the holiday is." },
          { title: "Saving up", body: "Someone divides their gift budget by the weeks left to Christmas." },
          { title: "Retail staffing", body: "A store manager counts the days of the holiday season left." },
          { title: "Baking schedules", body: "A baker counts back from Christmas to plan cakes that need weeks to mature." },
          { title: "Church and choir planning", body: "Organisers count days to services and rehearsals." },
          { title: "Thanksgiving to Christmas", body: "The holiday table shows both, for planning the stretch between them." },
          { title: "Long-distance families", body: "Relatives in different countries count down together." },
        ],
      }}
      dataSection={{
        heading: "How the countdown and holiday dates are worked out",
        paragraphs: [
          "The day count is whole calendar days from today's date on your device to December 25. The clock counts to midnight at the start of Christmas Day in your own time zone. On December 25 the page says it is Christmas, and from December 26 it counts to next year.",
          "Federal holiday dates follow the rules in 5 U.S.C. 6103 as listed by the Office of Personnel Management: fixed dates (New Year's Day, Juneteenth, Independence Day, Veterans Day, Christmas) and floating Mondays and Thursdays (Martin Luther King Jr. Day, Presidents Day, Memorial Day, Labor Day, Columbus Day, Thanksgiving). Easter uses the Gregorian computus. Valentine's Day, Mother's and Father's Day, Halloween and Christmas Eve are common observances, not federal holidays.",
          "Limits: the table shows each holiday's actual date. When a federal holiday falls on a weekend, the day off is usually moved to Friday or Monday; employers and states set their own schedules.",
        ],
        sources: [
          { label: "OPM — Federal holidays", href: "https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/" },
          { label: "Wikipedia — Date of Easter (computus)", href: "https://en.wikipedia.org/wiki/Date_of_Easter" },
        ],
      }}
      faqs={[
        { question: "How many days until Christmas?", answer: "The page shows it live at the top, counted from today's date on your device to December 25." },
        { question: "What day of the week is Christmas this year?", answer: "The result card shows the full date, including the weekday, for the next Christmas." },
        { question: "How many sleeps until Christmas?", answer: "The number of sleeps equals the number of days left, since one night passes for each day." },
        { question: "Is Christmas Eve a federal holiday?", answer: "No. Christmas Day, December 25, is the federal holiday. Some employers give Christmas Eve off." },
        { question: "When is Thanksgiving?", answer: "The fourth Thursday in November. The holiday table shows this year's date." },
        { question: "Does the countdown use my time zone?", answer: "Yes. It counts to midnight at the start of December 25 where you are." },
      ]}
    >
      <ChristmasCountdownTool />
    </ToolPageLayout>
  );
}
