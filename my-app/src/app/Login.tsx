"use client";
import React, { useState, useEffect, CSSProperties } from "react";
import { Typography, Box, Button, Modal, Grid } from "@mui/material";
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
    minHeight: "100vh",
    display: "flex",
    flexDirection: "row",
  };

  const leftContainerStyle: CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "100px",
  };

  const rightContainerStyle: CSSProperties = {
    flex: 1,
    backgroundImage:
      "url('https://img.freepik.com/free-vector/webinar-concept-illustration_114360-4874.jpg?w=1480&t=st=1701195212~exp=1701195812~hmac=d97e052cab174955557e86ece8a16b8604be08e722402991a83e5c62d2825f1a')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    textShadow: "2px 2px black",
  };

  const buttonContainerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "row",
    marginTop: "20px",
  };

  return (
    <div style={containerStyle}>
    <div style={leftContainerStyle}>
    <Typography variant="h2" style={{ fontWeight: '600' }} gutterBottom>
          CS <span style={{ color: '#2196f3' }}>Tutor</span>Match
        </Typography>
      <Typography variant="body1" style={{ fontWeight: 'normal', textAlign: 'center'  }} gutterBottom>
      Are you a WashU student seeking personalized assistance in your CS classes? Look no further! CS TutorMatch is your go-to platform for connecting with peer tutors who excel in computer science.
      </Typography>

      {/* <Typography variant="subtitle1" style={{ marginBottom: '10px', fontWeight: '600' }}>
            Get Started Today!
          </Typography> */}

      <div style={buttonContainerStyle}>
        
          <Button
            variant="contained"
            color="primary"
            onClick={handleGoogleSignUp}
            style={{ background: "white", color: "#1976D2", marginRight: "10px" }}
          >
            Sign up with Google
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGoogleLogin}
            style={{ background: "#2196f3", color: "white" }}
          >
            Sign in with Google
          </Button>
        </div>
    </div>
    <div style={rightContainerStyle}>
      {/* Optional: Add any content you want on the right side */}
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
  );
};

export default Login;
