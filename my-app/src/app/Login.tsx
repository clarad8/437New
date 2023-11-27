"use client";
import React, { useState, useEffect, CSSProperties } from "react";
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
  const [isErrorPopupOpen, setErrorPopupOpen] = useState(false);

  const handleGoogleSignUp = () => {
    signInWithPopup(auth, googleProvider)
      .then((userCredential) => {
        const user = userCredential.user;
        const db = getFirestore();
        const userDocRef = doc(db, "users", user.uid);

        // Send email verification
        sendEmailVerification(user)
          .then(() => {
            // Email verification sent
            const message = `Email verification sent to: ${user.email}`;
            setPopupMessage(message);
            console.log("Email verification sent to:", user.email);
            setVerificationPopupOpen(true);

            // Update the verified status in the user's document in Firestore
            setDoc(
              userDocRef,
              {
                verified: true,
                name: user.displayName,
                email: user.email,
                uid: user.uid,
              },
              { merge: true }
            )
              .then(() => {
                console.log("User verified status updated in Firestore.");
              })
              .catch((error) => {
                console.error("Error updating user document:", error.message);
              });
          })
          .catch((error) => {
            console.error("Error sending email verification:", error.message);
          });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(
          `Error during Google sign-up: ${errorCode} - ${errorMessage}`
        );
      });
  };

  const handleGoogleLogin = () => {
    signInWithPopup(auth, googleProvider)
      .then((userCredential) => {
        const user = userCredential.user;
        const db = getFirestore();
        const userDocRef = doc(db, "users", user.uid);

        // Check if the user exists in the database and is verified
        getDoc(userDocRef)
          .then((docSnap) => {
            if (docSnap.exists() && docSnap.data().verified) {
              // User exists and email is verified, proceed with login
              signIn("google");
              console.log(
                "User exists and email is verified. Logging in with Google."
              );
            } else if (docSnap.exists() && !docSnap.data().verified) {
              // User exists, but email is not verified, show error message
              const errorMessage =
                "Please verify your email before logging in.";
              console.error(errorMessage);
              setPopupMessage(errorMessage);
              setErrorPopupOpen(true);
              // Handle the error message as needed, for example, display it to the user
            } else {
              // User does not exist, show the same error message
              const errorMessage =
                "User not found. Please verify your email before logging in.";
              console.error(errorMessage);
              setPopupMessage(errorMessage);
              setErrorPopupOpen(true);

              // Handle the error message as needed, for example, display it to the user
            }
          })
          .catch((error) => {
            console.error("Error getting user document:", error.message);
          });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(
          `Error during Google login: ${errorCode} - ${errorMessage}`
        );
      });
  };

  const containerStyle: CSSProperties = {
    backgroundImage: "url('https://img.freepik.com/premium-photo/blue-cardboard-background-flat-lay-top-view_164357-2984.jpg')", // Replace 'YOUR_IMAGE_URL' with your actual image URL
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  };

  return (
    <div style={containerStyle}>
    <div style={{ textAlign: "center", padding: "20px", color: "white", textShadow: "2px 2px black" }}>
    <div style={{ fontFamily: "Georgia", fontSize: "3rem" }}>
  CS Tutor Match
</div>

        {/* ... other components */}
        <div style={{ marginTop: "20px" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGoogleSignUp}
              style={{ background: "white", color: "#1976D2" }}
            >
              Sign up with Google
            </Button>
          </div>
          <div style={{ marginTop: "20px" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGoogleLogin}
              style={{ background: "white", color: "#1976D2" }}
            >
              Sign in with Google
            </Button>
          </div>
      
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
      <Modal open={isErrorPopupOpen} onClose={() => setErrorPopupOpen(false)}>
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
            onClick={() => setErrorPopupOpen(false)}
          >
            Close
          </Button>
        </div>
      </Modal>
    </div>
    </div>
  );
};

export default Login;
