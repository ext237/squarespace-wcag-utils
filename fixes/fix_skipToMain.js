/**
 * Squarespace Accessibility Utilities – fix_skipToMain.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Version: 0.3.0
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * WCAG Reference: 2.4.1 — Bypass Blocks
 * Description:
 *   Adds a "Skip to main content" link that appears on focus.
 *   Enables keyboard users to bypass repeated navigation.
 *
 * Options:
 *  - You can define your own .skip-link CSS to override the styles.
 *
 * Squarespace Context:
 *   - Runs safely on both 7.0 and 7.1 templates.
 *   - Works across AJAX-loaded pages (mercury:load, onInitialize).
 *
 * Dependencies:
 *   - None (optional: sqsA11y-utils for trace logging)
 *
 * Changelog:
 *   v0.3.0 – Initial modular ES export
 */
export function fix_skipToMain() {
	const FIX_ID = "FIX-5";
	const FIX_DESC = "Skip to Main Content applied";

	let skipLink = document.getElementById("acc-skip-link");

	// Create once if not already present
	if (!skipLink) {
		skipLink = document.createElement("a");
		skipLink.id = "acc-skip-link";
		skipLink.className = "skip-link";
		skipLink.textContent = "Skip to main content";
		document.body.insertAdjacentElement("afterbegin", skipLink);

		// Inject default CSS only if user hasn't defined .skip-link
		if (window.sqsA11y?.utils?.injectStyleOnce) {
			window.sqsA11y.utils.injectStyleOnce(
				"acc-skip-link-style",
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
				`
			);
		}

		// Manage focus behavior
		skipLink.addEventListener("click", (e) => {
			const targetId = skipLink.getAttribute("href")?.replace("#", "");
			const target = document.getElementById(targetId);
			if (target) {
				target.setAttribute("tabindex", "-1");
				target.focus();
			}
		});
	}

	// Always re-evaluate target after AJAX load
	const targetEl = window.sqsA11y?.utils?.getMainTarget?.();
	if (!targetEl) {
		console.warn(`[WCAG] ${FIX_ID}: No suitable target found for skip link.`);
		return;
	}

	// Ensure skip link points to correct main target
	skipLink.setAttribute("href", `#${targetEl.id}`);

	// Record and log the fix
	if (window.sqsA11y?.utils?.reportFix) {
		window.sqsA11y.utils.reportFix(skipLink, FIX_ID, FIX_DESC);
	} else {
		console.log(`[${FIX_ID}] ${FIX_DESC}`);
	}
}