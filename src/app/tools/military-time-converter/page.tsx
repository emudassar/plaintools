import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import MilitaryTimeTool from "@/components/MilitaryTimeTool";
import { requireTool } from "@/config/tools";

const SLUG = "military-time-converter";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Military Time Converter (12-Hour ⇄ 24-Hour) + Chart",
  description:
    "Convert standard 12-hour time to military time and back, see how it is said aloud, and use the full military time chart from 0000 to 2300.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function MilitaryTimeConverterPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to convert to and from military time",
        steps: [
          { name: "Type a time", text: "Use 3:45 PM, 3:45p, 1545 or 15:45." },
          { name: "Read both forms", text: "Military time, 24-hour time with a colon and 12-hour time." },
          { name: "Check the chart", text: "The hour you entered is highlighted in the 24-row chart." },
        ],
      }}
      uses={{
        heading: "10 places military time is used",
        items: [
          { title: "Nursing and hospital charts", body: "A nurse records medication times on a 24-hour chart." },
          { title: "Military and police service", body: "A recruit learns to read and say times the way orders are given." },
          { title: "Aviation", body: "A student pilot converts local times while planning a flight." },
          { title: "Train and bus timetables", body: "A traveller abroad reads a 17:40 departure on a station board." },
          { title: "Shift scheduling", body: "A supervisor lists night shifts that cross midnight without AM/PM confusion." },
          { title: "Emergency dispatch", body: "A dispatcher logs call times in 24-hour form." },
          { title: "Phone and computer settings", body: "Someone switching their phone to 24-hour time learns to read it." },
          { title: "Travel in Europe and Asia", body: "A tourist reads museum hours written 09:00–18:00." },
          { title: "Time sheets", body: "A worker converts clock-in times to 24-hour form for payroll." },
          { title: "Exam questions", body: "A student checks answers to 24-hour clock problems." },
        ],
      }}
      dataSection={{
        heading: "How military time works",
        paragraphs: [
          "Military time is the 24-hour clock written as four digits without a colon: 0000 is midnight at the start of the day, 1200 is noon and 2359 is one minute before midnight. Hours after noon add 12: 1 PM is 1300, 11 PM is 2300. 12 AM is 0000 and 12 PM is 1200.",
          "Times are usually spoken as two pairs of digits — 1430 is 'fourteen thirty', 0800 is 'zero eight hundred'. Spoken forms vary between services and countries.",
          "Limits: the page converts clock times only; it does not add time-zone letters (such as Z for UTC).",
        ],
        sources: [],
      }}
      faqs={[
        { question: "What is 3 PM in military time?", answer: "1500." },
        { question: "What is 12 AM in military time?", answer: "0000. Midnight starts the day at 0000." },
        { question: "What is 1800 in regular time?", answer: "6:00 PM." },
        { question: "Is there a 2400?", answer: "Some services write the end of a day as 2400, but the next day starts at 0000. This page uses 0000 to 2359." },
        { question: "How do you say 0900?", answer: "Commonly 'zero nine hundred'." },
        { question: "How do you convert PM times to military time?", answer: "Add 12 to the hour, except 12 PM, which stays 1200." },
      ]}
    >
      <MilitaryTimeTool />
    </ToolPageLayout>
  );
}
