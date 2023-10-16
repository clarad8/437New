import { useState } from "react";
import NavBar from "../components/nav";
import Link from "next/link";
import { useRouter } from "next/router";
import { Alert, Button, TextField } from "@mui/material";
import getClassNames from "../src/app/classes";
import { db } from "../index";
import { collection, getDocs, query, doc } from "firebase/firestore";
import React from "react";

/*interface ProfileProps {
  passUserInfo: {
    name: any;
  };
}*/
interface classes {
  id: string;
  name: string;
}

const Profile: React.FC = (
  {
    /*passUserInfo*/
  }
) => {
  const router = useRouter();
  //console.log(passUserInfo);
  const [name, setName] = useState(" ");
  const [year, setYear] = useState(" ");
  const [takenClasses, setTakenClasses] = useState<string[]>([]);
  const [tutoredClasses, setTutoredClasses] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [classes, setClasses] = useState<classes[]>([]);
  //console.log(passUserInfo);

  const handleGoBack = () => {
    router.push("/"); //go back to home page
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveChanges = () => {
    setIsEditing(false);
  };

  const fetchClasses = async () => {
    try {
      const classNamesData = await getClassNames();
      // console.log("Fetched class names:", classNamesData);
      setClasses(classNamesData);
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
    }
  };

  //  NEED TO SAVE INFO INTO DATABASE!!!!!
  //  right now this code only shows the new info that user has put in on the webpage for a moment
  //  at some point we need to save the info so that the info will show again when user comes back to profile page or logs in again
  //  i made a new collection called users which currently has the fields name and grade

  fetchClasses();

  return (
    <div>
      <NavBar></NavBar>
      <br></br>
      <Button variant="contained" color="primary" onClick={handleGoBack}>
        Back
      </Button>
      <h1>Profile</h1>
      {isEditing ? (
        <>
          <p>Name: </p>
          <TextField
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            id="outlined-basic"
            variant="outlined"
          />

          <p>Grade: </p>
          <TextField
            type="text"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            id="outlined-basic"
            variant="outlined"
          />

          <p></p>
          <p>Classes You&apos;ve Taken:</p>
          {classes.map((classItem) => (
            <div key={classItem.id}>
              <label>
                <input
                  type="checkbox"
                  value={classItem.name}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setTakenClasses([...takenClasses, classItem.name]);
                    } else {
                      const updatedTakenClasses = takenClasses.filter(
                        (item) => item !== classItem.name
                      );
                      setTakenClasses(updatedTakenClasses);
                    }
                  }}
                />
                {classItem.name}
              </label>
            </div>
          ))}
          <p>Classes You Are Tutoring:</p>
          {classes.map((classItem) => (
            <div key={classItem.id}>
              <label>
                <input
                  type="checkbox"
                  value={classItem.name}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setTutoredClasses([...tutoredClasses, classItem.name]);
                    } else {
                      const updatedTutoredClasses = tutoredClasses.filter(
                        (item) => item !== classItem.name
                      );
                      setTutoredClasses(updatedTutoredClasses);
                    }
                  }}
                />
                {classItem.name}
              </label>
            </div>
          ))}
          <p> </p>
          <button onClick={handleSaveChanges}>Save Changes</button>
        </>
      ) : (
        <>
          <h3>Name: {name}</h3>
          <h3>Year: {year}</h3>
          <h3>Classes You&apos;ve Taken: {takenClasses.join(", ")}</h3>
          <h3>Classes You Are Tutoring: {tutoredClasses.join(", ")}</h3>

          <Button variant="contained" color="primary" onClick={handleEdit}>
            Edit
          </Button>
        </>
      )}
    </div>
  );
};
export default Profile;
