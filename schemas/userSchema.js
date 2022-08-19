const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    max: 100,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  companyName: {
    type: String,
    max: 100,
  },
  phone: {
    type: String,
    max: 100,
  },
  address: {
    type: String,
    max: 100,
  },
  file: {
    type: Buffer,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  status: {
    type: String,
    enum: ["active", "blocked"],
    default: "active",
  },
  resetKey: {
    type: String,
    default: null,
  },
});

module.exports = {
  User: mongoose.model("User", userSchema),
};
