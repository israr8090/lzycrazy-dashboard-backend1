import express from "express";
import {
  createProduct,
  DeleteProducts,
  getAllProducts,
  UpdateProduct,
} from "../controllers/ProductController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.post(
  "/add-product",
  isAuthenticated,
  authorizeRoles("admin"),
  upload.single("image"),
  createProduct
);
router.put(
  "/update-product/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  upload.single("image"),
  UpdateProduct
);
router.get(
  "/get-product",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllProducts
);
router.delete(
  "/delete-product/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  DeleteProducts
);

export default router;
