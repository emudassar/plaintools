import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import HorseGestationTool from "@/components/HorseGestationTool";
import { requireTool } from "@/config/tools";
import { UNL_G1874_URL, MERCK_TABLE_URL } from "@/lib/horse-gestation";

const SLUG = "horse-gestation-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Horse Gestation Calculator: Mare Foaling Date",
  description:
    "Enter the breeding date (or first and last covers) and get the mare's expected foaling window at 335–340 days, the normal 320–370 day range, the premature cutoff and the 11-month date, from university extension figures.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function HorseGestationPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to calculate a mare's foaling date",
        steps: [
          { name: "Enter the breeding date", text: "The cover, insemination or ovulation date." },
          { name: "Add the last date if bred more than once", text: "The window then runs from the first to the last date." },
          { name: "Read the foaling window", text: "Average 335–340 days, normal range 320–370 days." },
          { name: "Note the key dates", text: "The premature cutoff (326 days) and the 11-month date." },
        ],
      }}
      uses={{
        heading: "10 situations where a horse gestation calculator helps",
        items: [
          { title: "Planning foaling watch", body: "Know when to start checking the mare at night." },
          { title: "Moving to a foaling stall", body: "Get the mare settled before the window opens." },
          { title: "Booking the vet", body: "Schedule pre-foaling checks and vaccinations." },
          { title: "Spotting a premature foal", body: "Foals born before 326 days are considered premature." },
          { title: "Long pregnancies", body: "See when a mare has gone past the normal range." },
          { title: "Planning next season's breeding", body: "Expected foaling dates shape rebreeding plans." },
          { title: "Selling an in-foal mare", body: "Give buyers a due window." },
          { title: "Multiple covers", body: "Enter first and last dates for an accurate spread." },
          { title: "Comparing with the 11-month rule", body: "See how the breeder's rule of thumb sits inside the window." },
          { title: "Days in foal", body: "The page shows how many days have passed since breeding." },
        ],
      }}
      dataSection={{
        heading: "Where the numbers come from",
        paragraphs: [
          "The figures are from University of Nebraska–Lincoln Extension NebGuide G1874, 'The Foaling Mare' (Kathleen P. Anderson, Extension Horse Specialist, 2008): 'The average gestation length (duration of pregnancy) of mares is 335 to 340 days, but can range from 320 to 370 days.' Foals are considered premature if delivered at less than 326 days, and many breeders calculate the expected foaling date at 11 months after the last breeding — though most mares carry longer than that. The Merck Veterinary Manual's table of approximate gestation periods lists the horse at 11 months.",
          "The page adds those day counts to your breeding date. With first and last covers, the early edge of each window counts from the first date and the late edge from the last. The 11-month date is the same calendar day eleven months after the last breeding (moved to the month's end where needed).",
          "Limits: individual mares vary, and the NebGuide notes that factors such as season and day length, foal sex and nutrition affect gestation length. Only an ultrasound or veterinary exam confirms a pregnancy. Everything runs in your browser.",
        ],
        sources: [
          { label: "University of Nebraska–Lincoln Extension — G1874 The Foaling Mare", href: UNL_G1874_URL, note: "335–340 day average, 320–370 range, premature < 326 days" },
          { label: "Merck Veterinary Manual — Approximate Gestation Periods", href: MERCK_TABLE_URL, note: "Horse: 11 months" },
        ],
      }}
      faqs={[
        { question: "How long is a horse pregnant?", answer: "University of Nebraska Extension gives an average of 335 to 340 days, with a normal range of 320 to 370 days." },
        { question: "When is a foal premature?", answer: "When born at less than 326 days of gestation, per UNL Extension; such foals usually need immediate veterinary attention." },
        { question: "What is the 11-month rule?", answer: "Many breeders estimate foaling at 11 months after the last breeding; most mares go a little longer." },
        { question: "My mare was bred twice — which date do I use?", answer: "Enter both; the window spans from the first to the last date." },
        { question: "My mare is past 370 days — is that normal?", answer: "It's beyond the normal range in the NebGuide; talk to your veterinarian." },
        { question: "Can this confirm pregnancy?", answer: "No — only an ultrasound or veterinary exam can." },
      ]}
    >
      <HorseGestationTool />
    </ToolPageLayout>
  );
}
