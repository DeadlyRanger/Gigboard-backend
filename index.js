import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import dbConnect from "./config/db.js";

// routes
import authRoutes from "./routes/auth.routes.js";
import gigRoutes from "./routes/gig.routes.js";
import bidRoutes from "./routes/bid.routes.js";
import notificationRoutes from './routes/notification.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/* ================= MIDDLEWARE ================= */
app.use(express.json());
app.use(cookieParser());

// ✅ CORS CONFIG (VERY IMPORTANT)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", 
    credentials: true
  })
);

/* ================= HEALTH ================= */
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API working fine 🚀" });
});

app.use("/api/notifications", notificationRoutes);

/* ================= ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/bids", bidRoutes);
app.use('/api/healthyz',()=>{
   console.log(`backend working properly`)
})
/* ================= SERVER ================= */
app.listen(PORT, async () => {
  console.log(`✅ Server running on port ${PORT}`);
  await dbConnect();
});
