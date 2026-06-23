/**
 * Squarespace Accessibility Enhancement - imagesWithoutContext.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * Related WCAG Criteria:
 *   - 1.1.1 Non-text Content
 *   - 2.4.4 Link Purpose (In Context)
 *   - 4.1.2 Name, Role, Value
 *
 * Description:
 *   Attempts to identify image-only links that do not appear to have a reliable
 *   accessible name. When useful context can be reasonably inferred, this
 *   enhancement may add an `aria-label` to the link without changing the image
 *   `alt` text.
 *
 * Squarespace Context:
 *   - Intended for common Squarespace 7.0 and 7.1 image-link patterns.
 *   - Reviews image-block and summary-block structures.
 *   - May use matching links with the same `href` or nearby readable text
 *     to infer link purpose.
 *   - Skips links that already appear to have a reliable accessible name.
 *   - Can run after AJAX loads or delayed content rendering.
 *
 * Dependencies:
 *   - sqsA11y-utils
 *   - utils.findLinkText()
 *   - utils.findNearbyTextForLink()
 *   - utils.reportUpdate()
 *
 * Notes:
 *   This enhancement supports accessibility review and remediation work.
 *   It does not guarantee WCAG compliance on its own.
 */

(function (window, document) {
	window.sqsA11y = window.sqsA11y || {};
	window.sqsA11y.enhancements = window.sqsA11y.enhancements || {};

	window.sqsA11y.enhancements.imagesWithoutContext = function (options = {}) {
		const debug = !!options.debug;

		const utils = window.sqsA11y.utils || {};
		let repairedCount = 0;

		const ENH_NAME = options.name || "Image-only hyperlink labeling applied";
		const WCAG = options.wcag;
		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement called.`, debug);

		// Infer a usable label for an image-only link from existing page context.
		// This helper does not modify the DOM; it only returns possible label text.
		function inferContextText(link) {
			// Use the link destination to look for another link on the page
			// that points to the same URL and already has readable text.
			const href = link.getAttribute("href");

			// Store the best label candidate found by the available utilities.
			let text = null;

			// First choice: reuse text from another link with the same href.
			// This is usually more reliable than guessing from nearby layout text.
			if (href && typeof utils.findLinkText === "function") {
				text = utils.findLinkText(href);
			}

			// Fallback: use nearby readable text from the surrounding Squarespace
			// block or layout area, such as a heading, caption, or summary title.
			if (!text && typeof utils.findNearestTextNode === "function") {
				text = utils.findNearestTextNode(link);
			}

			// Return a clean string so the calling code can decide whether it is
			// strong enough to use as an accessible label.
			return text ? text.trim() : "";
		}

		// Reject labels that technically create an accessible name,
		// but do not provide a meaningful link purpose.
		function isWeakInferredLabel(text) {
			const normalized = (text || "").trim().toLowerCase();

			return (
				!normalized ||
				normalized.length < 5 ||
				/^(image|photo|picture|read more|learn more|click here|view|more)$/i.test(normalized)
			);
		}

		// --- Scan all image-only links ---
		const links = Array.from(document.querySelectorAll("a[href]")).filter((a) => a.querySelector("img"));
		links.forEach((link) => {
			// Skip hidden or already labeled links
			if (link.offsetParent === null) return;
			if (link.hasAttribute("aria-label") || link.hasAttribute("aria-labelledby")) return;

			// Skip if visible text already exists
			const visibleText = (link.textContent || "").trim();
			if (visibleText.length > 0) return;

			// Skip if any child image has alt text
			const imgs = link.querySelectorAll("img");
			let hasAlt = false;
			imgs.forEach((img) => {
				if (img.alt && img.alt.trim().length > 0) hasAlt = true;
			});
			if (hasAlt) return;

			// Try to infer a meaningful label from existing page context.
			const inferredText = inferContextText(link);

			// Do not apply labels that are empty, vague, or unlikely to explain
			// the link destination to screen reader users.
			if (isWeakInferredLabel(inferredText)) return;

			// Apply the inferred label to the link itself so the image-only
			// hyperlink has a programmatically determinable accessible name.
			link.setAttribute("aria-label", inferredText);
			repairedCount++;

			utils.reportUpdate(link, ENH_NAME, `(${WCAG})  - Added aria-label="${inferredText}"`, debug);
		});

		// --- Reporting ---
		utils.reportUpdate(document.body, ENH_NAME, `(${WCAG}) - ${repairedCount} image-only link(s) labeled`, debug);

		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement complete.`, debug);

	};
})(window, document);
