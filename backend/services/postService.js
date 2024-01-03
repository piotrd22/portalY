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
      select: "content user _id createdAt updatedAt isDeleted",
      populate: { path: "user", select: "avatar username _id" },
      options: { sort: { createdAt: -1 } },
    });
};

const getPostById = async (id) => {
  return await Post.findById(id);
};

const getPostReplies = async (id, page = 1, pageSize = 10) => {
  const skip = (parseInt(page) - 1) * parseInt(pageSize);

  return await Post.findById(id).populate({
    path: "replies",
    match: {
      isDeleted: { $ne: true },
      "user._id": { $nin: currentUser.blockedUsers },
      "user._id": { $nin: currentUser.blockedBy },
    },
    populate: { path: "user", select: "avatar username _id" },
    options: {
      sort: { createdAt: -1 },
      skip,
      limit: parseInt(pageSize),
    },
  });
};

const createPost = async (content, user) => {
  const post = new Post({ content, user: user.id });
  const newPost = await post.save();
  await user.updateOne({ $push: { posts: newPost.id } });
  return newPost;
};

const createReply = async (content, parent, user) => {
  const post = new Post({
    content,
    user: user.id,
    parents: [parent.id, ...parent.parents],
  });
  const newPost = await post.save();
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
  return newPost;
};

const deletePost = async (post, user) => {
  await post.updateOne({ isDeleted: true });
  await user.updateOne({ $pull: { posts: post.id, replies: post.id } }); // ???
};

const updatePost = async (post, dataToUpdate) => {
  return await post.updateOne(dataToUpdate);
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
};
