import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import WaterSoftenerTool from "@/components/WaterSoftenerTool";
import { requireTool } from "@/config/tools";

const SLUG = "water-softener-size-calculator";
// Fails the build if the registry entry is missing, so a page can never exist
// without being wired into the nav, footer and sitemap.
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Water Softener Size Calculator: Grain Capacity From Your Hardness",
  description:
    "Enter your water hardness in gpg or mg/L and your household size to get grains removed per day, the grain capacity that implies, and how often a given unit would regenerate. Uses Penn State Extension's published method. Free, no sign-up.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function WaterSoftenerSizeCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to size a water softener from your test report",
        steps: [
          {
            name: "Find the hardness on your water test",
            text: "It appears either as grains per gallon or as milligrams per litre of calcium carbonate, which is the same as parts per million. Enter the number and pick the matching unit. If your report gives only one of the two, do not convert it by hand — the tool converts and shows both.",
          },
          {
            name: "Say how much water the house uses",
            text: "Either give the number of people and let the calculation use a per-person figure, or enter a metered daily total if you have one. The per-person default is 75 gallons, which is the figure Penn State Extension uses in its own worked example, and it is editable.",
          },
          {
            name: "Choose how often you want it to regenerate",
            text: "This decides how much capacity the arithmetic asks for: capacity is simply the daily grain load multiplied by the number of days. Neither source names a target interval, so the number you pick here is your choice and the result says so.",
          },
          {
            name: "Add a unit's rated capacity if you are checking one",
            text: "The grains-per-regeneration figure from a product label or spec sheet turns the question round: instead of asking what capacity you need, the tool divides that capacity by your daily grain load and tells you how often that particular unit would regenerate on your water.",
          },
          {
            name: "Enter iron and manganese if your test reports them",
            text: "These do not change the hardness arithmetic and the tool does not fold them into it, because no citable source was found for the compensation factor vendors use. What they do is trigger the relevant sentences from NDSU Extension about the level you have.",
          },
          {
            name: "Read the result and the sentences behind it",
            text: "The headline is grains per day. Below it sit the capacity, the interval, the hardness classification and the sodium figure, each showing the arithmetic that produced it, followed by the source sentences quoted in full rather than paraphrased.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where the grain figure is the thing you need",
        items: [
          {
            title: "Checking whether the unit a salesperson quoted is the size they said",
            body: "An in-home quote usually arrives as a model number and a price, with the sizing logic left implicit. Running your own hardness and household size through the published method gives you the daily grain load in one line, so you can ask why the proposed capacity is what it is rather than taking it on trust.",
          },
          {
            title: "Working out why a softener installed last year needs salt every week",
            body: "A unit regenerating far more often than expected is usually undersized for the hardness rather than faulty. Dividing its rated capacity by the daily grain load gives the interval the arithmetic predicts, which either matches what the householder is seeing or points at something else entirely.",
          },
          {
            title: "Reading a water test report for the first time after moving to a well",
            body: "A report arrives as a column of numbers with no interpretation attached. Seeing 24 grains per gallon land in Penn State's Very Hard band, and seeing what that means per day for four people, converts an abstract figure into something with a size attached.",
          },
          {
            title: "Deciding whether a unit rated in mg/L and one rated in gpg are comparable",
            body: "Manufacturers and test labs mix the two units freely, and they differ by about seventeen times. Someone comparing a report that says 200 mg/L against a chart drawn in grains per gallon is looking at 11.8 gpg, not 200, and the difference is the whole answer.",
          },
          {
            title: "Sizing for a household that is about to change size",
            body: "A couple whose two children are moving back home is going from roughly 150 gallons a day to 300, which doubles the daily grain load and halves the interval on the same unit. Changing one number shows whether the existing softener still works or whether the capacity has been outgrown.",
          },
          {
            title: "Estimating the salt bill before committing to a system",
            body: "Regeneration frequency is what drives salt consumption, and frequency comes straight from the daily grain load against the unit's capacity. Knowing you are looking at a cycle every four days rather than every ten is the difference between two quite different running costs over a decade.",
          },
          {
            title: "Checking a sizing rule of thumb found on a retailer's site",
            body: "The pages that rank for this question use per-person figures of 70, 75 and 80 gallons and different iron adjustments, without citing any of them. Putting the same inputs through a method that shows its arithmetic makes it obvious how much of the spread between those answers is assumption.",
          },
          {
            title: "Understanding how much sodium softening actually adds",
            body: "Anyone told to watch their sodium intake wants a number, not reassurance. Penn State gives 7.5 milligrams per quart for each grain per gallon removed, so the figure follows directly from the hardness being taken out — and for very hard water it is not a small one.",
          },
          {
            title: "Working out how much water the regeneration cycles will use",
            body: "A household on a small septic system, or on a metered supply, has a reason to know how much water goes down the drain recharging the resin. At roughly fifty gallons a cycle, the annual total depends entirely on the interval, and NDSU has something specific to say about septic systems.",
          },
          {
            title: "Seeing whether iron is high enough to be a separate problem",
            body: "Iron at a level a softener can carry and iron that needs its own removal stage are different purchases. Entering the figure from the test surfaces the sentence NDSU wrote about the ten parts per million line, including the fact that their wording does not make clear whether the limit is per contaminant or combined.",
          },
        ],
      }}
      dataSection={{
        heading: "Where this calculation comes from",
        paragraphs: [
          "The arithmetic on this page is the method published by Penn State Extension in its article “Water Softening”, which sets it out as a worked example: a sample capacity of 20,000 grains per regeneration, 75 gallons of average person usage per day, raw water hardness of 10 grains per gallon and a household of four, giving 3,000 grains per day used and about a six-to-seven day regeneration. Every figure this page reports is that same arithmetic run on your numbers. The supporting figures come from the same article — that a grain per gallon equals approximately 17 mg/l or ppm, the five-band hardness classification in its Table 1, that softening adds 7.5 milligrams of sodium per quart for each grain per gallon removed, and that about 50 gallons of water are used for each regeneration cycle. The sentences about iron, manganese and septic systems come from North Dakota State University Extension's publication “Water Softening (Ion Exchange)”. Both are free public extension publications from land-grant universities.",
          "Because these are fixed published figures rather than a live dataset, they are compiled into the page itself. The calculation runs in your browser and the page makes no request to any server while you use it, so nothing you type is transmitted anywhere or stored — which matters here, because what you type is a description of your household and its water supply.",
          "The limits are worth stating plainly. This page cannot know your water: hardness, iron and manganese have to come from an actual test of the water at your tap or well, and everything shown is arithmetic on the numbers you provide. The per-person water figure is Penn State's, used in their example, and it is a stand-in for metering your own supply rather than a measurement of your household. The interval between regenerations is a number you choose, because neither source names a target. Deliberately missing is any adjustment of hardness for iron content: the pages that currently rank for this question add either four or five grains per gallon for each part per million of iron, the two figures disagree, and no citable source for either could be found, so this page reports iron separately against NDSU's own sentence rather than folding an uncited multiplier into your answer. NDSU's ten parts per million sentence is itself ambiguous about whether the limit applies to iron and manganese separately or combined; the page adds them, which is the stricter reading, and shows you the sentence.",
          "What this page must not be used for is deciding what to buy or whether to treat your water at all. It does not recommend equipment, does not compare products, does not say whether a softener is needed, and has nothing to say about anything a hardness test does not measure — bacteria, nitrate, arsenic, hydrogen sulfide, tannins, pH or the flow rate and pressure your plumbing actually runs at. Several of those are health matters rather than plumbing ones, and the place to take a water test result for interpretation is your state health department or your local extension service, both of which publish guidance for exactly that purpose and are linked below.",
        ],
        sources: [
          {
            label: "Penn State Extension — Water Softening",
            href: "https://extension.psu.edu/water-softening",
            note: "the worked example, the hardness classification table, and the sodium and regeneration-water figures used here",
          },
          {
            label: "NDSU Extension — Water Softening (Ion Exchange)",
            href: "https://www.ndsu.edu/agriculture/extension/publications/water-softening-ion-exchange",
            note: "the iron and manganese threshold and the note on septic systems",
          },
          {
            label: "Penn State Extension — How to Interpret a Water Analysis Report",
            href: "https://extension.psu.edu/how-to-interpret-a-water-analysis-report",
            note: "for reading the rest of a water test, which this page does not cover",
          },
          {
            label: "CDC — Guidelines for Testing Well Water",
            href: "https://www.cdc.gov/drinking-water/safety/guidelines-for-testing-well-water.html",
            note: "where to start if the question is about the safety of the water rather than its hardness",
          },
        ],
      }}
      faqs={[
        {
          question: "What grain capacity do I actually need?",
          answer:
            "The arithmetic gives it directly: your daily grain load multiplied by the number of days you want between regenerations. For Penn State's own example — four people, 75 gallons each per day, 10 grains per gallon — that is 3,000 grains a day, so a week between cycles works out at 21,000 grains. What this page will not do is turn that into a product recommendation, because capacity is one of several things that decide whether a given unit suits a given house, and the rest of them are not in a hardness figure.",
        },
        {
          question: "Why does the answer not change when I enter iron?",
          answer:
            "Because we could not find a citable source for the adjustment. Most pages that rank for this question add four or five grains per gallon of effective hardness for each part per million of iron, but the two figures disagree with each other and neither is attributed to anything. Rather than pick one and present it as fact, this page keeps iron out of the arithmetic and shows you what NDSU Extension actually wrote about iron levels instead. If you want the adjustment applied, you can add it to the hardness figure yourself, knowing that is what you have done.",
        },
        {
          question: "My report is in mg/L and the calculator asks for grains. Which do I use?",
          answer:
            "Either — switch the unit selector to mg/L and enter the number as printed. Penn State states that a grain per gallon equals approximately 17 mg/l or ppm, and that conversion is what the tool applies. This is the single easiest place to go wrong: a hardness of 200 mg/L is about 11.8 grains per gallon, and typing 200 into a box expecting grains gives an answer roughly seventeen times too large. The result card always shows both figures so you can see which one you meant.",
        },
        {
          question: "How often should a softener regenerate?",
          answer:
            "Neither source names a target, so neither does this page. The field for it is there because the capacity you need depends on the interval you want, not because seven days or any other number is correct. Penn State's example happens to produce about six to seven days for the inputs they chose, which is a consequence of their numbers rather than a recommendation. If you want a target interval for a specific unit, the manufacturer's documentation is the place it will be stated.",
        },
        {
          question: "Can I use this instead of having my water tested?",
          answer:
            "No. Every number this page produces starts from a hardness figure, and there is no way to know that without a test. Water utilities publish an annual report that usually includes hardness for their supply, and private wells need a laboratory test. Beyond hardness, a test is the only way to know about iron, manganese and the things a softener does not address at all, several of which are health matters rather than plumbing ones. Your state health department or local extension service can point you at a certified laboratory.",
        },
        {
          question: "Does a softener remove iron?",
          answer:
            "The sources are specific and worth quoting rather than summarising. NDSU Extension says that some softeners will also remove up to 10 ppm of iron and manganese, and that supplies with more than that may need a dedicated iron removal system. Penn State adds that the form matters as well as the amount: colourless dissolved iron will be removed by the unit, while red oxidised iron — iron already exposed to air or chlorine — will clog the resin. Both sentences appear on the result card when you enter an iron figure.",
        },
        {
          question: "Where does the sodium figure come from, and should I worry about it?",
          answer:
            "It comes from Penn State's statement that the exchange of hardness minerals for sodium adds 7.5 milligrams per quart for each grain per gallon of hardness removed. The tool multiplies that by your hardness, so it scales with how much is being taken out. Whether that matters for a particular person is a question for their doctor and not something this page will answer; NDSU notes that potassium chloride can be substituted for sodium chloride, that it costs more, and that it reduces exchange efficiency.",
        },
        {
          question: "Can I reuse these figures?",
          answer:
            "The arithmetic is arithmetic and yours to use. The sentences quoted on the result card belong to Penn State Extension and North Dakota State University Extension, so cite them rather than this page, and follow the links to check the current wording — extension publications get revised, and the text here was read on the date shown on the card. Neither publication was dated on the page when it was read, which is why the retrieval date is what the card records.",
        },
      ]}
    >
      <WaterSoftenerTool />
    </ToolPageLayout>
  );
}
