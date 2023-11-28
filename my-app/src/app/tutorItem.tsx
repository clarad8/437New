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
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ReactStars from "react-stars";


interface Tutor {
  id: string;
  name: string;
  tutoringClasses?: string[]; // Make tutoringClasses optional
  zoom: string;
  online: boolean;
  ratings?: number[];
  image: string;
}

const TutorItem: React.FC<Tutor> = ({
  id,
  name,
  tutoringClasses,
  zoom,
  online,
  ratings,
  image,
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

  const calculateStarRating = (averageRating: string) => {
    const rating = parseFloat(averageRating);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? <StarIcon key={i} /> : <StarBorderIcon key={i} />);
    }
    return stars;
  };

  const averageRating =
    ratings && ratings.length > 0
      ? (
        ratings.reduce((acc, rating) => acc + rating, 0) / ratings.length
      ).toFixed(1)
      : "None";

  return (
    <div className="tutor-wrapper">
      <div className="tutor-box">
        <div className="left-profile-container">
          <Link href={`/tutors/${id}`}>
            <div className="profile-image-container">
              <img
                src={image}
                alt={`${name}'s profile`}
                className="tutor-image rounded"
              />
            </div>
          </Link>
          <Typography
            variant="subtitle1"
            gutterBottom
            style={{ color: online ? "green" : "red", fontWeight: '300' }}
          >
            {online ? "Online" : "Offline"}
          </Typography>
          <div className="rating-and-like" onClick={(e) => e.stopPropagation()}>
            <IconButton
              color={isLiked ? "primary" : "default"}
              style={{
                cursor: "pointer",
                color: isLiked ? "#d9534f" : "rgba(0, 0, 0, 0.54)",
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleLikeClick();
              }}
            >
              <FavoriteIcon />
            </IconButton>
          </div>
        </div>

        <div className="tutor-details">
          <Link href={`/tutors/${id}`}>
            <div>
              <Typography variant="h6" style={{ fontWeight: '600' }} gutterBottom>
                {name}
              </Typography>

              {tutoringClasses && tutoringClasses.length > 0 ? (
                <Typography variant="subtitle1" gutterBottom>
                <span style={{ textDecoration: 'underline' }}>Classes</span>: {tutoringClasses.join(", ")}
              </Typography>
              ) : (
                <Typography variant="body1" gutterBottom>
                  No classes available
                </Typography>
              )}
              {/* <Typography
                variant="subtitle1"
                gutterBottom
                style={{ color: online ? "green" : "red",  fontWeight: '600'}}
              >
                {online ? "Online" : "Offline"}
              </Typography> */}
            </div>
          </Link>

          <div className="rating">
            <Typography variant="subtitle1" gutterBottom>
              Average Rating: {averageRating}{" "}
              <ReactStars
                count={5}
                size={24}
                color2={"#ffd700"}
                value={parseFloat(averageRating)}
                edit={false}
              />
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );

};

export default TutorItem;
