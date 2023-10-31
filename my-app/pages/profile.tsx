"use client";
import { useEffect, useState } from "react";
import NavBar from "../components/nav";
import { useRouter } from "next/router";
import {
  Alert,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import getClassNames from "../src/app/classes";
import { db } from "../index";
import {
  collection,
  getDoc,
  query,
  doc,
  getFirestore,
  setDoc,
  DocumentSnapshot,
} from "firebase/firestore";
import React from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

/*interface ProfileProps {
  passUserInfo: {
    name: any;
  };
}*/
interface classes {
  id: string;
  name: string;
}

export default function Profile() {
  const router = useRouter();
  //console.log(passUserInfo);
  const [name, setName] = useState(" ");
  const [grade, setGrade] = useState(" ");
  const [email, setEmail] = useState(" ");
  const [takenClasses, setTakenClasses] = useState<string[]>([]);
  const [tutoredClasses, setTutoredClasses] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [classes, setClasses] = useState<classes[]>([]);
  //console.log(passUserInfo);
  const [isOnline, setIsOnline] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  // if(user) {
  //     const displayName = user.displayName;
  //     const uid = user.uid;
  //     const email = user.email;
  //     if(displayName != null)
  //     {
  //       setName(displayName);
  //     }
  //     if(email != null)
  //     {
  //       setEmail(email);
  //     }
  // }
  // else {
  //   //user is not signed in
  // }

  const handleGoBack = () => {
    router.push("/"); //go back to home page
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveChanges = async () => {
    setIsEditing(false);

    try {
      const firestore = getFirestore();
      if (user != null) {
        const userDocRef = doc(firestore, "users", user.uid);
        await setDoc(userDocRef, { grade: grade }, { merge: true });
        console.log("Grade updated successfully in the database!");
      } else {
        console.log("user is null!");
      }
    } catch (error) {
      console.error("Error updating grade:", error);
    }
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const classNamesData = await getClassNames();
        console.log("Fetched class names:", classNamesData);
        setClasses(classNamesData);
      } catch (error: any) {
        console.error("Error fetching classes data:", error.message);
      }
    };

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const displayName = user.displayName;
        const uid = user.uid;
        const email = user.email;
        const firestore = getFirestore();

        // getDocs returns a QuerySnapshot which is a collection of DocumentSnapshot. getDoc returns the specific document.

        const userDocRef = doc(firestore, "users", user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData) {
            const { name, email, grade } = userData;

            if (grade) {
              setGrade(grade);
            }

            if (email) {
              setEmail(email);
            }

            if (name) {
              setName(name);
            }
          }
        }

        console.log(uid);
        console.log(email);
        console.log(name);
      } else {
        //user is not signed in
        router.push("/");
      }
    });
    // const fetchUserData = async () => {
    //   try {
    //     console.log(user);
    //     if(user) {
    //       const {displayName, email} = user;
    //       setName(displayName || "");
    //       setEmail(email || "");
    //     }
    //     else{
    //       //user is not signed in
    //     }
    //   }
    //   catch(error:any) {
    //     console.error("Error fetching user data: ", error.message);
    //   }
    // }

    fetchClasses();
    // fetchUserData();
  }, []);

  //  NEED TO SAVE INFO INTO DATABASE!!!!!
  //  right now this code only shows the new info that user has put in on the webpage for a moment
  //  at some point we need to save the info so that the info will show again when user comes back to profile page or logs in again
  //  i made a new collection called users which currently has the fields name and grade

  return (
    <div>
      <NavBar></NavBar>
      <br></br>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>

      <div>
        <Typography variant="h5" gutterBottom>
          Online Status: (please select "online" if you are currently available
          to tutor)
        </Typography>
        <FormControl>
          <RadioGroup
            aria-labelledby="demo-row-radio-buttons-group-label"
            defaultValue="offline"
            name="radio-buttons-group"
          >
            <FormControlLabel
              value="online"
              checked={isOnline}
              onChange={() => setIsOnline(true)}
              control={<Radio />}
              label="Online"
            />
            <FormControlLabel
              value="offline"
              checked={!isOnline}
              onChange={() => setIsOnline(false)}
              control={<Radio />}
              label="Offline"
            />
          </RadioGroup>
        </FormControl>
      </div>
      <div>
        <Typography variant="body1" gutterBottom>
          Your Status: {isOnline ? "Online" : "Offline"}
        </Typography>
      </div>
      <Typography style={{ display: "inline" }} variant="body1" gutterBottom>
        Name: <span>{name}</span>
      </Typography>

      <p></p>
      <Typography style={{ display: "inline" }} variant="body1" gutterBottom>
        Email: <span>{email}</span>
      </Typography>

      <p></p>

      {/* user can't edit their name and email through the edit buttion */}

      {isEditing ? (
        <>
          {/*
          <Typography variant="body1" gutterBottom>
            Name:
          </Typography>
          <TextField
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            id="outlined-basic"
            variant="outlined"
      />*/}

          <Typography variant="body1" gutterBottom>
            Grade:
          </Typography>
          <TextField
            type="text"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            id="outlined-basic"
            variant="outlined"
          />

          <p></p>
          {/*
          <Typography variant="body1" gutterBottom>
            Classes You&apos;ve Taken:
          </Typography>
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
          <Typography variant="body1" gutterBottom>
            Classes You&apos;re Tutoring:
          </Typography>
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
                ))}*/}
          <p> </p>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveChanges}
          >
            Save Changes
          </Button>
        </>
      ) : (
        <>
          {/*
          <Typography
            style={{ display: "inline" }}
            variant="body1"
            gutterBottom
          >
            Name:
          </Typography>

          <span>{name}</span>
      <p></p>*/}
          <Typography
            style={{ display: "inline" }}
            variant="body1"
            gutterBottom
          >
            Year:
          </Typography>
          <span>{grade}</span>
          <p></p>
          <Typography
            style={{ display: "inline" }}
            variant="body1"
            gutterBottom
          >
            Classes You&apos;ve Taken:
          </Typography>
          <span>{takenClasses.join(", ")}</span>
          <p></p>
          <Typography
            style={{ display: "inline" }}
            variant="body1"
            gutterBottom
          >
            Classes You&apos;re Tutoring:
          </Typography>
          <span>{tutoredClasses.join(", ")}</span>
          <p></p>

          <Button variant="contained" color="primary" onClick={handleEdit}>
            Edit
          </Button>
          <Button variant="contained" color="primary" onClick={handleGoBack}>
            Back
          </Button>
          <p></p>
        </>
      )}
    </div>
  );
}
