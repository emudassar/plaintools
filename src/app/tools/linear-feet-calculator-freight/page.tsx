import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import FreightLinearFeetTool from "@/components/FreightLinearFeetTool";
import { requireTool } from "@/config/tools";

const SLUG = "linear-feet-calculator-freight";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Freight Linear Feet Calculator: Pallets to Trailer Linear Feet",
  description:
    "How many linear feet your pallets take in a trailer: 6 standard 48×40 pallets use 12 ft loaded straight two-wide, or 10 ft turned, in a 101-inch-wide 53' van. Stackable and custom sizes.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function LinearFeetCalculatorFreightPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to work out linear feet for freight",
        steps: [
          {
            name: "Count the pallets",
            text: "Enter how many pallets are in the shipment, and tick stackable if they can go two high.",
          },
          {
            name: "Enter the pallet footprint",
            text: "Length and width in inches, including any freight that overhangs the pallet — for example 48 × 40.",
          },
          {
            name: "Check the trailer width",
            text: "The default is 101 inches, the inside width Utility Trailer lists for its 53' dry van. Enter another width for a different trailer.",
          },
          {
            name: "Read the linear feet",
            text: "Pallets are placed in rows across the trailer. The tool works out both ways round — straight and turned — and shows the shorter.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where linear feet matter",
        items: [
          {
            title: "Getting an LTL quote",
            body: "Carriers and brokers often ask for linear feet on larger shipments. The tool turns a pallet count into that figure.",
          },
          {
            title: "Checking a carrier's linear-foot rule",
            body: "Many LTL tariffs treat shipments over a set number of linear feet differently. Knowing your footage shows whether you are near that line.",
          },
          {
            title: "Deciding whether to stack",
            body: "Stacking two high halves the floor positions. The tool shows the footage both ways.",
          },
          {
            title: "Turning pallets to save space",
            body: "Six 48 × 40 pallets take 12 ft loaded straight but 10 ft turned, because two 48-inch sides fit across a 101-inch trailer.",
          },
          {
            title: "Planning a partial truckload",
            body: "Volume and partial-truckload quotes are often priced by trailer feet. The tool gives the footage to quote.",
          },
          {
            title: "Shipping oversized pallets",
            body: "A pallet too wide to fit two across uses a full row on its own; the tool works out how many rows that is.",
          },
          {
            title: "Loading a 48-foot trailer",
            body: "Enter 48 for the trailer length to see whether the load fits.",
          },
          {
            title: "Comparing pallet sizes",
            body: "Switching between 48 × 40, 48 × 48 or a custom footprint shows the effect on floor space.",
          },
          {
            title: "Warehouse dock planning",
            body: "Dock staff can estimate how much of a trailer an outbound order will fill.",
          },
          {
            title: "Checking a freight bill",
            body: "If a carrier bills by linear feet, the floor geometry is a reference point for the figure charged.",
          },
        ],
      }}
      dataSection={{
        heading: "How linear feet are worked out",
        paragraphs: [
          "Linear feet is the length of trailer floor a shipment occupies. The tool places pallets in rows across the trailer. Loaded straight, each pallet's length runs along the trailer and its width across; turned, the other way round. Pallets per row = the inside width divided by the side facing across, rounded down. Floor positions are the number of pallets, or half of them rounded up when stacked two high. Rows = positions ÷ pallets per row, rounded up. Linear feet = rows × the side running along the trailer ÷ 12.",
          "The default inside width is 101 inches: Utility Trailer's dry van page gives 101 inches from wearband to wearband (101-1/4 inches lining to lining) for its 53' van. Other trailers differ slightly, so the width can be changed. Nothing is fetched while you use the page.",
          "The limits: it assumes pallets in straight rows, not pinwheeled or mixed patterns, and it does not check weight, height or whether the freight may be turned or stacked. LTL carriers each publish their own linear-foot or capacity rules in their tariffs, with their own thresholds and measuring method; the carrier's measurement is the one that is billed.",
        ],
        sources: [
          {
            label: "Utility Trailer — Dry Van Features & Options",
            href: "https://www.utilitytrailer.com/dry-vans/features-options/",
            note: "101\" inside width wearband to wearband; 101-1/4\" lining to lining",
          },
        ],
      }}
      faqs={[
        {
          question: "How many linear feet is a standard pallet?",
          answer:
            "A 48 × 40 pallet loaded straight is 4 linear feet (48 inches), and two fit side by side in a 101-inch trailer, so each pair takes 4 ft. Turned, a pair takes 40 inches, about 3.33 ft.",
        },
        {
          question: "How many linear feet are 6 pallets?",
          answer: "Six 48 × 40 pallets, two across, are 3 rows: 12 linear feet loaded straight, or 10 feet turned.",
        },
        {
          question: "How many pallets fit in a 53-foot trailer?",
          answer:
            "Floor-loaded straight and two-wide, 26 standard 48 × 40 pallets use 52 feet (13 rows of 48 inches). Turned, 30 pallets take 50 feet. Weight limits and loading method can reduce this.",
        },
        {
          question: "How do I calculate linear feet?",
          answer:
            "Work out how many pallets fit across the trailer, divide the pallet count by that to get rows (rounding up), and multiply the rows by the pallet length along the trailer, in feet.",
        },
        {
          question: "Does stacking reduce linear feet?",
          answer: "Yes. Stacked two high, six pallets need only three floor positions — 8 ft loaded straight instead of 12.",
        },
        {
          question: "What is the linear foot rule?",
          answer:
            "A rule in an LTL carrier's tariff that applies different pricing once a shipment takes more than a set amount of trailer length. The threshold and the method differ between carriers, so check the carrier's own rules tariff.",
        },
      ]}
    >
      <FreightLinearFeetTool />
    </ToolPageLayout>
  );
}
