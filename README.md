# squarespace-wcag-utils

Small, framework-free accessibility enhancement utilities for Squarespace websites.

This library provides JavaScript-based utilities that attempt to improve selected accessibility issues commonly found in Squarespace 7.0 and 7.1 sites. It is intended to support accessibility review and remediation work, not replace it.

## Important Note

This project does not guarantee WCAG compliance.

These scripts can help identify, improve, or work around certain accessibility patterns in Squarespace-generated markup. They should be used alongside manual testing, content review, design review, keyboard testing, screen reader testing, and broader WCAG evaluation.

Installing this library should not be treated as a complete accessibility solution.

## Why

- Squarespace sites can produce accessibility issues through template markup, generated controls, dynamic content, or areas that site owners cannot easily edit.
- This project provides modular JavaScript enhancements that improve selected real-world accessibility concerns without modifying Squarespace core code.
- Each enhancement is a standalone script that can be maintained, versioned, and selectively loaded.
- The library focuses on practical improvements for common Squarespace patterns, while recognizing that JavaScript alone cannot fully evaluate or guarantee WCAG compliance.

## WCAG Documentation Example

When submitting mitigation documentation for manual and automated accessibility updates to a Squarespace website, it may be useful to document that this library was used as part of the review and mitigation process.

Example documentation:

As part of the accessibility mitigation work, the site includes the `squarespace-wcag-utils` accessibility enhancement library. This library provides JavaScript-based enhancements for selected Squarespace-generated patterns that may affect keyboard navigation, focus visibility, form labeling, link purpose, form status messages, target size, and related accessibility concerns.

The library is used as a supplemental mitigation tool alongside manual review, content updates, design review, code inspection, automated testing, and functional keyboard/screen reader testing. Its use does not guarantee WCAG compliance by itself and is not a substitute for ongoing accessibility review. The library is intended to help address selected known Squarespace limitations where direct template or platform-level changes may not be available.

## Current Structure

squarespace-wcag-utils/ ├── squarespaceA11y.js ← Main loader ├── utils/ │ ├── squarespaceA11y-utils.js ← Shared helper functions │ └── squarespaceA11y-domReadySignal.js └── enhancements/ ├── focusOutline.js ├── targetSizeMinimum.js ├── skipToMain.js ├── navDropdownLinks.js ├── mobileHamburger.js ├── focusOrderHelpers.js ├── linkPurposeEnhancer.js ├── emptyButtons.js ├── labelIssues.js ├── autocompleteEnhancer.js ├── headingAudit.js ├── contactLinkContext.js ├── pdfLinkEnhancer.js ├── formStatusAnnouncer.js ├── spacebarLinkActivation.js └── imagesWithoutContext.js

## How It Works

- `squarespaceA11y.js` loads shared utility files first.
- It then loads individual enhancement modules from `/enhancements/`.
- Each enhancement registers itself on the shared `window.sqsA11y.enhancements` namespace.
- The loader waits for `sqsDomReadySignal`, then runs registered enhancements when Squarespace reports that the DOM is ready for review and JavaScript-based adjustment.
- The same enhancements can run again after Squarespace AJAX navigation or dynamic page updates.

## Documentation

- [WCAG Enhancement Map](WCAG-ENHANCEMENT-MAP.md)

## Quick Start for Squarespace

1. Go to **Settings → Advanced → Code Injection → Footer**.
2. Add the following script tag near the bottom:

 <script src="https://cdn.jsdelivr.net/gh/ext237/squarespace-wcag-utils@main/squarespaceA11y.js"></script>

3. Save and publish the site.
4. Open **DevTools → Console** if logging is enabled.

Example logging may look similar to:

    [sqsA11y] Loaded: utils/squarespaceA11y-utils.js
    [sqsA11y] Loaded: utils/squarespaceA11y-domReadySignal.js
    [sqsA11y] Loaded: enhancements/skipToMain.js
    [sqsA11y] Loaded: enhancements/focusOutline.js

Console output is primarily intended for development and review. It should not be used as proof of WCAG compliance.

## Configuration Options

You can control which enhancements run and whether logs appear in the browser console without editing the library files.

Define `window.sqsA11yConfig` before loading the main script:

    <script>
        window.sqsA11yConfig = {
            logging: true,
            excludeEnhancements: ["focusOutline"],
            version: "v0.4.7"
        };
    </script>

    <script src="https://cdn.jsdelivr.net/gh/ext237/squarespace-wcag-utils@main/squarespaceA11y.js"></script>

### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `logging` | Boolean | `false` | Enables or disables console output for development and review. |
| `excludeEnhancements` | Array | `[]` | List of enhancement names to skip during execution, such as `["focusOutline", "skipToMain"]`. |
| `version` | String | Current loader default | Used for cache busting when loading utility and enhancement files. |

> The configuration block must appear above the `squarespaceA11y.js` script tag so it is available when the loader starts.

## Adding New Enhancements

1. Create a new file inside `/enhancements/`.

Example:

    enhancements/focusOutline.js

2. Register the enhancement on `window.sqsA11y.enhancements`.

Example:

    (function (window, document) {
        "use strict";

        window.sqsA11y = window.sqsA11y || {};
        window.sqsA11y.enhancements = window.sqsA11y.enhancements || {};

        window.sqsA11y.enhancements.focusOutline = function (options = {}) {
            const style = document.createElement("style");

            style.textContent = `
                :focus-visible {
                    outline: 3px solid #005fcc;
                    outline-offset: 3px;
                }
            `;

            document.head.appendChild(style);
        };
    })(window, document);

3. Add the enhancement to `ENHANCEMENT_LIST` inside `squarespaceA11y.js`.

Example:

    const ENHANCEMENT_LIST = [
        { name: "skipToMain", wcag: "WCAG 2.4.1", debug: false },
        { name: "focusOutline", wcag: "WCAG 2.4.7", debug: false }
    ];

The `name` value must match:

- the file name inside `/enhancements/`
- the registered function name inside `window.sqsA11y.enhancements`
- any value used in `excludeEnhancements`

Example:

    focusOutline.js
    window.sqsA11y.enhancements.focusOutline
    excludeEnhancements: ["focusOutline"]

4. Commit and push your changes for review.

## Utilities

`utils/squarespaceA11y-utils.js` contains shared helper functions used by enhancement modules, such as:

- Safe DOM query helpers
- Shared logging helpers
- Data trace helpers
- Style injection helpers
- Text cleanup helpers
- Review reporting helpers

`utils/squarespaceA11y-domReadySignal.js` provides a shared DOM-ready signal for Squarespace sites, including support for dynamic page updates.

## WCAG References

Each enhancement may list one or more WCAG 2.1 or 2.2 success criteria. These references identify the type of accessibility concern the enhancement is related to.

A WCAG reference in this library does not mean the script fully satisfies that criterion. It means the utility is intended to support review or improvement work related to that criterion.

## Testing Guidance

After installing or updating this library, review the affected site manually.

Recommended checks include (but not limited to):

- Keyboard navigation
- Visible focus indicators
- Screen reader output
- Form labels and error messages
- Link purpose
- Button names
- Heading structure
- Mobile navigation behavior
- Automated accessibility scans
- Manual WCAG review

Automated scans can help locate issues, but they cannot confirm full accessibility or WCAG conformance by themselves.

## Squarespace Notes

- Designed for Squarespace 7.0 and 7.1 patterns.
- Intended for front-end enhancement only.
- Does not modify Squarespace core files.
- Some Squarespace-generated markup may change over time.
- Enhancements may need updates if Squarespace changes its templates, scripts, or rendered HTML.
- JavaScript-based adjustments may not cover content, design, editorial, or structural issues that require human review.

## CDN and Cache Notes

This project is commonly loaded through jsDelivr.

Example:

    <script src="https://cdn.jsdelivr.net/gh/ext237/squarespace-wcag-utils@main/squarespaceA11y.js"></script>

jsDelivr may cache files globally. Allow time for new commits to propagate, or update the configured `version` value when deploying changes.

Example:

    <script>
        window.sqsA11yConfig = {
            version: "v0.4.7"
        };
    </script>

## License

MIT © Joe Lippeatt / 24Moves.com

## Changelog

### v0.4.7

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

### v0.4.6

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

### v0.4.5

- Modernized `linkPurposeEnhancer` to the shared `sqsA11y` global structure with utility integration.

### v0.4.4

- Refactored `focusOrderHelpers` to the shared `sqsA11y` global pattern with utility support.

### v0.4.3

- Moved `targetSizeMinimum` CSS into a standalone constant.
- Unified trace and logging behavior.
- Improved `contactLinkContext` phone formatting and inline text context handling.
- Refined contact label generation.

### v0.4.2

- Updated `focusOutline` naming and structure.
- Simplified focus outline logic.
- Unified logging behavior.
- Added phone display formatting and fallback context handling in `contactLinkContext`.

### v0.4.1

- Added initial module integrations and audit trace support.
- Converted several modules to global registration for the non-module loader.
- Split shared scanning and observer logic into utility helpers.
- Standardized module structure.
- Added retry support for late-rendered Squarespace content.
