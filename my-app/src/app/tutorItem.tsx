import React, { useState, useEffect } from "react";
import "./tutorItem.css";
import { useRouter } from "next/router";
import Link from "next/link";
import { Typography, IconButton } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { onAuthStateChanged } from "firebase/auth";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../index";

interface Tutor {
  id: string;
  name: string;
  tutoringClasses?: string[]; // Make tutoringClasses optional
  zoom: string;
  online: boolean;
}

const TutorItem: React.FC<Tutor> = ({
  id,
  name,
  tutoringClasses,
  zoom,
  online,
}) => {
  const [userId, setUserId] = useState(""); // State to store the current user's ID
  const [isLiked, setIsLiked] = useState(() => {
    const likedTutorsJSON = localStorage.getItem("likedTutors");
    const likedTutors = likedTutorsJSON ? JSON.parse(likedTutorsJSON) : {};
    return likedTutors[name] || false;
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      }
    });

    // Clean up the subscription on component unmount
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this effect runs once after the initial render

  const handleLikeClick = async () => {
    setIsLiked(!isLiked);

    // Get the current liked tutors from localStorage or initialize an empty object
    const likedTutorsJSON = localStorage.getItem("likedTutors");
    const likedTutors = likedTutorsJSON ? JSON.parse(likedTutorsJSON) : {};

    // Toggle the liked status for the current tutor
    likedTutors[name] = !isLiked;

    // Save the updated likedTutors object to localStorage
    localStorage.setItem("likedTutors", JSON.stringify(likedTutors));

    if (userId) {
      const userDocRef = doc(db, "users", userId);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData) {
          const { favorite } = userData;

          if (favorite && favorite.includes(name)) {
            // If the tutor's name is already in 'favorite' array, remove it
            await updateDoc(userDocRef, {
              favorite: arrayRemove(name),
            });
          } else {
            // If the tutor's name is not in 'favorite' array, add it
            await updateDoc(userDocRef, {
              favorite: arrayUnion(name),
            });
          }
        }
      }
    }
  };

  return (
    <Link href={`/tutors/${id}`}>
      <div
        className="tutor-box"
        style={{ width: "200px", height: "200px", cursor: "pointer" }}
      >
        <Typography variant="h5" gutterBottom>
          {name}
        </Typography>

        {tutoringClasses && tutoringClasses.length > 0 ? (
          <Typography variant="body1" gutterBottom>
            Class Name: {tutoringClasses.join(", ")}
          </Typography>
        ) : (
          <Typography variant="body1" gutterBottom>
            No classes available
          </Typography>
        )}
        {online ? (
          <Typography variant="body1" gutterBottom>
            Online
          </Typography>
        ) : (
          <Typography variant="body1" gutterBottom>
            Offline
          </Typography>
        )}
        <IconButton
          color={isLiked ? "primary" : "default"}
          onClick={handleLikeClick}
        >
          <FavoriteIcon />
        </IconButton>
        <style jsx>{`
          .tutor-box {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 200px; /* Adjust the width for desktop */
            margin: 10px; /* Add spacing between boxes */
          }

          @media (max-width: 768px) {
            .tutor-box {
              width: 100%; /* Full width on smaller screens */
            }
          }
        `}</style>
      </div>
    </Link>
  );
};

export default TutorItem;
