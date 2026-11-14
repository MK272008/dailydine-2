import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifySessionToken } from "@/lib/auth/server";
import { hashInviteToken, verifyInviteToken } from "@/lib/server/invites";

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new Error("Bearer authentication is required");
  }

  return header.slice("Bearer ".length);
}

export async function POST(request: Request) {
  try {
    const token = await verifySessionToken(getBearerToken(request));
    const input = (await request.json()) as { token?: unknown };
    if (typeof input.token !== "string") {
      return NextResponse.json({ error: "Invitation token is required" }, { status: 400 });
    }

    const inviteToken = input.token;
    const invite = verifyInviteToken(inviteToken);
    const db = getAdminDb();
    const inviteRef = db.doc(
      `restaurants/${invite.restaurantId}/employeeInvites/${invite.inviteId}`,
    );
    const memberRef = db.doc(
      `restaurants/${invite.restaurantId}/members/${token.uid}`,
    );

    await db.runTransaction(async (transaction) => {
      const inviteSnapshot = await transaction.get(inviteRef);
      if (!inviteSnapshot.exists || inviteSnapshot.data()?.status !== "ACTIVE") {
        throw new Error("Invitation is no longer active");
      }

      const expiresAt = inviteSnapshot.data()?.expiresAt;
      if (!expiresAt || expiresAt.toMillis() <= Date.now()) {
        throw new Error("Invitation has expired");
      }

      if (inviteSnapshot.data()?.tokenHash !== hashInviteToken(inviteToken)) {
        throw new Error("Invitation token does not match");
      }

      const existingMemberships = await db
        .collectionGroup("members")
        .where("userId", "==", token.uid)
        .get();
      const hasOtherRestaurant = existingMemberships.docs.some(
        (doc) =>
          doc.ref.parent.parent?.id !== invite.restaurantId &&
          ["PENDING", "ACTIVE"].includes(doc.data().status),
      );
      if (hasOtherRestaurant) {
        throw new Error("An employee can belong to only one restaurant");
      }

      transaction.set(
        memberRef,
        {
          restaurantId: invite.restaurantId,
          userId: token.uid,
          role: "EMPLOYEE",
          status: "PENDING",
          permissions: [],
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      transaction.update(inviteRef, {
        status: "USED",
        usedBy: token.uid,
        usedAt: FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json(
      { restaurantId: invite.restaurantId, status: "PENDING" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to submit invitation" },
      { status: 400 },
    );
  }
}
