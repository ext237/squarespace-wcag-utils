---
name: Bug report
about: Create a report to help us improve
title: ''
labels: bug
assignees: ext237

---

## Describe the bug

Describe what happened and what part of SqsA11y appears to be affected.

Example:

- An enhancement did not run
- An enhancement changed the page unexpectedly
- A console error appeared
- A form, link, menu, image, or focus behavior stopped working as expected

## Affected enhancement

Which enhancement appears to be involved, if known?

Examples:

- `skipToMain`
- `focusOutline`
- `labelIssues`
- ...
- Not sure

## Squarespace site details

Please include as much as you can:

- Squarespace version: 7.0 / 7.1
- Template or theme, if known:
- Page type affected: page / blog / product / form / gallery / index / other
- Is AJAX loading enabled? yes / no
- Is the issue on one page or site-wide?
- Website URL

## To reproduce

Steps to reproduce the behavior:

1. Go to:
2. Load the page with SqsA11y enabled
3. Interact with:
4. Observe:

## Expected behavior

Describe what you expected to happen.

## Actual behavior

Describe what actually happened.

## Console messages

Enable debug logging before testing:

```js
window.sqsA11yConfig = {
  logging: true,
  excludeFixes: []
};
```

Then open the browser console and paste any relevant SqsA11y messages or JavaScript errors here.

```text
Paste console messages here
```

## Installation method

How are you loading SqsA11y?

- jsDelivr from GitHub
- Self-hosted copy
- Forked/customized copy
- Other

Version or SqsA11y library URL being used:

```text
Paste script URL or version here
```

## Configuration

Paste your SqsA11y config:

```js
window.sqsA11yConfig = {
  logging: false,
  excludeFixes: []
};
```

## Browser and device

Are you seeing this issue on multiple browsers and devices?

Desktop:

- OS:
- Browser:
- Browser version:

Mobile or tablet, if applicable:

- Device:
- OS:
- Browser:
- Browser version:

## Screenshots or screen recording

Add screenshots, screen recordings, or before/after examples if they help explain the issue.

## Accessibility testing context

If this was found during accessibility testing, please include relevant details:

- Keyboard testing
- Screen reader testing
- Browser zoom
- WCAG checkpoint being reviewed
- Automated tool used, if any

## Additional context

Add anything else that may help diagnose the issue, including custom code, third-party widgets, embedded forms, or other scripts running on the page.
