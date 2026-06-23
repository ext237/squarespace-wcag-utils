/**
 * Squarespace Accessibility Utilities - newWindowLinkContext.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * WCAG References:
 *   2.4.4 - Link Purpose (In Context)
 *   3.2.2 - On Input
 *
 * Description:
 *   Adds subtle visual and assistive context to links that open in a new
 *   browser tab/window.
 *
 * Behavior:
 *   - Adds rel="noopener"
 *     Applied to all eligible links with target="_blank".
 *
 *   - Adds a visible external-link icon
 *     Applied only to standard text links.
 *     Skipped for:
 *       - Squarespace button-style links
 *       - Navigation/menu links
 *       - Image-only or icon-only links
 *
 *   - Adds assistive new-tab context
 *     If the link already has aria-label, the context is added to aria-label.
 *     Otherwise, visually-hidden inline text is appended.
 *
 *   - Does not skip security hardening just because context text or an icon
 *     already exists.
 *
 *   - Skips enhancement when:
 *       - Link is not target="_blank"
 *       - Link uses tel: or mailto:
 *       - Link is a same-page anchor link
 *       - Link has already been processed
 *
 * Notes:
 *   This is an enhancement, not a guaranteed WCAG repair. It improves
 *   predictability and link purpose context without altering visible
 *   content in a disruptive way.
 */
(function (window, document) {
	"use strict";

	window.sqsA11y = window.sqsA11y || {};
	window.sqsA11y.enhancements = window.sqsA11y.enhancements || {};

	window.sqsA11y.enhancements.newWindowLinkContext = function (options = {}) {
		const debug = !!options.debug;
		const utils = window.sqsA11y.utils || {};
		const ENH_NAME = options.name || "newWindowLinkContext";
		const WCAG = options.wcag || "WCAG 2.4.4, 3.2.2";

		const ICON_CLASS = "sqs-a11y-new-window-icon";
		const TEXT_CLASS = "sqs-a11y-visually-hidden";
		const PROCESSED_ATTR = "data-sqs-a11y-new-window-context";
		const STYLE_ID = "sqs-a11y-new-window-link-context-style";

		/**
		 * report()
		 * ------------------------------------------------------------
		 * Sends a debug report when the shared utility is available.
		 */
		function report(el, message) {
			if (typeof utils.reportUpdate !== "function") return;

			utils.reportUpdate(el, ENH_NAME, `(${WCAG}) - ${message}`, debug);
		}

		/**
		 * injectHiddenTextStyle()
		 * ------------------------------------------------------------
		 * Provides visually-hidden text styles and visible icon styles.
		 */
		function injectHiddenTextStyle() {
			const css = `
				.${TEXT_CLASS} {
					position: absolute !important;
					width: 1px !important;
					height: 1px !important;
					padding: 0 !important;
					margin: -1px !important;
					overflow: hidden !important;
					clip: rect(0, 0, 0, 0) !important;
					white-space: nowrap !important;
					border: 0 !important;
				}

				.${ICON_CLASS} {
					display: inline-flex !important;
					align-items: center !important;
					width: 0.85em !important;
					height: 0.85em !important;
					margin-left: 0.25em !important;
					vertical-align: text-top !important;
					white-space: nowrap !important;
				}

				.${ICON_CLASS} svg {
					display: block !important;
					width: 100% !important;
					height: 100% !important;
					fill: currentColor !important;
				}
			`;

			if (typeof utils.injectStyleOnce === "function") {
				utils.injectStyleOnce(STYLE_ID, `.${TEXT_CLASS}`, css, debug);
				return;
			}

			if (document.getElementById(STYLE_ID)) return;

			const style = document.createElement("style");
			style.id = STYLE_ID;
			style.textContent = css;
			document.head.appendChild(style);
		}

		/**
		 * hasNewWindowContextValue()
		 * ------------------------------------------------------------
		 * Checks a string for existing new-tab/new-window wording.
		 */
		function hasNewWindowContextValue(value) {
			const text = (value || "").toLowerCase();

			return (
				text.includes("opens in a new tab") ||
				text.includes("opens in new tab") ||
				text.includes("opens in a new window") ||
				text.includes("opens in new window")
			);
		}

		/**
		 * hasNewWindowContext()
		 * ------------------------------------------------------------
		 * Checks both visible/link text and aria-label for existing context.
		 */
		function hasNewWindowContext(link) {
			if (!link || !(link instanceof HTMLAnchorElement)) return false;

			return (
				hasNewWindowContextValue(link.textContent) ||
				hasNewWindowContextValue(link.getAttribute("aria-label"))
			);
		}

		/**
		 * isVisuallyHiddenForTextCheck()
		 * ------------------------------------------------------------
		 * Detects text that is not visually rendered and should not make
		 * an icon-only link look like a normal text link.
		 */
		function isVisuallyHiddenForTextCheck(el) {
			if (!el || !(el instanceof Element)) return false;

			const style = window.getComputedStyle(el);
			const rect = el.getBoundingClientRect();

			if (
				el.hidden ||
				el.getAttribute("aria-hidden") === "true" ||
				style.display === "none" ||
				style.visibility === "hidden" ||
				style.visibility === "collapse"
			) {
				return true;
			}

			if (
				rect.width <= 1 &&
				rect.height <= 1 &&
				(
					style.overflow === "hidden" ||
					style.overflow === "clip" ||
					style.clip !== "auto" ||
					style.clipPath !== "none" ||
					parseFloat(style.marginLeft) < 0 ||
					parseFloat(style.marginTop) < 0
				)
			) {
				return true;
			}

			return false;
		}

		/**
		 * getVisibleText()
		 * ------------------------------------------------------------
		 * Returns only visually rendered text from an element.
		 */
		function getVisibleText(el) {
			if (!el || !(el instanceof Element)) return "";

			const textParts = [];

			function walk(node) {
				if (!node) return;

				if (node.nodeType === Node.TEXT_NODE) {
					const text = (node.textContent || "").replace(/\s+/g, " ").trim();

					if (text) {
						textParts.push(text);
					}

					return;
				}

				if (node.nodeType !== Node.ELEMENT_NODE) return;

				const childEl = node;

				if (isVisuallyHiddenForTextCheck(childEl)) return;

				Array.from(childEl.childNodes).forEach(walk);
			}

			walk(el);

			return textParts.join(" ").replace(/\s+/g, " ").trim();
		}

		/**
		 * isImageOnlyLink()
		 * ------------------------------------------------------------
		 * Detects icon-only or image-only links so visible icons are skipped.
		 */
		function isImageOnlyLink(link) {
			if (!link || !(link instanceof HTMLAnchorElement)) return false;

			const visibleText = getVisibleText(link);
			const hasImageOrSvg = !!link.querySelector("img, svg");

			return hasImageOrSvg && !visibleText;
		}

		/**
		 * isSquarespaceButton()
		 * ------------------------------------------------------------
		 * Detects Squarespace button-style links.
		 */
		function isSquarespaceButton(link) {
			if (!link || !(link instanceof HTMLAnchorElement)) return false;

			return link.matches(
				".sqs-block-button-element, .sqs-button-element--primary, .sqs-button-element--secondary, [data-sqsp-button]"
			);
		}

		/**
		 * isNavigationLink()
		 * ------------------------------------------------------------
		 * Detects navigation/menu links where visible icons can disrupt layout.
		 */
		function isNavigationLink(link) {
			if (!link || !(link instanceof HTMLAnchorElement)) return false;

			return !!link.closest("nav, .Header-nav, .header-nav, .Mobile-bar, .Mobile-overlay-nav");
		}

		/**
		 * hasContextIcon()
		 * ------------------------------------------------------------
		 * Avoids adding duplicate visible icons.
		 */
		function hasContextIcon(link) {
			if (!link || !(link instanceof HTMLAnchorElement)) return false;

			return !!link.querySelector(`.${ICON_CLASS}`);
		}

		/**
		 * addRelNoopener()
		 * ------------------------------------------------------------
		 * Security hardening for target="_blank".
		 */
		function addRelNoopener(link) {
			const rel = (link.getAttribute("rel") || "").split(/\s+/).filter(Boolean);

			if (!rel.includes("noopener")) {
				rel.push("noopener");
				link.setAttribute("rel", rel.join(" "));
				return true;
			}

			return false;
		}

		/**
		 * addVisibleIcon()
		 * ------------------------------------------------------------
		 * Adds a small external-link icon for standard text links.
		 */
		function addVisibleIcon(link) {
			const icon = document.createElement("span");
			icon.className = ICON_CLASS;
			icon.setAttribute("aria-hidden", "true");

			icon.innerHTML =
				'<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3z"></path><path d="M5 5h6v2H7v10h10v-4h2v6H5V5z"></path></svg>';

			link.appendChild(icon);
		}

		/**
		 * addHiddenText()
		 * ------------------------------------------------------------
		 * Adds assistive-only inline context when aria-label is not present.
		 */
		function addHiddenText(link) {
			const hiddenText = document.createElement("span");
			hiddenText.className = TEXT_CLASS;
			hiddenText.textContent = " (opens in a new tab)";

			link.appendChild(hiddenText);
		}

		/**
		 * addNewTabContext()
		 * ------------------------------------------------------------
		 * Adds new-tab context to aria-label when present.
		 * Otherwise, appends visually-hidden text.
		 */
		function addNewTabContext(link) {
			const ariaLabel = (link.getAttribute("aria-label") || "").trim();

			if (ariaLabel) {
				if (!hasNewWindowContextValue(ariaLabel)) {
					link.setAttribute("aria-label", `${ariaLabel} (opens in a new tab)`);
				}

				return "aria-label";
			}

			if (!hasNewWindowContextValue(link.textContent)) {
				addHiddenText(link);
				return "hidden-text";
			}

			return "existing";
		}

		/**
		 * getLinkEnhancementState()
		 * ------------------------------------------------------------
		 * Centralized eligibility and behavior decision.
		 */
		function getLinkEnhancementState(link) {
			if (!(link instanceof HTMLAnchorElement)) {
				return { shouldRun: false, reason: "not-anchor" };
			}

			const href = link.getAttribute("href") || "";
			const trimmedHref = href.trim();

			if (trimmedHref.startsWith("#")) {
				return { shouldRun: false, reason: "same-page-anchor" };
			}

			if (trimmedHref.startsWith("tel:") || trimmedHref.startsWith("mailto:")) {
				return { shouldRun: false, reason: "excluded-protocol" };
			}

			if (link.getAttribute("target") !== "_blank") {
				return { shouldRun: false, reason: "not-new-window-link" };
			}

			if (link.hasAttribute(PROCESSED_ATTR)) {
				return { shouldRun: false, reason: "already-processed" };
			}

			const needsContext = !hasNewWindowContext(link);

			const visibleIconAllowed =
				!hasContextIcon(link) &&
				!isSquarespaceButton(link) &&
				!isNavigationLink(link) &&
				!isImageOnlyLink(link);

			return {
				shouldRun: true,
				needsContext,
				visibleIconAllowed,
				reason: "eligible"
			};
		}

		/**
		 * enhanceLink()
		 * ------------------------------------------------------------
		 * Applies security, visible, and assistive enhancements.
		 */
		function enhanceLink(link) {
			const state = getLinkEnhancementState(link);

			if (!state.shouldRun) return;

			const noopenerAdded = addRelNoopener(link);

			let iconAdded = false;
			let contextMethod = "existing";

			if (state.visibleIconAllowed) {
				addVisibleIcon(link);
				iconAdded = true;
			}

			if (state.needsContext) {
				contextMethod = addNewTabContext(link);
			}

			link.setAttribute(PROCESSED_ATTR, "true");

			const changes = [];

			if (noopenerAdded) {
				changes.push('rel="noopener"');
			}

			if (iconAdded) {
				changes.push("visible icon");
			}

			if (state.needsContext) {
				changes.push(`new-window context via ${contextMethod}`);
			}

			if (!changes.length) {
				changes.push("already had context");
			}

			report(link, `Processed target="_blank" link. Added/verified: ${changes.join(", ")}.`);
		}

		injectHiddenTextStyle();

		document.querySelectorAll('a[target="_blank"]').forEach(enhanceLink);
	};
})(window, document);