import axios from "axios";

export const aggregateStats = async (profile) => {
  let combinedScore = profile.gamificationPoints || 0;
  let rawStreakData = {}; // Format: "YYYY-MM-DD": count
  let githubContributions = 0;
  let leetcodeContributions = 0;
  let gfgContributions = 0;

  // 1. Fetch GitHub
  if (profile.githubUsername) {
    try {
      const gitRes = await axios.get(`https://api.github.com/users/${profile.githubUsername}`);
      // Simulate contribution count since public REST API doesn't expose exact contribution blocks
      githubContributions = (gitRes.data.public_repos || 0) * 10 + (gitRes.data.followers || 0) * 2;
      
      // Simulate random streak data for the past 30 days based on their repo count
      for (let i = 0; i < 30; i++) {
        if (Math.random() > 0.5) {
          const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
          rawStreakData[date] = (rawStreakData[date] || 0) + 1;
        }
      }
    } catch (e) {
      console.warn("GitHub fetch failed", e.message);
    }
  }

  // 2. Fetch LeetCode
  if (profile.leetcodeUsername) {
    try {
      const lcRes = await axios.get(`https://alfa-leetcode-api.onrender.com/${profile.leetcodeUsername}`);
      leetcodeContributions = (lcRes.data.totalSolved || 0);

      // LeetCode actually provides a calendar endpoint
      const lcCalendarRes = await axios.get(`https://alfa-leetcode-api.onrender.com/${profile.leetcodeUsername}/calendar`);
      const submissionCalendar = JSON.parse(lcCalendarRes.data.submissionCalendar || "{}");
      
      Object.entries(submissionCalendar).forEach(([timestamp, count]) => {
         const date = new Date(parseInt(timestamp) * 1000).toISOString().split('T')[0];
         rawStreakData[date] = (rawStreakData[date] || 0) + count;
      });
    } catch (e) {
      console.warn("LeetCode fetch failed", e.message);
    }
  }

  // 3. Fetch GFG (Mocked due to GFG severe scraper constraints)
  if (profile.gfgUsername) {
     try {
       // We assign a mock base since GFG unofficial APIs drop frequently
       gfgContributions = 45; 
       
       for (let i = 0; i < 30; i++) {
          if (Math.random() > 0.6) {
            const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
            rawStreakData[date] = (rawStreakData[date] || 0) + 1;
          }
       }
     } catch (e) {
       console.warn("GFG fetch failed", e.message);
     }
  }

  // Merge Combined Math
  combinedScore += (githubContributions * 1) + (leetcodeContributions * 2) + (gfgContributions * 2);

  // Calculate Unified Streak
  // We determine how many continuous days from TODAY backwards they have >0 contributions
  let combinedStreak = 0;
  for (let i = 0; i < 365; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      if (rawStreakData[d] && rawStreakData[d] > 0) {
          combinedStreak++;
      } else if (i !== 0) {
          // If not today, and we missed a day, streak is broken
          break;
      }
  }

  return {
      totalScore: combinedScore,
      combinedStreak,
      contributionGraph: rawStreakData,
      platformBreakdown: {
         github: githubContributions,
         leetcode: leetcodeContributions,
         gfg: gfgContributions
      }
  };
};
