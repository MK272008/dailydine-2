import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireRestaurantAccess, verifySessionToken } from "@/lib/auth/server";

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

export async function GET(request: Request, context: RouteContext) {
  try {
    const token = await verifySessionToken(getBearerToken(request));
    const { restaurantId } = await context.params;
    await requireRestaurantAccess(token.uid, restaurantId, "members:read");
    const snapshot = await getAdminDb()
      .collection(`restaurants/${restaurantId}/members`)
      .get();

    return NextResponse.json({
      members: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load members" },
      { status: 403 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const token = await verifySessionToken(getBearerToken(request));
    const { restaurantId } = await context.params;
    const access = await requireRestaurantAccess(token.uid, restaurantId);
    if (access.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only the restaurant owner can manage members" },
        { status: 403 },
      );
    }

    const input = (await request.json()) as {
      userId?: unknown;
      status?: unknown;
      permissions?: unknown;
    };
    if (
      typeof input.userId !== "string" ||
      (input.status !== "PENDING" &&
        input.status !== "ACTIVE" &&
        input.status !== "REVOKED") ||
      !Array.isArray(input.permissions) ||
      !input.permissions.every((permission) => typeof permission === "string")
    ) {
      return NextResponse.json({ error: "Invalid membership update" }, { status: 400 });
    }

    if (input.userId === token.uid) {
      return NextResponse.json(
        { error: "The owner membership cannot be changed here" },
        { status: 400 },
      );
    }

    await getAdminDb()
      .doc(`restaurants/${restaurantId}/members/${input.userId}`)
      .set(
        {
          restaurantId,
          userId: input.userId,
          role: "EMPLOYEE",
          status: input.status,
          permissions: input.permissions,
          ...(input.status === "REVOKED"
            ? { revokedAt: FieldValue.serverTimestamp() }
            : {}),
        },
        { merge: true },
      );

    return NextResponse.json({ userId: input.userId, status: input.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update member" },
      { status: 400 },
    );
  }
}
