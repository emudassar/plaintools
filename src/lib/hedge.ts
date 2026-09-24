import { ToolError } from "./errors";

/**
 * Hedged requests (NOT sequential retries).
 *
 * Government endpoints are erratic, not merely slow. Measured on the USDA SDA
 * spatial endpoint, 8 identical queries in one session: 1.02s, 1.30s, 1.34s,
 * 1.25s, 7.66s, 1.06s, 2.58s, 2.16s — a 7.5x spread on the SAME query.
 *
 * Sequential retry is the wrong tool for that shape: a legitimate 7.7s response
 * blows a 4s timeout, and you then wait another 4s before trying again. Hedging
 * fires another identical request while the first is still in flight and takes
 * whichever returns first, so a slow response costs nothing once a fast one lands.
 *
 * TWO RULES:
 *  1. Hedge ONLY idempotent reads. Never a write — you would run it twice.
 *  2. SURFACE the hedge to the user via `onRetry`. A silent 8-second wait reads
 *     as a frozen page.
 */
export const HEDGE_DELAYS_MS = [0, 4_000, 10_000] as const;
export const OVERALL_DEADLINE_MS = 32_000;

export interface HedgeOptions {
  /** Fired when an extra attempt is launched. attempt is 1-based (2 = first hedge). */
  onRetry?: (attempt: number) => void;
  delays?: readonly number[];
  deadlineMs?: number;
}

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        reject(new DOMException("aborted", "AbortError"));
      },
      { once: true },
    );
  });

/**
 * Runs `task` up to `delays.length` times, staggered, and resolves with the
 * first success. Every in-flight attempt is aborted as soon as one wins.
 *
 * `task` receives an AbortSignal and MUST pass it to fetch, otherwise losing
 * attempts keep running and waste the visitor's bandwidth.
 */
export async function hedged<T>(
  task: (signal: AbortSignal) => Promise<T>,
  options: HedgeOptions = {},
): Promise<T> {
  const {
    onRetry,
    delays = HEDGE_DELAYS_MS,
    deadlineMs = OVERALL_DEADLINE_MS,
  } = options;

  const controller = new AbortController();
  const deadline = setTimeout(() => controller.abort(), deadlineMs);

  let settled = false;
  let lastError: unknown;
  let failures = 0;

  try {
    return await new Promise<T>((resolve, reject) => {
      const fail = (e: unknown) => {
        failures += 1;
        lastError = e;
        // Only give up once every scheduled attempt has failed.
        if (failures >= delays.length && !settled) {
          settled = true;
          reject(lastError);
        }
      };

      delays.forEach((delay, index) => {
        void (async () => {
          try {
            if (delay > 0) {
              await sleep(delay, controller.signal);
              // A winner landed while we were waiting — never launch this one.
              if (settled) return;
              onRetry?.(index + 1);
            }
            const result = await task(controller.signal);
            if (settled) return;
            settled = true;
            controller.abort(); // cancel the losers
            resolve(result);
          } catch (e) {
            if (settled) return; // an aborted loser is not a failure
            fail(e);
          }
        })();
      });
    });
  } finally {
    clearTimeout(deadline);
    controller.abort();
  }
}

/** Wraps `hedged` so a total failure surfaces as a typed, user-safe error. */
export async function hedgedFetchJson<T>(
  url: string,
  init: RequestInit,
  options: HedgeOptions = {},
): Promise<T> {
  try {
    return await hedged<T>(async (signal) => {
      const res = await fetch(url, { ...init, signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as T;
    }, options);
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    throw new ToolError(
      "unavailable",
      "The data service did not respond. It is run by a third party and is sometimes slow or offline — please try again in a moment.",
      detail,
    );
  }
}
