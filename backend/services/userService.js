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

const searchUsers = async (keyword, lastCreatedAt, pageSize = 10) => {
  const query = {
    $or: [
      { username: { $regex: new RegExp(keyword, "i") } },
      { name: { $regex: new RegExp(keyword, "i") } },
    ],
    createdAt: { $lt: new Date(lastCreatedAt) },
  };

  return await User.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(pageSize));
};

const getUserAndPopulate = async (id, path, lastCreatedAt, pageSize = 10) => {
  return await User.findById(id).populate({
    path: path,
    match: {
      createdAt: { $lt: new Date(lastCreatedAt) },
    },
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

const getUserPosts = async (id, lastCreatedAt, pageSize = 10) => {
  return await User.findById(id).populate({
    path: "posts",
    match: {
      createdAt: { $lt: new Date(lastCreatedAt) },
    },
    options: {
      sort: { createdAt: -1 },
      limit: parseInt(pageSize),
    },
    populate: [
      {
        path: "user",
        select: "_id avatar username",
      },
      {
        path: "quotedPost",
        select: "content user _id createdAt updatedAt isDeleted",
        populate: {
          path: "user",
          select: "avatar username _id",
        },
      },
    ],
  });
};

const getUserReplies = async (id, lastCreatedAt, pageSize = 10) => {
  return await User.findById(id).populate({
    path: "replies",
    match: {
      createdAt: { $lt: new Date(lastCreatedAt) },
    },
    options: {
      sort: { createdAt: -1 },
      limit: parseInt(pageSize),
    },
    populate: [
      {
        path: "user",
        select: "_id avatar username",
      },
      {
        path: "parents",
        select:
          "content user _id createdAt updatedAt isDeleted replies quotedBy quotedPost",
        populate: [
          { path: "user", select: "avatar username _id" },
          {
            path: "quotedPost",
            select: "content user _id createdAt updatedAt isDeleted",
            populate: {
              path: "user",
              select: "avatar username _id",
            },
          },
        ],
        options: { sort: { createdAt: 1 } },
      },
    ],
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
