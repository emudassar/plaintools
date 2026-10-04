import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import PoolShockTool from "@/components/PoolShockTool";
import { requireTool } from "@/config/tools";

const SLUG = "pool-shock-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Pool Shock Calculator: How Much Shock to Add, by Product",
  description:
    "Enter pool gallons, current and target free chlorine and your product (cal-hypo, liquid chlorine, dichlor, trichlor or any % on the label) and get the exact ounces or pounds to add, from a state health department dose table. Free.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function PoolShockCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out a shock dose",
        steps: [
          {
            name: "Enter the pool volume",
            text: "The dose scales directly with gallons. The guide's figures are per 10,000 gallons, so a 25,000-gallon pool takes two and a half times the listed amount.",
          },
          {
            name: "Test and enter the current free chlorine",
            text: "The source describes testing free available chlorine with a DPD test kit before adjusting. Enter that reading in ppm.",
          },
          {
            name: "Enter the target level",
            text: "Use the level on the product label, from your pool professional, or set by your health department. The tool does not pick a target; it works out how much product reaches the one you enter.",
          },
          {
            name: "Pick the product, or enter its strength",
            text: "Common products are listed with the guide's own dose per ppm. For anything else, choose 'Other' and enter the available chlorine percentage from the label — the guide gives a method for exactly that case.",
          },
          {
            name: "Read the amount and check it against the label",
            text: "The result shows ounces or pounds for dry products and fluid ounces, quarts or gallons for liquids, with the arithmetic. The guide states the manufacturer's label instructions must always be followed.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where a measured shock dose matters",
        items: [
          {
            title: "Shocking after a pool party or heavy use",
            body: "A busy weekend uses up chlorine. Working out the dose from the actual reading avoids a guessed bag that is either too little to bring the level back or far more than needed.",
          },
          {
            title: "Clearing cloudy or green water",
            body: "An algae bloom needs chlorine raised well above normal. Knowing it is, for example, 3 lb rather than '1 bag' for your volume tells you how many bags to buy before you start.",
          },
          {
            title: "Using liquid chlorine instead of granular",
            body: "Liquid is measured by volume, not weight. The tool gives fluid ounces, quarts or gallons for liquid products, so a jug can be measured out rather than poured by eye.",
          },
          {
            title: "Converting a label that gives a different pool size",
            body: "Labels usually quote a dose for 10,000 gallons. The tool scales that to your exact volume and ppm change, which is the calculation the source document walks through.",
          },
          {
            title: "Dosing a product with an unusual strength",
            body: "Calcium hypochlorite is sold from 47% to 78%, and the dose differs accordingly. Entering the label percentage uses the source's no-label method instead of a figure for a different strength.",
          },
          {
            title: "Responding to a fecal incident at a public pool",
            body: "The source's worked example raises a 200,000-gallon pool from 1 to 20 ppm with 67% calcium hypochlorite — 47.5 pounds. Operators can run the same arithmetic for their own volume while following their health department's procedure.",
          },
          {
            title: "Opening a pool for the season",
            body: "Opening often calls for a large chlorine boost. A measured dose for the pool's volume is the difference between one trip to the store and two.",
          },
          {
            title: "Checking a pool store's printout",
            body: "If a printout says to add a certain amount, entering the same volume, reading and product shows whether the published per-ppm figure agrees.",
          },
          {
            title: "Shocking a hot tub",
            body: "Small volumes need small, exact doses. The tool returns grams and millilitres as well as ounces, which is easier to measure for a few hundred gallons.",
          },
          {
            title: "Training new pool staff",
            body: "The result card shows the table figure and each step of the arithmetic, which is the same calculation taught to pool operators.",
          },
        ],
      }}
      dataSection={{
        heading: "Where the dose figures come from",
        paragraphs: [
          "The doses come from the Indiana Department of Health's guide 'Adjusting Chemical Levels in a Swimming Pool'. Its Water Chemistry Adjustment Guide lists the amount of each common chlorine product needed to raise 10,000 gallons by 1 ppm — 2 oz of 67% calcium hypochlorite, 10.7 fl oz of 12% sodium hypochlorite, 2.1 oz of 62% dichlor, 1.5 oz of trichlor, and others — and states that the table was adapted from the National Swimming Pool Foundation's Pool & Spa Operator Handbook.",
          "The same guide gives the scaling rule this page uses: amount from the table × (pool gallons ÷ 10,000) × (ppm change ÷ table ppm). For a product not in the table, it gives a second method: 0.083 lb for a dry product, or 1.3 fl oz for a liquid, divided by the available chlorine fraction on the label, per ppm per 10,000 gallons. Both are implemented exactly. The guide's own worked examples are the cross-check: 200,000 gallons from 1 to 20 ppm with 67% calcium hypochlorite comes to 760 oz (47.5 lb), and 40,000 gallons from 1 to 3 ppm with 12% sodium hypochlorite comes to 85.6 fl oz. This page reproduces both.",
          "Everything is worked out in your browser; nothing is sent or stored.",
          "The limits are the source's own. It says chemical amounts have been rounded and that the manufacturer's label must always be followed. The calculation assumes the product is at its stated strength and that nothing consumes chlorine as it is added — water with algae, ammonia or heavy organic load has a chlorine demand that can use up much of a dose, which is why re-testing matters.",
          "This page does not set a target, diagnose a water problem or replace a health department procedure for public pools. Pool chemicals are hazardous: the guide's handling rules — never mix chemicals, dissolve and add when the pool is not in use, wear the protection on the safety data sheet — apply to whatever amount you add.",
        ],
        sources: [
          {
            label: "Indiana Department of Health — Adjusting Chemical Levels in a Swimming Pool (PDF)",
            href: "https://www.in.gov/health/eph/files/Chemical_adjustment_pool.pdf",
            note: "Water Chemistry Adjustment Guide, the scaling formula, the no-label method and the worked examples",
          },
          {
            label: "Pool & Hot Tub Alliance",
            href: "https://www.phta.org/",
            note: "Publisher of pool operator training material, including the handbook the table was adapted from",
          },
        ],
      }}
      faqs={[
        {
          question: "How much shock do I need for a 10,000-gallon pool?",
          answer:
            "It depends on the product and how far you are raising the level. The guide's figure for 67% calcium hypochlorite is 2 oz per ppm per 10,000 gallons, so raising free chlorine from 1 to 10 ppm takes 18 oz, a little over a pound. With 12% liquid chlorine it is 10.7 fl oz per ppm, or about 96 fl oz (3 quarts) for the same 9 ppm rise.",
        },
        {
          question: "What level should I shock my pool to?",
          answer:
            "This page doesn't choose one. Product labels, pool professionals and health departments set targets for different situations. Enter the level you have been told to reach and the tool works out the amount.",
        },
        {
          question: "My product isn't in the list. What do I do?",
          answer:
            "Choose 'Other' and enter the available chlorine percentage printed on the label. The tool then uses the source's no-label method: 0.083 lb for dry products or 1.3 fl oz for liquids, divided by that fraction, per ppm per 10,000 gallons.",
        },
        {
          question: "Why does the label give a different number?",
          answer:
            "Products vary in strength, and the guide says its amounts are rounded and that the manufacturer's label must always be followed. Where the label and this page disagree, the label is the authority for that product.",
        },
        {
          question: "Why didn't the chlorine reach my target after I added the dose?",
          answer:
            "The calculation assumes nothing uses chlorine as it is added. Algae, contaminants and sunlight all consume free chlorine, so a pool with a heavy demand can need more than the arithmetic shows. Re-test after the water has circulated.",
        },
        {
          question: "Can I use this for a public or commercial pool?",
          answer:
            "The arithmetic is the same one the source teaches operators, but public pools follow their health department's rules for targets, closure times and procedures. Use this as a calculation aid alongside those rules, not instead of them.",
        },
        {
          question: "Is the result in weight or volume?",
          answer:
            "Dry products are weighed, so they come out in ounces and pounds (and grams). Liquid chlorine is measured by volume, so it comes out in fluid ounces, quarts or gallons (and millilitres).",
        },
      ]}
    >
      <PoolShockTool />
    </ToolPageLayout>
  );
}
