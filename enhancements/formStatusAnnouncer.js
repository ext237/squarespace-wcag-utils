/**
 * Squarespace Accessibility Enhancement – formStatusAnnouncer.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * Related WCAG Criteria:
 *   - 4.1.3 Status Messages
 *
 * Description:
 *   Attempts to identify Squarespace form error or success messages as they
 *   appear and announce them through hidden ARIA live regions. Uses an
 *   assertive alert region for likely errors and a polite status region for
 *   likely successful submissions.
 *
 * Squarespace Context:
 *   - Intended for common Squarespace 7.0 and 7.1 form patterns.
 *   - Reviews dynamically injected form error and success message nodes.
 *   - Attempts to reduce duplicate announcements.
 *   - Makes no intended visual changes.
 *   - Can run after AJAX loads or delayed form rendering.
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

	window.sqsA11y.enhancements.formStatusAnnouncer = function (options = {}) {
		const debug = !!options.debug;

		const utils = window.sqsA11y.utils || {};

		const ENH_NAME = options.name || "Form Status Message Announcer applied";
		const WCAG = options.wcag;

		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement called.`, debug);

		// Inject the shared visually-hidden utility class once.
		// This keeps live regions available to assistive technology
		// without changing the visual layout of the page.
		if (document.getElementById("sqs-a11y-form-status-style")) {
			utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - fix already ran.`, debug);
		} else {
			const FORM_STATUS_CSS = `
				.sqs-a11y-form-status-style {
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
			`;
			utils.injectStyleOnce("sqs-a11y-form-status-style", "head", FORM_STATUS_CSS, debug);
		}

		// Creates or reuses a hidden live region.
		// Error messages use role="alert" with assertive timing.
		// Success messages use role="status" with polite timing.
		function getLiveRegion(id, role, ariaLive) {
			let region = document.getElementById(id);

			if (!region) {
				region = document.createElement("div");
				region.id = id;
				region.setAttribute("role", role);
				region.setAttribute("aria-live", ariaLive);
				region.setAttribute("aria-atomic", "true");
				region.className = "sqs-a11y-form-status-style";
				region.textContent = "";
				document.body.appendChild(region);
			}

			return region;
		}

		const errorAnnouncer = getLiveRegion("acc-form-error-live-region", "alert", "assertive");

		const successAnnouncer = getLiveRegion("acc-form-success-live-region", "status", "polite");

		const announceTimers = {
			error: null,
			status: null,
		};

		// Normalizes message text so SVG/icon markup and spacing do not create noisy output.
		function getCleanText(el) {
			return el?.textContent?.replace(/\s+/g, " ").trim() || "";
		}

		// Finds the main Squarespace form-level error summary.
		// Field-level errors are usually inside label or .form-item containers,
		// so those are intentionally skipped for the live announcement.
		function getFormErrorSummary(node) {
			const form = node.closest?.("form") || node.querySelector?.("form");

			if (!form) return null;

			const errorMessages = Array.from(form.querySelectorAll(".form-field-error"));

			return (
				errorMessages.find((el) => {
					return !el.closest("label") && !el.closest(".form-item");
				}) || null
			);
		}

		// Announces a form status message.
		// Clearing the region first helps screen readers announce
		// repeated identical messages, such as multiple failed submissions.
		function announce(message, type = "status") {
			const region = type === "error" ? errorAnnouncer : successAnnouncer;

			clearTimeout(announceTimers[type]);
			region.textContent = "";

			announceTimers[type] = setTimeout(() => {
				region.textContent = message;

				utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Announced "${message}"`, debug);
			}, 100);
		}

		// Observe DOM changes for Squarespace form feedback messages.
		// This checks both newly added nodes and text updates inside existing nodes.
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((m) => {
				const nodesToCheck = [];

				// Squarespace may inject a full error/success message node.
				m.addedNodes.forEach((node) => {
					if (node instanceof HTMLElement) {
						nodesToCheck.push(node);
					}
				});

				// Squarespace may also update the text inside an existing message node.
				if (m.type === "characterData" && m.target.parentElement) {
					nodesToCheck.push(m.target.parentElement);
				}

				nodesToCheck.forEach((node) => {
					// Error messages added by Squarespace after a failed form submission.
					// Only announce the main form-level summary. Field-level errors are already
					// associated with their inputs and should not each trigger a live announcement.
					if (node.matches(".form-field-error") || node.querySelector?.(".form-field-error")) {
						const summaryError = getFormErrorSummary(node);

						const isSummaryError =
							summaryError && (node === summaryError || node.contains(summaryError));

						if (isSummaryError) {
							const summaryText = getCleanText(summaryError);

							if (summaryText) {
								announce(summaryText, "error");

								utils.reportUpdate(
									summaryError,
									ENH_NAME,
									`(${WCAG}) - Announced form-level error summary. ${summaryText}`,
									debug,
								);
							}
						}
					}

					// Success messages added by Squarespace after a completed form submission.
					if (
						node.matches(".form-submission-text") ||
						node.querySelector?.(".form-submission-text")
					) {
						announce("Form submitted successfully.", "status");
						utils.reportUpdate(node, ENH_NAME, `(${WCAG}) - Announced form success.`, debug);
					}
				});
			});
		});

		// Attach observer once, even if this fix is called again after
		// Squarespace AJAX page transitions.
		if (!window._accFormAnnounceObserverAttached) {
			window._accFormAnnounceObserverAttached = true;
			observer.observe(document.body, {
				childList: true,
				subtree: true,
				characterData: true,
			});

			utils.reportUpdate(document.body, ENH_NAME, `(${WCAG}) - Mutation observer active.`, debug);
		}
		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement complete.`, debug);

	};
})(window, document);
