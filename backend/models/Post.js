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
      required: true,
    },
    parentTweet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
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
    quotedTweet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  },
  { timestamps: true }
);

module.exports = model("Post", postSchema);
