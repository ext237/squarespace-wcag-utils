/**
 * Squarespace Accessibility Enhancement – autocompleteEnhancer.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * Related WCAG Criteria:
 *   - 1.3.5 Identify Input Purpose
 *   - 1.3.1 Info and Relationships
 *   - 4.1.2 Name, Role, Value
 *
 * Description:
 *   Applies valid `autocomplete` tokens to form fields when the field purpose
 *   can be reasonably inferred from label, name, placeholder, or ID context.
 *   This may improve autofill behavior and assistive technology support for
 *   common contact and identity fields.
 *
 * Squarespace Context:
 *   - Intended for common Squarespace 7.0 and 7.1 form patterns.
 *   - Attempts to improve fields that omit `autocomplete` or use unsupported
 *     values such as `autocomplete="false"`.
 *   - Skips hidden, system, and honeypot fields.
 *   - Can run after AJAX loads or delayed form block rendering.
 *
 * Dependencies:
 *   - utils.normalize()
 *   - utils.hasWord()
 *   - utils.getLabelText()
 *   - utils.guessToken()
 *   - utils.scanFormControls()
 *   - utils.observeFormsForChanges()
 *   - utils.reportUpdate()
 *
 * Notes:
 *   This enhancement supports accessibility review and remediation work.
 *   It does not guarantee WCAG compliance on its own.
 */

(function (window, document) {
	window.sqsA11y = window.sqsA11y || {};
	window.sqsA11y.enhancements = window.sqsA11y.enhancements || {};

	window.sqsA11y.enhancements.autocompleteEnhancer = function (options = {}) {
		const debug = options.debug || false;

		const utils = window.sqsA11y.utils || {};

		const ENH_NAME = options.name;
		const WCAG = options.wcag;

		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement called.`, debug);

		/**
		 * normalizeFormAutocomplete()
		 * ----------------------------------------------------------------
		 * Purpose:
		 *   Corrects overly generic form-level autocomplete behavior
		 *   introduced by Squarespace.
		 *
		 * Squarespace Context:
		 *   Squarespace frequently outputs <form autocomplete="on"> by default.
		 *   While valid HTML, this is too broad and causes browsers to apply
		 *   heuristic autofill across all fields, including non-personal fields
		 *   such as event details, comments, and custom inputs.
		 *
		 *   This can override or dilute precise field-level autocomplete tokens
		 *   (e.g., "given-name", "email", "tel") that are required for WCAG 1.3.5.
		 *
		 * Behavior:
		 *   - Detects forms using autocomplete="on"
		 *   - Replaces with autocomplete="off" to prevent incorrect autofill
		 *   - Preserves field-level autocomplete attributes for accuracy
		 *
		 * Result:
		 *   - Ensures browser autofill relies on explicit, semantically correct tokens
		 *   - Prevents incorrect autofill on non-personal fields
		 *   - Improves consistency and predictability of form behavior
		 *
		 * WCAG References:
		 *   1.3.5 – Identify Input Purpose
		 *   1.3.1 – Info and Relationships
		 *
		 * Notes:
		 *   Setting autocomplete="off" at the form level does NOT disable autofill.
		 *   Browsers will still honor valid autocomplete attributes on individual fields.
		 */
		function normalizeFormAutocomplete() {
			const forms = document.querySelectorAll("form");

			utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Forms Found: ${forms.length}`, debug);
			forms.forEach((form) => {
				const ac = form.getAttribute("autocomplete");

				if (ac && ac.toLowerCase() === "on") {
					form.setAttribute("autocomplete", "off");
				}
			});
		}

		/**
		 * repairAutocompleteField(el)
		 * ------------------------------------------------------------
		 * Detects and corrects broken or missing autocomplete tokens.
		 * Returns {updated, cleaned, skipped}.
		 */
		function repairAutocompleteField(el) {
			if (!el || !(el instanceof Element)) return { updated: 0, cleaned: 0, skipped: 1 };

			const HAS_RUN_MARK = "autocompleteFixed";
			if (el.dataset[HAS_RUN_MARK] === "1") return { updated: 0, cleaned: 0, skipped: 1 };

			let updated = 0,
				cleaned = 0;

			const beforeType = (el.type || "").toLowerCase();
			const beforeAC = el.getAttribute("autocomplete");

			// Remove Squarespace autocomplete="false" and other bad values
			const badValues = ["false", "off", "none"];
			if (beforeAC && badValues.includes(beforeAC.toLowerCase())) {
				el.removeAttribute("autocomplete");
				cleaned++;
			}

			// Guess appropriate autocomplete token
			const token = typeof utils.guessToken === "function" ? utils.guessToken(el) : null;

			if (token) {
				const current = el.getAttribute("autocomplete");
				const invalidValues = ["on", "off", "false", "true", ""];

				if (!current || invalidValues.includes(current.toLowerCase())) {
					el.setAttribute("autocomplete", token);
					updated++;
				}

				// Improve field types + input hints

				// For now, commenting out type changes, as they may cause issues with squarespace validation scripts
				// if (token === "email" && beforeType !== "email") el.type = "email";
				// if (token === "tel" && beforeType !== "tel") el.type = "tel";

				if (token === "tel") el.setAttribute("inputmode", "tel");
				if (token === "postal-code") el.setAttribute("inputmode", "text");
				if (["email", "url", "username"].includes(token)) el.setAttribute("autocapitalize", "none");
			}

			// Normalize Squarespace’s “tel-national” quirk
			if (el.getAttribute("autocomplete") === "tel-national") {
				el.setAttribute("autocomplete", "tel");
				updated++;
			}

			el.dataset[HAS_RUN_MARK] = "1";
			return { updated, cleaned, skipped: 0 };
		}

		normalizeFormAutocomplete();
		const results = utils.scanFormControls(repairAutocompleteField);

		utils.reportUpdate(
			null,
			ENH_NAME,
			`(${WCAG}) - ${results.updated} updated, ${results.cleaned} cleaned`,
			debug,
		);

		/**
		 * Attach an observer for future Squarespace DOM changes.
		 *
		 * This observer should only be attached once for the lifetime of the
		 * current page session. The fix itself may run many times, but the
		 * observer does not need to be re-registered each time.
		 */
		if (
			typeof utils.observeFormsForChanges === "function" &&
			!window.sqsA11y._autocompleteObserverAttached
		) {
			window.sqsA11y._autocompleteObserverAttached = true;

			utils.observeFormsForChanges(() => {
				normalizeFormAutocomplete();
				const results = utils.scanFormControls(repairAutocompleteField);

				utils.reportUpdate(
					null,
					ENH_NAME,
					`(${WCAG}) - ${results.updated} updated, ${results.cleaned} cleaned`,
					debug,
				);
			});
		}

		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement complete.`, debug);

	};
})(window, document);
