/**
 * squarespaceA11y-utils.js
 * Shared helper functions for Squarespace WCAG fixes
 */

/**
 * logNodeAction()
 * ----------------------------------------------------------------
 * Purpose:
 *   Provide a consistent, namespaced way to log DOM actions
 *   performed by accessibility fixes (for developer visibility).
 *
 * Behavior:
 *   - Logs the provided action message and related DOM node.
 *   - Helps trace what elements were modified during runtime.
 *
 * Parameters:
 *   node   → DOM element affected by the fix
 *   action → Description of the action performed (string)
 */
export function logNodeAction(node, action) {
  console.log(`[sqsA11y-utils] ${action}:`, node);
}

/**
 * safeQuery()
 * ----------------------------------------------------------------
 * Purpose:
 *   Query the DOM safely while warning developers when an element
 *   is missing. Prevents silent failures in accessibility scripts.
 *
 * Behavior:
 *   - Returns the first matching element for the selector.
 *   - Logs a warning (not an error) if no element is found.
 *
 * Parameters:
 *   selector → CSS selector string to locate the node
 *
 * Returns:
 *   The matching DOM node, or null if not found.
 */
export function safeQuery(selector) {
  const node = document.querySelector(selector);
  if (!node) console.warn(`[sqsA11y-utils] Missing selector: ${selector}`);
  return node;
}

/**
 * cssRuleExists()
 * ----------------------------------------------------------------
 * Purpose:
 *   Detect whether a given CSS selector is already defined in
 *   any loaded stylesheet. Prevents injecting duplicate styles.
 *
 * Behavior:
 *   - Iterates through all accessible styleSheets in the document.
 *   - Skips over cross-origin or restricted stylesheets silently.
 *   - Returns true if any CSS rule includes the target selector.
 *
 * Parameters:
 *   selector → CSS selector string (e.g. ".skip-link")
 *
 * Returns:
 *   Boolean → true if the selector exists in any stylesheet.
 */
export function cssRuleExists(selector) {
  return Array.from(document.styleSheets).some((sheet) => {
    try {
      return Array.from(sheet.cssRules || []).some(
        (rule) => rule.selectorText && rule.selectorText.includes(selector)
      );
    } catch {
      // Ignore SecurityError on cross-origin stylesheets (Squarespace)
      return false;
    }
  });
}


/**
 * Inject a <style> tag only if it doesn't already exist
 * and the CSS rule isn't already present in user styles.
 */
export function injectStyleOnce(id, selector, cssText) {
	try {
		if (document.getElementById(id)) return false;

		const hasRule = cssRuleExists(selector);
		if (hasRule) {
			console.log(`[sqsA11y-utils] CSS for ${selector} already exists.`);
			return false;
		}

		const style = document.createElement("style");
		style.id = id;
		style.textContent = cssText;
		document.head.appendChild(style);
		console.log(`[sqsA11y-utils] Injected ${id}`);
		return true;
	} catch (err) {
		console.warn(`[sqsA11y-utils] injectStyleOnce() failed:`, err);
		return false;
	}
}

/**
 * getMainTarget()
 * ----------------------------------------------------------------
 * Purpose:
 *   Locate the logical "main content" area of a Squarespace page.
 *   Used by accessibility fixes (e.g. Skip to Main) to identify
 *   where keyboard users should land after bypassing navigation.
 *
 * Behavior:
 *   1. Prefers a <main> element.
 *   2. Falls back to [role="main"] if <main> is missing.
 *   3. As a last resort, uses the first <h1> as a visible anchor.
 *   4. Ensures the chosen element has a unique ID (adds one if missing).
 *
 * Returns:
 *   A DOM element representing the main content target, or null if none found.
 */
export function getMainTarget() {
	const mainEl = document.querySelector("main") || document.querySelector('[role="main"]');
	const targetEl = mainEl || document.querySelector("h1");
	if (!targetEl) return null;
	if (!targetEl.id) targetEl.id = "main-content";
	return targetEl;
}

/**
 * appendDataTraceAttr()
 * ----------------------------------------------------------------
 * Purpose:
 *   Append trace/debug information to an element's `data-trace` attribute.
 *   This allows multiple accessibility fixes to leave an audit trail
 *   on the same node without overwriting each other.
 *
 * Behavior:
 *   - If the element already has a `data-trace`, append the new entry.
 *   - If not, create the attribute with the provided text.
 *
 * Parameters:
 *   el   → DOM element to annotate
 *   text → Description or fix identifier (e.g. "FIX-5 - SkipToMain applied")
 *
 * Returns:
 *   The updated `data-trace` string, or undefined if element is invalid.
 */
export function appendDataTraceAttr(el, text) {
	if (!el) return;
	const prev = el.getAttribute("data-trace");
	const next = prev ? `${prev} | ${text}` : text;
	el.setAttribute("data-trace", next);
	return next;
}

/**
 * reportFix()
 * ----------------------------------------------------------------
 * Purpose:
 *   Provide a unified way to log and trace accessibility fixes.
 *   Combines console logging (for developers) with `data-trace`
 *   updates (for automated audits or debugging overlays).
 *
 * Behavior:
 *   - Builds a formatted entry from the fix ID and description.
 *   - Calls appendDataTraceAttr() to store that entry on the element.
 *   - Logs the same info to the console for runtime visibility.
 *
 * Parameters:
 *   element     → Element affected by the fix
 *   fixId       → Unique identifier for the fix (e.g. "FIX-5")
 *   description → Short summary of what the fix did
 */
export function reportFix(element, fixId, description) {
	const entry = `${fixId} - ${description}`;
	appendDataTraceAttr(element, entry);
	console.log(`[${fixId}] ${description}`);
}

