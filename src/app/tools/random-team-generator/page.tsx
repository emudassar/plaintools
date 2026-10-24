import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import TeamGeneratorTool from "@/components/TeamGeneratorTool";
import { requireTool } from "@/config/tools";

const SLUG = "random-team-generator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Random Team Generator: Split Names into Teams",
  description:
    "Paste a list of names and split them into random, evenly sized teams by number of teams or by team size, shuffled fairly. Copy the teams in one click.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function RandomTeamGeneratorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to make random teams",
        steps: [
          { name: "Paste the names", text: "One per line or separated by commas." },
          { name: "Choose how to split", text: "A number of teams or people per team." },
          { name: "Make teams", text: "Shuffle again until you are happy, then copy." },
        ],
      }}
      uses={{
        heading: "10 times you need random teams",
        items: [
          { title: "PE class", body: "A teacher splits 28 students into four teams." },
          { title: "Office trivia", body: "A manager mixes departments into teams." },
          { title: "Pickup football", body: "Friends make two fair sides." },
          { title: "Classroom groups", body: "A teacher forms project groups of four." },
          { title: "Workshops", body: "A facilitator makes breakout groups." },
          { title: "Escape rooms", body: "A party splits into two rooms." },
          { title: "Esports scrims", body: "A clan splits players for practice." },
          { title: "Hackathons", body: "Organisers form random teams." },
          { title: "Family games", body: "Relatives split for charades." },
          { title: "Secret pairings", body: "A group forms pairs for an activity." },
        ],
      }}
      dataSection={{
        heading: "How the teams are made",
        paragraphs: [
          "The names are shuffled with a Fisher–Yates shuffle driven by your browser's cryptographic random numbers (Web Crypto), then dealt out one per team in turn, so team sizes differ by at most one.",
          "Nothing is stored or sent.",
          "Limits: random teams are not balanced by skill. Duplicate names are treated as different people.",
        ],
        sources: [],
      }}
      faqs={[
        { question: "How do I split a group into random teams?", answer: "Paste the names, choose the number of teams and press Make teams." },
        { question: "What if the numbers do not divide evenly?", answer: "Some teams get one extra person." },
        { question: "Can I set the team size instead?", answer: "Yes, choose 'People per team'." },
        { question: "Is it fair?", answer: "Every ordering of names is equally likely." },
        { question: "Can I balance by skill?", answer: "Not here; this page makes purely random teams." },
        { question: "Are names saved?", answer: "No." },
      ]}
    >
      <TeamGeneratorTool />
    </ToolPageLayout>
  );
}
