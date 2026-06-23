/**
 * Squarespace Accessibility Enhancement - filenameAltCleaner.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * Related WCAG Criteria:
 *   - 1.1.1 Non-text Content
 *
 * Description:
 *   Clears image alt text when the alt text exactly matches the image filename,
 *   which commonly happens when Squarespace inserts filename-based alt text.
 *
 * Squarespace Context:
 *   - Intended for common Squarespace 7.0 and 7.1 page structures.
 *   - Squarespace may output image filenames as alt text.
 *   - Only updates images when the alt text matches the image filename.
 *   - Does not modify alt text that differs from the image filename.
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

	window.sqsA11y.enhancements.filenameAltCleaner = function (options = {}) {
		const debug = options.debug || false;
		const utils = window.sqsA11y.utils || {};
		const ENH_NAME = options.name;
		const WCAG = options.wcag;

		/**
		 * normalizeFilenameValue()
		 * ------------------------------------------------------------
		 * Normalizes filename and alt text values for safer comparison.
		 */
		function normalizeFilenameValue(value) {
			if (!value || typeof value !== "string") return "";

			let normalized = value.trim();

			// Spaces in Squarespace filenames may appear as + or %20.
			normalized = normalized.replace(/\+/g, " ");

			try {
				normalized = decodeURIComponent(normalized);
			} catch (err) {
				// Keep the original normalized value if decoding fails.
			}

			return normalized.trim().toLowerCase();
		}

		/**
		 * getImageFilename()
		 * ------------------------------------------------------------
		 * Returns the most useful image filename available from currentSrc,
		 * src, data-src, or data-image.
		 */
		function getImageFilename(img) {
			if (!img || !(img instanceof HTMLImageElement)) return "";

			const source =
				img.currentSrc ||
				img.getAttribute("src") ||
				img.getAttribute("data-src") ||
				img.getAttribute("data-image") ||
				"";

			if (!source) return "";

			try {
				const url = new URL(source, window.location.href);
				const pathname = url.pathname || "";
				const filename = pathname.split("/").filter(Boolean).pop();

				return filename || "";
			} catch (err) {
				const cleanSource = source.split("?")[0];
				return cleanSource.split("/").filter(Boolean).pop() || "";
			}
		}

		/**
		 * getImageContext()
		 * ------------------------------------------------------------
		 * Returns a short developer-facing clue about where the image appears.
		 */
		function getImageContext(img) {
			if (!img || !(img instanceof Element)) return "Context: unknown";

			const parts = [];

			if (img.id) parts.push(`Image ID: #${img.id}`);

			if (img.className && typeof img.className === "string") {
				parts.push(`Image class: .${img.className.trim().replace(/\s+/g, ".")}`);
			}

			const parent = img.closest(
				"a, figure, .image-block, .sqs-block-image, .Index-page-image, .sqs-video-background, header, footer, main, section",
			);

			if (parent) {
				let parentLabel = parent.tagName.toLowerCase();

				if (parent.id) parentLabel += `#${parent.id}`;

				if (parent.className && typeof parent.className === "string") {
					parentLabel += `.${parent.className.trim().replace(/\s+/g, ".")}`;
				}

				parts.push(`Parent: ${parentLabel}`);
			}

			return parts.length ? parts.join(" | ") : "Context: image found";
		}

		/**
		 * auditNoscriptFilenameAlts()
		 * ------------------------------------------------------------
		 * Reports filename-based alt text inside <noscript> fallback images.
		 *
		 * Important:
		 *   This function is audit-only. It does not modify <noscript> content.
		 *
		 * Why:
		 *   JavaScript cannot repair <noscript> fallback markup for users who have
		 *   JavaScript disabled, because this utility would not run for those users.
		 *   However, static scanners may still report filename-based alt text inside
		 *   <noscript>, so this audit provides traceable documentation.
		 *
		 * Behavior:
		 *   - Parses <noscript> fallback HTML.
		 *   - Finds fallback <img> elements with alt text.
		 *   - Compares the alt text to the image filename.
		 *   - Reports matches as scanner/documentation findings.
		 *   - Does not change the live DOM or the fallback markup.
		 */
		function auditNoscriptFilenameAlts() {
			const noscripts = Array.from(document.querySelectorAll("noscript"));

			noscripts.forEach((noscript) => {
				const html = noscript.textContent || noscript.innerHTML || "";

				if (!html || !html.includes("<img")) return;

				const parser = new DOMParser();
				const doc = parser.parseFromString(html, "text/html");
				const images = Array.from(doc.querySelectorAll("img[alt]"));

				images.forEach((img) => {
					const alt = img.getAttribute("alt");
					const src = img.getAttribute("src") || "";

					if (!alt || !src) return;

					const filename = src.split("?")[0].split("/").filter(Boolean).pop();

					if (
						normalizeFilenameValue(alt) &&
						normalizeFilenameValue(filename) &&
						normalizeFilenameValue(alt) === normalizeFilenameValue(filename)
					) {
						utils.reportUpdate(
							noscript,
							ENH_NAME,
							`(${WCAG}) Found filename-based alt text inside <noscript>. This fallback image markup was created by Squarespace and cannot be repaired by this JavaScript utility. Alt/File: "${alt}"`,
							debug,
						);
					}
				});
			});
		}

		/**
		 * cleanFilenameAlt()
		 * ------------------------------------------------------------
		 * Clears alt text only when it matches the image filename.
		 *
		 * Returns {updated, skipped}.
		 */
		function cleanFilenameAlt(img) {
			if (!img || !(img instanceof HTMLImageElement)) return { updated: 0, skipped: 1 };

			const HAS_RUN_MARK = "filenameAltCleaned";
			if (img.dataset[HAS_RUN_MARK] === "1") return { updated: 0, skipped: 1 };

			const alt = img.getAttribute("alt");
			const filename = getImageFilename(img);

			if (!alt || !filename) {
				img.dataset[HAS_RUN_MARK] = "1";
				return { updated: 0, skipped: 1 };
			}

			const normalizedAlt = normalizeFilenameValue(alt);
			const normalizedFilename = normalizeFilenameValue(filename);

			if (normalizedAlt && normalizedFilename && normalizedAlt === normalizedFilename) {
				img.setAttribute("alt", "");
				img.dataset[HAS_RUN_MARK] = "1";

				utils.reportUpdate(
					img,
					ENH_NAME,
					`(${WCAG}) Cleared filename-based alt text. Alt/File: "${alt}" | ${getImageContext(img)}`,
					debug,
				);

				return { updated: 1, skipped: 0 };
			}

			img.dataset[HAS_RUN_MARK] = "1";
			return { updated: 0, skipped: 1 };
		}

		const images = Array.from(document.querySelectorAll("img[alt]"));

		images.forEach((img) => {
			cleanFilenameAlt(img);
		});

		// Audit <noscript> fallback images separately.
		// This is documentation-only because JavaScript cannot repair noscript output
		// for users who actually have JavaScript disabled.
		auditNoscriptFilenameAlts();
	};
})(window, document);
