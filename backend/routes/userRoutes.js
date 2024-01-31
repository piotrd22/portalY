const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const commonMiddleware = require("../middleware/commonMiddleware");
const userMiddleware = require("../middleware/userMiddleware");
const userValidators = require("../validators/user/userValidators");
const userController = require("../controllers/userController");
const upload = require("../config/multer");

router.get("/search", authMiddleware.requireAuth, userController.searchUsers);

router.get(
  "/:id",
  [
    authMiddleware.requireAuth,
    commonMiddleware.validatePathIdIsValidMongoId,
    userMiddleware.requireNonBlocked,
  ],
  userController.getUserById
);

router.post("/", userValidators.createUserValidator, userController.createUser);

// router.delete(
//   "/:id",
//   [
//     authMiddleware.requireAuth,
//     commonMiddleware.validatePathIdIsValidMongoId,
//     userMiddleware.requireMe,
//   ],
//   userController.deleteUser
// );

router.patch(
  "/:id",
  [
    authMiddleware.requireAuth,
    commonMiddleware.validatePathIdIsValidMongoId,
    userMiddleware.requireMe,
    userValidators.updateUserValidator,
  ],
  userController.updateUser
);

router.patch(
  "/:id/follow",
  [
    authMiddleware.requireAuth,
    commonMiddleware.validatePathIdIsValidMongoId,
    userMiddleware.requireNonBlocked,
  ],
  userController.followUser
);

router.patch(
  "/:id/unfollow",
  [
    authMiddleware.requireAuth,
    commonMiddleware.validatePathIdIsValidMongoId,
    userMiddleware.requireNonBlocked,
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
    userMiddleware.requireNonBlocked,
  ],
  userController.getUserFollowers
);

router.get(
  "/:id/followings",
  [
    authMiddleware.requireAuth,
    commonMiddleware.validatePathIdIsValidMongoId,
    userMiddleware.requireNonBlocked,
  ],
  userController.getUserFollowings
);

router.get(
  "/:id/blocked",
  [
    authMiddleware.requireAuth,
    commonMiddleware.validatePathIdIsValidMongoId,
    userMiddleware.requireMe,
  ],
  userController.getBlockedUsers
);

router.patch(
  "/:id/password",
  [
    authMiddleware.requireAuth,
    commonMiddleware.validatePathIdIsValidMongoId,
    userMiddleware.requireMe,
    userValidators.updatePasswordValidator,
  ],
  userController.updatePassword
);

router.patch(
  "/:id/username",
  [
    authMiddleware.requireAuth,
    commonMiddleware.validatePathIdIsValidMongoId,
    userMiddleware.requireMe,
    userValidators.updateUsernameValidator,
  ],
  userController.updateUsername
);

router.get(
  "/:id/posts",
  [
    authMiddleware.requireAuth,
    commonMiddleware.validatePathIdIsValidMongoId,
    userMiddleware.requireNonBlocked,
  ],
  userController.getUserPosts
);

router.get(
  "/:id/replies",
  [
    authMiddleware.requireAuth,
    commonMiddleware.validatePathIdIsValidMongoId,
    userMiddleware.requireNonBlocked,
  ],
  userController.getUserReplies
);

// I am using post because of upload.single("file")
router.post(
  "/:id/avatar",
  [
    authMiddleware.requireAuth,
    commonMiddleware.validatePathIdIsValidMongoId,
    upload.single("file"),
    userValidators.updateAvatarValidator,
  ],
  userController.updateAvatar
);

router.delete(
  "/:id/avatar",
  [
    authMiddleware.requireAuth,
    commonMiddleware.validatePathIdIsValidMongoId,
    userMiddleware.requireMeOrAdmin,
  ],
  userController.deleteAvatar
);

module.exports = router;
