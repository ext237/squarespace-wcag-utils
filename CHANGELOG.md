# Changelog

Notable changes to Squarespace Accessibility Utilities, newest first.

Release notes through v0.4.11 were migrated from the README and checked against
local Git history. Versions v0.4.1 through v0.4.7 have no separate tags in this
checkout; their original notes are preserved without inferred release dates.
Dates for tagged versions are taken from Git history, not independently verified publication timestamps.
The early development entries below summarize commits that predate those notes.

## v0.4.12 - 2026-09-14

### Fixed

- `linkPurposeEnhancer`: Parse link destinations before checking their protocols. Only email links and same-origin HTTP(S) paths supply fallback label context; other schemes are ignored.
- `filenameAltCleaner`: Inspect noscript fallback images in detached template contents and skip parsing failures without interrupting subsequent audits. Preserve fallback content and existing filename comparisons.
- `duplicateFormErrorTextCleaner`: Match label `for` attributes to control IDs as literal text, avoiding incomplete CSS escaping while preserving explicit-label priority and wrapping-label fallback.

### Added

- Browser regression fixtures for noscript audit isolation and form label matching with unusual control IDs.
- This standalone changelog, with a link from the README.
- README badges for the latest release, MIT license, and changelog.

## v0.4.11 - 2026-09-14

- Fixed reduced-motion parallax scrolling by applying absolute positioning to parallax items and image wrappers when reduced motion is requested.

## v0.4.10 - 2026-07-27

- Updated `focusOutline` so focused checkboxes and radio buttons preserve their native and Squarespace-rendered selected-state colors.
- Updated `focusOutline` so form controls prefer their text color for a more visible focus outline.
- Updated `focusOutline` to prevent duplicate global focus event listeners when enhancements run more than once.
- Updated `labelIssues` to append screen-reader-only legend text without replacing existing label contents or removing nested form controls.

## v0.4.9 - 2026-06-29

- Additional updates from "excludeFixes" to "excludeEnhancements"
- Expanded installation instructions and supporting documentation.

## v0.4.8 - 2026-06-24

- Updated documentation, made minor bug fixes, and added notes for potential improvements and TODO items.
- Fixed a bug that caused logging to ignore the load config script

## v0.4.7

- Updated `focusOutline` to better handle outline color selection for image-only hyperlinks such as logos.
- Added `duplicateRequiredTextCleaner` - Prevents duplicate screen reader announcements of “required” from assistive technology when the associated Squarespace form control exposes the required state programmatically twice.
- Added `duplicateFormErrorTextCleaner` - Prevents duplicate screen reader announcements when Squarespace places form error text inside a label and also references that error with `aria-describedby`.
- Updated `pdfLinkEnhancer` to add PDF and new-window context to existing `aria-label` values when present, so screen readers receive the same link context even when hidden link text is overridden.
- Added `utils.isSquarespaceEditMode()` to detect Squarespace Builder/edit mode, including preview iframe contexts, so the main utility loader can skip all accessibility utilities while a site is being edited.
- Updated `newWindowLinkContext` so `target="_blank"` links with an existing `aria-label` add the “opens in a new tab” context to the `aria-label` instead of injecting hidden text into the link.
- Added `textSpacingAudit` - Temporarily applies WCAG 1.4.12 text-spacing values and reports elements that may clip, overlap, or lose content.
- Updated `newWindowLinkContext` to skip showing visible "opens in a new page" icon for same-page anchor links so Squarespace-added `target="_blank"` values do not trigger new-tab context or icons on in-page links.
- Updated `newWindowLinkContext` to skip showing visible "opens in a new page" icon on image-only links while still adding assistive-only text.
- Added `filenameAltAudit` - Reports images with filename-based alt text so they can be reviewed for meaningful alt text or decorative `alt=""`.
- Added `parallaxImageAltCleaner` - Clears filename-based alt text from decorative Squarespace 7.0 parallax index page images.
- Updated pdfLinkEnhancer so PDF and new-window notices are added as screen-reader-only text instead of visible appended text, preserving accessibility context without lengthening or breaking button layouts.
- Added `videoFallbackImageAltCleaner` - Clears alt text from decorative Squarespace video fallback images to support WCAG 1.1.1.
- Added `smoothAnchorScrollFocus` - Moves keyboard focus to same-page anchor targets after scrolling, improving skip links and same-page navigation behavior.

## v0.4.6

- Renamed the individual module directory from `/fixes/` to `/enhancements/`.
- Removed `fix_` from individual enhancement file names.
- Updated the shared registry from `window.sqsA11y.fixes` to `window.sqsA11y.enhancements`.
- Updated configuration naming from `excludeFixes` to `excludeEnhancements`.
- Revised documentation language to avoid implying that the library guarantees WCAG compliance.
- Reframed scripts as accessibility enhancements, utilities, mitigations, and JavaScript-based workarounds.
- Updated loader comments and console messages to use enhancement-focused language.
- Updated module registration naming so enhancement names match file names and loader entries.
- Updated shared utility reporting to use `reportUpdate` for traceable element-level updates.
- Improved data-trace handling to avoid duplicate entries.
- Standardized trace formatting for cleaner, repeat-safe output.

- (labelIssues) - Improved legend-to-label handling.
- (labelIssues) - Skipped fields already named through ARIA to avoid duplicate accessible names.
- (labelIssues) - Tightened hidden and system field targeting to reduce interference with dynamic Squarespace controls.
- (labelIssues) - Improved label rebinding selectors to ignore non-labelable inputs.

- (utils) - Standardized screen-reader-only styling through shared utility styling.
- (utils) - Improved visibility detection using computed styles.

- (pdfLinkEnhancer) - Updated behavior to preserve existing `aria-label` values.

- (contactLinkContext) - Improved fallback handling for contact links.
- (contactLinkContext) - Improved hidden-link detection while preserving visible fixed-position links.
- (contactLinkContext) - Reordered context sources to prefer `aria-label`, then `title`, then Squarespace image fallback text.
- (contactLinkContext) - Preserved casing for terms such as BBQ, USA, and brand names.
- (contactLinkContext) - Improved phone link handling so visible numbers and `tel:` href values are handled separately.
- (contactLinkContext) - Added `mailto:` parsing so generated labels can use the actual email address.
- (contactLinkContext) - Scoped heading fallback to nearby content containers and direct child headings.
- (contactLinkContext) - Preserved existing `aria-label` values and added `title` fallback only when helpful.
- (contactLinkContext) - Improved update counting so only actual label or title changes are counted.

- (formStatusAnnouncer) - Improved live-region behavior for repeated form errors.
- (formStatusAnnouncer) - Split form announcements into assertive error alerts and polite success status messages.
- (formStatusAnnouncer) - Expanded mutation monitoring to detect text updates inside existing Squarespace form message nodes.
- (formStatusAnnouncer) - Refined error handling to announce the form-level Squarespace error summary instead of each field error.

- (spacebarLinkActivation) - Scoped Spacebar activation to button-like links only.
- (spacebarLinkActivation) - Avoided overriding native link keyboard behavior.
- (spacebarLinkActivation) - Added safer event handling to reduce duplicate activation.

- (focusNotObscured) - Added scroll offset support to help prevent sticky or fixed Squarespace headers from obscuring focused elements and anchor targets.

- (newWindowLinkContext) - Added visual and assistive context for links opening in a new tab, including optional icon handling and screen-reader text.

- (reducedMotionHelper) - Added support for prefers-reduced-motion to reduce or disable decorative motion, including parallax effects and background video, for users who request reduced motion.

## v0.4.5

- Modernized `linkPurposeEnhancer` to the shared `sqsA11y` global structure with utility integration.

## v0.4.4

- Refactored `focusOrderHelpers` to the shared `sqsA11y` global pattern with utility support.

## v0.4.3

- Moved `targetSizeMinimum` CSS into a standalone constant.
- Unified trace and logging behavior.
- Improved `contactLinkContext` phone formatting and inline text context handling.
- Refined contact label generation.

## v0.4.2

- Updated `focusOutline` naming and structure.
- Simplified focus outline logic.
- Unified logging behavior.
- Added phone display formatting and fallback context handling in `contactLinkContext`.

## v0.4.1

- Added initial module integrations and audit trace support.
- Converted several modules to global registration for the non-module loader.
- Split shared scanning and observer logic into utility helpers.
- Standardized module structure.
- Added retry support for late-rendered Squarespace content.

## Early development (before the versioned notes)

### 2025-10-21

- Added the accessibility loader, shared utilities, skip-to-main fix, and an onload harness example; updated the autocomplete script ([381196e](https://github.com/ext237/squarespace-wcag-utils/commit/381196e904a960fdd43978b03d6eabe95ee028cd)).
- Added configuration to skip selected fixes ([2058732](https://github.com/ext237/squarespace-wcag-utils/commit/2058732a9fe6d83b17091d1c6c0a6d4f36a4df85)).
- Refined skip-to-main behavior and accompanying documentation (commits `de62c28` and `9835e59`).

### 2025-09-10

- Initialized the repository, license, and README.
- Added the standalone Squarespace autocomplete fixer and subsequently updated its comments and removed enclosing script tags (commits `7d2d3b7` and `6fa70a5`).

## Tagged history

These links identify the repository snapshots and comparisons used to check the release notes.

- [v0.4.11](https://github.com/ext237/squarespace-wcag-utils/tree/v0.4.11) ([changes since v0.4.10](https://github.com/ext237/squarespace-wcag-utils/compare/v0.4.10...v0.4.11))
- [v0.4.10](https://github.com/ext237/squarespace-wcag-utils/tree/v0.4.10) ([changes since v0.4.9](https://github.com/ext237/squarespace-wcag-utils/compare/v0.4.9...v0.4.10))
- [v0.4.9](https://github.com/ext237/squarespace-wcag-utils/tree/v0.4.9) ([changes since v0.4.8](https://github.com/ext237/squarespace-wcag-utils/compare/v0.4.8...v0.4.9))
- [v0.4.8](https://github.com/ext237/squarespace-wcag-utils/tree/v0.4.8)
