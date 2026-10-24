"use client";

import { useEffect, useState } from "react";
import { DataTable, ErrorBox, Grid, Hint, NumField, ResultCard, SelectField, optNum, fmt } from "./CalcBits";
import { Ext } from "./GeoBits";
import { Btn } from "./ToolBits";
import { CURRENCIES, FX_URL, GOLD_API_URL, NIST_HB44_URL, PURITIES, TOLA_URL, fetchFx, fetchSpot, metalValue, type Fx, type Metal, type Spot } from "@/lib/metal-price";
import { asToolError, isToolError } from "@/lib/errors";

type Unit = "g" | "tola" | "oz" | "kg";

export default function GoldPriceTool() {
  const [metal, setMetal] = useState<Metal>("XAU");
  const [purity, setPurity] = useState("0");
  const [currency, setCurrency] = useState("USD");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<Unit>("g");
  const [spot, setSpot] = useState<Spot | null>(null);
  const [fx, setFx] = useState<Fx | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setErr(null);
    Promise.all([fetchSpot(metal), fetchFx(currency)])
      .then(([s, f]) => {
        if (!live) return;
        setSpot(s);
        setFx(f);
      })
      .catch((e) => live && setErr(asToolError(e).message))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [metal, currency, tick]);

  const purities = PURITIES[metal];
  const p = purities[Number(purity)] ?? purities[0];
  const cur = (x: number) => {
    const d = x < 1000 ? 2 : 0;
    return x.toLocaleString("en-US", { style: "currency", currency, minimumFractionDigits: d, maximumFractionDigits: d });
  };

  let error: string | null = null;
  let v: ReturnType<typeof metalValue> | null = null;
  if (spot && fx) {
    try {
      v = metalValue(spot.usdPerOz, fx.rate, p[1], optNum(weight), unit);
    } catch (e) {
      error = isToolError(e) ? e.message : "That input could not be used.";
    }
  }
  const name = metal === "XAU" ? "Gold" : "Silver";

  return (
    <div>
      <Grid cols={3}>
        <SelectField
          label="Metal"
          value={metal}
          onChange={(m) => {
            setMetal(m);
            setPurity("0");
          }}
          options={[["XAU", "Gold"], ["XAG", "Silver"]]}
        />
        <SelectField label="Purity" value={purity} onChange={setPurity} options={purities.map(([l], i) => [String(i), l] as const)} />
        <SelectField label="City / currency" value={currency} onChange={setCurrency} options={CURRENCIES.map(([c, l]) => [c, `${c} — ${l}`] as const)} />
      </Grid>
      <Grid cols={3}>
        <NumField label="Your weight (optional)" value={weight} onChange={setWeight} />
        <SelectField label="Weight unit" value={unit} onChange={setUnit} options={[["g", "Grams"], ["tola", "Tola"], ["oz", "Troy ounces"], ["kg", "Kilograms"]]} />
        <div className="flex items-end">
          <Btn onClick={() => setTick((t) => t + 1)} disabled={loading}>
            {loading ? "Loading…" : "Refresh price"}
          </Btn>
        </div>
      </Grid>
      <Hint>The price is the international spot price converted to your currency. A city&apos;s jewellers&apos; or bullion dealers&apos; rate adds their own premium, making charge and local taxes.</Hint>
      <div aria-live="polite">
        {err ? (
          <ErrorBox message={err} />
        ) : error ? (
          <ErrorBox message={error} />
        ) : !v || !spot || !fx ? (
          <p className="text-sm text-[var(--color-muted)]">Fetching the live spot price…</p>
        ) : (
          <ResultCard
            label={`${name} ${p[0]} spot value in ${currency}`}
            headline={`${cur(v.perGram)} per gram`}
            sub={`${cur(v.perTola)} per tola · ${cur(v.perOunce)} per troy ounce${v.forWeight !== null ? ` · your ${weight} ${unit}: ${cur(v.forWeight)}` : ""}`}
            limits="This is the value of the pure metal content at the international spot price, not what a shop will charge or pay. Retail prices add a premium and making charges; buy-back prices are below spot; local taxes (GST, VAT) are extra. Spot moves every few seconds while markets are open."
            method={
              <p>
                Spot price: <Ext href={GOLD_API_URL}>gold-api.com</Ext> (US$ per troy ounce, updated {spot.updatedAt ? new Date(spot.updatedAt).toLocaleString("en-US") : "now"}).{" "}
                {currency !== "USD" && (
                  <>
                    Exchange rate 1 USD = {fmt(fx.rate, 4)} {currency}, <Ext href={FX_URL}>Rates By Exchange Rate API</Ext> (daily; last update {fx.updatedUtc}).{" "}
                  </>
                )}
                1 troy oz = 31.1034768 g (<Ext href={NIST_HB44_URL}>NIST Handbook 44</Ext>); 1 tola = 11.6638 g (<Ext href={TOLA_URL}>180 grains</Ext>). Purity = karat ÷ 24.
              </p>
            }
          >
            <DataTable
              head={["Purity", "Per gram", "Per tola", "Per ounce"]}
              rows={purities.map(([l, f]) => {
                const r = metalValue(spot.usdPerOz, fx.rate, f, null, "g");
                return [l, cur(r.perGram), cur(r.perTola), cur(r.perOunce)];
              })}
              highlight={Number(purity)}
            />
          </ResultCard>
        )}
      </div>
    </div>
  );
}
