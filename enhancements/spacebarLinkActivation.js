/**
 * Squarespace Accessibility Enhancement – spacebarLinkActivation.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * Related WCAG Criteria:
 *   - 2.1.1 Keyboard - Adds Spacebar activation support for button-like links without changing normal link keyboard behavior.
 *
 * Description:
 *   Attempts to add Spacebar activation behavior to anchor elements that appear
 *   to be intentionally presented as buttons. Native links already activate
 *   with Enter, so this enhancement does not apply globally to all `<a>`
 *   elements. This helps avoid interfering with expected Spacebar page scrolling.
 *
 * Squarespace Context:
 *   - Intended for common Squarespace 7.0 and 7.1 button-style link patterns.
 *   - Reviews anchors with `role="button"` or known button-style link classes.
 *   - Uses one delegated keydown listener.
 *   - Can continue working after AJAX rebuilds because the listener is only bound once.
 *
 * Dependencies:
 *   - sqsA11y-utils
 *   - utils.reportUpdate()
 *
 * Notes:
 *   This enhancement supports accessibility review and remediation work.
 *   It does not guarantee WCAG compliance on its own.
 */

// TODO: need to test if the listerner can be added twice on multiple runds.
// So may need to add a guard before binding the delegated keydown listener. The code sets
// document.body.dataset.spacebarLinksBound = "true", but it does not currently
// check that value before adding another listener if the enhancement runs again.

// TODO: Check whether this helper should reject placeholder links such as
// href="#" or href="javascript:void(0)". The current check uses link.href,
// which returns a browser-resolved URL even for some placeholder href values.
// If a Squarespace button-style link does not point to a real destination,
// Spacebar activation may trigger a meaningless click instead of helping
// keyboard users.

// TODO: Review Spacebar activation timing for button-like links.
// Native button behavior usually prevents page scrolling on keydown, then
// activates the button on keyup. This utility currently activates on keydown.
// Consider changing the Spacebar handling to preventDefault() on keydown but
// trigger link.click() on keyup, so the behavior more closely matches native
// buttons and avoids repeated activation if the user holds the Spacebar down.

// TODO: Consider adding a guard to prevent multiple activations if the user
// holds the Spacebar down. Native buttons only activate once per key press,
// but this utility currently activates on every keydown event, which may
// trigger multiple activations if the user holds the Spacebar down for a
// long time. This could be addressed by tracking the last activated link
// and ignoring repeated keydown events until the Spacebar is released.

// TODO: review whether this enhancement should be applied to links that are
// visually styled as buttons but do not have a `role="button"` attribute or '
// known button-style classes. Some Squarespace templates may use custom styles
// for links that look like buttons, and it may be beneficial to include those in
// the Spacebar activation behavior. However, this could also introduce unintended
//behavior for links that are not meant to be activated with the Spacebar.


(function (window, document) {
	window.sqsA11y = window.sqsA11y || {};
	window.sqsA11y.enhancements = window.sqsA11y.enhancements || {};

	window.sqsA11y.enhancements.spacebarLinkActivation = function (options = {}) {
		const debug = !!options.debug;
		const utils = window.sqsA11y.utils || {};

		const ENH_NAME = options.name || "spacebarLinkActivation";
		const WCAG = options.wcag || "WCAG 2.1.1";

		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement called.`, debug);
		document.body.dataset.spacebarLinksBound = "true";

		/**
		 * Identifies anchor elements that are being used as button-like controls.
		 * Normal links are intentionally excluded because Enter is their native
		 * activation key, while Space is expected to scroll the page.
		 */
		function isButtonLikeLink(link) {
			// Only apply this behavior to real anchor elements.
			// This prevents the helper from accidentally treating buttons, spans,
			// SVG elements, or other focused controls as links.
			if (!(link instanceof HTMLAnchorElement)) return false;

			// Only links with a usable href should be considered activatable.
			// Placeholder anchors or malformed links should not receive custom
			// keyboard behavior.
			if (!link.href) return false;

			return (
				link.getAttribute("role") === "button" ||
				link.classList.contains("sqs-block-button-element") ||
				link.classList.contains("sqs-button-element--primary") ||
				link.classList.contains("sqs-button-element--secondary") ||
				link.classList.contains("sqs-button-element--tertiary")
			);
		}

		document.addEventListener("keydown", function (event) {
			const link = event.target;

			// Only handle unclaimed Spacebar presses on links that are intentionally
			// behaving like buttons. Native links are excluded so normal keyboard
			// scrolling and browser/link behavior are preserved.
			if (event.key !== " ") return;
			if (event.defaultPrevented) return;
			if (!isButtonLikeLink(link)) return;

			// Prevent the Spacebar from scrolling the page when activating this control.
			event.preventDefault();

			// Match button keyboard behavior by activating the focused control.
			link.click();

			utils.reportUpdate?.(link, ENH_NAME, `(${WCAG}) - Spacebar activated button-like link`, debug);
		});

		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement complete.`, debug);

	};
})(window, document);
