/* /v2/v2-bridge.js
   Tiny adapter that makes V2 pages render seed V2 orders through the
   existing V1 rendering paths, by:
   1. Replacing DB.DEMO_ORDERS (in-memory only, this page session) with V2 orders
      shimmed to V1 shape (items[] with one entry).
   2. Overriding ZE.orders.* readers to point at ZE.ordersV2.* with the same shim.
   3. Rewriting auto-injected header links: V2-internal pages stay relative,
      everything else gets `../` prepended so it escapes /v2/ back to root.
   The original data.js + app.js are NOT mutated — this lives only in /v2/.
*/
(function () {
  if (!window.ZE || !window.ZE.ordersV2 || !window.DB) return;

  function v1Shape(o) {
    if (!o) return null;
    if (o.items && Array.isArray(o.items)) return o;
    var copy = {};
    for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) copy[k] = o[k];
    copy.items = [{ productId: o.productId, qty: o.qty, config: o.config || null }];
    return copy;
  }

  // 1. Swap DEMO_ORDERS in-memory for this page only.
  try {
    var v2Demo = (Array.isArray(window.DB.DEMO_ORDERS_V2) ? window.DB.DEMO_ORDERS_V2 : []).map(v1Shape);
    Object.defineProperty(window.DB, 'DEMO_ORDERS', {
      value: v2Demo, writable: true, configurable: true
    });
  } catch (e) {
    window.DB.DEMO_ORDERS = (window.DB.DEMO_ORDERS_V2 || []).map(v1Shape);
  }

  // 2. Override ZE.orders read paths to come from ZE.ordersV2 with shim.
  var origOrders = window.ZE.orders || {};
  window.ZE.orders = Object.assign({}, origOrders, {
    read: function () { return window.ZE.ordersV2.list({}).filter(function (o) { return o.source === 'user'; }).map(v1Shape); },
    byId: function (id) { return v1Shape(window.ZE.ordersV2.byId(id)); },
    pendingApprovalsFor: function (uid) { return window.ZE.ordersV2.pendingApprovalsFor(uid).map(v1Shape); },
    cancel: function (id, reason) { return v1Shape(window.ZE.ordersV2.cancel(id, reason)); },
    setStatus: function (id, status, note) { return v1Shape(window.ZE.ordersV2.setStatus(id, status, note)); },
    advanceStatus: function (id, note) {
      var o = window.ZE.ordersV2.byId(id); if (!o) return null;
      var flow = ['pending_approval','placed','confirmed','packed','shipped','out_for_delivery','delivered'];
      var i = flow.indexOf(o.status); if (i < 0 || i === flow.length - 1) return v1Shape(o);
      return v1Shape(window.ZE.ordersV2.setStatus(id, flow[i + 1], note));
    },
    approveRequest: function (id) { return v1Shape(window.ZE.ordersV2.approve(id)); },
    rejectRequest: function (id, reason) { return v1Shape(window.ZE.ordersV2.reject(id, reason)); }
  });

  /* 3. Link rewrite: NO LONGER NEEDED.
     Every referenced page now exists inside /v2/, so relative links resolve
     correctly within the V2 ecosystem on their own. The earlier `../` prepender
     was causing some clicks to land on V1 root pages — it's intentionally gone.
     If a future page is referenced but not yet copied into /v2/, the link will
     404 — that's louder/safer than silently escaping to the V1 prototype. */
})();
