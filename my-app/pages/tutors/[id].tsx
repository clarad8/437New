// pages/tutors/[id].js

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import getTutors from "../../src/app/tutors";
import { Button, Typography } from "@mui/material";

interface Tutor {
  id: string;
  name: string;
  class: string[];
  zoom: string;
}

const TutorProfile = () => {
  const router = useRouter();
  const { id } = router.query; // Get the tutor's ID from the URL parameter

  const [tutor, setTutor] = useState<Tutor | null>(null);

  useEffect(() => {
    if (id) {
      // Fetch tutor data based on the ID using the getTutors function
      getTutors()
        .then((tutorsData) => {
          // Find the tutor with the matching ID
          const tutorData = tutorsData.find((t) => t.id === id);
          if (tutorData) {
            setTutor(tutorData);
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
      <Typography variant="h3" gutterBottom>
        Tutor Profile
      </Typography>
      <Typography variant="h4" gutterBottom>
        {tutor.name}
      </Typography>
      <Typography variant="h5" gutterBottom>
        Class Name: {tutor.class.join(", ")}
      </Typography>

      {/* make zoom link clickable */}
      <Typography variant="body1" gutterBottom>
        Zoom:{" "}
        <a href={tutor.zoom} target="_blank" rel="noopener noreferrer">
          {tutor.zoom}
        </a>
      </Typography>

      <Button variant="contained" onClick={handleGoBack}>
        Go Back
      </Button>
    </div>
  );
};

export default TutorProfile;
