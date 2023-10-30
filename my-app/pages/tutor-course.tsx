"use client";

import NavBar from "./../components/nav";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import getClassNames from "../src/app/classes";
import {
  Alert,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import React from "react";

interface classes {
  id: string;
  name: string;
}
export default function TutorCourse() {
  //const session = useSession();
  const router = useRouter();
  const [classes, setClasses] = useState<classes[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [addedCourse, setAddedCourse] = useState(false);
  const [alert, setAlert] = useState(false);

  const handleGoBack = () => {
    router.push("/"); //go back to home page
  };

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const classNamesData = await getClassNames();

        console.log("Fetched class names:", classNamesData);

        setClasses(classNamesData);
      } catch (error: any) {
        console.error("Error fetching data:", error.message);
      }
    };

    fetchClassData();
  }, []);
  const addTutor = async () => {
    if (selectedClass != "") {
      console.log(selectedClass);
      setAddedCourse(true);
      setTimeout(() => {
        setAddedCourse(false); // Remove the success message after 3 seconds
      }, 3000);
    } else {
      setAlert(true);
    }
  };
  return (
    <div>
      <NavBar></NavBar>

      <Typography variant="h4" gutterBottom>
        Tutor a Course
      </Typography>
      <Button variant="contained" onClick={handleGoBack}>
        Go Back
      </Button>
      <br></br>
      <Typography variant="h5" gutterBottom>
        Select Class to Tutor:{" "}
      </Typography>

      {alert ? <Alert severity="error">Please select a class!</Alert> : null}
      {addedCourse ? (
        <Alert severity="success">Successfully added {selectedClass}</Alert>
      ) : null}
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

      <Button variant="contained" onClick={addTutor}>
        Submit
      </Button>
    </div>
  );
}
