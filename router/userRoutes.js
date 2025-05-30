import express from "express";
import {
  registerUser,
  loginUser,
  updateUser,
  updatePassword,
  forgotPassword,
  resetPassword
} from "../controllers/userController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes (require authentication)
router.put("/update", isAuthenticated, updateUser);
router.put("/password/update", isAuthenticated, updatePassword);

// Password reset routes
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);

export default router;
