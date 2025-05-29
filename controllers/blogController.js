import { Blog } from "../models/blogModel.js";

// Add Blog (with user reference)
export const addBlog = async (req, res) => {
  try {
    const { title, image } = req.body;

    const blog = await Blog.create({
      title,
      image,
      user: req.user._id, // Authenticated user
    });

    res.status(201).json({ message: "Blog created successfully", blog });
  } catch (error) {
    res.status(500).json({ message: "Failed to create blog", error });
  }
};

// Get All Blogs (with user info)
export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate("user", "name email");
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch blogs", error });
  }
};

// Remove Blog Image
export const removeImage = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    blog.image = "";
    await blog.save();

    res.json({ message: "Image removed successfully", blog });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove image", error });
  }
};

// Update Blog (title or image)
export const updateBlog = async (req, res) => {
  try {
    const { title, image } = req.body;

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Optional update
    if (title) blog.title = title;
    if (image) blog.image = image;

    await blog.save();

    res.json({ message: "Blog updated successfully", blog });
  } catch (error) {
    res.status(500).json({ message: "Failed to update blog", error });
  }
};
