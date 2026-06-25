/**
 * Squarespace Accessibility Enhancement - duplicateRequiredTextCleaner.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * Related WCAG Criteria:
 *   - 3.3.2 Labels or Instructions - Prevents duplicate required instructions in Squarespace form labels.
 *   - 4.1.2 Name, Role, Value - Keeps the required state programmatic while avoiding repeated 'required' announcements.
 *
 * Description:
 *   Hides duplicate visible "required" text from assistive technology when
 *   the associated form control already exposes the required state
 *   programmatically.
 *
 * Squarespace Context:
 *   - Squarespace forms may include visible "(required)" text inside labels.
 *   - The associated input may also include required or aria-required="true".
 *   - Some screen reader/browser combinations may announce this as
 *     "required required".
 *
 * Behavior:
 *   - Keeps the visible "(required)" text available for sighted users.
 *   - Adds aria-hidden="true" only to the duplicate required text span.
 *   - Only runs when the associated form control is already programmatically
 *     marked as required.
 *   - Does not remove required, aria-required, labels, or visible text.
 *
 * Dependencies:
 *   - sqsA11y-utils
 *   - utils.reportUpdate()
 *
 * Notes:
 *   This enhancement is intentionally conservative. It only hides text from
 *   assistive technology when that text appears to be only "required" and the
 *   associated control already communicates the required state.
 */

(function (window, document) {
	"use strict";

	window.sqsA11y = window.sqsA11y || {};
	window.sqsA11y.enhancements = window.sqsA11y.enhancements || {};

	window.sqsA11y.enhancements.duplicateRequiredTextCleaner = function (options = {}) {
		const debug = options.debug || false;
		const utils = window.sqsA11y.utils || {};
		const ENH_NAME = options.name;
		const WCAG = options.wcag;

		const HAS_RUN_MARK = "duplicateRequiredTextCleaned";

		/**
		 * isRequiredOnlyText()
		 * ------------------------------------------------------------
		 * Returns true when the text appears to be only a required marker.
		 */
		function isRequiredOnlyText(value) {
			if (!value || typeof value !== "string") return false;

			const text = value.replace(/\s+/g, " ").trim().toLowerCase();

			return /^(?:\*+\s*)?\(?\s*required\s*\)?(?:\s*\*+)?$/.test(text);
		}

		/**
		 * getAssociatedControl()
		 * ------------------------------------------------------------
		 * Finds the form control associated with a label.
		 */
		function getAssociatedControl(label) {
			if (!label || !(label instanceof HTMLLabelElement)) return null;

			const controlId = label.getAttribute("for");

			if (controlId) {
				const control = document.getElementById(controlId);

				if (control) return control;
			}

			return label.querySelector("input, select, textarea");
		}

		/**
		 * controlIsProgrammaticallyRequired()
		 * ------------------------------------------------------------
		 * Checks whether the form control already exposes required state.
		 */
		function controlIsProgrammaticallyRequired(control) {
			if (!control || !(control instanceof Element)) return false;

			return (
				control.hasAttribute("required") ||
				control.getAttribute("aria-required") === "true"
			);
		}

		/**
		 * cleanRequiredText()
		 * ------------------------------------------------------------
		 * Hides duplicate required text from assistive technology when safe.
		 */
		function cleanRequiredText(requiredText) {
			if (!requiredText || !(requiredText instanceof Element)) return;

			if (requiredText.dataset[HAS_RUN_MARK] === "1") return;

			const label = requiredText.closest("label");

			if (!label) {
				requiredText.dataset[HAS_RUN_MARK] = "1";
				return;
			}

			const control = getAssociatedControl(label);

			if (!control) {
				requiredText.dataset[HAS_RUN_MARK] = "1";
				return;
			}

			if (!controlIsProgrammaticallyRequired(control)) {
				requiredText.dataset[HAS_RUN_MARK] = "1";
				return;
			}

			if (!isRequiredOnlyText(requiredText.textContent)) {
				requiredText.dataset[HAS_RUN_MARK] = "1";
				return;
			}

			requiredText.setAttribute("aria-hidden", "true");
			requiredText.dataset[HAS_RUN_MARK] = "1";

			if (typeof utils.reportUpdate === "function") {
				utils.reportUpdate(
					requiredText,
					ENH_NAME,
					`(${WCAG}) Hid duplicate required text from assistive technology because the associated control already exposes required state programmatically.`,
					debug,
				);
			}
		}

		const requiredTextNodes = Array.from(
			document.querySelectorAll("label .description.required"),
		);

		requiredTextNodes.forEach((requiredText) => {
			cleanRequiredText(requiredText);
		});
	};
})(window, document);