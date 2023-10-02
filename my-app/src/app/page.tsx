'use client';
import { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import getTutors from './tutors'; 
import TutorItem from './tutorItem';
import getClassNames from './classes';

interface Tutor {
    id: string;
    name: string;
    class: string;
    contact: string;
}

interface classes {
    id: string;
    name: string;
}

export default function Home() {

  const session = useSession();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [classes, setClasses] = useState<classes[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>(''); // State to hold selected class
   
  useEffect(() => {
    const fetchTutorsData = async () => {
        try {
          const tutorsData = await getTutors();
          const classNamesData = await getClassNames();

          console.log('Fetched tutors data:', tutorsData); // Log fetched data
          console.log('Fetched class names:', classNamesData);

          setTutors(tutorsData);
          setClasses(classNamesData);
        } catch (error:any) {
          console.error('Error fetching data:', error.message);
       
        }
      };  

      fetchTutorsData();
  }, []); // Empty dependency array ensures the effect runs once after the initial render


  useEffect(() => {
    // Filter tutors based on the selected class when it changes
    if (selectedClass) {
      const filteredTutors = tutors.filter((tutor) => tutor.class === selectedClass);
      setTutors(filteredTutors);
    } 
  }, [selectedClass, tutors]);
  

  

  return (
    <>
      <div>{session?.data?.user?.name}</div>
      <button onClick={() => signOut()}>Logout</button>
    
      <h2>Select Class:</h2>
      <div className="dropdown">
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
          <option value="">Select a class</option>
          {classes.map((classItem) => (
            <option key={classItem.id} value={classItem.name}>
              {classItem.name}
            </option>
          ))}
        </select>
       {/* <button onClick={loadTutorsForCourse}>Load Tutors for Course</button> */}
      </div>

      <h2>Tutors:</h2>
      <div className="tutor-container">
        {tutors.map((tutor) => (
          <TutorItem key={tutor.id} {...tutor} />
        ))}
      </div>
    </>
  );
}
