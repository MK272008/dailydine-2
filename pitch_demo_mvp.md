# VentureX Pitch Demo MVP

This is the deliberately small, hardcoded version of VentureX for a pitch.
It should feel like a working product in a live demo without requiring Firebase,
Razorpay, authentication, or a real QR-generation service.

The demo has two audiences:

- **Guest:** scans a table QR, browses a restaurant menu, places an order, and
  sees order progress.
- **Staff:** opens a simple live queue, advances orders, and sees which table
  needs attention.

## Demo story

Use this 60-second flow during the pitch:

1. Open the **Table 4 QR** link.
2. Show that VentureX already knows the restaurant and table.
3. Add a Paneer Tikka and a Masala Lemonade.
4. Place the order with the demo customer name.
5. Open the staff queue in another tab and move the order from **New** to
   **Preparing** to **Ready**.
6. Return to the guest screen and show the status changing.
7. Mention that the same foundation supports takeaway, pre-orders, payments,
   employee access, and multiple restaurants in the full product.

## Development phases

Build the demo in this order so each phase produces something usable and
testable.

### Phase 1: Demo foundation

**Goal:** Create the isolated demo surface without affecting production flows.

- Add the `/demo` route structure.
- Add `lib/demo/data.ts` with the restaurants, menus, tables, and sample order.
- Add shared demo types and status constants.
- Reuse the existing VentureX layout, colors, buttons, and cards.
- Add a simple demo home page linking to the guest and staff flows.

**Checkpoint:** `/demo/green-table`, `/demo/green-table/table/4`, and
`/demo/staff` resolve to placeholder screens without authentication.

### Phase 2: QR landing and menu

**Goal:** Make the QR-to-menu experience work.

- Read `restaurantId` and `tableNumber` from the route.
- Validate them against the hardcoded data.
- Show restaurant details, table number, and grouped menu items.
- Add item quantities and a mobile sticky cart summary.
- Add a clear empty-cart state.

**Checkpoint:** A visitor can open Table 4 and build a cart without signing in.

### Phase 3: Cart and order creation

**Goal:** Turn a cart into a dine-in order.

- Build the cart and checkout view.
- Add customer name and optional note fields.
- Calculate subtotal, 5% tax, and total from menu prices.
- Create an order with status `NEW`.
- Generate a readable order number such as `VX-1043`.
- Store the order in the demo store and redirect to its tracking page.

**Checkpoint:** A visitor can place an order and immediately see its order
number, items, total, and `Pay at table` label.

### Phase 4: Guest order tracking

**Goal:** Give the guest a useful status view.

- Build `/demo/order/:orderId`.
- Show restaurant, table, order items, total, and status timeline.
- Add human-readable status messages.
- Read order changes from the shared demo store.
- Refresh the page state on a short interval so a second browser tab can
  reflect staff updates.
- Handle an unknown or expired order with a clear error state.

**Checkpoint:** The tracking page renders all four statuses and does not
silently show stale or missing order data.

### Phase 5: Staff queue

**Goal:** Demonstrate the operational side of VentureX.

- Build the `/demo/staff` queue with the seeded sample order.
- Add restaurant selection.
- Show counts for each order status.
- Render order cards with table, customer, items, total, and time.
- Add only valid actions for the current status:
  `Start preparing`, `Mark ready`, and `Mark served`.
- Persist status changes through the shared demo store.

**Checkpoint:** Staff can advance a guest order from `NEW` to `SERVED`.

### Phase 6: Cross-tab sync and demo polish

**Goal:** Make the pitch flow feel reliable and intentional.

- Use `localStorage` events or the chosen store mechanism to sync changes
  between guest and staff tabs.
- Add loading, empty, invalid-route, and error states.
- Prevent duplicate submissions while an order is being created.
- Add a reset-demo control for rehearsals.
- Verify mobile layout at narrow widths and desktop layout for the staff queue.
- Add the final sample order and make the pitch links easy to find.
- Run the complete 60-second demo from a clean browser session.

**Checkpoint:** The guest and staff tabs visibly stay in sync and the demo can
be reset and replayed without manual data cleanup.

### Phase 7: Production handoff

**Goal:** Keep the prototype easy to replace with the real architecture.

- Keep all hardcoded data and store logic behind `lib/demo`.
- Document the future Firestore collection and listener boundaries.
- Replace local order creation with a server-side API when production work
  begins.
- Replace demo QR links with signed, table-specific QR codes.
- Add authentication, payments, audit records, and authorization only after
  the pitch demo is accepted.

**Checkpoint:** Production work can replace the demo store without redesigning
the guest or staff screens.

## Hardcoded demo data

### Restaurants

| ID | Restaurant | Address | Tables |
|---|---|---|---:|
| `green-table` | The Green Table | 14 Park Street | 12 |
| `coastal-kitchen` | Coastal Kitchen | 8 Marine Drive | 8 |

### Menu for The Green Table

| ID | Category | Item | Price |
|---|---|---|---:|
| `paneer-tikka` | Starters | Paneer Tikka | ₹249 |
| `mushroom-toast` | Starters | Garlic Mushroom Toast | ₹199 |
| `butter-chicken` | Mains | Butter Chicken | ₹349 |
| `dal-makhani` | Mains | Dal Makhani | ₹229 |
| `masala-lemonade` | Drinks | Masala Lemonade | ₹99 |
| `cold-coffee` | Drinks | Cold Coffee | ₹149 |

### Tables and QR links

The QR codes may be generated from these URLs or represented by buttons in the
demo. The QR does not need to be cryptographically signed for this prototype.

```text
/demo/green-table/table/1
/demo/green-table/table/4
/demo/green-table/table/8
/demo/coastal-kitchen/table/2
/demo/coastal-kitchen/table/6
```

Also provide two convenient pitch links:

```text
/demo/green-table
/demo/staff
```

## Screens

### 1. QR landing and menu

Route: `/demo/:restaurantId/table/:tableNumber`

Show:

- VentureX logo.
- Restaurant name and address.
- `Table 4` badge.
- Menu grouped by category.
- Item price and an **Add** button.
- Sticky cart summary at the bottom on mobile.

The table and restaurant come from the URL. No selection form is needed in the
main flow, although a small **Try another table** link can be included for the
demo.

### 2. Cart and order confirmation

Show:

- Selected items and quantity controls.
- Subtotal, 5% demo tax, and total.
- Name field, defaulting to `Aanya Sharma`.
- Optional note field.
- **Place dine-in order** button.

On submit, create a local demo order and navigate to
`/demo/order/:orderId`. Do not show a payment screen; label the order
**Pay at table** to match the dine-in MVP flow.

### 3. Guest order tracking

Route: `/demo/order/:orderId`

Show:

- Order number, restaurant, and table.
- Total and ordered items.
- A four-step progress indicator:
  `Order received → Preparing → Ready → Served`.
- A clear status message such as `The kitchen has received your order`.

The page should update when the staff view changes the status. For a minimal
implementation, use a shared in-memory store or `localStorage` with a
short-interval refresh. Losing the data on a page refresh is acceptable for
the pitch prototype.

### 4. Staff queue

Route: `/demo/staff`

Show:

- Restaurant selector, defaulting to The Green Table.
- Counts for New, Preparing, Ready, and Served.
- Order cards with order number, table, items, total, and time.
- One primary action per order: **Start preparing**, **Mark ready**, or
  **Mark served**.

Seed the queue with one sample order so the screen never looks empty:

```json
{
  "id": "VX-1042",
  "restaurantId": "green-table",
  "tableNumber": 4,
  "customerName": "Rohan Mehta",
  "items": ["Paneer Tikka × 1", "Masala Lemonade × 2"],
  "total": 447,
  "status": "PREPARING"
}
```

## Minimal data model

Keep the prototype data in one client-side module. It should be easy to replace
with Firestore later.

```ts
type DemoOrderStatus = "NEW" | "PREPARING" | "READY" | "SERVED";

type DemoOrder = {
  id: string;
  restaurantId: string;
  tableNumber: number;
  customerName: string;
  items: { menuItemId: string; name: string; quantity: number; price: number }[];
  subtotal: number;
  tax: number;
  total: number;
  status: DemoOrderStatus;
  note?: string;
  createdAt: string;
};
```

Use these status transitions only:

```text
NEW → PREPARING → READY → SERVED
```

The prototype must calculate totals from the hardcoded menu prices rather than
trusting a total supplied by the UI. Payment status can remain
`PAY_AT_TABLE`; real Razorpay handling belongs to the production build.

## Implementation shortcut

Create a small demo surface next to the existing application instead of
changing the production authentication and dashboard flows:

```text
app/demo/[restaurantId]/page.tsx
app/demo/[restaurantId]/table/[tableNumber]/page.tsx
app/demo/order/[orderId]/page.tsx
app/demo/staff/page.tsx
lib/demo/data.ts
lib/demo/store.ts
```

Use the existing design tokens and components where possible. Keep the demo
mobile-first, avoid external images, and use plain CSS cards and emoji or text
icons. A visitor should be able to reach the complete flow with no login and
no environment variables.

## Definition of done

The pitch prototype is ready when:

- Opening a hardcoded table link shows the correct restaurant and table.
- A guest can add menu items, change quantities, and place an order.
- The guest sees a tracking page with the correct total and status.
- Staff can advance the order through all four states.
- The guest tracking page reflects staff status changes.
- `/demo/green-table`, `/demo/green-table/table/4`, and `/demo/staff` work
  without authentication or payment setup.
- The existing `/auth` and `/dashboard` flows remain unchanged.

## Explicitly out of scope

- Real QR scanning or signed QR tokens.
- Firebase persistence and realtime listeners.
- Google/phone authentication.
- Razorpay checkout, webhooks, refunds, and receipts.
- Owner settings, employee approval, menu editing, and analytics.
- Inventory, delivery, discounts, and multi-restaurant permissions.

These are production features described in
`technical_architecture_specification.md`, not requirements for the pitch demo.
