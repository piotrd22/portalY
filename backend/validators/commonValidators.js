const status = require("http-status");
const mongoose = require("mongoose");

const createValidator = (validatorFunctions) => {
  return async (req, res, next) => {
    try {
      for (const validatorFunction of validatorFunctions) {
        const validationError = await validatorFunction(req);

        if (validationError) {
          return res
            .status(status.BAD_REQUEST)
            .json({ message: validationError });
        }
      }

      return next();
    } catch (err) {
      console.error(err.message);
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  };
};

const validateNotEmpty = (value, valueName) => {
  if (!value) {
    return valueName ? `${valueName} cannot be empty` : "Value cannot be empty";
  }
  return null;
};

const validateMongoId = (id, idName) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return idName
      ? `${idName} is not valid mongo id`
      : "Id is not valid mongo id";
  }
  return null;
};

module.exports = { createValidator, validateNotEmpty, validateMongoId };
