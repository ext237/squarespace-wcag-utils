<script>
/**
 * Squarespace Form Autocomplete Fixer
 * ----------------------------------------------------------------
 * Purpose:
 *   - Squarespace often renders inputs with autocomplete="false" or no
 *     autocomplete. That breaks browser autofill and accessibility.
 *   - This script finds those controls and applies sensible tokens:
 *       email, tel, given-name, family-name, organization, address-*,
 *       postal-code, country-name, url, etc.
 *
 * How it runs (per client request):
 *   - Immediately on load
 *   - Squarespace.onInitialize(Y, ...)
 *   - mercury:load (AJAX navigation)
 *   - MutationObserver on <body id="..."> (your original example)
 *   - Plus: a subtree observer + brief retry/backoff for late-rendered blocks
 *
 * Debugging:
 *   - Noisy console logs that show when/why it ran and what it changed.
 *   - Set DEBUG=false to quiet logs later.
 */

(function() {

  // ===== Debug helpers =====================================================
  var DEBUG = true;
  function log(){ if(!DEBUG) return; var a=[].slice.call(arguments); a.unshift("[AutocompleteFixer]"); console.log.apply(console,a); }
  function warn(){ if(!DEBUG) return; var a=[].slice.call(arguments); a.unshift("[AutocompleteFixer]"); console.warn.apply(console,a); }

  // Small polyfill to avoid rare CSS.escape issues
  if (!window.CSS) window.CSS = {};
  if (typeof CSS.escape !== "function") {
    CSS.escape = function(sel){ return String(sel).replace(/[^a-zA-Z0-9_\-]/g, "\\$&"); };
    log("CSS.escape polyfill applied.");
  }

  // ===== Core scanning logic ==============================================
  var HAS_RUN_MARK = "autocompleteFixed";
  var RETRY_SCHEDULE_MS = [150, 400, 900, 1800]; // short backoff retries

  function normalize(s){
    return (s || "")
      .toString()
      .replace(/[_\-:/\\]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }
  function hasWord(s, w){ return new RegExp("(^|\\W)"+w+"(\\W|$)").test(s||""); }

  function getLabelText(el){
    var txt = "";

    // <label for="id">
    if (el.id) {
      var lbl = document.querySelector('label[for="'+CSS.escape(el.id)+'"]');
      if (lbl) txt += " " + lbl.textContent;
    }
    // <label> wrapping
    var wrap = el.closest && el.closest("label");
    if (wrap) txt += " " + wrap.textContent;

    // aria-labelledby
    var al = el.getAttribute("aria-labelledby");
    if (al) {
      al.split(/\s+/).forEach(function(id){
        var n = document.getElementById(id);
        if (n) txt += " " + n.textContent;
      });
    }

    // Squarespace field wrapper class hints, e.g. <div class="form-item field email">
    var fieldWrap = el.closest && el.closest(".form-item.field");
    if (fieldWrap && fieldWrap.className) txt += " " + fieldWrap.className;

    return normalize(txt);
  }

  function guessToken(el){
    // Strong signals by type
    var t = (el.type || "").toLowerCase();
    if (t === "email") return "email";
    if (t === "tel")   return "tel";
    if (t === "url")   return "url";

    // Aggregate text
    var label = getLabelText(el);
    var name  = normalize(el.getAttribute("name"));
    var id    = normalize(el.id);
    var ph    = normalize(el.getAttribute("placeholder"));
    var all   = [label, name, id, ph].join(" ");

    // Email
    if (hasWord(all,"email") || hasWord(all,"e mail")) return "email";

    // Phone
    if (hasWord(all,"phone") || hasWord(all,"tel") || hasWord(all,"mobile") || hasWord(all,"cell"))
      return "tel";

    // Names
    if (hasWord(all,"first") && hasWord(all,"name")) return "given-name";
    if (hasWord(all,"last")  && hasWord(all,"name")) return "family-name";
    if (hasWord(all,"middle") && hasWord(all,"name")) return "additional-name";
    if (hasWord(all,"name")) return "name";

    // Org / Company
    if (hasWord(all,"company") || hasWord(all,"organization") || hasWord(all,"organisation") || hasWord(all,"business"))
      return "organization";

    // Address lines
    if ((hasWord(all,"address") && (hasWord(all,"line") || /address\s*1\b/.test(all))) || /\baddr(?:ess)?\s*1\b/.test(all))
      return "address-line1";
    if ((hasWord(all,"address") && hasWord(all,"2")) || /\baddr(?:ess)?\s*2\b/.test(all))
      return "address-line2";
    if (hasWord(all,"street") || (hasWord(all,"address") && !/\bline\b/.test(all)))
      return "street-address";

    // City/State/Postal/Country
    if (hasWord(all,"city") || hasWord(all,"town") || hasWord(all,"locality")) return "address-level2";
    if (hasWord(all,"state") || hasWord(all,"province") || hasWord(all,"region")) return "address-level1";
    if (hasWord(all,"zip") || hasWord(all,"postal")) return "postal-code";
    if (hasWord(all,"country")) return "country-name";

    // Web
    if (hasWord(all,"website") || hasWord(all,"url")) return "url";

    // Known non-targets (don’t force)
    if (hasWord(all,"message") || hasWord(all,"comments") || hasWord(all,"notes")) return null;
    if (hasWord(all,"date") || hasWord(all,"time")) return null;

    return null;
  }

  function applyEnhancements(el){
    if (el.dataset[HAS_RUN_MARK] === "1") return {updated:0, cleaned:0, skipped:1};

    var updated = 0, cleaned = 0;

    var beforeType = (el.type || "").toLowerCase();
    var beforeAC   = el.getAttribute("autocomplete");

    // If Squarespace set autocomplete="false", clear that FIRST
    if (beforeAC === "false") {
      el.removeAttribute("autocomplete");
      cleaned++;
      log("Removed autocomplete=false for", el);
    }

    // Decide what token should be
    var token = guessToken(el);

    if (token) {
      var current = el.getAttribute("autocomplete");
      if (current !== token) {
        el.setAttribute("autocomplete", token);
        updated++;
        log("Set autocomplete='"+token+"' for", el);
      }

      // Improve keyboard/type hints
      if (token === "email" && beforeType !== "email") {
        try { el.type = "email"; updated++; log("Set type=email for", el); } catch(e){ warn("Cannot set type=email", e); }
      }
      if (token === "tel" && beforeType !== "tel") {
        try { el.type = "tel"; updated++; log("Set type=tel for", el); } catch(e){ warn("Cannot set type=tel", e); }
      }

      // Helpful inputmode and autocapitalize
      if (token === "tel") el.setAttribute("inputmode", "tel");
      if (token === "postal-code") el.setAttribute("inputmode", "text");
      if (token === "email" || token === "url" || token === "username") el.setAttribute("autocapitalize", "none");
    }

    // Normalize Squarespace oddity
    if (el.getAttribute("autocomplete") === "tel-national") {
      el.setAttribute("autocomplete", "tel");
      updated++;
      log("Normalized tel-national -> tel for", el);
    }

    el.dataset[HAS_RUN_MARK] = "1";
    return {updated:updated, cleaned:cleaned, skipped:0};
  }

  function scanOnce(){
    var forms = document.querySelectorAll("form");
    var controls = document.querySelectorAll("form input, form select, form textarea");
    log("Scan start. Forms:", forms.length, "Controls:", controls.length);

    var totalUpdated = 0, totalCleaned = 0, totalSkipped = 0;

    controls.forEach(function(el){
      var res = applyEnhancements(el);
      totalUpdated += res.updated;
      totalCleaned += res.cleaned;
      totalSkipped += res.skipped;
    });

    log("Scan complete. Updated:", totalUpdated, "| Cleaned 'false':", totalCleaned, "| Skipped:", totalSkipped);
    return {updated: totalUpdated, cleaned: totalCleaned, skipped: totalSkipped, controlCount: controls.length};
  }

  // Retry a few times in case blocks render late
  function scanWithRetries(){
    var i = 0;
    var result = scanOnce();

    function next(){
      if (i >= RETRY_SCHEDULE_MS.length) return;
      if (result.updated > 0 || result.cleaned > 0 || result.controlCount > 0) {
        // We touched something or controls existed — no need to keep hammering
        return;
      }
      var delay = RETRY_SCHEDULE_MS[i++];
      log("No changes yet; scheduling retry in", delay, "ms.");
      setTimeout(function(){
        result = scanOnce();
        next();
      }, delay);
    }
    next();
  }

  // ===== Your bootstrap (kept exactly) ====================================
  function myFunction() {
    log("myFunction invoked.");
    scanWithRetries();
  }

  // Run initial load
  myFunction();
  log("Initial run invoked.");

  // Run again after Squarespace builds AJAX page
  var Y = window.Y || undefined; // avoid blowing up if YUI is missing
  window.Squarespace && window.Squarespace.onInitialize && window.Squarespace.onInitialize(Y, myFunction);

  // Bonus: fallback for AJAX navigation
  window.addEventListener("mercury:load", function(e){
    log("Event mercury:load fired.", e && e.detail ? e.detail : "");
    myFunction();
  });

  // Extra fallback: catch body changes via MutationObserver (your example)
  try {
    new MutationObserver(function(muts){
      log("Body-id MutationObserver fired.");
      myFunction();
    }).observe(document.body, { attributes: true, attributeFilter: ["id"] });
    log("Body-id MutationObserver attached.");
  } catch(e) {
    warn("Body-id MutationObserver failed:", e);
  }

  // ===== Additional robustness (dynamic injects) ===========================
  // Subtree observer to catch late-added forms/inputs (Squarespace blocks)
  try {
    var subtreeObserver = new MutationObserver(function(muts){
      var shouldScan = muts.some(function(m){
        if (m.type === "childList" && (m.addedNodes && m.addedNodes.length)) {
          // If any added node contains a form control, rescan
          return Array.prototype.some.call(m.addedNodes, function(n){
            return (n.nodeType === 1) && (n.matches && (n.matches("input,select,textarea,form") || n.querySelector && n.querySelector("input,select,textarea,form")));
          });
        }
        // If attributes on an input changed, rescan too
        if (m.type === "attributes" && m.target && (m.target.matches && m.target.matches("input,select,textarea"))) {
          return true;
        }
        return false;
      });
      if (shouldScan) {
        log("Subtree MutationObserver detected form/control changes. Rescanning…");
        scanWithRetries();
      }
    });
    subtreeObserver.observe(document.documentElement, {subtree:true, childList:true, attributes:true, attributeFilter:["type","autocomplete","id","class"]});
    log("Subtree MutationObserver attached.");
  } catch(e){
    warn("Subtree MutationObserver failed:", e);
  }

})();
</script>
