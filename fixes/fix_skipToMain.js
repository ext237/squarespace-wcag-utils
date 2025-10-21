/**
 * fix_skipToMain.js
 * Adds a "Skip to main content" link for keyboard users.
 * WCAG 2.4.1 Bypass Blocks
 */

export function fix_skipToMain() {
  if (document.querySelector('#acc-skip-link')) return;

  const skip = document.createElement('a');
  skip.href = '#mainContent';
  skip.id = 'acc-skip-link';
  skip.textContent = 'Skip to main content';
  skip.className = 'visually-hidden focusable';
  document.body.prepend(skip);

  console.log('[fix_skipToMain] Skip link added.');
}
