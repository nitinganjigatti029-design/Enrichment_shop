/* =========================================================
   ZooEnrich — Shared app helpers
   - Cart state (localStorage) + event bus
   - Image fallback (timeout → SVG placeholder)
   - Device preview toggle (bottom-right)
   - Lucide init
   ========================================================= */
(function () {
  // Legacy v2 cart storage ({prodId: qty}) is intentionally NOT auto-migrated.
  // v3 requires a speciesId per line which the old shape doesn't carry, so any
  // stale v2 data is silently discarded on first v3 read — cleaner than
  // fabricating lines with speciesId=null and `_needsSpecies` flags everywhere.
  const CART_KEY  = 'ze_cart_v3';         // [{id, productId, speciesId, enclosureId, qty, note}]
  const SITE_KEY  = 'ze_site';
  const SPCS_KEY  = 'ze_species';
  const DEV_KEY   = 'ze_device';
  const SAVED_KEY = 'ze_saved_v1';        // string[] of product ids
  const ORDERS_KEY = 'ze_orders_v1';      // array of order objects (newest first)
  const USER_KEY   = 'ze_user_v1';        // { id, role, signedInAt }
  const REVIEWS_KEY = 'ze_reviews_v1';    // Review[]

  /* ---------- Cart state (v3: array of line items) ---------- */
  function readCart()  {
    try {
      const v = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }
  function writeCart(lines) {
    const clean = Array.isArray(lines) ? lines : [];
    localStorage.setItem(CART_KEY, JSON.stringify(clean));
    emit('cart:change', clean);
  }
  function cartLines() { return readCart(); }
  function cartCount() {
    return readCart().reduce((a, l) => a + (Number(l.qty) || 0), 0);
  }
  function cartCountForProduct(pid) {
    return readCart()
      .filter(l => l && l.productId === pid)
      .reduce((a, l) => a + (Number(l.qty) || 0), 0);
  }
  function cartQty(pid, speciesId) {
    // Legacy signature (pid only) falls back to total-for-product so old pages
    // that call ZE.cart.qty(pid) keep showing a badge. A proper (pid, species)
    // call returns the combined qty across any enclosure/note variants for
    // that pair.
    if (speciesId === undefined) return cartCountForProduct(pid);
    return readCart()
      .filter(l => l && l.productId === pid && l.speciesId === speciesId)
      .reduce((a, l) => a + (Number(l.qty) || 0), 0);
  }
  function _newLineId() {
    return 'line_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  }
  function _sameVariant(line, productId, speciesId, enclosureId, note, selectedVendorId) {
    return line
      && line.productId === productId
      && line.speciesId === speciesId
      && (line.enclosureId || null) === (enclosureId || null)
      && (line.note || null) === (note || null)
      && (line.selectedVendorId || null) === (selectedVendorId || null);
  }
  function cartAddLine(opts) {
    opts = opts || {};
    const productId = opts.productId;
    const speciesId = opts.speciesId;
    const enclosureId = opts.enclosureId || null;
    const note = opts.note != null ? String(opts.note) : null;
    const selectedVendorId = opts.selectedVendorId || null;
    let qty = Number(opts.qty);
    if (!isFinite(qty) || qty < 1) qty = 1;
    qty = Math.round(qty);
    if (!productId) {
      console.warn('ZE.cart.addLine: productId is required');
      return null;
    }
    const lines = readCart();
    const hitIdx = lines.findIndex(l => _sameVariant(l, productId, speciesId, enclosureId, note, selectedVendorId));
    if (hitIdx !== -1) {
      lines[hitIdx] = Object.assign({}, lines[hitIdx], {
        qty: (Number(lines[hitIdx].qty) || 0) + qty
      });
      writeCart(lines);
      return lines[hitIdx].id;
    }
    const line = {
      id: _newLineId(),
      productId: productId,
      speciesId: speciesId,
      enclosureId: enclosureId,
      qty: qty,
      note: note
    };
    if (selectedVendorId) line.selectedVendorId = selectedVendorId;
    lines.push(line);
    writeCart(lines);
    return line.id;
  }
  function cartSetLineVendor(lineId, vendorId) {
    const lines = readCart();
    const idx = lines.findIndex(l => l && l.id === lineId);
    if (idx === -1) {
      console.warn('ZE.cart.setLineVendor: line not found', lineId);
      return null;
    }
    const updated = Object.assign({}, lines[idx]);
    if (vendorId == null) {
      delete updated.selectedVendorId;
    } else {
      updated.selectedVendorId = vendorId;
    }
    lines[idx] = updated;
    writeCart(lines);
    return updated;
  }
  function cartSetLineSpecies(lineId, speciesId) {
    const lines = readCart();
    const idx = lines.findIndex(l => l && l.id === lineId);
    if (idx === -1) {
      console.warn('ZE.cart.setLineSpecies: line not found', lineId);
      return null;
    }
    const updated = Object.assign({}, lines[idx]);
    // addLine stores absent values as null (not undefined/missing), so match that shape.
    updated.speciesId = (speciesId == null) ? null : String(speciesId);
    lines[idx] = updated;
    writeCart(lines);
    return updated;
  }
  function cartSetLineEnclosure(lineId, enclosureId) {
    const lines = readCart();
    const idx = lines.findIndex(l => l && l.id === lineId);
    if (idx === -1) {
      console.warn('ZE.cart.setLineEnclosure: line not found', lineId);
      return null;
    }
    const updated = Object.assign({}, lines[idx]);
    updated.enclosureId = (enclosureId == null) ? null : String(enclosureId);
    lines[idx] = updated;
    writeCart(lines);
    return updated;
  }
  function cartSetLineNote(lineId, note) {
    const lines = readCart();
    const idx = lines.findIndex(l => l && l.id === lineId);
    if (idx === -1) {
      console.warn('ZE.cart.setLineNote: line not found', lineId);
      return null;
    }
    const updated = Object.assign({}, lines[idx]);
    updated.note = (note == null) ? null : String(note);
    lines[idx] = updated;
    writeCart(lines);
    return updated;
  }
  function _effectiveVendorId(line) {
    if (line && line.selectedVendorId) return line.selectedVendorId;
    const p = (window.DB && typeof window.DB.byId === 'function')
      ? window.DB.byId(window.DB.PRODUCTS, line.productId)
      : null;
    return p ? p.vendorId : null;
  }
  function cartSetLineQty(lineId, qty) {
    const lines = readCart();
    const idx = lines.findIndex(l => l && l.id === lineId);
    if (idx === -1) return 0;
    const n = Math.round(Number(qty) || 0);
    if (n <= 0) {
      lines.splice(idx, 1);
      writeCart(lines);
      return 0;
    }
    lines[idx] = Object.assign({}, lines[idx], { qty: n });
    writeCart(lines);
    return n;
  }
  function cartIncLine(lineId, delta) {
    const lines = readCart();
    const idx = lines.findIndex(l => l && l.id === lineId);
    if (idx === -1) return 0;
    const next = (Number(lines[idx].qty) || 0) + (Number(delta) || 0);
    if (next <= 0) {
      lines.splice(idx, 1);
      writeCart(lines);
      return 0;
    }
    lines[idx] = Object.assign({}, lines[idx], { qty: next });
    writeCart(lines);
    return next;
  }
  function cartRemoveLine(lineId) {
    const lines = readCart();
    const idx = lines.findIndex(l => l && l.id === lineId);
    if (idx === -1) return;
    lines.splice(idx, 1);
    writeCart(lines);
  }
  function cartRemoveProduct(pid) {
    const lines = readCart().filter(l => !(l && l.productId === pid));
    writeCart(lines);
  }
  function cartClear() { writeCart([]); }
  function cartIsEmpty() { return cartCount() === 0; }
  function _dbProducts() {
    try { return (window.DB && Array.isArray(window.DB.PRODUCTS)) ? window.DB.PRODUCTS : []; }
    catch (e) { return []; }
  }
  function _productById(pid) {
    return _dbProducts().find(p => p && p.id === pid) || null;
  }
  function cartSubtotal() {
    return readCart().reduce((sum, l) => {
      if (!l) return sum;
      const p = _productById(l.productId);
      if (!p || !p.price) return sum;
      const unit = (Number(p.price.material) || 0) + (Number(p.price.labor) || 0);
      return sum + unit * (Number(l.qty) || 0);
    }, 0);
  }
  function cartGroupByVendor() {
    const out = {};
    readCart().forEach(l => {
      if (!l) return;
      const vid = _effectiveVendorId(l) || 'unknown';
      (out[vid] = out[vid] || []).push(l);
    });
    return out;
  }

  /* ---------- Cart legacy shims (pre-v3 API — logs warn, kept for old pages) ---------- */
  function cartAdd(pid, delta) {
    console.warn('ZE.cart.add(pid, delta) is deprecated — use ZE.cart.addLine({productId, speciesId, ...})');
    const d = (delta == null) ? 1 : Number(delta);
    const lines = readCart();
    const idx = lines.findIndex(l => l && l.productId === pid);
    if (idx === -1) {
      // Can't create a line without a species — no-op.
      return cartCountForProduct(pid);
    }
    cartIncLine(lines[idx].id, d);
    return cartCountForProduct(pid);
  }
  function cartSet(pid, qty) {
    console.warn('ZE.cart.set(pid, qty) is deprecated and is a no-op under v3 — use ZE.cart.setLineQty(lineId, qty)');
    return cartCountForProduct(pid);
  }
  function cartRemove(pid) {
    console.warn('ZE.cart.remove(pid) is deprecated — use ZE.cart.removeProduct(pid) or ZE.cart.removeLine(lineId)');
    cartRemoveProduct(pid);
  }

  /* ---------- Tiny event bus ---------- */
  const listeners = {};
  function on(ev, fn)   { (listeners[ev] = listeners[ev] || []).push(fn); }
  function emit(ev, payload) { (listeners[ev] || []).forEach(fn => fn(payload)); }

  /* ---------- Saved / wishlist store ---------- */
  function readSaved() {
    try {
      const v = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }
  function writeSaved(arr) {
    const clean = Array.isArray(arr) ? arr : [];
    localStorage.setItem(SAVED_KEY, JSON.stringify(clean));
    emit('saved:change', clean);
  }
  function savedHas(id) { return readSaved().indexOf(id) !== -1; }
  function savedAdd(id) {
    const a = readSaved();
    if (a.indexOf(id) === -1) { a.push(id); writeSaved(a); }
  }
  function savedRemove(id) {
    const a = readSaved();
    const i = a.indexOf(id);
    if (i !== -1) { a.splice(i, 1); writeSaved(a); }
  }
  function savedToggle(id) {
    const a = readSaved();
    const i = a.indexOf(id);
    if (i === -1) { a.push(id); writeSaved(a); return true; }
    a.splice(i, 1); writeSaved(a); return false;
  }
  function savedCount() { return readSaved().length; }
  function savedClear() { writeSaved([]); }

  /* ---------- Orders store ---------- */
  function readOrders() {
    try {
      const v = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }
  function writeOrders(arr) {
    const clean = Array.isArray(arr) ? arr : [];
    localStorage.setItem(ORDERS_KEY, JSON.stringify(clean));
    emit('orders:change', clean);
  }
  function ordersCount() { return readOrders().length; }
  function ordersById(id) { return readOrders().find(o => o.id === id); }
  function _resolveUserName(userId) {
    if (!userId) return null;
    try {
      if (typeof DB !== 'undefined' && DB && Array.isArray(DB.USERS)) {
        const hit = DB.USERS.find(x => x && x.id === userId);
        if (hit && hit.name) return hit.name;
      }
    } catch (e) { /* ignore */ }
    return userId;
  }
  function ordersSubmit(payload) {
    payload = payload || {};
    const existing = readOrders();
    const next = (existing.length ? parseInt(existing[0].id.replace('ORD-',''), 10) + 1 : 1);
    const newId = 'ORD-' + String(next).padStart(4, '0');
    const createdAt = new Date().toISOString();
    const items = Array.isArray(payload.items) ? payload.items : [];
    const subtotal = typeof payload.subtotal === 'number' ? payload.subtotal : 0;
    const shippingMethod = payload.shippingMethod || 'Standard';
    const shippingFee = shippingMethod === 'Express' ? 200 : 80;
    const etaDays = shippingMethod === 'Express' ? 2 : 5;
    const eta = new Date(Date.now() + etaDays * 86400000).toISOString();
    const requiresApproval = !!payload.requiresApproval;
    const approverId = payload.approverId || null;
    const approverName = _resolveUserName(approverId);

    const initialStatus = requiresApproval ? 'pending_approval' : 'placed';
    const initialEvents = requiresApproval
      ? [{
          status: 'pending_approval',
          at: createdAt,
          location: 'Online',
          note: 'Request submitted — awaiting approval from ' + (approverName || 'senior')
        }]
      : [{ status: 'placed', at: createdAt, location: 'Online', note: 'Order placed' }];

    const order = {
      id: newId,
      createdAt: createdAt,
      items: items,
      subtotal: subtotal,
      shippingMethod: shippingMethod,
      shippingFee: shippingFee,
      total: subtotal + shippingFee,
      status: initialStatus,
      priority: payload.priority || 'Normal',
      notes: payload.notes || '',
      species: payload.species || null,
      speciesId: payload.speciesId || null,
      enclosureId: payload.enclosureId || null,
      siteId: payload.siteId || null,
      vendorId: payload.vendorId || null,
      buyerId: payload.buyerId || null,
      createdBy: payload.createdBy || payload.buyerId || null,
      requiresApproval: requiresApproval,
      approverId: approverId,
      approvalStatus: requiresApproval ? 'pending' : null,
      shippingAddress: payload.shippingAddress || null,
      tracking: {
        carrier: null,
        number: null,
        url: null,
        eta: eta,
        events: initialEvents
      },
      source: 'user'
    };
    const updated = [order].concat(existing);
    writeOrders(updated);
    // Clear cart via existing cart API
    cartClear();
    return order;
  }
  function ordersSetStatus(id, status) {
    const list = readOrders();
    const idx = list.findIndex(o => o.id === id);
    if (idx === -1) return undefined;
    list[idx] = Object.assign({}, list[idx], { status: status });
    writeOrders(list);
    return list[idx];
  }
  function ordersAdvanceStatus(id) {
    const chain = ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
    const copy = {
      confirmed:        { location: 'Vendor DC',       note: 'Seller has confirmed your order' },
      packed:           { location: 'Vendor DC',       note: 'Packed and ready to ship' },
      shipped:          { location: 'Vendor DC',       note: 'Picked up by carrier' },
      out_for_delivery: { location: 'Destination hub', note: 'Out for delivery' },
      delivered:        { location: 'Destination',     note: 'Delivered to facility' }
    };
    const list = readOrders();
    const idx = list.findIndex(o => o.id === id);
    if (idx === -1) return undefined;
    const order = Object.assign({}, list[idx]);
    if (order.approvalStatus === 'pending') {
      console.warn('ZE.orders.advanceStatus: order is pending approval and cannot advance', id);
      return order;
    }
    if (order.status === 'delivered' || order.status === 'cancelled') return order;
    const curIdx = chain.indexOf(order.status);
    if (curIdx === -1 || curIdx >= chain.length - 1) return order;
    const nextStatus = chain[curIdx + 1];

    // Delegate vendor-stage transitions to the dedicated methods so both code
    // paths stay consistent.
    if (nextStatus === 'confirmed') {
      return ordersRespondAsVendor(id, { daysToComplete: 3 });
    }
    if (nextStatus === 'packed') {
      return ordersMarkPacked(id);
    }
    if (nextStatus === 'shipped') {
      // Reuse existing auto-assignment logic so legacy demo flows still get a
      // random carrier / number (the old behaviour below).
    }

    const nowIso = new Date().toISOString();

    // Clone tracking deeply enough
    const tracking = Object.assign({}, order.tracking || { carrier: null, number: null, url: null, eta: null, events: [] });
    tracking.events = Array.isArray(tracking.events) ? tracking.events.slice() : [];

    // On shipped transition, assign carrier/number/url if missing
    if (nextStatus === 'shipped' && !tracking.carrier) {
      const defaultCarriers = ['Blue Dart', 'Delhivery', 'DTDC', 'India Post', 'Xpressbees'];
      const prefixMap = {
        'Blue Dart': 'BD',
        'Delhivery': 'DL',
        'DTDC': 'DT',
        'India Post': 'IP',
        'Xpressbees': 'XB'
      };
      let carrierList = defaultCarriers;
      let urlTemplate = null;
      let prefixLookup = null;
      try {
        if (typeof DB !== 'undefined' && DB && DB.CARRIERS) {
          const dbCarriers = DB.CARRIERS;
          if (Array.isArray(dbCarriers) && dbCarriers.length) {
            carrierList = dbCarriers.map(c => (typeof c === 'string' ? c : c.name)).filter(Boolean);
            prefixLookup = {};
            dbCarriers.forEach(c => {
              if (c && typeof c === 'object' && c.name) {
                if (c.prefix) prefixLookup[c.name] = c.prefix;
                if (c.urlTemplate && !urlTemplate) urlTemplate = c.urlTemplate;
              }
            });
          } else if (typeof dbCarriers === 'object') {
            carrierList = Object.keys(dbCarriers);
            prefixLookup = {};
            carrierList.forEach(name => {
              const c = dbCarriers[name] || {};
              if (c.prefix) prefixLookup[name] = c.prefix;
              if (c.urlTemplate && !urlTemplate) urlTemplate = c.urlTemplate;
            });
          }
        }
      } catch (e) { /* ignore and fall back */ }

      const carrier = carrierList[Math.floor(Math.random() * carrierList.length)];
      const prefix = (prefixLookup && prefixLookup[carrier]) || prefixMap[carrier] || carrier.substring(0, 2).toUpperCase();
      let digits = '';
      for (let i = 0; i < 10; i++) digits += Math.floor(Math.random() * 10);
      const number = prefix + digits;
      const url = urlTemplate
        ? urlTemplate.replace('<carrier>', encodeURIComponent(carrier)).replace('<number>', number)
        : ('https://example.com/track/' + encodeURIComponent(carrier) + '/' + number);
      tracking.carrier = carrier;
      tracking.number = number;
      tracking.url = url;
    }

    const meta = copy[nextStatus] || { location: '', note: '' };
    tracking.events.push({ status: nextStatus, at: nowIso, location: meta.location, note: meta.note });

    order.status = nextStatus;
    order.tracking = tracking;
    list[idx] = order;
    writeOrders(list);
    return order;
  }
  function ordersCancel(id) { return ordersSetStatus(id, 'cancelled'); }
  function ordersClear() { writeOrders([]); }

  /* ---------- Approval workflow ---------- */
  function ordersApproveRequest(id, opts) {
    opts = opts || {};
    const list = readOrders();
    const idx = list.findIndex(o => o && o.id === id);
    if (idx === -1) return undefined;
    const order = Object.assign({}, list[idx]);
    if (!order.requiresApproval || order.approvalStatus !== 'pending') {
      console.warn('ZE.orders.approveRequest: order is not awaiting approval', id);
      return order;
    }
    const nowIso = new Date().toISOString();
    const note = (opts.note != null && String(opts.note).length)
      ? String(opts.note)
      : 'Request approved — forwarded to vendor';
    const tracking = Object.assign({}, order.tracking || { carrier: null, number: null, url: null, eta: null, events: [] });
    tracking.events = Array.isArray(tracking.events) ? tracking.events.slice() : [];
    tracking.events.push({ status: 'placed', at: nowIso, location: 'Approver', note: note });

    order.approvalStatus = 'approved';
    order.approvedAt = nowIso;
    order.status = 'placed';
    order.tracking = tracking;
    list[idx] = order;
    writeOrders(list);
    return order;
  }

  function ordersRejectRequest(id, opts) {
    opts = opts || {};
    const reason = opts.reason != null ? String(opts.reason) : '';
    const list = readOrders();
    const idx = list.findIndex(o => o && o.id === id);
    if (idx === -1) return undefined;
    const order = Object.assign({}, list[idx]);
    if (!order.requiresApproval || order.approvalStatus !== 'pending') {
      console.warn('ZE.orders.rejectRequest: order is not awaiting approval', id);
      return order;
    }
    const nowIso = new Date().toISOString();
    const tracking = Object.assign({}, order.tracking || { carrier: null, number: null, url: null, eta: null, events: [] });
    tracking.events = Array.isArray(tracking.events) ? tracking.events.slice() : [];
    tracking.events.push({
      status: 'cancelled',
      at: nowIso,
      location: 'Approver',
      note: 'Request rejected — ' + reason
    });

    order.approvalStatus = 'rejected';
    order.rejectReason = reason;
    order.status = 'cancelled';
    order.tracking = tracking;
    list[idx] = order;
    writeOrders(list);
    return order;
  }

  function ordersPendingApprovalsFor(approverId) {
    if (!approverId) return [];
    const user = readOrders();
    let demo = [];
    try {
      if (typeof DB !== 'undefined' && DB && Array.isArray(DB.DEMO_ORDERS)) demo = DB.DEMO_ORDERS;
    } catch (e) { /* ignore */ }
    const merged = user.concat(demo);
    const filtered = merged.filter(o =>
      o && o.requiresApproval === true
      && o.approvalStatus === 'pending'
      && o.approverId === approverId
    );
    filtered.sort((a, b) => {
      const ta = a && a.createdAt ? Date.parse(a.createdAt) : 0;
      const tb = b && b.createdAt ? Date.parse(b.createdAt) : 0;
      return (isFinite(tb) ? tb : 0) - (isFinite(ta) ? ta : 0);
    });
    return filtered;
  }

  /* ---------- Active site (per-session) ----------
     Wallet is per-site. A user with multi-site access can switch which site is
     "active" in the current session; this affects the wallet shown in the header
     and the site context for new orders. Defaults to the user's primary siteId. */
  const ACTIVE_SITE_KEY = 'ze_active_site_v1';
  function activeSiteAvailableFor(userId) {
    if (!userId || typeof DB === 'undefined' || !DB || !Array.isArray(DB.USERS)) return [];
    const u = DB.USERS.find(x => x && x.id === userId);
    if (!u) return [];
    const ids = [];
    if (u.siteId) ids.push(u.siteId);
    if (Array.isArray(u.additionalSites)) u.additionalSites.forEach(s => { if (s && ids.indexOf(s) === -1) ids.push(s); });
    return ids;
  }
  function activeSiteGet() {
    try {
      const stored = localStorage.getItem(ACTIVE_SITE_KEY);
      const u = userRead();
      const userId = u && u.id;
      const allowed = activeSiteAvailableFor(userId);
      if (stored && allowed.indexOf(stored) !== -1) return stored;
      // Default to user's primary site
      if (allowed.length) return allowed[0];
    } catch (e) { /* ignore */ }
    return null;
  }
  function activeSiteSet(siteId) {
    if (!siteId) return null;
    const u = userRead();
    const allowed = activeSiteAvailableFor(u && u.id);
    if (allowed.indexOf(siteId) === -1) {
      console.warn('ZE.activeSite.set: site not in user access list', siteId);
      return null;
    }
    try { localStorage.setItem(ACTIVE_SITE_KEY, siteId); } catch (e) {}
    emit('activeSite:change', { siteId });
    return siteId;
  }

  /* ---------- Wallet ----------
     Per-site annual budget. Each order locks funds at placement, commits to admin
     on delivery, refunds on cancellation. Status mapping:
       - pending_approval / placed / confirmed / packed / shipped / out_for_delivery
         → LOCKED (deducted from wallet, not yet credited to admin)
       - delivered → SPENT (paid to admin)
       - cancelled → REFUNDED (returned to wallet pool — does not count)
     Manual top-ups go through ZE.topup.submit and are added to allotted on approval
     (approval flow lives outside this prototype for now). */
  const LOCKED_STATUSES = ['pending_approval','placed','confirmed','packed','shipped','out_for_delivery'];
  const SPENT_STATUSES  = ['delivered'];
  function _allOrdersForSite(siteId) {
    if (!siteId) return [];
    const user = readOrders();
    let demo = [];
    try { if (typeof DB !== 'undefined' && DB && Array.isArray(DB.DEMO_ORDERS)) demo = DB.DEMO_ORDERS; } catch (e) {}
    return user.concat(demo).filter(o => o && o.siteId === siteId);
  }
  function walletForSite(siteId) {
    const empty = { siteId: siteId || null, allotted: 0, locked: 0, spent: 0, available: 0, fy: null, fyStart: null, fyEnd: null, topupApproved: 0 };
    if (!siteId) return empty;
    let budget = null;
    try { budget = (typeof DB !== 'undefined' && DB && DB.SITE_BUDGETS) ? DB.SITE_BUDGETS[siteId] : null; } catch (e) {}
    if (!budget) return empty;
    const fyStart = Date.parse(budget.fyStart);
    const fyEnd   = Date.parse(budget.fyEnd) + (24*60*60*1000) - 1;
    const orders = _allOrdersForSite(siteId).filter(o => {
      const t = o && o.createdAt ? Date.parse(o.createdAt) : NaN;
      return isFinite(t) && t >= fyStart && t <= fyEnd;
    });
    let locked = 0, spent = 0;
    orders.forEach(o => {
      const total = Number(o && o.total) || 0;
      if (LOCKED_STATUSES.indexOf(o.status) !== -1) locked += total;
      else if (SPENT_STATUSES.indexOf(o.status) !== -1) spent += total;
      // cancelled → ignored (refunded)
    });
    // Approved top-ups (mock: persisted in ze_topup_requests_v1 with status:'approved')
    let topupApproved = 0;
    try {
      const tu = JSON.parse(localStorage.getItem('ze_topup_requests_v1') || '[]') || [];
      topupApproved = tu.filter(r => r && r.siteId === siteId && r.status === 'approved' && Date.parse(r.requestedAt) >= fyStart).reduce((s, r) => s + (Number(r.amount) || 0), 0);
    } catch (e) {}
    const allotted = (Number(budget.allotted) || 0) + topupApproved;
    const available = Math.max(0, allotted - locked - spent);
    return { siteId, allotted, locked, spent, available, topupApproved, fy: budget.fy, fyStart: budget.fyStart, fyEnd: budget.fyEnd };
  }
  function walletTxnsForSite(siteId) {
    if (!siteId) return [];
    const orders = _allOrdersForSite(siteId);
    const txns = [];
    orders.forEach(o => {
      const total = Number(o && o.total) || 0;
      const when = o && o.createdAt;
      if (LOCKED_STATUSES.indexOf(o.status) !== -1) {
        txns.push({ kind:'locked',   amount: -total, orderId: o.id, status: o.status, at: when, label: 'Order placed · funds locked' });
      } else if (SPENT_STATUSES.indexOf(o.status) !== -1) {
        txns.push({ kind:'spent',    amount: -total, orderId: o.id, status: o.status, at: when, label: 'Order delivered · paid to admin' });
      } else if (o.status === 'cancelled') {
        txns.push({ kind:'refunded', amount: 0,      orderId: o.id, status: o.status, at: when, label: 'Order cancelled · refunded' });
      }
    });
    // Top-up history
    try {
      const tu = JSON.parse(localStorage.getItem('ze_topup_requests_v1') || '[]') || [];
      tu.filter(r => r && r.siteId === siteId).forEach(r => {
        txns.push({
          kind: r.status === 'approved' ? 'topup_approved' : (r.status === 'rejected' ? 'topup_rejected' : 'topup_pending'),
          amount: r.status === 'approved' ? Number(r.amount) || 0 : 0,
          orderId: null, status: r.status, at: r.requestedAt,
          label: r.status === 'approved' ? 'Top-up approved' : (r.status === 'rejected' ? 'Top-up rejected' : 'Top-up requested')
        });
      });
    } catch (e) {}
    txns.sort((a, b) => Date.parse(b.at || 0) - Date.parse(a.at || 0));
    return txns;
  }

  /* ---------- Top-up requests ---------- */
  /* ---------- Per-line fulfilment (in-house OR outsource to vendor) ----------
     Keyed by [orderId][lineIdx] so the Accept Order page and the Admin Order
     Detail page can both read/write without coupling to the actual order shape.
     decision shape: { mode: 'inhouse' | 'vendor', vendor?: { name, cost, ref, eta } }
     `eta` is an ISO date string. `cost` is an integer (₹). All vendor sub-fields
     except `name` and `eta` are optional. NOTE: this is a capture-only API —
     we do NOT recalculate order totals or wallet locks from `vendor.cost`. */
  const LINE_FULFILMENT_KEY = 'ze_line_fulfilment_v1';
  function _readLineFulfilmentMap() {
    try { return JSON.parse(localStorage.getItem(LINE_FULFILMENT_KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function _writeLineFulfilmentMap(m) {
    try { localStorage.setItem(LINE_FULFILMENT_KEY, JSON.stringify(m || {})); } catch (e) {}
  }
  // Status enum + ordered progression for the per-line happy path.
  // `cancelled` is terminal off-path. `delivered` is terminal on-path.
  const LINE_STATUSES = ['pending', 'in_progress', 'ready', 'shipped', 'delivered'];
  function _normalizeLineStatus(s) {
    if (s === 'cancelled') return 'cancelled';
    return LINE_STATUSES.includes(s) ? s : 'pending';
  }
  function lineFulfilmentSet(orderId, lineIdx, decision) {
    if (!orderId || lineIdx == null) return null;
    const all = _readLineFulfilmentMap();
    if (!all[orderId]) all[orderId] = {};
    if (decision == null) {
      delete all[orderId][lineIdx];
      if (!Object.keys(all[orderId]).length) delete all[orderId];
    } else {
      const prev = all[orderId][String(lineIdx)] || {};
      const mode = decision.mode === 'vendor' ? 'vendor' : (decision.mode === 'inhouse' ? 'inhouse' : (prev.mode || 'inhouse'));
      const out = { mode };
      if (mode === 'vendor') {
        // Merge: prefer new vendor data, fall back to previously-stored vendor
        const v = (decision.vendor != null) ? decision.vendor : (prev.vendor || {});
        out.vendor = {
          name: String(v.name || '').trim(),
          cost: v.cost != null && v.cost !== '' ? Math.max(0, Math.floor(Number(v.cost) || 0)) : null,
          ref:  v.ref != null ? String(v.ref).trim() : '',
          eta:  v.eta || null
        };
      } else if (prev.vendor) {
        // Switching back to inhouse — preserve typed vendor data so admin can flip back
        out.vendor = prev.vendor;
      }
      // ----- status / eta / cancelReason / history -----
      // Status: explicit > previous > 'pending'
      const explicitStatus = decision.status;
      const prevStatus = prev.status;
      const status = _normalizeLineStatus(explicitStatus != null ? explicitStatus : (prevStatus || 'pending'));
      out.status = status;
      // Effective ETA: explicit > previous eta > vendor.eta (if vendor) > null
      if (decision.eta !== undefined) {
        out.eta = decision.eta || null;
      } else if (prev.eta !== undefined) {
        out.eta = prev.eta;
      } else if (mode === 'vendor' && out.vendor && out.vendor.eta) {
        out.eta = out.vendor.eta;
      } else {
        out.eta = null;
      }
      // Cancellation reason
      if (status === 'cancelled') {
        out.cancelReason = String((decision.cancelReason != null ? decision.cancelReason : prev.cancelReason) || '').trim();
      } else if (prev.cancelReason) {
        // Status moved off cancelled — drop the reason
        // (no-op; just don't carry it forward)
      }
      // Partial-ship support: shippedQty (how many units of this line have been shipped).
      // 0 by default; bumped by lineFulfilmentSetShipped(). Display surfaces compute
      // "X of Y shipped" against order.items[lineIdx].qty.
      if (decision.shippedQty != null) {
        out.shippedQty = Math.max(0, Math.floor(Number(decision.shippedQty) || 0));
      } else if (prev.shippedQty != null) {
        out.shippedQty = prev.shippedQty;
      } else {
        out.shippedQty = 0;
      }
      // Audit history (append on status transition only)
      const history = Array.isArray(prev.history) ? prev.history.slice() : [];
      if (status !== prevStatus) {
        const u = userRead() || {};
        history.push({
          status,
          at: new Date().toISOString(),
          by: u.id || null,
          byName: (typeof DB !== 'undefined' && DB && Array.isArray(DB.USERS)) ? ((DB.USERS.find(x => x && x.id === u.id) || {}).name || null) : null
        });
      }
      out.history = history;
      all[orderId][String(lineIdx)] = out;
    }
    _writeLineFulfilmentMap(all);
    emit('orders:change', { kind: 'lineFulfilment', orderId, lineIdx });
    // After per-line status changes, see if the parent order should auto-roll-up to 'delivered'.
    if (decision && decision.status === 'delivered') _maybeRollupOrderDelivered(orderId);
    return all[orderId] ? all[orderId][String(lineIdx)] : null;
  }
  function lineFulfilmentGet(orderId, lineIdx) {
    if (!orderId || lineIdx == null) return null;
    const all = _readLineFulfilmentMap();
    return (all[orderId] && all[orderId][String(lineIdx)]) || null;
  }
  function lineFulfilmentForOrder(orderId) {
    if (!orderId) return {};
    const all = _readLineFulfilmentMap();
    return all[orderId] || {};
  }

  // Advance / cancel helpers — thin wrappers over lineFulfilmentSet.
  function lineFulfilmentAdvance(orderId, lineIdx) {
    const cur = lineFulfilmentGet(orderId, lineIdx) || {};
    if (cur.status === 'cancelled' || cur.status === 'delivered') return cur;
    const i = LINE_STATUSES.indexOf(cur.status || 'pending');
    const nextStatus = LINE_STATUSES[Math.min(i + 1, LINE_STATUSES.length - 1)];
    return lineFulfilmentSet(orderId, lineIdx, { status: nextStatus });
  }
  function lineFulfilmentCancel(orderId, lineIdx, reason) {
    return lineFulfilmentSet(orderId, lineIdx, { status: 'cancelled', cancelReason: reason || '' });
  }
  function lineFulfilmentSetEta(orderId, lineIdx, eta) {
    return lineFulfilmentSet(orderId, lineIdx, { eta: eta || null });
  }
  // Partial-ship: set how many units of a line have shipped. If qty equals the line's
  // total qty (looked up from the order), advance status to 'shipped' (full ship). Otherwise
  // hold status at 'shipped' too — partial ship is still a shipped state, just with shippedQty < totalQty.
  // Caller passes totalQty so we don't have to resolve the order shape inside the API.
  function lineFulfilmentSetShipped(orderId, lineIdx, shippedQty, totalQty) {
    var qty = Math.max(0, Math.floor(Number(shippedQty) || 0));
    if (totalQty != null) qty = Math.min(qty, Math.max(0, Math.floor(Number(totalQty) || 0)));
    return lineFulfilmentSet(orderId, lineIdx, { shippedQty: qty, status: qty > 0 ? 'shipped' : undefined });
  }

  // Roll up: if every non-cancelled line is delivered, advance the parent order to 'delivered'.
  // Only works for orders persisted via ZE.orders.submit (i.e. real buyer orders, not seed mocks).
  function _maybeRollupOrderDelivered(orderId) {
    try {
      const order = ordersById ? ordersById(orderId) : null;
      if (!order || !Array.isArray(order.items) || !order.items.length) return;
      if (order.status === 'delivered' || order.status === 'cancelled') return;
      const lines = lineFulfilmentForOrder(orderId);
      // Need a record for every item index
      let allTerminal = true;
      let anyDelivered = false;
      for (let i = 0; i < order.items.length; i++) {
        const r = lines[String(i)];
        if (!r) { allTerminal = false; break; }
        if (r.status === 'delivered') { anyDelivered = true; continue; }
        if (r.status === 'cancelled') continue;
        allTerminal = false; break;
      }
      if (allTerminal && anyDelivered) {
        ordersSetStatus(orderId, 'delivered');
      }
    } catch (e) {}
  }

  /* ---------- Outsource vendor name autocomplete ----------
     Free-text vendor names admin has typed before. No catalog page. */
  const OUTSOURCE_VENDORS_KEY = 'ze_outsource_vendors_v1';
  function outsourceVendorsList() {
    try {
      const arr = JSON.parse(localStorage.getItem(OUTSOURCE_VENDORS_KEY) || '[]') || [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function outsourceVendorsAdd(name) {
    const n = String(name || '').trim();
    if (!n) return;
    try {
      const arr = outsourceVendorsList();
      const lower = n.toLowerCase();
      if (arr.some(x => String(x).toLowerCase() === lower)) return;
      arr.unshift(n);
      // cap to 50 most recent
      const capped = arr.slice(0, 50);
      localStorage.setItem(OUTSOURCE_VENDORS_KEY, JSON.stringify(capped));
    } catch (e) {}
  }

  const TOPUP_KEY = 'ze_topup_requests_v1';
  function topupList(siteId) {
    try {
      const all = JSON.parse(localStorage.getItem(TOPUP_KEY) || '[]') || [];
      return siteId ? all.filter(r => r && r.siteId === siteId) : all;
    } catch (e) { return []; }
  }
  function topupSubmit(payload) {
    payload = payload || {};
    const siteId = payload.siteId;
    const amount = Math.max(0, Math.floor(Number(payload.amount) || 0));
    const reason = String(payload.reason || '').trim();
    if (!siteId)            { console.warn('ZE.topup.submit: siteId required'); return null; }
    if (!amount)            { console.warn('ZE.topup.submit: amount required'); return null; }
    if (!reason)            { console.warn('ZE.topup.submit: reason required'); return null; }
    // Normalize productLinks: array of { url, cost } where cost is optional integer.
    // Accepts a string array (urls) or an array of objects.
    const productLinks = Array.isArray(payload.productLinks)
      ? payload.productLinks
          .map(it => {
            if (it == null) return null;
            if (typeof it === 'string') {
              const url = it.trim();
              return url ? { url, cost: 0 } : null;
            }
            const url = String(it.url || '').trim();
            if (!url) return null;
            const cost = Math.max(0, Math.floor(Number(it.cost) || 0));
            return { url, cost };
          })
          .filter(Boolean)
      : [];
    const u = userRead() || {};
    const req = {
      id: 'TPU-' + Date.now().toString(36).toUpperCase(),
      siteId, amount, reason,
      urgency: payload.urgency || 'Normal',
      productLinks,
      requestedBy: u.id || null,
      requestedByName: (typeof DB !== 'undefined' && DB && Array.isArray(DB.USERS)) ? ((DB.USERS.find(x => x && x.id === u.id) || {}).name || null) : null,
      requestedAt: new Date().toISOString(),
      status: 'pending'
    };
    try {
      const all = JSON.parse(localStorage.getItem(TOPUP_KEY) || '[]') || [];
      all.unshift(req);
      localStorage.setItem(TOPUP_KEY, JSON.stringify(all));
    } catch (e) {}
    emit('topup:change', { req });
    return req;
  }

  // Approve / reject a top-up request. decision: 'approved' | 'rejected'.
  // Optional `note` (used for rejection note). Returns the updated request or null.
  function topupDecide(id, decision, opts) {
    if (!id) return null;
    if (decision !== 'approved' && decision !== 'rejected') return null;
    opts = opts || {};
    let updated = null;
    try {
      const all = JSON.parse(localStorage.getItem(TOPUP_KEY) || '[]') || [];
      const i = all.findIndex(r => r && r.id === id);
      if (i < 0) return null;
      const u = userRead() || {};
      const decidedAt = new Date().toISOString();
      all[i] = Object.assign({}, all[i], {
        status: decision,
        decidedAt,
        decisionBy: u.id || null,
        decisionByName: (typeof DB !== 'undefined' && DB && Array.isArray(DB.USERS)) ? ((DB.USERS.find(x => x && x.id === u.id) || {}).name || null) : null,
        approvedAt: decision === 'approved' ? decidedAt : (all[i].approvedAt || null),
        rejectedAt: decision === 'rejected' ? decidedAt : (all[i].rejectedAt || null),
        rejectionNote: decision === 'rejected' ? (opts.note || all[i].rejectionNote || '') : (all[i].rejectionNote || '')
      });
      updated = all[i];
      localStorage.setItem(TOPUP_KEY, JSON.stringify(all));
    } catch (e) { return null; }
    emit('topup:change', { req: updated, decision });
    return updated;
  }

  // Super-Admin direct top-up: applies an APPROVED top-up to one or more sites
  // immediately (no approval cycle). Wallet engine reads `status === 'approved'` so
  // each site's available balance bumps right away. Returns array of created records.
  function topupAddDirect(payload) {
    payload = payload || {};
    var siteIds = Array.isArray(payload.siteIds) ? payload.siteIds.filter(Boolean) : [];
    var amount = Math.max(0, Math.floor(Number(payload.amount) || 0));
    var reason = String(payload.reason || '').trim() || 'Direct top-up by Super Admin';
    var urgency = payload.urgency || 'Normal';
    if (!siteIds.length || !amount) return [];
    var u = userRead() || {};
    var byName = (typeof DB !== 'undefined' && DB && Array.isArray(DB.USERS))
      ? ((DB.USERS.find(function(x){ return x && x.id === u.id; }) || {}).name || null)
      : null;
    var created = [];
    var nowIso = new Date().toISOString();
    try {
      var all = JSON.parse(localStorage.getItem(TOPUP_KEY) || '[]') || [];
      siteIds.forEach(function(sid, i){
        var rec = {
          id: 'TPU-' + Date.now().toString(36).toUpperCase() + '-' + i,
          siteId: sid,
          amount: amount,
          reason: reason,
          urgency: urgency,
          productLinks: [],
          requestedBy: u.id || null,
          requestedByName: byName,
          requestedAt: nowIso,
          status: 'approved',
          decidedAt: nowIso,
          decisionBy: u.id || null,
          decisionByName: byName,
          approvedAt: nowIso,
          rejectedAt: null,
          rejectionNote: '',
          directBySuperAdmin: true
        };
        all.unshift(rec);
        created.push(rec);
      });
      localStorage.setItem(TOPUP_KEY, JSON.stringify(all));
    } catch (e) {}
    emit('topup:change', { kind: 'addDirect', created: created });
    return created;
  }

  /* ---------- Vendor-specific order actions ---------- */
  function slug(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'carrier';
  }
  function carrierUrl(carrier, number) {
    // Prefer DB.CARRIERS template if available
    try {
      if (typeof DB !== 'undefined' && DB && DB.CARRIERS) {
        const dbCarriers = DB.CARRIERS;
        let urlTemplate = null;
        if (Array.isArray(dbCarriers)) {
          const hit = dbCarriers.find(c => c && typeof c === 'object' && c.name === carrier);
          if (hit && hit.urlTemplate) urlTemplate = hit.urlTemplate;
        } else if (typeof dbCarriers === 'object') {
          const hit = dbCarriers[carrier];
          if (hit && hit.urlTemplate) urlTemplate = hit.urlTemplate;
        }
        if (urlTemplate) {
          return urlTemplate
            .replace('<carrier>', encodeURIComponent(carrier))
            .replace('<number>', number);
        }
      }
    } catch (e) { /* ignore */ }
    return 'https://example.com/track/' + slug(carrier) + '/' + number;
  }

  function ordersRespondAsVendor(id, opts) {
    opts = opts || {};
    const list = readOrders();
    const idx = list.findIndex(o => o.id === id);
    if (idx === -1) return undefined;
    const order = Object.assign({}, list[idx]);
    if (order.status !== 'placed') return order;

    let days = Number(opts.daysToComplete);
    if (!isFinite(days) || days < 1) days = 1;
    if (days > 60) days = 60;
    days = Math.round(days);

    const nowIso = new Date().toISOString();
    const baseMs = order.createdAt ? Date.parse(order.createdAt) : Date.now();
    const estimatedReadyBy = new Date((isFinite(baseMs) ? baseMs : Date.now()) + days * 86400000).toISOString();
    const note = (opts.note != null && String(opts.note).length) ? String(opts.note) : null;

    const tracking = Object.assign({}, order.tracking || { carrier: null, number: null, url: null, eta: null, events: [] });
    tracking.events = Array.isArray(tracking.events) ? tracking.events.slice() : [];
    tracking.events.push({
      status: 'confirmed',
      at: nowIso,
      location: 'Vendor DC',
      note: note || 'Vendor confirmed your order'
    });

    order.status = 'confirmed';
    order.vendorResponse = {
      respondedAt: nowIso,
      daysToComplete: days,
      estimatedReadyBy: estimatedReadyBy,
      note: note
    };
    order.tracking = tracking;
    list[idx] = order;
    writeOrders(list);
    return order;
  }

  function ordersMarkPacked(id) {
    const list = readOrders();
    const idx = list.findIndex(o => o.id === id);
    if (idx === -1) return undefined;
    const order = Object.assign({}, list[idx]);
    if (order.status !== 'confirmed') return order;

    const nowIso = new Date().toISOString();
    const tracking = Object.assign({}, order.tracking || { carrier: null, number: null, url: null, eta: null, events: [] });
    tracking.events = Array.isArray(tracking.events) ? tracking.events.slice() : [];
    tracking.events.push({ status: 'packed', at: nowIso, location: 'Vendor DC', note: 'Packed and ready to ship' });

    order.status = 'packed';
    order.tracking = tracking;
    list[idx] = order;
    writeOrders(list);
    return order;
  }

  function ordersMarkShipped(id, opts) {
    opts = opts || {};
    const carrier = opts.carrier;
    const number = opts.number;
    if (!carrier || !number) {
      console.warn('ZE.orders.markShipped: carrier and number are required');
      return undefined;
    }
    const list = readOrders();
    const idx = list.findIndex(o => o.id === id);
    if (idx === -1) return undefined;
    const order = Object.assign({}, list[idx]);
    if (order.status !== 'packed') return order;

    const nowIso = new Date().toISOString();
    const tracking = Object.assign({}, order.tracking || { carrier: null, number: null, url: null, eta: null, events: [] });
    tracking.events = Array.isArray(tracking.events) ? tracking.events.slice() : [];
    tracking.carrier = carrier;
    tracking.number = String(number);
    tracking.url = carrierUrl(carrier, tracking.number);
    tracking.events.push({ status: 'shipped', at: nowIso, location: 'Vendor DC', note: 'Picked up by ' + carrier });

    order.status = 'shipped';
    order.tracking = tracking;
    list[idx] = order;
    writeOrders(list);
    return order;
  }

  /* ---------- User / auth store ---------- */
  function userRead() {
    try {
      const v = JSON.parse(localStorage.getItem('ze_user_v1') || 'null');
      if (!v || typeof v !== 'object' || !v.id || !v.role) return null;
      return v;
    } catch (e) { return null; }
  }
  function userWrite(u) {
    if (u == null) {
      localStorage.removeItem(USER_KEY);
    } else {
      localStorage.setItem('ze_user_v1', JSON.stringify(u));
    }
    emit('user:change', u);
  }
  function userIsSignedIn() { return !!userRead(); }
  function userRole() { const u = userRead(); return u ? u.role : null; }
  function userSignIn(id, role) {
    if (!id || (role !== 'buyer' && role !== 'vendor' && role !== 'admin')) {
      console.warn('ZE.user.signIn: invalid id/role', id, role);
      return null;
    }
    const u = { id: id, role: role, signedInAt: new Date().toISOString() };
    userWrite(u);
    return u;
  }
  function userSignOut() { userWrite(null); }
  function userResolve() {
    const u = userRead();
    if (!u) return null;
    try {
      if (typeof DB === 'undefined' || !DB) return null;
      if (u.role === 'buyer') {
        const row = Array.isArray(DB.USERS) ? DB.USERS.find(x => x.id === u.id) : null;
        return row ? Object.assign({}, row, { role: 'buyer' }) : null;
      }
      if (u.role === 'super_admin') {
        // super_admin lives in DB.USERS (u_super), but `role` on the row is 'super_admin' too —
        // include it so callers can branch on resolved.role consistently.
        const row = Array.isArray(DB.USERS) ? DB.USERS.find(x => x.id === u.id) : null;
        return row ? Object.assign({}, row, { role: 'super_admin' }) : null;
      }
      if (u.role === 'vendor' || u.role === 'admin') {
        const row = Array.isArray(DB.VENDORS) ? DB.VENDORS.find(x => x.id === u.id) : null;
        return row ? Object.assign({}, row, { role: u.role }) : null;
      }
    } catch (e) { /* ignore */ }
    return null;
  }
  function userRequireRole(role, redirect) {
    redirect = redirect || 'login_1.html';
    const u = userRead();
    const effective = u && u.role === 'vendor' ? 'admin' : (u && u.role);
    const target    = role === 'vendor' ? 'admin' : role;
    const ok = !!effective && effective === target;
    if (!ok) {
      try {
        if (typeof window !== 'undefined' && window.location && typeof window.location.assign === 'function') {
          window.location.assign(redirect);
        }
      } catch (e) { /* non-browser env */ }
    }
    return ok;
  }
  function currentBuyerId() {
    const u = userRead();
    return u && u.role === 'buyer' ? u.id : null;
  }
  function currentVendorId() {
    const u = userRead();
    return u && (u.role === 'vendor' || u.role === 'admin') ? u.id : null;
  }

  /* ---------- Reviews store ---------- */
  function dbReviews() {
    try { return (window.DB && Array.isArray(window.DB.REVIEWS)) ? window.DB.REVIEWS : []; }
    catch (e) { return []; }
  }
  function readLocalReviews() {
    try {
      const v = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }
  function writeLocalReviews(arr) {
    const clean = Array.isArray(arr) ? arr : [];
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(clean));
    emit('reviews:change', clean);
  }
  function _ts(r) {
    const t = r && r.createdAt ? Date.parse(r.createdAt) : NaN;
    return isFinite(t) ? t : 0;
  }
  function reviewsRead() {
    const merged = dbReviews().concat(readLocalReviews());
    merged.sort((a, b) => _ts(b) - _ts(a));
    return merged;
  }
  function reviewsForProduct(productId) {
    return reviewsRead().filter(r => r && r.productId === productId);
  }
  function reviewsCount(productId) { return reviewsForProduct(productId).length; }
  function reviewsAverage(productId) {
    const list = reviewsForProduct(productId);
    if (!list.length) return 0;
    const sum = list.reduce((a, r) => a + (Number(r.stars) || 0), 0);
    return Math.round((sum / list.length) * 10) / 10;
  }
  function reviewsAdd(payload) {
    payload = payload || {};
    const productId = payload.productId;
    const buyerId = payload.buyerId;
    let stars = Math.round(Number(payload.stars));
    if (!isFinite(stars)) stars = 0;
    if (stars < 1) stars = 1;
    if (stars > 5) stars = 5;
    const text = payload.text != null ? String(payload.text) : '';
    if (!productId || !buyerId) {
      console.warn('ZE.reviews.add: productId and buyerId are required');
      return null;
    }
    const nowMs = Date.now();
    const review = {
      id: 'rv_' + nowMs,
      productId: productId,
      buyerId: buyerId,
      stars: stars,
      text: text,
      createdAt: new Date(nowMs).toISOString()
    };
    const local = readLocalReviews();
    local.push(review);
    writeLocalReviews(local);
    return review;
  }
  function reviewsAddVendorReply(reviewId, text) {
    const local = readLocalReviews();
    const idx = local.findIndex(r => r && r.id === reviewId);
    if (idx === -1) {
      // Check if it exists in DB.REVIEWS — if so, no-op with warn
      const inDb = dbReviews().some(r => r && r.id === reviewId);
      if (inDb) {
        console.warn('ZE.reviews.addVendorReply: cannot modify DB (demo) review', reviewId);
      } else {
        console.warn('ZE.reviews.addVendorReply: review not found', reviewId);
      }
      return null;
    }
    const updated = Object.assign({}, local[idx], {
      vendorReply: { text: String(text == null ? '' : text), at: new Date().toISOString() }
    });
    local[idx] = updated;
    writeLocalReviews(local);
    return updated;
  }
  function reviewsMyReviews(buyerId) {
    if (!buyerId) return [];
    return reviewsRead().filter(r => r && r.buyerId === buyerId);
  }

  /* Cross-tab sync */
  window.addEventListener('storage', (e) => {
    if (e.key === CART_KEY) emit('cart:change', readCart());
    if (e.key === SAVED_KEY) {
      try {
        const v = JSON.parse(e.newValue || '[]');
        emit('saved:change', Array.isArray(v) ? v : []);
      } catch (err) { emit('saved:change', []); }
    }
    if (e.key === ORDERS_KEY) {
      try {
        const v = JSON.parse(e.newValue || '[]');
        emit('orders:change', Array.isArray(v) ? v : []);
      } catch (err) { emit('orders:change', []); }
    }
    if (e.key === USER_KEY) {
      try {
        const v = e.newValue ? JSON.parse(e.newValue) : null;
        emit('user:change', v && v.id && v.role ? v : null);
      } catch (err) { emit('user:change', null); }
    }
    if (e.key === REVIEWS_KEY) {
      try {
        const v = JSON.parse(e.newValue || '[]');
        emit('reviews:change', Array.isArray(v) ? v : []);
      } catch (err) { emit('reviews:change', []); }
    }
  });

  /* ---------- SVG placeholder for slow images ---------- */
  function svgPlaceholder(text, w = 600, h = 400) {
    const palettes = [
      ['#DEF7E6', '#006D35'],  // brand soft
      ['#F1F2F4', '#6B7280'],  // neutral
      ['#FFF8CC', '#6d4b00'],  // warm
      ['#E0F7F4', '#1F515B'],  // teal soft
    ];
    let hash = 0;
    for (let i = 0; i < (text || '').length; i++) hash = (hash * 31 + text.charCodeAt(i)) & 0xffffff;
    const [bg, fg] = palettes[hash % palettes.length];
    const label = (text || '').trim().slice(0, 28) || 'ZooEnrich';
    const fontSize = Math.max(12, Math.min(28, Math.floor(w / Math.max(8, label.length))));
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>
      <rect width='100%' height='100%' fill='${bg}'/>
      <text x='50%' y='50%' fill='${fg}' font-family='Inter,sans-serif' font-size='${fontSize}' font-weight='600' text-anchor='middle' dominant-baseline='middle'>${label.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</text>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  function installImageFallback() {
    if (window.__zeImgFallback) return;
    window.__zeImgFallback = true;

    // ONLY fall back on real errors (404 / network failure).
    // Do NOT time out slow images — Pollinations AI generation takes 5-15s on first hit;
    // we show a shimmer until they load, then swap to the real image.
    document.addEventListener('error', (e) => {
      const img = e.target;
      if (!img || img.tagName !== 'IMG' || img.dataset.zeFallback === '1') return;
      img.dataset.zeFallback = '1';
      img.src = svgPlaceholder(img.alt, img.naturalWidth || img.width || 400, img.naturalHeight || img.height || 300);
    }, true);

    // On successful load, mark the parent so we can remove the shimmer class
    function bindLoad(img) {
      if (img.dataset.zeBound === '1') return;
      img.dataset.zeBound = '1';
      const markLoaded = () => {
        img.classList.add('is-loaded');
        if (img.parentElement) img.parentElement.classList.add('img-loaded');
      };
      if (img.complete && img.naturalWidth > 0) { markLoaded(); return; }
      img.addEventListener('load', markLoaded);
    }
    document.querySelectorAll('img').forEach(bindLoad);
    new MutationObserver(muts => {
      muts.forEach(m => m.addedNodes.forEach(n => {
        if (n.nodeType !== 1) return;
        if (n.tagName === 'IMG') bindLoad(n);
        else n.querySelectorAll && n.querySelectorAll('img').forEach(bindLoad);
      }));
    }).observe(document.body, { childList: true, subtree: true });
  }

  // Pre-warm a list of image URLs — starts downloading them immediately so that by the
  // time the DOM renders them, the network has had a head start.
  function prewarm(urls) {
    if (!Array.isArray(urls)) return;
    urls.forEach(u => { if (!u) return; const i = new Image(); i.src = u; });
  }

  /* ---------- Device preview toggle ---------- */
  function renderDeviceBar() {
    if (document.querySelector('.device-bar')) return;
    const bar = document.createElement('div');
    bar.className = 'device-bar';
    bar.innerHTML = `
      <button data-dev="mobile"  title="Mobile"  aria-label="Mobile"><i data-lucide="smartphone" class="w-4 h-4"></i></button>
      <button data-dev="tablet"  title="Tablet"  aria-label="Tablet"><i data-lucide="tablet" class="w-4 h-4"></i></button>
      <button data-dev="desktop" class="active" title="Desktop" aria-label="Desktop"><i data-lucide="monitor" class="w-4 h-4"></i></button>
    `;
    document.body.appendChild(bar);

    const saved = localStorage.getItem(DEV_KEY) || 'desktop';
    document.body.dataset.device = saved;
    bar.querySelectorAll('button').forEach(b => {
      if (b.dataset.dev === saved) { bar.querySelectorAll('button').forEach(x => x.classList.remove('active')); b.classList.add('active'); }
      b.addEventListener('click', () => {
        bar.querySelectorAll('button').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        document.body.dataset.device = b.dataset.dev;
        localStorage.setItem(DEV_KEY, b.dataset.dev);
      });
    });
  }

  function initIcons() { if (window.lucide?.createIcons) window.lucide.createIcons(); }

  window.ZE = {
    cart: {
      // v3 line-item API
      read: readCart,
      lines: cartLines,
      count: cartCount,
      countForProduct: cartCountForProduct,
      qty: cartQty,
      addLine: cartAddLine,
      setLineQty: cartSetLineQty,
      setLineVendor: cartSetLineVendor,
      setLineSpecies: cartSetLineSpecies,
      setLineEnclosure: cartSetLineEnclosure,
      setLineNote: cartSetLineNote,
      effectiveVendorId: _effectiveVendorId,
      incLine: cartIncLine,
      removeLine: cartRemoveLine,
      removeProduct: cartRemoveProduct,
      clear: cartClear,
      isEmpty: cartIsEmpty,
      subtotal: cartSubtotal,
      groupByVendor: cartGroupByVendor,
      // legacy shims (deprecated)
      add: cartAdd,
      set: cartSet,
      remove: cartRemove
    },
    saved: {
      read: readSaved,
      has: savedHas,
      add: savedAdd,
      remove: savedRemove,
      toggle: savedToggle,
      count: savedCount,
      clear: savedClear
    },
    orders: {
      read: readOrders,
      count: ordersCount,
      byId: ordersById,
      submit: ordersSubmit,
      setStatus: ordersSetStatus,
      advanceStatus: ordersAdvanceStatus,
      cancel: ordersCancel,
      clear: ordersClear,
      respondAsVendor: ordersRespondAsVendor,
      markPacked: ordersMarkPacked,
      markShipped: ordersMarkShipped,
      approveRequest: ordersApproveRequest,
      rejectRequest: ordersRejectRequest,
      pendingApprovalsFor: ordersPendingApprovalsFor,
      lineFulfilment: {
        set: lineFulfilmentSet,
        get: lineFulfilmentGet,
        forOrder: lineFulfilmentForOrder,
        advance: lineFulfilmentAdvance,
        cancel: lineFulfilmentCancel,
        setEta: lineFulfilmentSetEta,
        setShipped: lineFulfilmentSetShipped,
        STATUSES: LINE_STATUSES
      }
    },
    outsourceVendors: {
      list: outsourceVendorsList,
      add: outsourceVendorsAdd
    },
    user: {
      read: userRead,
      isSignedIn: userIsSignedIn,
      role: userRole,
      signIn: userSignIn,
      signOut: userSignOut,
      resolve: userResolve,
      requireRole: userRequireRole
    },
    reviews: {
      read: reviewsRead,
      forProduct: reviewsForProduct,
      count: reviewsCount,
      average: reviewsAverage,
      add: reviewsAdd,
      addVendorReply: reviewsAddVendorReply,
      myReviews: reviewsMyReviews
    },
    currentBuyerId: currentBuyerId,
    currentVendorId: currentVendorId,
    activeSite: {
      get: activeSiteGet,
      set: activeSiteSet,
      availableFor: activeSiteAvailableFor
    },
    wallet: {
      forSite: walletForSite,
      txnsForSite: walletTxnsForSite,
      // Org-wide rollup helper for the Super Admin dashboard. Returns
      // [{ siteId, name, city, cluster, allotted, locked, spent, available, ... }]
      allSites: function() {
        try {
          if (!(window.DB && Array.isArray(window.DB.SITES))) return [];
          return window.DB.SITES.map(function(s){
            var w = walletForSite(s.id) || {};
            return Object.assign({
              siteId: s.id,
              name: s.name,
              city: s.city,
              state: s.state,
              cluster: s.cluster || 'unassigned'
            }, w);
          });
        } catch (e) { return []; }
      }
    },
    topup: {
      list: topupList,
      submit: topupSubmit,
      decide: topupDecide,
      addDirect: topupAddDirect
    },
    on, emit,
    init() {
      installImageFallback();
      // Device-preview toggle removed per product requirement.
      // renderDeviceBar();
      // Defensively remove any existing .device-bar that a stale cached page may have injected.
      document.querySelectorAll('.device-bar').forEach(el => el.remove());
      initIcons();
      setTimeout(initIcons, 100);
    },
    refreshIcons: initIcons,
    svgPlaceholder,
    prewarm
  };
})();

  /* ---------- Mode switch (Buyer ↔ Admin ↔ Senior ↔ Junior) ---------- */
  // Persona constants for the demo:
  //   Junior buyer: u_joshi  (Lab Technician at Hyderabad, canPurchase:false, approverId:u_kumar)
  //   Senior buyer: u_kumar  (Enrichment Lab Manager at Hyderabad, canPurchase:true)
  //   Admin (in-house vendor): ven_acme
  if (typeof document !== 'undefined') {
    document.addEventListener('click', function(e){
      var t = e.target && (e.target.closest ? e.target.closest('[data-mode-switch]') : null);
      if (!t) return;
      var mode = t.getAttribute('data-mode-switch');
      try {
        var raw = localStorage.getItem('ze_user_v1');
        var u   = raw ? JSON.parse(raw) : null;
        if (!u) u = { id: '', role: '', signedInAt: new Date().toISOString() };
        if (mode === 'to-admin') {
          // remember which buyer persona to come back to
          if (u.role === 'buyer' && u.id) localStorage.setItem('ze_last_buyer', u.id);
          u.role = 'admin';
          if (!u.id || String(u.id).indexOf('ven_') !== 0) u.id = 'ven_acme';
        } else if (mode === 'to-super-admin') {
          if (u.role === 'buyer' && u.id) localStorage.setItem('ze_last_buyer', u.id);
          u.role = 'super_admin';
          u.id = 'u_super';
        } else if (mode === 'to-buyer') {
          u.role = 'buyer';
          var last = localStorage.getItem('ze_last_buyer');
          u.id = (last && (last === 'u_joshi' || last === 'u_kumar')) ? last : 'u_kumar';
        } else if (mode === 'to-senior') {
          u.role = 'buyer';
          u.id = 'u_kumar';
          localStorage.setItem('ze_last_buyer', 'u_kumar');
        } else if (mode === 'to-junior') {
          u.role = 'buyer';
          u.id = 'u_joshi';
          localStorage.setItem('ze_last_buyer', 'u_joshi');
        } else if (mode === 'to-other-persona') {
          u.role = 'buyer';
          u.id = (u.id === 'u_kumar') ? 'u_joshi' : 'u_kumar';
          localStorage.setItem('ze_last_buyer', u.id);
        }
        u.signedInAt = u.signedInAt || new Date().toISOString();
        localStorage.setItem('ze_user_v1', JSON.stringify(u));
      } catch (err) { /* ignore */ }
      // Let default navigation continue (a@href / data-nav handlers fire after this)
    }, true);
  }

  /* ---------- Persona switcher: ensure all 4 role rows exist in every avatar dropdown ----------
     User wants a CONSISTENT switcher on every page: Junior / Senior / Admin / Super Admin,
     with the row matching the current role hidden. Pages don't need any markup beyond their
     existing avatar dropdown — this function detects the dropdown by either an existing
     [data-mode-switch] anchor or a Sign-out button, then injects any missing persona rows
     before sign-out (or at end). The legacy [data-mode-switch="to-other-persona"] toggle is
     kept hidden so it doesn't conflict with the explicit Junior/Senior rows. */
  if (typeof document !== 'undefined') {
    var PERSONA_MODES = ['to-junior', 'to-senior', 'to-admin', 'to-super-admin'];
    var PERSONA_LABEL = {
      'to-junior':      'Switch to Junior view',
      'to-senior':      'Switch to Senior view',
      'to-admin':       'Switch to Admin view',
      'to-super-admin': 'Switch to Super Admin view'
    };
    var PERSONA_ICON = {
      'to-junior':      'user-round',
      'to-senior':      'user-check',
      'to-admin':       'shield',
      'to-super-admin': 'shield-check'
    };
    var PERSONA_HREF = {
      'to-junior':      'index_1.html',
      'to-senior':      'index_1.html',
      'to-admin':       'admin_dashboard_1.html',
      'to-super-admin': 'super_admin_dashboard_1.html'
    };
    var CURRENT_HIDE_MAP = {
      'Junior':      'to-junior',
      'Senior':      'to-senior',
      'Admin':       'to-admin',
      'Super Admin': 'to-super-admin'
    };

    // Find all avatar dropdown menus on the page. Heuristic: any element that contains
    // a [data-mode-switch] descendant OR a sign-out item, and isn't <body>.
    function _zeFindDropdowns() {
      var menus = new Set();
      document.querySelectorAll('[data-mode-switch]').forEach(function(el){
        var p = el.parentNode;
        if (p && p !== document.body && p.nodeType === 1) menus.add(p);
      });
      document.querySelectorAll('#signOutItem, #signOutBtn, [data-sign-out]').forEach(function(el){
        var p = el.parentNode;
        if (p && p !== document.body && p.nodeType === 1) menus.add(p);
      });
      // Also catch known dropdown class names so pages that have NO mode-switch and NO
      // sign-out button (rare) still get the rows
      document.querySelectorAll('.avatar-dd, .avatar-menu, .dd-menu, #userMenu, #avatarMenu, #avatarDropdown').forEach(function(el){
        if (el.nodeType === 1) menus.add(el);
      });
      return Array.from(menus);
    }

    // Build a persona-switch row matching the visual style of the host menu.
    // Strategy: clone the menu's first existing item, swap label/icon/data-attrs.
    function _zeBuildPersonaRow(mode, menu) {
      var template = menu.querySelector('[data-mode-switch], .dd-item, [role="menuitem"], a, button');
      var label = PERSONA_LABEL[mode];
      var icon  = PERSONA_ICON[mode];
      var href  = PERSONA_HREF[mode];
      var row;
      if (template) {
        row = document.createElement(template.tagName.toLowerCase());
        if (template.className) row.className = template.className;
        if (template.getAttribute('role')) row.setAttribute('role', template.getAttribute('role'));
      } else {
        row = document.createElement('a');
      }
      row.setAttribute('data-mode-switch', mode);
      row.setAttribute('data-persona-injected', '1');
      // Use href for <a>, type=button for <button>; for <div>/<li> the inline onclick navigates.
      if (row.tagName.toLowerCase() === 'a') row.setAttribute('href', href);
      if (row.tagName.toLowerCase() === 'button') row.setAttribute('type', 'button');
      row.setAttribute('onclick', "window.location.href='" + href + "';return false;");
      // Match the .dd-item inner structure (icon span + label span) when the host page uses it
      var hasDdInner = template && template.querySelector && template.querySelector('.dd-avatar') && template.querySelector('.dd-label');
      if (hasDdInner) {
        row.innerHTML = '<span class="dd-avatar"><i data-lucide="' + icon + '" class="w-4 h-4"></i></span><span class="dd-label">' + label + '</span>';
      } else {
        row.innerHTML = '<i data-lucide="' + icon + '" class="w-4 h-4"></i> ' + label;
      }
      return row;
    }

    // Build a Pollinations avatar URL for a given seed. Same prompt + size everywhere
    // so the face stays consistent across pages (prevents the "looks like a different
    // user after navigation" bug).
    function _zeAvatarUrlFor(seed, size) {
      var s = parseInt(seed, 10) || 1;
      var w = size || 80;
      return 'https://image.pollinations.ai/prompt/professional%20portrait%20headshot%20person%20smile?width=' + w + '&height=' + w + '&seed=' + s + '&nologo=true';
    }

    // Sync every avatar / name / email element on the page to match the resolved user.
    // Called from _zeUpdatePersonaUI so navigation between pages doesn't flash the wrong
    // face/name/email even if the page's static markup has a hardcoded default.
    function _zeSyncUserIdentity(resolvedUser) {
      try {
        if (!resolvedUser) return;
        var seed = resolvedUser.seed != null ? resolvedUser.seed : 1;
        var avatarUrl = _zeAvatarUrlFor(seed);
        // Name + email — every page uses one of these id conventions
        ['userName','menuName','navUserName','accountName'].forEach(function(id){
          var el = document.getElementById(id);
          if (el && resolvedUser.name) el.textContent = resolvedUser.name;
        });
        ['userEmail','menuEmail','navUserEmail','accountEmail'].forEach(function(id){
          var el = document.getElementById(id);
          if (el && resolvedUser.email) el.textContent = resolvedUser.email;
        });
        // Avatar <img> — broad selector list covering all known IDs/classes in the prototype.
        // Also walks into non-IMG containers (e.g. <span id="avatarTrigger"> wrapping an img).
        var avatarSelectors = [
          '#userAvatar','#avatarImg','#avatarTrigger','#headerAvatar','#mobileNavAvatar',
          '#navUserAvatar','#accountAvatar','#menuAvatar',
          'img.avatar','img.avatar-top','img.avatar-big','.avatar > img','.avatar-top > img'
        ].join(', ');
        var seen = new Set();
        document.querySelectorAll(avatarSelectors).forEach(function(el){
          var img = (el.tagName === 'IMG') ? el : el.querySelector('img');
          if (!img || seen.has(img)) return;
          seen.add(img);
          // Always swap — same URL for the same seed, browser caches it; no loop risk.
          if (img.getAttribute('src') !== avatarUrl) {
            img.setAttribute('src', avatarUrl);
          }
        });
      } catch (e) { /* ignore */ }
    }

    function _zeUpdatePersonaUI() {
      try {
        var raw = localStorage.getItem('ze_user_v1');
        var u   = raw ? JSON.parse(raw) : null;
        var role = u && u.role;
        var id   = u && u.id;
        var isSenior = (role === 'buyer' && id === 'u_kumar');
        var current = (role === 'super_admin') ? 'Super Admin'
                    : (role === 'admin') ? 'Admin'
                    : isSenior ? 'Senior'
                    : (role === 'buyer') ? 'Junior'
                    : '';
        // Resolve the full user record (DB.USERS / DB.VENDORS lookup). This gives us
        // name + email + seed so we can sync the visible identity on every page.
        var resolved = null;
        try {
          if (window.ZE && ZE.user && typeof ZE.user.resolve === 'function') {
            resolved = ZE.user.resolve();
          }
        } catch (_e) {}
        _zeSyncUserIdentity(resolved);

        // Persona chip showing current persona (legacy support)
        document.querySelectorAll('[data-persona-chip]').forEach(function(el){
          el.textContent = current;
          el.style.display = current ? '' : 'none';
        });

        // Hide the legacy "to-other-persona" toggle — the explicit Junior/Senior rows replace it
        document.querySelectorAll('[data-mode-switch="to-other-persona"]').forEach(function(el){
          var item = el.closest('[data-persona-item]') || el;
          item.style.display = 'none';
        });
        // Keep the legacy [data-persona-label] text wired so any visible label still reads sensibly
        document.querySelectorAll('[data-persona-label]').forEach(function(el){
          if (current === 'Senior')      el.textContent = 'Switch to Junior view';
          else if (current === 'Junior') el.textContent = 'Switch to Senior view';
          else                            el.textContent = 'Switch persona';
        });

        // Inject any missing persona rows into every avatar dropdown
        var menus = _zeFindDropdowns();
        menus.forEach(function(menu){
          PERSONA_MODES.forEach(function(mode){
            if (menu.querySelector('[data-mode-switch="' + mode + '"]')) return;
            var row = _zeBuildPersonaRow(mode, menu);
            // Insert before the sign-out item if present, else at end
            var signout = menu.querySelector('#signOutItem, #signOutBtn, [data-sign-out]');
            if (signout) menu.insertBefore(row, signout);
            else menu.appendChild(row);
          });
        });

        // Visibility: hide the row matching the current persona, show others
        var hideMode = CURRENT_HIDE_MAP[current];
        PERSONA_MODES.forEach(function(mode){
          document.querySelectorAll('[data-mode-switch="' + mode + '"]').forEach(function(el){
            el.style.display = (mode === hideMode) ? 'none' : '';
          });
        });

        // Re-render Lucide icons for any rows we just injected
        if (window.lucide && window.lucide.createIcons) {
          try { window.lucide.createIcons(); } catch (e) {}
        }
      } catch (e) { /* ignore */ }
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _zeUpdatePersonaUI);
    } else {
      _zeUpdatePersonaUI();
    }
    // Re-run after a tick to catch JS-rendered dropdowns (renderHeaderAvatar / renderUserSlot etc.)
    setTimeout(_zeUpdatePersonaUI, 250);
    setTimeout(_zeUpdatePersonaUI, 1000);
    // Re-run when user record changes (cross-tab sync via storage event)
    window.addEventListener('storage', function(e){ if (e.key === 'ze_user_v1') _zeUpdatePersonaUI(); });
    if (window.ZE && typeof window.ZE.on === 'function') {
      window.ZE.on('user:change', _zeUpdatePersonaUI);
    }
  }

  /* ---------- Header / nav approvals link visibility ---------- */
  // Senior buyer (u_kumar) only: show any element marked [data-approvals-header] when there are
  // pending approvals routed to them, and update the count inside [data-approvals-header-badge].
  // Used by every buyer page's header icon-button row + mobile drawer entries. Pages that have
  // their own renderApprovalsNav() (currently only profile_1.html) keep working independently.
  if (typeof document !== 'undefined') {
    function _zeUpdateApprovalsHeader() {
      try {
        var raw = localStorage.getItem('ze_user_v1');
        var u   = raw ? JSON.parse(raw) : null;
        var isSenior = !!(u && u.role === 'buyer' && u.id === 'u_kumar');
        var pending = [];
        if (isSenior && window.ZE && ZE.orders && typeof ZE.orders.pendingApprovalsFor === 'function') {
          pending = ZE.orders.pendingApprovalsFor('u_kumar') || [];
        }
        var n = pending.length;
        var show = isSenior && n > 0;
        document.querySelectorAll('[data-approvals-header]').forEach(function(el){
          if (!show) { el.style.display = 'none'; return; }
          // Restore appropriate display value based on declared preference.
          var pref = el.getAttribute('data-approvals-display') || '';
          if (pref) { el.style.display = pref; return; }
          // Default: anchors and divs that need flex layout get 'flex'; buttons clear to default.
          var tag = (el.tagName || '').toUpperCase();
          el.style.display = (tag === 'A' || tag === 'DIV') ? 'flex' : '';
        });
        document.querySelectorAll('[data-approvals-header-badge]').forEach(function(b){
          if (show) {
            b.textContent = String(n);
            b.style.display = 'inline-flex';
          } else {
            b.style.display = 'none';
          }
        });
      } catch (e) { /* ignore */ }
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _zeUpdateApprovalsHeader);
    } else {
      _zeUpdateApprovalsHeader();
    }
    setTimeout(_zeUpdateApprovalsHeader, 250);
    setTimeout(_zeUpdateApprovalsHeader, 1000);
    window.addEventListener('storage', function(e){
      if (e.key === 'ze_user_v1' || (e.key && e.key.indexOf('ze_orders') === 0)) _zeUpdateApprovalsHeader();
    });
    if (window.ZE && typeof window.ZE.on === 'function') {
      window.ZE.on('user:change',   _zeUpdateApprovalsHeader);
      window.ZE.on('orders:change', _zeUpdateApprovalsHeader);
    }
  }

  /* ========================================================================
   * Super Admin direct top-up modal — single source of truth, injected on
   * first call. Pages just call ZE.openSuperAdminTopupModal({ siteIds: [...] }).
   * Multi-site capable: checkbox grid of all DB.SITES, "All / None / By cluster"
   * quick selectors. Submit calls ZE.topup.addDirect which creates approved
   * top-up records for each selected site (no approval cycle).
   * ======================================================================== */
  function _zeEnsureSuperAdminTopupModal() {
    if (document.getElementById('zeSaTopupOverlay')) return;
    var style = document.createElement('style');
    style.textContent = [
      '.ze-sa-overlay { position: fixed; inset: 0; background: rgba(15,23,42,.42); display: none; z-index: 1000; align-items: center; justify-content: center; padding: 20px; opacity: 0; transition: opacity .18s ease; }',
      '.ze-sa-overlay.open { display: flex; opacity: 1; }',
      '.ze-sa-modal { background: #fff; border-radius: 18px; width: 640px; max-width: 100%; max-height: calc(100vh - 40px); display: flex; flex-direction: column; box-shadow: 0 20px 60px -10px rgba(15,23,42,.35); transform: translateY(8px) scale(.98); transition: transform .22s ease; overflow: hidden; }',
      '.ze-sa-overlay.open .ze-sa-modal { transform: translateY(0) scale(1); }',
      '.ze-sa-head { display: flex; align-items: center; gap: 12px; padding: 18px 22px; border-bottom: 1px solid var(--border); }',
      '.ze-sa-head .ico { width: 36px; height: 36px; border-radius: 10px; background: var(--brand-soft); color: var(--brand-hover); display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }',
      '.ze-sa-head .ze-sa-title { font-size: 18px; font-weight: 700; color: var(--text); }',
      '.ze-sa-head .ze-sa-sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; }',
      '.ze-sa-head .close-x { margin-left: auto; width: 36px; height: 36px; border-radius: 10px; border: none; background: transparent; color: var(--text-muted); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }',
      '.ze-sa-head .close-x:hover { background: #F1F2F4; color: var(--text); }',
      '.ze-sa-body { padding: 18px 22px; overflow-y: auto; flex: 1; }',
      '.ze-sa-field { margin-bottom: 16px; }',
      '.ze-sa-field label { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; }',
      '.ze-sa-field .req { color: var(--danger); margin-left: 2px; }',
      '.ze-sa-amt-wrap { position: relative; }',
      '.ze-sa-amt-wrap .currency { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-weight: 600; font-size: 16px; }',
      '.ze-sa-amt-wrap input { width: 100%; padding: 14px 14px 14px 34px; border-radius: 12px; border: 1.5px solid var(--border); font-size: 22px; font-weight: 700; outline: none; transition: border-color .15s; font-variant-numeric: tabular-nums; color: var(--text); background: #fff; }',
      '.ze-sa-amt-wrap input:focus { border-color: var(--brand); }',
      '.ze-sa-helper { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-top: 6px; }',
      '.ze-sa-field textarea { width: 100%; padding: 12px; border-radius: 10px; border: 1.5px solid var(--border); font-size: 13px; outline: none; min-height: 70px; resize: vertical; font-family: inherit; color: var(--text); }',
      '.ze-sa-field textarea:focus { border-color: var(--brand); }',
      '.ze-sa-quick { display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }',
      '.ze-sa-quick button { padding: 5px 11px; border-radius: 999px; border: 1.5px solid var(--border); background: #fff; cursor: pointer; font-size: 11px; font-weight: 600; color: var(--text); transition: .15s; font-family: inherit; }',
      '.ze-sa-quick button:hover { border-color: var(--brand); color: var(--brand-hover); }',
      '.ze-sa-quick button.active { background: var(--brand-soft); border-color: var(--brand); color: var(--brand-hover); }',
      '.ze-sa-sites { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; max-height: 220px; overflow-y: auto; padding: 4px; border: 1px solid var(--border); border-radius: 10px; background: #FAFBFC; }',
      '@media (max-width: 560px) { .ze-sa-sites { grid-template-columns: 1fr; } }',
      '.ze-sa-site { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 8px; cursor: pointer; transition: background .12s; }',
      '.ze-sa-site:hover { background: #fff; }',
      '.ze-sa-site input { width: 16px; height: 16px; cursor: pointer; accent-color: var(--brand); }',
      '.ze-sa-site .nm { font-size: 13px; font-weight: 600; color: var(--text); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
      '.ze-sa-site .meta { font-size: 11px; color: var(--text-muted); flex-shrink: 0; }',
      '.ze-sa-foot { display: flex; align-items: center; justify-content: space-between; padding: 16px 22px; border-top: 1px solid var(--border); background: #FAFBFC; }',
      '.ze-sa-foot .summary { font-size: 13px; color: var(--text-muted); }',
      '.ze-sa-foot .summary strong { color: var(--text); }',
      '.ze-sa-actions { display: flex; gap: 10px; }',
      '.ze-sa-actions button { padding: 10px 20px; border-radius: 999px; border: none; cursor: pointer; font-weight: 600; font-size: 13px; font-family: inherit; transition: .15s; display: inline-flex; align-items: center; gap: 6px; }',
      '.ze-sa-cancel { background: transparent; color: var(--text-muted); }',
      '.ze-sa-cancel:hover { background: #F1F2F4; color: var(--text); }',
      '.ze-sa-submit { background: var(--brand); color: #fff; }',
      '.ze-sa-submit:hover { background: var(--brand-hover); }',
      '.ze-sa-submit:disabled { background: #C8CCD0; cursor: not-allowed; }'
    ].join('\n');
    document.head.appendChild(style);

    var overlay = document.createElement('div');
    overlay.className = 'ze-sa-overlay';
    overlay.id = 'zeSaTopupOverlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = [
      '<div class="ze-sa-modal" role="document">',
      '  <div class="ze-sa-head">',
      '    <span class="ico"><i data-lucide="wallet" class="w-4 h-4"></i></span>',
      '    <div>',
      '      <div class="ze-sa-title">Add top-up to site wallets</div>',
      '      <div class="ze-sa-sub">Direct credit · no approval cycle</div>',
      '    </div>',
      '    <button type="button" class="close-x" id="zeSaTopupClose" aria-label="Close"><i data-lucide="x" class="w-4 h-4"></i></button>',
      '  </div>',
      '  <div class="ze-sa-body">',
      '    <div class="ze-sa-field">',
      '      <label for="zeSaAmt">Amount per site<span class="req">*</span></label>',
      '      <div class="ze-sa-amt-wrap">',
      '        <span class="currency">₹</span>',
      '        <input id="zeSaAmt" type="text" inputmode="numeric" autocomplete="off" placeholder="0" maxlength="12"/>',
      '      </div>',
      '      <div class="ze-sa-helper"><span>Up to ₹50,00,000 per site</span><span id="zeSaAmtPretty"></span></div>',
      '    </div>',
      '    <div class="ze-sa-field">',
      '      <label for="zeSaReason">Reason / memo</label>',
      '      <textarea id="zeSaReason" rows="2" maxlength="300" placeholder="Q2 budget refresh, contingency for monsoon repairs, etc."></textarea>',
      '    </div>',
      '    <div class="ze-sa-field">',
      '      <label>Sites<span class="req">*</span></label>',
      '      <div class="ze-sa-quick" id="zeSaQuick">',
      '        <button type="button" data-q="all">All sites</button>',
      '        <button type="button" data-q="none">Clear</button>',
      '        <button type="button" data-q="south">South cluster</button>',
      '        <button type="button" data-q="north">North cluster</button>',
      '        <button type="button" data-q="west">West cluster</button>',
      '        <button type="button" data-q="east">East cluster</button>',
      '      </div>',
      '      <div class="ze-sa-sites" id="zeSaSitesGrid"></div>',
      '    </div>',
      '  </div>',
      '  <div class="ze-sa-foot">',
      '    <div class="summary" id="zeSaSummary">Select at least one site</div>',
      '    <div class="ze-sa-actions">',
      '      <button type="button" class="ze-sa-cancel" id="zeSaCancel">Cancel</button>',
      '      <button type="button" class="ze-sa-submit" id="zeSaSubmit" disabled><i data-lucide="check" class="w-4 h-4"></i> Add top-up</button>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n');
    document.body.appendChild(overlay);

    // ----- wiring -----
    var amtInput = document.getElementById('zeSaAmt');
    var amtPretty = document.getElementById('zeSaAmtPretty');
    var reasonInput = document.getElementById('zeSaReason');
    var sitesGrid = document.getElementById('zeSaSitesGrid');
    var quickWrap = document.getElementById('zeSaQuick');
    var summary = document.getElementById('zeSaSummary');
    var submitBtn = document.getElementById('zeSaSubmit');
    var cancelBtn = document.getElementById('zeSaCancel');
    var closeBtn = document.getElementById('zeSaTopupClose');

    var state = { selected: new Set(), amount: 0 };

    function fmtINR(n) {
      if (typeof DB.fmtINR === 'function') return DB.fmtINR(n);
      return '₹' + Number(n||0).toLocaleString('en-IN');
    }
    function getAmount() {
      var raw = (amtInput.value || '').replace(/[^0-9]/g, '');
      return raw ? parseInt(raw, 10) : 0;
    }
    function updateSummary() {
      var n = state.selected.size;
      var amt = state.amount;
      if (n === 0 || amt <= 0) {
        summary.innerHTML = 'Select at least one site' + (amt > 0 ? '' : ' and an amount');
        submitBtn.disabled = true;
      } else {
        var total = n * amt;
        summary.innerHTML = '<strong>' + n + ' site' + (n===1?'':'s') + '</strong> × ' + fmtINR(amt) + ' = <strong>' + fmtINR(total) + '</strong>';
        submitBtn.disabled = false;
      }
    }
    function renderSites() {
      var sites = (window.DB && Array.isArray(DB.SITES)) ? DB.SITES : [];
      sitesGrid.innerHTML = sites.map(function(s){
        var checked = state.selected.has(s.id) ? 'checked' : '';
        return '<label class="ze-sa-site"><input type="checkbox" data-site="' + s.id + '" ' + checked + '/>' +
          '<span class="nm" title="' + (s.name||'') + '">' + (s.name||'') + '</span>' +
          '<span class="meta">' + (s.cluster ? s.cluster.toUpperCase() : '') + '</span></label>';
      }).join('');
    }

    sitesGrid.addEventListener('change', function(e){
      var cb = e.target.closest('input[type="checkbox"][data-site]');
      if (!cb) return;
      var id = cb.getAttribute('data-site');
      if (cb.checked) state.selected.add(id);
      else state.selected.delete(id);
      updateSummary();
    });
    quickWrap.addEventListener('click', function(e){
      var b = e.target.closest('button[data-q]');
      if (!b) return;
      var q = b.getAttribute('data-q');
      var sites = (window.DB && Array.isArray(DB.SITES)) ? DB.SITES : [];
      if (q === 'all') sites.forEach(function(s){ state.selected.add(s.id); });
      else if (q === 'none') state.selected.clear();
      else sites.forEach(function(s){ if (s.cluster === q) state.selected.add(s.id); else state.selected.delete(s.id); });
      renderSites();
      updateSummary();
    });
    amtInput.addEventListener('input', function(){
      var raw = (amtInput.value||'').replace(/[^0-9]/g,'');
      var n = raw ? parseInt(raw, 10) : 0;
      if (n > 5000000) { n = 5000000; raw = '5000000'; }
      amtInput.value = raw ? Number(n).toLocaleString('en-IN') : '';
      amtPretty.textContent = n > 0 ? '= ' + fmtINR(n) : '';
      state.amount = n;
      updateSummary();
    });
    function close() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
    cancelBtn.addEventListener('click', close);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function(e){ if (e.target === overlay) close(); });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && overlay.classList.contains('open')) close();
    });
    submitBtn.addEventListener('click', function(){
      var amt = state.amount;
      var ids = Array.from(state.selected);
      if (!amt || !ids.length) return;
      submitBtn.disabled = true;
      var created = (window.ZE && ZE.topup && ZE.topup.addDirect)
        ? ZE.topup.addDirect({ siteIds: ids, amount: amt, reason: (reasonInput.value||'').trim() })
        : [];
      submitBtn.disabled = false;
      // Toast
      var msg = 'Top-up added to ' + created.length + ' site' + (created.length===1?'':'s') + ' · ' + fmtINR(amt) + ' each';
      var t = document.getElementById('toast');
      if (t) {
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(window.__zeSaToastT);
        window.__zeSaToastT = setTimeout(function(){ t.classList.remove('show'); }, 2400);
      }
      close();
    });

    // expose render so opener can refresh + preselect
    overlay._render = renderSites;
    overlay._preselect = function(siteIds){
      state.selected = new Set((siteIds || []).filter(Boolean));
      state.amount = 0;
      amtInput.value = '';
      amtPretty.textContent = '';
      reasonInput.value = '';
      renderSites();
      updateSummary();
    };

    if (window.lucide && window.lucide.createIcons) try { window.lucide.createIcons(); } catch(e){}
  }

  function openSuperAdminTopupModal(opts) {
    opts = opts || {};
    _zeEnsureSuperAdminTopupModal();
    var overlay = document.getElementById('zeSaTopupOverlay');
    if (!overlay) return;
    if (overlay._preselect) overlay._preselect(opts.siteIds || []);
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function(){ var inp = document.getElementById('zeSaAmt'); if (inp) inp.focus(); }, 60);
    if (window.lucide && window.lucide.createIcons) try { window.lucide.createIcons(); } catch(e){}
  }
  // Expose globally so any page can trigger it
  if (typeof window !== 'undefined') {
    window.ZEOpenSuperAdminTopupModal = openSuperAdminTopupModal;
  }

