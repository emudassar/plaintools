import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import R22PtChartTool from "@/components/R22PtChartTool";
import { requireTool } from "@/config/tools";

const SLUG = "r22-pt-chart";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "R22 PT Chart: Pressure-Temperature Lookup (°F, °C, psig, bar)",
  description:
    "R-22 pressure-temperature chart from NIST data, −40°F to 150°F. Enter a temperature to get the saturation pressure, or a gauge pressure to get the saturation temperature, in psig, psia, kPa or bar. Free.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function R22PtChartPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to read the R-22 PT chart",
        steps: [
          {
            name: "Choose what you know",
            text: "A temperature, to find the matching saturation pressure — or a gauge reading, to find the temperature R-22 boils or condenses at that pressure.",
          },
          {
            name: "Enter the value and its unit",
            text: "Temperatures in °F or °C; pressures in psig, psia, or kPa or bar gauge.",
          },
          {
            name: "Read the saturation point",
            text: "The result shows the temperature and the pressure in every unit, interpolated from NIST's 1°F table.",
          },
          {
            name: "Use it for superheat or subcooling",
            text: "The saturation temperature from a suction or liquid-line pressure is the figure a measured line temperature is compared against.",
          },
          {
            name: "Open the full chart if you want the table",
            text: "The complete chart from −40°F to 150°F in 5°F steps sits under the tool, with °C and psig.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where the R-22 PT figure is needed",
        items: [
          {
            title: "Converting a suction gauge reading to a saturation temperature",
            body: "A technician reading 68.6 psig on the suction side of an R-22 system gets 40°F as the saturation temperature — the starting point for superheat.",
          },
          {
            title: "Working out subcooling from the liquid line",
            body: "The saturation temperature at the head pressure, minus the measured liquid-line temperature, is subcooling. The tool supplies the first number.",
          },
          {
            title: "Checking a gauge set's built-in scale",
            body: "Analog gauges print PT scales for several refrigerants. A precise figure for R-22 at the reading is useful when the printed scale is hard to read.",
          },
          {
            title: "Servicing older R-22 equipment",
            body: "Older systems may still contain R-22. Having its PT data on a phone, without an app, saves digging out a paper chart.",
          },
          {
            title: "Working in metric units",
            body: "Technicians outside the US read bar or kPa. The tool converts both ways and shows °C.",
          },
          {
            title: "Confirming a standing pressure in a system that is off",
            body: "With the system off and at ambient temperature, the PT chart shows the pressure R-22 would have at that temperature — a figure to compare a gauge against.",
          },
          {
            title: "Teaching refrigeration students",
            body: "The chart and lookup show the relationship between pressure and boiling point directly, with the source data cited.",
          },
          {
            title: "Checking a low-side pressure in a cold room",
            body: "Low saturation temperatures down to −40°F are covered, which matters for refrigeration rather than comfort cooling.",
          },
          {
            title: "Double-checking a value from a manufacturer's chart",
            body: "The data here were compared with a refrigerant supplier's published R-22 chart and agree within 0.05 psi at the points checked.",
          },
          {
            title: "Printing a chart for the truck",
            body: "Open the full chart and print the page for a paper copy from −40°F to 150°F.",
          },
        ],
      }}
      dataSection={{
        heading: "Where the R-22 data comes from",
        paragraphs: [
          "The pressures come from the NIST Chemistry WebBook, NIST Standard Reference Database 69, 'Thermophysical Properties of Fluid Systems', for R22 (chlorodifluoromethane, CAS 75-45-6). The saturation table was retrieved in 1°F steps from −40°F to 150°F with pressure in psia, and is built into this page — nothing is fetched while you use it.",
          "Gauge pressure is absolute pressure minus a standard atmosphere of 14.696 psia. Values between whole degrees, and the reverse lookup from pressure to temperature, use linear interpolation between adjacent 1°F rows. As a cross-check, the values were compared with the iGas USA R22 pressure-temperature chart at eleven temperatures from −40°F to 130°F; all agree within 0.05 psi, for example 68.6 psig at 40°F, 195.9 psig at 100°F and 260.0 psig at 120°F.",
          "R-22 is a single-component refrigerant, so its bubble and dew points are the same and there is one saturation pressure for each temperature. That is not true of blends such as R-410A or R-404A, which this chart does not cover.",
          "The limits: gauge figures assume sea level; at altitude the atmosphere is lower, so a gauge reads higher for the same absolute pressure. The chart covers −40°F to 150°F. A saturation pressure describes the refrigerant, not the correct operating pressure of a system — that depends on load, airflow and the equipment manufacturer's charging procedure.",
          "This page provides property data. It is not a charging procedure. R-22 handling and recovery are regulated work for certified technicians.",
        ],
        sources: [
          {
            label: "NIST Chemistry WebBook — Thermophysical Properties of R22",
            href: "https://webbook.nist.gov/cgi/fluid.cgi?ID=C75456&Action=Page",
            note: "Saturation properties used to build the chart (SRD 69)",
          },
          {
            label: "iGas USA — R22 Pressure-Temperature Chart (PDF)",
            href: "https://www.igasusa.com/files/R22-PT-Chart.pdf",
            note: "Supplier chart used as the cross-check",
          },
          {
            label: "U.S. EPA — Section 608 Technician Certification",
            href: "https://www.epa.gov/section608/section-608-technician-certification-0",
            note: "The certification required for working with refrigerants such as R-22",
          },
        ],
      }}
      faqs={[
        {
          question: "What is the R-22 pressure at 40°F?",
          answer: "68.6 psig (83.3 psia), from NIST's saturation data. That is the pressure at which R-22 boils at 40°F.",
        },
        {
          question: "What temperature is 260 psig on R-22?",
          answer: "120°F. Enter 260 psig in pressure mode to see it in °C and other units.",
        },
        {
          question: "Why do different charts show slightly different numbers?",
          answer:
            "Charts are rounded and built from slightly different property models. The NIST values here agree with a supplier's published chart within 0.05 psi at the points checked.",
        },
        {
          question: "Does altitude change the reading?",
          answer:
            "Gauge pressure does. This page assumes sea-level atmosphere (14.696 psia). Higher up, the atmosphere is lower, so a gauge reads more for the same absolute pressure; the psia figure does not change.",
        },
        {
          question: "Can I use this chart for R-410A?",
          answer:
            "No. R-410A is a different refrigerant — a blend — with its own pressure-temperature relationship. Use a chart for that refrigerant.",
        },
        {
          question: "Does this tell me if the system is charged correctly?",
          answer:
            "No. It gives the refrigerant's saturation properties. Charging depends on the equipment manufacturer's procedure, including superheat or subcooling targets and operating conditions.",
        },
      ]}
    >
      <R22PtChartTool />
    </ToolPageLayout>
  );
}
