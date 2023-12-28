const status = require("http-status");
const mongoose = require("mongoose");

const validatePathIdIsValidMongoId = (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(status.BAD_REQUEST).json({ message: "Invalid ID" });
    }

    return next();
  } catch (err) {
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

module.exports = { validatePathIdIsValidMongoId };
