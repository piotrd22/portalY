const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");
const commonMiddleware = require("../middleware/commonMiddleware");
const postValidators = require("../validators/post/postValidators");

router.get(
  "/:id",
  [authMiddleware.requireAuth, commonMiddleware.validatePathIdIsValidMongoId],
  postController.getPostById
);

router.delete(
  "/:id",
  [authMiddleware.requireAuth, commonMiddleware.validatePathIdIsValidMongoId],
  postController.deletePost
);

router.patch(
  "/:id",
  [authMiddleware.requireAuth, commonMiddleware.validatePathIdIsValidMongoId],
  postController.updatePost
);

router.post("/", authMiddleware.requireAuth, postController.createPost);

router.post(
  "/reply",
  [authMiddleware.requireAuth, postValidators.createReplyValidator],
  postController.createReply
);

router.post(
  "/quote",
  [authMiddleware.requireAuth, postValidators.createQuoteValidator],
  postController.createQuote
);

router.get(
  "/:id/replies",
  [authMiddleware.requireAuth, commonMiddleware.validatePathIdIsValidMongoId],
  postController.getPostReplies
);

module.exports = router;
