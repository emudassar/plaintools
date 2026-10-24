import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import LoveCalculatorTool from "@/components/LoveCalculatorTool";
import { requireTool } from "@/config/tools";

const SLUG = "love-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Love Calculator by Name: FLAMES and the LOVES Paper Game",
  description:
    "Enter two names and play the classic paper love games — FLAMES and the LOVES letter count — with every step shown. Just for fun: it counts letters, not feelings.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function LoveCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to play the love calculator",
        steps: [
          { name: "Type two names", text: "First names, nicknames or full names." },
          { name: "Read the LOVES score", text: "Letters L, O, V, E, S counted and added down to two digits." },
          { name: "Read FLAMES", text: "Friends, Lovers, Affection, Marriage, Enemies or Siblings." },
        ],
      }}
      uses={{
        heading: "10 ways people play love calculator games",
        items: [
          { title: "Sleepovers", body: "Friends play FLAMES with their crushes' names." },
          { title: "Party games", body: "A host runs a name game at a party." },
          { title: "Classroom fun", body: "A teacher shows the letter-counting steps as a maths puzzle." },
          { title: "Wedding showers", body: "Guests try the couple's names." },
          { title: "Social media trends", body: "Someone checks a trend that does the paper method." },
          { title: "Nostalgia", body: "Adults replay the game they did on paper at school." },
          { title: "Couples' jokes", body: "Partners compare scores with nicknames." },
          { title: "Fictional couples", body: "Fans try characters' names." },
          { title: "Teaching algorithms", body: "A programming student studies FLAMES as the Josephus problem." },
          { title: "Ice-breakers", body: "A youth group warms up with a name game." },
        ],
      }}
      dataSection={{
        heading: "How the two games work",
        paragraphs: [
          "FLAMES (as described on Wikipedia): write both names, cross out each letter the names share, one for one, and count the letters left (n). Then count around F-L-A-M-E-S n letters at a time, striking out the letter you land on, until one is left: Friends, Lovers, Affection, Marriage, Enemies or Siblings.",
          "LOVES count: write 'name loves name', count how many L, O, V, E and S letters it contains, then add each neighbouring pair of numbers to make a new row (a sum of 10 or more is reduced to its digit sum) until two digits remain — read together as a percentage.",
          "Limits: these are games. The result depends only on the letters, changes with spelling, and predicts nothing. Several playground versions exist; the rules used are the ones written here.",
        ],
        sources: [
          { label: "Wikipedia — FLAMES (game)", href: "https://en.wikipedia.org/wiki/FLAMES_(game)" },
        ],
      }}
      faqs={[
        { question: "Is a love calculator accurate?", answer: "No. It counts letters and cannot measure anything about a relationship." },
        { question: "How does the paper love calculator work?", answer: "Count L, O, V, E and S in 'name loves name', then add neighbouring numbers until two digits are left." },
        { question: "What does FLAMES stand for?", answer: "Friends, Lovers, Affection, Marriage, Enemies, Siblings." },
        { question: "Does the order of the names matter?", answer: "Not here: both games give the same result whichever name comes first. A nickname or different spelling does change it." },
        { question: "Are names stored?", answer: "No, everything runs in your browser." },
        { question: "Why are there different versions?", answer: "It is a playground game passed on by word of mouth, so rules vary." },
      ]}
    >
      <LoveCalculatorTool />
    </ToolPageLayout>
  );
}
