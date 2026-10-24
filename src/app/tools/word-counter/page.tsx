import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import WordCounterTool from "@/components/WordCounterTool";
import { requireTool } from "@/config/tools";

const SLUG = "word-counter";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Word Counter: Words, Characters, Sentences and Reading Time",
  description:
    "Paste or type text to count words, characters with and without spaces, sentences, paragraphs and reading time, check a word or character limit, and see your most used words.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function WordCounterPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to count words",
        steps: [
          { name: "Paste or type your text", text: "Nothing is sent anywhere." },
          { name: "Read the counts", text: "Words, characters, sentences, paragraphs and reading time update as you type." },
          { name: "Set a limit", text: "Optional: enter your word or character limit to see how many are left." },
        ],
      }}
      uses={{
        heading: "10 times you need a word or character count",
        items: [
          { title: "College essays", body: "An applicant keeps an essay under the word limit in the prompt." },
          { title: "School assignments", body: "A student checks a 1,500-word essay." },
          { title: "Social media posts", body: "Someone checks a post against a platform's character limit." },
          { title: "Job applications", body: "A candidate fits a cover letter answer into a form's limit." },
          { title: "Freelance writing", body: "A writer bills by the word." },
          { title: "Speeches", body: "A speaker estimates length from word count." },
          { title: "SEO titles and descriptions", body: "A blogger checks character counts." },
          { title: "Translation quotes", body: "A translator counts words to price a job." },
          { title: "Overused words", body: "A writer spots a word repeated too often." },
          { title: "Abstracts", body: "A researcher keeps an abstract within a journal's limit." },
        ],
      }}
      dataSection={{
        heading: "How words and characters are counted",
        paragraphs: [
          "Words are runs of letters or digits; apostrophes and hyphens inside a word keep it as one word (don't, well-known). Characters are counted as you see them, using your browser's text segmentation, so an emoji or an accented letter counts once. Sentences end at . ! ? or …; paragraphs are separated by blank lines.",
          "Reading time uses 238 words per minute, the average silent reading rate for adult English non-fiction in Brysbaert (2019), a meta-analysis in the Journal of Memory and Language.",
          "Limits: word processors and websites count differently for hyphenated words, numbers and URLs. When a school, publisher or form sets a counting rule, follow it.",
        ],
        sources: [
          { label: "Brysbaert (2019), How many words do we read per minute?", href: "https://doi.org/10.1016/j.jml.2019.104047" },
        ],
      }}
      faqs={[
        { question: "How many words is one page?", answer: "It depends on font, size and spacing, so this page does not give a fixed figure; paste the text to count it." },
        { question: "Does it count spaces?", answer: "Both: characters with spaces and without." },
        { question: "How is reading time calculated?", answer: "Words ÷ 238 words per minute, the average adult silent reading rate in Brysbaert (2019)." },
        { question: "Is my text saved?", answer: "No. Counting happens in your browser and nothing is sent or stored." },
        { question: "Do hyphenated words count as one?", answer: "Yes, here. Some programs count them as two." },
        { question: "Does it count emoji?", answer: "Each emoji counts as one character." },
      ]}
    >
      <WordCounterTool />
    </ToolPageLayout>
  );
}
