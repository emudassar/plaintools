import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import TimeLapseTool from "@/components/TimeLapseTool";
import { requireTool } from "@/config/tools";

const SLUG = "time-lapse-photography-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Time-Lapse Photography Calculator: Interval, Frames, Clip Length",
  description:
    "Enter how long you'll shoot, the interval and the playback frame rate and get the number of photos, the finished clip length, the speed-up and storage — or the interval needed for a clip length you want.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function TimeLapsePage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to plan a time-lapse",
        steps: [
          { name: "Choose what you know", text: "The interval, or the clip length you want." },
          { name: "Enter the shooting time", text: "How long the event or shoot lasts." },
          { name: "Enter the frame rate", text: "The playback rate of the finished video: 24, 25, 30 or 60 fps." },
          { name: "Add the file size", text: "Optional, for storage needed." },
          { name: "Read the plan", text: "Photos, clip length, speed-up and storage." },
        ],
      }}
      uses={{
        heading: "10 situations where a time-lapse calculator helps",
        items: [
          { title: "Sunsets and sunrises", body: "Set an interval that turns an hour into a short clip." },
          { title: "Construction progress", body: "Plan months of shooting into a minute of video." },
          { title: "Night sky and star trails", body: "Long intervals over several hours." },
          { title: "Clouds and weather", body: "Short intervals for fast-moving skies." },
          { title: "Plant growth", body: "Days of shooting at long intervals." },
          { title: "Memory card planning", body: "Total photos × file size = storage." },
          { title: "Events and setups", body: "Turn a day's set-up into a short promo clip." },
          { title: "Matching a music track", body: "Target a clip length and get the interval." },
          { title: "Drone and phone time-lapses", body: "Check the frame count your app will produce." },
          { title: "Client quotes", body: "Know the photos and storage before a long shoot." },
        ],
      }}
      dataSection={{
        heading: "How the plan is worked out",
        paragraphs: [
          "This is arithmetic with no outside data. Photos = shooting time ÷ interval (whole photos only). Clip length = photos ÷ playback frame rate. The speed-up is interval × frame rate: a 5-second interval played at 24 fps runs 120 times faster than real time. Storage = photos × file size per photo.",
          "In target mode the page works backwards: the photos needed are clip length × frame rate, and the interval is shooting time ÷ that number.",
          "Limits: the page can't tell you whether a battery or card will last, whether your camera can write each file in time, or what interval suits the subject. Exposure time must be shorter than the interval. Everything runs in your browser.",
        ],
        sources: [],
      }}
      faqs={[
        { question: "How do I calculate time-lapse interval?", answer: "Interval = shooting time ÷ (clip length × frame rate). For a 30 s clip at 30 fps from 2 hours, 7,200 ÷ 900 = 8 seconds." },
        { question: "How long will my time-lapse be?", answer: "Photos ÷ frame rate. 1,440 photos at 24 fps is 60 seconds." },
        { question: "How many photos do I need for a 10 second clip?", answer: "10 × the frame rate: 240 at 24 fps, 300 at 30 fps." },
        { question: "What interval for a sunset?", answer: "That's a creative choice; enter different intervals to see the resulting clip length." },
        { question: "How much storage will I need?", answer: "Photos × file size per photo; enter the size of one of your files." },
        { question: "Does the interval include exposure time?", answer: "The interval is from the start of one photo to the start of the next, so the exposure has to fit inside it." },
      ]}
    >
      <TimeLapseTool />
    </ToolPageLayout>
  );
}
