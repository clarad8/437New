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

  const [isErrorPopupOpen, setErrorPopupOpen] = useState(false);


  // const router = useRouter();

  // const handleGoogleSignIn = () => {
  //   signInWithPopup(auth, googleProvider)
  //     .then((userCredential) => {
  //       const user = userCredential.user;
  //       const db = getFirestore();
  //       const userDocRef = doc(db, "users", user.uid);

  //       // checks if user already exists in database
  //       getDoc(userDocRef)
  //         .then((docSnap) => {
  //           if (docSnap.exists() && docSnap.data().verified) {
  //             // User exists, proceed with the login
  //             signIn("google");
  //             console.log(
  //               "User exists in the database. Signing in with Google."
  //             );
  //           } else {
  //             // User does not exist, handle as needed
  //             if (user) {
  //               // Send email verification
  //               console.log(user.emailVerified);

  //                 sendEmailVerification(user)
  //                   .then(() => {
  //                     // Email verification sent
  //                     const message = `Email verification sent to: ${user.email}`;
  //                     setPopupMessage(message);
  //                     console.log("Email verification sent to:", user.email);
  //                     setVerificationPopupOpen(true);

  //                     // Resolve the promise to indicate successful email verification
  //                     return Promise.resolve(user);
  //                   })
  //                   .then((user) => {
  //                     // Get a reference to the user's document in Firestore
  //                     const db = getFirestore();
  //                     const userDocRef = doc(db, "users", user.uid);

  //                     // Update the verified status in the user's document
  //                     return setDoc(
  //                       userDocRef,
  //                       {
  //                         verified: true,
  //                         name: user.displayName,
  //                         email: user.email,
  //                       },
  //                       { merge: true }
  //                     );
  //                   })
  //                   .then(() => {
  //                     console.log("User verified status updated in Firestore.");
  //                     //signIn("google");
  //                   })
                
  //                   .catch((error) => {

  //                     console.error(
  //                       "Error sending email verification:",
  //                       error.message
  //                     );
  //                   });
                

  //               console.log("Google User:", user);
  //               // router.push("/Users/claradu/Desktop/1/437New/my-app/src/app/page");
  //             }
  //           }
  //         })
  //         .catch((error) => {
  //           console.error("Error getting user document:", error.message);
  //         });

  //       //  else {
  //       //   console.error("User is not signed in.");
  //       // }
  //     })
  //     .catch((error) => {
  //       const errorCode = error.code;
  //       const errorMessage = error.message;
  //       console.error(
  //         `Error during Google sign-in: ${errorCode} - ${errorMessage}`
  //       );
  //     });
  // };

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
        console.error(`Error during Google sign-up: ${errorCode} - ${errorMessage}`);
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
              console.log("User exists and email is verified. Logging in with Google.");
            } else if (docSnap.exists() && !docSnap.data().verified) {
              // User exists, but email is not verified, show error message
              const errorMessage = "Please verify your email before logging in.";
              console.error(errorMessage);
              setPopupMessage(errorMessage);
              setErrorPopupOpen(true);
              // Handle the error message as needed, for example, display it to the user
            } else {
              // User does not exist, show the same error message
              const errorMessage = "User not found. Please verify your email before logging in.";
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
        console.error(`Error during Google login: ${errorCode} - ${errorMessage}`);
      });
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
            onClick={handleGoogleSignUp}
          >
            Sign up with Google
          </Button>
        </div>
        <div style={{ marginTop: "20px" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGoogleLogin}
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
      <Modal
        open={isErrorPopupOpen}
        onClose={() => setErrorPopupOpen(false)}
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
