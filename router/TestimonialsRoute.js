import express from "express";

import { authorizeRoles, isAuthenticated } from "../middlewares/auth.js";
import {
  createteTimonials,
  DeleteTestimonials,
  getAllTestimonials,
  UpdateTimonials,
} from "../controllers/TestimonialController.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.post(
  "/add-testimonial",
  isAuthenticated,
  upload.single("image"),
  authorizeRoles("admin"),
  createteTimonials
);
router.put(
  "/update-testimonial/:id",
  isAuthenticated,
  upload.single("image"),
  authorizeRoles("admin"),
  UpdateTimonials
);
router.get("/get-testimonial", isAuthenticated, getAllTestimonials);
router.delete(
  "/delete-testimonial/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  DeleteTestimonials
);

export default router;
