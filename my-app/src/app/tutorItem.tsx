import React from 'react';
import './TutorItem.css';
import { useRouter } from 'next/router';
import Link from 'next/link';

//separates each tutor into its container
interface Tutor {
  id: string;
  name: string;
  class: string;
  contact: string;
}

const TutorItem: React.FC<Tutor> = ({ id, name, class: classNumber, contact }) => {
 
  const handleButtonClick = () => {
    //const router = useRouter(); 
    console.log(`Tutor ${id} clicked!`);
    // Navigate to the tutor's profile page with their ID as a parameter
    //router.push(`/tutors/${id}`);
  };

  
    // return (
    //   <button className="tutor-box" onClick={handleButtonClick}>
    //     <h3>{name}</h3>
    //     <p>Class Name: {classNumber}</p>
    //     <p>Contact: {contact}</p>
    //   </button>
    // );
    return (
      
        <div className="tutor-box">
          <Link href={`/tutors/${id}`}>
          <h3>{name}</h3>
          </Link>
          
          <p>Class Name: {classNumber}</p>
          <p>Contact: {contact}</p>
        </div>
    );
};

export default TutorItem;