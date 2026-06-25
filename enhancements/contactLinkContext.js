/**
 * Squarespace Accessibility Enhancement – contactLinkContext.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * Related WCAG Criteria:
 *   - 1.3.1 Info and Relationships
 *   - 2.4.4 Link Purpose (In Context)
 *   - 4.1.2 Name, Role, Value
 *
 * Description:
 *   Attempts to add contextual labeling support for contact links, such as
 *   `tel:` and `mailto:` links, when useful context can be reasonably inferred
 *   from nearby text, headings, titles, ARIA labels, or Squarespace image
 *   metadata. This may help clarify link purpose for screen reader users.
 *
 * Squarespace Context:
 *   - Intended for common Squarespace 7.0 and 7.1 contact-link patterns.
 *   - Reviews contact links in text blocks, summaries, footers, and dynamic content.
 *   - Attempts to preserve existing `aria-label` values when already present.
 *   - May normalize visible phone number formatting and `tel:` href values.
 *   - Skips hidden or previously processed links.
 *   - Can run after AJAX loads or delayed content rendering.
 *
 * Dependencies:
 *   - sqsA11y-utils
 *   - utils.reportUpdate()
 *   - utils.findNearestText()
 *
 * Notes:
 *   This enhancement supports accessibility review and remediation work.
 *   It does not guarantee WCAG compliance on its own.
 */

(function (window, document) {
	window.sqsA11y = window.sqsA11y || {};
	window.sqsA11y.enhancements = window.sqsA11y.enhancements || {};

	window.sqsA11y.enhancements.contactLinkContext = function (options = {}) {
		const debug = !!options.debug;
		const utils = window.sqsA11y.utils || {};
		let repairedCount = 0;

		const ENH_NAME = options.name || "contactLinkContext";
		const WCAG = options.wcag || "WCAG 1.3.1, 2.4.4, 4.1.2";

		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement called.`, debug);

		// Only target contact links this fix is designed to improve.
		const links = document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]');

		const formatPhoneDisplay = (num) => {
			// Normalize common U.S. phone display formats to (xxx) xxx-xxxx.
			const digits = String(num || "").replace(/\D/g, "");

			if (digits.length === 10) {
				return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
			}

			// Leave non-standard or international display text unchanged.
			return num;
		};

		const formatTelHref = (href) => {
			// Strip everything except numbers so values like tel:(314) 603-2003 can be normalized.
			const digits = String(href || "").replace(/\D/g, "");

			// Do not create a tel: href if no phone digits were found.
			if (!digits) return null;

			// Assume U.S. numbers only when exactly 10 digits are found.
			if (digits.length === 10) {
				return `+1${digits}`;
			}

			// Preserve longer international-looking numbers by prefixing with +.
			return `+${digits}`;
		};

		function getNearestInlineText(el) {
			// Prefer the shared utility when available because it handles nearby text more consistently.
			if (typeof utils.findNearestText === "function") {
				const text = utils.findNearestText(el, 2);
				if (text) return text.trim();
			}

			let txt = "";

			// Check text immediately before the contact link, such as "Catering:".
			if (el.previousSibling && el.previousSibling.textContent) {
				txt = el.previousSibling.textContent.trim();
			}

			// Remove trailing separators commonly used before phone/email links.
			txt = txt.replace(/[:\-–\s]+$/, "");
			if (txt) return txt;

			// If the link is in a small inline wrapper, use the surrounding parent text.
			const parent = el.parentElement;
			if (parent && parent.childNodes.length <= 3) {
				const text = parent.textContent.replace(el.textContent, "").trim();
				if (text) return text.replace(/[:\-–\s]+$/, "");
			}

			return "";
		}

		function isHidden(el) {
			// offsetParent catches most hidden elements.
			// Fixed-position elements can have no offsetParent while still being visible.
			return el.offsetParent === null && getComputedStyle(el).position !== "fixed";
		}

		links.forEach((link) => {
			// Mark links immediately so hidden or already-reviewed links are not processed repeatedly.
			if (link.dataset.contactLabelInit === "true") return;
			link.dataset.contactLabelInit = "true";

			if (isHidden(link)) return;

			const href = link.getAttribute("href") || "";
			const isPhone = href.startsWith("tel:");
			const isEmail = href.startsWith("mailto:");
			let visibleText = utils.normalizeWhitespace(link.textContent);

			if (isPhone) {
				// Clean up visible phone numbers without touching non-10-digit display text.
				const display = formatPhoneDisplay(visibleText);

				if (display !== visibleText) {
					link.textContent = display;
				}

				// Keep the label text aligned with the repaired visible phone number.
				visibleText = display;

				// Do not rewrite tel: links that are already in valid international format.
				if (!/^tel:\+\d{7,15}$/i.test(href)) {
					const normalizedHref = formatTelHref(href);

					if (normalizedHref) {
						link.setAttribute("href", `tel:${normalizedHref}`);
					}
				}
			}

			// Start with existing link metadata before looking at nearby page context.
			// alt is not standard on links, but Squarespace may place useful fallback text there.
			let context =
				link.getAttribute("aria-label") ||
				link.getAttribute("title") ||
				link.getAttribute("alt") ||
				"";

			// Prefer nearby inline labels like "Catering:" before broader section headings.
			if (!context) {
				context = getNearestInlineText(link);
			}

			// If inline context is unavailable, use a direct heading from the nearest content container.
			if (!context) {
				const parent = link.closest(".sqs-block, section, article");

				if (parent) {
					const heading = parent.querySelector(
						":scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6",
					);

					if (heading && heading.textContent.trim()) {
						context = heading.textContent.trim();
					}
				}
			}

			// Clean spacing only. Do not alter casing, so names like BBQ or USA are preserved.
			context = utils.normalizeWhitespace(context);

			let label = "";

			if (isPhone) {
				label = context ? `Call ${context} at ${visibleText}` : `Call ${visibleText}`;
			} else if (isEmail) {
				// Prefer the actual email address from mailto: over vague visible text like "Email us".
				const emailAddress = utils.getEmailAddressFromHref(href);

				label = context
					? `Email ${context} at ${emailAddress || visibleText}`
					: `Email ${emailAddress || visibleText}`;
			}

			const existingAria = utils.normalizeWhitespace(link.getAttribute("aria-label"));
			const existingTitle = utils.normalizeWhitespace(link.getAttribute("title"));
			let didRepair = false;

			if (label) {
				// Add an aria-label only when one does not already exist.
				// Existing labels may already be valid, even if short, when page context is clear.
				if (!existingAria) {
					link.setAttribute("aria-label", label);
					didRepair = true;
				}

				// If an aria-label already exists, add a title only when title is missing.
				// This preserves the existing accessible name while adding helpful metadata.
				else if (!existingTitle) {
					link.setAttribute("title", label);
					didRepair = true;
				}
			}

			if (didRepair) {
				repairedCount++;

				utils.reportUpdate(
					link,
					ENH_NAME,
					`${repairedCount} - Added contact link context = "${label}"`,
					debug,
				);
			}
		});

		if (repairedCount > 0) {
			utils.reportUpdate(document.body, ENH_NAME, `${repairedCount} contact link(s) labeled`, debug);
		}

		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement complete.`, debug);
	};
})(window, document);
