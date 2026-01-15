import express from "express";
import { signup, login, logout } from "../controllers/auth.controller.js";
import { protect } from "../middleware/authMiddleware.js";
import { getClientDashboard, getDashboardStats } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.post("/register", signup);
router.post("/login", login);
router.post("/logout", logout); // ✅ REQUIRED
router.get("/dashboard-stats", protect, getDashboardStats);
router.get("/client-dashboard", protect,getClientDashboard);
export default router;
