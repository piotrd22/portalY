const status = require("http-status");
const userMapper = require("../mappers/userMapper");

const login = (req, res) => {
  if (!req.user) {
    return res
      .status(status.UNAUTHORIZED)
      .json({ message: "Invalid credentials" });
  }

  res.status(status.OK).json(userMapper(req.user));
};

const isAuthenticated = (req, res) => {
  if (req.isAuthenticated() && req.user) {
    return res.status(200).json({ isLoggedIn: true, userId: req.user._id });
  }
  return res.status(200).json({ isLoggedIn: false });
};

const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err.message);
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json({ message: "Error" });
    }
    res.status(status.OK).json({ message: "Succesfully logout" });
  });
};

module.exports = { login, logout, isAuthenticated };
