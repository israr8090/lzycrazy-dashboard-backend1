import express from "express";

import { isAuthenticated } from "../middlewares/auth.js";
import {
  createteTimonials,
  DeleteTestimonials,
  getAllTestimonials,
  UpdateTimonials,
} from "../controllers/TestimonialController.js";

const router = express.Router();

router.post("/add-testimonial", isAuthenticated, createteTimonials);
router.put("/update-testimonial/:id", isAuthenticated, UpdateTimonials);
router.post("/get-testimonial", getAllTestimonials);
router.delete("/delete-testimonial/:id", isAuthenticated, DeleteTestimonials);

export default router;
