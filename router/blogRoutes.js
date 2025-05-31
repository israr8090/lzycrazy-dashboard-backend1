import express from "express";
import {
  addBlog,
  getBlogs,
  removeImage,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";
import uploads from "../middlewares/multer.js";

const router = express.Router();

// Add new blog (POST)
router.post(
  "/Addblogs",
  isAuthenticated,
  authorizeRoles("admin"),
  uploads.single("image"),
  addBlog
);

// Get blogs (GET)
router.get("/blogs", isAuthenticated, getBlogs);

// Remove blog image (PUT)
router.put(
  "/imgblogs/:id/remove-image",
  isAuthenticated,
  authorizeRoles("admin"),
  removeImage
);

// Update blog (PUT)
router.put(
  "/editblogs/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  uploads.single("image"),
  updateBlog
);

// Delete blog (DELETE)
router.delete(
  "/delblogs/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  deleteBlog
);

export default router;
