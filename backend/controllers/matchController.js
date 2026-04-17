import User from "../models/User.js";
import Profile from "../models/Profile.js";
import Connection from "../models/Connection.js";

const calculateScore = (profileA, profileB) => {
  let score = 0;
  if (profileA.department === profileB.department) score += 30;

  const commonSkills = profileA.skills.filter(s => profileB.skills.includes(s));
  score += commonSkills.length * 10;

  const commonInterests = profileA.interests.filter(i => profileB.interests.includes(i));
  score += commonInterests.length * 5;

  return score;
};

export const getPotentialMatches = async (req, res) => {
  try {
    const { targetRole } = req.query; // targetRole = "mentor" or "mentee"
    
    const myProfile = await Profile.findOne({ user: req.user.id });
    if (!myProfile) return res.status(400).json({ message: "You need to create a profile first." });

    const potentialUsers = await User.find({ roles: targetRole, _id: { $ne: req.user.id } });
    if (!potentialUsers.length) return res.status(200).json([]);

    const userIds = potentialUsers.map(u => u._id);
    const theirProfiles = await Profile.find({ user: { $in: userIds } }).populate("user", "-password");

    const activeConnections = await Connection.find({
      $or: [
        { mentor: req.user.id },
        { mentee: req.user.id }
      ]
    });
    const connectedIds = activeConnections.map(c => 
      c.mentor.toString() === req.user.id ? c.mentee.toString() : c.mentor.toString()
    );

    const matchScores = theirProfiles
      .filter(p => p.user && !connectedIds.includes(p.user._id.toString()))
      .map(profile => {
        return {
          profile,
          score: calculateScore(myProfile, profile)
        };
      })
      .sort((a, b) => b.score - a.score);

    res.status(200).json(matchScores);
  } catch (err) {
    res.status(500).json({ message: "Error fetching matches" });
  }
};

export const requestConnection = async (req, res) => {
  try {
    const { targetUserId, targetRole } = req.body;
    
    const existing = await Connection.findOne({
      $or: [
        { mentor: req.user.id, mentee: targetUserId },
        { mentor: targetUserId, mentee: req.user.id }
      ]
    });

    if (existing) return res.status(400).json({ message: "Connection already exists or is pending." });

    let mentorId, menteeId;
    if (targetRole === "mentor") {
       mentorId = targetUserId;
       menteeId = req.user.id;
    } else {
       mentorId = req.user.id;
       menteeId = targetUserId;
    }

    const conn = await Connection.create({ mentor: mentorId, mentee: menteeId });
    res.status(201).json({ message: "Connection requested", conn });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyConnections = async (req, res) => {
   try {
     const connections = await Connection.find({
        $or: [{ mentor: req.user.id }, { mentee: req.user.id }]
     }).populate("mentor", "name email").populate("mentee", "name email");
     res.status(200).json(connections);
   } catch (error) {
     res.status(500).json({ message: "Server error" });
   }
};

export const updateConnectionStatus = async (req, res) => {
    try {
      const { connectionId, status } = req.body;
      const conn = await Connection.findById(connectionId);
      if(!conn) return res.status(404).json({ message: "Connection not found" });

      conn.status = status;
      await conn.save();

      res.status(200).json(conn);
    } catch (err) {
      res.status(500).json({ message: "Server error" })
    }
}
