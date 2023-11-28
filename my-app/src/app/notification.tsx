import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../index"; // Import your Firestore database configuration
import { Button, List, ListItem, Typography } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import CheckIcon from "@mui/icons-material/Check";
import { getAuth } from "firebase/auth";

interface NotificationProps {
  isClicked: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const Notification: React.FC<NotificationProps> = ({
  isClicked,
  setIsVisible,
}) => {
  const [notifications, setNotifications] = useState<
    { question: string; contact: string }[]
  >([]);
  const [scheduler, setScheduler] = useState<
    {
      date: string;
      user: string;
      accepted?: boolean;
    }[]
  >([]);
  const [userScheduledMeetings, setUserScheduledMeetings] = useState<
    {
      date: string;
      accepted: boolean;
      acceptedDate: string;
    }[]
  >([]);
  const auth = getAuth();
  const user = auth.currentUser;
  const [isTutor, setIsTutor] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<{
    date: string;
    user: string;
  } | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user?.displayName) {
        const q = query(
          collection(db, "tutors"),
          where("name", "==", user.displayName)
        );

        try {
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            console.log("User is not a tutor.");
            setIsTutor(false);
          } else {
            console.log("User is a tutor.");
            setIsTutor(true);

            const tutorNotifications: { question: string; contact: string }[] =
              [];
            const scheduleNotifications: {
              date: string;
              user: string;
              accepted?: boolean;
            }[] = [];

            querySnapshot.forEach((doc) => {
              const tutorData = doc.data();
              const tutorQuestion = tutorData.question;
              const tutorContact = tutorData.contact;
              tutorNotifications.push({
                question: tutorQuestion,
                contact: tutorContact,
              });

              const scheduledMeetingsData = tutorData.scheduledMeetings || [];

              scheduledMeetingsData.forEach(
                (meeting: {
                  date: any;
                  user: { email: any };
                  accepted?: boolean;
                }) => {
                  const meetingDate = new Date(meeting.date);
                  const formattedDate = meetingDate.toLocaleString();
                  const meetingUser = meeting.user?.email;
                  const accepted = meeting.accepted || false;

                  scheduleNotifications.push({
                    date: formattedDate,
                    user: meetingUser,
                    accepted: accepted,
                  });
                }
              );
            });

            console.log("scheduleNotifications:", scheduleNotifications);

            setNotifications(tutorNotifications);
            setScheduler(scheduleNotifications);
          }
        } catch (error) {
          console.error("Error fetching notifications: ", error);
        }
      }
    };

    if (isClicked && user?.displayName) {
      fetchNotifications();
    }
  }, [isClicked, user?.displayName]);

  useEffect(() => {
    // Update selectedSchedule based on changes in the scheduler state
    if (scheduler.length > 0) {
      const latestSchedule = scheduler[scheduler.length - 1];
      if (latestSchedule.accepted && !selectedSchedule) {
        setSelectedSchedule(latestSchedule);
      }
    }
  }, [scheduler, selectedSchedule]);

  const handleSelectSchedule = async (selectedSchedule: {
    date: string;
    user: string;
  }) => {
    setSelectedSchedule(selectedSchedule);

    try {
      const q = query(
        collection(db, "users"),
        where("email", "==", selectedSchedule.user)
      );

      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (userDoc) => {
        const userRef = doc(db, "users", userDoc.id);

        // Update the user document with the acceptedRequest and acceptedDate
        await updateDoc(userRef, {
          acceptedRequest: true,
          acceptedDate: new Date().toISOString(),
        });
      });

      const updatedScheduler = scheduler.map((schedule) =>
        schedule.date === selectedSchedule.date
          ? { ...schedule, accepted: true }
          : schedule
      );

      setScheduler(updatedScheduler);

      setSelectedSchedule(null);
    } catch (error) {
      console.error("Error accepting schedule:", error);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    // Fetch accepted status and date for the user's scheduled meetings
    const fetchUserScheduledMeetings = async () => {
      if (user?.email) {
        const q = query(
          collection(db, "users"),
          where("email", "==", user.email)
        );
        console.log(user.email);

        try {
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];

            const userAcceptedSchedules =
              userDoc.data().acceptedSchedules || [];
            console.log("here" + userAcceptedSchedules);
            setUserScheduledMeetings(userAcceptedSchedules);
          }
        } catch (error) {
          console.error("Error fetching user schedules:", error);
        }
      }
    };

    if (isClicked && user?.email) {
      fetchUserScheduledMeetings();
    }
  }, [isClicked, user?.email]);

  if (!isTutor || !isClicked) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "30px",
        right: "30px",
        backgroundColor: "lightblue",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "5px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "8px",
        }}
      >
        <Button variant="outlined" onClick={handleClose}>
          <ClearIcon />
        </Button>
      </div>

      <Typography variant="h5" gutterBottom>
        Notifications:
      </Typography>

      <List style={{ listStyleType: "none", padding: 0 }}>
        {notifications.map((notification, index) => (
          <ListItem key={index} style={{ marginBottom: "8px" }}>
            {notification.question && notification.contact && (
              <div style={{ display: "flex", alignItems: "center" }}>
                <Typography variant="body2">
                  Contact: {notification.contact} Question:{" "}
                  {notification.question}
                </Typography>
              </div>
            )}
          </ListItem>
        ))}
      </List>
      <List style={{ listStyleType: "none", padding: 0 }}>
        {scheduler.map((schedule, index) => (
          <ListItem key={index} style={{ marginBottom: "8px" }}>
            {schedule.date && schedule.user && (
              <div style={{ display: "flex", alignItems: "center" }}>
                <Typography variant="body2">
                  Date: {schedule.date} User: {schedule.user}
                </Typography>
                {schedule.accepted ? (
                  <CheckIcon style={{ marginLeft: "10px", color: "green" }} />
                ) : !selectedSchedule ||
                  (selectedSchedule &&
                    selectedSchedule.date !== schedule.date) ? (
                  <Button
                    variant="contained"
                    onClick={() => handleSelectSchedule(schedule)}
                    style={{ marginLeft: "10px" }}
                  >
                    Accept
                  </Button>
                ) : null}
              </div>
            )}
          </ListItem>
        ))}
      </List>
      {/*
      <Typography variant="h5" gutterBottom>
        User's Scheduled Meetings:
      </Typography>

      <List style={{ listStyleType: "none", padding: 0 }}>
        {userScheduledMeetings.map((meeting, index) => (
          <ListItem key={index} style={{ marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body2">
                Date: {meeting.date} Accepted: {meeting.accepted ? "Yes" : "No"}{" "}
                Accepted Date: {meeting.acceptedDate}
              </Typography>
            </div>
          </ListItem>
        ))}
        </List>*/}
    </div>
  );
};

export default Notification;
