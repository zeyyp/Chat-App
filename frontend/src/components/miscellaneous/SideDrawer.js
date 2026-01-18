

import React, { useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import { Menu, MenuButton, MenuDivider, MenuItem, MenuList } from "@chakra-ui/menu";
import { Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay } from "@chakra-ui/modal";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { useToast } from "@chakra-ui/toast";
import { ChatState } from "../../Context/ChatProvider";
import ProfileModal from "./ProfileModal";
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";
import { Spinner } from "@chakra-ui/spinner";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, FormControl } from "@chakra-ui/react";
import { encryptMessage, hashMessage } from "../../utils/encryption";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  
  const { isOpen: isBroadcastOpen, onOpen: onBroadcastOpen, onClose: onBroadcastClose } = useDisclosure();

  const { user, setUser, setSelectedChat, chats, setChats } = ChatState();
  const history = useHistory();
  const { isOpen, onOpen, onClose } = useDisclosure(); // Drawer kontrolü
  const toast = useToast();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    setUser(null); // Context'i temizle
    setSelectedChat(null); // Seçili sohbeti temizle
    setChats([]); // Sohbetleri temizle
    history.push("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toast({ title: "Please Enter something in search", status: "warning", duration: 5000, isClosable: true, position: "top-left" });
      return;
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({ title: "Error Occured!", description: "Failed to Load the Search Results", status: "error", duration: 5000, isClosable: true, position: "bottom-left" });
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = { headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({ title: "Error fetching the chat", description: error.message, status: "error", duration: 5000, isClosable: true, position: "bottom-left" });
    }
  };

  const sendBroadcast = async () => {
    if (!broadcastMessage.trim()) {
      toast({ title: "Please enter a message", status: "warning", duration: 3000, isClosable: true, position: "top" });
      return;
    }

    try {
      const encryptedContent = encryptMessage(broadcastMessage);
      const messageHash = hashMessage(broadcastMessage);
      
      const config = { 
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${user.token}` 
        } 
      };
      
      await axios.post(`/api/message/broadcast`, { 
        content: encryptedContent, 
        hash: messageHash 
      }, config);
      
      toast({ 
        title: "Broadcast sent to all users!", 
        status: "success", 
        duration: 3000, 
        isClosable: true, 
        position: "bottom" 
      });
      
      setBroadcastMessage("");
      onBroadcastClose();
    } catch (error) {
      toast({ 
        title: "Failed to send broadcast", 
        description: error.response?.data?.message || "Error occurred", 
        status: "error", 
        duration: 5000, 
        isClosable: true, 
        position: "bottom" 
      });
    }
  };


  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" bg="white" w="100%" p="5px 10px 5px 10px" borderWidth="5px">
        <Box display="flex" gap={2}>
          <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
            <Button variant="ghost" onClick={onOpen}>
              <i className="fas fa-search"></i>
              <Text display={{ base: "none", md: "flex" }} px={4}>Search User</Text>
            </Button>
          </Tooltip>
          <Tooltip label="Broadcast to all users" hasArrow placement="bottom-end">
            <Button variant="ghost" colorScheme="purple" onClick={onBroadcastOpen}>
              <i className="fas fa-bullhorn"></i>
              <Text display={{ base: "none", md: "flex" }} px={4}>Broadcast</Text>
            </Button>
          </Tooltip>
        </Box>
        <Text fontSize="2xl" fontFamily="Work sans">Talk-A-Tive</Text>
        <div>
          <Menu>
            <MenuButton p={1}><BellIcon fontSize="2xl" m={1} /></MenuButton>
            {/* Bildirim listesi buraya gelecek */}
          </Menu>
          <Menu>
            <MenuButton as={Button} bg="white" rightIcon={<ChevronDownIcon />}>
              <Avatar size="sm" cursor="pointer" name={user.name} src={user.pic} />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}><MenuItem>My Profile</MenuItem></ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input placeholder="Search by name or email" mr={2} value={search} onChange={(e) => setSearch(e.target.value)} />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? <ChatLoading /> : (
              searchResult?.map((u) => (
                <UserListItem key={u._id} user={u} handleFunction={() => accessChat(u._id)} />
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Modal isOpen={isBroadcastOpen} onClose={onBroadcastClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Broadcast Message to All Users</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <Input
                placeholder="Enter your broadcast message..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendBroadcast()}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={sendBroadcast}>
              Send Broadcast
            </Button>
            <Button variant="ghost" onClick={onBroadcastClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default SideDrawer;