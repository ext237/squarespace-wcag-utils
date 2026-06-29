# Installation

This document describes the recommended installation methods for SqsA11y.

## Before You Install

> [!IMPORTANT]
> SqsA11y is an accessibility enhancement library. It is not a complete WCAG compliance solution and should be used as part of a broader accessibility review and remediation process.

Before deployment:

* Review the site's accessibility requirements.
* Test the library on a staging site whenever possible.
* Enable logging during implementation and testing.
* Perform manual keyboard, screen reader, and responsive layout testing after installation.
* Verify compatibility with any custom code or third-party integrations.

## Quick Start

The fastest way to install SqsA11y is to load the main `squarespaceA11y.js` file from jsDelivr and place the script in the site's **Footer Code Injection** area.

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

## Configuration

The `window.sqsA11yConfig` object supports two primary options.

### Enable Logging

Enable logging during WCAG review, testing, and troubleshooting.

```js
window.sqsA11yConfig = {
  logging: true,
  excludeEnhancements: []
};
```

### Disable Specific Enhancements

Individual enhancements can be disabled if a site-specific conflict is identified.

```js
window.sqsA11yConfig = {
  logging: true,
  excludeEnhancements: [
    "targetSizeMinimum",
    "focusOutline"
  ]
};
```

The values inside `excludeEnhancements` must match the enhancement names registered in the library.

## Installation Options

### Option A: jsDelivr (Recommended)

Load the library directly from GitHub using jsDelivr.

```text
https://cdn.jsdelivr.net/gh/ext237/squarespace-wcag-utils@main/squarespaceA11y.js
```

You may also load a specific tagged release.

```text
https://cdn.jsdelivr.net/gh/ext237/squarespace-wcag-utils@v0.4.8/squarespaceA11y.js
```

Using a version tag is recommended for production websites because it prevents unexpected changes when future updates are released.

### Option B: Self Hosting

You may host the library on your own server.

Example:

```text
https://example.com/assets/squarespaceA11y.js?v=0.4.8
```

Self-hosting is recommended when:

* Site-specific modifications are required.
* Custom enhancements have been added.
* A client requires complete control of deployed code.
* The installation must be isolated from future upstream changes.

### Option C: Other CDN Providers

The library may be hosted on any production CDN capable of serving JavaScript files.

Use the same installation pattern shown above and replace the script URL with the CDN location.

### Option D: Squarespace File Hosting

Squarespace file hosting support is currently considered experimental and is not the recommended deployment method.

Additional testing and documentation are needed before this option can be officially supported.

## Verifying Installation

After installation:

1. Open the website.
2. Open browser developer tools.
3. Verify that `squarespaceA11y.js` loads successfully.
4. Enable logging if troubleshooting is needed.
5. Confirm that expected enhancements are running.

When logging is enabled, the browser console should display SqsA11y initialization and enhancement activity.

## Recommended Post-Installation Testing

At minimum, test:

* Keyboard navigation
* Skip link behavior
* Focus visibility
* Mobile navigation
* Dropdown navigation
* Forms and validation
* PDF links
* New-window links
* Image-only links
* Reduced motion behavior
* AJAX page navigation
* Responsive layouts
* Third-party widgets

> [!IMPORTANT]
> Successful installation does not guarantee WCAG conformance. Manual accessibility testing is still required.

## Troubleshooting

### The Library Does Not Load

Verify:

* The script URL is correct.
* The script is placed in Squarespace Code Injection.
* The browser console does not show JavaScript errors.
* The CDN or hosting location is accessible.

### An Enhancement Causes a Problem

Temporarily disable the enhancement using `excludeEnhancements`.

Example:

```js
window.sqsA11yConfig = {
  logging: true,
  excludeEnhancements: ["targetSizeMinimum"]
};
```

Then retest the affected functionality.

### Debugging

Enable logging:

```js
window.sqsA11yConfig = {
  logging: true,
  excludeEnhancements: []
};
```

Review the browser console for enhancement activity, audit findings, and troubleshooting information.
