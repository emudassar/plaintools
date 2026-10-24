import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import UsernameTool from "@/components/UsernameTool";
import { requireTool } from "@/config/tools";

const SLUG = "random-username-generator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Random Username Generator: Cool Name Ideas",
  description:
    "Generate random usernames from adjective and noun pairs, word and number combinations or your own name, with your choice of separator, capitals, numbers and length limit.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function RandomUsernameGeneratorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to generate a username",
        steps: [
          { name: "Pick a style", text: "Adjective + noun, noun + noun, word + number, or built on your name." },
          { name: "Set the options", text: "Separator, capitals, a number and the maximum length." },
          { name: "Generate and copy", text: "Tap a name to copy it, or generate more." },
        ],
      }}
      uses={{
        heading: "10 times you need a new username",
        items: [
          { title: "Gaming accounts", body: "A gamer needs a name for a new console account." },
          { title: "Social media", body: "Someone wants a fresh handle for a hobby account." },
          { title: "Anonymous forums", body: "A user wants a name not tied to their real one." },
          { title: "Email addresses", body: "Someone looks for ideas for a new email address." },
          { title: "Streaming", body: "A new streamer brainstorms a channel name." },
          { title: "Kids' accounts", body: "A parent picks a name without the child's real name." },
          { title: "Discord servers", body: "A member picks a server nickname." },
          { title: "Test accounts", body: "A developer needs placeholder names." },
          { title: "Pen names", body: "A writer brainstorms a pseudonym." },
          { title: "Wi-Fi network names", body: "Someone names a home network." },
        ],
      }}
      dataSection={{
        heading: "How the usernames are generated",
        paragraphs: [
          "Words are drawn from this page's own lists of everyday adjectives and nouns, combined in the style you pick, and optionally followed by a random number. Randomness comes from your browser's Web Crypto. Names longer than your maximum are dropped.",
          "Nothing is stored or sent.",
          "Limits: the page cannot check whether a name is free on a site, which characters that site allows, or trademarks. Including your full name, birth year or town in a public username gives some of your identity away.",
        ],
        sources: [],
      }}
      faqs={[
        { question: "How do I come up with a username?", answer: "Pick a style and generate a batch; tap one you like to copy it." },
        { question: "Can it check if a username is taken?", answer: "No, only the site itself can." },
        { question: "How long should a username be?", answer: "Each site sets its own limit; enter it as the maximum length." },
        { question: "Can I use my name?", answer: "Choose 'Built on my name or word' and type it." },
        { question: "Are the names unique?", answer: "Each batch has no repeats, but other people may use the same words." },
        { question: "Is anything saved?", answer: "No." },
      ]}
    >
      <UsernameTool />
    </ToolPageLayout>
  );
}
