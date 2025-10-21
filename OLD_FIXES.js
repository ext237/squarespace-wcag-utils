(function () {
	/**
	 * ===========================================
	 * Squarespace Accessibility Enhancements
	 * Modular Architecture — WCAG 2.1 / 2.2 AA
	 * ===========================================
	 *
	 * Author: Joe Lippeatt — Table Ten Digital
	 * Contact: joe@tabletendigital.com / ext237@gmail.com
	 *
	 * Purpose:
	 *   Incrementally improve Squarespace site accessibility where
	 *   direct HTML editing is restricted, using safe JS/CSS injection.
	 *
	 * Fixes Implemented:
	 *
	 *   FIX 1: Desktop Dropdown / Folder Menus
	 *     • WCAG 2.1.1 Keyboard — Enables Enter/Space activation
	 *     • WCAG 4.1.2 Name, Role, Value — Adds aria-expanded state
	 *
	 *   FIX 2: Mobile Hamburger Menu
	 *     • WCAG 2.1.1 Keyboard — Adds keyboard activation
	 *     • WCAG 2.1.2 No Keyboard Trap — Ensures ESC exits correctly
	 *
	 *   FIX 3: Focus Outline Visibility
	 *     • WCAG 2.4.7 Focus Visible — Consistent visible focus ring
	 *     • Auto-selects contrast-safe outline color from element context
	 *
	 *   FIX 4: Target Size Minimum (No Nav Layout Changes)
	 *     • WCAG 2.5.8 Target Size (Minimum) — Enforces 24×24 px hit area
	 *     • Adds safe vertical centering for text links and buttons
	 *
	 *   FIX 5: Skip to Main Content
	 *     • WCAG 2.4.1 Bypass Blocks — Adds accessible “Skip to main content” link
	 *
	 *   FIX 6: Form Autocomplete Normalization
	 *     • WCAG 1.3.5 Identify Input Purpose — Restores autocomplete tokens
	 *     • Improves browser autofill and typing hints
	 *
	 *   FIX 6B: Label & Hidden Control Repairs
	 *     • WCAG 1.3.1 Info & Relationships, 2.4.6 Headings and Labels, 4.1.2 Name/Role/Value
	 *     • Fills empty or missing labels using legend text (screen-reader only)
	 *     • Rebinds broken “for” attributes to proper input IDs
	 *     • Hides non-interactive Squarespace elements (e.g., focus traps, honeypots, reCAPTCHA) from assistive tech
	 *
	 *   FIX 7: Focus Order Helpers (Anchors + AJAX)
	 *     • WCAG 2.4.3 Focus Order — Ensures logical focus movement after anchor or AJAX navigation
	 *
	 *   FIX 8: Link Purpose Enhancement
	 *     • WCAG 2.4.4 Link Purpose (In Context) — Adds descriptive aria-labels to vague links
	 *       (e.g., “Read more,” “View all,” “Learn more”)
	 *
	 *   FIX 9: Contact Link Context Labels
	 *     • WCAG 2.4.4 Link Purpose (In Context) — Adds contextual aria-labels to phone and email links
	 *
	 *   FIX 10: PDF Link Context Enhancement
	 *     • WCAG 2.4.4 Link Purpose (In Context), 3.2.2 On Input
	 *     • Adds “(PDF)” suffix to text links and descriptive aria-labels
	 *
	 *   FIX 11: Empty Button Accessibility
	 *     • WCAG 1.1.1 Non-text Content, 2.4.6 Headings and Labels, 4.1.2 Name/Role/Value
	 *     • Detects and labels empty <button> elements (e.g., “Close dialog,” “Toggle menu,” “Submit form”)
	 *
	 * Squarespace Integration:
	 *   • Auto-runs after “mercury:load” (AJAX navigation)
	 *   • Uses data-accessibility-init flags to prevent re-binding
	 *   • Safe for Code Injection or external <script src> use
	 *
	 * Last Updated: 2025-10-18
	 */

	const fixes = [];

	// --------------------------------------------
	// FIX 1: Desktop Dropdown / Folder Menus
	// --------------------------------------------
	// Addresses: SC 2.1.1 (Keyboard), SC 4.1.2 (Name/Role/Value)
	// In Squarespace, “folders” are top-level navigation items that expand to show sub-pages.
	function fix_desktopFolders() {
		const FIX_ID = "FIX-1";
		const FIX_DESC = "Desktop Dropdown / Folder Menus applied";

		// Squarespace “folder” triggers differ by template; cover common selectors
		const folders = document.querySelectorAll(".nav-folder-title, .header-menu-nav-item--folder > a, .Header-nav-folder-title, .Header-nav-item--folder > a");

		folders.forEach((folder) => {
			if (folder.dataset.accessibilityInit === "true") return;
			folder.dataset.accessibilityInit = "true";

			const isAnchor = folder.tagName === "A" && folder.hasAttribute("href");

			// Always expose expanded state
			folder.setAttribute("aria-expanded", "false");

			// ✅ Only add button role/tabindex if it's NOT a real link
			if (!isAnchor) {
				folder.setAttribute("role", "button");
				folder.setAttribute("tabindex", "0");
			}

			// Click & keyboard handlers stay the same
			folder.addEventListener("click", () => {
				const expanded = folder.getAttribute("aria-expanded") === "true";
				folder.setAttribute("aria-expanded", String(!expanded));
			});

			folder.addEventListener("keydown", (e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					folder.click();
				}
			});

			createTraceDataAttr(folder, `${FIX_ID} - ${FIX_DESC}`);
		});
	}

	// --------------------------------------------
	// FIX 2: Mobile Hamburger Menu
	// --------------------------------------------
	// Addresses: SC 2.1.1 (Keyboard), supports SC 2.1.2 (No Keyboard Trap)
	function fix_mobileHamburger() {
		const FIX_ID = "FIX-2";
		const FIX_DESC = "Mobile Hamburger Menu applied";

		const toggles = document.querySelectorAll('.header-burger, .header-menu-toggle, [data-test="header-menu-toggle"]');

		if (!toggles.length) {
			console.info(`[WCAG] ${FIX_ID}: No mobile toggles found (likely desktop view).`);
			return;
		}

		// if the window size changes (or in debug and small screens are being tested) rerun this function
		bindHamburgerResizeListener();

		toggles.forEach((toggle) => {
			if (toggle.dataset.accessibilityInit === "true") return;
			toggle.dataset.accessibilityInit = "true";

			// Normalize semantics + focus
			toggle.setAttribute("role", "button");
			toggle.setAttribute("tabindex", "0");

			// Keyboard parity for toggle
			toggle.addEventListener("keydown", (e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					toggle.click();
				}
			});

			// Traceability hint
			createTraceDataAttr(toggle, `${FIX_ID} - ${FIX_DESC}`);
		});
	}

	// --------------------------------------------
	// Helper for Fix 2: Attach resize listener once
	// --------------------------------------------
	function bindHamburgerResizeListener() {
		if (window._wcagHamburgerResizeBound) return;
		window._wcagHamburgerResizeBound = true;

		window.addEventListener("resize", () => {
			// Debounce to avoid spam during continuous resize
			clearTimeout(window._wcagHamburgerResizeTimer);
			window._wcagHamburgerResizeTimer = setTimeout(() => {
				fix_mobileHamburger();
			}, 300);
		});

		console.info("[WCAG] FIX-2 resize listener attached once.");
	}

	// --------------------------------------------
	// FIX 3: Focus Outline (simple, link-first logic)
	// --------------------------------------------
	// Addresses: SC 2.4.7 (Focus Visible)
	// Applies a visible focus outline using background or text color
	function fix_focusOutlineSimple() {
		if (document.documentElement.dataset.accFocusSimpleBound === "true") return;
		document.documentElement.dataset.accFocusSimpleBound = "true";

		function isTransparent(c) {
			if (!c) return true;
			const v = c.trim().toLowerCase();
			return v === "transparent" || v === "rgba(0, 0, 0, 0)" || v === "rgba(0,0,0,0)";
		}

		function isFocusable(el) {
			if (!(el instanceof Element)) return false;
			if (el.matches("a[href], button, input, select, textarea, summary")) return true;
			if (el.hasAttribute("tabindex") && el.tabIndex >= 0) return true;
			if (el.getAttribute("role") === "button" || el.getAttribute("role") === "link") return true;
			return false;
		}

		function applyOutline(el) {
			const cs = getComputedStyle(el);
			const bg = cs.backgroundColor;
			const color = cs.color;
			const chosen = !isTransparent(bg) ? bg : color;

			if (el.dataset.prevOutline === undefined) {
				el.dataset.prevOutline = el.style.outline || "";
				el.dataset.prevOutlineOffset = el.style.outlineOffset || "";
			}
			el.style.outline = `2px solid ${chosen}`;
			el.style.outlineOffset = "3px";
		}

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
		}

		function handleFocus(e) {
			const el = e.target;
			if (!isFocusable(el)) return;
			applyOutline(el);

			const FIX_ID = "FIX-3";
			const FIX_DESC = "Focus Outline (simple) applied";
			createTraceDataAttr(el, `${FIX_ID} - ${FIX_DESC}`);
		}

		function handleBlur(e) {
			const el = e.target;
			if (!isFocusable(el)) return;
			clearOutline(el);

			const FIX_ID = "FIX-3";
			const FIX_DESC = "Focus Outline (simple) applied";
			createTraceDataAttr(el, `${FIX_ID} - ${FIX_DESC}`);
		}

		document.addEventListener("focusin", handleFocus);
		document.addEventListener("focusout", handleBlur);
	}

	// --------------------------------------------
	// FIX 4: Target Size Minimum (No Nav Layout Changes)
	// --------------------------------------------
	// WCAG 2.5.8 — Target Size (Minimum)
	function fix_targetSizeMinimum() {
		const FIX_ID = "FIX-4";
		const FIX_DESC = "Minimum Target Size applied";

		if (document.getElementById("acc-target-size-css")) return;

		const style = document.createElement("style");
		style.id = "acc-target-size-css";
		style.textContent = `
    /* 1. Give all interactive elements a 24x24 target area */
    a,
    button,
    [type="button"],
    [type="submit"] {
      min-width: 24px !important;
      min-height: 24px !important;
    }

    /* 2. Center only text links & buttons, NOT nav or image links */
    a:not(.Header-nav-item):not(.Header-nav-folder-title):not(.Header-nav-folder-item)
     :not(.sqs-block-image-link):not(.summary-thumbnail-container):not(.image-slide-anchor)
     :not([data-animation-role="image"]):not(:has(img, picture, svg, video)),
    button,
    [type="button"],
    [type="submit"],
    .sqs-block-button-element {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      vertical-align: middle !important;
    }

    /* 3. NAVIGATION LINKS — NO DISPLAY CHANGES, EVER */
    .Header-nav-item,
    .Header-nav-folder-title,
    .Header-nav-folder-item {
      /* Leave them exactly as Squarespace defines them */
    }
/* WCAG visual alignment correction — ONLY for image card buttons */
    .image-button-inner > a.sqs-button-element--primary {
      align-items: center !important;
      justify-content: center !important;
      display: inline-flex !important;
    }
  `;

		document.head.appendChild(style);

		if (typeof createTraceDataAttr === "function") {
			createTraceDataAttr(style, `${FIX_ID} - ${FIX_DESC}`);
		}
	}
	// --------------------------------------------
	// FIX 5: Skip to Main Content (Bypass Blocks)
	// --------------------------------------------
	// Addresses: WCAG SC 2.4.1 (Bypass Blocks)
	function fix_skipToMain() {
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

			// Style once
			if (!document.getElementById("acc-skip-link-style")) {
				const style = document.createElement("style");
				style.id = "acc-skip-link-style";
				style.textContent = `
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
				.skip-link:focus { top: 0; }
			`;
				document.head.appendChild(style);
			}

			// Manage focus behavior
			skipLink.addEventListener("click", (e) => {
				const targetId = skipLink.getAttribute("href").replace("#", "");
				const target = document.getElementById(targetId);
				if (target) {
					target.setAttribute("tabindex", "-1");
					target.focus();
				}
			});
		}

		// Always re-evaluate target after AJAX load
		const mainEl = document.querySelector("main") || document.querySelector("[role='main']");
		let targetEl = mainEl || document.querySelector("h1");

		if (!targetEl) {
			console.warn(`[WCAG] ${FIX_ID}: No suitable target found for skip link.`);
			return;
		}

		if (!targetEl.id) targetEl.id = "main-content";
		const targetId = targetEl.id;

		skipLink.setAttribute("href", `#${targetId}`);

		// Traceability
		createTraceDataAttr(skipLink, `${FIX_ID} - ${FIX_DESC}`);
	}

	// --------------------------------------------
	// FIX 6: Form Autocomplete Enhancer
	// --------------------------------------------
	// Addresses: WCAG SC 1.3.5 (Identify Input Purpose)
	// Purpose: Normalize and repair autocomplete attributes on Squarespace forms
	/**
	 * Squarespace Form Autocomplete Fixer
	 * ----------------------------------------------------------------
	 * Purpose:
	 *   - Squarespace often renders inputs with autocomplete="false" or no
	 *     autocomplete. That breaks browser autofill and accessibility.
	 *   - This script finds those controls and applies sensible tokens:
	 *       email, tel, given-name, family-name, organization, address-*,
	 *       postal-code, country-name, url, etc.
	 *
	 * How it runs (per client request):
	 *   - Immediately on load
	 *   - Squarespace.onInitialize(Y, ...)
	 *   - mercury:load (AJAX navigation)
	 *   - MutationObserver on <body id="..."> (your original example)
	 *   - Plus: a subtree observer + brief retry/backoff for late-rendered blocks
	 *
	 * Debugging:
	 *   - Noisy console logs that show when/why it ran and what it changed.
	 *   - Set DEBUG=false to quiet logs later.
	 */

	// ===== Debug helpers =====================================================
	var DEBUG = true;
	function log() {
		if (!DEBUG) return;
		var a = [].slice.call(arguments);
		a.unshift("[AutocompleteFixer]");
		console.log.apply(console, a);
	}
	function warn() {
		if (!DEBUG) return;
		var a = [].slice.call(arguments);
		a.unshift("[AutocompleteFixer]");
		console.warn.apply(console, a);
	}

	// Small polyfill to avoid rare CSS.escape issues
	if (!window.CSS) window.CSS = {};
	if (typeof CSS.escape !== "function") {
		CSS.escape = function (sel) {
			return String(sel).replace(/[^a-zA-Z0-9_\-]/g, "\\$&");
		};
		log("CSS.escape polyfill applied.");
	}

	function normalize(s) {
		return (s || "")
			.toString()
			.replace(/[_\-:/\\]+/g, " ")
			.replace(/\s+/g, " ")
			.trim()
			.toLowerCase();
	}

	function hasWord(s, w) {
		return new RegExp("(^|\\W)" + w + "(\\W|$)").test(s || "");
	}

	function getLabelText(el) {
		var txt = "";

		// <label for="id">
		if (el.id) {
			var lbl = document.querySelector('label[for="' + CSS.escape(el.id) + '"]');
			if (lbl) txt += " " + lbl.textContent;
		}
		// <label> wrapping
		var wrap = el.closest && el.closest("label");
		if (wrap) txt += " " + wrap.textContent;

		// aria-labelledby
		var al = el.getAttribute("aria-labelledby");
		if (al) {
			al.split(/\s+/).forEach(function (id) {
				var n = document.getElementById(id);
				if (n) txt += " " + n.textContent;
			});
		}

		// Squarespace field wrapper class hints, e.g. <div class="form-item field email">
		var fieldWrap = el.closest && el.closest(".form-item.field");
		if (fieldWrap && fieldWrap.className) txt += " " + fieldWrap.className;

		return normalize(txt);
	}

	function guessToken(el) {
		// Strong signals by type
		var t = (el.type || "").toLowerCase();
		if (t === "email") return "email";
		if (t === "tel") return "tel";
		if (t === "url") return "url";

		// Aggregate text
		var label = getLabelText(el);
		var name = normalize(el.getAttribute("name"));
		var id = normalize(el.id);
		var ph = normalize(el.getAttribute("placeholder"));
		var all = [label, name, id, ph].join(" ");

		// Email
		if (hasWord(all, "email") || hasWord(all, "e mail")) return "email";

		// Phone
		if (hasWord(all, "phone") || hasWord(all, "tel") || hasWord(all, "mobile") || hasWord(all, "cell")) return "tel";

		// Names
		if (hasWord(all, "first") && hasWord(all, "name")) return "given-name";
		if (hasWord(all, "last") && hasWord(all, "name")) return "family-name";
		if (hasWord(all, "middle") && hasWord(all, "name")) return "additional-name";
		if (hasWord(all, "name")) return "name";

		// Org / Company
		if (hasWord(all, "company") || hasWord(all, "organization") || hasWord(all, "organisation") || hasWord(all, "business")) return "organization";

		// Address lines
		if ((hasWord(all, "address") && (hasWord(all, "line") || /address\s*1\b/.test(all))) || /\baddr(?:ess)?\s*1\b/.test(all)) return "address-line1";
		if ((hasWord(all, "address") && hasWord(all, "2")) || /\baddr(?:ess)?\s*2\b/.test(all)) return "address-line2";
		if (hasWord(all, "street") || (hasWord(all, "address") && !/\bline\b/.test(all))) return "street-address";

		// City/State/Postal/Country
		if (hasWord(all, "city") || hasWord(all, "town") || hasWord(all, "locality")) return "address-level2";
		if (hasWord(all, "state") || hasWord(all, "province") || hasWord(all, "region")) return "address-level1";
		if (hasWord(all, "zip") || hasWord(all, "postal")) return "postal-code";
		if (hasWord(all, "country")) return "country-name";

		// Web
		if (hasWord(all, "website") || hasWord(all, "url")) return "url";

		// Known non-targets (don’t force)
		if (hasWord(all, "message") || hasWord(all, "comments") || hasWord(all, "notes")) return null;
		if (hasWord(all, "date") || hasWord(all, "time")) return null;

		return null;
	}

	// --------------------------------------------
	// FIX 6B: Label & Hidden Control Issues
	// --------------------------------------------
	// Addresses: WCAG 1.3.1 (Info & Relationships),
	//            2.4.6 (Headings and Labels),
	//            4.1.2 (Name, Role, Value)
	// Purpose:
	//   • Repairs Squarespace forms where labels are empty or unlinked.
	//   • Uses legend text for missing labels (screen-reader only).
	//   • Re-binds labels whose "for" target is missing.
	//   • Hides Squarespace internal focus traps and honeypot fields
	//     from assistive tech to eliminate false WAVE errors.
	// --------------------------------------------
	function fix_labelIssues() {
		const FIX_ID = "FIX-6B";
		console.info("[WCAG] Running label & hidden control repairs…");

		// ----- 0. Hide non-user-focusable Squarespace elements -----
		// Prevents false “missing label” errors from WAVE and SR confusion.
		document.querySelectorAll('div[tabindex="-1"], input[type="hidden"]').forEach((el) => {
			el.setAttribute("aria-hidden", "true");
			el.setAttribute("tabindex", "-1"); // ensure it remains non-focusable
			createTraceDataAttr(el, `${FIX_ID} - Hidden non-interactive element`);
		});

		// ----- 1. Fill empty labels using legend text -----
		const fields = document.querySelectorAll("fieldset.form-item.field, fieldset.form-item.fields");
		fields.forEach((fieldset) => {
			const legend = fieldset.querySelector("legend span:not(.description), legend");
			const label = fieldset.querySelector("label");

			if (!legend || !label) return;

			const legendText = (legend.textContent || "").trim();
			const labelText = (label.textContent || "").trim();

			// Fill label if empty and legend has meaningful text
			if (legendText && !labelText) {
				label.textContent = legendText;

				// Visually hide duplicate label while preserving accessibility
				label.classList.add("sr-only");
				if (!document.getElementById("sr-only-style")) {
					const style = document.createElement("style");
					style.id = "sr-only-style";
					style.textContent = `
					.sr-only {
						position: absolute !important;
						width: 1px !important;
						height: 1px !important;
						padding: 0 !important;
						margin: -1px !important;
						overflow: hidden !important;
						clip: rect(0 0 0 0) !important;
						white-space: nowrap !important;
						border: 0 !important;
					}
				`;
					document.head.appendChild(style);
				}

				createTraceDataAttr(label, `${FIX_ID} - Empty label filled from legend`);
				console.info(`[WCAG] ${FIX_ID}: Filled and visually hid label using legend "${legendText}"`);
			}
		});

		// ----- 2. Rebind labels missing valid input targets -----
		document.querySelectorAll("label[for]").forEach((label) => {
			const id = label.getAttribute("for");
			const input = document.getElementById(id);

			// If label points to a nonexistent input, fix it
			if (!input) {
				const fieldset = label.closest(".form-item, fieldset");
				if (fieldset) {
					const possible = fieldset.querySelector("input, textarea, select");
					if (possible && possible.id) {
						label.setAttribute("for", possible.id);
						createTraceDataAttr(label, `${FIX_ID} - Label 'for' repaired`);
						console.info(`[WCAG] ${FIX_ID}: Repaired label binding → #${possible.id}`);
					}
				}
			}
		});

		// ----- 3. Flag any still-unlabeled visible inputs for dev debugging -----
		document.querySelectorAll("input:not([type=hidden]):not([aria-hidden=true]):not([aria-labelledby]):not([id='']), textarea, select").forEach((el) => {
			const hasLabel = document.querySelector(`label[for="${CSS.escape(el.id)}"]`) || el.closest("label");
			if (!hasLabel) {
				console.warn(`[WCAG] ${FIX_ID}: Input without label detected →`, el);
			}
		});

		// ----- 4. Even if it's not visible, recaptcha can cause errors on some reports like Wave, updating accordingly.
		document.querySelectorAll('textarea[id^="g-recaptcha-response"]').forEach((el) => {
			el.setAttribute("aria-hidden", "true");
			el.setAttribute("aria-label", "Security field, do not fill");
			el.setAttribute("hidden", "");
		});
	}

	var HAS_RUN_MARK = "autocompleteFixed";
	var RETRY_SCHEDULE_MS = [150, 400, 900, 1800]; // short backoff retries

	function applyEnhancements(el) {
		if (el.dataset[HAS_RUN_MARK] === "1") return { updated: 0, cleaned: 0, skipped: 1 };

		var updated = 0,
			cleaned = 0;

		var beforeType = (el.type || "").toLowerCase();
		var beforeAC = el.getAttribute("autocomplete");

		// helper function for empty or incorrectly associated form labels:
		fix_labelIssues();

		// If Squarespace set autocomplete="false", clear that FIRST
		if (beforeAC === "false") {
			el.removeAttribute("autocomplete");
			cleaned++;
			log("Removed autocomplete=false for", el);
		}

		// Decide what token should be
		var token = guessToken(el);

		if (token) {
			var current = el.getAttribute("autocomplete");
			if (current !== token) {
				el.setAttribute("autocomplete", token);
				updated++;
				log("Set autocomplete='" + token + "' for", el);
			}

			// Improve keyboard/type hints
			if (token === "email" && beforeType !== "email") {
				try {
					el.type = "email";
					updated++;
					log("Set type=email for", el);
				} catch (e) {
					warn("Cannot set type=email", e);
				}
			}
			if (token === "tel" && beforeType !== "tel") {
				try {
					el.type = "tel";
					updated++;
					log("Set type=tel for", el);
				} catch (e) {
					warn("Cannot set type=tel", e);
				}
			}

			// Helpful inputmode and autocapitalize
			if (token === "tel") el.setAttribute("inputmode", "tel");
			if (token === "postal-code") el.setAttribute("inputmode", "text");
			if (token === "email" || token === "url" || token === "username") el.setAttribute("autocapitalize", "none");
		}

		// Normalize Squarespace oddity
		if (el.getAttribute("autocomplete") === "tel-national") {
			el.setAttribute("autocomplete", "tel");
			updated++;
			log("Normalized tel-national -> tel for", el);
		}

		el.dataset[HAS_RUN_MARK] = "1";
		return { updated: updated, cleaned: cleaned, skipped: 0 };
	}

	// --------------------------------------------
	// FIX 7: Focus Order Helpers (Anchors + AJAX)
	// --------------------------------------------
	// Addresses: WCAG SC 2.4.3 (Focus Order)
	function fix_focusOrderHelpers() {
		const FIX_ID = "FIX-7";
		const FIX_DESC = "Focus Order Helpers applied";

		// ---- (1) Anchor focus management ----
		document.addEventListener("click", function (e) {
			const link = e.target.closest('a[href^="#"]:not([href="#"])');
			if (!link) return;

			const id = link.getAttribute("href").slice(1);
			const target = document.getElementById(id);
			if (target) {
				setTimeout(() => {
					target.setAttribute("tabindex", "-1");
					target.focus({ preventScroll: true });

					// Traceability
					createTraceDataAttr(link, `${FIX_ID} - ${FIX_DESC}`);
				}, 100);
			}
		});

		// ---- (2) Focus main content after AJAX page load ----
		window.addEventListener("mercury:load", function () {
			const main = document.querySelector("main");
			if (main) {
				const sections = main.querySelectorAll("section");
				const focusTarget = sections[1] || main;
				focusTarget.setAttribute("tabindex", "-1");
				focusTarget.focus({ preventScroll: true });

				// Traceability
				createTraceDataAttr(focusTarget, `${FIX_ID} - ${FIX_DESC}`);
			}
		});
	}

	// --------------------------------------------
	// FIX 8: Link Purpose Enhancement (Squarespace final)
	// --------------------------------------------
	// Addresses: WCAG SC 2.4.4 – Link Purpose (In Context)
	function fix_linkPurposeEnhancer() {
		const FIX_ID = "FIX-8";
		const FIX_DESC = "Link Purpose Enhancement applied";

		const vaguePhrases = ["read more", "learn more", "click here", "details", "view all"];
		const links = document.querySelectorAll("a");

		links.forEach((link) => {
			if (link.dataset.linkPurposeInit === "true") return;
			link.dataset.linkPurposeInit = "true";

			const rawText = (link.textContent || "").trim().toLowerCase();
			const isVague = vaguePhrases.some((p) => rawText.startsWith(p));
			const isSummary = link.classList.contains("summary-read-more-link");

			if (!isVague && !isSummary) return;
			if (link.hasAttribute("aria-label") || link.hasAttribute("aria-labelledby")) return;

			let context = "";
			const parent = link.closest("article, .summary-item, .sqs-block, .card, section");
			let heading = parent && parent.querySelector("h1, h2, h3, h4, h5, h6, .summary-title, .summary-header-text");

			if (heading) {
				context = heading.textContent.trim();
			} else {
				const href = link.getAttribute("href") || "";
				if (href && href !== "#") {
					context = href.replace(/\//g, " ").replace(/-/g, " ").trim();
				}
			}

			if (context) {
				link.setAttribute("aria-label", `${link.textContent.trim()} about ${context}`);

				// Traceability
				createTraceDataAttr(link, `${FIX_ID} - ${FIX_DESC}`);
			}
		});
	}

	// --------------------------------------------
	// FIX 9: Contact Link Context Labels (Phone + Email)
	// --------------------------------------------
	// Addresses: WCAG SC 2.4.4 (Link Purpose In Context)
	// Purpose:
	//   Adds aria-labels for phone (tel:) and email (mailto:) links
	//   using nearby heading context when available.
	//
	function fix_contactLinkContext() {
		const FIX_ID = "FIX-9";
		const FIX_DESC = "Contact Link Context Labels applied - phone and email addresses";

		const links = document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]');

		links.forEach((link) => {
			if (link.dataset.contactLabelInit === "true") return;
			link.dataset.contactLabelInit = "true";

			if (link.hasAttribute("aria-label")) return;

			const href = link.getAttribute("href") || "";
			const isPhone = href.startsWith("tel:");
			const isEmail = href.startsWith("mailto:");
			const visibleText = link.textContent.trim();

			// Try to find heading context
			const parent = link.closest(".sqs-block, section, article, div");
			const heading = parent && parent.querySelector("h1, h2, h3, h4, h5, h6");
			const context = heading ? heading.textContent.trim() : "";

			// Build aria-label
			let label = "";
			if (isPhone) {
				label = context ? `Call about ${context} at ${visibleText}` : `Call ${visibleText}`;
			} else if (isEmail) {
				label = context ? `Email about ${context} to ${visibleText}` : `Email ${visibleText}`;
			}

			if (label) link.setAttribute("aria-label", label);

			// Traceability
			if (typeof createTraceDataAttr === "function") {
				createTraceDataAttr(link, `${FIX_ID} - ${FIX_DESC}`);
			}
		});
	}

	// --------------------------------------------
	// FIX 10: PDF Link Context Enhancement (safe version)
	// --------------------------------------------
	// Addresses: WCAG 2.4.4 (Link Purpose) & 3.2.2 (On Input)
	// Purpose:
	//   • Adds "(PDF)" only for text links
	//   • Leaves image-based links untouched
	//   • Always adds descriptive aria-label
	//
	function fix_pdfLinkEnhancer() {
		const FIX_ID = "FIX-10";
		const FIX_DESC = "PDF Link Context Enhancement applied";

		const pdfLinks = document.querySelectorAll('a[href$=".pdf" i]');

		pdfLinks.forEach((link) => {
			if (link.dataset.pdfEnhanceInit === "true") return;
			link.dataset.pdfEnhanceInit = "true";

			// Skip if already labeled
			if (link.hasAttribute("aria-label")) return;

			const text = (link.innerText || "").trim(); // innerText excludes <img> safely
			const hasVisibleText = text.length > 0;
			const opensNewTab = link.target === "_blank";

			let label;

			if (hasVisibleText) {
				// Append (PDF) *after* visible text but without destroying structure
				if (!/\(pdf\)/i.test(text)) {
					const span = document.createElement("span");
					span.textContent = " (PDF)";
					link.appendChild(span);
				}

				label = `Download ${text}, PDF file${opensNewTab ? ", opens in a new tab." : ""}`;
			} else {
				// Image-only link fallback
				label = `Download PDF file${opensNewTab ? ", opens in a new tab." : ""}`;
			}

			link.setAttribute("aria-label", label);

			// Traceability (if function exists)
			if (typeof createTraceDataAttr === "function") {
				createTraceDataAttr(link, `${FIX_ID} - ${FIX_DESC}`);
			}
		});
	}

	// --------------------------------------------
	// FIX 11: Form Status Message Announcer
	// --------------------------------------------
	// Addresses: WCAG 4.1.3 (Status Messages)
	// Purpose:
	//   • Detects Squarespace form error or success messages as they appear.
	//   • Announces them via an aria-live region for screen readers.
	//   • Avoids multiple or duplicate announcements per submission.
	//   • No visual changes, non-disruptive for sighted users.
	//
	// Notes:
	//   Squarespace injects .form-field-error or .form-submission-text
	//   elements dynamically after submit. These are not announced by
	//   default because they lack role="alert" or aria-live.
	//
	// Approach:
	//   1. Adds a single hidden live region to <body>.
	//   2. Watches DOM mutations for new .form-field-error or
	//      .form-submission-text nodes.
	//   3. Announces concise summaries like
	//        “Form submission failed. Please review the required fields.”
	//        or
	//        “Form submitted successfully.”
	// --------------------------------------------
	function fix_formStatusAnnouncer() {
		const FIX_ID = "FIX-11";
		const FIX_DESC = "Form Status Message Announcer applied";

		// Create (or reuse) live region
		let announcer = document.getElementById("acc-live-region");
		if (!announcer) {
			announcer = document.createElement("div");
			announcer.id = "acc-live-region";
			announcer.setAttribute("aria-live", "assertive");
			announcer.setAttribute("aria-atomic", "true");
			announcer.className = "sr-only";
			announcer.textContent = "";
			document.body.appendChild(announcer);

			// Ensure .sr-only is available
			if (!document.getElementById("sr-only-style")) {
				const style = document.createElement("style");
				style.id = "sr-only-style";
				style.textContent = `
        .sr-only {
         position: absolute !important;
          width: 1px !important;
          height: 1px !important;
          padding: 0 !important;
          margin: -1px !important;
          overflow: hidden !important;
          clip: rect(0 0 0 0) !important;
          white-space: nowrap !important;
          border: 0 !important;
        }
      `;
				document.head.appendChild(style);
			}
		}

		// Debounced announce helper
		let announceTimer = null;
		function announce(msg) {
			clearTimeout(announceTimer);
			announceTimer = setTimeout(() => {
				announcer.textContent = msg;
				console.info(`[WCAG] ${FIX_ID}: Announced "${msg}"`);
			}, 100);
		}

		// Observe form area for injected messages
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((m) => {
				// Look for newly added error messages
				m.addedNodes.forEach((node) => {
					if (!(node instanceof HTMLElement)) return;

					// Form-level or field-level error
					if (node.matches(".form-field-error") || node.querySelector?.(".form-field-error")) {
						announce("Form submission failed. Please review the required fields.");
						createTraceDataAttr(node, `${FIX_ID} - Announced form error`);
					}

					// Form success message
					if (node.matches(".form-submission-text") || node.querySelector?.(".form-submission-text")) {
						announce("Form submitted successfully.");
						createTraceDataAttr(node, `${FIX_ID} - Announced form success`);
					}
				});
			});
		});

		if (window._accFormAnnounceObserverAttached) return;
		window._accFormAnnounceObserverAttached = true;
		observer.observe(document.body, { childList: true, subtree: true });

		console.info(`[WCAG] ${FIX_ID}: Mutation observer active.`);
		createTraceDataAttr(document.body, `${FIX_ID} - ${FIX_DESC}`);
	}

	// --------------------------------------------
	// FIX 12: Empty Button Accessibility
	// --------------------------------------------
	// Addresses: WCAG 1.1.1 (Non-text Content), 2.4.6 (Headings and Labels), 4.1.2 (Name, Role, Value)
	// Purpose:
	//   • Detects empty <button> elements (no textContent, no aria-label, no role).
	//   • Adds a safe, descriptive aria-label (e.g., "Close dialog").
	//   • Prevents breaking Squarespace lightbox or menu functionality.
	// --------------------------------------------
	function fix_emptyButtons() {
		const FIX_ID = "FIX-10";
		console.info(`[WCAG] Running ${FIX_ID}: Repairing empty buttons…`);

		const buttons = document.querySelectorAll("button");
		let repairedCount = 0;

		buttons.forEach((btn) => {
			const hasText = btn.textContent.trim().length > 0;
			const hasLabel = btn.hasAttribute("aria-label") || btn.hasAttribute("aria-labelledby");

			if (!hasText && !hasLabel) {
				// Identify likely purpose by context
				let label = "Button";
				if (btn.closest('[id*="lightbox"]')) label = "Close dialog";
				else if (btn.closest("nav")) label = "Toggle menu";
				else if (btn.type === "submit") label = "Submit form";

				btn.setAttribute("aria-label", label);
				repairedCount++;

				// Traceability attribute
				createTraceDataAttr(btn, `${FIX_ID}: Added aria-label="${label}"`);
			}
		});

		console.info(`[WCAG] ${FIX_ID}: ${repairedCount} empty button(s) repaired.`);
	}

	fixes.push(fix_desktopFolders);
	fixes.push(fix_mobileHamburger);
	fixes.push(fix_focusOutlineSimple);
	fixes.push(fix_targetSizeMinimum);
	fixes.push(fix_skipToMain);
	fixes.push(fix_focusOrderHelpers);
	fixes.push(fix_linkPurposeEnhancer);
	fixes.push(fix_contactLinkContext);
	fixes.push(fix_pdfLinkEnhancer);
	fixes.push(fix_emptyButtons);
	fixes.push(fix_formStatusAnnouncer);

	// =======================================================
	// SQUARESPACE ACCESSIBILITY FIXES - KEY HELPERS
	// =======================================================
	// --------------------------------------------
	// Helper: enableSpacebarActivationForLinks()
	// --------------------------------------------
	// Purpose:
	//   • Makes the Spacebar behave like Enter on focused links.
	//   • Improves keyboard usability (WCAG 2.1.1 Keyboard Accessible)
	//   • Safe to re-run after AJAX DOM rebuilds.
	//
	// Usage:
	//   enableSpacebarActivationForLinks();
	//   (Call again after AJAX navigation or page rebuilds.)
	//
	function enableSpacebarActivationForLinks() {
		// Avoid duplicate bindings
		if (document.body.dataset.spacebarLinksBound === "true") return;
		document.body.dataset.spacebarLinksBound = "true";

		document.addEventListener("keydown", (e) => {
			const link = e.target;
			if (e.key === " " && link instanceof HTMLAnchorElement && link.href) {
				e.preventDefault(); // prevent scroll
				link.click(); // follow link
				if (typeof createTraceDataAttr === "function") {
					createTraceDataAttr(link, "Global Keyboard Enhancement - Spacebar activates links");
				}
			}
		});

		console.info("[WCAG] Spacebar link activation enabled.");
	}

	// --------------------------------------------
	// Helper: createTraceDataAttr()
	// --------------------------------------------
	// Appends or creates a trace entry for WCAG fixes
	// Parameters:
	//   _object  = element being modified
	//   _fixText = short description, e.g. "FIX-5 - Skip to Main Content applied"
	//

	function createTraceDataAttr(_object, _fixText) {
		if (!(_object instanceof Element)) return;

		const timestamp = new Date().toISOString();
		const existing = _object.getAttribute("data-wcag-fix");

		let newValue = _fixText.includes("@") ? _fixText : `${_fixText} @ ${timestamp}`;

		if (existing && !existing.includes(_fixText)) {
			newValue = `${existing} | ${newValue}`;
		}

		_object.setAttribute("data-wcag-fix", newValue);
		console.info(`[WCAG] ${_fixText} applied to`, _object);
	}

	// =======================================================
	// SQUARESPACE ACCESSIBILITY + FORM FIXES BOOTSTRAP
	// =======================================================

	// --------------------------------------------
	// INIT WRAPPER
	// --------------------------------------------
	function initAccessibleNav() {
		["link-purpose-init", "contact-label-init", "pdf-enhance-init"].forEach((flag) => {
			document.querySelectorAll(`[data-${flag}]`).forEach((el) => el.removeAttribute(`data-${flag}`));
		});
		fixes.forEach((fn) => {
			try {
				fn();
			} catch (err) {
				console.warn("[Accessibility Fix Error]", fn.name, err);
			}
		});
	}

	// Re-scan forms for autocomplete + run all accessibility fixes
	function runAllAccessibilityFixes() {
		scanWithRetries(); // forms
		initAccessibleNav(); // all other WCAG fixes (aria, labels, skip link, etc.)
		enableSpacebarActivationForLinks(); // spacebar activeates links
	}

	function scanOnce() {
		var forms = document.querySelectorAll("form");
		var controls = document.querySelectorAll("form input, form select, form textarea");
		log("Scan start. Forms:", forms.length, "Controls:", controls.length);

		var totalUpdated = 0,
			totalCleaned = 0,
			totalSkipped = 0;

		controls.forEach(function (el) {
			var res = applyEnhancements(el);
			totalUpdated += res.updated;
			totalCleaned += res.cleaned;
			totalSkipped += res.skipped;
		});

		log("Scan complete. Updated:", totalUpdated, "| Cleaned 'false':", totalCleaned, "| Skipped:", totalSkipped);
		return { updated: totalUpdated, cleaned: totalCleaned, skipped: totalSkipped, controlCount: controls.length };
	}

	// Retry a few times in case blocks render late
	function scanWithRetries() {
		var i = 0;
		var result = scanOnce();

		function next() {
			if (i >= RETRY_SCHEDULE_MS.length) return;
			if (result.updated > 0 || result.cleaned > 0 || result.controlCount > 0) {
				// We touched something or controls existed — no need to keep hammering
				return;
			}
			var delay = RETRY_SCHEDULE_MS[i++];
			log("No changes yet; scheduling retry in", delay, "ms.");
			setTimeout(function () {
				result = scanOnce();
				next();
			}, delay);
		}
		next();
	}

	try {
		var subtreeObserver = new MutationObserver(function (muts) {
			var shouldScan = muts.some(function (m) {
				if (m.type === "childList" && m.addedNodes && m.addedNodes.length) {
					// If any added node contains a form control, rescan
					return Array.prototype.some.call(m.addedNodes, function (n) {
						return n.nodeType === 1 && n.matches && (n.matches("input,select,textarea,form") || (n.querySelector && n.querySelector("input,select,textarea,form")));
					});
				}
				// If attributes on an input changed, rescan too
				if (m.type === "attributes" && m.target && m.target.matches && m.target.matches("input,select,textarea")) {
					return true;
				}
				return false;
			});
			if (shouldScan) {
				log("Subtree MutationObserver detected form/control changes. Rescanning…");
				scanWithRetries();
			}
		});
		subtreeObserver.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["type", "autocomplete", "id", "class"] });
		log("Subtree MutationObserver attached.");
	} catch (e) {
		warn("Subtree MutationObserver failed:", e);
	}

	// --------------------------------------------
	// EVENT LISTENERS (Squarespace-friendly)
	// --------------------------------------------
	if (document.readyState !== "loading") {
		initAccessibleNav();
	} else {
		document.addEventListener("DOMContentLoaded", initAccessibleNav);
	}

	// Run when Squarespace initializes (legacy 7.0)
	const Y = window.Y || undefined;
	if (window.Squarespace && typeof window.Squarespace.onInitialize === "function") {
		window.Squarespace.onInitialize(Y, runAllAccessibilityFixes);
	}

	// Run after in-site AJAX navigation (Squarespace Mercury)
	window.addEventListener("mercury:load", (e) => {
		log("Event mercury:load fired.", e?.detail || "");
		setTimeout(runAllAccessibilityFixes, 150); // short delay for DOM repaint
	});

	// Fallback: watch for page ID changes (page swaps)
	try {
		new MutationObserver(() => {
			log("Body-id MutationObserver fired.");
			runAllAccessibilityFixes();
		}).observe(document.body, { attributes: true, attributeFilter: ["id"] });
		log("Body-id MutationObserver attached.");
	} catch (e) {
		warn("Body-id MutationObserver failed:", e);
	}
})();
