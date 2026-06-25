/**
 * Squarespace Accessibility Enhancement – mobileHamburger.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * Related WCAG Criteria:
 *   - 2.1.1 Keyboard
 *   - 2.1.2 No Keyboard Trap
 *   - 1.4.11 Non-text Contrast
 *   - 4.1.2 Name, Role, Value
 *
 * Description:
 *   Attempts to improve keyboard support for mobile hamburger menu toggles.
 *   When a likely mobile menu control can be identified, this enhancement may
 *   add supporting ARIA attributes, tabindex behavior, and Enter/Space activation.
 *
 * Squarespace Context:
 *   - Intended for common Squarespace 7.0 and 7.1 mobile navigation patterns.
 *   - Reviews likely mobile hamburger menu controls.
 *   - Can run after AJAX loads, viewport changes, or delayed navigation rendering.
 *
 * Dependencies:
 *   - sqsA11y-utils
 *   - utils.reportUpdate()
 *
 * Notes:
 *   This enhancement supports accessibility review and remediation work.
 *   It does not guarantee WCAG compliance on its own.
 */

// TODO: Recheck whether WCAG 2.1.2 should remain in this file header. This
// enhancement improves keyboard access to the toggle, but it does not directly
// manage focus trapping, Escape behavior, menu exit, or focus return.

(function (window, document) {
	window.sqsA11y = window.sqsA11y || {};
	window.sqsA11y.enhancements = window.sqsA11y.enhancements || {};

	window.sqsA11y.enhancements.mobileHamburger = function (options = {}) {
		const debug = !!options.debug;

		const utils = window.sqsA11y.utils || {};

		const ENH_NAME = options.name;
		const WCAG = options.wcag;
		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement called.`, debug);

		const toggles = document.querySelectorAll("button.Mobile-bar-menu, button.header-burger-btn.burger");

		if (!toggles.length) {
			utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - No mobile toggles found (likely desktop view).`, debug);
			return;
		}

		// ------------------------------------------------------------
		// Handle resize: re-run fix if layout mode changes
		// ------------------------------------------------------------
		function bindHamburgerResizeListener() {
			if (window._sqsA11yHamburgerBound) return;
			window._sqsA11yHamburgerBound = true;

			window.addEventListener("resize", () => {
				clearTimeout(window._sqsA11yHamburgerTimer);
				window._sqsA11yHamburgerTimer = setTimeout(() => {
					window.sqsA11y.enhancements.mobileHamburger(options);
				}, 400);
			});
		}
		bindHamburgerResizeListener();

		function applyToggleColorIfNeeded(toggle) {
			const cs = getComputedStyle(toggle);
			const textColor = utils.parseRgbString(cs.color);

			// Find the nearest usable solid background color.
			const bgColor = utils.getClosestAncestorBackgroundColor(toggle);

			// If we cannot determine both colors, do nothing.
			if (!textColor || !bgColor) return;

			const contrastCheck = utils.passesWcagContrast(textColor, bgColor, 3);

			// If contrast already passes, leave the existing color alone.
			if (contrastCheck && contrastCheck.pass) return;

			// Otherwise choose a stronger contrasting color based on the background.
			const replacementColor = utils.getComplementaryOutlineColor(toggle);
			if (!replacementColor) return;

			// Store prior inline color only once so it can be restored later if needed.
			if (toggle.dataset.prevColor === undefined) {
				toggle.dataset.prevColor = toggle.style.color || "";
			}

			toggle.style.color = replacementColor;

			utils.reportUpdate(toggle, ENH_NAME, `(${WCAG}) adjusted toggle color for 3:1 contrast against adjacent background`, debug);
		}

		// ------------------------------------------------------------
		// Enhance toggles
		// ------------------------------------------------------------
		toggles.forEach((toggle) => {
			if (toggle.dataset.accessibilityInit === "true") return;

			// Native <button> elements already expose button semantics and keyboard support.
			// Do not add role="button" or tabindex="0" to a real button.
			const isNativeButton = toggle.tagName.toLowerCase() === "button";

			// If a non-button element is being used as the hamburger control,
			// give it button semantics and put it in the normal Tab order so it can meet keyboard access expectations.
			// WCAG: SC 2.1.1 Keyboard
			if (!isNativeButton) {
				toggle.setAttribute("role", "button");
			}

			// set a contrast color for the toggle buttons:
			applyToggleColorIfNeeded(toggle);

			toggle.setAttribute("tabindex", "0");
			toggle.dataset.accessibilityInit = "true";
			utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - initialized.`, debug);

			if (!isNativeButton) {
				// Non-native elements given role="button" and tabindex="0" still do not gain
				// native keyboard activation automatically.
				//
				// WCAG intent:
				// - SC 2.1.1 Keyboard:
				//   Users must be able to operate the hamburger toggle using a keyboard.
				//
				// Why this handler is needed:
				// - A real <button> already responds to keyboard input by default.
				// - A non-button element with role="button" does not.
				// - This listener adds the expected activation behavior for Enter and Space
				//   so the custom toggle behaves like a button for keyboard users.
				toggle.addEventListener("keydown", (e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						toggle.click();
					}
				});
			}
		});

		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement complete.`, debug);
	};
})(window, document);
