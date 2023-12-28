const { Schema, model, default: mongoose } = require("mongoose");

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    name: {
      type: String,
      max: 30,
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      max: 200,
      default: "",
    },
    website: {
      type: String,
      max: 100,
      default: "",
    },
    birthDate: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    blockedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // posts: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Post"
    //   }
    // ],
    // replies: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Post",
    //   },
    // ],
  },
  { timestamps: true }
);

// userSchema.pre("remove", async function (next) {
//   const user = this;

//   try {
//     await mongoose
//       .model("User")
//       .updateMany({ followers: user._id }, { $pull: { followers: user._id } });

//     await mongoose
//       .model("User")
//       .updateMany({ following: user._id }, { $pull: { following: user._id } });

//     await mongoose
//       .model("User")
//       .updateMany(
//         { blockedUsers: user._id },
//         { $pull: { blockedUsers: user._id } }
//       );

//     await mongoose
//       .model("User")
//       .updateMany({ blockedBy: user._id }, { $pull: { blockedBy: user._id } });

//     next();
//   } catch (err) {
//     console.error(err.message);
//     next(err);
//   }
// });

module.exports = model("User", userSchema);
