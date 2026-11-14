"use client";

import {
  type AuthCredential,
  type ConfirmationResult,
  GoogleAuthProvider,
  linkWithPhoneNumber,
  PhoneAuthProvider,
  RecaptchaVerifier,
  User,
  linkWithCredential,
  linkWithPopup,
  onAuthStateChanged,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import type { FirebaseError } from "firebase/app";
import { clientAuth } from "@/lib/firebase/client";
import { AccountLinkingRequiredError } from "@/lib/auth/errors";

const recaptchaVerifiers = new Map<string, RecaptchaVerifier>();
let pendingCredential: AuthCredential | undefined;

export function observeAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(clientAuth, (user) => {
    callback(user);
    void syncServerSession(user);
  });
}

async function syncServerSession(user: User | null) {
  if (user) {
    await fetch("/api/auth/session", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${await user.getIdToken()}`,
      },
    });
    return;
  }

  await fetch("/api/auth/session", { method: "DELETE" });
}

export async function signInWithGoogle() {
  try {
    return await signInWithPopup(clientAuth, new GoogleAuthProvider());
  } catch (error) {
    const firebaseError = error as FirebaseError;
    if (firebaseError.code === "auth/account-exists-with-different-credential") {
      const credential = GoogleAuthProvider.credentialFromError(firebaseError);
      if (credential) {
        pendingCredential = credential;
        throw new AccountLinkingRequiredError(credential);
      }
    }

    throw error;
  }
}

export async function linkGoogleAccount() {
  if (!clientAuth.currentUser) {
    throw new Error("Sign in before linking Google");
  }

  return linkWithPopup(clientAuth.currentUser, new GoogleAuthProvider());
}

export function getRecaptchaVerifier(containerId: string) {
  if (!recaptchaVerifiers.has(containerId)) {
    recaptchaVerifiers.set(
      containerId,
      new RecaptchaVerifier(clientAuth, containerId, {
      size: "invisible",
      }),
    );
  }

  return recaptchaVerifiers.get(containerId)!;
}

export function resetRecaptchaVerifier(containerId: string) {
  recaptchaVerifiers.get(containerId)?.clear();
  recaptchaVerifiers.delete(containerId);
}

export async function sendPhoneOtp(
  phoneNumber: string,
  containerId: string,
): Promise<ConfirmationResult> {
  if (!phoneNumber.trim()) {
    throw new Error("A phone number is required");
  }

  return signInWithPhoneNumber(
    clientAuth,
    phoneNumber,
    getRecaptchaVerifier(containerId),
  );
}

export async function linkPhoneAccount(
  phoneNumber: string,
  containerId: string,
): Promise<ConfirmationResult> {
  if (!clientAuth.currentUser) {
    throw new Error("Sign in before linking a phone number");
  }

  const verifier = getRecaptchaVerifier(containerId);
  return linkWithPhoneNumber(clientAuth.currentUser, phoneNumber, verifier);
}

export function createPhoneCredential(
  verificationId: string,
  verificationCode: string,
) {
  return PhoneAuthProvider.credential(verificationId, verificationCode);
}

export async function linkCredential(credential: AuthCredential) {
  if (!clientAuth.currentUser || !credential) {
    throw new Error("A signed-in user and credential are required");
  }

  return linkWithCredential(clientAuth.currentUser, credential);
}

export async function linkPendingCredential() {
  if (!pendingCredential) {
    throw new Error("No pending provider link is available");
  }

  const result = await linkCredential(pendingCredential);
  pendingCredential = undefined;
  return result;
}

export async function signOutUser() {
  await signOut(clientAuth);
}

export async function getSessionToken() {
  if (!clientAuth.currentUser) {
    throw new Error("Authentication is required");
  }

  return clientAuth.currentUser.getIdToken();
}
