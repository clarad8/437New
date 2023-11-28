import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";

import { db, auth } from "../index";
import {
  Button,
  TextField,
  Chip,
  Typography,
  Box,
  IconButton,
  ButtonGroup,
  Grid,
  Container,
  Breadcrumbs,
  Link,
} from "@mui/material";
import { RadioButtonChecked, HelpOutline, Poll } from "@mui/icons-material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { AlertColor, AlertTitle } from "@mui/material";
import NavBar from "@/components/nav";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";


interface FirestoreDiscussion {
  id: string;
  title: string;
  content: string;
  userId: string;
  timestamp: Date;
  class: string;
  type: string;
  studentResponses?: string[];
  tutorResponses?: string[];
}

const FirestoreDiscussionComponent = () => {
  const [firestoreDiscussions, setFirestoreDiscussions] = useState<
    FirestoreDiscussion[]
  >([]);

  const [newDiscussion, setNewDiscussion] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("CSE330");
  const [postType, setPostType] = useState<string>("question"); // 'question', 'poll', or 'note'
  const [postVisibility, setPostVisibility] = useState<string>("everyone"); // 'everyone', 'students', or 'tutors'
  const [postTitle, setPostTitle] = useState("");

  const [pastPosts, setPastPosts] = useState<any[]>([]); // State to store past posts
  const [selectedClassPosts, setSelectedClassPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<FirestoreDiscussion | null>(
    null
  );
  const [isNewPostVisible, setNewPostVisibility] = useState(true);

  const [studentResponse, setStudentResponse] = useState("");
  const [tutorResponse, setTutorResponse] = useState("");

  const [isSnackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] =
    useState<AlertColor>("success");
  useState<AlertColor>("success");

  useEffect(() => {
    const fetchFirestoreDiscussions = () => {
      const discussionsCollection = collection(db, "discussions");

      const unsubscribe = onSnapshot(discussionsCollection, (snapshot) => {
        const discussions = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            content: data.content,
            userId: data.userId,
            timestamp: data.timestamp ? data.timestamp.toDate() : null,
            class: data.class || "",
            type: data.type,
          };
        });

        setFirestoreDiscussions(discussions);

        const newPastPosts = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            posts: data.posts || [],
          };
        });

        setPastPosts(newPastPosts);

        // Set selected class posts to the posts of the initially selected class
        const initialSelectedClassData = newPastPosts.find(
          (post) => post.id === selectedClass
        );

        setSelectedClassPosts(
          initialSelectedClassData ? initialSelectedClassData.posts : []
        );
      });

      return unsubscribe;
    };

    fetchFirestoreDiscussions();
    const unsubscribe = fetchFirestoreDiscussions();

    return () => {
      unsubscribe(); // Cleanup the listener when the component unmounts
    };
  }, [selectedClass]); // Update selectedClassPosts when selectedClass changes

  const handlePostClick = (post: FirestoreDiscussion) => {
    setSelectedPost(post);
    setNewPostVisibility(false);
  };

  interface FirestoreDiscussion {
    id: string;
    title: string;
    content: string;
    userId: string;
    timestamp: Date;
    class: string;
    type: string;
    studentResponses?: string[];
    tutorResponses?: string[];
  }

  // ... (rest of your code)

  const handleStudentResponseSubmit = async () => {
    if (selectedPost && selectedClass) {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const discussionsCollection = collection(db, "discussions");
        const classDocRef = doc(discussionsCollection, selectedClass);

        try {
          // Get the current posts array
          const classDoc = await getDoc(classDocRef);
          const currentPosts = classDoc.data()?.posts || [];

          // Find the index of the selected post in the array
          const postIndex = currentPosts.findIndex(
            (post: { id: string }) => post.id === selectedPost.id
          );

          if (postIndex !== -1) {
            // Update the selected post with the student's response
            currentPosts[postIndex] = {
              ...currentPosts[postIndex],
              studentResponses: [
                ...(currentPosts[postIndex].studentResponses || []),
                studentResponse,
              ],
            };

            // Update the document with the modified posts array
            await updateDoc(classDocRef, { posts: currentPosts });

            // Reset student response input field
            setStudentResponse("");

            setSnackbarSeverity("success");
            setSnackbarMessage("Student's response submitted successfully!");
            setSnackbarOpen(true);
          } else {
            console.error("Selected post not found in the array");
          }
        } catch (error) {
          console.error("Error fetching document:", error);
          setSnackbarSeverity("error");
          setSnackbarMessage(
            "Error submitting student's response. Please try again."
          );
          setSnackbarOpen(true);
        }
      } else {
        console.error("User not authenticated");
        setSnackbarSeverity("error");
        setSnackbarMessage(
          "Error submitting student's response. Please try again."
        );
        setSnackbarOpen(true);
      }
    }
  };

  const handleTutorResponseSubmit = async () => {
    if (selectedPost && selectedClass) {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const discussionsCollection = collection(db, "discussions");
        const classDocRef = doc(discussionsCollection, selectedClass);

        try {
          // Get the current posts array
          const classDoc = await getDoc(classDocRef);
          const currentPosts = classDoc.data()?.posts || [];

          // Find the index of the selected post in the array
          const postIndex = currentPosts.findIndex(
            (post: { id: string }) => post.id === selectedPost.id
          );

          if (postIndex !== -1) {
            // Update the selected post with the tutor's response
            currentPosts[postIndex] = {
              ...currentPosts[postIndex],
              tutorResponses: [
                ...(currentPosts[postIndex].tutorResponses || []),
                tutorResponse,
              ],
            };

            // Update the document with the modified posts array
            await updateDoc(classDocRef, { posts: currentPosts });

            // Reset tutor response input field
            setTutorResponse("");

            setSnackbarSeverity("success");
            setSnackbarMessage("Tutor's response submitted successfully!");
            setSnackbarOpen(true);
          } else {
            console.error("Selected post not found in the array");
          }
        } catch (error) {
          console.error("Error fetching document:", error);
          setSnackbarSeverity("error");
          setSnackbarMessage(
            "Error submitting tutor's response. Please try again."
          );
          setSnackbarOpen(true);
        }
      } else {
        console.error("User not authenticated");
        setSnackbarSeverity("error");
        setSnackbarMessage(
          "Error submitting tutor's response. Please try again."
        );
        setSnackbarOpen(true);
      }
    }
  };

  const renderPostDetails = () => {
    if (selectedPost) {
      return (
        <div>
          <Typography variant="h4">Post Details</Typography>

          {/* Container for Title, Type, and Content */}
          <Box
            style={{
              marginBottom: "20px",
              border: "2px solid #2196f3",
              padding: "10px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            <Typography variant="h6">Title: {selectedPost.title}</Typography>
            <Typography variant="body1">Type: {selectedPost.type}</Typography>
            <Typography variant="body1">
              Content: {selectedPost.content}
            </Typography>
          </Box>

          {/* Container for Past and New Student's Response */}
          <Box
            style={{
              marginBottom: "20px",
              border: "2px solid #2196f3",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            {/* Past Student's Response */}
            {selectedPost.studentResponses && (
              <div>
                <Typography variant="h5">Past Student's Responses</Typography>
                {selectedPost.studentResponses.map((response, index) => (
                  <Typography key={index} variant="body1">
                    {response}
                  </Typography>
                ))}
              </div>
            )}

            {/* New Student's Response */}
            <div>
              <Typography variant="h5">Student's Response</Typography>
              <TextField
                label="Enter your response"
                variant="outlined"
                multiline
                rows={4}
                fullWidth
                value={studentResponse}
                onChange={(e) => setStudentResponse(e.target.value)}
                style={{ marginBottom: "10px" }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleStudentResponseSubmit}
              >
                Submit Student's Response
              </Button>
            </div>
          </Box>

          {/* Container for Past and New Tutor's Response */}
          <Box
            style={{
              marginBottom: "20px",
              border: "2px solid #2196f3",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            {/* Past Tutor's Response */}
            {selectedPost.tutorResponses && (
              <div>
                <Typography variant="h5">Past Tutor's Responses</Typography>
                {selectedPost.tutorResponses.map((response, index) => (
                  <Typography key={index} variant="body1">
                    {response}
                  </Typography>
                ))}
              </div>
            )}

            {/* New Tutor's Response */}
            <div>
              <Typography variant="h5">Tutor's Response</Typography>
              <TextField
                label="Enter your response"
                variant="outlined"
                multiline
                rows={4}
                fullWidth
                value={tutorResponse}
                onChange={(e) => setTutorResponse(e.target.value)}
                style={{ marginBottom: "10px" }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleTutorResponseSubmit}
              >
                Submit Tutor's Response
              </Button>
            </div>
          </Box>
        </div>
      );
    }
  };

  const renderNewPostSection = () => {
    if (isNewPostVisible) {
      return (
        <div>
          {/* Post Type Selection */}
          <Box>
            <div
              style={{
                fontFamily: "system-ui",
                fontSize: "1.75rem",
                color: "#6fa5ff",
                marginTop: "20px",
                fontWeight: "semi-bold",
                marginBottom: "10px",
                textDecoration: "underline",
              }}
            >
              Make a New Post
            </div>
            <Typography variant="h6">Post Type:</Typography>
            <ButtonGroup color="primary" style={{ marginRight: 10 }}>
              <Button
                onClick={() => setPostType("question")}
                variant={postType === "question" ? "contained" : "outlined"}
              >
                Question
              </Button>
              <Button
                onClick={() => setPostType("poll")}
                variant={postType === "poll" ? "contained" : "outlined"}
              >
                Poll
              </Button>
              <Button
                onClick={() => setPostType("note")}
                variant={postType === "note" ? "contained" : "outlined"}
              >
                Note
              </Button>
            </ButtonGroup>
          </Box>

          {/* Post Visibility Selection */}
          <Box>
            <Typography variant="h6">Post Visibility:</Typography>
            <ButtonGroup color="primary" style={{ marginRight: 10 }}>
              <Button
                onClick={() => setPostVisibility("everyone")}
                variant={
                  postVisibility === "everyone" ? "contained" : "outlined"
                }
              >
                Everyone
              </Button>
              <Button
                onClick={() => setPostVisibility("students")}
                variant={
                  postVisibility === "students" ? "contained" : "outlined"
                }
              >
                Students
              </Button>
              <Button
                onClick={() => setPostVisibility("tutors")}
                variant={postVisibility === "tutors" ? "contained" : "outlined"}
              >
                Tutors
              </Button>
            </ButtonGroup>
          </Box>

          {/* Post Title */}
          <Box>
            <Typography variant="h6">Post Title:</Typography>
            <TextField
              label="Post Title"
              variant="outlined"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              fullWidth
              style={{ marginBottom: 10 }}
            />
          </Box>

          {/* Discussions for the selected class */}
          <Box>
            {firestoreDiscussions
              .filter(
                (discussion) =>
                  !selectedClass || discussion.class === selectedClass
              )
              .map((discussion) => (
                <Chip
                  key={discussion.id}
                  label={discussion.content}
                  style={{ margin: "5px" }}
                />
              ))}
          </Box>

          {/* Create discussion input */}
          <Box>
            <Typography variant="h6">Details:</Typography>
            <TextField
              label="Details"
              variant="outlined"
              value={newDiscussion}
              onChange={(e) => setNewDiscussion(e.target.value)}
              fullWidth
              multiline
              rows={4}
              style={{ marginBottom: 10 }}
            />
          </Box>

          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateFirestoreDiscussion}
              style={{ marginTop: 10 }}
            >
              Post New Discussion
            </Button>
          </Box>
        </div>
      );
    }
  };

  const handleCreateFirestoreDiscussion = async () => {
    if (
      newDiscussion.trim() !== "" &&
      selectedClass &&
      postTitle.trim() !== ""
    ) {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const discussionsCollection = collection(db, "discussions");
        const classDocRef = doc(discussionsCollection, selectedClass);

        // Update post details based on the selected post type, visibility, title, and include timestamp
        const postDetails = {
          type: postType,
          visibility: postVisibility,
          title: postTitle,
          content: newDiscussion,
          timestamp: new Date(), // Include the timestamp
        };

        await updateDoc(classDocRef, {
          posts: arrayUnion(postDetails),
        });

        // Reset input fields
        setNewDiscussion("");
        setPostTitle("");

        setSnackbarSeverity("success");
        setSnackbarMessage("Discussion posted successfully!");
        setSnackbarOpen(true);
      } else {
        console.error("User not authenticated");
        setSnackbarSeverity("error");
        setSnackbarMessage("Error posting discussion. Please try again.");
        setSnackbarOpen(true);
      }
    }
  };

  const handleClassButtonClick = (selectedClass: string) => {
    setSelectedClass(selectedClass);
    setSelectedPost(null);
    setNewPostVisibility(true);
    const selectedClassData = pastPosts.find(
      (post) => post.id === selectedClass
    );
    setSelectedClassPosts(selectedClassData ? selectedClassData.posts : []);
    setSelectedClass(selectedClass);
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
        <Typography color="text.primary">
          Discussion
        </Typography>
      </Breadcrumbs>
      <Container>
        <br></br>
        <div
          style={{
            fontFamily: "system-ui",
            fontSize: "3rem",
            fontWeight: "bold",
            color: "#6fa5ff",
            marginBottom: "10px",
          }}
        >
          Discussion Board
        </div>

        <Box>
          {[
            "CSE330",
            "CSE217",
            "CSE231",
            "CSE240",
            "CSE256",
            "CSE311",
            "CSE411",
            "CSE412",
            "CSE417",
            "CSE433",
            "CSE131",
            "CSE247",
            "CSE437",
            "CSE332",
            "CSE132",
            "CSE361",
            "CSE347",
            "CSE204",
          ].map((className) => (
            <Button
              key={className}
              variant="outlined"
              onClick={() => handleClassButtonClick(className)}
              style={{
                marginRight: 10,
                marginBottom: 10,
                backgroundColor:
                  selectedClass === className ? "#2196f3" : "white",
                color: selectedClass === className ? "white" : "black",
              }}
            >
              {className}
            </Button>
          ))}
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={2}>
            <div
              style={{
                fontFamily: "system-ui",
                fontSize: "1.75rem",
                color: "#6fa5ff",
                marginTop: "20px",
                fontWeight: "semi-bold",
                marginBottom: "10px",
                textDecoration: "underline",
              }}
            >
              Past Posts
            </div>

            {/* Display past posts for the selected class */}
            {selectedClassPosts.map((p: any, idx: number) => (
              <Box
                key={idx}
                style={{
                  border: "2px solid #2196f3", // Blue border
                  marginBottom: 10,
                  padding: "10px", // Add padding for better spacing
                  borderRadius: "5px", // Add rounded corners
                  cursor: "pointer", // Add pointer cursor for indicating clickability
                }}
                onClick={() => handlePostClick(p)}
              >
                <Chip label={p.title} style={{ margin: "5px" }} />
              </Box>
            ))}
          </Grid>

          <Grid item xs={8} style={{ marginLeft: "30px" }}>
            {" "}
            {/* Right side: 3/4 of the page */}
            {renderPostDetails()} {/* Conditionally render post details */}
            {renderNewPostSection()}{" "}
            {/* Conditionally render new post section */}
            {/* Snackbar for displaying alert messages */}
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
          </Grid>
        </Grid>
      </Container>
    </div>

  );
};

export default FirestoreDiscussionComponent;
