import express from "express";
import { registerUser, loginUser } from "../controllers/userController.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes (any logged in user)

// Admin-only routes

export default router;
