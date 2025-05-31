import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a blog title"],
    },
    image: {
      type: String, // Image URL ya file path
      default: "",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // User model ka reference
      required: true,
    },
  },
  { timestamps: true }
);

export const Blog = mongoose.model("Blog", blogSchema);
