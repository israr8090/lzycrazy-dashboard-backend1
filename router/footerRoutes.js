import express from "express";
import {
  createFooter,
  getFooter,
  updateFooter,
  deleteFooter
} from "../controllers/footerController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import uploads from "../middlewares/multer.js";

const router = express.Router();

// Footer APIs
router.post("/get", getFooter); // Changed path to /get for retrieving footer data

// Use multer to handle file uploads in these routes
router.post("/create", isAuthenticated, uploads.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'footerImage', maxCount: 1 }
]), createFooter); // Changed path to /create for creating footer

router.put("/", isAuthenticated, uploads.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'footerImage', maxCount: 1 }
]), updateFooter);

router.delete("/", isAuthenticated, deleteFooter);

export default router;
