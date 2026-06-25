# Console Library Injection

This document explains how to temporarily load SqsA11y on a Squarespace page from the browser console.

This can be useful when testing a development version of the library without adding it through Squarespace Code Injection.  Or to debug/audit a website before you are ready to deploy SqsA11y to production.

> [!IMPORTANT]
> If the Squarespace website is already loading SqsA11y from the Squarespace Code Injection settings, loading it this way will not override the existing library behavior, and may cause duplication and unexpected results.

## When to Use Console Testing

Console testing may be useful when:

* testing a development version of `squarespaceA11y.js`
* reviewing a page before installing the library
* debugging a specific enhancement
* testing a fork, branch, or tagged release
* working on a site where you do not have access to Squarespace settings

## Console Loading Options

You can load the library for testing in one of two ways:

- **Basic Manual Console Loader**: runs the library once in the current browser page session. If you refresh the page or navigate to another page, the library is unloaded.
- **Automatic Local Injection**: uses a third-party browser tool, such as Tampermonkey, to inject the SqsA11y library in your local browser each time matching website pages are loaded.

### Basic Manual Console Loader

Open the browser developer console and paste the following snippet.

```js
window.sqsA11yConfig = {
	logging: true,
	excludeFixes: []
};

(function () {
	var s = document.createElement("script");
	s.src = "https://cdn.jsdelivr.net/gh/ext237/squarespace-wcag-utils@main/squarespaceA11y.js?v=" + Date.now();
	document.head.appendChild(s);
})();
```

> [!NOTE]
> Change the `s.src` to the location of the library you are working on (local, external hosting, github tag, etc).

This temporarily loads SqsA11y into the current page.

The `Date.now()` value helps bypass browser and CDN caching when testing multiple times.

### Automatic Local Injection

If you need your development SqsA11y library to load automatically each time a page is refreshed, but don't want to add it to Squarespace Code Injection, use a browser userscript tool such as Tampermonkey.

Example Tampermonkey userscript:

```js
// ==UserScript==
// @name         SqsA11y Test Injection
// @namespace    https://github.com/ext237/squarespace-wcag-utils
// @version      0.1
// @description  Temporarily inject SqsA11y for testing
// @match        https://example.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
	"use strict";

	window.sqsA11yConfig = {
		logging: true,
		excludeFixes: []
	};

	var s = document.createElement("script");
	s.src = "https://cdn.jsdelivr.net/gh/ext237/squarespace-wcag-utils@main/squarespaceA11y.js?v=" + Date.now();
	document.head.appendChild(s);
})();
```

Change this line:

```js
// @match        https://example.com/*
```

to the site you are testing.

After you have forked the project on github, change the `s.src` value to the library version you want to test.

Example for a branch or fork:

```js
s.src = "https://cdn.jsdelivr.net/gh/YOUR-USERNAME/squarespace-wcag-utils@YOUR-BRANCH/squarespaceA11y.js?v=" + Date.now();
```

When testing is complete, disable the userscript so the library is no longer injected automatically.

## Testing a Specific Version

To test a tagged release:

```js
window.sqsA11yConfig = {
	logging: true,
	excludeFixes: []
};

(function () {
	var s = document.createElement("script");
	s.src = "https://cdn.jsdelivr.net/gh/ext237/squarespace-wcag-utils@v0.4.8/squarespaceA11y.js?v=" + Date.now();
	document.head.appendChild(s);
})();
```

## Testing Your Own Fork or Branch

Replace the GitHub username, repository name, and branch name as needed.

```js
window.sqsA11yConfig = {
	logging: true,
	excludeFixes: []
};

(function () {
	var s = document.createElement("script");
	s.src = "https://cdn.jsdelivr.net/gh/YOUR-USERNAME/squarespace-wcag-utils@YOUR-BRANCH/squarespaceA11y.js?v=" + Date.now();
	document.head.appendChild(s);
})();
```

## Testing a Self-Hosted Development Copy

If you host your development copy somewhere else, replace the script URL.

```js
window.sqsA11yConfig = {
	logging: true,
	excludeFixes: []
};

(function () {
	var s = document.createElement("script");
	s.src = "https://example.com/path/to/squarespaceA11y.js?v=" + Date.now();
	document.head.appendChild(s);
})();
```

## Disabling Specific Enhancements During Console Testing

Use `excludeFixes` the same way you would in a normal installation.

```js
window.sqsA11yConfig = {
	logging: true,
	excludeFixes: [
		"targetSizeMinimum",
		"focusOutline"
	]
};

(function () {
	var s = document.createElement("script");
	s.src = "https://cdn.jsdelivr.net/gh/ext237/squarespace-wcag-utils@main/squarespaceA11y.js?v=" + Date.now();
	document.head.appendChild(s);
})();
```

## Notes

Console testing is temporary.

The library will remain active only until the page is refreshed, closed, or navigated away from.

Console testing does not install SqsA11y permanently and does not modify the Squarespace site settings.

## Troubleshooting

If the script does not appear to run:

* confirm the script URL is correct
* check the browser console for errors
* confirm the development file is publicly accessible
* enable `logging: true`
* add a cache-busting query string with `Date.now()`
* reload the page and try again

If a site uses strict security headers or content security policy settings, console-loaded scripts may be blocked.
