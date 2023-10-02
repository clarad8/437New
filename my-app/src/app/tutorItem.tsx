import React from 'react';
import './TutorItem.css';
import { useRouter } from 'next/router';

//separates each tutor into its container
interface Tutor {
  id: string;
  name: string;
  class: string;
  contact: string;
}

const TutorItem: React.FC<Tutor> = ({ id, name, class: classNumber, contact }) => {
    const handleButtonClick = () => {
        const router = useRouter();
      // Handle button click action here if needed
        console.log(`Tutor ${id} clicked!`);
      // Redirect to a blank page for now
        router.push('/blank');
    };
  
    return (
      <button className="tutor-box" onClick={handleButtonClick}>
        <h3>{name}</h3>
        <p>Class Name: {classNumber}</p>
        <p>Contact: {contact}</p>
      </button>
    );
};

export default TutorItem;