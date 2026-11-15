// Shrinks the font of every .fit-line element until its text fits on one line.
// If it still doesn't fit at MIN_SIZE (very narrow screens), the text is allowed to wrap.
const MIN_SIZE = 18;

function fit(el) {
  el.style.fontSize = '';
  el.style.whiteSpace = '';
  const width = el.clientWidth;
  if (!width || el.scrollWidth <= width) return;
  let size = Math.max(MIN_SIZE, Math.floor((parseFloat(getComputedStyle(el).fontSize) * width) / el.scrollWidth));
  el.style.fontSize = `${size}px`;
  while (el.scrollWidth > width && size > MIN_SIZE) el.style.fontSize = `${--size}px`;
  if (el.scrollWidth > width) el.style.whiteSpace = 'normal';
}

const lines = document.querySelectorAll('.fit-line');
const observer = new ResizeObserver((entries) => entries.forEach((entry) => fit(entry.target)));
lines.forEach((el) => observer.observe(el));
document.fonts?.ready.then(() => lines.forEach(fit));
