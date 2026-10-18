"use client";

import { useState } from "react";

/** A table row with a value and a Copy button. */
export default function CopyRow({ label, value }: { label: string; value: string }) {
  const [done, setDone] = useState(false);
  return (
    <tr>
      <td className="px-3 py-2 font-medium">{label}</td>
      <td className="px-3 py-2 font-mono text-xs break-all sm:text-sm">{value}</td>
      <td className="px-3 py-2 text-right">
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(value);
            setDone(true);
            setTimeout(() => setDone(false), 1200);
          }}
          className="rounded border border-[var(--color-line)] bg-white px-2 py-1 text-xs"
        >
          {done ? "Copied" : "Copy"}
        </button>
      </td>
    </tr>
  );
}

