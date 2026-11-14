"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getSessionToken, observeAuthState } from "@/lib/auth/client";

declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats: string[] }) => {
      detect(source: HTMLVideoElement): Promise<Array<{ rawValue: string }>>;
    };
  }
}

export default function JoinRestaurantPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const [inviteToken, setInviteToken] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [scanning, setScanning] = useState(false);
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

  useEffect(() => () => stopScanner(), []);

  function stopScanner() {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setScanning(false);
  }

  async function startScanner() {
    if (!window.BarcodeDetector) {
      setMessage("QR scanning is not supported in this browser. Use the invitation link instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setScanning(true);
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const scan = async () => {
        if (!videoRef.current || !streamRef.current) return;
        const codes = await detector.detect(videoRef.current);
        const value = codes[0]?.rawValue;
        if (value) {
          try {
            const url = new URL(value);
            const token = url.searchParams.get("token");
            if (token) {
              setInviteToken(token);
              setMessage("Invitation scanned. You can now submit your request.");
              stopScanner();
              return;
            }
          } catch {
            setMessage("That QR code is not a VentureX invitation.");
          }
        }
        frameRef.current = requestAnimationFrame(() => void scan());
      };
      void scan();
    } catch {
      setMessage("Camera access was unavailable. Paste the invitation link or allow camera access to scan.");
      stopScanner();
    }
  }

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
    return (
      <main className="page-shell">
        <section className="hero-card join-card">
          <p className="eyebrow">Employee invitation</p>
          <h1>Scan your invitation.</h1>
          <p className="muted">Use your camera to scan the QR code shared by the restaurant owner.</p>
          <button type="button" onClick={() => void startScanner()} disabled={scanning}>
            {scanning ? "Looking for a QR code…" : "Scan invitation QR"}
          </button>
          <video ref={videoRef} className={scanning ? "scanner-video" : "scanner-video hidden"} muted playsInline />
          {scanning && <button className="button-secondary" type="button" onClick={stopScanner}>Stop camera</button>}
          {message && <p className="status" role="status">{message}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="hero-card" aria-labelledby="join-heading">
        <p className="eyebrow">Employee invitation</p>
        <h1 id="join-heading">Join a restaurant.</h1>
        <p className="muted">Your request will be sent to the owner for approval before you get access.</p>
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
        {message && <p className="status" role="status">{message}</p>}
      </section>
    </main>
  );
}
