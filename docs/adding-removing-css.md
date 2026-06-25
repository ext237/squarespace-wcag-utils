# Adding and Removing CSS

This document explains how SqsA11y enhancement files can add CSS to a page, and how temporary CSS can be removed after an audit is complete.

## Adding CSS with `injectStyleOnce()`

SqsA11y provides a utility function named `injectStyleOnce()`.

This helper adds a `<style>` block to the page only if a style block with the same ID does not already exist.  If the ID already exists, the CSS will not be added or updated, so pick IDs carefully.

Example:

```js
utils.injectStyleOnce(
	"sqs-a11y-sr-only-style",
	"head",
	`
	.sqs-a11y-sr-only {
		position: absolute !important;
		width: 1px !important;
		height: 1px !important;
		padding: 0 !important;
		margin: -1px !important;
		overflow: hidden !important;
		clip: rect(0 0 0 0) !important;
		white-space: nowrap !important;
		border: 0 !important;
	}
	`,
	debug,
);
```

## Function Arguments

```js
utils.injectStyleOnce(id, selector, cssText, debug);
```

### `id`

The ID assigned to the injected `<style>` element.

Example:

```js
<style id="sqs-a11y-sr-only-style"></style>
```

This value is important because it prevents duplicate style injection.

If a style element with this ID already exists, `injectStyleOnce()` will not add another copy.

### `selector`

Currently unused.

This argument was originally intended to specify where the style block should be inserted in the DOM, such as `"head"`.

At this time, the selector argument is not implemented. All injected styles are currently added to `<head>`.

> [!NOTE]
> This is a project TODO. A future version may either implement the selector argument or remove it from the utility.

### `cssText`

The CSS rules to insert into the page.

Use a template literal for readability.

```js
`
.example-class {
	display: block;
}
`
```

### `debug`

Controls whether the utility reports style-injection activity to the console.

Usually this should use the enhancement's global `debug` value.

## Return Value

`injectStyleOnce()` returns:

* `true` when the style block was inserted
* `false` when the style already existed or the insertion failed

Example:

```js
const inserted = utils.injectStyleOnce(
	"sqs-a11y-example-style",
	"head",
	`
	.sqs-a11y-example {
		outline: 2px solid currentColor;
	}
	`,
	debug,
);

if (inserted) {
	utils.reportUpdate(
		null,
		ENH_NAME,
		`(${WCAG}) Temporary audit styles were added.`,
		debug,
	);
}
```

## When to Use Injected CSS

Injected CSS may be useful when an enhancement needs to:

* add screen-reader-only utility styles
* improve focus visibility
* provide target-size support
* apply temporary audit styles
* test text spacing, text resizing, or layout behavior
* support a known Squarespace markup pattern

## Permanent vs Temporary CSS

Some CSS is intended to stay on the page after the enhancement runs as part of the automated remediation task.

Other CSS is only needed during an audit and should be removed after testing/reporting is completed.

Audit-only enhancements should not leave temporary DOM or CSS changes in place after the audit is complete.

## Removing Temporary CSS

If a style block was added temporarily, remove it by targeting the same ID used during insertion.

Example:

```js
const temporaryStyle = document.getElementById("sqs-a11y-example-audit-style");

if (temporaryStyle) {
	temporaryStyle.remove();
}
```

> [!NOTE]
> Currently there is no `removeStyleById()` helper function in the SqsA11y utility library. If temporary audit CSS needs to be removed, use standard DOM manipulation to locate and remove the `<style>` element by its ID.
>
> In most cases, temporary CSS-based audits should only be enabled during a WCAG review and should be excluded from production deployments after testing is complete.

## Temporary CSS Example

This example adds temporary CSS, performs an audit, then removes the CSS.

```js
const TEMP_STYLE_ID = "sqs-a11y-example-audit-style";

utils.injectStyleOnce(
	TEMP_STYLE_ID,
	"head",
	`
	body * {
		letter-spacing: 0.12em !important;
	}
	`,
	debug,
);

// Run audit logic here.

const temporaryStyle = document.getElementById(TEMP_STYLE_ID);

if (temporaryStyle) {
	temporaryStyle.remove();

	utils.reportUpdate(
		null,
		ENH_NAME,
		`(${WCAG}) Temporary audit styles were removed.`,
		debug,
	);
}
```

## Recommended Pattern for Audit-Only Enhancements

When temporary styles are needed, use a clear ID constant.

```js
const TEMP_STYLE_ID = "sqs-a11y-example-audit-style";
```

This keeps the audit easy to review and helps prevent temporary CSS from being left behind.

## Important Notes

* Use unique style IDs.
* Prefix IDs with `sqs-a11y-`.
* Use `injectStyleOnce()` instead of manually appending duplicate `<style>` blocks.
* Remove temporary audit CSS after the audit is complete.
* Do not remove permanent utility CSS that other enhancements may depend on.
* Remember that the `selector` argument is currently unused and all styles are injected into `<head>`.
