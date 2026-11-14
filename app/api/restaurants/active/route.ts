import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireRestaurantAccess, verifySessionToken } from "@/lib/auth/server";

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new Error("Bearer authentication is required");
  }

  return header.slice("Bearer ".length);
}

export async function PUT(request: Request) {
  try {
    const token = await verifySessionToken(getBearerToken(request));
    const input = (await request.json()) as { restaurantId?: unknown };

    if (typeof input.restaurantId !== "string" || !input.restaurantId.trim()) {
      return NextResponse.json(
        { error: "A restaurant ID is required" },
        { status: 400 },
      );
    }

    await requireRestaurantAccess(token.uid, input.restaurantId);
    await getAdminDb().doc(`users/${token.uid}`).set(
      { activeRestaurantId: input.restaurantId },
      { merge: true },
    );

    return NextResponse.json({ activeRestaurantId: input.restaurantId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to select restaurant" },
      { status: 403 },
    );
  }
}
