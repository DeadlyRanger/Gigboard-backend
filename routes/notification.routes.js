import express from "express";
import { 
  getMyNotifications, 
  markNotificationsAsRead 
} from "../controllers/notification.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// This allows the Navbar to fetch the list
router.get("/", protect, getMyNotifications);

// This allows the Navbar to clear the red badge when clicked
router.put("/mark-read", protect, markNotificationsAsRead);

export default router;