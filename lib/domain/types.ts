import type { Timestamp } from "firebase/firestore";

export type UserRole = "OWNER" | "EMPLOYEE";
export type MembershipStatus = "PENDING" | "ACTIVE" | "REVOKED";
export type OrderType = "DINE_IN" | "TAKEAWAY" | "PREORDER_DINE_IN";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type Money = number;

export type OrderStatus =
  | "CREATED"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "SERVED"
  | "PAYMENT_PENDING"
  | "PAID"
  | "COMPLETED"
  | "READY_FOR_PICKUP"
  | "PICKED_UP"
  | "SCHEDULED";

export interface DiscountRule {
  id: string;
  name: string;
  type: "PERCENT" | "FIXED";
  value: number;
  active: boolean;
}

export interface PreorderWindow {
  id: string;
  startTime: string;
  endTime: string;
  active: boolean;
}

export interface User {
  id: string;
  role: UserRole;
  displayName: string;
  phoneNumber?: string;
  email?: string;
  photoUrl?: string;
  activeRestaurantId?: string;
  createdAt: Timestamp;
}

export interface RestaurantMembership {
  restaurantId: string;
  userId: string;
  role: UserRole;
  status: MembershipStatus;
  permissions: string[];
  approvedBy?: string;
  createdAt: Timestamp;
  revokedAt?: Timestamp;
}

export interface Restaurant {
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

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  sortOrder: number;
  createdAt: Timestamp;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: Money;
  available: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface EmployeeInvite {
  id: string;
  restaurantId: string;
  createdBy: string;
  status: "ACTIVE" | "USED" | "EXPIRED" | "REVOKED";
  expiresAt: Timestamp;
  usedBy?: string;
  createdAt: Timestamp;
}

export interface TableSession {
  id: string;
  restaurantId: string;
  tableNumber: number;
  status: "OPEN" | "CLOSED";
  openedAt: Timestamp;
  closedAt?: Timestamp;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: Money;
  notes?: string;
}

export interface Order {
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
  subtotal: Money;
  taxAmount: Money;
  discountAmount: Money;
  totalAmount: Money;
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

export interface PaymentLedgerEntry {
  id: string;
  restaurantId: string;
  orderId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amount: Money;
  status: PaymentStatus;
  verifiedAt: Timestamp;
}

export interface AuditLog {
  id: string;
  restaurantId: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  createdAt: Timestamp;
}
