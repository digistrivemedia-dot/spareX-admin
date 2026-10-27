# SpareX Admin: Kannali Garage admin panel

> **Agent: read this whole file before any work.** It is the complete brief: product, business rules, stack, design
> system, data approach, screens, build phases and demo data. **Do not look for or read any other project documents**
> (proposals, quotes, PDFs, other repos). If something is not covered here, choose the simplest option that follows
> these rules, build it, and log it in `OPEN-QUESTIONS.md` (§11). **Never stop work to wait for an answer.**

---

## 1. The five pillars (every decision is checked against these)

1. **Easy to maintain**: a new developer understands any file at first glance.
2. **Easy to scale**: new modules slot in as new folders, routes and nav entries without touching existing ones.
3. **Clean**: no duplication, no dead code, no clever tricks, no unnecessary code.
4. **No compromise on design**: polished, consistent, excellent UX; dense but calm.
5. **Industry standard**: conventional Next.js + React patterns that any experienced developer recognises.

---

## 2. The product

**Kannali Garage** is a vehicle service and spare-parts business in Bengaluru, India. **SpareX** is its spare-parts
platform. The platform has three websites sharing one backend (later):

| Part | Users | Status |
|---|---|---|
| B2C website | Consumers: buy parts, book services at any approved garage | Frontend built (separate repo) |
| B2B website | Verified businesses buy parts in bulk; garages also run their workshop (bookings, job cards, billing) | Frontend built (separate repo) |
| **Admin panel** | **Kannali staff: control the whole platform** | **This repo, building now** |
| Backend API | All apps (Node.js; database not decided yet) | Later |
| Mobile apps | B2C and B2B (React Native) | Later |

The admin panel is where Kannali staff manage everything the other two sites show: the vehicle master and fitment,
products, prices, stock, orders, returns, payments, B2B verification and credit, garages, service oversight, banners
and content, enquiries, reviews and reports.

**Current goal:** build every screen in §9 on realistic demo data, so the client can approve the panel and the backend
can be planned from it. Where a business rule is still open, build with the default given here and log the question.

---

## 3. Business rules (the screens must follow these)

**Admin access**
- Roles at launch: **Super Admin** and **Admin**. Everything (menu items, buttons, routes) is controlled by
  **permissions**, never by role names, so more roles can be added later as data.
- Default permissions: Super Admin has all of them. Admin has everything **except** admin users, roles, settings and
  integrations. *(Default, logged as Q-01.)*
- Login: email + password. **2-step verification is mandatory for Super Admin** and optional for Admin.
- **Audit log:** every change to prices, products, fitment, stock, orders, returns, payments, credit, businesses,
  garages, content and admin users is recorded (who, what, when, before → after). Exports are recorded too.

**Selling and catalogue**
- **Only Kannali sells** on SpareX. There are no seller or vendor screens.
- Vehicle master: **Vehicle type → Brand → Model → Variant → Year**, plus fuel / engine per variant.
  Vehicle types: **bike, scooter, car, commercial** (as on B2C). **Electric is a fuel type, not a category.**
  *(Default, logged as Q-02.)*
- Every product is mapped to the vehicles it fits (fitment). Fitment is the core of SpareX; make it fast to manage
  (bulk add by model, copy fitment from another product, CSV import).
- **Product reviews are off at launch** (B2C shows none); customers rate **garages**. Product reviews are built behind
  the `productReviews` switch.
- **No installation option at launch**; built behind the `productInstallation` switch.
- Prices: each product has **MRP** and a **B2C price** (incl. GST). **B2B price = B2C price minus one discount % set
  per business** by admin. No per-business price lists, no tier prices, no MOQ. GST 18% on all demo items.
- Stock: **one Kannali stock quantity per product** (manual adjustments with a reason). There is no garage stock module.
  *(Location-wise stock logged as Q-07.)*

**Orders, returns and payments**
- Order statuses are **set by admin**: Placed → Confirmed → Processing → Packed → Shipped → Out for delivery → Delivered
  (+ Cancelled). There is no courier integration: when marking Shipped, admin **types the courier name and tracking
  number**, which the customer sees.
- Customers can cancel until the order is shipped.
- Payments: **Razorpay** (UPI, card, net banking, wallet) is marked paid automatically. **Bank transfer, cash and COD**
  are marked paid by admin, with a reference. B2C COD is undecided *(Q-05)*.
- **Returns are in launch:** customer requests → admin approves or rejects (reason) → pickup scheduled → item verified
  → **refund** (B2C) or **credit note** (B2C refunds and B2B credit orders) → closed. Replacements follow the same path.
- **Credit notes are in launch** (they reduce what a B2B credit customer owes and document B2C refunds).

**B2B businesses and credit**
- Business types: garage / workshop, fleet operator, dealer, spare-parts retailer, reseller, corporate.
- Every business is **verified by admin**. Application states: Submitted → Under review → Approved / Sent back (for
  corrections) / Rejected (with reason; they may reapply).
- Admin sets each business's **discount %**. **Credit** is off by default; admin enables it per business with a
  limit and terms (default Net 30), and can put the account on hold.
- Quotations are auto-priced from the business's discount; admin can edit lines, add a discount, set validity
  (default 7 days) and send.

**Garages and service**
- Any **approved garage** can offer services on B2C. Kannali-owned garages and partner garages are both "garages";
  a flag says which is which.
- An approved garage is **not visible to customers until admin switches it live** (profile, services and prices complete).
- Garages set **their own service prices**. The admin **service master is the list of service names and categories**
  that garages pick from. *(Whether Kannali also sets prices: Q-08.)*
- Bookings are **date only** at launch (time slots built behind the `bookingTimeSlots` switch). With **free pick and drop**, the customer picks a pickup time window
  and pickup / drop addresses; garage staff do the pickup. Customers can cancel a booking anytime; garages accept or
  decline (no reschedule).
- Job cards are run by garages in B2B. **Admin views bookings and job cards (read only) and can cancel a booking.**
- Customer estimate approval is per item. Service invoices are in the **garage's** name and GST; customers pay the
  garage online or at the garage. *(How online service payments reach partner garages: Q-09.)*
- A vehicle's service history is central: all garages, and other garages see it without prices.

**Content and support**
- Banners, featured categories and products, help, FAQ and policy pages all come from admin.
- Enquiries come from B2C: "my vehicle isn't listed" and "no part fits my vehicle".
- Coupons are **not shown on B2C at launch** unless the client confirms *(Q-06)*. Build the coupon screens anyway
  (`coupons` switch).
- English only.

**Feature switches: when a feature is undecided, build it and switch it off; never leave it out**
All switches live in one file, `src/lib/features.ts`, and are shown read-only in Settings (A55).

| Switch | Default | Turns on / off |
|---|---|---|
| `productReviews` | off | Product reviews in moderation (A50) and on product records |
| `productInstallation` | off | "Installation available" + charge fields on the product form (A29) |
| `bookingTimeSlots` | off | Time-slot settings (A55 Service) and slot columns in bookings (A40, A41). Off = date only + pickup time window |
| `coupons` | off | Coupons menu items (A47, A48). Screens are built either way |
| `b2cCashOnDelivery` | off | COD for B2C orders (A55 Delivery, payment filters) |
| `garagePayouts` | off | Garage payouts menu item (A59) |

A switch only hides or shows; the screens and types behind it are always built and kept working.

**Not in this build** (don't build, but don't block): extra named admin roles, channel / outlet assignment, approval
limits and workflows, procurement and supplier payments, stock transfers, courier tracking integration, payment
reconciliation, SEO tools and campaigns, support desk, warranty claims, technical monitoring, auto-assignment of
garages, notification channels and reminders.

---

## 4. Stack and libraries (fixed: same as the B2C and B2B repos)

| Job | Choice |
|---|---|
| Framework | **Next.js** (latest stable), App Router, `src/` directory, TypeScript `strict` |
| Styling | **Tailwind CSS v4**, using the theme in §7 only |
| Components | **shadcn/ui**: copied into `src/components/ui` and restyled with our theme |
| Tables | **TanStack Table** (through shadcn's data-table pattern) |
| Charts | **Recharts** (through shadcn's Chart component), for the dashboard and reports only |
| Dates | shadcn's Calendar / date-range picker (installs `react-day-picker` + `date-fns`) |
| Icons | **lucide-react** |
| Forms and validation | **react-hook-form + zod** (through shadcn's Field components) |
| Toasts | **sonner** (through shadcn) |
| Client state | **Zustand**, only for UI state that must survive navigation (e.g. sidebar collapsed, table density) |
| Fonts and images | `next/font/google` (**Inter**), `next/image` |
| Code quality | ESLint (Next config), Prettier + `prettier-plugin-tailwindcss` |
| Package manager | npm |

Rules:
- Packages the shadcn CLI installs (Radix primitives, `class-variance-authority`, `clsx`, `tailwind-merge`, `cn`,
  `react-day-picker`, `date-fns`, `recharts`, etc.) are allowed. Put the `shadcn` CLI in `devDependencies`.
- **Nothing else** without the lead's approval. One library per job.
- **Never** use pre-styled design kits (MUI, Bootstrap, Ant Design, Chakra, Mantine, DaisyUI).
- **CSV only** for import and export, written with a small helper in `lib/csv.ts` (no library). Excel files need a
  library, which is not approved yet *(Q-10)*.
- **No rich-text editor.** Content pages are edited as structured sections (heading + paragraphs) and FAQ as
  question / answer pairs.
- **No map library.** Show the address with an "Open in Google Maps" link.
- Later, for the backend phase only: TanStack Query. Don't add it now.

Setup: this folder already contains `CLAUDE.md` and `OPEN-QUESTIONS.md`, so `create-next-app .` will refuse to run.
Scaffold into a temporary sub-folder, move the files up, then delete the sub-folder. Initialise git, and add
`.gitignore`, `.env.example` and `.nvmrc` (Node 24).

---

## 5. Data layer: demo data now, real backend later with minimal change

This is the most important architectural rule. **Screens must never need rework when the backend arrives.**

```
Screen / component             never knows where data comes from
   ↓ calls getOrders(filters)
features/<x>/api.ts            the ONLY place that switches between demo and real data
   ├─ demo:  src/mocks/<x>.ts       (now)
   └─ real:  lib/api-client.ts → backend   (later)
```

1. **Types are the contract.** Every data shape lives in `features/<x>/types.ts`, written the way a real REST API would
   return it: string `id`s, ISO date strings, **money as integer paise**, lists as
   `Paginated<T> = { items: T[]; page: number; pageSize: number; total: number }`.
2. **Screens never import from `src/mocks/`.** They call async functions in `features/<x>/api.ts`.
3. **One switch per feature** in `src/lib/config.ts`: `dataSource = { catalog: "mock", orders: "mock", ... }`.
4. **Mock functions behave like a real server.** They are async, and they search, filter, sort and paginate on the
   same parameters the UI sends. The UI never filters raw arrays itself.
5. **Mutations go through Server Actions** that call the feature's `api.ts` and return `ActionResult<T>`
   (`{ ok: true, data } | { ok: false, error, fieldErrors? }`). In demo mode, mock mutations update in-memory data and
   **write an audit entry**, so the audit log shows real activity.
6. **Auth in one place:** `features/auth/session.ts` exports `getSession()` → `{ user, role, permissions }`.
   `features/auth/permissions.ts` holds the permission list, the role → permissions map and the single
   `can(session, permission)` helper. Every menu item, button and route checks it.
7. `src/lib/api-client.ts` is a small typed `fetch` wrapper (base URL from env, JSON, auth header slot, typed `ApiError`).
8. When every feature is live, **`src/mocks/` is deleted** and nothing else breaks.

**Types must match the B2C and B2B sites.** The same concepts (product, vehicle, order, return, credit note, booking,
job card, garage, business, quotation) use the same field names and statuses as described in §3, because one backend
will serve all three.

---

## 6. Folder structure

```
src/
  app/
    (auth)/                    login, forgot-password, reset-password
    (panel)/                   App shell: sidebar + top bar. Everything behind login.
      dashboard/ customers/ vehicles/ businesses/ applications/ credit/ garages/ masters/ products/ stock/
      orders/ returns/ payments/ credit-notes/ quotations/ bookings/ job-cards/ content/ coupons/
      enquiries/ reviews/ reports/ settings/ admin-users/ audit-log/ profile/
    globals.css                Tailwind + theme. The only global CSS file.
    not-found.tsx  error.tsx
  components/
    ui/                        shadcn components + our generic ones (DataTable, StatusBadge, StatCard, Price, …)
    layout/                    AppSidebar, TopBar, PageHeader, DetailLayout, FormLayout, Container, Logo
  features/<feature>/          components/, api.ts, types.ts, schemas.ts, columns.tsx (+ utils.ts when needed)
  lib/                         api-client.ts, config.ts, format.ts, csv.ts, gst.ts, utils.ts, navigation.ts, constants.ts
  mocks/                       Demo data + mock handlers, one file per feature
public/images/                 products/, banners/, garages/, documents/
```

- One component per file; `PascalCase.tsx` for components; `kebab-case` folders; named exports.
- Used by one feature → it lives there. Used by two or more → `components/ui` or `lib`.
- Check `components/ui` before creating anything. Only build what a screen needs.
- **Navigation lives in one place** (`lib/navigation.ts`): sections → items with `label`, `href`, `icon`, `permission`.
- Each route segment that loads data has a `loading.tsx` (skeleton). Use `error.tsx` and `not-found.tsx` where useful.

### Shared building blocks (Phase 1; every screen reuses them)

| Block | What it does |
|---|---|
| App shell | Navy sidebar grouped by area and filtered by permission (collapsible; a drawer on mobile); top bar with global search, notifications placeholder and profile menu |
| `DataTable` | TanStack Table: columns, sort, column visibility, pagination, row selection + bulk actions, row actions, CSV export of the current filter (permission-checked and audited), loading / empty / error states; stacked cards on narrow screens |
| `FilterBar` | Search, date range, status, channel (B2C / B2B), garage, and other filters per list; all in the URL |
| `DetailLayout` | Header (title, status badge, key facts, primary actions), tabs, and an activity / audit timeline |
| `FormLayout` | Sections, zod validation, save / cancel, sticky action bar, unsaved-changes warning |
| `StatusBadge` | One map from every status (order, return, payment, booking, job card, application, quotation, credit) to a colour |
| `ConfirmDialog` / `ReasonDialog` | Confirm risky actions; capture a reason for reject, cancel, send back, hold, stock adjustment |
| `Drawer` | Quick view from lists without leaving the page |
| `Upload` | Images and documents (PDF / JPG / PNG), with preview and remove; CSV for imports |
| `StatCard`, `ChartCard` | Dashboard and report tiles |
| States | Loading skeletons, empty state with action, error with retry |

---

## 7. Design system (identical palette to the B2C and B2B repos)

Remove Tailwind's default palette (`--color-*: initial;`) so **only these colours exist**:

| Token | Values | Use |
|---|---|---|
| `navy-50…900` | 50 `#f2f6fb` · 100 `#e6eef8` · 200 `#c5d6ec` · 600 `#24599b` · 700 `#1d4e89` · 800 `#13315c` · 900 `#0b2545` | Sidebar, headings, links |
| `orange-50…800` | 50 `#fff7ed` · 100 `#ffedd5` · 500 `#f97316` · 600 `#ea580c` · 700 `#c2410c` · 800 `#9a3412` | **Action colour**: primary buttons |
| `gray-50…900` | 50 `#f8fafc` · 100 `#f1f5f9` · 200 `#e2e8f0` · 300 `#cbd5e1` · 400 `#94a3b8` · 500 `#64748b` · 600 `#475569` · 700 `#334155` · 800 `#1e293b` · 900 `#0f172a` | Text, borders, backgrounds |
| `success` | 50 `#f0fdf4` · 600 `#16a34a` · 700 `#15803d` | Paid, delivered, approved, live |
| `warning` | 50 `#fffbeb` · 500 `#f59e0b` · 700 `#b45309` | Pending, low stock, awaiting action |
| `danger` | 50 `#fef2f2` · 600 `#dc2626` · 700 `#b91c1c` | Rejected, overdue, failed, on hold |
| `info` | 50 `#eff6ff` · 700 `#1d4ed8` | In progress, information |
| `white`, `black` | | |

shadcn semantic mapping: `primary` = orange-700 (white text), `secondary` = navy-50 / navy-800, `accent` (hover
background) = gray-100, `muted` = gray-100 / gray-500, `destructive` = danger-700, `border` = gray-200, `input` =
gray-300, `ring` = navy-600, `background` = gray-50, `card` and `popover` = white, `foreground` = gray-900,
`sidebar` = navy-900 with white / navy-200 text. Chart series use navy-700, orange-600, success-600, warning-500,
info-700 and gray-400, in that order. Light mode only. Brand values are placeholders until the client's brand guide
arrives; change them only in `globals.css`. The logo is a text wordmark ("SpareX Admin", "by Kannali Garage") in `Logo.tsx`.

### Look and feel
- **Efficient, calm, trustworthy.** A professional control room: dense, never cramped. **Desktop-first**, fully usable
  on tablet and phone (tables become cards, sidebar becomes a drawer).
- Page background gray-50; content on white cards (`rounded-xl border border-gray-200`, `shadow-sm` at most).
- Radius: cards `rounded-xl`, buttons and inputs `rounded-lg`, badges `rounded-full`.
- **Orange is for action**, with one primary button per page section. Destructive actions are `destructive` and always confirmed.
- Tables: compact rows (`h-12`), right-aligned numbers with `tabular-nums`, sticky header, hover state.
- Tailwind's default spacing scale only. No arbitrary values unless unavoidable, with a comment saying why.

### Typography (Inter)
- Page title `text-2xl font-semibold text-gray-900` (in `PageHeader`, with description and actions)
- Section title `text-lg font-semibold` · Body `text-sm text-gray-700` · Muted `text-gray-500`
- Numbers and money: `font-semibold tabular-nums`. Copy: plain, professional Indian English; sentence case.

### UX rules (non-negotiable)
- Check every screen at **1440px, 1024px, 768px and 375px**. No horizontal page scroll.
- Every data area has **four states**: loading, empty, error, success.
- **Every list screen** has search, filters, sort, pagination and CSV export, with all of them kept in the URL.
- Work needing attention comes first (applications waiting, returns to approve, payments to confirm, overdue credit).
- Every action that changes data shows a toast, and every risky one asks for confirmation (and a reason where §3 says so).
- Money: `formatPrice(paise)` → `₹1,24,999` (Intl `en-IN`). Always label "incl. GST" or "excl. GST".
- Dates `12 Oct 2026`, date-times `12 Oct 2026, 4:30 PM` (IST). Mobile `+91 98450 12345`.
- GSTIN validation `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$`; helpers in `lib/gst.ts`.
- Accessibility: semantic HTML, labels on every input, visible focus rings, keyboard-operable tables, menus and
  dialogs, WCAG AA contrast.

---

## 8. Code rules

- **Server Components by default.** `"use client"` only on the smallest interactive leaf.
- **No inline styles** (`style={{}}`); the only exception is a truly dynamic value passed as a CSS variable.
- No hard-coded colours or sizes; theme tokens only. Repeated class combinations become a component; variants use `cva`.
- Components stay around 150 lines max; table columns live in `columns.tsx`, form schemas in `schemas.ts`.
- TypeScript: no `any`, no `@ts-ignore`, no non-null `!` without a comment.
- **The URL is the source of truth for list state** (search, filters, sort, page).
- Every page sets `metadata` (title). Permissions are checked on the server for routes and actions, not only by hiding buttons.
- Comments explain **why**, not what. No commented-out code, no `console.log`, no unused files or exports.
- Secrets and URLs only through env variables, documented in `.env.example`.
- **Done** is defined by the phase gate in §10.

---

## 9. Screens (59; which phase builds each one is in §10)

Status: **TO BUILD** = build fully. **DEFAULT** = build fully with the default in §3 and keep the open question logged.

### Access
| # | Screen | Status | Notes |
|---|---|---|---|
| A01 | Login | TO BUILD | Email + password; 2-step code step (mandatory for Super Admin) |
| A02 | Forgot / reset password | TO BUILD | |
| A03 | My profile + change password | TO BUILD | Also turn 2-step on / off (Admin only) |

### Home
| # | Screen | Status | Notes |
|---|---|---|---|
| A04 | Dashboard | TO BUILD | **Needs attention** row first (applications waiting, returns to approve, payments to confirm, overdue credit, enquiries). KPIs: customers, B2B businesses, garages (live), vehicles, products, orders, bookings, active job cards, revenue (parts B2C / B2B), pending payments, cancelled orders. Charts: sales last 30 days (B2C vs B2B), orders by status, top categories |

### Users and roles
| # | Screen | Status | Notes |
|---|---|---|---|
| A05 | Admin users list | TO BUILD | |
| A06 | Create / edit admin user | TO BUILD | Name, email, phone, role, active / inactive; invite by email; no custom permissions |
| A07 | Roles (view only) | DEFAULT (Q-01) | Super Admin and Admin with their permission lists |
| A08 | Audit log | TO BUILD | Who, what, when, before → after; filter by entity, user, date; link to the record |

### Customers and vehicles
| # | Screen | Status | Notes |
|---|---|---|---|
| A09 | Customers list | TO BUILD | |
| A10 | Customer detail | TO BUILD | Profile, addresses, vehicles, orders, returns, bookings, enquiries, total spend; **deactivate / reactivate**; **account deletion request** (DPDP) with confirmation |
| A11 | Vehicles list | TO BUILD | Filter by type, brand, model, fuel; owner or "walk-in, not linked" |
| A12 | Vehicle detail | DEFAULT (Q-04) | Digital record: details, documents, owners over time, service history (all garages), parts installed, invoices; **transfer to new owner** |

### B2B businesses and credit
| # | Screen | Status | Notes |
|---|---|---|---|
| A13 | Applications queue | TO BUILD | Submitted, under review, sent back, rejected; age of each application |
| A14 | Application review | TO BUILD | Details, location (Maps link), photos, documents (viewer); approve (set discount %, optionally enable credit) / send back (fields + note) / reject (reason) |
| A15 | Businesses list | TO BUILD | Filter by type, status, credit on / off |
| A16 | Business detail | TO BUILD | Profile, branches, users, discount %, orders, quotations, returns, credit; hold / release account |
| A17 | Credit accounts list | TO BUILD | Limit, used, available, overdue, status |
| A18 | Credit account detail | DEFAULT (Q-11) | Enable / disable, limit, terms, hold; ledger (invoices, payments, credit notes, running balance); record payment |

### Garages
| # | Screen | Status | Notes |
|---|---|---|---|
| A19 | Garages list | TO BUILD | Kannali-owned and partner; live / not live; rating; city |
| A20 | Garage detail | TO BUILD | Profile, photos, services and the garage's prices, branches, staff (B2B garage roles), bookings, job cards, ratings; **go live / take offline** with a checklist (profile, services, prices, hours complete) |

### Masters
| # | Screen | Status | Notes |
|---|---|---|---|
| A21 | Vehicle types | DEFAULT (Q-02) | Bike, scooter, car, commercial |
| A22 | Vehicle brands | TO BUILD | Logo, description, vehicle types |
| A23 | Models, variants, years, fuel | TO BUILD | Nested: brand → models → variants (fuel / engine) → years; add, edit, deactivate |
| A24 | Product categories + subcategories | TO BUILD | Image, order, active |
| A25 | Part brands | TO BUILD | |
| A26 | Service master | DEFAULT (Q-08) | Service categories and service names garages pick from (no prices) |
| A27 | Inspection checklist template | TO BUILD | Engine, brakes, tyres, battery, suspension, lights, AC, electricals, fluids, body; per vehicle type |

### Catalogue
| # | Screen | Status | Notes |
|---|---|---|---|
| A28 | Products list | TO BUILD | Status, stock, category, brand, fitment count ("no fitment" filter) |
| A29 | Product add / edit | TO BUILD | Details, images, specs, part no., SKU, HSN, GST, MRP, B2C price, dimensions, weight, warranty, stock, **fitment manager** (add by brand / model / variant / years, copy from product), SEO title and description, active; installation fields behind `productInstallation` |
| A30 | CSV import | DEFAULT (Q-10) | Products and fitment; template download, preview, per-row errors, confirm |
| A31 | Stock overview | DEFAULT (Q-07) | Quantity per product, low-stock level, adjustment with reason, history |
| A32 | B2B pricing | TO BUILD | Discount % per business (list + bulk edit); preview of a product's B2B price |

### Orders, returns and payments
| # | Screen | Status | Notes |
|---|---|---|---|
| A33 | Orders list | TO BUILD | B2C and B2B; status, payment, channel, date |
| A34 | Order detail | TO BUILD | Items, customer, address, timeline; update status (**courier name + tracking no.** when shipping), mark paid (method + reference), cancel (reason), invoice |
| A35 | Returns and replacements list | TO BUILD | |
| A36 | Return / replacement detail | DEFAULT (Q-12) | Approve / reject (reason), schedule pickup, verify item (photos, condition), refund or credit note, or send replacement |
| A37 | Payments and refunds | TO BUILD | Razorpay and offline; mark paid; refund status |
| A38 | Quotations list | TO BUILD | |
| A39 | Quotation detail | TO BUILD | Auto-priced lines, edit, extra discount, validity (default 7 days), send; history of revisions |
| A58 | Credit notes | TO BUILD | List + detail: linked order / return, amount, GST, applied to refund or credit ledger; PDF placeholder |

### Service
| # | Screen | Status | Notes |
|---|---|---|---|
| A40 | Bookings list | TO BUILD | Date, garage, service, status, pick and drop yes / no |
| A41 | Booking detail | TO BUILD | Read only (including pickup window and addresses), plus cancel with reason |
| A42 | Job cards list | TO BUILD | Filter by garage, status, date |
| A43 | Job card detail | TO BUILD | Read only: check-in, inspection, estimates and per-item approvals (with timestamps), parts, QC, invoice, payment |
| A59 | Garage payouts | DEFAULT (Q-09) | Online service payments owed to partner garages: list per garage, mark settled. Build the screen; hide it from the menu until Q-09 is answered |

### Marketing and content
| # | Screen | Status | Notes |
|---|---|---|---|
| A44 | Banners | TO BUILD | Placements: B2C hero, B2C dashboard promo, B2B offers, announcement strip; web + mobile image, link, schedule, order, active |
| A45 | Featured categories + products | TO BUILD | Drag to reorder (or up / down buttons) for the B2C home |
| A46 | Pages | TO BUILD | Policy pages and help (structured sections), FAQ (question / answer pairs) |
| A47 | Coupons and offers list | DEFAULT (Q-06) | |
| A48 | Coupon / offer create + edit | DEFAULT (Q-06) | Percentage, flat, product, brand, category, first order, B2B, garage, service booking; minimum order value, validity, usage limits |

### Support
| # | Screen | Status | Notes |
|---|---|---|---|
| A49 | Enquiries inbox | TO BUILD | "Vehicle not listed" and "no part fits": status, notes, reply, quick links to add the vehicle or fitment |
| A50 | Reviews moderation | TO BUILD | Garage ratings: publish / hide with reason. Product reviews tab behind `productReviews` |

### Reports
| # | Screen | Status | Notes |
|---|---|---|---|
| A51 | Sales reports | TO BUILD | Daily to yearly; product, brand, category, B2B, B2C |
| A52 | Service reports | TO BUILD | Garage, vehicle, service type, bookings, completed / cancelled, job value |
| A53 | Customer reports | TO BUILD | New, active, repeat, B2B / B2C, lifetime spend |
| A54 | Vehicle reports | TO BUILD | Type-, brand- and model-wise, service frequency, maintenance spend, **fitment gaps** (popular models with few parts) |

### Settings
| # | Screen | Status | Notes |
|---|---|---|---|
| A55 | Settings | DEFAULT (Q-05, Q-12, Q-13) | Tabs: **Business and tax** (legal name, GSTIN, registered address, invoice and credit-note number formats) · **Delivery** (charges, serviceable PINs, COD on / off, limit, fee) · **Orders and returns** (return window, non-returnable categories) · **Quotations** (validity) · **Service** (pickup time windows, inspection fee; time slots behind `bookingTimeSlots`) · **Security** (OTP limits) · **Feature switches** (read-only list of `lib/features.ts`) |
| A56 | Integrations | TO BUILD | Razorpay, SMS / OTP provider: masked keys and status (demo) |
| A57 | 404 / error | TO BUILD | |

---

## 10. Phases and the quality process

The lead starts each phase with **"Do Phase N."** Build only that phase's screens, completely: all states, mobile
layout, permissions, demo data. Don't change files unrelated to the phase.

| Phase | Screens | Count |
|---|---|---|
| 1 | **Foundation:** setup, theme, app shell, every shared block in §6, permissions, `features.ts`, `csv.ts`, all demo data (§12); A01 Login, A02 Forgot / reset, A03 My profile, A57 404 / error | 4 |
| 2 | A04 Dashboard · Masters A21–A27 | 8 |
| 3 | Catalogue A28–A32 | 5 |
| 4 | Customers and vehicles A09–A12 · A49 Enquiries | 5 |
| 5 | B2B businesses and credit A13–A18 | 6 |
| 6 | Garages A19–A20 · Service A40–A43 · A59 Garage payouts | 7 |
| 7 | Orders and payments A33–A34, A37 · Quotations A38–A39 | 5 |
| 8 | Returns A35–A36 · A58 Credit notes · A50 Reviews | 4 |
| 9 | Marketing and content A44–A48 · Admin users, roles, audit log A05–A08 | 9 |
| 10 | Reports A51–A54 · Settings A55 · Integrations A56 · **final sweep** (below) | 6 |
| | **Total** | **59** |

### Quality without slowing down

Quality is built in **while** writing code, so the end of a phase is a short gate, not hours of checking.

**While building (continuous, costs nothing):**
- Write each screen mobile-first and correct the first time: reuse the shared blocks, follow §7–§8, all four states.
- Run `npm run typecheck` and lint the files you touched whenever a screen is finished (`npx eslint <changed paths>`).
  Fix problems immediately, while the context is fresh.
- Never leave a TODO, a commented-out block or a `console.log` behind.

**Phase gate (once per phase, about 10 minutes):**
1. `npm run check` passes. This script runs `typecheck`, `lint` and `format:check` together; add it to
   `package.json` in Phase 1.
2. `npm run build` passes, once.
3. For **this phase's screens only**: open each one at **375px and 1440px**, and check there's no horizontal scroll,
   no console errors, all four states reachable, and actions work. (768 and 1024 are covered in the final sweep.)
4. Self-review your diff once against this checklist: no duplication (reused shared blocks?), no file over ~150 lines,
   no inline styles or arbitrary values, types in `types.ts`, data only through `api.ts`, names a new developer would
   understand. Fix what you find.
5. Write the **phase report** (template below), then **stop**. Don't commit; the lead commits.

**Don't, at the gate:** re-test earlier phases, refactor earlier code, or run the build repeatedly. If you notice an
issue in earlier code, add it to the **Fix list** in your report instead; it's handled at the start of the next phase.

**Phase report template (10–15 lines max):**
```
Phase N done.
Screens: A__ (route), A__ (route), ...
Gate: check ✓  build ✓  375/1440 ✓
Decisions made: (one line each, or "none")
New open questions: Q-__ ... (added to OPEN-QUESTIONS.md, or "none")
Fix list (earlier code): (one line each, or "none")
```

**Start of each phase:** fix the items in the previous report's Fix list and any review notes the lead passes on,
then build the new screens.

**Phase 10, final sweep (the one full check):** every screen at 375 / 768 / 1024 / 1440; consistency of spacing,
headings, buttons, empty states and status colours across all modules; remove anything unused (files, exports,
components); confirm every list has search, filters, sort, pagination and export; update `README.md` (how to run,
folder structure, how to switch a feature from demo to real data).

---

## 11. Open questions: never block, always log

- `OPEN-QUESTIONS.md` lists every open business question with its ID, what it affects and the **default to build with**.
- When you hit something not covered here: **build the simplest sensible version, add a new row** (next free `Q-` ID:
  question, screens affected, default used), and carry on.
- Keep every default **in one place** (a constant in `lib/constants.ts`, a setting, or the permission map) so changing
  it after the client answers is a small edit.

---

## 12. Demo data (realistic, consistent with the B2C and B2B demos)

All of it lives in `src/mocks/`, typed with the feature types. Reuse the names used on the other two sites so the three
demos tell one story: customer **Arjun Rao** (Whitefield, Bengaluru), business **Sri Sai Two Wheeler Works**
(GSTIN `29AAKFS4821M1Z3`, owner Mahesh Kumar), and the same part brands (Motul, Castrol, Shell, Rolon, Bosch,
Uno Minda, Exide, Amaron, MRF, TVS Eurogrip, Philips, Steelbird, plus OEM parts).

- **Admin users:** 2 Super Admins, 4 Admins (one inactive).
- **Customers:** about 40 (a few inactive, one deletion request). **Vehicles:** about 70 across bike, scooter, car and
  commercial, including 3 walk-in vehicles not yet linked to a customer and 1 transferred vehicle.
- **Vehicle master:** about 12 brands across all four types (e.g. Hero, Honda, Bajaj, TVS, Royal Enfield, KTM, Yamaha,
  Suzuki, Maruti Suzuki, Hyundai, Tata, Mahindra), 2–4 models each, variants with fuel types (including electric), 3–5 years.
- **Products:** about 60 across all categories and vehicle types, with fitment; a few with no fitment, a few low or out of stock.
- **Businesses:** about 15 of all types; credit enabled for 5 (one on hold, one overdue). **Applications:** 8 across
  every status.
- **Garages:** 8 (3 Kannali-owned, 5 partners; 1 approved but not live), in Bengaluru, Hosur and Mysuru.
- **Orders:** about 40 (B2C and B2B) across every status and payment method. **Returns:** 6 across every status.
  **Credit notes:** 4. **Quotations:** 6.
- **Bookings:** about 25 (some with pick and drop). **Job cards:** about 15 across every status, with per-item approvals.
- **Content:** 5 banners, 6 featured categories, 8 featured products, the policy pages, 10 FAQs, 4 coupons.
- **Enquiries:** 8. **Garage reviews:** 12 (2 hidden). **Audit entries:** about 60 seeded, plus every change made in the demo.
- Dates spread over the last 3 months. Images go in `public/images/` (free-licence photos downloaded locally and credited
  in `public/images/CREDITS.md`, or the placeholder component). Sample PDFs are marked "sample document for the demo".
