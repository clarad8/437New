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
import { SessionProvider as Provider } from 'next-auth/react';
import Link from "next/link";

export default function RootLayout(){

  // Render the client-side components directly, no Server Components
  return (
    <div>
      <Provider>
        {/* Include a dynamic route for rendering your pages */}
        <main>
          <Login />
          <Home />
          {/* You can use dynamic routes if needed */}
          {/* <TutorCourse /> */}
        </main>
      </Provider>
    </div>
  );
}




