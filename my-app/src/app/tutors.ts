import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import app from '/Users/claradu/Desktop/1/437New/my-app/src/app/page'; 
import { db } from '/Users/claradu/Desktop/1/437New/my-app/index';

interface Tutor {
  id: string;
  name: string;
  class: string;
  contact: string;
}

const tutorsData: Tutor[] = [];

const getTutors = async () => {
  const tutorsData: Tutor[] = [];
  const tutorsCollection = collection(db, 'tutors'); // 'tutors' is the name of Firestore collection

  try {
    // get collectiond data
    const querySnapshot = await getDocs(tutorsCollection);
    querySnapshot.forEach((doc) => {
      console.log(querySnapshot.docs);
      const tutor = doc.data();
      tutorsData.push({
        id: doc.id,
        name: tutor.name,
        class: tutor.class,
        contact: tutor.contact, // Assuming you store the image URL in the 'imageURL' field
      });
    });
    return tutorsData;
  } catch (error: any) {
    const errorMessage = error.message;
    throw new Error('Error fetching tutors: ' + errorMessage);
  }

};

export default getTutors;