import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import HorseColorTool from "@/components/HorseColorTool";
import { requireTool } from "@/config/tools";

const SLUG = "horse-color-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Horse Color Calculator: Foal Coat Color Odds from DNA Tests",
  description:
    "Enter the sire's and dam's coat color test results for Extension, Agouti, Cream, Dun and Gray and get the odds of each foal color — chestnut, bay, black, palomino, buckskin, grullo and more — gene by gene.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function HorseColorCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out a foal's likely coat color",
        steps: [
          { name: "Get both parents' test results", text: "A coat color panel reports a genotype for each gene, such as E/e or N/Cr." },
          { name: "Enter the sire's genotypes", text: "Extension, Agouti, Cream, Dun and Gray." },
          { name: "Enter the dam's genotypes", text: "The hints say what each color usually means if a result is missing." },
          { name: "Read the odds", text: "Each possible foal color with its chance, plus the odds for each gene." },
        ],
      }}
      uses={{
        heading: "10 situations where foal color odds help",
        items: [
          { title: "Choosing a stallion for a color", body: "Compare the odds of a palomino or buckskin foal from two candidate stallions." },
          { title: "Avoiding surprise chestnuts", body: "Two black-based parents that both carry e can still produce a chestnut — the odds show how often." },
          { title: "Breeding for cremello or perlino", body: "Double cream needs a cream allele from each parent." },
          { title: "Pricing a breeding", body: "Some breeders charge more for color-producing stallions; check what the color odds actually are." },
          { title: "Understanding a homozygous stallion", body: "An E/E stallion cannot sire a chestnut, whatever the mare." },
          { title: "Explaining a foal's color", body: "Work backwards: which genotypes could have produced it?" },
          { title: "Planning a dun breeding program", body: "See how often D passes on from a D/nd2 parent." },
          { title: "Checking gray inheritance", body: "One gray parent with a single G gives a gray foal half the time." },
          { title: "Answering buyer questions", body: "Give the real odds instead of 'should be colored'." },
          { title: "Learning how color genes stack", body: "The gene-by-gene table shows how each result combines into a coat name." },
        ],
      }}
      dataSection={{
        heading: "Where the genetics come from",
        paragraphs: [
          "Each gene's alleles and their effects are taken from the UC Davis Veterinary Genetics Laboratory's test pages, read on the date shown on the result. Extension (red factor): E allows black pigment; horses that are e/e (or carry the rarer ea) produce no black pigment and are red-based, and red factor overrides agouti. Agouti: A restricts black pigment to the points (bay); a/a spreads it over the body (black). Cream is incompletely dominant: one copy gives palomino, buckskin or smoky black, two give cremello, perlino or smoky cream. Dun is dominant and dilutes both red and black pigment with primitive markings; nd1 and nd2 are the non-dun alleles. Gray is dominant and progressively whitens any base color, often to almost white by 6–12 years.",
          "For each gene, the page crosses the two parents' genotypes the standard Mendelian way — each parent passes one of its two alleles, each with a 50% chance — and then combines the five genes, treating them as inherited independently. Each combination is named from the base color (chestnut, bay or black) and the dilutions. The VGL notes that 'the names assigned to the various dun shades vary by breed', so a bay with dun is shown as 'bay + dun' rather than a breed-specific name.",
          "Results are percentages per foal. With small numbers of foals, real outcomes can differ a lot from the odds, the same way a coin can land heads three times running.",
          "Limits: white-pattern and spotting genes (tobiano, frame overo, sabino, splash, leopard complex), roan, silver, champagne and pearl are not modelled, and nor are brown/seal shades. Results are only as accurate as the genotypes entered; a guess from a horse's appearance can be wrong, especially for carriers. For breeding decisions, test both parents through a laboratory.",
        ],
        sources: [
          { label: "UC Davis VGL — Red Factor (Extension)", href: "https://vgl.ucdavis.edu/test/red-factor-horse" },
          { label: "UC Davis VGL — Agouti", href: "https://vgl.ucdavis.edu/test/agouti-horse" },
          { label: "UC Davis VGL — Cream", href: "https://vgl.ucdavis.edu/test/cream" },
          { label: "UC Davis VGL — Dun", href: "https://vgl.ucdavis.edu/test/dun-horse" },
          { label: "UC Davis VGL — Gray", href: "https://vgl.ucdavis.edu/test/gray_presence_absence" },
        ],
      }}
      faqs={[
        { question: "What color foal will two bay horses have?", answer: "It depends on what they carry. Two bays that are both E/e A/a give 56.25% bay, 18.75% black and 25% chestnut. Two E/E A/A bays give only bays." },
        { question: "Can two chestnuts have a black or bay foal?", answer: "No. Chestnuts are e/e and can only pass on e, so every foal is chestnut-based, unless a gray or other gene changes its look." },
        { question: "How do I get a palomino?", answer: "A chestnut base plus one cream allele. Palomino × chestnut gives 50% palomino; cremello × chestnut gives 100% palomino." },
        { question: "What does E/E mean?", answer: "The horse carries two black-pigment alleles and cannot have a chestnut foal, whatever the mate." },
        { question: "Why doesn't agouti matter on my chestnut?", answer: "Red factor overrides agouti: an e/e horse makes no black pigment, so agouti has nothing to act on. It is still passed to the foals." },
        { question: "Will my foal be gray?", answer: "If one parent is N/G, each foal has a 50% chance; if a parent is G/G, every foal will gray. Grays are born another color and lighten with age." },
        { question: "Does this cover pinto and appaloosa patterns?", answer: "No. Only Extension, Agouti, Cream, Dun and Gray are modelled." },
      ]}
    >
      <HorseColorTool />
    </ToolPageLayout>
  );
}
