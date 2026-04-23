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
      const v = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
      if (!v || typeof v !== 'object' || !v.id || !v.role) return null;
      return v;
    } catch (e) { return null; }
  }
  function userWrite(u) {
    if (u == null) {
      localStorage.removeItem(USER_KEY);
    } else {
      localStorage.setItem(USER_KEY, JSON.stringify(u));
    }
    emit('user:change', u);
  }
  function userIsSignedIn() { return !!userRead(); }
  function userRole() { const u = userRead(); return u ? u.role : null; }
  function userSignIn(id, role) {
    if (!id || (role !== 'buyer' && role !== 'vendor')) {
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
        return (Array.isArray(DB.USERS) ? DB.USERS.find(x => x.id === u.id) : null) || null;
      }
      if (u.role === 'vendor') {
        return (Array.isArray(DB.VENDORS) ? DB.VENDORS.find(x => x.id === u.id) : null) || null;
      }
    } catch (e) { /* ignore */ }
    return null;
  }
  function userRequireRole(role, redirect) {
    redirect = redirect || 'login_1.html';
    const u = userRead();
    const ok = !!u && u.role === role;
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
    return u && u.role === 'vendor' ? u.id : null;
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
      pendingApprovalsFor: ordersPendingApprovalsFor
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
