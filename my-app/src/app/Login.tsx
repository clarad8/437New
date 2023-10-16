"use client";
import { Box, Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import NavBar from "@/components/nav";




export default function Login() {
  const { data: session, status } = useSession();
  const [userType, setUserType] = useState("");

  useEffect(() => {
    let logoutTimer: NodeJS.Timeout;

    const resetLogoutTimer = () => {
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        signOut(); // Logout the user after the 15 min
      }, 15 * 60 * 1000);
    };

    if (status === "authenticated") {
      resetLogoutTimer();

      // Reset the timer whenever there is user activity
      window.addEventListener("mousemove", resetLogoutTimer);
      window.addEventListener("keydown", resetLogoutTimer);
    }

    return () => {
      clearTimeout(logoutTimer);
      window.removeEventListener("mousemove", resetLogoutTimer);
      window.removeEventListener("keydown", resetLogoutTimer);
    };
  }, [status]);

  const handleLogin = () => {
    // if (userType === "student") {
    //   signIn("google");
    // } else if (userType === "tutor") {
    //   //*need to bring this back later for redirecting student/tutor to different home page */
    //   // router.push('/tutor-login');
    //   signIn("google");

    //   window.location.href = "/tutor-course";
    // }

    //log in through google for both student & tutor for now
    signIn("google");
    
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
        <div
          style={{
            backgroundColor: "#c9e4f5",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <Typography variant="h4" gutterBottom>
            Looking to find a tutor?
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setUserType("student");
              // <NavBar userType={userType} />
              handleLogin();
            }}
          >
            Student Login
          </Button>
        </div>
        <div
          style={{
            backgroundColor: "#c9e4f5",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <Typography variant="h4" gutterBottom>
            Tutor a student
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setUserType("tutor");
              // <NavBar userType={userType} />

              handleLogin();
            }}
          >
            Tutor Login
          </Button>
        </div>
      </Box>
    </div>
   

  );
}
