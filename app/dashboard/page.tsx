"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "firebase/auth";
import { observeAuthState, signOutUser } from "@/lib/auth/client";
import QRCode from "qrcode";

type Restaurant = {
  id: string;
  name: string;
  address: string;
  tableCount: number;
  taxPercent: number;
};

type Member = {
  id: string;
  status: "PENDING" | "ACTIVE" | "REVOKED";
  permissions: string[];
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

  useEffect(() => {
    return observeAuthState((nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (!nextUser) router.replace("/auth");
    });
  }, [router]);

  useEffect(() => {
    if (!user) return;
    void loadRestaurants();
  }, [user]);

  async function request(
    input: RequestInfo | URL,
    init?: RequestInit,
  ) {
    const token = await user!.getIdToken();
    return fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...init?.headers,
      },
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
    if (result.restaurants[0]) {
      setSelectedRestaurantId(result.restaurants[0].id);
      await loadMembers(result.restaurants[0].id);
    }
  }

  async function loadMembers(restaurantId: string) {
    const response = await request(
      `/api/restaurants/${restaurantId}/members`,
    );
    const result = await response.json();
    if (response.ok) setMembers(result.members);
  }

  async function saveRestaurant(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await request(
      `/api/restaurants/${selectedRestaurantId}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          name: form.get("name"),
          address: form.get("address"),
          tableCount: Number(form.get("tableCount")),
          taxPercent: Number(form.get("taxPercent")),
        }),
      },
    );
    const result = await response.json();
    setMessage(response.ok ? "Restaurant updated." : result.error);
    if (response.ok) await loadRestaurants();
  }

  async function updateMember(member: Member, status: Member["status"]) {
    const response = await request(
      `/api/restaurants/${selectedRestaurantId}/members`,
      {
        method: "PATCH",
        body: JSON.stringify({
          userId: member.id,
          status,
          permissions: member.permissions,
        }),
      },
    );
    const result = await response.json();
    setMessage(response.ok ? "Member updated." : result.error);
    if (response.ok) await loadMembers(selectedRestaurantId);
  }

  async function createInvitation() {
    const response = await request(
      `/api/restaurants/${selectedRestaurantId}/invites`,
      { method: "POST" },
    );
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error ?? "Unable to create invitation.");
      return;
    }

    setInvitationUrl(result.invitationUrl);
    setInvitationQr(await QRCode.toDataURL(result.invitationUrl));
    setMessage("Invitation created. It expires in 15 minutes and can be used once.");
  }

  if (!authReady) {
    return <main className="page-shell">Checking your session…</main>;
  }

  if (!user) {
    return null;
  }

  return (
    <main className="page-shell">
      <section className="hero-card" aria-labelledby="dashboard-heading">
        <p className="eyebrow">VentureX dashboard</p>
        <h1 id="dashboard-heading">Welcome back.</h1>
        <p className="muted">{user.email ?? user.phoneNumber}</p>
        {restaurants.length > 0 && (
          <>
            <label>
              Restaurant
              <select
                value={selectedRestaurantId}
                onChange={(event) => {
                  setSelectedRestaurantId(event.target.value);
                  void loadMembers(event.target.value);
                }}
              >
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </label>
            {(() => {
              const restaurant = restaurants.find(
                (item) => item.id === selectedRestaurantId,
              );
              if (!restaurant) return null;
              return (
                <form onSubmit={saveRestaurant}>
                  <h2>Restaurant settings</h2>
                  <input name="name" defaultValue={restaurant.name} required />
                  <input
                    name="address"
                    defaultValue={restaurant.address}
                    required
                  />
                  <input
                    name="tableCount"
                    type="number"
                    min="1"
                    defaultValue={restaurant.tableCount}
                    required
                  />
                  <input
                    name="taxPercent"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    defaultValue={restaurant.taxPercent}
                    required
                  />
                  <button type="submit">Save restaurant</button>
                </form>
              );
            })()}
            <h2>Members</h2>
            <button type="button" onClick={createInvitation}>
              Generate employee invitation
            </button>
            {invitationQr && (
              <>
                <img
                  src={invitationQr}
                  alt="Employee invitation QR code"
                  width={220}
                  height={220}
                />
                <input value={invitationUrl} readOnly aria-label="Invitation URL" />
              </>
            )}
            {members.map((member) => (
              <div key={member.id}>
                <span>
                  {member.id} — {member.status}
                </span>
                {member.status !== "ACTIVE" && (
                  <button type="button" onClick={() => updateMember(member, "ACTIVE")}>
                    Approve
                  </button>
                )}
                {member.status !== "REVOKED" && (
                  <button type="button" onClick={() => updateMember(member, "REVOKED")}>
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </>
        )}
        {message && <p className="muted">{message}</p>}
        <button type="button" onClick={() => void signOutUser()}>
          Sign out
        </button>
      </section>
    </main>
  );
}
