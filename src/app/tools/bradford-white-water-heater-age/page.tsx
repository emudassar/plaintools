import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import BradfordWhiteAgeTool from "@/components/BradfordWhiteAgeTool";
import { requireTool } from "@/config/tools";

const SLUG = "bradford-white-water-heater-age";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Bradford White Water Heater Age: Decode the Serial Number",
  description:
    "Type the serial number from your Bradford White water heater and get the month and year it was made and how old it is, using Bradford White's own date code — including the 20-year letter repeat.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function BradfordWhiteWaterHeaterAgePage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find a Bradford White water heater's age",
        steps: [
          { name: "Find the rating plate", text: "It is the label on the side of the tank that lists the model and serial numbers." },
          { name: "Type the serial number", text: "It starts with two letters. Type it exactly, letters and digits." },
          { name: "Read the date", text: "The first letter is the year, the second the month; the result shows the month and year made and the age." },
          { name: "Check an ambiguous result", text: "Letters repeat every 20 years. The serial's length usually settles it; if not, both dates are shown." },
        ],
      }}
      uses={{
        heading: "10 situations where knowing a water heater's age helps",
        items: [
          { title: "Buying a house", body: "A home inspection report may say only 'Bradford White, 40 gal'. The serial gives the year it was made." },
          { title: "Deciding whether to repair or replace", body: "A repair quote reads differently on a 3-year-old tank than on a 15-year-old one." },
          { title: "Checking warranty eligibility", body: "Warranties run from the manufacture or installation date; know the first before you call." },
          { title: "Planning a replacement budget", body: "Landlords and property managers can list every heater by age." },
          { title: "Answering a plumber's question on the phone", body: "'How old is it?' is usually the first question." },
          { title: "Checking a seller's claim", body: "'Water heater replaced recently' can be checked against the date code." },
          { title: "Insurance and home warranty forms", body: "Some forms ask for the appliance's age." },
          { title: "Reading an older 7-digit serial", body: "Older serials have seven digits; newer ones eight. The tool uses that to pick the decade." },
          { title: "Spotting a misread serial", body: "If a letter isn't one Bradford White uses, the tool says so — usually an O read for a 0." },
          { title: "Recording a home's systems", body: "Note the heater's build date alongside the furnace and roof." },
        ],
      }}
      dataSection={{
        heading: "Where the date code comes from",
        paragraphs: [
          "The decoding rules are Bradford White's own, from its 'Determining The Age Of A Water Heater' bulletin for professionals, read on the date shown on the result. 'The first two characters of the serial number represent the year and month of manufacture.' The year letters run A = 1984 to Z = 2003 and again A = 2004 to Z = 2023, skipping I, O, Q, R, U and V; the bulletin also prints A as 2004 or 2024. The month letters run A = January to M = December, skipping I.",
          "Because there are 20 year letters, each one repeats every 20 years: a K serial is 1993 or 2013. Bradford White gives a second clue: the production number after the letters is 'seven digits in length before December 2007 (DM), and eight digits in length after.' This page applies that rule, and also drops any year later than today. Where both possible years fall before December 2007 — an older 7-digit serial whose letter is A to M — the rule cannot separate them and both are shown.",
          "The bulletin notes one exception, also built in: 'some OA serial water heaters' were made through 'a computer error' and 'were built in January of 1997.'",
          "Limits: the serial gives the month the heater was made, not when it was installed. Bradford White's own lookup on its website reads the full record for a serial and is the place to check warranty status. Nothing here is a judgment about whether a heater should be repaired or replaced. This site is not affiliated with Bradford White; the brand name is used only to say whose serial numbers the page reads.",
        ],
        sources: [
          { label: "Bradford White — Determining The Age Of A Water Heater", href: "https://forthepro.bradfordwhite.com/determining-the-age-of-a-water-heater/", note: "Year and month letters, skipped letters, digit-length rule, OA exception" },
          { label: "Bradford White — My Water Heater (serial lookup)", href: "https://www.bradfordwhite.com/my-water-heater/", note: "Official lookup by serial number" },
          { label: "Bradford White — How to read the serial number date code reference chart", href: "https://www.bradfordwhite.com/bw-faq/how-to-read-the-serial-number-date-code-reference-chart/", note: "Consumer FAQ" },
        ],
      }}
      faqs={[
        { question: "How do I tell how old my Bradford White water heater is?", answer: "Read the serial number on the rating plate. The first letter is the year and the second the month it was made, e.g. KA = January 1993 or 2013; the serial's length tells which." },
        { question: "Why does it say two possible years?", answer: "Bradford White's year letters repeat every 20 years. Eight digits after the letters means December 2007 or later; seven means earlier. For older serials with letters A to M, both readings fall before 2007, so both are shown." },
        { question: "Where is the serial number on a Bradford White water heater?", answer: "On the rating plate, the label on the side of the tank that also shows the model number." },
        { question: "What does DM mean on a Bradford White serial?", answer: "D is 1987 or 2007 and M is December — December 2007, the month Bradford White moved from seven-digit to eight-digit production numbers." },
        { question: "My serial starts with OA. Is that valid?", answer: "Yes. Bradford White says some OA serials were issued through a computer error, and those heaters were built in January 1997." },
        { question: "Is the manufacture date the same as the install date?", answer: "Not necessarily. A heater can sit in stock before it is installed. Installation paperwork or a permit gives the install date." },
        { question: "Does this work for other brands?", answer: "No. Each maker uses its own serial format. This page decodes Bradford White serials only." },
      ]}
    >
      <BradfordWhiteAgeTool />
    </ToolPageLayout>
  );
}
