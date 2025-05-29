import { Router } from "express";
import upload from "../middlewares/multer.js";
import {createHeader} from "../controllers/headerController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = Router();

const demoMiddleware = (req, res, next) => {
  console.log("Demo middleware called");
  console.log(req.body);
  console.log(req.file);
  next();
}

router.post(
  "/create", isAuthenticated,demoMiddleware,
  upload.single("logo"),
  createHeader
);

export default router;