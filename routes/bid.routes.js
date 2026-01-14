import express from "express";
import {
  createBid,
  getBidsForGig,
  hireFreelancer,
  getMyBids
} from "../controllers/bid.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Bid Routes
|--------------------------------------------------------------------------
| POST    /api/bids              -> place a bid
| GET     /api/bids/my-bids      -> logged-in user's bids
| GET     /api/bids/:gigId       -> get bids for a gig (owner only)
| PATCH   /api/bids/:bidId/hire  -> hire freelancer (owner only)
|--------------------------------------------------------------------------
*/

// Place a bid (freelancer)
router.post("/", protect, createBid);

// Get my bids (freelancer dashboard)
router.get("/my-bids", protect, getMyBids);

// Get bids for a specific gig (owner)
router.get("/:gigId", protect, getBidsForGig);

// Hire / assign freelancer
router.patch("/:bidId/hire", protect, hireFreelancer);

export default router;
