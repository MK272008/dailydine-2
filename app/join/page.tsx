"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSessionToken, observeAuthState } from "@/lib/auth/client";

export default function JoinRestaurantPage() {
  const router = useRouter();
  const [inviteToken, setInviteToken] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(
    () =>
      observeAuthState((user) => {
        setSignedIn(Boolean(user));
        setReady(true);
      }),
    [],
  );

  useEffect(() => {
    setInviteToken(new URLSearchParams(window.location.search).get("token") ?? "");
  }, []);

  async function submitRequest() {
    try {
      const response = await fetch("/api/employee/invites/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getSessionToken()}`,
        },
        body: JSON.stringify({ token: inviteToken }),
      });
      const result = await response.json();
      setMessage(response.ok ? "Join request submitted for owner approval." : result.error);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to submit join request");
    }
  }

  if (!inviteToken) {
    return <main className="page-shell">This invitation link is incomplete.</main>;
  }

  return (
    <main className="page-shell">
      <section className="hero-card" aria-labelledby="join-heading">
        <p className="eyebrow">Employee invitation</p>
        <h1 id="join-heading">Join a restaurant.</h1>
        {!ready && <p className="muted">Checking your session…</p>}
        {ready && !signedIn && (
          <>
            <p className="muted">Sign in before submitting this join request.</p>
            <button
              type="button"
              onClick={() =>
                router.push(`/auth?redirect=${encodeURIComponent(`/join?token=${inviteToken}`)}`)
              }
            >
              Sign in
            </button>
          </>
        )}
        {ready && signedIn && (
          <button type="button" onClick={submitRequest}>
            Submit join request
          </button>
        )}
        {message && <p className="muted">{message}</p>}
      </section>
    </main>
  );
}
