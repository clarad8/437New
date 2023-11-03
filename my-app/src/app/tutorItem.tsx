import React from "react";
import "./tutorItem.css";
import { useRouter } from "next/router";
import Link from "next/link";
import { Typography } from "@mui/material";

interface Tutor {
  id: string;
  name: string;
  tutoringClasses?: string[]; // Make tutoringClasses optional
  zoom: string;
}

const TutorItem: React.FC<Tutor> = ({ id, name, tutoringClasses, zoom }) => {
  const handleButtonClick = () => {
    console.log(`Tutor ${id} clicked!`);
  };

  return (
    <Link href={`/tutors/${id}`} className="tutor-box">
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
    </Link>
  );
};

export default TutorItem;
