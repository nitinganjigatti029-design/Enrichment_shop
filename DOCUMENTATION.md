# ZooEnrich — Project Documentation

> **A prototype e-commerce platform for zoo-animal enrichment products.**
> Built with plain HTML, Tailwind (CDN), and vanilla JavaScript. No build step, no framework — just open `index_1.html` in a browser.

---

## Table of Contents

1. [What is ZooEnrich?](#1-what-is-zooenrich)
2. [Who uses it?](#2-who-uses-it)
3. [How the site is organised](#3-how-the-site-is-organised)
4. [Pages in detail](#4-pages-in-detail)
5. [Key user journeys](#5-key-user-journeys)
6. [Design system](#6-design-system)
7. [Technical architecture](#7-technical-architecture)
8. [The data layer (`data.js`)](#8-the-data-layer-datajs)
9. [The shared helpers layer (`app.js`)](#9-the-shared-helpers-layer-appjs)
10. [Key design decisions and why](#10-key-design-decisions-and-why)
11. [How to extend the prototype](#11-how-to-extend-the-prototype)
12. [File reference](#12-file-reference)
13. [Change log — what this session delivered](#13-change-log--what-this-session-delivered)

---

## 1. What is ZooEnrich?

ZooEnrich is a **shopping and ordering platform for zoo-enrichment products** — the items zookeepers, biologists, and vets use to keep captive animals mentally and physically stimulated (puzzle feeders, scent sacks, climbing ropes, frozen treats, etc.).

Think Amazon, but every product is tagged to animal species, reviewed by biologists, and produced either by a third-party vendor or by the zoo's own internal "Enrichment Lab".

The goal of the prototype is to let a biologist or keeper:
- Browse a catalogue filtered by species, category, and product attributes.
- Add items to a cart.
- Submit the cart as a **lab ticket** (an internal production request).
- Track those tickets through submission → in-progress → completed.
- Save items to a wishlist for later.

---

## 2. Who uses it?

The platform is multi-role. Roles baked into the data model (`DB.USERS`):

| Role           | Example title           | What they do                                   |
|----------------|-------------------------|------------------------------------------------|
| `biologist`    | Senior Biologist        | Designs enrichment plans; submits tickets.     |
| `keeper`       | Primate Keeper          | Requests items for their assigned species.     |
| `vet`          | Senior Veterinarian     | Reviews safety of novel or risky items.        |
| `curator`      | Curator of Animal Care  | Approves products into the catalogue.          |
| `lab_manager`  | Enrichment Lab Manager  | Oversees production of the items.              |
| `lab_tech`     | Lab Technician          | Actually builds the items.                     |
| `admin`        | Site Director           | Full access; manages users, categories, etc.   |

Each user is associated with the species they're responsible for, so the catalogue can be filtered contextually ("show me items for my tigers").

---

## 3. How the site is organised

At the top level, the prototype exposes four main screens that are fully wired up:

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER (Search · Orders · Saved · Cart · Avatar)  [sticky]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌───────┐    ┌───────┐    ┌────────────┐   │
│  │  Shop        │ →  │ Product│ →  │ Cart  │ →  │  Orders    │   │
│  │ (index_1)    │    │ detail │    │(drawer│    │ (orders_1) │   │
│  └──────────────┘    └───────┘    └───────┘    └────────────┘   │
│         │                                                        │
│         └──→ ♥ Save ──→ ┌────────────┐                           │
│                         │  Saved     │                           │
│                         │ (saved_1)  │                           │
│                         └────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

Pages (all in `.superdesign/design_iterations/`):

| File                    | Purpose                                          |
|-------------------------|--------------------------------------------------|
| `index_1.html`          | Shop — product grid with filters & search        |
| `product_detail_1.html` | One product's full details                       |
| `saved_1.html`          | Wishlist / Saved-for-later                       |
| `orders_1.html`         | Submitted orders + their status                  |

Shared code: `data.js`, `app.js`, `tokens.css`.

---

## 4. Pages in detail

### 4.1 Shop (`index_1.html`)

The main browse page. **Dual-pane layout**: a sticky header + sub-bar on top, then two scrollable panes below.

```
┌───────────────────────────────────────────────────────────┐
│ ZooEnrich · [search]           Orders  ♥  Cart  Avatar    │ ← sticky header
├───────────────────────────────────────────────────────────┤
│ [Bengal Tiger ▼]  All · Sensory · Cognitive · …  [Sort ▼] │ ← sticky sub-bar
├───────────────────────────────────────────────────────────┤
│                  │                                         │
│   FILTERS        │   ┌───────────────────────────┐         │
│   (scrolls on    │   │       HERO BANNER          │        │
│    its own when  │   └───────────────────────────┘         │
│    hovered)      │                                         │
│                  │   Popular this week           See all →  │
│  + Add filter    │   ┌──┐ ┌──┐ ┌──┐ ┌──┐                   │
│  Cost range      │   │  │ │  │ │  │ │  │   ← product grid  │
│  Engagement      │   └──┘ └──┘ └──┘ └──┘                   │
│  Material        │                                         │
│  Durability      │   (scrolls on its own when hovered)     │
│  …               │                                         │
│                  │                                         │
└───────────────────────────────────────────────────────────┘
```

**Key interactions:**
- **Species dropdown** — narrows the catalogue to items compatible with the chosen species.
- **Inline category pills** — one-click filter by enrichment type (Sensory, Cognitive, Physical, Social, Food, Deals, Trending).
- **Sort** — Popular, Newest, Price, Top rated.
- **Dynamic filter sidebar** — built automatically from the attributes present in the products (see §8).
- **"+ Add filter"** — lets the user add a filter for any attribute in the library, and stubs a "Create new attribute" flow for admins.
- **Search** — debounced 150ms substring match on product name.
- **Add button** — outlined by default (just a green border); once clicked, the button swaps into a filled green "+/−" quantity stepper. This inversion lets users see at a glance what's in the cart.
- **Heart (♥)** — toggles the item into the wishlist, persisted in browser localStorage.
- **Load more** — paginates 12 products per click.

### 4.2 Product Detail (`product_detail_1.html`)

One product's full info: gallery, description, category/tag badges, per-product specs (size, material, duration, etc.), compatible species, configurable options, Add-to-Cart, and "Save for later".

Calls-to-action wired on this page:
- **Add to cart** / quantity stepper — `ZE.cart.add(id, n)`.
- **Save for later** (`#favBtn`) — toggles the item in `ZE.saved`. Button flips between "Save for later" ↔ "Saved" (filled heart).
- **Header Orders button** — navigates to `orders_1.html`.
- **Header ♥ button** — navigates to `saved_1.html` with a live count badge.
- **Header Cart button** — opens the cart drawer.

### 4.3 Saved (`saved_1.html`)

A wishlist page. Grid of items the user has ♥-saved.

- **Filter/sort sub-row**: Species, Category (only categories with saved items show up), Sort (Recently saved / Price / Rating).
- **Cards** look identical to the shop's, so behaviour is consistent — heart removes, Add button inverts to stepper.
- **"Add all to cart"** — bulk-adds every saved item.
- **"Clear saved"** — empties the wishlist after confirmation.
- **Undo toast** — after removing an item, a 4-second toast offers to undo the remove.
- **Empty state** — friendly illustration + "Browse enrichments" CTA.

### 4.4 Orders (`orders_1.html`)

A ticket-history page. Shows user-submitted orders (from `ZE.orders`) merged with 12 demo tickets (from `DB.TICKETS`), sorted newest first.

- **Tabs**: All · Submitted · In progress · Completed · Cancelled.
- **Order card**: ID (e.g. `ORD-0001` or `TKT-0042`), status chip, priority chip (if not Normal), species tag, item thumbnails, subtotal.
- **Actions per card**:
  - **Reorder** — repopulates the cart with the order's items and navigates back to the shop.
  - **View details** — expands the card, showing a full line-item table (product, config, qty, unit price, subtotal).
  - **Cancel** — only for user orders that are still submitted/in-progress.
- **Empty state** — "No orders yet · Submit a ticket and it'll appear here."

---

## 5. Key user journeys

### 5.1 Browse → Cart → Submit Ticket

1. User lands on `index_1.html`.
2. Selects their species (e.g. "Bengal Tiger") from the sub-bar dropdown.
3. Optionally filters by category ("Sensory") and attribute ("Material = Burlap").
4. Clicks **Add** on a product card — outline button morphs into a filled quantity stepper.
5. Opens the cart drawer (top-right), reviews items.
6. Clicks **Submit as lab ticket** — order is saved via `ZE.orders.submit()`, cart is cleared.
7. Navigates to Orders page and sees `ORD-0001` at the top with status *Submitted*.

### 5.2 Save for later → Reorder

1. User hearts a few products on the shop or detail page.
2. Clicks the ♥ in the header — navigates to `saved_1.html`.
3. Reviews saved items, filters by category if desired.
4. Clicks **Add all to cart** — every saved item is queued.
5. Returns to the shop, submits the cart as above.

### 5.3 View an older ticket → Reorder

1. User clicks **Orders** in the header.
2. Finds a completed ticket (e.g. `TKT-0042`).
3. Clicks **Reorder** — that ticket's items are added back to the cart.
4. Navigates to shop to review and submit.

---

## 6. Design system

### 6.1 Colour tokens (in `tokens.css`)

Defined as CSS custom properties on `:root`. Use these — **never hardcode hex values, and never use indigo or bootstrap blue** (project convention).

| Token                    | Meaning                        |
|--------------------------|--------------------------------|
| `--brand`                | Primary green (~#37BD69)       |
| `--brand-hover`          | Darker green for hover states  |
| `--brand-soft`           | Pale green backgrounds         |
| `--text`                 | Primary text                   |
| `--text-muted`           | Secondary text                 |
| `--text-subtle`          | Tertiary text                  |
| `--card`                 | Card background                |
| `--card-subtle`          | Alt card bg for nesting        |
| `--border`               | Default border                 |
| `--border-strong`        | Hover / focus border           |
| `--danger`               | Destructive red                |
| `--warning`              | Warning amber (stars)          |
| `--shadow-xs` … `-lg`    | Elevation shadows              |

### 6.2 Typography

Google Fonts; the default sans is Inter. For display headings, DM Sans or Plus Jakarta Sans are acceptable. No need to import — loaded via `tokens.css`.

### 6.3 Layout patterns

- **Page container**: `.page-wrap { max-width: 1400px; padding: 0 32px; }`
- **Dual-pane scroll** (shop page): header and sub-bar are sticky; the content below is fixed to `calc(100vh - header - subbar)`, with both the filter sidebar and the product grid being independent `overflow-y: auto` panes. Wheel scrolling respects whichever pane the mouse is over.
- **Card**: `background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 18px; box-shadow: var(--shadow-xs);`
- **Pill button**: rounded-full (`border-radius: 999px`), 40–48px height, 14–20px horizontal padding.
- **Images**: `.img-frame` class plus Pollinations AI URLs (see §7.3).

### 6.4 Icons

Lucide (`https://unpkg.com/lucide@latest/…`). Used as `<i data-lucide="icon-name"></i>`. Call `ZE.refreshIcons()` after dynamic insertion.

---

## 7. Technical architecture

### 7.1 Stack

- **HTML** — one static file per screen in `.superdesign/design_iterations/`.
- **CSS** — Tailwind (CDN) + handcrafted styles per page + `tokens.css` for design tokens.
- **JS** — no framework. Each page has inline `<script>` tags. Two shared files (`data.js`, `app.js`) expose globals `window.DB` and `window.ZE`.
- **Persistence** — browser `localStorage` under keys `ze_cart_v2`, `ze_saved_v1`, `ze_orders_v1`.

### 7.2 Page load order (every page)

```html
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="tokens.css"/>
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
<script src="data.js"></script>
<script src="app.js"></script>
<!-- page-specific inline script at bottom -->
```

Order matters: `data.js` must run before any page code that references `window.DB`, and `app.js` must run before any code referencing `window.ZE`.

### 7.3 Images

Product and species photos are generated on-demand by Pollinations AI. The URL shape:

```
https://image.pollinations.ai/prompt/<urlencoded-query>?width=W&height=H&seed=S&nologo=true
```

First-time generation takes 5–15 seconds. To reduce perceived latency, every page calls `ZE.prewarm([...urls])` at the top of its script — this fires off parallel `<img>` downloads immediately, so by the time the DOM renders the cards, the network has already been working.

If an image 404s or errors, `ZE.svgPlaceholder(alt, w, h)` inserts a coloured SVG card with the alt-text label.

---

## 8. The data layer (`data.js`)

All prototype data lives here, exposed as `window.DB`. Designed so the UI can be rebuilt from this one module.

### 8.1 Core collections

```js
DB.SPECIES    // 12 species (Bengal Tiger, Asian Elephant, …)
DB.TAGS       // 5 enrichment types (Sensory, Cognitive, Physical, Social, Food)
DB.CATEGORIES // 8 product categories (Scent Boxes, Puzzle Feeders, …)
DB.USERS      // 10 users across the 7 roles
DB.PRODUCTS   // 20 products — each with full specs dictionary
DB.PENDING    // 5 products awaiting approval
DB.TICKETS    // 12 demo tickets, each with line items
DB.SCREENS    // registry of all page routes (for future nav)
DB.ATTRIBUTES // 22 attribute definitions (the "attribute library")
```

### 8.2 Products — shape

```js
{
  id: 'prod_001',
  name: 'Burlap Scent Sack',
  cat: 'cat_scent',               // → DB.CATEGORIES
  tags: ['tag_sen', 'tag_cog'],   // → DB.TAGS
  stars: 5,
  uses: 12,
  engagement: 8.4,                // 0–10 score
  safety: 'safe',
  hot: true,
  compatibleSpecies: ['sp_tiger', 'sp_lion', …],
  submittedBy: 'u_rao',
  createdAt: '2026-01-10',
  status: 'published',

  // Legacy inline fields (kept for backwards compat):
  mat: ['Burlap', 'Jute'],
  size: 'L',
  scent: ['Catnip'],
  duration: '1 week',
  prep: '< 15 min',

  // Pricing
  price: { material: 80, labor: 40, effortHrs: 0.5 },

  // Images
  img: 'https://image.pollinations.ai/...',
  imgSmall: 'https://image.pollinations.ai/...',

  // ★ Per-product attribute specs (the important bit):
  specs: {
    attr_size: 'L',
    attr_material: ['Burlap', 'Jute'],
    attr_scent: ['Catnip'],
    attr_duration: '1 week',
    attr_refillable: true,
    attr_washable: false,
    attr_weather: false,
    attr_hang_type: 'Hanging',
    attr_durability: '3',
    attr_cert: ['Non-toxic']
  }
}
```

### 8.3 Attributes — shape

The attribute library (`DB.ATTRIBUTES`) is a flat list of ~22 definitions. Each has a type that drives the filter-UI control.

```js
{ id: 'attr_material', name: 'Material', type: 'multi_select',
  options: ['Cardboard','Wood','Jute','Rope','Rubber','Burlap','Ice','Fabric','Plastic','Metal','Paper'] }

{ id: 'attr_refillable', name: 'Refillable', type: 'boolean' }

{ id: 'attr_weight', name: 'Weight (kg)', type: 'number', unit: 'kg' }

{ id: 'attr_durability', name: 'Durability', type: 'select',
  options: ['1','2','3','4','5'] }
```

Types and their filter controls:
| Type            | UI control                                |
|-----------------|-------------------------------------------|
| `select`        | Segment / radio / single pill             |
| `multi_select`  | Checkbox list                             |
| `boolean`       | Single "Yes only" checkbox                |
| `number`        | Min / Max input pair                      |
| `color`         | Swatch row                                |

### 8.4 `DB.filterBankForProducts(products)`

Returns `[{attr, valuesInSet}]` for every attribute present in at least one product in the given array. This is what powers the **dynamic filter sidebar** — instead of hardcoding filters, the page calls this helper, then renders one filter card per returned entry.

Example return:
```js
[
  { attr: {id:'attr_size', name:'Size', type:'select', ...},
    valuesInSet: ['S','M','L','XL'] },
  { attr: {id:'attr_refillable', ...},
    valuesInSet: [true, false] },
  ...
]
```

### 8.5 Helpers

```js
DB.byId(arr, id)              // find-by-id in any collection
DB.fmtINR(n)                  // '₹1,200' formatting
DB.ticketCost(tk)             // sum of tk.lines material+labor+other
DB.ticketEffortHrs(tk)
DB.img(query, w, h, seed)     // build a Pollinations image URL
```

---

## 9. The shared helpers layer (`app.js`)

Exposes `window.ZE` with three persistent stores and a small utility library.

### 9.1 The three stores

| Store        | localStorage key | Shape                   | Use                 |
|--------------|------------------|-------------------------|---------------------|
| `ZE.cart`    | `ze_cart_v2`     | `{[prodId]: qty}`       | Shopping cart       |
| `ZE.saved`   | `ze_saved_v1`    | `string[]` of prod ids  | Wishlist            |
| `ZE.orders`  | `ze_orders_v1`   | `Order[]` (newest-first)| Submitted orders    |

All three are synchronised across tabs via the browser's `storage` event.

### 9.2 Cart API

```js
ZE.cart.read()        // → {[id]: qty}
ZE.cart.count()       // → total units
ZE.cart.qty(id)       // → qty for one product
ZE.cart.add(id, n=1)  // → n can be negative (decrement); 0 removes
ZE.cart.set(id, n)
ZE.cart.remove(id)
ZE.cart.clear()
```
Emits `cart:change` on every mutation.

### 9.3 Saved API

```js
ZE.saved.read()       // → string[]
ZE.saved.has(id)      // → boolean
ZE.saved.add(id)
ZE.saved.remove(id)
ZE.saved.toggle(id)   // → new has-state
ZE.saved.count()
ZE.saved.clear()
```
Emits `saved:change`.

### 9.4 Orders API

```js
ZE.orders.read()            // → Order[] (newest first)
ZE.orders.count()
ZE.orders.byId(id)
ZE.orders.submit({items, priority, notes, species, subtotal})
                            // auto-creates ORD-XXXX, clears cart, returns new order
ZE.orders.setStatus(id, status)
ZE.orders.cancel(id)        // shortcut: setStatus to 'cancelled'
ZE.orders.clear()
```

Order shape:
```js
{
  id: 'ORD-0001',
  createdAt: '2026-04-21T10:15:00.000Z',
  items: [ { productId, qty, config? } ],
  subtotal: 240,
  status: 'submitted' | 'in_progress' | 'completed' | 'cancelled',
  priority: 'Normal' | 'High' | 'Critical',
  notes?: string,
  species?: string
}
```

### 9.5 Event bus

```js
ZE.on('cart:change',   (cart)  => { … });
ZE.on('saved:change',  (array) => { … });
ZE.on('orders:change', (list)  => { … });
```

### 9.6 Utilities

```js
ZE.init()          // installs image fallback, device bar, lucide icons
ZE.refreshIcons()  // re-run lucide after DOM inserts
ZE.prewarm(urls)   // kick off parallel image downloads
ZE.svgPlaceholder(label, w, h)  // SVG data URI for failed images
```

---

## 10. Key design decisions and why

### 10.1 Per-product attributes, not per-category

**Problem.** Different product types need different attributes. A puzzle feeder needs "difficulty level" and "food capacity"; a scent sack needs "scent type" and "refillable". Treating attributes as category-level is coarse and forces irrelevant fields on every product.

**Solution.** Every product carries its own `specs` dictionary of attr-id → value pairs drawn from a shared `ATTRIBUTES` library. The sidebar filter panel reads the current product set and renders only the attributes actually present (via `DB.filterBankForProducts()`).

**Benefit.** Future "add product" flows can suggest existing attributes (dropdown from the library) plus allow creating a brand-new attribute inline — no schema migration needed.

### 10.2 Outline-default Add button

**Problem.** Previously, the Add button was a filled green pill. When clicked, it became a filled green "+/−" stepper. Visually the two states were near-identical — users couldn't tell at a glance which items were already in the cart.

**Solution.** Default = outlined button (white bg, green border + text). Once in cart, the button swaps to the filled green stepper. The visual difference between "empty state" (hollow) and "in cart" (solid) is now unambiguous.

### 10.3 Dual-pane independent scroll on the shop

**Problem.** With a single page scroll, the filter sidebar was pinned (`position: sticky`) but couldn't scroll its own tall content when hovered, and long filter lists were cut off.

**Solution.** The shop's grid-wrap is fixed to `calc(100vh - header - subbar)` with `overflow: hidden`. Both children (`.filters` and `.main-scroll`) each get `overflow-y: auto` and `overscroll-behavior: contain`. Wheel input is trapped inside whichever pane the mouse is over.

### 10.4 Sub-bar single row

**Problem.** Previously the sub-bar had two rows: species + sort on top, category pills below. That's a lot of vertical chrome.

**Solution.** Collapsed into one row: `[Species ▼] [All] [Sensory] [Cognitive] … [Sort ▼]`. Category pills scroll horizontally when they overflow. Saves ~50px of vertical space.

### 10.5 localStorage for everything

**Problem.** This is a prototype — no backend, no auth, no DB.

**Solution.** Every persistent store (cart, saved, orders) lives in `localStorage` under well-versioned keys. Cross-tab sync is free via the `storage` event. Clearing site data resets the prototype.

---

## 11. How to extend the prototype

### 11.1 Add a new product

In `data.js`, add an entry to `productsRaw`. Fill:
- `name`, `cat`, `tags`, `stars`, `uses`, `engagement`
- `price: { material, labor, effortHrs }`
- `imgQ` (Pollinations prompt), `seed` (unique integer)
- `specs: { … }` — pick 6–10 attributes from `DB.ATTRIBUTES` that are relevant to the product type

The map at the bottom of `productsRaw` will automatically assign `id`, `img`, `imgSmall`, `compatibleSpecies`, etc.

### 11.2 Add a new attribute

In `data.js`, append to the `ATTRIBUTES` array:
```js
{ id: 'attr_my_new',
  name: 'My New Attribute',
  type: 'select',                       // or multi_select / boolean / number / color
  options: ['Opt A', 'Opt B', 'Opt C'], // required for select/multi_select
  icon: 'tag' }                         // optional lucide icon
```
Then tag products with it via their `specs` dict. The shop's sidebar will pick it up automatically.

### 11.3 Add a new page

1. Copy `index_1.html` as a starting skeleton.
2. Keep the same `<head>` (Tailwind + tokens + lucide + data.js + app.js).
3. Reuse the `.app-header` markup so the nav stays consistent.
4. Wire up any CTAs via the `ZE` API.
5. Call `ZE.init()` at the bottom of the page's script.
6. (Optional) Register the page in `DB.SCREENS` in `data.js`.

---

## 12. File reference

```
Enrichment/
├── CLAUDE.md                     ← project-level superdesign workflow rules
├── DOCUMENTATION.md              ← this file
├── Antz Colours.pdf              ← brand reference (optional)
├── Antz Typography.pdf           ← brand reference (optional)
└── .superdesign/
    └── design_iterations/
        ├── tokens.css            ← design tokens (colours, shadows, radii, fonts)
        ├── data.js               ← window.DB (the whole data model)
        ├── app.js                ← window.ZE (cart / saved / orders / utilities)
        ├── index_1.html          ← Shop
        ├── product_detail_1.html ← Product detail
        ├── saved_1.html          ← Wishlist
        └── orders_1.html         ← Order history
```

**Global objects** once a page is loaded:
- `window.DB` — all prototype data.
- `window.ZE` — all persistent stores and utilities.

---

## 13. Change log — what this session delivered

### 13.1 Layout changes to the shop page (`index_1.html`)

- **Removed Site filter** — dropped from both the sub-bar and the sidebar. Prototype no longer scopes by site.
- **Collapsed sub-bar to one row** — `[Species ▼] [category pills] [Sort ▼]`. Pills scroll horizontally under constraint.
- **Dual-pane independent scrolling** — filter sidebar and product grid each scroll independently, pinned under a sticky header + sub-bar.

### 13.2 Data-model expansion (`data.js`)

- Attribute library grown from 8 → **22 attributes** (durability, refillable, weather-resistant, washable, assembly, pack qty, difficulty, dimensions, hang type, age suitability, certifications, indoor/outdoor, capacity, noise level, etc.).
- **All 20 products given a `specs` dictionary** — each with 6–16 realistic attribute values researched per product type.
- New helper: `DB.filterBankForProducts(products)` — drives dynamic filter UI.

### 13.3 Shared stores (`app.js`)

- Added `ZE.saved` (wishlist store, `ze_saved_v1`) with full CRUD + `saved:change` event + cross-tab sync.
- Added `ZE.orders` (orders log, `ze_orders_v1`) with auto-incrementing `ORD-XXXX` ids, `submit()` / `setStatus()` / `cancel()` / `byId()`, and `orders:change` event.
- Existing cart API untouched.

### 13.4 Shop page upgrades (`index_1.html`)

- **Outline-default Add button** (see §10.2).
- **Dynamic filter sidebar** — reads `DB.filterBankForProducts()` and auto-renders controls matching each attribute's type (`select` / `multi_select` / `boolean` / `number` / `color`).
- **"+ Add filter" popover** — searchable list of attributes not yet filtered, plus a "Create new attribute" stub that toasts "Coming soon".
- **Wishlist persistence** — hearts now call `ZE.saved.toggle()` and reflect `ZE.saved.has()`; `state.favs` removed.
- **Header buttons wired** — Orders → `orders_1.html`, Saved → `saved_1.html`, each with live count badges.
- **Search** — debounced 150ms substring match on product name.
- **Load-more** — true pagination, 12 per page, auto-hides when exhausted.
- **Scroll-to-top** on the main pane when category / filter / sort changes.

### 13.5 New pages

#### `saved_1.html` (wishlist)
- Sticky header (Saved button highlighted).
- Breadcrumb + title with live count.
- Filter/sort sub-row (species, dynamic category pills, sort).
- Card grid reusing the outline-default Add button.
- Heart removes with a 4-second Undo toast.
- **Add all to cart** and **Clear saved** bulk CTAs.
- Friendly empty state with "Browse enrichments" CTA.

#### `orders_1.html` (order history)
- Sticky header with "Clear completed" ghost button.
- Tabs: All / Submitted / In progress / Completed / Cancelled.
- Merges `ZE.orders.read()` with 12 demo `DB.TICKETS` — status mapped via `{in_review, in_production, partially_shipped} → in_progress`.
- Per-order: status chip, priority chip, species, item thumbnails, subtotal.
- Actions: **Reorder** (repopulates cart + nav), **View details** (expandable table), **Cancel** (user orders only, when pending).
- Empty state.

### 13.6 Product detail wiring (`product_detail_1.html`)

- Header heart now navigates to `saved_1.html` with a live `#savedBadge`.
- `#favBtn` ("Save for later") toggles via `ZE.saved.toggle()`; label + icon flip between "Save for later" and "Saved" (filled heart).
- Orders link navigates to `orders_1.html`.

### 13.7 Status-line (Claude Code IDE chrome)

- Configured `~/.claude/settings.json` `statusLine` to render **`Claude Opus 4.7 · Context: N% used`**, with the context % coloured green/yellow/red by usage band.
- Rewrote the command in Python 3 after discovering `jq` isn't installed on this machine. Parses tokens from `transcript_path`, divides by the 1M window.
- Falls back to just the model name if context data is unavailable.

---

*End of document.*
