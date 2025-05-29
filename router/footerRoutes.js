import express from "express";
import {
  getFooter,
  createFooter,
  updateFooter,
  deleteFooter,
  testFormData
} from "../controllers/footerController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { upload } from "../middlewares/multerMiddleware.js";

const router = express.Router();

// Footer APIs
router.get("/", isAuthenticated, getFooter);

// Use multer to handle file uploads in these routes
router.post("/", isAuthenticated, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'footerImage', maxCount: 1 }
]), createFooter);

router.put("/", isAuthenticated, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'footerImage', maxCount: 1 }
]), updateFooter);

router.delete("/", isAuthenticated, deleteFooter);

// Test route - no authentication required
router.post("/test", testFormData);

export default router;
