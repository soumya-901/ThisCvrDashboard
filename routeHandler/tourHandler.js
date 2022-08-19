const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { User } = require("../schemas/userSchema");
const { Tour } = require("../schemas/tourSchema");
const checkLogin = require("../middleware/checkLogin");
const admin = require("../middleware/admin");

// get all tours---------->
router.get("/", [checkLogin], async (req, res) => {
  const tours = await Tour.find({ userId: req.user._id });
  res.status(200).send({ tours, msg: "successfully get all tours" });
});

// // get user with Id---------->
// router.get("/users/:id", [checkLogin, admin], async (req, res) => {
//   const id = mongoose.Types.ObjectId(req.params.id);
//   const user = await User.findById(id).select("-password");
//   res.status(200).send({ user, msg: "successfully get the user" });
// });

// create a VT
router.post("/", [checkLogin, admin], async (req, res) => {
  try {
    const { title, link, userId } = req.body;
    const id = mongoose.Types.ObjectId(userId);
    const user = await User.findById(id);
    if (!user) return res.status(404).send({ msg: "user not found" });

    const tour = new Tour({
      title,
      link,
      userId: id,
    });

    await tour.save();

    res.status(200).json({
      // accessToken: token,
      tour,
      msg: "Tour uploaded successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Tour uploaded failed!",
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

  const token = generateToken(tempUser);

  res.status(200).json({
    accessToken: token,
    user: tempUser,
    msg: "login successful",
  });
});

module.exports = router;
