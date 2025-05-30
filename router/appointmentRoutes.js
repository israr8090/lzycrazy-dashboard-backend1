import express from "express";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";
import * as appointmentController from "../controllers/appointmentController.js";

const router = express.Router();

// Public route - anyone can book an appointment
router.post("/book", appointmentController.createAppointment);

// Admin only routes
router.get(
  "/",
  isAuthenticated,
  authorizeRoles("admin"),
  appointmentController.getAllAppointments
);
router.get(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  appointmentController.getAppointmentById
);
router.put(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  appointmentController.updateAppointment
);
router.patch(
  "/:id/status",
  isAuthenticated,
  authorizeRoles("admin"),
  appointmentController.updateAppointmentStatus
);
router.delete(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  appointmentController.deleteAppointment
);

export default router;
