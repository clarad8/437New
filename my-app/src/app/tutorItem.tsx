import React from 'react';
import './tutorItem.css';
import { useRouter } from 'next/router';
import Link from 'next/link';

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

          <h3>{name}</h3>
          
         
          <p>Class Name: {classNumber}</p>
        
      </Link>
      

    );
};

export default TutorItem;