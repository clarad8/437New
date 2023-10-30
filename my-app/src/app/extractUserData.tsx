// firebaseUtils.js

import { db } from "../../index"; // Import your Firebase configuration
import { collection, doc, getDoc, setDoc } from "firebase/firestore";


export async function getUserDataFromFirebase(userUID: string) {
    try {
      const userDocRef = doc(db, "users", userUID);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        return userDocSnap.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting user data from Firebase: ", error);
      throw error;
    }
  }
  
  export async function updateUserDataInFirebase(userUID: string, userData: any) {
    try {
      const userDocRef = doc(db, "users", userUID);
      await setDoc(userDocRef, userData, { merge: true });
    } catch (error) {
      console.error("Error updating user data in Firebase: ", error);
      throw error;
    }
  }
  