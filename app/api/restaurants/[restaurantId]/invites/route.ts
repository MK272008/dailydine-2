import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireRestaurantAccess, verifySessionToken } from "@/lib/auth/server";
import { createInviteToken, hashInviteToken } from "@/lib/server/invites";

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

export async function POST(request: Request, context: RouteContext) {
  try {
    const token = await verifySessionToken(getBearerToken(request));
    const { restaurantId } = await context.params;
    const access = await requireRestaurantAccess(
      token.uid,
      restaurantId,
      "members:write",
    );
    if (access.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only the owner can generate employee invitations" },
        { status: 403 },
      );
    }

    const inviteId = randomUUID();
    const invite = createInviteToken(inviteId, restaurantId);
    const db = getAdminDb();
    await db.doc(`restaurants/${restaurantId}/employeeInvites/${inviteId}`).set({
      id: inviteId,
      restaurantId,
      createdBy: token.uid,
      status: "ACTIVE",
      tokenHash: hashInviteToken(invite.token),
      expiresAt: Timestamp.fromMillis(invite.expiresAt),
      createdAt: FieldValue.serverTimestamp(),
    });

    const origin = new URL(request.url).origin;
    return NextResponse.json(
      {
        inviteId,
        invitationUrl: `${origin}/join?token=${encodeURIComponent(invite.token)}`,
        expiresAt: new Date(invite.expiresAt).toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create invitation" },
      { status: 403 },
    );
  }
}
