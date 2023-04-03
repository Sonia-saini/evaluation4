const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { registerValidator } = require("../middlewares/registervalidator");
const { loginValidator } = require("../middlewares/loginvalidtor");
const { Usermodel } = require("../Models/usermodel");

// require("dotenv").config();

const userRouter = express.Router();

userRouter.post("/register", registerValidator, async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let match = await Usermodel.find({ email });
    if (match.length === 0) {
      const user = new Usermodel({
        name,
        email,
        password,
        wrong: 0,
      });
      await user.save();
      res.status(200).json({ msg: "Registration Successful" });
    } else {
      res.status(400).json({ msg: "Your emailId is already Registrated" });
    }
  } catch (error) {
    res.json("Some Error occurred, unable to Register.");
    console.log(error);
  }
});

userRouter.post("/login", loginValidator, async (req, res) => {
  const { email, password } = req.body;
  console.log(password);

  try {
    const user = await Usermodel.findOne({ email });

    if (!user) {
      res.status(400).json({ msg: "Invalid email" });
    } else {
      let current = new Date().getTime();
      if (user.blockedUntil > 0 && user.blockedUntil <= current) {
        user.wrong = 0;
        user.blockedUntil = 0;
        await user.save();
        var token = jwt.sign({ userID: user._id }, "secret", {
          expiresIn: "24h",
        });
        res.status(200).json({
          msg: "LogIn successfully",
          token: token,
          user: user,
        });
      } else if (user.wrong && user.wrong >= 5) {
        if (user.password != password) {
          user.wrong = user.wrong + 1;
          const currentTime = new Date();
          user.blockedUntil = currentTime.getTime() + 60 * 60 * 24 * 1000;
          await user.save();
          res.status(401).json({
            msg: "Your account has been blocked due to too many failed login attempts. Please try again later.",
          });
        }
        res.status(401).json({
          msg: "Your account has been blocked due to too many failed login attempts. Please try again later.",
        });
      } else if (user.password != password) {
        user.wrong = user.wrong + 1;
        await user.save();
        res.status(401).json({ msg: "wrong password" });
      } else {
        console.log(user, "login id", user._id);
        var token = jwt.sign({ userID: user._id }, "secret", {
          expiresIn: "24h",
        });
        res.status(200).json({
          msg: "LogIn successfully",
          token: token,
          user: user,
        });
      }
    }
  } catch (error) {
    res.json("Some Error occurred, unable to Login.");
    console.log(error);
  }
});

module.exports = { userRouter };
