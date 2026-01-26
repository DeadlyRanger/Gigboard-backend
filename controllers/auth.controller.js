import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* ================= REGISTER ================= */
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      success: true,
      message: "Signup successful"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

 res.cookie("token", token, {
  httpOnly: true,
  secure: true,      
  sameSite: "none",  
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

    res.json({
      success: true,
      message: "Login successful",
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= LOGOUT ================= */
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false
  });

  res.json({
    success: true,
    message: "Logout successful"
  });
};

export const getClientDashboard = async (req, res) => {
  try {
    // req.user.id is available because of 'protect' middleware
    const userId = req.user.id; 

    // Fetch projects posted by this user (Assuming you have a Gig model)
    const projects = await Gig.find({ creator: userId });

    // Calculate basic stats
    const stats = {
      totalInvestment: projects.reduce((acc, curr) => acc + (curr.budget || 0), 0),
      activeProjects: projects.filter(p => p.status === 'open').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
    };

    res.json({ success: true, stats, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};