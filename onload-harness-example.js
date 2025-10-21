/**
 * Squarespace Ready Harness
 * ----------------------------------------------------------------
 * Pain:
 *   24Moves Consulting was asked to provide ways to fix specific WCAG issues
 *   that are not natively added in Squarespace 7.0/7.1 builder.  Getting code
 *   to execute in Squarespace was challenging due to the various ways the page
 *   paints (Ajax, lazy, etc).  This function attempts to capture all situations.
 *
 * Purpose:
 *   Central, reusable way to run custom code after Squarespace finishes
 *   building a page. Works on first load and AJAX nav, and reacts to
 *   late-rendered blocks.
 *   Near-bullet-proof way to launch scripts dynamically within Squarespace.
 *
 * How to use:
 *   1) Add your tasks with SQSReady.onReady(fn)
 *   2) Or attach element-specific tasks with SQSReady.whenReady(selector, fn)
 *   3) Keep this harness unchanged. Swap tasks in and out as needed.
 */
(function(){
  // ===== Config ============================================================
  var DEBUG = true;
  var RETRY_SCHEDULE_MS = [150, 400, 900, 1800]; // light backoff

  // ===== Logging ===========================================================
  function log(){ if(!DEBUG) return; var a=[].slice.call(arguments); a.unshift("[SQSReady]"); console.log.apply(console,a); }
  function warn(){ if(!DEBUG) return; var a=[].slice.call(arguments); a.unshift("[SQSReady]"); console.warn.apply(console,a); }

  // ===== Tiny pub/sub for tasks ===========================================
  var _readyTasks = [];     // functions to run whenever the page is "ready"
  var _waiters = [];        // [{sel, fn, processed:WeakSet}]
  var _hasRunOnce = false;

  // Public API (attached late below)
  var SQSReady = {
    onReady: function(fn, name){ _readyTasks.push({fn:fn, name:name||fn.name||"task"}); },
    whenReady: function(selector, fn){
      _waiters.push({ sel: selector, fn: fn, processed: new WeakSet() });
      // try immediately in case elements already exist
      _scanWaiters("init");
    },
    runNow: function(reason){ _runAll(reason || "manual"); },
    setDebug: function(flag){ DEBUG = !!flag; }
  };

  // ===== Internal runners ==================================================
  function _safe(fn, name){
    try { fn(); }
    catch(e){ warn("Task failed:", name||fn.name||"anonymous", e); }
  }

  function _runAll(reason){
    log("Running ready tasks. Reason:", reason, "Count:", _readyTasks.length);
    for (var i=0;i<_readyTasks.length;i++){
      _safe(_readyTasks[i].fn, _readyTasks[i].name);
    }
    _scanWaiters(reason);
  }

  function _scanWaiters(reason){
    if (!_waiters.length) return;
    for (var i=0;i<_waiters.length;i++){
      var w = _waiters[i];
      var list = document.querySelectorAll(w.sel);
      if (!list || !list.length) continue;
      for (var j=0;j<list.length;j++){
        var el = list[j];
        if (w.processed.has(el)) continue;
        try {
          w.fn(el, reason);
          w.processed.add(el);
        } catch(e){
          warn("whenReady handler failed for", w.sel, e);
        }
      }
    }
  }

  // Retry a few times for late blocks if nothing showed up
  function _runWithRetries(){
    var i = 0;
    var touchedBefore = document.querySelectorAll("body *").length || 0;
    _runAll("initial");

    function next(){
      if (i >= RETRY_SCHEDULE_MS.length) return;
      var touchedAfter = document.querySelectorAll("body *").length || 0;
      if (touchedAfter > touchedBefore) {
        // DOM grew, try again once
        touchedBefore = touchedAfter;
      } else {
        // nothing new. stop retries
        return;
      }
      var delay = RETRY_SCHEDULE_MS[i++];
      log("Scheduling light retry in", delay, "ms");
      setTimeout(function(){
        _runAll("retry-"+delay+"ms");
        next();
      }, delay);
    }
    next();
  }

  // ===== Squarespace bootstraps ===========================================
  function doLoadFunction(){
    log("doLoadFunction invoked");
    _runWithRetries();
  }

  // 1) First paint
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ doLoadFunction(); });
  } else {
    doLoadFunction();
  }
  log("Initial run scheduled");

  // 2) Squarespace YUI init hook
  try {
    var Y = window.Y || undefined;
    window.Squarespace && window.Squarespace.onInitialize && window.Squarespace.onInitialize(Y, function(){
      log("Squarespace.onInitialize");
      doLoadFunction();
    });
  } catch(e){ warn("onInitialize hook failed", e); }

  // 3) mercury:load for AJAX navigation
  window.addEventListener("mercury:load", function(e){
    log("mercury:load", e && e.detail ? e.detail : "");
    doLoadFunction();
  });

  // 4) Body id changes
  try {
    new MutationObserver(function(){
      log("Body id changed");
      doLoadFunction();
    }).observe(document.body, { attributes: true, attributeFilter: ["id"] });
  } catch(e){ warn("Body id observer failed", e); }

  // 5) Subtree observer to catch late added blocks
  try {
    var subtreeObserver = new MutationObserver(function(muts){
      var shouldRun = false;
      for (var k=0;k<muts.length;k++){
        var m = muts[k];
        if (m.type === "childList" && m.addedNodes && m.addedNodes.length){
          for (var n=0;n<m.addedNodes.length;n++){
            var node = m.addedNodes[n];
            if (node.nodeType !== 1) continue;
            if (
              (node.matches && node.matches("form,input,select,textarea,.sqs-block,.sqs-layout,[data-block-type]")) ||
              (node.querySelector && node.querySelector("form,input,select,textarea,.sqs-block,.sqs-layout,[data-block-type]"))
            ) { shouldRun = true; break; }
          }
        }
        if (shouldRun) break;
      }
      if (shouldRun) {
        log("Subtree changes detected. Re-running tasks");
        _runAll("mutation");
      }
    });
    subtreeObserver.observe(document.documentElement, { subtree:true, childList:true });
  } catch(e){ warn("Subtree observer failed", e); }

  // Expose API
  window.SQSReady = SQSReady;

  // ===== Example tasks (remove or replace) ================================
  // 1) Run every time the page is considered ready
  SQSReady.onReady(function(){
    // Place generic, idempotent work here
    // Example stub: console.log("Page ready hook running");
  }, "exampleReadyTask");

  // 2) Run when specific blocks appear, once per element. For example when loading a new element on scroll.
  // SQSReady.whenReady(".form-wrapper", function(el){
  //   // Do work against this element only once
  //   // Example: el.setAttribute("data-processed","1");
  // });

})();
