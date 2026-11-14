# Owner Dashboard

The owner dashboard should be a **verified financial control center**, not another staff order queue. Based on the current architecture, prioritize these features.

## 1. Financial overview

- Gross sales and net sales
- Verified payments only
- Pending, failed, and refunded payments
- Tax collected
- Discounts applied
- Average order value
- Total completed orders
- Comparison with the previous day, week, or month

## 2. Sales analytics

- Sales trend by day, week, and month
- Sales breakdown by:
  - Dine-in
  - Takeaway
  - Pre-order
- Sales by restaurant for owners managing multiple restaurants
- Top-selling menu items and categories
- Peak sales hours and busiest days

## 3. Payment and reconciliation ledger

- Searchable transaction list
- Order ID, payment ID, customer/order type, amount, status, and timestamp
- Razorpay payment and refund references
- Filters for date, payment status, order type, and restaurant
- CSV export
- Drill-down from summary metrics to the underlying orders

## 4. Restaurant and table financial view

- Open table sessions with unpaid totals
- Completed table-session revenue
- Revenue by table or area
- Payment-pending alerts for served dine-in orders
- Session closure and payment history

## 5. Alerts and exceptions

- Failed payments
- Webhook or reconciliation mismatches
- Unusually high refunds
- Abandoned or expired pending orders
- Unpaid completed dine-in sessions

## 6. Access and trust controls

- Owner-only financial access
- Explicit permissions for promoted administrators
- Audit history for refunds, discounts, configuration changes, and access changes
- Restaurant switcher for multi-restaurant owners

## Recommended first version

The first version should include:

- KPI cards
- Sales trend chart
- Order-type breakdown
- Payment-status breakdown
- Recent verified transactions
- Pending-payment alerts

The current demo should not fabricate financial metrics. Live dashboard values should appear only after server-side totals, Razorpay integration, verified webhooks, refunds, and durable Firestore records are implemented.
