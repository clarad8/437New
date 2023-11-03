import { Button, Link, Typography } from "@mui/material";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import "./nav.css";
import router from "next/router";

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

  useEffect(() => {
    setActiveTab(getActiveTabFromURL());
  }, []);
  return (
    <nav className="nav">
      <ul>
        <div className={activeTab === "profile" ? "active" : ""}>
          <li>
            <Link onClick={() => setActiveTab("profile")} href="/profile">
              <Typography variant="h5" gutterBottom>
                Profile
              </Typography>
            </Link>
          </li>
        </div>

        {/* this code makes "find a tutor" appear if the user is a student and "tutor course" appear if user is tutor 
        should change it back to commented out version when it works */}

        {/* {userType === "student" ? (
          <div className={activeTab === "" ? "active" : ""}>
            <li>
              <Link onClick={() => setActiveTab("")} href="/">
                Find a Tutor
              </Link>
            </li>
          </div>
        ) : (
          <div className={activeTab === "tutor-course" ? "active" : ""}>
            <li>
              <Link
                onClick={() => setActiveTab("tutor-course")}
                href="/tutor-course"
              >
                Tutor a Course
              </Link>
            </li>
          </div>
        )} */}

        <div className={activeTab === "" ? "active" : ""}>
          <li onClick={() => setActiveTab("")}>
            <Link href="/">
              {" "}
              <Typography variant="h5" gutterBottom>
                Find a Tutor
              </Typography>
            </Link>
          </li>
        </div>

        <div className={activeTab === "tutor-course" ? "active" : ""}>
          <li onClick={() => setActiveTab("tutor-course")}>
            <Link href="/tutor-course">
              <Typography variant="h5" gutterBottom>
                Tutor a course
              </Typography>
            </Link>
          </li>
        </div>
        <div>
          <li
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
          >
            <Link href="/">
              <Typography variant="h5" gutterBottom>
                Logout
              </Typography>
            </Link>
          </li>
        </div>
      </ul>
    </nav>
  );
}
