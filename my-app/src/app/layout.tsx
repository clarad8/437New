// import { authOptions } from "../../pages/api/auth/[...nextauth]";
// import { getServerSession } from "next-auth";
// import "./globals.css";
// // import { Inter } from "next/";
// import { SessionProvider as Provider } from 'next-auth/react';
// import Login from "./Login";
// import Home from "./page";
// import TutorCourse from "../../pages/tutor-course";
// import React from "react";

// export default async function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const session = await getServerSession(authOptions);
//   return (
//     <html lang="en">
//       <body>
//         <Provider session={session}>
//           {!session ? (
//             <Login />
//           ) : (
//             <Home />
//             /* <>
//               <Home />
//               <TutorCourse />
//             </>*/
//           )}
//         </Provider>
//       </body>
//     </html>
//   );
// }
"use client";
import "./globals.css";
import Login from "./Login";
import Home from "./page";
import React from "react";
import { SessionProvider as Provider, useSession } from 'next-auth/react';
import Link from "next/link";
import { Session } from "inspector";

export default function RootLayout() {
  const { data: session } = useSession();

  if (session) {
    // Render your component when the session is available
    return (
      <div>
        <nav>
          <Link href="/">Login</Link>
          <Link href="/home">Home</Link>
        </nav>
        <Provider session={session}>
          <main>
            <Login />
            <Home />
          </main>
        </Provider>
      </div>
    );
  } else {
    // You can show a loading indicator or a message while waiting for the session
    return <div>Loading...</div>;
  }
}




