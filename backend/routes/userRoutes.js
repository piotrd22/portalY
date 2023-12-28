const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const commonMiddleware = require("../middleware/commonMiddleware");
const userValidators = require("../validators/user/userValidators");
const userController = require("../controllers/userController");

router.get("/search", authMiddleware.requireAuth, userController.searchUsers);

router.get(
  "/:id",
  [
    authMiddleware.requireAuth,
    commonMiddleware.validatePathIdIsValidMongoId,
    authMiddleware.requireNonBlocked,
  ],
  userController.getUserById
);

router.post("/", userValidators.createUserValidator, userController.createUser);

router.delete(
  "/:id",
  [
    authMiddleware.requireAuth,
    commonMiddleware.validatePathIdIsValidMongoId,
    authMiddleware.requireMe,
  ],
  userController.deleteUser
);

router.patch(
  "/:id",
  [
    authMiddleware.requireAuth,
    commonMiddleware.validatePathIdIsValidMongoId,
    authMiddleware.requireMe,
    userValidators.updateUserValidator,
  ],
  userController.updateUser
);

router.patch(
  "/:id/follow",
  [
    authMiddleware.requireAuth,
    commonMiddleware.validatePathIdIsValidMongoId,
    authMiddleware.requireNonBlocked,
  ],
  userController.followUser
);

router.patch(
  "/:id/unfollow",
  [
    authMiddleware.requireAuth,
    commonMiddleware.validatePathIdIsValidMongoId,
    authMiddleware.requireNonBlocked,
  ],
  userController.unfollowUser
);

router.patch(
  "/:id/block",
  [authMiddleware.requireAuth, commonMiddleware.validatePathIdIsValidMongoId],
  userController.blockUser
);

router.patch(
  "/:id/unblock",
  [authMiddleware.requireAuth, commonMiddleware.validatePathIdIsValidMongoId],
  userController.unblockUser
);

router.get(
  "/:id/followers",
  [
    authMiddleware.requireAuth,
    commonMiddleware.validatePathIdIsValidMongoId,
    authMiddleware.requireNonBlocked,
  ],
  userController.getUserFollowers
);

router.get(
  "/:id/followings",
  [
    authMiddleware.requireAuth,
    commonMiddleware.validatePathIdIsValidMongoId,
    authMiddleware.requireNonBlocked,
  ],
  userController.getUserFollowings
);

router.get(
  "/:id/blocked",
  [
    authMiddleware.requireAuth,
    commonMiddleware.validatePathIdIsValidMongoId,
    authMiddleware.requireMe,
  ],
  userController.getBlockedUsers
);

router.patch(
  "/:id/password",
  [
    authMiddleware.requireAuth,
    commonMiddleware.validatePathIdIsValidMongoId,
    authMiddleware.requireMe,
    userValidators.updatePasswordValidator,
  ],
  userController.updatePassword
);

router.patch(
  "/:id/username",
  [
    authMiddleware.requireAuth,
    commonMiddleware.validatePathIdIsValidMongoId,
    authMiddleware.requireMe,
    userValidators.updateUsernameValidator,
  ],
  userController.updateUsername
);

module.exports = router;
