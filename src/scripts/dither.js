// Draws a low-res, warm, ordered-dither copy of every <img data-dither> on top of it.
// CSS hides the copy on hover so the full-quality image shows through.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

function ditherImage(img, width, levels, pattern, warmth) {
  const height = Math.max(1, Math.round((img.naturalHeight * width) / img.naturalWidth));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.className = 'dither';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, width, height);
  const data = ctx.getImageData(0, 0, width, height), px = data.data;
  const tint = [1 + 0.06 * warmth, 1, 1 - 0.14 * warmth], lift = [0.03 * warmth, 0.01 * warmth, 0];
  for (let i = 0; i < width * height; i++) {
    const t = pattern * (BAYER[(((i / width) | 0) & 3) * 4 + ((i % width) & 3)] / 16 - 0.5);
    for (let ch = 0; ch < 3; ch++) {
      const value = Math.min(1, Math.max(0, (px[i * 4 + ch] / 255) * tint[ch] + lift[ch]));
      const q = Math.round((value + t / (levels - 1)) * (levels - 1)) / (levels - 1);
      px[i * 4 + ch] = Math.min(1, Math.max(0, q)) * 255;
    }
  }
  ctx.putImageData(data, 0, 0);
  img.insertAdjacentElement('afterend', canvas);
}

export function ditherImages(root = document, { resolution = 176, levels = 4, pattern = 1, warmth = 1 } = {}) {
  root.querySelectorAll('img[data-dither]').forEach((img) => {
    const run = () => { try { ditherImage(img, resolution, levels, pattern, warmth); } catch (err) { console.warn('[dither]', img.src, err); } };
    if (img.complete && img.naturalWidth) run();
    else img.addEventListener('load', run, { once: true });
  });
}
