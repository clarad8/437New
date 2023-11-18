"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import getTutors from "./tutors";
import TutorItem from "./tutorItem";
import getClassNames from "./classes";
import { Alert, Box, Button, Typography, TextField, Chip } from "@mui/material";
import Select from "react-select";

import NavBar from "../../components/nav";
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
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [username, setUserName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [favoriteTutors, setFavoriteTutors] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const fetchTutors = async () => {
    const tutorsData = await getTutors();
    setAllTutors(tutorsData);
    setTutors(tutorsData);
    setUserName(session?.data?.user?.name ?? "");
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const classNamesData = await getClassNames();
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
      if (session?.data?.user?.name) {
        const userRef = collection(db, "users");
        const q = query(
          userRef,
          where("name", "==", session?.data?.user?.name)
        );

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
      }
    };
    fetchFavoriteTutors();
  }, [allTutors, selectedFilters]);

  useEffect(() => {
    if (searchQuery) {
      const filteredTutors = allTutors.filter((tutor) =>
        tutor.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      applyFilters(filteredTutors);
    } else {
      applyFilters(allTutors);
    }
  }, [searchQuery, allTutors, selectedFilters]);

  useEffect(() => {
    if (selectedClass) {
      if (selectedClass === "Show All Tutors") {
        applyFilters(allTutors);
      } else {
        const filteredTutors = allTutors.filter(
          (tutor) =>
            tutor.tutoringClasses &&
            tutor.tutoringClasses.includes(selectedClass)
        );
        handleNoTutors(filteredTutors);
        applyFilters(filteredTutors);
      }
    }
  }, [selectedClass, allTutors, selectedFilters]);

  const resetPage = () => {
    setSelectedFilters([]);
    setTutors(allTutors);
    setSelectedClass("");
    setSearchQuery("");
  };

  const toggleFilter = (filter: string) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter((f) => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  const applyFilters = (filteredTutors: Tutor[]) => {
    let resultTutors = [...filteredTutors];

    selectedFilters.forEach((filter) => {
      if (filter === "online") {
        resultTutors = resultTutors.filter((tutor) => tutor.online === true);
      }
      if (filter === "offine") {
        resultTutors = resultTutors.filter((tutor) => tutor.online === false);
      }
      if (filter === "favorite") {
        resultTutors = resultTutors.filter((tutor) =>
          favoriteTutors.includes(tutor.name)
        );
      }

      // New check to filter by selected class
      if (filter === "class" && selectedClass !== "Show All Tutors") {
        resultTutors = resultTutors.filter(
          (tutor) =>
            tutor.tutoringClasses &&
            tutor.tutoringClasses.includes(selectedClass)
        );
      }
    });

    // If searchQuery is present, filter the resultTutors based on the search query
    if (searchQuery) {
      // If a class is selected, filter by both the search query and the selected class
      if (selectedClass && selectedClass !== "Show All Tutors") {
        resultTutors = resultTutors.filter(
          (tutor) =>
            tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            tutor.tutoringClasses &&
            tutor.tutoringClasses.includes(selectedClass)
        );
      } else {
        // If no class is selected, filter only by the search query
        resultTutors = resultTutors.filter((tutor) =>
          tutor.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
    }

    setTutors(resultTutors);
  };

  const handleNoTutors = (filteredTutors: Tutor[]) => {
    if (filteredTutors.length === 0) {
      setAlertMessage(`No tutors available yet for ${selectedClass}`);
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }
  };

  return (
    <>
      <NavBar />
      {/* <Typography variant="body1" gutterBottom>
        Welcome {session?.data?.user?.name}!
  </Typography>*/}
      <br />
      <br />
      <Typography variant="h3" gutterBottom>
        Find a CS Tutor
      </Typography>
      <Typography variant="body1" gutterBottom>
        Whether you're struggling with a particular class or looking to enhance
        your understanding of a class, our platform is here to connect you with
        experienced tutors who can help you succeed.
      </Typography>
      <Typography variant="body1" gutterBottom>
        Explore our diverse range of tutors. Filter by classes or find tutors
        that are active right now to find the perfect tutor match to support
        your learning journey.
      </Typography>
      <br />
      {showAlert && (
        <Alert severity="warning" onClose={() => setShowAlert(false)}>
          {alertMessage}
        </Alert>
      )}
      <Typography variant="h5" gutterBottom>
        Filters:
      </Typography>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Button
          variant={
            selectedFilters.includes("online") ? "contained" : "outlined"
          }
          color="primary"
          onClick={() => toggleFilter("online")}
          style={{ margin: "0 10px" }}
        >
          Online Tutors
        </Button>
        <Button
          variant={
            selectedFilters.includes("offline") ? "contained" : "outlined"
          }
          color="primary"
          onClick={() => toggleFilter("offline")}
          style={{ margin: "0 10px" }}
        >
          Offline Tutors
        </Button>
        <Button
          variant={
            selectedFilters.includes("favorite") ? "contained" : "outlined"
          }
          color="primary"
          onClick={() => toggleFilter("favorite")}
          style={{ margin: "0 10px" }}
        >
          Favorite Tutors
        </Button>
      </div>
      <br />
      <Typography variant="h5" gutterBottom>
        Select Class:
      </Typography>
      <Select
        value={{ label: selectedClass, value: selectedClass }}
        onChange={(selectedOption) => {
          if (selectedOption) {
            setSelectedClass(selectedOption.label);
          } else {
            setSelectedClass("");
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
      <Box my={1} />
      <Typography variant="h5" gutterBottom>
        Search for a Tutor:
      </Typography>
      <TextField
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Box my={2} />
      <Typography variant="h5" gutterBottom>
        Tutors:
      </Typography>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={resetPage}
          style={{ margin: "0 10px" }}
        >
          Clear All Filters
        </Button>
        {selectedFilters.map((filter) => (
          <Chip
            key={filter}
            label={filter}
            onDelete={() => toggleFilter(filter)}
            color="primary"
            style={{ margin: "0 10px" }}
          />
        ))}
      </div>
      <br></br>
      <Notification />
      <div className="tutor-container">
        {tutors.map((tutor) => (
          <TutorItem key={tutor.id} {...tutor} />
        ))}
      </div>
      <Box my={2} />
    </>
  );
}
