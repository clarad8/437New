"use client";

import NavBar from "@/components/nav";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import getClassNames from "../src/app/classes";
import { Alert, Button } from "@mui/material";
import { useRouter } from 'next/router';

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
    router.push("/");   //go back to home page
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

      <h1>Tutor a Course</h1>
      <button onClick={handleGoBack}>Go Back</button>
      <h2>Select Class to Tutor:</h2>
      
       {alert ? (
        <Alert severity="error">Please select a class!</Alert>
        ) : null}
      {addedCourse ? (
        <Alert severity="success">Successfully added {selectedClass}</Alert>
      ) : null}
      
      <div className="dropdown">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">Select a class</option>
          {classes.map((classItem) => (
            <option key={classItem.id} value={classItem.name}>
              {classItem.name}
            </option>
          ))}
        </select>
        <Button onClick={addTutor}>Submit</Button>
      </div>
    </div>
  );
}
