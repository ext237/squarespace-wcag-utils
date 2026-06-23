/**
 * Squarespace Accessibility Enhancement – spacebarLinkActivation.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * Related WCAG Criteria:
 *   - 2.1.1 Keyboard Accessible
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

(function (window, document) {
	window.sqsA11y = window.sqsA11y || {};
	window.sqsA11y.enhancements = window.sqsA11y.enhancements || {};

	window.sqsA11y.enhancements.spacebarLinkActivation = function (options = {}) {
		const debug = !!options.debug;
		const utils = window.sqsA11y.utils || {};

		const ENH_NAME = options.name || "spacebarLinkActivation";
		const WCAG = options.wcag || "2.1.1";

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
