import "server-only";

import type { DecodedIdToken } from "firebase-admin/auth";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

export async function verifySessionToken(token: string): Promise<DecodedIdToken> {
  if (!token.trim()) {
    throw new Error("A Firebase session token is required");
  }

  return getAdminAuth().verifyIdToken(token);
}

export function requireUser(decodedToken: DecodedIdToken): string {
  if (!decodedToken.uid) {
    throw new Error("Authenticated user token is missing a user ID");
  }

  return decodedToken.uid;
}

export async function requireRestaurantAccess(
  userId: string,
  restaurantId: string,
  permission?: string,
) {
  const db = getAdminDb();
  const restaurantSnapshot = await db.doc(`restaurants/${restaurantId}`).get();

  if (!restaurantSnapshot.exists) {
    throw new Error("Restaurant not found");
  }

  const restaurant = restaurantSnapshot.data();
  if (restaurant?.ownerId === userId) {
    return { role: "OWNER" as const, permissions: ["*"] };
  }

  const membershipSnapshot = await db
    .doc(`restaurants/${restaurantId}/members/${userId}`)
    .get();
  const membership = membershipSnapshot.data();

  if (
    !membershipSnapshot.exists ||
    membership?.status !== "ACTIVE" ||
    (permission && !membership.permissions?.includes(permission))
  ) {
    throw new Error("User is not authorized for this restaurant");
  }

  return {
    role: membership.role,
    permissions: membership.permissions ?? [],
  };
}
