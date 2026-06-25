# Creating Remediation Enhancements

This document explains how to create a remediation enhancement for SqsA11y.

Remediation enhancements make after-load updates to improve HTML, CSS, ARIA, focus behavior, keyboard behavior, or other accessibility-related page features that may not be directly editable in the Squarespace builder.

These enhancements are intended to help address specific WCAG or general accessibility issues, but they do not guarantee WCAG compliance on their own.

Remediation enhancements follow the same project structure, registration process, documentation requirements, logging conventions, and submission requirements as audit-only enhancements. Before continuing, read:

```text
docs/creating-audit-enhancements.md
```

To avoid duplicate documentation and maintenance effort, this guide references the audit-enhancement guide whenever possible.

## What Is a Remediation Enhancement?

Unlike audit-only enhancements, remediation enhancements actively modify the page.

Examples include:

* adding ARIA attributes
* improving accessible names
* injecting CSS
* improving keyboard support

Examples from the SqsA11y library (in the `\enhancements\` folder) include:

```text
skipToMain.js
focusOutline.js
pdfLinkEnhancer.js
```

## Step 1: Create the Enhancement File

Follow the same file naming, registration, and project structure requirements found in the Audit Enhancement instructions.

See:
```text
docs/creating-audit-enhancements.md
```

## Step 2: Add Documentation Header

Follow the same documentation requirements as the Audit Enhancements instructions.

Remediation enhancements should clearly document:

* what problem is being addressed
* what DOM changes are performed
* known limitations
* any risks or assumptions
* any related WCAG criteria

## Step 3: Register the Enhancement

Registration requirements are identical to the Audit Enhancement instructions.

See:
```text
docs/creating-audit-enhancements.md
```

## Step 4: Access Runtime Variables

The same runtime variables as Audit Enhancements should normally be used:

```js
const debug = options.debug || false;
const utils = window.sqsA11y.utils || {};
const ENH_NAME = options.name;
const WCAG = options.wcag;
```

## Step 5: Report Enhancement Startup

Enhancements should report when processing begins, see the Audit Enhancement instructions.

## Step 6: Perform the Remediation

This is where remediation enhancements differ from audit-only enhancements.

Instead of just reporting issues, remediation enhancements actively improve page behavior.

In this example, we are locating all the buttons on a page and swapping their aria-label.

```js
const buttons = document.querySelectorAll("button");

buttons.forEach((button) => {

	if (!button.hasAttribute("aria-label") &&
		!button.textContent.trim()) {

		button.setAttribute("aria-label", "Button");

	}

});
```

The actual remediation logic will vary based on the WCAG issue being addressed.  Feel free to review patterns in other remediation enhancements.

## Step 7: Report Enhancement Completion

See:

```text
docs/creating-audit-enhancements.md
```

Enhancements should report when processing is complete.

## CSS Injection

Remediation enhancements often inject CSS.

See:

```text
docs/adding-removing-css.md
```

Examples include:

* focus indicators
* target-size improvements
* reduced-motion support
* screen-reader-only utility classes

## DOM Modifications

Unlike audit-only enhancements, remediation enhancements are expected to modify the DOM when necessary.

Examples include:

* adding IDs
* adding ARIA attributes
* updating accessible names
* updating keyboard behavior
* adding helper elements
* improving form relationships

All DOM modifications should be:

* targeted
* conservative
* reversible when possible
* documented

## Avoid Over-Aggressive Repairs

When creating a remediation enhancement:

* prefer conservative changes
* avoid changing visible content unless necessary
* avoid changing page meaning
* avoid changing business logic
* avoid making assumptions about user intent
* avoid introducing new accessibility issues while fixing another

When a safe remediation cannot be determined, an audit-only enhancement may be a better choice.

## Register the Enhancement

See:

```text
docs/creating-audit-enhancements.md
```

The enhancement must still be added to the `ENHANCEMENT_LIST`.

## Submission Requirements

All submission requirements from:

```text
docs/creating-audit-enhancements.md
```

still apply.

In addition, remediation enhancements should document:

* what changes are made
* what selectors are targeted
* known limitations
* known risks
* assumptions used by the remediation logic

## Remediation-Specific Requirements

Remediation enhancements should:

* make conservative changes
* avoid modifying visible content unnecessarily
* avoid changing business logic
* avoid introducing duplicate ARIA attributes
* avoid overwriting existing accessibility improvements
* avoid generating console errors
* be safe to run multiple times on the same page

Whenever possible, enhancements should check whether a repair is already present before applying changes.

## Recommended Development Practices

All recommendations from:

```text
docs/creating-audit-enhancements.md
```

apply.

Additional recommendations:

* prefer small focused enhancements
* solve one accessibility problem per file
* document assumptions
* document edge cases
* test repeatedly on the same page
* test AJAX navigation behavior
* test both Squarespace 7.0 and 7.1 when possible

## Final Checklist

Before submitting a remediation enhancement:

* [ ] Review `creating-audit-enhancements.md`.
* [ ] Documentation block is complete.
* [ ] Registration is complete.
* [ ] Startup logging added.
* [ ] Completion logging added.
* [ ] WCAG criteria documented.
* [ ] Squarespace context documented.
* [ ] Dependencies documented.
* [ ] DOM changes are documented.
* [ ] CSS injection is documented if used.
* [ ] Enhancement can safely run multiple times.
* [ ] Existing accessibility improvements are preserved.
* [ ] Code has been tested.
