/**
 * Squarespace Accessibility Enhancement - linkPurposeEnhancer.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * Related WCAG Criteria:
 *   - 2.4.4 Link Purpose (In Context)
 *
 * Description:
 *   Attempts to improve link purpose for vague Squarespace Summary links,
 *   such as "Read More" or "Read More →". When useful context can be
 *   reasonably inferred, this enhancement may add context from the related
 *   item title or, when needed, from a cleaned internal URL path.
 *
 *   This enhancement is intentionally limited to Squarespace Summary section
 *   links and does not attempt to evaluate all vague links across the site.
 *
 * Squarespace Context:
 *   - Intended for common Squarespace 7.0 and 7.1 Summary section patterns.
 *   - Reviews Squarespace Summary "read more" style links.
 *   - Reviews Summary Blocks, card-style layouts, and related summary markup.
 *   - Can run after AJAX loads or delayed content rendering.
 *
 * Dependencies:
 *   - sqsA11y-utils
 *   - utils.reportUpdate()
 *
 * Notes:
 *   This enhancement supports accessibility review and remediation work.
 *   It does not guarantee WCAG compliance on its own.
 */

(function (window, document) {
	window.sqsA11y = window.sqsA11y || {};
	window.sqsA11y.enhancements = window.sqsA11y.enhancements || {};

	window.sqsA11y.enhancements.linkPurposeEnhancer = function (options = {}) {
		const debug = !!options.debug;
		const ENH_DESC = "Link Purpose Enhancement";
		const utils = window.sqsA11y.utils || {};

		const ENH_NAME = options.name;
		const WCAG = options.wcag;

		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement called.`, debug);

		// prettier-ignore
		const vaguePhrases = [
			"read more",
			"learn more",
			"click here",
			"details",
			"view all",
			"email",
			"email us",
			"email me",
			"contact",
			"contact us",
			"contact me",
			"more",
			"more info",
			"more information",
			"see more",
			"find out more",
			"discover more",
			"continue reading",
			"read full article",
			"read full story",
			"view more",
			"view details"
		];

		// Only process Squarespace Summary links for this fix.
		const links = document.querySelectorAll("a.summary-read-more-link");

		links.forEach((link) => {
			// Prevent duplicate processing on the same link.
			if (link.dataset.linkPurposeInit === "true") return;
			link.dataset.linkPurposeInit = "true";

			// Normalize the visible text so decorative symbols do not affect matching.
			const rawText = (link.textContent || "").trim().toLowerCase();
			const normalizedText = rawText
				.replace(/[^\p{L}\p{N}\s]/gu, "")
				.replace(/\s+/g, " ")
				.trim();

			// Only update known vague Summary link phrases.
			const isVague = vaguePhrases.includes(normalizedText);
			if (!isVague) return;

			// Leave links alone if the accessible name has already been customized.
			if (link.hasAttribute("aria-label") || link.hasAttribute("aria-labelledby")) return;

			let context = "";
			let heading = null;

			// Prefer a heading from the closest summary item or card wrapper.
			const itemContainer = link.closest(".summary-item, article, .card");
			if (itemContainer) {
				heading = itemContainer.querySelector(
					"h1, h2, h3, h4, h5, h6, .summary-title, .summary-header-text"
				);
			}

			// Fall back to a broader block or section heading if needed.
			if (!heading) {
				const blockContainer = link.closest(".sqs-block, section");
				if (blockContainer) {
					heading = blockContainer.querySelector(
						"h1, h2, h3, h4, h5, h6, .summary-title, .summary-header-text"
					);
				}
			}

			// Use heading text when available because it is usually the strongest context.
			if (heading) {
				context = (heading.textContent || "").replace(/\s+/g, " ").trim();
			} else {
				// Fall back to a cleaned href when no heading is available.
				const href = link.getAttribute("href") || "";
				if (href && href !== "#") {
					context = getContextFromHref(href);
				}
			}

			// Only set an aria-label when useful context was found.
			if (context) {
				link.setAttribute("aria-label", `${normalizedText} about ${context}`);
				utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - link updated - ${normalizedText} -> read more about ${context}`, debug);
			}
		});

		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement complete.`, debug);

	};

	function getContextFromHref(href) {
		// Ignore empty, placeholder, script, and telephone links.
		if (!href || href === "#" || href.startsWith("javascript:") || href.startsWith("tel:")) {
			return "";
		}

		// Provide a useful email context for mailto links.
		if (href.startsWith("mailto:")) {
			const email = href
				.replace(/^mailto:/i, "")
				.split("?")[0]
				.trim();

			return email ? `email ${email}` : "";
		}

		try {
			const url = new URL(href, window.location.origin);

			// Only use same-site URLs for fallback context.
			if (url.origin !== window.location.origin) return "";

			const segments = url.pathname.split("/").filter(Boolean);
			if (!segments.length) return "";

			// Use the last path segment and convert common slug formatting into readable text.
			return segments[segments.length - 1]
				.replace(/\.[a-z0-9]+$/i, "")
				.replace(/[-_]+/g, " ")
				.trim();
		} catch {
			return "";
		}
	}
})(window, document);