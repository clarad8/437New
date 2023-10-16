import { Button, Link } from "@mui/material";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import "./nav.css";

// const student = true;
// type NavBarProps = {
//   userType:string;
// };

export default function NavBar() {
  const [activeTab, setActiveTab] = useState("");
  const userType = "student";
  function getActiveTabFromURL() {
    const pathname = window.location.pathname;
    const parts = pathname.split("/").filter((part) => part !== "");
    return parts[parts.length - 1] || "";
  }
  function redirect() {
    const delay = 3000;

    setTimeout(() => {
      window.location.href = "/";
    }, delay);
  }
  useEffect(() => {
    setActiveTab(getActiveTabFromURL());
  }, []);
  return (
    <nav className="nav">
      <ul>
        <div className={activeTab === "profile" ? "active" : ""}>
          <li onClick={() => setActiveTab("profile")}>
            <Link href="/profile">Profile</Link>
          </li>
        </div>

        {/* this code makes "find a tutor" appear if the user is a student and "tutor course" appear if user is tutor 
        should change it back to commented out version when it works */}

        {userType === "student" ? (
          <div className={activeTab === "" ? "active" : ""}>
            <li onClick={() => setActiveTab("")}>
              <Link href="/">Find a Tutor</Link>
            </li>
          </div>
        ) : (
          <div className={activeTab === "tutor-course" ? "active" : ""}>
            <li onClick={() => setActiveTab("tutor-course")}>
              <Link href="/tutor-course">Tutor a Course</Link>
            </li>
          </div>
        )}
        {/*
        
        <div className={activeTab === "" ? "active" : ""}>
            <li onClick={() => setActiveTab("")}>
              <Link href="/">Find a Tutor</Link>
            </li>
        </div>

        <div className={activeTab === "tutor-course" ? "active" : ""}>
            <li onClick={() => setActiveTab("tutor-course")}>
              <Link href="/tutor-course">Tutor a Course</Link>
            </li>
          </div>

      */}
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
