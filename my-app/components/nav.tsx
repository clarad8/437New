import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Link,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { signOut, useSession } from "next-auth/react";
import React, { SetStateAction, useEffect, useState } from "react";
import "./nav.css";
import Notification from "../src/app/notification";
import NotificationsIcon from "@mui/icons-material/Notifications"; 
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import router from "next/router";

export default function NavBar() {
  const [activeTab, setActiveTab] = useState("");
  const userType = "student";
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isClicked, setIsClicked] = useState(false);


  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);

  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleBellIconClick = () => {
    console.log("Bell icon clicked");
    // setIsClicked((prevIsClicked) => !prevIsClicked);
    setIsClicked(true);
    setIsVisible(true);
  };

  function getActiveTabFromURL() {
    const pathname = window.location.pathname;
    const parts = pathname.split("/").filter((part) => part !== "");
    return parts[parts.length - 1] || "";
  }

  useEffect(() => {
    setActiveTab(getActiveTabFromURL());
  }, []);
  return (
    <div>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <IconButton
              size="large"
              aria-label="menu"
              sx={{ display: { xs: "block", md: "none" } }}
              onClick={handleOpenMenu}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily:"Roboto, sans-serif" ,
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
                marginRight: "10rem",
                marginLeft: "0"
              }}
            >
              CS TutorMatch
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              <Typography
                variant="overline" 
                noWrap
                component="a"
                href="/profile"
                fontFamily="Roboto, sans-serif" 
                sx={{ my: 2, color: "white", display: "block" }}
              >
                Profile
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              <Typography
                variant="overline" 
                noWrap
                component="a"
                href="/tutor-course"
                // fontFamily= "Georgia"
                fontFamily="Roboto, sans-serif" 
                sx={{ my: 2, color: "white", display: "block" }}
              >
                Tutor a Course
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              <Typography
                variant="overline" 
                noWrap
                component="a"
          
                fontFamily="Roboto, sans-serif" 
                href="/discussion"
                sx={{ my: 2, color: "white", display: "block" }}
              >
                Discussion Board
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              <Typography
                variant="overline"
                noWrap
                component="a"
                fontFamily="Roboto, sans-serif" 

                href="/messages"
                sx={{ my: 2, color: "white", display: "block" }}
              >
                Message
              </Typography>
            </Box>
            <IconButton color="inherit" onClick={handleBellIconClick} sx={{ marginRight: 2 }}>
            <NotificationsIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              <Typography
                variant="overline"
                noWrap
                component="a"
                href="/"
                fontFamily="Roboto, sans-serif" 

                sx={{ my: 2, color: "white", display: "block" }}
                onClick={async () => {
                  await signOut();
                  // router.push("/");
                }}
              >
                Logout
              </Typography>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      {/* {isVisible && <Notification isClicked={isClicked} />} */}
      {isVisible && <Notification isClicked={isClicked} setIsVisible={setIsVisible} />}

      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        sx={{ mt: "45px" }}
      >
        <Link href="/profile">
          <MenuItem>
            <Typography textAlign="center">Profile</Typography>
          </MenuItem>
        </Link>
        <Link href="/">
          <MenuItem>
            <Typography textAlign="center">Find a Tutor</Typography>
          </MenuItem>
        </Link>
        <Link href="/tutor-course">
          <MenuItem>
            <Typography textAlign="center">Tutor Course</Typography>
          </MenuItem>
        </Link>
        <Link href="/discussion">
          <MenuItem>
            <Typography textAlign="center">Discussion Board</Typography>
          </MenuItem>
        </Link>
        <Link href="/messages">
          <MenuItem>
            <Typography textAlign="center">Message</Typography>
          </MenuItem>
        </Link>
        <MenuItem
          onClick={async () => {
            await signOut();
            router.push("/");
          }}
        >
          <Typography textAlign="center">Logout</Typography>
        </MenuItem>
      </Menu>
    </div>
  );
}
/*<nav className="nav">
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
        should change it back to commented out version when it works */ //}

{
  /* {userType === "student" ? (
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
        )} */
}
{
  /*}
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
          </nav>*/
}
//);
//}