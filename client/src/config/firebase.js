// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC1Fk-sx1pvQFDpaBywfvyD0VOuKha1Rpo",
  authDomain: "scrap-trade-b1ea7.firebaseapp.com",
  databaseURL: "https://scrap-trade-b1ea7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "scrap-trade-b1ea7",
  storageBucket: "scrap-trade-b1ea7.firebasestorage.app",
  messagingSenderId: "726980425004",
  appId: "1:726980425004:web:8941cd4691e3e66374e889",
  measurementId: "G-G9K60TYKVF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const analytics = getAnalytics(app);
import { getAuth } from "firebase/auth";
export const auth = getAuth(app);
export default app;