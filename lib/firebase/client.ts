import { getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ??
    "AIzaSyCnAMDOkb6EIOJts7G-9daUZSWz0cCZjiQ",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    "daily-dine-f511e.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "daily-dine-f511e",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    "daily-dine-f511e.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "707163108747",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ??
    "1:707163108747:web:d154b30fd1035548942b8e",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-MD623XPXEX",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const clientAuth = getAuth(app);
export const clientDb = getFirestore(app);
export const clientStorage = getStorage(app);

let analyticsPromise: Promise<Analytics | null> | undefined;

export function getClientAnalytics() {
  analyticsPromise ??= isSupported().then((supported) =>
    supported ? getAnalytics(app) : null,
  );
  return analyticsPromise;
}
