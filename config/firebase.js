import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDPHyob9jTfcQCgOB0aNuX0n5OdGSzkAtE",
  authDomain: "hotel-data-store.firebaseapp.com",
  databaseURL: "https://hotel-data-store-default-rtdb.firebaseio.com",
  projectId: "hotel-data-store",
  storageBucket: "hotel-data-store.appspot.com",
  messagingSenderId: "995060333011",
  appId: "1:995060333011:web:461196f934001f70909726",
  measurementId: "G-76QW5MV4PF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth };