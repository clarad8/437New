import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import app from '../app/page'; 
import { db } from '../../index';

interface Tutor {
  id: string;
  name: string;
  tutoringClasses: string[];
  zoom: string;
  online: boolean;
  profileImage: string | null;
  ratings: number[];
  comments: string[];
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
        tutoringClasses: tutor.tutoringClasses as string[],
        zoom: tutor.zoom,
        profileImage: tutor.image,
        online: tutor.online,
        ratings: tutor.ratings,
        comments: tutor.comments
      });
    });
    return tutorsData;
  } catch (error: any) {
    const errorMessage = error.message;
    throw new Error('Error fetching tutors: ' + errorMessage);
  }

};

export default getTutors;