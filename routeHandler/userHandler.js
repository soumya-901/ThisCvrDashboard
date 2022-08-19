const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { User } = require("../schemas/userSchema");
const checkLogin = require("../middleware/checkLogin");
const admin = require("../middleware/admin");
const multer = require("multer");
const upload = multer();

const randomstring = require("randomstring");

const generalUserFields = [
  "name",
  "email",
  "phone",
  "address",
  "companyName",
  "img",
];

// get all users---------->
router.get("/users", async (req, res) => {
  const allUsers = await User.find({}).select("-password");
  res.status(200).send({ users: allUsers, msg: "successfully get all users" });
});

// get all users by name---------->
router.post("/users/byName", [checkLogin, admin], async (req, res) => {
  const { ch } = req.body;

  const reg = new RegExp(`${ch}`, "i");
  console.log(reg);
  const allUsers = await User.find({
    name: { $regex: reg },
  }).select("-password -file");

  res.status(200).send({ users: allUsers, msg: "successfully get all users" });
});

// get user with Id---------->
router.get("/users/:id", [checkLogin, admin], async (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  const user = await User.findById(id).select("-password");
  res.status(200).send({ user, msg: "successfully get the user" });
});

// Sign Up---------->
router.post("/signup", [checkLogin, admin], async (req, res) => {
  try {
    const email = req.body.email;

    const oldUser = await User.findOne({ email: req.body.email });
    if (oldUser) return res.status(400).send({ msg: "user already exists" });

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      companyName: req.body.companyName,
      phone: req.body.phone,
      address: req.body.address,
      img: req.body.img,
      password: hashedPassword,
    });

    await user.save();

    const tempUser = { ...user._doc };
    delete tempUser.password;

    res.status(200).json({
      // accessToken: token,
      user: tempUser,
      msg: "user creation successful",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "SignUp Failed!",
    });
  }
});

//Login------------>
router.post("/login", async (req, res) => {
  const email = req.body.email;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).send({ msg: "user not found" });

  const isValidPassword = await bcrypt.compare(
    req.body.password,
    user.password
  );

  if (!isValidPassword)
    return res.status(401).send({ msg: "incorrect password" });

  const tempUser = { ...user._doc };
  delete tempUser.password;
  // delete tempUser.file;

  const token = generateToken({ email: tempUser.email });

  res.status(200).json({
    accessToken: token,
    user: tempUser,
    msg: "login successful",
  });
});

// get single user --------->
router.get("/user", [checkLogin], async (req, res) => {
  const email = req.user.email;
  // console.log(email);

  const user = await User.findOne({ email });
  if (!user) return res.status(404).send({ msg: "user not found" });

  const tempUser = { ...user._doc };
  delete tempUser.password;

  const token = generateToken({ email: tempUser.email });

  res.status(200).json({
    accessToken: token,
    user: tempUser,
    msg: "get single user",
  });
});

// patch general info --------->
router.patch(
  "/user/edit/general",
  [checkLogin, upload.single("file")],
  async (req, res) => {
    // -------------------
    res.status(500).json({
      msg: "code is not completed",
    });
    // -------------------
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, msg: "Please select an image" });

    const email = req.user.email;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ msg: "user not found" });

    const tempObj = {};
    Object.keys(user._doc).forEach((item) => {
      if (generalUserFields.includes(item)) tempObj[item] = req.body[item];
    });
    tempObj.file = req.file.buffer;

    await user.update([{ $set: tempObj }]);

    const tempUser = { ...user._doc };
    delete tempUser.password;

    res.status(200).json({
      user: tempUser,
      msg: "user updated successfully",
    });
  }
);

// admin patch user role --------->
router.patch("/editRole", [checkLogin, admin], async (req, res) => {
  const { email, newRole } = req.body;
  if (req.user.email === email)
    return res.status(400).send({ msg: "You cannot change your own role" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).send({ msg: "user not found" });

  try {
    user.role = newRole || "user";
    await user.save();
    res.status(200).json({
      user,
      msg: "user role updated successfully",
    });
  } catch (error) {
    res.status(200).json({
      user,
      msg: "user role couldn't be updated",
    });
  }
});

// admin patch block/unblock user --------->
router.patch("/editStatus", [checkLogin, admin], async (req, res) => {
  const { email, newStatus } = req.body;
  if (req.user.email === email)
    return res.status(400).send({ msg: "You cannot change your own status" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).send({ msg: "user not found" });

  try {
    user.status = newStatus || "active";
    await user.save();
    res.status(200).json({
      user,
      msg: "user status updated successfully",
    });
  } catch (error) {
    res.status(200).json({
      user,
      msg: "user status couldn't be updated",
    });
  }
});

// Forget-password api --------->
router.post("/forget-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ msg: "user not found" });

    const resetKey = randomstring.generate();
    user.resetKey = resetKey;

    await user.save();

    res.status(200).send({
      success: true,
      user,
      msg: "Please check your mail to reset your password.",
    });
  } catch (err) {
    console.log(err);
    res.status(400).send({ success: false, msg: err.message });
  }
});

//Reset-password----------->
router.post("/reset-password", async (req, res) => {
  try {
    const resetKey = req.body.resetKey;
    if (!resetKey) return res.status(400).send({ msg: "Provide reset key" });
    const user = await User.findOne({ resetKey });
    if (!user) return res.status(404).send({ msg: "user not found" });

    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetKey = null;
    await user.save();

    res.status(200).send({
      success: true,
      msg: "User Password has been reset",
      user,
    });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
});

// Token generator
function generateToken(user, expiresIn = "1d") {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn,
  });
}

module.exports = router;
