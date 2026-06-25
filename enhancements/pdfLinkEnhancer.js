/**
 * Squarespace Accessibility Enhancement – pdfLinkEnhancer.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * Related WCAG Criteria:
 *   - 2.4.4 Link Purpose (In Context) - Provides PDF file context for PDF links.
 *   - 2.4.6 Headings and Labels - Updates descriptive aria-label values when present.
 *   - 3.2.5 Change on Request - Discloses when PDF links open in a new window or tab.
 *   - 4.1.2 Name, Role, Value - Adds hidden text to PDF links for screen readers.
 *
 * Description:
 *   Attempts to improve PDF link clarity by adding screen-reader-only context
 *   to text-based PDF links when one is not already present. If a PDF link
 *   appears to open in a new tab, this enhancement may also add hidden text
 *   to disclose that behavior before activation.
 *
 * Squarespace Context:
 *   - Intended for common Squarespace 7.0 and 7.1 PDF link patterns.
 *   - Reviews text links inside summary blocks, text blocks, buttons, and footers.
 *   - Skips image-only and icon-only PDF links to avoid guessing link purpose.
 *   - Can run after AJAX loads or delayed content rendering.
 *
 * Dependencies:
 *   - sqsA11y-utils
 *   - utils.injectStyleOnce()
 *   - utils.reportUpdate()
 *
 * Notes:
 *   This enhancement supports accessibility review and remediation work.
 *   It does not guarantee WCAG compliance on its own.
 */

 // TODO: need to check which is more correct: "opens in a new window" or "opens in a new tab" for WCAG 2.4.4 and 3.2.5.
 // The WCAG examples use "window" but most users will see "tab" in their browser.

(function (window, document) {
	window.sqsA11y = window.sqsA11y || {};
	window.sqsA11y.enhancements = window.sqsA11y.enhancements || {};

	window.sqsA11y.enhancements.pdfLinkEnhancer = function (options = {}) {
		const debug = !!options.debug;
		const utils = window.sqsA11y.utils || {};

		const ENH_NAME = options.name || "pdfLinkEnhancer";
		const WCAG = options.wcag || "WCAG 2.4.4, 2.4.6, 3.2.5, 4.1.2";

		if (utils.reportUpdate) {
			utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement called.`, debug);
		}

		if (!utils.injectStyleOnce) {
			if (utils.reportUpdate) {
				utils.reportUpdate(
					null,
					ENH_NAME,
					`(${WCAG}) - utils.injectStyleOnce() not found. Enhancement stopped.`,
					debug,
				);
			}
			return;
		}

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

		const pdfLinks = document.querySelectorAll('a[href*=".pdf" i]');
		let repairedCount = 0;

		pdfLinks.forEach((link) => {
			// Prevent the same link from being processed more than once.
			if (link.dataset.pdfEnhanceInit === "true") {
				return;
			}

			link.dataset.pdfEnhanceInit = "true";

			// Use visible link text only. Image/icon-only links need human-written context.
			const linkText = (link.innerText || "").trim();

			if (!linkText) {
				if (utils.reportUpdate) {
					utils.reportUpdate(
						link,
						ENH_NAME,
						`(${WCAG}) - Skipped PDF link with no readable text.`,
						debug,
					);
				}
				return;
			}

			const href = link.getAttribute("href") || "";
			const opensNewTab = (link.getAttribute("target") || "").toLowerCase() === "_blank";

			// Check both visible text and existing accessible text to avoid duplicates.
			const accessibleText =
				`${link.textContent || ""} ${link.getAttribute("aria-label") || ""}`.trim();

			const alreadyMentionsPdf = /\bpdf\b/i.test(accessibleText);
			const alreadyMentionsNewTab = /opens?\s+in\s+a\s+new\s+(tab|window)|new\s+(tab|window)/i.test(
				accessibleText,
			);

			const hiddenParts = [];

			if (!alreadyMentionsPdf) {
				hiddenParts.push("PDF file");
			}

			if (opensNewTab && !alreadyMentionsNewTab) {
				hiddenParts.push("opens in a new window");
			}

			if (!hiddenParts.length) {
				return;
			}

			const srText = `, ${hiddenParts.join(" ")}`;

			// If another enhancement has already supplied an aria-label, update that label too.
			// Otherwise, the aria-label may override the hidden span text for screen readers.
			const existingAriaLabel = (link.getAttribute("aria-label") || "").trim();

			if (existingAriaLabel) {
				const ariaAddition = hiddenParts.join(", ");
				link.setAttribute("aria-label", `${existingAriaLabel}, ${ariaAddition}`);
			}

			const span = document.createElement("span");
			span.className = "sqs-a11y-sr-only";
			span.textContent = srText;

			link.appendChild(span);
			repairedCount++;

			if (utils.reportUpdate) {
				utils.reportUpdate(
					link,
					ENH_NAME,
					`(${WCAG}) - Added screen-reader-only PDF link context: "${srText.trim()}" for ${href}`,
					debug,
				);
			}
		});

		if (utils.reportUpdate) {
			utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - ${repairedCount} PDF link(s) updated.`, debug);
		}
	};
})(window, document);
