# squarespace-wcag-utils

Small, framework-free utilities to improve accessibility (WCAG) on Squarespace sites.  
First utility: **Form Autocomplete Fixer** – corrects `autocomplete` for common fields (email, phone, name, address, etc.) when Squarespace renders `autocomplete="false"` or omits it.

## Why
- Better autofill & accessibility hints for browsers and assistive tech.
- Works with **initial page load**, **AJAX navigation**, and **late-rendered blocks**.

## Features
- Detects fields by type, label text, name/id/placeholder, and Squarespace wrapper classes.
- Fixes/removes `autocomplete="false"` and sets proper tokens: `email`, `tel`, `given-name`, `family-name`, `organization`, `address-*`, `postal-code`, `country-name`, etc.
- Adds helpful `type`, `inputmode`, `autocapitalize` where relevant.
- Robust bootstrapping: `Squarespace.onInitialize`, `mercury:load`, body `MutationObserver`, plus a subtree observer.
- Verbose console logging for debugging; one-line change to quiet it.

## Quick Start (Squarespace)
1. Go to **Settings → Advanced → Code Injection → Footer**.
2. Paste the contents of [`src/autocomplete-fixer.js`](src/autocomplete-fixer.js) at the bottom.
3. Publish. Open DevTools → Console to watch logs:
   - `Initial run invoked.`
   - `Scan start…`
   - `Set autocomplete='email' for <input …>`

> Tip: Once validated, set `DEBUG = false;` inside the script to reduce console noise.

## Local Development
```bash
git clone https://github.com/<your-username>/squarespace-wcag-utils.git
cd squarespace-wcag-utils
npm i
# (optional) build a minified file
npx terser src/autocomplete-fixer.js -o dist/autocomplete-fixer.min.js --compress --mangle
