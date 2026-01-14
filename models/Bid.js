import mongoose from "mongoose";

const bidSchema = new mongoose.Schema(
  {
    gigId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gig",
      required: true
    },
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    message: {
      type: String,
      maxlength: 500
    },
    amount: {
      type: Number,
      required: true   // 🔥 bid value
    },
    status: {
      type: String,
      enum: ["pending", "hired", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Bid", bidSchema);
