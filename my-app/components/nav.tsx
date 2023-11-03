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
import { SetStateAction, useEffect, useState } from "react";
import "./nav.css";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import router from "next/router";

// const student = true;
// type NavBarProps = {
//   userType:string;
// };

export default function NavBar() {
  const [activeTab, setActiveTab] = useState("");
  const userType = "student";
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
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
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              Find a Tutor
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              <Typography
                variant="h6"
                noWrap
                component="a"
                href="/profile"
                sx={{ my: 2, color: "white", display: "block" }}
              >
                Profile
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              <Typography
                variant="h6"
                noWrap
                component="a"
                href="/tutor-course"
                sx={{ my: 2, color: "white", display: "block" }}
              >
                Tutor a Course
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              <Typography
                variant="h6"
                noWrap
                component="a"
                href="/"
                sx={{ my: 2, color: "white", display: "block" }}
                onClick={async () => {
                  await signOut();
                  router.push("/");
                }}
              >
                Logout
              </Typography>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
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
        <MenuItem
          onClick={async () => {
            router.push("/profile");
          }}
        >
          <Typography textAlign="center">Profile</Typography>
        </MenuItem>
        <MenuItem
          onClick={async () => {
            router.push("/");
          }}
        >
          <Typography textAlign="center">Find a Tutor</Typography>
        </MenuItem>
        <MenuItem
          onClick={async () => {
            router.push("/tutor-course");
          }}
        >
          <Typography textAlign="center">Tutor Course</Typography>
        </MenuItem>
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
