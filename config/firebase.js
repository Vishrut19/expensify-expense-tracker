// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getFirestore, collection } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyABxZKr8DpDmUFcZDNKHVCT6XrItfgb5T0",
  authDomain: "expensify-c572a.firebaseapp.com",
  projectId: "expensify-c572a",
  storageBucket: "expensify-c572a.firebasestorage.app",
  messagingSenderId: "928603206713",
  appId: "1:928603206713:web:831e994dd790580eacc9e8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // Get Firestore database
export const auth = getAuth(app); // Get Authentication service

export const tripsRef = collection(db, "trips"); // Database Object and Name of the reference i.e. Trips.
export const expensesRef = collection(db, "expenses"); // Database Object and Name of the reference i.e. Expenses.

export default app;
