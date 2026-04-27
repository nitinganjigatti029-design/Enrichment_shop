# ZooEnrich — Product Requirements Document (v1.0)

**Author:** Subhash, ZooEnrich
**Status:** Draft for internal review
**Last updated:** 2026-04-27
**Audience:** Founding team, prospective zoo partners, prospective vendors, design + engineering hires

---

## 1. Working-Backwards Press Release

**FOR IMMEDIATE RELEASE — Bengaluru, India**

### *India's first end-to-end marketplace for animal-enrichment supplies launches today*

**ZooEnrich** today opened the first nationwide marketplace dedicated to **enrichment products for captive animals** — the puzzle feeders, scent boxes, climbing rigs, ice treats and novel objects that zoos, sanctuaries and rescue centres use to keep their animals mentally stimulated and physically active.

For the first time, biologists, keepers and curators across India can browse a single catalogue, filter by species and enclosure type, place an order against an internal budget, and have a vetted vendor ship it directly to their facility — all in under five minutes. No more PDF brochures, no WhatsApp negotiations, no out-of-stock surprises.

> *"Our keepers used to spend two hours every Friday emailing six different suppliers just to refresh the tigers' weekly scent rotation. Now they pick the items in the morning, my approval lands in their inbox by lunch, and the box is at our gate by Tuesday."*
> — **Dr. M. Rao, Senior Biologist, Nehru Zoological Park, Hyderabad**

ZooEnrich serves three users in one product: **buyers** (zoo staff who request items), **approvers** (seniors who release budget) and **vendors** (verified makers who fulfil the order). Every product is tagged to a species, every order is tagged to an enclosure, and every vendor is rated by the biologists who actually used the item with the animal.

The catalogue launches with **20 starter products** across 8 categories — sourced from 5 founding vendor partners — and a starter network of **10 zoo facilities** across India. New zoos and vendors can self-onboard from day one.

ZooEnrich is live at **zooenrich.in** and free to use for accredited zoo facilities.

---

## 2. Customer FAQ

**Q: Who is this for?**
ZooEnrich is for the people inside a zoo who decide what enters an enclosure: biologists, keepers, vets, curators, and the lab managers who build in-house enrichment. It is also for the small specialist vendors who supply them.

**Q: Why does this need to exist? Don't zoos already buy enrichment?**
They do — through email, phone, in-person trade shows, and in-house labs. The problem isn't *whether* zoos buy enrichment; it's that the buying process is invisible, slow, and untraceable. There is no shared catalogue, no shared rating system, no shared safety record. A keeper in Patna has no way to know that a vendor in Pune already solved their problem. ZooEnrich makes that visible.

**Q: Is this just Amazon for zoos?**
No. Three things make ZooEnrich different:
1. **Species-tagged catalogue.** Every product is tagged to the animals it is safe and effective for. Filter by *Bengal Tiger* and you only see things that have actually worked for big cats.
2. **Two-step approval workflow.** Junior staff can request items, but their senior must approve before the order leaves the building. This mirrors how zoos actually allocate enrichment budgets.
3. **Custom-build option.** If the catalogue does not have what you need, you can post a custom brief ("a 1.5m climbing rig with replaceable jute sleeves") and vendors quote you back.

**Q: What does it cost?**
Free for zoos. Vendors pay a take-rate on each fulfilled order (target: 8–12%, calibrated against logistics-only competitors).

**Q: Can my zoo's in-house enrichment lab also list?**
Yes. The "Enrichment Lab" persona is a first-class vendor on day one. They list internal SKUs and fulfil internal orders the same way an external vendor does — the only difference is settlement.

---

## 3. Internal FAQ

**Q: Why now?**
Three converging forces:
- **Regulatory.** The Central Zoo Authority's 2024 enrichment-mandate revision now requires documented enrichment plans for every Schedule-I species. Zoos need a paper trail; ZooEnrich produces one as a side effect of normal use.
- **Generational.** A wave of younger biologists (under 35) is taking over enrichment programs. They expect a Flipkart-grade buying experience, not a fax machine.
- **Supply.** A small but growing cohort of Indian makers (BioCraft Labs, Acme Enrichment, ZooWorks, Frostbite Treats, NatureLoop) is producing professional-grade enrichment domestically. They lack a discovery channel.

**Q: What's the moat?**
Two-sided liquidity is the obvious moat, but the deeper one is the **species-tagged review corpus**. Once a vendor has 50 reviews from biologists across 15 facilities — each tied to a specific species and enclosure — that data is impossible for a generic marketplace to replicate.

**Q: What is intentionally NOT in v1?**
See **§9 Non-Goals**. The big ones: no payments rail (we generate POs and invoices, settlement happens off-platform), no logistics network (vendors arrange their own courier), no consumer-facing buyers (zoos only), no international vendors.

**Q: What's the riskiest assumption?**
**That biologists will leave reviews.** Zoo staff are time-poor and historically don't fill in feedback forms. If the review corpus stays thin, the species-filter advantage degrades into a cosmetic tag system. Mitigation: ship a 30-second voice/photo review flow on the day of delivery; gamify it lightly via a public vendor leaderboard.

**Q: What happens if a zoo refuses to digitise its budget approvals?**
The buyer can flip a per-order toggle to "no approval needed" if they have purchase authority, and the system records that they self-approved. This lets us onboard zoos that haven't formalised approval chains, while still capturing the audit trail.

---

## 4. Vision

> Every captive animal in India should have access to the right enrichment, on the right day, sourced from a vendor who has been rated by someone who has actually used it on that species.

In five years, ZooEnrich is the default operating system for captive-animal welfare procurement in South Asia: every accredited zoo has an account, every serious vendor lists, and the catalogue + review corpus is the most-cited reference for enrichment choice in the region.

---

## 5. Strategic Context

ZooEnrich sits at the intersection of three under-served markets:

| Market | Estimated India size (2026) | Current state |
|---|---|---|
| Accredited zoo facilities | ~150 (CZA-recognised) | Email + phone procurement |
| Sanctuaries / rescue centres | ~400 | Largely informal, donor-funded |
| Specialist enrichment vendors | ~30 active | No shared discovery surface |

Adjacent markets (out of scope for v1, candidates for v2): aquariums, breeding centres, university behavioural-research labs, NGO field stations, large private collections.

The wedge is the **CZA-mandated annual enrichment audit**. Every recognised zoo has to produce one; ZooEnrich's order history is, by construction, the cleanest source of truth for it.

---

## 6. Customer Problems

### 6.1 Buyer-side problems (zoo staff)

| # | Problem | Today's workaround | Cost of the workaround |
|---|---|---|---|
| B1 | "I don't know who supplies climbing rigs for snow leopards." | Email three biologist friends, wait 2 days. | Lost time; sometimes nobody replies. |
| B2 | "I found a vendor but no idea if their last batch hurt anyone's animal." | Ask in WhatsApp groups. | Selection bias; safety incidents under-reported. |
| B3 | "My junior keeper ordered ₹40,000 of items I'd never approve." | Quarterly budget reviews catch it after the fact. | Money already spent; awkward conversations. |
| B4 | "My order arrived but the size is wrong." | Phone calls; vendor disputes via email. | No evidence trail; resolution takes weeks. |
| B5 | "The CZA audit is next month and I have no record of what we ordered." | Manual spreadsheet, reconstructed from emails. | 3–5 person-days per audit. |
| B6 | "I want to know if Hyderabad's tigers actually engaged with this product." | Phone a friend. | Lossy, unrepeatable. |

### 6.2 Vendor-side problems

| # | Problem | Today's workaround | Cost |
|---|---|---|---|
| V1 | "I sell great cognitive feeders but the only zoos who know me are the two I happened to meet at a conference." | Word of mouth, distributor middlemen. | Heavily under-priced; growth limited by founder's rolodex. |
| V2 | "I get an enquiry but don't know if the buyer has authority to actually purchase." | Send quote, wait, follow up, often hear nothing. | High deal mortality; demoralising. |
| V3 | "My products are good for tigers but buyers searching for 'tiger toys' on Google find generic pet products instead." | Pay for SEO, lose to broader categories. | High CAC, low conversion. |
| V4 | "I have no idea how my products performed once they left my workshop." | Occasional photos from happy customers. | No product-improvement loop. |

### 6.3 Approver-side problems

| # | Problem | Today's workaround | Cost |
|---|---|---|---|
| A1 | "I get five PDF requisitions a day with no consistent format." | Forward, sign, scan, return. | Approver becomes the bottleneck. |
| A2 | "I approve a request, then find out the vendor was already blacklisted." | Personal memory; phone calls. | Reputational risk for the institution. |

---

## 7. Personas

We design for **five primary personas** in v1. The first three are inside the zoo; the last two sell to it.

### 7.1 The Senior Biologist / Curator (Approver) — *Dr. M. Rao*
- 15+ years in zoo biology, runs an enrichment programme
- Approves orders from junior staff before they reach the vendor
- Reads reviews carefully; uses species-tagging heavily
- Pain: time-poor; gets pinged on WhatsApp at 10pm to approve things
- Win: receives one batched email a day; one-click approve/reject

### 7.2 The Keeper (Junior Buyer) — *T. Das, K. Iyer*
- Day-to-day handler of one or more species
- Knows exactly what worked last week; needs to re-order or improve it
- Limited or no purchase authority; needs senior sign-off
- Pain: blocked on Dr. Rao for 36 hours every time
- Win: drafts a cart, sees exactly what their senior will see, hits Submit, walks away

### 7.3 The Lab Technician (In-house Maker) — *A. Joshi, P. Mehta*
- Builds enrichment items inside the zoo's own lab
- Treats internal "lab" as a vendor on the platform
- Receives internal "tickets" the same way an external vendor receives orders
- Pain: paper job-cards get lost; backlog invisible to keepers
- Win: a single dashboard of incoming tickets, prioritised by species and date

### 7.4 The External Vendor — *Acme Enrichment, BioCraft Labs*
- 5–50 person workshop, founder-led
- Has 10–40 SKUs; produces in small batches
- Needs predictable order flow, transparent disputes, fast settlement
- Pain: feast/famine demand; no insight into who their reviewers are
- Win: a predictable inbound funnel; reviews tied to verified deliveries; clear take-rate

### 7.5 The Site Director / Admin — *V. Verma*
- Owns the zoo's overall procurement budget
- Approves new vendors into their facility's allowlist
- Reviews monthly spend, flags anomalies, prepares CZA audit
- Pain: every facility has a different audit format
- Win: one dashboard, one export, one signature

---

## 8. Goals

### Tier 1 — must achieve in v1 (next 6 months)

| Goal | Metric | Target |
|---|---|---|
| **Activate the buy side** | Active facilities placing ≥ 1 order/week | 12 |
| **Activate the sell side** | Vendors with ≥ 5 fulfilled orders | 8 |
| **Prove the approval flow** | Orders flowing through 2-step approval (vs self-approved) | ≥ 60% |
| **Prove the species filter** | Sessions where buyer used a species filter | ≥ 75% |
| **Trust** | Verified-buyer reviews per product (median) | ≥ 3 |

### Tier 2 — directional in v1, primary in v2

- GMV per facility per month
- Repeat-order rate (vendor → same buyer)
- Time from cart-submit to delivery
- Vendor 30-day churn

### Guardrails (must not regress)

- Order rejection rate (approver-side) ≤ 15% — too high means the catalogue is unfit
- Vendor return rate ≤ 8% — too high means we have a quality problem
- p50 page load on `/index` < 2.5s on a mid-tier Indian Android device on 4G
- Zero credentials checked into the repo

---

## 9. Non-Goals (v1)

We are explicitly **not** doing the following — they are good ideas, just not now:

1. **Payments / settlement.** ZooEnrich generates a PO + invoice. Money moves bank-to-bank, off-platform. Adding a payments rail multiplies regulatory burden 5× and we have no signal it's the constraint.
2. **Logistics network.** Vendors arrange their own courier (Blue Dart, Delhivery, DTDC, India Post, Xpressbees). We surface tracking links; we don't move boxes.
3. **Consumer-facing buyers.** No retail. The catalogue is locked behind facility-verification.
4. **International vendors.** India-only in v1. Cross-border adds GST/customs work that doesn't compound the wedge.
5. **AI product generation in production.** The prototype includes AI-generated product imagery for demo; v1 ships with vendor-uploaded photos only.
6. **Mobile app.** Responsive web first. Native app waits until we see ≥ 30% traffic from mobile.
7. **Animal-medical / veterinary supplies.** Adjacent but materially different regulatory regime.

---

## 10. Solution Overview

ZooEnrich is a **two-sided web marketplace** with a third "approver" surface layered on top of the buy side.

### 10.1 Buy side (zoo)

A Flipkart-grade product browse (filters, search, recommendations) with three twists:

- **Species lens:** every page can be filtered to one species; product cards surface "compatible / incompatible / unknown" against the active lens.
- **Per-line cart:** each cart line carries its own *vendor*, *species*, *enclosure*, and optional *note* — because a single cart can span multiple animals on the same day.
- **Submit → Approval → PO:** instead of a payment step, submitting the cart routes the order to the buyer's approver (or self if authorised), then to the vendor as a PO.

### 10.2 Sell side (vendor)

A vendor dashboard with:
- Product CRUD with category-driven attribute schemas (e.g., picking *Scent Boxes* makes *Scent* and *Material* mandatory)
- Order inbox with accept / decline / counter-offer
- Tracking-number entry that auto-builds the public tracking URL
- Returns inbox (RMA-style)
- Vendor analytics (orders, GMV, top species, top buyers)

### 10.3 Admin / approver side (zoo and platform)

- **Approver inbox:** one screen showing every order awaiting your sign-off, batched by buyer
- **Catalog moderation:** approve / reject new SKUs submitted by vendors before they go public
- **Site administration:** users, sites, enclosures, vendor allowlist, audit log

### 10.4 Custom-build flow

If a buyer can't find what they need, they file a **custom request** — a brief with photos, target species, enclosure, budget — and matching vendors quote back. Once accepted, the quote becomes a normal order.

---

## 11. Functional Requirements

Each row is annotated with priority: **P0** (blocks v1 launch), **P1** (launch-week), **P2** (post-launch within 60 days).

### 11.1 Catalogue & search

| ID | Requirement | Priority |
|---|---|---|
| C-1 | Browse all products with image, name, vendor, price, stock, rating | P0 |
| C-2 | Filter by category, tag, species, attribute (dynamic per-category) | P0 |
| C-3 | Free-text search across name, description, tags, vendor name | P0 |
| C-4 | Sort by relevance, price (asc/desc), rating, newest | P0 |
| C-5 | Hero banners + "Popular this week" curation | P1 |
| C-6 | Save-for-later (per-user wishlist) | P0 |
| C-7 | Recently-viewed list | P2 |
| C-8 | Product comparison (side-by-side, ≤ 4 items) | P2 |

### 11.2 Product detail

| ID | Requirement | Priority |
|---|---|---|
| P-1 | Image gallery (≤ 20 images, drag-reorder by vendor) | P0 |
| P-2 | Specs table built from the category's attribute schema | P0 |
| P-3 | Compatible-species chip row | P0 |
| P-4 | Vendor mini-profile + link to vendor store | P0 |
| P-5 | Verified-buyer reviews with vendor reply | P0 |
| P-6 | "Add to cart" opens species/enclosure modal — line is configured before it lands in cart | P0 |
| P-7 | "Customise this" button → custom-request flow with this product as seed | P1 |

### 11.3 Cart & checkout

| ID | Requirement | Priority |
|---|---|---|
| K-1 | Per-line vendor, species, enclosure, note | P0 |
| K-2 | Auto-group lines by vendor for shipping calc | P0 |
| K-3 | Stock check at submit; surface conflicts before order is created | P0 |
| K-4 | Sticky CTA bar (position: sticky, no transform ancestors) | P0 |
| K-5 | Address book per buyer (multi-site users) | P0 |
| K-6 | Shipping speed selection (Standard / Express) | P0 |
| K-7 | Submit triggers approval routing if buyer lacks purchase authority | P0 |

### 11.4 Approval workflow

| ID | Requirement | Priority |
|---|---|---|
| A-1 | Each user has `canPurchase` (boolean) and `approverId` (fk to users) | P0 |
| A-2 | If `!canPurchase`, submitted orders enter `pending_approval` | P0 |
| A-3 | Approver inbox: list, filter, view, approve/reject with reason | P0 |
| A-4 | On approval, order auto-flows to vendor and moves to `placed` | P0 |
| A-5 | Buyer is notified of approval/rejection (email + in-app) | P1 |
| A-6 | Bulk approve from inbox | P2 |

### 11.5 Vendor experience

| ID | Requirement | Priority |
|---|---|---|
| V-1 | Vendor onboarding: business KYC, GSTIN, bank details, return policy | P0 |
| V-2 | Add / edit product with category-driven mandatory attributes | P0 |
| V-3 | Order inbox: accept / decline / counter-offer (price, ETA, partial qty) | P0 |
| V-4 | Add tracking number → auto-build courier URL | P0 |
| V-5 | Returns inbox: approve / reject RMA, refund / replace | P0 |
| V-6 | Vendor store page (public) — bio, products, reviews, ratings | P0 |
| V-7 | Vendor analytics dashboard | P1 |
| V-8 | Notifications panel (in-app) | P1 |

### 11.6 Returns

| ID | Requirement | Priority |
|---|---|---|
| R-1 | Buyer initiates return within window (vendor-set, default 7d) | P0 |
| R-2 | Reason picker: damaged, wrong item, animal rejected, safety concern, other | P0 |
| R-3 | Photo evidence (≤ 5 images) | P0 |
| R-4 | Vendor decision: approve full / approve partial / reject with reason | P0 |
| R-5 | Outcome: refund (off-platform PO note) or replace (auto-create replacement order) | P0 |

### 11.7 Admin / catalogue moderation

| ID | Requirement | Priority |
|---|---|---|
| M-1 | New SKUs from vendors enter `pending_review` | P0 |
| M-2 | Admin queue: approve / reject with reason | P0 |
| M-3 | Site CRUD, enclosure CRUD, user CRUD, vendor allowlist | P0 |
| M-4 | Audit log — every state-changing action, immutable | P1 |
| M-5 | CZA-audit export (CSV: orders × species × month) | P1 |

### 11.8 Custom requests

| ID | Requirement | Priority |
|---|---|---|
| X-1 | Buyer files brief with photos, target species, enclosure, budget | P1 |
| X-2 | Brief routed to relevant vendors (matched by category + species) | P1 |
| X-3 | Vendor quote → buyer accept/reject | P1 |
| X-4 | Accepted quote becomes a normal order | P1 |

---

## 12. End-to-End Journeys

### 12.1 Junior keeper places a primate order

1. T. Das (keeper, no purchase authority) opens **/index** and toggles species to *Bornean Orangutan*.
2. Filters down to *Cognitive* tag, opens **Hidden Treat Log**.
3. Clicks Add to cart → modal asks for species (pre-filled from the lens) and enclosure (Indoor Enrichment Room) → confirms.
4. Adds two more items, opens **/cart**, picks *Standard* shipping, hits **Submit**.
5. Order enters `pending_approval`; T. Das sees a confirmation toast and an entry on **/orders** with state *Awaiting senior approval*.
6. Dr. Rao (T. Das's approver) gets an email + an in-app badge on **/approvals**. Reviews the order, hits **Approve**.
7. Order auto-routes to vendor inbox at Acme Enrichment as `placed`. Acme accepts, ships in 2 days, enters tracking.
8. T. Das gets a delivery notification on day 4. Files a 30-second photo review the same evening.

### 12.2 Vendor onboards and lists first product

1. Founder of a new vendor opens **/login**, picks *Vendor*, sees onboarding wizard (`vendor_onboarding_1.html`).
2. Fills business details, GSTIN, bank, return policy, uploads logo + cover.
3. Lands on **/vendor_dashboard**. Adds first product via `vendor_add_product_1.html`: name → description → category → tags → species → attributes → images → pricing → stock.
4. Submitting routes to admin moderation queue.
5. Admin (V. Verma) reviews on `approvals_1.html`, approves.
6. Product goes live in the public catalogue, visible to all facilities.

### 12.3 Returns flow

1. K. Iyer receives the order, opens it, taps **Return item**.
2. Reason: *Wrong size* + 2 photos. Submits.
3. Vendor (NatureLoop) sees it on `returns_vendor_1.html`. Approves replacement.
4. System auto-creates a replacement order linked to the original. Vendor ships replacement.
5. Original order shows status *Returned — replaced*. Audit log records both events.

### 12.4 Custom request

1. F. Karim (Avian Specialist) needs a 1.5m hanging foraging structure for the macaw aviary. Catalogue has nothing close enough.
2. Opens **/customise_product**, picks Macaw, picks aviary, writes brief, attaches reference photos, sets budget ceiling ₹3,000.
3. System matches three vendors (Acme, ZooWorks, BioCraft) based on category overlap.
4. Two vendors quote within 48h. F. Karim picks ZooWorks's ₹2,400 quote.
5. Quote becomes a normal order. From here it follows §12.1.

---

## 13. Edge Cases We Will Get Right Day One

- **Zero-stock add-to-cart.** Block with a clear "Out of stock — set up a back-in-stock alert" CTA.
- **Vendor switches mid-cart.** A line's vendor can be changed on the cart line; we don't silently merge.
- **Approver is the buyer.** Self-approval is fine; logged as such.
- **Approver is on leave.** Each user can set a temporary delegate; orders route to delegate during the window.
- **Multi-site user.** One user can act on behalf of multiple sites; the active-site selector lives in the header.
- **Vendor blacklisted after order placed.** Existing orders complete; new orders blocked.
- **Product de-listed after order placed.** Order honours the snapshot at order time, including price.
- **Currency, units, decimals.** All prices in INR rounded to nearest rupee; weights in kg; dimensions in cm.

---

## 14. Risks & Mitigations

| Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|
| Reviews stay thin → species filter is cosmetic | High | Medium | 30s post-delivery review flow; private vendor leaderboard; partner with 1 zoo to seed 200 reviews in week 1 |
| Vendors list and never fulfil | High | Medium | Manual onboarding for first 20 vendors; sunset listings with no orders in 60d |
| Approver becomes the bottleneck | Medium | High | Bulk approve, mobile push, delegate windows |
| CZA audit export doesn't match facility template | Medium | Medium | Build with 3 facilities side-by-side; iterate on real audit cycles |
| AI imagery in prototype leaks into v1 production | Medium | Low | Manual gate before publish; vendor-only uploads in production |
| Concentration risk — one large zoo accounts for >40% GMV | Medium | Medium | Active outreach to top-30 facilities in months 1–3 |
| Fake reviews / collusion between vendor and buyer | Medium | Low | Reviews tied to delivery confirmation only; rate-limit per user |

---

## 15. Open Questions (need answers before code freeze)

1. **Settlement timing.** Do vendors see PO funds immediately on dispatch, or after delivery confirmation? Net-7? Net-15?
2. **Take-rate structure.** Flat % or tiered by category (consumables vs durables)?
3. **GST on platform fees.** Who issues the invoice — platform to vendor, or vendor to buyer?
4. **In-house lab settlement.** Internal lab "orders" — cost-centre journal entry vs symbolic line?
5. **CZA partnership.** Do we approach CZA pre-launch or after we have 10 facilities and 100 orders?
6. **Sanctuary tier.** Same product as zoos, or stripped-down?
7. **Brand position.** "Procurement OS for zoos" (sober) vs "Marketplace for happier animals" (warm) — same surface, very different marketing.

---

## 16. Milestones

| Milestone | Target date | Definition of done |
|---|---|---|
| **M1 — Prototype frozen** | 2026-05-15 | All 35 prototype screens demo-ready, no broken flows; PRD signed off |
| **M2 — Tech stack picked** | 2026-05-30 | Backend + framework + hosting decided; auth + payments-PO design signed off |
| **M3 — Closed alpha** | 2026-07-15 | 3 zoos, 5 vendors, 50 orders end-to-end, no production data loss |
| **M4 — Open beta** | 2026-09-01 | 10 zoos, 12 vendors, ≥ 200 orders, ≥ 100 reviews, CZA-audit export works |
| **M5 — v1 GA launch** | 2026-11-01 | All Tier-1 metrics from §8 hit; press release in §1 sent for real |

---

## 17. Appendix A — Data Model Summary

(See **DOCUMENTATION.md** §6 for the authoritative schema. Summary here for PRD readers.)

Core entities and their relationships:

```
USER ──(approverId)──► USER             (manager / approver)
USER ──(siteId)──► SITE                  (home facility)
USER ──(species[])──► SPECIES            (animals they're responsible for)

SITE ──(1..n)──► ENCLOSURE
ENCLOSURE ──(speciesIds[])──► SPECIES

VENDOR ──(1..n)──► PRODUCT
PRODUCT ──(cat)──► CATEGORY
PRODUCT ──(tags[])──► TAG
PRODUCT ──(compatibleSpecies[])──► SPECIES
PRODUCT ──(attributes[])──► ATTRIBUTE     (typed key/value)

ORDER ──(createdBy)──► USER
ORDER ──(approverId)──► USER
ORDER ──(siteId)──► SITE
ORDER ──(enclosureId)──► ENCLOSURE
ORDER ──(vendorId)──► VENDOR
ORDER ──(items[])──► PRODUCT (qty + per-line config)
ORDER ──(tracking.carrier)──► CARRIER

REVIEW ──(productId)──► PRODUCT
REVIEW ──(buyerId)──► USER
RETURN ──(orderId)──► ORDER
```

---

## 18. Appendix B — Out-of-Scope Ideas (parking lot)

These are good. They are not v1.

- Mobile native app (iOS + Android)
- Sponsored placements / vendor ads in catalogue
- AI assistant ("what enrichment should I order for an under-stimulated juvenile chimp?")
- IoT integration with enclosure sensors (ambient noise, motion) for engagement scoring
- Cross-zoo product-swap marketplace (one zoo's surplus is another's request)
- Donor-funded "sponsor an enrichment item" flow for sanctuaries
- Multilingual UI (Hindi, Kannada, Tamil)
- B2B supplier-of-suppliers tier (raw materials)
- Aquarium / breeding-centre vertical
- International expansion (start with SAARC, then SEA)

---

*End of PRD v1.0. Comments and pushback to subhash@lifesciencetrust.com.*
