/**
 * Squarespace Accessibility Enhancement - textSpacingAudit.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * Related WCAG Criteria:
 *   - 1.4.12 Text Spacing
 *
 * Description:
 *   Temporarily applies WCAG 1.4.12 text-spacing test values and reports
 *   elements that may clip, overlap, overflow, or lose readable content.
 *
 * Squarespace Context:
 *   - Intended for common Squarespace 7.0 and 7.1 page structures.
 *   - Provides developer-facing warnings for review.
 *   - Does not permanently modify the DOM.
 *   - Helps identify layout issues caused by fixed heights, hidden overflow,
 *     nowrap text, constrained buttons/links, and navigation wrapping problems.
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
	"use strict";

	window.sqsA11y = window.sqsA11y || {};
	window.sqsA11y.enhancements = window.sqsA11y.enhancements || {};

	window.sqsA11y.enhancements.textSpacingAudit = function (options = {}) {
		const debug = options.debug || false;
		const utils = window.sqsA11y.utils || {};
		const ENH_NAME = options.name;
		const WCAG = options.wcag;

		const TEST_CLASS = "sqs-a11y-text-spacing-test-active";
		const STYLE_ID = "sqs-a11y-text-spacing-audit-style";
		const REPORTED_ATTR = "data-sqs-a11y-text-spacing-reported";

		const VERTICAL_OVERFLOW_THRESHOLD = 6;
		const HORIZONTAL_OVERFLOW_THRESHOLD = 8;
		const auditStats = {
			itemsTested: 0,
			issuesFound: 0,
		};

		const TEXT_SELECTOR = [
			"p",
			"li",
			"blockquote",
			"figcaption",
			"caption",
			"td",
			"th",
			"label",
			"legend",
			"summary",
			"button",
			"a",
			"h1",
			"h2",
			"h3",
			"h4",
			"h5",
			"h6",
			".Header-nav-item",
			".Header-nav-folder-title",
			".Header-nav-folder-item",
			".Mobile-overlay-nav-item",
			".sqs-block-button-element",
		].join(", ");

		const NAV_SELECTOR = [
			".Header-nav-item",
			".Header-nav-folder-title",
			".Header-nav-folder-item",
			".Mobile-overlay-nav-item",
		].join(", ");

		/**
		 * injectTextSpacingTestStyle()
		 * ------------------------------------------------------------
		 * Adds the temporary WCAG 1.4.12 test stylesheet.
		 */
		function injectTextSpacingTestStyle() {
			if (document.getElementById(STYLE_ID)) return;

			const style = document.createElement("style");
			style.id = STYLE_ID;
			style.textContent = `
				html.${TEST_CLASS} body,
				html.${TEST_CLASS} body *:not(script):not(style):not(svg):not(path) {
					line-height: 1.5 !important;
					letter-spacing: 0.12em !important;
					word-spacing: 0.16em !important;
				}

				html.${TEST_CLASS} p {
					margin-bottom: 2em !important;
				}
			`;

			document.head.appendChild(style);
		}

		/**
		 * hasMeaningfulText()
		 * ------------------------------------------------------------
		 * Returns true when an element has readable text content.
		 */
		function hasMeaningfulText(el) {
			return getVisibleText(el).length > 0;
		}

		/**
		 * isVisible()
		 * ------------------------------------------------------------
		 * Returns true when an element is visible enough to audit.
		 */
		function isVisible(el) {
			if (!el || !(el instanceof Element)) return false;

			const rect = el.getBoundingClientRect();
			const style = window.getComputedStyle(el);

			return (
				rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden"
			);
		}

		function isVisuallyHiddenForAudit(el) {
			if (!el || !(el instanceof Element)) return false;

			const style = window.getComputedStyle(el);
			const rect = el.getBoundingClientRect();

			if (
				el.hidden ||
				el.getAttribute("aria-hidden") === "true" ||
				style.display === "none" ||
				style.visibility === "hidden" ||
				style.visibility === "collapse" ||
				style.opacity === "0"
			) {
				return true;
			}

			if (
				rect.width <= 1 &&
				rect.height <= 1 &&
				(style.overflow === "hidden" ||
					style.overflow === "clip" ||
					style.clip !== "auto" ||
					style.clipPath !== "none" ||
					parseFloat(style.marginLeft) < 0 ||
					parseFloat(style.marginTop) < 0)
			) {
				return true;
			}

			return false;
		}
		function getVisibleText(el) {
			if (!el || !(el instanceof Element)) return "";

			const textParts = [];

			function walk(node) {
				if (!node) return;

				if (node.nodeType === Node.TEXT_NODE) {
					if (node.parentElement && node.parentElement.closest("svg, noscript")) return;

					const text = (node.textContent || "").replace(/\s+/g, " ").trim();

					if (text) {
						textParts.push(text);
					}

					return;
				}

				if (node.nodeType !== Node.ELEMENT_NODE) return;

				if (node.closest("svg, noscript")) return;

				if (isVisuallyHiddenForAudit(node)) return;

				Array.from(node.childNodes).forEach(walk);
			}

			walk(el);

			return textParts.join(" ").replace(/\s+/g, " ").trim();
		}
		/**
		 * getElementLabel()
		 * ------------------------------------------------------------
		 * Returns a useful developer-facing selector clue.
		 */
		function getElementLabel(el) {
			if (!el || !(el instanceof Element)) return "unknown element";

			let label = el.tagName.toLowerCase();

			if (el.id) {
				label += `#${el.id}`;
			}

			if (el.className && typeof el.className === "string") {
				const classes = el.className.trim().split(/\s+/).slice(0, 4);

				if (classes.length) {
					label += `.${classes.join(".")}`;
				}
			}

			return label;
		}

		/**
		 * getTextSample()
		 * ------------------------------------------------------------
		 * Returns a short text sample to help locate the issue.
		 */
		function getTextSample(el) {
			if (!el || !(el instanceof Element)) return "";

			const text = getVisibleText(el);

			if (!text) return "";
			if (text.length <= 80) return text;

			return `${text.slice(0, 377)}...`;
		}

		function isIconOnlyLink(el) {
			if (!el || !(el instanceof Element)) return false;
			if (!el.matches("a")) return false;

			const visibleText = getVisibleText(el);
			const hasIcon = !!el.querySelector("svg, img");

			return hasIcon && !visibleText;
		}

		/**
		 * reportIssue()
		 * ------------------------------------------------------------
		 * Reports each issue type once per element.
		 */
		function reportIssue(el, issueType, message) {
			if (!el || !(el instanceof Element)) return;

			const existing = el.getAttribute(REPORTED_ATTR) || "";
			const issues = existing ? existing.split(/\s+/) : [];

			if (issues.includes(issueType)) return;

			issues.push(issueType);
			el.setAttribute(REPORTED_ATTR, issues.join(" "));

			auditStats.issuesFound++;

			utils.reportUpdate(
				el,
				ENH_NAME,
				`(${WCAG}) ${message} Element: ${getElementLabel(el)} | Text: "${getTextSample(el)}"`,
				debug,
			);
		}

		/**
		 * hasClippingOverflow()
		 * ------------------------------------------------------------
		 * Returns true when overflow settings may hide or clip expanded text.
		 */
		function hasClippingOverflow(el) {
			if (!el || !(el instanceof Element)) return false;

			const style = window.getComputedStyle(el);

			return (
				style.overflow === "hidden" ||
				style.overflowY === "hidden" ||
				style.overflowX === "hidden" ||
				style.overflow === "clip" ||
				style.overflowY === "clip" ||
				style.overflowX === "clip"
			);
		}

		/**
		 * hasExplicitHeightLimit()
		 * ------------------------------------------------------------
		 * Detects elements with explicit height or max-height constraints.
		 */
		function hasExplicitHeightLimit(el) {
			if (!el || !(el instanceof Element)) return false;

			const style = window.getComputedStyle(el);
			const inlineHeight = el.style && el.style.height;
			const inlineMaxHeight = el.style && el.style.maxHeight;

			return (
				(inlineHeight && inlineHeight !== "auto") ||
				(inlineMaxHeight && inlineMaxHeight !== "none") ||
				(style.maxHeight && style.maxHeight !== "none")
			);
		}

		/**
		 * hasFixedInteractiveHeight()
		 * ------------------------------------------------------------
		 * Detects buttons and links with likely fixed-height constraints.
		 */
		function hasFixedInteractiveHeight(el) {
			if (!el || !(el instanceof Element)) return false;

			const style = window.getComputedStyle(el);
			const inlineHeight = el.style && el.style.height;
			const inlineMaxHeight = el.style && el.style.maxHeight;

			return (
				(inlineHeight && inlineHeight !== "auto") ||
				(inlineMaxHeight && inlineMaxHeight !== "none") ||
				(style.maxHeight && style.maxHeight !== "none")
			);
		}

		/**
		 * getOverflowState()
		 * ------------------------------------------------------------
		 * Returns measured overflow values using thresholds to reduce noise.
		 */
		function getOverflowState(el) {
			if (!el || !(el instanceof Element)) {
				return {
					verticalOverflow: false,
					horizontalOverflow: false,
				};
			}

			return {
				verticalOverflow: el.scrollHeight > el.clientHeight + VERTICAL_OVERFLOW_THRESHOLD,

				horizontalOverflow: el.scrollWidth > el.clientWidth + HORIZONTAL_OVERFLOW_THRESHOLD,
			};
		}

		/**
		 * auditLikelyTextClipping()
		 * ------------------------------------------------------------
		 * Reports likely clipping only when overflow measurements combine
		 * with hidden/clip overflow or explicit height constraints.
		 */
		function auditLikelyTextClipping(el) {
			if (!hasMeaningfulText(el) || !isVisible(el)) return;
			if (isIconOnlyLink(el)) return;

			const overflow = getOverflowState(el);
			const clipsOverflow = hasClippingOverflow(el);
			const hasHeightLimit = hasExplicitHeightLimit(el);

			if (overflow.verticalOverflow && clipsOverflow && hasHeightLimit) {
				reportIssue(
					el,
					"fixed-height-clipping",
					`Text may be vertically clipped because ${getElementLabel(el)} has a height constraint and hidden or clipped overflow after text-spacing test values are applied.`,
				);
			}

			if (overflow.horizontalOverflow && clipsOverflow) {
				reportIssue(
					el,
					"text-clipped-horizontal",
					"Text may be horizontally clipped because content exceeds the visible area and overflow is hidden or clipped after text-spacing test values are applied.",
				);
			}
		}

		/**
		 * auditNowrap()
		 * ------------------------------------------------------------
		 * Finds nowrap text that may overflow when spacing is increased.
		 */
		function auditNowrap(el) {
			if (!hasMeaningfulText(el) || !isVisible(el)) return;

			if (isIconOnlyLink(el)) return;

			const style = window.getComputedStyle(el);
			const overflow = getOverflowState(el);
			const clipsOverflow = hasClippingOverflow(el);

			if (style.whiteSpace === "nowrap" && overflow.horizontalOverflow) {
				reportIssue(
					el,
					"nowrap-overflow",
					clipsOverflow
						? "Nowrap text may be clipped because it overflows while overflow is hidden or clipped after text-spacing test values are applied."
						: "Nowrap text may overflow horizontally after text-spacing test values are applied.",
				);
			}
		}

		/**
		 * auditFixedHeightInteractive()
		 * ------------------------------------------------------------
		 * Finds buttons and links with fixed heights that may clip text.
		 */
		function auditFixedHeightInteractive(el) {
			if (!hasMeaningfulText(el) || !isVisible(el)) return;
			if (isIconOnlyLink(el)) return;
			const isInteractive = el.matches("a, button, .sqs-block-button-element");
			if (!isInteractive) return;

			const overflow = getOverflowState(el);
			const clipsOverflow = hasClippingOverflow(el);
			const hasFixedHeight = hasFixedInteractiveHeight(el);

			if (overflow.verticalOverflow && (clipsOverflow || hasFixedHeight)) {
				reportIssue(
					el,
					"fixed-height-interactive",
					"Button or link text may be clipped by fixed height or constrained overflow after text-spacing test values are applied.",
				);
			}

			if (overflow.horizontalOverflow && clipsOverflow) {
				reportIssue(
					el,
					"interactive-horizontal-clipping",
					"Button or link text may be horizontally clipped after text-spacing test values are applied.",
				);
			}
		}

		/**
		 * auditNavItem()
		 * ------------------------------------------------------------
		 * Finds navigation items that may clip or overflow after text spacing.
		 */
		function auditNavItem(el) {
			if (!hasMeaningfulText(el) || !isVisible(el)) return;
			if (!el.matches(NAV_SELECTOR)) return;
			if (isIconOnlyLink(el)) return;
			const overflow = getOverflowState(el);
			const clipsOverflow = hasClippingOverflow(el);
			const style = window.getComputedStyle(el);

			if ((overflow.verticalOverflow || overflow.horizontalOverflow) && clipsOverflow) {
				reportIssue(
					el,
					"nav-item-clipping",
					"Navigation item may be clipped because it overflows while overflow is hidden or clipped after text-spacing test values are applied.",
				);
			}

			if (style.whiteSpace === "nowrap" && overflow.horizontalOverflow) {
				reportIssue(
					el,
					"nav-nowrap-overflow",
					"Navigation item uses nowrap and may overflow after text-spacing test values are applied.",
				);
			}
		}

		/**
		 * auditNavOverlap()
		 * ------------------------------------------------------------
		 * Detects visible nav items whose bounding boxes overlap each other.
		 */
		function auditNavOverlap() {
			const navItems = Array.from(document.querySelectorAll(NAV_SELECTOR)).filter((el) => {
				return hasMeaningfulText(el) && isVisible(el);
			});

			for (let i = 0; i < navItems.length; i++) {
				const a = navItems[i];
				const aRect = a.getBoundingClientRect();

				for (let j = i + 1; j < navItems.length; j++) {
					const b = navItems[j];
					const bRect = b.getBoundingClientRect();

					const overlaps =
						aRect.left < bRect.right &&
						aRect.right > bRect.left &&
						aRect.top < bRect.bottom &&
						aRect.bottom > bRect.top;

					if (overlaps) {
						reportIssue(
							a,
							"nav-overlap",
							`Navigation item may overlap another nav item after text-spacing test values are applied. Overlaps with: ${getElementLabel(b)}.`,
						);

						reportIssue(
							b,
							"nav-overlap",
							`Navigation item may overlap another nav item after text-spacing test values are applied. Overlaps with: ${getElementLabel(a)}.`,
						);
					}
				}
			}
		}

		/**
		 * runAudit()
		 * ------------------------------------------------------------
		 * Applies WCAG 1.4.12 test spacing, audits, then removes test class.
		 */
		function runAudit() {
			injectTextSpacingTestStyle();

			document.documentElement.classList.add(TEST_CLASS);

			window.requestAnimationFrame(function () {
				window.requestAnimationFrame(function () {
					const textElements = Array.from(document.querySelectorAll(TEXT_SELECTOR));

					auditStats.itemsTested = textElements.length;
					auditStats.issuesFound = 0;

					textElements.forEach((el) => {
						auditLikelyTextClipping(el);
						auditNowrap(el);
						auditFixedHeightInteractive(el);
						auditNavItem(el);
					});

					auditNavOverlap();

					reportAuditSummary();

					//document.documentElement.classList.remove(TEST_CLASS);
				});
			});
		}

		/**
		 * reportAuditSummary()
		 * ------------------------------------------------------------
		 * Reports how many elements were tested and how many issues need review.
		 */
		function reportAuditSummary() {
			utils.reportUpdate(
				null,
				ENH_NAME,
				`(${WCAG}) Text Spacing Audit Test Completed. ${auditStats.itemsTested.toLocaleString()} items tested, ${auditStats.issuesFound.toLocaleString()} issues need review.`,
				debug,
			);
		}

		runAudit();
	};
})(window, document);
