import express from "express";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";

import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner
} from "../controllers/bannerController.js";

const router = express.Router();

// GET all banners
router.get("/get", getBanners);

// POST create banner (with image)
router.post("/create", isAuthenticated, authorizeRoles("admin"), upload.single("image"), createBanner);

// PUT update banner (optional image update)
router.put("/update/:bannerId", isAuthenticated, authorizeRoles("admin"), upload.single("image"), updateBanner);

// DELETE banner
router.delete("/delete/:bannerId", isAuthenticated, authorizeRoles("admin"), deleteBanner);

export default router;
