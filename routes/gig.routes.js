import express from "express";
import {
  createGig,
  getAllGigs,
  getGigById,
  getMyGigs // Ensure this is imported
} from "../controllers/gigs.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my-gigs", protect, getMyGigs); // MUST be above :gigId
router.get("/", getAllGigs);
router.post("/", protect, createGig);
router.get("/:gigId", getGigById);

export default router;