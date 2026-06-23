/**
 * Squarespace Accessibility Enhancement - emptyButtons.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * Related WCAG Criteria:
 *   - 1.1.1 Non-text Content
 *   - 2.4.6 Headings and Labels
 *   - 4.1.2 Name, Role, Value
 *
 * Description:
 *   Attempts to identify `<button>` elements that do not appear to expose an
 *   accessible name. When a reasonable purpose can be inferred, this enhancement
 *   may add a fallback `aria-label` without changing native Squarespace behavior.
 *
 * Squarespace Context:
 *   - Intended for common Squarespace 7.0 and 7.1 button patterns.
 *   - Reviews common close buttons inside dialogs and modal overlays.
 *   - Reviews unlabeled submit buttons associated with forms.
 *   - Can run after AJAX loads or delayed content rendering.
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

	window.sqsA11y.enhancements.emptyButtons = function (options = {}) {
		const debug = !!options.debug;
		const utils = window.sqsA11y.utils || {};

		const ENH_NAME = options.name || "Empty Button Accessibility Fix";
		const WCAG = options.wcag;

		// Report that the fix has started running.
		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement called.`, debug);

		// Collect all button elements on the current page.
		const buttons = document.querySelectorAll("button");
		let repairedCount = 0;

		// Determines whether the button already has a usable accessible name
		// from visible text or a title attribute.
		function hasAccessibleName(btn) {
			const text = (btn.textContent || "").trim();
			const title = (btn.getAttribute("title") || "").trim();

			return !!(text || title);
		}

		buttons.forEach((btn) => {
			// If ARIA labeling is already present, leave the button alone.
			const ariaLabel = (btn.getAttribute("aria-label") || "").trim();
			const ariaLabelledby = (btn.getAttribute("aria-labelledby") || "").trim();

			if (ariaLabel || ariaLabelledby) {
				utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - button already has ARIA label info`, debug);
				return;
			}

			// If the button already has visible text or a title, no repair is needed.
			if (hasAccessibleName(btn)) {
				return;
			}

			let label = "Button";

			// Normalize values used for context checks.
			const className = (btn.className || "").toLowerCase();
			const id = (btn.id || "").toLowerCase();

			// Check whether the button appears inside a dialog, modal, or lightbox.
			const inDialog = btn.closest(
				'[role="dialog"], [aria-modal="true"], [id*="lightbox"], [class*="lightbox"], [class*="modal"]',
			);

			// Apply a more descriptive label when the button looks like a dialog close control.
			if (inDialog && (className.includes("close") || id.includes("close"))) {
				label = "Close dialog";
			}
			// Apply a submit label only when the button is actually associated with a form.
			else if (btn.type === "submit" && (btn.form || btn.closest("form"))) {
				label = "Submit form";
			}

			// Add the fallback accessible name.
			btn.setAttribute("aria-label", label);
			repairedCount++;

			utils.reportUpdate(btn, ENH_NAME, `(${WCAG})  - Added aria-label="${label}"`, debug);
		});

		// Report the number of repaired buttons after processing.
		if (repairedCount > 0) {
			utils.reportUpdate(document.body, ENH_NAME, `${repairedCount} buttons repaired`, debug);
		}

		// Report that the fix has finished running.
		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement complete.`, debug);

	};
})(window, document);
