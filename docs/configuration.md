# Configuration

This document explains how to configure SqsA11y at the site level and how to control individual enhancement logging inside the library.

## Site-Level Configuration

SqsA11y reads configuration from the global `window.sqsA11yConfig` object before the main library file loads.

This configuration should be placed before the script that loads `squarespaceA11y.js`.

```html
<script>
  window.sqsA11yConfig = {
    logging: false,
    excludeFixes: []
  };
</script>
```

## `logging`

The `logging` option controls whether SqsA11y writes review, debugging, and enhancement activity to the browser console.

### Production Use

For normal production use, logging should usually be disabled.

```js
window.sqsA11yConfig = {
  logging: false,
  excludeFixes: []
};
```

### Review and Debugging Use

During WCAG review, testing, troubleshooting, or site-specific implementation work, logging can be enabled.

```js
window.sqsA11yConfig = {
  logging: true,
  excludeFixes: []
};
```

When logging is enabled, individual enhancements may report:

* when the enhancement runs
* what elements were reviewed
* what changes were made
* what possible issues were found
* what may still require manual review

Console output is developer guidance only. It should not be treated as a pass/fail accessibility report.

## `excludeFixes`

The `excludeFixes` option disables specific enhancements at the site level.

This is useful when:

* an enhancement conflicts with a specific Squarespace template
* a client site has custom code that already handles the issue
* a third-party widget behaves unexpectedly
* you need to isolate an enhancement during testing
* you want to deploy only part of the library behavior

Example:

```js
window.sqsA11yConfig = {
  logging: true,
  excludeFixes: [
    "targetSizeMinimum",
    "focusOutline"
  ]
};
```

The values in `excludeFixes` must match the enhancement names registered in the library.

For example:

```text
focusOutline.js
window.sqsA11y.enhancements.focusOutline
excludeFixes: ["focusOutline"]
```

## Full Load Example

```html
<!-- SqsA11y accessibility enhancement scripts -->
<script>
  window.sqsA11yConfig = {
    logging: false,
    excludeFixes: []
  };

  (function () {
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/gh/ext237/squarespace-wcag-utils@main/squarespaceA11y.js";
    document.head.appendChild(s);
  })();
</script>
<!-- /SqsA11y accessibility enhancement scripts -->
```

## Version-Pinned Example

For production sites, a tagged release is usually safer than loading directly from `@main`.

```html
<!-- SqsA11y accessibility enhancement scripts -->
<script>
  window.sqsA11yConfig = {
    logging: false,
    excludeFixes: []
  };

  (function () {
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/gh/ext237/squarespace-wcag-utils@v0.4.8/squarespaceA11y.js";
    document.head.appendChild(s);
  })();
</script>
<!-- /SqsA11y accessibility enhancement scripts -->
```

## Internal Enhancement Configuration

Inside `squarespaceA11y.js`, each enhancement is registered in the `ENHANCEMENT_LIST`.

Example:

```js
const ENHANCEMENT_LIST = [
  { name: "focusOutline", wcag: "WCAG 2.4.7", debug: DEBUG },
  { name: "targetSizeMinimum", wcag: "WCAG 2.5.8", debug: DEBUG }
];
```

Each entry usually includes:

* `name`
  * The enhancement name.
  * Must match the file name and registered function name.
* `wcag`
  * The related WCAG criterion or criteria.
  * Used for documentation and logging.
* `debug`
  * Controls whether debug output is passed to that enhancement.

## Individual Debugging

The global `logging` option controls the primary `DEBUG` value.

```js
const CONFIG = window.sqsA11yConfig || {};
const DEBUG = CONFIG.logging === true;
```

That value is usually passed into each enhancement through `ENHANCEMENT_LIST`.

```js
const ENHANCEMENT_LIST = [
  { name: "focusOutline", wcag: "WCAG 2.4.7", debug: DEBUG },
  { name: "targetSizeMinimum", wcag: "WCAG 2.5.8", debug: DEBUG }
];
```

To reduce noisy console output, you can override an individual enhancement's debug value.

```js
const ENHANCEMENT_LIST = [
  { name: "focusOutline", wcag: "WCAG 2.4.7", debug: DEBUG },
  { name: "targetSizeMinimum", wcag: "WCAG 2.5.8", debug: false }
];
```

In this example:

* `focusOutline` follows the site-level logging setting.
* `targetSizeMinimum` continues to run, but its debug output is suppressed.

## Forcing Debug Mode Locally

During local development, you may temporarily force debug mode inside `squarespaceA11y.js`.

```js
const DEBUG = true;
```

This should only be used during development or troubleshooting.

Before committing or deploying production code, restore the normal configuration-based behavior:

```js
const DEBUG = CONFIG.logging === true;
```

## Disabling an Enhancement Internally

For local testing, an enhancement can be temporarily removed from the runtime list by commenting it out inside `ENHANCEMENT_LIST`.

```js
const ENHANCEMENT_LIST = [
  { name: "focusOutline", wcag: "WCAG 2.4.7", debug: DEBUG },
  // { name: "targetSizeMinimum", wcag: "WCAG 2.5.8", debug: DEBUG }
];
```

This is different from setting `debug: false`.

* `debug: false` keeps the enhancement active but suppresses its logs.
* commenting out the enhancement prevents it from running.

For deployed sites, prefer using `excludeFixes` instead of editing the library file directly.

## Recommended Review Configuration

During active WCAG review:

```js
window.sqsA11yConfig = {
  logging: true,
  excludeFixes: []
};
```

During production use after testing:

```js
window.sqsA11yConfig = {
  logging: false,
  excludeFixes: []
};
```

During troubleshooting:

```js
window.sqsA11yConfig = {
  logging: true,
  excludeFixes: [
    "nameOfEnhancementToDisable"
  ]
};
```

## Notes

* Keep logging disabled on production sites unless active debugging is needed.
* Use `excludeFixes` for site-level conflicts.
* Use individual `debug` values to reduce noisy console output during development.
* Use internal commenting only for local development or feature testing.
* Always retest the site after changing configuration.
