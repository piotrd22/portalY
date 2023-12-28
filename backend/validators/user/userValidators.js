const commonValidators = require("../commonValidators");
const utils = require("./utils");

const updateUsernameValidator = commonValidators.createValidator([
  async (req) =>
    commonValidators.validateNotEmpty(req.body.username, "Username"),
  async (req) => utils.validateUsername(req.body.username),
]);

const updatePasswordValidator = commonValidators.createValidator([
  async (req) =>
    commonValidators.validateNotEmpty(req.body.password, "Password"),
  async (req) => utils.validatePassword(req.body.password),
]);

const updateUserValidator = commonValidators.createValidator([
  async (req) => utils.validateDate(req.body.birthDate),
  async (req) => utils.validateUrl(req.body.website),
]);

const createUserValidator = commonValidators.createValidator([
  async (req) =>
    commonValidators.validateNotEmpty(req.body.password, "Password"),
  async (req) =>
    commonValidators.validateNotEmpty(req.body.username, "Username"),
  async (req) => utils.validatePassword(req.body.password),
  async (req) => utils.validateUsername(req.body.username),
]);

module.exports = {
  updateUsernameValidator,
  updatePasswordValidator,
  updateUserValidator,
  createUserValidator,
};
