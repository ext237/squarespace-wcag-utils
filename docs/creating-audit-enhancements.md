# Creating Audit-Only Enhancements

This document explains how to create a new audit-only enhancement for SqsA11y.

While doing a WCAG or 508 Audit, you may want to programatically document specific conditions on each page.

Audit-only enhancements review a page and report findings to the browser console. They do not modify the DOM, add ARIA attributes, inject CSS, or otherwise change page behavior.

Examples include:

* `headingAudit.js`
* `textSpacingAudit.js`

> [!NOTE]
> Audit-only enhancement filenames should end with `Audit`.  This helps separate them from Remediation files, and in the future, may be used to programatically disable them in production.
>
> Example file names are `textSpacingAudit.js`, and `headingAudit.js`.

> [!NOTE]
> If the enhancement modifies page behavior, it should be documented as a Remediation Enhancement rather than an Audit-Only Enhancement.

## What Is an Audit-Only Enhancement?

An audit-only enhancement:

* Reviews page content or structure.
* Reports findings through `utils.reportUpdate()`.
* Does not modify page markup.
* Does not change styling.
* Does not change keyboard behavior.
* Does not inject ARIA attributes.
* Helps developers identify areas that may require manual WCAG review.

## Step 1: Create the Enhancement File

Create a new file inside the `/enhancements/` directory.

Example:

```text
enhancements/exampleAudit.js
```

## Step 2: Add Documentation Header

Every enhancement should begin with a documentation block.

> [!IMPORTANT]
> Contributions to this project help the broader accessibility community. Please consider contributing custom enhancement files back to the project.
>
> The `Related WCAG Criteria` and `Description` sections in each enhancement header are especially important for review, documentation, and possible inclusion to sqsA11y.

Example:

```js
/**
 * Squarespace Accessibility Enhancement – exampleAudit.js
 * ----------------------------------------------------------------
 * Library: squarespace-wcag-utils
 * Author: Your Name
 * License: MIT
 *
 * Related WCAG Criteria:
 *   - 1.2.3 Example Criterion
 *
 * Description:
 *   Reviews page content and reports potential issues.
 *
 * Squarespace Context:
 *   - Intended for Squarespace 7.0 and 7.1.
 *   - Audit-only enhancement.
 *   - Does not modify the DOM.
 *
 * Dependencies:
 *   - sqsA11y-utils
 *   - utils.reportUpdate()
 *
 * Notes:
 *   This enhancement supports accessibility review and remediation work.
 *   It does not guarantee WCAG compliance on its own.
 */
```

## Step 3: Register the Enhancement

All enhancements must register themselves on the shared namespace.

```js
(function (window, document) {
	window.sqsA11y = window.sqsA11y || {};
	window.sqsA11y.enhancements = window.sqsA11y.enhancements || {};

	window.sqsA11y.enhancements.exampleAudit = function (options = {}) {

	};

})(window, document);
```

The enhancement name must match:

```text
exampleAudit.js
window.sqsA11y.enhancements.exampleAudit
ENHANCEMENT_LIST name value
```

## Step 4: Access Runtime Variables

Most audit enhancements should begin with:

```js
const debug = options.debug || false;
const utils = window.sqsA11y.utils || {};
const ENH_NAME = options.name;
const WCAG = options.wcag;
```

These values are provided by the main loader.

## Step 5: Report Enhancement Startup

Enhancements should report when they begin running.

```js
utils.reportUpdate(
	null,
	ENH_NAME,
	`(${WCAG}) - Enhancement called.`,
	debug,
);
```

This helps confirm that the enhancement loaded correctly.

## Step 6: Perform the Audit

For this example, we will create a fictional audit that looks for buttons with unusually long text.

```js
const buttons = Array.from(document.querySelectorAll("button"));

buttons.forEach((button) => {

	const text = button.textContent.trim().replace(/\s+/g, " ");

	if (text.length > 50) {

		utils.reportUpdate(
			button,
			ENH_NAME,
			`(${WCAG}) Button text exceeds 50 characters: "${text}". Long button text may make controls harder to scan, understand, or navigate, especially for screen reader and keyboard users.`,
			debug,
		);

	}

});
```

This example is intentionally simple.  The purpose is to demonstrate how findings are reported.

If you would prefer to have a digest of all related issues, rather than individual notifications, you can create a collection of related issues and report them all at once.  For example:

```js
const buttons = Array.from(document.querySelectorAll("button"));
const issues = [];

buttons.forEach((button) => {

	const text = button.textContent.trim().replace(/\s+/g, " ");

	if (text.length > 50) {
		issues.push(`- "${text}"`);
	}

});

if (issues.length) {

	utils.reportUpdate(
		null,
		ENH_NAME,
		`(${WCAG}) ${issues.length} button(s) have text longer than 50 characters.\n\nLong button text may make controls harder to scan, understand, or navigate, especially for screen reader and keyboard users.\n\nReview these button labels:\n${issues.join("\n")}`,
		debug,
	);

}
```

## Step 7: Report Enhancement Completion

Enhancements can report when processing is complete.

```js
utils.reportUpdate(
	null,
	ENH_NAME,
	`(${WCAG}) - Enhancement complete.`,
	debug,
);
```

This makes debugging easier and confirms the enhancement finished successfully.

## Complete Example

```js
(function (window, document) {

	window.sqsA11y = window.sqsA11y || {};
	window.sqsA11y.enhancements = window.sqsA11y.enhancements || {};

	window.sqsA11y.enhancements.exampleAudit = function (options = {}) {

		const debug = options.debug || false;
		const utils = window.sqsA11y.utils || {};
		const ENH_NAME = options.name;
		const WCAG = options.wcag;

		utils.reportUpdate(
			null,
			ENH_NAME,
			`(${WCAG}) - Enhancement called.`,
			debug,
		);

		const buttons = Array.from(document.querySelectorAll("button"));

		buttons.forEach((button) => {

			const text = button.textContent.trim();

			if (text.length > 50) {

				utils.reportUpdate(
					button,
					ENH_NAME,
					`(${WCAG}) Button text exceeds 50 characters.`,
					debug,
				);

			}

		});

		utils.reportUpdate(
			null,
			ENH_NAME,
			`(${WCAG}) - Enhancement complete.`,
			debug,
		);

	};

})(window, document);
```

## Step 8: Register the Enhancement

Next, you will need to register your enhancement file with the primary loader, `squarespaceA11y.js`.

Look for the `ENHANCEMENT_LIST` near the top of the `squarespaceA11y.js` file.

This list will already contain many existing enhancements. Do not replace the list. Instead, add your enhancement using the same object format as the other entries.

Example:

```js
const ENHANCEMENT_LIST = [
	{ name: "skipToMain", wcag: "WCAG 2.4.1", debug: DEBUG },
	{ name: "focusOutline", wcag: "WCAG 2.4.7", debug: DEBUG },

	// Add your enhancement here
	{
		name: "exampleAudit",
		wcag: "WCAG 1.2.3",
		debug: DEBUG,
	},
];
```

The `name` value must match:

```text
enhancements/exampleAudit.js
window.sqsA11y.enhancements.exampleAudit
{name: "exampleAudit"}
```

SqsA11y uses the `name` value to locate and execute the enhancement. If these values do not match exactly, the enhancement will not load.

## Submission Requirements

Enhancements submitted for inclusion in SqsA11y should include:

### Required Documentation

* Enhancement name
* Related WCAG criteria
* Description
* Squarespace context
* Dependencies
* Notes section

### Required Technical Items

* Registration under `window.sqsA11y.enhancements`
* Startup log message
* Completion log message
* Use of `utils.reportUpdate()`
* Defensive coding where possible
* No uncaught JavaScript errors

### Audit-Only Requirements

> [!NOTE]
> If the enhancement modifies page behavior, it should be documented as a Remediation Enhancement rather than an Audit-Only Enhancement.

Audit-only enhancements are a good way to document issues found on each loaded page. They are not intended to permanently fix or modify page behavior.

In some cases, an audit may need to temporarily modify the DOM or inject CSS in order to test a condition. For example, a text-size or text-spacing audit may need to apply temporary CSS during the test.

When temporary DOM or CSS changes are required, the audit must remove those changes after the audit is complete. See the documentation for adding and removing temporary CSS for an example of this methodology.

Audit-only enhancements should:

* Avoid modifying the DOM.
* Avoid injecting CSS.
* Avoid changing ARIA attributes.
* Avoid changing focus behavior.
* Avoid changing keyboard behavior.
* Report findings only.

## Recommended Development Practices

* Keep each enhancement focused on a single documentation-related concern.
* Report findings clearly and consistently.
* Avoid creating excessive console noise.
* Document known limitations.
* Include TODO comments when future research or updates are needed.
* Test on both Squarespace 7.0 and 7.1 when possible.

## Final Checklist

Before submitting an enhancement:

* [ ] File name follows project naming conventions.
* [ ] Documentation block is complete.
* [ ] Enhancement registers correctly.
* [ ] Startup logging added.
* [ ] Completion logging added.
* [ ] Findings reported through `utils.reportUpdate()`.
* [ ] No DOM modifications are performed.
* [ ] WCAG criteria are documented.
* [ ] Squarespace context is documented.
* [ ] Dependencies are documented.
* [ ] Code has been tested.
