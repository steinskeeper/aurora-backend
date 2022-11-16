const mongoose = require("mongoose");

const userschema = mongoose.Schema({
  name: String,
  username: { type: String, unique: true },
  password: String,
  personality: {type: String, default: ""},
});

module.exports = mongoose.model("User", userschema);
