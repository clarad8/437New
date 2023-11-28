import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  where,
  query,
  orderBy,
  arrayUnion,
} from "firebase/firestore";
import { db, auth } from "../index";
import { getMessaging, isSupported, onMessage } from "firebase/messaging";
import NavBar from "@/components/nav";
import { 
    Box, 
    Breadcrumbs, 
    Button, 
    Chip,
    Container,
    Grid, 
    Link, 
    List, 
    ListItem, 
    MenuItem, 
    TextField, 
    Typography } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";


interface User {
  uid: string;
  name: string;
}

interface Message {
  text: string;
  sender: {
    uid: string;
    name: string;
  };
  recipient: {
    uid:string;
    name:string;
  };
  timestamp: Date;
}

const getUsers = async () => {
    const usersData: User[] = [];
    const usersCollection = collection(db, 'users');
  
    try {
      const querySnapshot = await getDocs(usersCollection);
      querySnapshot.forEach((doc) => {
        const user = doc.data();
        usersData.push({
          uid: doc.id,
          name: user.name,
          // Add other user properties as needed
        });
      });
      return usersData;
    } catch (error: any) {
      throw new Error('Error fetching users: ' + error.message);
    }
  };

export default function MessagingPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [recipientUid, setRecipientUid] = useState(""); // Track the recipient UID
  const [recipientName, setRecipientName] = useState("");
  const [users, setUsers] = useState<User[]>([]); // Track the list of available users
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [senderMessages, setSenderMessages] = useState<Message[]>([]);
  const [recipientMessages, setRecipientMessages] = useState<Message[]>([]);


  useEffect(() => {
    const initializeMessaging = async () => {
      // Check if messaging is supported
      if (await isSupported()) {
        // Get the messaging instance
        const messaging = getMessaging();

        // Fetch the list of users
        fetchUsers();

        // Fetch existing messages when the component mounts
        fetchSenderMessages();
        fetchRecipientMessages();

        console.log(senderMessages);

        // Subscribe to incoming messages
        const unsubscribe = onMessage(messaging, (payload) => {
          console.log("Message received:", payload);
          // Handle the incoming message, update state, etc.
          // You might want to display a notification, etc.
          fetchSenderMessages();
          fetchRecipientMessages();        });

        // Clean up the subscription when the component unmounts
        return () => unsubscribe();
      } else {
        console.error("Messaging not supported.");
      }
    };

    // Initialize messaging
    initializeMessaging();
  }, []);

  // const fetchMessages = async () => {
  //   try {
  //     // Fetch messages where either the sender or recipient is the current user
  //     const messagesQuery = query(
  //       collection(db, "messages"),
  //       orderBy("timestamp"),
  //       where("sender.uid", "==", auth.currentUser?.uid),
  //       where("recipient.uid", "==", recipientUid)
  //     );

  //     const querySnapshot = await getDocs(messagesQuery);
  //     const messagesData: Message[] = querySnapshot.docs.map((doc) => doc.data() as Message);
  //     setMessages(messagesData);
  //   } catch (error) {
  //     console.error("Error fetching messages:", error);
  //   }
  // };

  const fetchSenderMessages = async () => {
    try {
      const currentUserUid = auth.currentUser?.uid;
  
      if (currentUserUid) {
        // Fetch messages where the sender is the current user
        const senderMessagesQuery = query(
          collection(db, "messages"),
          orderBy("timestamp"),
          where("sender.uid", "==", currentUserUid)
        );
  
        const senderMessagesSnapshot = await getDocs(senderMessagesQuery);
        const senderMessagesData: Message[] = senderMessagesSnapshot.docs.map(
          (doc) => doc.data() as Message
        );
  
        // Set the sender messages
        setSenderMessages(senderMessagesData);
        console.log(senderMessagesData);
      }
    } catch (error) {
      console.error("Error fetching sender messages:", error);
    }
  };
  

  const fetchRecipientMessages = async () => {
    try {
      // Fetch messages where the recipient is the current user
      const recipientMessagesQuery = query(
        collection(db, "messages"),
        orderBy("timestamp"),
        where("recipient.uid", "==", auth.currentUser?.uid)
      );
  
      const recipientMessagesSnapshot = await getDocs(recipientMessagesQuery);
      const recipientMessagesData: Message[] = recipientMessagesSnapshot.docs.map(
        (doc) => doc.data() as Message
      );
  
      // Set the recipient messages
      setMessages(recipientMessagesData);
    } catch (error) {
      console.error("Error fetching recipient messages:", error);
    }
  };

 const fetchUsers = async () => {
    try {
      const usersData = await getUsers();
      setUsers(usersData);
      console.log(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // const sendMessage = async () => {
  //   try {
  //     const user = auth.currentUser;
  //     if (user) {
  //       const { uid, displayName } = user;
  //       const messageData: Message = {
  //         text: newMessage,
  //         sender: {
  //           uid,
  //           name: displayName ?? "Anonymous",
  //         },
  //         recipient: {
  //           uid,
  //           name: displayName ?? "Anonymous",
  //         },
  //         timestamp: new Date(),
  //       };

  //       // Add the new message to the "messages" collection
  //       await addDoc(collection(db, "messages"), messageData);

  //       // Update the sender's messages field with the new message
  //       const senderUserDocRef = doc(db, "users", uid);
  //       await updateDoc(senderUserDocRef, {
  //         messages: arrayUnion(messageData),
  //       });

  //       // Update the recipient's messages field with the new message
  //       const recipientUserDocRef = doc(db, "users", recipientUid);
  //       await updateDoc(recipientUserDocRef, {
  //         messages: arrayUnion(messageData),
  //       });

  //       // Clear the input field after sending the message
  //       setNewMessage("");
  //     }
  //   } catch (error) {
  //     console.error("Error sending message:", error);
  //   }
  // };

  const sendMessage = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const { uid, displayName } = user;
        const messageData: Message = {
          text: newMessage,
          sender: {
            uid,
            name: displayName ?? "Anonymous",
          },
          recipient: {
            uid: recipientUid, // Use the recipientUid instead of the sender's UID
            name: recipientName ?? "Anonymous",
            
          },
          timestamp: new Date(),
        };
  
        // Add the new message to the "messages" collection
        await addDoc(collection(db, "messages"), messageData);
  
        // Clear the input field after sending the message
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  
  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setRecipientUid(user.uid);
    setRecipientName(user.name);
    // Fetch messages for the selected user
    // fetchMessages();
    console.log("user is clicked");
  };


return (

    <div>
      <NavBar></NavBar>
      <br></br>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        <Link underline="hover" href="/">
          Home
        </Link>
        <Typography color="text.primary">Message</Typography>
      </Breadcrumbs>
      
      <Box my={2} />

      <div style={{ 
        fontFamily: "system-ui", 
        fontSize: "3rem", 
        fontWeight: "bold", 
        color: "#6fa5ff" }}>
        Direct Messaging
      </div>

      <List>
    {senderMessages.map((message, index) => (
      <ListItem key={index}>
      <strong>{message.sender.name}:</strong> {message.text}
    </ListItem>
    ))}
  </List>

<List>
  {recipientMessages.map((message, index) => (
    <ListItem key={index}>
      <strong>{message.sender.name}:</strong> {message.text}
    </ListItem>
  ))}
</List>


      <div>
        <TextField
          multiline
          rows={2}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          label="Type your message"
        />
        <br />
        {/* Dropdown menu for selecting a recipient */}
        <TextField
          select
          value={recipientUid}
          onChange={(e) => setRecipientUid(e.target.value)}
          label="Select a recipient"
        >
          <MenuItem value="" disabled>
            Select a recipient
          </MenuItem>
          {users.map((user) => (
            <MenuItem key={user.uid} value={user.uid}>
              {user.name}
            </MenuItem>
          ))}
        </TextField>
        <br />
        <Button variant="contained" onClick={sendMessage}>
          Send Message
        </Button>
      </div>
    </div>
  );

// return (
//   <div>
//     <NavBar></NavBar>
//     <br></br>
//      <Breadcrumbs 
//      separator={<NavigateNextIcon fontSize="small" />} 
//      aria-label="breadcrumb"
//      >
    
//     <Link underline="hover" href="/">
//       Home
//     </Link>
    
//     <Typography color="text.primary">
//       Message
//     </Typography>
//     </Breadcrumbs>
//     <Container>
//           <Box my={2} />
//           <div
//           style={{
//             fontFamily: "system-ui",
//             fontSize: "3rem",
//             fontWeight: "bold",
//             color: "#6fa5ff",
//             marginBottom: "10px",
//           }}
//         >
//           Direct Messaging
//         </div>

//         <Grid container spacing={2}>
//           <Grid item xs={2}>
//             <div
//               style={{
//                 fontFamily: "system-ui",
//                 fontSize: "1.75rem",
//                 color: "#6fa5ff",
//                 marginTop: "20px",
//                 fontWeight: "semi-bold",
//                 marginBottom: "10px",
//                 textDecoration: "underline",
//               }}
//             >
//               Users
//             </div>

//         {users.map((user) => (
//               <Box
//                 key={user.uid}
//                 style={{
//                   border: "2px solid #2196f3", // Blue border
//                   marginBottom: 10,
//                   marginTop: 10,
//                   padding: "10px", // Add padding for better spacing
//                   borderRadius: "5px", // Add rounded corners
//                   cursor: "pointer", // Add pointer cursor for indicating clickability
//                 }}
//                 onClick={() => handleUserClick(user)}
//               >
//                 <Typography variant="body1">
//                 {user.name}
//                 </Typography>
                
//               </Box>
//         ))}

//         </Grid>
          
//         {/* <Box width="30%">
//         <List style={{ flexDirection: 'column' }}>
//         {users.map((user) => (
//         <ListItem key={user.uid} button onClick={() => handleUserClick(user)}>
//         {user.name}
//         </ListItem>
//         ))}
//         </List>
//         </Box> */}

//           <List>
//             {messages.map((message, index) => (
//               <ListItem key={index}>
//                 <strong>{message.sender.name}:</strong> {message.text}
//               </ListItem>
//             ))}
//           </List>
//           <div>
//             <TextField
//               multiline
//               rows={2}
//               value={newMessage}
//               onChange={(e) => setNewMessage(e.target.value)}
//               label="Type your message"
//             />
//             <br />
//             <Button variant="contained" onClick={sendMessage}>
//               Send Message
//             </Button>
//           </div>
//           </Grid>
//           </Container>
//   </div>
   
          
         

      
//   );

}
