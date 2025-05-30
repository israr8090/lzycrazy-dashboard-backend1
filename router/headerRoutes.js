import { Router } from "express";
import upload from "../middlewares/multer.js";
import { createHeader } from "../controllers/headerController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = Router();

router.post("/create", isAuthenticated, upload.single("logo"), createHeader);

export default router;
