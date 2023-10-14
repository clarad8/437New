import NavBar from '@/components/nav';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Alert, Button } from "@mui/material";

export default function Profile() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back(); // Navigates back to the previous page
  };


  
  return (
    <div>
      <NavBar></NavBar>
      <h1>Profile</h1>
      <button onClick={handleGoBack}>Go Back</button>

    </div>
  );
}