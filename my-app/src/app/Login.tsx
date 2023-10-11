'use client';
import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';


export default function Login() {
  const { data: session, status } = useSession();
  const [userType, setUserType] = useState('student');

  useEffect(() => {
    let logoutTimer: NodeJS.Timeout;

    const resetLogoutTimer = () => {
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        signOut(); // Logout the user after the 15 min
      }, 15 * 60 * 1000); 
    };

    if (status === 'authenticated') {
      resetLogoutTimer();

      // Reset the timer whenever there is user activity
      window.addEventListener('mousemove', resetLogoutTimer);
      window.addEventListener('keydown', resetLogoutTimer);
    }

    return () => {
      clearTimeout(logoutTimer);
      window.removeEventListener('mousemove', resetLogoutTimer);
      window.removeEventListener('keydown', resetLogoutTimer);
    };
  }, [status]);

  const handleLogin = () => {
    if (userType === 'student') {
      signIn('google');
    } else if (userType === 'tutor') {
      //*need to bring this back later for redirecting student/tutor to different home page */
      // router.push('/tutor-login');
    }
  };

  return (
    <div>
      <Button
        variant="contained"
        onClick={() => {
          setUserType('student');
          handleLogin();
        }}
      >
        Student Login
      </Button>
      <Button
        variant="contained"
        onClick={() => {
          setUserType('tutor');
          handleLogin();
        }}
      >
        Tutor Login
      </Button>
    </div>
  );
}