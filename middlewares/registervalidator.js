const registerValidator = (req, res, next) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ msg: "All fields are mandatory!" });
  }
  next();
};

module.exports = { registerValidator };
