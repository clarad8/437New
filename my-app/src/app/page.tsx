"use client";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import getTutors from "./tutors";
import TutorItem from "./tutorItem";
import getClassNames from "./classes";
import Link from "next/link";
import Button, {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import NavBar from "../../components/nav";
import SessionProvider from "./SessionProvider";
import Profile from "../../pages/profile";
import React from "react";

interface Tutor {
  id: string;
  name: string;
  class: string;
  zoom: string;
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

  useEffect(() => {
    // Filter tutors based on the selected class when it changes
    if (selectedClass) {
      if (selectedClass === "Show All Tutors") {
        setTutors(allTutors);
      } else {
        const filteredTutors = allTutors.filter(
          (tutor) => tutor.class === selectedClass
        );
        setTutors(filteredTutors);
      }
    }
  }, [selectedClass, allTutors]);

  const resetPage = () => {
    setTutors(allTutors);
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
      {/*
      <div className="dropdown">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">Select a class</option>
          <option value="Show All Tutors">Show All Tutors</option>

          {classes.map((classItem) => (
            <option key={classItem.id} value={classItem.name}>
              {classItem.name}
            </option>
          ))}
        </select>
        {/* <button onClick={loadTutorsForCourse}>Load Tutors for Course</button> 
      </div>
*/}
      <Typography variant="h5" gutterBottom>
        Tutors:
      </Typography>

      <div className="tutor-container">
        {tutors.map((tutor) => (
          <TutorItem key={tutor.id} {...tutor} />
        ))}
        {/*<Profile passUserInfo={session?.data?.user?.name}></Profile>*/}
      </div>
    </>
  );
}
