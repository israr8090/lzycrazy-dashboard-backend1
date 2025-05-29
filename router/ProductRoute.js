import express from "express";
import { createProduct } from "../controllers/ProductController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import upload from "../middlewares/Multer.js";

const router = express.Router();

router.post(
  "/add-product",
  isAuthenticated,
  upload.single("image"),
  createProduct
);

export default router;
