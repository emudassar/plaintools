import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import ZodiacTool from "@/components/ZodiacTool";
import { requireTool } from "@/config/tools";

const SLUG = "zodiac-compatibility";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Zodiac Compatibility: Signs, Elements and Aspects",
  description:
    "Pick two zodiac signs or birthdays and see the aspect between them — trine, sextile, square, opposition — their elements and modalities, and what astrological tradition says.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function ZodiacCompatibilityPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to check zodiac compatibility",
        steps: [
          { name: "Pick the first sign", text: "Or choose a birthday to find it." },
          { name: "Pick the second sign", text: "The same way." },
          { name: "Read the aspect", text: "How far apart the signs are and the traditional reading." },
          { name: "See every pairing", text: "The first sign against all twelve." },
        ],
      }}
      uses={{
        heading: "10 reasons people compare zodiac signs",
        items: [
          { title: "Curiosity about a partner", body: "Someone checks their sign against a partner's." },
          { title: "Friend groups", body: "Friends compare signs for fun." },
          { title: "Party icebreakers", body: "A host uses signs as a conversation starter." },
          { title: "Learning astrology terms", body: "A beginner learns what a trine or square is." },
          { title: "Writing characters", body: "A novelist gives characters signs with tension." },
          { title: "Gifts", body: "Someone picks a sign-themed gift." },
          { title: "Social media content", body: "A creator makes a sign-pairing post." },
          { title: "Birthday cusps", body: "Someone born on a cusp checks both signs." },
          { title: "Comparing elements", body: "Someone sees which signs share their element." },
          { title: "Wedding favours", body: "A couple prints their signs on favours." },
        ],
      }}
      dataSection={{
        heading: "What this page reports",
        paragraphs: [
          "Sign dates, elements (fire, earth, air, water) and modalities (cardinal, fixed, mutable) follow the Wikipedia article on astrological signs. The relationship between two signs is the astrological aspect their positions make on the 12-sign circle, 30° apart each: same sign (conjunction), 2 apart (sextile, 60°), 3 apart (square, 90°), 4 apart (trine, 120°), 6 apart (opposition, 180°), with the minor semisextile and quincunx between. The traditional reading of each aspect is summarised from Wikipedia's article on astrological aspects.",
          "Limits: this reports astrological tradition, not a prediction. Astrology has no scientific support. The page compares sun signs only; astrologers who compare full birth charts use many more factors and do not all agree.",
        ],
        sources: [
          { label: "Wikipedia — Astrological sign", href: "https://en.wikipedia.org/wiki/Astrological_sign" },
          { label: "Wikipedia — Astrological aspect", href: "https://en.wikipedia.org/wiki/Astrological_aspect" },
        ],
      }}
      faqs={[
        { question: "Which signs are compatible in astrology?", answer: "Tradition reads signs of the same element (a trine) and complementary elements (a sextile) as the most harmonious." },
        { question: "What is a trine?", answer: "Two signs four apart, 120°, sharing an element." },
        { question: "What is a square in astrology?", answer: "Two signs three apart, 90°, sharing a modality; tradition reads it as tension." },
        { question: "What are the zodiac elements?", answer: "Fire: Aries, Leo, Sagittarius. Earth: Taurus, Virgo, Capricorn. Air: Gemini, Libra, Aquarius. Water: Cancer, Scorpio, Pisces." },
        { question: "Why do sign dates differ between websites?", answer: "The sun enters each sign on a slightly different day each year, so cusp dates move by a day." },
        { question: "Is zodiac compatibility scientific?", answer: "No. Astrology is not supported by scientific evidence; this page reports the tradition." },
      ]}
    >
      <ZodiacTool />
    </ToolPageLayout>
  );
}
