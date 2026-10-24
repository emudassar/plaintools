import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import SpinWheelTool from "@/components/SpinWheelTool";
import { requireTool } from "@/config/tools";

const SLUG = "spin-the-wheel";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Spin the Wheel: Random Picker Wheel",
  description:
    "Type your options, spin the wheel and get a fair random pick, using your browser's cryptographic random numbers. Remove each winner if you like. No sign-up.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function SpinTheWheelPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to spin the wheel",
        steps: [
          { name: "Enter your options", text: "One per line, up to 100." },
          { name: "Spin", text: "The winner is chosen fairly, then the wheel turns to it." },
          { name: "Remove winners", text: "Optional: take each winner off the wheel for the next spin." },
        ],
      }}
      uses={{
        heading: "10 ways people use a spinning wheel",
        items: [
          { title: "Classroom name picker", body: "A teacher picks who answers next." },
          { title: "What's for dinner", body: "A family spins between six takeaway options." },
          { title: "Giveaway winners", body: "A small creator picks a winner on a stream." },
          { title: "Chore rota", body: "Roommates spin for who takes the bins out." },
          { title: "Game night", body: "Friends pick the next board game." },
          { title: "Team captains", body: "A coach picks captains fairly." },
          { title: "Prize wheels", body: "A school fair spins for small prizes." },
          { title: "Workouts", body: "Someone spins for the day's exercise." },
          { title: "Decision paralysis", body: "Someone lets the wheel choose between two films." },
          { title: "Meeting order", body: "A team lead picks who presents first." },
        ],
      }}
      dataSection={{
        heading: "How the pick is made",
        paragraphs: [
          "The winner is chosen before the animation, with your browser's cryptographic random number generator (Web Crypto) and rejection sampling, so every option is equally likely. The wheel then turns so the pointer stops inside the chosen slice.",
          "Nothing is stored or sent.",
          "Limits: equal chance per spin does not mean equal results over a few spins — the same option can win twice in a row. For prize draws with legal requirements, follow the rules that apply to the draw.",
        ],
        sources: [],
      }}
      faqs={[
        { question: "Is the wheel really random?", answer: "Yes. Each spin uses Web Crypto random numbers, giving every option the same chance." },
        { question: "Can the same option win twice?", answer: "Yes, unless you tick 'Remove each winner'." },
        { question: "How many options can I add?", answer: "Up to 100." },
        { question: "Can I weight an option?", answer: "Add it more than once to give it more chances." },
        { question: "Is anything saved?", answer: "No." },
        { question: "Can I use it for a giveaway?", answer: "You can, but giveaways may have legal rules where you are; follow them." },
      ]}
    >
      <SpinWheelTool />
    </ToolPageLayout>
  );
}
