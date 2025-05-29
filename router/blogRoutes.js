import express from "express";
import {
  addBlog,
  getBlogs,
  removeImage,
  updateBlog,
} from "../controllers/blogController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/blogs", isAuthenticated, addBlog);
router.get("/blogs", getBlogs);
router.put("/blogs/:id/remove-image", isAuthenticated, removeImage);
router.put("/blogs/:id", isAuthenticated, updateBlog);

export default router;
