"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "firebase/auth";
import QRCode from "qrcode";
import { observeAuthState, signOutUser } from "@/lib/auth/client";

type Restaurant = {
  id: string;
  name: string;
  address: string;
  tableCount: number;
  taxPercent: number;
  fulfillmentSettings?: {
    dineInEnabled: boolean;
    takeawayEnabled: boolean;
    preorderDineInEnabled: boolean;
  };
  discountRules?: { id: string; name: string; type: "PERCENT" | "FIXED"; value: number; active: boolean }[];
  activePreorderWindows?: { id: string; startTime: string; endTime: string; active: boolean }[];
};

type Member = {
  id: string;
  status: "PENDING" | "ACTIVE" | "REVOKED";
  permissions: string[];
};
type Category = { id: string; name: string };
type MenuItem = {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  available: boolean;
};

const defaultFulfillment = {
  dineInEnabled: true,
  takeawayEnabled: true,
  preorderDineInEnabled: false,
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [message, setMessage] = useState("");
  const [invitationUrl, setInvitationUrl] = useState("");
  const [invitationQr, setInvitationQr] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuName, setMenuName] = useState("");
  const [menuDescription, setMenuDescription] = useState("");
  const [menuPrice, setMenuPrice] = useState("");
  const [menuCategoryId, setMenuCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [editingItemId, setEditingItemId] = useState("");

  useEffect(() => observeAuthState((nextUser) => {
    setUser(nextUser);
    setAuthReady(true);
    if (!nextUser) router.replace("/auth");
  }), [router]);

  useEffect(() => {
    if (user) void loadRestaurants();
  }, [user]);

  async function request(input: RequestInfo | URL, init?: RequestInit) {
    const token = await user!.getIdToken();
    return fetch(input, {
      ...init,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...init?.headers },
    });
  }

  async function loadRestaurants() {
    const response = await request("/api/restaurants");
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error ?? "Unable to load restaurants.");
      return;
    }
    setRestaurants(result.restaurants);
    if (result.restaurants[0]) await selectRestaurant(result.restaurants[0].id, false);
  }

  async function selectRestaurant(restaurantId: string, persist = true) {
    setSelectedRestaurantId(restaurantId);
    if (persist) {
      const response = await request("/api/restaurants/active", {
        method: "PUT", body: JSON.stringify({ restaurantId }),
      });
      if (!response.ok) {
        const result = await response.json();
        setMessage(result.error ?? "Unable to switch restaurant.");
      }
    }
    await Promise.all([loadMembers(restaurantId), loadMenu(restaurantId)]);
  }

  async function loadMembers(restaurantId: string) {
    const response = await request(`/api/restaurants/${restaurantId}/members`);
    const result = await response.json();
    if (response.ok) setMembers(result.members);
  }

  async function loadMenu(restaurantId: string) {
    const response = await request(`/api/restaurants/${restaurantId}/menu`);
    const result = await response.json();
    if (response.ok) {
      setCategories(result.categories);
      setMenuItems(result.items);
      setMenuCategoryId((current) => current || result.categories[0]?.id || "");
    }
  }

  async function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await request(`/api/restaurants/${selectedRestaurantId}/menu`, {
      method: "POST", body: JSON.stringify({ type: "category", name: categoryName }),
    });
    const result = await response.json();
    setMessage(response.ok ? "Category added." : result.error);
    if (response.ok) {
      setCategoryName("");
      await loadMenu(selectedRestaurantId);
    }
  }

  async function saveMenuItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = {
      name: menuName,
      description: menuDescription,
      price: Number(menuPrice),
      categoryId: menuCategoryId,
    };
    const url = `/api/restaurants/${selectedRestaurantId}/menu${editingItemId ? `/${editingItemId}` : ""}`;
    const response = await request(url, {
      method: editingItemId ? "PATCH" : "POST",
      body: JSON.stringify(editingItemId ? body : { type: "item", ...body }),
    });
    const result = await response.json();
    setMessage(response.ok ? `Menu item ${editingItemId ? "updated" : "added"}.` : result.error);
    if (response.ok) {
      setMenuName("");
      setMenuDescription("");
      setMenuPrice("");
      setEditingItemId("");
      await loadMenu(selectedRestaurantId);
    }
  }

  async function deleteMenuEntry(id: string) {
    const response = await request(`/api/restaurants/${selectedRestaurantId}/menu/${id}`, { method: "DELETE" });
    const result = await response.json();
    setMessage(response.ok ? "Menu entry deleted." : result.error);
    if (response.ok) await loadMenu(selectedRestaurantId);
  }

  async function toggleMenuItem(item: MenuItem) {
    const response = await request(`/api/restaurants/${selectedRestaurantId}/menu/${item.id}`, {
      method: "PATCH", body: JSON.stringify({ available: !item.available }),
    });
    if (response.ok) await loadMenu(selectedRestaurantId);
  }

  async function saveRestaurant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const current = restaurants.find((item) => item.id === selectedRestaurantId);
    const fulfillmentSettings = {
      dineInEnabled: form.get("dineInEnabled") === "on",
      takeawayEnabled: form.get("takeawayEnabled") === "on",
      preorderDineInEnabled: form.get("preorderDineInEnabled") === "on",
    };
    const response = await request(`/api/restaurants/${selectedRestaurantId}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: form.get("name"),
        address: form.get("address"),
        tableCount: Number(form.get("tableCount")),
        taxPercent: Number(form.get("taxPercent")),
        fulfillmentSettings,
        activePreorderWindows: form.get("preorderStart") && form.get("preorderEnd")
          ? [{ id: "default", startTime: form.get("preorderStart"), endTime: form.get("preorderEnd"), active: true }]
          : current?.activePreorderWindows ?? [],
      }),
    });
    const result = await response.json();
    setMessage(response.ok ? "Restaurant settings saved." : result.error);
    if (response.ok) await loadRestaurants();
  }

  async function updateMember(member: Member, status: Member["status"]) {
    const response = await request(`/api/restaurants/${selectedRestaurantId}/members`, {
      method: "PATCH",
      body: JSON.stringify({ userId: member.id, status, permissions: member.permissions }),
    });
    const result = await response.json();
    setMessage(response.ok ? "Member updated." : result.error);
    if (response.ok) await loadMembers(selectedRestaurantId);
  }

  async function createInvitation() {
    const response = await request(`/api/restaurants/${selectedRestaurantId}/invites`, { method: "POST" });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error ?? "Unable to create invitation.");
      return;
    }
    setInvitationUrl(result.invitationUrl);
    setInvitationQr(await QRCode.toDataURL(result.invitationUrl));
    setMessage("Invitation created. It expires in 15 minutes and can be used once.");
  }

  const restaurant = restaurants.find((item) => item.id === selectedRestaurantId);
  const fulfillment = restaurant?.fulfillmentSettings ?? defaultFulfillment;
  const preorder = restaurant?.activePreorderWindows?.[0];

  if (!authReady) return <main className="page-shell"><p className="muted">Checking your session…</p></main>;
  if (!user) return null;

  return (
    <main className="page-shell">
      <section className="hero-card dashboard-card" aria-labelledby="dashboard-heading">
        <header className="topbar">
          <div>
            <p className="eyebrow">VentureX operations</p>
            <h1 id="dashboard-heading">Your restaurant, at a glance.</h1>
          </div>
          <button className="button-secondary" type="button" onClick={() => void signOutUser()}>Sign out</button>
        </header>
        <p className="muted">Signed in as {user.email ?? user.phoneNumber}. Keep your menu, team, and service settings in one place.</p>

        {restaurants.length === 0 ? (
          <div className="empty-state panel">
            <h2>Your workspace is ready when you are.</h2>
            <p className="muted">Create your first restaurant from the account setup screen to start managing menus and staff.</p>
            <button type="button" onClick={() => router.push("/auth")}>Set up a restaurant</button>
          </div>
        ) : (
          <>
            <div className="workspace-bar">
              <label>
                Active restaurant
                <select value={selectedRestaurantId} onChange={(event) => void selectRestaurant(event.target.value)}>
                  {restaurants.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <div className="metric"><strong>{menuItems.length}</strong><span>menu items</span></div>
              <div className="metric"><strong>{members.filter((member) => member.status === "ACTIVE").length}</strong><span>active staff</span></div>
            </div>
            {restaurant && (
              <div className="dashboard-grid">
                <div className="stack">
                  <section className="panel">
                    <div className="section-heading"><div><p className="eyebrow">Phase 4</p><h2>Restaurant settings</h2></div><span className="badge">Live</span></div>
                    <form onSubmit={saveRestaurant}>
                      <div className="form-grid">
                        <label>Name<input name="name" defaultValue={restaurant.name} required /></label>
                        <label>Address<input name="address" defaultValue={restaurant.address} required /></label>
                        <label>Tables<input name="tableCount" type="number" min="1" defaultValue={restaurant.tableCount} required /></label>
                        <label>Tax percentage<input name="taxPercent" type="number" min="0" max="100" step="0.01" defaultValue={restaurant.taxPercent} required /></label>
                      </div>
                      <fieldset>
                        <legend>Fulfillment modes</legend>
                        <label className="check-label"><input name="dineInEnabled" type="checkbox" defaultChecked={fulfillment.dineInEnabled} /> Dine-in ordering</label>
                        <label className="check-label"><input name="takeawayEnabled" type="checkbox" defaultChecked={fulfillment.takeawayEnabled} /> Takeaway ordering</label>
                        <label className="check-label"><input name="preorderDineInEnabled" type="checkbox" defaultChecked={fulfillment.preorderDineInEnabled} /> Same-day pre-orders</label>
                      </fieldset>
                      <div className="form-grid">
                        <label>Pre-order opens<input name="preorderStart" type="time" defaultValue={preorder?.startTime ?? "10:00"} /></label>
                        <label>Pre-order closes<input name="preorderEnd" type="time" defaultValue={preorder?.endTime ?? "21:00"} /></label>
                      </div>
                      <button type="submit">Save settings</button>
                    </form>
                  </section>
                  <section className="panel">
                    <div className="section-heading"><div><p className="eyebrow">Menu</p><h2>Build your menu</h2></div><span className="badge">{menuItems.length} items</span></div>
                    <div className="form-grid">
                      <form onSubmit={addCategory}>
                        <label>New category<input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Starters" required /></label>
                        <button type="submit">Add category</button>
                      </form>
                      <form onSubmit={saveMenuItem}>
                        <label>Item name<input value={menuName} onChange={(event) => setMenuName(event.target.value)} placeholder="Paneer tikka" required /></label>
                        <label>Description<input value={menuDescription} onChange={(event) => setMenuDescription(event.target.value)} placeholder="Smoky, chargrilled cottage cheese" /></label>
                        <label>Category<select value={menuCategoryId} onChange={(event) => setMenuCategoryId(event.target.value)} required><option value="">Choose category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
                        <label>Price<input type="number" min="0" step="0.01" value={menuPrice} onChange={(event) => setMenuPrice(event.target.value)} placeholder="249" required /></label>
                        <button type="submit">{editingItemId ? "Update item" : "Add item"}</button>
                        {editingItemId && <button className="button-secondary" type="button" onClick={() => { setEditingItemId(""); setMenuName(""); setMenuDescription(""); setMenuPrice(""); }}>Cancel edit</button>}
                      </form>
                    </div>
                    <div className="menu-list">
                      {menuItems.length === 0 && <p className="muted">Your menu is waiting for its first delicious item.</p>}
                      {menuItems.map((item) => <div className="item-row" key={item.id}><div><strong>{item.name}</strong><span className="item-meta">{item.description || "No description"} · ₹{item.price.toFixed(2)}</span></div><div className="row-actions"><button className="button-secondary" type="button" onClick={() => { setEditingItemId(item.id); setMenuName(item.name); setMenuDescription(item.description ?? ""); setMenuPrice(String(item.price)); setMenuCategoryId(item.categoryId); }}>Edit</button><button type="button" onClick={() => void toggleMenuItem(item)}>{item.available ? "Hide" : "Show"}</button><button className="button-danger" type="button" onClick={() => void deleteMenuEntry(item.id)}>Delete</button></div></div>)}
                    </div>
                  </section>
                </div>
                <aside className="stack">
                  <section className="panel">
                    <p className="eyebrow">Phase 3</p><h2>Invite your team</h2><p className="muted">Create a secure, one-time link for an employee. You approve every request.</p>
                    <button type="button" onClick={() => void createInvitation()}>Generate invitation QR</button>
                    {invitationQr && <div className="invite-preview"><img src={invitationQr} alt="Employee invitation QR code" width={180} height={180} /><input value={invitationUrl} readOnly aria-label="Invitation URL" /></div>}
                  </section>
                  <section className="panel">
                    <div className="section-heading"><div><p className="eyebrow">Team access</p><h2>Members</h2></div><span className="badge">{members.length}</span></div>
                    {members.length === 0 && <p className="muted">No employee requests yet.</p>}
                    <div className="member-list">{members.map((member) => <div className="member-row" key={member.id}><div><strong>{member.id.slice(0, 10)}…</strong><span className={`status-pill status-${member.status.toLowerCase()}`}>{member.status}</span></div><div className="row-actions">{member.status === "PENDING" && <button type="button" onClick={() => void updateMember(member, "ACTIVE")}>Approve</button>}{member.status !== "REVOKED" && <button className="button-danger" type="button" onClick={() => void updateMember(member, "REVOKED")}>Revoke</button>}</div></div>)}</div>
                  </section>
                </aside>
              </div>
            )}
          </>
        )}
        {message && <p className="status" role="status">{message}</p>}
      </section>
    </main>
  );
}
