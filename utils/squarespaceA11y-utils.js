/**
 * Squarespace Accessibility Utilities – squarespaceA11y-utils.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * Shared helper functions for Squarespace WCAG enhancements
 * Converted for non-module loader compatibility.
 */



(function (window, document) {
	window.sqsA11y = window.sqsA11y || {};
	window.sqsA11y.utils = window.sqsA11y.utils || {};
	const utils = window.sqsA11y.utils;

	// ------------------------------------------------------------
	// logNodeAction()
	// ------------------------------------------------------------
	utils.logNodeAction = function (node, action) {
		// will suppress logging if logging is set to false, otherwise defaults to logging
		if (!window.sqsA11y || !window.sqsA11y.config || window.sqsA11y.config.logging === true) {
			console.log(`[sqsA11y-utils] ${action}:`, node);
		}
	};

	// ------------------------------------------------------------
	// safeQuery()
	// ------------------------------------------------------------
	utils.safeQuery = function (selector) {
		const node = document.querySelector(selector);
		if (!node && (!window.sqsA11y || !window.sqsA11y.config || window.sqsA11y.config.logging === true)) {
			console.warn(`[sqsA11y-utils] Missing selector: ${selector}`);
		}
		return node;
	};

	// ------------------------------------------------------------
	// cssRuleExists()
	// ------------------------------------------------------------
	utils.cssRuleExists = function (selector) {
		for (const sheet of Array.from(document.styleSheets)) {
			let rules;
			try {
				rules = sheet.cssRules;
				if (!rules) continue;
			} catch {
				continue;
			}

			for (const rule of rules) {
				if (rule.selectorText && rule.selectorText.includes(selector)) {
					return true;
				}
			}
		}
		return false;
	};

	/**
	 * Finds the nearest human-readable text node in the DOM
	 * relative to a given element (e.g., a linked image).
	 *
	 * @param {HTMLElement} el - The reference element (typically an <a> or <img>).
	 * @param {number} [maxDepth=6] - How many levels upward to climb.
	 * @returns {string|null} The nearest meaningful text content.
	 */
	// ------------------------------------------------------------------
	// Readable text extractor with proper spacing between inline elements
	// ------------------------------------------------------------------
	// utils.getReadableText = function (node) {
	// 	if (!node) return "";

	// 	// Clone the node so we don't mutate the DOM
	// 	const clone = node.cloneNode(true);

	// 	// Replace <br> and block-level tags with spaces
	// 	const blockTags = /^(DIV|P|SECTION|ARTICLE|HEADER|FOOTER|LI|FIGURE|H1|H2|H3|H4|H5|H6)$/;
	// 	clone.querySelectorAll("br").forEach((br) => (br.textContent = " "));
	// 	clone.querySelectorAll("*").forEach((el) => {
	// 		if (blockTags.test(el.tagName)) el.appendChild(document.createTextNode(" "));
	// 	});

	// 	const text = clone.textContent.replace(/\s+/g, " ").trim();
	// 	return text || "";
	// };

	utils.getReadableText = function (node) {
		//if (!node) return "";

		//Ensures you only process element nodes
		//Prevents errors if a text/comment node slips in during DOM changes
		if (!node || node.nodeType !== 1) return "";

		// ✅ FAST PATH: simple text nodes
		if (node.childNodes.length === 1 && node.firstChild.nodeType === Node.TEXT_NODE) {
			return node.textContent.trim();
		}

		// ✅ FAST PATH: no child elements at all
		if (node.childElementCount === 0) {
			return node.textContent.trim();
		}

		// ✅ FAST PATH: no structural tags
		//if (!node.querySelector || !node.querySelector("br, div, p, section, article, li, ul, ol")) {

		// guarantee safe execution, prevent errors on DOM mutations
		if (
			typeof node.querySelector !== "function" ||
			!node.querySelector("br, div, p, section, article, li, ul, ol")
		) {
			return node.textContent.replace(/\s+/g, " ").trim();
		}

		// ❗ fallback to existing heavy logic
		const clone = node.cloneNode(true);

		const blockTags = /^(DIV|P|SECTION|ARTICLE|LI|FIGURE|H1|H2|H3|H4|H5|H6)$/;
		clone.querySelectorAll("br").forEach((br) => (br.textContent = " "));
		clone.querySelectorAll("*").forEach((el) => {
			if (blockTags.test(el.tagName)) {
				el.appendChild(document.createTextNode(" "));
			}
		});

		//return clone.textContent.replace(/\s+/g, " ").trim();

		// If cloning/processing strips too much, fallback to original text
		// Prevents false “no text” situations
		const result = clone.textContent.replace(/\s+/g, " ").trim();
		return result.length ? result : node.textContent.trim();
	};

	// ------------------------------------------------------------------
	// Finds the nearest human-readable text node surrounding an element
	// ------------------------------------------------------------------
	utils.findNearestTextNode = function (el, maxDepth = 5) {
		if (!(el instanceof HTMLElement)) return null;

		let current = el.closest(".sqs-block, .col, section, article, div") || el;

		for (let depth = 0; depth < maxDepth && current; depth++) {
			// previous siblings
			let prev = current.previousSibling;
			while (prev) {
				//const txt = prev.nodeType === Node.TEXT_NODE ? prev.textContent.trim() : utils.getReadableText(prev);
				const txt =
					prev.nodeType === Node.TEXT_NODE
						? (prev.textContent || "").trim()
						: utils.getReadableText(prev);
				if (txt && txt.length > 2) return txt;
				prev = prev.previousSibling;
			}

			// next siblings
			let next = current.nextSibling;
			while (next) {
				//const txt = next.nodeType === Node.TEXT_NODE ? next.textContent.trim() : utils.getReadableText(next);
				const txt =
					next.nodeType === Node.TEXT_NODE
						? (next.textContent || "").trim()
						: utils.getReadableText(next);
				if (txt && txt.length > 2) return txt;
				next = next.nextSibling;
			}

			// move up the DOM
			current = current.parentElement;
		}

		return null;
	};

	function isVisible(el) {
		return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
	}

	/**
	 * Find visible or alt text for other <a> elements on the same page
	 * sharing the same href.
	 *
	 * @param {string} url - The href value to search for.
	 * @returns {string|null} The first meaningful text found, or null if none.
	 */
	utils.findLinkText = function (url) {
		if (!url) return null;

		let targetHref;
		try {
			targetHref = new URL(url, document.baseURI).href;
		} catch {
			return null;
		}

		const anchors = Array.from(document.querySelectorAll("a[href]")).filter((a) => {
			try {
				return new URL(a.getAttribute("href"), document.baseURI).href === targetHref;
			} catch {
				return false;
			}
		});

		for (const a of anchors) {
			if (!isVisible(a)) continue;

			// 1) Visible text (preserves spacing across inline tags and <br>)
			const text = utils.getReadableText(a);
			if (text) return text;

			// 2) Alt text on images inside
			// const imgWithAlt = a.querySelector ? a.querySelector("img[alt]") : null;
			// if (imgWithAlt && imgWithAlt.alt.trim()) {
			// 	return imgWithAlt.alt.trim();
			// }

			// 2) Alt text on images inside
			// Prevents using hidden image alt text as visible link context. Improves accuracy for WCAG 2.4.4 (Link Purpose)
			const imgWithAlt = a.querySelector ? a.querySelector("img[alt]") : null;
			if (imgWithAlt && isVisible(imgWithAlt) && imgWithAlt.alt.trim()) {
				return imgWithAlt.alt.trim();
			}
		}

		return null;
	};

	// ------------------------------------------------------------
	// Normalizes whitespace in a string without altering meaning or casing.
	// ------------------------------------------------------------
	utils.normalizeWhitespace = function (str) {
		return String(str || "") // - Ensures the value is treated as a string
			.replace(/\s+/g, " ") // - Replaces multiple spaces, tabs, or line breaks with a single space
			.trim(); // - Trims leading and trailing whitespace
	};

	// ------------------------------------------------------------
	// Extracts the email address from a mailto: href.
	// Removes the mailto: prefix and ignores query values like ?subject=...
	// ------------------------------------------------------------
	utils.getEmailAddressFromHref = function (href) {
		return String(href || "")
			.replace(/^mailto:/i, "")
			.split("?")[0]
			.trim();
	};

	// ------------------------------------------------------------
	// injectStyleOnce()
	// ------------------------------------------------------------
	// Injects a <style> block into the document head if it doesn't already exist.
	// TODO: The selector argument is currently unused. Consider using it as the target for the style injection or remove it if unnecessary.
	utils.injectStyleOnce = function (id, selector, cssText, debug) {
		const loggingEnabled = debug === true;// || window.sqsA11y?.config?.logging !== false;

		try {
			if (document.getElementById(id)) {
				if (loggingEnabled) {
					console.log(`[sqsA11y-utils] Style already exists: ${id}`);
				}
				return false;
			}

			const style = document.createElement("style");
			style.id = id;
			style.textContent = cssText;
			document.head.appendChild(style);

			if (loggingEnabled) {
				console.log(`[sqsA11y-utils] Injected ${id}`);
			}

			return true;
		} catch (err) {
			if (loggingEnabled) {
				console.warn(`[sqsA11y-utils] injectStyleOnce() failed:`, err);
			}
			return false;
		}
	};

	// ------------------------------------------------------------
	// getMainTarget()
	// ------------------------------------------------------------
	utils.getMainTarget = function () {
		// Prefer semantic main
		const mainEl = document.querySelector("main") || document.querySelector('[role="main"]');

		const targetEl = mainEl || document.querySelector("h1");
		if (!targetEl) return null;

		const EXISTING_ID = "main-content";
		const existing = document.getElementById(EXISTING_ID);

		// If a valid target already has the correct ID, reuse it
		if (existing) {
			// If it's the same element, we're done
			if (existing === targetEl) return existing;

			// If another element already owns the ID, use that instead
			return existing;
		}

		// Assign stable ID once
		if (!targetEl.id) {
			targetEl.id = EXISTING_ID;
		}

		return targetEl;
	};

	// ------------------------------------------------------------
	// appendDataTraceAttr()
	// ------------------------------------------------------------
	utils.appendDataTraceAttr = function (el, text) {
		if (!el || !text) return;

		const maxChunkLength = 120;

		// Read existing trace entries.
		const prev = el.getAttribute("data-trace") || "";

		// Clean existing entries and remove old prefixes if present.
		const existingEntries = prev
			.replace(/\[sqsA11y\]:/g, "")
			.split("|")
			.map((entry) => entry.trim())
			.filter(Boolean);

		// Clean and truncate incoming text.
		let cleanText = String(text)
			.replace(/\[sqsA11y\]:/g, "")
			.trim();

		if (!cleanText) return;

		if (cleanText.length > maxChunkLength) {
			cleanText = cleanText.slice(0, maxChunkLength);
		}

		// Avoid duplicate trace entries on repeated runs.
		if (!existingEntries.includes(cleanText)) {
			existingEntries.push(cleanText);
		}

		const final = existingEntries.join(" | ");

		el.setAttribute("data-trace", final);
		return final;
	};

	// ------------------------------------------------------------
	// reportUpdate()
	// ------------------------------------------------------------
	utils.reportUpdate = function (element, enhanseName, description, debug) {
		utils.reportFix(element, enhanseName, description, debug);
	};

	// ------------------------------------------------------------
	// reportFix()
	// ------------------------------------------------------------
	utils.reportFix = function (element, enhanceName, description, debug) {
		const hasEnhanceName = enhanceName && String(enhanceName).trim().length > 0;
		const entry = hasEnhanceName ? `${enhanceName} - ${description}` : description;
		const PREFIX = "[sqsA11y]:";
		const loggingEnabled =
			typeof debug === "boolean"
				? debug
				: !window.sqsA11y || !window.sqsA11y.config || window.sqsA11y.config.logging !== false;
		const elementId =
			element && element.id && element.id.trim()
				? element.id.trim()
				: element && element.name && element.name.trim()
					? element.name.trim()
					: "DOM element";

		// Append trace if element exists
		if (element) {
			utils.appendDataTraceAttr(element, entry);
		}

		// Logging
		if (loggingEnabled) {
			if (element) {
				console.log(
					hasEnhanceName
						? `${PREFIX} [${enhanceName}] ${description} (${elementId})`
						: `[sqsA11y] ${description} (${elementId})`,
				);
			} else {
				console.log(hasEnhanceName ? `${PREFIX} [${enhanceName}] ${description} ` : `[sqsA11y] ${description}`);
			}
		}
	};

	/**
	 * getLabelText()
	 * ----------------------------------------------------------------
	 * Purpose:
	 *   Extract visible or implied label text for a given form element.
	 *   Useful for accessibility enhancements that need human-readable context.
	 *
	 * Behavior:
	 *   - Checks multiple label sources:
	 *       1. <label for="id"> text
	 *       2. Wrapped <label> text
	 *       3. aria-labelledby references
	 *       4. Squarespace form wrapper class names
	 *   - Returns a normalized (lowercased, cleaned) text string.
	 *
	 * Dependencies:
	 *   - utils.normalize
	 *   - window.CSS.escape (polyfilled earlier)
	 *
	 * Parameters:
	 *   el → DOM element (usually an <input>, <textarea>, or <select>)
	 *
	 * Returns:
	 *   String → normalized label text, or an empty string if none found.
	 */
	utils.getLabelText = function (el) {
		let txt = "";
		if (!el) return txt;

		// (1) <label for="id">
		if (el.id) {
			const safeId = window.CSS && window.CSS.escape ? window.CSS.escape(el.id) : el.id;
			const lbl = document.querySelector('label[for="' + safeId + '"]');
			if (lbl) txt += " " + lbl.textContent;
		}

		// (2) Wrapped <label>
		const wrap = el.closest && el.closest("label");
		if (wrap) txt += " " + wrap.textContent;

		// (3) aria-labelledby
		const al = el.getAttribute("aria-labelledby");
		if (al) {
			al.split(/\s+/).forEach((id) => {
				const n = document.getElementById(id);
				if (n) txt += " " + n.textContent;
			});
		}

		// (4) Squarespace-specific wrapper class hints
		const fieldWrap = el.closest && el.closest(".form-item.field");
		// Prevents strings like form-item field required from being treated as meaningful label text
		if (fieldWrap && fieldWrap.className) {
			const cleaned = fieldWrap.className.replace(/[\-_]/g, " ");
			txt += " " + cleaned;
		}

		//return utils.normalize ? utils.normalize(txt) : txt.trim().toLowerCase();

		const result = utils.normalize ? utils.normalize(txt) : txt.trim().toLowerCase();
		return result.length > 150 ? result.slice(0, 150) : result;
	};

	/**
	 * hasWord()
	 * ----------------------------------------------------------------
	 * Purpose:
	 *   Check whether a given word appears as a standalone term within
	 *   a string — not just as part of another word.
	 *
	 * Behavior:
	 *   - Uses a word-boundary regex to find exact matches.
	 *   - Handles null/undefined inputs safely.
	 *   - Useful for detecting vague link text like “read more” or “click here.”
	 *
	 * Parameters:
	 *   s → Source string (can be null or undefined)
	 *   w → Word to search for
	 *
	 * Returns:
	 *   Boolean → true if the word exists as a separate word, false otherwise.
	 */
	utils.hasWord = function (s, w) {
		const safe = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		return new RegExp("(^|\\W)" + safe + "(\\W|$)").test(s || "");
	};

	/**
	 * normalize()
	 * ----------------------------------------------------------------
	 * Purpose:
	 *   Normalize strings for consistent comparison.
	 *   Strips punctuation, symbols, extra spaces, and converts to lowercase.
	 *
	 * Typical Use:
	 *   Used in linkPurposeEnhancer or text-comparison logic.
	 */
	utils.normalize = function (s) {
		return String(s || "")
			.replace(/[_\-:/\\]+/g, " ")
			.replace(/\s+/g, " ")
			.trim()
			.toLowerCase();
	};

	/**
	 * guessToken()
	 * ----------------------------------------------------------------
	 * Purpose:
	 *   Infer the correct autocomplete token for a form input element
	 *   based on its attributes, labels, placeholders, and context.
	 *
	 * Behavior:
	 *   - Checks the element’s type first for strong signals.
	 *   - Aggregates and normalizes text clues from multiple sources:
	 *       label text, name, id, and placeholder.
	 *   - Uses keyword matching to detect semantic intent
	 *     (e.g., "email", "first name", "zip", "company").
	 *
	 * Dependencies:
	 *   - utils.getLabelText()
	 *   - utils.normalize()
	 *   - utils.hasWord()
	 *
	 * Parameters:
	 *   el → The input element to analyze.
	 *
	 * Returns:
	 *   String → autocomplete token (e.g., "email", "given-name"),
	 *             or null if no suitable match.
	 */
	utils.guessToken = function (el) {
		if (!el) return null;

		// (1) Strong signals from type
		const t = (el.type || "").toLowerCase();
		if (t === "email") return "email";
		if (t === "tel") return "tel";
		if (t === "url") return "url";

		// (2) Aggregate text context
		const label = utils.getLabelText ? utils.getLabelText(el) : "";
		const name = utils.normalize(el.getAttribute("name"));
		const id = utils.normalize(el.id);
		const ph = utils.normalize(el.getAttribute("placeholder"));
		const all = [label, name, id, ph].join(" ");

		// (3) Common patterns
		if (utils.hasWord(all, "email") || utils.hasWord(all, "e mail")) return "email";
		if (
			utils.hasWord(all, "phone") ||
			utils.hasWord(all, "tel") ||
			utils.hasWord(all, "mobile") ||
			utils.hasWord(all, "cell")
		)
			return "tel";

		// (4) Name-related
		if (utils.hasWord(all, "first") && utils.hasWord(all, "name")) return "given-name";
		if (utils.hasWord(all, "last") && utils.hasWord(all, "name")) return "family-name";
		if (utils.hasWord(all, "middle") && utils.hasWord(all, "name")) return "additional-name";
		if (utils.hasWord(all, "name")) return "name";

		// (5) Organization
		if (
			utils.hasWord(all, "company") ||
			utils.hasWord(all, "organization") ||
			utils.hasWord(all, "organisation") ||
			utils.hasWord(all, "business")
		)
			return "organization";

		// (6) Address fields
		if (
			(utils.hasWord(all, "address") && (utils.hasWord(all, "line") || /address\s*1\b/.test(all))) ||
			/\baddr(?:ess)?\s*1\b/.test(all)
		)
			return "address-line1";
		if ((utils.hasWord(all, "address") && utils.hasWord(all, "2")) || /\baddr(?:ess)?\s*2\b/.test(all))
			return "address-line2";
		if (utils.hasWord(all, "street") || (utils.hasWord(all, "address") && !/\bline\b/.test(all)))
			return "street-address";

		// (7) Location
		if (utils.hasWord(all, "city") || utils.hasWord(all, "town") || utils.hasWord(all, "locality"))
			return "address-level2";
		if (utils.hasWord(all, "state") || utils.hasWord(all, "province") || utils.hasWord(all, "region"))
			return "address-level1";
		if (utils.hasWord(all, "zip") || utils.hasWord(all, "postal")) return "postal-code";
		if (utils.hasWord(all, "country")) return "country-name";

		// (8) Website
		if (utils.hasWord(all, "website") || utils.hasWord(all, "url")) return "url";

		// (9) Ignore non-targets
		if (utils.hasWord(all, "message") || utils.hasWord(all, "comments") || utils.hasWord(all, "notes"))
			return null;
		if (utils.hasWord(all, "date") || utils.hasWord(all, "time")) return null;

		return null;
	};

	/**
	 * createTraceDataAttr()
	 * ----------------------------------------------------------------
	 * Purpose:
	 *   Append or create a `data-wcag-enhance` attribute on an element,
	 *   recording which accessibility enhancement was applied and when.
	 *
	 * Behavior:
	 *   - Appends new trace entries instead of overwriting existing ones.
	 *   - Adds an ISO timestamp to each entry for debugging or audits.
	 *   - Skips invalid (non-Element) targets.
	 *
	 * Parameters:
	 *   el       → DOM element being modified.
	 *   enhanceText  → Description of the enhancement.
	 *
	 * Returns:
	 *   void
	 */
	utils.createTraceDataAttr = function (el, enhanceText) {
		if (!(el instanceof Element)) return;

		const timestamp = new Date().toISOString();
		const existing = el.getAttribute("data-wcag-enhance");

		let newValue = enhanceText.includes("@") ? enhanceText : `${enhanceText} @ ${timestamp}`;
		if (existing && !existing.includes(enhanceText)) {
			newValue = `${existing} | ${newValue}`;
		}

		el.setAttribute("data-wcag-enhance", newValue);
		if (!window.sqsA11y || !window.sqsA11y.config || window.sqsA11y.config.logging === true) {
			console.info(`[WCAG] ${enhanceText} applied to`, el);
		}
	};

	/**
	 * utils.scanFormControls(callback)
	 * ----------------------------------------------------------------
	 * Scans all form controls and runs a callback on each.
	 * Returns aggregated {updated, cleaned, skipped, controlCount}.
	 */
	utils.scanFormControls = function (callback) {
		const controls = document.querySelectorAll("form input, form select, form textarea");
		let totalUpdated = 0,
			totalCleaned = 0,
			totalSkipped = 0;

		controls.forEach((el) => {
			if (el.type === "hidden" || el.hasAttribute("aria-hidden")) return;
			const res = callback(el);
			if (res) {
				totalUpdated += res.updated || 0;
				totalCleaned += res.cleaned || 0;
				totalSkipped += res.skipped || 0;
			}
		});

		return {
			updated: totalUpdated,
			cleaned: totalCleaned,
			skipped: totalSkipped,
			controlCount: controls.length,
		};
	};

	/**
	 * utils.observeFormsForChanges(callback)
	 * ----------------------------------------------------------------
	 * Observes DOM mutations for form additions/changes and re-runs
	 * the provided callback when form elements appear or change.
	 */
	utils.observeFormsForChanges = function (callback) {
		try {
			let timer;

			const observer = new MutationObserver((muts) => {
				const shouldScan = muts.some(
					(m) =>
						(m.type === "childList" &&
							Array.from(m.addedNodes || []).some(
								(n) =>
									n.nodeType === 1 &&
									(n.matches?.("input,select,textarea,form") ||
										n.querySelector?.("input,select,textarea,form")),
							)) ||
						(m.type === "attributes" && m.target?.matches?.("input,select,textarea")),
				);
				//if (shouldScan) callback();
				if (shouldScan) {
					clearTimeout(timer);
					timer = setTimeout(callback, 200);
				}
			});

			observer.observe(document.body, {
				subtree: true,
				childList: true,
				attributes: true,
				attributeFilter: ["type", "autocomplete", "id", "class"],
			});

			if (!window.sqsA11y || !window.sqsA11y.config || window.sqsA11y.config.logging === true) {
				console.info("[sqsA11y] Form observer attached.");
			}
		} catch (e) {
			console.warn("[sqsA11y]  Form observer failed:", e);
		}
	};

	/**
	 * utils.parseRgbString(colorString)
	 * ----------------------------------------------------------------
	 * Parses an rgb(...) or rgba(...) CSS color string and returns
	 * an object with numeric r, g, b, and a values.
	 *
	 * @param {string} colorString
	 * @returns {{r:number,g:number,b:number,a:number}|null}
	 */
	utils.parseRgbString = function (colorString) {
		if (!colorString || typeof colorString !== "string") return null;

		const match = colorString.match(
			/rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+))?\s*\)/i,
		);

		if (!match) return null;

		return {
			r: Math.round(Number(match[1])),
			g: Math.round(Number(match[2])),
			b: Math.round(Number(match[3])),
			a: match[4] !== undefined ? Number(match[4]) : 1,
		};
	};

	/**
	 * utils.rgbToHex(rgb)
	 * ----------------------------------------------------------------
	 * Converts an RGB object into a hex color string such as #ffffff.
	 *
	 * @param {{r:number,g:number,b:number}} rgb
	 * @returns {string}
	 */
	utils.rgbToHex = function (rgb) {
		const toHex = (value) => {
			const clamped = Math.max(0, Math.min(255, Math.round(value)));
			return clamped.toString(16).padStart(2, "0");
		};

		return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
	};

	/**
	 * utils.getPerceivedBrightness(rgb)
	 * ----------------------------------------------------------------
	 * Returns the perceived brightness of an RGB color using a standard
	 * weighted formula. Higher values are lighter; lower values are darker.
	 *
	 * @param {{r:number,g:number,b:number}} rgb
	 * @returns {number}
	 */
	utils.getPerceivedBrightness = function (rgb) {
		return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
	};

	/**
	 * utils.getComplementaryContrastColor(rgb)
	 * ----------------------------------------------------------------
	 * Returns an inverted version of the provided RGB color. If the inverted
	 * result is still too close in brightness to the source color, the function
	 * falls back to either black or white for stronger contrast.
	 *
	 * @param {{r:number,g:number,b:number}} rgb
	 * @returns {{r:number,g:number,b:number}}
	 */
	utils.getComplementaryContrastColor = function (rgb) {
		const inverted = {
			r: 255 - rgb.r,
			g: 255 - rgb.g,
			b: 255 - rgb.b,
		};

		const backgroundBrightness = utils.getPerceivedBrightness(rgb);
		const invertedBrightness = utils.getPerceivedBrightness(inverted);
		const brightnessDelta = Math.abs(backgroundBrightness - invertedBrightness);

		// If the inverted color is still too close in brightness,
		// fall back to black or white for stronger visibility.
		if (brightnessDelta < 125) {
			return backgroundBrightness > 140 ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
		}

		return inverted;
	};

	/**
	 * utils.getBackgroundColorFromElement(element)
	 * ----------------------------------------------------------------
	 * Attempts to retrieve a usable solid background color from a single
	 * element by checking computed background-color first, then background.
	 *
	 * Returns an RGB object when a non-transparent rgb/rgba background is found.
	 *
	 * @param {Element} element
	 * @returns {{r:number,g:number,b:number,a:number}|null}
	 */
	utils.getBackgroundColorFromElement = function (element) {
		if (!element || !(element instanceof Element)) return null;

		const style = window.getComputedStyle(element);
		if (!style) return null;

		// Prefer explicit background-color first
		const bgColor = utils.parseRgbString(style.backgroundColor);
		if (bgColor && bgColor.a > 0) {
			return bgColor;
		}

		// Fallback: try parsing background if it contains rgb/rgba
		const bg = utils.parseRgbString(style.background);
		if (bg && bg.a > 0) {
			return bg;
		}

		return null;
	};

	/**
	 * utils.getClosestAncestorBackgroundColor(el)
	 * ----------------------------------------------------------------
	 * Walks up the DOM from the provided element until it finds the nearest
	 * ancestor with a usable non-transparent background color.
	 *
	 * If a background image is encountered first, returns null because a solid
	 * background color is no longer a reliable basis for contrast decisions.
	 *
	 * @param {Element} el
	 * @returns {{r:number,g:number,b:number,a:number}|null}
	 */
	utils.getClosestAncestorBackgroundColor = function (el) {
		if (!el || !(el instanceof Element)) return null;

		let current = el;

		while (current && current !== document.documentElement) {
			const style = window.getComputedStyle(current);
			if (!style) {
				current = current.parentElement;
				continue;
			}

			// Bail out if a background image is present.
			if (style.backgroundImage && style.backgroundImage !== "none") {
				return null;
			}

			const bgColor = utils.getBackgroundColorFromElement(current);
			if (bgColor) {
				return bgColor;
			}

			current = current.parentElement;
		}

		return null;
	};

	/**
	 * utils.getComplementaryOutlineColor(el)
	 * ----------------------------------------------------------------
	 * Finds the nearest usable ancestor background color for the provided
	 * element and returns a contrasting complementary hex color suitable
	 * for use as an outline or focus indicator.
	 *
	 * Falls back to black if no usable background color is found.
	 *
	 * @param {Element} el
	 * @returns {string}
	 */
	utils.getComplementaryOutlineColor = function (el) {
		if (!el || !(el instanceof Element)) return "#000000";

		const bgColor = utils.getClosestAncestorBackgroundColor(el);
		if (!bgColor) return "#000000";

		return utils.rgbToHex(utils.getComplementaryContrastColor(bgColor));
	};

	/**
	 * utils.getRelativeLuminance(rgb)
	 * ----------------------------------------------------------------
	 * Calculates WCAG relative luminance for an RGB color object.
	 *
	 * @param {{r:number,g:number,b:number}} rgb
	 * @returns {number}
	 */
	utils.getRelativeLuminance = function (rgb) {
		const channelToLinear = (value) => {
			const sRGB = value / 255;
			return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
		};

		const r = channelToLinear(rgb.r);
		const g = channelToLinear(rgb.g);
		const b = channelToLinear(rgb.b);

		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	};

	/**
	 * utils.getContrastRatio(color1, color2)
	 * ----------------------------------------------------------------
	 * Accepts two RGB/RGBA color objects and returns the WCAG contrast ratio.
	 *
	 * @param {{r:number,g:number,b:number,a?:number}} color1
	 * @param {{r:number,g:number,b:number,a?:number}} color2
	 * @returns {number|null}
	 */
	utils.getContrastRatio = function (color1, color2) {
		if (!color1 || !color2) return null;
		if (color1.r === undefined || color1.g === undefined || color1.b === undefined) return null;
		if (color2.r === undefined || color2.g === undefined || color2.b === undefined) return null;

		const l1 = utils.getRelativeLuminance(color1);
		const l2 = utils.getRelativeLuminance(color2);

		const lighter = Math.max(l1, l2);
		const darker = Math.min(l1, l2);

		return (lighter + 0.05) / (darker + 0.05);
	};

	/**
	 * utils.passesWcagContrast(color1, color2, requiredRatio)
	 * ----------------------------------------------------------------
	 * Accepts two RGB/RGBA color objects and checks whether they meet
	 * the requested WCAG contrast ratio.
	 *
	 * Common ratios:
	 * - 4.5 for normal text
	 * - 3 for large text or non-text UI components
	 * - 7 for AAA normal text
	 *
	 * @param {{r:number,g:number,b:number,a?:number}} color1
	 * @param {{r:number,g:number,b:number,a?:number}} color2
	 * @param {number} [requiredRatio=4.5]
	 * @returns {{pass:boolean,ratio:number,required:number}|null}
	 */
	utils.passesWcagContrast = function (color1, color2, requiredRatio = 4.5) {
		const ratio = utils.getContrastRatio(color1, color2);
		if (ratio === null) return null;

		return {
			pass: ratio >= requiredRatio,
			ratio: Math.round(ratio * 100) / 100,
			required: requiredRatio,
		};
	};

	/**
	 * isSquarespaceEditMode()
	 * ------------------------------------------------------------
	 * Detects whether this script is running inside Squarespace edit mode.
	 *
	 * Why:
	 *   Squarespace Builder loads the editable website inside a preview iframe.
	 *   In that iframe, window.location may look like the public website, while
	 *   the parent page is actually the Squarespace /config editor.
	 *
	 * Behavior:
	 *   - Detects direct /config URLs on *.squarespace.com
	 *   - Detects the Squarespace site preview iframe
	 *   - Uses document.referrer as a fallback
	 *   - Fails safely if parent/top frame access is blocked
	 */
	utils.isSquarespaceEditMode = function() {
		function isConfigUrl(url) {
			if (!url) return false;

			let parsedUrl;

			try {
				parsedUrl = new URL(url, window.location.href);
			} catch (err) {
				return false;
			}

			const hostname = parsedUrl.hostname.toLowerCase();
			const pathname = parsedUrl.pathname.toLowerCase();

			return (
				hostname.endsWith(".squarespace.com") &&
				(pathname === "/config" || pathname.startsWith("/config/"))
			);
		}

		const urlsToCheck = [window.location.href, document.referrer];

		try {
			if (window.parent && window.parent !== window) {
				urlsToCheck.push(window.parent.location.href);
			}
		} catch (err) {}

		try {
			if (window.top && window.top !== window) {
				urlsToCheck.push(window.top.location.href);
			}
		} catch (err) {}

		const hasConfigUrl = urlsToCheck.some(isConfigUrl);

		let isSquarespacePreviewFrame = false;

		try {
			isSquarespacePreviewFrame =
				!!window.frameElement &&
				(window.frameElement.id === "sqs-site-frame" ||
					window.frameElement.getAttribute("data-testid") === "sqs-site-frame");
		} catch (err) {}

		return hasConfigUrl || isSquarespacePreviewFrame;
	}

	// ------------------------------------------------------------
	// CSS.escape Polyfill (for older browsers or Squarespace IDs)
	// ------------------------------------------------------------
	window.sqsA11y.utils.ensureCssEscape = function () {
		if (!window.CSS) window.CSS = {};
		if (typeof CSS.escape !== "function") {
			window.CSS.escape = function (sel) {
				return String(sel).replace(/[^a-zA-Z0-9_\-]/g, "\\$&");
			};
			if (!window.sqsA11y || !window.sqsA11y.config || window.sqsA11y.config.logging === true) {
				console.log("[sqsA11y-utils] CSS.escape polyfill applied.");
			}
		}
	};
	window.sqsA11y.utils.ensureCssEscape();
})(window, document);
