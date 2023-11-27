import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../index"; // Import your Firestore database configuration
import { Button, List, ListItem, Typography } from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import Alert from "@mui/material/Alert";
import { getAuth } from "firebase/auth";

interface NotificationProps {
  isClicked: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;

}

const Notification: React.FC<NotificationProps> = ({ isClicked, setIsVisible }) => {
  const [notifications, setNotifications] = useState<
    { question: string; contact: string }[]
  >([]);
  const auth = getAuth();
  const user = auth.currentUser;
  const [isTutor, setIsTutor] = useState(false);
  const [tutorId, setTutorId] = useState("");
  // const [isVisible, setIsVisible] = useState(true); 


  useEffect(() => {
    const fetchNotifications = async () => {
      if (user?.displayName) {
        // Query the tutor collection where the tutor's name matches the user's name
        const q = query(
          collection(db, "tutors"),
          where("name", "==", user.displayName)
        );

        try {
          const querySnapshot = await getDocs(q);

          // don't show the notification box if the user is not a tutor
          if (querySnapshot.empty) {
            console.log("User is not a tutor.");
            setIsTutor(false);
          } else {
            console.log("User is a tutor.");
            setIsTutor(true);
            setTutorId(user.uid);
          }

          // Initialize an array to store the notifications
          const tutorNotifications: { question: string; contact: string }[] =
            [];

          querySnapshot.forEach((doc) => {
            const tutorData = doc.data();
            const tutorQuestion = tutorData.question;
            const tutorContact = tutorData.contact;

            // Add the notification to the array
            tutorNotifications.push({
              question: tutorQuestion,
              contact: tutorContact,
            });
          });

          setNotifications(tutorNotifications);
          console.log(tutorNotifications.length);

        } catch (error) {
          console.error("Error fetching notifications: ", error);
        }
      }
    };
    if(isClicked) {
      fetchNotifications();
      console.log("showing");
    }
  }, [isClicked, user?.displayName]);

  // button to resolve/delete the question for tutors
  // const handleResolve = async (contact: string, question: string) => {
  //   try {
  //     // Remove the notification from the database
  //     const q = query(
  //       collection(db, "tutors"),
  //       where("id", "==", tutorId)
  //       );

  //       const querySnapshot = await getDocs(q);

  //     querySnapshot.forEach((doc) => {
  //     const tutorData = doc.data();
  //     const tutorContact = tutorData.contact;
  //     const tutorQuestion = tutorData.question;

  //     if (tutorContact === contact && tutorQuestion === question) {
  //       const docRef = doc(db, "tutors", doc.id);
  //       const updatedContacts = tutorContact.filter((c) => c !== contact);
  //       updateDoc(doc, { contact: updatedContacts });
  //       const updatedQuestions = tutorQuestion.filter((q) => q !== question);
  //       updateDoc(doc, { questions: updatedQuestions });

  //     }
  //   });
  //     // await deleteDoc(doc(db, "tutors", id));

  //     // Update the notifications state to remove the resolved notification
  //     // setNotifications(notifications.filter((notification) => notification.id !== id));
  //   } catch (error) {
  //     console.error("Error resolving notification:", error);
  //   }
  // };

  // Function to hide the notification box
  const handleClose = () => {
    setIsVisible(false);
  };

  // if(!isTutor) {
  //   if(notifications.length === 0) {
  //     return (
  //       <Alert severity="info" onClose={() => setIsVisible(false)}>
  //         You don't have any notifications.
  //       </Alert>
  //     );
  //   }
  //   return null;
  // }
  

  // if user is not a tutor, don't show the notification box at all
  // if (!isTutor || !isClicked) {
  //   return null;
  // }
  // console.log(notifications.length);
  if(!isClicked) {
    return null;
  }

  console.log(notifications.length);
  if (isClicked && notifications.length === 0) {
    console.log("this is error 1");
    return (
      <Alert severity="info" onClose={() => setIsVisible(false)}>
        You don't have any notifications.
      </Alert>
    );
  }

  // console.log(isTutor);
  // if (isClicked && !isTutor) {
  //   console.log("this is error 2");

  //   return (
  //     <Alert severity="info" onClose={() => setIsVisible(false)}>
  //       You don't have any notifications.
  //     </Alert>
  //   );
  // }

  return (
    <div
      style={{
        position: "fixed",
        top: "30px", // Adjust top position as needed
        right: "30px", // Adjust right position as needed
        backgroundColor: "lightblue",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "5px",
      }}
    >

      {/* <Typography variant="h5" gutterBottom>
        Notifications:
      </Typography>
      <List style={{ listStyleType: "none", padding: 0 }}>
        {notifications.map((notification, index) => (
          <ListItem key={index} style={{ marginBottom: "8px" }}>
            
            {!notification.question || !notification.contact ? null : (
              <Typography variant="body2">
                Contact: {notification.contact} Question: {notification.question}
              </Typography>  
            )}
          </ListItem>
        ))}
      </List> */}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
        <Button variant="outlined" onClick={handleClose}>
          <ClearIcon />
        </Button>
      </div>
      
      <Typography variant="h5" gutterBottom>
        Notifications:
      </Typography>

      <List style={{ listStyleType: "none", padding: 0 }}>
        {notifications.map((notification, index) => (
          <ListItem key={index} style={{ marginBottom: "8px" }}>
            {notification.question && notification.contact && (
              <div style={{ display: "flex", alignItems: "center" }}>
                <Typography variant="body2">
                  Contact: {notification.contact} Question: {notification.question}
                </Typography>
                {/* <Button
                  variant="contained"
                  onClick={() => handleResolve(notification.id)}
                  endIcon={<ClearIcon />}
                >
                </Button> */}
              </div>
            )}
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default Notification;