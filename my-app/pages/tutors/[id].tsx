// pages/tutors/[id].js

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import getTutors from '/Users/liaseo/Desktop/cse437/437New/my-app/src/app/tutors';

interface Tutor {
  id: string;
  name: string;
  class: string;
  contact: string;
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
              throw new Error('Tutor not found');
            }
          })
          .catch((error) => {
            console.error('Error fetching tutor data:', error);
          });
      }
    }, [id]);
  
    if (!tutor) {
      return <div>Loading...</div>;
    }
  
    return (
      <div>
        <h1>Tutor Profile</h1>
        <h2>{tutor.name}</h2>
        <p>Class Name: {tutor.class}</p>
        <p>Contact: {tutor.contact}</p>
      </div>
    );
  };
  
  export default TutorProfile;
