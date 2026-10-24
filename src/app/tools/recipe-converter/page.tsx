import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import RecipeTool from "@/components/RecipeTool";
import { requireTool } from "@/config/tools";

const SLUG = "recipe-converter";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Recipe Converter: Scale a Recipe Up or Down by Servings",
  description:
    "Paste an ingredient list, enter the recipe's servings and the servings you want, and get every quantity scaled and rounded to kitchen fractions.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function RecipeConverterPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to scale a recipe",
        steps: [
          { name: "Paste the ingredients", text: "One per line, quantities first." },
          { name: "Enter the servings", text: "What the recipe makes and what you want." },
          { name: "Read the scaled list", text: "Each quantity multiplied and rounded to a kitchen fraction." },
          { name: "Copy it", text: "Copy the scaled list for shopping or cooking." },
        ],
      }}
      uses={{
        heading: "10 reasons to scale a recipe",
        items: [
          { title: "Cooking for two", body: "Someone halves a family casserole." },
          { title: "Party baking", body: "A baker triples cookie dough for a bake sale." },
          { title: "Meal prep", body: "A cook scales a recipe to five lunches." },
          { title: "Holiday dinners", body: "A host doubles a side dish for guests." },
          { title: "Restaurant prep", body: "A cook scales a home recipe to a batch size." },
          { title: "Different pan sizes", body: "Someone scales to fit a bigger pan (and adjusts time themselves)." },
          { title: "Classroom cooking", body: "A teacher scales a recipe to the class size." },
          { title: "Camping", body: "A group scales a stew to the number of campers." },
          { title: "Testing a new recipe", body: "A cook makes a half batch first." },
          { title: "Shopping lists", body: "The scaled list is copied as a shopping list." },
        ],
      }}
      dataSection={{
        heading: "How scaling works",
        paragraphs: [
          "Factor = servings you want ÷ servings the recipe makes. Every line that starts with a number — whole, decimal, fraction like 1 1/2, a unicode fraction like ½, or a range like 2-3 — is multiplied by the factor.",
          "Metric amounts (g, kg, ml, l) are kept as decimals; other amounts are shown as the nearest kitchen fraction (eighths and thirds). Lines with no leading number are left as written.",
          "Limits: cooking does not always scale in a straight line. Baking times, pan sizes, leavening, salt and spices often need judgement when scaling, and whole items such as eggs may need rounding.",
        ],
        sources: [],
      }}
      faqs={[
        { question: "How do I scale a recipe?", answer: "Divide the servings you want by the servings it makes, and multiply every ingredient by that factor." },
        { question: "How do I halve 3/4 cup?", answer: "3/8 cup, or 6 tablespoons." },
        { question: "Can I scale eggs?", answer: "Yes, but round to a whole or use beaten egg by weight." },
        { question: "Do baking times change?", answer: "Often; the page scales quantities only." },
        { question: "Does it convert units?", answer: "No, it keeps each line's own unit. Use the grams-to-cups converter for that." },
        { question: "What lines are not scaled?", answer: "Lines without a leading number, like 'pinch of salt'." },
      ]}
    >
      <RecipeTool />
    </ToolPageLayout>
  );
}
