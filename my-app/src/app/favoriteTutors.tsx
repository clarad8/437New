import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../index"; // Import your Firestore database configuration

const FavoriteTutors: React.FC = () => {
  const [favoriteTutors, setFavoriteTutors] = useState<string[]>([]);

  useEffect(() => {
    const fetchFavoriteTutors = async () => {
      const q = query(collection(db, "users"), where("favorite", "!=", []));

      try {
        const querySnapshot = await getDocs(q);
        const favoriteTutorsList: string[] = [];

        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          const favoriteTutors = userData.favorite || [];
          favoriteTutorsList.push(...favoriteTutors);
        });

        setFavoriteTutors(favoriteTutorsList);
      } catch (error) {
        console.error("Error fetching favorite tutors: ", error);
      }
    };

    fetchFavoriteTutors();
  }, []); // Run the effect once after the initial render

  return (
    <ul style={{ listStyleType: "none", padding: 0 }}>
      {favoriteTutors.map((tutor, index) => (
        <li key={index} style={{ marginBottom: "8px" }}>{tutor}</li>
      ))}
    </ul>
  );
};

export default FavoriteTutors;
