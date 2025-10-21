/**
 * Squarespace Accessibility Utilities (squarespaceA11y.js)
 * ----------------------------------------------------------------
 * Version: 0.1.0
 * Author: Joe Lippeatt / 24Moves.com
 * License: MIT
 *
 * Pain:
 *   - Squarespace sites often fail automated WCAG tests due to non-editable
 *     templates, injected navigation, and missing ARIA or focus states.
 *   - This script provides JavaScript-based polyfills to repair known WCAG 2.1/2.2 AA
 *     issues without altering Squarespace core files.
 *
 * Purpose:
 *   - Improve accessibility by dynamically applying fixes.
 *   - See /fixes/ directory for the fixes it can apply
 *
 * How it runs:
 *   - Executes automatically after DOMContentLoaded
 *   - Observes for AJAX navigation and dynamic block updates
 *   - Each fix module runs independently and can be extended
 *
 * Debugging:
 *   - Set `sqsA11yConfig.logging = true` for detailed console output.
 *   - Each applied fix logs its WCAG reference and status.
 *
 * Repository:
 *   https://github.com/ext237/squarespace-wcag-utils
 */



(function(window, document) {
  'use strict';

  const BASE_URL = 'https://cdn.jsdelivr.net/gh/ext237/squarespace-wcag-utils@main/';
  const defaultConfig = {
    logging: true,
    excludeFixes: [] // e.g., ["focusVisible", "skipToMain"]
  };

  const sqsA11y = {
    version: '0.3.0',
    config: Object.assign({}, defaultConfig, window.sqsA11yConfig || {}),
    fixes: [],
    utils: null,

    log(msg) {
      if (this.config.logging) console.log(`[sqsA11y] ${msg}`);
    },

    async loadScript(url) {
      try {
        const module = await import(url);
        this.log(`Loaded: ${url}`);
        return module;
      } catch (err) {
        console.error(`[sqsA11y] Failed to load ${url}:`, err);
      }
    },

    async loadUtils() {
      const url = `${BASE_URL}utils/squarespaceA11y-utils.js`;
      this.utils = await this.loadScript(url);
      if (this.utils) this.log('Utils loaded successfully');
    },

    async loadFix(name, wcagRef) {
      if (this.config.excludeFixes.includes(name)) {
        this.log(`Skipped: ${name} (excluded by config)`);
        return;
      }

      const url = `${BASE_URL}fixes/fix_${name}.js`;
      const module = await this.loadScript(url);
      if (module && module[`fix_${name}`]) {
        this.fixes.push({ name, fn: module[`fix_${name}`], wcagRef });
        module[`fix_${name}`]();
        this.log(`Applied: ${name} (${wcagRef})`);
      } else {
        console.warn(`[sqsA11y] ${name} did not export correctly`);
      }
    },

    async init() {
      await this.loadUtils();

      const fixList = [
        { name: 'skipToMain', wcag: 'WCAG 2.4.1' },
        { name: 'focusVisible', wcag: 'WCAG 2.4.7' }
        // Add more here as they’re created
      ];

      for (const fix of fixList) {
        await this.loadFix(fix.name, fix.wcag);
      }

      this.log('All fixes initialized');
    }
  };

  document.addEventListener('DOMContentLoaded', () => sqsA11y.init());
  window.sqsA11y = sqsA11y;
})(window, document);
