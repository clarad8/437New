"use client";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Breadcrumbs,
  Button,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import NavBar from "./../components/nav";
import getClassNames from "../src/app/classes";
import { auth, db } from "../index"; // Import your Firebase Firestore instance
import { addDoc, collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

interface classes {
  id: string;
  name: string;
}

export default function TutorCourse() {
  const router = useRouter();
  const [classesData, setClassesData] = useState<classes[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [classScores, setClassScores] = useState<{ [key: string]: string }>({});
  const [addedClass, setAddedClass] = useState(false);
  const [alert, setAlert] = useState(false);

  const [selectedTutoringClasses, setSelectedTutoringClasses] = useState<
    string[]
  >([]);
  const [addedTutoringClasses, setAddedTutoringClasses] = useState(false);
  const [tutoringCoursesAlert, setTutoringCoursesAlert] = useState(false);

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
      try {
        const user = auth.currentUser;
        if (user) {
          const userId = user.uid;
          const userName = user.displayName;
          const userEmail = user.email;

          // Get the existing tutoring classes from the "tutors" collection
          let tutorDocRef = doc(db, "tutors", userId);
          let tutorDoc = await getDoc(tutorDocRef);

          

          // if tutor doesn't exist, we add the user to tutor database
          if(!tutorDoc.exists()) {
              const tutorData = {
                id: userId, // Use the user's UID as the ID
                name: userName,
                email: userEmail
              };
              await setDoc(tutorDocRef, tutorData);
          }

          // reload tutor info
          tutorDocRef = doc(db, "tutors", userId);
          tutorDoc = await getDoc(tutorDocRef);

          let existingTakenClasses = [];
          let existingClassScores = [];

          // now it should exist
          if (tutorDoc.exists()) {
            existingTakenClasses = tutorDoc.data().takenClasses || [];
            existingClassScores = tutorDoc.data().classScores || {};
          }
            // Merge the existing taken classes with the new selected classes
            const updatedTakenClasses = [...existingTakenClasses, ...selectedClasses];

            // Merge the existing class scores with the new class scores
            const updatedClassScores = { ...existingClassScores, ...classScores };


          // Prepare data to be updated in the "tutors" collection
          const tutorData = {
            takenClasses: updatedTakenClasses,
            classScores: classScores
          };

          // update data to the "tutors" collection in Firebase Firestore
          await updateDoc(tutorDocRef, tutorData);

          setAddedClass(true);
          setTimeout(() => {
            setAddedClass(false);
          }, 3000);
        }
      } catch (error) {
        console.error("Error adding taken classes:", error);
      }
    } else {
      setAlert(true);
    }
  };

  const addTutoringCourses = async () => {
    if (selectedTutoringClasses.length > 0) {
      try {
        const user = auth.currentUser;
        if (user) {
          // Get the user's UID, name, and email
          const userId = user.uid;
          const userName = user.displayName;
          const userEmail = user.email;

          // Get the existing tutoring classes from the "tutors" collection
          const tutorDocRef = doc(db, "tutors", userId);
          const tutorDoc = await getDoc(tutorDocRef);

          let existingTutoringClasses = [];
          if (tutorDoc.exists()) {
            existingTutoringClasses = tutorDoc.data().tutoringClasses || [];
          }

          // Merge the existing tutoring classes with the new selected tutoring classes
          const updatedTutoringClasses = [...existingTutoringClasses, ...selectedTutoringClasses];

          // Prepare data to be added/updated in the "tutors" collection
          const tutorData = {
            id: userId, // Use the user's UID as the ID
            name: userName,
            email: userEmail,
            tutoringClasses: updatedTutoringClasses,
          };

          // Add data to the "tutors" collection in Firebase Firestore
          await setDoc(tutorDocRef, tutorData, { merge: true });

          setAddedTutoringClasses(true);
          setTimeout(() => {
            setAddedTutoringClasses(false);
          }, 3000);
        }
      } catch (error) {
        console.error("Error adding tutoring classes:", error);
      }
    } else {
      setTutoringCoursesAlert(true);
    }
  };


  return (
    <div>
      <NavBar></NavBar>
      <br></br>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        <Link underline="hover" href="/">
          Home
        </Link>
        <Typography color="text.primary">Tutor Course</Typography>
      </Breadcrumbs>
      <br></br>
      <Typography variant="h5" gutterBottom>
        Select Classes You've Taken (multiple selections allowed):
      </Typography>

      {alert ? (
        <Alert severity="error">Please select at least one class!</Alert>
      ) : null}
      {addedClass ? (
        <Alert severity="success">
          Requests submitted for selected classes.
        </Alert>
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
        Select Classes You Want to Tutor (multiple selections allowed):
      </Typography>

      <Typography variant="body1" gutterBottom>
        Thank you for signing up to tutor! Please use the dropdown menu below to
        select the class you would like to tutor for.{" "}
      </Typography>

      {tutoringCoursesAlert ? (
        <Alert severity="error">Please select at least one class!</Alert>
      ) : null}
      {addedTutoringClasses ? (
        <Alert severity="success">
          Requests submitted for selected tutoring classes.
        </Alert>
      ) : null}
      <FormControl sx={{ m: 1, minWidth: 180 }} size="small">
        <InputLabel id="demo-multiple-select-label">Select classes</InputLabel>
        <Select
          labelId="demo-multiple-select-label"
          id="demo-multiple-select"
          multiple
          value={selectedTutoringClasses}
          label="Select classes"
          onChange={(e) =>
            setSelectedTutoringClasses(e.target.value as string[])
          }
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