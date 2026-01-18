const express = require("express");
const { sendMessage, allMessages, broadcastMessage } = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Mesaj göndermek için POST
router.route("/").post(protect, sendMessage);
// Belirli bir sohbetin tüm mesajlarını çekmek için GET
router.route("/:chatId").get(protect, allMessages);
// Tüm kullanıcılara broadcast mesaj göndermek için POST
router.route("/broadcast").post(protect, broadcastMessage);

module.exports = router;