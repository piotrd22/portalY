const status = require("http-status");

const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(status.UNAUTHORIZED).json({ message: "Unauthorized!" });
  }
  return next();
};

module.exports = { requireAuth };
