/**
 * Squarespace Accessibility Enhancement – navDropdownLinks.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * Related WCAG Criteria:
 *   - 2.1.1 Keyboard
 *   - 4.1.2 Name, Role, Value
 *
 * Description:
 *   Attempts to improve keyboard support for Squarespace navigation dropdown
 *   triggers, such as folder-style links. When a dropdown trigger can be
 *   identified, this enhancement may add supporting ARIA attributes, tabindex
 *   behavior, and Enter/Space handling for submenu toggling.
 *
 * Squarespace Context:
 *   - Intended for common Squarespace 7.0 and 7.1 navigation patterns.
 *   - Reviews navigation dropdown triggers and folder-style links.
 *   - Can run after AJAX loads or delayed navigation rendering.
 *
 * Dependencies:
 *   - sqsA11y-utils
 *   - utils.reportUpdate()
 *
 * Notes:
 *   This enhancement supports accessibility review and remediation work.
 *   It does not guarantee WCAG compliance on its own.
 */

// TODO: Retest whether aria-expanded stays synchronized when Squarespace
// closes a dropdown because of outside clicks, blur, Escape, responsive menu
// changes, or other native navigation behavior.

// TODO: Consider whether identified dropdown triggers should also receive
// aria-controls when a reliable submenu container ID can be found.

(function (window, document) {
	window.sqsA11y = window.sqsA11y || {};
	window.sqsA11y.enhancements = window.sqsA11y.enhancements || {};

	window.sqsA11y.enhancements.navDropdownLinks = function (options = {}) {
		const debug = !!options.debug;
		const utils = window.sqsA11y.utils || {};
		const ENH_NAME = options.name;
		const WCAG = options.wcag;
		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement called.`, debug);

		// Target common Squarespace folder/dropdown link selectors
		const folders = document.querySelectorAll(".nav-folder-title, .header-menu-nav-item--folder > a, .Header-nav-folder-title, .Header-nav-item--folder > a");
		folders.forEach((folder) => {
			if (folder.dataset.accessibilityInit === "true") return;
			folder.dataset.accessibilityInit = "true";

			const isAnchor = folder.tagName === "A" && folder.hasAttribute("href");

			folder.setAttribute("aria-expanded", "false");

			// Only add role/tabindex if not a real link
			if (!isAnchor) {
				folder.setAttribute("role", "button");
				folder.setAttribute("tabindex", "0");
			}

			// Mouse click toggles dropdown
			folder.addEventListener("click", () => {
				const expanded = folder.getAttribute("aria-expanded") === "true";
				folder.setAttribute("aria-expanded", String(!expanded));
			});

			// Keyboard support: Enter or Space toggles dropdown
			folder.addEventListener("keydown", (e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					folder.click();
				}
			});

			utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - initialized`, debug);
		});
		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement complete.`, debug);

	};
})(window, document);
