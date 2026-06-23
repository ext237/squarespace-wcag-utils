/**
 * Squarespace Accessibility Enhancement – smoothAnchorScroll.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * Related WCAG Criteria:
 *   - 2.4.3 Focus Order
 *   - 2.4.1 Bypass Blocks
 *
 * Description:
 *   Enhances same-page anchor links so they smoothly scroll to the target
 *   element and then move keyboard focus to that target.
 *
 * Squarespace Context:
 *   - Intended for common Squarespace 7.0 and 7.1 page patterns.
 *   - Helps prevent abrupt page jumps when same-page anchor links are clicked.
 *   - Ensures keyboard focus follows the visual scroll position.
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

	window.sqsA11y.enhancements.smoothAnchorScrollFocus = function (options = {}) {
		const debug = options.debug || false;

		const utils = window.sqsA11y.utils || {};

		const ENH_NAME = options.name;
		const WCAG = options.wcag;

		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement called.`, debug);

		/**
		 * prefersReducedMotion()
		 * ------------------------------------------------------------
		 * Returns true if the visitor has requested reduced motion.
		 */
		function prefersReducedMotion() {
			return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		}

		/**
		 * getSamePageAnchorTarget()
		 * ------------------------------------------------------------
		 * Returns the matching target element for a same-page anchor link.
		 */
		function getSamePageAnchorTarget(link) {
			if (!link || !(link instanceof HTMLAnchorElement)) return null;

			const href = link.getAttribute("href");
			if (!href || href === "#" || !href.startsWith("#")) return null;

			const anchorName = decodeURIComponent(href.slice(1));
			if (!anchorName) return null;

			let target = null;

			if (window.CSS && typeof window.CSS.escape === "function") {
				const safeName = window.CSS.escape(anchorName);
				target = document.querySelector(`#${safeName}, [name="${safeName}"]`);
			} else {
				target =
					document.getElementById(anchorName) || document.querySelector(`[name="${anchorName}"]`);
			}

			return target;
		}

		/**
		 * focusTarget()
		 * ------------------------------------------------------------
		 * Moves focus to the target element.
		 *
		 * If the target is not naturally focusable, temporarily adds tabindex="-1".
		 */
		function focusTarget(target) {
			if (!target || !(target instanceof Element)) return;

			const naturallyFocusable = target.matches(
				'a[href], button, input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])',
			);

			if (!naturallyFocusable && !target.hasAttribute("tabindex")) {
				target.setAttribute("tabindex", "-1");
				target.dataset.smoothAnchorTempTabindex = "1";
			}

			target.focus({ preventScroll: true });
		}

		/**
		 * attachSmoothAnchorScroll()
		 * ------------------------------------------------------------
		 * Adds the click handler to a qualifying same-page anchor link.
		 */
		function attachSmoothAnchorScroll(link) {
			if (!link || !(link instanceof HTMLAnchorElement)) return { updated: 0, skipped: 1 };

			const HAS_RUN_MARK = "smoothAnchorScrollAttached";
			if (link.dataset[HAS_RUN_MARK] === "1") return { updated: 0, skipped: 1 };

			const target = getSamePageAnchorTarget(link);
			if (!target) return { updated: 0, skipped: 1 };

			link.addEventListener("click", function (event) {
				const target = getSamePageAnchorTarget(link);
				if (!target) return;

				event.preventDefault();

				const behavior = prefersReducedMotion() ? "auto" : "smooth";

				target.scrollIntoView({
					behavior: behavior,
					block: "start",
					inline: "nearest",
				});

				// Update the URL hash without triggering the browser's default jump.
				if (history.pushState) {
					history.pushState(null, "", link.hash);
				} else {
					window.location.hash = link.hash;
				}

				// Let scrolling begin before moving focus.
				window.setTimeout(
					function () {
						focusTarget(target);
					},
					behavior === "smooth" ? 300 : 0,
				);
			});

			link.dataset[HAS_RUN_MARK] = "1";
			return { updated: 1, skipped: 0 };
		}

		/**
		 * enhanceSamePageAnchorLinks()
		 * ------------------------------------------------------------
		 * Finds same-page anchor links and attaches smooth scrolling behavior.
		 */
		function enhanceSamePageAnchorLinks() {
			const links = document.querySelectorAll('a[href*="#"]');

			let updated = 0;
			let skipped = 0;

			links.forEach((link) => {
				const result = attachSmoothAnchorScroll(link);
				updated += result.updated;
				skipped += result.skipped;
			});

			utils.reportUpdate(
				null,
				ENH_NAME,
				`(${WCAG}) - ${updated} same-page anchor link(s) enhanced`,
				debug,
			);

			return { updated, skipped };
		}

		enhanceSamePageAnchorLinks();

		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement complete.`, debug);
	};
})(window, document);
