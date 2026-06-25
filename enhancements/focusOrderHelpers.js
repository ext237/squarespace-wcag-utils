/**
 * Squarespace Accessibility Enhancement – focusOrderHelpers.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * Related WCAG Criteria:
 *   - 2.4.3 Focus Order
 *
 * Description:
 *   Attempts to support more predictable focus movement after internal anchor
 *   navigation and Squarespace AJAX page loads. This may help keyboard and
 *   assistive technology users keep their place after dynamic page changes.
 *
 * Squarespace Context:
 *   - Intended for common Squarespace 7.0 and 7.1 navigation patterns.
 *   - Reviews internal anchor links that point to page sections.
 *   - Reviews Squarespace AJAX page-load events such as `mercury:load`.
 *   - Can help reduce focus loss after internal navigation or dynamic page rendering.
 *
 * Dependencies:
 *   - sqsA11y-utils
 *   - utils.reportUpdate()
 *
 * Notes:
 *   This enhancement supports accessibility review and remediation work.
 *   It does not guarantee WCAG compliance on its own.
 */

// TODO: Re-test active focus movement after anchor navigation and mercury:load.
// This utility currently prepares targets with tabindex="-1", but the actual
// focus() calls are disabled until behavior is confirmed across Squarespace
// 7.0, 7.1, browser history navigation, and screen reader combinations.

(function (window, document) {
	// Ensure the global sqsA11y namespace exists.
	// This allows multiple accessibility fixes to share one common object.
	window.sqsA11y = window.sqsA11y || {};
	window.sqsA11y.enhancements = window.sqsA11y.enhancements || {};

	/**
	 * Fixes focus order issues caused by:
	 * 1. In-page anchor navigation
	 * 2. Squarespace AJAX page transitions
	 *
	 * Why this matters:
	 * Keyboard and assistive technology users can lose their place when
	 * focus is not moved logically after navigation or dynamic page updates.
	 *
	 * @param {Object} [options={}] Configuration for the fix.
	 * @param {boolean} [options.debug=false] Forces debug logging on when true.
	 * @param {string} [options.name] Human-readable fix name for trace logging.
	 * @param {string} [options.wcag] WCAG reference string for trace logging.
	 */
	window.sqsA11y.enhancements.focusOrderHelpers = function (options = {}) {
		// Normalize config values used throughout the fix.
		const debug = !!options.debug;
		const utils = window.sqsA11y.utils || {};
		const ENH_NAME = options.name || "Focus Order Helpers";
		const WCAG = options.wcag;

		// Record that this fix has started running.
		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement called.`, debug);

		// Prevent duplicate event binding.
		// Squarespace can rerun scripts during AJAX navigation, so this flag
		// ensures the listeners below are only attached once per page session.
		if (document.documentElement.dataset.accFocusOrderBound === "true") return;
		document.documentElement.dataset.accFocusOrderBound = "true";

		// ------------------------------------------------------------
		// (1) Anchor focus management for in-page links
		// ------------------------------------------------------------
		//
		// When a user activates a link like <a href="#section-id">, the browser
		// may scroll visually but not always move keyboard focus to the target.
		// This can leave keyboard and screen reader users disconnected from
		// the content they just navigated to.
		document.addEventListener("click", function (e) {
			// Only handle real in-page anchor links.
			// Excludes href="#" because that is often used as a placeholder.
			const link = e.target.closest('a[href^="#"]:not([href="#"])');
			if (!link) return;

			// Extract the target id from the link href.
			const id = link.getAttribute("href").slice(1);
			const target = document.getElementById(id);
			if (!target) return;

			// Delay focus slightly so native/browser/Squarespace scrolling and
			// link handling can finish before we move focus programmatically.
			setTimeout(() => {
				// Make the target programmatically focusable without adding it
				// to the normal tab order.
				target.setAttribute("tabindex", "-1");

				// Move focus to the destination so assistive tech users land
				// where the visual navigation also landed.
				//focusTarget.focus({ preventScroll: true }); // needs further testing

				// Optional trace hook for debugging or reporting.
				utils.reportUpdate(link, ENH_NAME, `(${WCAG}) - preparing focus for anchor target: ${id}`, debug);
			}, 100);
		});

		// ------------------------------------------------------------
		// (2) Focus main content after Squarespace AJAX load
		// ------------------------------------------------------------
		//
		// Squarespace often loads pages dynamically without a full browser refresh.
		// In those cases, keyboard focus may remain behind on an old control or
		// become disconnected from the newly loaded content.
		window.addEventListener("mercury:load", function () {
			// Try to locate the main landmark for the new page content.
			const main = document.querySelector("main");
			if (!main) return;

			// Try to locate the "section", if sections aren't availble, use main instead
			const sections = main.querySelectorAll("section");
			const focusTarget = sections[0] || main;

			// Make the target programmatically focusable and move focus there
			// without forcing an extra scroll jump.
			focusTarget.setAttribute("tabindex", "-1");
			//focusTarget.focus({ preventScroll: true }); // needs further testing

			// Optional trace hook for debugging or reporting.
			utils.reportUpdate(focusTarget, ENH_NAME, `(${WCAG}) - focus will redirect to main body after AJAX Load`, debug);
		});

		// Record that the fix finished setting up successfully.
		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement complete.`, debug);

	};
})(window, document);
