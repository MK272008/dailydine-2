export const collections = {
  users: "users",
  restaurants: "restaurants",
  memberships: (restaurantId: string) =>
    `restaurants/${restaurantId}/members`,
  menuCategories: (restaurantId: string) =>
    `restaurants/${restaurantId}/menuCategories`,
  menuItems: (restaurantId: string) => `restaurants/${restaurantId}/menuItems`,
  employeeInvites: (restaurantId: string) =>
    `restaurants/${restaurantId}/employeeInvites`,
  tableSessions: "tableSessions",
  orders: "orders",
  paymentLedger: "paymentLedger",
  auditLogs: "auditLogs",
} as const;
