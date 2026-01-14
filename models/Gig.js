import mongoose from "mongoose";

const gigSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 10
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 500
    },
    budget: {
      type: Number,
      default: 0
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    status: {
      type: String,
      enum: ["open", "assigned"],
      default: "open"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Gig", gigSchema);
