import mongoose, { Schema } from "mongoose";
import { IPost, IComment } from "../types";

const ReplySchema = new Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      ref: "User",
    },
    text: {
      type: String,
      required: [true, "Reply text is required"],
      trim: true,
      minlength: [1, "Reply must be at least 1 character long"],
      maxlength: [500, "Reply cannot exceed 500 characters"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const CommentSchema = new Schema<IComment>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      ref: "User",
    },
    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      minlength: [1, "Comment must be at least 1 character long"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    replies: {
      type: [ReplySchema],
      default: [],
    },
  },
  { _id: true }
);

const PostSchema = new Schema<IPost>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      ref: "User",
      index: true,
    },
    type: {
      type: String,
      required: [true, "Post type is required"],
      enum: {
        values: ["workout", "meal", "progress"],
        message: "{VALUE} is not a valid post type",
      },
    },
    content: {
      type: String,
      required: [true, "Post content is required"],
      trim: true,
      minlength: [1, "Post must be at least 1 character long"],
      maxlength: [1000, "Post cannot exceed 1000 characters"],
    },
    workoutId: {
      type: String,
      ref: "Workout",
    },
    mealId: {
      type: String,
      ref: "Meal",
    },
    progressId: {
      type: String,
      ref: "Progress",
    },

    likes: {
      type: [String],
      default: [],
      ref: "User",
    },
    comments: {
      type: [CommentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

PostSchema.index({ userId: 1, createdAt: -1 });
PostSchema.index({ type: 1 });
PostSchema.index({ createdAt: -1 });

const Post = mongoose.model<IPost>("Post", PostSchema);
export default Post;
