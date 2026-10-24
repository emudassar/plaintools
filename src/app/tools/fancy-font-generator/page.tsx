import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import FancyFontTool from "@/components/FancyFontTool";
import { requireTool } from "@/config/tools";

const SLUG = "fancy-font-generator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Fancy Font Generator: Copy and Paste Fonts for Bios",
  description:
    "Type your text and copy it in bold, italic, cursive script, gothic Fraktur, double-struck outline, monospace, circled and wide letters for Instagram, TikTok and other bios.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function FancyFontGeneratorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to make fancy text",
        steps: [
          { name: "Type your text", text: "Names, bios, captions." },
          { name: "Pick a style", text: "Fifteen styles appear at once." },
          { name: "Copy and paste", text: "Tap Copy and paste it into the app." },
        ],
      }}
      uses={{
        heading: "10 places people use fancy text",
        items: [
          { title: "Instagram bio", body: "A creator styles their name in script." },
          { title: "TikTok display name", body: "Someone uses bold sans-serif to stand out." },
          { title: "Discord nickname", body: "A gamer uses Fraktur." },
          { title: "Gaming usernames", body: "A player decorates an in-game name where allowed." },
          { title: "Twitter/X posts", body: "Someone emphasises a word in bold where formatting is not available." },
          { title: "Event invitations", body: "A host adds a script heading to a text message." },
          { title: "WhatsApp status", body: "Someone uses double-struck letters." },
          { title: "Etsy shop text", body: "A seller styles a headline (check the platform's rules)." },
          { title: "Math notation", body: "A student types double-struck ℝ and ℕ." },
          { title: "Profile headers", body: "Someone adds circled letters to a bio." },
        ],
      }}
      dataSection={{
        heading: "How the fancy letters work",
        paragraphs: [
          "These are not fonts. Each letter is swapped for a different Unicode character that looks styled — mostly from the Mathematical Alphanumeric Symbols block (U+1D400–U+1D7FF), plus the Letterlike Symbols that block leaves out (such as script ℬ and double-struck ℂ), Enclosed Alphanumerics for circled letters and Fullwidth Forms for wide text. That is why they can be pasted where fonts cannot be chosen.",
          "Only A–Z, a–z and, in some styles, digits have styled versions; other characters are left as typed.",
          "Limits: screen readers may read these characters oddly or skip them, so they reduce accessibility. Search on some platforms will not match them as normal words, and some older devices show boxes.",
        ],
        sources: [
          { label: "Unicode — Mathematical Alphanumeric Symbols chart", href: "https://www.unicode.org/charts/PDF/U1D400.pdf" },
        ],
      }}
      faqs={[
        { question: "How do fancy fonts work on Instagram?", answer: "They are Unicode characters, not fonts, so they paste like any text." },
        { question: "Why do some letters show as boxes?", answer: "The device's fonts do not include those characters." },
        { question: "Are fancy fonts bad for accessibility?", answer: "Screen readers may read them letter by letter or not at all, so use them sparingly." },
        { question: "Can I use them in usernames?", answer: "Many sites only allow plain letters and numbers in usernames; display names are often more flexible." },
        { question: "Why are some letters missing in script?", answer: "They are not; Unicode puts some styled letters, like script ℬ, in a different block, and the page includes them." },
        { question: "Is my text sent anywhere?", answer: "No, it is converted in your browser." },
      ]}
    >
      <FancyFontTool />
    </ToolPageLayout>
  );
}
