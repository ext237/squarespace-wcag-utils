/**
 * Squarespace Accessibility Utilities – focusNotObscured.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * WCAG References:
 *   2.4.11 – Focus Not Obscured (Minimum)
 *
 * Description:
 *   Helps prevent focused elements and anchor targets from being hidden
 *   behind sticky or fixed Squarespace headers, announcement bars, and
 *   navigation areas.
 *
 * Squarespace Context:
 *   • Works in Squarespace 7.0 and 7.1.
 *   • Useful for sticky headers, announcement bars, skip links, anchor links,
 *     and form validation focus changes.
 *   • Does not change normal page layout or visual spacing.
 *
 * Dependencies:
 *   • sqsA11y-utils
 *
 * TODO: This code has not been fully tested with both Squarespace 7.0 and 7.1 on all themes
 */

// TODO: Recheck whether this should observe header height or layout changes after
// page load. Sticky headers, announcement bars, mobile menus, or Squarespace AJAX
// updates may change the needed scroll-margin-top after the first run.

(function (window, document) {
	"use strict";

	window.sqsA11y = window.sqsA11y || {};
	window.sqsA11y.enhancements = window.sqsA11y.enhancements || {};

	window.sqsA11y.enhancements.focusNotObscured = function (options = {}) {
		const debug = !!options.debug;

		const utils = window.sqsA11y.utils || {};
		const ENH_NAME = options.name || "Focus-not-obscured offset applied";
		const WCAG = options.wcag || "WCAG 2.4.11";
		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement called.`, debug);

		const DEFAULT_OFFSET = 16;
		const MAX_OFFSET = 240;

		const TARGET_SELECTOR = [
			"main",
			"section[id]",
			"article[id]",
			"[data-section-id]",
			".sqs-block[id]",
			"a[name]",
			"input",
			"select",
			"textarea",
			"button",
			"a[href]",
			'[tabindex]:not([tabindex="-1"])',
		].join(",");

		const STICKY_SELECTOR = [
			"header",
			".Header",
			".header",
			"#header",
			".sqs-announcement-bar",
			".announcement-bar",
			".Mobile-bar",
			".Header-nav",
			".Header-inner",
		].join(",");

		function getUtils() {
			return window.sqsA11y && window.sqsA11y.utils ? window.sqsA11y.utils : {};
		}

		function isVisible(el) {
			if (!el || !(el instanceof HTMLElement)) return false;

			const style = window.getComputedStyle(el);
			const rect = el.getBoundingClientRect();

			return (
				style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0
			);
		}

		function isStickyOrFixed(el) {
			const style = window.getComputedStyle(el);

			return style.position === "fixed" || style.position === "sticky";
		}

		function isNearTop(el) {
			const rect = el.getBoundingClientRect();

			return rect.bottom > 0 && rect.top <= 120;
		}

		function getHeaderOffset() {
			const candidates = Array.from(document.querySelectorAll(STICKY_SELECTOR));

			let offset = 0;

			candidates.forEach((el) => {
				if (!isVisible(el)) return;
				if (!isStickyOrFixed(el)) return;
				if (!isNearTop(el)) return;

				const rect = el.getBoundingClientRect();
				offset = Math.max(offset, Math.ceil(rect.bottom));
			});

			if (!offset) return DEFAULT_OFFSET;

			return Math.min(offset + DEFAULT_OFFSET, MAX_OFFSET);
		}

		function applyScrollMargin(el, offset) {
			if (!el || !(el instanceof HTMLElement)) return;

			const existing = el.style.scrollMarginTop;

			if (existing === `${offset}px`) return;

			el.style.scrollMarginTop = `${offset}px`;
			el.setAttribute("data-sqs-a11y-scroll-margin-top", `${offset}px`);

			const utils = getUtils();

			utils.reportUpdate(
				el,
				ENH_NAME,
				`(${WCAG}) - Applied scroll-margin-top of ${offset}px to reduce sticky header overlap.`,
				debug,
			);
		}

		const offset = getHeaderOffset();
		const targets = document.querySelectorAll(TARGET_SELECTOR);

		targets.forEach((el) => {
			applyScrollMargin(el, offset);
		});

		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement complete.`, debug);
	};
})(window, document);
