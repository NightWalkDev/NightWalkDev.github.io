// Draws a low-res, warm, ordered-dither copy of every <img data-dither> on top of it.
// CSS hides the copy on hover so the full-quality image shows through.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const WIDTH = 176;
const LEVELS = 4;

function ditherImage(img) {
  const height = Math.max(1, Math.round((img.naturalHeight * WIDTH) / img.naturalWidth));
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = height;
  canvas.className = 'dither';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, WIDTH, height);
  const data = ctx.getImageData(0, 0, WIDTH, height), px = data.data;
  const tint = [1.06, 1, 0.86], lift = [0.03, 0.01, 0];
  for (let i = 0; i < WIDTH * height; i++) {
    const t = (BAYER[(((i / WIDTH) | 0) & 3) * 4 + ((i % WIDTH) & 3)]) / 16 - 0.5;
    for (let ch = 0; ch < 3; ch++) {
      const value = Math.min(1, Math.max(0, (px[i * 4 + ch] / 255) * tint[ch] + lift[ch]));
      const q = Math.round((value + t / (LEVELS - 1)) * (LEVELS - 1)) / (LEVELS - 1);
      px[i * 4 + ch] = Math.min(1, Math.max(0, q)) * 255;
    }
  }
  ctx.putImageData(data, 0, 0);
  img.insertAdjacentElement('afterend', canvas);
}

export function ditherImages(root = document) {
  root.querySelectorAll('img[data-dither]').forEach((img) => {
    const run = () => { try { ditherImage(img); } catch (err) { console.warn('[dither]', img.src, err); } };
    if (img.complete && img.naturalWidth) run();
    else img.addEventListener('load', run, { once: true });
  });
}
