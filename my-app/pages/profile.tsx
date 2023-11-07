"use client";
import { useEffect, useState } from "react";
import NavBar from "../components/nav";
import { useRouter } from "next/router";
import {
  Alert,
  AlertColor,
  AlertTitle,
  Box,
  Breadcrumbs,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Link,
  Radio,
  RadioGroup,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import getClassNames from "../src/app/classes";
import { db, auth } from "../index";
import {
  collection,
  getDoc,
  query,
  doc,
  getFirestore,
  setDoc,
  DocumentSnapshot,
  updateDoc,
} from "firebase/firestore";
import React from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";


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
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const storage = getStorage();
  const [uid, setUid] = useState("");
  const [isLoading, setIsLoading] = useState(true);


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
  const [isTutor, setIsTutor] = useState(false); // Variable to store whether the user is a tutor
  const [isSnackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] =
    useState<AlertColor>("success");

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
        setUid(user.uid);
        // getDocs returns a QuerySnapshot which is a collection of DocumentSnapshot. getDoc returns the specific document.

        const userDocRef = doc(firestore, "users", user.uid);
        const docSnap = await getDoc(userDocRef);



        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData) {
            const { name, email, grade, image } = userData;

            if (grade) {
              setGrade(grade);
            }

            if (email) {
              setEmail(email);
            }

            if (name) {
              setName(name);
            }
            if (image) {
              setProfileImage(image);
            }
            else {
              setProfileImage(null);
            }
            setIsLoading(false);

          }
        }

        console.log(uid);
        console.log(email);
        console.log(name);

        // checks if current user is a tutor (in the tutors database)

        const tutorDocRef = doc(firestore, "tutors", uid);
        const tutorDocSnap = await getDoc(tutorDocRef);
        if (tutorDocSnap.exists()) {
          // If the tutor document exists, set isTutor to true
          setIsTutor(true);

          const tutorData = tutorDocSnap.data();
          if (tutorData) {
            const { tutoringClasses, takenClasses } = tutorData;


            // if tutor filled out form in tutor a course page, their tutoring classes and taken classes
            // should appear on profile page.

            if (tutoringClasses) {
              setTutoredClasses(tutoringClasses);
            }
            if (takenClasses) {
              setTakenClasses(takenClasses);
            }
          }
          console.log("the current user is a tutor!");
        }
        else {

          // if user is not a tutor, we set taken classes and tutored classes to default "None".

          setIsTutor(false);
          const none: string[] = ["None"];
          setTakenClasses(none);
          setTutoredClasses(none);
          console.log("the current user is NOT a tutor!");
        }


      } else {
        //user is not signed in
        router.push("/");
      }
    });

    fetchClasses();
  }, []);

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
        setSnackbarMessage("Changes saved successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        console.log("Grade updated successfully in the database!");
      } else {
        console.log("user is null!");
      }
    } catch (error) {
      console.error("Error updating grade:", error);
      setSnackbarMessage("Error saving changes. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };
  const handleOnlineStatusChange = async (isOnline: boolean) => {
    try {
      const user = getAuth().currentUser; // Get the user object
      if (user) {
        const firestore = getFirestore();
        const tutorDocRef = doc(firestore, "tutors", user.uid);
        await updateDoc(tutorDocRef, {
          online: isOnline, // Update the 'online' field based on the selected value
        });

        setSnackbarMessage(`You are now ${isOnline ? "Online" : "Offline"}.`);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        console.log(`Online status updated to ${isOnline ? "Online" : "Offline"}.`);
      } else {
        console.error("User is null. Unable to update online status.");
      }
    } catch (error) {
      console.error("Error updating online status:", error);
      setSnackbarMessage("Error updating online status. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };


  const handleImageUpload = async (files: FileList | null, uid: string) => {
    setIsLoading(true);

    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();

      reader.onloadend = async () => {
        if (typeof reader.result === "string") {
          const userDocRef = doc(db, "users", uid);
          const tutorDocRef = doc(db, "tutors", uid); // Reference to the tutor document

          try {
            const userDocSnap = await getDoc(userDocRef);
            const tutorDocSnap = await getDoc(tutorDocRef); // Check if the tutor document exists

            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();

              // Update 'image' field in 'users' database
              await setDoc(userDocRef, {
                ...userData,
                image: reader.result,
              });

              setIsLoading(false);
              setProfileImage(reader.result);

              if (tutorDocSnap.exists()) {
                // If the user also exists as a tutor, update 'image' field in 'tutors' database
                const tutorData = tutorDocSnap.data();
                await setDoc(tutorDocRef, {
                  ...tutorData,
                  image: reader.result,
                });
              }

              console.log("Image updated successfully in Cloud Firestore!");
            } else {
              console.error("User not found in 'users' database.");
              setIsLoading(false);
            }
          } catch (error) {
            console.error("Error updating image:", error);
            setIsLoading(false);
          }
        }
      };

      reader.readAsDataURL(file);
    } else {
      setProfileImage(null);
      setIsLoading(false);
    }
  };


  const circleButtonStyle: React.CSSProperties = {
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    backgroundColor: "gray",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    textAlign: "center", // Center text horizontally
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
        <Typography color="text.primary">Profile</Typography>
      </Breadcrumbs>

      <Box my={2} />

      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          severity={snackbarSeverity}
          onClose={() => setSnackbarOpen(false)}
        >
          <AlertTitle>
            {snackbarSeverity === "success" ? "Success" : "Error"}
          </AlertTitle>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {profileImage ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Display the uploaded image here */}
          {profileImage && (
            <img
              src={profileImage}
              alt="Profile"
              style={{
                borderRadius: "50%",
                width: "150px",
                height: "150px",
                marginTop: "10px", // Adjust the margin-top to align the image
              }}
            />
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              const input = document.getElementById('profile-image-input');
              if (input) {
                input.click();
              }
            }}
          >
            Change Profile Picture
          </Button>
        </div>
      ) : (
        <label style={circleButtonStyle}>
          <span>Upload a profile picture!</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e.target.files, uid)}
            style={{ display: "none" }}
          />
        </label>
      )}

      <input
        type="file"
        accept="image/*"
        id="profile-image-input"
        onChange={(e) => handleImageUpload(e.target.files, uid)}
        style={{ display: 'none' }}
      />

      {/* Hide the tutor status if the user is not a tutor */}

      {isTutor && (
        <><Typography variant="h6" gutterBottom>
          Tutor Status: (please only select "online" if you are currently
          available to tutor)
        </Typography>
          <FormControlLabel
            value="online"
            checked={isOnline}
            onChange={() => {
              setIsOnline(true);
              handleOnlineStatusChange(true); // Call the function with true when Online is selected
            }}
            control={<Radio />}
            label="Online"
          />
          <FormControlLabel
            value="offline"
            checked={!isOnline}
            onChange={() => {
              setIsOnline(false);
              handleOnlineStatusChange(false); // Call the function with false when Offline is selected
            }}
            control={<Radio />}
            label="Offline"
          />
          <Typography variant="body1" gutterBottom>
            Your Status: {isOnline ? "Online" : "Offline"}
          </Typography></>
      )}


      <Box my={3} />

      <Typography style={{ display: "inline" }} variant="body1" gutterBottom>
        Name: <span>{name}</span>
      </Typography>

      <Box my={1} />

      <Typography style={{ display: "inline" }} variant="body1" gutterBottom>
        Email: <span>{email}</span>
      </Typography>

      <Box my={1} />


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
            Year:
          </Typography>
          <FormControl>
            <RadioGroup
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="radio-buttons-group"
            >
              <FormControlLabel
                value="freshman"
                onChange={() => setGrade("Freshman")}
                control={<Radio />}
                label="Freshman"
              />
              <FormControlLabel
                value="sophomore"
                onChange={() => setGrade("Sophomore")}
                control={<Radio />}
                label="Sophomore"
              />
              <FormControlLabel
                value="junior"
                onChange={() => setGrade("Junior")}
                control={<Radio />}
                label="Junior"
              />
              <FormControlLabel
                value="senior"
                onChange={() => setGrade("Senior")}
                control={<Radio />}
                label="Senior"
              />
            </RadioGroup>
          </FormControl>

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

          <Box my={1} />
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

          <Typography
            style={{ display: "inline" }}
            variant="body1"
            gutterBottom
          >
            Year:
            <span>{" " + grade}</span>
          </Typography>
          <Box my={1} />

          <Typography
            style={{ display: "inline" }}
            variant="body1"
            gutterBottom
          >
            Classes You&apos;ve Taken:
            <span>{" " + takenClasses.join(", ")}</span>

          </Typography>

          <Box my={1} />
          <Typography
            style={{ display: "inline" }}
            variant="body1"
            gutterBottom
          >
            Classes You&apos;re Tutoring:
            <span>{" " + tutoredClasses.join(", ")}</span>

          </Typography>

          <Box my={2} />
          <Button variant="contained" color="primary" onClick={handleEdit}>
            Edit
          </Button>

        </>
      )}
    </div>
  );
}
