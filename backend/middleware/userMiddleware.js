const mongoose = require("mongoose");

const requireMe = (req, res, next) => {
  try {
    const { id } = req.params;

    if (id !== req.user.id) {
      return res.status(status.FORBIDDEN).json({ message: "Forbidden" });
    }

    return next();
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const requireMeOrAdmin = (req, res, next) => {
  try {
    const { id } = req.params;

    if (id !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(status.FORBIDDEN).json({ message: "Forbidden" });
    }

    return next();
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

// USE validatePathIdIsValidMongoId FROM commonMiddleware BEFORE THIS
const requireNonBlocked = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (
      req.user.blockedUsers.some((user) =>
        user._id.equals(new mongoose.Types.ObjectId(id))
      )
    ) {
      return res.status(status.FORBIDDEN).json({
        message: "Access denied, you have blocked this user",
        blockedBy: false,
      });
    }

    if (
      req.user.blockedBy.some((user) =>
        user._id.equals(new mongoose.Types.ObjectId(id))
      )
    ) {
      return res.status(status.FORBIDDEN).json({
        message: "Access denied, you are blocked by this user",
        blockedBy: true,
      });
    }

    return next();
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

module.exports = { requireMeOrAdmin, requireMe, requireNonBlocked };
