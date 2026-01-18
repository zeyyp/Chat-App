import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { ChatState } from "../Context/ChatProvider";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import ScrollableChat from "./ScrollableChat"; 
import "./styles.css"; 
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import { encryptMessage, decryptMessage, hashMessage  } from "../utils/encryption"; 


const ENDPOINT = "http://localhost:5000"; // Backend adresi
var socket, selectedChatCompare;//hangi sohbetin açık olduğunu takip etmek için

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const toast = useToast();
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const { user, selectedChat, setSelectedChat } = ChatState();

  const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
}; // Yazıyor... animasyonu için Lottie ayarları


  // API'dan mesajları çekme
  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },     
      };

      //Veritabanından şifreli mesajları çeker.
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);

      // Gelen mesajların içeriğini tek tek çözüyoruz
      const decryptedData = data.map((m) => ({
        ...m,
      content: decryptMessage(m.content),
      }));

    
      setMessages(decryptedData);
      setLoading(false);
      //sohbet odasına katılma
      socket.emit("join chat", selectedChat._id);   

      // Dinleyicinin doğru sohbeti tanıması için 
      selectedChatCompare = selectedChat;
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  // Mesaj gönderme fonksiyonu
  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {

      socket.emit("stop typing", selectedChat._id);
      try {
        //  Kutuyu anında temizle 
      const messageToSend = newMessage; // Orijinal mesajı yedekle
      setNewMessage(""); // Girdi alanını boşalt

      //  Mesajı şifreliyoruz!
        const encryptedContent = encryptMessage(messageToSend); // Önce metni karıştır

        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        const messageHash = hashMessage(messageToSend); // encryption.js'deki fonksiyon

       // API'ye şifreliyi gönder
      const { data } = await axios.post("/api/message", {
         content: encryptedContent,
         hash: messageHash, // Backend'e gönderiyoruz
         chatId: selectedChat._id,
        }, config);

        // Gerçek zamanlı olarak diğer kullanıcılara gönder, backend hep açık oldduğu için anlık gönderebiliyoruz 
        socket.emit("new message", data);
        // Sadece bir kere ekle ve orijinal (yedeklediğin) mesajı göster
        setMessages([...messages, { ...data, content: messageToSend }]);


      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line
    selectedChatCompare = selectedChat; // Sohbeti karşılaştırmak için yedekle
  }, [selectedChat]); // Sohbet değişince mesajları getir

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    //socket.on("typing", () => setIsTyping(true));
    //socket.on("stop typing", () => setIsTyping(false));
    socket.on("typing", (room) => {
    if (selectedChatCompare && selectedChatCompare._id === room) {
      setIsTyping(true);
    }
  });

  socket.on("stop typing", (room) => {
    if (selectedChatCompare && selectedChatCompare._id === room) {
      setIsTyping(false);
    }
  });
    // eslint-disable-next-line
    return () => {
    socket.disconnect();
    socket.off();
  };
  }, []);
  

  useEffect(() => {
  const messageHandler = (newMessageReceived) => {
    // 1. Kontrol: Eğer sohbet seçili değilse veya gelen mesaj açık olan sohbete ait değilse dur
    if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
      return;
    }

    // 2. Çözme: Mesaj içeriğini çöz
    const decryptedMsg = {
      ...newMessageReceived,
      content: decryptMessage(newMessageReceived.content),
    };

    // 3. Ekleme: Güvenli state güncelleme yöntemi (prev kullanarak)
    setMessages((prevMessages) => [...prevMessages, decryptedMsg]);
  };

  socket.on("message received", messageHandler);

  // 4. Temizlik: Dinleyiciyi temizle ki mesajlar ekranda çoğalmasın (Çok Önemli!)
  return () => {
    socket.off("message received", messageHandler);
   };}, [messages]); // messages listesi değiştikçe takip et


  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    // Yazıyor... durdurma mantığı (3 saniye boşluk)
    let lastTypingTime = new Date().getTime();
    setTimeout(() => {
      var timeNow = new Date().getTime();
      if (timeNow - lastTypingTime >= 3000 && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, 3000);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages} // EKSİK: Güncelleme sonrası mesajları tazelemek için
                />
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner size="xl" w={20} h={20} alignSelf="center" margin="auto" />
            ) : (
              <div className="messages"> {/* EKSİK: CSS class'ı eklendi */}
                <ScrollableChat messages={messages} /> {/* EKSİK: Mesajları gösteren bileşen */}
              </div>
            )}

            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              {isTyping ? <div><Lottie options={defaultOptions} width={70} style={{ marginBottom: 15, marginLeft: 0 }} /></div> : <></>}
              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter a message.."
                value={newMessage}
                onChange={typingHandler}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box display="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;