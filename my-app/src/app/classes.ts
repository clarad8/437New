import { collection, getDocs, query, doc } from 'firebase/firestore';
import { db } from '../../index';
interface ClassName {
  id: string;
  name: string;
}

const getClassNames = async (): Promise<ClassName[]> => {
  const classNames: ClassName[] = [];
  const classNamesCollection = collection(db, 'classes'); // 'classNames' is the name of Firestore collection

  try {
    const querySnapshot = await getDocs(classNamesCollection);
    querySnapshot.forEach((doc) => {
      const className = doc.data();
      classNames.push({
        id: doc.id,
        name: className.name,
      });
    });
    return classNames;
  } catch (error: any) {
    const errorMessage = error.message;
    throw new Error('Error fetching class names: ' + errorMessage);
  }
};

export default getClassNames;