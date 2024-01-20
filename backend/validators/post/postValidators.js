const commonValidators = require("../commonValidators");

const createPostValidator = commonValidators.createValidator([
  async (req) =>
    commonValidators.validateNotEmpty(req.body.content, "Post content"),
  async (req) =>
    commonValidators.validateNotWhitespace(req.body.content, "Post content"),
]);

const createReplyValidator = commonValidators.createValidator([
  async (req) =>
    commonValidators.validateNotEmpty(req.body.parentId, "Parent Id"),
  async (req) =>
    commonValidators.validateMongoId(req.body.parentId, "Parent Id"),
  async (req) =>
    commonValidators.validateNotEmpty(req.body.content, "Post content"),
  async (req) =>
    commonValidators.validateNotWhitespace(req.body.content, "Post content"),
]);

const createQuoteValidator = commonValidators.createValidator([
  async (req) =>
    commonValidators.validateNotEmpty(req.body.quotedPostId, "Quoted Post Id"),
  async (req) =>
    commonValidators.validateMongoId(req.body.quotedPostId, "Quoted Post Id"),
  async (req) =>
    commonValidators.validateNotWhitespace(req.body.content, "Post content"),
]);

module.exports = {
  createReplyValidator,
  createQuoteValidator,
  createPostValidator,
};
