import express from "express";
import {
  createFooter,
  getFooter,
  updateFooter,
  deleteFooter,
  testFormData,
  getFooterTest,
  getAllFootersTest,
  debugFormData,
  uploadFooterImage,
  deleteFooterTest,
  updateFooterTest
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

// Test routes - no authentication required (with file upload support)
router.post("/test", upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'footerImage', maxCount: 1 }
]), testFormData);

// Ultra simple debug endpoint without any middleware
router.post("/debug", debugFormData);

// Dedicated file upload endpoint
router.post("/upload", upload.fields([
  { name: 'logo', maxCount: 1 }
]), uploadFooterImage);

// Test routes for footer management without authentication (for testing purposes)
router.get("/test/all", getAllFootersTest);
router.get("/test", getFooterTest);
router.delete("/test", deleteFooterTest);
router.put("/test", upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'footerImage', maxCount: 1 }
]), updateFooterTest);

export default router;
