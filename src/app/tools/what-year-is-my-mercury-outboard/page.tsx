import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import MercuryYearTool from "@/components/MercuryYearTool";
import { requireTool } from "@/config/tools";

const SLUG = "what-year-is-my-mercury-outboard";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "What Year Is My Mercury Outboard? Decode the Serial Decal Year Code",
  description:
    "Type the two-letter year code from your Mercury outboard's serial number decal (like BX or AG) and get the year it was made, using the code table in Mercury's own manual.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function MercuryYearPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find what year your Mercury outboard was made",
        steps: [
          { name: "Find the serial number decal", text: "It lists the serial number, the model designation and the year manufactured." },
          { name: "Read the year box", text: "Two characters at the bottom right — usually letters such as BX." },
          { name: "Type them in", text: "Each letter stands for a digit: A=1 … H=8, K=9, X=0." },
          { name: "Read the year", text: "BX is 20, so 2020." },
        ],
      }}
      uses={{
        heading: "10 situations where knowing your outboard's year helps",
        items: [
          { title: "Buying a used boat", body: "A listing that says '2020 Mercury' can be checked against the decal in a minute." },
          { title: "Ordering parts", body: "Parts lists are often split by year; know it before you call the counter." },
          { title: "Insuring or registering the boat", body: "Forms ask for the engine's year." },
          { title: "Pricing an engine to sell", body: "Year is one of the first things buyers ask." },
          { title: "Checking warranty eligibility", body: "Coverage runs for a set number of years from purchase; the build year is a starting fact." },
          { title: "Finding the right owner's manual", body: "Mercury manuals are issued by model and year." },
          { title: "Reading a decal you don't understand", body: "Letters in the year box are a code, not part of the model name." },
          { title: "Matching a remote or rigging", body: "Controls and harnesses can change between years." },
          { title: "Records for a fleet or rental boats", body: "Log each engine's year from its decal." },
          { title: "Settling a disagreement", body: "The decal code is Mercury's own record of the build year." },
        ],
      }}
      dataSection={{
        heading: "Where the code comes from",
        paragraphs: [
          "The table is printed in Mercury Marine's Operation, Maintenance and Installation Manual for the 15/20 EFI FourStroke (8M0165094, © 2019), read on the date shown on the result. Its serial number decal callouts are 'a - Serial number, b - Model designation, c - Year manufactured', and it says: 'The serial number decal lists the year of manufacture as an alpha code. This code can be deciphered into a corresponding number using the following table.' The table is A=1, B=2, C=3, D=4, E=5, F=6, G=7, H=8, K=9, X=0, with the examples BX = 2020 and AG = 2017.",
          "Each letter is one digit of the two-digit year. The page converts the two letters to digits and gives the most recent year that is not in the future; the manual also prints 'HK = 2089', which by the same table is the digits 8 and 9. A code that reads as a future year is reported as an error rather than pushed back a century.",
          "If your decal shows two digits instead of letters, they are entered as-is.",
          "Limits: the code is read from the decal, not from the serial number — Mercury does not publish a table that turns the serial number itself into a year. The table cited is from one Mercury manual; check that your decal has a two-character year code in the same place. A missing or unreadable decal needs a Mercury dealer, who can look the engine up by serial number. This site is not affiliated with Mercury Marine.",
        ],
        sources: [
          { label: "Mercury Marine — 15/20 EFI FourStroke Operation, Maintenance and Installation Manual (2019)", href: "https://servicelit.mercurymarine.com/mnetdata/SERVICE/MERMAR/OWNER/19/8M0165094.PDF", note: "Serial decal callouts and Model Year Production Code table" },
        ],
      }}
      faqs={[
        { question: "How do I tell what year my Mercury outboard is?", answer: "Read the two characters in the year box at the bottom right of the serial number decal and convert them with Mercury's table: A=1, B=2, C=3, D=4, E=5, F=6, G=7, H=8, K=9, X=0." },
        { question: "What does BX mean on a Mercury outboard?", answer: "B is 2 and X is 0, so BX is 2020 — Mercury's own example." },
        { question: "What does AG mean?", answer: "A is 1 and G is 7: 2017, also Mercury's example." },
        { question: "Can I get the year from the serial number itself?", answer: "Not from a published table. Mercury's manual points to the year code on the decal; a Mercury dealer can look up the full record by serial number." },
        { question: "Why are there no I or J letters?", answer: "Mercury's table uses only A to H, K and X — ten letters for the ten digits." },
        { question: "Where is the serial number decal?", answer: "Mercury's owner's manual for your model shows where it is on the engine. The decal lists the serial number, model and year code." },
      ]}
    >
      <MercuryYearTool />
    </ToolPageLayout>
  );
}
