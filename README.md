# squarespace-wcag-utils

Small, framework-free accessibility (WCAG) utilities for Squarespace websites.
Each script targets a specific WCAG 2.1/2.2 AA checkpoint and can be loaded independently or through the main loader (`squarespaceA11y.js`).

## Why
- Squarespace sites often fail automated WCAG tests due to inaccessible templates and uneditable markup.
- This project provides modular JavaScript “polyfills” that improve real-world accessibility without modifying Squarespace core code.
- Each fix is a standalone script that can be maintained, versioned, and selectively loaded.

## Current Structure
squarespace-wcag-utils/
├── squarespaceA11y.js           ← Main loader
├── utils/
│   └── squarespaceA11y-utils.js  ← Shared helper functions
└── fixes/
    ├── fix_skipToMain.js
    ├── fix_focusVisible.js
    └── (more to come)

## How It Works
- `squarespaceA11y.js` loads from a public CDN (jsDelivr) and dynamically imports each fix file from the same repo.
- Each fix function (e.g., `fix_skipToMain()`) runs automatically and logs activity to the console.
- A global configuration object (`window.sqsA11yConfig`) can control logging and options.

## Quick Start (Squarespace)
1. Go to **Settings → Advanced → Code Injection → Footer**.
2. Add the following `<script>` tag at the bottom:

<script src="https://cdn.jsdelivr.net/gh/ext237/squarespace-wcag-utils@main/squarespaceA11y.js" type="module"></script>

3. Save & publish your site.
4. Open **DevTools → Console** to verify output like:

[sqsA11y] Loaded: utils/squarespaceA11y-utils.js
[sqsA11y] Utils loaded successfully
[sqsA11y] Loaded: fixes/fix_skipToMain.js
[fix_skipToMain] Skip link added.
[sqsA11y] Applied: skipToMain (WCAG 2.4.1)
[sqsA11y] All fixes initialized

## Configuration Options

You can control which fixes run — and whether logs appear in the browser console — **without editing any JavaScript files**.
To do this, define a global configuration object **before** loading the main script in Squarespace:

<script>
  window.sqsA11yConfig = {
    logging: true,                  // Show or hide console messages
    excludeFixes: ["focusVisible"]  // Skip one or more fixes by name
  };
</script>

<script src="https://cdn.jsdelivr.net/gh/ext237/squarespace-wcag-utils@main/squarespaceA11y.js" type="module"></script>

### Options

| Option | Type | Default | Description |
|--------|------|----------|-------------|
| `logging` | Boolean | `true` | Enables or disables detailed console output for debugging. |
| `excludeFixes` | Array | `[]` | List of fix names to skip during initialization (e.g. `["focusVisible", "skipToMain"]`). |

> Note: The configuration block **must appear above** the `<script src="...squarespaceA11y.js">` tag so it’s available when the loader runs.

## Adding New Fixes
1. Create a new file inside `/fixes/` named `fix_[shortname].js`.
2. Export a function that performs the fix:

export function fix_focusVisible() {
  const style = document.createElement('style');
  style.textContent = `
    :focus-visible { outline: 3px solid #005fcc; outline-offset: 3px; }
  `;
  document.head.appendChild(style);
  console.log('[fix_focusVisible] Focus outline added.');
}

3. Add it to the fix list inside `squarespaceA11y.js`:

const fixList = [
  { name: 'skipToMain', wcag: 'WCAG 2.4.1' },
  { name: 'focusVisible', wcag: 'WCAG 2.4.7' }
];

4. Commit and push your changes for reveiw

## Utilities
`utils/squarespaceA11y-utils.js` contains shared helper functions for all fixes, such as:
- DOM queries (`safeQuery()`)
- Logging helpers (`logNodeAction()`)
- Retry loops for late-rendered Squarespace blocks (coming soon)

## License
MIT © Joe Lippeatt / 24Moves.com

## Notes
- Works with both Squarespace 7.0 and 7.1 templates.
- Built with ES Modules (`type="module"` required).
- jsDelivr caches files globally; allow a few minutes for new commits to propagate.
