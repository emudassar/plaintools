import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import OshaSoilTool from "@/components/OshaSoilTool";
import { requireTool } from "@/config/tools";

const SLUG = "osha-soil-classification";
// Fails the build if the registry entry is missing, so a page can never exist
// without being wired into the nav, footer and sitemap.
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "OSHA Soil Classification: Is It Type A, B or C?",
  description:
    "Answer the questions 29 CFR 1926 Subpart P Appendix A actually asks and get the soil class — Type A, B, C or stable rock — with the clause that decides it and the maximum allowable slope. Free, no sign-up.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function OshaSoilClassificationPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to classify soil with OSHA's criteria",
        steps: [
          {
            name: "Pick the material",
            text: "Choose what you are actually looking at from the list. The options are the material names Appendix A uses itself — clay, silt loam, angular gravel, caliche and so on — so you are not asked to guess the class before the tool works it out.",
          },
          {
            name: "Enter the unconfined compressive strength, if it was measured",
            text: "For a cohesive soil this single number is what separates Type A, Type B and Type C. Leave it blank if nobody has run a pocket penetrometer or thumb test; the result will then show the range that remains open instead of inventing a figure.",
          },
          {
            name: "Tick the conditions that apply",
            text: "Fissured, subject to vibration, previously disturbed, and submerged or freely seeping. Each of these appears as its own clause in Appendix A, and any one of them can change the class regardless of how strong the soil is.",
          },
          {
            name: "Say whether it is a layered system",
            text: "If the excavation cuts a sloped, layered deposit, the direction and steepness of the dip matters. Layers dipping into the excavation at four horizontal to one vertical or steeper force Type C on their own.",
          },
          {
            name: "Read the class and the clause",
            text: "The headline gives the class. Below it every clause that decided the answer is quoted in full, so you can see the exact regulatory wording rather than a paraphrase of it.",
          },
          {
            name: "Check the conditions that were not met",
            text: "The tool lists every condition it considered and whether it applied. A condition that did not apply is often the one worth double-checking on site, because it is the one that would change the answer.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where the OSHA soil class is the thing you need",
        items: [
          {
            title: "Preparing for the competent-person role on an excavation",
            body: "Appendix A requires the classification to be made by a competent person using at least one visual and one manual analysis. Someone stepping into that role has to know the criteria cold, including the five separate conditions that stop a soil being Type A no matter how strong it is. Working through the clauses against real material is a different kind of preparation from reading them in a training PDF.",
          },
          {
            title: "Deciding between sloping back and hiring a trench box",
            body: "The class sets the maximum allowable slope, and the slope sets how much ground has to come out. Type C at one-and-a-half to one takes a great deal more room than Type A at three-quarters to one. On a narrow site that difference is what decides whether sloping is possible at all or whether a shield has to be brought in, and it is worth knowing before the excavator arrives rather than after.",
          },
          {
            title: "Understanding a citation that names a clause you have never read",
            body: "An inspection finding cites a paragraph number, not an explanation. Seeing Type B (iv) quoted in full — soil that meets the strength or cementation requirements for Type A but is fissured or subject to vibration — turns a reference number into something you can check against what was actually in the ground that day.",
          },
          {
            title: "Pricing an excavation where the slope changes the volume",
            body: "An estimator working out spoil removal and reinstatement needs the slope angle, and the slope angle comes from the class. Assuming Type A on ground that turns out to be previously disturbed, and therefore Type B at best, understates the excavated volume and the muck-away cost on every metre of the run.",
          },
          {
            title: "Working out which side of the 1.5 tsf line a reading falls",
            body: "A pocket penetrometer reading of 1.4 tsf and one of 1.6 tsf are a single classification apart, and the regulation draws the line at 1.5 tsf or greater for Type A. Anyone holding a borderline number needs the boundary stated exactly as the regulation states it, including that the threshold is inclusive.",
          },
          {
            title: "Digging over a service that was laid and backfilled years ago",
            body: "Ground above an old utility run has been excavated before, and previously disturbed soil cannot be Type A under clause (iii). It becomes Type B — unless it would otherwise be Type C, in which case it stays Type C. Crews who classify the trench on the undisturbed material beside it reach the wrong class for the ground they are actually standing in.",
          },
          {
            title: "Excavating beside a busy road, a rail line or piling work",
            body: "Vibration from heavy traffic, pile driving or similar effects is its own disqualifier for Type A. The soil can test well above 1.5 tsf and still drop to Type B purely because of what is happening next to it, which is easy to miss when the classification is made from a sample rather than from the site.",
          },
          {
            title: "Reclassifying a trench after rain or a struck water line",
            body: "Soil from which water is freely seeping is Type C under clause (iii), whatever it was the day before. A trench that was classified on a dry Friday and left open over a wet weekend is a different classification on Monday, and the criteria say so explicitly.",
          },
          {
            title: "Preparing a toolbox talk on the classification system",
            body: "Explaining why the same clay can be Type A on one job and Type B on the next is much easier with the clauses in front of you and a worked case to change one answer at a time. The list of conditions that did not apply is often the more useful half of the talk.",
          },
          {
            title: "Checking a plan that asserts a class without saying why",
            body: "A method statement that states Type A and stops there gives you nothing to check. Running the same material through the published criteria shows which clauses would have to be satisfied for that claim to hold — and which single unanswered condition, such as whether the ground was previously disturbed, would undo it.",
          },
        ],
      }}
      dataSection={{
        heading: "Where these criteria come from",
        paragraphs: [
          "Every rule this page applies comes from Subpart P of 29 CFR Part 1926, the excavation standard issued by the Occupational Safety and Health Administration. Appendix A to that subpart sets out the soil classification system: it defines stable rock and Types A, B and C, and it defines the supporting terms those definitions lean on, including fissured, cemented soil, cohesive soil, granular soil, layered system and unconfined compressive strength. Appendix B sets the maximum allowable slopes for each class in excavations twenty feet or less in depth. These are regulatory definitions rather than engineering opinion, which is why this page quotes them rather than restating them.",
          "The criteria were read from the Code of Federal Regulations as published by the U.S. Government Publishing Office, and the clause text shown on the result card is reproduced verbatim from that file rather than summarised. Because the rules are fixed text, they are compiled into the page itself: the classification is worked out in your browser, and the page makes no request to any server while you use it. Nothing you enter is transmitted anywhere or stored, which also means no third party sees the details of your excavation.",
          "The limits are worth being precise about. The most important is that a cohesive soil cannot be placed between Type A, B and C without its unconfined compressive strength, and that is a measurement taken on site with a pocket penetrometer, a thumb penetration test or laboratory testing. Where that figure is missing this page returns the range that remains open instead of picking one. Beyond that, Appendix A ends the Type A definition with an open-ended clause — material subject to other factors that would require it to be classified as a less stable material — which by design cannot be reduced to a form. Appendix A also hedges on two materials, listing silty clay loam and sandy clay loam under both Type A and the Type B granular list with the words “in some cases” and without saying which case is which; the page flags that ambiguity rather than resolving it silently. A layered system is classified by its weakest layer, so a single answer describing the whole face can be wrong where the layers differ.",
          "What this page must not be used for is the classification itself. Appendix A paragraph (b)(2) requires that the classification be made from the results of at least one visual and at least one manual analysis, conducted by a competent person. A form cannot perform either analysis, and nothing here inspects the ground, so this page applies published criteria to answers you typed and no more than that. It does not tell you an excavation is safe, does not select a protective system, and has nothing to say about excavations more than twenty feet deep, where Subpart P requires the protective system to be designed by a registered professional engineer.",
        ],
        sources: [
          {
            label: "Appendix A to Subpart P of Part 1926 — Soil Classification",
            href: "https://www.ecfr.gov/current/title-29/part-1926/appendix-Appendix%20A%20to%20Subpart%20P%20of%20Part%201926",
            note: "the binding definitions of stable rock and Types A, B and C, on eCFR",
          },
          {
            label: "Appendix B to Subpart P of Part 1926 — Sloping and Benching",
            href: "https://www.ecfr.gov/current/title-29/part-1926/appendix-Appendix%20B%20to%20Subpart%20P%20of%20Part%201926",
            note: "the maximum allowable slopes quoted on the result card",
          },
          {
            label: "29 CFR 1926.652 — Requirements for protective systems",
            href: "https://www.ecfr.gov/current/title-29/section-1926.652",
            note: "when a protective system is required, and the stable rock and under-5-feet exceptions",
          },
          {
            label: "CFR Title 29, Volume 8 (GPO)",
            href: "https://www.govinfo.gov/content/pkg/CFR-2024-title29-vol8/xml/CFR-2024-title29-vol8-part1926-subpartP.xml",
            note: "the published XML this page's clause text was taken from",
          },
        ],
      }}
      faqs={[
        {
          question: "Does this replace the classification a competent person has to make?",
          answer:
            "No, and it cannot. Appendix A paragraph (b)(2) requires the classification to be based on the results of at least one visual and at least one manual analysis conducted by a competent person. Those are things done at the excavation, on the material itself. This page applies the published criteria to answers you typed into a form, which is a different act entirely. It is useful for learning the criteria, for checking your reasoning and for seeing which clause governs, and it is not a substitute for the analysis the regulation requires.",
        },
        {
          question: "Why did it give me a range instead of one class?",
          answer:
            "Because you left the unconfined compressive strength blank for a cohesive soil, and that number is the only thing that separates Type A, Type B and Type C for clay-like material. Rather than guess, the page shows every class still open given your other answers and names the measurement that would close it. The range is often narrower than you expect: a cohesive soil that is fissured cannot be Type A whatever its strength, so the answer becomes Type B or Type C without any measurement at all.",
        },
        {
          question: "What is the difference between Type A, Type B and Type C?",
          answer:
            "For cohesive soils it is strength: 1.5 tsf or greater is Type A, above 0.5 but below 1.5 is Type B, and 0.5 or less is Type C. For granular soils it is the material — angular gravel, silt, silt loam and sandy loam are Type B, while gravel, sand and loamy sand are Type C. On top of that sit conditions that override strength entirely: fissuring, vibration and previous disturbance all stop a soil being Type A, and submerged or freely seeping soil is Type C regardless of anything else. The result card quotes whichever of those clauses decided your answer.",
        },
        {
          question: "My soil tested above 1.5 tsf. Why is the answer Type B?",
          answer:
            "Because one of the disqualifying conditions applied. Appendix A says that no soil is Type A if it is fissured, subject to vibration from heavy traffic or pile driving, previously disturbed, or part of a sloped layered system whose layers dip into the excavation at four horizontal to one vertical or greater. Type B clause (iv) then catches exactly that case: soil meeting the Type A strength or cementation requirement but fissured or subject to vibration. Strength is necessary for Type A, not sufficient.",
        },
        {
          question: "Where does the maximum allowable slope come from?",
          answer:
            "From Appendix B, for simple slope excavations twenty feet or less in depth: three-quarters to one for Type A, one to one for Type B, and one and a half to one for Type C. Type A also carries a short-term exception of one half to one, which applies only where the excavation is open twenty-four hours or less and is twelve feet or less deep — both conditions, not either. The ratios on the result card are quoted from the regulation; the degree figures beside them are arithmetic from those ratios, shown because many people picture a slope as an angle, and the regulation itself states the ratio.",
        },
        {
          question: "Does any of this apply outside the United States?",
          answer:
            "No. 29 CFR is United States federal regulation and applies to workplaces under OSHA jurisdiction. Other countries set their own excavation rules with their own soil categories and their own required slopes, and they do not map onto Type A, B and C. If you are working elsewhere, this page is useful for understanding the American system and is not the standard you are working to.",
        },
        {
          question: "Why are silty clay loam and sandy clay loam treated as cohesive here?",
          answer:
            "Because the regulation is genuinely ambiguous about them and we would rather show that than hide it. Appendix A lists both under Type A with the qualifier “in some cases”, and then lists both again in the Type B granular list, also “in some cases”, without saying which case is which. The page treats them as cohesive so the answer still depends on measured strength, and it displays a note on the result explaining the conflict so you know the regulation, not the tool, is the source of the uncertainty.",
        },
        {
          question: "Can I reuse what this page produces?",
          answer:
            "The regulation text quoted here is a work of the United States government and is in the public domain, so the clauses themselves can be reused freely. Cite 29 CFR 1926 Subpart P as the source, and check the current text on eCFR before relying on it, since the Code of Federal Regulations is amended over time and the clause text on this page was read on a specific date that is shown on the result card.",
        },
      ]}
    >
      <OshaSoilTool />
    </ToolPageLayout>
  );
}
