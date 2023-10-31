import React from "react";
import "./tutorItem.css";
import { useRouter } from "next/router";
import Link from "next/link";
import { Typography } from "@mui/material";

//separates each tutor into its container
interface Tutor {
  id: string;
  name: string;
  class: string;
  zoom: string;
}

const TutorItem: React.FC<Tutor> = ({ id, name, class: classNumber, zoom }) => {
  const handleButtonClick = () => {
    console.log(`Tutor ${id} clicked!`);
  };

  return (
    <Link href={`/tutors/${id}`} className="tutor-box">
      <Typography variant="h5" gutterBottom>
        {name}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Class Name: {classNumber}
      </Typography>
    </Link>
  );
};

export default TutorItem;
