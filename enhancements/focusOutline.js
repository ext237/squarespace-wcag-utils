/**
 * Squarespace Accessibility Enhancement – focusOutline.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * Related WCAG Criteria:
 *   - 2.4.7 Focus Visible
 *
 * Description:
 *   Attempts to provide a visible focus outline for interactive elements.
 *   The outline color may be adjusted based on nearby background, text color,
 *   Squarespace color variables, or actual colors found on nearby site elements.
 *
 * Squarespace Context:
 *   - Intended for common Squarespace 7.0 and 7.1 templates.
 *   - Reviews interactive elements that may not have a clearly visible focus state.
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

// TODO: Add listener deduping so focusin/focusout handlers are not attached
// multiple times if this enhancement is called again after Squarespace AJAX
// navigation or delayed script execution.

(function (window, document) {
	"use strict";

	window.sqsA11y = window.sqsA11y || {};
	window.sqsA11y.enhancements = window.sqsA11y.enhancements || {};

	/**
	 * Fix: focusOutline
	 *
	 * Purpose:
	 * Applies a visible custom focus outline to focusable elements when they receive focus,
	 * then restores the prior inline outline styles when focus is lost.
	 *
	 * Why this exists:
	 * Some themes/components suppress or weaken browser focus indicators, which can make
	 * keyboard navigation difficult or impossible to track visually.
	 *
	 * Behavior:
	 * - Watches document-level focusin/focusout events
	 * - Detects whether the event target is focusable
	 * - For normal elements, keeps the original background/text color logic
	 * - For linked images/logos, applies a branded two-layer focus ring
	 * - The branded ring tries manual overrides, Squarespace variables, nearby buttons/links,
	 *   and then falls back to currentColor or black
	 * - Restores previous inline styles on blur
	 *
	 * Options:
	 * @param {Object} options
	 * @param {boolean} [options.debug=false] Enable extra console/debug trace output
	 * @param {string} [options.name] Fix name used in logging
	 * @param {string} [options.wcag] WCAG reference used in logging
	 *
	 * Notes:
	 * - This fix attaches global listeners each time it is called.
	 * - If this function may run more than once, listener deduping should be added elsewhere
	 *   or inside this fix.
	 */
	window.sqsA11y.enhancements.focusOutline = function (options = {}) {
		const debug = !!options.debug;
		const ENH_NAME = options.name || "focusOutline";
		const WCAG = options.wcag || "WCAG 2.4.7";
		const utils = window.sqsA11y.utils || {};

		// Debug logging can get very chatty for this one, as it fires with DOM events,
		// so we have a second debug param specifically for the DOM triggers.
		const debug_domTriggers = false;

		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement called.`, debug);

		/**
		 * Returns true when a CSS color value is effectively transparent.
		 *
		 * @param {string} color
		 * @returns {boolean}
		 */
		function isTransparent(color) {
			if (!color) return true;

			const v = color.trim().toLowerCase();

			return (
				v === "transparent" ||
				v === "rgba(0, 0, 0, 0)" ||
				v === "rgba(0,0,0,0)" ||
				v === "hsla(0, 0%, 0%, 0)" ||
				v === "hsla(0,0%,0%,0)"
			);
		}

		/**
		 * Determines whether an element should receive focus outline treatment.
		 *
		 * @param {Element} el
		 * @returns {boolean}
		 */
		function isFocusable(el) {
			if (!(el instanceof Element)) return false;

			if (el.matches("a[href], button, input, select, textarea, summary")) {
				return true;
			}

			if (el.hasAttribute("tabindex") && el.tabIndex >= 0) {
				return true;
			}

			if (["button", "link"].includes(el.getAttribute("role"))) {
				return true;
			}

			return false;
		}

		/**
		 * Returns true when a focused link contains visual media.
		 *
		 * @param {Element} el
		 * @returns {boolean}
		 */
		function isImageLink(el) {
			if (!(el instanceof HTMLAnchorElement)) return false;

			// Ignore SVG/icons added by our own accessibility helpers.
			const ignoredIconSelectors = [
				".sqs-a11y-new-window-icon",
				".sqs-a11y-visually-hidden",
				"[aria-hidden='true']",
			];

			const clone = el.cloneNode(true);

			ignoredIconSelectors.forEach((selector) => {
				clone.querySelectorAll(selector).forEach((node) => node.remove());
			});

			const hasVisualMedia = !!clone.querySelector("img, picture, svg");

			if (!hasVisualMedia) return false;

			const text = clone.textContent.replace(/\s+/g, "").trim();

			// If there is real visible text left, this is a text link with an icon,
			// not an image-only/logo-style link.
			if (text.length > 0) return false;

			return true;
		}

		/**
		 * Parses rgb() or rgba() colors.
		 *
		 * @param {string} color
		 * @returns {{r:number,g:number,b:number}|null}
		 */
		function parseRgb(color) {
			if (!color || isTransparent(color)) return null;

			const match = color.match(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/i);
			if (!match) return null;

			return {
				r: Number(match[1]),
				g: Number(match[2]),
				b: Number(match[3]),
			};
		}

		/**
		 * Returns relative luminance for an RGB color.
		 *
		 * @param {{r:number,g:number,b:number}} rgb
		 * @returns {number}
		 */
		function getLuminance(rgb) {
			const toLinear = (value) => {
				const s = value / 255;
				return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
			};

			const r = toLinear(rgb.r);
			const g = toLinear(rgb.g);
			const b = toLinear(rgb.b);

			return 0.2126 * r + 0.7152 * g + 0.0722 * b;
		}

		/**
		 * Returns whether a color is useful as a branded accent.
		 *
		 * Avoids transparent colors, near-grays, near-white, and near-black colors.
		 *
		 * @param {string} color
		 * @returns {boolean}
		 */
		function isUsefulAccentColor(color) {
			if (!color || isTransparent(color)) return false;

			const rgb = parseRgb(color);
			if (!rgb) return false;

			const max = Math.max(rgb.r, rgb.g, rgb.b);
			const min = Math.min(rgb.r, rgb.g, rgb.b);

			// Avoid plain gray, black, and white as "brand" accents.
			if (max - min < 18) return false;

			// Avoid colors too close to pure white.
			if (rgb.r > 245 && rgb.g > 245 && rgb.b > 245) return false;

			// Avoid colors too close to pure black.
			if (rgb.r < 10 && rgb.g < 10 && rgb.b < 10) return false;

			return true;
		}

		/**
		 * Finds the nearest solid background color by walking up the DOM.
		 *
		 * @param {Element} el
		 * @returns {string}
		 */
		function getNearestUsableBackgroundColor(el) {
			let node = el;

			while (node && node !== document.documentElement) {
				const bg = getComputedStyle(node).backgroundColor;

				if (!isTransparent(bg)) {
					return bg;
				}

				node = node.parentElement;
			}

			const bodyBg = getComputedStyle(document.body).backgroundColor;
			return !isTransparent(bodyBg) ? bodyBg : "#ffffff";
		}

		/**
		 * Returns black or white for the outer halo based on the nearest background.
		 *
		 * @param {string} bgColor
		 * @returns {string}
		 */
		function getContrastHaloForBackground(bgColor) {
			const rgb = parseRgb(bgColor);

			if (!rgb) return "#000000";

			return getLuminance(rgb) > 0.5 ? "#000000" : "#ffffff";
		}

		/**
		 * Safely reads a CSS custom property from a root element.
		 *
		 * @param {Element} root
		 * @param {string} varName
		 * @returns {string}
		 */
		function getCssVarValue(root, varName) {
			if (!(root instanceof Element)) return "";

			return getComputedStyle(root).getPropertyValue(varName).trim();
		}

		/**
		 * Attempts to resolve a useful accent color from Squarespace 7.1 variables.
		 *
		 * These variables are not guaranteed, especially on Squarespace 7.0,
		 * so this is only one signal.
		 *
		 * @param {Element} el
		 * @returns {string}
		 */
		function getSquarespaceVariableAccentColor(el) {
			const rootsToCheck = [
				el,
				el.closest(".page-section"),
				el.closest("section"),
				el.closest("header"),
				document.documentElement,
			].filter(Boolean);

			const varsToTry = [
				"--primaryButtonBackgroundColor",
				"--secondaryButtonBackgroundColor",
				"--tertiaryButtonBackgroundColor",
				"--primaryButtonTextColor",
				"--secondaryButtonTextColor",
				"--tertiaryButtonTextColor",
				"--siteAccentColor",
				"--accentColor",
				"--navigationLinkColor",
				"--headingColor",
			];

			for (const root of rootsToCheck) {
				for (const varName of varsToTry) {
					const value = getCssVarValue(root, varName);

					if (isUsefulAccentColor(value)) {
						return value;
					}
				}
			}

			return "";
		}

		/**
		 * Checks real page elements for a useful accent color.
		 *
		 * This is intended to work across Squarespace 7.0 and 7.1 by inspecting
		 * actual computed styles from buttons, navigation links, and other anchors.
		 *
		 * @param {Element} el
		 * @returns {string}
		 */
		function getComputedPageAccentColor(el) {
			const selectorsToTry = [
				".sqs-button-element--primary",
				".sqs-button-element--secondary",
				".sqs-button-element--tertiary",
				".sqs-block-button-element",
				".Header-actions a",
				".header-actions a",
				".Header-nav a",
				".header-nav a",
				".Header-menu-nav a",
				".header-menu-nav a",
				"nav a",
				"button",
				"a",
			];

			const scopesToCheck = [
				el.closest("header"),
				el.closest(".page-section"),
				el.closest("section"),
				el.closest("main"),
				document.body,
			].filter(Boolean);

			for (const scope of scopesToCheck) {
				for (const selector of selectorsToTry) {
					const candidates = Array.from(scope.querySelectorAll(selector));

					for (const candidate of candidates) {
						if (!(candidate instanceof Element)) continue;
						if (candidate === el || el.contains(candidate)) continue;

						const cs = getComputedStyle(candidate);

						if (isUsefulAccentColor(cs.backgroundColor)) {
							return cs.backgroundColor;
						}

						if (isUsefulAccentColor(cs.borderColor)) {
							return cs.borderColor;
						}

						if (isUsefulAccentColor(cs.color)) {
							return cs.color;
						}
					}
				}
			}

			return "";
		}

		/**
		 * Determines a brand-aware accent color for linked images/logos.
		 *
		 * Priority:
		 * 1. Manual override on the focused link
		 * 2. Manual override on a child image/media element
		 * 3. Squarespace 7.1 CSS variables, when available
		 * 4. Actual computed styles from nearby page elements
		 * 5. Current link color, if useful
		 * 6. Black fallback
		 *
		 * @param {Element} el
		 * @returns {string}
		 */
		function getSiteAccentColor(el) {
			const override =
				el.getAttribute("data-sqs-a11y-focus-color") ||
				el.querySelector("[data-sqs-a11y-focus-color]")?.getAttribute("data-sqs-a11y-focus-color") ||
				"";

			if (override && !isTransparent(override)) {
				return override;
			}

			const variableAccent = getSquarespaceVariableAccentColor(el);

			if (variableAccent) {
				return variableAccent;
			}

			const computedAccent = getComputedPageAccentColor(el);

			if (computedAccent) {
				return computedAccent;
			}

			const currentColor = getComputedStyle(el).color;

			if (isUsefulAccentColor(currentColor)) {
				return currentColor;
			}

			return "#000000";
		}

		/**
		 * Returns the media element used to estimate border radius for image links.
		 *
		 * @param {Element} el
		 * @returns {Element|null}
		 */
		function getImageLinkMedia(el) {
			if (!isImageLink(el)) return null;

			return el.querySelector("img, picture, svg");
		}

		/**
		 * Applies the custom outline and stores prior inline values so they can be restored later.
		 *
		 * Outline color preference:
		 * 1. For image links, use a branded two-layer focus ring.
		 * 2. Otherwise use element background-color, if usable.
		 * 3. Otherwise use element text color, if usable.
		 *
		 * @param {Element} el
		 */
		function applyOutline(el) {
			// Store prior inline styles only once so we can restore them on blur.
			if (el.dataset.prevOutline === undefined) {
				el.dataset.prevOutline = el.style.outline || "";
				el.dataset.prevOutlineOffset = el.style.outlineOffset || "";
			}

			if (isImageLink(el)) {
				const accent = getSiteAccentColor(el);
				const nearbyBg = getNearestUsableBackgroundColor(el);
				const halo = getContrastHaloForBackground(nearbyBg);
				const media = getImageLinkMedia(el);
				const mediaRadius = media ? getComputedStyle(media).borderRadius : "";
				const radius = mediaRadius && mediaRadius !== "0px" ? mediaRadius : "2px";

				if (el.dataset.prevBoxShadow === undefined) {
					el.dataset.prevBoxShadow = el.style.boxShadow || "";
				}

				if (el.dataset.prevBorderRadius === undefined) {
					el.dataset.prevBorderRadius = el.style.borderRadius || "";
				}

				if (el.dataset.prevDisplay === undefined) {
					el.dataset.prevDisplay = el.style.display || "";
				}

				// el.style.display = "inline-block";
				el.style.outline = `2px solid ${accent}`;
				el.style.outlineOffset = "1px";
				el.style.boxShadow = `0 0 15px 2px ${halo}`;
				el.style.borderRadius = radius;

				utils.reportUpdate(
					el,
					ENH_NAME,
					`(${WCAG}) Applied branded two-layer outline for image link. Accent: ${accent}, Halo: ${halo}`,
					debug,
				);

				return;
			}

			const cs = getComputedStyle(el);
			const bg = cs.backgroundColor;
			const color = cs.color;

			let chosen = "";

			if (!isTransparent(bg)) {
				chosen = bg;
				utils.reportUpdate(
					el,
					ENH_NAME,
					`(${WCAG}) Chose Background Color (${el.id}) ${chosen}`,
					debug,
				);
			} else if (!isTransparent(color)) {
				chosen = color;
				utils.reportUpdate(el, ENH_NAME, `(${WCAG}) Chose Text Color (${el.id}) ${chosen}`, debug);
			}

			if (!chosen) {
				chosen = "#000000";
				utils.reportUpdate(
					el,
					ENH_NAME,
					`(${WCAG}) Chose fallback outline color (${el.id}) ${chosen}`,
					debug,
				);
			}

			el.style.outline = `2px solid ${chosen}`;
			el.style.outlineOffset = "3px";

			if (el.matches("input, select, textarea")) {
				if (el.dataset.prevBackgroundColor === undefined) {
					el.dataset.prevBackgroundColor = el.style.backgroundColor || "";
					el.dataset.prevColor = el.style.color || "";
				}

				el.style.backgroundColor = "#fff9d6"; // light yellow
				el.style.color = "#000000"; // black text
			}

			if (debug_domTriggers) {
				utils.reportUpdate(el, ENH_NAME, `(${WCAG}) outline applied using color: ${chosen}`, debug);
			}
		}

		/**
		 * Restores the element's prior inline outline styles.
		 *
		 * @param {Element} el
		 */
		function clearOutline(el) {
			if (el.dataset.prevOutline !== undefined) {
				el.style.outline = el.dataset.prevOutline;
				delete el.dataset.prevOutline;
			} else {
				el.style.outline = "";
			}

			if (el.dataset.prevOutlineOffset !== undefined) {
				el.style.outlineOffset = el.dataset.prevOutlineOffset;
				delete el.dataset.prevOutlineOffset;
			} else {
				el.style.outlineOffset = "";
			}

			if (el.dataset.prevBoxShadow !== undefined) {
				el.style.boxShadow = el.dataset.prevBoxShadow;
				delete el.dataset.prevBoxShadow;
			}

			if (el.dataset.prevBorderRadius !== undefined) {
				el.style.borderRadius = el.dataset.prevBorderRadius;
				delete el.dataset.prevBorderRadius;
			}

			if (el.dataset.prevDisplay !== undefined) {
				el.style.display = el.dataset.prevDisplay;
				delete el.dataset.prevDisplay;
			}

			if (el.matches("input, select, textarea")) {
				if (el.dataset.prevBackgroundColor !== undefined) {
					el.style.backgroundColor = el.dataset.prevBackgroundColor;
					delete el.dataset.prevBackgroundColor;
				}

				if (el.dataset.prevColor !== undefined) {
					el.style.color = el.dataset.prevColor;
					delete el.dataset.prevColor;
				}
			}

			if (debug_domTriggers) {
				utils.reportUpdate(el, ENH_NAME, `(${WCAG}) outline removed`, debug);
			}
		}

		/**
		 * Handles focus entering an element.
		 *
		 * Debug coverage:
		 * - confirms focusin fired
		 * - confirms whether target is focusable
		 * - confirms outline was applied
		 *
		 * @param {FocusEvent} e
		 */
		function handleFocus(e) {
			const el = e.target;

			if (debug_domTriggers) {
				utils.reportUpdate(
					el,
					ENH_NAME,
					`(${WCAG}) focusin event detected on <${el?.tagName?.toLowerCase() || "unknown"}>`,
					debug,
				);
			}

			if (!isFocusable(el)) {
				if (debug_domTriggers) {
					utils.reportUpdate(
						el,
						ENH_NAME,
						`(${WCAG}) focusin ignored, element is not focusable`,
						debug,
					);
				}
				return;
			}

			applyOutline(el);

			if (debug_domTriggers) {
				utils.reportUpdate(el, ENH_NAME, `(${WCAG}) - focus outline applied`, debug);
			}
		}

		/**
		 * Handles focus leaving an element.
		 *
		 * Debug coverage:
		 * - confirms focusout fired
		 * - confirms whether target is focusable
		 * - confirms outline was cleared
		 *
		 * @param {FocusEvent} e
		 */
		function handleBlur(e) {
			const el = e.target;

			if (!isFocusable(el)) {
				if (debug_domTriggers) {
					utils.reportUpdate(
						el,
						ENH_NAME,
						`(${WCAG}) focusout ignored, element is not focusable`,
						debug,
					);
				}
				return;
			}

			clearOutline(el);
		}

		// Attach global listeners so dynamically loaded focusable elements are also covered.
		document.addEventListener("focusin", handleFocus);
		document.addEventListener("focusout", handleBlur);

		if (debug_domTriggers) {
			utils.reportUpdate(null, ENH_NAME, `(${WCAG}) listeners attached`, debug);
		}

		utils.reportUpdate(null, ENH_NAME, `(${WCAG}) - Enhancement complete.`, debug);
	};
})(window, document);
