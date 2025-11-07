

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics (only in browser)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;

