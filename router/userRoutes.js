import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getMyProfile,
  getAdminDashboard,
  getSuperAdminDashboard,
  getAllUsers,
  updateUser,
  updatePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// Public routes
// authorizeRoles("superAdmin")
router.post("/register",isAuthenticated, authorizeRoles("superAdmin"), upload.single('image'), registerUser);
router.post("/login", loginUser);

router.get("/logout", logoutUser);

// Protected routes (any logged in user)
router.get("/me", isAuthenticated, getMyProfile);

// Admin-only routes
router.get(
  "/admin/dashboard",
  isAuthenticated,
  authorizeRoles("admin"),
  getAdminDashboard
);
router.get(
  "/admin/users",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllUsers
);

// SuperAdmin-only routes
router.get(
  "/superadmin/dashboard",
  isAuthenticated,
  authorizeRoles("superAdmin"),
  getSuperAdminDashboard
);
router.get(
  "/superadmin/users",
  isAuthenticated,
  authorizeRoles("superAdmin"),
  getAllUsers
);

// Protected routes (require authentication)
router.put("/update", isAuthenticated, updateUser);
router.put("/password/update", isAuthenticated, updatePassword);

// Password reset routes
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);

export default router;
