import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import uploads from "../middlewares/multer.js";
import {
  createSpecialOffer,
  getAllSpecialOffers,
  getSpecialOfferById,
  updateSpecialOffer,
  deleteSpecialOffer,
  createSpecialOfferTest,
  uploadSpecialOfferImage,
} from "../controllers/specialOfferController.js";

const router = express.Router();

// Using shared multer middleware

// Production routes (with authentication)
router.post(
  "/specialOffer",
  isAuthenticated,
  uploads.single("image"),
  createSpecialOffer
);
router.post("/get-specialOffer", getAllSpecialOffers);
router.post("/specialOffer/:id", getSpecialOfferById);
router.put(
  "/specialOffer/:id",
  isAuthenticated,
  uploads.single("image"),
  updateSpecialOffer
);
router.delete("/specialOffer/:id", isAuthenticated, deleteSpecialOffer);

// Test routes (without authentication)
router.post(
  "/specialOffer/test",
  uploads.single("image"),
  createSpecialOfferTest
);
router.post(
  "/specialOffer/upload",
  uploads.single("image"),
  uploadSpecialOfferImage
);

export default router;
