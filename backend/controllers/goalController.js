import Goal from "../models/Goal.js";
import Profile from "../models/Profile.js";
import Connection from "../models/Connection.js";

export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id })
      .populate("assigner", "name")
      .sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: "Failed to get goals." });
  }
};

export const getAssignedGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ assigner: req.user.id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(goals);
  } catch(err) {
    res.status(500).json({ message: "Failed to fetch assigned goals." });
  }
};

export const createGoal = async (req, res) => {
  const { title, description, deadline, assignedUserId } = req.body;
  try {
    const targetUserId = assignedUserId || req.user.id;
    const isAssignedByOther = targetUserId !== req.user.id;

    if (isAssignedByOther) {
      // Validate they are actually connected
      const conn = await Connection.findOne({
        $or: [
          { mentor: req.user.id, mentee: targetUserId, status: "accepted" },
          { mentor: targetUserId, mentee: req.user.id, status: "accepted" }
        ]
      });
      if(!conn) return res.status(403).json({ message: "You are not connected to this user."});
    }

    const newGoal = await Goal.create({
      user: targetUserId,
      title,
      description,
      deadline,
      assigner: isAssignedByOther ? req.user.id : undefined,
    });

    res.status(201).json(newGoal);
  } catch (err) {
    res.status(400).json({ message: "Failed to create goal." });
  }
};

export const updateGoal = async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  try {
    const goal = await Goal.findOne({ _id: id, user: req.user.id });
    if (!goal) return res.status(404).json({ message: "Goal not found." });

    let pointsEarned = 0;
    let earnedBadges = [];

    // GAMIFICATION ENGINE
    if (completed && !goal.completed && !goal.pointsAwarded) {
       const now = new Date();
       if (!goal.deadline || new Date(goal.deadline) > now) {
          pointsEarned = 50; // On time
       } else {
          pointsEarned = 20; // Late penalty
       }

       const profile = await Profile.findOne({ user: req.user.id });
       if (profile) {
          profile.gamificationPoints += pointsEarned;
          
          if (profile.gamificationPoints >= 100 && !profile.badges.includes("Bronze Scholar")) {
             profile.badges.push("Bronze Scholar");
             earnedBadges.push("Bronze Scholar");
          }
          if (profile.gamificationPoints >= 500 && !profile.badges.includes("Silver Prodigy")) {
             profile.badges.push("Silver Prodigy");
             earnedBadges.push("Silver Prodigy");
          }
          if (profile.gamificationPoints >= 1000 && !profile.badges.includes("Gold Ascendant")) {
             profile.badges.push("Gold Ascendant");
             earnedBadges.push("Gold Ascendant");
          }

          await profile.save();
       }

       // Mentor reward points for successful assignments
       if (goal.assigner) {
          const mentorProfile = await Profile.findOne({ user: goal.assigner });
          if (mentorProfile) {
              mentorProfile.gamificationPoints += 30; // 30 points for guiding mentee
              await mentorProfile.save();
          }
       }
       req.body.pointsAwarded = true;
    }

    const updated = await Goal.findOneAndUpdate(
      { _id: id, user: req.user.id },
      req.body,
      { new: true }
    );

    res.json({ updated, pointsEarned, earnedBadges });
  } catch (err) {
    res.status(400).json({ message: "Failed to update goal." });
  }
};

export const deleteGoal = async (req, res) => {
  const { id } = req.params;
  try {
    await Goal.findOneAndDelete({ _id: id, user: req.user.id });
    res.json({ message: "Goal deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete goal." });
  }
};
