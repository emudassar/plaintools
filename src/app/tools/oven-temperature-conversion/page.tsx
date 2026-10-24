import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import OvenTempTool from "@/components/OvenTempTool";
import { requireTool } from "@/config/tools";

const SLUG = "oven-temperature-conversion";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Oven Temperature Conversion: °F, °C and Gas Mark Chart",
  description:
    "Convert oven temperatures between Fahrenheit, Celsius and gas mark, with the nearest gas mark and a full conversion chart from gas mark ¼ to 10.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function OvenTemperatureConversionPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to convert an oven temperature",
        steps: [
          { name: "Choose what you have", text: "Fahrenheit, Celsius or a gas mark." },
          { name: "Enter the temperature", text: "Or pick the gas mark." },
          { name: "Read the conversion", text: "°F, °C and the nearest gas mark, with the chart." },
        ],
      }}
      uses={{
        heading: "10 times you need to convert an oven temperature",
        items: [
          { title: "British recipes in an American kitchen", body: "A cook converts gas mark 4 to Fahrenheit." },
          { title: "American recipes abroad", body: "Someone in Europe converts 350 °F to Celsius." },
          { title: "Old family recipes", body: "A grandparent's recipe says 'gas 6'." },
          { title: "New ovens", body: "Someone with a Celsius oven follows a US cookbook." },
          { title: "Baking classes", body: "A teacher gives both scales." },
          { title: "Air fryer conversions", body: "A cook converts the temperature, then follows the appliance's own guidance." },
          { title: "Holiday roasts", body: "A host converts a roasting temperature." },
          { title: "Recipe writing", body: "A blogger lists all three units." },
          { title: "Candle and craft ovens", body: "A hobbyist converts a curing temperature." },
          { title: "Checking a dial", body: "Someone checks what a gas mark dial means in degrees." },
        ],
      }}
      dataSection={{
        heading: "How the conversion works",
        paragraphs: [
          "°C = (°F − 32) × 5 ÷ 9 and °F = °C × 9 ÷ 5 + 32. Gas mark 1 is 275 °F; each mark above it adds 25 °F, so gas mark 4 is 350 °F and 9 is 475 °F. Below mark 1 the marks halve: ½ is 250 °F and ¼ is 225 °F.",
          "The nearest gas mark is shown with how far the temperature is from it.",
          "Limits: recipes for fan (convection) ovens and conventional ovens are not interchangeable without adjustment; follow the recipe or the oven maker's guidance. Oven thermostats can run hot or cold.",
        ],
        sources: [
          { label: "Wikipedia — Gas mark", href: "https://en.wikipedia.org/wiki/Gas_mark" },
        ],
      }}
      faqs={[
        { question: "What is 350 °F in Celsius?", answer: "About 177 °C, gas mark 4." },
        { question: "What is 180 °C in Fahrenheit?", answer: "356 °F, nearest gas mark 4." },
        { question: "What is gas mark 6?", answer: "400 °F, about 204 °C." },
        { question: "What is 200 °C in Fahrenheit?", answer: "392 °F, nearest gas mark 6." },
        { question: "How do I convert Fahrenheit to Celsius?", answer: "Subtract 32, multiply by 5, divide by 9." },
        { question: "Does it work for fan ovens?", answer: "It converts temperatures only; it does not adjust for fan ovens." },
      ]}
    >
      <OvenTempTool />
    </ToolPageLayout>
  );
}
