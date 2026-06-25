/**
 * Squarespace Accessibility Enhancement - parallaxImageAltCleaner.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * Related WCAG Criteria:
 *   - 1.1.1 Non-text Content
 *
 * Description:
 *   Clears filename-based alt text from decorative Squarespace 7.0 parallax
 *   index page images.
 *
 * Squarespace Context:
 *   - Intended for Squarespace 7.0 templates that use index page parallax images.
 *   - Squarespace may output decorative parallax images with unhelpful
 *     filename-based alt text, such as "image.jpg" or "background.png".
 *   - These images are typically decorative background-style images and should
 *     not be announced by assistive technology.
 *
 * Dependencies:
 *   - utils.reportUpdate()
 *
 * Notes:
 *   This enhancement supports accessibility review and remediation work.
 *   It does not guarantee WCAG compliance on its own.
 */

// TODO: Consider whether isFilenameAlt() should compare the alt value to the
// actual image filename, like filenameAltCleaner.js does, instead of clearing
// any alt text that merely ends with an image file extension.

// TODO: Consider adding a final summary report after all parallax images are
// processed.

(function (window, document) {
	window.sqsA11y = window.sqsA11y || {};
	window.sqsA11y.enhancements = window.sqsA11y.enhancements || {};

	window.sqsA11y.enhancements.parallaxImageAltCleaner = function (options = {}) {
		const debug = options.debug || false;

		const utils = window.sqsA11y.utils || {};

		const ENH_NAME = options.name;
		const WCAG = options.wcag;

		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement called.`, debug);

		/**
		 * isFilenameAlt()
		 * ------------------------------------------------------------
		 * Returns true when alt text appears to be only an image filename.
		 */
		function isFilenameAlt(alt) {
			if (!alt || typeof alt !== "string") return false;

			const value = alt.trim().toLowerCase();

			return (
				value.endsWith(".jpg") ||
				value.endsWith(".jpeg") ||
				value.endsWith(".png") ||
				value.endsWith(".webp") ||
				value.endsWith(".gif")
			);
		}

		/**
		 * cleanParallaxImageAlt()
		 * ------------------------------------------------------------
		 * Clears filename-based alt text from a decorative parallax image.
		 *
		 * Returns {updated, skipped}.
		 */
		function cleanParallaxImageAlt(img) {
			if (!img || !(img instanceof Element)) return { updated: 0, skipped: 1 };

			const HAS_RUN_MARK = "parallaxImageAltCleaned";
			if (img.dataset[HAS_RUN_MARK] === "1") return { updated: 0, skipped: 1 };

			const currentAlt = img.getAttribute("alt");

			if (isFilenameAlt(currentAlt)) {
				img.setAttribute("alt", "");
				img.dataset[HAS_RUN_MARK] = "1";
				return { updated: 1, skipped: 0 };
			}

			img.dataset[HAS_RUN_MARK] = "1";
			return { updated: 0, skipped: 1 };
		}

		/**
		 * cleanParallaxImageAlts()
		 * ------------------------------------------------------------
		 * Finds Squarespace 7.0 parallax index page images and clears
		 * decorative filename-based alt text.
		 */
		function cleanParallaxImageAlts() {
			const parallaxImages = document.querySelectorAll(".Index-page-image img[data-image]");

			let updated = 0;
			let skipped = 0;

			parallaxImages.forEach((img) => {
				const result = cleanParallaxImageAlt(img);
				updated += result.updated;
				skipped += result.skipped;

				utils.reportUpdate(
					img,
					ENH_NAME,
					`(${WCAG}) - ${updated} parallax image alt attribute(s) cleaned`,
					debug,
				);
			});

			return { updated, skipped };
		}

		cleanParallaxImageAlts();

	};
})(window, document);
