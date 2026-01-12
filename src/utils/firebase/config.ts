import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA1hkGg-r0newuug-a3Q2vir93TKXBom7E",
  authDomain: "toolex-ec00b.firebaseapp.com",
  projectId: "toolex-ec00b",
  storageBucket: "toolex-ec00b.firebasestorage.app",
  messagingSenderId: "16468697208",
  appId: "1:16468697208:web:8f8059fb6c0542e8afcd8d",
  measurementId: "G-B62ET7PZJL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
