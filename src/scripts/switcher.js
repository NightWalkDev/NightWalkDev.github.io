// Shows one panel at a time (a release or an art piece) and keeps it in the URL (#id).
// Embedded players only load in the visible panel, so switching also stops playback.
export function initSwitcher(root) {
  const panels = [...root.querySelectorAll('[data-panel]')];
  if (!panels.length) return;
  const ids = panels.map((panel) => panel.dataset.panel);
  const picks = [...root.querySelectorAll('[data-pick]')];
  let current = -1;

  const show = (index, { updateUrl = true, reveal = false } = {}) => {
    index = (index + panels.length) % panels.length;
    if (index === current) return;
    panels.forEach((panel, i) => {
      const visible = i === index;
      panel.hidden = !visible;
      panel.querySelectorAll('iframe[data-src]').forEach((frame) => {
        frame.src = visible ? frame.dataset.src : 'about:blank';
      });
    });
    picks.forEach((pick) => pick.setAttribute('aria-current', String(pick.dataset.pick === ids[index])));
    const pick = picks.find((p) => p.dataset.pick === ids[index]);
    const strip = pick?.closest('[data-strip]');
    if (pick && strip) strip.scrollTo({ left: pick.offsetLeft - (strip.clientWidth - pick.clientWidth) / 2, behavior: 'smooth' });
    current = index;
    if (updateUrl) history.replaceState(null, '', '#' + ids[index]);
    if (reveal && panels[index].getBoundingClientRect().top < 96) panels[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  picks.forEach((pick) => pick.addEventListener('click', (e) => {
    e.preventDefault();
    show(ids.indexOf(pick.dataset.pick), { reveal: true });
  }));
  root.querySelectorAll('[data-step]').forEach((button) => button.addEventListener('click', () => show(current + Number(button.dataset.step))));
  if (root.hasAttribute('data-arrow-keys')) {
    document.addEventListener('keydown', (e) => {
      if (e.target.closest('input, textarea, select') || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  const fromUrl = ids.indexOf(decodeURIComponent(location.hash.slice(1)));
  show(Math.max(0, fromUrl), { updateUrl: false });
}
