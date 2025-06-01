import { Blog } from "../models/blogModel.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

// ✅ Add Blog
export const addBlog = async (req, res) => {
  try {
    console.log("File:", req.file);
    console.log("Body:", req.body);

    const { title } = req.body;
    let imageUrl = "";

    if (req.file) {
      // Upload to Cloudinary
      imageUrl = await uploadToCloudinary(req.file.path);
    }

    const blog = await Blog.create({
      title,
      image: imageUrl,
      user: req.user._id,
    });

    res.status(201).json({ message: "Blog created successfully", blog });
  } catch (error) {
    res.status(500).json({ message: "Failed to create blog", error: error.message });
  }
};

// ✅ Get All Blogs for a User
export const getBlogs = async (req, res) => {
  try {
    console.log("Authenticated user:", req.user);
    const userId = req.query.userId || req.user._id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const blogs = await Blog.find({ user: userId }).populate("user", "fullName email");
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch blogs", error: error.message });
  }
};

// ✅ Remove Image from Blog
export const removeImage = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to remove image" });
    }

    blog.image = "";
    await blog.save();

    res.json({ message: "Image removed successfully", blog });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove image", error: error.message });
  }
};

// ✅ Update Blog (title and/or image)
export const updateBlog = async (req, res) => {
  try {
    const { title } = req.body;
    let imageUrl = "";

    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.path);
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this blog" });
    }

    if (title) blog.title = title;
    if (imageUrl) blog.image = imageUrl;

    await blog.save();

    res.json({ message: "Blog updated successfully", blog });
  } catch (error) {
    res.status(500).json({ message: "Failed to update blog", error: error.message });
  }
};

// ✅ Delete Blog
export const deleteBlog = async (req, res) => {
  try {
    console.log("Delete Blog ID:", req.params.id);
    console.log("Authenticated User ID:", req.user._id);

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this blog" });
    }

    await blog.deleteOne();

    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Delete blog error:", error);
    res.status(500).json({ message: "Failed to delete blog", error: error.message });
  }
};
