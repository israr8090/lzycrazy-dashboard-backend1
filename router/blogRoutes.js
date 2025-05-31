import express from "express";
import {
  addBlog,
  getBlogs,
  removeImage,
  updateBlog,
} from "../controllers/blogController.js";
import { isAuthenticated , authorizeRoles} from "../middlewares/auth.js";

const router = express.Router();

router.post("/blogs", isAuthenticated, authorizeRoles("admin"), addBlog);
router.get("/blogs", getBlogs);
router.put("/blogs/:id/remove-image", isAuthenticated, authorizeRoles("admin"), removeImage);
router.put("/blogs/:id", isAuthenticated, authorizeRoles("admin"), updateBlog);

export default router;
