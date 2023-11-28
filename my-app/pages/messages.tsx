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
    Snackbar,
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

  
  const fetchData = async () => {
    const usersData: User[] = [];
    const messagesData: Message[] = [];
  
    const usersCollection = collection(db, 'users');
    const messagesCollection = collection(db, 'messages');
  
    try {
      const usersSnapshot = await getDocs(usersCollection);
      usersSnapshot.forEach((userDoc) => {
        const user = userDoc.data();
        usersData.push({
          uid: userDoc.id,
          name: user.name,
        });
      });
  
      const messagesQuery = query(messagesCollection, orderBy('timestamp'));
      const messagesSnapshot = await getDocs(messagesQuery);
  
      messagesSnapshot.forEach((messageDoc) => {
        const message = messageDoc.data() as Message;
        messagesData.push(message);
      });
  
      return { users: usersData, messages: messagesData };
    } catch (error: any) {
      throw new Error('Error fetching data: ' + error.message);
    }
  };

  const getSentMessages = async () => {
    const sentMessagesData: Message[] = [];
    const messagesCollection = collection(db, 'messages');
    if (auth.currentUser) {
      try {
        // Fetch messages where the recipient is the current user
        const sentMessagesQuery = query(
          messagesCollection,
          orderBy('timestamp'),
          where('sender.uid', '==', auth.currentUser?.uid)
        );
  
        const sentMessagesSnapshot = await getDocs(sentMessagesQuery);
  
        sentMessagesSnapshot.forEach((doc) => {
          const sentMessage = doc.data() as Message;
          sentMessagesData.push(sentMessage);
        });
  
        return sentMessagesData;
      } catch (error: any) {
        console.error('Error fetching sender messages:', error);
      }
    }
  
    // If auth.currentUser is undefined, return an empty array
    return [];
  };
  
  const getReceivedMessages = async () => {
    const receivedMessagesData: Message[] = [];
    const messagesCollection = collection(db, 'messages');
    if (auth.currentUser) {
      try {
        // Fetch messages where the recipient is the current user
        const receivedMessagesQuery = query(
          messagesCollection,
          orderBy('timestamp'),
          where('recipient.uid', '==', auth.currentUser?.uid)
        );
  
        const receivedMessagesSnapshot = await getDocs(receivedMessagesQuery);
  
        receivedMessagesSnapshot.forEach((doc) => {
          const receivedMessage = doc.data() as Message;
          receivedMessagesData.push(receivedMessage);
        });
  
        return receivedMessagesData;
      } catch (error: any) {
        console.error('Error fetching received messages:', error);
      }
    }
  
    // If auth.currentUser is undefined, return an empty array
    return [];
  };
  

export default function Messaging () {
const [users, setUsers] = useState<User[]>([]); // Track the list of available users
const [messages, setMessages] = useState<Message[]>([]);
const [newMessage, setNewMessage] = useState("");
const [recipientUid, setRecipientUid] = useState(""); // Track the recipient UID
const [recipientName, setRecipientName] = useState("");
const [sentMessages, setSentMessages] = useState<Message[]>([]);
const [receivedMessages, setReceivedMessages] = useState<Message[]>([]);
const [snackbarOpen, setSnackbarOpen] = useState(false);

 useEffect(() => {
  const initializeMessaging = async () => {
    if (await isSupported()) {
      const messaging = getMessaging();
      const data = await fetchData();
      setUsers(data.users);
      setMessages(data.messages);
      fetchSentMessages();
      fetchReceivedMessages();

      // Subscribe to incoming messages
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log("Message received:", payload);
        // Handle the incoming message, update state, etc.
        // You might want to display a notification, etc.
        fetchSentMessages();
        fetchReceivedMessages();        });

      // Clean up the subscription when the component unmounts
      return () => unsubscribe();
    }
    else {
      console.error("Messaging not supported.");
    }
  };
  initializeMessaging();
  }, []);

  const fetchSentMessages = async () => {
    try {
      const sentMessagesData = await getSentMessages();
  
      // Check if the data is not undefined before setting state
      if (sentMessagesData !== undefined) {
        setSentMessages(sentMessagesData);
      } else {
        console.error('Sent messages data is undefined');
      }
    } catch (error) {
      console.error('Error fetching sent messages:', error);
    }
  };

  const fetchReceivedMessages = async () => {
    try {
      const receivedMessagesData = await getReceivedMessages();
  
      // Check if the data is not undefined before setting state
      if (receivedMessagesData !== undefined) {
        setReceivedMessages(receivedMessagesData);
      } else {
        console.error('Received messages data is undefined');
      }
    } catch (error) {
      console.error('Error fetching received messages:', error);
    }
  };

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
        setSnackbarOpen(true); 
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
    

  console.log(messages);
  console.log(sentMessages);
  console.log(receivedMessages);


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
    
    <Typography color="text.primary">
      Message
    </Typography>
    </Breadcrumbs>
    <Container>
          <Box my={2} />
          <div
          style={{
            fontSize: "3rem",
            fontWeight: "bold",
            fontFamily: "Georgia",
            color: "#6fa5ff",
            marginBottom: "10px",
          }}
        >
          Messaging Page
        </div>
        {/* <MenuItem value="" disabled>
            Select a recipient
          </MenuItem>
          {users.map((user) => (
            <MenuItem key={user.uid} value={user.uid}>
              {user.name}
            </MenuItem>
          ))} */}
         
        

         <div>
 

<Typography variant="h5" style={{ 
  marginTop: '20px',
  fontFamily: "Georgia", }}
>
    View Your Messages
  </Typography>
  <Box my={2} />
  <Grid container spacing={1} border={1} p={1}>
    <Grid item xs={6}>
          <Typography variant="h6" style={{ marginTop: '5px' }}>
            Sent Messages
          </Typography>
              {sentMessages.length === 0 ? (
                <Typography>No sent messages</Typography>
              ) : (
                sentMessages.map((sentMessage) => (
                  <Box key={sentMessage.timestamp.toString()} mt={1} ml={3}>
                    <Typography>
                      <strong>To: {sentMessage.recipient.name}</strong>
                    </Typography>
                    <Typography>{sentMessage.text}</Typography>
                  </Box>
                ))
              )}
              <Box my={2} />
            </Grid>

            <Grid item xs={6}>
              <Typography variant="h6" style={{ marginTop: '5px' }}>
                Received Messages
              </Typography>
              {receivedMessages.length === 0 ? (
                <Typography>No received messages</Typography>
              ) : (
                receivedMessages.map((receivedMessage) => (
                  <Box key={receivedMessage.timestamp.toString()} mt={1} ml={3}>
                    <Typography>
                      <strong>From: {receivedMessage.sender.name}</strong>
                    </Typography>
                    <Typography>{receivedMessage.text}</Typography>
                  </Box>
                ))
              )}
              <Box my={2} />
            </Grid>
            
  </Grid>

</div>

<Box my={6} />
        {/* <div>
        <TextField
          multiline
          rows={2}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          label="Type your message"
        />
        <br></br>
        <TextField
          select
          value={recipientUid}
          onChange={(e) => {
            const selectedUser = users.find(user => user.uid === e.target.value);
            if(selectedUser) {
              setRecipientUid(selectedUser.uid);
              setRecipientName(selectedUser.name);
            }
          }}
            
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
        <Button onClick={sendMessage}>
          Send Message
        </Button>
        </div> */}

    <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000} // Adjust the duration as needed
        onClose={handleSnackbarClose}
        message="Message sent successfully!"
      />

<Box display="flex" flexDirection="column" alignItems="center" mt={4}>
  <TextField
    multiline
    rows={2}
    value={newMessage}
    onChange={(e) => setNewMessage(e.target.value)}
    label="Type your message"
    variant="outlined"
    fullWidth
    margin="normal"
  />
  <TextField
    select
    value={recipientUid}
    onChange={(e) => {
      const selectedUser = users.find((user) => user.uid === e.target.value);
      if (selectedUser) {
        setRecipientUid(selectedUser.uid);
        setRecipientName(selectedUser.name);
      }
    }}
    label="Select a recipient"
    variant="outlined"
    fullWidth
    margin="normal"
   
  >
    <MenuItem value="" disabled>
      Select a recipient
    </MenuItem>
    {users
    .filter((user) => user.uid !== auth.currentUser?.uid) // Exclude the currently logged-in user
    .map((user) => (
      <MenuItem key={user.uid} value={user.uid}>
        {user.name}
      </MenuItem>
    ))}
  </TextField>
  <Button variant="contained" color="primary" onClick={sendMessage}>
    Send Message
  </Button>
</Box>
          

    </Container>
    </div>
);
}