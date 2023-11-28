"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import getTutors from "./tutors";
import TutorItem from "./tutorItem";
import getClassNames from "./classes";
import {
  Alert,
  Box,
  Button,
  Typography,
  TextField,
  Chip,
  Container,
  Grid,
} from "@mui/material";
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
  image: string;
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

    const onlineFilterApplied = selectedFilters.includes("online");
    const offlineFilterApplied = selectedFilters.includes("offline");

    if (onlineFilterApplied && offlineFilterApplied) {
      // If both online and offline filters are selected, no need to filter based on online status
    } else {
      // Apply individual filters
      if (onlineFilterApplied) {
        resultTutors = resultTutors.filter((tutor) => tutor.online === true);
      }
      if (offlineFilterApplied) {
        resultTutors = resultTutors.filter((tutor) => tutor.online === false);
      }
    }

    if (selectedFilters.includes("favorite")) {
      resultTutors = resultTutors.filter((tutor) =>
        favoriteTutors.includes(tutor.name)
      );
    }

    // New check to filter by selected class
    if (
      selectedFilters.includes("class") &&
      selectedClass !== "Show All Tutors"
    ) {
      resultTutors = resultTutors.filter(
        (tutor) =>
          tutor.tutoringClasses && tutor.tutoringClasses.includes(selectedClass)
      );
    }

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
      <div
        style={{
          backgroundImage: `url("https://i.postimg.cc/N0N5H5jN/Screenshot-2023-11-28-at-10-28-51-AM.png")`,
          backgroundSize: "cover",
          maxHeight: "400px",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          padding: "20px", // Adjust the padding as needed
          // fontFamily: "Georgia",
          fontSize: "3rem",
          fontWeight: "bold",
          color: "white",
        }}
      >
        <Container>
          Find a CS Tutor
          <div
            style={{
              textAlign: "justify",
              maxWidth: "1000px", // Set a maximum width for the centered paragraph
              marginRight: "50%",
              padding: "20px", // Adjust the padding as needed
              // fontFamily: "Comic Sans MS",
              fontSize: "1.25rem", // Adjust the font size as needed
              color: "white !important", // Adjust the text color as needed
              fontWeight: "normal",
            }}
          >
            <br />
            <br />
            <p>
              Our platform is here to connect you with experienced tutors who
              can help you succeed.
            </p>

            <p>
              Filter by classes or find tutors that are active right now to find
              the perfect tutor match to support your learning journey.
            </p>
            <br />
            <br />
            <br />
            <br />
            <br />
          </div>
        </Container>
      </div>
      <br />
      {showAlert && (
        <Alert severity="warning" onClose={() => setShowAlert(false)}>
          {alertMessage}
        </Alert>
      )}
      <Container>
        <div
          style={{
            // fontFamily: "Georgia",
            fontWeight: "semi-bold",
            fontSize: "1.25rem",
          }}
        >
          <div style={{ marginBottom: "0.35rem" }}> Filters:</div>
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
          <div
  style={{
    // fontFamily: "Georgia",
    fontWeight: "semi-bold",
    fontSize: "1.25rem",
    display: "flex", // Add display: flex; to make the children appear in a row
    alignItems: "center", // Adjust alignment as needed
  }}
>
  <div style={{ marginRight: "20px" }}>
    <div style={{ marginBottom: "0.35rem" }}>Select Class:</div>
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
      styles={{
        // Adjust the width as needed
        control: (provided) => ({ ...provided, width: "300px", height: "55px", }),
      }}
    />
  </div>
  <div>
    <div style={{ marginBottom: "0.35rem" }}>Search for a Tutor:</div>
    <TextField
      variant="outlined"
      value={searchQuery}
      style={{
        // Adjust the width as needed
        width: "300px",
       
      }}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>
  <Box my={2} />
  {/* ... (remaining code) */}
</div>
          <Box my={2} />
          <div
            style={{
              marginBottom: "0.75rem",
              textDecoration: "underline",
              fontWeight: "bold",
              color: "#6fa5ff",
              fontSize: "1.8rem",
            }}
          >
            {" "}
            Tutors
          </div>
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
        </div>
        <br></br>
        <Grid container spacing={2}>
          {tutors.map((tutor) => (
            <Grid item key={tutor.id} xs={12} sm={6} md={6} lg={6} xl={6}>
              <TutorItem {...tutor} />
            </Grid>
          ))}
        </Grid>
      </Container>
      <Box my={2} />
    </>
  );
}
