import { getDemoMenu, type DemoMenuItem } from "./data";

export type DemoOrderStatus = "NEW" | "PREPARING" | "READY" | "SERVED";

export type DemoOrderItem = {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
};

export type DemoOrder = {
  id: string;
  restaurantId: string;
  tableNumber: number;
  customerName: string;
  items: DemoOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: DemoOrderStatus;
  note?: string;
  createdAt: string;
};

const storageKey = "venturex-demo-orders";
const availabilityKey = "venturex-demo-menu-availability";

function getStoredOrders(): DemoOrder[] {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(storageKey);
  if (!stored) return [];
  try {
    const orders = JSON.parse(stored);
    return Array.isArray(orders) ? orders : [];
  } catch {
    return [];
  }
}

function saveOrders(orders: DemoOrder[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(orders));
  window.dispatchEvent(new Event("venturex-demo-orders-changed"));
}

function getStoredAvailability(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  const stored = window.localStorage.getItem(availabilityKey);
  if (!stored) return {};
  try {
    const availability = JSON.parse(stored);
    return availability && typeof availability === "object" ? availability : {};
  } catch {
    return {};
  }
}

export function getDemoMenuAvailability() {
  const stored = getStoredAvailability();
  return getDemoMenu("green-table").reduce<Record<string, boolean>>((result, item) => {
    result[item.id] = stored[item.id] ?? true;
    return result;
  }, {});
}

export function setDemoMenuAvailability(itemId: string, available: boolean) {
  const next = { ...getStoredAvailability(), [itemId]: available };
  window.localStorage.setItem(availabilityKey, JSON.stringify(next));
  window.dispatchEvent(new Event("venturex-demo-menu-availability-changed"));
}

export function resetDemo() {
  window.localStorage.removeItem(storageKey);
  window.localStorage.removeItem(availabilityKey);
  window.dispatchEvent(new Event("venturex-demo-orders-changed"));
  window.dispatchEvent(new Event("venturex-demo-menu-availability-changed"));
}

export function getDemoOrder(orderId: string) {
  return getStoredOrders().find((order) => order.id === orderId);
}

export function getDemoOrders() {
  return getStoredOrders();
}

export function seedDemoOrder() {
  const existing = getStoredOrders();
  if (existing.length > 0) return existing;
  const seed: DemoOrder = {
    id: "VX-1042",
    restaurantId: "green-table",
    tableNumber: 4,
    customerName: "Rohan Mehta",
    items: [
      { menuItemId: "paneer-tikka", name: "Paneer Tikka", quantity: 1, price: 249 },
      { menuItemId: "masala-lemonade", name: "Masala Lemonade", quantity: 2, price: 99 },
    ],
    subtotal: 447,
    tax: 22,
    total: 469,
    status: "PREPARING",
    createdAt: new Date().toISOString(),
  };
  saveOrders([seed]);
  return [seed];
}

export function createDemoOrder({
  restaurantId,
  tableNumber,
  customerName,
  note,
  cart,
}: {
  restaurantId: string;
  tableNumber: number;
  customerName: string;
  note?: string;
  cart: Record<string, number>;
}) {
  const menu = getDemoMenu(restaurantId);
  const items = Object.entries(cart)
    .map(([menuItemId, quantity]) => {
      const item = menu.find((menuItem) => menuItem.id === menuItemId);
      return item && quantity > 0 ? toOrderItem(item, quantity) : null;
    })
    .filter((item): item is DemoOrderItem => item !== null);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order: DemoOrder = {
    id: `VX-${1043 + getStoredOrders().length}`,
    restaurantId,
    tableNumber,
    customerName: customerName.trim(),
    items,
    subtotal,
    tax: Math.round(subtotal * 0.05),
    total: Math.round(subtotal * 1.05),
    status: "NEW",
    note: note?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  saveOrders([...getStoredOrders(), order]);
  return order;
}

function toOrderItem(item: DemoMenuItem, quantity: number): DemoOrderItem {
  return { menuItemId: item.id, name: item.name, quantity, price: item.price };
}

export function updateDemoOrderStatus(orderId: string, status: DemoOrderStatus) {
  const orders = getStoredOrders().map((order) => order.id === orderId ? { ...order, status } : order);
  saveOrders(orders);
}
