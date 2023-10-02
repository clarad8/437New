'use client';
import { signIn } from 'next-auth/react';
import { Button } from '@mui/material';
export default function Login() {
  return (
    <Button variant="contained" onClick={() => signIn('google')}>Login</Button>
  )
}