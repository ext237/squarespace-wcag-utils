/**
 * Squarespace Accessibility Enhancement – labelIssues.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * Related WCAG Criteria:
 *   - 1.3.1 Info and Relationships
 *   - 2.4.6 Headings and Labels
 *   - 4.1.2 Name, Role, Value
 *
 * Description:
 *   Attempts to identify common Squarespace form label and hidden-control
 *   patterns that may create accessibility review issues. When a reasonable
 *   relationship can be inferred, this enhancement may add supporting label
 *   text, update label associations, or mark known non-user-facing controls
 *   as hidden from assistive technologies.
 *
 * Squarespace Context:
 *   - Intended for common Squarespace 7.0 and 7.1 form patterns.
 *   - Reviews empty labels that may be associated with nearby legends.
 *   - Reviews labels that appear to be missing valid `for` targets.
 *   - Reviews known hidden, system, and reCAPTCHA response fields.
 *   - Can run after AJAX loads or delayed form rendering.
 *
 * Dependencies:
 *   - sqsA11y-utils
 *   - utils.reportUpdate()
 *   - utils.injectStyleOnce()
 *
 * Notes:
 *   This enhancement supports accessibility review and remediation work.
 *   It does not guarantee WCAG compliance on its own.
 */

(function (window, document) {
	window.sqsA11y = window.sqsA11y || {};
	window.sqsA11y.enhancements = window.sqsA11y.enhancements || {};

	window.sqsA11y.enhancements.labelIssues = function (options = {}) {
		const debug = !!options.debug;
		const ENH_NAME = options.name || "labelIssues";
		const WCAG = options.wcag || "WCAG 1.3.1, 2.4.6, 4.1.2";

		const utils = window.sqsA11y.utils || {};

		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement called.`, debug);

		// ------------------------------------------------------------
		// 0. Hide known non-user-facing system fields
		// ------------------------------------------------------------
		const hiddenSystemSelectors = ['input[type="hidden"]', 'textarea[id^="g-recaptcha-response"]'];

		document.querySelectorAll(hiddenSystemSelectors.join(",")).forEach((el) => {
			el.setAttribute("aria-hidden", "true");
			utils.reportUpdate(el, ENH_NAME, `(${WCAG}) - Hidden non-interactive element`, debug);
		});

		// ------------------------------------------------------------
		// 1. Fill empty labels using legend text
		// ------------------------------------------------------------
		const fields = document.querySelectorAll("fieldset.form-item.field, fieldset.form-item.fields");
		fields.forEach((fieldset) => {
			// Squarespace often places the visible field name inside the legend.
			// We use this only when the input does not already have an ARIA name.
			const legend = fieldset.querySelector("legend span:not(.description), legend");

			// Target the existing label only when it is empty.
			// This avoids overwriting labels that already contain useful text.
			const label = fieldset.querySelector("label");

			// Text Squarespace displays as the field title, usually inside the legend.
			const legendText = legend ? (legend.textContent || "").trim() : "";

			// Existing label text. If this has content, no repair is needed.
			const labelText = label ? (label.textContent || "").trim() : "";

			// The form control associated with this Squarespace field wrapper.
			const input = fieldset.querySelector("input, textarea, select");

			// Squarespace may already name the control with ARIA.
			// If so, adding legend text to the empty label can create duplicate output.
			const hasAriaName =
				input && (input.hasAttribute("aria-label") || input.hasAttribute("aria-labelledby"));

			if (legend && label && legendText && !labelText && !hasAriaName) {
				label.textContent = legendText;
				label.classList.add("sqs-a11y-sr-only");

				utils.reportUpdate(
					label,
					ENH_NAME,
					`(${WCAG}) - Filled empty label using legend - "${legendText}"`,
					debug,
				);
			}
		});

		// ------ add css for sr-only content
		utils.injectStyleOnce(
			"sqs-a11y-sr-only-style",
			"head",
			`
			.sqs-a11y-sr-only {
				position: absolute !important;
				width: 1px !important;
				height: 1px !important;
				padding: 0 !important;
				margin: -1px !important;
				overflow: hidden !important;
				clip: rect(0 0 0 0) !important;
				white-space: nowrap !important;
				border: 0 !important;
			}
			`,
			debug,
		);

		// ------------------------------------------------------------
		// 2. Rebind labels missing valid input targets
		// ------------------------------------------------------------
		document.querySelectorAll("label[for]").forEach((label) => {
			const id = label.getAttribute("for");
			const input = document.getElementById(id);

			if (!input) {
				const fieldset = label.closest(".form-item, fieldset");
				if (fieldset) {
					const possible = fieldset.querySelector(
						"input:not([type='hidden']):not([type='submit']):not([type='button']):not([type='reset']):not([name*='g-recaptcha']), textarea:not([id^='g-recaptcha-response']), select",
					);
					if (possible && possible.id) {
						label.setAttribute("for", possible.id);
						utils.reportUpdate(
							label,
							ENH_NAME,
							`(${WCAG}) - Repaired label binding → #${possible.id}`,
							debug,
						);
					}
				}
			}
		});

		// ------------------------------------------------------------
		// 2.5. Repair Squarespace textarea aria-describedby error IDs
		// ------------------------------------------------------------
		// Squarespace may generate textarea validation errors with an ID pattern
		// that does not match the ID referenced by the textarea's aria-describedby.
		//
		// Example observed pattern:
		//   textarea aria-describedby="textarea-...-field-error"
		//   visible error id="textarea-...-error"
		//
		// When those values do not match, the error message may be visible on the
		// page but not programmatically associated with the textarea for assistive
		// technologies. This can prevent screen readers from announcing the field
		// error when the textarea receives focus.
		//
		// This repair checks textarea elements that already have aria-describedby,
		// verifies that each referenced ID exists, and when a missing ID follows
		// Squarespace's "-field-error" pattern, attempts to replace it with the
		// matching existing "-error" element.
		//
		// This supports:
		//   - WCAG 3.3.1 Error Identification
		//   - WCAG 3.3.2 Labels or Instructions
		//   - WCAG 4.1.2 Name, Role, Value
		//
		// This repair is intentionally narrow. It only changes broken textarea
		// error references when a matching visible error element can be found.
		document.querySelectorAll("textarea[aria-describedby]").forEach((textarea) => {
			const describedBy = textarea.getAttribute("aria-describedby");
			if (!describedBy) return;

			const ids = describedBy.split(/\s+/);

			const fixedIds = ids.map((id) => {
				if (document.getElementById(id)) return id;

				const fallbackId = id.replace("-field-error", "-error");

				if (fallbackId !== id && document.getElementById(fallbackId)) {
					utils.reportUpdate(
						textarea,
						ENH_NAME,
						`(${WCAG}) - Repaired textarea aria-describedby from #${id} to #${fallbackId}`,
						debug,
					);

					return fallbackId;
				}

				return id;
			});

			textarea.setAttribute("aria-describedby", fixedIds.join(" "));
		});

		// ------------------------------------------------------------
		// 3. Report remaining visible controls without accessible names
		// ------------------------------------------------------------
		// At this point, automatic repairs have already been attempted.
		// If a visible control still has no accessible name, do not guess.
		// Report it for developer review.
		document.querySelectorAll("input:not([type=hidden]), textarea, select").forEach((el) => {
			// --------------------------------------------------------
			// Skip elements that are not meaningfully exposed to users
			// --------------------------------------------------------

			// Hidden elements:
			// - el.hidden → explicitly hidden via HTML attribute
			// - aria-hidden="true" → removed from accessibility tree
			// - display:none or visibility:hidden via computed style
			// These should NOT be flagged because WCAG labeling rules apply
			// to user-perceivable controls, not hidden/system fields.
			const style = window.getComputedStyle(el);
			const isHidden =
				el.hidden ||
				el.getAttribute("aria-hidden") === "true" ||
				style.display === "none" ||
				style.visibility === "hidden";

			if (isHidden) return;

			// Known system-generated fields (e.g., reCAPTCHA):
			// These are injected by third-party scripts and often include
			// hidden or protected inputs that are intentionally not labeled.
			// Flagging them creates noise and cannot be fixed by developers.
			// Skip known system / bot-detection fields
			// - reCAPTCHA fields
			// - Honeypot fields (often:
			//   • autocomplete="new-password"
			//   • tabindex="-1" (not keyboard reachable)
			//   • randomized name/id patterns
			// These are intentionally hidden from users and should not be labeled.
			if (
				el.name?.includes("g-recaptcha") ||
				(el.getAttribute("autocomplete") === "new-password" && el.getAttribute("tabindex") === "-1")
			)
				return;

			// --------------------------------------------------------
			// Determine if the element is properly labeled
			// --------------------------------------------------------

			// WCAG allows multiple ways to provide an accessible name:
			// - <label for="...">
			// - wrapping <label>
			// - aria-label
			// - aria-labelledby

			// get an explicit label if it exists
			const hasExplicitLabel = Array.from(document.querySelectorAll("label[for]")).some((label) => {
				return label.getAttribute("for") === el.id;
			});

			// test to see if any type of label is available
			const hasLabel =
				(el.id && hasExplicitLabel) ||
				el.closest("label") ||
				el.hasAttribute("aria-label") ||
				el.hasAttribute("aria-labelledby");

			// --------------------------------------------------------
			// Flag only true accessibility issues
			// --------------------------------------------------------

			if (!hasLabel) {
				utils.reportUpdate(el, ENH_NAME, `(${WCAG}) - Input without label detected →`, debug);
			}
		});

		// ------------------------------------------------------------
		// Report Fix
		// ------------------------------------------------------------
		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement complete.`, debug);
	};
})(window, document);
