# Limitations

This document describes the known limitations of SqsA11y.

Understanding these limitations is important when planning a WCAG review, evaluating accessibility findings, or developing new enhancements.

## SqsA11y Is Not a WCAG Compliance Tool

SqsA11y is a collection of accessibility enhancements and audit helpers intended to support WCAG review and remediation work on Squarespace websites.

It is especially useful for issues that may be difficult or impossible to edit directly through the Squarespace page builder, template controls, or site settings.

SqsA11y can help improve accessibility, but it does not guarantee WCAG compliance on its own.

It is not a complete WCAG compliance scanner, certification tool, or automated accessibility audit platform.

While many enhancements address common accessibility issues, no JavaScript library can guarantee WCAG compliance.

Manual review and testing are always required, and SqsA11y can help your review and mitigation steps be successful at providing the best good-faith effort at providing an accessible Squarespace website.

## JavaScript Cannot Fix Everything

Some accessibility issues cannot be reliably detected or repaired using JavaScript.

Examples include:

* content meaning
* content accuracy
* reading level
* instructional quality
* sensory references
* alternative text quality
* transcript quality
* caption quality
* error message quality
* logical content relationships that depend on author intent

These issues require human review.

## Some WCAG Criteria Are Not Suitable for Automated Remediation

Many WCAG criteria depend on context, meaning, intent, content quality, design decisions, or business requirements.

SqsA11y may help identify or document some of these issues, but manual review and manual remediation are still required.

Examples include:

- 1.3.3 Sensory Characteristics
- 1.4.5 Images of Text
- 2.4.4 Link Purpose (In Context)
- 3.1.5 Reading Level
- 3.3.2 Labels or Instructions

Some issues may be partially detectable, but a safe automated repair may not be possible.

For criterion-specific guidance, review these sections in the project `README.md`:

- **WCAG Enhancement Map**: lists success criteria where SqsA11y provides audits, enhancements, or partial/full mitigation support.
- **Potential Future Enhancements**: lists future research areas and possible enhancement ideas.
- **WCAG Criteria Not Suitable for JavaScript Remediation**: lists criteria that cannot be reliably evaluated or remediated with client-side JavaScript and should be reviewed manually.

## Squarespace Builder Limitations

Some accessibility issues originate from limitations within Squarespace itself.

Examples may include:

* inaccessible or limited control over generated HTML
* limited access to certain system-generated content
* third-party integrations that are not WCAG conformant
* legacy Squarespace 7.0 template behavior

In some cases, SqsA11y can improve the output. In other cases, only Squarespace can fully resolve the issue.

## Third-Party Widgets

Third-party widgets frequently generate content after page load.

Examples include:

* reservation systems
* ordering systems
* booking engines
* calendars
* chat systems
* marketing tools
* embedded applications
* anything that lives in an iframe

SqsA11y cannot guarantee compatibility with every third-party integration.

Testing is required whenever third-party content is present.

## Browser Differences

Accessibility support varies between:

- browsers
- screen readers
- operating systems
- assistive technologies

A repair that works well in one environment may behave differently in another.

Most enhancements were initially tested in a restrictive testing environment, including a standard web browser, OS-provided VoiceOver, and an iPhone 17 Pro Max. Testing in this environment helps identify issues that may affect users with built-in assistive technology, but it does not guarantee identical behavior across all assistive technologies.

As with any WCAG accessibility project, testing should include multiple browsers, devices, screen readers, and assistive technologies whenever possible.

## Screen Reader Differences

Different screen readers may announce the same content differently.

Examples include:

* NVDA
* JAWS
* VoiceOver
* Narrator
* TalkBack

SqsA11y attempts to follow accessibility best practices, but screen reader behavior is ultimately controlled by the assistive technology, browser, operating system, and the user's individual settings. Results may vary.

## Existing Accessibility Improvements

Many websites already contain accessibility improvements.

Examples include:

* custom ARIA attributes
* custom focus handling
* custom labels
* third-party accessibility code

SqsA11y attempts to avoid overwriting existing accessibility work whenever possible.

## Dynamic Content

Squarespace pages often include dynamically updated content. SqsA11y includes support for known Squarespace page-rendering and content-update signals so enhancements can be re-applied after supported Squarespace content changes.

However, some websites also include third-party content, plugins, embeds, or custom scripts that update the page outside of Squarespace's normal rendering events.

In those cases, `/utils/squarespaceA11y-domReadySignal.js` may need to be customized so SqsA11y can detect the additional content changes and re-run the appropriate enhancements.

## Performance Considerations

Most SqsA11y enhancements are intentionally lightweight.

However, performance may be affected by:

- large pages
- complex layouts
- large numbers of DOM elements
- excessive audit logging
- third-party widgets or scripts
- enhancements that run repeatedly after dynamic page updates

Audit-only enhancements are generally intended for review and testing. They are usually commented out or disabled by default. If you use or create audit-only enhancements, disable them after the audit documentation is complete.

If a remediation enhancement causes a performance issue, it can be disabled by adding its enhancement name to the `window.sqsA11yConfig.excludeEnhancements` array.

See `docs/installation.md` and `docs/configuration.md` for more details.

## Audit Enhancements May Produce False Positives

Audit enhancements intentionally favor caution.

This means they may report:

* possible issues
* questionable patterns
* edge cases
* items requiring manual review

A reported finding should be treated as a review item, not an automatic WCAG failure.

## Remediation Enhancements May Not Be Appropriate for Every Site

A remediation that works well on one site may not be appropriate for another.

Review all enhancements before deploying them broadly.

## Future Squarespace Changes

Squarespace frequently updates:

- templates
- generated markup
- navigation systems
- form systems
- editor behavior

An enhancement that works today may require updates in the future.

Testing should be performed after significant Squarespace platform changes.

Bug reports, questions, and patches are welcome in the official GitHub repository:

https://github.com/ext237/squarespace-wcag-utils

## Community-Contributed Enhancements

Community contributions are welcome and encouraged.

However, contributed enhancements may vary in:

* testing coverage
* browser support
* WCAG interpretation
* implementation approach

Review contributed enhancements before deploying them to production websites.

## The Most Important Limitation

SqsA11y is designed to assist accessibility review and remediation efforts.

It is not a substitute for:

* manual accessibility testing
* keyboard testing
* screen reader testing
* content review
* accessibility training
* professional accessibility audits

Accessibility is ultimately a people, content, design, and development process. SqsA11y is one tool that can help support that process.
