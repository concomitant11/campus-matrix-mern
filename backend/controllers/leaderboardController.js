import Profile from "../models/Profile.js";

export const getLeaderboard = async (req, res) => {
  try {
    const topProfiles = await Profile.find()
      .populate("user", "name email image roles")
      .sort({ totalDynamicScore: -1 })
      .limit(20);
    
    // Optional: could parse github/leetcode URLs from profile here if they were added.
    
    res.status(200).json(topProfiles);
  } catch(err) {
    res.status(500).json({ message: "Error fetching leaderboard." });
  }
};
