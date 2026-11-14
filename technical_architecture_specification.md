# VentureX Restaurant Platform

## Technical Architecture Specification

This document translates the project blueprint into an implementation-ready technical architecture for the MVP.

---

## 1. Product Scope

The system is a multi-tenant restaurant operations platform with three ordering flows:

1. **Anonymous dine-in**
   - A customer scans a table QR code.
   - A table session is created.
   - The customer orders food from the restaurant menu.
   - Food is delivered to the table.
   - Payment is completed after the meal.

2. **Anonymous takeaway**
   - A customer scans a reception QR code.
   - The customer places an order for packed food.
   - The customer pays through Razorpay before preparation.
   - The customer receives a pickup token.

3. **Authenticated pre-order dine-in**
   - The customer signs in using Google or phone OTP.
   - The customer selects a restaurant and same-day time window.
   - The customer orders and prepays before arriving.
   - No specific table is selected during pre-ordering.

Delivery is excluded from the MVP and may be added later.

---

## 2. User Roles

### 2.1 Owner

Owners authenticate using Google Sign-In or phone OTP. An owner can:

- Create and manage multiple restaurants.
- Configure restaurant details, tables, menu, taxes, and discounts.
- Configure same-day pre-order time windows.
- Generate employee invitation QR codes.
- Approve or reject employee join requests.
- Revoke employee access immediately.
- Select one active restaurant for realtime monitoring.
- View financial dashboards and verified payment records.
- Promote trusted employees to restaurant administrators.

### 2.2 Employee

Employees authenticate using Google Sign-In or phone OTP and must join exactly one restaurant.

The employee workflow is:

1. Register or sign in.
2. Scan an owner-generated restaurant invitation QR.
3. Submit a membership request.
4. Wait for owner approval.
5. Access the restaurant operational dashboard.

Employees can:

- View orders.
- Change order status.
- Mark orders as served, picked up, or completed.
- Toggle menu item availability.
- View required customer contact details.

Employees cannot access financial dashboards or owner-only configuration.

### 2.3 Promoted Administrator

A promoted administrator is an employee granted additional restaurant permissions by the owner.

Depending on assigned permissions, an administrator may access:

- Financial dashboards.
- Restaurant configuration.
- Menu management.
- Employee management.

Permissions must be explicit and enforced through Firestore Security Rules and server-side authorization.

### 2.4 Customer

Customers may be anonymous or authenticated depending on the order flow:

| Flow | Authentication |
|---|---|
| Dine-in | Not required |
| Takeaway | Not required |
| Pre-order dine-in | Required |

Supported authentication providers are:

- Google Sign-In
- Phone OTP

Google and phone identities should be linkable to one user account.

---

## 3. Technology Stack

- **Application:** One Next.js App Router website
- **Language:** Strict TypeScript
- **Styling:** Mobile-first CSS in the Next.js application
- **Authentication:** Firebase Authentication
- **Database:** Cloud Firestore
- **File storage:** Firebase Storage
- **Backend APIs:** Next.js route handlers and server actions using the Firebase Admin SDK
- **Payments:** Razorpay, integrated through Next.js server routes and webhooks
- **Deployment:** Vercel for the website and Firebase for managed services
- **Realtime updates:** Firestore listeners
- **Notifications:** In-app notifications and browser audio notifications

There is no native mobile application, second frontend, or package workspace.
Owners, employees, and customers use the same responsive website;
role-based routing and authorization determine the available experience.

The website is mobile-oriented first: primary customer flows target narrow
screens, use touch-sized controls, minimize navigation depth, and progressively
enhance for tablets and desktop operational dashboards.

### 3.1 Repository Structure

```text
app/
├── (customer)/                # QR ordering, menu, cart, checkout, tracking
├── (dashboard)/               # Owner and employee web dashboards
├── api/                       # Razorpay, invitations, and protected APIs
├── globals.css                # Mobile-first design tokens and global styles
├── layout.tsx
└── page.tsx

lib/
├── firebase/
│   ├── admin.ts               # Server-only Firebase Admin initialization
│   └── client.ts              # Browser Firebase initialization
├── auth/                      # Session and role authorization helpers
├── domain/                    # Domain types and state-transition logic
└── server/                    # Server-side totals, tokens, and validation

public/                        # Static icons and QR-related assets
firebase.json                  # Firebase service configuration
firestore.rules                # Firestore authorization rules
package.json
tsconfig.json
```

Server-only modules must never be imported by client components. Firebase
credentials are supplied through environment variables and are not committed.

---

## 4. Authentication and Authorization

### 4.1 Authentication Providers

The MVP supports:

- Google Sign-In
- Phone OTP

Email/password authentication is excluded.

Users authenticated through different providers should be linkable when the verified identity belongs to the same person.

### 4.2 User Model

```ts
type UserRole = "OWNER" | "EMPLOYEE";

interface User {
  id: string;
  role: UserRole;
  displayName: string;
  phoneNumber?: string;
  email?: string;
  photoUrl?: string;
  activeRestaurantId?: string;
  createdAt: Timestamp;
}
```

### 4.3 Restaurant Membership

```ts
type MembershipStatus = "PENDING" | "ACTIVE" | "REVOKED";

interface RestaurantMembership {
  restaurantId: string;
  userId: string;
  role: "OWNER" | "EMPLOYEE";
  status: MembershipStatus;
  permissions: string[];
  approvedBy?: string;
  createdAt: Timestamp;
  revokedAt?: Timestamp;
}
```

Employees may belong to only one restaurant.

---

## 5. Restaurant and Employee Management

### 5.1 Restaurant Model

```ts
interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  tableCount: number;
  taxPercent: number;
  discountRules: DiscountRule[];
  fulfillmentSettings: {
    dineInEnabled: boolean;
    takeawayEnabled: boolean;
    preorderDineInEnabled: boolean;
  };
  activePreorderWindows: PreorderWindow[];
  createdAt: Timestamp;
}
```

### 5.2 Employee Invitation QR

Employee invitation QR codes must be:

- Short-lived.
- Signed.
- Single-use.
- Invalidated after the employee submits a join request.
- Revoked if the owner cancels the invitation.

```ts
interface EmployeeInvite {
  id: string;
  restaurantId: string;
  createdBy: string;
  status: "ACTIVE" | "USED" | "EXPIRED" | "REVOKED";
  expiresAt: Timestamp;
  usedBy?: string;
  createdAt: Timestamp;
}
```

After an employee uses the QR code, the owner must generate a new QR code for the next employee.

---

## 6. Restaurant Configuration

Owners can configure:

- Restaurant name and address.
- Number of tables.
- Menu categories and items.
- Item availability.
- Tax percentage.
- Discount rules.
- Dine-in availability.
- Takeaway availability.
- Pre-order dine-in availability.
- Same-day pre-order time windows.

Employees may toggle item availability but cannot change financial configuration unless promoted.

---

## 7. Ordering Domain Model

### 7.1 Order Types

```ts
type OrderType = "DINE_IN" | "TAKEAWAY" | "PREORDER_DINE_IN";
```

### 7.2 Payment Status

```ts
type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";
```

### 7.3 Order Model

```ts
interface Order {
  id: string;
  restaurantId: string;
  customerId?: string;
  orderType: OrderType;

  tableSessionId?: string;
  tableNumber?: number;
  pickupToken?: string;

  preorderWindow?: {
    date: string;
    startTime: string;
    endTime: string;
  };

  customerDetails?: {
    name?: string;
    phone?: string;
  };

  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;

  payment: {
    status: PaymentStatus;
    gateway: "RAZORPAY";
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    paidAt?: Timestamp;
  };

  status: OrderStatus;
  trackingTokenHash?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

All monetary totals must be calculated server-side from Firestore menu prices and restaurant configuration. Client-provided totals must never be trusted.

---

## 8. Fulfillment State Machines

### 8.1 Dine-In

```text
CREATED
→ ACCEPTED
→ PREPARING
→ READY
→ SERVED
→ PAYMENT_PENDING
→ PAID
→ COMPLETED
```

Dine-in orders may enter the kitchen before payment. The table session closes after the final payment and order completion.

### 8.2 Takeaway

```text
CREATED
→ PAYMENT_PENDING
→ PAID
→ PREPARING
→ READY_FOR_PICKUP
→ PICKED_UP
→ COMPLETED
```

Takeaway orders require successful Razorpay payment before preparation begins.

### 8.3 Pre-Order Dine-In

```text
CREATED
→ PAYMENT_PENDING
→ PAID
→ SCHEDULED
→ PREPARING
→ READY
→ SERVED
→ COMPLETED
```

Pre-orders are authenticated, prepaid, and restricted to configured same-day time windows.

---

## 9. Table Sessions

A dine-in QR identifies a table and creates or joins a table session.

```ts
interface TableSession {
  id: string;
  restaurantId: string;
  tableNumber: number;
  status: "OPEN" | "CLOSED";
  openedAt: Timestamp;
  closedAt?: Timestamp;
}
```

Requirements:

- Multiple orders may be placed within one table session.
- The table number must come from the signed or validated QR context.
- Employees may close a session after payment.
- The system should automatically close a session after the final payment and completion.
- A timeout fallback should close abandoned sessions after a configurable period.

---

## 10. Payment Architecture

### 10.1 Takeaway and Pre-Order

1. Customer creates a cart.
2. Next.js calculates the authoritative total.
3. Server creates a Razorpay order.
4. Customer completes Razorpay checkout.
5. Razorpay sends a signed webhook.
6. Server verifies the webhook signature.
7. Server marks the order as paid.
8. The order becomes visible in the operational queue.

### 10.2 Dine-In

1. Customer creates a dine-in order.
2. The order is accepted and prepared without payment.
3. Employee marks the order as served.
4. The customer completes Razorpay payment after eating.
5. The webhook marks the order as paid.
6. The table session is closed after all active orders are completed.

### 10.3 Payment Reliability

The backend must implement:

- Razorpay webhook signature verification.
- Idempotency based on Razorpay order/payment IDs.
- Duplicate webhook protection.
- Failed payment handling.
- Expired pending-order handling.
- Refund status handling.
- Server-side price and discount calculation.

Financial dashboards must count only verified payments.

---

## 11. Customer Tracking

Anonymous dine-in and takeaway customers receive a private tracking URL containing a random tracking token.

Only a hash of the token should be stored in Firestore.

The tracking page can display:

- Order confirmation.
- Preparation status.
- Ready status.
- Pickup token for takeaway.
- Table service status for dine-in.
- Payment status where applicable.

Authenticated pre-order customers may access their orders through their account.

---

## 12. Security Requirements

- Firestore Security Rules must enforce restaurant membership.
- Employees can read only operational data for their assigned restaurant.
- Employees cannot read financial aggregates, payment ledgers, or owner settings.
- Owners can access all restaurants they own.
- Promoted administrators receive only explicitly assigned permissions.
- Clients cannot directly change payment status.
- Razorpay webhooks are the authority for successful online payment.
- Payment webhooks must be idempotent.
- Employee invitation QR codes must be signed, short-lived, and single-use.
- Revoked employees must immediately lose access.
- Anonymous tracking tokens must be unguessable and stored only as hashes.
- All status transitions must be validated server-side.
- Membership and order changes should create audit records.

---

## 13. Development Phases

### Phase 1: Single Website and Infrastructure

- Initialize one Next.js App Router website.
- Configure Firebase Authentication, Firestore, Storage, and Admin SDK.
- Configure Vercel environments.
- Create domain types, validation schemas, and server-side authorization helpers
  inside the Next.js project.
- Establish Firestore collections and Security Rules test infrastructure.

### Phase 2: Authentication and Roles

- Implement Google authentication.
- Implement phone OTP authentication.
- Implement provider account linking.
- Create owner and employee role selection.
- Create user profile completion.
- Implement restaurant ownership and memberships.
- Implement owner restaurant switching.
- Implement active restaurant selection.

### Phase 3: Restaurant and Employee Management

- Build restaurant creation and editing.
- Generate short-lived employee invitation QR codes.
- Implement employee invitation QR scanning in the website.
- Create pending membership requests.
- Add owner approval and rejection.
- Add employee revocation.
- Add promoted-administrator permissions.
- Implement immediate authorization invalidation.

### Phase 4: Menu and Restaurant Configuration

- Build menu CRUD.
- Add categories and item customization.
- Add item availability toggles.
- Add tax configuration.
- Add discount configuration.
- Add fulfillment-mode toggles.
- Add same-day pre-order windows.
- Add Firebase Storage image uploads.

### Phase 5: QR and Table Sessions

- Generate table-specific dine-in QRs.
- Generate reception takeaway QR.
- Generate pre-order restaurant links.
- Create table sessions from table QR scans.
- Support multiple orders per session.
- Implement employee and timeout-based session closure.

### Phase 6: Customer Ordering

- Implement anonymous dine-in ordering.
- Implement anonymous takeaway ordering.
- Implement authenticated pre-order dine-in ordering.
- Build menu and cart interfaces.
- Add item notes.
- Add tax and discount calculations.
- Generate takeaway pickup tokens.
- Generate anonymous tracking tokens.
- Build customer order tracking.

### Phase 7: Razorpay Integration

- Implement server-side Razorpay order creation.
- Implement prepaid takeaway payments.
- Implement prepaid pre-order payments.
- Implement post-meal dine-in payment.
- Implement checkout integration.
- Implement signed webhook verification.
- Implement idempotent payment processing.
- Implement failures, expiration, and refunds.

### Phase 8: Owner and Employee Operations

- Build realtime order queues.
- Add fulfillment-specific status controls.
- Add active-restaurant monitoring.
- Add browser audio alerts.
- Add browser audio notifications.
- Build owner financial dashboard.
- Build promoted-admin dashboard permissions.
- Add verified transaction ledger.
- Add audit history.

### Phase 9: Testing and Hardening

- Unit-test money, tax, discounts, tokens, and state transitions.
- Integration-test server APIs and Razorpay flows.
- Test Firestore Security Rules with the Firebase Emulator.
- Test authentication and role transitions.
- Test webhook replay and idempotency.
- Test QR expiry and single-use behavior.
- Test table-session concurrency.
- Run end-to-end flows for:
  - Employee joining and approval.
  - Anonymous dine-in.
  - Anonymous takeaway.
  - Authenticated pre-order dine-in.
  - Employee revocation.
  - Dine-in payment and session closure.

---

## 14. Critical Implementation Rule

The owner queue must not filter exclusively on paid orders.

The queue should include:

- Paid takeaway orders.
- Paid pre-order dine-in orders.
- Active dine-in orders regardless of payment status.

Financial dashboards must count only verified Razorpay payments and completed dine-in payments.
