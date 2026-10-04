import type { Metadata } from "next";
import ToolPageLayout from "@/components/ToolPageLayout";
import WindChillTool from "@/components/WindChillTool";
import { requireTool } from "@/config/tools";

const SLUG = "motorcycle-wind-chill-chart";
const tool = requireTool(SLUG);

export const metadata: Metadata = {
  title: "Motorcycle Wind Chill Chart and Calculator (NWS Formula)",
  description:
    "Motorcycle wind chill by riding speed and air temperature — 40 °F at 60 mph feels like 25 °F — calculated with the National Weather Service formula, with a full chart from 10 to 80 mph.",
  alternates: { canonical: `/tools/${SLUG}/` },
};

export default function MotorcycleWindChillChartPage() {
  return (
    <ToolPageLayout
      tool={tool}
      howTo={{
        title: "How to read wind chill for a ride",
        steps: [
          {
            name: "Enter the air temperature",
            text: "Use the forecast or thermometer reading for where you will ride, in °F or °C.",
          },
          {
            name: "Enter your riding speed",
            text: "Use the speed you expect to hold, in mph or km/h. The page uses it as the wind speed in the NWS formula, as motorcycle wind chill charts do.",
          },
          {
            name: "Read the wind chill",
            text: "The result is the NWS wind chill in °F and °C, with the arithmetic shown, rounded to the nearest degree like the official chart.",
          },
          {
            name: "Scan the chart for the whole ride",
            text: "The chart below lists 10 to 80 mph against 50 °F down to 0 °F, so a mix of town and highway speeds can be read at a glance.",
          },
        ],
      }}
      uses={{
        heading: "10 situations where riders check wind chill",
        items: [
          {
            title: "Deciding what to wear for a 40 °F highway commute",
            body: "At 60 mph, 40 °F air works out to a 25 °F wind chill by the NWS formula — a below-freezing figure from an above-freezing day.",
          },
          {
            title: "Planning an early-morning ride in spring or autumn",
            body: "Morning and afternoon temperatures can be far apart. Running both through the calculator shows how different the two legs of a day ride are.",
          },
          {
            title: "Comparing back roads with the interstate",
            body: "The chart shows how much colder 70 mph is than 40 mph at the same air temperature, which matters when choosing a route on a cold day.",
          },
          {
            title: "Seeing when a ride reaches freezing wind chill",
            body: "At 45 °F and 55 mph the formula gives 32 °F. The chart makes the speed and temperature where that happens easy to find.",
          },
          {
            title: "Checking a ride planned in Celsius",
            body: "Riders using km/h and °C can enter both directly; the page converts and shows the answer in both scales.",
          },
          {
            title: "Packing for a multi-day tour through mountains",
            body: "Temperatures drop with altitude. Entering the forecast for each pass shows which days call for the warmest layers.",
          },
          {
            title: "Deciding whether heated gear is worth plugging in",
            body: "A wind chill far below the air temperature is the number riders compare when deciding between heated and unheated layers.",
          },
          {
            title: "Explaining cold to a new rider or passenger",
            body: "A passenger who has only ridden in summer may not expect 30 °F air at 60 mph to work out to a 10 °F wind chill.",
          },
          {
            title: "Riding instructors setting cold-weather limits",
            body: "Training groups that set temperature limits for practice rides can use one published formula instead of guesses.",
          },
          {
            title: "Checking a wind chill chart found online",
            body: "Motorcycle charts circulate with different numbers. Each cell here is the NWS formula, shown with its arithmetic, so it can be checked.",
          },
        ],
      }}
      dataSection={{
        heading: "Where the numbers come from",
        paragraphs: [
          "The wind chill formula is the one the National Weather Service has used since November 1, 2001: Wind Chill (°F) = 35.74 + 0.6215T − 35.75(V^0.16) + 0.4275T(V^0.16), where T is the air temperature in °F and V the wind speed in mph. It is printed on the NWS Wind Chill Chart. All 216 cells of that chart (5 to 60 mph, 40 °F to −45 °F) were checked against this page's code and every one matches when rounded to the nearest degree.",
          "This page puts your riding speed in place of V, which is how motorcycle wind chill charts are made. Everything is calculated in your browser; nothing is sent anywhere. Celsius and km/h are converted to °F and mph first.",
          "The limits are real. NWS says wind chill \"is only defined for temperatures at or below 50°F and wind speeds above 3 mph\", so the page shows no wind chill outside that range rather than inventing one. The official chart stops at 60 mph; the 70 and 80 mph rows here apply the same formula beyond it and are marked. NWS also explains that the formula takes wind measured at the standard 33-foot height and calculates the lower speed at face height. Riding speed is already the airflow at your face, so the real chill on bare skin is likely colder than this page shows.",
          "Wind chill describes heat loss from exposed skin in the shade. It does not account for windscreens, fairings, helmets, heated gear, sun or rain, and it is not a measure of how warm any piece of riding gear keeps you. It is a published index, not a safety rating for a ride.",
        ],
        sources: [
          {
            label: "National Weather Service — Wind Chill Chart",
            href: "https://www.weather.gov/safety/cold-wind-chill-chart",
            note: "Formula, defined range and the 33-ft to face-height note",
          },
          {
            label: "NWS Wind Chill Chart (PDF)",
            href: "https://www.weather.gov/media/safety/windchillchart3.pdf",
            note: "The printed chart all 216 values were checked against",
          },
          {
            label: "NWS — Wind chill calculation (PDF)",
            href: "https://www.weather.gov/media/epz/wxcalc/windChill.pdf",
            note: "The same formula with unit conversion notes",
          },
        ],
      }}
      faqs={[
        {
          question: "What is the wind chill at 60 mph and 40 degrees?",
          answer:
            "25 °F (about −4 °C) by the NWS formula, the same figure the official NWS chart prints for 40 °F and 60 mph.",
        },
        {
          question: "What is the wind chill at 70 mph and 50 degrees?",
          answer:
            "NWS does not define wind chill above 50 °F, so there is no official figure. At exactly 50 °F the formula gives 38 °F at 70 mph, which is beyond the NWS chart's 60 mph limit.",
        },
        {
          question: "Why does the page show nothing above 50 °F?",
          answer:
            "The National Weather Service says wind chill is only defined at or below 50 °F and for winds above 3 mph. The page reports the formula only where NWS defines it.",
        },
        {
          question: "Is riding speed the same as wind speed?",
          answer:
            "Not exactly. The NWS formula expects wind measured at 33 feet, which it reduces to face height. Riding speed is airflow at your face already, so using it as V likely understates the chill. Motorcycle charts use riding speed anyway; this page does too and says so.",
        },
        {
          question: "Does a headwind or tailwind change it?",
          answer:
            "Yes — the airflow over you is roughly your speed plus a headwind or minus a tailwind. If you know the wind along your route, enter the combined figure as the speed.",
        },
        {
          question: "Does a windscreen or fairing change the wind chill?",
          answer:
            "The formula cannot account for it. Anything that keeps moving air off your skin reduces the heat loss the index describes, by an amount the formula does not model.",
        },
        {
          question: "Can I use this to know when frostbite will happen?",
          answer:
            "No. NWS publishes frostbite-time bands on its chart for bare skin, but this page does not reproduce them, and riding gear changes exposure. Use the NWS chart for those bands.",
        },
      ]}
    >
      <WindChillTool />
    </ToolPageLayout>
  );
}
