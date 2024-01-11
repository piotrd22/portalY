const bcrypt = require("bcrypt");
const User = require("../models/User");
const Post = require("../models/Post");

const getUserById = async (id) => {
  return await User.findById(id);
};

const createUser = async (username, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    username,
    password: hashedPassword,
  });
  return await newUser.save();
};

const deleteUser = async (id) => {
  await User.findByIdAndDelete(id);
  await User.updateMany(
    {
      $or: [
        { followers: id },
        { following: id },
        { blockedBy: id },
        { blockedUsers: id },
      ],
    },
    {
      $pull: {
        followers: id,
        following: id,
        blockedBy: id,
        blockedUsers: id,
      },
    }
  );

  const userPosts = await Post.find({ user: id });

  // I know it sucks but I don't have much time so maybe I'll change it in future
  for (const post of userPosts) {
    await Post.updateMany(
      { $or: [{ replies: post._id }, { quotedBy: post._id }] },
      { $pull: { replies: post._id, quotedBy: post._id } }
    );
  }

  await Post.updateMany(
    { user: id },
    { $set: { isDeleted: true, user: null } }
  );
};

const followUser = async (user, userToFollow) => {
  await userToFollow.updateOne({ $push: { followers: user.id } });
  await user.updateOne({ $push: { following: userToFollow.id } });
};

const unfollowUser = async (user, userToUnfollow) => {
  await user.updateOne({ $pull: { following: userToUnfollow.id } });
  await userToUnfollow.updateOne({ $pull: { followers: user.id } });
};

const blockUser = async (user, userToBlock) => {
  if (user.following.some((u) => u._id.equals(userToBlock._id))) {
    await user.updateOne({ $pull: { following: userToBlock.id } });
    await userToBlock.updateOne({ $pull: { followers: user.id } });
  }

  if (user.followers.some((u) => u._id.equals(userToBlock._id))) {
    await user.updateOne({ $pull: { followers: userToBlock.id } });
    await userToBlock.updateOne({ $pull: { following: user.id } });
  }

  await userToBlock.updateOne({ $push: { blockedBy: user.id } });
  await user.updateOne({ $push: { blockedUsers: userToBlock.id } });
};

const unblockUser = async (user, userToUnblock) => {
  await user.updateOne({ $pull: { blockedUsers: userToUnblock.id } });
  await userToUnblock.updateOne({ $pull: { blockedBy: user.id } });
};

const searchUsers = async (keyword, page = 1, pageSize = 10) => {
  const skip = (parseInt(page) - 1) * parseInt(pageSize);

  return await User.find({
    $or: [
      { username: { $regex: new RegExp(keyword, "i") } },
      { name: { $regex: new RegExp(keyword, "i") } },
    ],
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(pageSize));
};

const getUserAndPopulate = async (id, path, page = 1, pageSize = 10) => {
  const skip = (parseInt(page) - 1) * parseInt(pageSize);

  return await User.findById(id).populate({
    path: path,
    options: {
      sort: { createdAt: -1 },
      skip,
      limit: parseInt(pageSize),
    },
  });
};

const updateUser = async (id, dataToUpdate) => {
  return await User.findByIdAndUpdate(id, dataToUpdate, {
    new: true,
  });
};

const getUserPosts = async (id, page = 1, pageSize = 10) => {
  const skip = (parseInt(page) - 1) * parseInt(pageSize);

  return await User.findById(id).populate({
    path: "posts",
    options: {
      sort: { createdAt: -1 },
      skip,
      limit: parseInt(pageSize),
    },
    populate: {
      path: "user",
      select: "_id avatar username",
    },
    populate: {
      path: "quotedPost",
      select: "content user _id createdAt updatedAt isDeleted",
      populate: { path: "user", select: "avatar username _id" },
    },
  });
};

const getUserReplies = async (id, page = 1, pageSize = 10) => {
  const skip = (parseInt(page) - 1) * parseInt(pageSize);

  return await User.findById(id).populate({
    path: "replies",
    options: {
      sort: { createdAt: -1 },
      skip,
      limit: parseInt(pageSize),
    },
    populate: {
      path: "user",
      select: "_id avatar username",
    },
    populate: {
      path: "parents",
      select: "content user _id createdAt updatedAt isDeleted",
      populate: { path: "user", select: "avatar username _id" },
      options: { sort: { createdAt: -1 } },
    },
  });
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
  getUserAndPopulate,
  updateUser,
  getUserPosts,
  getUserReplies,
};
