import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import FinalGradeTool from "@/components/FinalGradeTool";
import { requireTool } from "@/config/tools";

const SLUG = "final-grade-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Final Grade Calculator: What Do I Need on My Final?",
  description:
    "Enter your current grade, the grade you want and how much the final exam is worth, and get the score you need on the final, with a table of outcomes.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function FinalGradeCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out the score you need on a final",
        steps: [
          { name: "Enter your current grade", text: "Your percentage before the final." },
          { name: "Enter the grade you want", text: "For example 90 for an A on many scales." },
          { name: "Enter the final's weight", text: "From the syllabus, as a percentage." },
          { name: "Read the score needed", text: "Plus your final grade for a range of exam scores." },
        ],
      }}
      uses={{
        heading: "10 reasons students check what they need on a final",
        items: [
          { title: "Keeping an A", body: "A student at 92% sees how low they can score and keep a 90." },
          { title: "Passing a course", body: "A student at 65% sees what they need to reach 70." },
          { title: "Study planning", body: "Someone decides which final needs the most study time." },
          { title: "Scholarship GPA", body: "A student protects a grade that a scholarship depends on." },
          { title: "Nursing and pre-med prerequisites", body: "A student needs a B in a prerequisite." },
          { title: "High school finals", body: "A parent helps a teen see what score keeps a B." },
          { title: "Heavy final weights", body: "A final worth 40% changes the answer a lot; the page shows how." },
          { title: "Out-of-reach targets", body: "A student sees when a target needs more than 100%." },
          { title: "Group study", body: "Friends compare what each needs." },
          { title: "Teacher explanations", body: "A teacher shows students how weighting works." },
        ],
      }}
      dataSection={{
        heading: "How the needed score is calculated",
        paragraphs: [
          "With the final worth w (as a fraction), your course grade = current × (1 − w) + final × w. Solving for the final: needed = (target − current × (1 − w)) ÷ w.",
          "The table shows your course grade for final scores from 50% to 100%.",
          "Limits: this assumes your current grade already reflects everything except the final and that the course uses a weighted average. Curves, dropped scores, points-based grading and minimum final-exam rules change the answer.",
        ],
        sources: [],
      }}
      faqs={[
        { question: "What do I need on my final to get an A?", answer: "Enter your current grade, 90 as the target and the final's weight; the page shows the score." },
        { question: "How do I calculate my final grade?", answer: "Current grade × (1 − final weight) + final score × final weight." },
        { question: "What if I need more than 100%?", answer: "The target cannot be reached without extra credit." },
        { question: "Where do I find the final's weight?", answer: "In the course syllabus." },
        { question: "Does it work for points-based classes?", answer: "Convert your points to percentages first; weighting by points works differently." },
        { question: "What if my current grade includes the final?", answer: "Use your grade before the final for this calculation." },
      ]}
    >
      <FinalGradeTool />
    </ToolPageLayout>
  );
}
