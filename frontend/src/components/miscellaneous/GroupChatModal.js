import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter,
  ModalBody, ModalCloseButton, Button, useDisclosure,
  FormControl, Input, useToast, Box
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import UserListItem from "../UserAvatar/UserListItem";

const GroupChatModal = ({ children, fetchAgain, setFetchAgain }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { user, chats, setChats } = ChatState();

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) return;
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({ title: "Error Occured!", status: "error", duration: 5000, isClosable: true, position: "bottom-left" });
    }
  };

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers || selectedUsers.length === 0) {
      toast({ title: "Please fill all the fields", status: "warning", duration: 5000, isClosable: true, position: "top" });
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      console.log("Creating group with:", { name: groupChatName, users: selectedUsers.map((u) => u._id) });
      const { data } = await axios.post(`/api/chat/group`, {
        name: groupChatName,
        users: JSON.stringify(selectedUsers.map((u) => u._id)),
      }, config);
      console.log("Group created:", data);
      setChats([data, ...chats]); // Yeni grubu listenin başına ekle
      if (setFetchAgain) setFetchAgain(!fetchAgain); // Listeyi yenile
      onClose();
      toast({ title: "New Group Chat Created!", status: "success", duration: 5000, isClosable: true, position: "bottom" });
      // Modal'ı temizle
      setGroupChatName("");
      setSelectedUsers([]);
      setSearch("");
      setSearchResult([]);
    } catch (error) {
      console.error("Error creating group:", error.response?.data || error);
      toast({ title: "Failed to Create the Chat!", description: error.response?.data?.message || "Error occurred", status: "error", duration: 5000, isClosable: true, position: "bottom" });
    }
  };

  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      toast({ title: "User already added", status: "warning", duration: 5000, isClosable: true, position: "top" });
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="35px" display="flex" justifyContent="center">Create Group Chat</ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDir="column" alignItems="center">
            <FormControl><Input placeholder="Chat Name" mb={3} onChange={(e) => setGroupChatName(e.target.value)} /></FormControl>
            <FormControl>
                <Input placeholder="Add Users eg: John, Jane" mb={1} onChange={(e) => handleSearch(e.target.value)} /></FormControl>
            <Box w="100%" display="flex" flexWrap="wrap">
              {selectedUsers.map((u) => (
                <UserBadgeItem key={u._id} user={u} handleFunction={() => handleDelete(u)} />
              ))}
            </Box>
            {loading ? <div>loading...</div> : (
              searchResult?.slice(0, 4).map((u) => (
                <UserListItem key={u._id} user={u} handleFunction={() => handleGroup(u)} />
              ))
            )}
          </ModalBody>
          <ModalFooter><Button colorScheme="blue" onClick={handleSubmit}>Create Chat</Button></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal; // Bu satır eksik olduğu için hata alıyorsun