import { ToolError } from "./errors";

/**
 * Time-lapse planning arithmetic:
 *   frames        = shooting duration ÷ interval
 *   clip length   = frames ÷ playback frame rate
 *   speed-up      = interval × playback frame rate
 *   storage       = frames × file size per frame
 * Solve modes: from interval, or the interval needed for a target clip length.
 */

export interface LapseInput {
  mode: "interval" | "target";
  /** Event / shooting duration, seconds. */
  durationSec: number;
  intervalSec: number;
  /** Target clip length, seconds (mode target). */
  targetClipSec: number;
  fps: number;
  /** MB per frame (optional). */
  mbPerFrame: number | null;
  /** Battery or card budget: max frames (optional). */
}

export interface LapseResult {
  intervalSec: number;
  frames: number;
  clipSec: number;
  speedUp: number;
  storageGb: number | null;
}

export function timeLapse(i: LapseInput): LapseResult {
  if (!Number.isFinite(i.durationSec) || i.durationSec <= 0 || i.durationSec > 3.2e7) throw new ToolError("bad-input", "Enter how long you will shoot.");
  if (!Number.isFinite(i.fps) || i.fps <= 0 || i.fps > 240) throw new ToolError("bad-input", "Enter the playback frame rate (for example 24, 25, 30 or 60).");
  let interval: number;
  if (i.mode === "interval") {
    if (!Number.isFinite(i.intervalSec) || i.intervalSec <= 0 || i.intervalSec > 86_400) throw new ToolError("bad-input", "Enter the interval between shots in seconds.");
    interval = i.intervalSec;
  } else {
    if (!Number.isFinite(i.targetClipSec) || i.targetClipSec <= 0) throw new ToolError("bad-input", "Enter the clip length you want, in seconds.");
    const framesWanted = i.targetClipSec * i.fps;
    interval = i.durationSec / framesWanted;
  }
  const frames = Math.floor(i.durationSec / interval + 1e-9);
  if (frames < 1) throw new ToolError("bad-input", "The interval is longer than the shoot, so no frames would be taken.");
  if (i.mbPerFrame !== null && (!Number.isFinite(i.mbPerFrame) || i.mbPerFrame <= 0)) throw new ToolError("bad-input", "Enter the file size per frame in MB, or leave it blank.");
  return {
    intervalSec: interval,
    frames,
    clipSec: frames / i.fps,
    speedUp: interval * i.fps,
    storageGb: i.mbPerFrame === null ? null : (frames * i.mbPerFrame) / 1000,
  };
}
