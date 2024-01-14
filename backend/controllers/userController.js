const status = require("http-status");
const bcrypt = require("bcrypt");
const userMapper = require("../mappers/userMapper");
const userService = require("../services/userService");
const imagekit = require("../config/imagekit");
const mongoose = require("mongoose");

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(status.NOT_FOUND).json({ message: "User not found" });
    }

    return res.status(status.OK).json({ user: userMapper(user) });
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const savedUser = await userService.createUser(username, password);

    return res.status(status.CREATED).json({ user: userMapper(savedUser) });
  } catch (err) {
    console.error(err.message);
    res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await userService.deleteUser(id);

    return res.status(status.OK).json({ message: "Sucessfully deleted" });
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const followUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res
        .status(status.CONFLICT)
        .json({ message: "You cannot follow yourself" });
    }

    const userToFollow = await userService.getUserById(id);

    if (!userToFollow) {
      return res.status(status.NOT_FOUND).json({ message: "User not found" });
    }

    if (req.user.following.some((user) => user._id.equals(userToFollow._id))) {
      return res
        .status(status.CONFLICT)
        .json({ message: "You already followed this user" });
    }

    await userService.followUser(req.user, userToFollow);

    return res.status(status.OK).json({ messgae: "User has been followed" });
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res
        .status(status.CONFLICT)
        .json({ message: "You cannot unfollow yourself" });
    }

    const userToUnfollow = await userService.getUserById(id);

    if (!userToUnfollow) {
      return res.status(status.NOT_FOUND).json({ message: "User not found" });
    }

    if (
      !req.user.following.some((user) => user._id.equals(userToUnfollow._id))
    ) {
      return res
        .status(status.CONFLICT)
        .json({ message: "You already unfollowed this user" });
    }

    await userService.unfollowUser(req.user, userToUnfollow);

    return res.status(status.OK).json({ messgae: "User has been unfollowed" });
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const blockUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res
        .status(status.CONFLICT)
        .json({ message: "You cannot block yourself" });
    }

    const userToBlock = await userService.getUserById(id);

    if (!userToBlock) {
      return res.status(status.NOT_FOUND).json({ message: "User not found" });
    }

    if (
      req.user.blockedUsers.some((user) => user._id.equals(userToBlock._id))
    ) {
      return res
        .status(status.CONFLICT)
        .json({ message: "You already blocked this user" });
    }

    await userService.blockUser(req.user, userToBlock);

    return res.status(status.OK).json({ messgae: "User has been blocked" });
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const unblockUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res
        .status(status.CONFLICT)
        .json({ message: "You cannot unblock yourself" });
    }

    const userToUnblock = await userService.getUserById(id);

    if (!userToUnblock) {
      return res.status(status.NOT_FOUND).json({ message: "User not found" });
    }

    if (
      !req.user.blockedUsers.some((user) => user._id.equals(userToUnblock._id))
    ) {
      return res
        .status(status.CONFLICT)
        .json({ message: "You already unblocked this user" });
    }

    await userService.unblockUser(req.user, userToUnblock);

    return res.status(status.OK).json({ messgae: "User has been ublocked" });
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { keyword, page = 1, pageSize = 10 } = req.query;

    const users = await userService.searchUsers(keyword, page, pageSize);

    const usersToReturn = users.map((user) => userMapper(user));

    return res.status(status.OK).json({ users: usersToReturn });
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const getUserFollowers = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, pageSize = 10 } = req.query;

    const user = await userService.getUserAndPopulate(
      id,
      "followers",
      page,
      pageSize
    );

    if (!user) {
      return res.status(status.NOT_FOUND).json({ message: "User not found" });
    }

    const followers = user.followers.map((follower) => userMapper(follower));

    return res.status(status.OK).json({ followers });
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const getUserFollowings = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, pageSize = 10 } = req.query;

    const user = await userService.getUserAndPopulate(
      id,
      "following",
      page,
      pageSize
    );

    if (!user) {
      return res.status(status.NOT_FOUND).json({ message: "User not found" });
    }

    const followings = user.following.map((following) => userMapper(following));

    return res.status(status.OK).json({ followings });
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const getBlockedUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, pageSize = 10 } = req.query;

    const user = await userService.getUserAndPopulate(
      id,
      "blockedUsers",
      page,
      pageSize
    );

    if (!user) {
      return res.status(status.NOT_FOUND).json({ message: "User not found" });
    }

    const blockedUsers = user.blockedUsers.map((user) => userMapper(user));

    return res.status(status.OK).json({ blockedUsers });
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { password, oldPassword } = req.body;
    const { id } = req.params;

    const userPassw = await bcrypt.compare(oldPassword, req.user.password);
    if (!userPassw) {
      return res
        .status(status.BAD_REQUEST)
        .json({ message: "Old password does not match!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await userService.updateUser(id, { password: hashedPassword });

    return res
      .status(status.OK)
      .json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const updateUsername = async (req, res) => {
  try {
    const { username } = req.body;
    const { id } = req.params;

    const updatedUser = await userService.updateUser(id, {
      username: username,
    });

    return res.status(status.OK).json({
      message: "Username updated successfully",
      user: userMapper(updatedUser),
    });
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, bio, website, birthDate } = req.body;
    const { id } = req.params;

    const updatedData = {
      name,
      bio,
      website,
      birthDate,
    };

    const updatedUser = await userService.updateUser(id, updatedData);

    return res.status(status.OK).json({
      message: "User updated successfully",
      user: userMapper(updatedUser),
    });
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, pageSize = 10 } = req.query;

    const userWithPosts = await userService.getUserPosts(id, page, pageSize);

    if (!userWithPosts) {
      return res.status(status.NOT_FOUND).json({ message: "User not found" });
    }

    const posts = userWithPosts.posts;

    if (posts.length > 0) {
      posts.map((post) => {
        if (
          post.quotedPost &&
          (req.user.blockedUsers.some((user) =>
            user._id.equals(
              new mongoose.Types.ObjectId(post.quotedPost.user.id)
            )
          ) ||
            req.user.blockedBy.some((user) =>
              user._id.equals(
                new mongoose.Types.ObjectId(post.quotedPost.user.id)
              )
            ))
        ) {
          post.quotedPost.content = "[hidden]";
        }
        return post;
      });
    }

    return res.status(status.OK).json({ posts });
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const getUserReplies = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, pageSize = 10 } = req.query;

    const userWithReplies = await userService.getUserReplies(
      id,
      page,
      pageSize
    );

    if (!userWithReplies) {
      return res.status(status.NOT_FOUND).json({ message: "User not found" });
    }

    const replies = userWithReplies.replies;

    if (replies.length > 0) {
      replies = replies.map((post) => {
        post.parents = post.parents.map((parent) => {
          if (parent.isDeleted) {
            parent.content = "[deleted]";
          } else if (
            parent.user &&
            (req.user.blockedUsers.some((user) =>
              user._id.equals(new mongoose.Types.ObjectId(parent.user.id))
            ) ||
              req.user.blockedBy.some((user) =>
                user._id.equals(new mongoose.Types.ObjectId(parent.user.id))
              ))
          ) {
            parent.content = "[hidden]";
          }
          return parent;
        });
      });
    }

    return res.status(status.OK).json({ replies });
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const updateAvatar = async (req, res) => {
  try {
    const { id } = req.params;

    const existingUser = await userService.getUserById(id);

    if (!existingUser) {
      return res.status(status.NOT_FOUND).json({ message: "User not found" });
    }

    const uploadResponse = await new Promise(async (resolve, reject) => {
      try {
        const response = await imagekit.upload({
          file: req.file.buffer,
          fileName: req.file.originalname,
          folder: "user_avatars",
        });
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });

    const { url, fileId } = uploadResponse;

    if (existingUser.avatar && existingUser.avatarId) {
      imagekit.deleteFile(existingUser.avatarId);
    }

    const updatedUser = await userService.updateUser(id, {
      avatar: url,
      avatarId: fileId,
    });

    return res.status(status.OK).json({
      message: "Avatar updated successfully",
      user: userMapper(updatedUser),
    });
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const deleteAvatar = async (req, res) => {
  try {
    const { id } = req.params;

    const existingUser = await userService.getUserById(id);

    if (!existingUser) {
      return res.status(status.NOT_FOUND).json({ message: "User not found" });
    }

    if (existingUser.avatar && existingUser.avatarId) {
      imagekit.deleteFile(existingUser.avatarId);
    }

    const updatedUser = await userService.updateUser(id, {
      avatar: "",
      avatarId: "",
    });

    return res.status(status.OK).json({
      message: "Avatar deleted successfully",
      user: userMapper(updatedUser),
    });
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getUserById,
  createUser,
  deleteUser,
  followUser,
  unfollowUser,
  blockUser,
  unblockUser,
  searchUsers,
  getUserFollowers,
  getUserFollowings,
  getBlockedUsers,
  updatePassword,
  updateUsername,
  updateUser,
  getUserPosts,
  getUserReplies,
  updateAvatar,
  deleteAvatar,
};
