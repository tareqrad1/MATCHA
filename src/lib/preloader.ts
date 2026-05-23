// Streaming frame manager for the cinematic scroll sequence.
//
// The old approach fired all 208 image requests at once (131 MB) and the
// splash blocked until every one finished. This manager instead:
//   - loads a small INITIAL batch first, gating only that behind the splash;
//   - then streams the rest with bounded concurrency in the background;
//   - reprioritizes on the fly toward the frame the user is scrolling near
//     (buffer-ahead), so upcoming frames are fetched before they're needed;
//   - caps how many decoded bitmaps live in memory and evicts the ones
//     farthest from the playhead, keeping RAM flat instead of ~760 MB.
//
// Components read frames via `get(i)` which returns the decoded image if
// present, or the nearest already-decoded neighbour so the canvas never goes
// blank (no flashing/cutting) while a frame is still in flight.

import { FRAME_COUNT, frameUrl } from './frames';

const MAX_CONCURRENT = 6; // parallel decodes; keeps the network/decoder busy, not flooded
// The full sequence is ~11 MB of webp — it comfortably fits in RAM once decoded.
// Keeping every frame resident removes the eviction/re-decode churn that made
// scrubbing back-and-forth thrash the decoder. (If footage ever grows large
// enough to matter, lower this and the eviction path below re-engages.)
const MEMORY_BUDGET = Number.POSITIVE_INFINITY; // never evict for this asset size
const BUFFER_AHEAD = 30; // frames to keep loaded ahead of the playhead

type Slot = HTMLImageElement | undefined;

export class FrameSequence {
  private readonly count: number;
  private readonly slots: Slot[];
  private readonly inFlight = new Set<number>();
  private playhead = 0;
  private active = 0;
  private destroyed = false;
  private loaded = 0; // running count of decoded frames (avoids O(n) recount)
  private onFirstBatch?: () => void;
  private firstBatchTarget: number;
  private firstBatchLoaded = 0;
  private firstBatchFired = false;
  private lastPumpAt = -Infinity; // playhead value at the last re-prioritization

  constructor(count = FRAME_COUNT, initialBatch = 24) {
    this.count = count;
    this.slots = new Array<Slot>(count);
    this.firstBatchTarget = Math.min(initialBatch, count);
  }

  /** Start streaming. `onFirstBatch` fires once the initial frames are decoded. */
  start(onFirstBatch?: () => void): void {
    this.onFirstBatch = onFirstBatch;
    // Kick off the initial batch in scroll order so the opening frames are
    // ready first; the pump then continues with the rest.
    this.pump();
  }

  /** Tell the manager where the user is (frame index) to prioritize. */
  setPlayhead(index: number): void {
    const next = Math.max(0, Math.min(this.count - 1, Math.round(index)));
    if (next === this.playhead) return; // no-op: don't re-scan on an unchanged frame
    this.playhead = next;
    // Once everything is decoded there is nothing left to schedule — skip the
    // O(n) prioritization scan entirely. This is the common case during scrub.
    if (this.loaded >= this.count) return;
    // While still streaming, re-prioritize only after the playhead has moved a
    // few frames. pump() already keeps the pipe full and buffers BUFFER_AHEAD
    // frames out, so re-scanning on every single frame is wasted main-thread
    // work during scrub.
    if (Math.abs(next - this.lastPumpAt) < 4) return;
    this.lastPumpAt = next;
    this.pump();
  }

  /**
   * Return the decoded frame at `index`, or the nearest decoded neighbour so
   * the canvas always has something to draw (prevents blank/flashing frames).
   */
  get(index: number): HTMLImageElement | undefined {
    const i = Math.max(0, Math.min(this.count - 1, Math.round(index)));
    if (this.slots[i]) return this.slots[i];
    // Walk outward for the closest loaded frame. During scrub the requested
    // frame is almost always already loaded (above), so this rarely runs; when
    // it does, neighbours are typically one or two steps away.
    for (let d = 1; d < this.count; d++) {
      const lo = i - d;
      const hi = i + d;
      if (lo >= 0 && this.slots[lo]) return this.slots[lo];
      if (hi < this.count && this.slots[hi]) return this.slots[hi];
      if (lo < 0 && hi >= this.count) break;
    }
    return undefined;
  }

  get loadedCount(): number {
    return this.loaded;
  }

  destroy(): void {
    this.destroyed = true;
    for (let i = 0; i < this.count; i++) {
      const img = this.slots[i];
      if (img) img.src = '';
      this.slots[i] = undefined;
    }
    this.inFlight.clear();
    this.loaded = 0;
  }

  // --- internals ----------------------------------------------------------

  // Pick the next most-valuable frame to load: prefer the unfinished initial
  // batch, then frames just ahead of the playhead, then the rest by distance.
  private nextToLoad(): number {
    let best = -1;
    let bestScore = Infinity;
    for (let i = 0; i < this.count; i++) {
      if (this.slots[i] || this.inFlight.has(i)) continue;
      const ahead = i - this.playhead;
      let score: number;
      if (i < this.firstBatchTarget && !this.firstBatchFired) {
        score = i; // finish the opening batch in order, highest priority
      } else if (ahead >= 0 && ahead <= BUFFER_AHEAD) {
        score = 1000 + ahead; // just-ahead buffer, near-top priority
      } else {
        score = 10000 + Math.abs(ahead); // everything else, by distance
      }
      if (score < bestScore) {
        bestScore = score;
        best = i;
      }
    }
    return best;
  }

  private pump(): void {
    if (this.destroyed) return;
    while (this.active < MAX_CONCURRENT) {
      const i = this.nextToLoad();
      if (i < 0) break;
      this.load(i);
    }
  }

  private load(i: number): void {
    this.inFlight.add(i);
    this.active++;
    const img = new Image();
    img.decoding = 'async';
    const finish = () => {
      if (this.destroyed) return;
      this.inFlight.delete(i);
      this.active--;
      if (!this.slots[i]) this.loaded++;
      this.slots[i] = img;

      if (i < this.firstBatchTarget && !this.firstBatchFired) {
        this.firstBatchLoaded++;
        if (this.firstBatchLoaded >= this.firstBatchTarget) {
          this.firstBatchFired = true;
          this.onFirstBatch?.();
        }
      }

      this.evictIfNeeded();
      this.pump();
    };
    img.onload = finish;
    img.onerror = finish; // a single bad frame must not stall the stream
    img.src = frameUrl(i + 1); // frame URLs are 1-based
  }

  // Keep memory flat: if we exceed the budget, drop decoded frames farthest
  // from the playhead (they're cheapest to refetch later, and the nearest-
  // neighbour draw covers any momentary gap).
  private evictIfNeeded(): void {
    let loaded = this.loaded;
    if (loaded <= MEMORY_BUDGET) return; // infinite budget for this asset → no-op
    // Gather loaded indices sorted by distance from playhead (farthest first).
    const candidates: number[] = [];
    for (let i = 0; i < this.count; i++) if (this.slots[i]) candidates.push(i);
    candidates.sort(
      (a, b) => Math.abs(b - this.playhead) - Math.abs(a - this.playhead)
    );
    for (const i of candidates) {
      if (loaded <= MEMORY_BUDGET) break;
      // Never evict frames inside the active buffer window.
      if (Math.abs(i - this.playhead) <= BUFFER_AHEAD) continue;
      const img = this.slots[i];
      if (img) img.src = '';
      this.slots[i] = undefined;
      this.loaded--;
      loaded--;
    }
  }
}
