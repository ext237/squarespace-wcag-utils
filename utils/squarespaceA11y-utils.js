/**
 * squarespaceA11y-utils.js
 * Shared helper functions for Squarespace WCAG fixes
 */

export function logNodeAction(node, action) {
  console.log(`[sqsA11y-utils] ${action}:`, node);
}

export function safeQuery(selector) {
  const node = document.querySelector(selector);
  if (!node) console.warn(`[sqsA11y-utils] Missing selector: ${selector}`);
  return node;
}
