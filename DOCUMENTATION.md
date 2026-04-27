# ZooEnrich — Product Documentation

**Status:** Living document — reflects the prototype as of 2026-04-27
**Audience:** Engineering, design, product, support, prospective hires
**Companion:** `PRD.md` (the *why*); this doc covers the *what* and *how*

---

## Table of Contents

1. [Overview](#1-overview)
2. [Information Architecture](#2-information-architecture)
3. [Personas & Roles](#3-personas--roles)
4. [Screen Reference](#4-screen-reference)
5. [Core Flows](#5-core-flows)
6. [Data Model](#6-data-model)
7. [State, Storage & Persistence](#7-state-storage--persistence)
8. [Design System](#8-design-system)
9. [Technical Architecture](#9-technical-architecture)
10. [Conventions & Gotchas](#10-conventions--gotchas)
11. [How to Extend the Prototype](#11-how-to-extend-the-prototype)
12. [Glossary](#12-glossary)

---

## 1. Overview

ZooEnrich is a **two-sided marketplace prototype** for animal-enrichment products: things like puzzle feeders, scent boxes, climbing rigs and ice treats that zoos give their animals to keep them mentally stimulated.

Two roles meet on the platform:

- **Buyers** — biologists, keepers, vets, curators inside a zoo
- **Vendors** — small specialist makers who fulfil the order
- (plus **approvers** and **admins**, who are buyers with elevated permissions)

The prototype is a **no-build static web app**: plain HTML, vanilla JavaScript, Tailwind via CDN. Open any `*_1.html` file in a browser and it runs. State lives on `window.DB` (seeded data) and `localStorage` (per-user cart, saved items, orders, custom attributes).

There are **35 screens** in the prototype, covering the full marketplace surface from onboarding to returns, on both sides of the table.

---

## 2. Information Architecture

### 2.1 Sitemap (top-level)

```
ZooEnrich
├── Public
│   └── login_1.html               (role + identity picker)
│
├── Buyer surface (zoo staff)
│   ├── index_1.html               (catalogue / shop)
│   ├── product_detail_1.html      (one product)
│   ├── cart_1.html                (per-line cart)
│   ├── checkout_1.html            (address, shipping, submit)
│   ├── order_confirmation_1.html  (post-submit)
│   ├── orders_1.html              (my orders list)
│   ├── order_detail_1.html        (one order, with tracking)
│   ├── saved_1.html               (wishlist)
│   ├── customise_product_1.html   (custom-build request)
│   ├── returns_buyer_1.html       (my returns)
│   ├── chat_1.html                (vendor ↔ buyer messages)
│   └── profile_1.html             (account, sites, addresses)
│
├── Approver surface (overlay on buyer)
│   └── approvals_1.html           (orders + catalog items needing my sign-off)
│
├── Vendor surface
│   ├── vendor_onboarding_1.html   (KYC + first product wizard)
│   ├── vendor_dashboard_1.html    (home: orders, GMV, alerts)
│   ├── vendor_products_1.html     (product list)
│   ├── vendor_add_product_1.html  (add / edit product)
│   ├── vendor_orders_1.html       (order inbox)
│   ├── vendor_order_detail_1.html (one order — accept, ship, track)
│   ├── vendor_store_1.html        (public-facing store)
│   ├── vendor_analytics_1.html    (charts: orders, GMV, top species, top buyers)
│   ├── vendor_notifications_1.html
│   ├── returns_vendor_1.html      (RMA inbox)
│   └── vendor_profile_1.html
│
└── Admin surface
    ├── admin_products_1.html      (catalogue moderation list)
    ├── admin_product_detail_1.html
    ├── admin_add_product_1.html
    ├── attribute_library_1.html   (manage attribute schemas)
    └── analytics dashboards (in admin_*)
```

### 2.2 Header / global chrome

The buyer surface uses a **sticky header** with: search, *Orders*, *Saved*, *Cart* (with badge), avatar dropdown.
The vendor surface uses a separate left rail with: Dashboard, Products, Orders, Returns, Analytics, Notifications, Store, Profile.

---

## 3. Personas & Roles

The data model (`DB.USERS`) defines seven roles. They map onto three permission planes (buyer / approver / admin) and one orthogonal axis (vendor).

| Role | Title (typical) | Buyer? | Can self-purchase? | Approves orders? | Approves catalogue? |
|---|---|---|---|---|---|
| `biologist` | Senior Biologist | ✓ | usually ✓ | ✓ for their juniors | — |
| `keeper` | Primate / Big-cat Keeper | ✓ | ✗ | — | — |
| `vet` | Senior Veterinarian | ✓ | ✓ | safety override | safety override |
| `curator` | Curator of Animal Care | ✓ | ✓ | top-tier | ✓ |
| `lab_manager` | Enrichment Lab Manager | ✓ | ✓ | for lab techs | — |
| `lab_tech` | Lab Technician | ✓ | ✗ | — | — |
| `admin` | Site Director | ✓ | ✓ | top-tier | ✓ |

Two boolean flags on each user drive the gates:
- `canPurchase` — submitted orders self-route to vendor (true) or to approver (false)
- `approverId` — fk to the user who must sign off if `canPurchase === false`

A user can also be associated with one or more **species** (`species: ['sp_tiger', ...]`) — keepers see only their species by default; biologists/curators see all.

Vendors live in a separate table (`DB.VENDORS`). The "vendor" role isn't a USER role — it's a separate identity dimension. A user can act as buyer **or** vendor; the active surface is determined by who they signed in as.

---

## 4. Screen Reference

This section walks every screen, grouped by surface. Each entry: file, purpose, key interactions, state it reads/writes, notable patterns.

### 4.1 Buyer surface

#### 4.1.1 `login_1.html` — Identity picker
- Picks a role and a specific user from the seeded list, plus the active site (for multi-site users).
- Writes the choice to `localStorage` via `ZE.user.signIn(...)`.
- Auto-redirects to `/index_1.html` on selection.

#### 4.1.2 `index_1.html` — Shop
- **Layout:** sticky top header + sub-bar; left **Filters** rail, right product grid.
- **Filters:** species, category, tags, attribute filters (dynamic — surfaces only attributes used by visible products).
- **Sub-bar:** active species lens chip, category pills, sort dropdown.
- **Hero banner** + curated row ("Popular this week"), then the full grid.
- **Card actions:** save (♥), add-to-cart, opens product detail on click.
- **Add-to-cart UX:** opens a *species + enclosure* modal (the line is fully configured before it lands in cart).
- **Reads:** `DB.PRODUCTS`, `DB.CATEGORIES`, `DB.TAGS`, `DB.SPECIES`, `ZE.user.resolve()`.
- **Writes:** cart and saved via `ZE.cart.*`, `ZE.saved.*`.

#### 4.1.3 `product_detail_1.html`
- Image gallery + zoom; specs table built from the product's `attributes[]` against `ATTRIBUTES`; compatible-species chip row.
- Vendor mini-card with link to vendor store.
- Reviews list with verified-buyer badge and vendor reply.
- Sticky CTA (info-panel last child, no transform ancestors — see §10).
- "Customise this" jumps to `customise_product_1.html` with this product as seed.

#### 4.1.4 `cart_1.html` — Per-line cart
- Each line carries: productId, qty, vendorId (overridable), speciesId, enclosureId, optional note.
- Lines are visually grouped by vendor for shipping calc.
- Inline setters on every line: vendor picker, *Select species* CTA, enclosure dropdown.
- Sticky bottom bar shows subtotal + Proceed to checkout.

#### 4.1.5 `checkout_1.html`
- Address block (defaulted to user's `siteId` shipping address; multi-site users can switch).
- Shipping speed: Standard / Express (changes shipping fee).
- Approval banner if `!user.canPurchase` ("This order will be sent to *Dr. Rao* for approval").
- Submit triggers `ZE.orders.submit(...)`.

#### 4.1.6 `order_confirmation_1.html`
- Post-submit thank-you with order number, expected next step (depends on `requiresApproval`).
- Deep links: View order, Continue shopping.

#### 4.1.7 `orders_1.html` / `order_detail_1.html`
- List view: my orders with status pill, date, vendor, total.
- Detail view: status timeline (placed → confirmed → shipped → delivered), items, tracking link (built from `CARRIERS[].urlTemplate`), invoice download stub.
- Buyer actions: Initiate return, Reorder, Cancel (only if state allows).

#### 4.1.8 `saved_1.html` — Wishlist
- Mirrors product card from index but read-only (no filters). Move-to-cart and remove actions.

#### 4.1.9 `customise_product_1.html` — Custom request
- Same form pattern as vendor add-product, but submits a buyer-side **request** (matched to vendors later).
- Description field is mandatory (vs optional on the admin/vendor add-product screens).

#### 4.1.10 `returns_buyer_1.html`
- My returns list + initiate-return flow with reason picker and photo upload.

#### 4.1.11 `chat_1.html`
- Per-order or per-vendor messaging. Threaded; reads/writes a per-user thread store in `localStorage`.

#### 4.1.12 `profile_1.html`
- Personal info, sites, default shipping address, notification preferences.

### 4.2 Approver surface

#### 4.2.1 `approvals_1.html`
- One inbox for two queues: **orders awaiting my sign-off** and **new catalogue items awaiting moderation** (admin only).
- Order rows: buyer, items count, total, requested date, *Approve / Reject* buttons, reject opens reason dialog.
- Filters: status, buyer, date range.

### 4.3 Vendor surface

#### 4.3.1 `vendor_onboarding_1.html`
- Multi-step wizard: business info → KYC → bank → return policy → first product.
- Persists to a draft vendor record; admin must approve before listing goes live.

#### 4.3.2 `vendor_dashboard_1.html`
- KPI strip (orders this week, GMV, returns, average rating).
- Recent orders, low-stock alerts, pending RMAs.

#### 4.3.3 `vendor_products_1.html`
- Table: name, category, vendor SKU, price, stock, status pill (published / pending / rejected).
- Bulk actions: publish, unpublish, delete.

#### 4.3.4 `vendor_add_product_1.html`
- Form: name → categories (single dropdown) + tags (multi-pick) → species → attributes (driven by category schema) → pricing/labour → stock → images.
- (Distinct from `admin_add_product_1.html`, which uses a unified-taxonomy chip row split into Categories + Tags as of 2026-04-27.)

#### 4.3.5 `vendor_orders_1.html` / `vendor_order_detail_1.html`
- Inbox of incoming orders. State machine: *placed* → *confirmed* → *packed* → *shipped* → *delivered*.
- Vendor can also: counter-offer (price / ETA / partial qty), decline with reason.
- Tracking entry: pick carrier from `CARRIERS`, enter AWB, public URL is built from `urlTemplate`.

#### 4.3.6 `vendor_store_1.html`
- Public-facing vendor profile. Bio, cover image, products, reviews, ratings.

#### 4.3.7 `vendor_analytics_1.html`
- Charts: orders over time, GMV, top species by GMV, top buyers, return rate.

#### 4.3.8 `vendor_notifications_1.html`
- Per-vendor inbox of system events (new order, return raised, low stock, review posted).

#### 4.3.9 `returns_vendor_1.html`
- RMA inbox. Approve full / approve partial / reject. Replace creates a new linked order.

#### 4.3.10 `vendor_profile_1.html`
- Edit vendor identity, return policy, bank, KYC status.

### 4.4 Admin surface

#### 4.4.1 `admin_products_1.html`
- All products across all vendors. Filter by vendor, category, status. Bulk moderation actions.

#### 4.4.2 `admin_product_detail_1.html`
- Same as product_detail but with admin override actions: force-unpublish, edit any field, reassign vendor.

#### 4.4.3 `admin_add_product_1.html`
- Admin can create products on behalf of any vendor. Form mirrors vendor's, with a vendor-picker on top.
- **Categories** and **Tags** are now two separate chip rows (each with its own *+ Add category* / *+ Add tag* CTA, opening a kind-filtered side sheet).
- **Description** is a single 280-char textarea below the product name.

#### 4.4.4 `attribute_library_1.html`
- Manage `ATTRIBUTES` and the per-category `categoryAttributeSchema` (which attributes are mandatory in which category).

---

## 5. Core Flows

### 5.1 Add-to-cart with species + enclosure

```
[Index card] ──Add──► [Species/enclosure modal]
                               │
                               ├─ pre-fill species from active lens (if any)
                               ├─ pre-fill enclosure from user's siteId default
                               └─ on confirm → ZE.cart.addLine({ productId, qty:1, vendorId, speciesId, enclosureId })
                                                        │
                                                        └─► [Cart drawer / cart_1.html]
```

The modal exists because **a cart line without species + enclosure is unusable** for fulfilment — the vendor doesn't know which animal it's for, the keeper doesn't know which enclosure to deliver to. Configuring at add-time avoids messy "fill these in later" UX.

### 5.2 Submit → Approval → Vendor

```
[Cart] → [Checkout] → submit
          │
          ├─ user.canPurchase? ── yes ──► ORDER.status = 'placed'
          │                               ORDER.requiresApproval = false
          │                               (goes straight to vendor inbox)
          │
          └─ no ─► ORDER.status = 'pending_approval'
                   ORDER.approverId = user.approverId
                   (lands in approver's inbox)
                              │
                              ├─ approve ──► status = 'placed'
                              │             approvedAt = now
                              │             auto-flow to vendor
                              │
                              └─ reject ──► status = 'rejected'
                                            rejectReason = ...
                                            buyer notified
```

### 5.3 Vendor order lifecycle

```
placed → confirmed → packed → shipped → delivered
          │              │       │           │
          ↓              ↓       ↓           ↓
       (vendor       (vendor   (carrier    (buyer
        accepts)      packs)    AWB)        marks
                                            received)

at any point: vendor can cancel with reason
              buyer can cancel before 'shipped'
              buyer can initiate return after 'delivered'
```

### 5.4 Return / RMA

```
[order_detail] → Initiate return
                 │
                 └─► reason + photos + qty
                            │
                            └─► RMA created, status = 'return_requested'
                                vendor sees on returns_vendor_1
                                          │
                                          ├─ approve full → refund (PO note) | replace (new linked order)
                                          ├─ approve partial → partial refund
                                          └─ reject + reason
```

### 5.5 Custom-build request

```
[customise_product] → buyer fills brief (species, enclosure, budget, refs)
                       │
                       └─► request published; system matches by category × species
                                      │
                                      └─► matched vendors quote
                                                   │
                                                   └─► buyer accepts one quote
                                                              │
                                                              └─► quote → standard order
```

### 5.6 Vendor onboarding

```
[login → vendor] → [onboarding wizard]
                    business info → KYC → bank → return policy → first product
                                                                    │
                                                                    └─► admin moderation → published
```

---

## 6. Data Model

All entities live on `window.DB` (seeded by `data.js`). The shapes below are the canonical contract.

### 6.1 SPECIES

```js
{ id, name, latin, taxon, imgQ, seed, count }
```
- `imgQ` + `seed` → deterministic image URL via `DB.img(q, w, h, seed)`.
- `count` is the number of individual animals across all sites (display-only).

### 6.2 SITES (zoo facilities)

```js
{ id, name, city, state, pincode, addressLine1 }
```
- 10 seeded facilities across India.

### 6.3 ENCLOSURES

```js
{ id, siteId, name, type, speciesIds: [] }
```
- `type ∈ { 'outdoor', 'indoor', 'water', 'aerial', 'nocturnal' }`
- An enclosure can house multiple species.

### 6.4 USERS

```js
{
  id, name, role, title,
  species: [],        // species this user is responsible for
  siteId,             // home facility
  additionalSites: [],// other facilities they can act for
  email, phone,
  canPurchase,        // boolean
  approverId,         // fk to USER, null if top-tier
  seed                // for avatar generation
}
```

### 6.5 VENDORS

```js
{
  id, name, tagline,
  city, state,
  rating, orders, yearFounded,
  returnPolicy,
  logoQ, seed,        // logo image
  coverQ, coverSeed   // store cover image
}
```

### 6.6 CATEGORIES + TAGS

```js
CATEGORY: { id, name, icon, count, imgQ, seed }
TAG:      { id, name, color }
```
- Categories represent *what kind of thing it is* (Scent Boxes, Puzzle Feeders).
- Tags represent *what behaviour it elicits* (Sensory, Cognitive, Physical, Social, Food).
- A product belongs to **one category** and **one or more tags**.

### 6.7 ATTRIBUTES + per-category schema

```js
ATTRIBUTE: { id, name, type, options?, unit?, icon? }
// type ∈ 'select' | 'multi_select' | 'number' | 'boolean' | 'color'

categoryAttributeSchema = {
  cat_scent: [
    { id: 'attr_size',     mandatory: true },
    { id: 'attr_material', mandatory: true },
    { id: 'attr_scent',    mandatory: true },
    { id: 'attr_duration', mandatory: false }
  ],
  // ...
}
```

The schema drives **which attributes appear (and which are required)** when adding a product in that category.

### 6.8 PRODUCTS

```js
{
  id, name, description,
  cat, tags: [],                   // fks
  vendorId,                        // fk
  compatibleSpecies: [],           // species fks
  attributes: [{ id, value }],     // canonical; the spec table is built from this
  specs: { [attrId]: value },      // legacy mirror, kept for older screens
  price: { material, labor, effortHrs },
  stock,
  stars, uses, engagement,         // social-proof / engagement metrics
  safety,                          // 'safe' | 'review' | 'unsafe'
  hot,                             // boolean — surfaces in "popular" curation
  img, imgSmall, gallery: [],
  imgQ, seed,                      // image generation hints
  submittedBy,                     // user fk
  createdAt,
  status                           // 'published' | 'pending_review' | 'rejected'
}
```

Notes:
- `price.material + price.labor = unit price`. `effortHrs` is a separate display-only field.
- `gallery[]` is the primary image source; `img` and `imgSmall` are convenience derivations.
- `specs` and `attributes` mirror each other. Newer code reads `attributes`; older detail screens read `specs`. Both stay in sync at write time.

### 6.9 ORDERS

```js
{
  id, createdAt, createdBy,        // user fk
  species, speciesId,              // primary species (display)
  siteId, enclosureId,
  requiresApproval, approvalStatus,// 'pending' | 'approved' | 'rejected' | null
  approverId, approvedAt, rejectReason,
  vendorId,                        // primary vendor (display; line vendor lives on items)
  vendorResponse: { respondedAt, ... } | null,
  items: [
    { productId, qty, config: { size?, scent?, ... } }
  ],
  subtotal, shippingMethod, shippingFee, total,
  status,                          // 'placed' | 'pending_approval' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'return_requested' | 'returned' | 'rejected'
  priority,                        // 'Normal' | 'High' | 'Urgent'
  notes,
  shippingAddress: { name, site, line1, line2, city, state, pincode, phone },
  tracking: { carrier, number, url, eta, events: [] },
  source                           // 'demo' | 'user'
}
```

The `tracking.events[]` array is the single source of truth for the order timeline.

### 6.10 CARRIERS

```js
{ id, name, urlTemplate, prefix }
// urlTemplate = 'https://www.bluedart.com/tracking?awb={number}'
// vendor enters AWB → URL = urlTemplate.replace('{number}', awb)
```

### 6.11 REVIEWS

```js
{ id, productId, buyerId, stars, text, createdAt, vendorReply?: { text, at } }
```

### 6.12 PENDING (catalogue moderation queue)

```js
{ id, name, cat, tags, submittedBy, reason, imgQ, seed, daysPending, flags: [] }
```

### 6.13 Entity relationships (pictorial)

```
SITE ─┬─◄ ENCLOSURE
      └─◄ USER ─┬─► (approverId) USER
                ├─► (species[]) SPECIES
                └─► creates ORDER

VENDOR ─┬─► PRODUCT ──┬─► (cat) CATEGORY
        │             ├─► (tags[]) TAG
        │             ├─► (compatibleSpecies[]) SPECIES
        │             └─► (attributes[]) ATTRIBUTE
        │
        └─► fulfils ORDER ──┬─► items[].productId → PRODUCT
                             ├─► (siteId) SITE
                             ├─► (enclosureId) ENCLOSURE
                             ├─► (createdBy / approverId) USER
                             └─► tracking.carrier → CARRIER

ORDER ─◄ REVIEW (one-to-many via productId, written after delivery)
ORDER ─◄ RETURN (zero-to-many)
```

---

## 7. State, Storage & Persistence

The prototype has no backend. State is split across three layers:

### 7.1 `window.DB` — seeded read-mostly data

`data.js` runs once on page load and writes every entity to `window.DB`. Pages read from it directly. New products created by the user are pushed into `DB.PRODUCTS` in memory; they **survive only until refresh**, with one exception:

### 7.2 `localStorage` — user state that must persist

| Key | Owner | Shape |
|---|---|---|
| `ze_active_user_v1` | `ZE.user` | `{ userId, role, siteId }` |
| `ze_cart_v3` | `ZE.cart` | `[{ productId, qty, vendorId, speciesId, enclosureId, note }]` |
| `ze_saved_v1` | `ZE.saved` | `[productId, ...]` |
| `ze_orders_v1` | `ZE.orders` | `[Order, ...]` (user-created; merged with `DB.DEMO_ORDERS` on read) |
| `ze_custom_attrs_v1` | `admin_add_product` | custom attribute defs created via UI |

### 7.3 `window.ZE` — shared helpers (`app.js`)

The single namespace for cross-screen behaviour. Surfaces:

```
ZE.cart       ── per-line cart API (read, addLine, setLineQty/Species/Vendor/Enclosure, …)
ZE.saved      ── wishlist API (read, has, add, remove, toggle, count, clear)
ZE.orders     ── orders API (read, byId, submit, setStatus, advanceStatus, cancel, respondAsVendor, …)
ZE.user       ── user session (signIn, signOut, resolve, switchSite, …)
ZE.emit/on    ── tiny pub/sub for cross-screen sync (e.g., 'cart:change', 'orders:change')
```

Pages re-render on relevant events instead of polling.

---

## 8. Design System

### 8.1 Tokens

`tokens.css` defines the canonical palette and spacing. Brand assets sourced from *Antz Colours.pdf* and *Antz Typography.pdf* (in repo root).

Key tokens:
- `--brand` (primary green)
- `--brand-hover`, `--brand-dark`
- `--bg`, `--surface`, `--card`
- `--text`, `--text-muted`, `--text-subtle`
- `--border`, `--border-soft`
- `--danger`, `--warn`, `--success`

### 8.2 Component patterns

| Pattern | Where it lives | Notes |
|---|---|---|
| Sticky CTA bar | every product/cart/checkout | `position: sticky` as **last child** of `.info-panel` (no transform ancestors — see §10) |
| Side sheet | admin + vendor add-product, product detail | overlay + translateX-in panel; `aria-hidden` toggling, body scroll lock |
| Chip row with `+ Add` | categories, tags, species, attributes on add-product | `tx-wrap` container, `tx-chip` items, dashed `tx-add` button |
| Empty state | every list view | icon + headline + sub-copy + primary action |
| Status pill | orders, products, returns | colour driven by status enum |
| Toast | every screen | `#toast` element + 2.4s auto-dismiss |
| Drop zone | image uploader | drag-and-drop + click-to-browse; ≤ 4MB per image, ≤ 20 images |

### 8.3 Iconography

[Lucide](https://lucide.dev) via CDN. Re-render after every DOM mutation: `if (window.lucide?.createIcons) window.lucide.createIcons();`

### 8.4 Imagery

The prototype uses [Pollinations](https://image.pollinations.ai) for deterministic generated images: `DB.img(prompt, w, h, seed)`. Production will replace these with vendor-uploaded photos.

---

## 9. Technical Architecture

### 9.1 Stack

| Layer | Choice | Why |
|---|---|---|
| Markup | Plain HTML5 | No build, no framework, scans fast |
| Styling | Tailwind CDN + `tokens.css` overrides | Fast iteration, Antz brand applied via tokens |
| Behaviour | Vanilla JS | Zero dependency surface; runs in any browser |
| Data | `data.js` + `localStorage` | Demo-only; backend follows in v1 build |
| Hosting | Vercel (static) | Free, instant, custom domain ready |

### 9.2 File layout

```
Enrichment/
├── index.html                      (redirect to login_1.html)
├── *_1.html                         (35 screens — see §2)
├── data.js                          (seeded DB)
├── app.js                           (ZE.* helpers)
├── tokens.css                       (design tokens)
├── DOCUMENTATION.md                 (this file)
├── PRD.md                           (requirements)
├── Antz Colours.pdf, Antz Typography.pdf
├── Product Images/                  (legacy assets)
└── .superdesign/design_iterations/  (canonical Super Design output;
                                      mirrored to repo root for Vercel)
```

### 9.3 Mirror & deploy

Two copies of every screen exist:
1. `.superdesign/design_iterations/<file>.html` — canonical, written by the Super Design VS Code extension
2. `<file>.html` at repo root — deployment mirror (Vercel hides dot-prefixed paths)

When editing a screen, update both. The local dev server (Python `http.server` on port 8765) is rooted in `.superdesign/design_iterations/` for compatibility with the extension's preview.

### 9.4 Vercel notes

- Vercel hides paths starting with `.` (so `.superdesign/...` is unreachable from the deployed site). The mirror at root solves this.
- A "404" from Vercel is most often **401 Deployment Protection** — confirm with `curl -I` before debugging routes.
- `index.html` at root redirects to `login_1.html`.

### 9.5 Local development

```
# from repo root
python3 -m http.server 8765 --directory .superdesign/design_iterations
# open http://localhost:8765/login_1.html
```

For Playwright screenshots in agentic workflows: `npx playwright …` plus the `/tmp/node_modules` symlink (see Conventions §10.5).

---

## 10. Conventions & Gotchas

### 10.1 Sticky CTAs and transform ancestors

`position: sticky` **silently fails** if any ancestor has a `transform`, `filter`, `perspective`, or `will-change` property. Use `position: sticky` only as a direct child of `.info-panel`-style untransformed containers, and as the **last child** so it sticks to the bottom on scroll-up.

### 10.2 The `categoryAttributeSchema` is the contract

When adding new attributes or categories, update `categoryAttributeSchema` in `data.js` first. The add-product forms read this to decide which attribute fields to render and which are mandatory. Forgetting this leaves attributes orphaned.

### 10.3 Two product mirrors: `attributes[]` vs `specs{}`

Older detail screens read `product.specs` (an object keyed by attribute id). Newer screens read `product.attributes[]` (an array of `{ id, value }`). Always write **both** when creating/updating a product so all screens stay consistent.

### 10.4 Per-line cart vs legacy cart

There are leftover `cartAdd` / `cartSet` / `cartRemove` helpers on `ZE.cart` that operate on (productId, qty) tuples. **Do not use them** for new code. The canonical line-item API is `cartAddLine`, `cartSetLineQty`, `cartSetLineVendor`, `cartSetLineSpecies`, `cartSetLineEnclosure`, `cartSetLineNote`, `cartIncLine`, `cartRemoveLine`.

### 10.5 Tooling on macOS

- **No `jq`** — use `/usr/bin/python3 -c "import json, sys; ..."` for JSON parsing.
- **Playwright** runs via `npx`; symlink `/tmp/node_modules` into the project to skip per-run install.
- The dev-only **device bar** has been removed globally; do not reintroduce it.

### 10.6 Image generation in the prototype

Images come from `https://image.pollinations.ai/prompt/{prompt}?seed={seed}`. The seed is deterministic so the same prompt always returns the same image — but the URL is **not cached** by Pollinations indefinitely. If you see broken images, refresh the page; the URL itself doesn't change.

### 10.7 No new files unless asked

When iterating on a screen, prefer editing the existing `*_1.html` (or `*_1_N.html` for further iterations) over creating new files. The Super Design naming convention (`{name}_{n}.html`) is enforced by the extension.

### 10.8 Currency, units, locale

- All currency is INR, formatted as `₹X` with no thousands separator (prototype simplification).
- Weights in kg, dimensions in cm. Single-source from the attribute definition (`ATTRIBUTES[].unit`).
- Dates are absolute ISO strings in storage; relative ("3 days ago") only for display.

---

## 11. How to Extend the Prototype

### 11.1 Adding a new screen

1. Create `<name>_1.html` in `.superdesign/design_iterations/`.
2. Mirror to repo root (the deploy script does this; `cp` works for one-offs).
3. Include `tokens.css`, `data.js`, `app.js` in the head.
4. Use `ZE.user.resolve()` to gate role-specific UI.
5. If you add cross-screen state, extend `app.js` (`window.ZE.<area>`) — don't fork.

### 11.2 Adding a new product attribute

1. Add the row to `ATTRIBUTES` in `data.js`. Pick the right `type`.
2. If a category should require this attribute, add an entry in `categoryAttributeSchema`.
3. Update sample product entries in `productsRaw` so the demo shows non-empty values.
4. Verify on `vendor_add_product_1.html` and `admin_add_product_1.html` that the field appears and validates.

### 11.3 Adding a new category

1. Add to `CATEGORIES` (id, name, icon, count, imgQ, seed).
2. Add a `categoryAttributeSchema[<id>]` entry — even if just `[]` — so the form knows the schema.
3. Add at least one sample product so the empty-state on the index page doesn't dominate.

### 11.4 Adding a new vendor

1. Push to `VENDORS` with a unique id and full profile (logo, cover, return policy).
2. Mark some products as theirs by setting `productVendorMap[i] = '<vendor_id>'`.
3. The vendor store page renders automatically.

### 11.5 Adding a new role

1. Add to the role list in `USERS`.
2. Update the role table in §3 of this doc.
3. Decide gates: `canPurchase`, who their `approverId` is.
4. Update the role picker on `login_1.html`.
5. Update any role-aware UI (chiefly in `index_1.html` filters and the avatar dropdown).

---

## 12. Glossary

- **Approver** — a user who must sign off on another user's order before it leaves for the vendor. Defined by `user.approverId`.
- **AWB** — Air Waybill / shipment tracking number entered by vendor and combined with `CARRIERS[].urlTemplate`.
- **Buyer** — any zoo-side user who can place orders, including those who lack purchase authority.
- **CZA** — Central Zoo Authority of India. The accreditation and audit body.
- **Enclosure** — a specific habitat at a site (Tiger Outdoor Habitat A). Orders are tagged to one.
- **Enrichment** — items or activities given to captive animals to keep them mentally and physically engaged. The product class this whole platform sells.
- **Lab** — a zoo's in-house enrichment workshop. Treated as a vendor on the platform.
- **PO** — purchase order. ZooEnrich generates one on order confirmation; settlement happens off-platform in v1.
- **RMA** — return merchandise authorisation. The artifact created when a buyer initiates a return.
- **Site** — a zoo facility (e.g., Nehru Zoological Park). Has many enclosures and many staff.
- **Species lens** — a global filter that narrows the catalogue to products marked compatible with a chosen species.
- **Take rate** — platform commission on a fulfilled order. Target 8–12% in v1.
- **Vendor** — a verified maker / supplier of enrichment products. Listed under `DB.VENDORS`.

---

*End of documentation. For the *why* and the roadmap, see PRD.md.*
