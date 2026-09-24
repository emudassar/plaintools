/**
 * Typed errors with a `kind`.
 *
 * The UI must distinguish "there is genuinely no data for this input" (explain
 * it, offer the fallback) from "the service is down" (say so, invite a retry).
 * Those are completely different messages to a visitor.
 */
export type ErrorKind = "no-data" | "unavailable" | "bad-input";

export class ToolError extends Error {
  readonly kind: ErrorKind;
  /** Optional detail for the console; never rendered raw to the visitor. */
  readonly detail?: string;

  constructor(kind: ErrorKind, message: string, detail?: string) {
    super(message);
    this.name = "ToolError";
    this.kind = kind;
    this.detail = detail;
  }
}

export function isToolError(e: unknown): e is ToolError {
  return e instanceof ToolError;
}

/** Anything unexpected becomes an `unavailable` ToolError, never a raw crash. */
export function asToolError(e: unknown): ToolError {
  if (isToolError(e)) return e;
  const detail = e instanceof Error ? e.message : String(e);
  return new ToolError(
    "unavailable",
    "Something went wrong reaching the data service. Please try again.",
    detail,
  );
}
