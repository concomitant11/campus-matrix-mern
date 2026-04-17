import React, { useEffect, useState } from "react";
import axios from "axios";

const Leaderboard = () => {
   const [leaders, setLeaders] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
     axios.get("/api/leaderboard", { withCredentials: true })
        .then(res => setLeaders(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
   }, []);

   return (
      <div className="p-6 max-w-4xl mx-auto">
         <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">Campus Leaderboard</h1>
         <p className="text-center text-gray-500 mb-8">Top students dominating the Gamification Points!</p>

         {loading ? (
             <div className="flex justify-center mt-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
             </div>
         ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-indigo-50 border-b">
                     <tr>
                        <th className="p-4 indent-4">Rank</th>
                        <th className="p-4">Student</th>
                        <th className="p-4">Badges</th>
                        <th className="p-4 text-right">Points</th>
                     </tr>
                  </thead>
                  <tbody>
                     {leaders.map((profile, index) => (
                        <tr key={profile._id} className="border-b hover:bg-gray-50 transition">
                           <td className="p-4 indent-4 font-bold text-gray-600">#{index + 1}</td>
                           <td className="p-4 flex items-center gap-3">
                              <img src={profile.user?.image || "/avatar.png"} alt="avatar" className="w-10 h-10 rounded-full border" />
                              <div>
                                 <p className="font-semibold text-gray-800">{profile.user?.name}</p>
                                 <p className="text-xs text-gray-400">{profile.department}</p>
                              </div>
                           </td>
                           <td className="p-4">
                              <div className="flex flex-wrap gap-1">
                                 {profile.badges?.map(b => (
                                    <span key={b} className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded font-medium border border-yellow-200">
                                       {b}
                                    </span>
                                 ))}
                                 {profile.badges?.length === 0 && <span className="text-gray-400 text-xs">-</span>}
                              </div>
                           </td>
                           <td className="p-4 text-right font-bold text-indigo-600 text-lg">
                              {profile.gamificationPoints}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>
   );
};

export default Leaderboard;
