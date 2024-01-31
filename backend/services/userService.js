const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/User");
// const Post = require("../models/Post");

const getUserById = async (id) => {
  return await User.findById(id);
};

const getUserByIdWithValidFollowing = async (id) => {
  const users = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $project: {
        username: 1,
        avatar: 1,
        avatarId: 1,
        bio: 1,
        website: 1,
        role: 1,
        followers: 1,
        blockedUsers: 1,
        blockedBy: 1,
        posts: 1,
        replies: 1,
        birthDate: 1,
        createdAt: 1,
        updatedAt: 1,
        name: 1,
        following: {
          $filter: {
            input: "$following",
            as: "follow",
            cond: {
              $eq: ["$$follow.unfollowedAt", null],
            },
          },
        },
      },
    },
  ]);

  return users[0];
};

const createUser = async (username, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    username,
    password: hashedPassword,
  });
  return await newUser.save();
};

// const deleteUser = async (id) => {
//   await User.findByIdAndDelete(id);
//   await User.updateMany(
//     {
//       $or: [
//         { followers: id },
//         { following: id },
//         { blockedBy: id },
//         { blockedUsers: id },
//       ],
//     },
//     {
//       $pull: {
//         followers: id,
//         following: id,
//         blockedBy: id,
//         blockedUsers: id,
//       },
//     }
//   );

//   const userPosts = await Post.find({ user: id });

//   // I know it sucks but I don't have much time so maybe I'll change it in future
//   for (const post of userPosts) {
//     await Post.updateMany(
//       { $or: [{ replies: post._id }, { quotedBy: post._id }] },
//       { $pull: { replies: post._id, quotedBy: post._id } }
//     );
//   }

//   await Post.updateMany(
//     { user: id },
//     { $set: { isDeleted: true, user: null } }
//   );
// };

const followUser = async (user, userToFollow) => {
  await userToFollow.updateOne({ $push: { followers: user.id } });
  await user.updateOne({ $push: { following: { user: userToFollow.id } } });
};

const unfollowUser = async (user, userToUnfollow) => {
  const currentDate = new Date();
  await user.updateOne(
    { $set: { "following.$[m].unfollowedAt": currentDate } },
    { arrayFilters: [{ "m.unfollowedAt": null, "m.user": userToUnfollow.id }] }
  );

  await userToUnfollow.updateOne({ $pull: { followers: user.id } });
};

const blockUser = async (user, userToBlock) => {
  if (
    user.following.some(
      (u) => u.user._id.equals(userToBlock._id) && !u.unfollowedAt
    )
  ) {
    unfollowUser(user, userToBlock);
  }

  if (user.followers.some((u) => u._id.equals(userToBlock._id))) {
    unfollowUser(userToBlock, user);
  }

  await userToBlock.updateOne({ $push: { blockedBy: user.id } });
  await user.updateOne({ $push: { blockedUsers: userToBlock.id } });
};

const unblockUser = async (user, userToUnblock) => {
  await user.updateOne({ $pull: { blockedUsers: userToUnblock.id } });
  await userToUnblock.updateOne({ $pull: { blockedBy: user.id } });
};

const searchUsers = async (
  keyword,
  loggedInUserId,
  lastCreatedAt,
  pageSize = 10
) => {
  const query = {
    $or: [
      { username: { $regex: new RegExp(keyword, "i") } },
      { name: { $regex: new RegExp(keyword, "i") } },
    ],
    createdAt: { $lt: new Date(lastCreatedAt) },
    _id: { $ne: loggedInUserId },
  };

  return await User.find(query)
    .sort({ createdAt: -1 })
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
      limit: parseInt(pageSize),
    },
  });
};

const getUserFollowings = async (id, lastCreatedAt, pageSize = 10) => {
  const users = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $project: {
        _id: 1,
        following: {
          $map: {
            input: {
              $filter: {
                input: "$following",
                as: "follow",
                cond: {
                  $eq: ["$$follow.unfollowedAt", null],
                },
              },
            },
            as: "follow",
            in: "$$follow.user",
          },
        },
      },
    },
  ]);

  const user = users[0];

  return await User.find({
    _id: { $in: user.following },
    createdAt: { $lt: new Date(lastCreatedAt) },
  })
    .sort({ createdAt: -1 })
    .limit(parseInt(pageSize));
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
  getUserByIdWithValidFollowing,
  createUser,
  // deleteUser,
  followUser,
  unfollowUser,
  blockUser,
  unblockUser,
  searchUsers,
  getUserAndPopulate,
  getUserFollowings,
  updateUser,
  getUserPosts,
  getUserReplies,
};
