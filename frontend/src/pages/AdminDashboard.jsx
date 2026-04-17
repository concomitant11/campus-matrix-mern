import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
   const [stats, setStats] = useState({ users: 0, mentors: 0, mentees: 0, connections: 0 });
   const [loading, setLoading] = useState(true);

   useEffect(() => {
     // We will fetch real stats when the backend is ready. For now it's a structural mockup hooked into nothing or basic fetching.
     setLoading(false);
   }, []);

   return (
      <div className="p-6 max-w-6xl mx-auto">
         <h1 className="text-3xl font-bold mb-6 text-red-700">Admin Control Panel</h1>
         <p className="text-gray-500 mb-8">Supervise mentors, manage events, and monitor platform health.</p>

         <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 mb-8">
             <div className="bg-white p-6 shadow rounded-lg border-l-4 border-blue-500">
                <h3 className="text-gray-500 text-sm font-semibold">Total Users</h3>
                <p className="text-3xl font-bold mt-2 text-gray-800">124</p>
             </div>
             <div className="bg-white p-6 shadow rounded-lg border-l-4 border-green-500">
                <h3 className="text-gray-500 text-sm font-semibold">Active Mentors</h3>
                <p className="text-3xl font-bold mt-2 text-gray-800">45</p>
             </div>
             <div className="bg-white p-6 shadow rounded-lg border-l-4 border-purple-500">
                <h3 className="text-gray-500 text-sm font-semibold">Active Mentees</h3>
                <p className="text-3xl font-bold mt-2 text-gray-800">79</p>
             </div>
             <div className="bg-white p-6 shadow rounded-lg border-l-4 border-red-500">
                <h3 className="text-gray-500 text-sm font-semibold">Active Connections</h3>
                <p className="text-3xl font-bold mt-2 text-gray-800">32</p>
             </div>
         </div>
         
         <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Supervised Chat Logs</h2>
            <p className="text-gray-500 text-sm mb-4">You have clearance to monitor potentially flagged conversations.</p>
            <div className="border border-dashed border-gray-300 p-8 text-center text-gray-400 bg-gray-50 rounded">
               No flagged messages detected in the last 24 hours.
            </div>
         </div>
      </div>
   );
};

export default AdminDashboard;
