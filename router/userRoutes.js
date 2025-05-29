import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getMyProfile,
  getAllUsers,
  getAdminDashboard,
  getSuperAdminDashboard,
} from "../controllers/userController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
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

export default router;
