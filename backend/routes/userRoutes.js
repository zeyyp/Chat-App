const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const { registerUser, authUser, allUsers } = require("../controllers/userControllers");
const router = express.Router();

router.route("/").post(registerUser).get(protect , allUsers);
router.post("/login", authUser); // Giriş

module.exports = router;