"use client";
import React, { useEffect, useState } from "react";
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
import NavBar from "./../components/nav";
import getClassNames from "../src/app/classes";


interface classes {
  id: string;
  name: string;
}


export default function TutorCourse() {
  const router = useRouter();
  const [classesData, setClassesData] = useState<classes[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [classScores, setClassScores] = useState<{ [key: string]: string }>({});
  const [addedCourse, setAddedCourse] = useState(false);
  const [alert, setAlert] = useState(false);


  const [selectedTutoringCourses, setSelectedTutoringCourses] = useState<string[]>([]);
  const [addedTutoringCourses, setAddedTutoringCourses] = useState(false);
  const [tutoringCoursesAlert, setTutoringCoursesAlert] = useState(false);


  const handleGoBack = () => {
    router.push("/");
  };


  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const classNamesData = await getClassNames();
        setClassesData(classNamesData);
      } catch (error: any) {
        console.error("Error fetching data:", error.message);
      }
    };


    fetchClassData();
  }, []);


  const addTakenClasses = async () => {
    if (selectedClasses.length > 0) {
      console.log(selectedClasses);
      console.log(classScores);


      setAddedCourse(true);
      setTimeout(() => {
        setAddedCourse(false);
      }, 3000);
    } else {
      setAlert(true);
    }


    // Add logic here to submit selectedClasses and classScores to the database.
  };


  const addTutoringCourses = async () => {
    if (selectedTutoringCourses.length > 0) {
      console.log(selectedTutoringCourses);


      setAddedTutoringCourses(true);
      setTimeout(() => {
        setAddedTutoringCourses(false);
      }, 3000);
    } else {
      setTutoringCoursesAlert(true);
    }


    // Add logic here to submit selectedTutoringCourses to the database.
  };




  return (
    <div>
      <NavBar></NavBar>
      {/* ... */}
      <Typography variant="h5" gutterBottom>
        Select Classes You've Taken(multiple selections allowed):
      </Typography>


      {alert ? <Alert severity="error">Please select at least one class!</Alert> : null}
      {addedCourse ? (
        <Alert severity="success">Requests submitted for selected classes.</Alert>
      ) : null}
      <FormControl sx={{ m: 1, minWidth: 180 }} size="small">
        <InputLabel id="demo-multiple-select-label">Select classes</InputLabel>
        <Select
          labelId="demo-multiple-select-label"
          id="demo-multiple-select"
          multiple
          value={selectedClasses}
          label="Select classes"
          onChange={(e) => setSelectedClasses(e.target.value as string[])}
        >
          {classesData.map((classItem) => (
            <MenuItem key={classItem.id} value={classItem.name}>
              {classItem.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>


      {selectedClasses.map((selectedClass, index) => (
        <div key={selectedClass}>
          <Typography variant="h6" gutterBottom>
            {selectedClass}
          </Typography>
          <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <InputLabel id={`score-label-${index}`}>Select score</InputLabel>
            <Select
              labelId={`score-label-${index}`}
              id={`score-select-${index}`}
              value={classScores[selectedClass] || ""}
              label="Select score"
              onChange={(e) =>
                setClassScores((prevScores) => ({
                  ...prevScores,
                  [selectedClass]: e.target.value as string,
                }))
              }
            >
              <MenuItem value="90-">90-</MenuItem>
              <MenuItem value="90+">90+</MenuItem>
            </Select>
          </FormControl>
        </div>
      ))}


      <Button variant="contained" onClick={addTakenClasses}>
        Submit
      </Button>




      <Typography variant="h5" gutterBottom>
        Select Classes You Want to Tutor(multiple selections allowed):
      </Typography>

      <Typography variant="body1" gutterBottom>
        Thank you for signing up to tutor! Please use the dropdown menu below to
        select the class you would like to tutor for.{" "}
      </Typography>

      <Typography variant="body1" gutterBottom>
        Please note: There will be a 1-week period of time for us to verify and
        approve your eligibility to tutor for the course before you can start.{" "}
      </Typography>

      {tutoringCoursesAlert ? <Alert severity="error">Please select at least one class!</Alert> : null}
      {addedTutoringCourses ? (
        <Alert severity="success">Requests submitted for selected tutoring classes.</Alert>
      ) : null}
      <FormControl sx={{ m: 1, minWidth: 180 }} size="small">
        <InputLabel id="demo-multiple-select-label">Select classes</InputLabel>
        <Select
          labelId="demo-multiple-select-label"
          id="demo-multiple-select"
          multiple
          value={selectedTutoringCourses}
          label="Select classes"
          onChange={(e) => setSelectedTutoringCourses(e.target.value as string[])}
        >
          {classesData.map((classItem) => (
            <MenuItem key={classItem.id} value={classItem.name}>
              {classItem.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>


      <Button variant="contained" onClick={addTutoringCourses}>
        Submit
      </Button>
    </div>
  );
}
