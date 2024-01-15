const status = require("http-status");
const postService = require("../services/postService");
const userService = require("../services/userService");
const mongoose = require("mongoose");

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await postService.getPostByIdAndPopulate(id);

    if (!post) {
      return res.status(status.NOT_FOUND).json({ message: "Post not found" });
    }

    // Check if the user is blocked
    if (
      post.user &&
      (req.user.blockedUsers.some((user) =>
        user._id.equals(new mongoose.Types.ObjectId(post.user.id))
      ) ||
        req.user.blockedBy.some((user) =>
          user._id.equals(new mongoose.Types.ObjectId(post.user.id))
        ))
    ) {
      post.content = "[hidden]";
    }

    // Check if the [deleted]
    if (post.isDeleted) {
      //   return res.status(status.GONE).json({ message: "[deleted]" });
      post.content = "[deleted]";
    }

    // Check if the quotedPost is not deleted
    if (post.quotedPost && post.quotedPost.isDeleted) {
      post.quotedPost.content = "[deleted]";
    } else if (
      // Check if the user of the quotedPost is blocked
      post.quotedPost &&
      (req.user.blockedUsers.some((user) =>
        user._id.equals(new mongoose.Types.ObjectId(post.quotedPost.user.id))
      ) ||
        req.user.blockedBy.some((user) =>
          user._id.equals(new mongoose.Types.ObjectId(post.quotedPost.user.id))
        ))
    ) {
      post.quotedPost.content = "[hidden]";
    }

    // Check the parents of the post
    if (post.parents && post.parents.length > 0) {
      post.parents = post.parents.map((parent) => {
        // Check if the parent has been deleted
        if (parent.isDeleted) {
          parent.content = "[deleted]";
        } else if (
          // Check if the user of the parent is blocked
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
    }

    return res.status(status.OK).json({ post });
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const getPostReplies = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, pageSize = 10 } = req.query;

    const post = await postService.getPostReplies(id, req.user, page, pageSize);

    if (!post) {
      return res.status(status.NOT_FOUND).json({ message: "Post not found" });
    }

    return res.status(status.OK).json({ replies: post.replies });
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const getPostQuotedBy = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, pageSize = 10 } = req.query;

    const post = await postService.getPostQuotedBy(
      id,
      req.user,
      page,
      pageSize
    );

    if (!post) {
      return res.status(status.NOT_FOUND).json({ message: "Post not found" });
    }

    post.quotedBy.forEach((post) => {
      if (post.quotedPost && post.quotedPost.isDeleted) {
        post.quotedPost.content = "[deleted]";
      } else if (
        post.quotedPost &&
        (req.user.blockedUsers.some((user) =>
          user._id.equals(new mongoose.Types.ObjectId(post.quotedPost.user.id))
        ) ||
          req.user.blockedBy.some((user) =>
            user._id.equals(
              new mongoose.Types.ObjectId(post.quotedPost.user.id)
            )
          ))
      ) {
        post.quotedPost.content = "[hidden]";
      }
    });

    return res.status(status.OK).json({ quotedBy: post.quotedBy });
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    const savedPost = await postService.createPost(content, req.user);

    return res.status(status.CREATED).json({ post: savedPost });
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const createReply = async (req, res) => {
  try {
    const { content, parentId } = req.body;

    const parent = await postService.getPostById(parentId);

    if (!parent) {
      return res
        .status(status.NOT_FOUND)
        .json({ message: "Parent post not found" });
    }

    // I have to think ab it
    if (parent.isDeleted) {
      return res.status(status.NOT_FOUND).json({ message: "Parent [deleted]" });
    }

    const savedPost = await postService.createReply(content, parent, req.user);

    return res.status(status.CREATED).json({ post: savedPost });
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const createQuote = async (req, res) => {
  try {
    const { content, quotedPostId } = req.body;

    const quotedPost = await postService.getPostById(quotedPostId);

    if (!quotedPost) {
      return res
        .status(status.NOT_FOUND)
        .json({ message: "Quoted post not found" });
    }

    if (quotedPost.isDeleted) {
      return res
        .status(status.NOT_FOUND)
        .json({ message: "Quoted post has been deleted" });
    }

    const savedPost = await postService.createQuote(
      content,
      quotedPost,
      req.user
    );

    return res.status(status.CREATED).json({ post: savedPost });
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await postService.getPostById(id);

    if (!post || post.isDeleted) {
      return res.status(status.NOT_FOUND).json({ message: "Post not found" });
    }

    const user = await userService.getUserById(post.user);

    if (!user) {
      return res.status(status.NOT_FOUND).json({ message: "User not found" });
    }

    if (req.user.role !== "ADMIN" && req.user.id !== user.id) {
      return res.status(status.FORBIDDEN).json({ message: "Forbidden" });
    }

    await postService.deletePost(post, user);

    return res.status(status.OK).json({ message: "Sucessfully deleted" });
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const updatePost = async (req, res) => {
  try {
    const { content } = req.body;
    const { id } = req.params;

    const post = await postService.getPostById(id);

    if (!post || post.isDeleted) {
      return res.status(status.NOT_FOUND).json({ message: "Post not found" });
    }

    if (!req.user._id.equals(new mongoose.Types.ObjectId(post.user))) {
      return res.status(status.FORBIDDEN).json({ message: "Forbidden" });
    }

    const updatedData = {
      content,
    };

    const updatedPost = await postService.updatePost(post, updatedData);

    return res.status(status.OK).json({
      message: "User updated successfully",
      post: updatedPost,
    });
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const getFeed = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;

    const posts = await postService.getFeed(req.user, page, pageSize);

    posts.forEach((post) => {
      if (post.quotedPost && post.quotedPost.isDeleted) {
        post.quotedPost.content = "[deleted]";
      } else if (
        post.quotedPost &&
        (req.user.blockedUsers.some((user) =>
          user._id.equals(new mongoose.Types.ObjectId(post.quotedPost.user.id))
        ) ||
          req.user.blockedBy.some((user) =>
            user._id.equals(
              new mongoose.Types.ObjectId(post.quotedPost.user.id)
            )
          ))
      ) {
        post.quotedPost.content = "[hidden]";
      }
    });

    return res.status(status.OK).json({ posts });
  } catch (err) {
    console.error(err.message);
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

module.exports = {
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
