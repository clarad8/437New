"use client";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import getTutors from "./tutors";
import TutorItem from "./tutorItem";
import getClassNames from "./classes";
import Link from "next/link";
import{
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import NavBar from "../../components/nav";
// import SessionProvider from "./SessionProvider";
import Profile from "../../pages/profile";
import React from "react";
import FavoriteTutors from "./favoriteTutors";


interface Tutor {
  id: string;
  name: string;
  tutoringClasses: string[];
  zoom: string;
  online:boolean;

}

interface classes {
  id: string;
  name: string;
}

export default function Home() {
  const session = useSession();
  const [allTutors, setAllTutors] = useState<Tutor[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [classes, setClasses] = useState<classes[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>(""); // State to hold selected class
  const [username, setUserName] = useState<string>("");
  const fetchTutors = async () => {
    const tutorsData = await getTutors();
    setAllTutors(tutorsData);
    setTutors(tutorsData);
    setUserName(session?.data?.user?.name ?? ""); //need to fix this
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const classNamesData = await getClassNames();
        console.log("Fetched class names:", classNamesData);
        setClasses(classNamesData);
      } catch (error: any) {
        console.error("Error fetching data:", error.message);
      }
    };

    fetchTutors();
    fetchClasses();
  }, []);

  // useEffect(() => {
  //   // Filter tutors based on the selected class when it changes
  //   if (selectedClass) {
  //     if (selectedClass === "Show All Tutors") {
  //       setTutors(allTutors);
  //     } else {
  //       const filteredTutors = allTutors.filter(
  //         (tutor) => tutor.tutoringClasses.includes(selectedClass)
  //       );
  //       setTutors(filteredTutors);
  //     }
  //   }
  // }, [selectedClass, allTutors]);

  
  

  const resetPage = () => {
    setTutors(allTutors);
  };
  // function setFilter(arg0: string) {
  //   throw new Error("Function not implemented.");
  // }

  const setFilter = (status: string) => {
    if (status === "active") {
      const activeTutors = allTutors.filter((tutor) => tutor.online === true);
      setTutors(activeTutors);
    } else if (status === "inactive") {
      const inactiveTutors = allTutors.filter((tutor) => tutor.online === false);
      setTutors(inactiveTutors);
    } else {
      // Reset to all tutors if no specific status is provided
      setTutors(allTutors);
    }
  };

  
  return (
    <>
      <NavBar></NavBar>
      <Typography variant="body1" gutterBottom>
        Welcome {/*username*/ session?.data?.user?.name}!{" "}
      </Typography>
      <br></br>
      <br></br>
      <Typography variant="h3" gutterBottom>
        Find a Tutor
      </Typography>
      <Typography variant="body1" gutterBottom>
        Whether you're struggling with a particular subject or looking to
        enhance your understanding of a class, our platform is here to connect
        you with experienced tutors who can help you succeed.
      </Typography>
      <Typography variant="body1" gutterBottom>
        Explore our diverse range of tutors, filter by subjects or classes, and
        find the perfect match to support your learning journey.
      </Typography>
      <br></br>
      <Typography variant="h5" gutterBottom>
        Select Class:
      </Typography>

      <FormControl sx={{ m: 1, minWidth: 180 }} size="small">
        <InputLabel id="demo-simple-select-label">Select a class</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={selectedClass}
          label="Select a class"
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <MenuItem value="Show All Tutors">Show All Tutors</MenuItem>
          {classes.map((classItem) => (
            <MenuItem key={classItem.id} value={classItem.name}>
              {classItem.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box my={1} />

      <div>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setFilter("active")}
          style={{ margin: '0 10px' }}
        >
          Active Tutors
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setFilter("inactive")}
          style={{ margin: '0 10px' }}
        >
          Inactive Tutors
        </Button>
      </div>
      
      <Box my={3} />

      <Typography variant="h5" gutterBottom>
        Tutors:
      </Typography>

      <div
      style={{
        position: "fixed",
        top: "30px", // Adjust top position as needed
        right: "30px", // Adjust right position as needed
        backgroundColor: "lightblue",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "5px",
      }}
    >
      <Typography variant="h5" gutterBottom>
        Favorite Tutors:
      </Typography>
      <FavoriteTutors />
    </div>

      <div className="tutor-container">
        {tutors.map((tutor) => (
          <TutorItem key={tutor.id} {...tutor} />
        ))}
        {/*<Profile passUserInfo={session?.data?.user?.name}></Profile>*/}
      </div>
    </>
  );
}