const bcrypt = require("bcrypt");
const User = require("../models/User");

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
  await User.updateMany({ followers: id }, { $pull: { followers: id } });
  await User.updateMany({ following: id }, { $pull: { following: id } });
  await User.updateMany({ blockedBy: id }, { $pull: { blockedBy: id } });
  await User.updateMany({ blockedUsers: id }, { $pull: { blockedUsers: id } });
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
};
