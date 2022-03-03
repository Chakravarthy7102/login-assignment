const mongoose = require("mongoose");

const User = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
    },
  },
  { collection: "users" }
);

const userModel = mongoose.model("User", User);
module.exports = userModel;
