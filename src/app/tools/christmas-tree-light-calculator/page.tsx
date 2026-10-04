import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import ChristmasTreeLightsTool from "@/components/ChristmasTreeLightsTool";
import { requireTool } from "@/config/tools";

const SLUG = "christmas-tree-light-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Christmas Tree Light Calculator: How Many Lights and Sets",
  description:
    "How many lights for your Christmas tree — a 7 ft tree takes about 700 at 100 per foot — and how many sets to buy, with the CPSC limit of three incandescent sets strung together.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function ChristmasTreeLightCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out lights for a tree",
        steps: [
          {
            name: "Measure the tree height",
            text: "Measure from the base of the branches to the tip, in feet or metres. The rule of thumb is per foot of height.",
          },
          {
            name: "Choose a look",
            text: "75 lights per foot for a softer look, 100 for the common 'classic' figure, 125 for a dense one — or enter your own number.",
          },
          {
            name: "Enter the lights per set",
            text: "Use the count printed on the box. Sets of 50, 100 and 300 are common; the length of lit wire is optional.",
          },
          {
            name: "Read lights and sets",
            text: "The tool multiplies height by lights per foot, then divides by the set size and rounds up to whole sets.",
          },
          {
            name: "Check how sets can be joined",
            text: "For incandescent sets it applies CPSC's three-set limit; for LED it points to the maximum printed on the set's label.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where the light count matters",
        items: [
          {
            title: "Buying lights for a 7 ft tree",
            body: "At 100 per foot that is 700 lights — seven 100-light sets. Knowing that before the shop avoids a second trip mid-decorating.",
          },
          {
            title: "Lighting a first real tree",
            body: "Someone who has only had a pre-lit artificial tree has no reference for how many sets a bare tree takes.",
          },
          {
            title: "Replacing a pre-lit tree's dead lights",
            body: "When a pre-lit section fails, the count tells you how many add-on sets cover the whole tree.",
          },
          {
            title: "Switching from incandescent to LED",
            body: "The tool handles different set sizes, so the new LED sets can be counted against the old look.",
          },
          {
            title: "Planning outlets for incandescent lights",
            body: "CPSC says never string more than three incandescent sets together. Ten sets means at least four separate runs, which affects where the cords go.",
          },
          {
            title: "Lighting a tall tree in a stairwell or hall",
            body: "A 12 ft tree takes about 1,200 lights at 100 per foot, a different shopping list from a 6 ft one.",
          },
          {
            title: "Decorating a church, shop or office tree",
            body: "Whoever buys for a shared tree needs a count to justify the spend; the arithmetic is shown on the result.",
          },
          {
            title: "Using lights already in storage",
            body: "Enter the set size you already own to see how many of those sets the tree needs and whether you have enough.",
          },
          {
            title: "Lighting a tabletop or small tree",
            body: "A 4 ft tree at 75 per foot is 300 lights, often a single set.",
          },
          {
            title: "Settling a disagreement about how many lights is enough",
            body: "Seeing 75, 100 and 125 per foot side by side for the same tree shows the range people actually use.",
          },
        ],
      }}
      dataSection={{
        heading: "Where the numbers come from",
        paragraphs: [
          "There is no official standard for how many lights a Christmas tree takes. What exists is a widely repeated rule of thumb: about 100 lights per foot of tree height. Mahoney's Garden Center publishes it with 75 per foot for a cozier look and 125 for a 'showstopper'; Govee gives the same 100-per-foot guideline. This page uses those three figures as presets and lets you enter your own.",
          "The count is tree height × lights per foot, rounded up to a whole light, then divided by the lights per set and rounded up to whole sets. If you enter the lit length of one set, the total length is sets × that length. Everything is calculated in your browser and nothing is sent anywhere.",
          "The connection limit for incandescent sets comes from the U.S. Consumer Product Safety Commission's holiday safety guidance: \"Never string together more than three sets of incandescent lights and never overload electrical outlets.\" For LED sets the number allowed is printed on the set's own label, and that label is the authority.",
          "The limits: the rule of thumb uses height only. A wide, full tree takes more lights than a narrow one of the same height, and the spacing of bulbs on the wire changes how dense they look. The page does not calculate electrical load, circuit capacity or outlet ratings, and says nothing about whether any particular installation is safe; follow the set's instructions and labels.",
        ],
        sources: [
          {
            label: "Mahoney's Garden Center — Christmas Tree Decorating by the Numbers",
            href: "https://mahoneysgarden.com/christmas-tree-decorating-by-the-numbers/",
            note: "75 / 100 / 125 lights per foot of height",
          },
          {
            label: "Govee — How Many Feet of Lights Do You Need for a 7-Foot Christmas Tree?",
            href: "https://us.govee.com/blogs/product-review-blog/how-many-feet-of-lights-do-you-need-for-a-7-foot-christmas-tree",
            note: "100 lights per foot guideline",
          },
          {
            label: "U.S. CPSC — Holiday Safety",
            href: "https://www.cpsc.gov/Safety-Education/Safety-Education-Centers/Holiday-Safety",
            note: "No more than three incandescent sets strung together",
          },
        ],
      }}
      faqs={[
        {
          question: "How many lights do I need for a 7 ft Christmas tree?",
          answer:
            "About 700 at the common 100-per-foot rule of thumb — 525 at 75 per foot or 875 at 125 per foot. With 100-light sets that is 6 to 9 sets.",
        },
        {
          question: "How many lights for a 6 ft tree?",
          answer: "About 600 at 100 per foot (450 at 75, 750 at 125).",
        },
        {
          question: "Is 100 lights per foot an official rule?",
          answer:
            "No. It is a decorating rule of thumb that garden centres and lighting brands repeat. It is a sensible starting point for buying, not a requirement.",
        },
        {
          question: "How many strands of lights can I connect together?",
          answer:
            "For incandescent sets, CPSC says never more than three. LED sets print their own maximum on the label or tag; follow that number.",
        },
        {
          question: "Does a wider tree need more lights?",
          answer:
            "Yes. The per-foot rule uses height only, so a full or wide tree will look sparser at the same count. Use the 125-per-foot preset or your own figure for a full tree.",
        },
        {
          question: "Should I count lights or feet of wire?",
          answer:
            "The rule of thumb counts lights. Enter the lit length printed on the box if you also want the total feet of string.",
        },
      ]}
    >
      <ChristmasTreeLightsTool />
    </ToolPageLayout>
  );
}
