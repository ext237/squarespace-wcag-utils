/*!
 * sqsDomReadySignal
 * Version: 1.0.1
 * Purpose:
 * Create one unified, repeatable "safe to run DOM enhancements now" signal
 * for Squarespace pages, including:
 * - initial page load
 * - Squarespace dynamic page navigation
 * - editor/admin reload events
 * - late DOM injections after async rendering
 * - internal hyperlink navigation within the same site
 *
 * Why this exists:
 * Squarespace does not always present one single reliable moment where all
 * target DOM is ready. Content may appear:
 * - on first page load
 * - after AJAX/dynamic navigation
 * - after delayed block rendering
 * - after editor-related refreshes
 * - after same-site link clicks that update content asynchronously
 *
 * This utility combines multiple hooks into one observable signal:
 * - window.sqsDomReadySignal.onReady(callback, fireImmediately)
 * - document event: "sqs:dom-ready"
 *
 * Notes:
 * - This signal may fire more than once. That is intentional.
 * - DOM-enhancement code that listens to this should be idempotent.
 * - In other words, each enhancement should safely re-run without damaging the page
 *   or re-processing the same element twice.
 */

(function () {
	"use strict";

	/*
	 * Prevent duplicate installation.
	 * If this utility has already been loaded, do nothing.
	 */
	if (window.sqsDomReadySignal) return;

	/*
	 * Public custom event name dispatched on document each time
	 * the utility decides Squarespace is in a safe state for DOM work.
	 */
	const SIGNAL_NAME = "sqs:dom-ready";

	/*
	 * Internal state container.
	 *
	 * isReady:
	 *   Becomes true after the first successful dispatch.
	 *
	 * version:
	 *   Increments every time a new "safe to run" cycle is emitted.
	 *   Useful if your code wants to know whether the page has changed.
	 *
	 * lastReason:
	 *   A short string describing what trigger caused the latest dispatch.
	 *
	 * lastUrl:
	 *   Used to detect same-site navigation or URL changes.
	 *
	 * timer:
	 *   Debounce timer so multiple rapid events collapse into one signal.
	 *
	 * observer:
	 *   MutationObserver instance used to catch delayed DOM injection.
	 *
	 * subscribers:
	 *   Internal callback registry for code using onReady().
	 */
	const state = {
		isReady: false,
		version: 0,
		lastReason: null,
		lastUrl: location.href,
		timer: null,
		observer: null,
		subscribers: new Set(),
	};

	/**
	 * Emit the unified readiness signal.
	 *
	 * This function:
	 * 1. updates internal state
	 * 2. dispatches a document-level CustomEvent
	 * 3. notifies all registered subscribers
	 *
	 * @param {string} reason
	 * Human-readable reason for the dispatch, such as:
	 * "initial-dom-ready", "template:dynamicPageReady", etc.
	 */
	function dispatch(reason) {
		state.isReady = true;
		state.version += 1;
		state.lastReason = reason;
		state.lastUrl = location.href;

		const detail = {
			version: state.version,
			reason: reason,
			url: state.lastUrl,
			timestamp: Date.now(),
		};

		document.dispatchEvent(new CustomEvent(SIGNAL_NAME, { detail }));

		state.subscribers.forEach(function (callback) {
			try {
				callback(detail);
			} catch (err) {
				console.error("[sqsA11y-sqsDomReadySignal] subscriber error", err);
			}
		});
	}

	/**
	 * Debounced scheduler for dispatch().
	 *
	 * Why this exists:
	 * Squarespace often causes clusters of events and DOM mutations in quick
	 * succession. Instead of firing immediately on every trigger, this waits
	 * briefly, then waits through two animation frames so the browser has a
	 * chance to finish layout and painting.
	 *
	 * @param {string} reason
	 * Reason label passed through to dispatch().
	 *
	 * @param {number} delay
	 * Milliseconds to wait before beginning the two-RAF settle sequence.
	 */
	function schedule(reason, delay) {
		clearTimeout(state.timer);

		state.timer = setTimeout(function () {
			/*
			 * Two requestAnimationFrame calls are a practical way to let
			 * pending DOM/layout work settle before your DOM-enhancement code runs.
			 */
			requestAnimationFrame(function () {
				requestAnimationFrame(function () {
					dispatch(reason);
				});
			});
		}, delay || 60);
	}

	/**
	 * Quick sanity check to confirm the document is usable.
	 *
	 * @returns {boolean}
	 */
	function hasUsableDom() {
		return document.body && document.documentElement;
	}

	/**
	 * Install all listeners and watchers.
	 *
	 * This is the heart of the utility.
	 * It listens to several possible readiness pathways:
	 *
	 * 1. Standard browser lifecycle
	 *    - DOMContentLoaded
	 *    - window load
	 *    - pageshow
	 *    - popstate
	 *
	 * 2. Squarespace lifecycle
	 *    - Squarespace.onInitialize()
	 *    - Y.on('template:dynamicPageReady')
	 *    - mercury:load
	 *
	 * 3. User navigation hints
	 *    - internal same-site link clicks
	 *
	 * 4. Late DOM injection
	 *    - MutationObserver
	 *
	 * 5. URL change fallback
	 *    - polling location.href
	 */
	function init() {
		if (!hasUsableDom()) return;

		/*
		 * Initial page load.
		 * If DOM is already ready enough, schedule immediately.
		 * Otherwise wait for DOMContentLoaded.
		 */
		if (document.readyState === "complete" || document.readyState === "interactive") {
			schedule("initial-dom-ready", 30);
		} else {
			document.addEventListener(
				"DOMContentLoaded",
				function () {
					schedule("dom-content-loaded", 30);
				},
				{ once: true },
			);
		}

		/*
		 * Full page asset load.
		 * This can help with cases where blocks finish stabilizing slightly
		 * later than DOMContentLoaded.
		 */
		window.addEventListener("load", function () {
			schedule("window-load", 30);
		});

		/*
		 * Browser history and bfcache related events.
		 * These help catch cases where navigation occurs through browser
		 * controls or cached page restores.
		 */
		window.addEventListener("popstate", function () {
			schedule("popstate", 120);
			schedule("popstate-late", 500);
		});

		window.addEventListener("pageshow", function () {
			schedule("pageshow", 120);
			schedule("pageshow-late", 500);
		});
		/*
		 * Viewport changes.
		 *
		 * Some Squarespace headers change height or layout between desktop,
		 * tablet, and mobile breakpoints. Re-emitting the shared readiness
		 * signal lets enhancements recalculate measurements without each
		 * enhancement needing its own resize/orientation listeners.
		 */
		window.addEventListener(
			"resize",
			function () {
				schedule("resize", 150);
			},
			{ passive: true },
		);

		window.addEventListener(
			"orientationchange",
			function () {
				schedule("orientationchange", 250);
				schedule("orientationchange-late", 700);
			},
			{ passive: true },
		);
		/*
		 * Squarespace dynamic navigation hook.
		 * This is one of the most important hooks for sites that change pages
		 * without a full browser reload.
		 */
		if (window.Y && typeof window.Y.on === "function") {
			try {
				window.Y.on("template:dynamicPageReady", function () {
					schedule("template:dynamicPageReady", 80);
				});
			} catch (err) {
				console.warn("[sqsA11y-sqsDomReadySignal] Y.on hook failed", err);
			}
		}

		/**
		 * safeOnInitialize(callback)
		 * ----------------------------------------------------------------
		 * Purpose:
		 *   Safely hooks into Squarespace's `onInitialize` lifecycle event,
		 *   which is known to be unreliable depending on load timing.
		 *
		 * Problem:
		 *   Squarespace exposes `window.Squarespace.onInitialize`, but:
		 *   • It may exist before it is safe to call
		 *   • It may throw internal errors if called too early
		 *   • It does not provide a ready-state guarantee
		 *
		 *   This can result in errors like:
		 *   "Cannot read properties of undefined (reading 'toString')"
		 *
		 * Behavior:
		 *   • Attempts to register the callback safely
		 *   • Retries a small number of times if Squarespace is not ready
		 *   • Uses short delays to allow internal initialization to complete
		 *   • Fails quietly after max attempts to avoid console spam
		 *
		 * Strategy:
		 *   • Retry up to ~2 seconds total (4 attempts × 500ms)
		 *   • Swallow transient errors and retry
		 *   • Log a single warning if all attempts fail
		 *
		 * Notes:
		 *   • This is a best-effort hook only
		 *   • Do NOT rely on this as the primary trigger
		 *   • Always pair with:
		 *       - DOMContentLoaded
		 *       - mercury:load (Squarespace AJAX navigation)
		 *
		 * @param {Function} callback - Function to run when initialized
		 */
		function safeOnInitialize(callback) {
			let attempts = 0;
			const maxAttempts = 6;
			const delay = 750;
			let registered = false;

			function tryInit() {
				if (registered) return;

				try {
					if (window.Squarespace && typeof window.Squarespace.onInitialize === "function") {
						window.Squarespace.onInitialize(function () {
							if (registered) return;
							registered = true;
							callback();
						});
						return;
					}
				} catch (err) {
					// swallow
				}

				attempts++;

				if (attempts < maxAttempts) {
					setTimeout(tryInit, delay);
				} else {
					// This tends to happen on first load and is ok, not going to polite the console
					//console.warn("[sqsDomReadySignal] onInitialize failed after retries");
				}
			}

			tryInit();
		}

		/*
		 * Squarespace startup hook.
		 * Useful during initial page bootstrapping.
		 */
		safeOnInitialize(function () {
			schedule("Squarespace.onInitialize", 50);
		});

		/*
		 * Editor/admin refresh hook.
		 * Mercury is associated with Squarespace editor/admin behavior.
		 */
		window.addEventListener("mercury:load", function () {
			schedule("mercury:load", 80);
		});

		/*
		 * Internal hyperlink clicks.
		 *
		 * This helps catch same-site navigation before or while Squarespace
		 * is asynchronously swapping page content. Multiple staggered schedules
		 * are used because content may arrive in phases.
		 */
		document.addEventListener(
			"click",
			function (event) {
				const link = event.target && event.target.closest && event.target.closest("a[href]");
				if (!link) return;
				if (link.target === "_blank") return;
				if (link.hasAttribute("download")) return;

				const href = link.getAttribute("href") || "";
				if (!href) return;
				if (href.indexOf("#") === 0) return;
				if (href.indexOf("mailto:") === 0) return;
				if (href.indexOf("tel:") === 0) return;

				const url = new URL(link.href, location.origin);
				if (url.origin !== location.origin) return;

				schedule("internal-link-click", 150);
				schedule("internal-link-click-late", 600);
				schedule("internal-link-click-later", 1200);
			},
			true,
		);

		/*
		 * MutationObserver to catch delayed content injection.
		 *
		 * This is intentionally broad, because Squarespace may inject or swap:
		 * - layouts
		 * - sections
		 * - forms
		 * - blocks
		 * - summary blocks
		 * - gallery blocks
		 *
		 * The debounce in schedule() prevents this from firing too aggressively.
		 */
		state.observer = new MutationObserver(function (mutations) {
			let shouldFire = false;

			for (let i = 0; i < mutations.length; i++) {
				const mutation = mutations[i];

				if (mutation.type !== "childList" || !mutation.addedNodes.length) continue;

				for (let j = 0; j < mutation.addedNodes.length; j++) {
					const node = mutation.addedNodes[j];

					if (!node || node.nodeType !== 1) continue;

					if (
						node.matches?.(
							".sqs-layout, .Main, main, form, .form-wrapper, .sqs-block-form, .sqs-block, section, [data-section-id]",
						) ||
						node.querySelector?.(
							".sqs-layout, .Main, main, form, .form-wrapper, .sqs-block-form, .sqs-block, section, [data-section-id]",
						)
					) {
						shouldFire = true;
						break;
					}
				}

				if (shouldFire) break;
			}

			if (shouldFire) {
				schedule("mutation-observer", 100);
			}
		});

		state.observer.observe(document.documentElement, {
			childList: true,
			subtree: true,
		});

		/*
		 * Fallback URL watcher.
		 *
		 * This is useful if a same-site URL change occurs but some expected
		 * Squarespace hook does not fire in a given template/setup.
		 *
		 * Multiple schedules are used because some page elements may arrive
		 * slightly after the URL itself changes.
		 */
		setInterval(function () {
			if (location.href !== state.lastUrl) {
				state.lastUrl = location.href;
				schedule("url-change-poll", 120);
				schedule("url-change-poll-late", 500);
			}
		}, 500);
	}

	/*
	 * Public API.
	 *
	 * window.sqsDomReadySignal.isReady
	 *   True after first successful readiness dispatch.
	 *
	 * window.sqsDomReadySignal.version
	 *   Number of readiness cycles emitted so far.
	 *
	 * window.sqsDomReadySignal.lastReason
	 *   Last trigger reason.
	 *
	 * window.sqsDomReadySignal.onReady(callback, fireImmediately)
	 *   Subscribe to future readiness events.
	 *   Returns an unsubscribe function.
	 *
	 * window.sqsDomReadySignal.trigger(reason)
	 *   Manually schedule a readiness cycle.
	 *
	 * window.sqsDomReadySignal.destroy()
	 *   Stop timers, disconnect observer, and clear subscribers.
	 */
	window.sqsDomReadySignal = {
		get isReady() {
			return state.isReady;
		},

		get version() {
			return state.version;
		},

		get lastReason() {
			return state.lastReason;
		},

		/**
		 * Register a callback to run whenever Squarespace is considered
		 * safe for DOM modification.
		 *
		 * @param {Function} callback
		 * Function receiving a detail object:
		 * {
		 *   version,
		 *   reason,
		 *   url,
		 *   timestamp
		 * }
		 *
		 * @param {boolean} fireImmediately
		 * If true and readiness has already happened at least once,
		 * callback runs immediately with the latest known state.
		 *
		 * @returns {Function}
		 * unsubscribe function
		 */
		onReady: function (callback, fireImmediately) {
			if (typeof callback !== "function") {
				return function () {};
			}

			state.subscribers.add(callback);

			if (fireImmediately && state.isReady) {
				try {
					callback({
						version: state.version,
						reason: state.lastReason,
						url: location.href,
						timestamp: Date.now(),
					});
				} catch (err) {
					console.error("[sqsA11y-sqsDomReadySignal] immediate subscriber error", err);
				}
			}

			return function unsubscribe() {
				state.subscribers.delete(callback);
			};
		},

		/**
		 * Manually trigger a new readiness cycle.
		 *
		 * @param {string} reason
		 */
		trigger: function (reason) {
			schedule(reason || "manual-trigger", 0);
		},

		/**
		 * Tear down observer/subscribers/timer.
		 * Useful if the utility must be fully shut down.
		 */
		destroy: function () {
			clearTimeout(state.timer);

			if (state.observer) {
				state.observer.disconnect();
			}

			state.subscribers.clear();
		},
	};

	init();
})();
