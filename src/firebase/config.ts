// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAvr8psTRHtlEgsku76hBWAY6w9AC1uISM",
  authDomain: "gastronomic-ai-landing.firebaseapp.com",
  databaseURL: "https://gastronomic-ai-landing-default-rtdb.firebaseio.com",
  projectId: "gastronomic-ai-landing",
  storageBucket: "gastronomic-ai-landing.firebasestorage.app",
  messagingSenderId: "307426584779",
  appId: "1:307426584779:web:12998d261619a25a5dd34e"
};

// Initialize Firebase securely (prevents duplication errors in Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export { app };
