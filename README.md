# dailydine
# dailydine
# dailydine
# dailydine-2

## Pitch demo

The current implementation is the hardcoded VentureX pitch MVP described in
`pitch_demo_mvp.md`. It is intentionally isolated from Firebase, payments, and
authentication so the complete guest-to-staff story can be demonstrated
quickly.

Run it locally:

```bash
npm run dev
```

Open these links:

- `http://localhost:3000/demo/green-table/table/4` — guest menu and ordering
- `http://localhost:3000/demo/staff` — staff queue
- `http://localhost:3000/demo/green-table` — restaurant landing

Open the guest and staff links in separate browser tabs. Orders are stored in
`localStorage`, and staff status changes are reflected in the guest tracking
page. Use **Reset demo** on the staff page before rehearsing the pitch.

## Production handoff

The demo boundary is deliberately small:

- `lib/demo/data.ts` owns hardcoded restaurants and menu data.
- `lib/demo/store.ts` owns temporary browser persistence and order transitions.
- `app/demo/**` owns the guest and staff presentation.

The production replacement should keep the screens but replace the store
boundary with server-authoritative APIs and Firestore listeners:

| Demo boundary | Production replacement |
|---|---|
| `demoRestaurants` and `demoMenu` | `restaurants`, `menuCategories`, and `menuItems` collections |
| `DemoOrder` in `localStorage` | `orders` collection with server-side totals |
| Custom browser events | Firestore realtime listeners |
| URL table number | Signed, validated table QR context |
| `PAY_AT_TABLE` label | Razorpay order creation and verified webhook status |

Authentication, authorization, employee management, payments, audit records,
and durable persistence remain outside the pitch demo until the production
implementation begins.
