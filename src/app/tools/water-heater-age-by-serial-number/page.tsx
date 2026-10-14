import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import WaterHeaterAgeTool from "@/components/WaterHeaterAgeTool";
import { requireTool } from "@/config/tools";

const SLUG = "water-heater-age-by-serial-number";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Water Heater Age by Serial Number: A. O. Smith, Rheem, Bradford White",
  description:
    "Pick the brand, type the serial number from the rating plate, and get when the water heater was made and how old it is — decoded with each maker's own published serial format.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function WaterHeaterAgeBySerialPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find a water heater's age from its serial number",
        steps: [
          { name: "Find the rating plate", text: "The label on the tank lists the brand, model number and serial number." },
          { name: "Pick the brand", text: "A. O. Smith, Rheem or Bradford White." },
          { name: "Type the serial number", text: "Copy it exactly. The result shows which characters mean what." },
          { name: "Read the age", text: "The month (or week) and year made, and the age today." },
        ],
      }}
      uses={{
        heading: "10 situations where a water heater's age matters",
        items: [
          { title: "Buying a house", body: "Inspection reports often note the brand but not the year. The serial settles it in a minute." },
          { title: "Deciding whether a repair is worth it", body: "A repair quote reads differently on a 4-year-old heater than on a 14-year-old one." },
          { title: "Before calling about a warranty", body: "Know the manufacture date before you call the maker or a plumber." },
          { title: "Landlords tracking several units", body: "Record each heater's age from its serial without waiting for a service visit." },
          { title: "Checking a 'new water heater' claim", body: "A listing that says the heater is new can be checked against its date code." },
          { title: "Telling a plumber what you have", body: "Brand, model and age are the first three questions on a service call." },
          { title: "Home warranty and insurance forms", body: "Some forms ask for the age of major appliances." },
          { title: "Reading a Rheem label", body: "Its serials start with the month and year, which is easy to misread as a model code." },
          { title: "Reading an A. O. Smith label", body: "A. O. Smith uses a year and a week number rather than a month." },
          { title: "Spotting a misread serial", body: "If the digits can't be a valid date, the tool says so instead of guessing." },
        ],
      }}
      dataSection={{
        heading: "Where the date codes come from",
        paragraphs: [
          "Each brand is decoded with the format its maker publishes, read on the date shown on the result. A. O. Smith's Service and Warranty Guide for contracted service providers (December 2018) gives a serial number matrix: 'The first two digits of the serial number represent the year of manufacturing' and 'The second two digits represent the week of manufacturing. There can be up to fifty-three (53) weeks in a given manufacturing year.' Its sample, 1719106145074, is week 19 of 2017.",
          "Rheem says the serial number on all Rheem water heating rating labels has ten characters, laid out as month manufactured, year manufactured, a plant line code and a consecutive serial number — its example is 12 09 D 01234, December 2009. Ruud's website, which carries a Rheem Manufacturing Company copyright, does not publish its serial format and offers an age lookup instead, so Ruud serials are not decoded here; that lookup is linked. Bradford White's two-letter year-and-month code is decoded with the rules in its 'Determining The Age Of A Water Heater' bulletin — there is a dedicated page for it on this site.",
          "Two digits of year can mean two centuries; this page uses the most recent year that is not in the future. A. O. Smith gives a week, not a month, so the month shown is the one that week falls in, counting 7-day weeks from 1 January.",
          "Limits: Ruud, State, American, Whirlpool, Rinnai and other makers do not publish their serial format in a form we could find, so they are not decoded here — their own customer service or online lookup can give the date. A serial in an older format than the one a maker describes will be reported as not matching rather than guessed. The manufacture date is not the install date, and nothing here says whether a heater should be repaired or replaced. This site is not affiliated with any of these makers.",
        ],
        sources: [
          { label: "A. O. Smith — Service and Warranty Guide (Dec. 2018)", href: "https://assets.hotwater.com/damroot/Original/10009/ServiceWarrantyGuide.pdf", note: "Serial number matrix, page 10" },
          { label: "Rheem — How to Locate and Read your Rheem Water Heating Serial Numbers", href: "https://www.rheem.com/how-to-locate-and-read-your-rheem-water-heating-serial-numbers/", note: "Ten-character format" },
          { label: "Ruud — How Old Is My Water Heater", href: "https://www.ruud.com/how-old-is-my-water-heater/", note: "Ruud's own age lookup" },
          { label: "Bradford White — Determining The Age Of A Water Heater", href: "https://forthepro.bradfordwhite.com/determining-the-age-of-a-water-heater/", note: "Year and month letters" },
        ],
      }}
      faqs={[
        { question: "How do I find the age of my water heater?", answer: "Read the serial number on the rating plate and decode it with the maker's format. For A. O. Smith the first two digits are the year; for Rheem the first four are month and year; for Bradford White the first two letters are year and month." },
        { question: "How do I read an A. O. Smith serial number?", answer: "A. O. Smith's guide: the first two digits are the year of manufacture and the next two the week. 1719106145074 was made in week 19 of 2017." },
        { question: "How do I read a Rheem serial number?", answer: "Rheem's format is month (2 digits), year (2 digits), a plant letter, then a 5-digit number. 1209D01234 was made in December 2009." },
        { question: "Why isn't my brand listed?", answer: "Only brands whose makers publish how their serial numbers are dated are included. For others, the maker's customer service or online lookup can give the date from the serial." },
        { question: "My serial doesn't decode. Why?", answer: "Older heaters may use a different format from the one the maker describes now, or a letter and a digit may be mixed up (O and 0, I and 1). Check the rating plate again, or use the maker's own lookup." },
        { question: "Is the manufacture date the same as the install date?", answer: "No. A heater can sit in stock before it is installed; the install date is on the installer's paperwork or permit." },
        { question: "Does the age tell me when to replace my water heater?", answer: "No. Age is one fact about a heater; its condition and the maker's guidance matter too, and this page doesn't judge that." },
      ]}
    >
      <WaterHeaterAgeTool />
    </ToolPageLayout>
  );
}
