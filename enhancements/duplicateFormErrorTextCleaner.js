/**
 * Squarespace Accessibility Enhancement - duplicateFormErrorTextCleaner.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * Related WCAG Criteria:
 *   - 3.3.1 Error Identification - Preserves visible and programmatic form error messages.
 *   - 3.3.2 Labels or Instructions - Prevents Squarespace error text from being repeated as label text.
 *   - 4.1.2 Name, Role, Value - Keeps the input name and error description programmatically distinct.
 *
 * Description:
 *   Prevents duplicate screen reader announcements when Squarespace places
 *   form error text inside a label and also references that same error with
 *   aria-describedby.
 *
 * Squarespace Context:
 *   - Squarespace may inject form errors after a failed form submission.
 *   - Error messages may be placed inside the associated <label>.
 *   - The same error message may also be referenced by aria-describedby.
 *   - Some screen reader/browser combinations may announce the error twice.
 *
 * Behavior:
 *   - Watches Squarespace forms for submitted error states.
 *   - Finds controls with aria-invalid="true" and visible form errors.
 *   - If error text is inside the control label, applies a clean aria-label.
 *   - Keeps the visible error message available.
 *   - Keeps aria-describedby available.
 *   - Does not remove labels, error messages, or required states.
 *
 * Dependencies:
 *   - sqsA11y-utils
 *   - utils.reportUpdate()
 */

(function (window, document) {
	"use strict";

	window.sqsA11y = window.sqsA11y || {};
	window.sqsA11y.enhancements = window.sqsA11y.enhancements || {};

	window.sqsA11y.enhancements.duplicateFormErrorTextCleaner = function (options = {}) {
		const debug = options.debug || false;
		const utils = window.sqsA11y.utils || {};
		const ENH_NAME = options.name;
		const WCAG = options.wcag;

		const HAS_RUN_MARK = "duplicateFormErrorTextCleaned";
		const CLEAN_LABEL_ATTR = "data-sqs-a11y-clean-error-label";

		let runQueued = false;

		/**
		 * getControlSelector()
		 * ------------------------------------------------------------
		 * Returns the selector for supported form controls.
		 */
		function getControlSelector() {
			return "input, select, textarea";
		}

		/**
		 * getVisibleText()
		 * ------------------------------------------------------------
		 * Gets readable text while ignoring hidden utility content.
		 */
		function getVisibleText(el) {
			if (!el || !(el instanceof Element)) return "";

			const clone = el.cloneNode(true);

			clone
				.querySelectorAll("svg, .form-field-error, .description.required, [aria-hidden='true']")
				.forEach((node) => {
					node.remove();
				});

			return clone.textContent.replace(/\s+/g, " ").trim();
		}

		/**
		 * getLabelForControl()
		 * ------------------------------------------------------------
		 * Finds the label associated with a control.
		 */
		function getLabelForControl(control) {
			if (!control || !(control instanceof Element)) return null;

			if (control.id) {
				const escapedId =
					typeof CSS !== "undefined" && typeof CSS.escape === "function"
						? CSS.escape(control.id)
						: control.id.replace(/"/g, '\\"');

				const label = document.querySelector(`label[for="${escapedId}"]`);

				if (label) return label;
			}

			return control.closest("label");
		}

		/**
		 * getDescribedByElements()
		 * ------------------------------------------------------------
		 * Returns elements referenced by aria-describedby.
		 */
		function getDescribedByElements(control) {
			if (!control || !(control instanceof Element)) return [];

			const ids = (control.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean);

			return ids.map((id) => document.getElementById(id)).filter((el) => el instanceof Element);
		}

		/**
		 * findErrorInsideLabel()
		 * ------------------------------------------------------------
		 * Finds a Squarespace form error inside the label.
		 */
		function findErrorInsideLabel(label) {
			if (!label || !(label instanceof Element)) return null;

			return label.querySelector(".form-field-error");
		}

		/**
		 * hasRelatedDescribedError()
		 * ------------------------------------------------------------
		 * Checks whether the control already points to an error message.
		 */
		function hasRelatedDescribedError(control, labelError) {
			if (!control || !(control instanceof Element)) return false;

			const describedElements = getDescribedByElements(control);

			if (describedElements.includes(labelError)) return true;

			const labelErrorText = (labelError.textContent || "").replace(/\s+/g, " ").trim();

			if (!labelErrorText) return false;

			return describedElements.some((el) => {
				const text = (el.textContent || "").replace(/\s+/g, " ").trim();

				return text && text === labelErrorText;
			});
		}

		/**
		 * controlHasErrorState()
		 * ------------------------------------------------------------
		 * Checks whether a control is currently in an error state.
		 */
		function controlHasErrorState(control) {
			if (!control || !(control instanceof Element)) return false;

			return (
				control.getAttribute("aria-invalid") === "true" ||
				!!control.closest(".field, .form-item")?.querySelector(".form-field-error")
			);
		}

		/**
		 * cleanControlErrorLabel()
		 * ------------------------------------------------------------
		 * Applies a clean aria-label when Squarespace error text is duplicated.
		 */
		function cleanControlErrorLabel(control) {
			if (!control || !(control instanceof Element)) return;

			if (control.dataset[HAS_RUN_MARK] === "1") return;

			if (!controlHasErrorState(control)) return;

			const label = getLabelForControl(control);

			if (!label) return;

			const labelError = findErrorInsideLabel(label);

			if (!labelError) return;

			if (!hasRelatedDescribedError(control, labelError)) return;

			if (control.hasAttribute("aria-label")) {
				control.dataset[HAS_RUN_MARK] = "1";
				return;
			}

			const cleanLabelText = getVisibleText(label);

			if (!cleanLabelText) return;

			control.setAttribute("aria-label", cleanLabelText);
			control.setAttribute(CLEAN_LABEL_ATTR, "1");
			control.dataset[HAS_RUN_MARK] = "1";

			if (typeof utils.reportUpdate === "function") {
				utils.reportUpdate(
					control,
					ENH_NAME,
					`(${WCAG}) Added a clean aria-label to prevent duplicate Squarespace form error announcements.`,
					debug,
				);
			}
		}

		/**
		 * runCleaner()
		 * ------------------------------------------------------------
		 * Finds submitted Squarespace form errors and repairs duplicated names.
		 */
		function runCleaner() {
			const controls = Array.from(document.querySelectorAll(getControlSelector()));

			controls.forEach((control) => {
				cleanControlErrorLabel(control);
			});
		}

		/**
		 * queueRun()
		 * ------------------------------------------------------------
		 * Throttles MutationObserver callbacks during Squarespace updates.
		 */
		function queueRun() {
			if (runQueued) return;

			runQueued = true;

			window.requestAnimationFrame(() => {
				runQueued = false;
				runCleaner();
			});
		}

		/**
		 * watchFormErrors()
		 * ------------------------------------------------------------
		 * Watches for Squarespace form errors injected after failed submit.
		 */
		function watchFormErrors() {
			const forms = Array.from(document.querySelectorAll("form.react-form-contents, form"));

			const targets = forms.length ? forms : [document.body];

			targets.forEach((target) => {
				const observer = new MutationObserver(queueRun);

				observer.observe(target, {
					childList: true,
					subtree: true,
					attributes: true,
					attributeFilter: ["aria-invalid", "aria-describedby"],
				});
			});
		}

		/**
		 * bindSubmitListener()
		 * ------------------------------------------------------------
		 * Watches form submissions so post-submit validation errors can be cleaned.
		 */
		function bindSubmitListener() {
			document.addEventListener(
				"submit",
				(event) => {
					if (!event.target || !(event.target instanceof HTMLFormElement)) return;

					window.setTimeout(queueRun, 0);
					window.setTimeout(queueRun, 250);
					window.setTimeout(queueRun, 750);
				},
				true,
			);

			if (typeof utils.reportUpdate === "function") {
				utils.reportUpdate(
					null,
					ENH_NAME,
					`(${WCAG}) Form submit listener started. Waiting for Squarespace form validation errors.`,
					debug,
				);
			}
		}

		document.addEventListener(
			"submit",
			(event) => {
				if (!event.target || !(event.target instanceof HTMLFormElement)) return;

				window.setTimeout(queueRun, 0);
				window.setTimeout(queueRun, 250);
				window.setTimeout(queueRun, 750);
			},
			true,
		);

		runCleaner();
		watchFormErrors();
		bindSubmitListener();

	};
})(window, document);
