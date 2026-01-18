
const asyncHandler = require("express-async-handler"); // Bu satırı ekle
const Chat = require("../Models/chatModel");
const User = require("../Models/userModel");

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.sendStatus(400);

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  }).populate("users", "-password").populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };
    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});


// Kullanıcının ana sayfasında gördüğü tüm sohbet listesi
const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});


// 3. Grup Sohbeti Oluşturma
const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the fields" });
  }
  var users = JSON.parse(req.body.users);
  if (users.length < 1) {
    return res.status(400).send({ message: "At least 1 user is required for a group chat" });
  }
  users.push(req.user);
  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")  
      // gruptaki kullanıcıların ID'lerini al, User tablosundan o kişilerin isimlerini, e-postalarını ve resimlerini getir. Ama şifrelerini (-password) sakın getirme.
      .populate("groupAdmin", "-password");
    
    // Socket.io ile grup diğer kullanıcılara bildir
    const io = req.app.get('socketio');
    if (io) {
      fullGroupChat.users.forEach((user) => {
        if (user._id.toString() !== req.user._id.toString()) {
          io.in(user._id.toString()).emit("new group", fullGroupChat);
        }
      });
    }
    
    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// 4. Grubu Yeniden Adlandırma
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;
  const updatedChat = await Chat.findByIdAndUpdate(chatId, { chatName }, { new: true })
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});

// 5. Gruba Üye Ekleme
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  const added = await Chat.findByIdAndUpdate(chatId, { $push: { users: userId } }, { new: true })
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});

// 6. Gruptan Üye Çıkarma
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  const removed = await Chat.findByIdAndUpdate(chatId, { $pull: { users: userId } }, { new: true })
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
});

module.exports = { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup };
