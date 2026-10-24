import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import SleepTool from "@/components/SleepTool";
import { requireTool } from "@/config/tools";

const SLUG = "sleep-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Sleep Calculator: Bedtime and Wake-Up Times by Sleep Cycle",
  description:
    "Enter when you need to wake up and get bedtimes that fit whole 90-minute sleep cycles — or enter a bedtime and get wake-up times — with your own time to fall asleep.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function SleepCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to use the sleep calculator",
        steps: [
          { name: "Choose wake-up or bedtime", text: "Which time you already know." },
          { name: "Enter the time", text: "For example 6:30 AM." },
          { name: "Set minutes to fall asleep", text: "Your own usual time." },
          { name: "Read the times", text: "Options for 6, 5, 4 and 3 full cycles." },
        ],
      }}
      uses={{
        heading: "10 times people use a sleep cycle calculator",
        items: [
          { title: "Early work shifts", body: "A nurse starting at 7 AM picks a bedtime that fits whole cycles." },
          { title: "Exam mornings", body: "A student plans sleep before an early exam." },
          { title: "Early flights", body: "A traveller times sleep before a 5 AM airport trip." },
          { title: "Shift workers", body: "A night worker plans sleep after a shift." },
          { title: "Naps", body: "Someone picks a nap length that ends at a cycle." },
          { title: "New parents", body: "A parent times a stretch of sleep between feeds." },
          { title: "Jet lag", body: "A traveller plans bedtimes in a new time zone." },
          { title: "School mornings", body: "A parent works out a child's bedtime from the alarm time." },
          { title: "Weekend reset", body: "Someone moves bedtime earlier before the work week." },
          { title: "Late nights", body: "Someone going to bed late sees when a full cycle ends." },
        ],
      }}
      dataSection={{
        heading: "How the times are worked out",
        paragraphs: [
          "Bedtime = wake-up time − cycles × cycle length − minutes to fall asleep; wake-up time = bedtime + minutes to fall asleep + cycles × cycle length. The default cycle is 90 minutes: the National Institute of Neurological Disorders and Stroke says REM sleep first occurs about 90 minutes after falling asleep and that sleep cycles through the stages several times a night.",
          "The CDC lists 7 or more hours of sleep for adults aged 18–60; options of 7 hours or more are marked.",
          "Limits: cycle length varies between people and through the night, so the times are a rough guide. The page cannot assess sleep problems; persistent trouble sleeping or daytime sleepiness is something to raise with a doctor.",
        ],
        sources: [
          { label: "NINDS — Brain Basics: Understanding Sleep", href: "https://www.ninds.nih.gov/health-information/public-education/brain-basics/brain-basics-understanding-sleep" },
          { label: "CDC — About Sleep", href: "https://www.cdc.gov/sleep/about/index.html" },
        ],
      }}
      faqs={[
        { question: "What time should I go to bed to wake up at 6 AM?", answer: "With 15 minutes to fall asleep, 8:45 PM (6 cycles) or 10:15 PM (5 cycles)." },
        { question: "How long is a sleep cycle?", answer: "About 90 minutes for many adults, varying through the night." },
        { question: "How much sleep do adults need?", answer: "The CDC lists 7 or more hours for adults 18–60." },
        { question: "Why wake at the end of a cycle?", answer: "Waking from lighter sleep at the end of a cycle is often described as easier than waking from deep sleep; the page only does the timing." },
        { question: "Can I change the cycle length?", answer: "Yes, enter any length from 60 to 120 minutes." },
        { question: "Does it work for naps?", answer: "The options shown are 3 to 6 cycles. For a nap, one cycle is about 90 minutes plus your time to fall asleep." },
      ]}
    >
      <SleepTool />
    </ToolPageLayout>
  );
}
