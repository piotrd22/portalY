const User = require("../../models/User");

const validateDate = (date) => {
  if (date) {
    const inputDate = new Date(date);
    const today = new Date();

    if (isNaN(inputDate)) {
      return "Date is not a valid date format";
    }

    if (inputDate > today) {
      return "Birthdate cannot be in the future";
    }
  }
  return null;
};

const validateUsername = async (username) => {
  if (username) {
    const isExist = await User.findOne({ username: username });

    if (isExist) {
      return "Username is already taken";
    }
  }
  return null;
};

const validatePassword = (password) => {
  if (password) {
    if (password.length < 6) {
      return "Password must be min of 6 characters";
    }
  }
  return null;
};

const validateUrl = (url) => {
  if (url) {
    try {
      new URL(url);
    } catch (err) {
      return "InvalidURL format";
    }
  }
};

const validateFile = (file) => {
  if (!file || !file.buffer) {
    return "Missing file or file buffer in the request";
  }
  return null;
};

module.exports = {
  validateDate,
  validateUsername,
  validatePassword,
  validateUrl,
  validateFile,
};
