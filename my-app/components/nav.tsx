import { Button } from "@mui/material";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import "./nav.css";
import { useEffect } from "react";

export default function NavBar() {
  function redirect() {
    const delay = 3000;

    setTimeout(() => {
      window.location.href = "/";
    }, delay);
  }
  return (
    <nav className="nav">
      <ul>
        <li>
          <Link href="/profile">Profile</Link>
        </li>
        <li>
          <Link href="/">Find a Tutor</Link>
        </li>
        <li>
          <Link href="/tutor-course">Tutor a Course</Link>
        </li>
        <li>
          <Button
            onClick={() => {
              signOut();
              redirect();
            }}
          >
            Logout
          </Button>
        </li>
      </ul>
    </nav>
  );
}
