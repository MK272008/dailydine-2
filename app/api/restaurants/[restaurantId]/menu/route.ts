import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireRestaurantAccess, verifySessionToken } from "@/lib/auth/server";

type RouteContext = { params: Promise<{ restaurantId: string }> };

function bearer(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("Bearer authentication is required");
  return header.slice(7);
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const token = await verifySessionToken(bearer(request));
    const { restaurantId } = await context.params;
    await requireRestaurantAccess(token.uid, restaurantId);
    const db = getAdminDb();
    const [categories, items] = await Promise.all([
      db.collection(`restaurants/${restaurantId}/menuCategories`).orderBy("sortOrder").get(),
      db.collection(`restaurants/${restaurantId}/menuItems`).orderBy("name").get(),
    ]);
    return NextResponse.json({
      categories: categories.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      items: items.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load menu" }, { status: 403 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const token = await verifySessionToken(bearer(request));
    const { restaurantId } = await context.params;
    await requireRestaurantAccess(token.uid, restaurantId, "menu:write");
    const input = await request.json();
    const db = getAdminDb();
    const id = randomUUID();
    if (input.type === "category") {
      if (!String(input.name ?? "").trim()) throw new Error("Category name is required");
      await db.doc(`restaurants/${restaurantId}/menuCategories/${id}`).set({
        id, restaurantId, name: String(input.name).trim(), sortOrder: Number(input.sortOrder ?? 0),
        createdAt: FieldValue.serverTimestamp(),
      });
    } else {
      if (!String(input.name ?? "").trim() || !input.categoryId || Number(input.price) < 0) {
        throw new Error("Item name, category, and a valid price are required");
      }
      await db.doc(`restaurants/${restaurantId}/menuItems/${id}`).set({
        id, restaurantId, categoryId: input.categoryId, name: String(input.name).trim(),
        description: String(input.description ?? "").trim(), price: Number(input.price),
        available: input.available !== false, createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save menu item" }, { status: 400 });
  }
}
