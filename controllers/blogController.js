import { Blog } from "../models/blogModel.js";

// Add Blog (multer se image upload handle hota hai)
export const addBlog = async (req, res) => {
  try {
    console.log("File:", req.file);
    console.log("Body:", req.body);

    const { title } = req.body;
    let image = "";

    if (req.file) {
      image = req.file.path || req.file.filename;
    } else if (req.body.image) {
      image = req.body.image;
    }

    const blog = await Blog.create({
      title,
      image,
      user: req.user._id,  // logged in user ka id
    });

    res.status(201).json({ message: "Blog created successfully", blog });
  } catch (error) {
    res.status(500).json({ message: "Failed to create blog", error: error.message });
  }
};

// Get All Blogs of a User (auth middleware se req.user aayega)
export const getBlogs = async (req, res) => {
  try {
    console.log("Authenticated user:", req.user);

    const userId = req.query.userId || req.user._id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const blogs = await Blog.find({ user: userId }).populate("user", "name email");

    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch blogs", error: error.message });
  }
};

// Remove Blog Image
export const removeImage = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to remove image from this blog" });
    }

    blog.image = "";
    await blog.save();

    res.json({ message: "Image removed successfully", blog });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove image", error: error.message });
  }
};

// Update Blog (title or image update)
export const updateBlog = async (req, res) => {
  try {
    const { title } = req.body;
    let image = "";

    if (req.file) {
      image = req.file.path || req.file.filename;
    } else if (req.body.image) {
      image = req.body.image;
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this blog" });
    }

    if (title) blog.title = title;
    if (image) blog.image = image;

    await blog.save();

    res.json({ message: "Blog updated successfully", blog });
  } catch (error) {
    res.status(500).json({ message: "Failed to update blog", error: error.message });
  }
};

// Delete Blog
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

    // Fix here
    await blog.deleteOne();

    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Delete blog error:", error);
    res.status(500).json({ message: "Failed to delete blog", error: error.message });
  }
};
