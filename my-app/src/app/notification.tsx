import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../index"; // Import your Firestore database configuration
import { List, ListItem, Typography } from "@mui/material";

const Notification: React.FC = () => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [userName, setUserName] = useState(""); // You need to get the user's name from your user data

  useEffect(() => {
    const fetchQuestions = async () => {
      // Query the tutor collection where the tutor's name matches the user's name
      const q = query(collection(db, "tutors"), where("name", "==", userName));

      try {
        const querySnapshot = await getDocs(q);

        // Initialize an array to store the questions
        const tutorQuestions: string[] = [];

        querySnapshot.forEach((doc) => {
          const tutorData = doc.data();
          // Assuming "question" is a field in your tutor document
          const tutorQuestion = tutorData.question;
          // You can also retrieve "contact" in a similar way

          // Add the question to the array
          tutorQuestions.push(tutorQuestion);
        });

        setQuestions(tutorQuestions);
      } catch (error) {
        console.error("Error fetching questions: ", error);
      }
    };

    fetchQuestions();
  }, [userName]); // Ensure this effect runs when the user's name changes

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
        {questions.map((question, index) => (
          <ListItem key={index} style={{ marginBottom: "8px" }}>
            <Typography variant="body2">{question}</Typography>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default Notification;
