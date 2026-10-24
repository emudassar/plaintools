import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import GramsCupsTool from "@/components/GramsCupsTool";
import { requireTool } from "@/config/tools";

const SLUG = "grams-to-cups";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Grams to Cups Converter (and Cups to Grams) by Ingredient",
  description:
    "Convert grams to cups or cups to grams for over 100 ingredients — flour, sugar, butter, rice, oats and more — each with its own published weight per cup.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function GramsToCupsPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to convert grams to cups",
        steps: [
          { name: "Pick the ingredient", text: "Flour, sugar, butter, rice and over 100 more." },
          { name: "Enter the amount", text: "In grams, ounces, cups, tablespoons, teaspoons or mL." },
          { name: "Read the conversion", text: "Cups as a kitchen fraction, plus grams, ounces, tablespoons and teaspoons." },
        ],
      }}
      uses={{
        heading: "10 kitchen conversions this handles",
        items: [
          { title: "European recipes in a US kitchen", body: "A baker with only cups converts 250 g of flour." },
          { title: "US recipes with a scale", body: "Someone with a scale converts 1½ cups of sugar to grams." },
          { title: "Butter sticks and grams", body: "A cook converts 113 g of butter to tablespoons." },
          { title: "Nutrition tracking", body: "Someone logs 1 cup of oats in grams." },
          { title: "Bread baking", body: "A baker converts a bread recipe to grams for accuracy." },
          { title: "Rice for a crowd", body: "A cook converts 500 g of rice to cups." },
          { title: "Peanut butter and honey", body: "Sticky ingredients are weighed instead of measured." },
          { title: "Halving a recipe", body: "A cook converts to grams to divide easily." },
          { title: "Gluten-free baking", body: "Someone converts gluten-free flour, which weighs differently." },
          { title: "Teaching kids to bake", body: "A parent shows how a cup of flour and a cup of sugar weigh differently." },
        ],
      }}
      dataSection={{
        heading: "Where the weights come from",
        paragraphs: [
          "Each ingredient's weight comes from King Arthur Baking's Ingredient Weight Chart, which lists grams for a stated volume (for example 1 cup of all-purpose flour = 120 g, 1 cup of granulated sugar = 198 g). The page scales each entry to one US cup and converts: 1 cup = 16 tablespoons = 48 teaspoons = 236.59 mL.",
          "Grams ÷ grams per cup = cups; cups are shown as the nearest kitchen fraction (eighths and thirds) and as a decimal.",
          "Limits: how a cup is filled changes the weight — spooned and levelled flour weighs less than scooped flour. Brands and grinds differ. Liquids such as milk and water are listed at the chart's own weights.",
        ],
        sources: [
          { label: "King Arthur Baking — Ingredient Weight Chart", href: "https://www.kingarthurbaking.com/learn/ingredient-weight-chart" },
        ],
      }}
      faqs={[
        { question: "How many grams in a cup of flour?", answer: "120 g of all-purpose flour per cup in the King Arthur chart." },
        { question: "How many grams in a cup of sugar?", answer: "198 g of granulated white sugar." },
        { question: "How many cups is 250 g of flour?", answer: "About 2 cups (2.08)." },
        { question: "How many grams in a cup of butter?", answer: "227 g (2 sticks of 113 g)." },
        { question: "Why are grams and cups different for each ingredient?", answer: "Cups measure volume and grams measure weight; a cup of a dense ingredient weighs more." },
        { question: "Is a US cup the same as a metric cup?", answer: "No. A US cup is 236.6 mL; a metric cup is 250 mL. This page uses US cups." },
      ]}
    >
      <GramsCupsTool />
    </ToolPageLayout>
  );
}
