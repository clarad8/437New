"use client";
import React, { useState, useEffect } from "react";
import { Typography, Box, Button, Modal } from "@mui/material";
import {
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../../index";
import { signIn, signOut, useSession } from "next-auth/react";
import { doc, getDoc, setDoc, getFirestore } from "firebase/firestore";
import router, { useRouter } from "next/router";
import Page from "./page";

let verified: boolean = false;

const googleProvider = new GoogleAuthProvider();

const Login = () => {
  const [isVerificationPopupOpen, setVerificationPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  // const router = useRouter();

  const handleGoogleSignIn = () => {
    signInWithPopup(auth, googleProvider)
      .then((userCredential) => {
        const user = userCredential.user;
        const db = getFirestore();
        const userDocRef = doc(db, "users", user.uid);

        // checks if user already exists in database
        getDoc(userDocRef)
          .then((docSnap) => {
            if (docSnap.exists()) {
              // User exists, proceed with the login
              signIn("google");
              console.log(
                "User exists in the database. Signing in with Google."
              );
            } else {
              // User does not exist, handle as needed
              if (user) {
                // Send email verification
                console.log(user.emailVerified);
                if (!verified) {
                  verified = true;
                  sendEmailVerification(user)
                    .then(() => {
                      // Email verification sent
                      const message = `Email verification sent to: ${user.email}`;
                      setPopupMessage(message);
                      console.log("Email verification sent to:", user.email);
                      setVerificationPopupOpen(true);

                      // Resolve the promise to indicate successful email verification
                      return Promise.resolve(user);
                    })
                    .then((user) => {
                      // Get a reference to the user's document in Firestore
                      const db = getFirestore();
                      const userDocRef = doc(db, "users", user.uid);

                      // Update the verified status in the user's document
                      return setDoc(
                        userDocRef,
                        {
                          verified: true,
                          name: user.displayName,
                          email: user.email,
                        },
                        { merge: true }
                      );
                    })
                    .then(() => {
                      console.log("User verified status updated in Firestore.");
                      //signIn("google");
                    })
                    // .then(() => {
                    //   // router.push("/app/page"); //redirect to home page after email verification
                    //   // window.location.href = "/app/page"; 
                    //   console.log("redirect successful")
                    // })
                    .catch((error) => {

                      console.error(
                        "Error sending email verification:",
                        error.message
                      );
                    });
                // } else {
                //   signIn("google");
                //   console.log(
                //     "User is already verified. Signing in with Google."
                //   );
                  // use local storage -> store user email then login
                }

                console.log("Google User:", user);
                // router.push("/Users/claradu/Desktop/1/437New/my-app/src/app/page");
              }
            }
          })
          .catch((error) => {
            console.error("Error getting user document:", error.message);
          });

        //  else {
        //   console.error("User is not signed in.");
        // }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(
          `Error during Google sign-in: ${errorCode} - ${errorMessage}`
        );
      });
  };

  const handleStudentLogin = () => {
    // Handle student login logic here
  };

  const handleTutorLogin = () => {
    // Handle tutor login logic here
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Tutor Match
      </Typography>
      <Box
        display="flex"
        height="50vh"
        justifyContent="space-around"
        alignItems="center"
        style={{ backgroundColor: "#f0f0f0" }}
      >
        {/* ... other components */}
        <div style={{ marginTop: "20px" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGoogleSignIn}
          >
            Sign in with Google
          </Button>
        </div>
      </Box>
      <Modal
        open={isVerificationPopupOpen}
        onClose={() => setVerificationPopupOpen(false)}
      >
        <div
          style={{
            position: "absolute",
            width: 400,
            backgroundColor: "white",
            padding: 20,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Typography variant="h6">{popupMessage}</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setVerificationPopupOpen(false)}
          >
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Login;
