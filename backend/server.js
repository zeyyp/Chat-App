const colors = require("colors");
const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require("./routes/userRoutes"); 
const chatRoutes = require("./routes/chatRoutes"); 
const messageRoutes = require("./routes/messageRoutes"); 
const { chats } = require('./data/data');
const connectDB = require('./config/db');


dotenv.config();

connectDB();

const app = express();

app.use(express.json()); // JSON verilerini işlemek için

app.get('/', (req, res) => {
    res.send('Hello Worrrrrld!');
});


app.use('/api/user',userRoutes);
app.use('/api/chat',chatRoutes);
app.use('/api/message',messageRoutes);



const PORT = process.env.PORT || 5000;

const server= app.listen(PORT,console.log(`Server is running on PORT ${PORT}`)); 

//socket.io sunucusu oluşturma 
const io = require("socket.io")(server, {
  pingTimeout: 60000, // 60 saniye boyunca işlem olmazsa bağlantıyı kapat
  cors: {
    origin: "http://localhost:3000",
  },
});


app.set('socketio', io);

//soket bağlantısı 
io.on("connection", (socket) => {
  console.log("connected to socket.io");

  // Kullanıcı için özel oda oluştur
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  // Sohbet odasına katıl
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  // Mesaj gönderme
  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return; // Mesajı gönderene geri yollama
      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  // Yazıyor... durumu
  socket.on("typing", (room) => socket.in(room).emit("typing", room));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing", room));


  socket.off("setup", () => {
  console.log("USER DISCONNECTED");
  socket.leave(userData._id);
});
});


