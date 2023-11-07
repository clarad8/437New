"use client";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import getTutors from "./tutors";
import TutorItem from "./tutorItem";
import getClassNames from "./classes";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import Select from "react-select";

import NavBar from "../../components/nav";
// import SessionProvider from "./SessionProvider";
import Profile from "../../pages/profile";
import React from "react";
import Notification from "./notification";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../index";
interface Tutor {
  id: string;
  name: string;
  tutoringClasses: string[];
  zoom: string;
  online: boolean;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [favoriteTutors, setFavoriteTutors] = useState<string[]>([]);

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
    const fetchFavoriteTutors = async () => {
      const q = query(collection(db, "users"), where("favorite", "!=", []));

      try {
        const querySnapshot = await getDocs(q);
        const favoriteTutorsList: string[] = [];

        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          const favoriteTutors = userData.favorite || [];
          favoriteTutorsList.push(...favoriteTutors);
        });
        setFavoriteTutors(favoriteTutorsList);
      } catch (error) {
        console.error("Error fetching favorite tutors: ", error);
      }
    };

    fetchFavoriteTutors();
  }, []); // Run the effect once after the initial render

  useEffect(() => {
    if (searchQuery) {
      const filteredTutors = allTutors.filter((tutor) =>
        tutor.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setTutors(filteredTutors);
    } else {
      // If the search query is empty, show all tutors
      setTutors(allTutors);
    }
  }, [searchQuery, allTutors]);

  // useEffect(() => {
  //   // Filter tutors based on the selected class when it changes

  //   if (selectedClass) {
  //     if (selectedClass === "Show All Tutors") {
  //       setTutors(allTutors);
  //     }
  //     else {
  //       const filteredTutors = allTutors.filter((tutor) =>
  //       tutor.tutoringClasses && tutor.tutoringClasses.includes(selectedClass)
  //     );
  //       setTutors(filteredTutors);
  //     }
  //   }
  // }, [selectedClass, allTutors]);

  useEffect(() => {
    // Filter tutors based on the selected class when it changes

    if (selectedClass) {
      if (selectedClass === "Show All Tutors") {
        setTutors(allTutors);
      } else {
        const filteredTutors = allTutors.filter(
          (tutor) =>
            tutor.tutoringClasses &&
            tutor.tutoringClasses.includes(selectedClass)
        );
        // no tutor is available for the class
        if (filteredTutors.length === 0) {
          console.log("no tutors!");
          setAlertMessage(`No tutors available yet for ${selectedClass}`);
          setShowAlert(true);
        }
        setTutors(filteredTutors);
      }
    }
  }, [selectedClass, allTutors]);

  const resetPage = () => {
    setTutors(allTutors);
  };

  // filter means active or inactive
  const setFilter = (status: string) => {
    if (status === "active") {
      const activeTutors = allTutors.filter((tutor) => tutor.online === true);
      setTutors(activeTutors);
    } else if (status === "inactive") {
      const inactiveTutors = allTutors.filter(
        (tutor) => tutor.online === false
      );
      setTutors(inactiveTutors);
    } else if (status === "favorite") {
      const favoriteTutorsList = allTutors.filter((tutor) =>
        favoriteTutors.includes(tutor.name)
      );
      setTutors(favoriteTutorsList);
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
        Find a CS Tutor
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

      {/* alert for when there are no tutors for the course */}

      {showAlert && (
        <Alert severity="warning" onClose={() => setShowAlert(false)}>
          {alertMessage}
        </Alert>
      )}

      <Typography variant="h5" gutterBottom>
        Select Class:
      </Typography>
      <Select
        value={{ label: selectedClass, value: selectedClass }} // Provide the value as an object
        onChange={(selectedOption) => {
          if (selectedOption) {
            setSelectedClass(selectedOption.label); // Use selectedOption.label
          } else {
            // Handle the case where nothing is selected
            setSelectedClass(""); // Or any other appropriate action
          }
        }}
        options={[
          { label: "Show All Tutors", value: "Show All Tutors" },
          ...classes.map((classItem) => ({
            label: classItem.name,
            value: classItem.name,
          })),
        ]}
        isSearchable={true}
        isClearable={true}
        placeholder="Select a class"
      />

      {/*
      <FormControl
        sx={{
          m: 1,
          width: "50%",
        }}
        size="small"
      >
        <InputLabel id="demo-simple-select-label">Select a class</InputLabel>
      
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={selectedClass}
          label="Select a class"
          onChange={(e) => setSelectedClass(e.target.value)}
          sx={{
            width: "100%",
            maxHeight: "300px", // Adjust the max height as needed
            overflowY: "auto", // Make the dropdown scrollable
          }}
        >
          <MenuItem value="Show All Tutors">Show All Tutors</MenuItem>
          {classes.map((classItem) => (
            <MenuItem key={classItem.id} value={classItem.name}>
              {classItem.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
          */}
      <Box my={1} />

      <div>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setFilter("active");
            setSelectedClass("");
            setShowAlert(false);
            setAlertMessage("");
            setSearchQuery("");
          }}
          style={{ margin: "0 10px" }}
        >
          Active Tutors
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setFilter("inactive");
            setSelectedClass("");
            setShowAlert(false);
            setAlertMessage("");
            setSearchQuery("");
          }}
          style={{ margin: "0 10px" }}
        >
          Inactive Tutors
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setFilter("favorite");
            setSelectedClass("");
            setShowAlert(false);
            setAlertMessage("");
            setSearchQuery("");
          }}
          style={{ margin: "0 10px" }}
        >
          Favorite Tutors
        </Button>
      </div>
      <br></br>
      <Typography variant="h5" gutterBottom>
        Search for a Tutor:
      </Typography>

      <TextField
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Box my={2} />

      <Button
        variant="contained"
        color="secondary"
        onClick={() => {
          setSelectedClass("");
          setFilter("");
          setSearchQuery("");
          setShowAlert(false);
          setAlertMessage("");
        }}
        style={{ margin: "0 10px" }}
      >
        Clear All Filters
      </Button>

      <Box my={3} />

      <Typography variant="h5" gutterBottom>
        Tutors:
      </Typography>

      <Notification />

      <div className="tutor-container">
        {tutors.map((tutor) => (
          <TutorItem key={tutor.id} {...tutor} />
        ))}
      </div>
    </>
  );
}
