const status = require("http-status");
const postService = require("../services/postService");
const userService = require("../services/userService");

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
      post.content = "Post content has been hidden";
    }

    // Check if the post has been deleted
    if (post.isDeleted) {
      //   return res.status(status.GONE).json({ message: "Post has been deleted" });
      post.content = "Post has been deleted";
    }

    // Check if the quotedPost is not deleted
    if (post.quotedPost && post.quotedPost.isDeleted) {
      post.quotedPost.content = "Post has been deleted";
    }

    // Check the parents of the post
    if (post.parents && post.parents.length > 0) {
      post.parents = post.parents.map((parent) => {
        // Check if the parent has been deleted
        if (parent.isDeleted) {
          parent.content = "Post has been deleted";
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
          parent.content = "Post content has been hidden";
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

    const post = await postService.getPostReplies(id, page, pageSize);

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
      return res
        .status(status.NOT_FOUND)
        .json({ message: "Parent post has been deleted" });
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

    if (!post) {
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

    if (!post) {
      return res.status(status.NOT_FOUND).json({ message: "Post not found" });
    }

    if (req.user.id !== post.user.id) {
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

module.exports = {
  getPostById,
  getPostReplies,
  createPost,
  createReply,
  createQuote,
  deletePost,
  updatePost,
};
