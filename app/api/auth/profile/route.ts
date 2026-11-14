import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import type { UserRole } from "@/lib/domain/types";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifySessionToken } from "@/lib/auth/server";

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
    const input = (await request.json()) as {
      displayName?: unknown;
      role?: unknown;
    };

    if (
      typeof input.displayName !== "string" ||
      input.displayName.trim().length < 2 ||
      (input.role !== "OWNER" && input.role !== "EMPLOYEE")
    ) {
      return NextResponse.json(
        { error: "A display name and valid role are required" },
        { status: 400 },
      );
    }

    const role = input.role as UserRole;
    const db = getAdminDb();
    const userRef = db.doc(`users/${token.uid}`);
    const existing = await userRef.get();

    if (existing.exists && existing.data()?.role !== role) {
      return NextResponse.json(
        { error: "A user's role cannot be changed after profile creation" },
        { status: 409 },
      );
    }

    await userRef.set(
      {
        id: token.uid,
        role,
        displayName: input.displayName.trim(),
        email: token.email ?? null,
        phoneNumber: token.phone_number ?? null,
        photoUrl: token.picture ?? null,
        ...(existing.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
      },
      { merge: true },
    );

    return NextResponse.json({ id: token.uid, role });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save profile" },
      { status: 401 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const token = await verifySessionToken(getBearerToken(request));
    const snapshot = await getAdminDb().doc(`users/${token.uid}`).get();

    return NextResponse.json({
      profile: snapshot.exists ? { id: snapshot.id, ...snapshot.data() } : null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load profile" },
      { status: 401 },
    );
  }
}
