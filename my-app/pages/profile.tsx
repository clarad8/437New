import { useState } from "react";
import NavBar from "../components/nav";
import Link from "next/link";
import { useRouter } from "next/router";
import { Alert, Button, TextField } from "@mui/material";
import getClassNames from "../src/app/classes";
import { db } from "../index";
import { collection, getDocs, query, doc } from "firebase/firestore";
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

const Profile: React.FC = (
  {
    /*passUserInfo*/
  }
) => {
  const router = useRouter();
  //console.log(passUserInfo);
  const [name, setName] = useState(" ");
  const [year, setYear] = useState(" ");
  const [email, setEmail] = useState(" ");
  const [takenClasses, setTakenClasses] = useState<string[]>([]);
  const [tutoredClasses, setTutoredClasses] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [classes, setClasses] = useState<classes[]>([]);
  //console.log(passUserInfo);
  const [isOnline, setIsOnline] = useState(false);
  const auth = getAuth();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const displayName = user.displayName;
      const uid = user.uid;
      const email = user.email;
      if(displayName != null)
      {
        setName(displayName);
      }
      if(email != null)
      {
        setEmail(email);
      }
      
    

    console.log(uid);
    console.log(email);
    console.log(name);

  } else {

    //user is not signed in
    router.push("/");
  }
});

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

      <h1>Profile</h1>

      <div>
        <h3>Online Status: (please select "online" if you are currently available to tutor)</h3>
        <label>
          <input
            type="radio"
            value="online"
            checked={isOnline}
            onChange={() => setIsOnline(true)}
          />
          Online
        </label>
        <label>
          <input
            type="radio"
            value="offline"
            checked={!isOnline}
            onChange={() => setIsOnline(false)}
          />
          Offline
        </label>
      </div>
      <div>
        <h3>Your Status: {isOnline ? 'Online' : 'Offline'}</h3>
      </div>

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

          <p>Email: </p>
          <TextField
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          <h3 style={{ display: 'inline' }}>Name: </h3>
          <span>{name}</span>
          <p></p>
          <h3 style={{ display: 'inline' }}>Email: </h3>
          <span>{email}</span>
          <p></p>
          <h3 style={{ display: 'inline' }}>Year: </h3>
          <span>{year}</span>
          <p></p>
          <h3 style={{ display: 'inline' }}>Classes You&apos;ve Taken: </h3>
          <span>{takenClasses.join(", ")}</span>
          <p></p>
          <h3 style={{ display: 'inline' }}>Classes You Are Tutoring: </h3>
          <span>{tutoredClasses.join(", ")}</span>
          <p></p>

          <Button variant="contained" color="primary" onClick={handleEdit}>
            Edit
          </Button>
          <Button variant="contained" color="primary" onClick={handleGoBack}>
            Back
          </Button>
        </>
      )}
    </div>
  );
};
export default Profile;
