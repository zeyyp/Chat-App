import { Box } from "@chakra-ui/layout";
import { useState, useEffect } from "react";
import ChatBox from "../components/ChatBox";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";
import io from "socket.io-client";
import { decryptMessage } from "../utils/encryption";

const ENDPOINT = "http://localhost:5000";
var socket;

const ChatPage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user, chats, setChats } = ChatState();

  useEffect(() => {
    if (user) {

      //sunucuya baglanti kuruluyor
      socket = io(ENDPOINT);
      socket.emit("setup", user);
      socket.on("connected", () => console.log("Socket connected in ChatPage"));

      // Yeni grup oluşturulduğunda dinle
      socket.on("new group", (newGroup) => {
        console.log("New group received:", newGroup);
        setChats((prevChats) => [newGroup, ...prevChats]);
      });

      // Broadcast mesajlarını dinle
      socket.on("broadcast message", (data) => {
        console.log("🔔 Broadcast received in ChatPage!");
        const decryptedContent = decryptMessage(data.content);
        console.log("Showing alert with:", decryptedContent);
        alert(`📢 Broadcast from ${data.sender.name}:\n\n${decryptedContent}`);
      });

      return () => {
        socket.off("new group");
        socket.off("broadcast message");
        socket.disconnect();
      };
    }
  }, [user, setChats]);

  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
      <Box display="flex" justifyContent="space-between" w="100%" h="91.5vh" p="10px">
        {user && (
          <MyChats fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} /> 
        )}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </div>
  );
};

export default ChatPage;