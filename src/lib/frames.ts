// Central source of truth for the scroll-driven image sequence.
// Frames live in /public/frames as ezgif-frame-001.png ... ezgif-frame-208.png.
// To swap the footage: drop new frames in /public/frames and update
// FRAME_COUNT and FRAME_EXT below to match.

export const FRAME_COUNT = 208;
export const FRAME_EXT = 'png';

const pad = (n: number): string => String(n).padStart(3, '0');

/** Public URL for a 1-based frame index. */
export const frameUrl = (index: number): string =>
  `/frames/ezgif-frame-${pad(index)}.${FRAME_EXT}`;

/** All frame URLs, 1-based order. */
export const frameUrls: string[] = Array.from({ length: FRAME_COUNT }, (_, i) =>
  frameUrl(i + 1)
);
