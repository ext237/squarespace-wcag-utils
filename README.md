<p align="center">
  <img src="assets/sqs-a11y-logo.svg" alt="SqsA11y logo" width="220">
</p>

# SqsA11y

Accessibility enhancement utilities for Squarespace websites.

Current version: v0.4.8
Library: `squarespace-wcag-utils`

Copyright (c) 2026 Joe Lippeatt / 24Moves Consulting
Licensed under the MIT License.

## Introduction

SqsA11y started during an accessibility evaluation, documentation, and remediation project for three Squarespace websites. Early in that process, I found a Squarespace help forum discussion about WCAG compliance, which led me to the official [Squarespace Accessibility Resources](https://support.squarespace.com/hc/en-us/articles/215129127-Accessibility-resources-at-Squarespace) page.

Squarespace recommends following the [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/TR/WCAG22/). However, I quickly found that some accessibility issues, especially on Squarespace 7.0 websites, are difficult to evaluate or remediate through the Squarespace editor alone.

For example, some templates and blocks provide limited control over accessible link text, image alt text, focus behavior, form labeling, and other details that are important during a WCAG review.

With those limitations in mind, I began building small JavaScript utilities to address specific issues one at a time. The first scripts focused on form field behavior and duplicate screen reader announcements. As the number of scripts grew, they became harder to manage individually, so I organized them into this library.

SqsA11y was designed so it could be modified on a per-site, per-template basis, as not all Squarespace sites are built the same.  It is not a replacement for a manual accessibility audit, and it does not guarantee WCAG compliance. It is a collection of practical enhancements intended to help improve accessibility on Squarespace websites where the platform does not provide enough direct control.


## Key Sections

**Important sections of this document**

- [Important Before You Install](#important-before-you-install)
- [What This Library Does](#what-this-library-does)
- [What This Library Cannot Do](#what-this-library-cannot-do)
- [Supported Squarespace Versions](#supported-squarespace-versions)
- [Installation](#installation)
- [Configuration Options](#configuration-options)
- [Hosting Options](#hosting-options)
- [Test the Installation](#test-the-installation)
- [Recommended Use During a WCAG Review](#recommended-use-during-a-wcag-review)
- [Creating New Enhancements](#creating-new-enhancements)
- [Known Limitations](#known-limitations)
- [WCAG Enhancement Map](#wcag-enhancement-map)
- [Potential Future Enhancements](#potential-future-enhancements)
- [WCAG Criteria Not Suitable for JavaScript Remediation](#wcag-criteria-not-suitable-for-javascript-remediation)
- [License](#license)

## Overview

SqsA11y is a JavaScript accessibility enhancement library for Squarespace websites. It is designed to help identify, document, and improve common accessibility issues found in Squarespace 7.0 and 7.1 templates that may not be otherwise available for remediation in the Squarespace builder.

When in Debug Mode, the library will post details in the console window for specific audits of potential issues that need to be tested manually.

The library includes modular enhancements for forms, labels, links, images, focus behavior, keyboard access, motion preferences, target size, and developer-facing accessibility audits. Each enhancement is intentionally scoped to a specific pattern so it can support accessibility review without trying to rewrite the entire website.

SqsA11y is not a replacement for a full WCAG evaluation. It should be used as part of a broader accessibility review that includes manual testing, keyboard testing, screen reader checks, visual inspection, and template-specific validation.

## Important Before You Install

> [!IMPORTANT]
> Use this library as part of an accessibility review and remediation process.  Only certain sections of WCAG can be detected and mitigated with JavaScript and automation.

SqsA11y is intended to help improve common WCAG-related issues on Squarespace websites. It is an accessibility enhancement library, not a complete WCAG compliance solution.

Before installing this library, please understand the following:

- This JavaScript library attempts to improve and/or repair WCAG-related areas of Squarespace sites that may not be otherwise editable within the Squarespace builder.
- It is not possible for a JavaScript utility to make any website fully conform to WCAG on its own.
- This library may help a site perform better during a full accessibility evaluation, but it does not guarantee a passing result.
- This library does not guarantee protection from lawsuits, complaints, demand letters, or legal claims.
- This library should be deployed as part of a site-wide WCAG audit, not instead of an audit.
- This library has been tested on a limited number of Squarespace 7.0 and 7.1 websites, but it has not been tested on every Squarespace template, theme, layout, or third-party integration.
- Deployment should be tested carefully on the specific website where the library is installed.
- JavaScript-based accessibility improvements will not run in browsers where JavaScript is disabled or blocked.
- Manual testing is still required, including keyboard testing, screen reader review, visual inspection, responsive layout testing, and validation against the site's actual user experience.

> [!TIP]
> Each individual enhancement section of SqsA11y can be enabled/disabled to make it easier to test a deployment

## Why This Library Was Developed

- Squarespace sites can produce accessibility issues through template markup, generated controls, dynamic content, or areas that site owners cannot easily edit.
- This project provides modular JavaScript enhancements that improve selected real-world accessibility concerns without modifying Squarespace core code.
- Each enhancement is a standalone script that can be maintained, versioned, and selectively loaded.
- The library focuses on practical improvements for common Squarespace patterns, while recognizing that JavaScript alone cannot fully evaluate or guarantee conformance with WCAG.

## What This Library Does

SqsA11y provides JavaScript-based accessibility enhancements for common Squarespace issues that may be difficult or impossible to edit directly in the Squarespace builder.

The library is designed to:

- Improve common form labeling, required-field, autocomplete, and validation-message issues.
- Improve link context for PDFs, new-window links, image-only links, vague Summary links, phone links, and email links.
- Improve focus behavior for skip links, same-page anchor links, sticky headers, and AJAX-loaded Squarespace pages.
- Improve keyboard support for mobile navigation, dropdown navigation, and button-style links.
- Improve handling of decorative images, filename-based alt text, video fallback images, and Squarespace parallax images.
- Respect reduced-motion preferences for users who request less animation.
- Improve target sizing for common interactive elements.
- Provide developer-facing audits for issues such as heading structure and WCAG text-spacing behavior.
- Map each enhancement to related WCAG success criteria for documentation and review purposes.

SqsA11y is intentionally modular. Each enhancement is scoped to a specific accessibility pattern so it can be reviewed, tested, enabled, disabled, or adjusted as needed for a specific Squarespace site.

## What This Library Cannot Do

SqsA11y, like any JavaScript-based accessibility enhancement library, can help improve accessibility issues, but it cannot make a website fully WCAG compliant on its own.

This library cannot:

- Replace a full accessibility audit.
- Guarantee that a website passes WCAG 2.1, WCAG 2.2, Section 508, ADA, or any other accessibility review.
- Guarantee protection from lawsuits, complaints, demand letters, or legal claims.
- Determine whether written content, visual design, page structure, user flows, alt text, headings, labels, or instructions are appropriate in every context.
- Fix accessibility problems that require human judgment, content editing, design changes, or structural changes inside Squarespace.
- Repair markup or behavior when JavaScript is disabled, blocked, fails to load, or conflicts with other site scripts.
- Guarantee compatibility with every Squarespace template, theme, block type, custom code injection, third-party widget, or future Squarespace markup change.
- Replace manual keyboard testing, screen reader testing, responsive testing, visual review, or site-specific validation.

> [!NOTE]
> SqsA11y should be used as an accessibility support tool within a broader WCAG review and remediation process.

## Project Structure

This library is organized around a main loader, shared utilities, and individual enhancement modules.

```text
squarespace-wcag-utils/
├── squarespaceA11y.js
│   Main loader. Reads config, loads utilities, and runs enabled enhancements.
│
├── utils/
│   Shared helper functions used by multiple enhancements.
│
└── enhancements/
    Individual accessibility enhancement and audit modules.

Most accessibility behavior lives in the enhancements/ directory. Each enhancement file is documented with related WCAG criteria, Squarespace context, dependencies, and implementation notes.
```

## Runtime Behavior

- `squarespaceA11y.js` loads shared utility files first.
- It then loads individual enhancement modules from `/enhancements/`.
- Each enhancement registers itself on the shared `window.sqsA11y.enhancements` namespace.
- The loader waits for `sqsDomReadySignal`, then runs registered enhancements when Squarespace reports that the DOM is ready for review and JavaScript-based adjustment.
- The same enhancements can run again after Squarespace AJAX navigation or dynamic page updates.


## Supported Squarespace Versions

SqsA11y is intended for use with Squarespace 7.0 and 7.1 websites.

The library has been developed around common Squarespace page structures, including forms, navigation, image blocks, summary blocks, video backgrounds, parallax images, and AJAX-loaded page content.

Because Squarespace markup varies by version, template, theme, block type, custom code, and third-party integrations, every installation should be tested on the specific website where it is deployed.

SqsA11y may require customized adjustment for:

- heavily customized Squarespace templates
- older Squarespace 7.0 template families
- custom navigation or form markup
- third-party widgets or injected scripts
- future Squarespace markup or platform changes

## Installation

### Quick Start

The fastest way to install SqsA11y is to load the main `squarespaceA11y.js` file from a public CDN and add it to the site-wide **Footer** Code Injection area in Squarespace.  Other hosting options are described below.

```html
<!-- SqsA11y accessibility enhancement scripts -->
<script>
  window.sqsA11yConfig = {
    logging: false,
    excludeEnhancements: []
  };

(function () {
  var s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/gh/ext237/squarespace-wcag-utils@main/squarespaceA11y.js";
  document.head.appendChild(s);
})();
</script>
<!-- /SqsA11y accessibility enhancement scripts -->

```
> [!TIP]
> During active development, you can use a cache-busting query string to prevent Squarespace's browser caching while testing changes.
> For example, you can use `Date.now()`:
>
> ```js
> s.src = "https://example.com/path/to/squarespaceA11y.js?v=" + Date.now();
> ```

### Configuration options

The `window.sqsA11yConfig` object has two values, `logging` and `excludeEnhancements`.

- `logging`
  - Set to `true` during testing, debugging, or WCAG review.
  - Set to `false` for normal production use.

- `excludeEnhancements`
  - Use this array to disable specific enhancements if a site-specific conflict is found.
  - Leave it empty to allow all registered enhancements to run.

Example configuration with logging enabled and one enhancement disabled:

```js
  window.sqsA11yConfig = {
    logging: true,
    excludeEnhancements: [
      "textSpacingAudit"
    ]
  };
```

After installing, test the site carefully with keyboard navigation, forms, menus, links, mobile layouts, and any custom Squarespace blocks or third-party scripts.

### Hosting Options

SqsA11y can be hosted in several ways:

- Latest Builds: from a public GitHub repository using jsDelivr
- Development & Testing: from a web server you control or a client-owned web server
- from another production CDN

### Option A: Load from jsDelivr

SqsA11y can be loaded from GitHub through jsDelivr, as showin in the `Quick Start` example above.

```text
https://cdn.jsdelivr.net/gh/ext237/squarespace-wcag-utils@main/squarespaceA11y.js
```

The `@main` CDN URL loads the current version from the main branch of the GitHub repository.  You can change that to other branches, or forks.

For example:

```text
https://cdn.jsdelivr.net/gh/ext237/squarespace-wcag-utils@v0.4.8/squarespaceA11y.js
```

Replace `v0.4.8` with the version tag you want to use.

> [!NOTE]
> If you need site-specific changes, do not load directly from the `@main` branch. Fork the repository or host your own tested copy so your changes can be versioned and maintained separately.
>
> Pull requests are welcome for improvements that may benefit other Squarespace sites. Please test changes carefully and include notes about the Squarespace version, template, or site pattern the change is intended to support.

### Option B: Host the Files Yourself

You may also upload the SqsA11y files to a web-accessible server that you control. This is useful for sites that need custom code edits to the library.

Because Squarespace versions, templates, custom code, and third-party integrations can vary from site to site, self-hosting can make it easier to maintain a site-specific copy of the library. For example, you may choose to host each customized copy in a separate folder named for the client or website it supports.

Example script `s.src` URL:

```text
https://example.com/path/to/squarespaceA11y.js?v=0.4.8
```

### Option C: Other Production CDN

You may also host the library from another production CDN.

Use the same complete install pattern shown in Quick Start, but replace the `s.src` URL with the production CDN URL.

### Option D: Squarespace File Hosting

Squarespace file hosting is a research TODO and is not currently the recommended installation method for SqsA11y.

### Test the Installation

After installing the library, review the site carefully.

At minimum, test:

- keyboard navigation
- skip link behavior
- focus visibility
- mobile hamburger navigation
- dropdown navigation
- forms and validation errors
- PDF links and new-window links
- image-only links
- reduced-motion behavior
- target size and responsive layout behavior
- pages with AJAX navigation
- pages with third-party widgets or custom code

SqsA11y should be tested on the specific Squarespace site where it is installed.

> [!IMPORTANT]
> Due to differences in Squarespace builder versions, themes, custom code, and third-party plugins, do not assume that successful behavior on one Squarespace site guarantees successful behavior on another.

## How It Works

### Bootstrap File

SqsA11y is loaded through a main bootstrap file, `squarespaceA11y.js`.

The bootstrap file is responsible for loading the shared utilities and registered enhancement modules, then running those enhancements after Squarespace has finished rendering the page.

### Squarespace Page Rendering

Because Squarespace often modifies page content with JavaScript after the initial HTML loads, SqsA11y is designed to run after the DOM is ready and again after supported Squarespace AJAX page updates.

### Runtime Enhancements

Most enhancements work by making runtime adjustments to the rendered page in the browser.

Depending on the module, runtime changes may include:

- adding or correcting ARIA attributes
- improving accessible names
- adding screen-reader-only helper text
- adding missing keyboard behavior
- improving focus behavior
- injecting small CSS improvements
- reporting possible issues for review

These changes happen in the browser after the page loads. They do not permanently rewrite the Squarespace template, source content, or builder configuration.

### Modular Structure

Each accessibility enhancement is contained in its own module. This modular structure makes it easier to review, test, disable, or customize individual enhancements for a specific Squarespace site.

Examples of enhancement areas include:

- updating form labels, validation messages, and required-field text
- repairing autocomplete attributes
- adding PDF and new-window link context
- adding missing skip links
- improving focus behavior
- respecting reduced-motion preferences in browsers that request it
- improving minimum target size
- clearing decorative or filename-based alt text
- providing developer-facing accessibility audits

### Logging

When `logging` is enabled, SqsA11y reports enhancement activity in the browser console.  See the section 'Recommended Use During a WCAG Review' for details on enabling logging.

This can help during a WCAG review by showing:

- which enhancements ran
- what changes were attempted
- what issues were found
- which items may still need manual review

Logging should usually be enabled during testing and disabled for normal production use.

## Recommended Use During a WCAG Review

During a WCAG review, enable logging so the library can report which enhancements are running, which elements were reviewed, and which changes were made.

Logging is intended for auditing, editing, and debugging. It should normally be disabled on production sites after review is complete.

### Enable logging in the load script config

Site wide logging can be enabled as the library is loaded.  Set the `window.sqsA11yConfig` "logging" value to true.  See the `Configuration Options` section for an example.

Set `logging` back to `false` when active review or debugging is complete.

### Force logging directly in `squarespaceA11y.js`

You may want to toggle logging without modifying the client's Squarespace script injection settings.  Logging can also be forced on inside `squarespaceA11y.js` by temporarily swapping these lines:

```js
const DEBUG = CONFIG.logging === true;
//const DEBUG = true; // global override for testing, uncomment to force debug logging
```

### Reduce noisy console output

If console output becomes too noisy, individual enhancement logging can be disabled in the `ENHANCEMENT_LIST` by setting that enhancement's `debug` value to `false`.

```js
const ENHANCEMENT_LIST = [
  { name: "focusOutline", wcag: "WCAG 2.4.7", debug: DEBUG },
  { name: "targetSizeMinimum", wcag: "WCAG 2.5.8", debug: false }, /* override DEBUG */
];
```

This allows the enhancement to continue running while suppressing its debug output.

### Disable individual enhancements during review

Individual enhancements can be disabled in either of two ways.

**OPTION 1:** Add the enhancement name to the page-level `excludeEnhancements` list:

```html
<script>
  window.sqsA11yConfig = {
    logging: true,
    excludeEnhancements: ["targetSizeMinimum"]
  };
</script>
```

**OPTION 2:** Comment out the enhancement in the `ENHANCEMENT_LIST` inside `squarespaceA11y.js` while testing locally.

```js
const ENHANCEMENT_LIST = [
  { name: "focusOutline", wcag: "WCAG 2.4.7", debug: DEBUG },
  /*{ name: "targetSizeMinimum", wcag: "WCAG 2.5.8", debug: false },*/
];
```

### Suggested audit workflow

1. Enable logging before beginning the review.
2. Reload the page and check the browser console for enhancement activity.
3. Review each logged change manually before treating it as an accessibility improvement.
4. Test with keyboard navigation, screen reader review, browser zoom, mobile viewport widths, and relevant WCAG-specific checks.
5. Temporarily disable individual enhancements when isolating an issue or confirming whether a behavior comes from the library, Squarespace, or custom site code.
6. Document any remaining issues that require manual remediation in Squarespace or third-party tools.
7. Disable logging before final delivery.

This library is intended to support WCAG review work, not replace it. Console output should be treated as developer guidance, not as a pass/fail accessibility report.

### WCAG Documentation Example

When submitting mitigation documentation for manual and automated accessibility updates for a Squarespace website, it may be useful to document that this library was used as part of the review and mitigation process.

**Example WCAG documentation:**

> As part of the accessibility mitigation work, the site includes the `squarespace-wcag-utils` accessibility enhancement library. This library provides JavaScript-based enhancements for selected Squarespace-generated patterns that may affect keyboard navigation, focus visibility, form labeling, link purpose, form status messages, target size, and related accessibility concerns. The library is used as a supplemental mitigation tool alongside manual review, content updates, design review, code inspection, automated testing, and functional keyboard/screen reader testing. Its use does not guarantee WCAG compliance by itself and is not a substitute for ongoing accessibility review. The library is intended to help address selected known Squarespace limitations where direct template or platform-level changes may not be available.

## Creating New Enhancements

There is plenty of other WCAG-related issues that can be audited or repaired in Squarespace 7.0 and 7.1, and various theme templates.  Here are the steps for creating new files:

1. Create a new file inside `/enhancements/`.

Example:

    enhancements/focusOutline.js

2. In your new file, register the enhancement on `window.sqsA11y.enhancements`.

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

4. Review the comment layout used by other files in the `enhancements/` directory. Make sure the new file is well documented, including the Squarespace issue being audited or resolved, supported Squarespace versions or builders when known, related WCAG criteria, dependencies, and any important limitations.

5. Commit your changes to a feature branch and open a pull request for review. Include notes about the Squarespace version, template, or site pattern the enhancement is intended to support.

## Known Limitations

This library is intended to support accessibility review and remediation work on Squarespace websites. It does not guarantee WCAG compliance and does not replace a manual WCAG audit.

Known limitations include:

- Not all WCAG success criteria can be tested or repaired with JavaScript.
- Some checkpoints require human judgment, content review, business-rule review, media review, or site-wide evaluation.
- Automated fixes are pattern-based and limited to common Squarespace 7.0 and 7.1 markup.
- Custom code, third-party plugins, embedded widgets, iframes, and external services may not be fully visible or editable from page-level JavaScript.
- JavaScript cannot reliably evaluate the meaning or quality of content, such as whether alt text, headings, labels, page titles, or link text are accurate.
- JavaScript cannot reliably test media requirements such as captions, transcripts, audio description, flashing thresholds, or background audio.
- JavaScript cannot reliably calculate all color contrast scenarios, especially when background images, video backgrounds, gradients, overlays, transparency, or cross-origin image restrictions are involved.
- Some enhancements may improve accessibility for common cases while still requiring manual confirmation.
- Some audit findings may be false positives or may require developer judgment before action is taken.
- Some repairs may be intentionally conservative to avoid changing page meaning, layout, design, or user-facing content incorrectly.
- Dynamic Squarespace content, AJAX navigation, delayed rendering, forms, popups, and modals may require retesting after interaction or page updates.
- Console logging is developer guidance only. It should not be treated as a pass/fail accessibility report.
- Logging should normally be disabled on production sites after auditing or debugging is complete.
- Individual enhancements may need to be disabled during testing to isolate whether a behavior comes from Squarespace, custom site code, third-party code, or this library.

A complete accessibility review should still include manual WCAG testing, keyboard testing, screen reader review, browser zoom, mobile viewport testing, and review of any third-party tools or embedded services.

## License

This project is licensed under the MIT License.

You may use, copy, modify, merge, publish, distribute, copies of this software, subject to the terms of the MIT License.  This software is provided as-is, without warranty of any kind.  It is intended to support accessibility review and remediation work, but it does not guarantee WCAG compliance, legal compliance, or accessibility compliance for any website.

See the `LICENSE` file for full license details.

## WCAG Enhancement Map

The following section maps WCAG success criteria to related JavaScript enhancements and audits provided by this library.

These mappings describe where the library attempts to support accessibility review, mitigation, or JavaScript-based enhancement. They do not indicate that a criterion is fully satisfied, that a site is compliant, or that manual review is no longer needed.

> [!IMPORTANT]
> This library *ONLY* reports and/or repairs issues related specifically to Squarespace templates.  Not all areas of each success criterion are covered by this library. Some enhancements cannot be addressed with JavaScript.  Some only address part of a requirement that. A complete manual evaluation of each checkpoint is still required.

### 1.1.1 Non-text Content

- `emptyButtons.js`
  - Attempts to identify button elements that do not appear to expose an accessible name.
  - May add a fallback `aria-label` when the button purpose can be reasonably inferred, such as close controls in dialogs or submit buttons in forms.
  - Helps address icon-only or visually empty buttons where the visual control does not provide equivalent text for assistive technologies.

- `filenameAltCleaner.js`
  - Attempts to identify image alt text that exactly matches the image filename, a common Squarespace output pattern.
  - May clear filename-based alt text by setting `alt=""` when the alt value and image filename match after normalization.
  - Does not modify alt text that differs from the image filename.
  - Audits `<noscript>` fallback images for filename-based alt text and reports findings for documentation, but does not modify `<noscript>` markup.

- `imagesWithoutContext.js`
  - Attempts to identify linked images that do not appear to provide a reliable text alternative through visible text, image `alt` text, `aria-label`, or `aria-labelledby`.
  - May add an `aria-label` to the link when meaningful context can be reasonably inferred from another link with the same destination or from nearby readable page text.
  - Does not change the image `alt` text directly.

- `parallaxImageAltCleaner.js`
  - Similar to filenameAltCleaner.js, but specifically for Squarespace 7.0 parallax index page images.
  - Attempts to clear filename-like alt text from decorative Squarespace 7.0 parallax index page images.
  - Targets parallax images using the `.Index-page-image img[data-image]` pattern.
  - May set `alt=""` when the current alt text appears to be only an image filename, such as `.jpg`, `.png`, `.webp`, or `.gif`.
  - Intended for decorative background-style images that should not be announced by assistive technologies.

- `videoFallbackImageAltCleaner.js`
  - Attempts to clear alt text from Squarespace video background fallback images when those images are being used decoratively.
  - Targets fallback images using the `.sqs-video-background img.custom-fallback-image` pattern.
  - May set `alt=""` so decorative poster or fallback images are not announced by assistive technologies.
  - Intended for background video fallback imagery where the image is decorative and does not add meaningful content beyond the video background treatment.

### 1.3.1 Info and Relationships

- `autocompleteEnhancer.js`
  - Attempts to improve machine-readable form field metadata when field purpose can be reasonably inferred from labels, names, placeholders, or IDs.
  - May add valid field-level `autocomplete` tokens and related input hints such as `inputmode` or `autocapitalize`.
  - May normalize broad Squarespace form-level autocomplete behavior so browsers rely more consistently on specific field-level purpose metadata.

- `contactLinkContext.js`
  - Attempts to preserve or infer useful relationships between contact links and nearby page context, such as inline labels, section headings, titles, or existing ARIA metadata.
  - May use surrounding text to help clarify whether a phone number or email address belongs to a specific department, location, person, or service.
  - May normalize visible U.S. phone number formatting and `tel:` link values when the contact link can be safely interpreted.

- `headingAudit.js`
  - Reviews heading structure and reports potential information-relationship issues, such as missing `<h1>` elements, multiple `<h1>` elements, or skipped heading levels.
  - Provides developer-facing audit warnings for manual review.
  - Does not modify headings or change the DOM.

- `labelIssues.js`
  - Attempts to improve form label relationships when a reasonable connection can be inferred.
  - May fill empty Squarespace labels using nearby legend text when the associated control does not already have an ARIA name.
  - May repair labels whose `for` attribute points to a missing control by rebinding the label to a nearby valid form control.
  - Marks known non-user-facing system controls, such as hidden inputs and reCAPTCHA response fields, as hidden from assistive technologies.

### 1.3.5 Identify Input Purpose

- `autocompleteEnhancer.js`
  - Attempts to apply valid `autocomplete` tokens to common contact, identity, and user-information fields when the field purpose can be reasonably inferred.
  - May remove unsupported or incorrect autocomplete values such as `false`, `off`, or `none` from individual fields before applying a valid token.
  - May normalize known Squarespace autocomplete quirks, such as changing `tel-national` to `tel`.
  - May improve browser autofill behavior and assistive technology support for supported input purposes.

### 1.4.11 Non-text Contrast

- `mobileHamburger.js`
  - Attempts to improve the visual contrast of mobile hamburger menu toggles when the toggle color does not appear to meet a 3:1 contrast target against the nearest usable background color.
  - May replace the toggle color with a stronger contrasting color when insufficient contrast is detected.
  - Preserves the existing color when the detected contrast already passes.

### 1.4.12 Text Spacing

- `textSpacingAudit.js`
  - Temporarily applies WCAG 1.4.12 text-spacing test values and reports elements that may clip, overlap, overflow, or lose readable content.
  - Reviews text elements, headings, labels, legends, buttons, links, tables, captions, and common Squarespace navigation items.
  - Reports likely issues caused by hidden or clipped overflow, fixed height constraints, nowrap text, constrained buttons or links, and navigation item overlap.
  - Provides developer-facing audit warnings for manual review.
  - Does not automatically repair text-spacing issues.

### 2.1.1 Keyboard

- `mobileHamburger.js`
  - Attempts to improve keyboard access for likely Squarespace mobile hamburger menu toggles.
  - Ensures identified toggles are included in the normal Tab order.
  - For non-native toggle elements, may add `role="button"` and Enter/Space key activation so the control can be operated from the keyboard.
  - Avoids adding redundant button semantics to native `<button>` elements.

- `navDropdownLinks.js`
  - Attempts to improve keyboard operation for common Squarespace navigation dropdown triggers and folder-style menu controls.
  - Adds Enter and Space key handling so identified dropdown triggers can be activated from the keyboard.
  - May add `tabindex="0"` to non-anchor dropdown controls so they can be reached in the normal Tab order.
  - Preserves native link behavior when the dropdown trigger is already an anchor element.

- `spacebarLinkActivation.js`
  - Attempts to improve keyboard operation for anchor elements that are intentionally presented as button-like controls.
  - Adds Spacebar activation behavior to qualifying links, such as anchors with `role="button"` or common Squarespace button-style link classes.
  - Preserves normal link behavior by not applying Spacebar activation globally to all links, since standard links already activate with Enter and Spacebar is normally used for page scrolling.
  - Uses delegated keyboard handling so dynamically rendered button-style links can continue to be supported.

### 2.1.2 No Keyboard Trap

- `mobileHamburger.js`
  - Related to mobile navigation keyboard access because it helps users reach and activate likely hamburger menu controls.
  - Does not directly manage menu focus trapping, Escape behavior, or focus return after the menu is closed.
  - Keep this mapping only as a related support item, not as a direct repair for keyboard trap behavior.

### 2.2.2 Pause, Stop, Hide

- `reducedMotionHelper.js`
  - Attempts to reduce or suppress decorative motion for users whose browser or operating system requests reduced motion.
  - May neutralize Squarespace parallax transforms and animation effects using `prefers-reduced-motion: reduce`.
  - May hide decorative Squarespace background video iframes while preserving fallback images.
  - Supports motion reduction for affected users, but does not provide a visible pause, stop, or hide control for all users.

### 2.3.3 Animation from Interactions

- `reducedMotionHelper.js`
  - Attempts to reduce decorative motion when the user has enabled `prefers-reduced-motion: reduce`.
  - May disable parallax transforms, transitions, and animations for Squarespace parallax elements.
  - May suppress decorative background videos while keeping fallback imagery visible.
  - Note: WCAG 2.3.3 is Level AAA, not Level AA. Keep this mapping only if the project intentionally tracks helpful accessibility improvements beyond WCAG 2.1/2.2 AA.

- `smoothAnchorScrollFocus.js`
  - Uses smooth scrolling for same-page anchor navigation, but switches to instant scrolling when the user has enabled `prefers-reduced-motion: reduce`.
  - Helps reduce interaction-triggered motion for users who have requested reduced motion.
  - Note: WCAG 2.3.3 is Level AAA, not Level AA. Keep this mapping only if the project intentionally tracks helpful accessibility improvements beyond WCAG 2.1/2.2 AA.

### 2.4.1 Bypass Blocks

- `skipToMain.js`
  - Attempts to provide a "Skip to main content" link when Squarespace does not already provide a native skip link.
  - Places the skip link near the beginning of the document so keyboard users can bypass repeated header and navigation content.
  - Attempts to identify a suitable main content target using the shared `getMainTarget()` utility, or falls back to `main`, `[role="main"]`, or `h1`.
  - Adds an ID to the target when needed and points the skip link to that target.
  - Keeps the skip link visually hidden until it receives keyboard focus.

- `smoothAnchorScrollFocus.js`
  - May support bypass navigation when same-page anchor links are used to move users past repeated content or directly to major page sections.
  - Enhances qualifying same-page anchor links by scrolling to the target and then moving keyboard focus to that target.
  - Does not create a skip link by itself.

### 2.4.3 Focus Order

- `focusOrderHelpers.js`
  - Attempts to support more predictable focus behavior after internal anchor navigation and Squarespace AJAX page loads.
  - May make anchor targets, page sections, or the main content area programmatically focusable with `tabindex="-1"` so focus can be moved there safely when enabled.
  - Reviews in-page anchor links and Squarespace `mercury:load` events that may otherwise leave keyboard focus disconnected from newly displayed content.
  - Currently prepares logical focus targets but does not actively move focus because the `.focus()` calls are disabled pending further testing.

- `skipToMain.js`
  - Attempts to move keyboard focus to the main content target after the skip link is activated.
  - May add `tabindex="-1"` to the main target so it can receive programmatic focus without entering the normal Tab order.
  - Helps keyboard and assistive technology users land at the content destination rather than only scrolling visually.

- `smoothAnchorScrollFocus.js`
  - Attempts to keep keyboard focus aligned with visual same-page anchor navigation.
  - Intercepts qualifying same-page anchor links, scrolls to the matching target, updates the URL hash, and then moves focus to the target.
  - May temporarily add `tabindex="-1"` to non-focusable targets so they can receive programmatic focus without entering the normal Tab order.
  - Uses `preventScroll: true` when moving focus so the scripted focus movement does not create an additional scroll jump.

### 2.4.4 Link Purpose In Context

- `contactLinkContext.js`
  - Attempts to clarify the purpose of `tel:` and `mailto:` links when the visible link text alone may not provide enough context.
  - May add an `aria-label` such as “Call Catering at…” or “Email Events at…” when useful nearby context can be reasonably inferred.
  - Preserves existing `aria-label` values when already present, and may add a `title` instead when helpful context is available.

- `imagesWithoutContext.js`
  - Attempts to improve link purpose for image-only links when the link does not already have readable text, image alt text, or ARIA labeling.
  - May infer link purpose from another same-destination link or nearby Squarespace block context, such as a heading, caption, or summary title.
  - Avoids applying weak labels such as "image", "photo", "read more", "learn more", "click here", or "more".

- `linkPurposeEnhancer.js`
  - Attempts to improve vague Squarespace Summary links, such as "Read More", "Learn More", "Click Here", "View Details", or similar repeated link text.
  - Reviews only Squarespace Summary links using the `.summary-read-more-link` pattern.
  - May add an `aria-label` using nearby Summary item context, such as the related title, heading, card title, or Summary block heading.
  - May fall back to a cleaned same-site URL path when no useful heading or title context is available.
  - Does not attempt to evaluate or repair all vague links across the site.

- `newWindowLinkContext.js`
  - Attempts to improve link purpose context for links that open in a new browser tab or window.
  - Reviews eligible links with `target="_blank"` and skips telephone links, email links, same-page anchor links, navigation links, Squarespace button-style links, and image-only links where visible icon treatment may be disruptive.
  - May append visually-hidden text such as "(opens in a new tab)" when no `aria-label` is present.
  - May append new-tab context to an existing `aria-label` when one is already present.
  - May add a subtle visible external-link icon to standard text links while avoiding duplicate icons or duplicate new-tab wording.

- `pdfLinkEnhancer.js`
  - Attempts to improve link purpose for text-based PDF links by adding screen-reader-only context when the link text does not already identify the link as a PDF.
  - May append hidden text such as "PDF file" to eligible PDF links.
  - Skips image-only and icon-only PDF links when no readable link text is available, because useful link purpose cannot be safely inferred.
  - Checks existing visible text and `aria-label` values to avoid duplicating PDF context.

### 2.4.6 Headings and Labels

- `emptyButtons.js`
  - Attempts to identify buttons that do not appear to have visible text, a title, `aria-label`, or `aria-labelledby`.
  - May add a concise fallback label such as "Close dialog" or "Submit form" when the button purpose can be reasonably inferred.
  - Uses a generic "Button" fallback only when no clearer purpose can be determined.

- `headingAudit.js`
  - Reviews page headings and reports possible heading-label issues for developer review.
  - Flags heading patterns that may make page structure harder to understand, such as no headings, no `<h1>`, multiple `<h1>` elements, or skipped heading levels.
  - Does not repair heading text or heading levels automatically.

- `labelIssues.js`
  - Attempts to identify and repair common Squarespace form label issues, including empty labels and labels with broken `for` targets.
  - May add screen-reader-only label text from nearby legend text when no better accessible name is already present.
  - Reports remaining visible form controls that do not appear to have a label, `aria-label`, or `aria-labelledby` after automatic repairs have been attempted.

### 2.4.7 Focus Visible

- `focusOutline.js`
  - Attempts to provide a visible focus indicator for common interactive elements, including links, buttons, form fields, summary elements, and elements with supported focusable roles or tabindex values.
  - Applies a custom outline on `focusin` and restores prior inline focus styles on `focusout`.
  - May use nearby background color, text color, Squarespace color variables, computed page accent colors, or fallback colors to choose an outline color.
  - Applies a branded two-layer focus treatment for image-only links and logo-style links when they receive focus.
  - May temporarily adjust focused form field background and text color to improve visibility while the field has focus.

- `skipToMain.js`
  - Provides default skip-link CSS that keeps the skip link visually hidden until it receives keyboard focus.
  - Moves the skip link into view on `:focus` so keyboard users can see the control before activating it.
  - Supports focus visibility for the skip link itself, but does not attempt to repair focus indicators across the rest of the site.

- `smoothAnchorScrollFocus.js`
  - Supports focus visibility after same-page anchor navigation by moving keyboard focus to the anchor target after the visual scroll completes.
  - May temporarily add `tabindex="-1"` to non-focusable targets so focus can be placed on the destination element.
  - Helps ensure the visible focus position follows the user's navigation destination instead of remaining on the activated link.
  - Does not define custom focus styling, but supports existing browser, theme, or `focusOutline.js` focus indicators by moving focus to the correct target.

- `targetSizeMinimum.js`
  - Includes a small navigation alignment adjustment intended to help focus outlines sit more predictably around Squarespace header navigation items.
  - Does not create or style focus indicators directly.
  - Should be treated as supporting behavior only; primary focus-visible repair is handled by `focusOutline.js` and related focus-management utilities.

### 2.4.9 Link Purpose Link Only

- `imagesWithoutContext.js`
  - May support link-only purpose review by adding a more complete accessible name to image-only links when meaningful link purpose can be inferred.
  - Note: WCAG 2.4.9 is Level AAA, not Level AA. Keep this mapping only if the project intentionally tracks helpful accessibility improvements beyond WCAG 2.1/2.2 AA.

- `linkPurposeEnhancer.js`
  - May support link-only purpose review by adding a more complete accessible name to vague Summary links when meaningful context can be inferred.
  - Note: WCAG 2.4.9 is Level AAA, not Level AA. Keep this mapping only if the project intentionally tracks helpful accessibility improvements beyond WCAG 2.1/2.2 AA.

### 2.4.10 Section Headings

- `headingAudit.js`
  - May support review of whether headings are being used to organize page content by reporting missing headings and skipped heading levels.
  - Provides audit-only feedback and does not modify heading structure.
  - Note: WCAG 2.4.10 is Level AAA, not Level AA. Keep this mapping only if the project intentionally tracks helpful accessibility improvements beyond WCAG 2.1/2.2 AA.
  - Does not repair heading text or heading levels automatically.

### 2.4.11 Focus Not Obscured Minimum

- `focusNotObscured.js`
  - Attempts to reduce cases where focused elements or anchor targets are hidden behind sticky or fixed Squarespace headers, announcement bars, or navigation areas.
  - Calculates a top offset based on visible sticky or fixed header elements near the top of the viewport.
  - Applies `scroll-margin-top` to common focusable elements, anchor targets, sections, articles, and Squarespace blocks so browser scrolling is less likely to place them underneath fixed page chrome.
  - Does not guarantee that every focused element will remain fully visible in every layout, but may improve behavior for skip links, anchor links, form validation focus movement, and keyboard navigation.

### 2.5.8 Target Size Minimum

- `targetSizeMinimum.js`
  - Attempts to improve target size for common interactive elements by applying a minimum `24px` width and height.
  - Targets links, buttons, submit buttons, and button-like controls.
  - Uses JavaScript-injected CSS to avoid editing Squarespace source templates directly.
  - Attempts to center text and button content while avoiding visible layout disruption in navigation, header links, image links, summary thumbnails, and animated image links.
  - Supports the WCAG 2.5.8 minimum target size expectation, but does not replace manual review of spacing, exceptions, or layout-specific behavior.

### 3.2.5 Change on Request

- `newWindowLinkContext.js`
  - May disclose when a link opens in a new tab or window by adding assistive new-tab context and, for standard text links, a visible external-link icon.
  - Adds `rel="noopener"` to eligible `target="_blank"` links as security hardening.
  - Note: WCAG 3.2.5 is Level AAA, not Level AA. Keep this mapping only if the project intentionally tracks helpful accessibility improvements beyond WCAG 2.1/2.2 AA.

- `pdfLinkEnhancer.js`
  - May disclose when a PDF link appears to open in a new tab or window before the user activates the link.
  - Adds screen-reader-only new-window context when a PDF link uses `target="_blank"` and that behavior is not already identified.
  - Note: WCAG 3.2.5 is Level AAA, not Level AA. Keep this mapping only if the project intentionally tracks helpful accessibility improvements beyond WCAG 2.1/2.2 AA.

### 3.3.1 Error Identification

- `duplicateFormErrorTextCleaner.js`
  - Attempts to preserve visible Squarespace form error messages while preventing the same error text from being announced redundantly.
  - Reviews controls in an error state, including controls with `aria-invalid="true"` or nearby `.form-field-error` messages.
  - Keeps the visible error message and `aria-describedby` relationship available so the field error remains programmatically identifiable.

- `labelIssues.js`
  - Attempts to repair a narrow Squarespace textarea validation issue where a visible error message exists but the textarea's `aria-describedby` points to a missing error ID.
  - May replace a broken `-field-error` reference with a matching existing `-error` element when that visible error element can be found.
  - Helps keep visible textarea validation errors programmatically associated with the field.

### 3.3.2 Labels or Instructions

- `duplicateFormErrorTextCleaner.js`
  - Attempts to prevent Squarespace-injected error text from becoming part of the form control label when that same error is already referenced through `aria-describedby`.
  - May add a clean `aria-label` based on the original label text, excluding duplicated error text and hidden utility content.
  - Does not remove visible labels, visible error messages, required indicators, or existing error descriptions.

- `duplicateRequiredTextCleaner.js`
  - Attempts to prevent duplicate required-field instructions from being announced when Squarespace places visible "(required)" text inside a label and the associated control already exposes required state programmatically.
  - May add `aria-hidden="true"` to the duplicate required text only when that text appears to be only a required marker.
  - Keeps the visible required text available for sighted users and does not remove the control's `required` or `aria-required` state.

- `labelIssues.js`
  - Attempts to preserve form labeling and error-description relationships needed for users to understand form fields and validation feedback.
  - May repair broken textarea `aria-describedby` references so existing Squarespace error instructions remain associated with the correct field.
  - Does not create new validation messages, but may restore the programmatic connection to existing visible error text.

### 4.1.2 Name, Role, Value

- `autocompleteEnhancer.js`
  - Attempts to improve programmatic form control metadata by applying valid field-level autocomplete tokens when field purpose can be reasonably inferred.
  - Does not directly change accessible names, roles, or user-facing labels, but may support more accurate interpretation of form control purpose by browsers and assistive technologies.

- `contactLinkContext.js`
  - Attempts to improve accessible names for phone and email links by adding contextual `aria-label` values when no accessible label already exists.
  - May add supplemental `title` text when an existing `aria-label` is already present.
  - Does not change the link role, but may improve the programmatic name exposed to assistive technologies.

- `duplicateFormErrorTextCleaner.js`
  - Attempts to keep the form control's accessible name distinct from its error description when Squarespace places error text inside the associated label.
  - May add a clean `aria-label` to preserve the intended field name while leaving `aria-describedby` available for the error message.
  - Does not change the control role, visible label, visible error text, or validation state.

- `duplicateRequiredTextCleaner.js`
  - Attempts to keep the required state programmatically available while preventing repeated "required required" announcements in some screen reader and browser combinations.
  - Checks that the associated form control already has `required` or `aria-required="true"` before hiding duplicate required text from assistive technology.
  - Does not change the control role, visible label, visible required text, or required state.

- `emptyButtons.js`
  - Attempts to improve the programmatic name of unlabeled `<button>` elements by adding an `aria-label` when no accessible name is detected.
  - Preserves native button roles and existing Squarespace behavior.
  - Does not modify buttons that already expose an `aria-label`, `aria-labelledby`, visible text, or title.

- `imagesWithoutContext.js`
  - Attempts to provide a programmatic accessible name for image-only links by adding an `aria-label` when no reliable accessible name is detected.
  - Preserves the native link role and existing link destination.
  - Does not modify links that already expose visible text, image alt text, `aria-label`, or `aria-labelledby`.

- `labelIssues.js`
  - Attempts to improve form control accessible names by repairing empty labels, broken label associations, and missing label relationships when a reasonable connection can be inferred.
  - May repair broken `aria-describedby` references for textarea errors so assistive technologies can access the correct field description.
  - Reports visible form controls that still appear to lack an accessible name after automatic repairs.
  - Does not change native control roles or user-entered values.

- `linkPurposeEnhancer.js`
  - Attempts to improve the programmatic accessible name of vague Squarespace Summary links by adding an `aria-label` when useful context can be reasonably inferred.
  - Preserves the native link role, destination, and visible link text.
  - Does not modify links that already expose `aria-label` or `aria-labelledby`.

- `mobileHamburger.js`
  - Attempts to improve programmatic role support for likely mobile hamburger toggles when a non-native element is used as the control.
  - May add `role="button"` to non-button toggles while preserving native button semantics when the control is already a `<button>`.
  - Does not currently add or repair accessible names, `aria-expanded`, or `aria-controls`.

- `navDropdownLinks.js`
  - Attempts to improve programmatic state information for Squarespace navigation dropdown triggers by adding and updating `aria-expanded`.
  - May add `role="button"` to non-anchor dropdown triggers when button-like behavior is being applied.
  - Preserves native link roles for real anchor elements.
  - Does not currently add `aria-controls` or verify that `aria-expanded` always matches the actual visual submenu state after outside interactions.

- `newWindowLinkContext.js`
  - Attempts to improve the programmatic accessible name of links that open in a new tab by adding new-tab context to `aria-label` values or by appending visually-hidden inline text.
  - Preserves the native link role, destination, visible link text, and activation behavior.
  - Does not modify links that already include new-tab or new-window context.

- `pdfLinkEnhancer.js`
  - Attempts to improve the programmatic accessible name of PDF links by appending PDF and new-window context to an existing `aria-label` when one is present.
  - When no `aria-label` is present, may append screen-reader-only inline text so the link's accessible name includes PDF or new-window context.
  - Preserves the native link role, destination, and visible link text.

### 4.1.3 Status Messages

- `formStatusAnnouncer.js`
  - Attempts to identify dynamically injected Squarespace form error and success messages as they appear after form submission.
  - Creates hidden ARIA live regions for assistive technology without making intended visual changes to the page.
  - Uses an assertive `role="alert"` live region for likely form-level error summaries.
  - Uses a polite `role="status"` live region for likely successful form submissions.
  - Attempts to avoid noisy duplicate announcements by announcing form-level error summaries rather than each individual field-level error.

## Potential Future Enhancements

The following section identifies WCAG success criteria where future versions of this library may be able to provide additional audits, warnings, or partial remediation. Inclusion in this section does not indicate that an enhancement is planned, only that JavaScript-based evaluation or mitigation may be possible.

> [!IMPORTANT]
> Any future enhancement would still have limitations and would not replace manual accessibility testing. A complete manual evaluation of each checkpoint is still required.

### 1.1.x Content

- 1.1.1 Non-text Content
	- Audit images that have no `alt` attribute at all.
		- May add `alt=""` only when the image can be confidently identified as decorative.
		- Otherwise, report the image for manual review.
	- Audit SVGs and icon-only controls.
		- Look for inline `<svg>`, icon fonts, or icon wrappers that are inside links/buttons but do not contribute an accessible name.
		- Could overlap with `emptyButtons.js` and `imagesWithoutContext.js`.
	- Audit image links with duplicate adjacent text.
		- Report cases where an image and nearby text link go to the same destination and may create redundant announcements.
	- Audit video, iframe, embed, or object elements without accessible names.
		- Report embedded non-text content without `title`, `aria-label`, or nearby context.
		- Could support YouTube, Vimeo, and other embed accessibility review.

### 1.3.x Content Structure and Meaning

- 1.3.1 Info and Relationships
	- Audit tables for missing or questionable header relationships.
		- Look for data tables without `<th>` elements, missing `scope`, or layout tables that may be exposed as data tables.
		- Likely audit-only because JavaScript cannot reliably determine table purpose.
	- Audit lists that appear visually structured but are not marked up as lists.
		- Look for repeated paragraph/link patterns that may visually function as lists.
		- Report only, since converting content to lists safely would be risky.
	- Audit form groups that may need fieldset/legend relationships.
		- Look for radio button groups, checkbox groups, or repeated form controls without clear group labeling.
		- Could overlap with `labelIssues.js`.
	- Audit ARIA relationship references.
		- Report broken `aria-labelledby`, `aria-describedby`, `aria-controls`, and similar ID references.
		- Some narrow repairs may be possible when the intended target can be confidently inferred.
- 1.3.4 Orientation - JavaScript can potentially detect some orientation restrictions and viewport-locking techniques. Future versions of SqsA11y may provide audit warnings for common orientation-related issues, but will not be able to remove constraints, only report them. This item should be reviewed manually during a WCAG audit.
- 1.3.5 Identify Input Purpose
	- Audit unsupported custom field types or third-party embedded forms.
		- Look for iframes, embedded forms, or custom widgets where input-purpose metadata may be unavailable or outside the library’s control.
		- Useful for documentation, but not repairable from the parent Squarespace page.

### 1.4.x Visual Presentation and Perception

- 1.4.1 Use of Color - This is a possible future enhancement for the JavaScript library, providing an audit for some color-only communication patterns (such as links that are distinguished from surrounding text only by color). However, reliable evaluation depends on visual design, surrounding content, user intent, and whether non-color indicators are meaningfully present.
- 1.4.2 Audio Control - This checkpoint applies when audio plays automatically for more than three seconds. Although JavaScript may be able to detect some media elements or embedded players, it cannot reliably determine autoplay behavior or audio duration.
- 1.4.4 Resize Text - This is a possible future enhancement for the JavaScript library, providing audits for content that may become clipped, overlap, disappear, or require horizontal scrolling when text is resized. Similar testing is already performed by the `textSpacingAudit.js` utility.
- 1.4.10 Reflow - This is a possible future enhancement for the JavaScript library, providing audits for content that may require two-dimensional scrolling, clip, overlap, or become unusable at narrow viewport widths. However, reliable evaluation depends on responsive layout behavior, content type, embedded third-party elements, tables, forms, maps, menus, and Squarespace section design.
- 1.4.12 Text Spacing
	- Add optional repair helpers for common Squarespace clipping patterns.
		- Examples: remove fixed heights, relax `overflow: hidden`, or override `white-space: nowrap` on affected text containers.
		- Repairs should be opt-in because layout changes may visually alter the site.
	- Add more targeted reporting for the cause of each failure.
		- Identify whether the likely issue is fixed height, hidden overflow, nowrap text, constrained line-height, button sizing, or navigation wrapping.
	- Add persistent test mode controls.
		- Allow developers to enable, disable, or visually highlight affected elements during a manual audit.
	- Expand coverage for third-party embeds and custom code blocks.
		- Report embedded or custom content areas where text-spacing changes may cause clipping or horizontal scrolling.

### 2.x User Interaction and Navigation

- 2.1.1 Keyboard
	- Audit interactive elements that are not keyboard reachable.
		- Look for clickable elements such as `<div>`, `<span>`, SVG wrappers, image wrappers, cards, or custom controls with click handlers but no keyboard access.
		- Some repairs may be possible by adding `tabindex="0"`, role support, and Enter/Space activation when the control behavior is clear.
	- Audit positive `tabindex` values.
		- Report elements using `tabindex="1"` or higher because they can create confusing keyboard order.
		- Repair is risky and should likely be audit-only.
	- Audit keyboard traps in common Squarespace overlays.
		- Check whether users can enter and exit modal overlays, mobile menus, lightboxes, and newsletter popups using the keyboard.
		- Repair may be possible only for known Squarespace patterns.
	- Audit custom controls missing expected keyboard behavior.
		- Examples include accordions, tabs, carousel controls, dropdowns, menu buttons, and disclosure widgets.
		- Some repairs may be possible for common Squarespace patterns, but third-party widgets should be reported for manual review.
	- Audit hover-only interactions.
		- Look for menus, galleries, cards, or buttons where content appears on hover but not on focus.
		- Some repairs may be possible by mirroring hover behavior on focus.
- 2.1.2 No Keyboard Trap
	- Audit common Squarespace overlays, popups, lightboxes, mobile menus, and modal dialogs for structural patterns that may contribute to keyboard trap issues.
		- Report modal-style components that contain focusable elements but do not provide an obvious close control.
		- Report components where an Escape-to-close behavior may be expected but is not detectable from known Squarespace patterns.
		- Report cases where focus return may need manual review after a menu, popup, modal, or lightbox closes.
		- This would be a structural audit only, not a reliable keyboard-trap test.
	- Add repair support for known Squarespace modal or mobile menu patterns.
		- Potential repairs may include Escape-to-close behavior, focus return after close, and safer focus handling when overlays open or close.
		- Repairs should be limited to predictable Squarespace patterns because third-party widgets may manage focus internally.
	- Audit hidden overlay content that remains keyboard reachable.
		- Look for offscreen, visually hidden, or closed menu content that still contains focusable elements in the Tab order.
		- Some repairs may be possible by temporarily removing hidden controls from the Tab order when the component is closed.
- 2.2.2 Pause, Stop, Hide
	- Audit Squarespace content that may move, animate, blink, scroll, or auto-update for more than five seconds.
		- Look for known Squarespace patterns such as background videos, autoplaying galleries, announcement bars, marquee-style effects, parallax sections, animated blocks, and auto-rotating content.
		- Report likely issues where no visible pause, stop, hide, or motion-control mechanism is detected.
		- This would be a structural audit only, not a reliable timing or animation-duration test.
	- Add limited repair support for known decorative motion patterns.
		- Existing support already reduces some motion when `prefers-reduced-motion: reduce` is enabled.
		- Future repairs could add optional controls or suppress specific decorative animations for known Squarespace patterns.
		- Repairs should be limited to predictable patterns because third-party widgets and embedded media may manage motion internally.
- 2.4.1 Bypass Blocks
	- Add optional support for multiple skip links.
		- Future versions could support skip links such as “Skip to main content,” “Skip to menu,” or “Skip to footer” when reliable targets exist.
		- This should be limited to predictable Squarespace structures.
- 2.4.2 Page Titled - This is a possible future enhancement for the JavaScript library, providing audits for missing, empty, or potentially unhelpful page titles. However, JavaScript cannot reliably determine whether a page title accurately describes the page content or purpose.
- 2.4.3 Focus Order
	- Audit positive `tabindex` values.
		- Report elements using `tabindex="1"` or higher because they can create focus order that does not match the visual or DOM order.
		- Repair should likely be audit-only unless the pattern is clearly accidental.
	- Audit hidden or offscreen content that remains keyboard reachable.
		- Look for focusable elements inside closed menus, hidden overlays, inactive slides, or collapsed sections.
		- Some repairs may be possible by temporarily removing hidden controls from the Tab order for known Squarespace patterns.
	- Audit focus movement after Squarespace AJAX navigation.
		- Report cases where focus may remain on stale navigation elements or disconnected content after `mercury:load`.
		- Future repairs could move focus to the new page title, `<h1>`, or main content target when reliable.
	- Add optional focus movement for same-page anchor navigation.
		- `focusOrderHelpers.js` already prepares targets, but active `.focus()` behavior is disabled pending testing.
		- Future work could safely enable this behavior for specific anchor and section patterns once tested.
- 2.4.4 Link Purpose In Context
	- Audit vague links outside Squarespace Summary blocks.
		- Look for repeated or weak link text such as “read more,” “learn more,” “click here,” “more,” “details,” “view,” or “this link” outside the `.summary-read-more-link` pattern.
		- Report these for manual review unless useful nearby context can be confidently inferred.
	- Expand contextual repair beyond Summary links.
		- Use nearby headings, card titles, image captions, button containers, or same-destination links to improve accessible link names when the pattern is predictable.
		- Repairs should be conservative because incorrect inferred link purpose can be worse than a vague link.
	- Audit same-destination duplicate links.
		- Look for adjacent image and text links that point to the same URL and may create repeated or unclear announcements.
		- Could overlap with `imagesWithoutContext.js`.
	- Audit icon-only links beyond image links.
		- Look for SVG icons, icon fonts, social icons, search icons, cart icons, or other visual-only links that do not expose a useful accessible name.
		- Some repairs may be possible when the icon purpose can be confidently inferred from classes, URLs, labels, or surrounding context.
	- Audit file links beyond PDFs.
		- Look for links to documents such as `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`, `.zip`, or other downloadable files where the link text does not identify the file type.
		- Future repairs could extend `pdfLinkEnhancer.js` into a broader file-link context enhancer.
- 2.4.7 Focus Visible
	- Expand focus styling support for additional Squarespace patterns.
		- Examples include gallery controls, product controls, social icons, carousel arrows, custom summary cards, and embedded form controls.
		- Repairs should stay limited to predictable Squarespace markup.
- 2.4.9 Link Purpose Link Only
	- Expand link-purpose audits beyond Squarespace Summary links and image-only links.
		- Look for weak link text such as “read more,” “learn more,” “click here,” “more,” “details,” “view,” or “this link.”
		- Unlike 2.4.4, this review would focus on whether the link text or accessible name is understandable by itself.
		- Repairs should be conservative because JavaScript cannot reliably determine the intended link purpose.
	- Audit repeated links with the same accessible name but different destinations.
		- Report cases where multiple links expose the same name but point to different URLs.
		- Some repairs may be possible when nearby headings or card titles provide reliable context.
- 2.4.8 Location *(AAA)*
	- Audit for breadcrumbs, current-page indicators, or nav items missing `aria-current`.
	- Possible repair: add `aria-current="page"` to the current navigation link when URL matching is reliable.
- 2.4.10 Section Headings *(AAA)*
	- Expand `headingAudit.js` to flag large Squarespace sections, forms, galleries, menus, or repeated blocks without nearby headings.
	- Audit-only.
- 2.4.11 Focus Not Obscured Minimum
	- Expand detection of fixed and sticky page elements.
		- Improve identification of Squarespace headers, announcement bars, mobile navigation, floating controls, and custom sticky elements that may obscure focused content.
		- Future versions may support additional Squarespace templates and custom layouts.
- 2.4.13 Focus Appearance *(AAA)* - audit focus indicator size, thickness, area, and contrast.
- 2.5.3 Label in Name - This is a possible future enhancement for the JavaScript library, providing audits for controls where the accessible name may not include the visible label text. However, reliable evaluation depends on comparing visible text, ARIA labels, hidden text, generated content, icon text, and user-facing context.
- 2.5.8 Target Size Minimum
	- Report controls where layout, transforms, overflow clipping, SVG sizing, or custom CSS may prevent the minimum target size from being achieved.
	- Expand support for additional Squarespace and custom interactive patterns.
		- Examples include social icons, gallery arrows, carousel controls, product quantity controls, search icons, cart controls, and third-party embedded widgets.

### 3.x Understandability and Input Assistance

- 3.1.1 Language of Page - This is a possible future enhancement for the JavaScript library, providing audits for missing, empty, or invalid `lang` attributes on the page's root `<html>` element. However, JavaScript cannot reliably determine whether the declared language accurately matches the page content.
- 3.1.2 Language of Parts - This is a possible future enhancement for the JavaScript library, providing audits for page content that may use a language different from the page's primary language. However, JavaScript cannot reliably determine whether foreign-language words, phrases, names, brand terms, menu items, embedded content, or quoted text require separate language markup.
- 3.3.1 Error Identification - Audit fields with visible Squarespace error messages but no `aria-invalid="true"` or equivalent programmatic error state.
- 3.3.7 Redundant Entry - This is a possible future enhancement for the JavaScript library, providing audits for forms that appear to request information that may have already been provided earlier in the same process. However, JavaScript cannot reliably determine business requirements, workflow steps, account state, or whether repeated information is legitimately required.
- 3.3.8 Accessible Authentication (Minimum) - This is a possible future enhancement for the JavaScript library, providing audits for common authentication barriers such as CAPTCHA challenges, cognitive function tests, and authentication workflows. However, JavaScript cannot reliably determine whether an authentication process satisfies all WCAG requirements or whether equivalent accessible alternatives are available.

### 4.x Technical Compatibility

- 4.1.2 Name, Role, Value
	- Audit broken ARIA references.
		- Report `aria-labelledby`, `aria-describedby`, `aria-controls`, `aria-owns`, or similar attributes that reference missing IDs.
	- Improve `mobileHamburger.js` state support.
		- Add or repair accessible names, `aria-expanded`, and `aria-controls` when the mobile menu relationship can be confidently identified.
	- Improve `navDropdownLinks.js` relationship support.
		- Add additional checks to verify that `aria-expanded` remains consistent after outside clicks, Escape key behavior, route changes, or menu close actions.
- 4.1.3 Status Messages
	- Expand support beyond forms. - Add status-message support for common Squarespace interactions such as newsletter signup confirmations, search results, cart updates, product availability messages, filtering interfaces, and AJAX-loaded content.
	- Add developer diagnostics for live-region activity.
		- Provide optional reporting that shows when status messages are detected, announced, suppressed, or ignored.
		- Useful during accessibility testing and troubleshooting.

## WCAG Criteria Not Suitable for JavaScript Remediation

The following section identifies WCAG success criteria that cannot be reliably evaluated or remediated using client-side JavaScript. These checkpoints typically depend on content meaning, business processes, site-wide consistency, media content, human judgment, or information that is not available to page scripts.

> [!IMPORTANT]
> These criteria should be evaluated as part of a manual WCAG audit. No enhancement in this library should be interpreted as satisfying these requirements.

### 1.2.x Audio and Time-Based Media

These checkpoints relate to audio-only content, video-only content, captions, transcripts, media alternatives, and audio description. These requirements usually depend on the actual media content, not only the surrounding Squarespace markup. These WCAG checkpoints cannot be reliably evaluated or remediated using JavaScript.

These items should be reviewed manually during a WCAG audit.

- 1.2.1 Audio-only and Video-only (Prerecorded)
- 1.2.2 Captions (Prerecorded)
- 1.2.3 Audio Description or Media Alternative (Prerecorded)
- 1.2.4 Captions (Live)
- 1.2.5 Audio Description (Prerecorded)

### 1.3.x Content Structure and Meaning

- 1.3.2 Meaningful Sequence - Meaningful sequence cannot be reliably evaluated or repaired automatically. This item should be reviewed manually during a WCAG audit.
- 1.3.3 Sensory Characteristics - This evaluation depends on the meaning of written content. It cannot be reliably detected or repaired using JavaScript. This item should be reviewed manually during a WCAG audit.

### 1.4.x Visual Presentation and Perception

- 1.4.3 Contrast (Minimum) - Although JavaScript can easily detect text and CSS color values, it cannot reliably determine contrast compliance in real-world layouts. Background images, gradients, transparency, overlays, video backgrounds, and cross-origin image restrictions prevent accurate contrast calculations.
- 1.4.5 Images of Text - Images of text cannot be reliably evaluated or repaired automatically. JavaScript may detect that an image exists, but it cannot reliably determine whether the image contains meaningful text, whether that text is decorative, or whether an equivalent text alternative is already provided elsewhere.
- 1.4.7 Low or No Background Audio - This checkpoint applies to prerecorded audio that contains speech over background sound. JavaScript cannot reliably evaluate the audio mix, speech clarity, background volume, or whether background audio can be turned off.

### 2.x User Interaction and Navigation

- 2.1.4 Character Key Shortcuts - JavaScript can listen for keyboard events, but it cannot reliably audit whether a site, embedded widget, or third-party script provides single-character keyboard shortcuts. Automated testing could also interfere with normal keyboard use or miss shortcuts that only work in specific states, components, or focus contexts.
- 2.2.1 Timing Adjustable - JavaScript cannot reliably evaluate whether a page includes time limits that need to be adjustable. Time limits may be created by forms, booking tools, checkout flows, embedded widgets, redirects, sessions, or third-party services, and the required user controls may exist outside the visible page markup.
- 2.3.1 Three Flashes or Below Threshold - JavaScript cannot reliably evaluate whether animated content exceeds the WCAG flash thresholds. Accurate testing requires visual analysis of rendered animation frames, video content, GIFs, canvas elements, and third-party media, which may not be accessible to page scripts.
- 2.4.5 Multiple Ways - JavaScript cannot reliably evaluate whether users have multiple ways to locate pages within a website. Compliance depends on site architecture, navigation structure, search functionality, page relationships, and other organizational factors that require human review.
- 2.5.1 Pointer Gestures - JavaScript cannot reliably evaluate whether pointer gestures have accessible single-pointer alternatives. This checkpoint depends on user interaction patterns, custom widgets, maps, sliders, galleries, embedded tools, and whether equivalent controls are available.
- 2.5.2 Pointer Cancellation - JavaScript cannot reliably evaluate whether pointer interactions can be cancelled, aborted, or reversed. This checkpoint depends on how controls respond to pointer down, pointer up, drag, release, and custom event handling across native, Squarespace, and third-party components.
- 2.5.4 Motion Actuation - JavaScript cannot reliably evaluate whether device motion or user motion is required for operation. This checkpoint depends on device sensors, browser permissions, embedded tools, and whether equivalent non-motion controls are available.
- 2.5.7 Dragging Movements - JavaScript cannot reliably evaluate whether dragging movements have accessible single-pointer alternatives. This checkpoint depends on galleries, sliders, maps, sortable content, embedded widgets, and whether equivalent non-drag controls are available.

### 3.x Understandability and Input Assistance

- 3.2.1 On Focus - JavaScript cannot reliably evaluate whether receiving focus causes an unexpected change of context. This checkpoint depends on user interaction, focus behavior, custom scripts, third-party widgets, forms, menus, redirects, and whether the resulting behavior is expected by the user.
- 3.2.2 On Input - JavaScript cannot reliably evaluate whether changing a form value causes an unexpected change of context. This checkpoint depends on form behavior, custom scripts, third-party widgets, redirects, dynamic updates, and whether the user was informed before the change occurred.
- 3.2.3 Consistent Navigation - JavaScript cannot reliably evaluate whether navigation is presented consistently across pages. This checkpoint depends on site-wide page comparison, template behavior, navigation structure, hidden pages, footer links, and editorial decisions that require manual review.
- 3.2.4 Consistent Identification - JavaScript cannot reliably evaluate whether components with the same function are identified consistently across a website. This checkpoint depends on site-wide comparison of labels, buttons, links, icons, forms, navigation items, and repeated content patterns.
- 3.2.6 Consistent Help - JavaScript cannot reliably evaluate whether help mechanisms appear in the same relative order across pages. This checkpoint depends on site-wide comparison of contact options, support links, chat widgets, self-help content, and other help mechanisms.
- 3.3.3 Error Suggestion - JavaScript cannot reliably evaluate whether appropriate error suggestions are available when user input errors occur. This checkpoint depends on form purpose, business rules, validation requirements, and whether meaningful correction guidance is provided to the user.
- 3.3.4 Error Prevention (Legal, Financial, Data) - JavaScript cannot reliably evaluate whether transactions involving legal commitments, financial transactions, or user-submitted data provide adequate error prevention, confirmation, review, or reversal mechanisms.

## Changelog

### v0.4.9

- Additional updates from "excludeFixes" to "excludeEnhancements"

### v0.4.8

- Updated documentation, made minor bug fixes, and added notes for potential improvements and TODO items.
- Fixed a bug that caused logging to ignore the load config script

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
