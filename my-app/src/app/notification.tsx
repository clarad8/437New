import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../index"; // Import your Firestore database configuration
import { List, ListItem, Typography } from "@mui/material";
import { getAuth } from "firebase/auth";

const Notification: React.FC = () => {
  const [notifications, setNotifications] = useState<
    { question: string; contact: string }[]
  >([]);
  const auth = getAuth();
  const user = auth.currentUser;

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
        } catch (error) {
          console.error("Error fetching notifications: ", error);
        }
      }
    };

    fetchNotifications();
  }, [user?.displayName]);

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
      <Typography variant="h5" gutterBottom>
        Notifications:
      </Typography>
      <List style={{ listStyleType: "none", padding: 0 }}>
        {notifications.map((notification, index) => (
          <ListItem key={index} style={{ marginBottom: "8px" }}>
            <Typography variant="body2">
              Contact: {notification.contact} Question: {notification.question}
            </Typography>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default Notification;
