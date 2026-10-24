import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import DogYearsTool from "@/components/DogYearsTool";
import { requireTool } from "@/config/tools";

const SLUG = "dog-years-to-human-years";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Dog Years to Human Years Calculator (Two Methods)",
  description:
    "Enter your dog's age and get its age in human years by the general 15/9/5 rule and by the 2020 DNA-methylation formula, 16 ln(age) + 31, with a comparison chart.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function DogYearsToHumanYearsPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to convert dog years to human years",
        steps: [
          { name: "Enter the dog's age", text: "Years and months." },
          { name: "Read both results", text: "The general rule and the DNA-methylation formula." },
          { name: "Check the chart", text: "Both methods for ages 1 to 16." },
        ],
      }}
      uses={{
        heading: "10 reasons people convert a dog's age",
        items: [
          { title: "Curious owners", body: "An owner wonders how old their 5-year-old dog is in human terms." },
          { title: "Puppy milestones", body: "Someone compares a 6-month-old puppy to a child." },
          { title: "Senior dogs", body: "An owner notes their dog is entering old age." },
          { title: "Adoption", body: "A shelter visitor compares dogs' ages." },
          { title: "Kids' questions", body: "A parent explains a dog's age to children." },
          { title: "Birthday parties", body: "Someone writes a dog's human-age birthday card." },
          { title: "School projects", body: "A student compares the two methods." },
          { title: "Debunking the 7-year rule", body: "Someone shows why ×7 is not used." },
          { title: "Pet insurance forms", body: "An owner thinks about age bands (the insurer uses real age)." },
          { title: "Social media posts", body: "An owner shares their dog's human age." },
        ],
      }}
      dataSection={{
        heading: "Where the two methods come from",
        paragraphs: [
          "The general rule counts the first year as 15 human years, the second as 9 and each year after as about 5, as summarised in the Wikipedia article on aging in dogs. The American Veterinary Medical Association notes that dogs do not age at 7 human years per dog year.",
          "The second method is the formula from Wang et al. (2020), Cell Systems 11(2):176–185, based on DNA methylation in Labrador retrievers: human age = 16 × ln(dog age) + 31. It ages young dogs very quickly and slows later. It is not shown under 3 months, where it was not fitted.",
          "Limits: neither method allows for breed or size; large breeds tend to age faster. The results are for curiosity, not health decisions, which are for a veterinarian.",
        ],
        sources: [
          { label: "Wikipedia — Aging in dogs", href: "https://en.wikipedia.org/wiki/Aging_in_dogs" },
          { label: "Wang et al. (2020), Cell Systems", href: "https://doi.org/10.1016/j.cels.2020.06.006" },
          { label: "AVMA — Senior pets", href: "https://www.avma.org/resources-tools/pet-owners/petcare/senior-pets" },
        ],
      }}
      faqs={[
        { question: "How old is my dog in human years?", answer: "Enter the age; the page gives both methods." },
        { question: "Is one dog year seven human years?", answer: "No. The AVMA notes dogs do not age at that rate." },
        { question: "How old is a 2-year-old dog in human years?", answer: "24 by the general rule, about 42 by the DNA-methylation formula." },
        { question: "Which method is more accurate?", answer: "Researchers do not agree on one formula; the page shows both." },
        { question: "Do big dogs age faster?", answer: "Large breeds tend to have shorter lifespans; neither formula here adjusts for size." },
        { question: "Why is the formula blank for young puppies?", answer: "It was not fitted for dogs under about 3 months and gives meaningless results there." },
      ]}
    >
      <DogYearsTool />
    </ToolPageLayout>
  );
}
