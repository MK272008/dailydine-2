# Daily Dine Product Record

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Customers:** Restaurant guests who scan a table QR code, browse the menu,
  place a dine-in order, and track its progress. The current demo supports
  anonymous ordering.
- **Employees:** Restaurant staff who need to see current orders and update
  their statuses. They must not see owner-only financial information or
  configuration.
- **Owners:** Restaurant owners who will eventually manage restaurant
  operations and view sales and verified payment records through a
  financial dashboard.

## Product Purpose

Daily Dine connects table-based restaurant ordering with staff operations.
Guests should be able to order with less friction, while employees can
process the resulting orders and owners can ultimately connect verified
payments to sales visibility.

The current implementation is a self-contained pitch demo. It demonstrates
the guest-to-staff journey without a backend, authentication, or real
payments.

## Positioning

Daily Dine is a lightweight, QR-led restaurant experience that makes the
entire guest-to-staff loop easy to demonstrate: a table order is placed,
managed by staff, and tracked by the guest in one responsive web experience.
The eventual product extends that loop with owner-only financial visibility
without giving operational employees access to sensitive sales data.

## Operating Context

- Guests enter through restaurant and table-specific QR destinations.
- Employees work from an operational dashboard showing active orders and
  valid status transitions.
- Owners require a separate dashboard for sales, payment records, and future
  restaurant configuration.
- Future staff operations should organize multiple demo tables and their QR
  destinations in visually manageable cards, with orders shown beneath the
  relevant table.
- The project is used as a pitch walkthrough, with guest and staff flows
  demonstrated in separate browser tabs.

## Capabilities and Constraints

- Current demo flows include restaurant landing pages, table menus, cart
  review, customer name and kitchen note, demo tax and totals, pay-at-table
  labeling, order tracking, staff status updates, seeded orders, reset
  behavior, and cross-tab updates.
- Current demo data is hardcoded and stored temporarily in browser
  `localStorage`; it is not server-authoritative.
- Authentication, Firebase persistence, Razorpay payments, verified
  webhooks, owner authorization, employee membership, and financial
  dashboards are not implemented in the demo.
- The eventual system must enforce role separation: owners can access
  financial dashboards; employees can access current orders and status
  actions only.
- The application is a Next.js App Router website using strict TypeScript and
  mobile-first CSS.
- Delivery is outside the current product scope.

## Brand Commitments

- Product name: **Daily Dine**
- Slogan: **Hassle free dining**
- The supplied logo is the brand reference at `logo.jpeg` and
  `public/logo.jpeg`.

## Evidence on Hand

- `logo.jpeg` and `public/logo.jpeg` provide the current logo and slogan.
- `technical_architecture_specification.md` defines the intended production
  roles, ordering flows, payment direction, and authorization boundaries.
- `README.md` and `pitch_demo_mvp.md` define the current demo boundary and
  walkthrough.
- `app/demo/**` contains the current guest and staff presentation.
- `lib/demo/data.ts` and `lib/demo/store.ts` contain the current demo data and
  temporary persistence boundary.

No production payment records, customer testimonials, or financial metrics are
available; future work must not fabricate them.

## Product Principles

1. Make table ordering fast and low-friction for guests.
2. Keep staff workflows focused on current orders and clear status changes.
3. Keep financial and administrative visibility owner-only.
4. Preserve a convincing end-to-end demo boundary while production services
   are deferred.
5. Organize restaurant operations so table context remains visible and
   manageable.

## Accessibility & Inclusion

The product is mobile-oriented and should preserve touch-friendly controls,
clear status communication, responsive layouts, and role-appropriate
information access. No additional product-specific accessibility standard has
been confirmed.
