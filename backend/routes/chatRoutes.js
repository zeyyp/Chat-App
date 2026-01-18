const express = require("express");

const { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup } = require("../controllers/chatControllers");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

  router.route("/").post(protect, accessChat);        // Birebir sohbet oluştur/eriş
  router.route("/").get(protect, fetchChats);         // Tüm sohbetleri getir
  router.route("/group").post(protect, createGroupChat); // Grup oluştur
  router.route("/rename").put(protect, renameGroup);     // Grup adını değiştir
  router.route("/groupadd").put(protect, addToGroup);    // Üye ekle
  router.route("/groupremove").put(protect, removeFromGroup); // Üye çıkar

module.exports = router;