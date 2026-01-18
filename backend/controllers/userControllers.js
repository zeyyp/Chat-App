const asyncHandler = require("express-async-handler");
const User = require("../Models/userModel");
const generateToken = require("../config/generateToken"); // Sonraki adımda kuracağız

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body; // Body'den verileri alıyoruz

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Lütfen tüm alanları doldurun");
  }

  const userExists = await User.findOne({ email }); // Kullanıcı var mı kontrolü
  if (userExists) {
    res.status(400);
    throw new Error("Kullanıcı zaten mevcut");
  }

  const user = await User.create({ name, email, password, pic }); // Yeni kullanıcı oluşturma

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id), // JWT Token gönderiyoruz
    });
  } else {
    res.status(400);
    throw new Error("Kullanıcı oluşturulamadı");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }); // Kullanıcıyı e-posta ile bul

  // Eğer kullanıcı varsa ve şifre eşleşiyorsa
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id), // Giriş başarılıysa yeni token ver
    });
  } else {
    res.status(401);
    throw new Error("Geçersiz e-posta veya şifre");
  }
});

const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search ? {
    $or: [
      { name: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } },
    ],
  } : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } }); // Kendimizi sonuçlardan çıkarıyoruz
  
 res.send(users);
});


// module.exports kısmına authUser'ı eklemeyi unutma:
module.exports = { registerUser, authUser , allUsers};
