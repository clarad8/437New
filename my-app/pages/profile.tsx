"use client";
import { useEffect, useState } from "react";
import NavBar from "../components/nav";
import { useRouter } from "next/router";
import {
  Alert,
  AlertColor,
  AlertTitle,
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
      } else {
        //user is not signed in
        router.push("/");
      }
    });

    fetchClasses();
  }, []);

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


  const handleImageUpload = async (files: FileList | null, uid: string) => {
    setIsLoading(true); // Set loading state to true when starting the upload process

    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();

      reader.onloadend = async () => {
        if (typeof reader.result === "string") {
          // Check if the user already has an "image" field in Cloud Firestore
          const userDocRef = doc(db, "users", uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            if (userData && userData.image) {
              // If the user already has an image, update the existing "image" field
              await updateDoc(userDocRef, {
                image: reader.result,
              });
              console.log("Image updated successfully in Cloud Firestore!");
            } else {
              // If the user does not have an image, store the image data in the "image" field
              await setDoc(userDocRef, {
                image: reader.result,
              });
              console.log("Image stored successfully in Cloud Firestore!");
            }
          } else {
            // If the user document does not exist, create a new one with the "image" field
            await setDoc(userDocRef, {
              image: reader.result,
            });
            console.log("Image stored successfully in Cloud Firestore!");
          }

          // Set the profile image in your component state
          setProfileImage(reader.result);
          setIsLoading(false);
        }
      };

      reader.readAsDataURL(file);
    } else {
      // If no files are selected, set the profile image to null (or any default image)
      setProfileImage(null);
      setIsLoading(false); // Set loading state to false if no files are selected

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


  //  NEED TO SAVE INFO INTO DATABASE!!!!!
  //  right now this code only shows the new info that user has put in on the webpage for a moment
  //  at some point we need to save the info so that the info will show again when user comes back to profile page or logs in again
  //  i made a new collection called users which currently has the fields name and grade

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

      <Typography variant="h6" gutterBottom>
        Tutor Status: (please only select "online" if you are currently
        available to tutor)
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

      <Typography variant="body1" gutterBottom>
        Your Status: {isOnline ? "Online" : "Offline"}
      </Typography>

      <Typography variant="body2">{/* <p></p> */}</Typography>

      <Typography style={{ display: "inline" }} variant="body1" gutterBottom>
        Name: <span>{name}</span>
      </Typography>

      <Typography variant="body2">{/* <p></p> */}</Typography>

      <Typography style={{ display: "inline" }} variant="body1" gutterBottom>
        Email: <span>{email}</span>
      </Typography>

      <Typography variant="body2">{/* <p></p> */}</Typography>

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

          <Typography variant="body2">{/* <p></p> */}</Typography>
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
          <Typography variant="body2">{/* <p></p> */}</Typography>
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
            Grade:
          </Typography>
          <span>{grade}</span>
          <Typography variant="body2">{/* <p></p> */}</Typography>
          <Typography
            style={{ display: "inline" }}
            variant="body1"
            gutterBottom
          >
            {/* Classes You've Taken and Classes You're Tutoring should only show up if user is a tutor that has registered in database */}
            Classes You&apos;ve Taken:
          </Typography>
          <span>{takenClasses.join(", ")}</span>
          <Typography variant="body2">{/* <p></p> */}</Typography>
          <Typography
            style={{ display: "inline" }}
            variant="body1"
            gutterBottom
          >
            Classes You&apos;re Tutoring:
          </Typography>
          <span>{tutoredClasses.join(", ")}</span>
          <Typography variant="body2">{/* <p></p> */}</Typography>

          <Button variant="contained" color="primary" onClick={handleEdit}>
            Edit
          </Button>
          {/*
          <Button variant="contained" color="primary" onClick={handleGoBack}>
            Back
    </Button>*/}
        </>
      )}
    </div>
  );
}
