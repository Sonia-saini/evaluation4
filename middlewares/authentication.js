const { Usermodel } = require("../Models/usermodel");

// require("dotenv").config();

const jwt = require("jsonwebtoken");

const authentication = async (req, res, next) => {
  let token = req.headers.token;

  console.log(token, process.env.key);
  if (!token) {
    return res.status(401).send({ msg: "please login first" });
  }
  try {
    const verify = jwt.verify(token, "secret");
    console.log(verify);
    const user = await Usermodel.findOne({ _id: verify.userID });
    if (user) {
      next();
    } else {
      res.status(401).send({ msg: "please login first" });
    }
  } catch (e) {
    res.status(401).send({ msg: "please login first" });
  }
};

module.exports = authentication;
