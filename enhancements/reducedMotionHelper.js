/**
 * Squarespace Accessibility Utilities – reducedMotionHelper.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * WCAG References:
 *   2.2.2 – Pause, Stop, Hide
 *   2.3.3 – Animation from Interactions
 *
 * Description:
 *   Reduces decorative motion for users who have enabled
 *   prefers-reduced-motion: reduce.
 *
 * Behavior:
 *   • Only runs when the user's browser/OS requests reduced motion.
 *   • Neutralizes Squarespace parallax transforms where possible.
 *   • Hides decorative background video iframes while preserving fallback images.
 *   • Does not affect users who have not requested reduced motion.
 */

// TODO: Retest the early reduced-motion check. The code reports that no
// changes were applied when prefers-reduced-motion is not active, but it does
// not return, so styles are still injected and elements are still marked.

// TODO: Check the injectStyleOnce() call signature. The
// selector argument is currently unused. Consider using it as the target for the style injection or remove it if unnecessary.

(function (window, document) {
	"use strict";

	window.sqsA11y = window.sqsA11y || {};
	window.sqsA11y.enhancements = window.sqsA11y.enhancements || {};

	window.sqsA11y.enhancements.reducedMotionHelper = function (options = {}) {
		const debug = options.debug || false;
		const utils = window.sqsA11y.utils || {};
		const ENH_NAME = options.name || "Reduced motion helper applied";
		const WCAG = options.wcag || "WCAG 2.2.2, 2.3.3";

		const STYLE_ID = "sqs-a11y-reduced-motion-helper-style";
		const REDUCE_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

		const reduceMotion = window.matchMedia && window.matchMedia(REDUCE_MOTION_QUERY).matches;

		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement called.`, debug);

		if (!reduceMotion) {
			utils.reportUpdate(
				null,
				ENH_NAME,
				`(${WCAG}) - user seems to prefer no reduced motion. No changes applied.`,
				debug,
			);
			return;
		}

		function injectReducedMotionStyles() {
			if (typeof utils.injectStyleOnce !== "function") return;

			utils.injectStyleOnce(
				STYLE_ID,
				"[data-sqs-a11y-reduced-motion]",
				`
				@media (prefers-reduced-motion: reduce) {
					[data-parallax-item],
					[data-parallax-image-wrapper] {
						transform: none !important;
						transition: none !important;
						animation: none !important;
					}

					.sqs-video-background iframe.background-video,
					.sqs-video-background iframe#vimeoplayer {
						display: none !important;
					}

					.sqs-video-background img.custom-fallback-image,
					.sqs-video-background img[data-image] {
						display: block !important;
						opacity: 1 !important;
						visibility: visible !important;
					}
				}
			`,
				debug,
			);
		}

		function markParallaxElements() {
			const parallaxElements = document.querySelectorAll(
				"[data-parallax-item], [data-parallax-image-wrapper]",
			);

			parallaxElements.forEach((el) => {
				el.setAttribute("data-sqs-a11y-reduced-motion", "parallax-neutralized");

				utils.reportUpdate(
					el,
					ENH_NAME,
					`(${WCAG}) - Reduced parallax motion for user preference.`,
					debug,
				);
			});
		}

		function markBackgroundVideos() {
			const videos = document.querySelectorAll(
				".sqs-video-background iframe.background-video, .sqs-video-background iframe#vimeoplayer",
			);

			videos.forEach((iframe) => {
				iframe.setAttribute("data-sqs-a11y-reduced-motion", "background-video-hidden");

				utils.reportUpdate(
					iframe,
					ENH_NAME,
					`(${WCAG}) - Hid decorative background video for user preference.`,
					debug,
				);
			});
		}

		injectReducedMotionStyles();
		markParallaxElements();
		markBackgroundVideos();

		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement complete.`, debug);
	};
})(window, document);
