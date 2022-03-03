const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const UserModel = require("./model/user");
const bycrpt = require("bcryptjs");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();

app.use(express.json());

//mongo connection
const connect = async () => {
  mongoose.connect(process.env.MONGO_URI, () => {
    console.log("Connected to db");
  });
};

//login route

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || typeof username !== "string") {
    return res.status(412).json({
      response: "User name filled is Not valid",
    });
  }

  const user = await UserModel.findOne({ username });

  if (!user) {
    return res.status(412).json({
      response: "invalid password/username",
    });
  }

  //compare the password
  const result = await bycrpt.compare(password, user.password);

  if (result) {
    const token = jwt.sign(
      {
        id: user._id,
        user: user.username,
      },
      process.env.JWT_SEC,
      {
        expiresIn: "8 days",
      }
    );

    res.status(200).json({
      response: "User Logged in!",
      token: token,
    });
    console.log("user logged in");
  } else {
    res.status(400).json({
      response: "invalid password/username",
    });
  }
});

//register route
app.post("/api/register", async (req, res) => {
  const { username, password: rawPassword } = req.body;

  if (!username || typeof username !== "string") {
    //precondition failed status
    return res.status(412).json({
      response: "User name filed is Not valid",
    });
  }

  if (
    !rawPassword ||
    typeof rawPassword !== "string" ||
    rawPassword.length < 8
  ) {
    return res.status(412).json({
      response: "this password doest match our standards",
    });
  }

  const password = await bycrpt.hash(rawPassword, 10);

  try {
    const user = await UserModel.create({
      username,
      password,
    });
    console.log(user);
    res.status(200).json({
      response: "User Registered Succesfully",
    });
  } catch (error) {
    ``;
    if (error.code === 11000) {
      //conflit message
      res.status(409).json({
        response: "Username Already in use",
      });
    } else {
      res.status(500).json({
        response: "something terrible happen",
      });
    }
  }
});

//listen
app.listen(process.env.PORT, () => {
  connect();
  console.log("listening at port 3000");
});
