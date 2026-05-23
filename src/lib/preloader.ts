// Preloads the full image sequence and reports aggregate progress.
// Returns a promise resolving to an array of decoded HTMLImageElements,
// indexed 0..count-1, ready for instant canvas draws.

export type ProgressFn = (
  fraction: number,
  loaded: number,
  total: number
) => void;

export function preloadImages(
  urls: string[],
  onProgress?: ProgressFn
): Promise<HTMLImageElement[]> {
  let loaded = 0;
  const total = urls.length;
  const images = new Array<HTMLImageElement>(total);

  const report = () => {
    loaded += 1;
    onProgress?.(loaded / total, loaded, total);
  };

  const tasks = urls.map(
    (url, i) =>
      new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          images[i] = img;
          report();
          resolve(img);
        };
        img.onerror = () => {
          // Still resolve so a single bad frame can't stall the loader.
          images[i] = img;
          report();
          resolve(img);
        };
        img.src = url;
      })
  );

  return Promise.all(tasks).then(() => images);
}
