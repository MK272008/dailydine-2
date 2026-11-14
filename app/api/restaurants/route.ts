import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifySessionToken } from "@/lib/auth/server";
import { assertRestaurantInput } from "@/lib/domain/validation";

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new Error("Bearer authentication is required");
  }

  return header.slice("Bearer ".length);
}

export async function GET(request: Request) {
  try {
    const token = await verifySessionToken(getBearerToken(request));
    const db = getAdminDb();
    const owned = await db
      .collection("restaurants")
      .where("ownerId", "==", token.uid)
      .get();
    const memberships = await db
      .collectionGroup("members")
      .where("userId", "==", token.uid)
      .where("status", "==", "ACTIVE")
      .get();
    const restaurantIds = new Set(owned.docs.map((doc) => doc.id));

    memberships.docs.forEach((doc) => {
      const restaurantId = doc.ref.parent.parent?.id;
      if (restaurantId) restaurantIds.add(restaurantId);
    });

    const restaurants = await Promise.all(
      [...restaurantIds].map(async (id) => {
        const snapshot = await db.doc(`restaurants/${id}`).get();
        return snapshot.exists ? { id: snapshot.id, ...snapshot.data() } : null;
      }),
    );

    return NextResponse.json({ restaurants: restaurants.filter(Boolean) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load restaurants" },
      { status: 401 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = await verifySessionToken(getBearerToken(request));
    const input = await request.json();
    assertRestaurantInput(input);
    const db = getAdminDb();
    const restaurantId = randomUUID();

    await db.doc(`restaurants/${restaurantId}`).set({
      id: restaurantId,
      ownerId: token.uid,
      name: input.name.trim(),
      address: input.address.trim(),
      tableCount: input.tableCount,
      taxPercent: input.taxPercent,
      discountRules: [],
      fulfillmentSettings: {
        dineInEnabled: true,
        takeawayEnabled: true,
        preorderDineInEnabled: false,
      },
      activePreorderWindows: [],
      createdAt: FieldValue.serverTimestamp(),
    });

    await db.doc(`restaurants/${restaurantId}/members/${token.uid}`).set({
      restaurantId,
      userId: token.uid,
      role: "OWNER",
      status: "ACTIVE",
      permissions: ["*"],
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ restaurantId }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create restaurant" },
      { status: 400 },
    );
  }
}
