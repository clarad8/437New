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
  ratings?: number[]; // Add ratings field to the Tutor interface
}

const TutorItem: React.FC<Tutor> = ({
  id,
  name,
  tutoringClasses,
  zoom,
  online,
  ratings,
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
        // Retrieve liked status for the current user from Firestore
        const userDocRef = doc(db, "users", user.uid);
        getDoc(userDocRef).then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            if (userData && userData.favorite) {
              setIsLiked(userData.favorite.includes(name));
            }
          }
        });
      }
    });

    return () => unsubscribe();
  }, [name]);

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

      try {
        const userData = (await getDoc(userDocRef)).data();

        if (userData) {
          const { favorite } = userData;

          if (favorite && favorite.includes(name)) {
            await updateDoc(userDocRef, {
              favorite: arrayRemove(name),
            });
          } else {
            await updateDoc(userDocRef, {
              favorite: arrayUnion(name),
            });
          }
        }
      } catch (error) {
        console.error("Error updating liked status:", error);
      }
    }
  };

  const averageRating =
    ratings && ratings.length > 0
      ? (
        ratings.reduce((acc, rating) => acc + rating, 0) / ratings.length
      ).toFixed(1)
      : "None";

  return (
    <div
      className="tutor-box"
      style={{ width: "200px", height: "200px", cursor: "pointer" }}
    >
      <Link href={`/tutors/${id}`}>
        <div className="tutor-content">
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
          <Typography variant="body1" gutterBottom>
            Average Rating: {averageRating}
          </Typography>
        </div>
      </Link>
      <div
        onClick={(e) => {
          e.stopPropagation(); // Prevent the event from propagating
          // Handle click logic for the entire tutor box here
        }}
      >
        <IconButton
          color={isLiked ? "primary" : "default"}
          style={{
            cursor: "pointer",
            color: isLiked ? "#d9534f" : "rgba(0, 0, 0, 0.54)", // Adjust shades of red and gray
          }}
          onClick={(e) => {
            e.stopPropagation(); // Prevent the event from propagating
            // Handle "like" logic for the icon button here
            handleLikeClick();
          }}
        >
          <FavoriteIcon />
        </IconButton>
      </div>
    </div>
  );
};

export default TutorItem;
