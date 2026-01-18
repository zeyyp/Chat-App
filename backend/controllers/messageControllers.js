const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../Models/userModel");
const Chat = require("../Models/chatModel");
const crypto = require('crypto');

// Hash doğrulama fonksiyonu
const verifyHash = (content, receivedHash) => {
  const SECRET_KEY = "PROJE2025";
  let hash = 0;
  
  // Şifrelenmiş içeriği çöz
  let decrypted = "";
  for (let i = 0; i < content.length; i++) {
    let charCode = content.charCodeAt(i) - SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
    decrypted += String.fromCharCode(charCode);
  }
  
  // Hash hesapla
  for (let i = 0; i < decrypted.length; i++) {
    const char = decrypted.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  
  return hash.toString(16) === receivedHash;
};

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId, hash } = req.body;

  if (!content || !chatId) {
    return res.sendStatus(400);
  }
  
  // Hash doğrulaması
  if (hash && !verifyHash(content, hash)) {
    console.warn("Hash verification failed for message");
    // İsterseniz burada hata dönebilirsiniz
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    hash: hash,
  };

  try {
    var message = await Message.create(newMessage);

    // Gönderen bilgisini (isim ve resim) dolduruyoruz
    message = await message.populate("sender", "name pic");
    // Sohbet bilgisini dolduruyoruz
    message = await message.populate("chat");
    // Sohbet içindeki kullanıcıların bilgisini dolduruyoruz
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    // Sohbetin 'latestMessage' (son mesaj) alanını güncelliyoruz
    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});


const allMessages = asyncHandler(async (req, res) => {
  try {
    // Mesajları chat ID'sine göre buluyoruz
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email") // Gönderen bilgilerini getir
      .populate("chat"); // Sohbet detaylarını getir

    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// Tüm kullanıcılara broadcast mesaj gönderme
const broadcastMessage = asyncHandler(async (req, res) => {
  const { content, hash } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Message content required" });
  }

  try {
    // Tüm kullanıcıları getir
    const allUsers = await User.find({ _id: { $ne: req.user._id } });
    
   // server.js'de tanımladığımız (Socket.io) nesnesini çağır
    const io = req.app.get('socketio');
    if (io) {
      const broadcastData = {
        sender: req.user,
        content: content,
        hash: hash,
        timestamp: new Date(),
        isBroadcast: true
      };
      
      allUsers.forEach((user) => {
        io.in(user._id.toString()).emit("broadcast message", broadcastData);
      });
    }

    res.status(200).json({ message: "Broadcast sent successfully", recipients: allUsers.length });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { sendMessage, allMessages, broadcastMessage };