/**
 * Screen-shake helper: re-triggers a CSS animation on the app root.
 */
let timeout: number | undefined;

export function shakeScreen() {
  const el = document.getElementById('shake-root');
  if (!el) return;
  el.classList.remove('shake');
  // force reflow so the animation can replay
  void el.offsetWidth;
  el.classList.add('shake');
  window.clearTimeout(timeout);
  timeout = window.setTimeout(() => el.classList.remove('shake'), 500);
}
