import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBgSpUgBAk1hxVWR5b8ERsBSOgVNH0KU_A",
  authDomain: "football-stats-fdff1.firebaseapp.com",
  projectId: "football-stats-fdff1",
  storageBucket: "football-stats-fdff1.firebasestorage.app",
  messagingSenderId: "1080764813484",
  appId: "1:0764813484:web:a6f40282404e59da0f09"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
