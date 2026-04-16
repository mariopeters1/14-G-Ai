import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
const firebaseConfig = {
  apiKey: "AIzaSyBH9F9faJSUGCDZHS8DtS86aBb6Hdi1mDk",
  authDomain: "gastronomic14g.firebaseapp.com",
  projectId: "gastronomic14g",
  storageBucket: "gastronomic14g.firebasestorage.app",
  messagingSenderId: "755614320114",
  appId: "1:755614320114:web:a7b61292a84547bb4f576b",
  measurementId: "G-VFTY0VNCB2"
};

// Initialize Firebase only if we have keys and are not strictly mocking
let app: ReturnType<typeof initializeApp> | any = null;
let auth: ReturnType<typeof getAuth> | any = null;
let db: ReturnType<typeof getFirestore> | any = null;
let analytics: ReturnType<typeof getAnalytics> | any = null;

if (typeof window !== 'undefined' && firebaseConfig.apiKey && firebaseConfig.apiKey !== 'AIzaSy...placeholder') {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Conditionally initialize Analytics if supported
  isSupported().then(supported => {
    if (supported) analytics = getAnalytics(app);
  });
}

export { app, auth, db, analytics };
