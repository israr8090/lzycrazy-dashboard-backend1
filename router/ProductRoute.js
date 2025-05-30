import express from "express";
import {
  createProduct,
  DeleteProducts,
  getAllProducts,
  UpdateProduct,
} from "../controllers/ProductController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import upload from "../middlewares/Multer.js";

const router = express.Router();

router.post(
  "/add-product",
  isAuthenticated,
  upload.single("image"),
  createProduct
);
router.put(
  "/update-product/:id",
  isAuthenticated,
  upload.single("image"),
  UpdateProduct
);
router.get("/get-product", isAuthenticated, getAllProducts);
router.delete("/delete-product/:id", isAuthenticated, DeleteProducts);

export default router;
