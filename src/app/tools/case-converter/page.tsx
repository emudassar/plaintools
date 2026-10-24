import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import CaseConverterTool from "@/components/CaseConverterTool";
import { requireTool } from "@/config/tools";

const SLUG = "case-converter";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Case Converter: UPPER, lower, Title Case, Sentence case and More",
  description:
    "Convert text to UPPERCASE, lowercase, Title Case, Sentence case, Capitalize Each Word, camelCase, snake_case, kebab-case and more, then copy it in one click.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function CaseConverterPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to convert text case",
        steps: [
          { name: "Paste your text", text: "Any length." },
          { name: "Pick a case", text: "Uppercase, lowercase, title, sentence and the programming cases." },
          { name: "Copy the result", text: "One click copies it." },
        ],
      }}
      uses={{
        heading: "10 times you need to change text case",
        items: [
          { title: "Caps lock accidents", body: "Someone fixes a paragraph typed with caps lock on." },
          { title: "Headlines", body: "A blogger converts a headline to title case." },
          { title: "Spreadsheet clean-up", body: "An office worker fixes names typed in all caps." },
          { title: "Programming names", body: "A developer turns a phrase into camelCase or snake_case." },
          { title: "URL slugs", body: "A web editor makes a kebab-case slug." },
          { title: "Constants", body: "A developer writes CONSTANT_CASE names." },
          { title: "Email subjects", body: "Someone tones down an all-caps subject line." },
          { title: "Social posts", body: "A user makes alternating-case text for a meme." },
          { title: "Book and song titles", body: "A student formats titles in a bibliography." },
          { title: "Data imports", body: "Someone normalises product names before an import." },
        ],
      }}
      dataSection={{
        heading: "The rules each case follows",
        paragraphs: [
          "Title case here capitalises the first and last word and every word of four or more letters, and lowercases shorter articles, conjunctions and prepositions (a, an, the, and, but, or, for, of, on, to, in, at, by, as and similar) unless they follow a colon. Short all-capital words such as NASA are kept. Style guides (APA, Chicago, AP) differ in detail, so check yours for a formal title.",
          "Sentence case lowercases everything and capitalises the first letter of each sentence and the word 'I'; it cannot detect names, which you capitalise yourself. Programming cases split text into words, drop punctuation and join them as camelCase, PascalCase, snake_case, kebab-case or CONSTANT_CASE.",
          "Everything runs in your browser; nothing is sent.",
        ],
        sources: [],
      }}
      faqs={[
        { question: "What is title case?", answer: "Capitalising the main words of a title. The rule this page follows is written above the FAQ." },
        { question: "What is sentence case?", answer: "Only the first word of each sentence (and proper nouns) capitalised." },
        { question: "What is camelCase?", answer: "Words joined with no spaces, each after the first starting with a capital: myVariableName." },
        { question: "What is snake_case?", answer: "Lower-case words joined with underscores: my_variable_name." },
        { question: "Does sentence case capitalise names?", answer: "No. It cannot tell which words are names, so capitalise them yourself." },
        { question: "Is my text stored?", answer: "No, the conversion runs in your browser." },
      ]}
    >
      <CaseConverterTool />
    </ToolPageLayout>
  );
}
