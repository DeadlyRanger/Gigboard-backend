import mongoose from "mongoose";     // ✅ FIX (THIS WAS MISSING)
import Gig from "../models/Gig.js";

/* ================= CREATE GIG ================= */
export const createGig = async (req, res) => {
  try {
    const { title, description, budget } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required"
      });
    }

    const gig = await Gig.create({
      title,
      description,
      budget,
      ownerId: req.user.id
    });

    res.status(201).json({
      success: true,
      gig
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ================= GET ALL GIGS + SEARCH ================= */
export const getAllGigs = async (req, res) => {
  try {
    const { search } = req.query;

    const query = {
      status: "open",
      ...(search && {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } }
        ]
      })
    };

    const gigs = await Gig.find(query)
      .populate("ownerId", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      gigs
    });
  } catch (error) {
    console.error("GET GIGS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch gigs"
    });
  }
};

/* ================= GET SINGLE GIG ================= */
export const getGigById = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId)
      .populate("ownerId", "name email");

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found"
      });
    }

    res.json({
      success: true,
      gig
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ================= GET MY GIGS (OWNER DASHBOARD) ================= */


export const getMyGigs = async (req, res) => {
  try {
    const gigs = await Gig.aggregate([
      {
        $match: {
          ownerId: new mongoose.Types.ObjectId(req.user.id)
        }
      },

      // 🔥 JOIN ASSIGNED USER
      {
        $lookup: {
          from: "users",
          localField: "assignedTo",
          foreignField: "_id",
          as: "assignedUser"
        }
      },

      {
        $unwind: {
          path: "$assignedUser",
          preserveNullAndEmptyArrays: true
        }
      },

      // 🔥 JOIN BIDS TO COUNT
      {
        $lookup: {
          from: "bids",
          localField: "_id",
          foreignField: "gigId",
          as: "proposals"
        }
      },

      {
        $addFields: {
          bidCount: { $size: "$proposals" },
          assignedTo: "$assignedUser" // 👈 overwrite assignedTo
        }
      },

      {
        $project: {
          proposals: 0,
          assignedUser: 0
        }
      },

      {
        $sort: { createdAt: -1 }
      }
    ]);

    res.json({
      success: true,
      gigs
    });
  } catch (error) {
    console.error("getMyGigs Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your gigs"
    });
  }
};

