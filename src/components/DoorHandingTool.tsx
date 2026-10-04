"use client";

import { useState, useId } from "react";
import {
  determineHand,
  HAND_DEFINITION,
  HAND_NAMES,
  SCHLAGE_URL,
  STEELCRAFT_URL,
  type Hand,
  type HandingResult,
  type LeftRight,
  type Side,
  type Swing,
} from "@/lib/door-handing";
import { asToolError } from "@/lib/errors";

/** Three questions, instant answer. No loading state. */

const HANDS: Hand[] = ["LH", "RH", "LHR", "RHR"];

function ResultCard({ data }: { data: HandingResult }) {
  return (
    <div className="rounded-lg border border-[var(--color-line)]">
      <div className="border-b border-[var(--color-line)] bg-[var(--color-accent-soft)] p-5">
        <p className="text-xs tracking-wide text-[var(--color-muted)] uppercase">
          Door hand
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {data.hand} — {data.name}
        </p>
        <p className="mt-1 text-[var(--color-muted)]">
          Seen from the outside, the hinges are on the {data.outsideHinges} and
          the door swings{" "}
          {data.outsideSwing === "away" ? "away from" : "toward"} the viewer.
          {data.flipped
            ? " You were standing on the inside, so both were flipped to the outside view the rule uses."
            : ""}
        </p>
      </div>
      <div className="p-5">
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          The rule
        </h3>
        <p className="mb-5 text-sm text-[var(--color-muted)]">
          Allegion&rsquo;s Steelcraft manual: view the door from the outside;
          the side the hinges are on is the hand. If the door swings away from
          the viewer it is a regular hand (LH or RH); if it swings toward the
          viewer it is a reverse swing (LHR or RHR). Schlage&rsquo;s lever
          instructions define the outside as &ldquo;the outside, or corridor
          side of the door&rdquo; and note that a lever&rsquo;s end should point
          toward the hinge side.
        </p>
        <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
          What this page cannot tell you
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          Which face counts as &ldquo;outside&rdquo; matters: for an exterior
          door it is the street side, for a room door the corridor or key side.
          Some manufacturers use other terms, such as LHRB or &ldquo;left hand
          reverse bevel&rdquo;, and some products are non-handed. Confirm the
          hand against the specific product&rsquo;s instructions before
          ordering.
        </p>
        <footer className="mt-5 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-muted)]">
          <p>
            Sources: Allegion Steelcraft Technical Data Manual, Handing
            procedures; Schlage P509-664 handing instruction. Retrieved{" "}
            {data.retrievedAt}.
          </p>
          <p className="mt-1 flex flex-wrap gap-x-4">
            <a
              href={STEELCRAFT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] underline"
            >
              Steelcraft handing procedures (PDF)
            </a>
            <a
              href={SCHLAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] underline"
            >
              Schlage lever handing guide (PDF)
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

function Choice<T extends string>({
  legend,
  value,
  options,
  onChange,
}: {
  legend: string;
  value: T;
  options: { v: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const name = useId();
  return (
    <fieldset className="rounded-md border border-[var(--color-line)] p-3">
      <legend className="px-1 text-sm font-medium">{legend}</legend>
      {options.map((o) => (
        <label
          key={o.v}
          className="mt-1 flex cursor-pointer items-center gap-2 text-sm"
        >
          <input
            type="radio"
            name={name}
            checked={value === o.v}
            onChange={() => onChange(o.v)}
          />
          {o.label}
        </label>
      ))}
    </fieldset>
  );
}

export default function DoorHandingTool() {
  const [standing, setStanding] = useState<Side>("outside");
  const [hinges, setHinges] = useState<LeftRight>("left");
  const [swing, setSwing] = useState<Swing>("away");

  let data: HandingResult | null = null;
  let error: string | null = null;
  try {
    data = determineHand({ standing, hinges, swing });
  } catch (err) {
    error = asToolError(err).message;
  }

  return (
    <div>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Choice
          legend="1. Where are you standing?"
          value={standing}
          onChange={setStanding}
          options={[
            { v: "outside", label: "Outside — street, corridor or key side" },
            { v: "inside", label: "Inside — the room side" },
          ]}
        />
        <Choice
          legend="2. Facing the door, the hinges are on my"
          value={hinges}
          onChange={setHinges}
          options={[
            { v: "left", label: "Left" },
            { v: "right", label: "Right" },
          ]}
        />
        <Choice
          legend="3. The door opens"
          value={swing}
          onChange={setSwing}
          options={[
            { v: "away", label: "Away from me (I push)" },
            { v: "toward", label: "Toward me (I pull)" },
          ]}
        />
      </div>
      <p className="mb-4 text-xs text-[var(--color-muted)]">
        The answer updates as you choose. Nothing is sent anywhere.
      </p>

      <div aria-live="polite">
        {error && <p className="text-sm">{error}</p>}
        {data && <ResultCard data={data} />}
      </div>

      <h3 className="mt-6 mb-2 text-sm font-semibold tracking-wide uppercase">
        Door handing chart (viewed from the outside)
      </h3>
      <div className="overflow-x-auto rounded-md border border-[var(--color-line)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-accent-soft)] text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Hand</th>
              <th className="px-3 py-2 font-medium">Hinges</th>
              <th className="px-3 py-2 font-medium">Door swings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {HANDS.map((h) => (
              <tr
                key={h}
                className={
                  data?.hand === h
                    ? "bg-[var(--color-accent-soft)] font-medium"
                    : ""
                }
              >
                <td className="px-3 py-1.5">
                  {h} — {HAND_NAMES[h]}
                </td>
                <td className="px-3 py-1.5">
                  {HAND_DEFINITION[h].hinges === "left" ? "Left" : "Right"}
                </td>
                <td className="px-3 py-1.5">
                  {HAND_DEFINITION[h].swing === "away"
                    ? "Away from you (inswing)"
                    : "Toward you (outswing)"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
