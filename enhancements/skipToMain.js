/**
 * Squarespace Accessibility Enhancement – skipToMain.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * Related WCAG Criteria:
 *   - 2.4.1 Bypass Blocks
 *
 * Description:
 *   Attempts to provide a "Skip to main content" link that appears on focus.
 *   This may help keyboard users bypass repeated navigation and move more
 *   directly to the main page content.
 *
 * Options:
 *   - Custom `.skip-link` CSS can be defined by the site to override the
 *     default visual styles.
 *
 * Squarespace Context:
 *   - Intended for common Squarespace 7.0 and 7.1 templates.
 *   - Attempts to identify a suitable main content target.
 *   - Can run after AJAX loads or delayed content rendering.
 *
 * Dependencies:
 *   - sqsA11y-utils
 *   - utils.reportUpdate()
 *   - utils.injectStyleOnce()
 *
 * Notes:
 *   This enhancement supports accessibility review and remediation work.
 *   It does not guarantee WCAG compliance on its own.
 */

(function (window, document) {
	window.sqsA11y = window.sqsA11y || {};
	window.sqsA11y.enhancements = window.sqsA11y.enhancements || {};

	window.sqsA11y.enhancements.skipToMain = function (options = {}) {
		const debug = !!options.debug;
		const utils = window.sqsA11y.utils || {};
		const ENH_NAME = options.name;
		const WCAG = options.wcag;
		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement called.`, debug);

		// 1. If Squarespace already provides its own skip link, leave it alone.
		const nativeSkipLink = document.querySelector(".header-skip-link");
		if (nativeSkipLink) {
			utils.reportUpdate(
				null,
				ENH_NAME,
				`(${WCAG}) - Native Squarespace skip link found. Enhancement skipped.`,
				debug,
			);
			return;
		}

		// 2. Only look for our enhancement-created skip link after confirming
		//    Squarespace has not provided one.
		let skipLink = document.getElementById("acc-skip-link");

		// ------------------------------------------------------------
		// Create link if not already present
		// ------------------------------------------------------------
		if (!skipLink) {
			skipLink = document.createElement("a");
			skipLink.id = "acc-skip-link";
			skipLink.className = "skip-link";
			skipLink.textContent = "Skip to main content";
			document.body.insertAdjacentElement("afterbegin", skipLink);

			// Inject default CSS if user hasn't defined .skip-link
			if (typeof utils.injectStyleOnce === "function") {
				utils.injectStyleOnce(
					"sqs-a11y-skip-link-style",
					".skip-link",
					`
					/* WCAG 2.4.1 — visually hidden until focused */
					.skip-link {
						position: absolute;
						top: -40px;
						left: 0;
						background: #000;
						color: #fff;
						padding: 8px 12px;
						z-index: 9999;
						text-decoration: none;
						font-size: 1rem;
						transition: top 0.2s ease;
					}
					.skip-link:focus {
						top: 0;
					}
					`,debug
				);
			}

			// Focus management
			skipLink.addEventListener("click", function () {
				const targetId = skipLink.getAttribute("href")?.replace("#", "");
				const target = document.getElementById(targetId);
				if (target) {
					target.setAttribute("tabindex", "-1");
					target.focus();
				}
			});
		}

		// ------------------------------------------------------------
		// Always re-evaluate the main target after AJAX load
		// ------------------------------------------------------------
		const targetEl =
			typeof utils.getMainTarget === "function"
				? utils.getMainTarget()
				: document.querySelector("main,[role='main'],h1");

		if (!window._skipLinkBound) {
			window._skipLinkBound = true;
			document.addEventListener("mercury:load", () => {
				window.sqsA11y.enhancements.ENH_skipToMain();
			});
		}

		if (!targetEl) {
			utils.reportUpdate(
				null,
				ENH_NAME,
				`(${WCAG}) -  - No suitable target found for skip link.`,
				debug,
			);
			return;
		}

		if (!targetEl.id) targetEl.id = "main-content";
		skipLink.setAttribute("href", `#${targetEl.id}`);

		// ------------------------------------------------------------
		// Report or log
		// ------------------------------------------------------------
		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement complete.`, debug);
	};
})(window, document);
