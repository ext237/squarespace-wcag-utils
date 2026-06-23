/**
 * Squarespace Accessibility Enhancement – targetSizeMinimum.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * Related WCAG Criteria:
 *   - 2.5.8 Target Size (Minimum)
 *
 * Description:
 *   Applies a JavaScript-based enhancement for interactive elements that may
 *   appear smaller than the recommended 24x24px minimum target size.
 *
 * Squarespace Context:
 *   - Intended for common Squarespace 7.0 and 7.1 patterns.
 *   - Attempts to improve target sizing while avoiding visible layout shifts
 *     in headers, navigation areas, and image link blocks.
 *
 * Dependencies:
 *   - sqsA11y-utils
 *
 * Notes:
 *   This enhancement supports accessibility review and remediation work.
 *   It does not guarantee WCAG compliance on its own.
 */

(function (window, document) {
	window.sqsA11y = window.sqsA11y || {};
	window.sqsA11y.enhancements = window.sqsA11y.enhancements || {};

	window.sqsA11y.enhancements.targetSizeMinimum = function (options = {}) {
		const debug = !!options.debug;
		const utils = window.sqsA11y.utils || {};
		const ENH_NAME = options.name;
		const WCAG = options.wcag;

		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement called.`, debug);

		// Skip if already injected
		if (document.getElementById("sqs-a11y-target-size-css")) {
			utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - fix already ran.`, debug);
		} else {
			// --------------------------------------------------------------------
			// Define CSS separately for readability & maintenance
			// --------------------------------------------------------------------
			const TARGET_SIZE_CSS = `
				/* 1. Give all interactive elements a 24x24 target area */
				a,
				button,
				[type="button"],
				[type="submit"] {
					min-width: 24px !important;
					min-height: 24px !important;
				}

				/* 2. Center text links & buttons, NOT nav or image links */
				a:not(.Header-nav-item):not(.Header-nav-folder-title):not(.Header-nav-folder-item)
				:not(.sqs-block-image-link):not(.summary-thumbnail-container):not(.image-slide-anchor)
				:not([data-animation-role="image"]):not(:has(img, picture, svg, video)),
				button,
				[type="button"],
				[type="submit"],
				.sqs-block-button-element {
					display: inline-flex !important;
					align-items: center !important;
					justify-content: center !important;
					vertical-align: middle !important;
				}

				/* WCAG alignment fix — allow focus outlines to sit correctly */
				.Header-nav {
					line-height: unset !important;
				}

				/* 5. WCAG alignment correction — image card buttons only */
				.image-button-inner > a.sqs-button-element--primary {
					align-items: center !important;
					justify-content: center !important;
					display: inline-flex !important;
				}
			`;

			// --------------------------------------------------------------------
			// Inject once (uses utils if available)
			// --------------------------------------------------------------------
			utils.injectStyleOnce("sqs-a11y-target-size-css", "a,button", TARGET_SIZE_CSS, debug);

			// Trace for documentation
			utils.reportUpdate(document.body, ENH_NAME, `(${WCAG}) - Minimum Target Size applied`, debug);
		}
		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement complete.`, debug);

	};
})(window, document);
