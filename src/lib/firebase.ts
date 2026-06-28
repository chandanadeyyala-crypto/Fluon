import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  deleteDoc,
  writeBatch
} from "firebase/firestore";

// Safe import of automatically generated firebase-applet-config.json
import localConfig from "../../firebase-applet-config.json";

// Allow overriding via environment variables, otherwise use local config values
const metaEnv = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || localConfig.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || localConfig.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || localConfig.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || localConfig.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || localConfig.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || localConfig.appId,
};

// Validate Firebase keys
const missingFirebaseKeys: string[] = [];
if (!firebaseConfig.apiKey) missingFirebaseKeys.push("VITE_FIREBASE_API_KEY");
if (!firebaseConfig.authDomain) missingFirebaseKeys.push("VITE_FIREBASE_AUTH_DOMAIN");
if (!firebaseConfig.projectId) missingFirebaseKeys.push("VITE_FIREBASE_PROJECT_ID");
if (!firebaseConfig.storageBucket) missingFirebaseKeys.push("VITE_FIREBASE_STORAGE_BUCKET");
if (!firebaseConfig.messagingSenderId) missingFirebaseKeys.push("VITE_FIREBASE_MESSAGING_SENDER_ID");
if (!firebaseConfig.appId) missingFirebaseKeys.push("VITE_FIREBASE_APP_ID");

if (missingFirebaseKeys.length > 0) {
  console.error(
    `[Firebase Initialization] CRITICAL: Missing required Firebase environment secrets: ${missingFirebaseKeys.join(", ")}. Please define these in your environment settings.`
  );
} else {
  console.log("[Firebase Initialization] SUCCESS: All Firebase configuration parameters are present.");
}

// Initialize App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth & Providers
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Firestore
export const db = getFirestore(app);

// Authentication helper wrappers
export { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged
};
export type { User };
export {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  writeBatch
};
