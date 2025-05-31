import express from "express";
import {
  addAboutUs,
  getAboutUs,
  updateAboutUs,
  removeAboutImage,
  deleteAboutUs,
} from "../controllers/aboutUsController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import uploads from "../middlewares/multer.js";


const router = express.Router();

router.post("/Addabout", isAuthenticated,uploads.single('image'), addAboutUs);
router.get("/getabout", getAboutUs);
router.put("/editabout/:id", isAuthenticated, uploads.single('image'), updateAboutUs);  // <-- multer added here
router.put("/imgabout/:id/remove-image", isAuthenticated, removeAboutImage);
router.delete("/delabout/:id", isAuthenticated, deleteAboutUs);

export default router;
