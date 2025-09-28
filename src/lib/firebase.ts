import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
// Firebase configuration
// Replace these placeholder values with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBNCFpngUdGcdqlehYzet6PxuxKE85uSy8",
  authDomain: "eventlinkapp-d198a.firebaseapp.com",
  projectId: "eventlinkapp-d198a",
  storageBucket: "eventlinkapp-d198a.firebasestorage.app",
  messagingSenderId: "1068962995263",
  appId: "1:1068962995263:web:2d0580a4622f700343ac8a",
  measurementId: "G-HPNW464XCH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
