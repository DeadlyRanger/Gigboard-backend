import Gig from "../models/Gig.js";
import Bid from "../models/Bid.js";

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Stats as a Client (Owner)
    const activeGigsCount = await Gig.countDocuments({ ownerId: userId, status: "open" });
    const totalSpent = await Gig.aggregate([
      { $match: { ownerId: userId, status: "assigned" } },
      { $group: { _id: null, total: { $sum: "$budget" } } }
    ]);

    // Stats as a Freelancer
    const totalBidsCount = await Bid.countDocuments({ freelancerId: userId });
    const gigsWonCount = await Bid.countDocuments({ freelancerId: userId, status: "hired" });

    res.json({
      success: true,
      stats: {
        activeGigs: activeGigsCount,
        totalSpent: totalSpent[0]?.total || 0,
        proposalsSent: totalBidsCount,
        gigsWon: gigsWonCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add this to your backend dashboard controller
export const getClientDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get all gigs owned by this user
    const myGigs = await Gig.find({ ownerId: userId }).sort({ createdAt: -1 });

    // 2. Calculate Stats
    const totalProjects = myGigs.length;
    const activeProjects = myGigs.filter(g => g.status === "open").length;
    const completedProjects = myGigs.filter(g => g.status === "assigned").length;
    
    // Sum budget of all "assigned" (paid/hired) gigs
    const totalInvestment = myGigs
      .filter(g => g.status === "assigned")
      .reduce((acc, curr) => acc + curr.budget, 0);

    res.json({
      success: true,
      data: {
        projects: myGigs,
        stats: {
          totalProjects,
          activeProjects,
          completedProjects,
          totalInvestment
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};