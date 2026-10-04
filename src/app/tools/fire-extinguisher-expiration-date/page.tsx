import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import FireExtinguisherTool from "@/components/FireExtinguisherTool";
import { requireTool } from "@/config/tools";

const SLUG = "fire-extinguisher-expiration-date";
// Fails the build if the registry entry is missing, so a page can never exist
// without being wired into the nav, footer and sitemap.
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Fire Extinguisher Expiration Date: Next Hydrostatic Test by Type",
  description:
    "Pick the extinguisher type and enter its manufacture or last test date to get the next hydrostatic test date from OSHA 1910.157 Table L-1, plus the 6-year maintenance for stored-pressure dry chemical units. Free, no sign-up.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function FireExtinguisherExpirationDatePage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out when a fire extinguisher is due",
        steps: [
          {
            name: "Identify the type from the label",
            text: "OSHA's Table L-1 sets the hydrostatic test interval by extinguisher type: the agent (dry chemical, carbon dioxide, water, foam, halon) and, for some, the shell material or whether it is stored pressure or cartridge operated. Pick the row that matches the label.",
          },
          {
            name: "Find the manufacture date or last hydrostatic test date",
            text: "If the extinguisher has been hydrostatically tested, use that date. 1910.157(f)(16) requires employers to keep a certification record of each test with its date. Otherwise use the date of manufacture.",
          },
          {
            name: "For stored-pressure dry chemical, add the last recharge",
            text: "These units also have a 6-year emptying and maintenance requirement under 1910.157(e)(4), and a recharge restarts that clock. Enter the last recharge date if there has been one.",
          },
          {
            name: "Read the due dates and the rule behind them",
            text: "The result shows the next hydrostatic test date, the 6-year maintenance date where it applies, how far away each is, and the Table L-1 row used. Disposable units and pre-1982 soldered brass shells are handled separately, because the table gives no interval for them.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where the test date matters",
        items: [
          {
            title: "Preparing a small business for an OSHA inspection",
            body: "1910.157(f)(16) requires evidence that hydrostatic tests were done at the Table L-1 intervals. Working out which units are due before an inspector asks avoids a citation for a test that was simply forgotten.",
          },
          {
            title: "Checking a CO2 extinguisher in a server room or kitchen",
            body: "Carbon dioxide units are on a 5-year cycle, much shorter than the 12 years of a stored-pressure dry chemical unit. Someone assuming 12 years for every extinguisher is seven years off for these.",
          },
          {
            title: "Catching the 6-year maintenance on stored-pressure dry chemical units",
            body: "A stored-pressure dry chemical extinguisher can be years from its 12-year hydrostatic test and still overdue for the 6-year emptying and maintenance in (e)(4). The result shows both dates, not just one.",
          },
          {
            title: "Seeing that a recharge reset the clock",
            body: "A unit discharged and recharged in 2023 is counted from 2023 for the 6-year rule, not from its manufacture date. Entering the recharge date gives the correct due month.",
          },
          {
            title: "Auditing extinguishers when taking over a building",
            body: "A new facilities manager inherits extinguishers of mixed ages and types. Going through them one by one turns a pile of labels into a list of which are due this year.",
          },
          {
            title: "Checking a used extinguisher bought for a shop or garage",
            body: "A second-hand unit may be well past its test interval. Entering its type and date shows how long ago the test was due, before relying on it.",
          },
          {
            title: "Understanding why a disposable unit has no hydro date",
            body: "Non-refillable dry chemical units are exempt from the 6-year rule, and 1910.157 sets no service life for them. The page says so plainly instead of inventing a number.",
          },
          {
            title: "Settling 'do fire extinguishers expire after 12 years?'",
            body: "Twelve years is the Table L-1 interval for some types only. Water, foam, AFFF, CO2 and stainless-shell dry chemical units are 5 years. The table on the result shows every row.",
          },
          {
            title: "Planning a service budget for a fleet of vehicles",
            body: "Vehicle extinguishers of different types fall due in different years. Knowing which year each one's test lands in spreads the cost instead of being surprised by several at once.",
          },
          {
            title: "Recognising a pre-1982 soldered brass extinguisher",
            body: "Table L-1's footnote says soldered or riveted copper and brass shells must not be hydrostatically tested and had to be removed from service by January 1, 1982. The page states that instead of giving a date.",
          },
        ],
      }}
      dataSection={{
        heading: "Where these dates come from",
        paragraphs: [
          "The intervals come from OSHA's portable fire extinguisher standard, 29 CFR 1910.157. Paragraph (f)(2) requires portable extinguishers to be hydrostatically tested at the intervals in Table L-1: 5 years for carbon dioxide, water and antifreeze, wetting agent, foam and AFFF, loaded stream, and dry chemical in stainless steel; 12 years for stored-pressure dry chemical in mild steel, brazed brass or aluminum shells, cartridge or cylinder operated dry chemical and dry powder in mild steel shells, and Halon 1211 and 1301. Paragraph (e)(4) adds a 6-year emptying and maintenance requirement for stored-pressure dry chemical extinguishers that need a 12-year test, restarted by any recharge or hydrostatic test, and exempts non-refillable disposable units.",
          "This page reads the regulation text from eCFR (current as of October 1, 2026; the section was last amended in 2017) and does the date arithmetic in your browser. Nothing is fetched while you use it and nothing you enter is sent or stored. Dates are counted in whole months.",
          "Its limits: 1910.157 is a workplace standard that tells employers what to do. It is not a rule for private homes, and it is not NFPA 10, the standard for portable extinguishers that most fire codes adopt and that a fire marshal will usually enforce. NFPA 10 is copyrighted and is not quoted here, so where it differs, this page cannot show it. The table interval also stops applying when paragraph (f)(2)'s conditions are present: soldering or welding repairs, damaged threads, pitting corrosion, fire damage, or calcium chloride in a stainless shell.",
          "What it must not be used for: deciding that a particular extinguisher works, is charged, or is safe to rely on. It reports the dates OSHA's table gives for the type and date entered. The monthly inspection, the annual maintenance check and the hydrostatic test itself are done by looking at, and testing, the extinguisher.",
        ],
        sources: [
          {
            label: "eCFR: 29 CFR 1910.157, Portable fire extinguishers",
            href: "https://www.ecfr.gov/current/title-29/part-1910/section-1910.157",
            note: "Paragraphs (e) and (f) and Table L-1: the intervals and conditions used here",
          },
          {
            label: "OSHA: 1910.157, Portable fire extinguishers",
            href: "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.157",
            note: "The same standard on OSHA's own site",
          },
        ],
      }}
      faqs={[
        {
          question: "Do fire extinguishers expire?",
          answer:
            "OSHA's standard does not use an expiry date. It requires a hydrostatic test at an interval set by type in Table L-1 (5 or 12 years), plus, for stored-pressure dry chemical units, emptying and maintenance every 6 years. A unit past those dates is what people usually mean by an expired extinguisher.",
        },
        {
          question: "Is it 5, 6 or 12 years?",
          answer:
            "It depends on the type. Table L-1 gives 12 years for stored-pressure dry chemical, cartridge-operated dry chemical and dry powder in mild steel, and Halon 1211 and 1301, and 5 years for the rest. The 6 years is separate: under 1910.157(e)(4), stored-pressure dry chemical units with a 12-year test must also be emptied and maintained every 6 years.",
        },
        {
          question: "Does this apply to the extinguisher in my house?",
          answer:
            "1910.157 is an OSHA workplace standard, so it does not bind a homeowner. The intervals it lists are still a published, citable reference for the extinguisher type. For a disposable home unit, the standard sets no service life, and the manufacturer's label is where a figure would come from.",
        },
        {
          question: "Why does it give no date for my disposable extinguisher?",
          answer:
            "1910.157(e)(4) exempts dry chemical extinguishers with non-refillable disposable containers from the 6-year rule, and nothing in the section sets a service life for them. Rather than invent one, the page says so.",
        },
        {
          question: "Does a recharge reset the dates?",
          answer:
            "It resets the 6-year maintenance clock. 1910.157(e)(4) says that when recharging or hydrostatic testing is performed, the 6-year requirement begins from that date. It does not reset the Table L-1 hydrostatic test interval, which runs from the last hydrostatic test.",
        },
        {
          question: "Is this the same as NFPA 10?",
          answer:
            "No. NFPA 10 is the National Fire Protection Association's standard for portable extinguishers, which most fire codes adopt. It is copyrighted, so this page does not quote it. This page uses OSHA's 1910.157, which is public. Where a local fire code adopts NFPA 10, its requirements are the ones that inspector will check.",
        },
        {
          question: "Can I use this instead of having the extinguisher serviced?",
          answer:
            "No. It works out dates. The monthly inspection, the annual maintenance check and the hydrostatic test are physical checks, and 1910.157(f)(1) requires hydrostatic testing to be done by trained persons with suitable equipment.",
        },
      ]}
    >
      <FireExtinguisherTool />
    </ToolPageLayout>
  );
}
