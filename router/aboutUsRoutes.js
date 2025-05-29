import express from "express";
import {
  addAboutUs,
  getAboutUs,
  updateAboutUs,
  removeAboutImage,
  deleteAboutUs,
} from "../controllers/aboutUsController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/about", isAuthenticated, addAboutUs);
router.get("/about", getAboutUs);
router.put("/about/:id", isAuthenticated, updateAboutUs);
router.put("/about/:id/remove-image", isAuthenticated, removeAboutImage);
router.delete("/about/:id", isAuthenticated, deleteAboutUs);

export default router;
