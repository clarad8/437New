import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCNOAjUYkua74UfbJgxhNCD_SL5TritGiA",
  authDomain: "cse437-400716.firebaseapp.com",
  projectId: "cse437-400716",
  storageBucket: "cse437-400716.appspot.com",
  messagingSenderId: "532689698948",
  appId: "1:532689698948:web:1b264f2cce5880b03ac2d1",
  measurementId: "G-2KNEQPMGHT",
};

// Initialize fireBase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp); // Initialize Authentication service
const db = getFirestore(firebaseApp);

export { db, auth };
