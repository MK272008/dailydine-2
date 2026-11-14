import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireRestaurantAccess, verifySessionToken } from "@/lib/auth/server";

type RouteContext = { params: Promise<{ restaurantId: string; menuId: string }> };
function bearer(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("Bearer authentication is required");
  return header.slice(7);
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const token = await verifySessionToken(bearer(request));
    const { restaurantId, menuId } = await context.params;
    await requireRestaurantAccess(token.uid, restaurantId, "menu:write");
    const input = await request.json();
    const db = getAdminDb();
    const itemRef = db.doc(`restaurants/${restaurantId}/menuItems/${menuId}`);
    const categoryRef = db.doc(`restaurants/${restaurantId}/menuCategories/${menuId}`);
    const item = await itemRef.get();
    const ref = item.exists ? itemRef : categoryRef;
    if (!(await ref.get()).exists) throw new Error("Menu entry not found");
    await ref.set({ ...input, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return NextResponse.json({ id: menuId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update menu entry" }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const token = await verifySessionToken(bearer(request));
    const { restaurantId, menuId } = await context.params;
    await requireRestaurantAccess(token.uid, restaurantId, "menu:write");
    const db = getAdminDb();
    const itemRef = db.doc(`restaurants/${restaurantId}/menuItems/${menuId}`);
    const categoryRef = db.doc(`restaurants/${restaurantId}/menuCategories/${menuId}`);
    const item = await itemRef.get();
    await (item.exists ? itemRef : categoryRef).delete();
    return NextResponse.json({ id: menuId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete menu entry" }, { status: 400 });
  }
}
