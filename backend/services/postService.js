const Post = require("../models/Post");

const getPostByIdAndPopulate = async (id) => {
  return await Post.findById(id)
    .populate({
      path: "user",
      select: "avatar username _id",
    })
    .populate({
      path: "quotedPost",
      select: "content user _id createdAt updatedAt isDeleted",
      populate: { path: "user", select: "avatar username _id" },
    })
    .populate({
      path: "parents",
      select:
        "content user _id createdAt updatedAt isDeleted replies quotedPost quotedBy",
      populate: [
        { path: "user", select: "avatar username _id" },
        {
          path: "quotedPost",
          select: "content user _id createdAt updatedAt isDeleted",
          populate: { path: "user", select: "avatar username _id" },
        },
      ],
      options: { sort: { createdAt: 1 } },
    });
};

const getPostById = async (id) => {
  return await Post.findById(id);
};

const getPostReplies = async (
  id,
  currentUser,
  lastCreatedAt,
  pageSize = 10
) => {
  return await Post.findById(id).populate({
    path: "replies",
    match: {
      isDeleted: { $ne: true },
      user: {
        $nin: [...currentUser.blockedUsers, ...currentUser.blockedBy],
      },
      createdAt: { $lt: new Date(lastCreatedAt) },
    },
    populate: { path: "user", select: "avatar username _id" },
    options: {
      sort: { createdAt: -1 },
      limit: parseInt(pageSize),
    },
  });
};

const getPostQuotedBy = async (
  id,
  currentUser,
  lastCreatedAt,
  pageSize = 10
) => {
  return await Post.findById(id).populate({
    path: "quotedBy",
    match: {
      isDeleted: { $ne: true },
      user: {
        $nin: [...currentUser.blockedUsers, ...currentUser.blockedBy],
      },
      createdAt: { $lt: new Date(lastCreatedAt) },
    },
    populate: [
      { path: "user", select: "avatar username _id" },
      {
        path: "quotedPost",
        populate: { path: "user", select: "avatar username _id" },
      },
    ],
    options: {
      sort: { createdAt: -1 },
      limit: parseInt(pageSize),
    },
  });
};

const createPost = async (content, user) => {
  const post = new Post({ content, user: user.id });
  const newPostDocument = await post.save();
  const newPost = await newPostDocument.populate({
    path: "user",
    select: "avatar username _id",
  });
  await user.updateOne({ $push: { posts: newPost.id } });
  return newPost;
};

const createReply = async (content, parent, user) => {
  const post = new Post({
    content,
    user: user.id,
    parents: [parent.id, ...parent.parents],
  });
  const newPostDocument = await post.save();
  const newPost = await newPostDocument.populate({
    path: "user",
    select: "avatar username _id",
  });
  await user.updateOne({ $push: { replies: newPost.id } });
  await parent.updateOne({ $push: { replies: newPost.id } });
  return newPost;
};

const createQuote = async (content, quotedPost, user) => {
  const post = new Post({
    content,
    user: user.id,
    quotedPost: quotedPost.id,
  });
  const newPost = await post.save();
  await user.updateOne({ $push: { posts: newPost.id } });
  await quotedPost.updateOne({ $push: { quotedBy: newPost.id } });

  return await Post.findById(newPost._id)
    .populate({
      path: "user",
      select: "avatar username _id",
    })
    .populate({
      path: "quotedPost",
      select: "content user _id createdAt updatedAt isDeleted",
      populate: { path: "user", select: "avatar username _id" },
    });
};

const deletePost = async (post, user) => {
  await Post.updateMany(
    { $or: [{ replies: post._id }, { quotedBy: post._id }] },
    { $pull: { replies: post._id, quotedBy: post._id } }
  );

  await post.updateOne({ isDeleted: true });
  await user.updateOne({ $pull: { posts: post.id, replies: post.id } }); // ???
};

const updatePost = async (post, dataToUpdate) => {
  return await Post.findByIdAndUpdate(post._id, dataToUpdate, {
    new: true,
  });
};

const getFeed = async (currentUser, lastCreatedAt, pageSize = 10) => {
  const query = {
    $or: [
      ...currentUser.following.map((following) => ({
        user: following.user,
        $and: [
          { createdAt: { $gte: following.followedAt } },
          { createdAt: { $lte: following.unfollowedAt || new Date() } },
        ],
      })),
      { user: currentUser._id },
    ],
    isDeleted: { $ne: true },
    user: { $nin: [...currentUser.blockedUsers, ...currentUser.blockedBy] },
    parents: { $size: 0 },
    createdAt: { $lt: new Date(lastCreatedAt) },
  };

  return await Post.find(query)
    .populate({
      path: "user",
      select: "avatar username _id",
    })
    .populate({
      path: "quotedPost",
      select: "content user _id createdAt updatedAt isDeleted",
      populate: { path: "user", select: "avatar username _id" },
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(pageSize));
};

module.exports = {
  getPostByIdAndPopulate,
  getPostById,
  getPostReplies,
  createPost,
  createReply,
  createQuote,
  deletePost,
  updatePost,
  getFeed,
  getPostQuotedBy,
};
