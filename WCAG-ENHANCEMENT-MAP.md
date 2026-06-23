# WCAG Enhancement Map

This file maps the current `squarespace-wcag-utils` enhancement modules to the WCAG success criteria they are related to.

These mappings are informational only. They describe where the library attempts to support accessibility review, mitigation, or JavaScript-based enhancement. They do not indicate that a criterion is fully satisfied, that a site is compliant, or that manual review is no longer needed.


## 1.1.1 Non-text Content

Related enhancements:

- `emptyButtons.js`
  - Attempts to identify button elements that do not appear to expose an accessible name.
  - May add a fallback `aria-label` when a likely button purpose can be reasonably inferred.

- `imagesWithoutContext.js`
  - Attempts to identify image-only links that do not appear to have a reliable accessible name.
  - May add an `aria-label` to the link when useful context can be reasonably inferred from matching links or nearby readable text.

## 1.3.1 Info and Relationships

Related enhancements:

- `autocompleteEnhancer.js`
  - Attempts to improve form field metadata when field purpose can be reasonably inferred from labels, names, placeholders, or IDs.

- `contactLinkContext.js`
  - Attempts to add contextual labeling support for `tel:` and `mailto:` links when useful surrounding context can be reasonably inferred.

- `headingAudit.js`
  - Reviews heading structure and reports potential issues such as missing `<h1>` elements, multiple `<h1>` elements, or skipped heading levels.
  - Does not modify the DOM.

- `labelIssues.js`
  - Attempts to identify common Squarespace form label and hidden-control patterns that may create accessibility review issues.
  - May add supporting label text, update label associations, or mark known non-user-facing controls as hidden from assistive technologies.

## 1.3.5 Identify Input Purpose

Related enhancements:

- `autocompleteEnhancer.js`
  - Attempts to apply valid `autocomplete` tokens to common contact and identity fields when the field purpose can be reasonably inferred.
  - May improve autofill behavior and assistive technology support for supported input purposes.

## 2.1.1 Keyboard

Related enhancements:

- `mobileHamburger.js`
  - Attempts to improve keyboard support for mobile hamburger menu toggles.
  - May add supporting ARIA attributes, tabindex behavior, and Enter/Space activation when a likely control can be identified.

- `navDropdownLinks.js`
  - Attempts to improve keyboard support for Squarespace navigation dropdown triggers and folder-style links.
  - May add supporting ARIA attributes, tabindex behavior, and Enter/Space handling for submenu toggling.

- `spacebarLinkActivation.js`
  - Attempts to add Spacebar activation behavior to anchor elements that appear to be intentionally presented as buttons.
  - Avoids applying this behavior globally to all links so normal Spacebar page scrolling is preserved.

## 2.1.2 No Keyboard Trap

Related enhancements:

- `mobileHamburger.js`
  - Attempts to improve keyboard interaction with mobile navigation controls.
  - Related to keyboard access patterns that may affect menu entry, activation, or exit behavior.

## 2.4.1 Bypass Blocks

Related enhancements:

- `skipToMain.js`
  - Attempts to provide a "Skip to main content" link that appears on focus.
  - May help keyboard users bypass repeated navigation and move more directly to main page content.

## 2.4.3 Focus Order

Related enhancements:

- `focusOrderHelpers.js`
  - Attempts to support more predictable focus movement after internal anchor navigation and Squarespace AJAX page loads.
  - May help keyboard and assistive technology users keep their place after dynamic page changes.

## 2.4.4 Link Purpose In Context

Related enhancements:

- `contactLinkContext.js`
  - Attempts to clarify the purpose of contact links such as phone and email links when surrounding context can be reasonably inferred.

- `imagesWithoutContext.js`
  - Attempts to improve link purpose for image-only links by using same-URL link text or nearby readable context when available.

- `linkPurposeEnhancer.js`
  - Attempts to improve vague Squarespace Summary links, such as "Read More" or "Read More →".
  - May add context from the related item title or from a cleaned internal URL path.
  - Intentionally limited to Squarespace Summary section links.

- `pdfLinkEnhancer.js`
  - Attempts to improve PDF link clarity by adding a visible "(PDF)" indicator to text-based PDF links when one is not already present.
  - May also disclose new-tab behavior when that behavior can be identified.

## 2.4.6 Headings and Labels

Related enhancements:

- `emptyButtons.js`
  - Attempts to identify buttons that do not appear to expose a label or accessible name.

- `headingAudit.js`
  - Reviews heading structure and reports possible heading issues for developer review.
  - Does not modify the DOM.

- `labelIssues.js`
  - Attempts to improve form label relationships when a reasonable connection can be inferred.
  - Reviews empty labels, orphaned labels, and known hidden or system form controls.

## 2.4.7 Focus Visible

Related enhancements:

- `focusOutline.js`
  - Attempts to provide a visible focus outline for interactive elements.
  - May adjust outline color based on nearby background or text color to improve visibility.

## 2.5.8 Target Size Minimum

Related enhancements:

- `targetSizeMinimum.js`
  - Applies a JavaScript-based enhancement for interactive elements that may appear smaller than the recommended 24x24px minimum target size.
  - Attempts to improve target sizing while avoiding visible layout shifts in headers, navigation areas, and image link blocks.

## 3.2.5 Change on Request

Related enhancements:

- `pdfLinkEnhancer.js`
  - May disclose when a PDF link appears to open in a new tab.
  - Note: WCAG 3.2.5 is Level AAA, not Level AA. Keep this mapping only if the project intentionally tracks helpful accessibility improvements beyond WCAG 2.1/2.2 AA.

## 4.1.2 Name, Role, Value

Related enhancements:

- `autocompleteEnhancer.js`
  - Attempts to improve form metadata and input purpose signals when field context can be reasonably inferred.

- `contactLinkContext.js`
  - Attempts to provide or supplement accessible labeling for contact links when useful context can be reasonably inferred.

- `emptyButtons.js`
  - Attempts to identify unnamed buttons and may add fallback labels when button purpose can be reasonably inferred.

- `imagesWithoutContext.js`
  - Attempts to improve accessible names for image-only links by labeling the link when reliable context is available.

- `labelIssues.js`
  - Attempts to improve form label associations and reduce exposure of known non-user-facing form controls.

- `navDropdownLinks.js`
  - Attempts to add supporting ARIA attributes and keyboard behavior for Squarespace navigation dropdown triggers.

## 4.1.3 Status Messages

Related enhancements:

- `formStatusAnnouncer.js`
  - Attempts to identify Squarespace form error or success messages as they appear.
  - May announce likely errors through an assertive alert region and likely success messages through a polite status region.
  - Attempts to reduce duplicate announcements while making no intended visual changes.

## Criteria Not Currently Mapped

Only criteria referenced by the current enhancement headers are listed above. Any WCAG criteria not listed here are not currently represented by a named enhancement in this library.

Update this file whenever enhancement headers, file names, module behavior, or WCAG references change.

