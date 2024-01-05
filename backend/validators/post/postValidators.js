const commonValidators = require("../commonValidators");

const createReplyValidator = commonValidators.createValidator([
  async (req) =>
    commonValidators.validateNotEmpty(req.body.parentId, "Parent Id"),
  async (req) =>
    commonValidators.validateMongoId(req.body.parentId, "Parent Id"),
]);

const createQuoteValidator = commonValidators.createValidator([
  async (req) =>
    commonValidators.validateNotEmpty(req.body.quotedPostId, "Quoted Post Id"),
  async (req) =>
    commonValidators.validateMongoId(req.body.quotedPostId, "Quoted Post Id"),
]);

module.exports = { createReplyValidator, createQuoteValidator };
