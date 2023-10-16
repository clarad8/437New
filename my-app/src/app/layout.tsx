import { authOptions } from "../../pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import "./globals.css";
// import { Inter } from "next/";
import SessionProvider from "./SessionProvider";
import Login from "./Login";
import Home from "./page";
import TutorCourse from "../../pages/tutor-course";
import React from "react";
// const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          {!session ? (
            <Login />
          ) : (
            <Home />
            /* <>
              <Home />
              <TutorCourse />
            </>*/
          )}
        </SessionProvider>
      </body>
    </html>
  );
}
