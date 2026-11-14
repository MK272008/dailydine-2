import type { AuthCredential } from "firebase/auth";

export class AccountLinkingRequiredError extends Error {
  constructor(public readonly credential: AuthCredential) {
    super("This account already exists with another sign-in provider.");
    this.name = "AccountLinkingRequiredError";
  }
}

export function getAuthErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") {
    return "Authentication failed. Please try again.";
  }

  const code = "code" in error ? String(error.code) : "";
  const message =
    "message" in error && typeof error.message === "string"
      ? error.message
      : "";
  switch (code) {
    case "auth/account-exists-with-different-credential":
      return "This email is already registered with another provider. Sign in with that provider, then link this one.";
    case "auth/credential-already-in-use":
      return "That sign-in credential is already linked to another account.";
    case "auth/provider-already-linked":
      return "This provider is already linked to your account.";
    case "auth/invalid-verification-code":
      return "The verification code is invalid or expired.";
    case "auth/invalid-phone-number":
      return "Enter a valid phone number in international format.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait and try again later.";
    case "auth/popup-closed-by-user":
      return "The sign-in window was closed.";
    default:
      return message || "Authentication failed. Please try again.";
  }
}
