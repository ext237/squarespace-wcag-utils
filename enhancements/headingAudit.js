/**
 * Squarespace Accessibility Enhancement – headingAudit.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * Related WCAG Criteria:
 *   - 1.3.1 Info and Relationships
 *   - 2.4.6 Headings and Labels
 *
 * Description:
 *   Reviews heading structure and reports potential issues, such as multiple
 *   `<h1>` elements, missing `<h1>` elements, or skipped heading levels.
 *
 * Squarespace Context:
 *   - Intended for common Squarespace 7.0 and 7.1 page structures.
 *   - Provides developer-facing warnings for review.
 *   - Does not modify the DOM.
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

// TODO: Consider whether heading audits should distinguish primary page content
// from repeated global areas such as headers, footers, navigation, and injected
// widgets. A full-page heading scan may report useful warnings, but it can also
// create false positives on complex Squarespace layouts.

(function (window, document) {
	window.sqsA11y = window.sqsA11y || {};
	window.sqsA11y.enhancements = window.sqsA11y.enhancements || {};

	window.sqsA11y.enhancements.headingAudit = function (options = {}) {
		const debug = options.debug || false;
		const utils = window.sqsA11y.utils || {};
		const ENH_NAME = options.name;
		const WCAG = options.wcag;

		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement called.`, debug);

		const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));

		if (!headings.length) {
			utils.reportUpdate(
				null,
				ENH_NAME,
				`(${WCAG}) No headings (H1-H6) elements found on this page.`,
				debug,
			);
		}

		let h1Count = 0;
		let lastLevel = 0;

		headings.forEach((el, index) => {
			const level = parseInt(el.tagName.substring(1), 10);

			if (level === 1) h1Count++;

			// Detect skipped levels (e.g., H2 → H4)
			if (lastLevel && level > lastLevel + 1) {
				utils.reportUpdate(
					null,
					ENH_NAME,
					`(${WCAG}) Skipped heading level: H${lastLevel} → H${level}`,
					debug,
				);
			}

			lastLevel = level;
		});

		// H1 checks
		if (h1Count === 0) {
			utils.reportUpdate(null, ENH_NAME, `(${WCAG}) No <h1> elements found.`, debug);
		}

		if (h1Count > 1) {
			utils.reportUpdate(null, ENH_NAME, `(${WCAG}) Multiple <h1> elements found (${h1Count}).`, debug);
		}

		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement complete.`, debug);

	};
})(window, document);
