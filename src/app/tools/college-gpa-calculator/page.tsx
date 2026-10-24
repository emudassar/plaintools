import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import GpaTool from "@/components/GpaTool";
import { requireTool } from "@/config/tools";

const SLUG = "college-gpa-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "College GPA Calculator: Semester and Cumulative GPA",
  description:
    "Enter each course's letter grade and credit hours and get your semester GPA on the 4.0 scale, weighted if you have honors or AP courses, and your cumulative GPA.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function CollegeGpaCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate your GPA",
        steps: [
          { name: "List your courses", text: "Pick each letter grade and enter the credit hours." },
          { name: "Mark weighted courses", text: "Honors (+0.5) or AP/IB (+1.0) if your school weights them." },
          { name: "Add past results", text: "Optional previous GPA and credits for a cumulative GPA." },
          { name: "Read your GPA", text: "Term GPA, quality points and cumulative GPA." },
        ],
      }}
      uses={{
        heading: "10 times students need to calculate a GPA",
        items: [
          { title: "End of semester", body: "A student works out their term GPA before grades post." },
          { title: "Scholarship cut-offs", body: "A student checks whether they stay above a 3.0 requirement." },
          { title: "Dean's list", body: "Someone sees whether their GPA reaches the dean's list mark." },
          { title: "Academic probation", body: "A student works out what grades lift their cumulative GPA." },
          { title: "Transfer applications", body: "A community college student estimates their GPA for applications." },
          { title: "Graduate school", body: "An applicant checks their cumulative GPA." },
          { title: "What-if planning", body: "A student tries different grades in a hard course." },
          { title: "High school transcripts", body: "A parent works out a weighted GPA with AP courses." },
          { title: "Internship applications", body: "A student lists their GPA on a résumé." },
          { title: "Repeating a course", body: "Someone sees how a better grade would change their GPA (repeat policies vary)." },
        ],
      }}
      dataSection={{
        heading: "How the GPA is calculated",
        paragraphs: [
          "GPA = sum of (grade points × credits) ÷ sum of credits. The default 4.0 scale is A = 4.0, A− = 3.7, B+ = 3.3, B = 3.0, B− = 2.7, C+ = 2.3, C = 2.0, C− = 1.7, D+ = 1.3, D = 1.0, D− = 0.7, F = 0. A+ counts as 4.0 unless you tick 4.3. Honors and AP weighting add 0.5 or 1.0 to that course's points.",
          "Cumulative GPA = (this term's quality points + previous GPA × previous credits) ÷ all credits.",
          "Limits: your registrar's official GPA follows your school's own scale and rules for repeats, pass/fail, withdrawals and transfer credits. Check your student handbook.",
        ],
        sources: [
          { label: "Wikipedia — Academic grading in the United States", href: "https://en.wikipedia.org/wiki/Academic_grading_in_the_United_States" },
        ],
      }}
      faqs={[
        { question: "How do I calculate my GPA?", answer: "Multiply each course's grade points by its credits, add them up, and divide by the total credits." },
        { question: "What is a B+ on a 4.0 scale?", answer: "3.3." },
        { question: "What is the difference between weighted and unweighted GPA?", answer: "Weighted GPA adds extra points for harder courses such as honors or AP; unweighted does not." },
        { question: "How do I calculate cumulative GPA?", answer: "Enter your previous GPA and credits; the page combines them with this term." },
        { question: "Do pass/fail courses count?", answer: "Usually not; leave their grade blank." },
        { question: "Can my GPA be above 4.0?", answer: "Yes, on a weighted scale or where A+ counts as 4.3." },
      ]}
    >
      <GpaTool />
    </ToolPageLayout>
  );
}
