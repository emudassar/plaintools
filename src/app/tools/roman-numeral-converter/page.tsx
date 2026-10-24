import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import RomanNumeralTool from "@/components/RomanNumeralTool";
import { requireTool } from "@/config/tools";

const SLUG = "roman-numeral-converter";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Roman Numeral Converter: Numbers and Dates (1–3999)",
  description:
    "Convert numbers to Roman numerals and Roman numerals back to numbers, from 1 to 3,999, with a step-by-step breakdown, and convert dates for tattoos and engravings.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function RomanNumeralConverterPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to convert Roman numerals",
        steps: [
          { name: "Type a number or numeral", text: "1994 or MCMXCIV — it converts either way." },
          { name: "Read the result", text: "With the thousands, hundreds, tens and ones broken down." },
          { name: "Or convert a date", text: "Pick a date and a separator for a tattoo or engraving." },
        ],
      }}
      uses={{
        heading: "10 uses for Roman numerals today",
        items: [
          { title: "Tattoo dates", body: "Someone converts a wedding date to put on a tattoo." },
          { title: "Engraving", body: "A jeweller engraves a year in numerals." },
          { title: "Super Bowl numbers", body: "A fan converts Super Bowl LX to 60." },
          { title: "Clock faces", body: "Someone reads IIII or IV on a clock." },
          { title: "Book chapters and outlines", body: "A student numbers outline sections." },
          { title: "Film copyright years", body: "A viewer reads MCMXCIX in film credits." },
          { title: "Monarchs and popes", body: "A history student reads Henry VIII." },
          { title: "Building cornerstones", body: "Someone reads a year carved on a building." },
          { title: "Homework", body: "A student checks answers." },
          { title: "Event branding", body: "An organiser numbers an annual event." },
        ],
      }}
      dataSection={{
        heading: "How Roman numerals are written",
        paragraphs: [
          "Standard Roman numerals use I = 1, V = 5, X = 10, L = 50, C = 100, D = 500 and M = 1,000, written largest first. Six subtractive pairs replace four repeats: IV = 4, IX = 9, XL = 40, XC = 90, CD = 400, CM = 900. The largest number in standard form is 3,999, MMMCMXCIX.",
          "A numeral that is valid but not in standard form, such as IIII or IC, is flagged with its standard spelling.",
          "Limits: larger numbers need overlines or other conventions that are not standard and are not covered. There is no Roman numeral for zero. Check a date's layout before it is tattooed or engraved.",
        ],
        sources: [
          { label: "Wikipedia — Roman numerals", href: "https://en.wikipedia.org/wiki/Roman_numerals" },
        ],
      }}
      faqs={[
        { question: "What is 2026 in Roman numerals?", answer: "MMXXVI." },
        { question: "What is MCMXCIV?", answer: "1994." },
        { question: "How do you write 4 in Roman numerals?", answer: "IV in standard form; some clocks use IIII." },
        { question: "Why is 3,999 the limit?", answer: "Standard notation has no single symbol above M, and four Ms in a row is not standard." },
        { question: "Is there a Roman numeral for zero?", answer: "No." },
        { question: "How do I write a date in Roman numerals?", answer: "Convert the month, day and year separately and join them with dots, dashes or spaces." },
      ]}
    >
      <RomanNumeralTool />
    </ToolPageLayout>
  );
}
