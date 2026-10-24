import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import HowLongUntilTool from "@/components/HowLongUntilTool";
import { requireTool } from "@/config/tools";

const SLUG = "how-long-until";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "How Long Until 3pm (or Any Time)? Live Countdown",
  description:
    "Type any time — 3pm, 5:30 PM, midnight or 17:30 — and get a live countdown of the hours, minutes and seconds until it, in your own time zone.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function HowLongUntilPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to see how long until a time",
        steps: [
          { name: "Type the time", text: "Enter it as 3pm, 3:30 PM, 15:30 or 1530, or tap one of the quick buttons." },
          { name: "Read the countdown", text: "Hours, minutes and seconds left, ticking every second." },
          { name: "Check the day", text: "If the time has already passed today, the countdown runs to the same time tomorrow." },
        ],
      }}
      uses={{
        heading: "10 times a countdown to a clock time helps",
        items: [
          { title: "Waiting for the end of a shift", body: "A worker on a 7-to-3 shift checks exactly how long is left before clocking out." },
          { title: "School pickup", body: "A parent working from home sees how many minutes remain before leaving for the 3:15 bell." },
          { title: "Cooking to a serving time", body: "Someone planning dinner for 6pm works backwards from the time left to start the oven." },
          { title: "Medication timing", body: "A carer tracking the next dose at 9pm sees the hours remaining at a glance." },
          { title: "Store or office closing", body: "A shopper sees whether there is time to get across town before a 5pm close." },
          { title: "Exam start", body: "A student counts down to a 2:30 exam to plan the last revision session." },
          { title: "Livestream or launch", body: "A fan waits for an 11am product launch or stream start." },
          { title: "Deadline at midnight", body: "A freelancer with an 11:59 PM submission deadline watches the time left." },
          { title: "Parking meter", body: "A driver whose meter runs out at 4:40 sees how long they can stay." },
          { title: "Fasting or iftar time", body: "Someone fasting counts down to the evening meal time they know for today." },
        ],
      }}
      dataSection={{
        heading: "How the countdown works",
        paragraphs: [
          "The page reads your device's clock and time zone and finds the next moment the clock will show the time you typed — later today, or tomorrow if that time has passed. The difference is shown in days, hours, minutes and seconds and refreshes every second.",
          "Nothing is looked up online and nothing is sent anywhere.",
          "Limits: the countdown is only as right as your device clock. On the night clocks change for daylight saving, the count includes the skipped or repeated hour. The page does not know events' own time zones — for a launch announced in another zone, convert that time first.",
        ],
        sources: [],
      }}
      faqs={[
        { question: "How long until 3pm?", answer: "Type 3pm in the box: the page shows the hours, minutes and seconds from now until 3:00 PM on your device's clock, or until 3 PM tomorrow if it is already past 3." },
        { question: "Can I type 24-hour time?", answer: "Yes. 15:00, 1500 and 3pm all mean the same time." },
        { question: "What happens after midnight?", answer: "The countdown always targets the next time the clock shows your time, so a time that has passed today rolls over to tomorrow." },
        { question: "Does it use my time zone?", answer: "Yes, the one your device is set to. The time zone is shown on the result." },
        { question: "Can I count down to a date, not a time?", answer: "This page counts to a clock time within the next 24 hours. For a date, use the days-between-dates calculator." },
        { question: "Does the page keep running if I switch tabs?", answer: "Yes. Browsers slow down timers in background tabs, but the countdown is recalculated from the clock each second, so it is right when you come back." },
      ]}
    >
      <HowLongUntilTool />
    </ToolPageLayout>
  );
}
