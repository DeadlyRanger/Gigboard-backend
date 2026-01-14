import Bid from "../models/Bid.js";
import Gig from "../models/Gig.js";
import Notification from "../models/Notification.js";

/* ================= CREATE BID ================= */
export const createBid = async (req, res) => {
  try {
    const { gigId, message, amount } = req.body;
    const freelancerId = req.user.id;

    if (!gigId || !amount) {
      return res.status(400).json({
        message: "Gig ID and bid amount are required"
      });
    }

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    if (gig.ownerId.toString() === freelancerId) {
      return res.status(403).json({
        message: "You cannot bid on your own gig"
      });
    }

    if (gig.status !== "open") {
      return res.status(400).json({
        message: "Bidding is closed for this gig"
      });
    }

    const existingBid = await Bid.findOne({ gigId, freelancerId });
    if (existingBid) {
      return res.status(400).json({
        message: "You already placed a bid on this gig"
      });
    }

    const bid = await Bid.create({
      gigId,
      freelancerId,
      message,
      amount
    });

    // ✅ INTEGRATED: Notify the Gig Owner about the new bid
    await Notification.create({
      userId: gig.ownerId,
      message: `📩 New bid of $${amount} received on your gig: "${gig.title}"`,
      isRead: false
    });

    res.status(201).json({
      success: true,
      bid
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ================= GET BIDS FOR A GIG (OWNER ONLY) ================= */
export const getBidsForGig = async (req, res) => {
  try {
    const { gigId } = req.params;

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    if (gig.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const bids = await Bid.find({ gigId })
      .populate("freelancerId", "name email");

    res.json({
      success: true,
      bids
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= HIRE FREELANCER ================= */
export const hireFreelancer = async (req, res) => {
  try {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId);
    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    const gig = await Gig.findOneAndUpdate(
      {
        _id: bid.gigId,
        ownerId: req.user.id,
        status: "open"
      },
      {
        status: "assigned",
        assignedTo: bid.freelancerId
      },
      { new: true }
    );

    if (!gig) {
      return res.status(400).json({
        message: "Gig already assigned by someone else"
      });
    }

    await Bid.findByIdAndUpdate(bid._id, {
      status: "hired"
    });

    await Bid.updateMany(
      {
        gigId: bid.gigId,
        _id: { $ne: bid._id }
      },
      { status: "rejected" }
    );

    // ✅ Existing Notification: Notifies hired freelancer
    await Notification.create({
      userId: bid.freelancerId,
      message: `🎉 Congrats! You are hired for the gig "${gig.title}"`,
      isRead: false
    });

    res.json({
      success: true,
      message: "Freelancer hired successfully (atomic)"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/* ================= MY BIDS (FREELANCER DASHBOARD) ================= */
export const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({
      freelancerId: req.user.id
    }).populate("gigId", "title status");

    res.json({
      success: true,
      bids
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};