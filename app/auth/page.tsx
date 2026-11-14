"use client";

import { FormEvent, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import {
  getSessionToken,
  linkPendingCredential,
  linkPhoneAccount,
  linkGoogleAccount,
  observeAuthState,
  resetRecaptchaVerifier,
  sendPhoneOtp,
  signInWithGoogle,
  signOutUser,
} from "@/lib/auth/client";
import {
  AccountLinkingRequiredError,
  getAuthErrorMessage,
} from "@/lib/auth/errors";

type RestaurantSummary = {
  id: string;
  name: string;
  address: string;
};

export default function AuthPage() {
  const router = useRouter();
  const [redirectPath, setRedirectPath] = useState("/dashboard");
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmation, setConfirmation] =
    useState<Awaited<ReturnType<typeof sendPhoneOtp>>>();
  const [phoneLinkConfirmation, setPhoneLinkConfirmation] =
    useState<Awaited<ReturnType<typeof linkPhoneAccount>>>();
  const [phoneLinkNumber, setPhoneLinkNumber] = useState("");
  const [phoneLinkCode, setPhoneLinkCode] = useState("");
  const [linkingGoogle, setLinkingGoogle] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"OWNER" | "EMPLOYEE">("OWNER");
  const [restaurants, setRestaurants] = useState<RestaurantSummary[]>([]);
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantAddress, setRestaurantAddress] = useState("");
  const [tableCount, setTableCount] = useState("10");
  const [taxPercent, setTaxPercent] = useState("5");
  const [message, setMessage] = useState("");

  useEffect(
    () =>
      observeAuthState((nextUser) => {
        setUser(nextUser);
        setAuthReady(true);
      }),
    [],
  );

  useEffect(() => {
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    if (redirect?.startsWith("/")) setRedirectPath(redirect);
  }, []);

  useEffect(() => {
    if (!user) return;

    void (async () => {
      try {
        const response = await authenticatedRequest("/api/auth/profile");
        const result = await response.json();
        if (result.profile) {
          setDisplayName(result.profile.displayName ?? "");
          setRole(result.profile.role ?? "OWNER");
        }
        await loadRestaurants();
      } catch {
        setMessage("Signed in, but profile data could not be loaded.");
      }
    })();
  }, [user]);

  async function handleGoogleSignIn() {
    setBusy(true);
    try {
      await signInWithGoogle();
      setMessage("Signed in with Google.");
      router.push(redirectPath);
    } catch (error) {
      if (error instanceof AccountLinkingRequiredError) {
        setLinkingGoogle(true);
      }
      setMessage(getAuthErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function handlePhoneSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setBusy(true);

    try {
      if (!confirmation) {
        setConfirmation(await sendPhoneOtp(phoneNumber, "recaptcha-container"));
        setMessage("Verification code sent.");
        return;
      }

      await confirmation.confirm(verificationCode);
      setMessage("Phone sign-in successful.");
      router.push(redirectPath);
    } catch (error) {
      setMessage(getAuthErrorMessage(error));
      setConfirmation(undefined);
      resetRecaptchaVerifier("recaptcha-container");
    } finally {
      setBusy(false);
    }
  }

  async function handleTokenCheck() {
    try {
      await getSessionToken();
      setMessage("Session token verified locally.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No active session");
    }

  }

  async function handleSignOut() {
    await signOutUser();
    setRestaurants([]);
    setDisplayName("");
    setMessage("Signed out.");
  }

  async function handleLinkGoogle() {
    try {
      await linkGoogleAccount();
      setMessage("Google account linked.");
    } catch (error) {
      setMessage(getAuthErrorMessage(error));
    }
  }

  async function handleLinkPendingGoogle() {
    try {
      await linkPendingCredential();
      setLinkingGoogle(false);
      setMessage("Google account linked.");
    } catch (error) {
      setMessage(getAuthErrorMessage(error));
    }
  }

  async function handlePhoneLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (!phoneLinkConfirmation) {
        setPhoneLinkConfirmation(
          await linkPhoneAccount(phoneLinkNumber, "phone-link-recaptcha"),
        );
        setMessage("Phone linking code sent.");
        return;
      }

      await phoneLinkConfirmation.confirm(phoneLinkCode);
      setPhoneLinkConfirmation(undefined);
      setPhoneLinkCode("");
      setMessage("Phone number linked.");
    } catch (error) {
      setMessage(getAuthErrorMessage(error));
      setPhoneLinkConfirmation(undefined);
      resetRecaptchaVerifier("phone-link-recaptcha");
    }
  }

  async function authenticatedRequest(
    input: RequestInfo | URL,
    init?: RequestInit,
  ) {
    const token = await getSessionToken();
    return fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...init?.headers,
      },
    });
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const response = await authenticatedRequest("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify({ displayName, role }),
      });
      const result = await response.json();
      setMessage(response.ok ? "Profile saved." : result.error);
      if (response.ok) await loadRestaurants();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Profile update failed");
    }
  }

  async function loadRestaurants() {
    try {
      const response = await authenticatedRequest("/api/restaurants");
      const result = await response.json();
      if (response.ok) {
        setRestaurants(result.restaurants);
      } else {
        setMessage(result.error ?? "You are not authorized to view restaurants.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load restaurants");
    }
  }

  async function createRestaurant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await authenticatedRequest("/api/restaurants", {
      method: "POST",
      body: JSON.stringify({
        name: restaurantName,
        address: restaurantAddress,
        tableCount: Number(tableCount),
        taxPercent: Number(taxPercent),
      }),
    });
    const result = await response.json();
    setMessage(response.ok ? "Restaurant created." : result.error);
    if (response.ok) await loadRestaurants();
  }

  async function selectRestaurant(restaurantId: string) {
    const response = await authenticatedRequest("/api/restaurants/active", {
      method: "PUT",
      body: JSON.stringify({ restaurantId }),
    });
    const result = await response.json();
    setMessage(response.ok ? "Active restaurant updated." : result.error);
  }

  return (
    <main className="page-shell">
      <section className="hero-card auth-layout" aria-labelledby="auth-heading">
        <div className="auth-intro">
          <p className="eyebrow">VentureX for restaurants</p>
          <h1 id="auth-heading">Run your restaurant with confidence.</h1>
          <p className="muted">
            Sign in to manage your menu, team, tables, and customer orders from one calm workspace.
          </p>
        </div>
        {!authReady && <p className="muted">Checking authentication…</p>}
        <div className="auth-grid">
          <div className="panel">
            <h2>Welcome back</h2>
            <button type="button" onClick={handleGoogleSignIn} disabled={busy}>
              Continue with Google
            </button>
            <div className="divider">or use your phone</div>
            <form onSubmit={handlePhoneSubmit}>
              <label>
              Phone number
              <input
                type="tel"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                placeholder="+919876543210"
                required
                disabled={Boolean(confirmation)}
              />
              </label>
              {confirmation && (
              <label>
                Verification code
                <input inputMode="numeric" value={verificationCode} onChange={(event) => setVerificationCode(event.target.value)} required />
              </label>
              )}
              <div id="recaptcha-container" />
              <button type="submit" disabled={busy}>{confirmation ? "Verify code" : "Send code"}</button>
            </form>
            {message && <p className="status" role="status">{message}</p>}
          </div>
          <div className="panel">
            <h2>Your account</h2>
            <p className="muted">Use Google or phone OTP. You can securely link both methods after signing in.</p>
            <button type="button" onClick={handleTokenCheck}>Check current session</button>
          </div>
        </div>
        {user && (
          <div className="panel stack">
            <p className="success">Signed in as {user.email ?? user.phoneNumber}</p>
            <button type="button" onClick={handleLinkGoogle}>
              Link Google account
            </button>
            <form onSubmit={handlePhoneLink}>
              <h2>Link phone number</h2>
              <input
                type="tel"
                value={phoneLinkNumber}
                onChange={(event) => setPhoneLinkNumber(event.target.value)}
                placeholder="+919876543210"
                required
                disabled={Boolean(phoneLinkConfirmation)}
              />
              {phoneLinkConfirmation && (
                <input
                  inputMode="numeric"
                  value={phoneLinkCode}
                  onChange={(event) => setPhoneLinkCode(event.target.value)}
                  placeholder="Verification code"
                  required
                />
              )}
              <div id="phone-link-recaptcha" />
              <button type="submit">
                {phoneLinkConfirmation ? "Verify phone link" : "Send link code"}
              </button>
            </form>
            {linkingGoogle && (
              <button type="button" onClick={handleLinkPendingGoogle}>
                Finish linking Google
              </button>
            )}
            <button type="button" onClick={handleSignOut}>
              Sign out
            </button>
            <form onSubmit={saveProfile}>
              <h2>Complete your profile</h2>
              <label>
                Display name
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  required
                />
              </label>
              <label>
                Account type
                <select
                  value={role}
                  onChange={(event) =>
                    setRole(event.target.value as "OWNER" | "EMPLOYEE")
                  }
                >
                  <option value="OWNER">Owner</option>
                  <option value="EMPLOYEE">Employee</option>
                </select>
              </label>
              <button type="submit">Save profile</button>
            </form>
            {role === "OWNER" && (
              <form onSubmit={createRestaurant}>
                <h2>Create a restaurant</h2>
                <label>
                  Restaurant name
                  <input
                    value={restaurantName}
                    onChange={(event) => setRestaurantName(event.target.value)}
                    required
                  />
                </label>
                <label>
                  Address
                  <input
                    value={restaurantAddress}
                    onChange={(event) => setRestaurantAddress(event.target.value)}
                    required
                  />
                </label>
                <label>
                  Tables
                  <input
                    type="number"
                    min="1"
                    value={tableCount}
                    onChange={(event) => setTableCount(event.target.value)}
                    required
                  />
                </label>
                <label>
                  Tax percentage
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={taxPercent}
                    onChange={(event) => setTaxPercent(event.target.value)}
                    required
                  />
                </label>
                <button type="submit">Create restaurant</button>
              </form>
            )}
            {restaurants.length > 0 && (
              <div>
                <h2>Your restaurants</h2>
                {restaurants.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    type="button"
                    onClick={() => selectRestaurant(restaurant.id)}
                  >
                    {restaurant.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
