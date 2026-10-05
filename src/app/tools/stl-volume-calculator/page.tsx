import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import StlVolumeTool from "@/components/StlVolumeTool";
import { requireTool } from "@/config/tools";

const SLUG = "stl-volume-calculator";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "STL Volume Calculator: Volume, Size and Weight of an STL File",
  description:
    "Open an STL file (binary or ASCII) to get its volume in cm³, mm³ and in³, bounding box, a watertight check and the solid weight in PLA, PETG, ASA or your own material. Nothing is uploaded.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function StlVolumeCalculatorPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to find the volume of an STL file",
        steps: [
          { name: "Choose the file", text: "Pick a binary or ASCII .stl file. It is read in your browser and never leaves your device." },
          { name: "Set the units", text: "STL files have no units. Most 3D printing models are in millimetres; switch to centimetres or inches if the size looks wrong." },
          { name: "Pick a material", text: "Choose PLA, PETG or ASA, or enter the density from your own filament or resin data sheet." },
          { name: "Read the result", text: "You get the volume, the bounding box, whether the mesh is closed and the solid weight." },
        ],
      }}
      uses={{
        heading: "10 situations where an STL volume helps",
        items: [
          { title: "Quoting a resin print", body: "Resin is sold by volume, so the model's ml is the starting point for a price before supports." },
          { title: "Checking a model fits the build plate", body: "The bounding box shows X, Y and Z before the file is opened in a slicer." },
          { title: "Estimating a solid print's weight", body: "A solid PLA part's weight is volume × 1.24 g/cm³; a printed part with infill weighs less." },
          { title: "Finding a broken mesh", body: "The closed-mesh check counts open edges, which also cause slicing errors." },
          { title: "Casting from a 3D-printed master", body: "The model's volume is the amount of resin or metal a mold of it will hold." },
          { title: "Spotting a unit mix-up", body: "A 2 mm part that should be 50 mm was exported in inches; the size makes that obvious." },
          { title: "Comparing design revisions", body: "Load two versions and compare how much material each one uses." },
          { title: "Checking a file without installing software", body: "No CAD program or slicer is needed to read the volume." },
          { title: "Sending a file to a print service", body: "Knowing the volume first gives a sense of the quote before uploading anywhere." },
          { title: "Working with confidential parts", body: "Because nothing is uploaded, a client's part stays on your machine." },
        ],
      }}
      dataSection={{
        heading: "How the volume is worked out",
        paragraphs: [
          "An STL file lists triangles. Each triangle and the origin form a tetrahedron whose signed volume is v1 · (v2 × v3) ÷ 6. Adding these over a closed surface cancels everything outside the solid and leaves its volume. This is the method in Cha Zhang and Tsuhan Chen's 2001 paper 'Efficient feature extraction for 2D/3D objects in mesh representation' (ICIP 2001).",
          "Both STL forms are read. Binary STL is an 80-byte header, a 32-bit triangle count and 50 bytes per triangle, as described by the Library of Congress format description; a file whose size matches that layout is read as binary even if its header begins with 'solid'. Otherwise the file is read as ASCII 'vertex x y z' lines.",
          "The closed-mesh check joins identical vertices and counts edges that are not shared by exactly two triangles. Weight is volume × density; the PLA (1.24), PETG (1.27) and ASA (1.07 g/cm³) figures are from Prusament's technical data sheets (ISO 1183).",
          "Limits: the result is the solid volume. Printed parts with infill and walls, and resin prints with supports, use a different amount — the slicer reports that. If the mesh is open the volume is not meaningful. STL stores no units, so the unit you choose is an assumption.",
        ],
        sources: [
          { label: "Zhang & Chen, ICIP 2001 (Cornell)", href: "http://chenlab.ece.cornell.edu/Publication/Cha/icip01_Cha.pdf", note: "Signed volume of tetrahedra summed over a mesh" },
          { label: "Library of Congress: STL binary format", href: "https://www.loc.gov/preservation/digital/formats/fdd/fdd000505.shtml", note: "80-byte header, uint32 count, 50 bytes per facet, little-endian" },
          { label: "Prusament PLA technical data sheet", href: "https://prusament.com/wp-content/uploads/2022/10/PLA_Prusament_TDS_2021_10_EN.pdf", note: "Density 1.24 g/cm³" },
          { label: "Prusament PETG technical data sheet", href: "https://prusament.com/wp-content/uploads/2022/10/PETG_Prusament_TDS_2021_10_EN.pdf", note: "Density 1.27 g/cm³" },
          { label: "Prusament ASA technical data sheet", href: "https://prusament.com/wp-content/uploads/2022/10/ASA_Prusament_TDS_2022_16_EN.pdf", note: "Density 1.07 g/cm³" },
        ],
      }}
      faqs={[
        { question: "How do I calculate the volume of an STL file?", answer: "Sum the signed volumes of the tetrahedra formed by each triangle and the origin. This page does that in your browser when you choose the file." },
        { question: "Is my file uploaded?", answer: "No. The file is read with your browser's file API and processed on your device." },
        { question: "What units are STL files in?", answer: "None are stored. Most 3D printing software treats the numbers as millimetres, so that is the default." },
        { question: "Why does it say my mesh is not closed?", answer: "Some edges belong to only one triangle (a hole) or to more than two. The volume of an open surface is not defined, so repair the mesh first." },
        { question: "Why is my print lighter than the weight shown?", answer: "The weight assumes a solid part. Prints with infill have hollow space inside; your slicer's estimate accounts for that." },
        { question: "How much resin will my STL print use?", answer: "At least the solid volume shown, in ml, plus supports and the base, which depend on your print settings." },
        { question: "Does it handle large files?", answer: "Yes, up to 10 million triangles, limited by your device's memory." },
        { question: "What about OBJ or 3MF files?", answer: "This page reads STL only. Most modelling software can export STL." },
      ]}
    >
      <StlVolumeTool />
    </ToolPageLayout>
  );
}
