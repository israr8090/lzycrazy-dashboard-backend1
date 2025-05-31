import express from "express";
import {
  testCreateAppointment,
  testGetAllAppointments,
  testGetAppointmentById,
  testUpdateAppointment,
  testDeleteAppointment,
  testUpdateAppointmentStatus
} from "../controllers/appointmentController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Test routes (no authentication required) - for development/testing
router.post("/test/book", testCreateAppointment);
router.get("/test/all", testGetAllAppointments);
router.get("/test/:id", testGetAppointmentById);
router.put("/test/:id", testUpdateAppointment);
router.delete("/test/:id", testDeleteAppointment);
router.patch("/test/:id/status", testUpdateAppointmentStatus);

// Protected routes (require authentication)
// These can be implemented when you're ready to add authentication
/*
router.post("/book", isAuthenticated, createAppointment);
router.get("/all", isAuthenticated, getAllAppointments);
router.get("/:id", isAuthenticated, getAppointmentById);
router.put("/:id", isAuthenticated, updateAppointment);
router.delete("/:id", isAuthenticated, deleteAppointment);
router.patch("/:id/status", isAuthenticated, updateAppointmentStatus);
*/

export default router;
