// Plays the release effect (ring, wobble, flash) each time a screen button is clicked.
export function initScreenButtons() {
  document.addEventListener('click', (e) => {
    const button = e.target.closest?.('.sb');
    if (!button) return;
    button.classList.remove('sb-fire');
    void button.offsetWidth;
    button.classList.add('sb-fire');
    clearTimeout(button.fireTimer);
    button.fireTimer = setTimeout(() => button.classList.remove('sb-fire'), 500);
  });
}
