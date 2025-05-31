import express from "express";
import {
  getFooter,
  createFooter,
  updateFooter,
  deleteFooter,
  testFormData
} from "../controllers/footerController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";
import { upload } from "../middlewares/multerMiddleware.js";

const router = express.Router();

// Footer APIs
router.get("/", getFooter);

// Use multer to handle file uploads in these routes
router.post("/", isAuthenticated, authorizeRoles("admin"), upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'footerImage', maxCount: 1 }
]), createFooter);

router.put("/", isAuthenticated, authorizeRoles("admin"), upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'footerImage', maxCount: 1 }
]), updateFooter);

router.delete("/", isAuthenticated, authorizeRoles("admin"), deleteFooter);

// Test route - no authentication required
router.post("/test", testFormData);

export default router;
