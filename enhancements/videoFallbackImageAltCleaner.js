/**
 * Squarespace Accessibility Enhancement – videoFallbackImageAltCleaner.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * Related WCAG Criteria:
 *   - 1.1.1 Non-text Content
 *
 * Description:
 *   Clears alt text from Squarespace video fallback images when those images
 *   are used as decorative poster/fallback images for video backgrounds.
 *
 * Squarespace Context:
 *   - Intended for common Squarespace 7.0 and 7.1 video background patterns.
 *   - Squarespace may output fallback images with unhelpful filename-based
 *     alt text, such as "Screenshot 2024-04-12 at 3.52.47 PM.png".
 *   - These fallback images are decorative when paired with a background video
 *     and should not be announced by assistive technology.
 *
 * Dependencies:
 *   - utils.reportUpdate()
 *
 * Notes:
 *   This enhancement supports accessibility review and remediation work.
 *   It does not guarantee WCAG compliance on its own.
 */

(function (window, document) {
	window.sqsA11y = window.sqsA11y || {};
	window.sqsA11y.enhancements = window.sqsA11y.enhancements || {};

	window.sqsA11y.enhancements.videoFallbackImageAltCleaner = function (options = {}) {
		const debug = options.debug || false;

		const utils = window.sqsA11y.utils || {};

		const ENH_NAME = options.name;
		const WCAG = options.wcag;

		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement called.`, debug);

		/**
		 * cleanVideoFallbackImageAlt()
		 * ------------------------------------------------------------
		 * Clears alt text from decorative Squarespace video fallback images.
		 *
		 * Returns {updated, skipped}.
		 */
		function cleanVideoFallbackImageAlt(img) {
			if (!img || !(img instanceof Element)) return { updated: 0, skipped: 1 };

			const HAS_RUN_MARK = "videoFallbackAltCleaned";
			if (img.dataset[HAS_RUN_MARK] === "1") return { updated: 0, skipped: 1 };

			const currentAlt = img.getAttribute("alt");

			if (currentAlt !== "") {
				img.setAttribute("alt", "");
				img.dataset[HAS_RUN_MARK] = "1";
				return { updated: 1, skipped: 0 };
			}

			img.dataset[HAS_RUN_MARK] = "1";
			return { updated: 0, skipped: 1 };
		}

		/**
		 * cleanVideoFallbackImages()
		 * ------------------------------------------------------------
		 * Finds Squarespace video background fallback images and clears
		 * decorative alt text.
		 */
		function cleanVideoFallbackImages() {
			const fallbackImages = document.querySelectorAll(
				'.sqs-video-background img.custom-fallback-image'
			);

			let updated = 0;
			let skipped = 0;

			fallbackImages.forEach((img) => {
				const result = cleanVideoFallbackImageAlt(img);
				updated += result.updated;
				skipped += result.skipped;
			});

			utils.reportUpdate(
				null,
				ENH_NAME,
				`(${WCAG}) - ${updated} fallback image alt attribute(s) cleaned`,
				debug
			);

			return { updated, skipped };
		}

		cleanVideoFallbackImages();

		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement complete.`, debug);
	};
})(window, document);