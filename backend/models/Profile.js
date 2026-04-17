// backend/models/Profile.js
import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    department: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
    },
    skills: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    languages: {
      type: [String],
      default: [],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    linkedin: {
      type: String,
    },
    githubUsername: { type: String },
    leetcodeUsername: { type: String },
    gfgUsername: { type: String },
    gamificationPoints: {
      type: Number,
      default: 0,
    },
    totalDynamicScore: { type: Number, default: 0 },
    combinedStreak: { type: Number, default: 0 },
    contributionGraph: { type: Object, default: {} },
    badges: {
      type: [String],
      default: [],
    }
  },
  { timestamps: true }
);

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;
