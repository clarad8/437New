// pages/tutors/[id].js

import { SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/router";
import getTutors from "../../src/app/tutors";
import {
  Box,
  Breadcrumbs,
  Button,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import ReactStars from "react-stars";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import NavBar from "./../../components/nav";

import {
  getFirestore,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../../index";

interface Tutor {
  id: string;
  name: string;
  tutoringClasses: string[];
  zoom: string;
  profileImage: string | null;
  ratings: number[];
  comments: string[];
}

interface Comment {
  rating: number;
  comment: string;
}

const TutorProfile = () => {
  const router = useRouter();
  const { id } = router.query; // Get the tutor's ID from the URL parameter

  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null); // State to store profile image URL

  const [rating, setRating] = useState(0); // State to store user's rating
  const [comment, setComment] = useState(""); // State to store user's comment
  const [comments, setComments] = useState<Comment[]>([]); // State to store comments and ratings

  const handleRatingChange = (newRating: SetStateAction<number>) => {
    // Handle user's rating change here (you can send it to your backend API)
    setRating(newRating);
  };

  const handleCommentChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setComment(event.target.value);
  };

  const submitRatingAndComment = async (
    id: string,
    rating: number,
    comment: string
  ) => {
    try {
      const user = auth.currentUser;

      if (user) {
        const userId = user.uid;

        // Get the tutor document reference
        const tutorDocRef = doc(db, "tutors", id);

        // Get the existing data from the tutor document
        const tutorDoc = await getDoc(tutorDocRef);

        if (tutorDoc.exists()) {
          // Extract existing ratings and comments
          const existingRatings: number[] = tutorDoc.data().ratings || [];
          const existingComments: string[] = tutorDoc.data().comments || [];

          // Update ratings and comments arrays with new data
          const updatedRatings = [...existingRatings, rating];
          const updatedComments = [...existingComments, comment];

          // Prepare data to be updated in the "tutors" collection
          const tutorData = {
            ratings: updatedRatings,
            comments: updatedComments,
          };

          // Update data in the "tutors" collection in Firebase Firestore
          await updateDoc(tutorDocRef, tutorData);

          console.log("Rating and comment submitted successfully!");
        } else {
          console.error("Tutor not found in the database.");
        }
      }
    } catch (error) {
      console.error("Error submitting rating and comment:", error);
    }
  };
  const handleSubmitComment = async () => {
    if (rating > 0 && comment.trim() !== "") {
      try {
        if (tutor) {
          const { id } = tutor; // Extract tutor ID from the tutor object
          await submitRatingAndComment(id, rating, comment);
          // Optionally, you can reset the rating and comment states after submission
          setRating(0);
          setComment("");
          console.log("Rating and comment submitted successfully!");
        }
      } catch (error) {
        console.error("Error submitting rating and comment:", error);
      }
    } else {
      console.error("Invalid rating or comment");
    }
  };

  useEffect(() => {
    if (id) {
      // Fetch tutor data based on the ID using the getTutors function
      getTutors()
        .then((tutorsData) => {
          // Find the tutor with the matching ID
          const tutorData = tutorsData.find((t) => t.id === id);
          if (tutorData) {
            if (!tutorData.zoom) {
              // Generate a random Zoom link (you can replace this logic with your preferred way of generating a Zoom link)
              tutorData.zoom = `https://zoom.us/j/${Math.floor(
                Math.random() * 1000000000
              )}`;
            }
            setTutor(tutorData);
            setProfileImage(tutorData.profileImage);

            const fetchedComments: Comment[] = tutorData.comments.map(
              (comment: string, index: number) => ({
                rating: tutorData.ratings[index],
                comment,
              })
            );
            setComments(fetchedComments);
          } else {
            throw new Error("Tutor not found");
          }
        })
        .catch((error) => {
          console.error("Error fetching tutor data:", error);
        });
    }
  }, [id]);

  if (!tutor) {
    return <div>Loading...</div>;
  }

  const handleGoBack = () => {
    router.back(); // Navigates back to the previous page
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
        <Typography color="text.primary">Tutor Profile</Typography>
      </Breadcrumbs>
      <Typography variant="h3" gutterBottom>
        Tutor Profile
      </Typography>
      {profileImage && (
        <img
          src={profileImage}
          alt="Profile"
          style={{ width: "150px", height: "150px", borderRadius: "50%" }}
        />
      )}
      <Typography variant="h4" gutterBottom>
        {tutor.name}
      </Typography>
      <Typography variant="h5" gutterBottom>
        Class Name: {tutor.tutoringClasses.join(", ")}
      </Typography>

      <Typography variant="body1" gutterBottom>
        Below is the tutor's zoom meeting room! Please join whenever you are
        ready.
      </Typography>

      {/* make zoom link clickable */}
      <Typography variant="body1" gutterBottom>
        Zoom:{" "}
        <a href={tutor.zoom} target="_blank" rel="noopener noreferrer">
          {tutor.zoom}
        </a>
      </Typography>

      <div style={{ marginTop: "20px" }}>
        <Typography variant="body1" gutterBottom>
          Rate this tutor:
        </Typography>
        <ReactStars
          count={5}
          onChange={handleRatingChange}
          size={24}
          color2={"#ffd700"} // Yellow color for selected stars
          value={rating}
        />
      </div>

      {/* Comment box */}
      <div style={{ marginTop: "20px" }}>
        <Typography variant="body1" gutterBottom>
          Leave a comment:
        </Typography>
        <TextField
          multiline
          rows={4}
          value={comment}
          onChange={handleCommentChange}
          sx={{ width: "60%" }}
          InputProps={{
            style: { resize: "vertical" },
          }}
        />
      </div>
      <div>
        {/* Submit button */}
        <Button
          variant="contained"
          color="primary"
          style={{ marginTop: "10px" }}
          onClick={handleSubmitComment} // Call handleSubmitComment function on button click
        >
          Submit Comment
        </Button>
      </div>

      <Button variant="contained" onClick={handleGoBack}>
        Go Back
      </Button>

      {/* Display past comments and ratings */}
      <div style={{ marginTop: "20px" }}>
        <Typography variant="h6" gutterBottom>
          Past Comments and Ratings
        </Typography>
        {comments.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {comments.map((comment, index) => (
              <li key={index} style={{ marginBottom: "15px" }}>
                <Box display="flex" alignItems="center">
                  <ReactStars
                    count={5}
                    size={24}
                    color2={"#ffd700"} // Yellow color for selected stars
                    value={comment.rating}
                    edit={false}
                  />
                  <Typography variant="body1" style={{ marginLeft: "10px" }}>
                    <strong>Comment:</strong> {comment.comment}
                  </Typography>
                </Box>
              </li>
            ))}
          </ul>
        ) : (
          <Typography variant="body1" gutterBottom>
            No past comments and ratings available.
          </Typography>
        )}
      </div>
    </div>
  );
};

export default TutorProfile;
