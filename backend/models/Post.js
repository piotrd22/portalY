const { Schema, model, default: mongoose } = require("mongoose");

const postSchema = new Schema(
  {
    content: {
      type: String,
      max: 400,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    parents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    quotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    quotedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    isDeleted: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

module.exports = model("Post", postSchema);
