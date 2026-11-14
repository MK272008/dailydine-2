"use client";

import { FormEvent, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
      <section className={`hero-card auth-card ${user ? "setup-card" : ""}`} aria-labelledby="auth-heading">
        <Link className="auth-brand" href="/">VentureX<span className="brand-dot">.</span></Link>
        {!authReady && <p className="muted">Checking your session…</p>}
        {!user ? (
          <div className="auth-form-wrap">
            <p className="eyebrow">Welcome back</p>
            <h1 id="auth-heading">Sign in to your workspace.</h1>
            <p className="muted">Manage your menu, team, and service from one calm place.</p>
            <button type="button" onClick={handleGoogleSignIn} disabled={busy}>Continue with Google</button>
            <div className="divider">or continue with phone</div>
            <form onSubmit={handlePhoneSubmit}>
              <label>Phone number<input type="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="+91 98765 43210" required disabled={Boolean(confirmation)} /></label>
              {confirmation && <label>Verification code<input inputMode="numeric" value={verificationCode} onChange={(event) => setVerificationCode(event.target.value)} placeholder="6-digit code" required /></label>}
              <div id="recaptcha-container" />
              <button type="submit" disabled={busy}>{confirmation ? "Verify and sign in" : "Send verification code"}</button>
            </form>
            <p className="form-note">Your account is protected by Firebase authentication.</p>
            {message && <p className="status" role="status">{message}</p>}
          </div>
        ) : (
          <div className="setup-layout">
            <div className="setup-heading">
              <div><p className="eyebrow">Welcome to VentureX</p><h1 id="auth-heading">Set up your restaurant.</h1><p className="muted">A few details now, a clearer service later.</p></div>
              <span className="setup-step">Step 1 of 1</span>
            </div>
            <div className="setup-account"><span className="account-avatar">{(displayName || user.email || "U").slice(0, 1).toUpperCase()}</span><div><strong>{user.email ?? user.phoneNumber}</strong><span>Account verified</span></div><button className="button-secondary" type="button" onClick={handleSignOut}>Sign out</button></div>
            <form className="restaurant-form" onSubmit={saveProfile}>
              <div className="form-section-title"><span>01</span><div><h2>Your profile</h2><p className="muted">Tell us who is running the show.</p></div></div>
              <label>Display name<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Aanya Mehta" required /></label>
              <label>Account type<select value={role} onChange={(event) => setRole(event.target.value as "OWNER" | "EMPLOYEE")}><option value="OWNER">Restaurant owner</option><option value="EMPLOYEE">Team member</option></select></label>
              <button type="submit">Save profile</button>
            </form>
            {role === "OWNER" && <form className="restaurant-form setup-section" onSubmit={createRestaurant}>
              <div className="form-section-title"><span>02</span><div><h2>Add your restaurant</h2><p className="muted">You can change these details anytime.</p></div></div>
              <label>Restaurant name<input value={restaurantName} onChange={(event) => setRestaurantName(event.target.value)} placeholder="The Green Table" required /></label>
              <label>Address<input value={restaurantAddress} onChange={(event) => setRestaurantAddress(event.target.value)} placeholder="12 Market Street, Bengaluru" required /></label>
              <div className="form-grid"><label>Number of tables<input type="number" min="1" value={tableCount} onChange={(event) => setTableCount(event.target.value)} required /></label><label>Tax rate<input type="number" min="0" max="100" step="0.01" value={taxPercent} onChange={(event) => setTaxPercent(event.target.value)} required /></label></div>
              <button type="submit">Create restaurant</button>
            </form>}
            {restaurants.length > 0 && <div className="setup-section existing-restaurants"><div className="form-section-title"><span>03</span><div><h2>Your restaurants</h2><p className="muted">Choose where you want to work.</p></div></div>{restaurants.map((restaurant) => <button className="restaurant-choice" key={restaurant.id} type="button" onClick={() => selectRestaurant(restaurant.id)}><span>{restaurant.name}<small>{restaurant.address}</small></span><span aria-hidden="true">→</span></button>)}</div>}
            <div className="setup-footer"><button className="button-secondary" type="button" onClick={handleTokenCheck}>Check session</button><Link className="button-link" href="/dashboard">Open dashboard →</Link></div>
            <details className="account-options"><summary>Account security options</summary><div className="account-options-body"><button className="button-secondary" type="button" onClick={handleLinkGoogle}>Link Google account</button><form onSubmit={handlePhoneLink}><label>Link a phone number<input type="tel" value={phoneLinkNumber} onChange={(event) => setPhoneLinkNumber(event.target.value)} placeholder="+91 98765 43210" required disabled={Boolean(phoneLinkConfirmation)} /></label>{phoneLinkConfirmation && <input inputMode="numeric" value={phoneLinkCode} onChange={(event) => setPhoneLinkCode(event.target.value)} placeholder="Verification code" required />}<div id="phone-link-recaptcha" /><button type="submit">{phoneLinkConfirmation ? "Verify phone link" : "Send link code"}</button></form>{linkingGoogle && <button type="button" onClick={handleLinkPendingGoogle}>Finish linking Google</button>}</div></details>
            {message && <p className="status" role="status">{message}</p>}
          </div>
        )}
      </section>
    </main>
  );
}
