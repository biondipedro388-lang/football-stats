import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "football-stats-fdff1.firebaseapp.com",
  projectId: "football-stats-fdff1",
  storageBucket: "football-stats-fdff1.firebasestorage.app",
  messagingSenderId: "1080764813484",
  appId: "1:1080764813484:web:a6f40282404e59dbda0f09"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);