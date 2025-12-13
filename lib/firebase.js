

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// STEP 1: Get your Firebase config from Firebase Console
// Go to: https://console.firebase.google.com/
// Project Settings > Your apps > Web app > Config

// STEP 2: Replace ALL values below with YOUR actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBfY6pGFp-X3CMJ-XIXt3kUKlAc4VblWp0",
    authDomain: "suprebaseresearch.firebaseapp.com",
    projectId: "suprebaseresearch",
    storageBucket: "suprebaseresearch.firebasestorage.app",
    messagingSenderId: "656108153577",
    appId: "1:656108153577:web:39cb6cc2295c027c231e78",
    measurementId: "G-G6NYCMJGK4"
  };

// Initialize Firebase only on client side
let app;
let auth;
let db;
let analytics = null;

if (typeof window !== 'undefined') {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  analytics = getAnalytics(app);
}

// Export with fallback for SSR
export { auth, db, analytics };

export default app;

