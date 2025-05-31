import express from "express";
import {
  addAboutUs,
  getAboutUs,
  updateAboutUs,
  removeAboutImage,
  deleteAboutUs,
} from "../controllers/aboutUsController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

router.post("/about", isAuthenticated, authorizeRoles("admin"), addAboutUs);
router.get("/about", getAboutUs);
router.put("/about/:id", isAuthenticated, authorizeRoles("admin"), updateAboutUs);
router.put("/about/:id/remove-image", isAuthenticated, authorizeRoles("admin"), removeAboutImage);
router.delete("/about/:id", isAuthenticated, authorizeRoles("admin"), deleteAboutUs);

export default router;
