/*!
 * Squarespace Accessibility Bootstrap - squarespaceA11y.js
 * --------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * Purpose:
 * - Load shared utility files
 * - Load individual accessibility enhancement modules
 * - Subscribe to sqsDomReadySignal
 * - Run registered enhancement modules when Squarespace reports
 *   that the DOM is ready for review and JavaScript-based adjustment
 */

(function (window, document) {
	"use strict";

	// for debuging, sometimes we kill off everything:
	// return false;

	/*
	 * Prevent duplicate bootstrap on the same page session.
	 * This avoids duplicate event subscriptions if the main file is
	 * accidentally injected more than once.
	 */
	if (window.sqsA11yMainBooted) return;
	window.sqsA11yMainBooted = true;

	/*
	 * Ensure the shared namespace exists before any utility or enhancement module
	 * registers itself.
	 */
	window.sqsA11y = window.sqsA11y || {};
	window.sqsA11y.enhancements = window.sqsA11y.enhancements || {};

	// ===========================================================
	// Config / bootstrap
	// ===========================================================

	/*
	 * Resolve the base URL from the currently executing script.
	 * Fallback path is kept for safety if document.currentScript is unavailable.
	 */
	const CURRENT_SCRIPT = document.currentScript;
	const BASE_URL = CURRENT_SCRIPT ? CURRENT_SCRIPT.src.replace(/\/[^/]+$/, "/") : "/sqs-a11y/";

	/*
	 * Track loaded and in-progress scripts globally so repeated calls to
	 * loadFiles() do not re-request the same files.
	 */
	const loadedScripts = window.sqsA11yLoadedScripts || (window.sqsA11yLoadedScripts = new Set());

	const loadingScripts = window.sqsA11yLoadingScripts || (window.sqsA11yLoadingScripts = new Map());

	/*
	 * Primary debug default. Page-level config can override this.
	 */
	const DEBUG = false;

	/*
	 * Merge site/page configuration over local defaults.
	 *
	 * Example page config:
	 * window.sqsA11yConfig = {
	 *   logging: true,
	 *   excludeEnhancements: [],
	 *   version: "1.0.0"
	 * };
	 */
	const config = Object.assign(
		{
			logging: DEBUG,
			excludeEnhancements: [],
		},
		window.sqsA11yConfig || {},
	);

	/*
	 * Manual version string for cache busting.
	 * Change this when deploying updated script files.
	 */
	const SCRIPT_VERSION = config.version || "v0.4.6";

	/**
	 * Lightweight logger controlled by config.logging.
	 */
	function log() {
		if (!config.logging) return;
		console.log.apply(console, ["[sqsA11y]"].concat(Array.prototype.slice.call(arguments)));
	}

	// ===========================================================
	// File lists
	// ===========================================================

	/*
	 * Order matters where one enhancement should generally run before another.
	 * labelIssues appears before autocompleteEnhancer for that reason.
	 */
	const DEFAULT_DEBUG = false;

	const ENHANCEMENT_LIST = [
		{ name: "focusOutline", wcag: "WCAG 2.4.7", debug: DEFAULT_DEBUG },
		{ name: "targetSizeMinimum", wcag: "WCAG 2.5.8", debug: DEFAULT_DEBUG },
		{ name: "skipToMain", wcag: "WCAG 2.4.1", debug: DEFAULT_DEBUG },
		{ name: "smoothAnchorScrollFocus", wcag: "WCAG 2.4.1, 2.4.3, 2.4.7", debug: DEFAULT_DEBUG },
		{ name: "navDropdownLinks", wcag: "WCAG 2.1.1, 4.1.2", debug: DEFAULT_DEBUG },
		{ name: "mobileHamburger", wcag: "WCAG 2.1.1, 2.1.2", debug: DEFAULT_DEBUG },
		{ name: "focusOrderHelpers", wcag: "WCAG 2.4.3", debug: DEFAULT_DEBUG },
		{ name: "linkPurposeEnhancer", wcag: "WCAG 2.4.4", debug: DEFAULT_DEBUG },
		{ name: "emptyButtons", wcag: "WCAG 1.1.1, 2.4.6, 4.1.2", debug: DEFAULT_DEBUG },
		{ name: "labelIssues", wcag: "WCAG 1.3.1, 2.4.6, 4.1.2", debug: DEFAULT_DEBUG },
		{ name: "autocompleteEnhancer", wcag: "WCAG 1.3.5", debug: DEFAULT_DEBUG },
		{ name: "headingAudit", wcag: "WCAG 1.3.1 / 2.4.6", debug: DEFAULT_DEBUG },
		{ name: "contactLinkContext", wcag: "WCAG 1.3.1, 2.4.4, 3.1.5, 4.1.2", debug: DEFAULT_DEBUG },
		{ name: "pdfLinkEnhancer", wcag: "WCAG 2.4.4, 3.2.2", debug: DEFAULT_DEBUG },
		{ name: "formStatusAnnouncer", wcag: "WCAG 4.1.3", debug: DEFAULT_DEBUG },
		{ name: "spacebarLinkActivation", wcag: "WCAG 2.1.1", debug: DEFAULT_DEBUG },
		{ name: "imagesWithoutContext", wcag: "WCAG 1.1.1, 2.4.4", debug: DEFAULT_DEBUG },
		{ name: "videoFallbackImageAltCleaner", wcag: "WCAG 1.1.1", debug: DEFAULT_DEBUG },
		{ name: "parallaxImageAltCleaner", wcag: "WCAG 1.1.1", debug: DEFAULT_DEBUG },
		{ name: "filenameAltCleaner", wcag: "WCAG 1.1.1", debug: DEFAULT_DEBUG },
		{ name: "focusNotObscured", wcag: "WCAG 2.4.11", debug: DEFAULT_DEBUG },
		{ name: "newWindowLinkContext", wcag: "WCAG 2.4.4, 3.2.2", debug: DEFAULT_DEBUG },
		{ name: "reducedMotionHelper", wcag: "WCAG 2.2.2, 2.3.3", debug: DEFAULT_DEBUG },
		{ name: "duplicateRequiredTextCleaner", wcag: "WCAG 3.3.2, 4.1.2", debug: DEFAULT_DEBUG },
		{ name: "duplicateFormErrorTextCleaner", wcag: "WCAG 3.3.1, 3.3.2, 4.1.2", debug: DEFAULT_DEBUG },

		/**
		 * IMPORTANT: Do not enable textSpacingAudit in production.
		 *
		 * This is an audit-only utility for WCAG 1.4.12 testing.
		 * It temporarily applies test CSS for line height, letter spacing,
		 * word spacing, and paragraph spacing so the site can be visually
		 * reviewed for clipped, hidden, overlapping, or cut-off text.
		 */
		//{ name: "textSpacingAudit", wcag: "WCAG 1.4.12", debug: true },
	];

	/*
	 * Shared utilities used by one or more enhancement files.
	 * sqsDomReadySignal is kept and used as the single page-ready source.
	 */
	const UTIL_LIST = [{ name: "squarespaceA11y-utils.js" }, { name: "squarespaceA11y-domReadySignal.js" }];

	// ===========================================================
	// Script loader
	// ===========================================================

	/**
	 * Load one script file only once.
	 *
	 * Behavior:
	 * - If already loaded, return a resolved Promise
	 * - If already loading, return the existing Promise
	 * - Otherwise create a new <script> element and load it
	 *
	 * @param {string} url
	 * @returns {Promise<void>}
	 */
	function loadScript(url) {
		/*
		 * If this URL has already finished loading successfully,
		 * do not create or request the script again.
		 */
		if (loadedScripts.has(url)) {
			return Promise.resolve();
		}

		/*
		 * If this URL is already being loaded, return the same Promise
		 * instead of starting a second request.
		 */
		if (loadingScripts.has(url)) {
			return loadingScripts.get(url);
		}

		const promise = new Promise(function (resolve, reject) {
			/*
			 * Defensive check in case a matching script tag already exists
			 * in the DOM from an earlier load.
			 */
			const existing = document.querySelector('script[data-sqs-a11y-src="' + url + '"]');

			if (existing) {
				//log("Already present in DOM:", url);
				loadedScripts.add(url);
				resolve();
				return;
			}

			const s = document.createElement("script");
			s.src = url + "?v=" + encodeURIComponent(SCRIPT_VERSION);
			s.async = true;
			s.setAttribute("data-sqs-a11y-src", url);

			s.onload = function () {
				//log("Loaded:", url);
				loadedScripts.add(url);
				loadingScripts.delete(url);
				resolve();
			};

			s.onerror = function (e) {
				console.error("[sqsA11y] Failed to load", url, e);
				loadingScripts.delete(url);
				reject(e);
			};

			document.head.appendChild(s);
		});

		loadingScripts.set(url, promise);
		return promise;
	}

	/**
	 * Load utility files first, then enhancement files.
	 *
	 * Utilities must load before enhancements because enhancement files may depend on
	 * shared helper functions or the dom-ready signal utility.
	 */
	async function loadFiles() {
		for (const utilFile of UTIL_LIST) {
			try {
				await loadScript(BASE_URL + "utils/" + utilFile.name);
			} catch (e) {
				console.error("[sqsA11y] Could not load utility file:", utilFile.name, e);
			}
		}

		for (const enhancementFile of ENHANCEMENT_LIST) {
			try {
				await loadScript(BASE_URL + "enhancements/" + enhancementFile.name + ".js");
			} catch (e) {
				console.error(
					"[sqsA11y] Could not load enhancement file:",
					enhancementFile.name + ".js?v=" + Date.now(),
					e,
				);
			}
		}
	}

	/**
	 * stopIfSquarespaceEditMode()
	 * ------------------------------------------------------------
	 * Stops the full sqsA11y utility loader when running inside Squarespace
	 * edit mode.
	 */
	function stopIfSquarespaceEditMode(utils) {
		if (!utils.isSquarespaceEditMode()) return false;

		console.warn("[sqsA11y] Accessibility Utilities skipped in Squarespace edit mode.");

		return true;
	}

	// ===========================================================
	// Enhancement runner
	// ===========================================================

	/**
	 * Run every registered enhancement when sqsDomReadySignal reports that
	 * the page is ready for review and JavaScript-based adjustment.
	 *
	 * @param {Object} detail
	 * Provided by sqsDomReadySignal.
	 */
	function runAllEnhancements(detail) {
		const utils = window.sqsA11y.utils || {};

		if (stopIfSquarespaceEditMode(utils)) return;

		utils.reportUpdate(
			null,
			"",
			`DOM Ready Triggered:  ${detail.reason}, version: ${detail.version}`,
			DEBUG,
		);

		for (const enhancement of ENHANCEMENT_LIST) {
			const functionName = enhancement.name;
			const enhancementFunction =
				window.sqsA11y && window.sqsA11y.enhancements && window.sqsA11y.enhancements[functionName];

			/*
			 * Allow site/page configuration to disable individual enhancements.
			 */
			if (
				Array.isArray(config.excludeEnhancements) &&
				config.excludeEnhancements.indexOf(enhancement.name) > -1
			) {
				continue;
			}

			/*
			 * Skip if the expected enhancement function did not register properly.
			 */
			if (typeof enhancementFunction !== "function") {
				console.warn("[sqsA11y] Enhancement function not found:", functionName);
				continue;
			}

			try {
				enhancementFunction({
					name: enhancement.name,
					wcag: enhancement.wcag,
					debug: enhancement.debug,
					detail: detail,
				});
			} catch (err) {
				console.error("[sqsA11y] Error running enhancement:", functionName, err);
			}
		}
	}

	// ===========================================================
	// DOM-ready watcher bootstrap
	// ===========================================================

	/**
	 * Load all files, then subscribe once to the shared dom-ready utility.
	 *
	 * fireImmediately = true means:
	 * if sqsDomReadySignal already fired before this subscription is attached,
	 * the callback runs immediately with the latest ready state.
	 */
	async function initDomReadyWatcher() {
		await loadFiles();

		if (!window.sqsDomReadySignal || typeof window.sqsDomReadySignal.onReady !== "function") {
			console.error("[sqsA11y] sqsDomReadySignal is not available.");
			return;
		}

		window.sqsDomReadySignal.onReady(function (detail) {
			runAllEnhancements(detail);
		}, true);
	}

	// ===========================================================
	// Public helpers
	// ===========================================================

	/*
	 * Expose loadFiles in case it is needed manually for debugging.
	 */
	window.sqsA11yLoadFiles = loadFiles;

	/*
	 * Start the main bootstrap now.
	 */
	initDomReadyWatcher();
})(window, document);
