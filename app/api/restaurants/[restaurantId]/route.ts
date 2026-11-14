import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  requireRestaurantAccess,
  verifySessionToken,
} from "@/lib/auth/server";
import { assertRestaurantInput } from "@/lib/domain/validation";

type RouteContext = {
  params: Promise<{ restaurantId: string }>;
};

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new Error("Bearer authentication is required");
  }

  return header.slice("Bearer ".length);
}

async function getRestaurantId(context: RouteContext) {
  const { restaurantId } = await context.params;
  if (!restaurantId) throw new Error("Restaurant ID is required");
  return restaurantId;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const token = await verifySessionToken(getBearerToken(request));
    const restaurantId = await getRestaurantId(context);
    await requireRestaurantAccess(token.uid, restaurantId);
    const snapshot = await getAdminDb().doc(`restaurants/${restaurantId}`).get();

    return NextResponse.json({
      restaurant: { id: snapshot.id, ...snapshot.data() },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load restaurant" },
      { status: 403 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const token = await verifySessionToken(getBearerToken(request));
    const restaurantId = await getRestaurantId(context);
    const access = await requireRestaurantAccess(
      token.uid,
      restaurantId,
      "restaurant:write",
    );

    if (access.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only the restaurant owner can edit restaurant settings" },
        { status: 403 },
      );
    }

    const input = await request.json();
    const current = (
      await getAdminDb().doc(`restaurants/${restaurantId}`).get()
    ).data();
    assertRestaurantInput({
      ...current,
      ...input,
    });

    await getAdminDb().doc(`restaurants/${restaurantId}`).set(
      {
        name: input.name?.trim() ?? current?.name,
        address: input.address?.trim() ?? current?.address,
        tableCount: input.tableCount ?? current?.tableCount,
        taxPercent: input.taxPercent ?? current?.taxPercent,
        ...(input.fulfillmentSettings
          ? { fulfillmentSettings: input.fulfillmentSettings }
          : {}),
        ...(input.activePreorderWindows
          ? { activePreorderWindows: input.activePreorderWindows }
          : {}),
        ...(input.discountRules ? { discountRules: input.discountRules } : {}),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return NextResponse.json({ restaurantId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update restaurant" },
      { status: 400 },
    );
  }
}
