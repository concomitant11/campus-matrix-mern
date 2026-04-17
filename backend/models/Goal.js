// backend/models/Goal.js
import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    completed: {
      type: Boolean,
      default: false,
    },
    deadline: {
      type: Date,
    },
    assigner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    pointsAwarded: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

const Goal = mongoose.model("Goal", goalSchema);
export default Goal;
