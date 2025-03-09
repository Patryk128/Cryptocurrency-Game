import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD2F0-T2kKFwUqS71jJrjN6c-HHQT91eKI",
  authDomain: "crypto-game-5cb71.firebaseapp.com",
  projectId: "crypto-game-5cb71",
  storageBucket: "crypto-game-5cb71.firebasestorage.app",
  messagingSenderId: "70409075724",
  appId: "1:70409075724:web:1341c15fd692b0f8bc8229",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
